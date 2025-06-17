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

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId, orgId } = await auth();
  const url = req.nextUrl;
  const hostname = req.headers.get("host") ?? "";
  
  // Determine if we're in development or production
  const isDev = hostname.includes("localhost");
  
  // Handle dashboard routes
  const isDashboardSubdomain = isDev 
    ? url.pathname.startsWith("/dashboard")
    : hostname.startsWith(`${DASHBOARD_SUBDOMAIN}.`);

  // Skip auth check for public routes and auth routes
  if (isPublicRoute(req) || isAuthRoute(req)) {
    return NextResponse.next();
  }

  // Protect dashboard routes
  if (isDashboardRoute(req)) {
    await auth.protect();
  }

  if (isDashboardSubdomain) {
    // If user is signed in but doesn't have an organization, redirect to create shop
    if (userId && !orgId) {
      const createShopUrl = new URL("/create-shop", req.url);
      if (!isDev) {
        createShopUrl.hostname = PROD_HOST;
      } else {
        createShopUrl.hostname = DEV_HOST;
      }
      return NextResponse.redirect(createShopUrl);
    }
  }
  
  // If we're on the main domain and user is signed in with a shop,
  // redirect to dashboard
  const isMainDomain = isDev 
    ? !url.pathname.startsWith("/dashboard")
    : !hostname.startsWith(`${DASHBOARD_SUBDOMAIN}.`);

  if (isMainDomain && userId && orgId) {
    const dashboardUrl = new URL(url.pathname, req.url);
    if (!isDev) {
      dashboardUrl.hostname = `${DASHBOARD_SUBDOMAIN}.${PROD_HOST}`;
    } else {
      dashboardUrl.hostname = DEV_HOST;
      dashboardUrl.pathname = `/dashboard${url.pathname}`;
    }
    return NextResponse.redirect(dashboardUrl);
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};