"use client";
import { useState, useEffect } from 'react';
import BottomNavBar from '~/components/BottomNavBar';
import { type NextPage } from "next";
import { toast } from 'react-hot-toast';
import { api } from "~/utils/api";
import { useRouter } from 'next/router';
import ToggleSwitch from '~/components/ToggleSwitch';

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

type EditModalProps = {
  meal: Meal;
  onClose: () => void;
  onSave: (updatedMeal: Partial<Meal>) => void;
};

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

const EditModal: React.FC<EditModalProps> = ({ meal, onClose, onSave }) => {
  const [editedMeal, setEditedMeal] = useState<Partial<Meal>>(meal);
  const [ingredientCategories, setIngredientCategories] = useState<Record<number, string>>({});
  const [activeIngredients, setActiveIngredients] = useState<number[]>([]);

  useEffect(() => {
    const categories: Record<number, string> = {};
    editedMeal.categories?.forEach(category => {
      const match = /^ingredient(\d+):(.+)$/.exec(category);
      if (match?.[1] && match?.[2]) {
        categories[parseInt(match[1])] = match[2];
      }
    });
    setIngredientCategories(categories);

    const active = Array.from({ length: 15 }).reduce((acc: number[], _, index) => {
      const ingredientKey = `ingredient${index + 1}` as keyof Meal;
      if (editedMeal[ingredientKey]) {
        acc.push(index);
      }
      return acc;
    }, []);
    setActiveIngredients(active);
  }, []);

  const handleIngredientChange = (index: number, value: string) => {
    setEditedMeal(prev => ({
      ...prev,
      [`ingredient${index + 1}`]: value
    }));
  };

  const handleCategoryChange = (ingredientIndex: number, category: string) => {
    setIngredientCategories(prev => {
      const newCategories = { ...prev };
      if (newCategories[ingredientIndex] === category) {
        delete newCategories[ingredientIndex];
      } else {
        newCategories[ingredientIndex] = category;
      }
      return newCategories;
    });

    const newCategories = Object.entries(ingredientCategories).map(
      ([index, cat]) => `ingredient${index}:${cat}`
    );
    setEditedMeal(prev => ({
      ...prev,
      categories: newCategories
    }));
  };

  const addNewIngredient = () => {
    const availableSlots = Array.from({ length: 15 }, (_, i) => i)
      .filter(i => !activeIngredients.includes(i));
  
    if (availableSlots.length > 0) {
      const newIndex = availableSlots[0];
      if (newIndex === undefined) return;
      setActiveIngredients((prev: number[]) => {
        const updated = [...prev];
        updated.push(newIndex);
        return updated;
      });
      setEditedMeal(prev => ({
        ...prev,
        [`ingredient${newIndex + 1}`]: ''
      }));
    } else {
      toast.error("Maximale Anzahl an Zutaten erreicht (15)");
    }
  };

  const removeIngredient = (index: number) => {
    setActiveIngredients(prev => prev.filter(i => i !== index));
    setEditedMeal(prev => ({
      ...prev,
      [`ingredient${index + 1}`]: null
    }));
    const newCategories = { ...ingredientCategories };
    delete newCategories[index];
    setIngredientCategories(newCategories);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-primary-400 rounded-lg p-6 w-11/12 max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-white">Mahlzeit bearbeiten</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-white font-bold mb-2">Name:</label>
            <input
              type="text"
              value={editedMeal.name ?? ''}
              onChange={e => setEditedMeal(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-2 rounded bg-white text-black"
            />
          </div>

          <div>
            <label className="block text-white font-bold mb-2">Typ:</label>
            <select
              value={editedMeal.type ?? 'andere Hauptgerichte'}
              onChange={e => setEditedMeal(prev => ({ ...prev, type: e.target.value as typeof mealTypes[number] }))}
              className="w-full p-2 rounded bg-white text-black"
            >
              {mealTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white font-bold mb-2">Beschreibung:</label>
            <textarea
              value={editedMeal.description ?? ''}
              onChange={e => setEditedMeal(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-2 rounded bg-white text-black"
              rows={3}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-white font-bold">Zutaten und Kategorien:</label>
              <button
                onClick={addNewIngredient}
                className="px-4 py-2 bg-primary-100 text-white rounded-lg"
              >
                + Neue Zutat
              </button>
            </div>
            
            {activeIngredients.sort((a, b) => a - b).map((index) => {
              const ingredientKey = `ingredient${index + 1}` as keyof Meal;
              const ingredientValue = editedMeal[ingredientKey] as string;

              return (
                <div key={index} className="mb-4 border border-gray-600 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-white font-medium">Zutat {index + 1}:</span>
                    <input
                      type="text"
                      value={ingredientValue ?? ''}
                      onChange={e => handleIngredientChange(index, e.target.value)}
                      placeholder={`Zutat ${index + 1}`}
                      className="flex-1 p-2 rounded bg-white text-black"
                    />
                    <button
                      onClick={() => removeIngredient(index)}
                      className="p-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                  
                  <div>
                    <p className="text-white text-sm mb-2">Kategorie:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {categoryOptions.map((category) => (
                        <button
                          key={category}
                          onClick={() => handleCategoryChange(index, category)}
                          className={`p-2 rounded text-sm border border-white text-white ${
                            ingredientCategories[index] === category
                              ? 'bg-primary-100'
                              : 'bg-transparent'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between mt-6 pt-4 border-t border-gray-600">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border-2 border-white text-white"
          >
            Zurück
          </button>
          <button
            onClick={() => onSave(editedMeal)}
            className="px-4 py-2 rounded bg-primary-100 text-white"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
};

const DeleteMeal: NextPage = () => {
  const router = useRouter();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [activeType, setActiveType] = useState<string>("Alle");

  const { data, isLoading } = api.meal.getAll.useQuery();

  const { mutate: deleting, isLoading: isDeleting } = api.meal.delete.useMutation({
    onSuccess: () => {
      toast.success("Gelöscht!");
      void router.reload();
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

  const { mutate: updating, isLoading: isUpdating } = api.meal.update.useMutation({
    onSuccess: () => {
      toast.success("Mahlzeit aktualisiert!");
      void router.reload();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage?.[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Fehler beim Aktualisieren");
      }
    },
  });

  const handleUpdate = (updatedMeal: Partial<Meal>) => {
    if (!updatedMeal.id) {
      toast.error("Fehler: Keine Meal ID gefunden");
      return;
    }
  
    const updateData = {
      id: updatedMeal.id,
      name: updatedMeal.name ?? "",
      description: updatedMeal.description ?? null,
      ingredient1: updatedMeal.ingredient1 ?? null,
      ingredient2: updatedMeal.ingredient2 ?? null,
      ingredient3: updatedMeal.ingredient3 ?? null,
      ingredient4: updatedMeal.ingredient4 ?? null,
      ingredient5: updatedMeal.ingredient5 ?? null,
      ingredient6: updatedMeal.ingredient6 ?? null,
      ingredient7: updatedMeal.ingredient7 ?? null,
      ingredient8: updatedMeal.ingredient8 ?? null,
      ingredient9: updatedMeal.ingredient9 ?? null,
      ingredient10: updatedMeal.ingredient10 ?? null,
      ingredient11: updatedMeal.ingredient11 ?? null,
      ingredient12: updatedMeal.ingredient12 ?? null,
      ingredient13: updatedMeal.ingredient13 ?? null,
      ingredient14: updatedMeal.ingredient14 ?? null,
      ingredient15: updatedMeal.ingredient15 ?? null,
      categories: updatedMeal.categories ?? [],
      type: (updatedMeal.type ?? "andere Hauptgerichte") as typeof mealTypes[number],
    };
  
    updating(updateData);
    setEditingMeal(null);
  };

  const handleDelete = (id: string) => {
    deleting({ id });
  };

  const handleToggle = (state: boolean) => {
    if (!state) {
      void router.push("/addmeal");
    }
  };

  useEffect(() => {
    if (data) {
      setMeals(data.map(meal => ({
        ...meal,
        type: meal.type as typeof mealTypes[number]
      })));
    }
  }, [data]);

  if (isLoading) return <div>Loading...</div>;

  const filteredMeals = activeType === "Alle" 
    ? meals 
    : meals.filter(meal => meal.type === activeType);

    return (
      <div className="flex flex-col items-center p-4 min-h-screen bg-primary-400">
        <div className="sticky top-0 z-10 flex justify-between items-center bg-primary-400 py-4 px-2 w-full max-w-md">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">Essen bearbeiten</h1>
            <ToggleSwitch onToggle={handleToggle} initialState={true} />
          </div>
        </div>
  
        {/* Type filter buttons */}
        <div className="w-full max-w-md mb-4 overflow-x-auto">
          <div className="flex space-x-2 pb-2 overflow-x-auto whitespace-nowrap">
            <button
              onClick={() => setActiveType("Alle")}
              className={`px-4 py-2 rounded-lg ${
                activeType === "Alle"
                  ? 'bg-primary-100 text-white'
                  : 'bg-gray-600 text-gray-300'
              }`}
            >
              Alle
            </button>
            {mealTypes.map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`px-4 py-2 rounded-lg ${
                  activeType === type
                    ? 'bg-primary-100 text-white'
                    : 'bg-gray-600 text-gray-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
  
        {/* Meals list */}
        {filteredMeals.map((meal, index) => (
          <div key={index} className="border p-4 rounded-lg mb-4 w-full sm:max-w-md mx-auto bg-primary-300">
            <h2 className="text-2xl font-bold mb-2 text-white">{meal.name}</h2>
            {meal.description && <p className="text-gray-300 mb-2">{meal.description}</p>}
            <p className="text-gray-300 mb-2">Typ: {meal.type}</p>
            {[meal.ingredient1, meal.ingredient2, meal.ingredient3, meal.ingredient4, meal.ingredient5].map((ingredient, index) => (
              ingredient && <p key={index} className="text-gray-300">{ingredient}</p>
            ))}
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => setEditingMeal(meal)}
                className="flex-1 p-2 border-2 border-white text-white rounded-lg hover:bg-primary-100"
              >
                Bearbeiten
              </button>
              <button
                onClick={() => handleDelete(meal.id)}
                className="flex-1 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Löschen
              </button>
            </div>
          </div>
        ))}
  
        {editingMeal && (
          <EditModal
            meal={editingMeal}
            onClose={() => setEditingMeal(null)}
            onSave={handleUpdate}
          />
        )}
  
        <div className="h-16" />
        <BottomNavBar activePage="addmeal" />
      </div>
    );
  }

export default DeleteMeal;
