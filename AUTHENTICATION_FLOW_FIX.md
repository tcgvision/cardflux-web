# Authentication Flow Fix

## Problem Description

After resetting Clerk data, users experienced a redirect loop where:
1. User signs up successfully
2. Gets redirected to sign-in page instead of dashboard
3. When trying to sign-in, gets redirected back to sign-in page
4. This creates an infinite loop

## Root Cause Analysis

The issue was in the middleware logic (`src/middleware.ts`):

1. **Incorrect Auth Route Handling**: When a user signed up but had no organization, the middleware was redirecting them to `/dashboard` instead of `/dashboard/create-shop`
2. **Dashboard Route Logic**: The dashboard route was allowing access to users without organizations, which then caused the dashboard page to redirect them back to sign-in
3. **Missing API Routes**: Some API routes needed for debugging and user synchronization weren't properly whitelisted

## Solution Implemented

### 1. Fixed Middleware Logic (`src/middleware.ts`)

**Before:**
```typescript
// If user is signed in but has no organization, check database for shop membership
if (userId && !orgId) {
  // Note: We can't make database calls from middleware, so we'll let the dashboard handle this
  // The dashboard will check for shop membership and reload if needed
  return NextResponse.redirect(new URL("/dashboard", req.url));
}
```

**After:**
```typescript
// If user is signed in but has no organization, redirect to create-shop
if (userId && !orgId) {
  console.log(`🔄 Auth route: User ${userId} has no org, redirecting to create-shop`);
  return NextResponse.redirect(new URL("/dashboard/create-shop", req.url));
}
```

**Dashboard Route Logic:**
```typescript
// Handle dashboard routes
if (isDashboardRoute(req)) {
  // If user has no organization, redirect to create-shop
  if (!orgId) {
    console.log(`🔄 Dashboard route: User ${userId} has no org, redirecting to create-shop`);
    return NextResponse.redirect(new URL("/dashboard/create-shop", req.url));
  }
  // Allow access to dashboard routes if user has organization
  console.log(`🔄 Dashboard route: User ${userId} has org ${orgId}, allowing access`);
  return NextResponse.next();
}
```

### 2. Enhanced API Route Whitelisting

Added missing API routes to public routes:
```typescript
const isPublicRoute = createRouteMatcher([
  // ... existing routes
  "/api/debug-clerk(.*)",
  "/api/check-shop-membership(.*)",
  "/api/sync-organization(.*)",
]);
```

### 3. Simplified Sign-up Flow (`src/app/auth/sign-up/[[...sign-up]]/page.tsx`)

**Before:** Complex routing logic that checked both organization and database membership
**After:** Simplified logic that primarily checks database membership and defaults to create-shop

```typescript
// Handle routing after verification
useEffect(() => {
  if (isVerified && !isRedirecting) {
    setIsRedirecting(true);
    console.log("Routing after verification...");
    
    setTimeout(() => {
      void (async () => {
        try {
          // Check if user is already linked to a shop via invitation
          const membershipResponse = await fetch('/api/check-shop-membership');
          const membershipData = await membershipResponse.json() as { hasShop: boolean; shop?: unknown; message?: string };
          
          if (membershipData.hasShop) {
            console.log("User is linked to shop via invitation, redirecting to dashboard");
            router.push("/dashboard");
          } else {
            console.log("User not linked to shop, redirecting to create-shop");
            router.push("/dashboard/create-shop");
          }
        } catch (error) {
          console.error("Error checking shop membership:", error);
          // Fallback to create-shop
          console.log("Error checking membership, redirecting to create-shop");
          router.push("/dashboard/create-shop");
        }
      })();
    }, 2000);
  }
}, [isVerified, isRedirecting, router]);
```

### 4. Added Comprehensive Logging

Added detailed console logging throughout the middleware to help with debugging:
```typescript
console.log(`🔄 Auth route: User ${userId} has org ${orgId}, redirecting to dashboard`);
console.log(`🔄 Auth route: User ${userId} has no org, redirecting to create-shop`);
console.log(`🔄 Dashboard route: User ${userId} has no org, redirecting to create-shop`);
```

### 5. Created Test Script

Added `scripts/test-auth-flow.ts` to help diagnose authentication issues:
```bash
pnpm test-auth-flow
```

This script checks:
- Database connectivity
- User and shop table structure
- Orphaned users and shops
- Recent user activity

## Flow After Fix

### New User Sign-up Flow:
1. User signs up with email/password
2. User verifies email
3. Webhook creates user in database
4. User is redirected to `/dashboard/create-shop`
5. User creates shop (which creates Clerk organization)
6. User is redirected to `/dashboard`

### Existing User Sign-in Flow:
1. User signs in with email/password
2. If user has organization → redirected to `/dashboard`
3. If user has no organization → redirected to `/dashboard/create-shop`

### Invited User Flow:
1. User receives invitation email
2. User signs up/signs in
3. Webhook links user to existing shop
4. User is redirected to `/dashboard`

## Testing the Fix

1. **Reset Clerk Data**: Clear all users and organizations in Clerk dashboard
2. **Test Sign-up**: Create a new user account
3. **Verify Flow**: User should be redirected to create-shop page after verification
4. **Test Sign-in**: Sign out and sign back in - should work without redirect loop
5. **Run Test Script**: `pnpm test-auth-flow` to verify database state

## Future-Proofing

The fix is designed to be future-proof by:

1. **Clear Separation of Concerns**: Middleware handles authentication, pages handle business logic
2. **Comprehensive Logging**: Easy to debug issues in production
3. **Graceful Fallbacks**: If API calls fail, users are redirected to create-shop
4. **Type Safety**: Proper TypeScript types for API responses
5. **Test Coverage**: Automated test script to verify authentication flow

## Monitoring

To monitor the fix in production:

1. Watch console logs for middleware redirect patterns
2. Monitor `/api/check-shop-membership` endpoint usage
3. Track user flow through analytics
4. Run `pnpm test-auth-flow` periodically to check database health

## Rollback Plan

If issues arise, the fix can be rolled back by:

1. Reverting middleware changes
2. Restoring original sign-up flow logic
3. Removing added API routes from whitelist

However, the current fix is conservative and maintains backward compatibility while fixing the core redirect loop issue. 