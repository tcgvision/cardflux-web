import { z } from "zod";
import { createTRPCRouter, protectedProcedure, shopProcedure } from "~/server/api/trpc";
import { ROLES, hasRolePermission, getDefaultRole, isValidRole, normalizeRole, getNormalizedRole } from "~/lib/roles";

export const debugRouter = createTRPCRouter({
  // Debug endpoint to check what role data is available
  getRoleInfo: protectedProcedure.query(async ({ ctx }) => {
    const normalizedRole = getNormalizedRole(ctx.auth.orgRole);
    
    return {
      userId: ctx.auth.userId,
      orgId: ctx.auth.orgId,
      orgRole: ctx.auth.orgRole,
      normalizedRole: normalizeRole(ctx.auth.orgRole),
      effectiveRole: normalizedRole,
      isRoleValid: isValidRole(ctx.auth.orgRole),
      defaultRole: getDefaultRole(),
      hasAdminPermission: hasRolePermission(ctx.auth.orgRole, ROLES.ADMIN),
      hasMemberPermission: hasRolePermission(ctx.auth.orgRole, ROLES.MEMBER),
      roleHierarchy: {
        admin: 2,
        member: 1,
      },
      debug: {
        orgRoleType: typeof ctx.auth.orgRole,
        orgRoleValue: ctx.auth.orgRole,
        normalizedRoleValue: normalizeRole(ctx.auth.orgRole),
        userLevel: normalizedRole ? (ROLES.ADMIN === normalizedRole ? 2 : ROLES.MEMBER === normalizedRole ? 1 : 0) : 0,
        requiredAdminLevel: 2,
        requiredMemberLevel: 1,
      },
    };
  }),

  // Debug endpoint for shop context
  getShopRoleInfo: shopProcedure.query(async ({ ctx }) => {
    const normalizedRole = getNormalizedRole(ctx.auth.orgRole);
    
    return {
      userId: ctx.auth.userId,
      orgId: ctx.auth.orgId,
      orgRole: ctx.auth.orgRole,
      normalizedRole: normalizeRole(ctx.auth.orgRole),
      effectiveRole: normalizedRole,
      shopId: ctx.shop.id,
      shopName: ctx.shop.name,
      userShopId: ctx.user.shopId,
      isRoleValid: isValidRole(ctx.auth.orgRole),
      defaultRole: getDefaultRole(),
      hasAdminPermission: hasRolePermission(ctx.auth.orgRole, ROLES.ADMIN),
      hasMemberPermission: hasRolePermission(ctx.auth.orgRole, ROLES.MEMBER),
      roleHierarchy: {
        admin: 2,
        member: 1,
      },
      debug: {
        orgRoleType: typeof ctx.auth.orgRole,
        orgRoleValue: ctx.auth.orgRole,
        normalizedRoleValue: normalizeRole(ctx.auth.orgRole),
        userLevel: normalizedRole ? (ROLES.ADMIN === normalizedRole ? 2 : ROLES.MEMBER === normalizedRole ? 1 : 0) : 0,
        requiredAdminLevel: 2,
        requiredMemberLevel: 1,
      },
    };
  }),

  // Test admin-only endpoint
  testAdminAccess: shopProcedure.query(async ({ ctx }) => {
    const normalizedRole = getNormalizedRole(ctx.auth.orgRole);
    
    if (!hasRolePermission(ctx.auth.orgRole, ROLES.ADMIN)) {
      throw new Error(`Admin access required. User role: ${ctx.auth.orgRole ?? 'null/undefined'}, Normalized role: ${normalizeRole(ctx.auth.orgRole)}, Effective role: ${normalizedRole}`);
    }

    return {
      success: true,
      message: "Admin access granted",
      userRole: ctx.auth.orgRole,
      normalizedRole: normalizeRole(ctx.auth.orgRole),
      effectiveRole: normalizedRole,
      timestamp: new Date().toISOString(),
    };
  }),

  // Test member-only endpoint - this should always pass for valid users
  testMemberAccess: shopProcedure.query(async ({ ctx }) => {
    const normalizedRole = getNormalizedRole(ctx.auth.orgRole);
    
    // Since both admin and member should have member access, this should always pass
    // unless the user has no role at all
    if (!ctx.auth.orgRole && !isValidRole(ctx.auth.orgRole)) {
      throw new Error(`Member access required. User role: ${ctx.auth.orgRole ?? 'null/undefined'}, Normalized role: ${normalizeRole(ctx.auth.orgRole)}, Effective role: ${normalizedRole}`);
    }

    return {
      success: true,
      message: "Member access granted",
      userRole: ctx.auth.orgRole,
      normalizedRole: normalizeRole(ctx.auth.orgRole),
      effectiveRole: normalizedRole,
      timestamp: new Date().toISOString(),
    };
  }),

  // Test basic access - should work for any authenticated user
  testBasicAccess: protectedProcedure.query(async ({ ctx }) => {
    return {
      success: true,
      message: "Basic access granted",
      userRole: ctx.auth.orgRole,
      normalizedRole: normalizeRole(ctx.auth.orgRole),
      effectiveRole: getNormalizedRole(ctx.auth.orgRole),
      timestamp: new Date().toISOString(),
    };
  }),
}); 