"use client";
import { useState, useEffect } from 'react';
import { NextPage } from "next";
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import BottomNavBar from '~/components/BottomNavBar';
import { api } from "~/utils/api";
import { Loading } from '~/components/loading';

type Meal = {
  id: string;
  name: string;
  timesEaten: number;
};

const initialMeals: Meal[] = [
  { id: '1', name: 'Apples', timesEaten: 5 },
  { id: '2', name: 'Bananas', timesEaten: 7 },
  { id: '3', name: 'Oranges', timesEaten: 3 },
  // Add more meals as needed
];

const HistoryMonth: React.FC<{date: Date}> = ({ date }) => {
  const oneMonthLess = new Date(date.getFullYear(), date.getMonth() + 1);
  const { data, error } = api.post.getOneMonth.useQuery({ date: oneMonthLess });

  if (error) {
    console.error(error);
    return <div>Error...</div>;
  }

  if (!data) {
    return <Loading />;
  }

  return (
    <div className="w-full max-w-md">
      {data.map((meal, index) => (
        <div key={index} className="flex items-center mb-2">
          <div className="w-1/4 pr-2">{meal.name}</div>
          <div className="w-3/4 bg-gray-200">
            <div 
              className="bg-blue-500 transition-width duration-500 ease-in-out" 
              style={{ width: `${meal.timesEaten * 10}%`, height: '20px' }} 
            />
          </div>
        </div>
      ))}
    </div>
  );
}

const History: NextPage = () => {
  const [date, setDate] = useState<Date>(new Date());

  const handlePreviousMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() + 1));
  };

  return (
    <div>
      <div className="flex flex-col items-center p-4 pt-14 min-h-screen bg-primary-400">
        <h1 className="text-3xl font-bold mb-4 text-white">Historie</h1>
        <div className="flex justify-between items-center w-full max-w-md mb-4 border p-4 rounded-lg">
          <button onClick={handlePreviousMonth}>
            <FaArrowLeft />
          </button>
          <h2>{`${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`}</h2>
          <button onClick={handleNextMonth}>
            <FaArrowRight />
          </button>
        </div>
        <HistoryMonth date={date} />
      </div>
      <BottomNavBar activePage='history' />
    </div>
  );
}

export default History;
