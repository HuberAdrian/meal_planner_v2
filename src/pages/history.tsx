import { type NextPage } from "next";
import { useState, type FC } from "react";
import PageShell from "~/components/layout/PageShell";
import { EmptyState, ErrorState, Loading } from "~/components/loading";
import { MonthNav, StatsSubnav } from "~/components/StatsSubnav";
import { api } from "~/utils/api";

const HistoryMonth: FC<{ date: Date }> = ({ date }) => {
  const { data, error, isLoading, refetch } = api.post.getOneMonth.useQuery({ year: date.getFullYear(), month: date.getMonth() });

  if (isLoading) return <Loading />;
  if (error) return <ErrorState onRetry={() => void refetch()} />;
  if (!data || data.length === 0) return <EmptyState title="Keine Mahlzeiten in diesem Monat" />;

  const max = Math.max(...data.map((m) => m.timesEaten));
  const total = data.reduce((sum, m) => sum + m.timesEaten, 0);

  return (
    <div className="card">
      <p className="mb-4 text-sm text-muted">
        {total} Mahlzeiten · {data.length} verschiedene
      </p>
      <ul className="space-y-3">
        {data.map((meal) => (
          <li key={meal.id}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate text-gray-100">{meal.name}</span>
              <span className="shrink-0 font-semibold text-primary-100">{meal.timesEaten}×</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-3">
              <div
                className="h-full rounded-full bg-primary-100 transition-[width] duration-500"
                style={{ width: `${(meal.timesEaten / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const History: NextPage = () => {
  const [date, setDate] = useState<Date>(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  return (
    <PageShell title="Mahlzeiten" heading="Statistik" activePage="stats" subheader={<StatsSubnav active="meals" />}>
      <MonthNav date={date} onChange={setDate} />
      <HistoryMonth date={date} />
    </PageShell>
  );
};

export default History;
