"use client";

import { useRolePermissions } from "~/hooks/use-role-permissions";
import { type Role } from "~/lib/roles";

interface RoleGateProps {
  children: React.ReactNode;
  allowedRoles: Role[];
  fallback?: React.ReactNode;
}

export function RoleGate({ children, allowedRoles, fallback }: RoleGateProps) {
  const { hasPermission } = useRolePermissions();
  
  // Check if user has any of the allowed roles
  const hasAccess = allowedRoles.some(role => hasPermission(role));
  
  if (!hasAccess) {
    return fallback ? <>{fallback}</> : null;
  }
  
  return <>{children}</>;
}

// Convenience components for common role checks
export function AdminOnly({ children, fallback }: Omit<RoleGateProps, "allowedRoles">) {
  return (
    <RoleGate allowedRoles={["admin" as Role]} fallback={fallback}>
      {children}
    </RoleGate>
  );
}

export function MemberOrAdmin({ children, fallback }: Omit<RoleGateProps, "allowedRoles">) {
  return (
    <RoleGate allowedRoles={["member" as Role, "admin" as Role]} fallback={fallback}>
      {children}
    </RoleGate>
  );
} 