import { type FC } from "react";
import { FiRotateCcw, FiCheck, FiX } from "react-icons/fi";

interface MealSuggestionModalProps {
  isOpen: boolean;
  category: string;
  onClose: () => void;
  onAccept: (mealId: string) => void;
  onShuffle: () => void;
  suggestedMeal: { id: string; name: string } | null;
}

const MealSuggestionModal: FC<MealSuggestionModalProps> = ({
  isOpen,
  category,
  onClose,
  onAccept,
  onShuffle,
  suggestedMeal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <p className="text-xs font-semibold tracking-wide text-muted uppercase">Vorschlag · {category}</p>
        {suggestedMeal ? (
          <p className="my-6 text-center text-2xl font-bold text-white">{suggestedMeal.name}</p>
        ) : (
          <p className="my-6 text-center text-muted">Keine Mahlzeit in dieser Kategorie.</p>
        )}
        <div className="grid grid-cols-3 gap-2">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            <FiX /> Zurück
          </button>
          <button type="button" onClick={onShuffle} disabled={!suggestedMeal} className="btn btn-secondary">
            <FiRotateCcw /> Neu
          </button>
          <button
            type="button"
            onClick={() => suggestedMeal && onAccept(suggestedMeal.id)}
            disabled={!suggestedMeal}
            className="btn btn-primary"
          >
            <FiCheck /> Wählen
          </button>
        </div>
      </div>
    </div>
  );
};

export default MealSuggestionModal;
