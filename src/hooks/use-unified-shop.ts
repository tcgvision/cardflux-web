import { useOrganization, useUser } from "@clerk/nextjs";
import { useShopMembership } from "./use-shop-membership";
import { useMemo } from "react";

interface UnifiedShopContext {
  shopId: string | null;
  shopName: string | null;
  isLoaded: boolean;
  hasShop: boolean;
  source: "clerk" | "database" | null;
  needsSync: boolean;
}

// Type for Clerk organization membership
interface ClerkOrgMembership {
  organization: {
    id: string;
    name: string;
  };
  role: string;
}

export function useUnifiedShop(): UnifiedShopContext {
  const { organization, isLoaded: clerkLoaded } = useOrganization();
  const { user } = useUser();
  const { membershipData, isChecking } = useShopMembership();

  // Use useMemo to prevent unnecessary recalculations
  const unifiedContext = useMemo((): UnifiedShopContext => {
    // Check organization memberships directly from user object
    const userOrgMemberships = (user?.organizationMemberships as ClerkOrgMembership[]) ?? [];
    const hasUserOrgMembership = userOrgMemberships.length > 0;
    
    // Determine the primary source of shop information
    const hasClerkOrg = !!organization;
    const hasDbMembership = !!membershipData?.hasShop;
    
    // Check if there's a mismatch that needs syncing
    const needsSync = clerkLoaded && !isChecking && 
      ((hasClerkOrg && !hasDbMembership) || (!hasClerkOrg && hasDbMembership) || 
       (hasUserOrgMembership && !hasDbMembership) || (!hasUserOrgMembership && hasDbMembership));

    // Priority: Clerk organization > User org memberships > Database membership
    if (hasClerkOrg && organization) {
      return {
        shopId: organization.id,
        shopName: organization.name,
        isLoaded: clerkLoaded,
        hasShop: true,
        source: "clerk",
        needsSync,
      };
    }

    // Check if user has organization memberships that match the database shop
    if (hasUserOrgMembership && hasDbMembership && membershipData?.shop) {
      const matchingOrg = userOrgMemberships.find((org: ClerkOrgMembership) => 
        org.organization?.id === membershipData.shop?.id
      );
      
      if (matchingOrg) {
        return {
          shopId: matchingOrg.organization.id,
          shopName: matchingOrg.organization.name,
          isLoaded: clerkLoaded && !isChecking,
          hasShop: true,
          source: "clerk",
          needsSync: false, // No sync needed since we found a match
        };
      }
    }

    if (hasDbMembership && membershipData?.shop) {
      return {
        shopId: membershipData.shop.id,
        shopName: membershipData.shop.name,
        isLoaded: clerkLoaded && !isChecking,
        hasShop: true,
        source: "database",
        needsSync,
      };
    }

    return {
      shopId: null,
      shopName: null,
      isLoaded: clerkLoaded && !isChecking,
      hasShop: false,
      source: null,
      needsSync: false,
    };
  }, [
    clerkLoaded,
    membershipData?.hasShop,
    isChecking,
    membershipData?.shop,
    organization,
    user,
  ]);

  return unifiedContext;
} 