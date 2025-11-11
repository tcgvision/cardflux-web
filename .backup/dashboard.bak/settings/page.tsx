"use client";

import { useState } from "react";
import { Settings, Store, Users, Bell, Shield, Database, CreditCard, Palette, RefreshCw, AlertTriangle, CheckCircle, Wrench, MapPin, Phone, Globe } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { ThemeToggle } from "~/app/_components/theme-toggle";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useRolePermissions } from "~/hooks/use-role-permissions";
import { useUnifiedShop } from "~/hooks/use-unified-shop";
import { Alert, AlertDescription } from "~/components/ui/alert";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
    errors?: string[];
  }>({ loading: false });

  const { isAdmin } = useRolePermissions();
  const { hasShop, shopName } = useUnifiedShop();

  // Fetch shop data with real-time updates
  const { data: shopData, isLoading: shopLoading, refetch: refetchShop } = api.shop.getCurrent.useQuery(undefined, {
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data fresh for 10 seconds
  });
  
  const { data: settingsData, isLoading: settingsLoading, refetch: refetchSettings } = api.shop.getSettings.useQuery(undefined, {
    refetchInterval: 30000,
    staleTime: 10000,
  });
  
  const { data: posSettingsData, isLoading: posSettingsLoading, refetch: refetchPOSSettings } = api.shop.getPOSSettings.useQuery(undefined, {
    refetchInterval: 30000,
    staleTime: 10000,
  });
  
  const { data: membersData, refetch: refetchMembers } = api.shop.getMembers.useQuery(undefined, {
    enabled: isAdmin,
    refetchInterval: 30000,
    staleTime: 10000,
  });

  // Mutations with optimistic updates
  const updateShopMutation = api.shop.update.useMutation({
    onMutate: async (newData: any) => {
      // TODO: Fix optimistic updates after tRPC upgrade
      return { previousShop: null };
    },
    onError: (err: any, newData: any, context: any) => {
      toast.error("Failed to update shop", {
        description: err.message,
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      void refetchShop();
    },
    onSuccess: () => {
      toast.success("Shop updated successfully!");
    },
  });

  const updateSettingsMutation = api.shop.updateSettings.useMutation({
    onMutate: async (newData: any) => {
      // TODO: Fix optimistic updates after tRPC upgrade
      return { previousSettings: null };
    },
    onError: (err: any, newData: any, context: any) => {
      toast.error("Failed to update settings", {
        description: err.message,
      });
    },
    onSettled: () => {
      void refetchSettings();
    },
    onSuccess: () => {
      toast.success("Settings updated successfully!");
    },
  });

  const updatePOSSettingsMutation = api.shop.updatePOSSettings.useMutation({
    onMutate: async (newData: any) => {
      // TODO: Fix optimistic updates after tRPC upgrade
      return { previousPOSSettings: null };
    },
    onError: (err: any, newData: any, context: any) => {
      toast.error("Failed to update POS settings", {
        description: err.message,
      });
    },
    onSettled: () => {
      void refetchPOSSettings();
    },
    onSuccess: () => {
      toast.success("POS settings updated successfully!");
    },
  });

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncData = async () => {
    setSyncStatus({ loading: true });
    try {
      const response = await fetch('/api/sync-users-with-clerk', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        setSyncStatus({
          loading: false,
          success: true,
          message: result.message,
        });
        toast.success("Data synchronized successfully!");
        
        // Refresh all data
        void refetchShop();
        void refetchSettings();
        void refetchPOSSettings();
        void refetchMembers();
      } else {
        setSyncStatus({
          loading: false,
          success: false,
          message: result.message,
          errors: result.errors,
        });
        toast.error("Sync failed", {
          description: result.message,
        });
      }
    } catch (error) {
      setSyncStatus({
        loading: false,
        success: false,
        message: "Failed to sync data",
        errors: [error instanceof Error ? error.message : "Unknown error"],
      });
      toast.error("Sync failed", {
        description: "An unexpected error occurred",
      });
    }
  };

  const handleVerifyConsistency = async () => {
    setSyncStatus({ loading: true });
    try {
      const response = await fetch('/api/verify-consistency', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        setSyncStatus({
          loading: false,
          success: true,
          message: result.message,
        });
        toast.success("Consistency check completed!");
        
        // Refresh all data
        void refetchShop();
        void refetchSettings();
        void refetchPOSSettings();
        void refetchMembers();
      } else {
        setSyncStatus({
          loading: false,
          success: false,
          message: result.message,
          errors: result.errors,
        });
        toast.error("Consistency check failed", {
          description: result.message,
        });
      }
    } catch (error) {
      setSyncStatus({
        loading: false,
        success: false,
        message: "Consistency check failed",
        errors: [error instanceof Error ? error.message : "Unknown error"],
      });
      toast.error("Consistency check failed");
    }
  };

  const handleFixUserShop = async () => {
    setSyncStatus({ loading: true });
    try {
      const response = await fetch('/api/fix-user-shop', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const result = await response.json();
      
      if (result.success) {
        setSyncStatus({ 
          loading: false,
          success: true, 
          message: `User-shop linking fixed: ${result.message}` 
        });
        toast.success("User-shop linking fixed!");
        // Refresh the page to update the UI
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setSyncStatus({ 
          loading: false,
          success: false, 
          message: result.message 
        });
        toast.error("Failed to fix user-shop linking", {
          description: result.message,
        });
      }
    } catch (error) {
      setSyncStatus({ 
        loading: false,
        success: false, 
        message: "Failed to fix user-shop linking" 
      });
      toast.error("Failed to fix user-shop linking");
    }
  };

  // Show loading state
  if (shopLoading || settingsLoading || posSettingsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading shop settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Shop Settings</h1>
        <p className="text-muted-foreground">
          Manage your shop configuration and preferences
        </p>
      </div>

      {/* Sync Status Alert */}
      {syncStatus.loading && (
        <Alert className="mb-6">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <AlertDescription>
            {syncStatus.message || "Syncing data..."}
          </AlertDescription>
        </Alert>
      )}

      {syncStatus.success !== undefined && !syncStatus.loading && (
        <Alert className={`mb-6 ${syncStatus.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          {syncStatus.success ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={syncStatus.success ? 'text-green-800' : 'text-red-800'}>
            {syncStatus.message}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="pos">POS</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="sync">Sync</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Shop Information
              </CardTitle>
              <CardDescription>
                Basic shop details and configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shopName">Shop Name</Label>
                  <Input
                    id="shopName"
                    value={shopData?.name || ""}
                    onChange={(e) => {
                      updateShopMutation.mutate({ name: e.target.value });
                    }}
                    disabled={!isAdmin || updateShopMutation.isPending}
                    placeholder="Enter shop name"
                  />
                </div>
                <div>
                  <Label htmlFor="shopType">Shop Type</Label>
                  <Select
                    value={shopData?.type || "local"}
                    onValueChange={(value) => {
                      updateShopMutation.mutate({ type: value as "local" | "online" | "both" });
                    }}
                    disabled={!isAdmin || updateShopMutation.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local Store</SelectItem>
                      <SelectItem value="online">Online Store</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={shopData?.description || ""}
                  onChange={(e) => {
                    updateShopMutation.mutate({ description: e.target.value });
                  }}
                  disabled={!isAdmin || updateShopMutation.isPending}
                  placeholder="Describe your shop"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select
                    value={settingsData?.defaultCurrency || "USD"}
                    onValueChange={(value) => {
                      updateSettingsMutation.mutate({ defaultCurrency: value });
                    }}
                    disabled={!isAdmin || updateSettingsMutation.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="lowStock">Low Stock Threshold</Label>
                  <Input
                    id="lowStock"
                    type="number"
                    value={settingsData?.lowStockThreshold || 5}
                    onChange={(e) => {
                      updateSettingsMutation.mutate({ lowStockThreshold: parseInt(e.target.value) });
                    }}
                    disabled={!isAdmin || updateSettingsMutation.isPending}
                    min="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* POS Settings */}
        <TabsContent value="pos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Point of Sale Settings
              </CardTitle>
              <CardDescription>
                Configure your POS system preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableScanner">Enable Scanner</Label>
                    <p className="text-sm text-muted-foreground">Allow barcode scanning</p>
                  </div>
                  <Switch
                    id="enableScanner"
                    checked={posSettingsData?.enableScanner || false}
                    onCheckedChange={(checked) => {
                      updatePOSSettingsMutation.mutate({ enableScanner: checked });
                    }}
                    disabled={!isAdmin || updatePOSSettingsMutation.isPending}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableReceipts">Enable Receipts</Label>
                    <p className="text-sm text-muted-foreground">Print receipts for transactions</p>
                  </div>
                  <Switch
                    id="enableReceipts"
                    checked={posSettingsData?.enableReceipts || false}
                    onCheckedChange={(checked) => {
                      updatePOSSettingsMutation.mutate({ enableReceipts: checked });
                    }}
                    disabled={!isAdmin || updatePOSSettingsMutation.isPending}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="defaultPayment">Default Payment Method</Label>
                  <Select
                    value={posSettingsData?.defaultPaymentMethod || "CASH"}
                    onValueChange={(value) => {
                      updatePOSSettingsMutation.mutate({ defaultPaymentMethod: value as any });
                    }}
                    disabled={!isAdmin || updatePOSSettingsMutation.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                      <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
                      <SelectItem value="STORE_CREDIT">Store Credit</SelectItem>
                      <SelectItem value="MIXED">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.01"
                    value={posSettingsData?.taxRate || 0}
                    onChange={(e) => {
                      updatePOSSettingsMutation.mutate({ taxRate: parseFloat(e.target.value) });
                    }}
                    disabled={!isAdmin || updatePOSSettingsMutation.isPending}
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableDiscounts">Enable Discounts</Label>
                    <p className="text-sm text-muted-foreground">Allow price discounts</p>
                  </div>
                  <Switch
                    id="enableDiscounts"
                    checked={posSettingsData?.enableDiscounts || false}
                    onCheckedChange={(checked) => {
                      updatePOSSettingsMutation.mutate({ enableDiscounts: checked });
                    }}
                    disabled={!isAdmin || updatePOSSettingsMutation.isPending}
                  />
                </div>
                
                <div>
                  <Label htmlFor="maxDiscount">Max Discount (%)</Label>
                  <Input
                    id="maxDiscount"
                    type="number"
                    step="0.1"
                    value={posSettingsData?.maxDiscountPercent || 20}
                    onChange={(e) => {
                      updatePOSSettingsMutation.mutate({ maxDiscountPercent: parseFloat(e.target.value) });
                    }}
                    disabled={!isAdmin || updatePOSSettingsMutation.isPending}
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableNotifications">Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications for important events</p>
                </div>
                <Switch
                  id="enableNotifications"
                  checked={settingsData?.enableNotifications || false}
                  onCheckedChange={(checked) => {
                    updateSettingsMutation.mutate({ enableNotifications: checked });
                  }}
                  disabled={!isAdmin || updateSettingsMutation.isPending}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoPriceSync">Auto Price Sync</Label>
                  <p className="text-sm text-muted-foreground">Automatically sync prices with market data</p>
                </div>
                <Switch
                  id="autoPriceSync"
                  checked={settingsData?.autoPriceSync || false}
                  onCheckedChange={(checked) => {
                    updateSettingsMutation.mutate({ autoPriceSync: checked });
                  }}
                  disabled={!isAdmin || updateSettingsMutation.isPending}
                />
              </div>
            </CardContent>
          </Card>

          {/* Store Credit Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Store Credit Settings
              </CardTitle>
              <CardDescription>
                Configure store credit policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableStoreCredit">Enable Store Credit</Label>
                  <p className="text-sm text-muted-foreground">Allow customers to use store credit</p>
                </div>
                <Switch
                  id="enableStoreCredit"
                  checked={settingsData?.enableStoreCredit || false}
                  onCheckedChange={(checked) => {
                    updateSettingsMutation.mutate({ enableStoreCredit: checked });
                  }}
                  disabled={!isAdmin || updateSettingsMutation.isPending}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minCredit">Minimum Credit Amount</Label>
                  <Input
                    id="minCredit"
                    type="number"
                    step="0.01"
                    value={settingsData?.minCreditAmount || 0}
                    onChange={(e) => {
                      updateSettingsMutation.mutate({ minCreditAmount: parseFloat(e.target.value) });
                    }}
                    disabled={!isAdmin || updateSettingsMutation.isPending}
                    min="0"
                  />
                </div>
                
                <div>
                  <Label htmlFor="maxCredit">Maximum Credit Amount</Label>
                  <Input
                    id="maxCredit"
                    type="number"
                    step="0.01"
                    value={settingsData?.maxCreditAmount || 1000}
                    onChange={(e) => {
                      updateSettingsMutation.mutate({ maxCreditAmount: parseFloat(e.target.value) });
                    }}
                    disabled={!isAdmin || updateSettingsMutation.isPending}
                    min="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Management */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members
              </CardTitle>
              <CardDescription>
                Manage your shop team members and their roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isAdmin ? (
                <div className="space-y-4">
                  {membersData?.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{member.name || member.email}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                      <Badge variant={member.role === "org:admin" ? "default" : "secondary"}>
                        {member.role === "org:admin" ? "Admin" : "Member"}
                      </Badge>
                    </div>
                  ))}
                  {(!membersData || membersData.length === 0) && (
                    <p className="text-muted-foreground text-center py-4">
                      No team members found
                    </p>
                  )}
                </div>
              ) : (
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Only administrators can view and manage team members.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sync Management */}
        <TabsContent value="sync" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Synchronization
              </CardTitle>
              <CardDescription>
                Manage data synchronization between Clerk and your database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Manual Sync</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manually synchronize user data with Clerk organization data
                  </p>
                  <Button 
                    onClick={handleSyncData}
                    disabled={syncStatus.loading}
                    className="w-full"
                  >
                    {syncStatus.loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sync Users with Clerk
                      </>
                    )}
                  </Button>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Consistency Check</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Verify data consistency between Clerk and database
                  </p>
                  <Button 
                    onClick={handleVerifyConsistency}
                    disabled={syncStatus.loading}
                    variant="outline"
                    className="w-full"
                  >
                    {syncStatus.loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Verify Consistency
                      </>
                    )}
                  </Button>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Fix User-Shop Linking</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Fix issues with user-shop associations
                  </p>
                  <Button 
                    onClick={handleFixUserShop}
                    disabled={syncStatus.loading}
                    variant="outline"
                    className="w-full"
                  >
                    {syncStatus.loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Fixing...
                      </>
                    ) : (
                      <>
                        <Wrench className="h-4 w-4 mr-2" />
                        Fix User-Shop Linking
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Advanced Settings
              </CardTitle>
              <CardDescription>
                Advanced configuration options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                </div>
                <ThemeToggle />
              </div>
              
              <div className="pt-4 border-t">
                <Button 
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 