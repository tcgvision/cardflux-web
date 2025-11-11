"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, BarChart3, Calendar, Download } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { ChartAreaInteractive } from "~/components/chart-area-interactive";

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("month");

  // Mock analytics data
  const analyticsData = {
    revenue: {
      current: 28475.50,
      previous: 25420.30,
      change: 12.0,
      trend: "up",
    },
    transactions: {
      current: 1247,
      previous: 1189,
      change: 4.9,
      trend: "up",
    },
    customers: {
      current: 247,
      previous: 234,
      change: 5.6,
      trend: "up",
    },
    averageOrder: {
      current: 22.84,
      previous: 21.38,
      change: 6.8,
      trend: "up",
    },
  };

  // Mock chart data
  const revenueData = [
    { name: "Jan", total: 2100 },
    { name: "Feb", total: 1800 },
    { name: "Mar", total: 2400 },
    { name: "Apr", total: 2200 },
    { name: "May", total: 2800 },
    { name: "Jun", total: 3200 },
    { name: "Jul", total: 2900 },
    { name: "Aug", total: 3100 },
    { name: "Sep", total: 3400 },
    { name: "Oct", total: 3600 },
    { name: "Nov", total: 3800 },
    { name: "Dec", total: 4200 },
  ];

  const transactionData = [
    { name: "Jan", total: 89 },
    { name: "Feb", total: 76 },
    { name: "Mar", total: 98 },
    { name: "Apr", total: 92 },
    { name: "May", total: 112 },
    { name: "Jun", total: 128 },
    { name: "Jul", total: 118 },
    { name: "Aug", total: 124 },
    { name: "Sep", total: 136 },
    { name: "Oct", total: 142 },
    { name: "Nov", total: 148 },
    { name: "Dec", total: 156 },
  ];

  const topProducts = [
    { name: "Monkey D. Luffy", sales: 156, revenue: 2496 },
    { name: "Roronoa Zoro", sales: 89, revenue: 1424 },
    { name: "Nami", sales: 67, revenue: 1072 },
    { name: "Usopp", sales: 45, revenue: 720 },
    { name: "Sanji", sales: 34, revenue: 544 },
  ];

  const topCustomers = [
    { name: "Carol Davis", total: 1250, visits: 12 },
    { name: "David Wilson", total: 890, visits: 8 },
    { name: "Emma Brown", total: 745, visits: 6 },
    { name: "Frank Miller", total: 623, visits: 5 },
    { name: "Grace Taylor", total: 512, visits: 4 },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Business insights and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analyticsData.revenue.current.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs">
              {analyticsData.revenue.trend === "up" ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className={analyticsData.revenue.trend === "up" ? "text-green-600" : "text-red-600"}>
                +{analyticsData.revenue.change}%
              </span>
              <span className="text-muted-foreground">from last period</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.transactions.current}</div>
            <div className="flex items-center gap-1 text-xs">
              {analyticsData.transactions.trend === "up" ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className={analyticsData.transactions.trend === "up" ? "text-green-600" : "text-red-600"}>
                +{analyticsData.transactions.change}%
              </span>
              <span className="text-muted-foreground">from last period</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.customers.current}</div>
            <div className="flex items-center gap-1 text-xs">
              {analyticsData.customers.trend === "up" ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className={analyticsData.customers.trend === "up" ? "text-green-600" : "text-red-600"}>
                +{analyticsData.customers.change}%
              </span>
              <span className="text-muted-foreground">from last period</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analyticsData.averageOrder.current}</div>
            <div className="flex items-center gap-1 text-xs">
              {analyticsData.averageOrder.trend === "up" ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className={analyticsData.averageOrder.trend === "up" ? "text-green-600" : "text-red-600"}>
                +{analyticsData.averageOrder.change}%
              </span>
              <span className="text-muted-foreground">from last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>
                  Monthly revenue performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartAreaInteractive data={revenueData as any} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Transaction Volume</CardTitle>
                <CardDescription>
                  Monthly transaction count
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartAreaInteractive data={transactionData as any} />
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
              <CardDescription>
                Key performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 rounded-lg border">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round((analyticsData.revenue.current / analyticsData.revenue.previous - 1) * 100)}%
                  </div>
                  <p className="text-sm text-muted-foreground">Revenue Growth</p>
                </div>
                <div className="text-center p-4 rounded-lg border">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round((analyticsData.transactions.current / analyticsData.transactions.previous - 1) * 100)}%
                  </div>
                  <p className="text-sm text-muted-foreground">Transaction Growth</p>
                </div>
                <div className="text-center p-4 rounded-lg border">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round((analyticsData.customers.current / analyticsData.customers.previous - 1) * 100)}%
                  </div>
                  <p className="text-sm text-muted-foreground">Customer Growth</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
              <CardDescription>
                Best-selling products by revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.sales} units sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">${product.revenue}</p>
                      <p className="text-xs text-muted-foreground">
                        ${(product.revenue / product.sales).toFixed(2)} avg
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Customers</CardTitle>
              <CardDescription>
                Highest spending customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCustomers.map((customer, index) => (
                  <div key={customer.name} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.visits} visits</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">${customer.total}</p>
                      <p className="text-xs text-muted-foreground">
                        ${(customer.total / customer.visits).toFixed(2)} avg per visit
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Seasonal Trends</CardTitle>
                <CardDescription>
                  Revenue patterns throughout the year
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Q1 (Jan-Mar)</span>
                    <span className="font-medium">$6,300</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Q2 (Apr-Jun)</span>
                    <span className="font-medium">$8,200</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Q3 (Jul-Sep)</span>
                    <span className="font-medium">$9,400</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Q4 (Oct-Dec)</span>
                    <span className="font-medium">$11,600</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Growth Projections</CardTitle>
                <CardDescription>
                  Forecasted performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Next Month</span>
                    <span className="font-medium text-green-600">+8.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Next Quarter</span>
                    <span className="font-medium text-green-600">+12.3%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Next Year</span>
                    <span className="font-medium text-green-600">+18.7%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Generate reports and export data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <Download className="h-6 w-6" />
              <span>Revenue Report</span>
              <span className="text-xs text-muted-foreground">
                Export revenue data
              </span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <BarChart3 className="h-6 w-6" />
              <span>Performance Report</span>
              <span className="text-xs text-muted-foreground">
                Business performance metrics
              </span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <Users className="h-6 w-6" />
              <span>Customer Report</span>
              <span className="text-xs text-muted-foreground">
                Customer behavior analysis
              </span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <Calendar className="h-6 w-6" />
              <span>Trend Report</span>
              <span className="text-xs text-muted-foreground">
                Seasonal and trend analysis
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 