import { useOrganization } from "@clerk/nextjs";
import { useState, useEffect, useRef } from "react";

interface ShopMembershipData {
  hasShop: boolean;
  shop?: {
    id: string;
    name: string;
    slug: string;
  };
  message?: string;
  error?: string;
}

export function useShopMembership() {
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const [membershipData, setMembershipData] = useState<ShopMembershipData | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const hasCheckedRef = useRef(false);
  const hasShopRef = useRef(false);

  // Simple logic: only check once when user has no organization
  useEffect(() => {
    // If user has organization, don't check membership
    if (organization) {
      return;
    }

    // If org not loaded yet, wait
    if (!orgLoaded) {
      return;
    }

    // If we already checked and found a shop, don't check again
    if (hasCheckedRef.current && hasShopRef.current) {
      return;
    }

    // If we already checked, don't check again
    if (hasCheckedRef.current) {
      return;
    }

    // If currently checking, don't start another check
    if (isChecking) {
      return;
    }

    console.log('🚀 Making membership check request...');
    hasCheckedRef.current = true;
    setIsChecking(true);

    fetch('/api/check-shop-membership')
      .then(response => response.json())
      .then((data: ShopMembershipData) => {
        console.log('✅ Membership check result:', data);
        setMembershipData(data);
        
        // Mark that we found a shop to prevent re-checking
        if (data.hasShop) {
          hasShopRef.current = true;
        }
      })
      .catch(error => {
        console.error("❌ Error checking membership:", error);
        setMembershipData({ hasShop: false, message: "Failed to check membership" });
      })
      .finally(() => {
        setIsChecking(false);
      });
  }, [orgLoaded, organization, isChecking]);

  return {
    organization,
    orgLoaded,
    membershipData,
    isChecking,
  };
} 