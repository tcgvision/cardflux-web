import { z } from "zod";
import { createTRPCRouter, protectedProcedure, shopProcedure } from "~/server/api/trpc";
import { ROLES, hasRolePermission, getDefaultRole, isValidRole, normalizeRole, getNormalizedRole } from "~/lib/roles";

export const debugRouter = createTRPCRouter({
  // Debug endpoint to check what role data is available
  getRoleInfo: protectedProcedure.query(async ({ ctx }) => {
    // For protectedProcedure, we only have access to Clerk role
    const clerkRole = ctx.auth.orgRole;
    const normalizedClerkRole = getNormalizedRole(clerkRole);
    
    return {
      userId: ctx.auth.userId,
      orgId: ctx.auth.orgId,
      clerkRole: clerkRole, // Raw Clerk role (e.g., "org:admin")
      normalizedClerkRole: normalizeRole(clerkRole),
      databaseRole: "not_available", // Not available in protectedProcedure
      effectiveRole: normalizedClerkRole, // Use Clerk role as fallback
      isRoleValid: isValidRole(clerkRole),
      defaultRole: getDefaultRole(),
      hasAdminPermission: hasRolePermission(normalizedClerkRole, ROLES.ADMIN),
      hasMemberPermission: hasRolePermission(normalizedClerkRole, ROLES.MEMBER),
      roleHierarchy: {
        admin: 2,
        member: 1,
      },
      debug: {
        clerkRoleType: typeof clerkRole,
        clerkRoleValue: clerkRole,
        normalizedClerkRoleValue: normalizeRole(clerkRole),
        databaseRoleValue: "not_available",
        userLevel: normalizedClerkRole ? (ROLES.ADMIN === normalizedClerkRole ? 2 : ROLES.MEMBER === normalizedClerkRole ? 1 : 0) : 0,
        requiredAdminLevel: 2,
        requiredMemberLevel: 1,
      },
    };
  }),

  // Debug endpoint for shop context
  getShopRoleInfo: shopProcedure.query(async ({ ctx }) => {
    // Use database role as source of truth
    const dbRole = ctx.userRole;
    const clerkRole = ctx.auth.orgRole;
    
    return {
      userId: ctx.auth.userId,
      orgId: ctx.auth.orgId,
      clerkRole: clerkRole, // Raw Clerk role (e.g., "org:admin")
      normalizedClerkRole: normalizeRole(clerkRole),
      databaseRole: dbRole, // Database role (e.g., "admin")
      effectiveRole: dbRole, // Database role as source of truth
      shopId: ctx.shop.id,
      shopName: ctx.shop.name,
      userShopId: ctx.user.shopId,
      isRoleValid: isValidRole(clerkRole),
      defaultRole: getDefaultRole(),
      hasAdminPermission: hasRolePermission(dbRole, ROLES.ADMIN),
      hasMemberPermission: hasRolePermission(dbRole, ROLES.MEMBER),
      roleHierarchy: {
        admin: 2,
        member: 1,
      },
      debug: {
        clerkRoleType: typeof clerkRole,
        clerkRoleValue: clerkRole,
        normalizedClerkRoleValue: normalizeRole(clerkRole),
        databaseRoleValue: dbRole,
        userLevel: dbRole ? (ROLES.ADMIN === dbRole ? 2 : ROLES.MEMBER === dbRole ? 1 : 0) : 0,
        requiredAdminLevel: 2,
        requiredMemberLevel: 1,
      },
    };
  }),

  // Test admin-only endpoint
  testAdminAccess: shopProcedure.query(async ({ ctx }) => {
    const dbRole = ctx.userRole;
    
    if (!hasRolePermission(dbRole, ROLES.ADMIN)) {
      throw new Error(`Admin access required. Database role: ${String(dbRole ?? 'null/undefined')}, Clerk role: ${String(ctx.auth.orgRole ?? 'null/undefined')}`);
    }

    return {
      success: true,
      message: "Admin access granted",
      clerkRole: ctx.auth.orgRole,
      databaseRole: dbRole,
      effectiveRole: dbRole,
      timestamp: new Date().toISOString(),
    };
  }),

  // Test member-only endpoint - this should always pass for valid users
  testMemberAccess: shopProcedure.query(async ({ ctx }) => {
    const dbRole = ctx.userRole;
    
    // Since both admin and member should have member access, this should always pass
    // unless the user has no role at all
    if (!dbRole && !isValidRole(dbRole)) {
      throw new Error(`Member access required. Database role: ${String(dbRole ?? 'null/undefined')}, Clerk role: ${String(ctx.auth.orgRole ?? 'null/undefined')}`);
    }

    return {
      success: true,
      message: "Member access granted",
      clerkRole: ctx.auth.orgRole,
      databaseRole: dbRole,
      effectiveRole: dbRole,
      timestamp: new Date().toISOString(),
    };
  }),

  // Test basic access - should work for any authenticated user
  testBasicAccess: protectedProcedure.query(async ({ ctx }) => {
    const clerkRole = ctx.auth.orgRole;
    const normalizedClerkRole = getNormalizedRole(clerkRole);
    
    return {
      success: true,
      message: "Basic access granted",
      clerkRole: clerkRole,
      databaseRole: "not_available", // Not available in protectedProcedure
      effectiveRole: normalizedClerkRole,
      timestamp: new Date().toISOString(),
    };
  }),
}); 