import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const expenseRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.expense.findMany({
      orderBy: { date: 'desc' },
    });
  }),

  getByDateRange: publicProcedure
    .input(z.object({
      startDate: z.date(),
      endDate: z.date(),
    }))
    .query(({ ctx, input }) => {
      return ctx.prisma.expense.findMany({
        where: {
          date: {
            gte: input.startDate,
            lte: input.endDate,
          },
        },
        orderBy: { date: 'desc' },
      });
    }),

  create: publicProcedure
    .input(z.object({
      category: z.string(),
      amount: z.number(),
      date: z.date(),
      description: z.string(),
    }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.expense.create({
        data: input,
      });
    }),
});