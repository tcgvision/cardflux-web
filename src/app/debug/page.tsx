"use client";

import { useState } from "react";
import { useUser, useOrganization } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { toast } from "sonner";
import { Loader2, RefreshCw, Database, Users, Building2, CheckCircle, AlertCircle } from "lucide-react";

export default function DebugPage() {
  const { user, isLoaded: userLoaded } = useUser();
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runAction = async (action: string, apiCall: () => Promise<any>) => {
    setIsLoading(action);
    try {
      const result = await apiCall();
      setResults(prev => ({ ...prev, [action]: result }));
      toast.success(`${action} completed successfully`);
    } catch (error) {
      console.error(`${action} error:`, error);
      setResults(prev => ({ ...prev, [action]: { error: error instanceof Error ? error.message : String(error) } }));
      toast.error(`${action} failed`);
    } finally {
      setIsLoading(null);
    }
  };

  const syncUser = () => runAction("syncUser", async () => {
    const response = await fetch('/api/sync-user', { method: 'POST' });
    return await response.json();
  });

  const checkShopMembership = () => runAction("checkShopMembership", async () => {
    const response = await fetch('/api/check-shop-membership');
    return await response.json();
  });

  const getShopStats = () => runAction("getShopStats", async () => {
    const response = await fetch('/api/trpc/shop.getStats');
    return await response.json();
  });

  const getCurrentShop = () => runAction("getCurrentShop", async () => {
    const response = await fetch('/api/trpc/shop.getCurrent');
    return await response.json();
  });

  const resetSignup = () => runAction("resetSignup", async () => {
    const response = await fetch('/api/reset-signup', { method: 'POST' });
    return await response.json();
  });

  const fixUserShop = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/fix-user-shop', { method: 'POST' });
      const data = await response.json();
      setResult(data);
      console.log('Fix result:', data);
    } catch (error: any) {
      setResult({ error: error?.message || 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  if (!userLoaded || !orgLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Debug Dashboard</h1>
          <p className="text-muted-foreground">Test and debug your app's functionality</p>
        </div>
        <Badge variant={user ? "default" : "destructive"}>
          {user ? "Authenticated" : "Not Authenticated"}
        </Badge>
      </div>

      {/* User & Organization Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User & Organization Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">User Details</h4>
              <div className="space-y-1 text-sm">
                <div><strong>ID:</strong> {user?.id || "N/A"}</div>
                <div><strong>Email:</strong> {user?.emailAddresses[0]?.emailAddress || "N/A"}</div>
                <div><strong>Name:</strong> {user?.fullName || "N/A"}</div>
                <div><strong>Created:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleString() : "N/A"}</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Organization Details</h4>
              <div className="space-y-1 text-sm">
                <div><strong>ID:</strong> {organization?.id || "N/A"}</div>
                <div><strong>Name:</strong> {organization?.name || "N/A"}</div>
                <div><strong>Slug:</strong> {organization?.slug || "N/A"}</div>
                <div><strong>Role:</strong> {(organization as any)?.membership?.role || "N/A"}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Debug Actions
          </CardTitle>
          <CardDescription>
            Test various API endpoints and sync functions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              onClick={syncUser}
              disabled={isLoading === "syncUser"}
              className="flex items-center gap-2"
            >
              {isLoading === "syncUser" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
              Sync User to DB
            </Button>

            <Button
              onClick={checkShopMembership}
              disabled={isLoading === "checkShopMembership"}
              className="flex items-center gap-2"
            >
              {isLoading === "checkShopMembership" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Building2 className="h-4 w-4" />}
              Check Shop Membership
            </Button>

            <Button
              onClick={getCurrentShop}
              disabled={isLoading === "getCurrentShop"}
              className="flex items-center gap-2"
            >
              {isLoading === "getCurrentShop" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Building2 className="h-4 w-4" />}
              Get Current Shop
            </Button>

            <Button
              onClick={getShopStats}
              disabled={isLoading === "getShopStats"}
              className="flex items-center gap-2"
            >
              {isLoading === "getShopStats" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Get Shop Stats
            </Button>

            <Button
              onClick={resetSignup}
              disabled={isLoading === "resetSignup"}
              variant="destructive"
              className="flex items-center gap-2"
            >
              {isLoading === "resetSignup" ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertCircle className="h-4 w-4" />}
              Reset Signup
            </Button>

            <Button
              onClick={fixUserShop}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
              Fix User-Shop Linking
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {Object.keys(results).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(results).map(([action, result]) => (
                <div key={action}>
                  <h4 className="font-semibold mb-2 capitalize">{action.replace(/([A-Z])/g, ' $1')}</h4>
                  <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                  <Separator className="mt-4" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Status */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Status Check</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${user ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">User Authenticated</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${organization ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className="text-sm">Organization Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${user?.emailAddresses[0]?.verification?.status === 'verified' ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">Email Verified</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Fix Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h4 className="font-semibold mb-2">Result:</h4>
              <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 