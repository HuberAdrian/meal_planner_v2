"useclient"
import { useState } from 'react';

interface ToggleSwitchProps {
  onToggle: (state: boolean) => void;
  initialState: boolean;
}

const ToggleSwitch = ({ onToggle, initialState }: ToggleSwitchProps) => {
  const [isToggled, setIsToggled] = useState(initialState);

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
          <div className={`toggle__dot absolute w-6 h-6 bg-white rounded-full shadow inset-y-0 left-0 ${isToggled ? 'translate-x-4' : 'translate-x-0'}`}></div>
        </div>
        <div className="ml-3 text-gray-700 font-medium">
          {isToggled ? 'hinzufügen' : 'löschen'}
        </div>
      </label>
    </div>
  );
};

export default ToggleSwitch;

