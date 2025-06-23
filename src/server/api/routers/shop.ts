import { z } from "zod";
import { createTRPCRouter, shopProcedure, staffProcedure, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const shopRouter = createTRPCRouter({
  // Get current shop details
  getCurrent: shopProcedure.query(async ({ ctx }) => {
    return ctx.shop;
  }),

  // Create a new shop (for onboarding)
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1, "Shop name is required"),
      slug: z.string().min(1, "Shop slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
      description: z.string().optional(),
      location: z.string().optional(),
      type: z.enum(["local", "online", "both"]),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user already has a shop
      const existingUser = await ctx.db.user.findUnique({
        where: { clerkId: ctx.auth.userId! },
        include: { shop: true },
      });

      if (existingUser?.shopId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User already belongs to a shop",
        });
      }

      // Check if slug is available
      const existingShop = await ctx.db.shop.findUnique({
        where: { slug: input.slug },
      });

      if (existingShop) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Shop slug already taken",
        });
      }

      // Create shop and link user
      const shop = await ctx.db.shop.create({
        data: {
          id: ctx.auth.orgId!, // Use Clerk org ID
          name: input.name,
          slug: input.slug,
          description: input.description,
          location: input.location,
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
        data: { shopId: shop.id },
      });

      return shop;
    }),

  // Update shop details
  update: staffProcedure
    .input(z.object({
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      location: z.string().optional(),
      type: z.enum(["local", "online", "both"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const shop = await ctx.db.shop.update({
        where: { id: ctx.auth.orgId! },
        data: input,
        include: {
          settings: true,
        },
      });

      return shop;
    }),

  // Get shop settings
  getSettings: shopProcedure.query(async ({ ctx }) => {
    const settings = await ctx.db.shopSettings.findUnique({
      where: { shopId: ctx.shop.id },
    });

    return settings;
  }),

  // Update shop settings
  updateSettings: staffProcedure
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
      const settings = await ctx.db.shopSettings.upsert({
        where: { shopId: ctx.auth.orgId! },
        update: input,
        create: {
          shopId: ctx.auth.orgId!,
          ...input,
        },
      });

      return settings;
    }),

  // Get shop statistics
  getStats: shopProcedure.query(async ({ ctx }) => {
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
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      activeBuylists,
    };
  }),

  // Get shop members
  getMembers: shopProcedure.query(async ({ ctx }) => {
    const members = await ctx.db.user.findMany({
      where: { shopId: ctx.shop.id },
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return members;
  }),

  // Add member to shop (invite)
  addMember: staffProcedure
    .input(z.object({
      email: z.string().email(),
      name: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user already exists
      const existingUser = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        if (existingUser.shopId === ctx.shop.id) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "User is already a member of this shop",
          });
        }
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already belongs to another shop",
        });
      }

      // Create user record (they'll be linked to shop when they accept invitation)
      const user = await ctx.db.user.create({
        data: {
          email: input.email,
          name: input.name,
          clerkId: "", // Will be set when user accepts invitation
        },
      });

      return user;
    }),
}); 