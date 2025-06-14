import { clerkMiddleware, getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export default clerkMiddleware((auth, req) => {
  // Handle subdomain routing
  const url = req.nextUrl;
  const hostname = req.headers.get("host") ?? "";
  const isLocalhost = hostname.includes("localhost");
  const subdomain = isLocalhost 
    ? hostname.split(":")[0] 
    : hostname.split(".")[0];
  
  // If we're on the enterprise subdomain or enterprise path
  if (subdomain === "enterprise" || (isLocalhost && url.pathname.startsWith("/enterprise"))) {
    // If user is not signed in, redirect to main site
    if (!auth.userId) {
      const signInUrl = new URL("/", req.url);
      if (!isLocalhost) {
        signInUrl.hostname = "tcgvision.com";
      }
      return NextResponse.redirect(signInUrl);
    }
    
    // If user is signed in but doesn't have an organization, redirect to create shop
    if (auth.userId && !auth.orgId) {
      const createShopUrl = new URL("/create-shop", req.url);
      if (!isLocalhost) {
        createShopUrl.hostname = "tcgvision.com";
      }
      return NextResponse.redirect(createShopUrl);
    }

    // If user is signed in and has an organization but is not a member of the current org
    if (auth.userId && auth.orgId && auth.orgId !== auth.org?.id) {
      const mainSiteUrl = new URL("/", req.url);
      if (!isLocalhost) {
        mainSiteUrl.hostname = "tcgvision.com";
      }
      return NextResponse.redirect(mainSiteUrl);
    }
  }
  
  // If we're on the main domain and user is signed in with a shop,
  // redirect to enterprise subdomain
  if ((subdomain === "tcgvision" || isLocalhost) && auth.userId && auth.orgId) {
    const enterpriseUrl = new URL(url.pathname, req.url);
    if (!isLocalhost) {
      enterpriseUrl.hostname = "enterprise.tcgvision.com";
    } else {
      enterpriseUrl.pathname = `/enterprise${url.pathname}`;
    }
    return NextResponse.redirect(enterpriseUrl);
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};