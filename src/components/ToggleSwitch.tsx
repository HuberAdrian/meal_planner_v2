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
    <label className="relative inline-flex cursor-pointer">
      <input
        type="checkbox"
        className="sr-only"
        checked={isToggled}
        onChange={handleToggle}
      />
      <div
        className={`w-10 h-5 rounded-full transition-colors duration-300 ease-in-out ${
          isToggled ? 'bg-primary-100' : 'bg-primary-300'
        }`}
      />
      <div
        className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-300 ease-in-out ${
          isToggled ? 'transform translate-x-5' : 'transform translate-x-0'
        }`}
      />
    </label>
  );
};

export default ToggleSwitch;