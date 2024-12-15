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

    update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Name is required"),
        description: z.string().nullable(),
        ingredient1: z.string().nullable(),
        ingredient2: z.string().nullable(),
        ingredient3: z.string().nullable(),
        ingredient4: z.string().nullable(),
        ingredient5: z.string().nullable(),
        ingredient6: z.string().nullable(),
        ingredient7: z.string().nullable(),
        ingredient8: z.string().nullable(),
        ingredient9: z.string().nullable(),
        ingredient10: z.string().nullable(),
        ingredient11: z.string().nullable(),
        ingredient12: z.string().nullable(),
        ingredient13: z.string().nullable(),
        ingredient14: z.string().nullable(),
        ingredient15: z.string().nullable(),
        categories: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const updatedMeal = await ctx.prisma.meal.update({
          where: {
            id: input.id,
          },
          data: {
            name: input.name,
            description: input.description,
            ingredient1: input.ingredient1,
            ingredient2: input.ingredient2,
            ingredient3: input.ingredient3,
            ingredient4: input.ingredient4,
            ingredient5: input.ingredient5,
            ingredient6: input.ingredient6,
            ingredient7: input.ingredient7,
            ingredient8: input.ingredient8,
            ingredient9: input.ingredient9,
            ingredient10: input.ingredient10,
            ingredient11: input.ingredient11,
            ingredient12: input.ingredient12,
            ingredient13: input.ingredient13,
            ingredient14: input.ingredient14,
            ingredient15: input.ingredient15,
            categories: input.categories,
          },
        });

        return updatedMeal;
      } catch (error) {
        throw new Error("Failed to update meal");
      }
    }),
});
