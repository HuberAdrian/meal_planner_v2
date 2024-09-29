import React, { useState, useEffect, useRef } from 'react';
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

type MonthlyExpenses = {
  month: string;
  miete: number;
  essen: number;
  sonstiges: number;
};

const sampleData: Record<string, Expense[]> = {
  "2024-09": [
    { category: "Miete (Warm)", amount: 830, transactions: [{ date: "2024-09-01", description: "Miete September", amount: 830 }] },
    { category: "Strom / Heizkosten", amount: 215, transactions: [{ date: "2024-09-15", description: "Stromrechnung", amount: 215 }] },
    { category: "Lebensmitteleinkäufe", amount: 478, transactions: [
      { date: "2024-09-05", description: "Supermarkt", amount: 150 },
      { date: "2024-09-12", description: "Bioladen", amount: 80 },
      { date: "2024-09-19", description: "Supermarkt", amount: 130 },
      { date: "2024-09-26", description: "Wochenmarkt", amount: 118 }
    ]},
  ],
  "2024-08": [
    { category: "Miete (Warm)", amount: 830, transactions: [{ date: "2024-08-01", description: "Miete August", amount: 830 }] },
    { category: "Strom / Heizkosten", amount: 200, transactions: [{ date: "2024-08-15", description: "Stromrechnung", amount: 200 }] },
    { category: "Lebensmitteleinkäufe", amount: 520, transactions: [
      { date: "2024-08-03", description: "Supermarkt", amount: 180 },
      { date: "2024-08-10", description: "Bioladen", amount: 90 },
      { date: "2024-08-17", description: "Supermarkt", amount: 140 },
      { date: "2024-08-24", description: "Wochenmarkt", amount: 110 }
    ]},
    { category: "Freizeit", amount: 150, transactions: [
      { date: "2024-08-20", description: "Kino", amount: 30 },
      { date: "2024-08-27", description: "Restaurant", amount: 120 }
    ]},
  ],
  "2024-07": [
    { category: "Miete (Warm)", amount: 830, transactions: [{ date: "2024-07-01", description: "Miete Juli", amount: 830 }] },
    { category: "Strom / Heizkosten", amount: 190, transactions: [{ date: "2024-07-15", description: "Stromrechnung", amount: 190 }] },
    { category: "Lebensmitteleinkäufe", amount: 550, transactions: [
      { date: "2024-07-02", description: "Supermarkt", amount: 200 },
      { date: "2024-07-09", description: "Bioladen", amount: 100 },
      { date: "2024-07-16", description: "Supermarkt", amount: 150 },
      { date: "2024-07-23", description: "Wochenmarkt", amount: 100 }
    ]},
    { category: "Urlaub", amount: 600, transactions: [
      { date: "2024-07-05", description: "Flugtickets", amount: 400 },
      { date: "2024-07-20", description: "Hotel", amount: 200 }
    ]},
  ],
  "2024-06": [
    { category: "Miete (Warm)", amount: 830, transactions: [{ date: "2024-06-01", description: "Miete Juni", amount: 830 }] },
    { category: "Strom / Heizkosten", amount: 180, transactions: [{ date: "2024-06-15", description: "Stromrechnung", amount: 180 }] },
    { category: "Lebensmitteleinkäufe", amount: 490, transactions: [
      { date: "2024-06-04", description: "Supermarkt", amount: 170 },
      { date: "2024-06-11", description: "Bioladen", amount: 80 },
      { date: "2024-06-18", description: "Supermarkt", amount: 130 },
      { date: "2024-06-25", description: "Wochenmarkt", amount: 110 }
    ]},
  ],
  "2024-05": [
    { category: "Miete (Warm)", amount: 830, transactions: [{ date: "2024-05-01", description: "Miete Mai", amount: 830 }] },
    { category: "Strom / Heizkosten", amount: 170, transactions: [{ date: "2024-05-15", description: "Stromrechnung", amount: 170 }] },
    { category: "Lebensmitteleinkäufe", amount: 510, transactions: [
      { date: "2024-05-02", description: "Supermarkt", amount: 190 },
      { date: "2024-05-09", description: "Bioladen", amount: 85 },
      { date: "2024-05-16", description: "Supermarkt", amount: 135 },
      { date: "2024-05-23", description: "Wochenmarkt", amount: 100 }
    ]},
    { category: "Freizeit", amount: 120, transactions: [
      { date: "2024-05-20", description: "Konzert", amount: 80 },
      { date: "2024-05-27", description: "Restaurant", amount: 40 }
    ]},
  ],
  "2024-04": [
    { category: "Miete (Warm)", amount: 830, transactions: [{ date: "2024-04-01", description: "Miete April", amount: 830 }] },
    { category: "Strom / Heizkosten", amount: 160, transactions: [{ date: "2024-04-15", description: "Stromrechnung", amount: 160 }] },
    { category: "Lebensmitteleinkäufe", amount: 480, transactions: [
      { date: "2024-04-03", description: "Supermarkt", amount: 160 },
      { date: "2024-04-10", description: "Bioladen", amount: 90 },
      { date: "2024-04-17", description: "Supermarkt", amount: 130 },
      { date: "2024-04-24", description: "Wochenmarkt", amount: 100 }
    ]},
  ],
  "2024-03": [
    { category: "Miete (Warm)", amount: 830, transactions: [{ date: "2024-03-01", description: "Miete März", amount: 830 }] },
    { category: "Strom / Heizkosten", amount: 180, transactions: [{ date: "2024-03-15", description: "Stromrechnung", amount: 180 }] },
    { category: "Lebensmitteleinkäufe", amount: 530, transactions: [
      { date: "2024-03-04", description: "Supermarkt", amount: 200 },
      { date: "2024-03-11", description: "Bioladen", amount: 80 },
      { date: "2024-03-18", description: "Supermarkt", amount: 150 },
      { date: "2024-03-25", description: "Wochenmarkt", amount: 100 }
    ]},
    { category: "Urlaub", amount: 300, transactions: [
      { date: "2024-03-20", description: "Kurztrip", amount: 300 }
    ]},
  ],
  "2024-02": [
    { category: "Miete (Warm)", amount: 830, transactions: [{ date: "2024-02-01", description: "Miete Februar", amount: 830 }] },
    { category: "Strom / Heizkosten", amount: 200, transactions: [{ date: "2024-02-15", description: "Stromrechnung", amount: 200 }] },
    { category: "Lebensmitteleinkäufe", amount: 470, transactions: [
      { date: "2024-02-02", description: "Supermarkt", amount: 170 },
      { date: "2024-02-09", description: "Bioladen", amount: 70 },
      { date: "2024-02-16", description: "Supermarkt", amount: 130 },
      { date: "2024-02-23", description: "Wochenmarkt", amount: 100 }
    ]},
  ],
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

const ExpenseChart: React.FC<{ data: MonthlyExpenses[], currentMonth: string }> = ({ data, currentMonth }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(0);

  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        const containerWidth = canvasRef.current.parentElement?.clientWidth ?? 300;
        setCanvasWidth(containerWidth);
        setCanvasHeight(containerWidth * 0.6);
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  useEffect(() => {
    if (!canvasRef.current && canvasWidth === 0 && canvasHeight === 0) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const colors: [string, string, string] = ['#ffb3ba', '#bae1ff', '#baffc9'];
    const barWidth = canvasWidth / (data.length * 2);
    const chartHeight = canvasHeight - 60;
    const chartTopPadding = 20;

    const totalExpenses = data.map(d => d.miete + d.essen + d.sonstiges);
    const maxExpense = Math.max(...totalExpenses, 1); // Ensure maxExpense is never 0
    const averageExpense = totalExpenses.reduce((a, b) => a + b, 0) / totalExpenses.length;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

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
      ctx.fillText(month.month, x + barWidth / 2, canvasHeight - 40);
      ctx.fillText(total > 0 ? Math.round(total) + '€' : 'No data', x + barWidth / 2, canvasHeight - 20);
    });

    ctx.beginPath();
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 2;
    const trendLineY = chartHeight + chartTopPadding - (averageExpense / maxExpense) * (chartHeight - chartTopPadding);
    ctx.moveTo(0, trendLineY);
    ctx.lineTo(canvasWidth, trendLineY);
    ctx.stroke();

    ctx.fillStyle = 'yellow';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('Durchschnitt: ' + Math.round(averageExpense) + '€', canvasWidth - 10, trendLineY - 5);

  }, [data, canvasWidth, canvasHeight, currentMonth]);

  return (
    <div className="w-full mb-4">
      <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} />
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
  
    const getMonthKey = (date: Date): string => {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    };
  
    const getLastFourMonths = (endDate: Date): MonthlyExpenses[] => {
      const months: MonthlyExpenses[] = [];
      for (let i = 3; i >= 0; i--) {
        const monthDate = new Date(endDate.getFullYear(), endDate.getMonth() - i, 1);
        const monthKey = getMonthKey(monthDate);
        const expenses = sampleData[monthKey] ?? [];
        
        const miete = expenses.find(e => e.category === "Miete (Warm)")?.amount ?? 0;
        const essen = expenses.find(e => e.category === "Lebensmitteleinkäufe")?.amount ?? 0;
        const sonstiges = expenses.reduce((sum, e) => 
          e.category !== "Miete (Warm)" && e.category !== "Lebensmitteleinkäufe" ? sum + e.amount : sum, 0);
  
        months.push({
          month: monthDate.toLocaleString('default', { month: 'short' }),
          miete,
          essen,
          sonstiges
        });
      }
      return months;
    };
  
    useEffect(() => {
      const newChartData = getLastFourMonths(date);
      setChartData(newChartData);
    }, [date]);
  
    const monthKey = getMonthKey(date);
    const expenses = sampleData[monthKey] ?? [];
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
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
          {expenses.map((expense, index) => (
            <ExpenseCategory key={index} expense={expense} />
          ))}
        </div>
        <ExpenseChart data={chartData} currentMonth={currentMonthName} />
        <div className="w-full max-w-md mt-8 mb-4">
          <h3 className="text-xl font-bold mb-2">Lifestyle Calculator</h3>
          <p>
            Um diesen Lifestyle aus Anlagen zu leben, benötigt man ein Netto-Vermögen von: {fireNumber} €.
            <br/>*bei einer inflationsbereinigten Rendite &gt; 7%
            <br/>**bei einer Entnahme &lt; 4%
          </p>
        </div>
        <BottomNavBar activePage='history' />
      </div>
    );
  };

export default Expenses;