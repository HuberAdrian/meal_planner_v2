import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const mealRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.meal.findMany();
  }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        ingredients: z.array(z.string()),
        categories: z.array(z.string()), // Add this line
        completed: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Create an object to hold the ingredients
      const ingredientsObject: Record<string, string> = {};
      input.ingredients.forEach((ingredient, index) => {
        if (index < 15) { // as we have only 15 ingredient fields in the database model
          ingredientsObject[`ingredient${index + 1}`] = ingredient;
        }
      });

      const meal = await ctx.prisma.meal.create({
        data: {
          name: input.name,
          description: input.description,
          ...ingredientsObject,
          categories: input.categories, // Add this line
          completed: input.completed ?? false,
        },
      });

      return meal;
    }),

  delete: publicProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const meal = await ctx.prisma.meal.delete({
        where: {
          id: input.id,
        },
      });

      return meal;
    }),
});
