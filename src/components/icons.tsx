import { Loader2 } from "lucide-react";

/**
 * Icons Component
 * 
 * A collection of commonly used icons throughout the application.
 * Uses Lucide React icons for consistency and performance.
 * 
 * @example
 * ```tsx
 * <Icons.spinner className="h-4 w-4 animate-spin" />
 * ```
 */
export const Icons = {
  /**
   * Spinner icon used for loading states
   * @see https://lucide.dev/icons/loader-2
   */
  spinner: Loader2,
} as const; 