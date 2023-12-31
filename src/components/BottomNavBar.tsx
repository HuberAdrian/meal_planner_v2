import Link from 'next/link';
import { FaCalendar, FaUser } from 'react-icons/fa';
import { MdLocalGroceryStore } from "react-icons/md";
import { GiMeal } from "react-icons/gi";
import { IoIosStats } from "react-icons/io";

type BottomNavBarProps = {
  activePage: string;
};

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activePage }) => {
  return (
    <div className="fixed bottom-0 w-full bg-gray-100 shadow-md flex items-center justify-around p-4">
      <Link legacyBehavior href="/addmeal">
        <a><GiMeal className={`text-2xl ${activePage === 'addmeal' ? 'text-blue-500 font-bold' : 'text-gray-500'}`} /></a>
      </Link>
      <Link legacyBehavior href="/grocerylist">
        <a><MdLocalGroceryStore className={`text-2xl ${activePage === 'grocerylist' ? 'text-blue-500 font-bold' : 'text-gray-500'}`} /></a>
      </Link>
      <Link legacyBehavior href="/">
        <a><FaCalendar className={`text-2xl ${activePage === 'calendar' ? 'text-blue-500 font-bold' : 'text-gray-500'}`} /></a>
      </Link>
      <Link legacyBehavior href="/history">
        <a><IoIosStats className={`text-2xl ${activePage === 'history' ? 'text-blue-500 font-bold' : 'text-gray-500'}`} /></a>
      </Link>
      <Link legacyBehavior href="/user-profile">
        <a><FaUser className={`text-2xl ${activePage === 'user' ? 'text-blue-500 font-bold' : 'text-gray-500'}`} /></a>
      </Link>
    </div>
  );
};

export default BottomNavBar;