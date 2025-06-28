import { z } from "zod";
import { createTRPCRouter, shopProcedure, staffProcedure, shopProcedureDb, teamProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import { ROLES, hasRolePermission, getNormalizedRole, type Role } from "~/lib/roles";
import { clerkClient } from "@clerk/nextjs/server";

export const teamRouter = createTRPCRouter({
  // Get all team members
  getMembers: teamProcedure
    .input(z.object({
      search: z.string().optional(),
      role: z.enum([ROLES.ADMIN, ROLES.MEMBER]).optional(),
      limit: z.number().int().min(1).max(100).default(50),
      offset: z.number().int().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      // Check if user has admin permissions
      let userRole: Role;
      
      if (ctx.auth.hasClerkOrgContext && ctx.auth.orgRole) {
        // Use Clerk role if available
        userRole = getNormalizedRole(ctx.auth.orgRole);
      } else {
        // Fallback: check database role
        const currentUser = await ctx.db.user.findUnique({
          where: { clerkId: ctx.auth.userId },
          select: { role: true },
        });
        userRole = currentUser?.role ? getNormalizedRole(currentUser.role) : ROLES.MEMBER;
      }

      if (!hasRolePermission(userRole, ROLES.ADMIN)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin privileges required to view team members",
        });
      }

      // Get users from our database
      const where: Prisma.UserWhereInput = {
        shopId: ctx.shop.id,
        ...(input.search && {
          OR: [
            { name: { contains: input.search, mode: "insensitive" as Prisma.QueryMode } },
            { email: { contains: input.search, mode: "insensitive" as Prisma.QueryMode } },
          ],
        }),
        ...(input.role && { role: input.role }),
      };

      const [users, total] = await Promise.all([
        ctx.db.user.findMany({
          where,
          orderBy: { name: "asc" },
          take: input.limit,
          skip: input.offset,
          select: {
            id: true,
            clerkId: true,
            name: true,
            email: true,
            shopId: true,
            role: true, // Include role from database
          },
        }),
        ctx.db.user.count({ where }),
      ]);

      // Map users to team members with roles from database (primary) and Clerk (fallback)
      const members = users.map(user => {
        // Use database role as primary source of truth
        let role: Role = ROLES.MEMBER; // Default fallback
        
        if (user.role) {
          // Use database role if available
          role = getNormalizedRole(user.role);
        } else if (ctx.auth.hasClerkOrgContext) {
          // Fallback to Clerk role if no database role
          try {
            // This would require additional Clerk API call, but for now we'll use the current user's context
            // In a production environment, you might want to cache Clerk roles or fetch them in batch
            role = getNormalizedRole(ctx.auth.orgRole);
          } catch (error) {
            console.warn(`Failed to get Clerk role for user ${user.email}:`, error);
            role = ROLES.MEMBER;
          }
        }
        
        // Enhanced logging for debugging
        console.log(`Role mapping for ${user.email} (clerkId: ${user.clerkId}):`, {
          databaseRole: user.role,
          normalizedRole: role,
          hasDatabaseRole: !!user.role,
          isCurrentUser: user.clerkId === ctx.auth.userId,
          userEmail: user.email,
          userClerkId: user.clerkId
        });
        
        return {
          id: user.clerkId,
          name: user.name,
          email: user.email,
          role,
          databaseId: user.id,
          joinedAt: new Date(), // Use current date as fallback
          membershipId: null, // We're not using Clerk membership ID anymore
          // Add avatar and user info from Clerk if available (would need additional API call)
          avatarUrl: null,
          firstName: null,
          lastName: null,
          isCurrentUser: user.clerkId === ctx.auth.userId,
        };
      });

      return {
        members,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  // Get current user's role and permissions
  getCurrentUserRole: teamProcedure.query(async ({ ctx }) => {
    let role: Role;
    
    if (ctx.auth.hasClerkOrgContext && ctx.auth.orgRole) {
      // Use Clerk role if available
      role = getNormalizedRole(ctx.auth.orgRole);
    } else {
      // Fallback: check database role
      const currentUser = await ctx.db.user.findUnique({
        where: { clerkId: ctx.auth.userId },
        select: { role: true },
      });
      role = currentUser?.role ? getNormalizedRole(currentUser.role) : ROLES.MEMBER;
    }
    
    return {
      role,
      permissions: {
        canInviteMembers: hasRolePermission(role, ROLES.ADMIN),
        canManageRoles: hasRolePermission(role, ROLES.ADMIN),
        canRemoveMembers: hasRolePermission(role, ROLES.ADMIN),
        canViewAnalytics: true, // All members can view analytics
        canManageInventory: true, // All members can manage inventory
        canProcessTransactions: true, // All members can process transactions
        canManageCustomers: true, // All members can manage customers
        canViewReports: true, // All members can view reports
      },
    };
  }),

  // Invite new member (Admin only) - Uses Clerk's invitation system
  inviteMember: shopProcedure
    .input(z.object({
      email: z.string().email(),
      role: z.enum([ROLES.MEMBER, ROLES.ADMIN]), // Allow both roles
      name: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userRole = getNormalizedRole(ctx.auth.orgRole);

      // Check if user has permission to invite
      if (!hasRolePermission(userRole, ROLES.ADMIN)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin privileges required to invite members",
        });
      }

      // Check if user already exists in our database
      const existingUser = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser && existingUser.shopId === ctx.shop.id) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User is already a member of this shop",
        });
      }

      try {
        // Create invitation using Clerk's organization invitation system
        const invitation = await clerkClient.organizations.createOrganizationInvitation({
          organizationId: ctx.shop.id,
          emailAddress: input.email,
          role: input.role,
          redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'http://localhost:3000'}/auth/sign-up?invitation=${ctx.shop.id}`,
        });

        // Create or update user record in our database with invitation status
        const user = await ctx.db.user.upsert({
          where: { email: input.email },
          update: {
            shopId: ctx.shop.id,
            name: input.name || undefined,
          },
          create: {
            email: input.email,
            name: input.name,
            clerkId: "", // Will be set when they accept invitation
            shopId: ctx.shop.id,
          },
        });

        console.log(`Invitation created for ${input.email} to join ${ctx.shop.name}`);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: input.role,
          status: "invited",
          invitationId: invitation.id,
          message: "Invitation sent successfully",
        };
      } catch (error) {
        console.error("Error creating invitation:", error);
        
        // Handle specific Clerk errors
        if (error instanceof Error) {
          if (error.message.includes("already invited")) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "User has already been invited to this organization",
            });
          }
          if (error.message.includes("already a member")) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "User is already a member of this organization",
            });
          }
        }
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send invitation. Please try again.",
        });
      }
    }),

  // Update member role (Admin only)
  updateMemberRole: shopProcedure
    .input(z.object({
      userId: z.string(),
      role: z.enum([ROLES.ADMIN, ROLES.MEMBER]),
    }))
    .mutation(async ({ ctx, input }) => {
      const userRole = getNormalizedRole(ctx.auth.orgRole);

      // Check if user is admin
      if (!hasRolePermission(userRole, ROLES.ADMIN)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin privileges required to update roles",
        });
      }

      // Prevent admin from removing their own admin role
      if (input.userId === ctx.auth.userId && input.role !== ROLES.ADMIN) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot remove your own admin role",
        });
      }

      try {
        // Update role in Clerk
        await clerkClient.organizations.updateOrganizationMembership({
          organizationId: ctx.shop.id,
          userId: input.userId,
          role: input.role,
        });

        return { 
          success: true,
          message: "Role updated successfully",
        };
      } catch (error) {
        console.error("Error updating role:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update role. Please try again.",
        });
      }
    }),

  // Remove member (Admin only)
  removeMember: shopProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userRole = getNormalizedRole(ctx.auth.orgRole);

      // Check if user is admin
      if (!hasRolePermission(userRole, ROLES.ADMIN)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin privileges required to remove members",
        });
      }

      // Prevent admin from removing themselves
      if (input.userId === ctx.auth.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot remove yourself from the team",
        });
      }

      try {
        // Remove from Clerk organization
        await clerkClient.organizations.removeOrganizationMember({
          organizationId: ctx.shop.id,
          userId: input.userId,
        });

        // Remove user from shop in our database
        await ctx.db.user.updateMany({
          where: { 
            clerkId: input.userId,
            shopId: ctx.shop.id,
          },
          data: { shopId: null },
        });

        return { 
          success: true,
          message: "Member removed successfully",
        };
      } catch (error) {
        console.error("Error removing member:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove member. Please try again.",
        });
      }
    }),

  // Get pending invitations
  getPendingInvitations: shopProcedure.query(async ({ ctx }) => {
    const userRole = getNormalizedRole(ctx.auth.orgRole);

    // Check if user has permission
    if (!hasRolePermission(userRole, ROLES.ADMIN)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Admin privileges required to view invitations",
      });
    }

    try {
      // Get pending invitations from Clerk
      const invitations = await clerkClient.organizations.getOrganizationInvitationList({
        organizationId: ctx.shop.id,
        status: "pending",
      });

      return invitations.map(invitation => ({
        id: invitation.id,
        email: invitation.emailAddress,
        role: getNormalizedRole(invitation.role),
        status: invitation.status,
        createdAt: invitation.createdAt,
        expiresAt: invitation.expiresAt,
      }));
    } catch (error) {
      console.error("Error fetching invitations:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch invitations",
      });
    }
  }),

  // Cancel invitation
  cancelInvitation: shopProcedure
    .input(z.object({
      invitationId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userRole = getNormalizedRole(ctx.auth.orgRole);

      // Check if user has permission
      if (!hasRolePermission(userRole, ROLES.ADMIN)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin privileges required to cancel invitations",
        });
      }

      try {
        // Revoke invitation in Clerk
        await clerkClient.organizations.revokeOrganizationInvitation({
          organizationId: ctx.shop.id,
          invitationId: input.invitationId,
        });

        return {
          success: true,
          message: "Invitation cancelled successfully",
        };
      } catch (error) {
        console.error("Error cancelling invitation:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to cancel invitation",
        });
      }
    }),

  // Resend invitation
  resendInvitation: shopProcedure
    .input(z.object({
      invitationId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userRole = getNormalizedRole(ctx.auth.orgRole);

      // Check if user has permission
      if (!hasRolePermission(userRole, ROLES.ADMIN)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin privileges required to resend invitations",
        });
      }

      try {
        // Resend invitation in Clerk
        await clerkClient.organizations.revokeOrganizationInvitation({
          organizationId: ctx.shop.id,
          invitationId: input.invitationId,
        });

        // Create new invitation
        const invitation = await clerkClient.organizations.createOrganizationInvitation({
          organizationId: ctx.shop.id,
          emailAddress: "", // Will be filled by Clerk
          role: "member", // Default role
          redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'http://localhost:3000'}/auth/sign-up?invitation=${ctx.shop.id}`,
        });

        return {
          success: true,
          message: "Invitation resent successfully",
          newInvitationId: invitation.id,
        };
      } catch (error) {
        console.error("Error resending invitation:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to resend invitation",
        });
      }
    }),
}); 