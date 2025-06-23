import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define route matchers
const isPublicRoute = createRouteMatcher([
  "/",
  "/learn-more",
  "/pricing",
  "/features",
  "/about",
  "/api/trpc/(.*)",
  "/api/webhooks/(.*)",
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

// Export the middleware
export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId, orgId, orgRole } = await auth();
  const url = new URL(req.url);
  const hostname = req.headers.get("host") ?? "";

  // Check if this is a dashboard subdomain request
  const isDashboardSubdomain = hostname.startsWith("dashboard.") || hostname.includes("localhost:3000/dashboard");

  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Handle auth routes (sign-in and sign-up)
  if (isAuthRoute(req)) {
    // If user is already signed in and has an organization, redirect to dashboard
    if (userId && orgId) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    // If user is signed in but has no organization, redirect to onboarding
    if (userId && !orgId) {
      return NextResponse.redirect(new URL("/dashboard/create-shop", req.url));
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

  // Handle dashboard routes
  if (isDashboardRoute(req)) {
    // If user has no organization and isn't on create-shop, redirect to create-shop
    if (!orgId && !isCreateShopRoute(req)) {
      return NextResponse.redirect(new URL("/dashboard/create-shop", req.url));
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