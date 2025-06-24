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

export function useUnifiedShop(): UnifiedShopContext {
  const { organization, isLoaded: clerkLoaded } = useOrganization();
  const { user } = useUser();
  const { membershipData, isChecking } = useShopMembership();

  // Use useMemo to prevent unnecessary recalculations and infinite re-renders
  const unifiedContext = useMemo((): UnifiedShopContext => {
    // Check organization memberships directly from user object
    const userOrgMemberships = (user as any)?.organizationMemberships ?? [];
    const hasUserOrgMembership = userOrgMemberships.length > 0;
    
    // Determine the primary source of shop information
    const hasClerkOrg = !!organization;
    const hasDbMembership = !!membershipData?.hasShop;
    
    // Comprehensive logging for debugging
    console.log('🔍 UNIFIED SHOP DEBUG:', {
      clerkLoaded,
      isChecking,
      organization: {
        id: organization?.id,
        name: organization?.name,
        exists: !!organization,
      },
      userOrgMemberships: {
        count: userOrgMemberships.length,
        orgs: userOrgMemberships.map((org: any) => ({
          id: org.organization?.id,
          name: org.organization?.name,
          role: org.role,
        })),
        hasMembership: hasUserOrgMembership,
      },
      membershipData: {
        hasShop: membershipData?.hasShop,
        shopId: membershipData?.shop?.id,
        shopName: membershipData?.shop?.name,
        exists: !!membershipData,
      },
      derived: {
        hasClerkOrg,
        hasDbMembership,
        hasUserOrgMembership,
      }
    });
    
    // Check if there's a mismatch that needs syncing
    // Now we check both useOrganization and user organization memberships
    const needsSync = clerkLoaded && !isChecking && 
      ((hasClerkOrg && !hasDbMembership) || (!hasClerkOrg && hasDbMembership) || 
       (hasUserOrgMembership && !hasDbMembership) || (!hasUserOrgMembership && hasDbMembership));

    console.log('🔄 SYNC STATUS:', {
      needsSync,
      reason: needsSync ? 
        (hasClerkOrg && !hasDbMembership) ? 'Has Clerk org but no DB membership' :
        (!hasClerkOrg && hasDbMembership) ? 'Has DB membership but no Clerk org' :
        (hasUserOrgMembership && !hasDbMembership) ? 'Has user org membership but no DB membership' :
        (!hasUserOrgMembership && hasDbMembership) ? 'Has DB membership but no user org membership' : 'Unknown'
        : 'No sync needed'
    });

    // Priority: Clerk organization > User org memberships > Database membership
    if (hasClerkOrg && organization) {
      console.log('✅ Using Clerk organization as primary source');
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
      const matchingOrg = userOrgMemberships.find((org: any) => 
        org.organization?.id === membershipData.shop?.id
      );
      
      if (matchingOrg) {
        console.log('✅ Using user organization membership as primary source');
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
      console.log('📊 Using database membership as primary source');
      return {
        shopId: membershipData.shop.id,
        shopName: membershipData.shop.name,
        isLoaded: clerkLoaded && !isChecking,
        hasShop: true,
        source: "database",
        needsSync,
      };
    }

    console.log('❌ No shop membership found from any source');
    return {
      shopId: null,
      shopName: null,
      isLoaded: clerkLoaded && !isChecking,
      hasShop: false,
      source: null,
      needsSync: false,
    };
  }, [
    // organization?.id,
    // organization?.name,
    clerkLoaded,
    membershipData?.hasShop,
    // membershipData?.shop?.id,
    // membershipData?.shop?.name,
    isChecking,
    membershipData?.shop,
    organization,
    user,
  ]);

  return unifiedContext;
} 