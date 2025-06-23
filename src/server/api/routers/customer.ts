import { z } from "zod";
import { createTRPCRouter, shopProcedure, staffProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const customerRouter = createTRPCRouter({
  // Get all customers for the shop
  getAll: shopProcedure
    .input(z.object({
      search: z.string().optional(),
      isActive: z.boolean().optional(),
      limit: z.number().int().min(1).max(100).default(50),
      offset: z.number().int().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const where = {
        shopId: ctx.shop.id,
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        ...(input.search && {
          OR: [
            { name: { contains: input.search, mode: "insensitive" } },
            { phone: { contains: input.search, mode: "insensitive" } },
          ],
        }),
      };

      const [customers, total] = await Promise.all([
        ctx.db.customer.findMany({
          where,
          orderBy: { name: "asc" },
          take: input.limit,
          skip: input.offset,
          include: {
            _count: {
              select: {
                transactions: true,
                storeCreditTransactions: true,
              },
            },
          },
        }),
        ctx.db.customer.count({ where }),
      ]);

      return {
        customers,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  // Get customer by ID
  getById: shopProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const customer = await ctx.db.customer.findFirst({
        where: {
          id: input.id,
          shopId: ctx.shop.id,
        },
        include: {
          transactions: {
            orderBy: { createdAt: "desc" },
            take: 10,
            include: {
              items: {
                include: {
                  product: true,
                },
              },
            },
          },
          storeCreditTransactions: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
          buylists: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
      });

      if (!customer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Customer not found",
        });
      }

      return customer;
    }),

  // Create new customer
  create: staffProcedure
    .input(z.object({
      name: z.string().min(1, "Name is required"),
      phone: z.string().min(1, "Phone is required"),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if customer already exists
      const existingCustomer = await ctx.db.customer.findUnique({
        where: {
          shopId_phone: {
            shopId: ctx.shop.id,
            phone: input.phone,
          },
        },
      });

      if (existingCustomer) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Customer with this phone number already exists",
        });
      }

      const customer = await ctx.db.customer.create({
        data: {
          shopId: ctx.shop.id,
          name: input.name,
          phone: input.phone,
          notes: input.notes,
        },
      });

      return customer;
    }),

  // Update customer
  update: staffProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).optional(),
      phone: z.string().min(1).optional(),
      notes: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Check if phone number is being changed and if it conflicts
      if (updateData.phone) {
        const existingCustomer = await ctx.db.customer.findUnique({
          where: {
            shopId_phone: {
              shopId: ctx.shop.id,
              phone: updateData.phone,
            },
          },
        });

        if (existingCustomer && existingCustomer.id !== id) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Customer with this phone number already exists",
          });
        }
      }

      const customer = await ctx.db.customer.update({
        where: {
          id,
          shopId: ctx.shop.id,
        },
        data: updateData,
      });

      return customer;
    }),

  // Get customer store credit balance
  getCreditBalance: shopProcedure
    .input(z.object({ customerId: z.string() }))
    .query(async ({ ctx, input }) => {
      const customer = await ctx.db.customer.findFirst({
        where: {
          id: input.customerId,
          shopId: ctx.shop.id,
        },
        select: {
          id: true,
          name: true,
          currentCredit: true,
          totalEarned: true,
        },
      });

      if (!customer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Customer not found",
        });
      }

      return customer;
    }),

  // Get customer credit history
  getCreditHistory: shopProcedure
    .input(z.object({
      customerId: z.string(),
      limit: z.number().int().min(1).max(100).default(50),
      offset: z.number().int().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const [transactions, total] = await Promise.all([
        ctx.db.storeCreditTransaction.findMany({
          where: {
            customerId: input.customerId,
            shopId: ctx.shop.id,
          },
          orderBy: { createdAt: "desc" },
          take: input.limit,
          skip: input.offset,
          include: {
            staff: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        }),
        ctx.db.storeCreditTransaction.count({
          where: {
            customerId: input.customerId,
            shopId: ctx.shop.id,
          },
        }),
      ]);

      return {
        transactions,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  // Adjust customer store credit (staff only)
  adjustCredit: staffProcedure
    .input(z.object({
      customerId: z.string(),
      amount: z.number(),
      type: z.enum(["EARNED", "SPENT", "ADJUSTED", "REFUNDED"]),
      notes: z.string().optional(),
      referenceId: z.string().optional(),
      referenceType: z.enum(["TRANSACTION", "BUYLIST", "MANUAL", "REFUND"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get customer current balance
      const customer = await ctx.db.customer.findFirst({
        where: {
          id: input.customerId,
          shopId: ctx.shop.id,
        },
      });

      if (!customer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Customer not found",
        });
      }

      const balanceBefore = customer.currentCredit;
      let balanceAfter = balanceBefore;

      // Calculate new balance based on transaction type
      switch (input.type) {
        case "EARNED":
        case "REFUNDED":
          balanceAfter += input.amount;
          break;
        case "SPENT":
          balanceAfter -= input.amount;
          break;
        case "ADJUSTED":
          balanceAfter = input.amount; // Direct adjustment
          break;
      }

      // Validate minimum credit amount
      const settings = await ctx.db.shopSettings.findUnique({
        where: { shopId: ctx.shop.id },
      });

      if (settings?.minCreditAmount && balanceAfter < settings.minCreditAmount) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Credit balance cannot go below $${settings.minCreditAmount}`,
        });
      }

      // Validate maximum credit amount
      if (settings?.maxCreditAmount && balanceAfter > settings.maxCreditAmount) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Credit balance cannot exceed $${settings.maxCreditAmount}`,
        });
      }

      // Create credit transaction
      const creditTransaction = await ctx.db.storeCreditTransaction.create({
        data: {
          customerId: input.customerId,
          shopId: ctx.shop.id,
          type: input.type,
          amount: input.amount,
          balanceBefore,
          balanceAfter,
          referenceId: input.referenceId,
          referenceType: input.referenceType,
          staffId: ctx.user.id,
          notes: input.notes,
        },
      });

      // Update customer balance
      await ctx.db.customer.update({
        where: { id: input.customerId },
        data: {
          currentCredit: balanceAfter,
          totalEarned: input.type === "EARNED" 
            ? customer.totalEarned + input.amount 
            : customer.totalEarned,
        },
      });

      return creditTransaction;
    }),

  // Search customers by phone or name
  search: shopProcedure
    .input(z.object({
      query: z.string().min(1),
      limit: z.number().int().min(1).max(20).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const customers = await ctx.db.customer.findMany({
        where: {
          shopId: ctx.shop.id,
          isActive: true,
          OR: [
            { name: { contains: input.query, mode: "insensitive" } },
            { phone: { contains: input.query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          phone: true,
          currentCredit: true,
          lastVisit: true,
        },
        orderBy: { name: "asc" },
        take: input.limit,
      });

      return customers;
    }),
}); 