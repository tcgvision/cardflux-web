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
  "/api/sync-users-with-clerk(.*)",
  "/api/verify-consistency(.*)",
  "/api/test-auth(.*)",
  "/api/test-db(.*)",
  "/api/fix-user-shop(.*)",
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

// Export the middleware
export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId, orgId, orgRole } = await auth();
  const url = new URL(req.url);
  const hostname = req.headers.get("host") ?? "";

  // Allow all Clerk internal routes
  if (url.pathname.startsWith('/__clerk') || 
      url.pathname.includes('/clerk/') ||
      url.pathname.startsWith('/_clerk')) {
    return NextResponse.next();
  }

  // Allow public routes (including webhooks) - early return for performance
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Handle auth routes (sign-in and sign-up) - always allow access
  if (isAuthRoute(req)) {
    // If user is authenticated and has organization, redirect to dashboard
    if (userId && orgId) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    
    // If user is authenticated but no organization, redirect to create-shop
    if (userId && !orgId) {
      return NextResponse.redirect(new URL("/create-shop", req.url));
    }
    
    // Allow unauthenticated users to access auth routes
    return NextResponse.next();
  }

  // Handle unauthenticated users trying to access protected routes
  if (!userId) {
    const signInUrl = new URL("/auth/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", url.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Handle create-shop route - allow authenticated users without org
  if (isCreateShopRoute(req)) {
    // If user already has an organization, redirect to dashboard
    if (orgId && orgRole) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    
    // If user is not authenticated, redirect to sign-in
    if (!userId) {
      return NextResponse.redirect(new URL("/auth/sign-in", req.url));
    }
    
    // Allow access to create-shop if user has no organization
    return NextResponse.next();
  }

  // Handle dashboard routes - require organization
  if (isDashboardRoute(req)) {
    // If user has no organization, redirect to create-shop
    if (!orgId) {
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