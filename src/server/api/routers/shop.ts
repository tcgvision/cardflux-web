import { z } from "zod";
import { createTRPCRouter, shopProcedure, staffProcedure, protectedProcedure, adminProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { ROLES, hasRolePermission, getNormalizedRole } from "~/lib/roles";
import { ErrorHandler, ErrorMessages } from "~/lib/error-handling";

export const shopRouter = createTRPCRouter({
  // Get current shop details
  getCurrent: shopProcedure.query(async ({ ctx }) => {
    return ctx.shop;
  }),

  // Get current shop details (database fallback)
  getCurrentDb: shopProcedure.query(async ({ ctx }) => {
    return ctx.shop;
  }),

  // Create a new shop (for onboarding)
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1, "Shop name is required"),
      slug: z.string().min(1, "Shop slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
      description: z.string().optional(),
      type: z.enum(["local", "online", "both"]),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if user already has a shop
        const existingUser = await ctx.db.user.findUnique({
          where: { clerkId: ctx.auth.userId! },
          include: { shop: true },
        });

        if (existingUser?.shopId) {
          throw ErrorHandler.createTRPCError(
            "BAD_REQUEST",
            ErrorMessages.SHOP.ALREADY_MEMBER
          );
        }

        // Get the organization ID from Clerk context
        const orgId = ctx.auth.orgId;
        if (!orgId) {
          throw ErrorHandler.createTRPCError(
            "BAD_REQUEST",
            "Organization ID is required to create a shop"
          );
        }

        // Generate a unique slug with fallback options
        const generateUniqueSlug = async (baseSlug: string): Promise<string> => {
          let slug = baseSlug;
          let counter = 1;
          
          while (true) {
            const existingShop = await ctx.db.shop.findUnique({
              where: { slug },
            });
            
            if (!existingShop) {
              return slug;
            }
            
            // Try with counter suffix
            slug = `${baseSlug}-${counter}`;
            counter++;
            
            // Prevent infinite loop (max 100 attempts)
            if (counter > 100) {
              throw ErrorHandler.createTRPCError(
                "CONFLICT",
                "Unable to generate unique shop slug. Please try a different shop name."
              );
            }
          }
        };

        // Generate unique slug
        const uniqueSlug = await generateUniqueSlug(input.slug);

        // Create shop and link user
        const shop = await ctx.db.shop.create({
          data: {
            id: orgId, // Use Clerk org ID
            name: input.name,
            slug: uniqueSlug,
            description: input.description,
            type: input.type,
            settings: {
              create: {
                // Default settings will be created via Prisma defaults
              },
            },
          },
          include: {
            settings: true,
          },
        });

        // Update user to link to shop
        await ctx.db.user.update({
          where: { clerkId: ctx.auth.userId! },
          data: { 
            shopId: shop.id,
            role: "org:admin", // Ensure the shop creator gets admin role
          },
        });

        return shop;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw ErrorHandler.handleDatabaseError(error, "shop.create");
      }
    }),

  // Update shop details (Admin only)
  update: shopProcedure
    .input(z.object({
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      type: z.enum(["local", "online", "both"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if user has admin permissions
        const userRole = ctx.userRole;
        
        if (!hasRolePermission(userRole, ROLES.ADMIN)) {
          throw ErrorHandler.handleForbiddenError(ErrorMessages.SHOP.ADMIN_REQUIRED);
        }

        const shop = await ctx.db.shop.update({
          where: { id: ctx.shop.id },
          data: input,
          include: {
            settings: true,
          },
        });

        return shop;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw ErrorHandler.handleDatabaseError(error, "shop.update");
      }
    }),

  // Get shop settings
  getSettings: shopProcedure.query(async ({ ctx }) => {
    try {
      const settings = await ctx.db.shopSettings.findUnique({
        where: { shopId: ctx.shop.id },
      });

      return settings;
    } catch (error) {
      throw ErrorHandler.handleDatabaseError(error, "shop.getSettings");
    }
  }),

  // Update shop settings (Admin only)
  updateSettings: shopProcedure
    .input(z.object({
      defaultCurrency: z.string().optional(),
      enableNotifications: z.boolean().optional(),
      autoPriceSync: z.boolean().optional(),
      lowStockThreshold: z.number().int().min(0).optional(),
      enableStoreCredit: z.boolean().optional(),
      minCreditAmount: z.number().min(0).optional(),
      maxCreditAmount: z.number().min(0).nullable().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if user has admin permissions
        const userRole = ctx.userRole;
        
        if (!hasRolePermission(userRole, ROLES.ADMIN)) {
          throw ErrorHandler.handleForbiddenError(ErrorMessages.SHOP.ADMIN_REQUIRED);
        }

        const settings = await ctx.db.shopSettings.upsert({
          where: { shopId: ctx.shop.id },
          update: input,
          create: {
            shopId: ctx.shop.id,
            ...input,
          },
        });

        return settings;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw ErrorHandler.handleDatabaseError(error, "shop.updateSettings");
      }
    }),

  // Get shop statistics
  getStats: shopProcedure.query(async ({ ctx }) => {
    try {
      const [
        customerCount,
        productCount,
        transactionCount,
        totalRevenue,
        activeBuylists,
      ] = await Promise.all([
        ctx.db.customer.count({
          where: { shopId: ctx.shop.id, isActive: true },
        }),
        ctx.db.product.count({
          where: { shopId: ctx.shop.id },
        }),
        ctx.db.transaction.count({
          where: { 
            shopId: ctx.shop.id,
            status: "COMPLETED",
            createdAt: {
              gte: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
            },
          },
        }),
        ctx.db.transaction.aggregate({
          where: { 
            shopId: ctx.shop.id,
            status: "COMPLETED",
            type: "CHECKOUT",
            createdAt: {
              gte: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
            },
          },
          _sum: { totalAmount: true },
        }),
        ctx.db.buylist.count({
          where: { 
            shopId: ctx.shop.id,
            status: "PENDING",
          },
        }),
      ]);

      return {
        customerCount,
        productCount,
        transactionCount,
        totalRevenue: totalRevenue._sum.totalAmount ?? 0,
        activeBuylists,
      };
    } catch (error) {
      console.error("Error fetching shop stats:", error);
      // Return default values if there's an error
      return {
        customerCount: 0,
        productCount: 0,
        transactionCount: 0,
        totalRevenue: 0,
        activeBuylists: 0,
      };
    }
  }),

  // Get shop members (Admin only)
  getMembers: shopProcedure.query(async ({ ctx }) => {
    try {
      // Check if user has admin permissions
      const userRole = ctx.userRole;
      
      if (!hasRolePermission(userRole, ROLES.ADMIN)) {
        throw ErrorHandler.handleForbiddenError("Admin privileges required to view team members");
      }

      const members = await ctx.db.user.findMany({
        where: { shopId: ctx.shop.id },
        select: {
          id: true,
          clerkId: true,
          email: true,
          name: true,
          role: true,
        },
        orderBy: { id: "asc" },
      });

      return members;
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw ErrorHandler.handleDatabaseError(error, "shop.getMembers");
    }
  }),
}); 