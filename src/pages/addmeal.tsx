"use client";
import { useState } from 'react';
import BottomNavBar from '~/components/BottomNavBar';
import { type NextPage } from "next";
import { toast } from 'react-hot-toast';
import { api } from "~/utils/api";
import { useRouter } from 'next/router';


const AddMeal: NextPage = () =>  {
  const router = useRouter();
  const [meal, setMeal] = useState('');
  const [ingredients, setIngredients] = useState(Array(6).fill(''));
  const [isPlusButtonDisabled, setPlusButtonDisabled] = useState(false);

  const { mutate, isLoading: isPosting } = api.meal.create.useMutation({
    onSuccess: () => {
      toast.success("Meal added!");
      void router.push("/");
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage?.[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to add meal! Please try again later.");
      }
    },
  });

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate({ 
        name: meal, 
        ingredients: ingredients });
  };

  
  const handleAddMore = () => {
    setIngredients(prevIngredients => [...prevIngredients, ...Array(9).fill('')]);
    setPlusButtonDisabled(true);
  };

  return (
    <div className="flex flex-col items-center p-4 pt-14 min-h-screen bg-primary-400">
      <h1 className="text-4xl font-bold mb-4 text-white">Essen hinzufügen</h1>
      
      <form onSubmit={onSubmit} className="w-full sm:max-w-md mx-auto rounded-xl overflow-y-scroll overflow-x-hidden p-4">
        <div className="border p-4 rounded-lg mb-8">
          <div className="mb-4">
            <label htmlFor="meal" className="block text-gray-700 font-bold mb-2">Meal:</label>
            <input id="meal" value={meal} onChange={(e) => setMeal(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
          </div>
        </div>

        <div className="border p-4 rounded-lg">
          {ingredients.map((_, index) => (
            <div key={index} className="mb-4">
              <label htmlFor={`ingredient${index}`} className="block text-gray-700 font-bold mb-2">Ingredients for 1 serving:</label>
              <input id={`ingredient${index}`} value={ingredients[index]} 
                     onChange={(e) => {
                       const newIngredients = [...ingredients];
                       newIngredients[index] = e.target.value;
                       setIngredients(newIngredients);
                     }}
                     className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
            </div>
          ))}

          <div className="flex items-center justify-center w-full mb-4">
            <button type='button' onClick={handleAddMore} disabled={isPlusButtonDisabled}
                    className={`font-bold py-2 w-full rounded-lg ${isPlusButtonDisabled ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700 text-white'}`}>
              +
            </button>
          </div>

          <div className="flex items-center justify-center w-full">
            <button type='submit' 
                    className={`font-bold py-2 w-full rounded-lg focus:outline-none focus:shadow-outline ${!meal ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700 text-white'}`} 
                    disabled={!meal}>
              Speichern
            </button>
          </div>
        </div>
      </form>
      <div className="h-16" />
      <BottomNavBar activePage="addmeal" />
    </div>
  );
}

export default AddMeal;
