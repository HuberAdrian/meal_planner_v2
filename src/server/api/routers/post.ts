import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.post.findMany();
  }),
  // write a getTwoWeeks query where you can pass in a date and it will return all posts from that date to two weeks later
  /*
  getTwoWeeks: publicProcedure.query(({ ctx }) => {
    const inputSchema = z.object({
      date: z.string(),
    });
    const { date } = inputSchema.parse(ctx.body);
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 14);
    return ctx.prisma.post.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
    });
  }),
  */
});