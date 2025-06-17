import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Constants for environment-specific configuration
const DEV_HOST = "localhost:3000";
const PROD_HOST = "tcgvision.com";
const DASHBOARD_SUBDOMAIN = "dashboard";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware

// const isProtectedRoute = createRouteMatcher(["/enterprise(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn, orgId } = await auth();
  const url = req.nextUrl;
  const hostname = req.headers.get("host") ?? "";
  
  // Determine if we're in development or production
  const isDev = hostname.includes("localhost");
  
  // Handle dashboard routes
  const isDashboardRoute = isDev 
    ? url.pathname.startsWith("/dashboard")
    : hostname.startsWith(`${DASHBOARD_SUBDOMAIN}.`);

  if (isDashboardRoute) {
    // If user is not signed in, redirect to main site
    if (!userId) {
      const signInUrl = new URL("/", req.url);
      if (!isDev) {
        signInUrl.hostname = PROD_HOST;
      } else {
        signInUrl.hostname = DEV_HOST;
      }
      return redirectToSignIn();
    }

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
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};