"use client";

import { useLoading } from "~/components/loading-provider";
import { LoadingOverlay } from "~/components/loading-overlay";

interface DashboardContentProps {
  children: React.ReactNode;
}

export function DashboardContent({ children }: DashboardContentProps) {
  const { isLoading } = useLoading();

  if (isLoading) {
    return <LoadingOverlay />;
  }

  return <>{children}</>;
} 