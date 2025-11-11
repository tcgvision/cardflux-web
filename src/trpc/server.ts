// tRPC server disabled for landing page deployment
// TODO: Restore from server.ts.bak after deployment

import "server-only";
import type { ReactNode } from "react";

// Stub API that returns empty object
export const api = new Proxy({} as any, {
  get: () => {
    return new Proxy({} as any, {
      get: () => ({
        useQuery: () => ({ data: null, isLoading: false, error: null }),
        useMutation: () => ({ mutate: () => {}, isLoading: false }),
      }),
    });
  },
});

// Stub HydrateClient that just renders children
export function HydrateClient({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
