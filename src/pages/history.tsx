"use client";
import { useState } from 'react';
import { NextPage } from "next";
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import BottomNavBar from '~/components/BottomNavBar';
import Link from 'next/link';
import { api } from "~/utils/api";
import { Loading } from '~/components/loading';
import { GoArrowSwitch } from "react-icons/go";


type Meal = {
  id: string;
  name: string;
  timesEaten: number;
};

const HistoryMonth: React.FC<{date: Date}> = ({ date }) => {
  const { data, error, isLoading } = api.post.getOneMonth.useQuery({ date });

  if (isLoading) return <Loading />;
  if (error) return <div>Error loading data</div>;
  if (!data || data.length === 0) return <div>No data available for this month</div>;

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
    <div className="flex flex-col items-center p-4 min-h-screen bg-primary-400">
      <div className="sticky top-0 z-10 flex justify-between items-center bg-primary-400 py-4 px-2 w-full max-w-md">
        <h1 className="text-3xl font-bold text-white">Mahlzeiten Historie</h1>
        <Link href="/expenses" className="p-2 bg-blue-500 text-white rounded">
            <GoArrowSwitch className="text-2xl" />
        </Link>
      </div>
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
      <BottomNavBar activePage='history' />
    </div>
  );
}

export default History;