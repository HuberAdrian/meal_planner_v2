import { useState } from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import BottomNavBar from '~/components/BottomNavBar';
import { type NextPage } from "next";

type GroceryItem = {
  id: number;
  name: string;
  checked: boolean;
};

const initialGroceries: GroceryItem[] = [
  { id: 1, name: 'Apples', checked: false },
  { id: 2, name: 'Bananas', checked: false },
  { id: 3, name: 'Oranges', checked: false },
    { id: 4, name: 'Milk', checked: false },
    { id: 5, name: 'Eggs', checked: false },
    { id: 6, name: 'Bread', checked: false },
    { id: 7, name: 'Butter', checked: false },
    { id: 8, name: 'Cheese', checked: false },
    { id: 9, name: 'Yogurt', checked: false },
    { id: 10, name: 'Cereal', checked: false },
    { id: 11, name: 'Pasta', checked: false },
    { id: 12, name: 'Rice', checked: false },
    { id: 13, name: 'Chicken', checked: false },
    { id: 14, name: 'Beef', checked: false },
    { id: 15, name: 'Pork', checked: false },
    { id: 16, name: 'Fish', checked: false },
    { id: 17, name: 'Shrimp', checked: false },
    { id: 18, name: 'Lettuce', checked: false },
    { id: 19, name: 'Tomatoes', checked: false },
    { id: 20, name: 'Onions', checked: false },
    { id: 21, name: 'Potatoes', checked: false },
    { id: 22, name: 'Carrots', checked: false },

  // Add more items as needed
];

const grocerylist: NextPage = () =>   {
    const [groceries, setGroceries] = useState<GroceryItem[]>(initialGroceries);

    const handleCheck = (id: number) => {
      setGroceries(groceries.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      ));
    };
  
    const handleRemove = (id: number) => {
      setGroceries(groceries.filter(item => item.id !== id));
    };
  
    return (
      <div className="flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4">Grocery List</h1>
        <ul className="w-full max-w-md">
          {groceries.map(item => (
            <li key={item.id} className="flex justify-between items-center bg-white shadow p-4 mb-3">
            <span className={`flex-1 ${item.checked ? 'text-gray-500 line-through' : 'text-black'}`}>{item.name}</span>
              <div>
                {item.checked && (
                  <button onClick={() => handleRemove(item.id)} className="mr-4">
                    <FaTimesCircle color="red" />
                  </button>
                )}
              </div>
              
              <div>
                <button onClick={() => handleCheck(item.id)}>
                  <FaCheckCircle color={item.checked ? 'gray' : 'green'} />
                </button>
              </div>
            </li>
          ))}
        </ul>
        <BottomNavBar activePage='grocerylist' />
      </div>
    );
  }

export default grocerylist;