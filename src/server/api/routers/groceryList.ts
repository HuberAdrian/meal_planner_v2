import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";


type ItemGroceryList = {
    id: string;
    createdAt: Date;
    usageDate: string;
    name: string;
    reference: string;
    completed: boolean;
};


export const groceryRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.itemGroceryList.findMany();
  }),


  getAllOpen: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.itemGroceryList.findMany({
      where: {
        completed: false,
      },
    });
  }),



  create: publicProcedure
  .input(
    z.object({
      usageDate: z.string().min(1).max(280),
        name: z.string().min(1).max(280),
        reference: z.string().min(1).max(280),
        completed: z.boolean().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {


    const item:ItemGroceryList = await ctx.prisma.itemGroceryList.create({
      data: {
        usageDate: input.usageDate,
        name: input.name,
        reference: input.reference,
        completed: input.completed,

      },
    });

    return item;
  }
),



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
