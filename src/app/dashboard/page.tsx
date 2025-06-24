"use client";

import { useOrganization } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { SectionCards } from "~/components/section-cards";
import { DataTable } from "~/components/data-table";
import { ChartAreaInteractive } from "~/components/chart-area-interactive";
import { api } from "~/trpc/react";
import { sampleProducts, salesData, stats } from "./data";

export default function DashboardPage() {
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const router = useRouter();
  
  // Fetch shop statistics using tRPC - only if user has an organization
  const { data: shopStats, isLoading: statsLoading, error: statsError } = api.shop.getStats.useQuery(
    undefined,
    {
      refetchInterval: 30000, // Refetch every 30 seconds
      enabled: !!organization, // Only run query if user has an organization
      retry: 1, // Only retry once to avoid infinite loops
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

  // Show loading state while organization is loading
  if (!orgLoaded) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Loading...</h1>
            <p className="text-muted-foreground">Please wait while we load your dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  // Show setup message if user doesn't have an organization
  if (!organization) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Welcome to TCG Vision!</h1>
            <p className="text-muted-foreground">
              You need to create or join a shop to get started.
            </p>
          </div>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Get Started</h3>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              To use TCG Vision, you need to either create a new shop or join an existing one.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => router.push("/dashboard/create-shop")}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Create Shop
              </button>
              <button className="px-4 py-2 border border-border rounded-md hover:bg-accent">
                Join Shop
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back{organization ? `, ${organization.name}` : ""}!
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
          <h3 className="text-lg font-semibold mb-2">Top Performing Cards</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">{stats.mostSoldCard}</span>
              <span className="text-sm font-medium">Most Sold</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">{stats.mostValuableCard}</span>
              <span className="text-sm font-medium">Most Valuable</span>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div>• 3 cards scanned today</div>
            <div>• 2 transactions completed</div>
            <div>• 1 new customer added</div>
          </div>
        </div>
      </div>
    </div>
  );
} 