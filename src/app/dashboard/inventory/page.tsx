"use client";

import { useState } from "react";
import { Plus, Search, Filter, Download, Upload, Database, TrendingUp, AlertTriangle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { api } from "~/trpc/react";
import { DataTable } from "~/components/data-table";

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSet, setSelectedSet] = useState<string>("all");
  const [selectedRarity, setSelectedRarity] = useState<string>("all");
  const [selectedCondition, setSelectedCondition] = useState<string>("all");

  // Fetch inventory data
  const { data: inventoryData, isLoading } = api.product.getAll.useQuery({
    search: searchQuery || undefined,
    limit: 100,
  });

  // Mock inventory stats
  const inventoryStats = {
    totalProducts: 156,
    totalValue: 2847.50,
    lowStockItems: 12,
    outOfStockItems: 3,
    recentAdditions: 8,
  };

  // Transform data for the data table
  const tableData = inventoryData?.products.map((product, index) => ({
    id: index + 1,
    header: product.name,
    type: product.setName || product.setCode || "Unknown Set",
    status: product.inventoryItems?.[0]?.quantity > 0 ? "In Stock" : "Out of Stock",
    target: product.inventoryItems?.[0]?.quantity?.toString() || "0",
    limit: product.marketPrice?.toString() || "N/A",
    reviewer: product.rarity || "Unknown",
  })) || [];

  const filteredData = tableData.filter(item => {
    if (selectedSet !== "all" && !item.type.includes(selectedSet)) return false;
    if (selectedRarity !== "all" && item.reviewer !== selectedRarity) return false;
    if (selectedCondition !== "all") return false; // Add condition filtering logic
    return true;
  });

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">
            Manage your card inventory, track stock levels, and monitor product performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryStats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              +{inventoryStats.recentAdditions} this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${inventoryStats.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryStats.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Needs restocking
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{inventoryStats.outOfStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Urgent restock needed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Additions</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryStats.recentAdditions}</div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Filters */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Set</label>
              <Select value={selectedSet} onValueChange={setSelectedSet}>
                <SelectTrigger>
                  <SelectValue placeholder="Select set" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sets</SelectItem>
                  <SelectItem value="OP06">OP06 - Awakening of the New Era</SelectItem>
                  <SelectItem value="OP05">OP05 - Awakening of the New Era</SelectItem>
                  <SelectItem value="OP04">OP04 - Awakening of the New Era</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Rarity</label>
              <Select value={selectedRarity} onValueChange={setSelectedRarity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select rarity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rarities</SelectItem>
                  <SelectItem value="Leader">Leader</SelectItem>
                  <SelectItem value="SR">SR</SelectItem>
                  <SelectItem value="UC">UC</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Condition</label>
              <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Conditions</SelectItem>
                  <SelectItem value="NM">Near Mint</SelectItem>
                  <SelectItem value="LP">Lightly Played</SelectItem>
                  <SelectItem value="MP">Moderately Played</SelectItem>
                  <SelectItem value="HP">Heavily Played</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" className="w-full">
              Clear Filters
            </Button>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Product Inventory</CardTitle>
                <CardDescription>
                  {filteredData.length} products found
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {inventoryStats.totalProducts} total
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Loading inventory...</p>
                </div>
              </div>
            ) : (
              <DataTable data={filteredData} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common inventory management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <Plus className="h-6 w-6" />
              <span>Add Product</span>
              <span className="text-xs text-muted-foreground">
                Manually add new cards
              </span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <Upload className="h-6 w-6" />
              <span>Bulk Import</span>
              <span className="text-xs text-muted-foreground">
                Import from CSV/Excel
              </span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <Download className="h-6 w-6" />
              <span>Export Data</span>
              <span className="text-xs text-muted-foreground">
                Download inventory report
              </span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <AlertTriangle className="h-6 w-6" />
              <span>Low Stock Alert</span>
              <span className="text-xs text-muted-foreground">
                {inventoryStats.lowStockItems} items need attention
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 