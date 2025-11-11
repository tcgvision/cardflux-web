// Roles module disabled for landing page deployment
// TODO: Restore from roles.ts.bak after deployment

export type Role = string;

export const ROLES = {
  ADMIN: "org:admin" as const,
  MEMBER: "org:member" as const,
};

export function getNormalizedRole(role: string | null | undefined): Role | null {
  return role || null;
}

export function hasRolePermission(userRole: Role | null, requiredRole: string): boolean {
  return false;
}
