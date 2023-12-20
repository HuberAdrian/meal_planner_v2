"use client";
import { useState } from 'react';
import BottomNavBar from '~/components/BottomNavBar';
import { type NextPage } from "next";


const AddMeal: NextPage = () =>  {
  const [meal, setMeal] = useState('');
  const [ingredients, setIngredients] = useState(['']);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log({ meal, ingredients });
    // Logic for submitting the form values goes here
  };

  return (
    <div>
    <div className="container mx-auto p-4">
      <h1 className="text-2xl mb-4">Add Meal</h1>
      
      <form onSubmit={onSubmit}>
        <div className="mb-4">
          <label htmlFor="meal" className="block text-sm font-medium text-gray-700">Meal:</label>
          <input id="meal" value={meal} onChange={(e) => setMeal(e.target.value)} className="mt-1 p-2 w-full border rounded-md"/>
        </div>

        {ingredients.map((_, index) => (
          <div key={index} className="mb-4">
            <label htmlFor={`ingredient${index}`} className="block text-sm font-medium text-gray-700">Ingredients for 1 serving:</label>
            <input id={`ingredient${index}`} value={ingredients[index]} 
                   onChange={(e) => {
                     const newIngredients = [...ingredients];
                     newIngredients[index] = e.target.value;
                     setIngredients(newIngredients);
                   }}
                   className="mt-1 p-2 w-full border rounded-md"/>
          </div>
        ))}

        <button type='button' onClick={() => setIngredients([...ingredients, ''])} 
                className='p-2 bg-blue-500 text-white rounded-md mb-4'>
          +
        </button>

        <button type='submit' className='p-2 bg-blue-500 text-white rounded-md'>
          Save
        </button>
      </form>
    </div>
    <div className="h-16" />
    <BottomNavBar activePage="addmeal" />
    </div>
  );
}

export default AddMeal;