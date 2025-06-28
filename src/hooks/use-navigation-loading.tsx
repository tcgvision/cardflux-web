"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function useNavigationLoading() {
  const [loadingItem, setLoadingItem] = useState<string | null>(null);
  const pathname = usePathname();

  // Clear loading state when pathname changes
  useEffect(() => {
    setLoadingItem(null);
  }, [pathname]);

  const startLoading = (url: string) => {
    setLoadingItem(url);
  };

  const stopLoading = () => {
    setLoadingItem(null);
  };

  return {
    loadingItem,
    startLoading,
    stopLoading,
  };
} 