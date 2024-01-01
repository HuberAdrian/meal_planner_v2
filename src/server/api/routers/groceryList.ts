import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

/*
model ItemGroceryList {
    id        String   @id @default(cuid()) // generate a unique string identifier
    createdAt DateTime @default(now()) 

    usageDate   String 
    name      String @db.VarChar(255)
    reference   String @db.VarChar(255)
    completed Boolean @default(false)

    @@index([createdAt]) //will be indexed by createdAt
}

*/

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

      // create a post creation that takes in the topic, content and eventDate of the post and creates an entry in the database,
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
  const post = await ctx.prisma.itemGroceryList.delete({
    where: {
      id: input.id,
    },
  });

  return post;
}),
});
