import type { NextPage } from "next";
import React, { useState, useEffect, useRef } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import BottomNavBar from '~/components/BottomNavBar';
import Link from 'next/link';
import { GoArrowSwitch } from "react-icons/go";
import { api } from "~/utils/api";

type Expense = {
  id: string;
  category: string;
  amount: number;
  date: Date;
  description: string;
};

type GroupedExpenses = Record<string, Expense[]>;

type MonthlyExpenses = {
  month: string;
  expenses: {
    Miete: number;
    Lebensmitteleinkäufe: number;
    Sonstiges: number;
  };
  total: number;
};

const categoryOrder = [
  "Miete",
  "Lebensmitteleinkäufe",
  "Transport",
  "Fitness",
  "Einkaufen",
  "Auto",
  "Telefon",
  "Abonnements",
  "Sonstiges",
];

const categoryColors: Record<string, string> = {
  "Miete": "#FF9999",
  "Lebensmitteleinkäufe": "#66B2FF",
  "Sonstiges": "#CCCCCC",
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
};

const groupExpensesByCategory = (expenses: Expense[]): GroupedExpenses => {
  return expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = [];
    }
    acc[expense.category]!.push(expense);
    return acc;
  }, {} as GroupedExpenses);
};

const calculateMonthlyExpenses = (expenses: Expense[]): MonthlyExpenses[] => {
  const monthlyExpenses: Record<string, MonthlyExpenses> = {};

  expenses.forEach((expense) => {
    const monthYear = expense.date.toLocaleString('default', { month: 'short', year: 'numeric' });
    if (!monthlyExpenses[monthYear]) {
      monthlyExpenses[monthYear] = { 
        month: monthYear, 
        expenses: { Miete: 0, Lebensmitteleinkäufe: 0, Sonstiges: 0 },
        total: 0 
      };
    }
    
    if (expense.category === "Miete") {
      monthlyExpenses[monthYear]!.expenses.Miete += expense.amount;
    } else if (expense.category === "Lebensmitteleinkäufe") {
      monthlyExpenses[monthYear]!.expenses.Lebensmitteleinkäufe += expense.amount;
    } else {
      monthlyExpenses[monthYear]!.expenses.Sonstiges += expense.amount;
    }
    
    monthlyExpenses[monthYear]!.total += expense.amount;
  });

  return Object.entries(monthlyExpenses)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([, value]) => value);
};

const ExpenseCategory: React.FC<{ category: string; expenses: Expense[] }> = ({ category, expenses }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="mb-4 border-b border-gray-600 pb-2">
      <div 
        className="flex justify-between items-center cursor-pointer" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>{category}</span>
        <span>{formatCurrency(totalAmount)}</span>
      </div>
      {isExpanded && (
        <div className="mt-2 pl-4">
          {expenses.map((expense) => (
            <div key={expense.id} className="flex justify-between text-sm text-gray-300">
              <span>{new Date(expense.date).toLocaleDateString()}</span>
              <span>{expense.description}</span>
              <span>{formatCurrency(expense.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ExpenseChart: React.FC<{ data: MonthlyExpenses[], currentMonth: string }> = ({ data, currentMonth }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
  
    const currentMonthIndex = data.findIndex(m => m.month === currentMonth);
    const startIndex = Math.max(0, Math.min(currentMonthIndex - 3, data.length - 4));
    const displayedData = data.slice(startIndex, startIndex + 4).reverse();
  
    useEffect(() => {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          const dpr = window.devicePixelRatio ?? 1;
          const rect = canvasRef.current.getBoundingClientRect();
          canvasRef.current.width = rect.width * dpr;
          canvasRef.current.height = rect.height * dpr;
          ctx.scale(dpr, dpr);
  
          const barWidth = rect.width / (displayedData.length * 2);
          const chartHeight = rect.height - 60;
          const chartTopPadding = 20;
  
          const maxExpense = Math.max(...displayedData.map(m => m.total));
          const averageExpense = displayedData.reduce((sum, m) => sum + m.total, 0) / displayedData.length;
  
          ctx.clearRect(0, 0, rect.width, rect.height);
  
          displayedData.forEach((month, index) => {
            const x = index * barWidth * 2 + barWidth / 2;
            let y = chartHeight + chartTopPadding;
            const barHeight = (month.total / maxExpense) * (chartHeight - chartTopPadding);
  
            ['Miete', 'Lebensmitteleinkäufe', 'Sonstiges'].forEach((category) => {
              const categoryAmount = month.expenses[category as keyof typeof month.expenses];
              const segmentHeight = (categoryAmount / month.total) * barHeight;
              ctx.fillStyle = categoryColors[category] ?? '#CCCCCC';
              ctx.fillRect(x, y - segmentHeight, barWidth, segmentHeight);
              y -= segmentHeight;
            });
  
            ctx.fillStyle = 'white';
            ctx.font = month.month === currentMonth ? 'bold 12px Arial' : '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(month.month, x + barWidth / 2, rect.height - 20);
            ctx.fillText(formatCurrency(month.total), x + barWidth / 2, rect.height - 5);
          });
  
          // Draw average line
          ctx.beginPath();
          ctx.strokeStyle = 'yellow';
          ctx.lineWidth = 2;
          const averageY = chartHeight + chartTopPadding - (averageExpense / maxExpense) * (chartHeight - chartTopPadding);
          ctx.moveTo(0, averageY);
          ctx.lineTo(rect.width, averageY);
          ctx.stroke();
  
          ctx.fillStyle = 'yellow';
          ctx.font = '12px Arial';
          ctx.textAlign = 'right';
          ctx.fillText(`Durchschnitt: ${formatCurrency(averageExpense)}`, rect.width - 10, averageY - 5);
        }
      }
    }, [displayedData, currentMonth]);
  
    return (
      <div className="w-full mb-4">
        <div style={{ height: '300px' }}>
          <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
        </div>
      </div>
    );
  };

const Expenses: NextPage = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [chartData, setChartData] = useState<MonthlyExpenses[]>([]);

  const { data: expensesData, isLoading } = api.expense.getAll.useQuery();

  const handlePreviousMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() + 1));
  };

  useEffect(() => {
    if (expensesData) {
      const monthlyExpenses = calculateMonthlyExpenses(expensesData);
      setChartData(monthlyExpenses);
    }
  }, [expensesData]);

  if (isLoading) return <div>Loading...</div>;

  const currentMonthExpenses = expensesData?.filter(expense => 
    new Date(expense.date).getMonth() === date.getMonth() &&
    new Date(expense.date).getFullYear() === date.getFullYear()
  ) ?? [];

  const groupedExpenses = groupExpensesByCategory(currentMonthExpenses);
  const sortedCategories = Object.keys(groupedExpenses).sort((a, b) => 
    categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  );

  const totalExpenses = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const currentMonthName = date.toLocaleString('default', { month: 'short', year: 'numeric' });

  const averageMonthlyExpenses = chartData.reduce((sum, month) => sum + month.total, 0) / chartData.length;
  const fireNumber = Math.round(averageMonthlyExpenses * 12 * 25);

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
        <h2>{date.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
        <button onClick={handleNextMonth}>
          <FaArrowRight />
        </button>
      </div>
      <div className="w-full max-w-md mb-4">
        <p className="text-xl font-bold">Gesamte Ausgaben: {formatCurrency(totalExpenses)}</p>
      </div>
      <ExpenseChart data={chartData} currentMonth={currentMonthName} />
      <div className="w-full max-w-md mb-4">
        {sortedCategories.map((category) => (
          <ExpenseCategory key={category} category={category} expenses={groupedExpenses[category]!} />
        ))}
      </div>
      <div className="w-full max-w-md mt-8 mb-4">
        <div className="border-t border-white my-4"></div>
        <h3 className="text-xl font-bold mb-2">Lifestyle Calculator</h3>
        <p>
          Um diesen Lifestyle aus Anlagen zu finanzieren, benötigt man ein Netto-Vermögen von: <span className="font-bold">{formatCurrency(fireNumber)}</span>.
        </p>
        <p className="mt-2 text-gray-300 text-sm">
          *bei einer inflationsbereinigten Rendite &gt; 7%<br/>
          **bei einer Entnahme &lt; 4%
        </p>
      </div>
      <div className="h-16"></div>
      <BottomNavBar activePage='history' />
    </div>
  );
};

export default Expenses;