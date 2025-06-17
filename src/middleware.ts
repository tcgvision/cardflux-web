import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Constants for environment-specific configuration
const DEV_HOST = "localhost:3000";
const PROD_HOST = "tcgvision.com";
const DASHBOARD_SUBDOMAIN = "dashboard";

// Define route matchers
const isPublicRoute = createRouteMatcher([
  "/",
  "/features",
  "/pricing",
  "/about",
  "/api/webhook/clerk",
  "/api/webhook/stripe",
]);

const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);
const isAuthRoute = createRouteMatcher(["/dashboard/sign-in(.*)", "/dashboard/sign-up(.*)"]);
const isCreateShopRoute = createRouteMatcher(["/create-shop"]);

// Helper function to create URLs with proper hostname
const createUrl = (path: string, req: NextRequest, isDev: boolean) => {
  const url = new URL(path, req.url);
  if (!isDev) {
    url.hostname = PROD_HOST;
  } else {
    url.hostname = DEV_HOST;
  }
  return url;
};

// Helper function to create dashboard URLs
const createDashboardUrl = (path: string, req: NextRequest, isDev: boolean) => {
  const url = new URL(path, req.url);
  if (!isDev) {
    url.hostname = `${DASHBOARD_SUBDOMAIN}.${PROD_HOST}`;
  } else {
    url.hostname = DEV_HOST;
    url.pathname = `/dashboard${path}`;
  }
  return url;
};

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId, orgId } = await auth();
  const hostname = req.headers.get("host") ?? "";
  const isDev = hostname.includes("localhost");
  
  // Handle dashboard routes
  const isDashboardSubdomain = isDev 
    ? req.nextUrl.pathname.startsWith("/dashboard")
    : hostname.startsWith(`${DASHBOARD_SUBDOMAIN}.`);

  // Skip auth check for public routes and auth routes
  if (isPublicRoute(req) || isAuthRoute(req)) {
    return NextResponse.next();
  }

  // Protect dashboard routes
  if (isDashboardRoute(req)) {
    await auth.protect();
  }

  // Handle create-shop route
  if (isCreateShopRoute(req)) {
    // If user is not signed in, redirect to sign in
    if (!userId) {
      return NextResponse.redirect(createUrl("/dashboard/sign-in", req, isDev));
    }

    // If user already has an organization, redirect to dashboard
    if (orgId) {
      return NextResponse.redirect(createDashboardUrl("/", req, isDev));
    }
  }

  if (isDashboardSubdomain) {
    // If user is signed in but doesn't have an organization, redirect to create shop
    if (userId && !orgId) {
      return NextResponse.redirect(createUrl("/create-shop", req, isDev));
    }
  }
  
  // If we're on the main domain and user is signed in with a shop,
  // redirect to dashboard
  const isMainDomain = isDev 
    ? !req.nextUrl.pathname.startsWith("/dashboard")
    : !hostname.startsWith(`${DASHBOARD_SUBDOMAIN}.`);

  if (isMainDomain && userId && orgId) {
    return NextResponse.redirect(createDashboardUrl(req.nextUrl.pathname, req, isDev));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};