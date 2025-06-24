"use client";

import { useState } from "react";
import { Plus, Search, Filter, ShoppingCart, DollarSign, Clock, CheckCircle, AlertTriangle, Users } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { DataTable } from "~/components/data-table";

export default function BuylistsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCustomer, setSelectedCustomer] = useState<string>("all");

  // Mock buylist data since we don't have a buylist router yet
  const buylistData = {
    buylists: [
      {
        id: "1",
        customer: { name: "John Smith", phone: "555-0123" },
        status: "PENDING",
        totalValue: 45.50,
        itemCount: 12,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: "2",
        customer: { name: "Sarah Johnson", phone: "555-0456" },
        status: "COMPLETED",
        totalValue: 127.25,
        itemCount: 8,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: "3",
        customer: { name: "Mike Wilson", phone: "555-0789" },
        status: "PENDING",
        totalValue: 23.75,
        itemCount: 5,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
    ],
  };

  // Mock buylist stats
  const buylistStats = {
    totalBuylists: 47,
    pendingBuylists: 8,
    completedBuylists: 39,
    totalValue: 2847.50,
    averageValue: 60.59,
    thisMonth: 12,
    thisMonthValue: 725.25,
  };

  // Transform data for the data table
  const tableData = buylistData.buylists.map((buylist: any, index: number) => ({
    id: index + 1,
    header: `#${buylist.id}`,
    type: buylist.customer.name,
    status: buylist.status,
    target: buylist.totalValue.toString(),
    limit: buylist.itemCount.toString(),
    reviewer: new Date(buylist.createdAt).toLocaleDateString(),
  }));

  const filteredData = tableData.filter((item: any) => {
    if (selectedStatus !== "all" && item.status !== selectedStatus) return false;
    if (selectedCustomer !== "all" && !item.type.includes(selectedCustomer)) return false;
    return true;
  });

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Buylist Management</h1>
          <p className="text-muted-foreground">
            Manage card buy-ins from customers and track buylist performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Clock className="mr-2 h-4 w-4" />
            View History
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Buylist
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Buylists</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{buylistStats.totalBuylists}</div>
            <p className="text-xs text-muted-foreground">
              +{buylistStats.thisMonth} this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{buylistStats.pendingBuylists}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting review
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${buylistStats.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              ${buylistStats.thisMonthValue} this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Value</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${buylistStats.averageValue}</div>
            <p className="text-xs text-muted-foreground">
              Per buylist
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
                placeholder="Search buylists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="REVIEWING">Reviewing</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Customer</label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  <SelectItem value="John">John Smith</SelectItem>
                  <SelectItem value="Sarah">Sarah Johnson</SelectItem>
                  <SelectItem value="Mike">Mike Wilson</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" className="w-full">
              Clear Filters
            </Button>
          </CardContent>
        </Card>

        {/* Buylist Table */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Buylist Requests</CardTitle>
                <CardDescription>
                  {filteredData.length} buylists found
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {buylistStats.totalBuylists} total
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable data={filteredData} />
          </CardContent>
        </Card>
      </div>

      {/* Buylist Details Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Buylists</CardTitle>
              <CardDescription>
                Buylists awaiting review and processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {buylistData.buylists
                  .filter((buylist: any) => buylist.status === "PENDING")
                  .map((buylist: any) => (
                    <div key={buylist.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium">#{buylist.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {buylist.customer.name} • {buylist.customer.phone}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">${buylist.totalValue}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {buylist.itemCount} items
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(buylist.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Review
                        </Button>
                        <Button size="sm">
                          Accept
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Buylists</CardTitle>
              <CardDescription>
                Successfully processed buylists
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {buylistData.buylists
                  .filter((buylist: any) => buylist.status === "COMPLETED")
                  .map((buylist: any) => (
                    <div key={buylist.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">#{buylist.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {buylist.customer.name} • {buylist.customer.phone}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">${buylist.totalValue}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="text-xs">
                            {buylist.itemCount} items
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(buylist.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Buylist Performance</CardTitle>
                <CardDescription>
                  Monthly buylist metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">This Month</span>
                    <span className="font-medium">${buylistStats.thisMonthValue}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Last Month</span>
                    <span className="font-medium">$1,247.30</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Growth</span>
                    <span className="font-medium text-green-600">+15.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Customer Activity</CardTitle>
                <CardDescription>
                  Top customers by buylist value
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Sarah Johnson</span>
                    <span className="font-medium">$127.25</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">John Smith</span>
                    <span className="font-medium">$45.50</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Mike Wilson</span>
                    <span className="font-medium">$23.75</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Buylist Settings</CardTitle>
              <CardDescription>
                Configure buylist processing and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-medium">Processing</h3>
                  <div className="space-y-2">
                    <label className="text-sm">Auto-accept threshold</label>
                    <Input placeholder="$50.00" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm">Review time limit</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 hour</SelectItem>
                        <SelectItem value="24">24 hours</SelectItem>
                        <SelectItem value="48">48 hours</SelectItem>
                        <SelectItem value="72">72 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium">Notifications</h3>
                  <div className="space-y-2">
                    <label className="text-sm">Email notifications</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="daily">Daily digest</SelectItem>
                        <SelectItem value="weekly">Weekly digest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm">SMS notifications</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="urgent">Urgent only</SelectItem>
                        <SelectItem value="all">All buylists</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common buylist management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <Plus className="h-6 w-6" />
              <span>New Buylist</span>
              <span className="text-xs text-muted-foreground">
                Create buylist from customer
              </span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <Clock className="h-6 w-6" />
              <span>Review Pending</span>
              <span className="text-xs text-muted-foreground">
                {buylistStats.pendingBuylists} items need review
              </span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <DollarSign className="h-6 w-6" />
              <span>Process Payment</span>
              <span className="text-xs text-muted-foreground">
                Pay customers for cards
              </span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <AlertTriangle className="h-6 w-6" />
              <span>Set Alerts</span>
              <span className="text-xs text-muted-foreground">
                Configure notifications
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 