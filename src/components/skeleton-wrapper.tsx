import { useSkeletonLoading } from "~/hooks/use-skeleton-loading";
import {
  DashboardSkeleton,
  ScannerSkeleton,
  InventorySkeleton,
  CustomersSkeleton,
  TransactionsSkeleton,
  BuylistsSkeleton,
  AnalyticsSkeleton,
  TeamSkeleton,
  SettingsSkeleton,
  ReportsSkeleton,
  StoreCreditSkeleton,
} from "~/components/skeletons";

const skeletonComponents = {
  DashboardSkeleton,
  ScannerSkeleton,
  InventorySkeleton,
  CustomersSkeleton,
  TransactionsSkeleton,
  BuylistsSkeleton,
  AnalyticsSkeleton,
  TeamSkeleton,
  SettingsSkeleton,
  ReportsSkeleton,
  StoreCreditSkeleton,
};

export function SkeletonWrapper({ children }: { children: React.ReactNode }) {
  const { shouldShowSkeleton, skeletonComponent } = useSkeletonLoading();

  if (!shouldShowSkeleton) {
    return <>{children}</>;
  }

  const SkeletonComponent = skeletonComponents[skeletonComponent as keyof typeof skeletonComponents];

  if (!SkeletonComponent) {
    return <>{children}</>;
  }

  return <SkeletonComponent />;
} 