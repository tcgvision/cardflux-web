import { createTRPCRouter } from "~/server/api/trpc";
import { shopRouter } from "./routers/shop";
import { customerRouter } from "./routers/customer";
import { transactionRouter } from "./routers/transaction";
import { createCallerFactory } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  shop: shopRouter,
  customer: customerRouter,
  transaction: transactionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
