import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ROLES, hasRolePermission, getNormalizedRole } from "~/lib/roles";

// Define route matchers
const isPublicRoute = createRouteMatcher([
  "/",
  "/get-started",
  "/learn-more",
  "/pricing",
  "/features",
  "/about",
  "/api/trpc/(.*)",
  "/api/webhooks(.*)",
  "/api/reset-signup(.*)",
  "/api/sync-user(.*)",
  "/api/debug-clerk(.*)",
  "/api/check-shop-membership(.*)",
  "/api/sync-organization(.*)",
]);

const isAuthRoute = createRouteMatcher([
  "/auth/sign-in(.*)",
  "/auth/sign-up(.*)",
  "/dashboard/sign-in(.*)", // Keep for backward compatibility
  "/dashboard/sign-up(.*)", // Keep for backward compatibility
]);

const isDashboardRoute = createRouteMatcher([
  "/dashboard(.*)",
]);

const isCreateShopRoute = createRouteMatcher([
  "/create-shop",
]);

const isOnboardingRoute = createRouteMatcher([
  "/dashboard/onboarding",
]);

const isTeamManagementRoute = createRouteMatcher([
  "/dashboard/team",
]);

// Helper function to detect OAuth completion
function isOAuthCompletion(req: NextRequest): boolean {
  const url = new URL(req.url);
  const searchParams = url.searchParams;
  
  // Check for various OAuth completion indicators
  const hasClerkStatus = searchParams.has('__clerk_status');
  const hasClerkDbJwt = searchParams.has('__clerk_db_jwt');
  const hasClerkStrategy = searchParams.has('__clerk_strategy');
  const hasOAuthCode = searchParams.has('code') && searchParams.has('state');
  
  return hasClerkStatus || hasClerkDbJwt || hasClerkStrategy || hasOAuthCode;
}

// Export the middleware
export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId, orgId, orgRole } = await auth();
  const url = new URL(req.url);
  const hostname = req.headers.get("host") ?? "";

  // Check for OAuth completion
  const isOAuthCallback = isOAuthCompletion(req);
  if (isOAuthCallback) {
    console.log(`🔄 OAuth completion detected, allowing through to ${url.pathname}`);
    return NextResponse.next();
  }

  // Allow public routes (including webhooks) - early return for performance
  if (isPublicRoute(req)) {
    // Only log webhook requests for debugging
    if (req.nextUrl.pathname.startsWith('/api/webhooks')) {
      console.log(`🪝 Webhook request: ${req.method} ${req.nextUrl.pathname}`);
    }
    return NextResponse.next();
  }

  // Handle auth routes (sign-in and sign-up) - always allow access
  if (isAuthRoute(req)) {
    // If user is authenticated and has organization, redirect to dashboard
    if (userId && orgId) {
      console.log(`🔄 Auth route: User ${userId.substring(0, 8)}... has org ${orgId.substring(0, 8)}..., redirecting to dashboard`);
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    
    // If user is authenticated but no organization, redirect to create-shop
    if (userId && !orgId) {
      console.log(`🔄 Auth route: User ${userId.substring(0, 8)}... has no org, redirecting to create-shop`);
      return NextResponse.redirect(new URL("/create-shop", req.url));
    }
    
    // Allow unauthenticated users to access auth routes
    console.log(`✅ Auth route allowed: ${url.pathname}`);
    return NextResponse.next();
  }

  // Handle unauthenticated users trying to access protected routes
  if (!userId) {
    console.log(`🔄 Unauthenticated user accessing ${url.pathname}, redirecting to sign-in`);
    const signInUrl = new URL("/auth/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", url.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Handle create-shop route - allow authenticated users without org
  if (isCreateShopRoute(req)) {
    // If user already has an organization, redirect to dashboard
    if (orgId && orgRole) {
      console.log(`🔄 Create-shop route: User ${userId.substring(0, 8)}... already has org ${orgId.substring(0, 8)}..., redirecting to dashboard`);
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    // Allow access to create-shop if user has no organization
    console.log(`✅ Create-shop route: User ${userId.substring(0, 8)}... has no org, allowing access`);
    return NextResponse.next();
  }

  // Handle dashboard routes - require organization
  if (isDashboardRoute(req)) {
    // If user has no organization, redirect to create-shop
    if (!orgId) {
      console.log(`🔄 Dashboard route: User ${userId.substring(0, 8)}... has no org, redirecting to create-shop`);
      return NextResponse.redirect(new URL("/create-shop", req.url));
    }
    // Allow access to dashboard routes if user has organization
    console.log(`✅ Dashboard route: User ${userId.substring(0, 8)}... has org ${orgId.substring(0, 8)}..., allowing access`);
    return NextResponse.next();
  }

  // Default: allow the request
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};