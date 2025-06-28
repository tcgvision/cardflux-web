"use client";

import { usePathname } from "next/navigation";
import { useLoading } from "./loading-provider";
import {
  DashboardSkeleton,
  InventorySkeleton,
  ScannerSkeleton,
  AnalyticsSkeleton,
  CustomersSkeleton,
  TransactionsSkeleton,
  SettingsSkeleton,
} from "./skeleton-loaders";

export function SmartLoading() {
  const { isRouteChanging } = useLoading();
  const pathname = usePathname();

  if (!isRouteChanging) {
    return null;
  }

  // Determine which skeleton to show based on the current route
  const getSkeletonForRoute = () => {
    if (pathname.includes("/inventory")) {
      return <InventorySkeleton />;
    }
    if (pathname.includes("/scanner")) {
      return <ScannerSkeleton />;
    }
    if (pathname.includes("/analytics")) {
      return <AnalyticsSkeleton />;
    }
    if (pathname.includes("/customers")) {
      return <CustomersSkeleton />;
    }
    if (pathname.includes("/transactions")) {
      return <TransactionsSkeleton />;
    }
    if (pathname.includes("/settings")) {
      return <SettingsSkeleton />;
    }
    // Default dashboard skeleton for other routes
    return <DashboardSkeleton />;
  };

  return (
    <div className="animate-in fade-in duration-200">
      {getSkeletonForRoute()}
    </div>
  );
} 