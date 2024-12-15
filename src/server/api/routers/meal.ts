import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

const mealTypes = [
  "Nudelgerichte",
  "Kartoffelgerichte",
  "Reisgerichte",
  "andere Hauptgerichte",
  "Backen",
  "Frühstück",
  "Snacks",
  "Salate",
  "Suppen",
] as const;

export const mealRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.meal.findMany({
      orderBy: { createdAt: "desc" },
    });
  }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        ingredients: z.array(z.string()),
        categories: z.array(z.string()),
        type: z.enum(mealTypes),  // Add type validation
      })
    )
    .mutation(async ({ ctx, input }) => {
      const ingredients: Record<string, string | null> = {};
      input.ingredients.forEach((ingredient, index) => {
        if (ingredient) {
          ingredients[`ingredient${index + 1}`] = ingredient;
        }
      });

      return ctx.prisma.meal.create({
        data: {
          name: input.name,
          description: input.description,
          categories: input.categories,
          type: input.type,  // Add type to creation
          ...ingredients,
        },
      });
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
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
        type: z.enum(mealTypes),  // Add type validation
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.meal.update({
        where: { id },
        data,
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.meal.delete({
        where: { id: input.id },
      });
    }),
});


