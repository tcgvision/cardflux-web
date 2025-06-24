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
                  <SelectItem value="mint">Mint</SelectItem>
                  <SelectItem value="near-mint">Near Mint</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="light-played">Light Played</SelectItem>
                  <SelectItem value="played">Played</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" className="w-full">
              <Search className="mr-2 h-4 w-4" />
              Apply Filters
            </Button>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Product Inventory</CardTitle>
            <CardDescription>
              {filteredData.length} products found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable data={filteredData} />
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Selling</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Monkey D. Luffy</span>
                    <span className="font-medium">24 sold</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Roronoa Zoro</span>
                    <span className="font-medium">18 sold</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Nami</span>
                    <span className="font-medium">15 sold</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Sanji</span>
                    <Badge variant="destructive">2 left</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Usopp</span>
                    <Badge variant="destructive">1 left</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tony Tony Chopper</span>
                    <Badge variant="destructive">3 left</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">+5</span> products added
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">-12</span> items sold
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">+3</span> restocked
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Value Changes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Monkey D. Luffy</span>
                    <span className="text-green-600">+$5.20</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Roronoa Zoro</span>
                    <span className="text-red-600">-$2.10</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Nami</span>
                    <span className="text-green-600">+$1.80</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Trends</CardTitle>
              <CardDescription>
                Track inventory changes over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Chart visualization coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stock Alerts</CardTitle>
              <CardDescription>
                Items that need attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border border-red-200 bg-red-50">
                  <div>
                    <p className="font-medium">Sanji - Out of Stock</p>
                    <p className="text-sm text-muted-foreground">Last sold 2 days ago</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Restock
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-yellow-200 bg-yellow-50">
                  <div>
                    <p className="font-medium">Usopp - Low Stock</p>
                    <p className="text-sm text-muted-foreground">Only 1 item remaining</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Restock
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-yellow-200 bg-yellow-50">
                  <div>
                    <p className="font-medium">Tony Tony Chopper - Low Stock</p>
                    <p className="text-sm text-muted-foreground">Only 3 items remaining</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Restock
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 