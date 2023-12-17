"use client"
import { useState } from 'react';
import Link from "next/link";
import BottomNavBar from "~/components/BottomNavBar";
import { Error, Loading } from "~/components/loading";
import { api } from "~/utils/api";
import { type NextPage } from "next";

type Meal = {
  id: string;
  createdAt: Date;
  authorId: string;
  name: string;
  counter: number;
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

const AddEvent: NextPage = () => {
  const [meal, setMeal] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [eventTime, setEventTime] = useState<string>('');

  const { data, isLoading } = api.meal.getAll.useQuery();

  if (isLoading) return <Loading />;
  if(!data) {
    return <Error />;
  }

  const mealOptions = [
    "Frühstück",
    "Mittagessen",
    "Abendessen",
    "Snack",
  ];
  /*
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const mealEvent = {
      meal,
      time,
      title,
      description,
      eventTime,
    };
    await api.mealEvents.create.mutate(mealEvent);
  };
    */

  // create sample function to pint out the meal names to console
    const printMealNames = () => {
        console.log(data);
        }
    

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Event hinzufügen</h1>
      <form onSubmit={printMealNames/*handleSubmit*/}>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="meal">
            Essen hinzufügen
          </label>
          <select value={meal} onChange={e => setMeal(e.target.value)}>
            <option value="">Select a meal</option>
            {mealOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="title">
            Titel
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="title"
            type="text"
            placeholder="Titel"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="description">
            Beschreibung
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="description"
            placeholder="Beschreibung"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="eventTime">
            Uhrzeit
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="eventTime"
            type="datetime-local"
            placeholder="Uhrzeit"
            value={eventTime}
            onChange={(e) => setEventTime(e.target.value)}
            required
          />
        </div>
        <div className="flex items-center justify-between">
        <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
                Speichern
        </button>
        </div>
      </form>
        <BottomNavBar activePage='/' />
    </div>
  );
};

export default AddEvent;
