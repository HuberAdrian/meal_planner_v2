import { useRouter } from 'next/router';
import Link from 'next/link';
import { GiMeal } from "react-icons/gi";
import { BsCalendar2Week } from "react-icons/bs";
import { HiOutlineShoppingCart } from "react-icons/hi";
import { BsBarChartLineFill } from "react-icons/bs";
import { FaUser } from "react-icons/fa";
import { type FC } from "react";

interface BottomNavBarProps {
  activePage: 'addmeal' | 'calendar' | 'grocerylist' | 'user' | 'history' | 'expenses';
}

const BottomNavBar: FC<BottomNavBarProps> = ({ activePage }) => {
  const router = useRouter();

  const handleMealClick = () => {
    void router.push('/deletemeal');
  };

  const handleCalendarClick = () => {
    void router.push('/');
  };

  const handleGroceryListClick = () => {
    void router.push('/grocerylist');
  };

  const handleHistoryClick = () => {
    void router.push('/history');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-primary-400 flex justify-around items-center border-t border-primary-300">
      <button 
        onClick={handleMealClick}
        className={`p-2 rounded-lg ${activePage === 'addmeal' ? 'text-primary-100' : 'text-white'}`}
      >
        <GiMeal className="text-2xl" />
      </button>
      <button 
        onClick={handleGroceryListClick}
        className={`p-2 rounded-lg ${activePage === 'grocerylist' ? 'text-primary-100' : 'text-white'}`}
      >
        <HiOutlineShoppingCart className="text-2xl" />
      </button>
      <button 
        onClick={handleCalendarClick}
        className={`p-2 rounded-lg ${activePage === 'calendar' ? 'text-primary-100' : 'text-white'}`}
      >
        <BsCalendar2Week className="text-2xl" />
      </button>
      <button 
        onClick={handleHistoryClick}
        className={`p-2 rounded-lg ${(activePage === 'history' || activePage === 'expenses') ? 'text-primary-100' : 'text-white'}`}
      >
        <BsBarChartLineFill className="text-2xl" />
      </button>
      <Link href="/user-profile">
        <FaUser className={`text-2xl ${activePage === 'user' ? 'text-primary-100' : 'text-white'}`} />
      </Link>
    </div>
  );
};

export default BottomNavBar;