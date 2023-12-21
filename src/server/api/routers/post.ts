import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.post.findMany();
  }),
  
      // create a post creation that takes in the topic, content and eventDate of the post and creates an entry in the database,
  create: publicProcedure
      .input(
        z.object({
          topic: z.string().min(1).max(280),
          content: z.string().min(1).max(280),
          eventDate: z.date(),
          eventType: z.string().min(1).max(280),
        })
      )
      .mutation(async ({ ctx, input }) => {


        const post = await ctx.prisma.post.create({
          data: {
            topic: input.topic,
            content: input.content,
            eventDate: input.eventDate,
            eventType: input.eventType,
          },
        });
  
        return post;
      }
    ),


    delete: publicProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.delete({
        where: {
          id: input.id,
        },
      });

      return post;
    }),

});
