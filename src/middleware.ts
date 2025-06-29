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

// Export the middleware
export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId, orgId, orgRole } = await auth();
  const url = new URL(req.url);
  const hostname = req.headers.get("host") ?? "";

  // Add detailed logging for debugging OAuth issues
  console.log(`🔄 Middleware: ${req.method} ${url.pathname}`, {
    userId: userId?.substring(0, 8) + '...',
    orgId: orgId?.substring(0, 8) + '...',
    orgRole,
    userAgent: req.headers.get("user-agent")?.substring(0, 50) + '...',
    referer: req.headers.get("referer")?.substring(0, 50) + '...',
  });

  // Check if this is a dashboard subdomain request
  const isDashboardSubdomain = hostname.startsWith("dashboard.") || hostname.includes("localhost:3000/dashboard");

  // Allow public routes (including webhooks) - early return for performance
  if (isPublicRoute(req)) {
    // Add explicit logging for webhook requests to help with debugging
    if (req.nextUrl.pathname.startsWith('/api/webhooks')) {
      console.log(`🪝 Webhook request allowed: ${req.method} ${req.nextUrl.pathname}`);
    }
    console.log(`✅ Public route allowed: ${url.pathname}`);
    return NextResponse.next();
  }

  // Handle auth routes (sign-in and sign-up)
  if (isAuthRoute(req)) {
    console.log(`🔐 Auth route: ${url.pathname}`);
    
    // If user is already signed in and has an organization, redirect to dashboard
    if (userId && orgId) {
      console.log(`🔄 Auth route: User ${userId.substring(0, 8)}... has org ${orgId.substring(0, 8)}..., redirecting to dashboard`);
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    // If user is signed in but has no organization, redirect to create-shop
    if (userId && !orgId) {
      console.log(`🔄 Auth route: User ${userId.substring(0, 8)}... has no org, redirecting to create-shop`);
      return NextResponse.redirect(new URL("/create-shop", req.url));
    }
    console.log(`✅ Auth route allowed: ${url.pathname}`);
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
    console.log(`🏪 Create-shop route: ${url.pathname}`);
    // If user already has an organization, redirect to dashboard
    if (orgId && orgRole) {
      console.log(`🔄 Create-shop route: User ${userId.substring(0, 8)}... already has org ${orgId.substring(0, 8)}..., redirecting to dashboard`);
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    // Allow access to create-shop if user has no organization
    console.log(`✅ Create-shop route: User ${userId.substring(0, 8)}... has no org, allowing access`);
    return NextResponse.next();
  }

  // Handle team management route - allow users with database membership
  if (isTeamManagementRoute(req)) {
    // Allow access to team management routes
    // The team page will handle checking for shop membership and admin privileges via TRPC
    // This allows users with database membership but no active Clerk org context to access team management
    console.log(`👥 Team route: User ${userId.substring(0, 8)}... accessing team management`);
    return NextResponse.next();
  }

  // Handle dashboard routes
  if (isDashboardRoute(req)) {
    console.log(`📊 Dashboard route: ${url.pathname}`);
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
  console.log(`✅ Default: allowing request to ${url.pathname}`);
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};