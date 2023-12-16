import { AiFillHome, AiFillCalendar, AiFillHeart, AiFillStar, AiFillSetting } from 'react-icons/ai';

type BottomNavBarProps = {
  activePage: string;
};

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activePage }) => {
  return (
    <div className="fixed bottom-0 w-full bg-gray-100 shadow-md flex items-center justify-around p-4">
      <AiFillHome className={`text-2xl ${activePage === 'home' ? 'text-blue-500 font-bold' : 'text-gray-500'}`} />
      <AiFillCalendar className={`text-2xl ${activePage === 'calendar' ? 'text-blue-500 font-bold' : 'text-gray-500'}`} />
      <AiFillHeart className={`text-2xl ${activePage === 'heart' ? 'text-blue-500 font-bold' : 'text-gray-500'}`} />
      <AiFillStar className={`text-2xl ${activePage === 'star' ? 'text-blue-500 font-bold' : 'text-gray-500'}`} />
      <AiFillSetting className={`text-2xl ${activePage === 'setting' ? 'text-blue-500 font-bold' : 'text-gray-500'}`} />
    </div>
  );
};

export default BottomNavBar;