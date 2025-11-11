// Root router disabled for landing page deployment
// TODO: Restore from src/server.bak after deployment

import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

export const appRouter = createTRPCRouter({
  // Empty router for landing page
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
