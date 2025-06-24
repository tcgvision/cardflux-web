import { useUser } from "@clerk/nextjs";
import { ROLES, hasRolePermission, getNormalizedRole, type Role } from "~/lib/roles";

export function useRolePermissions() {
  const { user } = useUser();
  
  // Get the organization membership role from the user's organization memberships
  const orgRole = user?.organizationMemberships?.[0]?.role ?? null;
  const normalizedRole = getNormalizedRole(orgRole);
  
  return {
    // Current role information
    orgRole,
    normalizedRole,
    
    // Permission checks
    isAdmin: hasRolePermission(orgRole, ROLES.ADMIN),
    isMember: hasRolePermission(orgRole, ROLES.MEMBER),
    
    // Helper functions
    hasPermission: (requiredRole: Role) => hasRolePermission(orgRole, requiredRole),
    
    // Role constants for easy access
    ROLES,
  };
} 