import { useUser } from "@clerk/nextjs";
import { ROLES, hasRolePermission, getNormalizedRole, type Role } from "~/lib/roles";
import { api } from "~/trpc/react";

export function useRolePermissions() {
  const { user } = useUser();
  
  // Get the organization membership role from the user's organization memberships
  const orgRole = user?.organizationMemberships?.[0]?.role ?? null;
  const normalizedRole = getNormalizedRole(orgRole);
  
  // Get database role as fallback
  const { data: userRoleData } = api.team.getCurrentUserRole.useQuery(undefined, {
    enabled: !!user,
    retry: false,
  });
  
  // Use database role as primary source of truth, fallback to Clerk role
  const effectiveRole = userRoleData?.role ?? normalizedRole ?? ROLES.MEMBER;
  
  return {
    // Current role information
    orgRole,
    normalizedRole,
    databaseRole: userRoleData?.role,
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