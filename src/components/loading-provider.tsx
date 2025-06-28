"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  startLoading: () => void;
  stopLoading: () => void;
  isRouteChanging: boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isRouteChanging, setIsRouteChanging] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  const startLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  // Enhanced route change detection
  useEffect(() => {
    const handleStart = () => {
      setIsRouteChanging(true);
      setIsLoading(true);
    };

    const handleComplete = () => {
      setIsRouteChanging(false);
      setIsLoading(false);
    };

    // Listen for route changes
    const handleRouteChange = () => {
      handleStart();
      // Add a small delay to ensure the loading state is visible
      setTimeout(handleComplete, 100);
    };

    // Reset loading state when pathname changes
    const handlePathnameChange = () => {
      setIsRouteChanging(false);
      setIsLoading(false);
    };

    // Use a timeout to handle the route change completion
    const timeoutId = setTimeout(handlePathnameChange, 50);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [pathname]);

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        setLoading,
        startLoading,
        stopLoading,
        isRouteChanging,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
} 