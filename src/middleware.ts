import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define route matchers
const isPublicRoute = createRouteMatcher([
  "/",
  "/learn-more",
  "/api/trpc/(.*)",
  "/api/webhooks/(.*)",
]);

const isAuthRoute = createRouteMatcher([
  "/dashboard/sign-in(.*)",
  "/dashboard/sign-up(.*)",
]);

const isDashboardRoute = createRouteMatcher([
  "/dashboard(.*)",
]);

const isCreateShopRoute = createRouteMatcher([
  "/dashboard/create-shop",
]);

// Export the middleware
export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId, orgId } = await auth();
  const url = new URL(req.url);

  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Allow auth routes (sign-in and sign-up)
  if (isAuthRoute(req)) {
    // If user is already signed in, redirect to dashboard
    if (userId) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Handle unauthenticated users
  if (!userId) {
    const signInUrl = new URL("/dashboard/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", url.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Handle create-shop route
  if (isCreateShopRoute(req)) {
    // If user already has an organization, redirect to dashboard
    if (orgId) {
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