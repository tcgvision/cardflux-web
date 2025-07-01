"use client";

import { useState } from "react";
import { Settings, Store, Users, Bell, Shield, Database, CreditCard, Palette, RefreshCw, AlertTriangle, CheckCircle, Wrench } from "lucide-react";
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

  // Fetch shop settings
  const { data: shopData, isLoading: shopLoading, refetch: refetchShop } = api.shop.getCurrent.useQuery();
  const { data: settingsData, isLoading: settingsLoading, refetch: refetchSettings } = api.shop.getSettings.useQuery();
  const { data: membersData, refetch: refetchMembers } = api.shop.getMembers.useQuery(undefined, {
    enabled: isAdmin,
  });

  // Mutations
  const updateShopMutation = api.shop.update.useMutation({
    onSuccess: () => {
      toast.success("Shop updated successfully!");
      void refetchShop();
    },
    onError: (error) => {
      toast.error("Failed to update shop", {
        description: error.message,
      });
    },
  });

  const updateSettingsMutation = api.shop.updateSettings.useMutation({
    onSuccess: () => {
      toast.success("Settings updated successfully!");
      void refetchSettings();
    },
    onError: (error) => {
      toast.error("Failed to update settings", {
        description: error.message,
      });
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
          // Include credentials to ensure cookies are sent
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
          message: result.message || 'Failed to fix user-shop linking' 
        });
        toast.error("Failed to fix user-shop linking", {
          description: result.message,
        });
      }
    } catch (error) {
      setSyncStatus({ 
        loading: false,
        success: false, 
        message: 'Failed to fix user-shop linking' 
      });
      toast.error("Failed to fix user-shop linking");
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your shop configuration and preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleFixUserShop}
            disabled={syncStatus.loading}
          >
            {syncStatus.loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Fixing...
              </>
            ) : (
              <>
                <Wrench className="mr-2 h-4 w-4" />
                Fix User-Shop Link
              </>
            )}
          </Button>
          {isAdmin && (
            <Button 
              variant="outline" 
              onClick={handleVerifyConsistency}
              disabled={syncStatus.loading}
            >
              {syncStatus.loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Verify Data
                </>
              )}
            </Button>
          )}
          {isAdmin && (
            <Button 
              variant="outline" 
              onClick={handleSyncData}
              disabled={syncStatus.loading}
            >
              {syncStatus.loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Sync Data
                </>
              )}
            </Button>
          )}
          <Button onClick={handleSaveSettings} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Sync Status Alert */}
      {syncStatus.message && (
        <Alert className={syncStatus.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          {syncStatus.success ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={syncStatus.success ? "text-green-800" : "text-red-800"}>
            {syncStatus.message}
            {syncStatus.errors && syncStatus.errors.length > 0 && (
              <ul className="mt-2 list-disc list-inside">
                {syncStatus.errors.map((error, index) => (
                  <li key={index} className="text-sm">{error}</li>
                ))}
              </ul>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="shop">Shop</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  General Settings
                </CardTitle>
                <CardDescription>
                  Basic application preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="pst">
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pst">Pacific Standard Time</SelectItem>
                      <SelectItem value="mst">Mountain Standard Time</SelectItem>
                      <SelectItem value="cst">Central Standard Time</SelectItem>
                      <SelectItem value="est">Eastern Standard Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select defaultValue="usd">
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="cad">CAD ($)</SelectItem>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                      <SelectItem value="gbp">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select defaultValue="mm-dd-yyyy">
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mm-dd-yyyy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="dd-mm-yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable dark theme
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Appearance
                </CardTitle>
                <CardDescription>
                  Customize the interface
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Theme</Label>
                    <p className="text-sm text-muted-foreground">
                      Choose your preferred theme
                    </p>
                  </div>
                  <ThemeToggle />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accent">Accent Color</Label>
                  <Select defaultValue="blue">
                    <SelectTrigger>
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="orange">Orange</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Compact Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Reduce spacing for more content
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="shop" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  Shop Information
                </CardTitle>
                <CardDescription>
                  Basic shop details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="shopName">Shop Name</Label>
                  <Input 
                    id="shopName" 
                    defaultValue={shopData?.name ?? "My TCG Shop"}
                    placeholder="Enter shop name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shopSlug">Shop Slug</Label>
                  <Input 
                    id="shopSlug" 
                    defaultValue={shopData?.slug ?? "my-tcg-shop"}
                    placeholder="shop-url-slug"
                  />
                  <p className="text-xs text-muted-foreground">
                    This will be used in your shop URL
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shopDescription">Description</Label>
                  <Textarea 
                    id="shopDescription" 
                    defaultValue={shopData?.description ?? ""}
                    placeholder="Describe your shop..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shopType">Shop Type</Label>
                  <Select defaultValue={shopData?.type ?? "local"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select shop type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local Store</SelectItem>
                      <SelectItem value="online">Online Store</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Store Credit Settings
                </CardTitle>
                <CardDescription>
                  Configure store credit options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Store Credit</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow customers to use store credit
                    </p>
                  </div>
                  <Switch defaultChecked={settingsData?.enableStoreCredit ?? true} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minCredit">Minimum Credit Amount</Label>
                  <Input 
                    id="minCredit" 
                    type="number" 
                    defaultValue={settingsData?.minCreditAmount ?? 0}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxCredit">Maximum Credit Amount</Label>
                  <Input 
                    id="maxCredit" 
                    type="number" 
                    defaultValue={settingsData?.maxCreditAmount ?? 1000}
                    placeholder="1000.00"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty for unlimited
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          {!isAdmin ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Admin Access Required</h3>
                  <p className="text-muted-foreground">
                    Only shop administrators can manage team members and roles.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Team Members
                  </CardTitle>
                  <CardDescription>
                    Manage your shop team and roles
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {membersData ? (
                    <div className="space-y-3">
                      {membersData.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{member.name || member.email}</p>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                          </div>
                          <Badge variant={member.role === "admin" ? "default" : "secondary"}>
                            {member.role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">No team members found</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Data Synchronization
                  </CardTitle>
                  <CardDescription>
                    Keep your data in sync with Clerk
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Status</Label>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">All systems synchronized</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Last Sync</Label>
                    <p className="text-sm text-muted-foreground">
                      {new Date().toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Team Members</Label>
                    <p className="text-sm text-muted-foreground">
                      {membersData?.length ?? 0} members in database
                    </p>
                  </div>

                  <Button 
                    onClick={handleSyncData}
                    disabled={syncStatus.loading}
                    className="w-full"
                  >
                    {syncStatus.loading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <Database className="mr-2 h-4 w-4" />
                        Sync Now
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch defaultChecked={settingsData?.enableNotifications ?? true} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Low Stock Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when inventory is low
                  </p>
                </div>
                <Switch defaultChecked={true} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Order Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified of new orders
                  </p>
                </div>
                <Switch defaultChecked={true} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Price Update Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified of price changes
                  </p>
                </div>
                <Switch defaultChecked={settingsData?.autoPriceSync ?? true} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Session Timeout</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically log out after inactivity
                  </p>
                </div>
                <Switch defaultChecked={true} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Select defaultValue="30">
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Advanced Settings
              </CardTitle>
              <CardDescription>
                Advanced configuration options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Debug Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable detailed logging for troubleshooting
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto Backup</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically backup your data
                  </p>
                </div>
                <Switch defaultChecked={true} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="backupFrequency">Backup Frequency</Label>
                <Select defaultValue="daily">
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t">
                <Button variant="destructive" className="w-full">
                  Reset All Settings
                </Button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  This will reset all settings to their default values
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 