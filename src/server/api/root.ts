import { exampleRouter } from "~/server/api/routers/example";
import { createTRPCRouter } from "~/server/api/trpc";
import { mealRouter } from "./routers/meal";
import { postRouter } from "./routers/post";
import { groceryRouter } from "./routers/groceryList";
import { expenseRouter } from "./routers/expense";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  post: postRouter,
  meal: mealRouter,
  groceryList: groceryRouter,
  expense: expenseRouter,

});

// export type definition of API
export type AppRouter = typeof appRouter;

