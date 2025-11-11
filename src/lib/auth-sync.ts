import { db } from "~/server/db";
import { clerkClient } from "@clerk/nextjs/server";
import { ROLES, getNormalizedRole, type Role } from "~/lib/roles";
import type { PrismaClient } from "@prisma/client";

// Types for auth sync operations
export interface SyncUserData {
  clerkId: string;
  email: string;
  name?: string;
  shopId?: string;
  role?: string;
}

export interface SyncShopData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type?: "local" | "online" | "both";
}

export interface SyncMembershipData {
  userId: string;
  shopId: string;
  role: string;
  email: string;
  name?: string;
}

export interface SyncResult {
  success: boolean;
  message: string;
  data?: {
    userId?: string;
    shopId?: string;
    role?: string;
    wasCreated?: boolean;
    wasUpdated?: boolean;
  };
  error?: string;
}

export interface ConsistencyCheckResult {
  isConsistent: boolean;
  issues: string[];
  fixes: string[];
}

/**
 * Auth Sync Service
 * Handles all Clerk-to-database synchronization logic
 */
export class AuthSyncService {
  /**
   * Sync a single user with their Clerk data
   */
  static async syncUser(userId: string): Promise<SyncResult> {
    try {
      // Get user from Clerk
      const clerkUser = await clerkClient.users.getUser(userId);
      if (!clerkUser) {
        return {
          success: false,
          message: "User not found in Clerk",
          error: "CLERK_USER_NOT_FOUND"
        };
      }

      // Get user's organization memberships
      const orgMemberships = (clerkUser as any)?.organizationMemberships ?? [];
      
      if (orgMemberships.length === 0) {
        return {
          success: false,
          message: "User has no organization memberships",
          error: "NO_ORGANIZATION_MEMBERSHIPS"
        };
      }

      // Get or create user in database
      let user = await db.user.findUnique({
        where: { clerkId: userId },
        include: { shop: true }
      });

      if (!user) {
        // Create user if they don't exist
        user = await db.user.create({
          data: {
            clerkId: userId,
            email: clerkUser.emailAddresses[0]?.emailAddress || "",
            name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || null,
          },
          include: { shop: true }
        });
      }

      // Process first organization membership
      const membership = orgMemberships[0];
      const orgId = membership.organization?.id;
      const orgName = membership.organization?.name;
      const orgRole = membership.role;

      if (!orgId) {
        return {
          success: false,
          message: "Organization ID is missing",
          error: "MISSING_ORG_ID"
        };
      }

      // Get or create shop
      let shop = await db.shop.findUnique({
        where: { id: orgId },
        include: { settings: true }
      });

      if (!shop) {
        shop = await db.shop.create({
          data: {
            id: orgId,
            name: orgName || `Shop ${orgId.substring(0, 8)}...`,
            slug: orgName?.toLowerCase().replace(/\s+/g, '-') || `shop-${orgId.substring(0, 8)}`,
            description: `Shop for ${orgName || orgId}`,
            type: 'both',
          },
          include: { settings: true }
        });
      }

      // Update user to link to shop
      const updatedUser = await db.user.update({
        where: { id: user.id },
        data: {
          shopId: shop.id,
          role: orgRole ?? undefined,
        },
        include: { shop: true }
      });

      return {
        success: true,
        message: "User successfully synced with shop",
        data: {
          userId: updatedUser.id.toString(),
          shopId: shop.id,
          role: updatedUser.role ?? undefined,
          wasCreated: !user.shopId,
          wasUpdated: !!user.shopId && user.shopId !== shop.id
        }
      };

    } catch (error) {
      console.error('Auth sync error:', error);
      return {
        success: false,
        message: "Failed to sync user",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  /**
   * Sync all users in an organization
   */
  static async syncOrganization(orgId: string): Promise<SyncResult[]> {
    try {
      // Get organization members from Clerk
      const clerk = await clerkClient();
      const members = await clerk.organizations.getOrganizationMembershipList({
        organizationId: orgId
      });

      const results: SyncResult[] = [];

      for (const member of members) {
        const result = await this.syncUser(member.publicUserData?.userId || "");
        results.push(result);
      }

      return results;

    } catch (error) {
      console.error('Organization sync error:', error);
      return [{
        success: false,
        message: "Failed to sync organization",
        error: error instanceof Error ? error.message : "Unknown error"
      }];
    }
  }

  /**
   * Check consistency between Clerk and database
   */
  static async checkConsistency(): Promise<ConsistencyCheckResult> {
    const issues: string[] = [];
    const fixes: string[] = [];

    try {
      // Get all users from database
      const dbUsers = await db.user.findMany({
        include: { shop: true }
      });

      // Check each user's consistency
      for (const dbUser of dbUsers) {
        try {
          const clerk = await clerkClient();
          const clerkUser = await clerk.users.getUser(dbUser.clerkId);
          const orgMemberships = (clerkUser as any)?.organizationMemberships ?? [];

          // Check if user has shopId but no Clerk org membership
          if (dbUser.shopId && orgMemberships.length === 0) {
            issues.push(`User ${dbUser.email} has shopId but no Clerk org membership`);
            fixes.push(`Remove shopId from user ${dbUser.email}`);
          }

          // Check if user has Clerk org membership but no shopId
          if (!dbUser.shopId && orgMemberships.length > 0) {
            issues.push(`User ${dbUser.email} has Clerk org membership but no shopId`);
            fixes.push(`Sync user ${dbUser.email} with Clerk data`);
          }

          // Check role consistency
          if (orgMemberships.length > 0) {
            const clerkRole = orgMemberships[0].role;
            if (dbUser.role !== clerkRole) {
              issues.push(`User ${dbUser.email} has role mismatch: DB=${dbUser.role}, Clerk=${clerkRole}`);
              fixes.push(`Update role for user ${dbUser.email} to match Clerk`);
            }
          }

        } catch (error) {
          issues.push(`Could not verify user ${dbUser.email}: ${error}`);
        }
      }

      return {
        isConsistent: issues.length === 0,
        issues,
        fixes
      };

    } catch (error) {
      console.error('Consistency check error:', error);
      return {
        isConsistent: false,
        issues: [`Failed to check consistency: ${error}`],
        fixes: []
      };
    }
  }

  /**
   * Fix user-shop linking issues
   */
  static async fixUserShopLinking(userId: string): Promise<SyncResult> {
    try {
      // Get user from database
      const user = await db.user.findUnique({
        where: { clerkId: userId },
        include: { shop: true }
      });

      if (!user) {
        return {
          success: false,
          message: "User not found in database",
          error: "USER_NOT_FOUND"
        };
      }

      // If user already has shopId, return success
      if (user.shopId) {
        return {
          success: true,
          message: "User already linked to shop",
          data: {
            userId: user.id.toString(),
            shopId: user.shopId,
            role: user.role
          }
        };
      }

      // Try to sync user with Clerk data
      return await this.syncUser(userId);

    } catch (error) {
      console.error('Fix user-shop linking error:', error);
      return {
        success: false,
        message: "Failed to fix user-shop linking",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
}

// Export singleton instance
export const authSync = new AuthSyncService(); 