import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const groceryRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.itemGroceryList.findMany();
  }),

  getAllOpen: publicProcedure.query(async ({ ctx }) => {
    // Define the order of categories
    const categoryOrder = [
      "Obst & Gemüse",
      "Frühstück",
      "Snacks",
      "Teigwaren",
      "Backen",
      "Milchprodukte",
      "Kühlfach",
      "Sonstiges",
      "Haushalt"
    ];

    const items = await ctx.prisma.itemGroceryList.findMany({
      where: {
        completed: false,
      },
    });

    // Sort items by category order and then alphabetically by name within each category
    items.sort((a, b) => {
      const categoryAIndex = categoryOrder.indexOf(a.category);
      const categoryBIndex = categoryOrder.indexOf(b.category);

      if (categoryAIndex !== categoryBIndex) {
        return categoryAIndex - categoryBIndex;
      }

      return a.name.localeCompare(b.name);
    });

    return items;
  }),

  create: publicProcedure
    .input(
      z.object({
        usageDate: z.string().min(1).max(280),
        name: z.string().min(1).max(280),
        reference: z.string().min(1).max(280),
        completed: z.boolean().optional(),
        category: z.string().min(1).max(280),  // Add this line
      })
    )
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.prisma.itemGroceryList.create({
        data: {
          usageDate: input.usageDate,
          name: input.name,
          reference: input.reference,
          completed: input.completed,
          category: input.category,  // Add this line
        },
      });

      return item;
    }),

  delete: publicProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.prisma.itemGroceryList.delete({
        where: {
          id: input.id,
        },
      });

      return item;
    }),
});
