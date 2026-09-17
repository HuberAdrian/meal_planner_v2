import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { DEFAULT_CATEGORY, categoryBySlot } from "~/lib/meals";

type MealMonth = {
  id: string;
  name: string;
  timesEaten: number;
};

export const postRouter = createTRPCRouter({
  /** Everything from `from` (start of the client's local day) onwards. */
  getUpcoming: publicProcedure
    .input(z.object({ from: z.date() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.post.findMany({
        where: { eventDate: { gte: input.from } },
        orderBy: { eventDate: "asc" },
      });
    }),

  /** Posts inside [from, to) — used by the month view. */
  getInRange: publicProcedure
    .input(z.object({ from: z.date(), to: z.date() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.post.findMany({
        where: { eventDate: { gte: input.from, lt: input.to } },
        orderBy: { eventDate: "asc" },
      });
    }),

  create: publicProcedure
    .input(
      z.object({
        mealID: z.string().optional(),
        topic: z.string().trim().min(1),
        content: z.string(),
        eventDate: z.date(),
        eventType: z.enum(["meal", "event"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const postData = {
        topic: input.topic,
        content: input.content.trim() === "" ? "-" : input.content,
        eventDate: input.eventDate,
        eventType: input.eventType,
      };

      if (input.eventType !== "meal") {
        return ctx.prisma.post.create({ data: postData });
      }

      if (!input.mealID) {
        throw new Error("Keine Mahlzeit ausgewählt");
      }

      const meal = await ctx.prisma.meal.findUnique({ where: { id: input.mealID } });
      if (meal === null) {
        throw new Error("Mahlzeit nicht gefunden");
      }

      // Ingredients are read from the meal itself (not from the client) so the
      // grocery list always reflects the current recipe.
      const cats = categoryBySlot(meal.categories);
      const groceryItems: {
        usageDate: string;
        name: string;
        reference: string;
        completed: boolean;
        category: string;
      }[] = [];
      for (let slot = 1; slot <= 15; slot++) {
        const value = meal[`ingredient${slot}` as keyof typeof meal];
        if (typeof value === "string" && value.trim() !== "") {
          groceryItems.push({
            usageDate: input.eventDate.toISOString(),
            name: value.trim(),
            reference: input.topic,
            completed: false,
            category: cats.get(slot) ?? DEFAULT_CATEGORY,
          });
        }
      }

      const [post] = await ctx.prisma.$transaction([
        ctx.prisma.post.create({ data: postData }),
        ctx.prisma.itemGroceryList.createMany({ data: groceryItems }),
      ]);

      return post;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({ where: { id: input.id } });
      if (!post) {
        throw new Error("Eintrag nicht gefunden");
      }

      const ops = [];
      if (post.eventType === "meal") {
        // Grocery items created for this meal are matched by usage date + reference.
        ops.push(
          ctx.prisma.itemGroceryList.deleteMany({
            where: { usageDate: post.eventDate.toISOString(), reference: post.topic },
          })
        );
      }
      ops.push(ctx.prisma.post.delete({ where: { id: input.id } }));
      await ctx.prisma.$transaction(ops);

      return post;
    }),

  /** Meals eaten in a calendar month (month is 0-based), counted by name. */
  getOneMonth: publicProcedure
    .input(z.object({ year: z.number().int(), month: z.number().int().min(0).max(11) }))
    .query(async ({ ctx, input }) => {
      const { year, month } = input;

      const posts = await ctx.prisma.post.findMany({
        where: {
          eventDate: { gte: new Date(year, month, 1), lt: new Date(year, month + 1, 1) },
          eventType: "meal",
          deleted: false,
        },
      });

      const meals: Record<string, MealMonth> = {};
      for (const post of posts) {
        const name = post.topic.trim();
        const existing = meals[name];
        if (existing) {
          existing.timesEaten++;
        } else {
          meals[name] = { id: post.id, name, timesEaten: 1 };
        }
      }

      return Object.values(meals).sort((a, b) => b.timesEaten - a.timesEaten || a.name.localeCompare(b.name, "de"));
    }),
});
