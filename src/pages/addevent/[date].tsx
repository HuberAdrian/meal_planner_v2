"use client"
import { useState } from 'react';
import BottomNavBar from "~/components/BottomNavBar";
import { Error, Loading } from "~/components/loading";
import { api } from "~/utils/api";
import { type NextPage } from "next";
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { GoTriangleDown, GoTriangleUp } from "react-icons/go";

interface Ingredient {
  id: string;
  name: string;
}

interface Meal {
  id: string;
  createdAt: Date;
  name: string;
  description: string | null;
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
  categories: string[];
  completed: boolean;
  type: typeof mealTypes[number];
}

const mealTypes = [
  "Nudelgerichte",
  "Kartoffelgerichte",
  "Reisgerichte",
  "andere Hauptgerichte",
  "Backen",
  "Frühstück",
  "Snacks",
  "Salate",
  "Suppen",
] as const;

const extractIngredients = (meal: Meal): Ingredient[] => {
  const ingredients: Ingredient[] = [];
  for (let i = 1; i <= 15; i++) {
    const ingredientKey = `ingredient${i}` as keyof Meal;
    const ingredient = meal[ingredientKey];
    if (typeof ingredient === 'string') {
      ingredients.push({ id: ingredientKey, name: ingredient });
    }
  }
  return ingredients;
};

const AddEvent: NextPage = () => {
  const router = useRouter();
  const { date } = router.query;
  const dateString = typeof date === "string" ? date : new Date().toISOString().slice(0, 10);

  const [type, setType] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [eventTime, setEventTime] = useState<string>(`${dateString}T10:00`);
  const [mealID, setMealID] = useState<string>('');

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [showIngredients, setShowIngredients] = useState<boolean>(false);

  const { data, isLoading } = api.meal.getAll.useQuery();

  const formattedDate = new Date(date as string).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit' });

  const { mutate, isLoading: isPosting } = api.post.create.useMutation({
    onSuccess: () => {
      toast.success("Posted!");
      void router.push("/");
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage?.[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Fehler beim Posten");
      }
    },
  });

  if (isLoading) return <Loading />;
  if(!data) {
    return <Error />;
  }

  const timeOptions = {
    "Frühstück": "09:00",
    "Mittags": "13:00",
    "Abends": "19:00",
  };

  const handleSubmit = () => {
    let eventT = type;
    if (!type) {
      eventT = "event";
    }
  
    const eventDate = new Date(eventTime);
  
    const mutationData = {
      mealID,
      eventType: eventT,
      topic: title,
      content: description || "-",
      eventDate,
      ingredients, 
    };
  
    mutate(mutationData);
  };

  const handleTimeSelection = (option: keyof typeof timeOptions) => {
    if (typeof date === 'string') {
        if (eventTime.includes(option)) {
            setEventTime('');
        } else {
            setEventTime(`${date}T${timeOptions[option]}`)
        }
    }
  };

  const handleIngredientChange = (id: string, newName: string) => {
    setIngredients(prevIngredients =>
      prevIngredients.map(ingredient =>
        ingredient.id === id ? { ...ingredient, name: newName } : ingredient
      )
    );
  };
  
  const handleDeleteIngredient = (id: string) => {
    setIngredients(prevIngredients =>
      prevIngredients.filter(ingredient => ingredient.id !== id)
    );
  };

  return (
    <div className="flex flex-col items-center p-4 pt-14 min-h-screen bg-primary-400">
      <h1 className="text-3xl font-bold mb-4 text-white">{formattedDate}</h1>
      <form onSubmit={(e) => e.preventDefault()} className="w-full sm:max-w-md mx-auto rounded-xl overflow-y-scroll overflow-x-hidden p-4">
        <div className="border p-4 rounded-lg ">
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2" htmlFor="meal">
              Meal
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="meal"
              onChange={(e) => {
                const selectedMeal = data?.find(meal => meal.id === e.target.value) as Meal | undefined;
                if (selectedMeal) {
                  setType("meal");
                  setTitle(selectedMeal.name);
                  setMealID(selectedMeal.id);
                  if (selectedMeal.description) {
                    setDescription(selectedMeal.description);
                  }
                  const extractedIngredients = extractIngredients(selectedMeal);
                  setIngredients(extractedIngredients);
                } else {
                  setType('');
                  setTitle('');
                  setIngredients([]);
                }
              }}
            >
              <option value="">Select a meal</option>
              {mealTypes.map((type) => {
                const mealsOfType = data?.filter(meal => meal.type === type) ?? [];
                if (mealsOfType.length === 0) return null;
                
                return (
                  <optgroup key={type} label={type}>
                    {mealsOfType.map((meal) => (
                      <option key={meal.id} value={meal.id}>
                        {meal.name}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2" htmlFor="time">
              Uhrzeit auswählen
            </label>
            <div className="flex w-full items-center justify-between">
              {Object.keys(timeOptions).map((option) => (
                <button 
                  key={option} 
                  onClick={() => handleTimeSelection(option as keyof typeof timeOptions)}
                  className={`p-2 rounded ${eventTime.endsWith(timeOptions[option as keyof typeof timeOptions]) ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          {mealID && (
            <div className="mb-4">
              <button
                type="button"
                className="text-white flex items-center"
                onClick={() => setShowIngredients(!showIngredients)}
              >
                {showIngredients ? "Zutaten anzeigen" : "Zutaten verbergen"}
                {showIngredients ? <GoTriangleUp className="ml-2" /> : <GoTriangleDown className="ml-2" />}
              </button>
              {showIngredients && (
                <div className="mt-2">
                  {ingredients.map((ingredient) => (
                    <div key={ingredient.id} className="flex items-center mb-2">
                      <input
                        type="text"
                        value={ingredient.name}
                        onChange={(e) => handleIngredientChange(ingredient.id, e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteIngredient(ingredient.id)}
                        className="ml-2 text-red-500"
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <h3 className="text-xl text-center font-bold my-8 text-white">------- oder -------</h3>
        <div className="border p-4 rounded-lg ">
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2" htmlFor="title">
              Titel Event
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="title"
              type="text"
              placeholder="Titel Event"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              readOnly={type === "meal"}
            />
            <p className="italic text-gray-500">
              z.B. &quot;9e4io1e&quot;
            </p>
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
        </div>
        <div className="flex items-center justify-center w-full mt-4">
          <button
            className={`font-bold py-2 w-full rounded-lg focus:outline-none focus:shadow-outline ${!title || !eventTime ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700 text-white'}`} 
            onClick={handleSubmit}
            disabled={!title || !eventTime}
          >
            Speichern
          </button>
        </div>
      </form>
      <div className="h-16" />
      <BottomNavBar activePage='calendar' />
    </div>
  );
};

export default AddEvent;