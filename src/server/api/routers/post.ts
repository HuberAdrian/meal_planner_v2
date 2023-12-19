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

});


/*
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
  relationMode = "prisma"
}


generator client {
  provider = "prisma-client-js"
}


model Post {
  id        String   @id @default(cuid()) // generate a unique string identifier
  createdAt DateTime @default(now()) 

  eventDate DateTime 
  eventType String //meal or event
  topic      String @db.VarChar(255)
  content   String @db.VarChar(255) // String length in sql is weird, so we set that to a specific character length
  deleted Boolean @default(false)



  @@index([createdAt]) //will be indexed by createdAt
}
  */