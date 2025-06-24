import { z } from "zod";
import { createTRPCRouter, shopProcedure, staffProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import { ROLES, hasRolePermission, getNormalizedRole, type Role } from "~/lib/roles";

export const teamRouter = createTRPCRouter({
  // Get all team members
  getMembers: shopProcedure
    .input(z.object({
      search: z.string().optional(),
      role: z.enum([ROLES.ADMIN, ROLES.MEMBER]).optional(),
      limit: z.number().int().min(1).max(100).default(50),
      offset: z.number().int().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      // Get users from our database
      const where: Prisma.UserWhereInput = {
        shopId: ctx.shop.id,
        ...(input.search && {
          OR: [
            { name: { contains: input.search, mode: "insensitive" as Prisma.QueryMode } },
            { email: { contains: input.search, mode: "insensitive" as Prisma.QueryMode } },
          ],
        }),
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
          },
        }),
        ctx.db.user.count({ where }),
      ]);

      // Map users to team members with roles from Clerk
      const members = users.map(user => ({
        id: user.clerkId,
        name: user.name,
        email: user.email,
        role: getNormalizedRole(ctx.auth.orgRole),
        databaseId: user.id,
        joinedAt: new Date(), // You'd want to store this in your database
      }));

      return {
        members,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  // Get current user's role and permissions
  getCurrentUserRole: shopProcedure.query(async ({ ctx }) => {
    const role = getNormalizedRole(ctx.auth.orgRole);
    
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

  // Invite new member (Admin only)
  inviteMember: shopProcedure
    .input(z.object({
      email: z.string().email(),
      role: z.enum([ROLES.MEMBER]), // Only allow inviting as member, admin can be promoted later
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

      // Check if user already exists
      const existingUser = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with this email already exists",
        });
      }

      // Create user record in our database
      const user = await ctx.db.user.create({
        data: {
          email: input.email,
          name: input.name,
          clerkId: "", // Will be set when they accept invitation
          shopId: ctx.shop.id,
        },
      });

      // In a real implementation, you'd send an invitation via Clerk here
      // For now, we'll just return the created user
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: input.role,
        status: "pending",
        message: "User created. Invitation functionality requires Clerk integration.",
      };
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

      // In a real implementation, you'd update the role in Clerk here
      // For now, we'll just return success
      return { 
        success: true,
        message: "Role update functionality requires Clerk integration.",
      };
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
        message: "Member removed from shop. Clerk integration required for full removal.",
      };
    }),

  // Get pending invitations (placeholder)
  getPendingInvitations: shopProcedure.query(async ({ ctx }) => {
    const userRole = getNormalizedRole(ctx.auth.orgRole);

    // Check if user has permission
    if (!hasRolePermission(userRole, ROLES.ADMIN)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Admin privileges required to view invitations",
      });
    }

    // Return empty array for now - would be populated with Clerk invitations
    return [];
  }),
}); 