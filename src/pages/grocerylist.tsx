"use client";
import { useEffect, useState } from 'react';
import { FiX, FiCheck, FiShoppingCart, FiRefreshCcw, FiPlus } from 'react-icons/fi';
import BottomNavBar from '~/components/BottomNavBar';
import { type NextPage } from "next";
import { api } from "~/utils/api";
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { Loading } from '~/components/loading';

const categoryOrder = [
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

type ItemGroceryList = {
  id: string;
  createdAt: Date;
  usageDate: string;
  name: string;
  reference: string;
  completed: boolean;
  category: string;
};

type MealFilterState = Record<string, boolean>;
type CompletedItemsState = Record<string, boolean>;

const GroceryListItem = ({ 
  item, 
  onCheck, 
  onRemove,
  isCompleted 
}: { 
  item: ItemGroceryList; 
  onCheck: (id: string) => void;
  onRemove: (id: string) => void;
  isCompleted: boolean;
}) => {
  const formattedDate = new Date(item.usageDate).toLocaleDateString('de-DE', { 
    weekday: 'long', 
    day: '2-digit', 
    month: '2-digit' 
  });
  const [weekday, dayMonth] = formattedDate.split(', ');

  return (
    <div 
      className={`group flex items-center p-4 rounded-lg transition-all duration-200 ${
        isCompleted ? 'bg-primary-400/50' : 'bg-primary-400'
      }`}
    >
      <button
        onClick={() => onCheck(item.id)}
        className="flex-shrink-0 mr-3"
      >
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
          isCompleted 
            ? 'border-primary-100 bg-primary-100' 
            : 'border-gray-400 hover:border-primary-100'
        }`}>
          {isCompleted && <FiCheck className="text-white text-sm" />}
        </div>
      </button>

      <div 
        className={`flex-grow min-w-0 cursor-pointer ${
          isCompleted ? 'text-gray-500' : 'text-white'
        }`}
        onClick={() => onCheck(item.id)}
      >
        <div className="flex items-baseline justify-between">
          <span className={`font-medium ${isCompleted ? 'line-through' : ''}`}>
            {item.name}
          </span>
          {isCompleted && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(item.id);
              }}
              className="ml-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <FiX className="text-gray-400 hover:text-red-400 transition-colors" />
            </button>
          )}
        </div>
        <p className={`text-sm truncate ${
          isCompleted ? 'text-gray-500' : 'text-gray-300'
        }`}>
          {item.reference} ({weekday}, {dayMonth})
        </p>
      </div>
    </div>
  );
};

const Grocerylist: NextPage = () => {
  const [items, setItems] = useState<ItemGroceryList[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [isAnyItemCompleted, setIsAnyItemCompleted] = useState(false);
  const [mealFilters, setMealFilters] = useState<MealFilterState>({});
  const [completedItems, setCompletedItems] = useState<CompletedItemsState>({});
  const router = useRouter();

  const { data, isLoading, refetch } = api.groceryList.getAllOpen.useQuery();

  useEffect(() => {
    const savedFilters = localStorage.getItem('mealFilters');
    if (savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters) as MealFilterState;
        if (typeof parsed === 'object' && parsed !== null) {
          const isValid = Object.entries(parsed).every(
            ([key, value]) => typeof key === 'string' && typeof value === 'boolean'
          );
          if (isValid) {
            setMealFilters(parsed);
          }
        }
      } catch (e) {
        console.error('Failed to parse meal filters from localStorage');
      }
    }
  }, []);

  useEffect(() => {
    const savedCompletedItems = localStorage.getItem('completedGroceryItems');
    if (savedCompletedItems) {
      try {
        const parsed = JSON.parse(savedCompletedItems) as CompletedItemsState;
        if (typeof parsed === 'object' && parsed !== null) {
          const isValid = Object.entries(parsed).every(
            ([key, value]) => typeof key === 'string' && typeof value === 'boolean'
          );
          if (isValid) {
            setCompletedItems(parsed);
          }
        }
      } catch (e) {
        console.error('Failed to parse completed items from localStorage');
      }
    }
  }, []);

  useEffect(() => {
    if (Object.keys(mealFilters).length > 0) {
      localStorage.setItem('mealFilters', JSON.stringify(mealFilters));
    }
  }, [mealFilters]);

  useEffect(() => {
    if (data) {
      const itemsWithCompletedStates = data.map(item => ({
        ...item,
        completed: completedItems[item.id] ?? false
      }));
      setItems(itemsWithCompletedStates);
      
      const uniqueMeals = [...new Set(data
        .filter(item => item.reference !== 'Manuell')
        .map(item => item.reference))];
      
      setMealFilters(prev => {
        const newFilters = { ...prev };
        uniqueMeals.forEach(meal => {
          if (newFilters[meal] === undefined) {
            newFilters[meal] = true;
          }
        });
        return newFilters;
      });
    }
  }, [data, completedItems]);

  useEffect(() => {
    const anyCompleted = items.some(item => completedItems[item.id]);
    setIsAnyItemCompleted(anyCompleted);
  }, [items, completedItems]);

  const { mutate: deleting } = api.groceryList.delete.useMutation({
    onSuccess: () => {
      toast.success("Item gelöscht!");
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

  const { mutate: creating } = api.groceryList.create.useMutation({
    onSuccess: () => {
      toast.success("Item hinzugefügt!");
      void router.reload();
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

  const handleRemove = (id: string) => {
    const newCompletedItems = { ...completedItems };
    delete newCompletedItems[id];
    localStorage.setItem('completedGroceryItems', JSON.stringify(newCompletedItems));
    setCompletedItems(newCompletedItems);

    void deleting({ id });
    toast.success("Essen gelöscht!");
  };

  const handleCheck = (id: string) => {
    setCompletedItems(prev => {
      const newState = { ...prev, [id]: !prev[id] };
      localStorage.setItem('completedGroceryItems', JSON.stringify(newState));
      return newState;
    });
  };

  const handleDeleteAll = () => {
    const completedItemIds = items
      .filter(item => completedItems[item.id])
      .map(item => item.id);

    const newCompletedItems = { ...completedItems };
    completedItemIds.forEach(id => {
      delete newCompletedItems[id];
    });
    localStorage.setItem('completedGroceryItems', JSON.stringify(newCompletedItems));
    setCompletedItems(newCompletedItems);

    completedItemIds.forEach(id => {
      void handleRemove(id);
    });
  };

  const toggleMealFilter = (meal: string) => {
    setMealFilters(prev => ({
      ...prev,
      [meal]: !prev[meal]
    }));
  };

  const refreshData = () => {
    void refetch();
    toast.success("Liste aktualisiert!");
  };

  if (isLoading) return <Loading />;

  const filteredItems = items.filter(item => 
    item.reference === 'Manuell' || mealFilters[item.reference]
  );

  const processedItems: ItemGroceryList[] = filteredItems.map(item => ({
    ...item,
    // Clean up category - remove the "ingredientX:" prefix if it exists
    category: item.category.includes(':') ? 
      (item.category.split(':')[1] ?? 'Sonstiges') : 
      (item.category ?? 'Sonstiges')
  }));

  const sortedItems = [...processedItems].sort((a, b) => {
    const categoryA = a.category ?? 'Sonstiges';
    const categoryB = b.category ?? 'Sonstiges';
    const categoryIndexA = categoryOrder.indexOf(categoryA);
    const categoryIndexB = categoryOrder.indexOf(categoryB);
    
    if (categoryIndexA !== categoryIndexB) {
      return categoryIndexA - categoryIndexB;
    }
    
    return a.name.localeCompare(b.name);
  });

  const uniqueMeals = [...new Set(items
    .filter(item => item.reference !== 'Manuell')
    .map(item => item.reference))];

  return (
    <div className="flex flex-col items-center p-4 min-h-screen bg-primary-400">
      <div className="sticky top-0 z-10 flex justify-between items-center bg-primary-400 py-4 px-2 w-full max-w-md">
        <div className="flex items-center gap-3">
          <FiShoppingCart className="text-2xl text-white" />
          <h1 className="text-3xl font-bold text-white">Einkaufsliste</h1>
        </div>
        <button
          className="p-2 text-white hover:text-primary-100 transition-colors"
          onClick={refreshData}
        >
          <FiRefreshCcw className="text-2xl" />
        </button>
      </div>

      <div className="w-full max-w-md space-y-6">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (!newItemName.trim()) return;
            
            void creating({
              name: newItemName,
              completed: false,
              usageDate: new Date().toISOString().slice(0, 10),
              reference: 'Manuell',
              category: 'Sonstiges',
            });
            setNewItemName('');
          }} 
          className="flex gap-2 mt-4"
        >
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Neues Item"
            className="flex-grow p-3 rounded-lg bg-primary-300 text-white placeholder-gray-400 border border-gray-600 focus:border-primary-100 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!newItemName.trim()}
            className={`p-3 rounded-lg transition-colors ${
              !newItemName.trim()
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-primary-100 hover:bg-primary-200'
            }`}
          >
            <FiPlus className="text-white text-xl" />
          </button>
        </form>

        {uniqueMeals.length > 0 && (
          <div className="overflow-x-auto">
            <div className="flex gap-2 pb-2">
              {uniqueMeals.map((meal) => (
                <button
                  key={meal}
                  onClick={() => toggleMealFilter(meal)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    mealFilters[meal]
                      ? 'bg-primary-100 text-white'
                      : 'bg-primary-300 text-gray-300'
                  }`}
                >
                  {meal}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {sortedItems.map((item, index) => {
            const prevItem = sortedItems[index - 1];
            
            return (
              <div key={item.id}>
                {index > 0 && item.category !== prevItem?.category && (
                  <hr className="border-t border-gray-600 my-4" />
                )}
                <GroceryListItem
                  item={item}
                  onCheck={(id) => handleCheck(id)}
                  onRemove={(id) => handleRemove(id)}
                  isCompleted={completedItems[item.id] ?? false}
                />
              </div>
            );
          })}
        </div>

        {isAnyItemCompleted && (
          <button
            className="w-full p-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            onClick={handleDeleteAll}
          >
            Erledigte Items löschen
          </button>
        )}
      </div>

      <div className="h-16" />
      <BottomNavBar activePage='grocerylist' />
    </div>
  );
};

export default Grocerylist;