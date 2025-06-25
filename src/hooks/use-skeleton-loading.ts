import { usePathname } from "next/navigation";
import { useShopMembership } from "./use-shop-membership";
import { useUnifiedShop } from "./use-unified-shop";

export function useSkeletonLoading() {
  const pathname = usePathname();
  const { isChecking } = useShopMembership();
  const { isLoaded: shopLoaded, isVerified } = useUnifiedShop();

  // Show skeleton if:
  // 1. Checking membership and user is not verified
  // 2. Shop data is not loaded and user is not verified
  const shouldShowSkeleton = (isChecking || !shopLoaded) && !isVerified;

  // Get the appropriate skeleton component based on the current route
  const getSkeletonComponent = () => {
    if (!shouldShowSkeleton) return null;

    // Map routes to skeleton components
    const routeSkeletonMap: Record<string, string> = {
      "/dashboard": "DashboardSkeleton",
      "/dashboard/scanner": "ScannerSkeleton",
      "/dashboard/inventory": "InventorySkeleton",
      "/dashboard/customers": "CustomersSkeleton",
      "/dashboard/transactions": "TransactionsSkeleton",
      "/dashboard/buylists": "BuylistsSkeleton",
      "/dashboard/analytics": "AnalyticsSkeleton",
      "/dashboard/team": "TeamSkeleton",
      "/dashboard/settings": "SettingsSkeleton",
      "/dashboard/reports": "ReportsSkeleton",
      "/dashboard/store-credit": "StoreCreditSkeleton",
    };

    return routeSkeletonMap[pathname] || "DashboardSkeleton";
  };

  return {
    shouldShowSkeleton,
    skeletonComponent: getSkeletonComponent(),
    isChecking,
    shopLoaded,
    isVerified,
  };
} 