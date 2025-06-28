// Centralized role definitions to match Clerk dashboard
export const ROLES = {
  ADMIN: "admin",
  MEMBER: "member",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Role hierarchy for permission checking
export const ROLE_HIERARCHY: Record<Role, number> = {
  [ROLES.ADMIN]: 2,
  [ROLES.MEMBER]: 1,
};

// Helper function to normalize Clerk role by removing organization prefix
export function normalizeRole(role: string | null | undefined): Role | null {
  if (!role) return null;
  
  // Remove organization prefix (e.g., "org:admin" -> "admin")
  const normalizedRole = role.replace(/^org:/, "");
  
  // Check if the normalized role is valid
  if (normalizedRole === ROLES.ADMIN || normalizedRole === ROLES.MEMBER) {
    return normalizedRole as Role;
  }
  
  return null;
}

// Helper function to check if user has required role level
export function hasRolePermission(userRole: string | null | undefined, requiredRole: Role): boolean {
  if (!userRole) return false;
  
  const normalizedUserRole = normalizeRole(userRole);
  if (!normalizedUserRole) return false;
  
  const userLevel = ROLE_HIERARCHY[normalizedUserRole];
  const requiredLevel = ROLE_HIERARCHY[requiredRole];
  return userLevel >= requiredLevel;
}

// Helper function to validate if a role is valid
export function isValidRole(role: string | null | undefined): role is Role {
  const normalizedRole = normalizeRole(role);
  return normalizedRole !== null;
}

// Helper function to get default role
export function getDefaultRole(): Role {
  return ROLES.MEMBER;
}

// Helper function to get normalized role with fallback
export function getNormalizedRole(role: string | null | undefined): Role {
  const normalizedRole = normalizeRole(role);
  return normalizedRole ?? getDefaultRole();
}

// Helper function to sync role from Clerk to database
export async function syncRoleToDatabase(
  db: any, // Prisma client
  email: string,
  role: string,
  shopId: string
): Promise<void> {
  try {
    const normalizedRole = normalizeRole(role);
    if (!normalizedRole) {
      console.warn(`Invalid role received from Clerk: ${role}`);
      return;
    }

    await db.user.update({
      where: { email },
      data: { role: normalizedRole },
    });
    
    console.log(`Synced role for ${email}: ${role} -> ${normalizedRole}`);
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
  if (databaseRole) {
    const normalizedDbRole = normalizeRole(databaseRole);
    if (normalizedDbRole) {
      return normalizedDbRole;
    }
  }
  
  // Fallback to Clerk role
  if (clerkRole) {
    const normalizedClerkRole = normalizeRole(clerkRole);
    if (normalizedClerkRole) {
      return normalizedClerkRole;
    }
  }
  
  // Default fallback
  return getDefaultRole();
} 