/*
import { useState } from 'react';
import { NextPage } from "next";
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import BottomNavBar from '~/components/BottomNavBar';
import { Chart } from 'chart.js';
import type { ChartData, ChartOptions } from 'chart.js';
import { registerables } from 'chart.js';
Chart.register(...registerables);

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

const History: NextPage = () =>   {
  const [meals, setMeals] = useState<Meal[]>(initialMeals);
  const [month, setMonth] = useState<number>(new Date().getMonth());

  const data = {
    labels: meals.map(meal => meal.name),
    datasets: [
      {
        label: '# of Times Eaten',
        data: meals.map(meal => meal.timesEaten),
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    indexAxis: "y", // This will make the chart horizontal
    scales: {
      x: {
        beginAtZero: true,
      },
    },
  };

  const handlePreviousMonth = () => {
    setMonth(month - 1);
    // Fetch meals for the previous month
  };

  const handleNextMonth = () => {
    setMonth(month + 1);
    // Fetch meals for the next month
  };

  return (
    <div>
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">History</h1>
      <div className="flex justify-between items-center w-full max-w-md mb-4">
        <button onClick={handlePreviousMonth}>
          <FaArrowLeft />
        </button>
        <h2>{new Date(2022, month).toLocaleString('default', { month: 'long' })}</h2>
        <button onClick={handleNextMonth}>
          <FaArrowRight />
        </button>
      </div>
      <Bar data={data} options={options} />
    </div>
    <BottomNavBar activePage='history' />
    </div>
  );
}


export default History;

*/

import { useState } from 'react';
import { NextPage } from "next";
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import BottomNavBar from '~/components/BottomNavBar';

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

const History: NextPage = () => {
  const [meals, setMeals] = useState<Meal[]>(initialMeals);
  const [month, setMonth] = useState<number>(new Date().getMonth());

  const handlePreviousMonth = () => {
    setMonth(month - 1);
    // Fetch meals for the previous month
  };

  const handleNextMonth = () => {
    setMonth(month + 1);
    // Fetch meals for the next month
  };

  return (
    <div>
      <div className="flex flex-col items-center p-4 pt-14 min-h-screen bg-primary-400">
        <h1 className="text-2xl font-bold mb-4">History</h1>
        <div className="flex justify-between items-center w-full max-w-md mb-4 border p-4 rounded-lg">
          <button onClick={handlePreviousMonth}>
            <FaArrowLeft />
          </button>
          <h2>{new Date(2022, month).toLocaleString('default', { month: 'long' })}</h2>
          <button onClick={handleNextMonth}>
            <FaArrowRight />
          </button>
        </div>
        <div className="w-full max-w-md">
          {meals.map((meal, index) => (
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
      </div>
      <BottomNavBar activePage='history' />
    </div>
  );
}

export default History;
