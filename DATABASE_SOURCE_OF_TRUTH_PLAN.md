# Database as Single Source of Truth - Implementation Plan

## Overview
This document outlines the plan to make your database the single source of truth for all tRPC API operations, ensuring consistent role and permission management without relying on Clerk's API during request processing.

## Current State Analysis

### ✅ What's Working Well
1. **Webhook System**: Roles are synced from Clerk to database via webhooks
2. **Database Schema**: User model has `role` field for storing normalized roles
3. **Role Utilities**: Good role normalization and permission checking functions
4. **Middleware Structure**: tRPC middleware is set up for database-first approach

### ⚠️ Issues to Address
1. **Prisma Client Types**: TypeScript doesn't recognize the `role` field in User model
2. **Mixed Role Sources**: Some endpoints still check Clerk roles directly
3. **Inconsistent Procedures**: Different routers use different role sources
4. **Missing Webhook Handlers**: Need complete webhook coverage

## Implementation Plan

### Phase 1: Fix Prisma Client Issues
1. **Regenerate Prisma Client**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

2. **Verify Role Field Access**
   - Ensure `role` field is properly typed in Prisma client
   - Test role field queries in database

### Phase 2: Update tRPC Procedures (COMPLETED)
1. **Updated Middleware** ✅
   - `shopProcedure`: Uses database as source of truth
   - `staffProcedure`: Validates staff membership via database
   - `adminProcedure`: Validates admin role via database
   - `teamProcedure`: Team management with database roles

2. **Updated Team Router** ✅
   - All endpoints now use database roles
   - Admin permission checks use `ctx.userRole`
   - Removed Clerk role fallbacks

### Phase 3: Update Remaining Routers
1. **Shop Router** (Needs Update)
   - Replace `getNormalizedRole(ctx.auth.orgRole)` with `ctx.userRole`
   - Use `adminProcedure` for admin-only operations

2. **Transaction Router** (Needs Update)
   - Ensure all operations use database roles
   - Add proper permission checks

3. **Customer Router** (Needs Update)
   - Verify role-based access controls
   - Use database roles for permissions

### Phase 4: Complete Webhook System
1. **Add Missing Webhook Handlers**
   ```typescript
   // In src/app/api/webhooks/route.ts
   case 'organization.deleted':
   case 'organization.updated':
   case 'user.deleted':
   case 'organizationMembership.deleted':
   ```

2. **Enhance Role Sync**
   - Add role validation in webhook handlers
   - Handle edge cases (user leaving org, role changes)

### Phase 5: Add Missing tRPC Endpoints
1. **User Management**
   ```typescript
   // teamRouter additions
   getUserDetails: teamProcedure
   updateUserProfile: teamProcedure
   ```

2. **Shop Management**
   ```typescript
   // shopRouter additions
   getShopMembers: adminProcedure
   updateShopSettings: adminProcedure
   ```

3. **Analytics & Reports**
   ```typescript
   // analyticsRouter (new)
   getDashboardStats: shopProcedure
   getTransactionReports: staffProcedure
   ```

## Code Changes Summary

### Updated Files
1. **src/server/api/trpc.ts** ✅
   - Database-first middleware
   - Role validation via database
   - Simplified context structure

2. **src/server/api/routers/team.ts** ✅
   - Uses `ctx.userRole` for permissions
   - Database as source of truth
   - Immediate database updates for consistency

### Files Needing Updates
1. **src/server/api/routers/shop.ts**
   ```typescript
   // Replace this:
   const userRole = getNormalizedRole(ctx.auth.orgRole);
   
   // With this:
   const userRole = ctx.userRole;
   ```

2. **src/server/api/routers/transaction.ts**
   - Add role-based permission checks
   - Use database roles for staff validation

3. **src/server/api/routers/customer.ts**
   - Verify all operations use database roles
   - Add admin-only operations where needed

## Testing Strategy

### 1. Role Validation Tests
```typescript
// Test that database roles are used
const user = await db.user.findUnique({
  where: { clerkId: 'test-user' },
  select: { role: true }
});
expect(user.role).toBe('admin');
```

### 2. Permission Tests
```typescript
// Test admin-only endpoints
const result = await trpc.team.getMembers.query();
expect(result.members).toBeDefined();
```

### 3. Webhook Sync Tests
```typescript
// Test role sync from Clerk to database
// Verify webhook updates database correctly
```

## Benefits of This Approach

### 1. **Consistency**
- Single source of truth for roles and permissions
- No confusion between Clerk and database states
- Predictable behavior across all endpoints

### 2. **Performance**
- No additional Clerk API calls during request processing
- Faster response times
- Reduced external dependencies

### 3. **Reliability**
- Database transactions ensure data consistency
- Webhook system provides eventual consistency with Clerk
- Fallback mechanisms for edge cases

### 4. **Maintainability**
- Clear separation of concerns
- Easier to debug and test
- Simpler permission logic

## Migration Strategy

### 1. **Gradual Rollout**
- Update one router at a time
- Test thoroughly before moving to next
- Keep legacy procedures for backward compatibility

### 2. **Monitoring**
- Add logging for role checks
- Monitor webhook delivery
- Track permission failures

### 3. **Rollback Plan**
- Keep Clerk role fallbacks temporarily
- Can revert to previous approach if needed
- Database remains authoritative

## Next Steps

1. **Fix Prisma Client Issues** (Priority 1)
   - Resolve TypeScript errors
   - Ensure role field is accessible

2. **Update Remaining Routers** (Priority 2)
   - Shop router
   - Transaction router
   - Customer router

3. **Complete Webhook System** (Priority 3)
   - Add missing handlers
   - Test role sync thoroughly

4. **Add Missing Endpoints** (Priority 4)
   - User management
   - Enhanced analytics
   - Shop settings

## Conclusion

This approach ensures your database is the single source of truth while maintaining synchronization with Clerk via webhooks. The result is a more reliable, performant, and maintainable system that eliminates confusion about role sources and provides consistent behavior across all endpoints. 