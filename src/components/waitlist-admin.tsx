"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { 
  Users, 
  Mail, 
  Store, 
  Calendar, 
  Download,
  RefreshCw,
  TrendingUp
} from "lucide-react";

interface WaitlistStats {
  totalSignups: number;
  recentSignups: Array<{
    id: string;
    email: string;
    storeName: string | null;
    storeType: string | null;
    createdAt: string;
  }>;
  storeTypeBreakdown: Array<{
    storeType: string | null;
    _count: {
      storeType: number;
    };
  }>;
}

export function WaitlistAdmin() {
  const [stats, setStats] = useState<WaitlistStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch("/api/waitlist");
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      } else {
        setError("Failed to fetch waitlist stats");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const exportWaitlist = () => {
    if (!stats) return;
    
    const csvContent = [
      "Email,First Name,Last Name,Store Name,Store Type,Expected Launch,Source,Created At",
      ...stats.recentSignups.map(entry => 
        `${entry.email},${entry.storeName || ""},${entry.storeType || ""},${entry.createdAt}`
      )
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `waitlist-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Waitlist Statistics</CardTitle>
          <CardDescription>Loading waitlist data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Waitlist Statistics</CardTitle>
          <CardDescription>Error loading waitlist data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button onClick={fetchStats} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Signups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSignups}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.recentSignups.length} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Store Types</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.storeTypeBreakdown.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Different store categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{Math.round((stats.recentSignups.length / stats.totalSignups) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Weekly growth
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Store Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Store Type Distribution</CardTitle>
          <CardDescription>Breakdown of waitlist signups by store type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.storeTypeBreakdown.map((item) => (
              <div key={item.storeType || "Unknown"} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">
                    {item.storeType || "Unknown"}
                  </Badge>
                </div>
                <span className="text-sm font-medium">
                  {item._count.storeType} stores
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Signups */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Signups</CardTitle>
              <CardDescription>Latest waitlist entries</CardDescription>
            </div>
            <Button onClick={exportWaitlist} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentSignups.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{entry.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.storeName || "No store name"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {entry.storeType && (
                    <Badge variant="outline" className="text-xs">
                      {entry.storeType}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 