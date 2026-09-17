import { type NextPage } from "next";
import { useEffect, useMemo, useState, type FC } from "react";
import toast from "react-hot-toast";
import { FiCheck, FiPlus, FiTrash2, FiX } from "react-icons/fi";
import { LuRefreshCw } from "react-icons/lu";
import PageShell from "~/components/layout/PageShell";
import { EmptyState, ErrorState, Loading } from "~/components/loading";
import { api, type RouterOutputs } from "~/utils/api";
import { formatDayHeading, toDateKey, todayKey } from "~/lib/dates";
import { DEFAULT_CATEGORY, groceryCategories, sortByCategory } from "~/lib/meals";

type Item = RouterOutputs["groceryList"]["getAll"][number];
type MealFilters = Record<string, boolean>;

const FILTERS_KEY = "mealFilters";
const LEGACY_COMPLETED_KEY = "completedGroceryItems";
const MANUAL = "Manuell";

function usageLabel(item: Item): string {
  const d = new Date(item.usageDate);
  if (Number.isNaN(d.getTime())) return "";
  const { weekday, dayMonth } = formatDayHeading(toDateKey(d));
  return `${weekday.slice(0, 2)}, ${dayMonth}`;
}

const GroceryItem: FC<{ item: Item; onToggle: () => void; onRemove: () => void }> = ({ item, onToggle, onRemove }) => (
  <li className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${item.completed ? "bg-surface/60" : "bg-surface"}`}>
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={item.completed}
      aria-label={item.completed ? "Als offen markieren" : "Als erledigt markieren"}
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
        item.completed ? "border-primary-100 bg-primary-100 text-primary-400" : "border-gray-500 hover:border-primary-100"
      }`}
    >
      {item.completed && <FiCheck className="text-sm" strokeWidth={3} />}
    </button>
    <button type="button" onClick={onToggle} className="min-w-0 flex-1 text-left">
      <p className={`truncate font-medium ${item.completed ? "text-muted line-through" : "text-white"}`}>{item.name}</p>
      <p className="truncate text-xs text-muted">
        {item.reference === MANUAL ? "Manuell" : item.reference}
        {item.reference !== MANUAL && usageLabel(item) && ` · ${usageLabel(item)}`}
      </p>
    </button>
    <button type="button" onClick={onRemove} className="btn-icon h-8 w-8 text-muted hover:text-red-300" aria-label="Entfernen">
      <FiX />
    </button>
  </li>
);

const Grocerylist: NextPage = () => {
  const utils = api.useContext();
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState<string>(DEFAULT_CATEGORY);
  const [mealFilters, setMealFilters] = useState<MealFilters>({});
  const [migrated, setMigrated] = useState(false);

  const { data, isLoading, isError, refetch } = api.groceryList.getAll.useQuery();

  // Persisted per-device: which meals' items are shown.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(FILTERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as unknown;
        if (parsed && typeof parsed === "object") setMealFilters(parsed as MealFilters);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (Object.keys(mealFilters).length > 0) localStorage.setItem(FILTERS_KEY, JSON.stringify(mealFilters));
  }, [mealFilters]);

  const setManyCompleted = api.groceryList.setManyCompleted.useMutation();

  // One-off migration: check-offs used to live only in localStorage. Move them
  // into the DB so both phones share the state, then drop the old key.
  useEffect(() => {
    if (!data || migrated) return;
    setMigrated(true);
    try {
      const raw = localStorage.getItem(LEGACY_COMPLETED_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, boolean>;
      const ids = Object.entries(parsed)
        .filter(([id, done]) => done && data.some((item) => item.id === id && !item.completed))
        .map(([id]) => id);
      localStorage.removeItem(LEGACY_COMPLETED_KEY);
      if (ids.length > 0) {
        setManyCompleted.mutate({ ids, completed: true }, { onSuccess: () => void utils.groceryList.getAll.invalidate() });
      }
    } catch {
      localStorage.removeItem(LEGACY_COMPLETED_KEY);
    }
  }, [data, migrated, setManyCompleted, utils]);

  const setCompleted = api.groceryList.setCompleted.useMutation({
    // Optimistic toggle so the checkbox reacts instantly.
    onMutate: async ({ id, completed }) => {
      await utils.groceryList.getAll.cancel();
      const previous = utils.groceryList.getAll.getData();
      utils.groceryList.getAll.setData(undefined, (old) => old?.map((i) => (i.id === id ? { ...i, completed } : i)));
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      utils.groceryList.getAll.setData(undefined, ctx?.previous);
      toast.error("Konnte nicht speichern");
    },
    onSettled: () => void utils.groceryList.getAll.invalidate(),
  });

  const remove = api.groceryList.delete.useMutation({
    onMutate: async ({ id }) => {
      await utils.groceryList.getAll.cancel();
      const previous = utils.groceryList.getAll.getData();
      utils.groceryList.getAll.setData(undefined, (old) => old?.filter((i) => i.id !== id));
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      utils.groceryList.getAll.setData(undefined, ctx?.previous);
      toast.error("Konnte nicht löschen");
    },
    onSettled: () => void utils.groceryList.getAll.invalidate(),
  });

  const create = api.groceryList.create.useMutation({
    onSuccess: () => {
      void utils.groceryList.getAll.invalidate();
    },
    onError: (e) => toast.error(e.message || "Konnte nicht hinzufügen"),
  });

  const deleteCompleted = api.groceryList.deleteCompleted.useMutation({
    onSuccess: (res) => {
      toast.success(`${res.count} erledigte ${res.count === 1 ? "Item" : "Items"} gelöscht`);
      void utils.groceryList.getAll.invalidate();
    },
    onError: () => toast.error("Fehler beim Löschen"),
  });

  const items = useMemo(() => sortByCategory(data ?? []), [data]);
  const meals = useMemo(() => [...new Set(items.filter((i) => i.reference !== MANUAL).map((i) => i.reference))], [items]);
  const isVisible = (item: Item) => item.reference === MANUAL || mealFilters[item.reference] !== false;
  const visible = items.filter(isVisible);
  const completedCount = items.filter((i) => i.completed).length;
  const openCount = visible.filter((i) => !i.completed).length;

  const groups = useMemo(() => {
    const map = new Map<string, Item[]>();
    for (const item of visible) {
      const cat = (groceryCategories as readonly string[]).includes(item.category) ? item.category : DEFAULT_CATEGORY;
      (map.get(cat) ?? map.set(cat, []).get(cat))!.push(item);
    }
    return [...map.entries()];
  }, [visible]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newItemName.trim();
    if (!name) return;
    create.mutate({
      name,
      usageDate: todayKey(),
      reference: MANUAL,
      category: (groceryCategories as readonly string[]).includes(newItemCategory)
        ? (newItemCategory as (typeof groceryCategories)[number])
        : DEFAULT_CATEGORY,
    });
    setNewItemName("");
  };

  return (
    <PageShell
      title="Einkaufsliste"
      activePage="grocerylist"
      actions={
        <button
          className="btn-icon"
          onClick={() => {
            void refetch();
            toast.success("Aktualisiert");
          }}
          aria-label="Aktualisieren"
        >
          <LuRefreshCw className="text-xl" />
        </button>
      }
    >
      <form onSubmit={handleAdd} className="card mb-4 space-y-2">
        <div className="flex gap-2">
          <input
            className="input"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Neues Item"
            autoComplete="off"
            enterKeyHint="done"
          />
          <button type="submit" className="btn btn-primary shrink-0 px-4" disabled={!newItemName.trim() || create.isLoading} aria-label="Hinzufügen">
            <FiPlus className="text-xl" />
          </button>
        </div>
        <select className="input py-2 text-sm" value={newItemCategory} onChange={(e) => setNewItemCategory(e.target.value)} aria-label="Kategorie">
          {groceryCategories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </form>

      {meals.length > 0 && (
        <div className="hide-scrollbar -mx-4 mb-4 overflow-x-auto px-4">
          <div className="flex gap-2">
            {meals.map((meal) => {
              const on = mealFilters[meal] !== false;
              return (
                <button
                  key={meal}
                  type="button"
                  className={`chip ${on ? "chip-active" : ""}`}
                  onClick={() => setMealFilters((prev) => ({ ...prev, [meal]: !on }))}
                >
                  {meal}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {isLoading ? (
        <Loading />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : visible.length === 0 ? (
        <EmptyState
          title="Die Einkaufsliste ist leer"
          hint={items.length > 0 ? "Alle Mahlzeiten sind ausgeblendet." : "Plane eine Mahlzeit im Kalender oder füge Items manuell hinzu."}
        />
      ) : (
        <div className="space-y-5">
          <p className="px-1 text-xs text-muted">
            {openCount} offen · {completedCount} erledigt
          </p>
          {groups.map(([category, groupItems]) => (
            <section key={category}>
              <h2 className="mb-2 px-1 text-xs font-semibold tracking-wide text-muted uppercase">{category}</h2>
              <ul className="space-y-1.5">
                {groupItems.map((item) => (
                  <GroceryItem
                    key={item.id}
                    item={item}
                    onToggle={() => setCompleted.mutate({ id: item.id, completed: !item.completed })}
                    onRemove={() => remove.mutate({ id: item.id })}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {completedCount > 0 && (
        <button className="btn btn-danger mt-6 w-full" disabled={deleteCompleted.isLoading} onClick={() => deleteCompleted.mutate()}>
          <FiTrash2 /> {completedCount} erledigte {completedCount === 1 ? "Item" : "Items"} löschen
        </button>
      )}
    </PageShell>
  );
};

export default Grocerylist;
