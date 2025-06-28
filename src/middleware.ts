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
  "/api/webhooks(.*)", // Fixed: removed the slash before (.*) for better matching
  "/api/reset-signup(.*)",
  "/api/sync-user(.*)",
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
  "/dashboard/create-shop",
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

  // Check if this is a dashboard subdomain request
  const isDashboardSubdomain = hostname.startsWith("dashboard.") || hostname.includes("localhost:3000/dashboard");

  // Allow public routes (including webhooks) - early return for performance
  if (isPublicRoute(req)) {
    // Add explicit logging for webhook requests to help with debugging
    if (req.nextUrl.pathname.startsWith('/api/webhooks')) {
      console.log(`🪝 Webhook request allowed: ${req.method} ${req.nextUrl.pathname}`);
    }
    return NextResponse.next();
  }

  // Handle auth routes (sign-in and sign-up)
  if (isAuthRoute(req)) {
    // If user is already signed in and has an organization, redirect to dashboard
    if (userId && orgId) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    // If user is signed in but has no organization, check database for shop membership
    if (userId && !orgId) {
      // Note: We can't make database calls from middleware, so we'll let the dashboard handle this
      // The dashboard will check for shop membership and reload if needed
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Handle unauthenticated users
  if (!userId) {
    const signInUrl = new URL("/auth/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", url.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Handle create-shop route
  if (isCreateShopRoute(req)) {
    // If user already has an organization, redirect to dashboard
    if (orgId && orgRole) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    // Allow access to create-shop if user has no organization
    return NextResponse.next();
  }

  // Handle team management route - only allow admins
  if (isTeamManagementRoute(req)) {
    // If user has no organization, redirect to create-shop
    if (!orgId) {
      return NextResponse.redirect(new URL("/dashboard/create-shop", req.url));
    }
    
    // Check if user has admin role using the normalized role system
    const normalizedRole = getNormalizedRole(orgRole);
    if (!hasRolePermission(normalizedRole, ROLES.ADMIN)) {
      // Redirect to dashboard with access denied message
      const dashboardUrl = new URL("/dashboard", req.url);
      dashboardUrl.searchParams.set("error", "access_denied");
      dashboardUrl.searchParams.set("message", "You need admin privileges to access team management.");
      return NextResponse.redirect(dashboardUrl);
    }
    
    return NextResponse.next();
  }

  // Handle dashboard routes
  if (isDashboardRoute(req)) {
    // If user has no organization and isn't on create-shop, let dashboard handle routing
    // The dashboard will check for shop membership and redirect appropriately
    if (!orgId && !isCreateShopRoute(req)) {
      // Don't redirect here - let the dashboard page handle it
      return NextResponse.next();
    }
    // Allow access to dashboard if user has an organization
    return NextResponse.next();
  }

  // Default: allow the request
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};