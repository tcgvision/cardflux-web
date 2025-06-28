// Centralized role definitions to match Clerk dashboard
export const ROLES = {
  ADMIN: "org:admin",
  MEMBER: "org:member",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Role hierarchy for permission checking
export const ROLE_HIERARCHY: Record<Role, number> = {
  [ROLES.ADMIN]: 2,
  [ROLES.MEMBER]: 1,
};

// Helper function to normalize Clerk role by removing organization prefix
export function normalizeRole(role: string | null | undefined): string | null {
  if (!role) return null;
  
  // Remove organization prefix (e.g., "org:admin" -> "admin")
  const normalizedRole = role.replace(/^org:/, "");
  
  // Check if the normalized role is valid
  if (normalizedRole === "admin" || normalizedRole === "member") {
    return normalizedRole;
  }
  
  return null;
}

// Helper function to check if user has required role level
export function hasRolePermission(userRole: string | null | undefined, requiredRole: Role): boolean {
  if (!userRole) return false;
  
  const normalizedUserRole = normalizeRole(userRole);
  const normalizedRequiredRole = normalizeRole(requiredRole);
  
  if (!normalizedUserRole || !normalizedRequiredRole) return false;
  
  const userLevel = normalizedUserRole === "admin" ? 2 : 1;
  const requiredLevel = normalizedRequiredRole === "admin" ? 2 : 1;
  return userLevel >= requiredLevel;
}

// Helper function to validate if a role is valid
export function isValidRole(role: string | null | undefined): role is Role {
  return role === ROLES.ADMIN || role === ROLES.MEMBER;
}

// Helper function to get default role
export function getDefaultRole(): Role {
  return ROLES.MEMBER;
}

// Helper function to get normalized role with fallback
export function getNormalizedRole(role: string | null | undefined): Role {
  if (!role) return ROLES.MEMBER;
  
  // If role is already in the correct format, return it
  if (role === ROLES.ADMIN || role === ROLES.MEMBER) {
    return role;
  }
  
  // If role has org: prefix, return it as is (this is our expected format)
  if (role.startsWith('org:')) {
    const normalizedRole = role as Role;
    if (isValidRole(normalizedRole)) {
      return normalizedRole;
    }
  }
  
  // Fallback to member role
  return ROLES.MEMBER;
}

// Helper function to sync role from Clerk to database
export async function syncRoleToDatabase(
  db: { user: { update: (args: { where: { email: string }; data: { role: string } }) => Promise<unknown> } },
  email: string,
  role: string,
  shopId: string
): Promise<void> {
  try {
    // Store the full role format from Clerk (e.g., "org:admin")
    if (role === "org:admin" || role === "org:member") {
      await db.user.update({
        where: { email },
        data: { role: role },
      });
      
      console.log(`Synced role for ${email}: ${role}`);
    } else {
      console.warn(`Invalid role received from Clerk: ${role}`);
    }
  } catch (error) {
    console.error(`Failed to sync role for ${email}:`, error);
    throw error;
  }
}

// Helper function to get effective role (database first, then Clerk)
export function getEffectiveRole(
  databaseRole: string | null | undefined,
  clerkRole: string | null | undefined
): Role {
  // Prefer database role as source of truth
  if (databaseRole && isValidRole(databaseRole)) {
    return databaseRole;
  }
  
  // Fallback to Clerk role
  if (clerkRole && isValidRole(clerkRole)) {
    return clerkRole;
  }
  
  // Default fallback
  return getDefaultRole();
} 