"use client";
import { useState } from 'react';
import { NextPage } from "next";
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import BottomNavBar from '~/components/BottomNavBar';
import Link from 'next/link';
import { GoArrowSwitch } from "react-icons/go";

type Expense = {
  category: string;
  amount: number;
  transactions: {
    date: string;
    description: string;
    amount: number;
  }[];
};

const sampleData: Record<string, Expense[]> = {
  "2024-09": [
    {
      category: "Miete (Warm)",
      amount: 830,
      transactions: [
        { date: "2024-09-01", description: "Miete September", amount: 830 }
      ]
    },
    {
      category: "Strom / Heizkosten",
      amount: 215,
      transactions: [
        { date: "2024-09-15", description: "Stromrechnung", amount: 215 }
      ]
    },
    {
      category: "Lebensmitteleinkäufe",
      amount: 478,
      transactions: [
        { date: "2024-09-05", description: "Supermarkt", amount: 150 },
        { date: "2024-09-12", description: "Bioladen", amount: 80 },
        { date: "2024-09-19", description: "Supermarkt", amount: 130 },
        { date: "2024-09-26", description: "Wochenmarkt", amount: 118 }
      ]
    },
  ],
  "2024-08": [
    {
      category: "Miete (Warm)",
      amount: 830,
      transactions: [
        { date: "2024-08-01", description: "Miete August", amount: 830 }
      ]
    },
    {
      category: "Strom / Heizkosten",
      amount: 200,
      transactions: [
        { date: "2024-08-15", description: "Stromrechnung", amount: 200 }
      ]
    },
    {
      category: "Lebensmitteleinkäufe",
      amount: 520,
      transactions: [
        { date: "2024-08-03", description: "Supermarkt", amount: 180 },
        { date: "2024-08-10", description: "Bioladen", amount: 90 },
        { date: "2024-08-17", description: "Supermarkt", amount: 140 },
        { date: "2024-08-24", description: "Wochenmarkt", amount: 110 }
      ]
    },
    {
      category: "Freizeit",
      amount: 150,
      transactions: [
        { date: "2024-08-20", description: "Kino", amount: 30 },
        { date: "2024-08-27", description: "Restaurant", amount: 120 }
      ]
    },
  ],
  "2024-07": [
    {
      category: "Miete (Warm)",
      amount: 830,
      transactions: [
        { date: "2024-07-01", description: "Miete Juli", amount: 830 }
      ]
    },
    {
      category: "Strom / Heizkosten",
      amount: 190,
      transactions: [
        { date: "2024-07-15", description: "Stromrechnung", amount: 190 }
      ]
    },
    {
      category: "Lebensmitteleinkäufe",
      amount: 550,
      transactions: [
        { date: "2024-07-02", description: "Supermarkt", amount: 200 },
        { date: "2024-07-09", description: "Bioladen", amount: 100 },
        { date: "2024-07-16", description: "Supermarkt", amount: 150 },
        { date: "2024-07-23", description: "Wochenmarkt", amount: 100 }
      ]
    },
    {
      category: "Urlaub",
      amount: 600,
      transactions: [
        { date: "2024-07-05", description: "Flugtickets", amount: 400 },
        { date: "2024-07-20", description: "Hotel", amount: 200 }
      ]
    },
  ]
};

const ExpenseCategory: React.FC<{expense: Expense}> = ({ expense }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-4 border-b border-gray-600 pb-2">
      <div 
        className="flex justify-between items-center cursor-pointer" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>{expense.category}</span>
        <span>{expense.amount.toFixed(2)} €</span>
      </div>
      {isExpanded && (
        <div className="mt-2 pl-4">
          {expense.transactions.map((transaction, index) => (
            <div key={index} className="flex justify-between text-sm text-gray-300">
              <span>{transaction.date}</span>
              <span>{transaction.description}</span>
              <span>{transaction.amount.toFixed(2)} €</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const Expenses: NextPage = () => {
  const [date, setDate] = useState<Date>(new Date());

  const handlePreviousMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() + 1));
  };

  const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  const expenses = sampleData[monthKey] || [];

  return (
    <div className="flex flex-col items-center p-4 min-h-screen bg-primary-400">
      <div className="sticky top-0 z-10 flex justify-between items-center bg-primary-400 py-4 px-2 w-full max-w-md">
        <h1 className="text-3xl font-bold text-white">Ausgaben Historie</h1>
        <Link href="/history" className="p-2 bg-blue-500 text-white rounded">
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
      <div className="w-full max-w-md">
        {expenses.map((expense, index) => (
          <ExpenseCategory key={index} expense={expense} />
        ))}
      </div>
      <BottomNavBar activePage='history' />
    </div>
  );
}

export default Expenses;