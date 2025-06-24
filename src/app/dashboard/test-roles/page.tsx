"use client";

import { useOrganization, useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { ROLES } from "~/lib/roles";
import { toast } from "sonner";

export default function TestRolesPage() {
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const { user, isLoaded: userLoaded } = useUser();

  // Test API calls that require different role permissions
  const { data: shopData, error: shopError } = api.shop.getCurrent.useQuery();
  const { data: statsData, error: statsError } = api.shop.getStats.useQuery();
  const { data: membersData, error: membersError } = api.shop.getMembers.useQuery();
  const { data: userRoleData, error: userRoleError } = api.team.getCurrentUserRole.useQuery();

  const testAdminAction = api.shop.updateSettings.useMutation({
    onSuccess: () => {
      toast.success("Admin action successful!");
    },
    onError: (error) => {
      toast.error(`Admin action failed: ${error.message}`);
    },
  });

  const handleTestAdminAction = () => {
    testAdminAction.mutate({
      enableNotifications: true,
    });
  };

  if (!orgLoaded || !userLoaded) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Loading user and organization data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Role Detection Test</CardTitle>
          <CardDescription>
            This page tests if the application correctly detects user roles and permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* User Information */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-semibold mb-2">User Information</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Name:</strong> {user?.fullName ?? "N/A"}</p>
                <p><strong>Email:</strong> {user?.primaryEmailAddress?.emailAddress ?? "N/A"}</p>
                <p><strong>User ID:</strong> {user?.id ?? "N/A"}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Organization Information</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Organization:</strong> {organization?.name ?? "N/A"}</p>
                <p><strong>Org ID:</strong> {organization?.id ?? "N/A"}</p>
                <p><strong>Role:</strong> 
                  <Badge className="ml-2" variant="secondary">
                    Check API Data Below
                  </Badge>
                </p>
              </div>
            </div>
          </div>

          {/* API Test Results */}
          <div>
            <h3 className="font-semibold mb-2">API Permission Tests</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span>Shop Data Access:</span>
                {shopError ? (
                  <Badge variant="destructive">Failed: {shopError.message}</Badge>
                ) : (
                  <Badge variant="default">Success</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span>Stats Access:</span>
                {statsError ? (
                  <Badge variant="destructive">Failed: {statsError.message}</Badge>
                ) : (
                  <Badge variant="default">Success</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span>Members Access (Admin Only):</span>
                {membersError ? (
                  <Badge variant="destructive">Failed: {membersError.message}</Badge>
                ) : (
                  <Badge variant="default">Success (Admin)</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span>User Role Data:</span>
                {userRoleError ? (
                  <Badge variant="destructive">Failed: {userRoleError.message}</Badge>
                ) : (
                  <Badge variant="default">Success</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Role Data from API */}
          {userRoleData && (
            <div>
              <h3 className="font-semibold mb-2">Role Data from API</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Detected Role:</strong> 
                  <Badge className="ml-2" variant={userRoleData.role === ROLES.ADMIN ? "destructive" : "secondary"}>
                    {userRoleData.role}
                  </Badge>
                </p>
                <div>
                  <strong>Permissions:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>Can Invite Members: {userRoleData.permissions.canInviteMembers ? "✅" : "❌"}</li>
                    <li>Can Manage Roles: {userRoleData.permissions.canManageRoles ? "✅" : "❌"}</li>
                    <li>Can Remove Members: {userRoleData.permissions.canRemoveMembers ? "✅" : "❌"}</li>
                    <li>Can View Analytics: {userRoleData.permissions.canViewAnalytics ? "✅" : "❌"}</li>
                    <li>Can Manage Inventory: {userRoleData.permissions.canManageInventory ? "✅" : "❌"}</li>
                    <li>Can Process Transactions: {userRoleData.permissions.canProcessTransactions ? "✅" : "❌"}</li>
                    <li>Can Manage Customers: {userRoleData.permissions.canManageCustomers ? "✅" : "❌"}</li>
                    <li>Can View Reports: {userRoleData.permissions.canViewReports ? "✅" : "❌"}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Test Admin Action */}
          <div>
            <h3 className="font-semibold mb-2">Test Admin Action</h3>
            <Button 
              onClick={handleTestAdminAction}
              disabled={testAdminAction.isPending}
              variant="outline"
            >
              {testAdminAction.isPending ? "Testing..." : "Test Admin Settings Update"}
            </Button>
            <p className="text-xs text-muted-foreground mt-1">
              This will attempt to update shop settings (admin only)
            </p>
          </div>

          {/* Debug Information */}
          <div>
            <h3 className="font-semibold mb-2">Debug Information</h3>
            <details className="text-xs">
              <summary className="cursor-pointer">Click to expand</summary>
              <pre className="mt-2 p-2 bg-muted rounded overflow-auto">
                {JSON.stringify({
                  user: {
                    id: user?.id,
                    email: user?.primaryEmailAddress?.emailAddress,
                  },
                  organization: {
                    id: organization?.id,
                    name: organization?.name,
                    membership: {
                      role: organization?.membership?.role,
                      permissions: organization?.membership?.permissions,
                    },
                  },
                  apiData: {
                    shopData: shopData ? "Available" : "Not available",
                    statsData: statsData ? "Available" : "Not available",
                    membersData: membersData ? "Available" : "Not available",
                    userRoleData: userRoleData ? "Available" : "Not available",
                  },
                }, null, 2)}
              </pre>
            </details>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 