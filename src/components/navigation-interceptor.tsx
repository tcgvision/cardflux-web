"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLoading } from "./loading-provider";

export function NavigationInterceptor() {
  const { startLoading, stopLoading } = useLoading();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleRouteChangeStart = () => {
      startLoading();
    };

    const handleRouteChangeComplete = () => {
      // Small delay to ensure smooth transition
      setTimeout(() => {
        stopLoading();
      }, 100);
    };

    // Listen for navigation events
    const handleBeforeUnload = () => {
      startLoading();
    };

    // Add event listeners
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Handle route change completion
    const timeoutId = setTimeout(handleRouteChangeComplete, 50);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      clearTimeout(timeoutId);
    };
  }, [pathname, startLoading, stopLoading]);

  return null;
} 