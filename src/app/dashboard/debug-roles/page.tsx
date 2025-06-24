"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { ROLES } from "~/lib/roles";
import { toast } from "sonner";

export default function DebugRolesPage() {
  // Test basic role info
  const { data: roleInfo, error: roleError } = api.debug.getRoleInfo.useQuery();
  
  // Test shop role info
  const { data: shopRoleInfo, error: shopRoleError } = api.debug.getShopRoleInfo.useQuery();
  
  // Test basic access
  const { data: basicTest, error: basicError, refetch: refetchBasic } = api.debug.testBasicAccess.useQuery();
  
  // Test admin access
  const { data: adminTest, error: adminError, refetch: refetchAdmin } = api.debug.testAdminAccess.useQuery(undefined, {
    retry: false,
  });
  
  // Test member access
  const { data: memberTest, error: memberError, refetch: refetchMember } = api.debug.testMemberAccess.useQuery(undefined, {
    retry: false,
  });

  const handleTestBasic = () => {
    void refetchBasic();
  };

  const handleTestAdmin = () => {
    void refetchAdmin();
  };

  const handleTestMember = () => {
    void refetchMember();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Role Detection Debug</CardTitle>
          <CardDescription>
            Testing role detection and permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Role Info */}
          <div>
            <h3 className="font-semibold mb-2">Basic Role Information</h3>
            {roleError ? (
              <Badge variant="destructive">Error: {roleError.message}</Badge>
            ) : roleInfo ? (
              <div className="space-y-2 text-sm">
                <p><strong>User ID:</strong> {roleInfo.userId}</p>
                <p><strong>Org ID:</strong> {roleInfo.orgId}</p>
                <p><strong>Org Role (from Clerk):</strong> 
                  <Badge className="ml-2" variant={roleInfo.orgRole === ROLES.ADMIN ? "destructive" : "secondary"}>
                    {roleInfo.orgRole ?? "null/undefined"}
                  </Badge>
                </p>
                <p><strong>Normalized Role:</strong> 
                  <Badge className="ml-2" variant={roleInfo.normalizedRole === ROLES.ADMIN ? "destructive" : "secondary"}>
                    {roleInfo.normalizedRole ?? "null"}
                  </Badge>
                </p>
                <p><strong>Effective Role (with fallback):</strong> 
                  <Badge className="ml-2" variant={roleInfo.effectiveRole === ROLES.ADMIN ? "destructive" : "secondary"}>
                    {roleInfo.effectiveRole}
                  </Badge>
                </p>
                <p><strong>Is Role Valid:</strong> {roleInfo.isRoleValid ? "✅" : "❌"}</p>
                <p><strong>Default Role:</strong> {roleInfo.defaultRole}</p>
                <p><strong>Has Admin Permission:</strong> {roleInfo.hasAdminPermission ? "✅" : "❌"}</p>
                <p><strong>Has Member Permission:</strong> {roleInfo.hasMemberPermission ? "✅" : "❌"}</p>
                
                {/* Debug Information */}
                <div className="mt-4 p-3 bg-muted rounded">
                  <h4 className="font-medium mb-2">Debug Details:</h4>
                  <p><strong>Org Role Type:</strong> {roleInfo.debug.orgRoleType}</p>
                  <p><strong>Org Role Value:</strong> {JSON.stringify(roleInfo.debug.orgRoleValue)}</p>
                  <p><strong>Normalized Role Value:</strong> {JSON.stringify(roleInfo.debug.normalizedRoleValue)}</p>
                  <p><strong>User Level:</strong> {roleInfo.debug.userLevel}</p>
                  <p><strong>Required Admin Level:</strong> {roleInfo.debug.requiredAdminLevel}</p>
                  <p><strong>Required Member Level:</strong> {roleInfo.debug.requiredMemberLevel}</p>
                </div>
              </div>
            ) : (
              <p>Loading...</p>
            )}
          </div>

          {/* Shop Role Info */}
          <div>
            <h3 className="font-semibold mb-2">Shop Role Information</h3>
            {shopRoleError ? (
              <Badge variant="destructive">Error: {shopRoleError.message}</Badge>
            ) : shopRoleInfo ? (
              <div className="space-y-2 text-sm">
                <p><strong>Shop ID:</strong> {shopRoleInfo.shopId}</p>
                <p><strong>Shop Name:</strong> {shopRoleInfo.shopName}</p>
                <p><strong>User Shop ID:</strong> {shopRoleInfo.userShopId}</p>
                <p><strong>Org Role (from Clerk):</strong> 
                  <Badge className="ml-2" variant={shopRoleInfo.orgRole === ROLES.ADMIN ? "destructive" : "secondary"}>
                    {shopRoleInfo.orgRole ?? "null/undefined"}
                  </Badge>
                </p>
                <p><strong>Effective Role (with fallback):</strong> 
                  <Badge className="ml-2" variant={shopRoleInfo.effectiveRole === ROLES.ADMIN ? "destructive" : "secondary"}>
                    {shopRoleInfo.effectiveRole}
                  </Badge>
                </p>
                <p><strong>Is Role Valid:</strong> {shopRoleInfo.isRoleValid ? "✅" : "❌"}</p>
                <p><strong>Has Admin Permission:</strong> {shopRoleInfo.hasAdminPermission ? "✅" : "❌"}</p>
                <p><strong>Has Member Permission:</strong> {shopRoleInfo.hasMemberPermission ? "✅" : "❌"}</p>
              </div>
            ) : (
              <p>Loading...</p>
            )}
          </div>

          {/* Permission Tests */}
          <div>
            <h3 className="font-semibold mb-2">Permission Tests</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span>Basic Access Test:</span>
                  {basicError ? (
                    <Badge variant="destructive">Failed: {basicError.message}</Badge>
                  ) : basicTest ? (
                    <Badge variant="default">Success: {basicTest.message}</Badge>
                  ) : (
                    <Badge variant="secondary">Not tested</Badge>
                  )}
                </div>
                <Button onClick={handleTestBasic} variant="outline" size="sm">
                  Test Basic Access
                </Button>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span>Admin Access Test:</span>
                  {adminError ? (
                    <Badge variant="destructive">Failed: {adminError.message}</Badge>
                  ) : adminTest ? (
                    <Badge variant="default">Success: {adminTest.message}</Badge>
                  ) : (
                    <Badge variant="secondary">Not tested</Badge>
                  )}
                </div>
                <Button onClick={handleTestAdmin} variant="outline" size="sm">
                  Test Admin Access
                </Button>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span>Member Access Test:</span>
                  {memberError ? (
                    <Badge variant="destructive">Failed: {memberError.message}</Badge>
                  ) : memberTest ? (
                    <Badge variant="default">Success: {memberTest.message}</Badge>
                  ) : (
                    <Badge variant="secondary">Not tested</Badge>
                  )}
                </div>
                <Button onClick={handleTestMember} variant="outline" size="sm">
                  Test Member Access
                </Button>
              </div>
            </div>
          </div>

          {/* Raw Data */}
          <div>
            <h3 className="font-semibold mb-2">Raw Data</h3>
            <details className="text-xs">
              <summary className="cursor-pointer">Click to expand</summary>
              <pre className="mt-2 p-2 bg-muted rounded overflow-auto">
                {JSON.stringify({
                  roleInfo,
                  shopRoleInfo,
                  basicTest,
                  adminTest,
                  memberTest,
                }, null, 2)}
              </pre>
            </details>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 