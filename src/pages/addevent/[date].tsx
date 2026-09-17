import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FiChevronDown, FiChevronUp, FiShuffle } from "react-icons/fi";
import PageShell from "~/components/layout/PageShell";
import { ErrorState, Loading } from "~/components/loading";
import MealSuggestionModal from "~/components/MealSuggestionModal";
import { api, type RouterOutputs } from "~/utils/api";
import { formatDayHeading, isDateKey, parseDateKey, relativeDayLabel, todayKey } from "~/lib/dates";
import { extractIngredients, mealTypes, timeOptions, type MealType } from "~/lib/meals";

type Meal = RouterOutputs["meal"]["getAll"][number];
type Mode = "meal" | "event";

const SPECIAL_TOPIC = "9e4io1e";

const AddEvent: NextPage = () => {
  const router = useRouter();
  const utils = api.useContext();
  const routeDate = router.query.date;
  const dateKey = isDateKey(routeDate) ? routeDate : todayKey();

  const [mode, setMode] = useState<Mode>("meal");
  const [date, setDate] = useState(dateKey);
  const [time, setTime] = useState<string>(timeOptions.Abends);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mealId, setMealId] = useState("");
  const [showIngredients, setShowIngredients] = useState(false);

  const [suggestionType, setSuggestionType] = useState<MealType | "">("");
  const [suggestedMeal, setSuggestedMeal] = useState<{ id: string; name: string } | null>(null);
  const [suggestionOpen, setSuggestionOpen] = useState(false);

  // router.query is empty on the first render of a hard load — sync once ready.
  useEffect(() => {
    if (router.isReady) setDate(isDateKey(routeDate) ? routeDate : todayKey());
  }, [router.isReady, routeDate]);

  const { data: meals, isLoading, isError, refetch } = api.meal.getAll.useQuery();
  const selectedMeal = useMemo(() => meals?.find((m) => m.id === mealId) ?? null, [meals, mealId]);
  const ingredients = useMemo(() => (selectedMeal ? extractIngredients(selectedMeal) : []), [selectedMeal]);

  const create = api.post.create.useMutation();

  const mealsOfType = (type: MealType) => meals?.filter((m) => m.type === type) ?? [];
  const randomMeal = (type: MealType) => {
    const list = mealsOfType(type);
    const pick = list[Math.floor(Math.random() * list.length)];
    return pick ? { id: pick.id, name: pick.name } : null;
  };

  const chooseMeal = (meal: Meal | null) => {
    setMealId(meal?.id ?? "");
    setTitle(meal?.name ?? "");
    setDescription(meal?.description ?? "");
  };

  const openSuggestion = (type: string) => {
    if (!(mealTypes as readonly string[]).includes(type)) return;
    setSuggestionType(type as MealType);
    setSuggestedMeal(randomMeal(type as MealType));
    setSuggestionOpen(true);
  };

  const canSave = mode === "meal" ? mealId !== "" : title.trim() !== "";

  const handleSubmit = async () => {
    if (!canSave || !isDateKey(date) || !/^\d{2}:\d{2}$/.test(time)) return;
    const eventDate = parseDateKey(date);
    const [h, m] = time.split(":").map(Number);
    eventDate.setHours(h ?? 0, m ?? 0, 0, 0);

    try {
      await create.mutateAsync({
        mealID: mode === "meal" ? mealId : undefined,
        eventType: mode,
        topic: mode === "meal" ? (selectedMeal?.name ?? title) : title.trim(),
        content: description,
        eventDate,
      });

      if (mode === "event" && title.trim() === SPECIAL_TOPIC) {
        const potential = new Date(eventDate);
        potential.setDate(potential.getDate() + 30);
        await create.mutateAsync({
          eventType: "event",
          topic: `Potentiell ${SPECIAL_TOPIC}`,
          content: `Referenz: ${eventDate.toLocaleDateString("de-DE")}`,
          eventDate: potential,
        });
      }

      toast.success(mode === "meal" ? "Mahlzeit geplant" : "Termin gespeichert");
      void utils.post.invalidate();
      void utils.groceryList.invalidate();
      void router.push("/");
    } catch (e) {
      toast.error(e instanceof Error && e.message ? e.message : "Fehler beim Speichern");
    }
  };

  const { weekday, dayMonth } = formatDayHeading(date);
  const relative = relativeDayLabel(date);

  return (
    <PageShell
      title="Hinzufügen"
      heading={
        <span>
          {weekday}, {dayMonth}
          {relative && <span className="ml-2 text-base font-medium text-primary-100">{relative}</span>}
        </span>
      }
      activePage="calendar"
      subheader={
        <div className="segmented">
          <button type="button" className={mode === "meal" ? "active" : ""} onClick={() => setMode("meal")}>
            Mahlzeit
          </button>
          <button type="button" className={mode === "event" ? "active" : ""} onClick={() => setMode("event")}>
            Termin
          </button>
        </div>
      }
    >
      {isLoading ? (
        <Loading />
      ) : isError || !meals ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
          }}
        >
          {mode === "meal" ? (
            <div className="card space-y-4">
              <div>
                <label className="label" htmlFor="meal-select">
                  Mahlzeit
                </label>
                <select
                  id="meal-select"
                  className={`input ${mealId ? "" : "text-muted"}`}
                  value={mealId}
                  onChange={(e) => chooseMeal(meals.find((m) => m.id === e.target.value) ?? null)}
                >
                  <option value="">Mahlzeit wählen…</option>
                  {mealTypes.map((type) => {
                    const list = mealsOfType(type);
                    if (list.length === 0) return null;
                    return (
                      <optgroup key={type} label={type}>
                        {list.map((meal) => (
                          <option key={meal.id} value={meal.id}>
                            {meal.name}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="label" htmlFor="suggest-select">
                  <FiShuffle className="mr-1 inline" /> Oder Vorschlag aus Kategorie
                </label>
                <select
                  id="suggest-select"
                  className="input text-muted"
                  value=""
                  onChange={(e) => openSuggestion(e.target.value)}
                >
                  <option value="">Kategorie wählen…</option>
                  {mealTypes.map((type) => (
                    <option key={type} value={type} disabled={mealsOfType(type).length === 0}>
                      {type} ({mealsOfType(type).length})
                    </option>
                  ))}
                </select>
              </div>

              {selectedMeal && (
                <div className="card-2">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between text-sm text-gray-200"
                    onClick={() => setShowIngredients(!showIngredients)}
                  >
                    <span>
                      {ingredients.length} Zutaten → Einkaufsliste
                    </span>
                    {showIngredients ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                  {showIngredients && (
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {ingredients.map((ing) => (
                        <li key={ing.id} className="chip-sm">
                          {ing.name}
                        </li>
                      ))}
                      {ingredients.length === 0 && <li className="text-xs text-muted">Keine Zutaten hinterlegt</li>}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="card space-y-4">
              <div>
                <label className="label" htmlFor="event-title">
                  Titel
                </label>
                <input
                  id="event-title"
                  className="input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="z.B. Zahnarzt"
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="label" htmlFor="event-desc">
                  Beschreibung
                </label>
                <textarea
                  id="event-desc"
                  className="input resize-none"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>
          )}

          <div className="card space-y-4">
            <div>
              <span className="label">Uhrzeit</span>
              <div className="mb-2 flex gap-2">
                {Object.entries(timeOptions).map(([label, value]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setTime(value)}
                    className={`chip flex-1 justify-center ${time === value ? "chip-active" : ""}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="time"
                  className="input"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  aria-label="Uhrzeit"
                />
                <input
                  type="date"
                  className="input"
                  value={date}
                  onChange={(e) => e.target.value && setDate(e.target.value)}
                  aria-label="Datum"
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full py-4 text-base" disabled={!canSave || create.isLoading}>
            {create.isLoading ? "Wird gespeichert…" : "Speichern"}
          </button>
        </form>
      )}

      <MealSuggestionModal
        isOpen={suggestionOpen}
        category={suggestionType}
        suggestedMeal={suggestedMeal}
        onClose={() => setSuggestionOpen(false)}
        onShuffle={() => suggestionType && setSuggestedMeal(randomMeal(suggestionType))}
        onAccept={(id) => {
          chooseMeal(meals?.find((m) => m.id === id) ?? null);
          setSuggestionOpen(false);
        }}
      />
    </PageShell>
  );
};

export default AddEvent;
