import Link from "next/link";
import { type FC } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { formatMonthYear } from "~/lib/dates";

export const StatsSubnav: FC<{ active: "meals" | "expenses" }> = ({ active }) => (
  <div className="segmented">
    <Link href="/history" className={active === "meals" ? "active" : ""}>
      Mahlzeiten
    </Link>
    <Link href="/expenses" className={active === "expenses" ? "active" : ""}>
      Ausgaben
    </Link>
  </div>
);

export const MonthNav: FC<{ date: Date; onChange: (date: Date) => void }> = ({ date, onChange }) => (
  <div className="card mb-4 flex items-center justify-between py-2">
    <button className="btn-icon" onClick={() => onChange(new Date(date.getFullYear(), date.getMonth() - 1, 1))} aria-label="Vorheriger Monat">
      <FiChevronLeft className="text-xl" />
    </button>
    <span className="font-semibold capitalize">{formatMonthYear(date)}</span>
    <button className="btn-icon" onClick={() => onChange(new Date(date.getFullYear(), date.getMonth() + 1, 1))} aria-label="Nächster Monat">
      <FiChevronRight className="text-xl" />
    </button>
  </div>
);
