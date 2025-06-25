import { useOrganization, useUser } from "@clerk/nextjs";
import { useState, useEffect, useRef, useCallback } from "react";

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
  const { user } = useUser();
  const [membershipData, setMembershipData] = useState<ShopMembershipData | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const hasCheckedRef = useRef(false);
  const hasShopRef = useRef(false);
  const sessionKey = useRef<string | null>(null);

  // Create a session key to track this browser session
  useEffect(() => {
    sessionKey.current ??= `shop-membership-${Date.now()}-${Math.random()}`;
  }, []);

  // Function to clear cache
  const clearCache = useCallback(() => {
    if (sessionKey.current) {
      sessionStorage.removeItem(sessionKey.current);
    }
    hasCheckedRef.current = false;
    hasShopRef.current = false;
    setMembershipData(null);
  }, []);

  // Check if we have cached membership data for this session
  useEffect(() => {
    if (sessionKey.current) {
      const cached = sessionStorage.getItem(sessionKey.current);
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as ShopMembershipData;
          setMembershipData(parsed);
          hasCheckedRef.current = true;
          if (parsed.hasShop) {
            hasShopRef.current = true;
          }
        } catch (error) {
          console.error("Error parsing cached membership data:", error);
        }
      }
    }
  }, [sessionKey.current]);

  // Smart membership checking logic
  useEffect(() => {
    // If user has Clerk organization, we don't need to check database membership
    if (organization) {
      // Clear any cached database membership data since we have Clerk org
      if (sessionKey.current) {
        sessionStorage.removeItem(sessionKey.current);
      }
      hasCheckedRef.current = true;
      hasShopRef.current = true;
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

    // If we already checked in this session, don't check again
    if (hasCheckedRef.current) {
      return;
    }

    // If currently checking, don't start another check
    if (isChecking) {
      return;
    }

    // Only check database membership if user has no Clerk organization
    // and we haven't checked in this session
    hasCheckedRef.current = true;
    setIsChecking(true);

    fetch('/api/check-shop-membership')
      .then(response => response.json())
      .then((data: ShopMembershipData) => {
        setMembershipData(data);
        
        // Cache the result for this session
        if (sessionKey.current) {
          sessionStorage.setItem(sessionKey.current, JSON.stringify(data));
        }
        
        // Mark that we found a shop to prevent re-checking
        if (data.hasShop) {
          hasShopRef.current = true;
        }
      })
      .catch(error => {
        console.error("Error checking membership:", error);
        const errorData = { hasShop: false, message: "Failed to check membership" };
        setMembershipData(errorData);
        
        // Cache the error result to prevent repeated failed requests
        if (sessionKey.current) {
          sessionStorage.setItem(sessionKey.current, JSON.stringify(errorData));
        }
      })
      .finally(() => {
        setIsChecking(false);
      });
  }, [orgLoaded, organization, isChecking]);

  // Clear cache when user changes (logout/login)
  useEffect(() => {
    if (user?.id && sessionKey.current) {
      const userKey = `user-${user.id}`;
      const lastUser = sessionStorage.getItem(userKey);
      
      if (lastUser !== sessionKey.current) {
        // User changed, clear old cache
        sessionStorage.removeItem(lastUser ?? '');
        sessionStorage.setItem(userKey, sessionKey.current);
      }
    }
  }, [user?.id]);

  return {
    organization,
    orgLoaded,
    membershipData,
    isChecking,
    clearCache, // Export the clear cache function
  };
} 