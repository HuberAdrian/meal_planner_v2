import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { DEFAULT_CATEGORY, groceryCategories, sortByCategory } from "~/lib/meals";

export const groceryRouter = createTRPCRouter({
  /** All items (open and checked off), sorted by store category then name. */
  getAll: publicProcedure.query(async ({ ctx }) => {
    const items = await ctx.prisma.itemGroceryList.findMany();
    return sortByCategory(items);
  }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string().trim().min(1).max(280),
        usageDate: z.string().min(1).max(280),
        reference: z.string().min(1).max(280).default("Manuell"),
        category: z.enum(groceryCategories).default(DEFAULT_CATEGORY),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.itemGroceryList.create({
        data: {
          usageDate: input.usageDate,
          name: input.name,
          reference: input.reference,
          completed: false,
          category: input.category,
        },
      });
    }),

  /** Check / uncheck an item. Persisted so both phones see the same state. */
  setCompleted: publicProcedure
    .input(z.object({ id: z.string(), completed: z.boolean() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.itemGroceryList.update({
        where: { id: input.id },
        data: { completed: input.completed },
      });
    }),

  setManyCompleted: publicProcedure
    .input(z.object({ ids: z.array(z.string()).min(1), completed: z.boolean() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.itemGroceryList.updateMany({
        where: { id: { in: input.ids } },
        data: { completed: input.completed },
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.itemGroceryList.delete({ where: { id: input.id } });
    }),

  deleteMany: publicProcedure
    .input(z.object({ ids: z.array(z.string()).min(1) }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.itemGroceryList.deleteMany({ where: { id: { in: input.ids } } });
    }),

  deleteCompleted: publicProcedure.mutation(({ ctx }) => {
    return ctx.prisma.itemGroceryList.deleteMany({ where: { completed: true } });
  }),
});
