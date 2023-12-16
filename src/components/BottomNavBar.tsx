import { FaCalendar, FaUser} from 'react-icons/fa';
import { MdLocalGroceryStore } from "react-icons/md";
import { GiMeal } from "react-icons/gi";
import { IoIosStats } from "react-icons/io";

type BottomNavBarProps = {
  activePage: string;
};

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activePage }) => {
  return (
    <div className="fixed bottom-0 w-full bg-gray-100 shadow-md flex items-center justify-around p-4">
      <GiMeal className={`text-2xl ${activePage === 'home' ? 'text-blue-500 font-bold' : 'text-gray-500'}`} />
      <MdLocalGroceryStore className={`text-2xl ${activePage === 'calendar' ? 'text-blue-500 font-bold' : 'text-gray-500'}`} />
      <FaCalendar className={`text-2xl ${activePage === 'heart' ? 'text-blue-500 font-bold' : 'text-gray-500'}`} />
      <IoIosStats className={`text-2xl ${activePage === 'star' ? 'text-blue-500 font-bold' : 'text-gray-500'}`} />
      <FaUser className={`text-2xl ${activePage === 'setting' ? 'text-blue-500 font-bold' : 'text-gray-500'}`} />
    </div>
  );
};

export default BottomNavBar;