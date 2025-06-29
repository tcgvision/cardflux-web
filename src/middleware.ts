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

  // Handle auth routes (sign-in and sign-up)
  if (isAuthRoute(req)) {
    // If user is already signed in and has an organization, redirect to dashboard
    if (userId && orgId) {
      console.log(`🔄 Auth route: User ${userId.substring(0, 8)}... has org ${orgId.substring(0, 8)}..., redirecting to dashboard`);
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    
    // If user is signed in but has no organization, allow them to stay on sign-up page
    // This gives the page time to handle OAuth completion and redirect appropriately
    if (userId && !orgId) {
      console.log(`✅ Auth route: User ${userId.substring(0, 8)}... has no org, allowing access to sign-up page for OAuth completion`);
      return NextResponse.next();
    }
    
    return NextResponse.next();
  }

  // Handle unauthenticated users
  if (!userId) {
    console.log(`🔄 Unauthenticated user accessing ${url.pathname}, redirecting to sign-in`);
    const signInUrl = new URL("/auth/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", url.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Handle create-shop route
  if (isCreateShopRoute(req)) {
    // If user already has an organization, redirect to dashboard
    if (orgId && orgRole) {
      console.log(`🔄 Create-shop route: User ${userId.substring(0, 8)}... already has org ${orgId.substring(0, 8)}..., redirecting to dashboard`);
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    // Allow access to create-shop if user has no organization
    return NextResponse.next();
  }

  // Handle team management route - allow users with database membership
  if (isTeamManagementRoute(req)) {
    // Allow access to team management routes
    // The team page will handle checking for shop membership and admin privileges via TRPC
    // This allows users with database membership but no active Clerk org context to access team management
    return NextResponse.next();
  }

  // Handle dashboard routes
  if (isDashboardRoute(req)) {
    // If user has no organization, redirect to create-shop
    if (!orgId) {
      console.log(`🔄 Dashboard route: User ${userId.substring(0, 8)}... has no org, redirecting to create-shop`);
      return NextResponse.redirect(new URL("/create-shop", req.url));
    }
    // Allow access to dashboard routes if user has organization
    return NextResponse.next();
  }

  // Default: allow the request
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};