// Billing guard disabled for landing page deployment
// TODO: Restore from billing-guard.tsx.bak after deployment

import type { ReactNode } from "react";

interface BillingGuardProps {
  children: ReactNode;
  requiredPlan?: string;
  feature?: string;
}

export function BillingGuard({ children }: BillingGuardProps) {
  // Just render children without any billing checks
  return <>{children}</>;
}
