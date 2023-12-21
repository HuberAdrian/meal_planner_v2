"use client";
import { useState, useEffect } from 'react';
import BottomNavBar from '~/components/BottomNavBar';
import { type NextPage } from "next";
import { toast } from 'react-hot-toast';
import { api } from "~/utils/api";
import { useRouter } from 'next/router';
import ToggleSwitch from '~/components/ToggleSwitch';

type Meal = {
  id: string;
  createdAt: Date;
  name: string;
  ingredient1: string | null;
  ingredient2: string | null;
  ingredient3: string | null;
  ingredient4: string | null;
  ingredient5: string | null;
  ingredient6: string | null;
  ingredient7: string | null;
  ingredient8: string | null;
  ingredient9: string | null;
  ingredient10: string | null;
  ingredient11: string | null;
  ingredient12: string | null;
  ingredient13: string | null;
  ingredient14: string | null;
  ingredient15: string | null;
  completed: boolean;
};

const DeleteMeal: NextPage = () =>  {
  const router = useRouter();
  const [meals, setMeals] = useState<Meal[]>([]);

  const { data, isLoading } = api.meal.getAll.useQuery();

  const { mutate, isLoading: isPosting } = api.meal.delete.useMutation({
    onSuccess: () => {
      router.reload();
      
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage?.[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Fehler");
      }
    },
  });

  const handleDelete = (id: string) => () => {
    mutate({ id });
    toast.success("Meal deleted!");
  };


  useEffect(() => {
    if (data) {
      setMeals(data);
    }
  }, [data]);

  const handleToggle = (state: boolean) => {
    if (!state) {
      void router.push("/addmeal");
    }
    else {
        void router.push("/deletemeal");
        }
  };


  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center p-4 pt-14 min-h-screen bg-primary-400">
      <h1 className="text-4xl font-bold mb-4 text-white">Delete Meal</h1>
      <ToggleSwitch onToggle={handleToggle} />
      
      {meals.map((meal, index) => (
        <div key={index} className="border p-4 rounded-lg mb-4 w-full sm:max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-2 text-white">{meal.name}</h2>
          {[meal.ingredient1, meal.ingredient2, meal.ingredient3, meal.ingredient4, meal.ingredient5].map((ingredient, index) => (
            ingredient && <p key={index} className="text-gray-700">{ingredient}</p>
          ))}
          <button onClick={() => handleDelete(meal.id)} className="mt-4 p-2 bg-red-500 text-white rounded-lg justify-center w-full self-center ">
            Delete
          </button>
        </div>
      ))}
      <div className="h-16" />
      <BottomNavBar activePage="addMeal" />
    </div>
  );
}

export default DeleteMeal;
