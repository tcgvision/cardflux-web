"use client";

import { useLoading } from "./loading-provider";
import { Loader2 } from "lucide-react";

export function RouteLoadingOverlay() {
  const { isRouteChanging } = useLoading();

  if (!isRouteChanging) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-lg bg-background p-6 shadow-lg border">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
} 