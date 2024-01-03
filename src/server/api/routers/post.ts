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
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.post.findMany();
  }),
  
      // create a post creation that takes in the topic, content and eventDate of the post and creates an entry in the database,
  create: publicProcedure
      .input(
        z.object({
          mealID: z.string(),
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

        
        // If the post is of type 'meal', add ingredients to the grocery list
      if (input.eventType === 'meal') {
        // get the meal from the database using the mealID
        const meal = await ctx.prisma.meal.findUnique({
          where: {
            id: input.mealID,
          },
        });
        
        console.log("inside post create if statement for meal");
        console.log(meal);
        console.log(input.mealID);
      


        if (meal === null) {
          throw new Error('Essen nicht gefunden, Einkaufsliste nicht erstellt');
        }

      }
        /*
        // loop through the ingredients of the meal and add them to the grocery list
        const ingredients = [meal.ingredient1, meal.ingredient2, meal.ingredient3, meal.ingredient4, meal.ingredient5, meal.ingredient6, meal.ingredient7, meal.ingredient8, meal.ingredient9, meal.ingredient10, meal.ingredient11, meal.ingredient12, meal.ingredient13, meal.ingredient14, meal.ingredient15];
          for (const ingredient of ingredients ) {
            if (ingredient) {
              await groceryRouter.create({
                ctx,
                input: {
                  usageDate: input.eventDate.toISOString(),
                  name: ingredient,
                  reference: input.topic,
                  completed: false,
                },
                rawInput: input,
                path: "",
                type: "query"
              });
            }
          }
      }
      */
      

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
                    gte: new Date(year, month - 1, 1), // start of the month
                  },
                },
                {
                  eventDate: {
                    lt: new Date(month === 12 ? year + 1 : year, month === 12 ? 0 : month, 1), // start of the next month
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
    
          // convert the meals object to an array of meals
          return Object.values(meals);
        }),
    


});
