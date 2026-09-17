import { useState, type FC } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import {
  MAX_INGREDIENTS,
  groceryCategories,
  mealTypes,
  type IngredientInput,
  type MealType,
} from "~/lib/meals";

export interface MealFormValue {
  name: string;
  type: MealType;
  description: string;
  ingredients: IngredientInput[];
}

export const emptyMealForm = (): MealFormValue => ({
  name: "",
  type: "andere Hauptgerichte",
  description: "",
  ingredients: [
    { name: "", category: "" },
    { name: "", category: "" },
    { name: "", category: "" },
  ],
});

interface MealFormProps {
  initial: MealFormValue;
  submitLabel: string;
  isSaving: boolean;
  onSubmit: (value: MealFormValue) => void;
  onCancel?: () => void;
}

const MealForm: FC<MealFormProps> = ({ initial, submitLabel, isSaving, onSubmit, onCancel }) => {
  const [value, setValue] = useState<MealFormValue>(initial);

  const setIngredient = (index: number, patch: Partial<IngredientInput>) =>
    setValue((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => (i === index ? { ...ing, ...patch } : ing)),
    }));

  const addIngredient = () => {
    if (value.ingredients.length >= MAX_INGREDIENTS) {
      toast.error(`Maximal ${MAX_INGREDIENTS} Zutaten`);
      return;
    }
    setValue((prev) => ({ ...prev, ingredients: [...prev.ingredients, { name: "", category: "" }] }));
  };

  const removeIngredient = (index: number) =>
    setValue((prev) => ({ ...prev, ingredients: prev.ingredients.filter((_, i) => i !== index) }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.name.trim()) {
      toast.error("Bitte einen Namen eingeben");
      return;
    }
    const missingCategory = value.ingredients.find((i) => i.name.trim() && !i.category);
    if (missingCategory) {
      toast.error(`Kategorie fehlt bei „${missingCategory.name.trim()}“`);
      return;
    }
    onSubmit({
      ...value,
      name: value.name.trim(),
      description: value.description.trim(),
      ingredients: value.ingredients.filter((i) => i.name.trim() !== ""),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="card space-y-4">
        <div>
          <label className="label" htmlFor="meal-name">
            Name
          </label>
          <input
            id="meal-name"
            className="input"
            value={value.name}
            onChange={(e) => setValue({ ...value, name: e.target.value })}
            placeholder="z.B. Lasagne"
            autoComplete="off"
          />
        </div>
        <div>
          <label className="label" htmlFor="meal-type">
            Typ
          </label>
          <select
            id="meal-type"
            className="input"
            value={value.type}
            onChange={(e) => setValue({ ...value, type: e.target.value as MealType })}
          >
            {mealTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="meal-desc">
            Beschreibung
          </label>
          <textarea
            id="meal-desc"
            className="input resize-none"
            rows={3}
            value={value.description}
            onChange={(e) => setValue({ ...value, description: e.target.value })}
            placeholder="Zubereitung, Notizen … (optional)"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="label mb-0">Zutaten</span>
          <span className="text-xs text-muted">
            {value.ingredients.filter((i) => i.name.trim()).length}/{MAX_INGREDIENTS}
          </span>
        </div>
        {value.ingredients.map((ingredient, index) => (
          <div key={index} className="card-2 flex items-start gap-2">
            <div className="min-w-0 flex-1 space-y-2">
              <input
                className="input py-2"
                value={ingredient.name}
                onChange={(e) => setIngredient(index, { name: e.target.value })}
                placeholder={`Zutat ${index + 1}`}
                autoComplete="off"
              />
              <select
                className={`input py-2 ${ingredient.category ? "" : "text-muted"}`}
                value={ingredient.category}
                onChange={(e) => setIngredient(index, { category: e.target.value })}
              >
                <option value="">Kategorie wählen</option>
                {groceryCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => removeIngredient(index)}
              className="btn-icon shrink-0 text-muted hover:text-red-300"
              aria-label="Zutat entfernen"
            >
              <FiX />
            </button>
          </div>
        ))}
        {value.ingredients.length < MAX_INGREDIENTS && (
          <button type="button" onClick={addIngredient} className="btn btn-secondary w-full">
            <FiPlus /> Zutat hinzufügen
          </button>
        )}
      </div>

      <div className="flex gap-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary flex-1">
            Abbrechen
          </button>
        )}
        <button type="submit" disabled={isSaving || !value.name.trim()} className="btn btn-primary flex-1">
          {isSaving ? "Wird gespeichert…" : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default MealForm;
