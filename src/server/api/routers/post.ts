import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

type MealMonth = {
  id: string;
  name: string;
  timesEaten: number;
};

export const postRouter = createTRPCRouter({
  getAllExceptPast: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.post.findMany({
      where: {
        eventDate: {
          gte: new Date(),
        },
      },
    });
  }),

  create: publicProcedure
  .input(
    z.object({
      mealID: z.string(),
      topic: z.string().min(1), // Removed max length restriction
      content: z.string().min(1), // Removed max length restriction
      eventDate: z.date(),
      eventType: z.string().min(1), // Removed max length restriction
      ingredients: z.array(z.object({ id: z.string(), name: z.string() })),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const postData = {
      topic: input.topic,
      content: input.content,
      eventDate: input.eventDate,
      eventType: input.eventType,
    };

    if (input.eventType !== 'meal') {
      return ctx.prisma.post.create({ data: postData });
    }

    const meal = await ctx.prisma.meal.findUnique({
      where: {
        id: input.mealID,
      },
    });

    if (meal === null) {
      throw new Error('Essen nicht gefunden, Einkaufsliste nicht erstellt');
    }

    // Meal.categories entries are stored as "ingredientN:Kategorie", keyed by
    // the ingredient's slot — match by slot id, not by array position.
    const categoryBySlot = new Map<string, string>();
    for (const entry of meal.categories) {
      const match = /^(ingredient\d+):(.+)$/.exec(entry);
      if (match?.[1] && match[2]) {
        categoryBySlot.set(match[1], match[2]);
      }
    }

    const groceryItems = input.ingredients
      .filter((ingredient) => ingredient.name.trim() !== '')
      .map((ingredient) => ({
        usageDate: input.eventDate.toISOString(),
        name: ingredient.name,
        reference: input.topic,
        completed: false,
        category: categoryBySlot.get(ingredient.id) ?? 'Sonstiges',
      }));

    const [post] = await ctx.prisma.$transaction([
      ctx.prisma.post.create({ data: postData }),
      ctx.prisma.itemGroceryList.createMany({ data: groceryItems }),
    ]);

    return post;
  }),

  delete: publicProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // First, get the post to be deleted
      const post = await ctx.prisma.post.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!post) {
        throw new Error('Post not found');
      }

      // If the post eventType is 'meal', delete the corresponding items in the grocery list
      if (post.eventType === 'meal') {
        await ctx.prisma.itemGroceryList.deleteMany({
          where: {
            usageDate: post.eventDate.toISOString(),
            reference: post.topic,
          },
        });
      }

      // Then, delete the post
      const deletedPost = await ctx.prisma.post.delete({
        where: {
          id: input.id,
        },
      });

      return deletedPost;
    }),

  getOneMonth: publicProcedure
    .input(z.object({
      date: z.date(),
    }))
    .query(async ({ ctx, input }) => {
      const month = input.date.getMonth() + 1;
      const year = input.date.getFullYear();

      const posts = await ctx.prisma.post.findMany({
        where: {
          AND: [
            {
              eventDate: {
                gte: new Date(year, month - 1, 1),
              },
            },
            {
              eventDate: {
                lt: new Date(month === 12 ? year + 1 : year, month === 12 ? 0 : month, 1),
              },
            },
            {
              eventType: 'meal',
            },
            {
              deleted: false,
            },
          ],
        },
      });

      const meals: Record<string, MealMonth> = posts.reduce((acc, post) => {
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
      }, {} as Record<string, MealMonth>);

      return Object.values(meals);
    }),
});

