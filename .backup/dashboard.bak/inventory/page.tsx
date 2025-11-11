"use client";

import { useState } from "react";
import { Plus, Search, Filter, Download, Upload, Database, TrendingUp, AlertTriangle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { DataTable } from "~/components/data-table";
import { DashboardLayoutWrapper } from "~/components/dashboard-layout-wrapper";

// Mock data for inventory
const mockInventoryData = [
  {
    id: 1,
    name: "Monkey D. Luffy",
    setName: "OP06 - Awakening of the New Era",
    setCode: "OP06",
    rarity: "Leader",
    quantity: 15,
    marketPrice: 25.99,
    condition: "Near Mint"
  },
  {
    id: 2,
    name: "Roronoa Zoro",
    setName: "OP06 - Awakening of the New Era",
    setCode: "OP06",
    rarity: "SR",
    quantity: 8,
    marketPrice: 18.50,
    condition: "Near Mint"
  },
  {
    id: 3,
    name: "Nami",
    setName: "OP05 - Awakening of the New Era",
    setCode: "OP05",
    rarity: "UC",
    quantity: 22,
    marketPrice: 3.99,
    condition: "Near Mint"
  },
  {
    id: 4,
    name: "Sanji",
    setName: "OP06 - Awakening of the New Era",
    setCode: "OP06",
    rarity: "SR",
    quantity: 0,
    marketPrice: 12.75,
    condition: "Near Mint"
  },
  {
    id: 5,
    name: "Usopp",
    setName: "OP05 - Awakening of the New Era",
    setCode: "OP05",
    rarity: "C",
    quantity: 1,
    marketPrice: 1.25,
    condition: "Near Mint"
  },
  {
    id: 6,
    name: "Tony Tony Chopper",
    setName: "OP04 - Awakening of the New Era",
    setCode: "OP04",
    rarity: "UC",
    quantity: 3,
    marketPrice: 2.50,
    condition: "Near Mint"
  }
];

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSet, setSelectedSet] = useState<string>("all");
  const [selectedRarity, setSelectedRarity] = useState<string>("all");
  const [selectedCondition, setSelectedCondition] = useState<string>("all");

  // Mock inventory stats
  const inventoryStats = {
    totalProducts: 156,
    totalValue: 2847.50,
    lowStockItems: 12,
    outOfStockItems: 3,
    recentAdditions: 8,
  };

  // Transform data for the data table
  const tableData = mockInventoryData.map((product) => ({
    id: product.id,
    header: product.name,
    type: product.setName || product.setCode || "Unknown Set",
    status: product.quantity > 0 ? "In Stock" : "Out of Stock",
    target: product.quantity.toString(),
    limit: product.marketPrice.toString(),
    reviewer: product.rarity || "Unknown",
  }));

  const filteredData = tableData.filter((item) => {
    if (selectedSet !== "all" && !item.type.includes(selectedSet)) return false;
    if (selectedRarity !== "all" && item.reviewer !== selectedRarity) return false;
    if (selectedCondition !== "all") return false; // Add condition filtering logic
    return true;
  });

  return (
    <DashboardLayoutWrapper>
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
        <Tabs defaultValue="all" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All Items</TabsTrigger>
              <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
              <TabsTrigger value="out-of-stock">Out of Stock</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="space-y-4">
            {/* Filters and Search */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-2">
                <Select value={selectedSet} onValueChange={setSelectedSet}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Set" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sets</SelectItem>
                    <SelectItem value="OP06">OP06 - Awakening</SelectItem>
                    <SelectItem value="OP05">OP05 - Awakening</SelectItem>
                    <SelectItem value="OP04">OP04 - Awakening</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedRarity} onValueChange={setSelectedRarity}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Rarity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Rarities</SelectItem>
                    <SelectItem value="Leader">Leader</SelectItem>
                    <SelectItem value="SR">SR</SelectItem>
                    <SelectItem value="UC">UC</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Conditions</SelectItem>
                    <SelectItem value="Near Mint">Near Mint</SelectItem>
                    <SelectItem value="Lightly Played">Lightly Played</SelectItem>
                    <SelectItem value="Played">Played</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search inventory..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-[300px]"
                />
              </div>
            </div>

            {/* Inventory Table */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory Items</CardTitle>
                <CardDescription>
                  A list of all your inventory items with their current stock levels and market values.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable data={filteredData} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="low-stock" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Low Stock Items</CardTitle>
                <CardDescription>
                  Items that are running low on stock and may need restocking soon.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable data={filteredData.filter(item => parseInt(item.target) <= 5 && parseInt(item.target) > 0)} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="out-of-stock" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Out of Stock Items</CardTitle>
                <CardDescription>
                  Items that are currently out of stock and need immediate restocking.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable data={filteredData.filter(item => parseInt(item.target) === 0)} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recently Added Items</CardTitle>
                <CardDescription>
                  Items that have been recently added to your inventory.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable data={filteredData.slice(0, 5)} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayoutWrapper>
  );
} 