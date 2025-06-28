import { useUser } from "@clerk/nextjs";
import { ROLES, hasRolePermission, getNormalizedRole, type Role } from "~/lib/roles";
import { useUnifiedShop } from "./use-unified-shop";

export function useRolePermissions() {
  const { user } = useUser();
  const { hasShop } = useUnifiedShop();
  
  // Get the organization membership role from the user's organization memberships
  const orgRole = user?.organizationMemberships?.[0]?.role ?? null;
  const normalizedRole = getNormalizedRole(orgRole);
  
  // For now, use the Clerk role as the primary source
  // In the future, we could add a separate hook to get database role without TRPC
  const effectiveRole = normalizedRole;
  
  return {
    // Current role information
    orgRole,
    normalizedRole,
    effectiveRole,
    
    // Permission checks
    isAdmin: hasRolePermission(effectiveRole, ROLES.ADMIN),
    isMember: hasRolePermission(effectiveRole, ROLES.MEMBER),
    
    // Helper functions
    hasPermission: (requiredRole: Role) => hasRolePermission(effectiveRole, requiredRole),
    
    // Role constants for easy access
    ROLES,
  };
} 