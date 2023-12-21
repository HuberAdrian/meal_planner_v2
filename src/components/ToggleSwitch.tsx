"use client"
import { useState } from 'react';

const ToggleSwitch = ({ onToggle }: { onToggle: (state: boolean) => void }) => {
  const [isToggled, setIsToggled] = useState(false);

  const handleToggle = () => {
    setIsToggled(!isToggled);
    onToggle(!isToggled);
  };

  return (
    <div className="w-full flex justify-center items-center mb-4">
      <label htmlFor="toogleA" className="flex items-center cursor-pointer">
        <div className="relative">
          <input id="toogleA" type="checkbox" className="hidden" checked={isToggled} onChange={handleToggle} />
          <div className="toggle__line w-10 h-4 bg-gray-400 rounded-full shadow-inner"></div>
          <div className={`toggle__dot absolute w-6 h-6 bg-white rounded-full shadow inset-y-0 left-0 ${isToggled ? 'left-full' : ''} transform -translate-x-full`}></div>
        </div>
        <div className="ml-3 text-gray-700 font-medium">
          {isToggled ? 'Delete Meals' : 'Add Meal'}
        </div>
      </label>
    </div>
  );
};

export default ToggleSwitch;
