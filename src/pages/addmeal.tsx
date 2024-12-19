import { useState } from 'react';
import { type NextPage } from "next";
import { toast } from 'react-hot-toast';
import { api } from "~/utils/api";
import { useRouter } from 'next/router';
import ToggleSwitch from '~/components/ToggleSwitch';
import BottomNavBar from '~/components/BottomNavBar';
import { FiPlus, FiX } from 'react-icons/fi';

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

const categoryOptions = [
  "Obst & Gemüse",
  "Frühstück",
  "Snacks",
  "Teigwaren",
  "Backen",
  "Milchprodukte",
  "Kühlfach",
  "Sonstiges",
  "Haushalt"
];

interface Ingredient {
  name: string;
  category: string;
}

const AddMeal: NextPage = () => {
  const router = useRouter();
  const [mealData, setMealData] = useState({
    name: '',
    description: '',
    type: 'andere Hauptgerichte' as typeof mealTypes[number],
  });
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    Array(6).fill(null).map(() => ({ name: '', category: '' }))
  );
  const [activeTab, setActiveTab] = useState<'details' | 'ingredients'>('details');

  const { mutate, isLoading } = api.meal.create.useMutation({
    onSuccess: () => {
      toast.success("Mahlzeit hinzugefügt!");
      void router.push("/deletemeal");
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

  const handleToggle = (state: boolean) => {
    if (state) {
      void router.push("/deletemeal");
    }
  };

  const addIngredient = () => {
    if (ingredients.length < 15) {
      setIngredients([...ingredients, { name: '', category: '' }]);
    } else {
      toast.error("Maximal 15 Zutaten erlaubt");
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    setIngredients(prevIngredients => 
      prevIngredients.map((ing, i) => 
        i === index 
          ? { ...ing, [field]: value }
          : ing
      )
    );
  };

  const handleSubmit = () => {
    if (!mealData.name.trim()) {
      toast.error("Bitte einen Namen eingeben");
      return;
    }

    const validIngredients = ingredients
      .filter(ing => ing.name.trim())
      .map(ing => ing.name);
    
    const categories = ingredients
      .filter(ing => ing.name.trim() && ing.category)
      .map(ing => `ingredient${ingredients.indexOf(ing) + 1}:${ing.category}`);

    mutate({
      name: mealData.name,
      description: mealData.description,
      ingredients: validIngredients,
      categories,
      type: mealData.type
    });
  };

  return (
    <div className="flex flex-col items-center p-4 min-h-screen bg-primary-400 text-white">
      <div className="sticky top-0 z-10 flex justify-between items-center bg-primary-400 py-4 px-2 w-full max-w-md">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Essen hinzufügen</h1>
          <ToggleSwitch onToggle={handleToggle} initialState={false} />
        </div>
      </div>

      <div className="w-full max-w-md mt-6">
        <div className="flex mb-6">
          <button
            className={`flex-1 py-2 px-4 ${activeTab === 'details' ? 'bg-primary-100 text-white' : 'bg-primary-300'} rounded-l-lg transition-colors`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button
            className={`flex-1 py-2 px-4 ${activeTab === 'ingredients' ? 'bg-primary-100 text-white' : 'bg-primary-300'} rounded-r-lg transition-colors`}
            onClick={() => setActiveTab('ingredients')}
          >
            Zutaten
          </button>
        </div>

        {activeTab === 'details' && (
          <div className="space-y-4">
            <div className="bg-primary-300 p-4 rounded-lg">
              <label className="block mb-2 font-bold">Name</label>
              <input
                type="text"
                value={mealData.name}
                onChange={(e) => setMealData({ ...mealData, name: e.target.value })}
                className="w-full p-2 rounded bg-white text-black"
                placeholder="Name der Mahlzeit"
              />
            </div>

            <div className="bg-primary-300 p-4 rounded-lg">
              <label className="block mb-2 font-bold">Typ</label>
              <select
                value={mealData.type}
                onChange={(e) => setMealData({ ...mealData, type: e.target.value as typeof mealTypes[number] })}
                className="w-full p-2 rounded bg-white text-black"
              >
                {mealTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="bg-primary-300 p-4 rounded-lg">
              <label className="block mb-2 font-bold">Beschreibung</label>
              <textarea
                value={mealData.description}
                onChange={(e) => setMealData({ ...mealData, description: e.target.value })}
                className="w-full p-2 rounded bg-white text-black"
                rows={3}
                placeholder="Optionale Beschreibung"
              />
            </div>
          </div>
        )}

        {activeTab === 'ingredients' && (
          <div className="space-y-4">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="bg-primary-300 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold">Zutat {index + 1}</span>
                  <button
                    onClick={() => removeIngredient(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FiX size={20} />
                  </button>
                </div>
                <input
                  type="text"
                  value={ingredient.name}
                  onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                  className="w-full p-2 rounded mb-2 bg-white text-black"
                  placeholder="Zutat Name"
                />
                <select
                  value={ingredient.category}
                  onChange={(e) => updateIngredient(index, 'category', e.target.value)}
                  className="w-full p-2 rounded bg-white text-black"
                >
                  <option value="">Kategorie wählen</option>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            ))}

            {ingredients.length < 15 && (
              <button
                onClick={addIngredient}
                className="w-full p-3 bg-primary-100 text-white rounded-lg flex items-center justify-center gap-2"
              >
                <FiPlus size={20} />
                Neue Zutat
              </button>
            )}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isLoading || !mealData.name.trim()}
          className={`w-full p-3 rounded-lg mt-6 ${
            isLoading || !mealData.name.trim()
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-primary-100 hover:bg-primary-200'
          }`}
        >
          {isLoading ? 'Wird gespeichert...' : 'Speichern'}
        </button>
      </div>

      <div className="h-16" />
      <BottomNavBar activePage="addmeal" />
    </div>
  );
};

export default AddMeal;