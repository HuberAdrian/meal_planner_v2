import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { MAX_INGREDIENTS, ingredientsToSlots, mealTypes } from "~/lib/meals";

const ingredientInput = z.object({
  name: z.string().max(200),
  // Unknown categories are dropped by ingredientsToSlots.
  category: z.string().max(100),
});

const mealInput = z.object({
  name: z.string().trim().min(1, "Name fehlt").max(200),
  description: z.string().max(5000).optional().nullable(),
  type: z.enum(mealTypes),
  ingredients: z.array(ingredientInput).max(MAX_INGREDIENTS),
});

function toData(input: z.infer<typeof mealInput>) {
  const { columns, categories } = ingredientsToSlots(input.ingredients);
  const description = input.description?.trim();
  return {
    name: input.name.trim(),
    description: description ? description : null,
    type: input.type,
    categories,
    ...columns,
  };
}

export const mealRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const meals = await ctx.prisma.meal.findMany();
    return meals.sort((a, b) => a.name.localeCompare(b.name, "de"));
  }),

  create: publicProcedure.input(mealInput).mutation(({ ctx, input }) => {
    return ctx.prisma.meal.create({ data: toData(input) });
  }),

  update: publicProcedure
    .input(mealInput.extend({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      const { id, ...rest } = input;
      return ctx.prisma.meal.update({ where: { id }, data: toData(rest) });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.meal.delete({ where: { id: input.id } });
    }),
});
