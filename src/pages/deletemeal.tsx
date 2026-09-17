import { type NextPage } from "next";
import { useMemo, useState, type FC } from "react";
import toast from "react-hot-toast";
import { FiEdit2, FiSearch, FiTrash2, FiX } from "react-icons/fi";
import PageShell from "~/components/layout/PageShell";
import { EmptyState, ErrorState, Loading } from "~/components/loading";
import MealForm, { type MealFormValue } from "~/components/MealForm";
import MealsSubnav from "~/components/MealsSubnav";
import { api, type RouterOutputs } from "~/utils/api";
import { extractIngredients, mealTypes, type MealType } from "~/lib/meals";

type Meal = RouterOutputs["meal"]["getAll"][number];

const toFormValue = (meal: Meal): MealFormValue => ({
  name: meal.name,
  type: (mealTypes as readonly string[]).includes(meal.type) ? (meal.type as MealType) : "andere Hauptgerichte",
  description: meal.description ?? "",
  ingredients: extractIngredients(meal).map((i) => ({ name: i.name, category: i.category ?? "" })),
});

const EditSheet: FC<{ meal: Meal; onClose: () => void }> = ({ meal, onClose }) => {
  const utils = api.useContext();
  const { mutate, isLoading } = api.meal.update.useMutation({
    onSuccess: () => {
      toast.success("Rezept aktualisiert");
      void utils.meal.getAll.invalidate();
      onClose();
    },
    onError: (e) => toast.error(e.message || "Fehler beim Speichern"),
  });

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Rezept bearbeiten</h2>
          <button className="btn-icon -mr-2" onClick={onClose} aria-label="Schließen">
            <FiX className="text-xl" />
          </button>
        </div>
        <MealForm
          initial={toFormValue(meal)}
          submitLabel="Speichern"
          isSaving={isLoading}
          onCancel={onClose}
          onSubmit={(value) =>
            mutate({
              id: meal.id,
              name: value.name,
              type: value.type,
              description: value.description || null,
              ingredients: value.ingredients,
            })
          }
        />
      </div>
    </div>
  );
};

const DeleteSheet: FC<{ meal: Meal; onClose: () => void }> = ({ meal, onClose }) => {
  const utils = api.useContext();
  const { mutate, isLoading } = api.meal.delete.useMutation({
    onSuccess: () => {
      toast.success(`„${meal.name}“ gelöscht`);
      void utils.meal.getAll.invalidate();
      onClose();
    },
    onError: (e) => toast.error(e.message || "Fehler beim Löschen"),
  });

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold">Rezept löschen?</h2>
        <p className="mt-2 mb-5 text-gray-300">
          „{meal.name}“ wird dauerhaft gelöscht. Bereits geplante Mahlzeiten bleiben im Kalender.
        </p>
        <div className="flex gap-2">
          <button className="btn btn-secondary flex-1" onClick={onClose}>
            Abbrechen
          </button>
          <button className="btn btn-danger flex-1" disabled={isLoading} onClick={() => mutate({ id: meal.id })}>
            <FiTrash2 /> {isLoading ? "Löscht…" : "Löschen"}
          </button>
        </div>
      </div>
    </div>
  );
};

const MealCard: FC<{ meal: Meal; onEdit: () => void; onDelete: () => void }> = ({ meal, onEdit, onDelete }) => {
  const ingredients = extractIngredients(meal);
  return (
    <article className="card animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg leading-tight font-bold text-white">{meal.name}</h2>
          <span className="mt-1 inline-block text-xs font-medium text-primary-100">{meal.type}</span>
        </div>
        <div className="flex shrink-0 gap-1">
          <button className="btn-icon" onClick={onEdit} aria-label="Bearbeiten">
            <FiEdit2 />
          </button>
          <button className="btn-icon hover:text-red-300" onClick={onDelete} aria-label="Löschen">
            <FiTrash2 />
          </button>
        </div>
      </div>
      {meal.description && <p className="mt-2 line-clamp-3 text-sm whitespace-pre-line text-gray-300">{meal.description}</p>}
      {ingredients.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {ingredients.map((ing) => (
            <li key={ing.id} className="chip-sm" title={ing.category ?? "Keine Kategorie"}>
              {ing.name}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
};

const MealsPage: NextPage = () => {
  const [activeType, setActiveType] = useState<"Alle" | MealType>("Alle");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Meal | null>(null);
  const [deleting, setDeleting] = useState<Meal | null>(null);

  const { data, isLoading, isError, refetch } = api.meal.getAll.useQuery();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? []).filter(
      (meal) =>
        (activeType === "Alle" || meal.type === activeType) &&
        (q === "" ||
          meal.name.toLowerCase().includes(q) ||
          extractIngredients(meal).some((i) => i.name.toLowerCase().includes(q)))
    );
  }, [data, activeType, search]);

  const countFor = (type: string) => (data ?? []).filter((m) => m.type === type).length;

  return (
    <PageShell title="Rezepte" heading="Essen" activePage="meals" subheader={<MealsSubnav active="list" />}>
      <div className="mb-3">
        <div className="relative">
          <FiSearch className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
          <input
            className="input pl-9"
            placeholder="Rezept oder Zutat suchen"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="search"
          />
        </div>
      </div>
      <div className="hide-scrollbar -mx-4 mb-4 overflow-x-auto px-4">
        <div className="flex gap-2">
          <button className={`chip ${activeType === "Alle" ? "chip-active" : ""}`} onClick={() => setActiveType("Alle")}>
            Alle ({data?.length ?? 0})
          </button>
          {mealTypes.map((type) => (
            <button
              key={type}
              className={`chip ${activeType === type ? "chip-active" : ""}`}
              onClick={() => setActiveType(type)}
              disabled={countFor(type) === 0}
            >
              {type} ({countFor(type)})
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Loading />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState title="Keine Rezepte gefunden" hint={search ? "Andere Suche probieren." : "Lege ein neues Rezept an."} />
      ) : (
        <div className="space-y-3">
          {filtered.map((meal) => (
            <MealCard key={meal.id} meal={meal} onEdit={() => setEditing(meal)} onDelete={() => setDeleting(meal)} />
          ))}
        </div>
      )}

      {editing && <EditSheet key={editing.id} meal={editing} onClose={() => setEditing(null)} />}
      {deleting && <DeleteSheet meal={deleting} onClose={() => setDeleting(null)} />}
    </PageShell>
  );
};

export default MealsPage;
