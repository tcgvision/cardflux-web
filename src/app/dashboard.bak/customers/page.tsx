"use client";

import { useState } from "react";
import { Plus, Search, Filter, Users, CreditCard, TrendingUp, UserPlus, Phone, Mail } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { api } from "~/trpc/react";
import { DataTable } from "~/components/data-table";

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCreditRange, setSelectedCreditRange] = useState<string>("all");

  // Fetch customers data
  const { data: customersData, isLoading } = api.customer.getAll.useQuery({
    search: searchQuery || undefined,
    limit: 100,
  });

  // Mock customer stats
  const customerStats = {
    totalCustomers: 247,
    activeCustomers: 189,
    newThisMonth: 23,
    totalStoreCredit: 2847.50,
    averageCredit: 15.08,
    topSpender: "Carol Davis",
    topSpenderAmount: 1250.00,
  };

  // Transform data for the data table
  const tableData = customersData?.customers.map((customer, index) => ({
    id: index + 1,
    header: customer.name,
    type: customer.phone,
    status: customer.isActive ? "Active" : "Inactive",
    target: customer.currentCredit.toString(),
    limit: customer.totalEarned.toString(),
    reviewer: customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString() : "Never",
  })) || [];

  const filteredData = tableData.filter(item => {
    if (selectedStatus !== "all" && item.status !== selectedStatus) return false;
    if (selectedCreditRange !== "all") {
      const credit = parseFloat(item.target);
      switch (selectedCreditRange) {
        case "0":
          if (credit !== 0) return false;
          break;
        case "1-50":
          if (credit < 1 || credit > 50) return false;
          break;
        case "51-100":
          if (credit < 51 || credit > 100) return false;
          break;
        case "100+":
          if (credit <= 100) return false;
          break;
      }
    }
    return true;
  });

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customer Management</h1>
          <p className="text-muted-foreground">
            Manage your customer database, track store credit, and monitor customer activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Mail className="mr-2 h-4 w-4" />
            Send Email
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerStats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              +{customerStats.newThisMonth} this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerStats.activeCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((customerStats.activeCustomers / customerStats.totalCustomers) * 100)}% active rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Store Credit</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${customerStats.totalStoreCredit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              ${customerStats.averageCredit} average per customer
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Spender</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{customerStats.topSpender}</div>
            <p className="text-xs text-muted-foreground">
              ${customerStats.topSpenderAmount} total spent
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
                placeholder="Search customers..."
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
                  <SelectItem value="all">All Customers</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Store Credit</label>
              <Select value={selectedCreditRange} onValueChange={setSelectedCreditRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ranges</SelectItem>
                  <SelectItem value="0">$0 Credit</SelectItem>
                  <SelectItem value="1-50">$1 - $50</SelectItem>
                  <SelectItem value="51-100">$51 - $100</SelectItem>
                  <SelectItem value="100+">$100+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" className="w-full">
              Clear Filters
            </Button>
          </CardContent>
        </Card>

        {/* Customer Table */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Customer Database</CardTitle>
                <CardDescription>
                  {filteredData.length} customers found
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {customerStats.totalCustomers} total
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Loading customers...</p>
                </div>
              </div>
            ) : (
              <DataTable data={filteredData} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Customer Details Tabs */}
      <Tabs defaultValue="recent" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          <TabsTrigger value="credit">Store Credit</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Customer Activity</CardTitle>
              <CardDescription>
                Latest customer interactions and transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customersData?.customers.slice(0, 5).map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {customer.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">${customer.currentCredit}</p>
                      <p className="text-xs text-muted-foreground">
                        {customer.lastVisit ? 
                          `Last visit: ${new Date(customer.lastVisit).toLocaleDateString()}` : 
                          'Never visited'
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="credit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Store Credit Overview</CardTitle>
              <CardDescription>
                Customer store credit balances and transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-medium">Top Credit Balances</h3>
                  {customersData?.customers
                    .sort((a, b) => b.currentCredit - a.currentCredit)
                    .slice(0, 5)
                    .map((customer) => (
                      <div key={customer.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <span className="font-medium">{customer.name}</span>
                        <Badge variant="outline">${customer.currentCredit}</Badge>
                      </div>
                    ))}
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium">Credit Statistics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Average Credit:</span>
                      <span className="font-medium">${customerStats.averageCredit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total Credit Issued:</span>
                      <span className="font-medium">${customerStats.totalStoreCredit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Customers with Credit:</span>
                      <span className="font-medium">
                        {customersData?.customers.filter(c => c.currentCredit > 0).length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Analytics</CardTitle>
              <CardDescription>
                Customer behavior and engagement metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 rounded-lg border">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round((customerStats.activeCustomers / customerStats.totalCustomers) * 100)}%
                  </div>
                  <p className="text-sm text-muted-foreground">Active Rate</p>
                </div>
                <div className="text-center p-4 rounded-lg border">
                  <div className="text-2xl font-bold text-blue-600">
                    {customerStats.newThisMonth}
                  </div>
                  <p className="text-sm text-muted-foreground">New This Month</p>
                </div>
                <div className="text-center p-4 rounded-lg border">
                  <div className="text-2xl font-bold text-purple-600">
                    ${customerStats.topSpenderAmount}
                  </div>
                  <p className="text-sm text-muted-foreground">Top Spender</p>
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
            Common customer management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <Plus className="h-6 w-6" />
              <span>Add Customer</span>
              <span className="text-xs text-muted-foreground">
                Create new customer profile
              </span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <CreditCard className="h-6 w-6" />
              <span>Adjust Credit</span>
              <span className="text-xs text-muted-foreground">
                Modify store credit balances
              </span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <Mail className="h-6 w-6" />
              <span>Send Email</span>
              <span className="text-xs text-muted-foreground">
                Bulk email to customers
              </span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <TrendingUp className="h-6 w-6" />
              <span>Customer Report</span>
              <span className="text-xs text-muted-foreground">
                Generate customer analytics
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 