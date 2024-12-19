import React from 'react';
import { FiRotateCcw, FiCheck, FiX } from 'react-icons/fi';

interface MealSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (mealId: string) => void;
  onShuffle: () => void;
  suggestedMeal: { id: string; name: string } | null;
}

const MealSuggestionModal: React.FC<MealSuggestionModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  onShuffle,
  suggestedMeal
}) => {
  if (!isOpen || !suggestedMeal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-primary-400 rounded-lg p-6 w-11/12 max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-white">Vorschlag</h2>
        
        <div className="bg-primary-300 p-4 rounded-lg mb-6">
          <p className="text-xl text-center text-white">{suggestedMeal.name}</p>
        </div>

        <div className="flex justify-between gap-4">
          <button
            onClick={onClose}
            className="flex-1 p-3 border-2 border-white text-white rounded-lg flex items-center justify-center gap-2"
          >
            <FiX className="text-xl" />
            Zurück
          </button>
          <button
            onClick={onShuffle}
            className="flex-1 p-3 bg-primary-100 text-white rounded-lg flex items-center justify-center gap-2"
          >
            <FiRotateCcw className="text-xl" />
            Neu
          </button>
          <button
            onClick={() => onAccept(suggestedMeal.id)}
            className="flex-1 p-3 bg-blue-500 text-white rounded-lg flex items-center justify-center gap-2"
          >
            <FiCheck className="text-xl" />
            Wählen
          </button>
        </div>
      </div>
    </div>
  );
};

export default MealSuggestionModal;