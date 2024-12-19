"use client"
import { useState, useEffect } from 'react';
import BottomNavBar from "~/components/BottomNavBar";
import { Error, Loading } from "~/components/loading";
import { api } from "~/utils/api";
import { type NextPage } from "next";
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { GoTriangleDown, GoTriangleUp } from "react-icons/go";
import MealSuggestionModal from '~/components/MealSuggestionModal';

import { FiClock, FiMessageSquare } from 'react-icons/fi';

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

// Local components
const TimeSelector = ({ selectedTime, onChange }: { selectedTime: string, onChange: (time: string) => void }) => {
  const timeOptions = {
    "Frühstück": "09:00",
    "Mittags": "13:00",
    "Abends": "19:00",
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <FiClock className="text-primary-100 text-lg" />
        <span className="text-white font-medium">Uhrzeit</span>
      </div>
      <div className="flex gap-2 mb-3">
        {Object.entries(timeOptions).map(([label, time]) => (
          <button
            key={label}
            type="button"
            onClick={() => onChange(time)}
            className={`flex-1 p-2 rounded-lg transition-all duration-200 ${
              selectedTime.endsWith(time)
                ? 'bg-primary-100 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <input
        type="datetime-local"
        value={selectedTime}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-primary-100 focus:outline-none"
      />
    </div>
  );
};

const DescriptionField = ({ description, onChange }: { description: string, onChange: (value: string) => void }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <FiMessageSquare className="text-primary-100 text-lg" />
      <span className="text-white font-medium">Beschreibung</span>
    </div>
    <textarea
      className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-primary-100 focus:outline-none resize-none"
      placeholder="Beschreibung (optional)"
      value={description}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
    />
  </div>
);

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
  
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<typeof mealTypes[number] | ''>('');
  const [suggestedMeal, setSuggestedMeal] = useState<{ id: string; name: string } | null>(null);

  const { data, isLoading } = api.meal.getAll.useQuery();
  const formattedDate = new Date(date as string).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit' });

  const { mutate: createEvent, isLoading: isPosting } = api.post.create.useMutation({
    onSuccess: async () => {
      toast.success("Erfolgreich hinzugefügt!");
      
      if (title === "9e4io1e") {
        const potentialDate = new Date(eventTime);
        potentialDate.setDate(potentialDate.getDate() + 30);
        
        await createPotentialEvent({
          mealID: "",
          eventType: "event",
          topic: "Potentiell 9e4io1e",
          content: `Referenz: ${new Date(eventTime).toLocaleDateString('de-DE')}`,
          eventDate: potentialDate,
          ingredients: []
        });
      }
      
      void router.push("/");
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage?.[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Fehler beim Hinzufügen");
      }
    },
  });

  const { mutate: createPotentialEvent } = api.post.create.useMutation();

  const getMealsByType = (type: typeof mealTypes[number]) => {
    if (!data) return [];
    return data.filter(meal => meal.type === type);
  };

  const getRandomMeal = (type: typeof mealTypes[number]) => {
    const mealsOfType = getMealsByType(type);
    if (mealsOfType.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * mealsOfType.length);
    const meal = mealsOfType[randomIndex];
    if (!meal) return null;
    return { id: meal.id, name: meal.name };
  };

  const handleMealTypeSelect = (type: string) => {
    if (!type) return;
    
    if (mealTypes.includes(type as typeof mealTypes[number])) {
      setSelectedMealType(type as typeof mealTypes[number]);
      const randomMeal = getRandomMeal(type as typeof mealTypes[number]);
      setSuggestedMeal(randomMeal);
      setIsSuggestionModalOpen(true);
    }
  };

  const handleShuffle = () => {
    if (selectedMealType) {
      const randomMeal = getRandomMeal(selectedMealType);
      setSuggestedMeal(randomMeal);
    }
  };

  const handleAcceptSuggestion = (mealId: string) => {
    const selectedMeal = data?.find(meal => meal.id === mealId);
    if (selectedMeal && 'type' in selectedMeal) {
      setType("meal");
      setTitle(selectedMeal.name);
      setMealID(selectedMeal.id);
      if (selectedMeal.description) {
        setDescription(selectedMeal.description);
      }
      const extractedIngredients = extractIngredients(selectedMeal as Meal);
      setIngredients(extractedIngredients);
    }
    setIsSuggestionModalOpen(false);
  };

  const handleTimeChange = (time: string) => {
    if (typeof date === 'string' && time.length === 5) {
      setEventTime(`${date}T${time}`);
    } else {
      setEventTime(time);
    }
  };

  const handleSubmit = () => {
    const eventDate = new Date(eventTime);
  
    const mutationData = {
      mealID,
      eventType: type || "event",
      topic: title,
      content: description || "-",
      eventDate,
      ingredients, 
    };
  
    createEvent(mutationData);
  };

  if (isLoading) return <Loading />;
  if(!data) return <Error />;

  return (
    <div className="flex flex-col items-center p-4 pt-14 min-h-screen bg-primary-400">
      <h1 className="text-3xl font-bold mb-6 text-white">{formattedDate}</h1>
      
      <div className="w-full max-w-md bg-primary-400 rounded-xl shadow-lg">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="mb-6">
              <label className="block text-white font-bold mb-4">
                Mahlzeit auswählen
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
                onChange={(e) => handleMealTypeSelect(e.target.value)}
                value={selectedMealType}
              >
                <option value="">Kategorie wählen für Vorschlag</option>
                {mealTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="meal"
                onChange={(e) => {
                  const selectedMeal = data?.find(meal => meal.id === e.target.value);
                  if (selectedMeal) {
                    setType("meal");
                    setTitle(selectedMeal.name);
                    setMealID(selectedMeal.id);
                    if (selectedMeal.description) {
                      setDescription(selectedMeal.description);
                    }
                    const extractedIngredients = extractIngredients(selectedMeal as Meal);
                    setIngredients(extractedIngredients);
                  } else {
                    setType('');
                    setTitle('');
                    setIngredients([]);
                  }
                }}
              >
                <option value="">Oder direkt eine Mahlzeit wählen</option>
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

            <TimeSelector selectedTime={eventTime} onChange={handleTimeChange} />

            {mealID && (
              <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                <button
                  type="button"
                  className="flex items-center justify-between w-full text-white"
                  onClick={() => setShowIngredients(!showIngredients)}
                >
                  <span>{showIngredients ? "Zutaten verbergen" : "Zutaten anzeigen"}</span>
                  {showIngredients ? <GoTriangleUp /> : <GoTriangleDown />}
                </button>
                {showIngredients && (
                  <div className="mt-3 space-y-2 pl-4">
                    {ingredients.map((ingredient) => (
                      <div key={ingredient.id} className="text-gray-300">
                        • {ingredient.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="relative py-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-primary-400 px-4 text-sm text-gray-300">ODER</span>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <div className="mb-6">
              <label className="block text-white font-bold mb-2">
                Titel Event
              </label>
              <input
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-primary-100 focus:outline-none disabled:opacity-50"
                type="text"
                placeholder="Titel Event"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={type === "meal"}
              />
              <p className="text-gray-400 text-sm mt-2 ml-2">
                z.B. &quot;9e4io1e&quot;
              </p>
            </div>

            <DescriptionField description={description} onChange={setDescription} />
          </div>

          <button
            className={`w-full p-4 rounded-xl font-medium transition-all duration-200 ${
              !title || !eventTime
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-primary-100 hover:bg-primary-200 active:transform active:scale-95'
            }`}
            onClick={handleSubmit}
            disabled={!title || !eventTime || isPosting}
          >
            {isPosting ? 'Wird gespeichert...' : 'Speichern'}
          </button>
        </form>
      </div>

      <MealSuggestionModal 
        isOpen={isSuggestionModalOpen}
        onClose={() => setIsSuggestionModalOpen(false)}
        onAccept={handleAcceptSuggestion}
        onShuffle={handleShuffle}
        suggestedMeal={suggestedMeal}
      />

      <div className="h-16" />
      <BottomNavBar activePage='calendar' />
    </div>
  );
};

export default AddEvent;