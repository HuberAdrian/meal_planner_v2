"use client";
import { useEffect, useState } from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import BottomNavBar from '~/components/BottomNavBar';
import { type NextPage } from "next";
import { api } from "~/utils/api";
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { Loading } from '~/components/loading';
import { LuRefreshCw } from "react-icons/lu"; // Import the refresh icon

type ItemGroceryList = {
  id: string;
  createdAt: Date;
  usageDate: string;
  name: string;
  reference: string;
  completed: boolean;
  category: string;
};

const Grocerylist: NextPage = () => {
  const [items, setItems] = useState<ItemGroceryList[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const router = useRouter();
  const [isAnyItemCompleted, setIsAnyItemCompleted] = useState(false);

  const { data, isLoading, refetch } = api.groceryList.getAllOpen.useQuery();

  useEffect(() => {
    if (data) {
      setItems(data);
    }
  }, [data]);

  useEffect(() => {
    const anyCompleted = items.some(item => item.completed);
    setIsAnyItemCompleted(anyCompleted);
  }, [items]);

  // DELETE ITEM --------------------------
  const { mutate: deleting, isLoading: isDeleting } = api.groceryList.delete.useMutation({
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

  const { mutate: creating, isLoading: isPosting } = api.groceryList.create.useMutation({
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

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void creating({
      name: newItemName,
      completed: false,
      usageDate: new Date().toISOString().slice(0, 10),
      reference: 'Manuell',
      category: 'Sonstiges',
    });
    setNewItemName('');
  };

  const handleRemove = (id: string) => {
    void deleting({ id });
    toast.success("Essen gelöscht!");
  };

  const handleCheck = (id: string) => {
    setItems(items.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const handleDeleteAll = () => {
    const completedItems = items.filter(item => item.completed);
    completedItems.forEach(item => {
      void handleRemove(item.id);
    });
  };

  const refreshData = () => {
    void refetch();
    toast.success("Data refreshed!");
  };

  if (isLoading || isPosting) return <Loading />;

  return (
    <div className="flex flex-col items-center p-4 pt-4 min-h-screen bg-primary-400">
      <div className="sticky top-0 z-10 flex justify-between items-center bg-primary-400 py-4 px-2 w-full max-w-md">
        <h1 className="text-3xl font-bold text-white">Einkaufsliste</h1>
        <button
          className="p-2 bg-blue-500 text-white rounded"
          onClick={refreshData}
        >
          <LuRefreshCw className="text-2xl" />
        </button>
      </div>
      <form onSubmit={onSubmit} className="flex items-center mb-4 w-full max-w-md my-4">
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="Neues Item"
          className="border p-2 w-full mr-1 rounded mb-2 text-black"
        />
        <button
          type='submit'
          className={`font-bold w-10 border p-2 ml-1 mb-2 rounded focus:outline-none focus:shadow-outline ${!newItemName ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700 text-white'}`}
          disabled={!newItemName}
        >
          +
        </button>
      </form>
      <ul className="w-full max-w-md">
        {items.map((item, index) => {
          const prevItem = items[index - 1];
          const formattedDate = new Date(item.usageDate).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit' });
          const [weekday, dayMonth] = formattedDate.split(', ');

          return (
            <div key={item.id}>
              {index > 0 && item.category !== prevItem?.category && (
                <hr className="border-t border-gray-300 my-2" />
              )}
              <li onClick={() => handleCheck(item.id)} className="rounded-lg flex items-center bg-white shadow p-4 mb-3">
                <span className={`flex-grow w-[30%] ${item.completed ? 'text-gray-500 line-through' : 'text-black'}`}>{item.name}</span>
                <span className={`flex-grow w-[70%] ml-2 mr-2 overflow-x-scroll ${item.completed ? 'text-gray-500 line-through' : 'text-gray-500'}`}>{item.reference} ({weekday}, {dayMonth})</span>
                {item.completed && (
                  <button onClick={() => handleRemove(item.id)} className="mr-4">
                    <FaTimesCircle color="red" />
                  </button>
                )}
              </li>
            </div>
          );
        })}
      </ul>
      <BottomNavBar activePage='grocerylist' />
      <button
        className={`max-w-md font-bold py-2 w-full rounded-lg focus:outline-none focus:shadow-outline ${!isAnyItemCompleted ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-500 hover:bg-red-700 text-white'}`}
        onClick={handleDeleteAll}
        disabled={!isAnyItemCompleted}
      >
        Löschen
      </button>
      <div className="h-16" />
    </div>
  );
};

export default Grocerylist;
