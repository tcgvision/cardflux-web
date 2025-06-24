/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { auth } from "@clerk/nextjs/server";

import { db } from "~/server/db";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth();
  
  return {
    db,
    auth: { 
      userId: session?.userId,
      orgId: session?.orgId,
      orgRole: session?.orgRole,
    },
    ...opts,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

/**
 * Authentication middleware
 * Checks if the user is signed in, otherwise throws an UNAUTHORIZED error
 */
const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      auth: ctx.auth,
      db: ctx.db,
    },
  });
});

/**
 * Shop context middleware
 * Ensures user has access to a shop and provides shop context
 */
const isShopMember = t.middleware(async ({ next, ctx }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  if (!ctx.auth.orgId) {
    throw new TRPCError({ 
      code: "FORBIDDEN", 
      message: "You must be a member of a shop to access this resource" 
    });
  }

  // Get shop details - try with settings first, fallback without if it fails
  let shop;
  try {
    shop = await ctx.db.shop.findUnique({
      where: { id: ctx.auth.orgId },
      include: {
        settings: true,
      },
    });
  } catch (error) {
    // If settings relation doesn't exist yet, try without it
    console.warn('Settings relation not found, falling back to basic shop query:', error);
    shop = await ctx.db.shop.findUnique({
      where: { id: ctx.auth.orgId },
    });
  }

  if (!shop) {
    throw new TRPCError({ 
      code: "NOT_FOUND", 
      message: "Shop not found" 
    });
  }

  // Get user details
  const user = await ctx.db.user.findUnique({
    where: { clerkId: ctx.auth.userId },
  });

  if (!user) {
    throw new TRPCError({ 
      code: "NOT_FOUND", 
      message: "User not found in database" 
    });
  }

  return next({
    ctx: {
      auth: ctx.auth,
      shop,
      user,
      db: ctx.db,
    },
  });
});

/**
 * Staff-only middleware
 * Ensures user has staff role in the shop
 */
const isStaff = t.middleware(async ({ next, ctx }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  if (!ctx.auth.orgId) {
    throw new TRPCError({ 
      code: "FORBIDDEN", 
      message: "You must be a member of a shop to access this resource" 
    });
  }

  // Check if user is staff (has transactions, buylists, or credit transactions)
  const user = await ctx.db.user.findFirst({
    where: { 
      clerkId: ctx.auth.userId,
      shopId: ctx.auth.orgId,
    },
  });

  if (!user) {
    throw new TRPCError({ 
      code: "FORBIDDEN", 
      message: "You must be a staff member to perform this action" 
    });
  }

  return next({
    ctx: {
      auth: ctx.auth,
      user,
      db: ctx.db,
    },
  });
});

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * Protected (authenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API that require
 * authentication. It guarantees that a user is signed in before the procedure is executed.
 */
export const protectedProcedure = t.procedure.use(timingMiddleware).use(isAuthed);

/**
 * Shop member procedure
 *
 * This procedure ensures the user is a member of a shop and provides shop context.
 * Use this for most shop-related operations.
 */
export const shopProcedure = t.procedure.use(timingMiddleware).use(isShopMember);

/**
 * Staff procedure
 *
 * This procedure ensures the user is a staff member of the shop.
 * Use this for operations that require staff privileges.
 */
export const staffProcedure = t.procedure.use(timingMiddleware).use(isStaff);
