import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// This Middleware does not protect any routes by default.
// See https://clerk.com/docs/references/nextjs/clerk-middleware for more information about configuring your Middleware
// export default clerkMiddleware()

const isProtectedRoute = createRouteMatcher([
  '/',
  '/posts(.*)',
  // Add other protected routes
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  
  if (isProtectedRoute(req) && userId) {
    // Check if user has organization membership
    const response = await fetch(`${process.env.CLERK_SECRET_KEY}/users/${userId}/organization_memberships`, {
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    });
    
    const memberships = await response.json();
    
    if (memberships.length === 0 && req.nextUrl.pathname !== '/create-shop') {
      return NextResponse.redirect(new URL('/create-shop', req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}