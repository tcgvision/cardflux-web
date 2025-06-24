"use client";

import { useState } from "react";
import { Plus, Search, Filter, Receipt, TrendingUp, DollarSign, ShoppingCart, Calendar, Download } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { api } from "~/trpc/react";
import { DataTable } from "~/components/data-table";

export default function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedDateRange, setSelectedDateRange] = useState<string>("all");

  // Fetch transactions data
  const { data: transactionsData, isLoading } = api.transaction.getAll.useQuery({
    search: searchQuery || undefined,
    limit: 100,
  });

  // Mock transaction stats
  const transactionStats = {
    totalTransactions: 1247,
    totalRevenue: 28475.50,
    averageTransaction: 22.84,
    thisMonth: 89,
    thisMonthRevenue: 2034.25,
    pendingTransactions: 3,
    refundedTransactions: 12,
  };

  // Transform data for the data table
  const tableData = transactionsData?.transactions.map((transaction: any, index: number) => ({
    id: index + 1,
    header: `#${transaction.id.slice(-6)}`,
    type: transaction.type,
    status: transaction.status,
    target: transaction.totalAmount.toString(),
    limit: transaction.customer?.name || "Walk-in",
    reviewer: new Date(transaction.createdAt).toLocaleDateString(),
  })) || [];

  const filteredData = tableData.filter((item: any) => {
    if (selectedStatus !== "all" && item.status !== selectedStatus) return false;
    if (selectedType !== "all" && item.type !== selectedType) return false;
    return true;
  });

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transaction History</h1>
          <p className="text-muted-foreground">
            View and manage all sales transactions, refunds, and financial data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Transaction
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactionStats.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">
              +{transactionStats.thisMonth} this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${transactionStats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              ${transactionStats.thisMonthRevenue} this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Transaction</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${transactionStats.averageTransaction}</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactionStats.pendingTransactions}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting completion
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
                placeholder="Search transactions..."
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
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="REFUNDED">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="CHECKOUT">Checkout</SelectItem>
                  <SelectItem value="REFUND">Refund</SelectItem>
                  <SelectItem value="STORE_CREDIT">Store Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" className="w-full">
              Clear Filters
            </Button>
          </CardContent>
        </Card>

        {/* Transaction Table */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  {filteredData.length} transactions found
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {transactionStats.totalTransactions} total
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Loading transactions...</p>
                </div>
              </div>
            ) : (
              <DataTable data={filteredData} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction Details Tabs */}
      <Tabs defaultValue="recent" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="refunds">Refunds</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Latest sales and customer interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactionsData?.transactions.slice(0, 5).map((transaction: any) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Receipt className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">#{transaction.id.slice(-6)}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.customer?.name || "Walk-in Customer"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">${transaction.totalAmount}</p>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={transaction.status === "COMPLETED" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {transaction.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
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
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>
                  Monthly revenue performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">This Month</span>
                    <span className="font-medium">${transactionStats.thisMonthRevenue}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Last Month</span>
                    <span className="font-medium">$1,847.30</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Growth</span>
                    <span className="font-medium text-green-600">+10.1%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Transaction Types</CardTitle>
                <CardDescription>
                  Breakdown by transaction type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Checkouts</span>
                    <span className="font-medium">1,189</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Store Credit</span>
                    <span className="font-medium">45</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Refunds</span>
                    <span className="font-medium text-red-600">12</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="refunds" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Refund Management</CardTitle>
              <CardDescription>
                Track and manage refund requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border bg-red-50">
                  <div>
                    <p className="font-medium">Refund Requests</p>
                    <p className="text-sm text-muted-foreground">
                      {transactionStats.refundedTransactions} refunds processed
                    </p>
                  </div>
                  <Badge variant="destructive">
                    {transactionStats.refundedTransactions} total
                  </Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-red-600">
                      ${(transactionStats.refundedTransactions * 25).toFixed(2)}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Refunded</p>
                  </div>
                  <div className="text-center p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round((transactionStats.refundedTransactions / transactionStats.totalTransactions) * 100)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Refund Rate</p>
                  </div>
                  <div className="text-center p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-green-600">
                      {transactionStats.totalTransactions - transactionStats.refundedTransactions}
                    </div>
                    <p className="text-sm text-muted-foreground">Successful Sales</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
              <CardDescription>
                Generate and download financial reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                  <Download className="h-6 w-6" />
                  <span>Sales Report</span>
                  <span className="text-xs text-muted-foreground">
                    Daily, weekly, monthly sales
                  </span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                  <Download className="h-6 w-6" />
                  <span>Revenue Report</span>
                  <span className="text-xs text-muted-foreground">
                    Revenue trends and analysis
                  </span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                  <Download className="h-6 w-6" />
                  <span>Customer Report</span>
                  <span className="text-xs text-muted-foreground">
                    Customer spending patterns
                  </span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                  <Download className="h-6 w-6" />
                  <span>Refund Report</span>
                  <span className="text-xs text-muted-foreground">
                    Refund tracking and analysis
                  </span>
                </Button>
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
            Common transaction management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <Plus className="h-6 w-6" />
              <span>New Sale</span>
              <span className="text-xs text-muted-foreground">
                Create a new transaction
              </span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <Receipt className="h-6 w-6" />
              <span>Process Refund</span>
              <span className="text-xs text-muted-foreground">
                Handle customer refunds
              </span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <Download className="h-6 w-6" />
              <span>Export Data</span>
              <span className="text-xs text-muted-foreground">
                Download transaction history
              </span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <TrendingUp className="h-6 w-6" />
              <span>Analytics</span>
              <span className="text-xs text-muted-foreground">
                View detailed analytics
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 