"use client";
import { useEffect, useState } from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import BottomNavBar from '~/components/BottomNavBar';
import { type NextPage } from "next";
import { api } from "~/utils/api";
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { on } from 'events';


type ItemGroceryList = {
    id: string;
    createdAt: Date;
    usageDate: string;
    name: string;
    reference: string;
    completed: boolean;
};

const initialItemGroceryList: ItemGroceryList[] = [
    { id: '1', createdAt: new Date(), usageDate: '17.01', name: 'Apples', reference: 'Burger, 14.01', completed: false },
    { id: '2', createdAt: new Date(), usageDate: '', name: 'Bananas', reference: 'Burgers, 14.01', completed: false },
    { id: '3', createdAt: new Date(), usageDate: '2021-10-01', name: 'Oranges', reference: 'Kartofflen, 14.01', completed: false },
];

const Grocerylist: NextPage = () => {
    const [items, setItems] = useState<ItemGroceryList[]>(initialItemGroceryList);
    const [newItemName, setNewItemName] = useState('');
    const router = useRouter();

    const { data, isLoading } = api.groceryList.getAllOpen.useQuery();

    useEffect(() => {
        if (data) {
          setItems(data);
        }
      }, [data]);
  

      const { mutate:creating, isLoading: isPosting } = api.groceryList.create.useMutation({
        onSuccess: () => {
          void toast.success("Item hinzugefügt!");
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

      //  DELETE ITEM --------------------------
      const { mutate:deleting, isLoading: isDeleting } = api.groceryList.delete.useMutation({
        onSuccess: () => {
            void toast.success("Item gelöscht!");
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

      const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        creating({ 
            name: newItemName,
            completed: false,
            usageDate: '-',
            reference: '-',
        });
        setNewItemName('');
      };
    
      const handleRemove = (id: string) => () => {
        deleting({ id });
        toast.success("Essen gelöscht!");
      };

    
    const handleCheck = (id: string) => {
      setItems(items.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
    };

  
  
    const handleAddItem = () => {
      const newItem = {
        id: String(items.length + 1), // This should be a unique ID, possibly generated on the backend
        createdAt: new Date(),
        usageDate: '', // Set usageDate as needed
        name: newItemName,
        reference: '', // Set reference as needed
        completed: false,
      };
      setItems([...items, newItem]);
      setNewItemName(''); // Clear the input field after adding
    };
  
    if (isLoading || isPosting || isDeleting) return <div>Loading...</div>;

    return (
      <div className="flex flex-col items-center p-4 pt-14 min-h-screen bg-primary-400">
        <h1 className="text-3xl font-bold mb-4 text-white">Grocery List</h1>
        <form onSubmit={onSubmit} className="flex items-center mb-4 w-full max-w-md my-4">
        <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Neues Item"
            className="border p-2 w-full mr-1 rounded mb-2"
          />
          <button
            type='submit'
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold w-10 border p-2 ml-1 mb-2 rounded"
            disabled={!newItemName}
          >
            +
          </button>
        </form>
        <ul className="w-full max-w-md">
          {items.map(item => (
            <li key={item.id} className="flex justify-between items-center bg-white shadow p-4 mb-3">
              <span className={`flex-1 ${item.completed ? 'text-gray-500 line-through' : 'text-black'}`}>{item.name}</span>
              <div>
                {item.completed && (
                  <button onClick={() => handleRemove(item.id)} className="mr-4">
                    <FaTimesCircle color="red" />
                  </button>
                )}
              </div>
              <div>
                <button onClick={() => handleCheck(item.id)}>
                  <FaCheckCircle color={item.completed ? 'gray' : 'green'} />
                </button>
              </div>
            </li>
          ))}
        </ul>
        <BottomNavBar activePage='grocerylist' />
      </div>
    );
  }
  
  export default Grocerylist;

  /*
  <div className="w-full max-w-md my-4">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Add new item"
            className="border p-2 w-full mb-2"
          />
          <button
            onClick={handleAddItem}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            disabled={!newItemName}
          >
            Add Item
          </button>
        </div>
        */
