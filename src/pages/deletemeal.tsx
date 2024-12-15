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
};

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
    // Initialize ingredient categories from the meal's categories array
    const categories: Record<number, string> = {};
    editedMeal.categories?.forEach(category => {
      const match = /^ingredient(\d+):(.+)$/.exec(category);
      if (match && match[1] && match[2]) {
        categories[parseInt(match[1])] = match[2];
      }
    });
    setIngredientCategories(categories);

    // Initialize active ingredients
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

    // Update the categories array in editedMeal
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
      const newIndex = availableSlots[0]; // This is now definitely a number
      if (newIndex === undefined) return;
      setActiveIngredients((prev: number[]) => {
        const updated = [...prev];
        updated.push(newIndex); // Using push instead of spread to ensure number[]
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
    // Remove category for this ingredient
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

  // TODO: Add the update mutation here after backend is implemented
  const handleUpdate = (updatedMeal: Partial<Meal>) => {
    // Will be implemented after backend setup
    console.log('Updating meal:', updatedMeal);
    setEditingMeal(null);
    // TODO: Add the actual mutation call here
  };

  const handleDelete = (id: string) => {
    deleting({ id });
  };

  const handleToggle = (state: boolean) => {
    if (!state) {
      void router.push("/addmeal");
    } else {
      void router.push("/deletemeal");
    }
  };

  useEffect(() => {
    if (data) {
      setMeals(data);
    }
  }, [data]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center p-4 min-h-screen bg-primary-400">
      <h1 className="text-3xl font-bold mb-4 text-white">Essen Löschen</h1>
      <ToggleSwitch onToggle={handleToggle} initialState={true} />

      {meals.map((meal, index) => (
        <div key={index} className="border p-4 rounded-lg mb-4 w-full sm:max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-2 text-white">{meal.name}</h2>
          {meal.description && <p className="text-gray-300 mb-2">{meal.description}</p>}
          {[meal.ingredient1, meal.ingredient2, meal.ingredient3, meal.ingredient4, meal.ingredient5].map((ingredient, index) => (
            ingredient && <p key={index} className="text-gray-300">{ingredient}</p>
          ))}
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => setEditingMeal(meal)}
              className="flex-1 p-2 border-2 border-white text-white rounded-lg"
            >
              Bearbeiten
            </button>
            <button
              onClick={() => handleDelete(meal.id)}
              className="flex-1 p-2 bg-red-500 text-white rounded-lg"
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
};

export default DeleteMeal;