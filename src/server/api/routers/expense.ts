import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const expenseRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.expense.findMany({ orderBy: { date: "desc" } });
  }),

  create: publicProcedure
    .input(
      z.object({
        category: z.string().trim().min(1).max(100),
        amount: z.number().positive().finite(),
        date: z.date(),
        description: z.string().trim().max(500),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.expense.create({ data: input });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.expense.delete({ where: { id: input.id } });
    }),
});
