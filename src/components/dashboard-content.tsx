"use client";

import { useUnifiedShop } from "~/hooks/use-unified-shop";
import { useEffect } from "react";

interface DashboardContentProps {
  children: React.ReactNode;
}

export function DashboardContent({ children }: DashboardContentProps) {
  const { shopName, isLoaded, hasShop, isVerified } = useUnifiedShop();

  // Update document title based on shop context
  useEffect(() => {
    if (isLoaded && hasShop && shopName) {
      document.title = `${shopName} | Card Flux`;
    } else if (isLoaded) {
      document.title = "Card Flux Dashboard";
    }
  }, [shopName, isLoaded, hasShop]);

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col">
        {children}
      </main>
    </div>
  );
} 