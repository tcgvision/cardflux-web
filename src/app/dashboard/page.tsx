"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useShopMembership } from "~/hooks/use-shop-membership";
import { useUnifiedShop } from "~/hooks/use-unified-shop";
import { useSyncStatus } from "~/hooks/use-sync-status";
import { SkeletonWrapper } from "~/components/skeleton-wrapper";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { AlertCircle, RefreshCw, ExternalLink } from "lucide-react";
import { SectionCards } from "~/components/section-cards";
import { DataTable } from "~/components/data-table";
import { ChartAreaInteractive } from "~/components/chart-area-interactive";
import { api } from "~/trpc/react";
import { sampleProducts, salesData, stats } from "./data";

interface SyncResponse {
  success?: boolean;
  needsInvitation?: boolean;
  shopName?: string;
  message?: string;
  error?: string;
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { membershipData, isChecking, clearCache } = useShopMembership();
  const { shopName, isLoaded: shopLoaded, hasShop, source, needsSync, isVerified } = useUnifiedShop();
  const { syncReason, syncAction, canAutoSync } = useSyncStatus();
  const [debugInfo, setDebugInfo] = useState<Record<string, unknown> | null>(null);
  const [isLoadingDebug, setIsLoadingDebug] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchDebugInfo = useCallback(async () => {
    setIsLoadingDebug(true);
    try {
      const response = await fetch('/api/debug-clerk');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json() as Record<string, unknown>;
      setDebugInfo(data);
    } catch (error) {
      console.error("Failed to fetch debug info:", error);
      setDebugInfo({ error: "Failed to fetch debug info" });
    } finally {
      setIsLoadingDebug(false);
    }
  }, []);

  const syncOrganization = useCallback(async () => {
    setIsSyncing(true);
    try {
      // Clear cache before syncing to ensure fresh data
      clearCache();
      
      const response = await fetch('/api/sync-organization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json() as SyncResponse;
      
      if (data.success) {
        // Refresh the page to update Clerk context
        window.location.reload();
      } else if (data.needsInvitation) {
        // Show message that user needs to accept invitation
        alert(`You need to accept the invitation to join "${data.shopName}". Please check your email.`);
      } else if (data.error) {
        alert(`Sync failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Failed to sync organization:", error);
      alert("Failed to sync organization. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  }, [clearCache]);

  // Fetch shop statistics using tRPC - only if user has shop membership
  const { data: shopStats, isLoading: statsLoading, error: statsError } = api.shop.getStats.useQuery(
    undefined,
    {
      refetchInterval: 30000, // Refetch every 30 seconds
      enabled: hasShop, // Run query if user has shop membership
      retry: 1, // Only retry once to avoid infinite loops
      staleTime: 10000, // Consider data fresh for 10 seconds
    }
  );

  // Transform data for the new components
  const transformedStats = {
    totalRevenue: shopStats?.totalRevenue ?? stats.totalSales,
    newCustomers: shopStats?.customerCount ?? 0,
    activeInventory: shopStats?.productCount ?? stats.totalInventory,
    growthRate: 12.5, // This would be calculated from historical data
  };

  // Transform inventory data for the data table
  const tableData = sampleProducts.map((product, index) => ({
    id: index + 1,
    header: product.name,
    type: product.set,
    status: product.quantity > 0 ? "In Stock" : "Out of Stock",
    target: product.quantity.toString(),
    limit: product.price.toString(),
    reviewer: product.condition,
  }));

  // Show loading while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show sign-in if not authenticated
  if (!user) {
    router.push("/sign-in");
    return null;
  }

  // Show create shop if no organization and no database membership
  if (!hasShop && !isChecking && shopLoaded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Welcome to Card Flux</CardTitle>
            <CardDescription>
              You need to join a shop to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You don&apos;t have access to any shops yet. Please check your email for an invitation or contact your shop administrator.
            </p>
            <Button 
              onClick={() => router.push("/create-shop")}
              className="w-full"
            >
              Create New Shop
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show organization sync issue only if user is not verified and sync is actually needed
  if (needsSync && hasShop && !isVerified && syncReason) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Organization Sync Required
            </CardTitle>
            <CardDescription>
              Your account is linked to &quot;{shopName}&quot; in our database, but there&apos;s a sync issue with your organization membership.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Status:</strong> {syncReason}
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <h4 className="font-medium">Solutions to try:</h4>
              
              {syncAction === "invitation" && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">1. Accept the invitation email</p>
                  <p className="text-sm text-muted-foreground">
                    Check your email for the invitation from &quot;{shopName}&quot; and click the acceptance link.
                  </p>
                </div>
              )}

              {syncAction === "refresh" && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">1. Sync Organization</p>
                  <p className="text-sm text-muted-foreground">
                    Try to automatically sync your organization membership:
                  </p>
                  <Button 
                    onClick={syncOrganization}
                    disabled={isSyncing}
                    className="w-full"
                  >
                    {isSyncing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sync Organization
                      </>
                    )}
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium">2. Manual organization refresh</p>
                <p className="text-sm text-muted-foreground">
                  Try refreshing your Clerk session by signing out and back in.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    window.location.href = "/sign-out";
                  }}
                  className="w-full"
                >
                  Sign Out and Sign Back In
                </Button>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">3. Debug information</p>
                <p className="text-sm text-muted-foreground">
                  Check your current Clerk organization status:
                </p>
                <Button 
                  variant="outline" 
                  onClick={fetchDebugInfo}
                  disabled={isLoadingDebug}
                  className="w-full"
                >
                  {isLoadingDebug ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Check Clerk Status
                    </>
                  )}
                </Button>
              </div>
            </div>

            {debugInfo && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Debug Information:</h4>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            )}

            <div className="pt-4 border-t">
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error
  if (membershipData?.error && !isVerified) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">{membershipData.error}</p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Wrap the dashboard content with skeleton loading
  return (
    <SkeletonWrapper>
      <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back, {shopName}!
            </h1>
            <p className="text-muted-foreground">
              Here&apos;s what&apos;s happening with your TCG business today.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <SectionCards 
          totalRevenue={transformedStats.totalRevenue}
          newCustomers={transformedStats.newCustomers}
          activeInventory={transformedStats.activeInventory}
          growthRate={transformedStats.growthRate}
        />

        {/* Charts Section */}
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartAreaInteractive data={salesData} />
          <div className="rounded-lg border bg-card">
            <div className="p-6">
              <h3 className="text-lg font-semibold">Recent Sales Activity</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Sales and scans over the last 30 days
              </p>
              <div className="space-y-4">
                {salesData.slice(-5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.date}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.sales} sales, {item.scans} scans
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${item.sales * 25}</p>
                      <p className="text-sm text-muted-foreground">
                        {((item.sales / Math.max(...salesData.map(d => d.sales))) * 100).toFixed(0)}% of peak
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="rounded-lg border bg-card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Inventory Overview</h3>
              <p className="text-sm text-muted-foreground">
                {stats.totalInventory} items in stock
              </p>
            </div>
            <DataTable data={tableData} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left p-2 rounded hover:bg-accent transition-colors">
                📷 Scan New Cards
              </button>
              <button className="w-full text-left p-2 rounded hover:bg-accent transition-colors">
                👥 Add Customer
              </button>
              <button className="w-full text-left p-2 rounded hover:bg-accent transition-colors">
                💰 Create Transaction
              </button>
            </div>
          </div>
          
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• New customer John D. added</p>
              <p>• Inventory updated for Pokemon cards</p>
              <p>• Transaction #1234 completed</p>
            </div>
          </div>
          
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-2">Alerts</h3>
            <div className="space-y-2 text-sm">
              <p className="text-amber-600">⚠️ Low stock: 5 items</p>
              <p className="text-green-600">✅ Backup completed</p>
              <p className="text-blue-600">ℹ️ Price sync available</p>
            </div>
          </div>
        </div>
      </div>
    </SkeletonWrapper>
  );
} 