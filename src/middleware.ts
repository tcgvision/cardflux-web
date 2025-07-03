import { clerkMiddleware } from "@clerk/nextjs/server";

// Export the middleware
export default clerkMiddleware();

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};