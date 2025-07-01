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
  data?: any;
  errors?: string[];
}

/**
 * Comprehensive auth synchronization utility
 * Handles all Clerk-to-database sync scenarios with proper error handling
 */
export class AuthSync {
  private db: PrismaClient;

  constructor() {
    this.db = db;
  }

  /**
   * Sync a single user to database
   */
  async syncUser(userData: SyncUserData): Promise<SyncResult> {
    try {
      console.log(`🔄 Syncing user: ${userData.email} (${userData.clerkId})`);

      const existingUser = await this.db.user.findUnique({
        where: { clerkId: userData.clerkId },
      });

      if (existingUser) {
        // Update existing user
        const updatedUser = await this.db.user.update({
          where: { clerkId: userData.clerkId },
          data: {
            email: userData.email,
            name: userData.name || existingUser.name,
            shopId: userData.shopId || existingUser.shopId,
            role: userData.role ? getNormalizedRole(userData.role) : existingUser.role,
          },
        });

        console.log(`✅ Updated user: ${updatedUser.email}`);
        return {
          success: true,
          message: "User updated successfully",
          data: updatedUser,
        };
      } else {
        // Create new user
        const newUser = await this.db.user.create({
          data: {
            clerkId: userData.clerkId,
            email: userData.email,
            name: userData.name,
            shopId: userData.shopId,
            role: userData.role ? getNormalizedRole(userData.role) : ROLES.MEMBER,
          },
        });

        console.log(`✅ Created user: ${newUser.email}`);
        return {
          success: true,
          message: "User created successfully",
          data: newUser,
        };
      }
    } catch (error) {
      console.error(`❌ Error syncing user ${userData.email}:`, error);
      return {
        success: false,
        message: "Failed to sync user",
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };
    }
  }

  /**
   * Sync a shop/organization to database
   */
  async syncShop(shopData: SyncShopData): Promise<SyncResult> {
    try {
      console.log(`🔄 Syncing shop: ${shopData.name} (${shopData.id})`);

      const existingShop = await this.db.shop.findUnique({
        where: { id: shopData.id },
        include: { settings: true },
      });

      if (existingShop) {
        // Update existing shop
        const updatedShop = await this.db.shop.update({
          where: { id: shopData.id },
          data: {
            name: shopData.name,
            slug: shopData.slug,
            description: shopData.description || existingShop.description,
            type: shopData.type || existingShop.type,
          },
          include: { settings: true },
        });

        console.log(`✅ Updated shop: ${updatedShop.name}`);
        return {
          success: true,
          message: "Shop updated successfully",
          data: updatedShop,
        };
      } else {
        // Create new shop with default settings
        const newShop = await this.db.shop.create({
          data: {
            id: shopData.id,
            name: shopData.name,
            slug: shopData.slug,
            description: shopData.description,
            type: shopData.type || "local",
            settings: {
              create: {
                // Default settings will be created via Prisma defaults
              },
            },
          },
          include: { settings: true },
        });

        console.log(`✅ Created shop: ${newShop.name}`);
        return {
          success: true,
          message: "Shop created successfully",
          data: newShop,
        };
      }
    } catch (error) {
      console.error(`❌ Error syncing shop ${shopData.name}:`, error);
      return {
        success: false,
        message: "Failed to sync shop",
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };
    }
  }

  /**
   * Sync user membership to shop
   */
  async syncMembership(membershipData: SyncMembershipData): Promise<SyncResult> {
    try {
      console.log(`🔄 Syncing membership: ${membershipData.email} -> ${membershipData.shopId} (${membershipData.role})`);

      // Verify shop exists
      const shop = await this.db.shop.findUnique({
        where: { id: membershipData.shopId },
      });

      if (!shop) {
        return {
          success: false,
          message: "Shop not found",
          errors: [`Shop ${membershipData.shopId} does not exist`],
        };
      }

      // Find or create user
      let user = await this.db.user.findUnique({
        where: { clerkId: membershipData.userId },
      });

      if (!user) {
        // Create user if they don't exist
        user = await this.db.user.create({
          data: {
            clerkId: membershipData.userId,
            email: membershipData.email,
            name: membershipData.name,
            shopId: membershipData.shopId,
            role: getNormalizedRole(membershipData.role),
          },
        });
        console.log(`✅ Created user for membership: ${user.email}`);
      } else {
        // Update existing user's shop and role
        user = await this.db.user.update({
          where: { clerkId: membershipData.userId },
          data: {
            shopId: membershipData.shopId,
            role: getNormalizedRole(membershipData.role),
            name: membershipData.name || user.name,
          },
        });
        console.log(`✅ Updated user membership: ${user.email}`);
      }

      return {
        success: true,
        message: "Membership synced successfully",
        data: user,
      };
    } catch (error) {
      console.error(`❌ Error syncing membership for ${membershipData.email}:`, error);
      return {
        success: false,
        message: "Failed to sync membership",
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };
    }
  }

  /**
   * Remove user from shop
   */
  async removeMembership(userId: string, shopId: string): Promise<SyncResult> {
    try {
      console.log(`🔄 Removing membership: ${userId} from ${shopId}`);

      const user = await this.db.user.findUnique({
        where: { clerkId: userId },
      });

      if (!user) {
        return {
          success: false,
          message: "User not found",
          errors: [`User ${userId} not found in database`],
        };
      }

      if (user.shopId !== shopId) {
        return {
          success: false,
          message: "User not a member of this shop",
          errors: [`User ${userId} is not a member of shop ${shopId}`],
        };
      }

      // Handle shop ownership conflict
      if (user.role === ROLES.ADMIN) {
        const shopMembers = await this.db.user.count({
          where: { shopId },
        });

        if (shopMembers === 1) {
          // User owns the shop - delete it
          await this.db.shop.delete({
            where: { id: shopId },
          });
          console.log(`✅ Deleted shop ${shopId} (last admin removed)`);
        }
      }

      // Remove user from shop
      const updatedUser = await this.db.user.update({
        where: { clerkId: userId },
        data: {
          shopId: null,
          role: null,
        },
      });

      console.log(`✅ Removed user ${updatedUser.email} from shop ${shopId}`);
      return {
        success: true,
        message: "Membership removed successfully",
        data: updatedUser,
      };
    } catch (error) {
      console.error(`❌ Error removing membership for ${userId}:`, error);
      return {
        success: false,
        message: "Failed to remove membership",
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };
    }
  }

  /**
   * Full sync of organization from Clerk
   */
  async syncOrganizationFromClerk(orgId: string): Promise<SyncResult> {
    try {
      console.log(`🔄 Full sync of organization: ${orgId}`);

      // Get organization details from Clerk
      const org = await clerkClient.organizations.getOrganization({
        organizationId: orgId,
      });

      // Sync shop
      const shopResult = await this.syncShop({
        id: org.id,
        name: org.name,
        slug: org.slug,
      });

      if (!shopResult.success) {
        return shopResult;
      }

      // Get all members from Clerk
      const memberships = await clerkClient.organizations.getOrganizationMembershipList({
        organizationId: orgId,
      });

      const syncResults = [];
      const errors = [];

      // Sync each member
      for (const membership of memberships.data) {
        const memberResult = await this.syncMembership({
          userId: membership.publicUserData.userId,
          shopId: orgId,
          role: membership.role,
          email: membership.publicUserData.identifier,
          name: membership.publicUserData.firstName && membership.publicUserData.lastName
            ? `${membership.publicUserData.firstName} ${membership.publicUserData.lastName}`
            : undefined,
        });

        if (memberResult.success) {
          syncResults.push(memberResult.data);
        } else {
          errors.push(...(memberResult.errors || []));
        }
      }

      return {
        success: errors.length === 0,
        message: `Organization sync completed. ${syncResults.length} members synced.`,
        data: {
          shop: shopResult.data,
          members: syncResults,
        },
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      console.error(`❌ Error syncing organization ${orgId}:`, error);
      return {
        success: false,
        message: "Failed to sync organization",
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };
    }
  }

  /**
   * Verify and fix data consistency
   */
  async verifyConsistency(shopId: string): Promise<SyncResult> {
    try {
      console.log(`🔍 Verifying consistency for shop: ${shopId}`);

      const issues = [];
      const fixes = [];

      // Get shop from database
      const shop = await this.db.shop.findUnique({
        where: { id: shopId },
        include: { settings: true },
      });

      if (!shop) {
        issues.push("Shop not found in database");
        return {
          success: false,
          message: "Shop not found in database",
          errors: issues,
        };
      }

      // Get members from database
      const dbMembers = await this.db.user.findMany({
        where: { shopId },
      });

      // Get members from Clerk
      const clerkMemberships = await clerkClient.organizations.getOrganizationMembershipList({
        organizationId: shopId,
      });

      // Check for missing users in database
      for (const clerkMember of clerkMemberships.data) {
        const dbMember = dbMembers.find(m => m.clerkId === clerkMember.publicUserData.userId);
        
        if (!dbMember) {
          issues.push(`User ${clerkMember.publicUserData.identifier} missing from database`);
          const fixResult = await this.syncMembership({
            userId: clerkMember.publicUserData.userId,
            shopId,
            role: clerkMember.role,
            email: clerkMember.publicUserData.identifier,
            name: clerkMember.publicUserData.firstName && clerkMember.publicUserData.lastName
              ? `${clerkMember.publicUserData.firstName} ${clerkMember.publicUserData.lastName}`
              : undefined,
          });
          if (fixResult.success) {
            fixes.push(`Added user ${clerkMember.publicUserData.identifier}`);
          }
        } else if (dbMember.role !== getNormalizedRole(clerkMember.role)) {
          issues.push(`Role mismatch for ${clerkMember.publicUserData.identifier}: DB=${dbMember.role}, Clerk=${clerkMember.role}`);
          const fixResult = await this.syncMembership({
            userId: clerkMember.publicUserData.userId,
            shopId,
            role: clerkMember.role,
            email: clerkMember.publicUserData.identifier,
            name: dbMember.name,
          });
          if (fixResult.success) {
            fixes.push(`Fixed role for ${clerkMember.publicUserData.identifier}`);
          }
        }
      }

      // Check for orphaned users in database
      for (const dbMember of dbMembers) {
        const clerkMember = clerkMemberships.data.find(m => m.publicUserData.userId === dbMember.clerkId);
        
        if (!clerkMember) {
          issues.push(`User ${dbMember.email} in database but not in Clerk organization`);
          const fixResult = await this.removeMembership(dbMember.clerkId, shopId);
          if (fixResult.success) {
            fixes.push(`Removed orphaned user ${dbMember.email}`);
          }
        }
      }

      return {
        success: issues.length === 0,
        message: `Consistency check completed. ${fixes.length} issues fixed.`,
        data: {
          shop,
          dbMemberCount: dbMembers.length,
          clerkMemberCount: clerkMemberships.data.length,
          issues,
          fixes,
        },
        errors: issues.length > 0 ? issues : undefined,
      };
    } catch (error) {
      console.error(`❌ Error verifying consistency for shop ${shopId}:`, error);
      return {
        success: false,
        message: "Failed to verify consistency",
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };
    }
  }
}

// Export singleton instance
export const authSync = new AuthSync(); 