"use client";

import { CreditCard, Plus, Minus, Users, TrendingUp, DollarSign } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

export default function StoreCreditPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Store Credit</h1>
          <p className="text-muted-foreground">
            Manage customer store credit and loyalty programs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Minus className="mr-2 h-4 w-4" />
            Deduct Credit
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Credit
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credit Issued</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,450</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Credit Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$3,280</div>
            <p className="text-xs text-muted-foreground">
              Across 45 customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers with Credit</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Credit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$72.89</div>
            <p className="text-xs text-muted-foreground">
              Per customer
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Credit Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Credit Transactions</CardTitle>
          <CardDescription>
            Latest store credit adjustments and usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Plus className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">John Smith</p>
                  <p className="text-sm text-muted-foreground">Purchase reward</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-green-600">+$25.00</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <Minus className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="font-medium">Sarah Johnson</p>
                  <p className="text-sm text-muted-foreground">Credit used</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-red-600">-$15.50</p>
                <p className="text-xs text-muted-foreground">4 hours ago</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Plus className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Mike Wilson</p>
                  <p className="text-sm text-muted-foreground">Manual adjustment</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-blue-600">+$50.00</p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Credit Program Rules</CardTitle>
          <CardDescription>
            Current store credit policies and settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Earning Rate:</span>
                <Badge variant="secondary">5% of purchase</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Minimum Credit:</span>
                <Badge variant="secondary">$5.00</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Maximum Credit:</span>
                <Badge variant="secondary">$500.00</Badge>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Expiration:</span>
                <Badge variant="secondary">1 year</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Auto-Expire:</span>
                <Badge variant="outline">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Notifications:</span>
                <Badge variant="outline">Enabled</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Message */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Credit Features</CardTitle>
          <CardDescription>
            Enhanced store credit features coming soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            We're working on advanced store credit features including tiered rewards, 
            automatic credit issuance, customer notifications, and detailed analytics. Stay tuned for updates!
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 