import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

const shopSchema = z.object({
  name: z.string().min(1, "Shop name is required"),
  description: z.string().optional(),
  location: z.string().optional(),
  type: z.enum(["local", "online", "both"]),
  clerkOrgId: z.string(),
});

export const shopRouter = createTRPCRouter({
  create: protectedProcedure
    .input(shopSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if user is authenticated
      if (!ctx.auth.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to create a shop",
        });
      }

      // Check if shop already exists for this organization
      const existingShop = await ctx.db.shop.findUnique({
        where: { id: input.clerkOrgId },
      });

      if (existingShop) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A shop already exists for this organization",
        });
      }

      // Create the shop
      const shop = await ctx.db.shop.create({
        data: {
          id: input.clerkOrgId,
          name: input.name,
          slug: input.name.toLowerCase().replace(/\s+/g, '-'),
          description: input.description,
          location: input.location,
          type: input.type,
        },
      });

      // Update the user's shop association
      await ctx.db.user.update({
        where: { clerkId: ctx.auth.userId },
        data: { shopId: shop.id },
      });

      return shop;
    }),

  getCurrentShop: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.auth.userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to view shop details",
      });
    }

    const user = await ctx.db.user.findUnique({
      where: { clerkId: ctx.auth.userId },
      include: { shop: true },
    });

    if (!user?.shop) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No shop found for this user",
      });
    }

    return user.shop;
  }),

  update: protectedProcedure
    .input(shopSchema.partial().extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.auth.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to update a shop",
        });
      }

      const user = await ctx.db.user.findUnique({
        where: { clerkId: ctx.auth.userId },
        include: { shop: true },
      });

      if (!user?.shop) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No shop found for this user",
        });
      }

      if (user.shop.id !== input.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to update this shop",
        });
      }

      return await ctx.db.shop.update({
        where: { id: input.id },
        data: {
          name: input.name,
          description: input.description,
          location: input.location,
          type: input.type,
        },
      });
    }),
}); 