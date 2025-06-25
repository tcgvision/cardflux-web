import { useOrganization, useUser } from "@clerk/nextjs";
import { useShopMembership } from "./use-shop-membership";
import { useMemo } from "react";

interface SyncStatus {
  needsSync: boolean;
  syncReason: string | null;
  canAutoSync: boolean;
  syncAction: "none" | "invitation" | "refresh" | "manual";
}

// Type for Clerk organization membership
interface ClerkOrgMembership {
  organization: {
    id: string;
    name: string;
  };
  role: string;
}

export function useSyncStatus(): SyncStatus {
  const { organization, isLoaded: clerkLoaded } = useOrganization();
  const { user } = useUser();
  const { membershipData, isChecking } = useShopMembership();

  return useMemo((): SyncStatus => {
    // If still loading, no sync needed
    if (!clerkLoaded || isChecking) {
      return {
        needsSync: false,
        syncReason: null,
        canAutoSync: false,
        syncAction: "none"
      };
    }

    // Check organization memberships directly from user object
    const userOrgMemberships = (user?.organizationMemberships as ClerkOrgMembership[]) ?? [];
    const hasUserOrgMembership = userOrgMemberships.length > 0;
    
    // Determine the primary source of shop information
    const hasClerkOrg = !!organization;
    const hasDbMembership = !!membershipData?.hasShop;

    // Debug logging
    console.log('🔍 SYNC STATUS DEBUG:', {
      clerkLoaded,
      isChecking,
      hasClerkOrg,
      hasDbMembership,
      hasUserOrgMembership,
      userOrgMembershipsCount: userOrgMemberships.length,
      organizationId: organization?.id,
      organizationName: organization?.name,
      dbShopId: membershipData?.shop?.id,
      dbShopName: membershipData?.shop?.name,
    });

    // Case 1: User has active Clerk organization - no sync needed
    if (hasClerkOrg && organization) {
      console.log('✅ SYNC: User has active Clerk organization - no sync needed');
      return {
        needsSync: false,
        syncReason: null,
        canAutoSync: false,
        syncAction: "none"
      };
    }

    // Case 2: User has organization memberships that match database shop - no sync needed
    if (hasUserOrgMembership && hasDbMembership && membershipData?.shop) {
      const matchingOrg = userOrgMemberships.find((org: ClerkOrgMembership) => 
        org.organization?.id === membershipData.shop?.id
      );
      
      if (matchingOrg) {
        console.log('✅ SYNC: User has matching org membership - no sync needed');
        return {
          needsSync: false,
          syncReason: null,
          canAutoSync: false,
          syncAction: "none"
        };
      }
    }

    // Case 3: User has database membership but no Clerk org - needs sync
    if (hasDbMembership && !hasClerkOrg && !hasUserOrgMembership) {
      console.log('⚠️ SYNC: User has database membership but no Clerk org - needs invitation');
      return {
        needsSync: true,
        syncReason: "Database membership found but no Clerk organization detected",
        canAutoSync: false,
        syncAction: "invitation"
      };
    }

    // Case 4: User has Clerk org memberships but no database membership - might need sync
    if (hasUserOrgMembership && !hasDbMembership) {
      console.log('⚠️ SYNC: User has Clerk org memberships but no database membership - needs refresh');
      return {
        needsSync: true,
        syncReason: "Clerk organization memberships found but no database membership",
        canAutoSync: true,
        syncAction: "refresh"
      };
    }

    // Case 5: No shop membership found anywhere - no sync needed
    if (!hasDbMembership && !hasClerkOrg && !hasUserOrgMembership) {
      console.log('ℹ️ SYNC: No shop membership found - no sync needed');
      return {
        needsSync: false,
        syncReason: null,
        canAutoSync: false,
        syncAction: "none"
      };
    }

    // Default case - no sync needed
    console.log('ℹ️ SYNC: Default case - no sync needed');
    return {
      needsSync: false,
      syncReason: null,
      canAutoSync: false,
      syncAction: "none"
    };
  }, [
    clerkLoaded,
    isChecking,
    organization,
    membershipData?.hasShop,
    membershipData?.shop,
    user,
  ]);
} 