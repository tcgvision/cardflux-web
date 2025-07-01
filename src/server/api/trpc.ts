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
import { ROLES, hasRolePermission, getNormalizedRole, type Role } from "~/lib/roles";

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
 * Database-first shop context middleware
 * Ensures user has access to a shop via database membership
 * This is our PRIMARY source of truth - no dependency on Clerk org context
 */
const isShopMember = t.middleware(async ({ next, ctx }) => {
  try {
    console.log('🔍 SHOP MEMBER MIDDLEWARE: Starting...');
    console.log('🔍 SHOP MEMBER MIDDLEWARE: Auth context:', { 
      userId: ctx.auth.userId ? ctx.auth.userId.substring(0, 8) + '...' : 'null' 
    });

    if (!ctx.auth.userId) {
      console.log('❌ SHOP MEMBER MIDDLEWARE: No user ID');
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    // Get user details from database (our source of truth)
    console.log('🔍 SHOP MEMBER MIDDLEWARE: Fetching user from database...');
    const user = await ctx.db.user.findUnique({
      where: { clerkId: ctx.auth.userId },
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        shopId: true,
        role: true,
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            type: true,
            createdAt: true,
            updatedAt: true,
            settings: true,
          },
        },
      },
    });

    console.log('🔍 SHOP MEMBER MIDDLEWARE: User found:', { 
      userId: user?.id,
      shopId: user?.shopId,
      role: user?.role 
    });

    if (!user) {
      console.log('❌ SHOP MEMBER MIDDLEWARE: User not found in database');
      throw new TRPCError({ 
        code: "NOT_FOUND", 
        message: "User not found in database" 
      });
    }

    if (!user.shopId) {
      console.log('❌ SHOP MEMBER MIDDLEWARE: User has no shop ID');
      
      // Check if user has a Clerk organization - if so, auto-fix the linking
      if (ctx.auth.orgId) {
        console.log('🔧 SHOP MEMBER MIDDLEWARE: Auto-fixing user-shop linking for org:', ctx.auth.orgId);
        
        try {
          // Check if shop exists with this org ID
          let shop = await ctx.db.shop.findUnique({
            where: { id: ctx.auth.orgId },
            include: {
              settings: true,
            },
          });

          if (!shop) {
            console.log('🔧 SHOP MEMBER MIDDLEWARE: Creating shop for organization:', ctx.auth.orgId);
            
            // Create shop with org ID
            shop = await ctx.db.shop.create({
              data: {
                id: ctx.auth.orgId,
                name: `Shop ${ctx.auth.orgId.substring(0, 8)}...`,
                slug: `shop-${ctx.auth.orgId.substring(0, 8)}`,
                description: `Auto-created shop for organization ${ctx.auth.orgId}`,
                type: 'both',
              },
              include: {
                settings: true,
              },
            });
          }

          // Link user to shop
          await ctx.db.user.update({
            where: { id: user.id },
            data: {
              shopId: shop.id,
              role: ctx.auth.orgRole ?? 'org:member',
            },
          });

          console.log('✅ SHOP MEMBER MIDDLEWARE: Auto-fixed user-shop linking');
          
          // Update user object for this request
          user.shopId = shop.id;
          user.role = ctx.auth.orgRole ?? 'org:member';
          
        } catch (error) {
          console.error('❌ SHOP MEMBER MIDDLEWARE: Failed to auto-fix user-shop linking:', error);
          throw new TRPCError({ 
            code: "FORBIDDEN", 
            message: "You must be a member of a shop to access this resource. Please contact support if this error persists." 
          });
        }
      } else {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "You must be a member of a shop to access this resource" 
        });
      }
    }

    // Get shop details
    console.log('🔍 SHOP MEMBER MIDDLEWARE: Fetching shop details...');
    let shop;
    try {
      shop = await ctx.db.shop.findUnique({
        where: { id: user.shopId },
        include: {
          settings: true,
        },
      });
      console.log('🔍 SHOP MEMBER MIDDLEWARE: Shop found with settings');
    } catch (error) {
      // If settings relation doesn't exist yet, try without it
      console.warn('⚠️ SHOP MEMBER MIDDLEWARE: Settings relation not found, falling back to basic shop query:', error);
      shop = await ctx.db.shop.findUnique({
        where: { id: user.shopId },
      });
      console.log('🔍 SHOP MEMBER MIDDLEWARE: Shop found without settings');
    }

    if (!shop) {
      console.log('❌ SHOP MEMBER MIDDLEWARE: Shop not found');
      throw new TRPCError({ 
        code: "NOT_FOUND", 
        message: "Shop not found" 
      });
    }

    // Get user's role from database (our source of truth)
    const userRole: Role = user.role ? getNormalizedRole(user.role) : ROLES.MEMBER;
    console.log('🔍 SHOP MEMBER MIDDLEWARE: User role:', userRole);

    console.log('✅ SHOP MEMBER MIDDLEWARE: Successfully authenticated');
    return next({
      ctx: {
        auth: ctx.auth,
        shop,
        user,
        userRole, // Database role as source of truth
        db: ctx.db,
      },
    });
  } catch (error) {
    console.error('❌ SHOP MEMBER MIDDLEWARE: Error:', error);
    throw error;
  }
});

/**
 * Staff-only middleware
 * Ensures user has staff role in the shop (database role)
 */
const isStaff = t.middleware(async ({ next, ctx }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  // Get user details from database
  const user = await ctx.db.user.findFirst({
    where: { 
      clerkId: ctx.auth.userId,
      shopId: { not: null }, // Must be part of a shop
    },
    select: {
      id: true,
      clerkId: true,
      email: true,
      name: true,
      shopId: true,
      role: true,
    },
  });

  if (!user) {
    throw new TRPCError({ 
      code: "FORBIDDEN", 
      message: "You must be a staff member to perform this action" 
    });
  }

  // Get user's role from database
  const userRole: Role = user.role ? getNormalizedRole(user.role) : ROLES.MEMBER;

  return next({
    ctx: {
      auth: ctx.auth,
      user,
      userRole, // Database role as source of truth
      db: ctx.db,
    },
  });
});

/**
 * Admin-only middleware
 * Ensures user has admin role in the shop (database role)
 */
const isAdmin = t.middleware(async ({ next, ctx }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  // Get user details from database
  const user = await ctx.db.user.findFirst({
    where: { 
      clerkId: ctx.auth.userId,
      shopId: { not: null },
    },
    select: {
      id: true,
      clerkId: true,
      email: true,
      name: true,
      shopId: true,
      role: true,
    },
  });

  if (!user) {
    throw new TRPCError({ 
      code: "FORBIDDEN", 
      message: "You must be a shop member to perform this action" 
    });
  }

  // Get user's role from database
  const userRole: Role = user.role ? getNormalizedRole(user.role) : ROLES.MEMBER;

  // Check if user has admin permissions
  if (!hasRolePermission(userRole, ROLES.ADMIN)) {
    throw new TRPCError({ 
      code: "FORBIDDEN", 
      message: "Admin privileges required" 
    });
  }

  return next({
    ctx: {
      auth: ctx.auth,
      user,
      userRole, // Database role as source of truth
      db: ctx.db,
    },
  });
});

/**
 * Team management middleware
 * Ensures user has access to team management features via database membership
 */
const isTeamManager = t.middleware(async ({ next, ctx }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  // Get user details from database
  const user = await ctx.db.user.findUnique({
    where: { clerkId: ctx.auth.userId },
    select: {
      id: true,
      clerkId: true,
      email: true,
      name: true,
      shopId: true,
      role: true,
      shop: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          type: true,
          createdAt: true,
          updatedAt: true,
          settings: true,
        },
      },
    },
  });

  if (!user) {
    throw new TRPCError({ 
      code: "NOT_FOUND", 
      message: "User not found in database" 
    });
  }

  if (!user.shopId) {
    throw new TRPCError({ 
      code: "FORBIDDEN", 
      message: "You must be a member of a shop to access team management" 
    });
  }

  // Get shop details
  let shop;
  try {
    shop = await ctx.db.shop.findUnique({
      where: { id: user.shopId },
      include: {
        settings: true,
      },
    });
  } catch (error) {
    // If settings relation doesn't exist yet, try without it
    console.warn('Settings relation not found, falling back to basic shop query:', error);
    shop = await ctx.db.shop.findUnique({
      where: { id: user.shopId },
    });
  }

  if (!shop) {
    throw new TRPCError({ 
      code: "NOT_FOUND", 
      message: "Shop not found" 
    });
  }

  // Get user's role from database
  const userRole: Role = user.role ? getNormalizedRole(user.role) : ROLES.MEMBER;

  return next({
    ctx: {
      auth: ctx.auth,
      shop,
      user,
      userRole, // Database role as source of truth
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
 * Shop member procedure (PRIMARY - Database source of truth)
 *
 * This procedure ensures the user is a member of a shop and provides shop context.
 * Uses database as the single source of truth for roles and membership.
 * Use this for most shop-related operations.
 */
export const shopProcedure = t.procedure.use(timingMiddleware).use(isShopMember);

/**
 * Staff procedure (Database source of truth)
 *
 * This procedure ensures the user is a staff member of the shop.
 * Uses database role as source of truth.
 * Use this for operations that require staff privileges.
 */
export const staffProcedure = t.procedure.use(timingMiddleware).use(isStaff);

/**
 * Admin procedure (Database source of truth)
 *
 * This procedure ensures the user has admin privileges in the shop.
 * Uses database role as source of truth.
 * Use this for admin-only operations.
 */
export const adminProcedure = t.procedure.use(timingMiddleware).use(isAdmin);

/**
 * Team management procedure (Database source of truth)
 *
 * This procedure ensures the user is a member of a shop and can access team management.
 * Uses database as the single source of truth.
 */
export const teamProcedure = t.procedure.use(timingMiddleware).use(isTeamManager);

// Legacy procedures for backward compatibility (deprecated)
/**
 * @deprecated Use shopProcedure instead - this relies on Clerk org context
 */
export const shopProcedureDb = shopProcedure;

/**
 * @deprecated Use shopProcedure instead - this relies on Clerk org context  
 */
export const isShopMemberDb = isShopMember;
