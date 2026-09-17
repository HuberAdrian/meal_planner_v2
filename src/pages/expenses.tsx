import type { NextPage } from "next";
import { useEffect, useMemo, useRef, useState, type FC } from "react";
import toast from "react-hot-toast";
import { FiChevronDown, FiChevronUp, FiPlus, FiTrash2, FiX } from "react-icons/fi";
import PageShell from "~/components/layout/PageShell";
import { EmptyState, ErrorState, Loading } from "~/components/loading";
import { MonthNav, StatsSubnav } from "~/components/StatsSubnav";
import { api, type RouterOutputs } from "~/utils/api";
import { todayKey, parseDateKey } from "~/lib/dates";

type Expense = RouterOutputs["expense"]["getAll"][number];

const categoryOrder = ["Miete", "Lebensmitteleinkäufe", "Transport", "Fitness", "Einkaufen", "Auto", "Telefon", "Abonnements", "Sonstiges"];

const chartGroups = {
  Miete: "#f87171",
  Lebensmitteleinkäufe: "#60a5fa",
  Sonstiges: "#9ca3af",
} as const;
type ChartGroup = keyof typeof chartGroups;
const toChartGroup = (category: string): ChartGroup => (category in chartGroups ? (category as ChartGroup) : "Sonstiges");

type MonthTotals = { key: string; label: string; groups: Record<ChartGroup, number>; total: number };

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const monthLabel = (key: string) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(y ?? 0, (m ?? 1) - 1, 1).toLocaleDateString("de-DE", { month: "short", year: "2-digit" });
};

const formatCurrency = (amount: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount);

function monthlyTotals(expenses: Expense[]): MonthTotals[] {
  const map = new Map<string, MonthTotals>();
  for (const e of expenses) {
    const key = monthKey(e.date);
    const entry = map.get(key) ?? { key, label: monthLabel(key), groups: { Miete: 0, Lebensmitteleinkäufe: 0, Sonstiges: 0 }, total: 0 };
    entry.groups[toChartGroup(e.category)] += e.amount;
    entry.total += e.amount;
    map.set(key, entry);
  }
  return [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
}

const ExpenseChart: FC<{ months: MonthTotals[]; currentKey: string }> = ({ months, currentKey }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const displayed = useMemo(() => {
    const idx = months.findIndex((m) => m.key === currentKey);
    const end = idx === -1 ? months.length : idx + 1;
    return months.slice(Math.max(0, end - 4), end);
  }, [months, currentKey]);
  const average = displayed.length ? displayed.reduce((s, m) => s + m.total, 0) / displayed.length : 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || displayed.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const top = 28;
    const bottom = rect.height - 40;
    const plotHeight = bottom - top;
    const slot = rect.width / displayed.length;
    const barWidth = Math.min(64, slot * 0.55);
    const max = Math.max(...displayed.map((m) => m.total), 1);

    displayed.forEach((month, i) => {
      const x = i * slot + (slot - barWidth) / 2;
      let y = bottom;
      (Object.keys(chartGroups) as ChartGroup[]).forEach((group) => {
        const h = (month.groups[group] / max) * plotHeight;
        ctx.fillStyle = chartGroups[group];
        ctx.fillRect(x, y - h, barWidth, h);
        y -= h;
      });
      ctx.fillStyle = month.key === currentKey ? "#ffffff" : "#9ca3af";
      ctx.font = `${month.key === currentKey ? "bold " : ""}12px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(month.label, x + barWidth / 2, rect.height - 22);
      ctx.fillText(formatCurrency(month.total), x + barWidth / 2, rect.height - 6);
    });

    const avgY = bottom - (average / max) * plotHeight;
    ctx.strokeStyle = "#facc15";
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, avgY);
    ctx.lineTo(rect.width, avgY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#facc15";
    ctx.font = "11px system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`Ø ${formatCurrency(average)}`, rect.width - 4, avgY - 6);
  }, [displayed, currentKey, average]);

  if (displayed.length === 0) return null;

  return (
    <div className="card mb-4">
      <div style={{ height: 240 }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted">
        {(Object.keys(chartGroups) as ChartGroup[]).map((g) => (
          <span key={g} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: chartGroups[g] }} />
            {g === "Sonstiges" ? "Alles andere" : g}
          </span>
        ))}
      </div>
    </div>
  );
};

const CategoryRow: FC<{ category: string; expenses: Expense[]; onDelete: (e: Expense) => void }> = ({ category, expenses, onDelete }) => {
  const [open, setOpen] = useState(false);
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  return (
    <div className="border-b border-line last:border-b-0">
      <button type="button" className="flex w-full items-center justify-between py-3 text-left" onClick={() => setOpen(!open)}>
        <span className="flex items-center gap-2 font-medium">
          {open ? <FiChevronUp className="text-muted" /> : <FiChevronDown className="text-muted" />}
          {category}
          <span className="text-xs text-muted">({expenses.length})</span>
        </span>
        <span className="font-semibold">{formatCurrency(total)}</span>
      </button>
      {open && (
        <ul className="mb-3 space-y-1 pl-6">
          {expenses.map((e) => (
            <li key={e.id} className="flex items-center gap-2 text-sm text-gray-300">
              <span className="w-14 shrink-0 text-muted">{e.date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })}</span>
              <span className="min-w-0 flex-1 truncate">{e.description || "–"}</span>
              <span className="shrink-0">{formatCurrency(e.amount)}</span>
              <button className="btn-icon h-7 w-7 text-muted hover:text-red-300" onClick={() => onDelete(e)} aria-label="Löschen">
                <FiTrash2 className="text-sm" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const AddExpenseSheet: FC<{ defaultDate: Date; onClose: () => void }> = ({ defaultDate, onClose }) => {
  const utils = api.useContext();
  const [category, setCategory] = useState("Lebensmitteleinkäufe");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => {
    const today = new Date();
    const sameMonth = today.getFullYear() === defaultDate.getFullYear() && today.getMonth() === defaultDate.getMonth();
    return sameMonth ? todayKey() : `${defaultDate.getFullYear()}-${String(defaultDate.getMonth() + 1).padStart(2, "0")}-01`;
  });
  const [description, setDescription] = useState("");

  const { mutate, isLoading } = api.expense.create.useMutation({
    onSuccess: () => {
      toast.success("Ausgabe gespeichert");
      void utils.expense.getAll.invalidate();
      onClose();
    },
    onError: (e) => toast.error(e.message || "Fehler beim Speichern"),
  });

  const parsedAmount = Number(amount.replace(",", "."));
  const valid = Number.isFinite(parsedAmount) && parsedAmount > 0 && /^\d{4}-\d{2}-\d{2}$/.test(date);

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <form
        className="sheet space-y-4"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          mutate({ category, amount: Math.round(parsedAmount * 100) / 100, date: parseDateKey(date), description: description.trim() });
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Ausgabe hinzufügen</h2>
          <button type="button" className="btn-icon -mr-2" onClick={onClose} aria-label="Schließen">
            <FiX className="text-xl" />
          </button>
        </div>
        <div>
          <label className="label" htmlFor="exp-amount">
            Betrag (€)
          </label>
          <input id="exp-amount" className="input" inputMode="decimal" placeholder="0,00" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
        </div>
        <div>
          <label className="label" htmlFor="exp-cat">
            Kategorie
          </label>
          <select id="exp-cat" className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            {categoryOrder.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="exp-date">
            Datum
          </label>
          <input id="exp-date" type="date" className="input" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="exp-desc">
            Beschreibung
          </label>
          <input id="exp-desc" className="input" placeholder="Optional" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={!valid || isLoading}>
          {isLoading ? "Wird gespeichert…" : "Speichern"}
        </button>
      </form>
    </div>
  );
};

const Expenses: NextPage = () => {
  const utils = api.useContext();
  const [date, setDate] = useState<Date>(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [initialised, setInitialised] = useState(false);
  const [adding, setAdding] = useState(false);
  const { data, isLoading, isError, refetch } = api.expense.getAll.useQuery();

  // Jump to the most recent month that has data on first load.
  useEffect(() => {
    if (initialised || !data) return;
    setInitialised(true);
    const latest = data[0];
    if (latest) setDate(new Date(latest.date.getFullYear(), latest.date.getMonth(), 1));
  }, [data, initialised]);

  const remove = api.expense.delete.useMutation({
    onSuccess: () => {
      toast.success("Ausgabe gelöscht");
      void utils.expense.getAll.invalidate();
    },
    onError: () => toast.error("Fehler beim Löschen"),
  });

  const months = useMemo(() => monthlyTotals(data ?? []), [data]);
  const currentKey = monthKey(date);
  const currentExpenses = useMemo(() => (data ?? []).filter((e) => monthKey(e.date) === currentKey), [data, currentKey]);
  const grouped = useMemo(() => {
    const map = new Map<string, Expense[]>();
    for (const e of currentExpenses) (map.get(e.category) ?? map.set(e.category, []).get(e.category))!.push(e);
    return [...map.entries()].sort(([a], [b]) => {
      const ia = categoryOrder.indexOf(a);
      const ib = categoryOrder.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
  }, [currentExpenses]);
  const total = currentExpenses.reduce((s, e) => s + e.amount, 0);

  const displayedForAverage = useMemo(() => {
    const idx = months.findIndex((m) => m.key === currentKey);
    const end = idx === -1 ? months.length : idx + 1;
    return months.slice(Math.max(0, end - 4), end);
  }, [months, currentKey]);
  const average = displayedForAverage.length ? displayedForAverage.reduce((s, m) => s + m.total, 0) / displayedForAverage.length : 0;
  const fireNumber = Math.round(average * 12 * 25);

  return (
    <PageShell
      title="Ausgaben"
      heading="Statistik"
      activePage="stats"
      subheader={<StatsSubnav active="expenses" />}
      actions={
        <button className="btn btn-primary px-3 py-2" onClick={() => setAdding(true)}>
          <FiPlus /> Neu
        </button>
      }
    >
      <MonthNav date={date} onChange={setDate} />
      {isLoading ? (
        <Loading />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : (
        <>
          <div className="card mb-4 flex items-baseline justify-between">
            <span className="text-muted">Gesamt</span>
            <span className="text-2xl font-bold">{formatCurrency(total)}</span>
          </div>
          <ExpenseChart months={months} currentKey={currentKey} />
          {grouped.length === 0 ? (
            <EmptyState title="Keine Ausgaben in diesem Monat" action={<button className="btn btn-secondary" onClick={() => setAdding(true)}>Ausgabe hinzufügen</button>} />
          ) : (
            <div className="card py-1">
              {grouped.map(([category, expenses]) => (
                <CategoryRow key={category} category={category} expenses={expenses} onDelete={(e) => remove.mutate({ id: e.id })} />
              ))}
            </div>
          )}
          {average > 0 && (
            <div className="card mt-4">
              <h3 className="mb-1 font-bold">Lifestyle-Rechner</h3>
              <p className="text-sm text-gray-300">
                Um diesen Lifestyle aus Anlagen zu finanzieren, braucht es ein Netto-Vermögen von{" "}
                <span className="font-bold text-white">{formatCurrency(fireNumber)}</span>.
              </p>
              <p className="mt-2 text-xs text-muted">Ø der letzten 4 Monate × 12 × 25 (4 %-Regel, inflationsbereinigte Rendite &gt; 7 %).</p>
            </div>
          )}
        </>
      )}
      {adding && <AddExpenseSheet defaultDate={date} onClose={() => setAdding(false)} />}
    </PageShell>
  );
};

export default Expenses;
