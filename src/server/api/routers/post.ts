import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

type Meal = {
  id: string;
  name: string;
  timesEaten: number;
};

type Post = {
  id: string;
  createdAt: Date;
  eventDate: Date;
  eventType: string;
  topic: string;
  content: string;
  deleted: boolean;
};

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


        const post:Post = await ctx.prisma.post.create({
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




  
    
    getOneMonth: publicProcedure
        .input(z.object({
          date: z.date(),
        }))
        .query(async ({ ctx, input }) => {
          const month = input.date.getMonth() + 1;  // JavaScript months are 0-indexed
          const year = input.date.getFullYear();
    
          const posts = await ctx.prisma.post.findMany({
            where: {
              AND: [
                {
                  eventDate: {
                    gte: new Date(year, month, 1), // start of the month
                  },
                },
                {
                  eventDate: {
                    lt: new Date(month === 12 ? year + 1 : year, month % 12, 1), // start of the next month
                  },
                },
                {
                  eventType: 'meal', // filter for meals
                },
                {
                  deleted: false, // filter out deleted posts
                },
              ],
            },
          });
    
          // group posts by topic (meal name) and count the number of times each meal was eaten
          const meals: Record<string, Meal> = posts.reduce((acc, post) => {
            if (!acc[post.topic]) {
              acc[post.topic] = {
                id: post.id,
                name: post.topic,
                timesEaten: 1,
              };
            } else {
              acc[post.topic]!.timesEaten++;
            }
    
            return acc;
          }, {} as Record<string, Meal>);
    
          // convert the meals object to an array of meals
          return Object.values(meals);
        }),
    


});
