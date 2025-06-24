import { z } from "zod";
import { createTRPCRouter, shopProcedure, staffProcedure, shopProcedureDb } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const transactionRouter = createTRPCRouter({
  // Get all transactions for the shop
  getAll: shopProcedureDb
    .input(z.object({
      search: z.string().optional(),
      status: z.enum(["COMPLETED", "PENDING", "CANCELLED", "REFUNDED"]).optional(),
      type: z.enum(["CHECKOUT", "REFUND", "STORE_CREDIT"]).optional(),
      limit: z.number().int().min(1).max(100).default(50),
      offset: z.number().int().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const where = {
        shopId: ctx.shop.id,
        ...(input.status && { status: input.status }),
        ...(input.type && { type: input.type }),
        ...(input.search && {
          OR: [
            { id: { contains: input.search, mode: "insensitive" } },
            { customer: { name: { contains: input.search, mode: "insensitive" } } },
          ],
        }),
      };

      const [transactions, total] = await Promise.all([
        ctx.db.transaction.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: input.limit,
          skip: input.offset,
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
            items: {
              include: {
                product: true,
              },
            },
            staff: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        }),
        ctx.db.transaction.count({ where }),
      ]);

      return {
        transactions,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  // Get transaction by ID
  getById: shopProcedureDb
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const transaction = await ctx.db.transaction.findFirst({
        where: {
          id: input.id,
          shopId: ctx.shop.id,
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
              currentCredit: true,
            },
          },
          items: {
            include: {
              product: true,
            },
          },
          staff: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!transaction) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Transaction not found",
        });
      }

      return transaction;
    }),

  // Create new transaction
  create: staffProcedure
    .input(z.object({
      customerId: z.string().optional(),
      type: z.enum(["CHECKOUT", "REFUND", "STORE_CREDIT"]),
      paymentMethod: z.enum(["CASH", "CARD", "STORE_CREDIT", "MIXED"]),
      items: z.array(z.object({
        productId: z.string(),
        quantity: z.number().int().min(1),
        unitPrice: z.number().min(0),
        condition: z.enum(["NM", "LP", "MP", "HP"]).optional(),
      })),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.shopId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must be associated with a shop to create transactions",
        });
      }

      // Calculate total amount
      const totalAmount = input.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

      // Create transaction
      const transaction = await ctx.db.transaction.create({
        data: {
          shopId: ctx.user.shopId,
          customerId: input.customerId,
          type: input.type,
          paymentMethod: input.paymentMethod,
          totalAmount,
          status: "COMPLETED",
          notes: input.notes,
          staffId: ctx.user.id,
          items: {
            create: input.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              condition: item.condition || "NM",
            })),
          },
        },
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      return transaction;
    }),

  // Update transaction status
  updateStatus: staffProcedure
    .input(z.object({
      id: z.string(),
      status: z.enum(["COMPLETED", "PENDING", "CANCELLED", "REFUNDED"]),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.shopId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must be associated with a shop to update transactions",
        });
      }

      const transaction = await ctx.db.transaction.update({
        where: {
          id: input.id,
          shopId: ctx.user.shopId,
        },
        data: {
          status: input.status,
          notes: input.notes,
        },
      });

      return transaction;
    }),

  // Get transaction statistics
  getStats: shopProcedureDb
    .input(z.object({
      period: z.enum(["today", "week", "month", "quarter", "year"]).default("month"),
    }))
    .query(async ({ ctx, input }) => {
      const now = new Date();
      let startDate: Date;

      switch (input.period) {
        case "today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "quarter":
          const quarter = Math.floor(now.getMonth() / 3);
          startDate = new Date(now.getFullYear(), quarter * 3, 1);
          break;
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
      }

      const [totalTransactions, totalRevenue, averageTransaction, pendingCount] = await Promise.all([
        ctx.db.transaction.count({
          where: {
            shopId: ctx.shop.id,
            status: "COMPLETED",
            createdAt: { gte: startDate },
          },
        }),
        ctx.db.transaction.aggregate({
          where: {
            shopId: ctx.shop.id,
            status: "COMPLETED",
            type: "CHECKOUT",
            createdAt: { gte: startDate },
          },
          _sum: { totalAmount: true },
        }),
        ctx.db.transaction.aggregate({
          where: {
            shopId: ctx.shop.id,
            status: "COMPLETED",
            type: "CHECKOUT",
            createdAt: { gte: startDate },
          },
          _avg: { totalAmount: true },
        }),
        ctx.db.transaction.count({
          where: {
            shopId: ctx.shop.id,
            status: "PENDING",
          },
        }),
      ]);

      return {
        totalTransactions,
        totalRevenue: totalRevenue._sum.totalAmount ?? 0,
        averageTransaction: averageTransaction._avg.totalAmount ?? 0,
        pendingCount,
      };
    }),
}); 