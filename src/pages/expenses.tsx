import React, { useState, useEffect, useRef } from 'react';
import { NextPage } from "next";
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import BottomNavBar from '~/components/BottomNavBar';
import Link from 'next/link';
import { GoArrowSwitch } from "react-icons/go";

type Expense = {
  id: string;
  category: string;
  amount: number;
  date: string;
  description: string;
};

type MonthlyExpenses = {
  month: string;
  miete: number;
  essen: number;
  sonstiges: number;
};

const sampleData: Expense[] = [
    // September 2024
    { id: "1", category: "Miete (Warm)", amount: 830, date: "2024-09-01", description: "Miete September" },
    { id: "2", category: "Strom / Heizkosten", amount: 215, date: "2024-09-15", description: "Stromrechnung" },
    { id: "3", category: "Lebensmitteleinkäufe", amount: 150, date: "2024-09-05", description: "Supermarkt" },
    { id: "4", category: "Lebensmitteleinkäufe", amount: 80, date: "2024-09-12", description: "Bioladen" },
    { id: "5", category: "Lebensmitteleinkäufe", amount: 130, date: "2024-09-19", description: "Supermarkt" },
    { id: "6", category: "Lebensmitteleinkäufe", amount: 118, date: "2024-09-26", description: "Wochenmarkt" },
  
    // August 2024
    { id: "7", category: "Miete (Warm)", amount: 830, date: "2024-08-01", description: "Miete August" },
    { id: "8", category: "Strom / Heizkosten", amount: 200, date: "2024-08-15", description: "Stromrechnung" },
    { id: "9", category: "Lebensmitteleinkäufe", amount: 180, date: "2024-08-03", description: "Supermarkt" },
    { id: "10", category: "Lebensmitteleinkäufe", amount: 90, date: "2024-08-10", description: "Bioladen" },
    { id: "11", category: "Lebensmitteleinkäufe", amount: 140, date: "2024-08-17", description: "Supermarkt" },
    { id: "12", category: "Lebensmitteleinkäufe", amount: 110, date: "2024-08-24", description: "Wochenmarkt" },
    { id: "13", category: "Freizeit", amount: 30, date: "2024-08-20", description: "Kino" },
    { id: "14", category: "Freizeit", amount: 120, date: "2024-08-27", description: "Restaurant" },
  
    // July 2024
    { id: "15", category: "Miete (Warm)", amount: 830, date: "2024-07-01", description: "Miete Juli" },
    { id: "16", category: "Strom / Heizkosten", amount: 190, date: "2024-07-15", description: "Stromrechnung" },
    { id: "17", category: "Lebensmitteleinkäufe", amount: 200, date: "2024-07-02", description: "Supermarkt" },
    { id: "18", category: "Lebensmitteleinkäufe", amount: 100, date: "2024-07-09", description: "Bioladen" },
    { id: "19", category: "Lebensmitteleinkäufe", amount: 150, date: "2024-07-16", description: "Supermarkt" },
    { id: "20", category: "Lebensmitteleinkäufe", amount: 100, date: "2024-07-23", description: "Wochenmarkt" },
    { id: "21", category: "Urlaub", amount: 400, date: "2024-07-05", description: "Flugtickets" },
    { id: "22", category: "Urlaub", amount: 200, date: "2024-07-20", description: "Hotel" },
  
    // June 2024
    { id: "23", category: "Miete (Warm)", amount: 830, date: "2024-06-01", description: "Miete Juni" },
    { id: "24", category: "Strom / Heizkosten", amount: 180, date: "2024-06-15", description: "Stromrechnung" },
    { id: "25", category: "Lebensmitteleinkäufe", amount: 170, date: "2024-06-04", description: "Supermarkt" },
    { id: "26", category: "Lebensmitteleinkäufe", amount: 80, date: "2024-06-11", description: "Bioladen" },
    { id: "27", category: "Lebensmitteleinkäufe", amount: 130, date: "2024-06-18", description: "Supermarkt" },
    { id: "28", category: "Lebensmitteleinkäufe", amount: 110, date: "2024-06-25", description: "Wochenmarkt" },
  
    // May 2024
    { id: "29", category: "Miete (Warm)", amount: 830, date: "2024-05-01", description: "Miete Mai" },
    { id: "30", category: "Strom / Heizkosten", amount: 170, date: "2024-05-15", description: "Stromrechnung" },
    { id: "31", category: "Lebensmitteleinkäufe", amount: 190, date: "2024-05-02", description: "Supermarkt" },
    { id: "32", category: "Lebensmitteleinkäufe", amount: 85, date: "2024-05-09", description: "Bioladen" },
    { id: "33", category: "Lebensmitteleinkäufe", amount: 135, date: "2024-05-16", description: "Supermarkt" },
    { id: "34", category: "Lebensmitteleinkäufe", amount: 100, date: "2024-05-23", description: "Wochenmarkt" },
    { id: "35", category: "Freizeit", amount: 80, date: "2024-05-20", description: "Konzert" },
    { id: "36", category: "Freizeit", amount: 40, date: "2024-05-27", description: "Restaurant" },
  
    // April 2024
    { id: "37", category: "Miete (Warm)", amount: 830, date: "2024-04-01", description: "Miete April" },
    { id: "38", category: "Strom / Heizkosten", amount: 160, date: "2024-04-15", description: "Stromrechnung" },
    { id: "39", category: "Lebensmitteleinkäufe", amount: 160, date: "2024-04-03", description: "Supermarkt" },
    { id: "40", category: "Lebensmitteleinkäufe", amount: 90, date: "2024-04-10", description: "Bioladen" },
    { id: "41", category: "Lebensmitteleinkäufe", amount: 130, date: "2024-04-17", description: "Supermarkt" },
    { id: "42", category: "Lebensmitteleinkäufe", amount: 100, date: "2024-04-24", description: "Wochenmarkt" },
  
    // March 2024
    { id: "43", category: "Miete (Warm)", amount: 830, date: "2024-03-01", description: "Miete März" },
    { id: "44", category: "Strom / Heizkosten", amount: 180, date: "2024-03-15", description: "Stromrechnung" },
    { id: "45", category: "Lebensmitteleinkäufe", amount: 200, date: "2024-03-04", description: "Supermarkt" },
    { id: "46", category: "Lebensmitteleinkäufe", amount: 80, date: "2024-03-11", description: "Bioladen" },
    { id: "47", category: "Lebensmitteleinkäufe", amount: 150, date: "2024-03-18", description: "Supermarkt" },
    { id: "48", category: "Lebensmitteleinkäufe", amount: 100, date: "2024-03-25", description: "Wochenmarkt" },
    { id: "49", category: "Urlaub", amount: 300, date: "2024-03-20", description: "Kurztrip" },
  
    // February 2024
    { id: "50", category: "Miete (Warm)", amount: 830, date: "2024-02-01", description: "Miete Februar" },
    { id: "51", category: "Strom / Heizkosten", amount: 200, date: "2024-02-15", description: "Stromrechnung" },
    { id: "52", category: "Lebensmitteleinkäufe", amount: 170, date: "2024-02-02", description: "Supermarkt" },
    { id: "53", category: "Lebensmitteleinkäufe", amount: 70, date: "2024-02-09", description: "Bioladen" },
    { id: "54", category: "Lebensmitteleinkäufe", amount: 130, date: "2024-02-16", description: "Supermarkt" },
    { id: "55", category: "Lebensmitteleinkäufe", amount: 100, date: "2024-02-23", description: "Wochenmarkt" },
  ];


  const ExpenseCategory: React.FC<{expenses: Expense[], category: string}> = ({ expenses, category }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
    return (
      <div className="mb-4 border-b border-gray-600 pb-2">
        <div 
          className="flex justify-between items-center cursor-pointer" 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span>{category}</span>
          <span>{totalAmount.toFixed(2)} €</span>
        </div>
        {isExpanded && (
          <div className="mt-2 pl-4">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex justify-between text-sm text-gray-300">
                <span>{expense.date}</span>
                <span>{expense.description}</span>
                <span>{expense.amount.toFixed(2)} €</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }


  
  const ExpenseChart: React.FC<{ data: MonthlyExpenses[], currentMonth: string }> = ({ data, currentMonth }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
  
    useEffect(() => {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          const dpr = window.devicePixelRatio || 1;
          const rect = canvasRef.current.getBoundingClientRect();
          canvasRef.current.width = rect.width * dpr;
          canvasRef.current.height = rect.height * dpr;
          ctx.scale(dpr, dpr);
  
          const colors: [string, string, string] = ['#ffb3ba', '#bae1ff', '#baffc9'];
          const barWidth = rect.width / (data.length * 2);
          const chartHeight = rect.height - 60;
          const chartTopPadding = 20;
  
          const totalExpenses = data.map(d => d.miete + d.essen + d.sonstiges);
          const maxExpense = Math.max(...totalExpenses, 1);
          const averageExpense = totalExpenses.reduce((a, b) => a + b, 0) / totalExpenses.length;
  
          ctx.clearRect(0, 0, rect.width, rect.height);
  
          data.forEach((month, index) => {
            const x = index * barWidth * 2 + barWidth / 2;
            let y = chartHeight + chartTopPadding;
            const total = month.miete + month.essen + month.sonstiges;
            const barHeight = total > 0 ? (total / maxExpense) * (chartHeight - chartTopPadding) : 0;
  
            [month.miete, month.essen, month.sonstiges].forEach((value, i) => {
              const segmentHeight = total > 0 ? (value / total) * barHeight : 0;
              ctx.fillStyle = colors[i] ?? '#ffffff';
              ctx.fillRect(x, y - segmentHeight, barWidth, segmentHeight);
              y -= segmentHeight;
            });
  
            ctx.fillStyle = 'white';
            ctx.font = month.month === currentMonth ? 'bold 12px Arial' : '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(month.month, x + barWidth / 2, rect.height - 20);
            ctx.fillText(total > 0 ? Math.round(total) + '€' : 'No data', x + barWidth / 2, rect.height - 5);
          });
  
          ctx.beginPath();
          ctx.strokeStyle = 'yellow';
          ctx.lineWidth = 2;
          const trendLineY = chartHeight + chartTopPadding - (averageExpense / maxExpense) * (chartHeight - chartTopPadding);
          ctx.moveTo(0, trendLineY);
          ctx.lineTo(rect.width, trendLineY);
          ctx.stroke();
  
          ctx.fillStyle = 'yellow';
          ctx.font = '12px Arial';
          ctx.textAlign = 'right';
          ctx.fillText('Durchschnitt: ' + Math.round(averageExpense) + '€', rect.width - 10, trendLineY - 5);
        }
      }
    }, [data, currentMonth]);
  
    return (
      <div className="w-full mb-4" style={{ height: '300px' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      </div>
    );
  };
  
  const Expenses: NextPage = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [chartData, setChartData] = useState<MonthlyExpenses[]>([]);

  const handlePreviousMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() + 1));
  };

  const getMonthExpenses = (date: Date): Expense[] => {
    return sampleData.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === date.getMonth() && expenseDate.getFullYear() === date.getFullYear();
    });
  };

  const calculateMonthlyExpenses = (expenses: Expense[]): MonthlyExpenses => {
    const miete = expenses.filter(e => e.category === "Miete (Warm)").reduce((sum, e) => sum + e.amount, 0);
    const essen = expenses.filter(e => e.category === "Lebensmitteleinkäufe").reduce((sum, e) => sum + e.amount, 0);
    const sonstiges = expenses.filter(e => e.category !== "Miete (Warm)" && e.category !== "Lebensmitteleinkäufe").reduce((sum, e) => sum + e.amount, 0);

    return {
      month: new Date(expenses[0]?.date || date).toLocaleString('default', { month: 'short' }),
      miete,
      essen,
      sonstiges
    };
  };

  useEffect(() => {
    const getLastFourMonths = (endDate: Date): MonthlyExpenses[] => {
      const months: MonthlyExpenses[] = [];
      for (let i = 3; i >= 0; i--) {
        const monthDate = new Date(endDate.getFullYear(), endDate.getMonth() - i, 1);
        const monthExpenses = getMonthExpenses(monthDate);
        months.push(calculateMonthlyExpenses(monthExpenses));
      }
      return months;
    };

    const newChartData = getLastFourMonths(date);
    setChartData(newChartData);
  }, [date]);

  const currentMonthExpenses = getMonthExpenses(date);
  const groupedExpenses = currentMonthExpenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = [];
    }
    const categoryExpenses = acc[expense.category];
    if (categoryExpenses) {
      categoryExpenses.push(expense);
    }
    return acc;
  }, {} as Record<string, Expense[]>);

  const totalExpenses = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const currentMonthName = date.toLocaleString('default', { month: 'short' });

  const averageMonthlyExpenses = chartData.reduce((sum, month) => sum + month.miete + month.essen + month.sonstiges, 0) / chartData.length;
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
        <h2>{`${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`}</h2>
        <button onClick={handleNextMonth}>
          <FaArrowRight />
        </button>
      </div>
      <div className="w-full max-w-md mb-4">
        <p className="text-xl font-bold">Gesamte Ausgaben: {totalExpenses.toFixed(2)}€</p>
      </div>
      <div className="w-full max-w-md mb-4">
        {Object.entries(groupedExpenses).map(([category, expenses]) => (
          <ExpenseCategory key={category} expenses={expenses} category={category} />
        ))}
      </div>
      <ExpenseChart data={chartData} currentMonth={currentMonthName} />
      <div className="w-full max-w-md mt-8 mb-4">
        <div className="border-t border-white my-4"></div>
        <h3 className="text-xl font-bold mb-2">Lifestyle Calculator</h3>
        <p>
          Um diesen Lifestyle aus Anlagen zu finanzieren, benötigt man ein Netto-Vermögen von: <span className="font-bold">{fireNumber} €</span>.
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