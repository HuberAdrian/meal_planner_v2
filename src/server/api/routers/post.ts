import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { groceryRouter } from "./groceryList";

type MealMonth = {
  id: string;
  name: string;
  timesEaten: number;
};

type Meal = {
  id: string;
  createdAt: Date;
  name: string;
  description: string;
  ingredient1: string;
  ingredient2: string;
  ingredient3: string;
  ingredient4: string;
  ingredient5: string;
  ingredient6: string;
  ingredient7: string;
  ingredient8: string;
  ingredient9: string;
  ingredient10: string;
  ingredient11: string;
  ingredient12: string;
  ingredient13: string;
  ingredient14: string;
  ingredient15: string;
  categories: string[];
  completed: boolean;
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
    const post = await ctx.prisma.post.create({
      data: {
        topic: input.topic,
        content: input.content,
        eventDate: input.eventDate,
        eventType: input.eventType,
      },
    });

    // If the post is of type 'meal', add ingredients to the grocery list
    if (input.eventType === 'meal') {
      const meal = await ctx.prisma.meal.findUnique({
        where: {
          id: input.mealID,
        },
      });

      if (meal === null) {
        throw new Error('Essen nicht gefunden, Einkaufsliste nicht erstellt');
      }

      const ingredients = input.ingredients.map(ingredient => ingredient.name).filter((ingredient) => ingredient.trim() !== '');

      for (let i = 0; i < ingredients.length; i++) {
        await ctx.prisma.itemGroceryList.create({
          data: {
            usageDate: input.eventDate.toISOString(),
            name: ingredients[i] ?? '404',
            reference: input.topic,
            completed: false,
            category: meal.categories[i] ?? 'Sonstiges',
          },
        });
      }
    }

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

