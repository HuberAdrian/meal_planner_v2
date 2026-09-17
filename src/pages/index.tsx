import { SignInButton, useUser } from "@clerk/nextjs";
import Head from "next/head";
import { useRouter } from "next/router";
import { useMemo, useState, type FC } from "react";
import toast from "react-hot-toast";
import useInfiniteScroll from "react-infinite-scroll-hook";
import { FiPlus, FiX, FiChevronLeft, FiChevronRight, FiList, FiCalendar, FiTrash2 } from "react-icons/fi";
import { LuRefreshCw } from "react-icons/lu";
import PageShell from "~/components/layout/PageShell";
import { ErrorState, Loading } from "~/components/loading";
import { api, type RouterOutputs } from "~/utils/api";
import {
  addDays,
  formatDayHeading,
  formatMonthYear,
  formatTime,
  relativeDayLabel,
  startOfToday,
  toDateKey,
  todayKey,
  type DateKey,
} from "~/lib/dates";
import { timeOptions } from "~/lib/meals";

type Post = RouterOutputs["post"]["getUpcoming"][number];
type GroupedPosts = Record<DateKey, Post[]>;

const SPECIAL_TOPICS = ["9e4io1e", "Potentiell 9e4io1e"];
const isSpecial = (post: Post) => SPECIAL_TOPICS.includes(post.topic);

function groupPostsByDate(posts: Post[]): GroupedPosts {
  const grouped: GroupedPosts = {};
  for (const post of posts) {
    const key = toDateKey(post.eventDate);
    (grouped[key] ??= []).push(post);
  }
  return grouped;
}

function mealTimeLabel(post: Post): string {
  const time = formatTime(post.eventDate);
  if (post.eventType === "meal") {
    const match = Object.entries(timeOptions).find(([, t]) => t === time);
    if (match) return match[0];
  }
  return time;
}

// ------------------ NOT LOGGED IN ------------------
const LandingPage: FC = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const images = ["/Vivien.png", "/Adrian.png", "/Benni.png"];

  return (
    <>
      <Head>
        <title>11uhr11</title>
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-primary-400 p-6">
        <h1 className="text-4xl font-bold">geh weg</h1>
        <img
          src={images[currentImage]}
          alt="Willkommen"
          onClick={() => setCurrentImage((currentImage + 1) % images.length)}
          className="max-h-[320px] max-w-[320px] cursor-pointer rounded-2xl object-cover select-none"
        />
        <SignInButton mode="modal">
          <button className="btn btn-primary min-w-40">Anmelden</button>
        </SignInButton>
      </main>
    </>
  );
};

// ------------------ DETAIL SHEET ------------------
const PostSheet: FC<{ post: Post; onClose: () => void; onDeleted: () => void }> = ({ post, onClose, onDeleted }) => {
  const [confirming, setConfirming] = useState(false);
  const { mutate, isLoading } = api.post.delete.useMutation({
    onSuccess: () => {
      toast.success("Gelöscht");
      onDeleted();
    },
    onError: (e) => toast.error(e.message || "Fehler beim Löschen"),
  });

  const { weekday, dayMonth } = formatDayHeading(toDateKey(post.eventDate));

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">
              {post.eventType === "meal" ? "Mahlzeit" : "Termin"} · {weekday}, {dayMonth} · {mealTimeLabel(post)}
            </p>
            <h2 className={`mt-1 text-2xl font-bold ${isSpecial(post) ? "text-red-300" : "text-white"}`}>{post.topic}</h2>
          </div>
          <button onClick={onClose} className="btn-icon -mr-2 shrink-0" aria-label="Schließen">
            <FiX className="text-xl" />
          </button>
        </div>
        {post.content && post.content !== "-" && (
          <p className="mb-5 whitespace-pre-wrap text-gray-300">{post.content}</p>
        )}
        {confirming ? (
          <div className="flex gap-2">
            <button className="btn btn-secondary flex-1" onClick={() => setConfirming(false)}>
              Abbrechen
            </button>
            <button className="btn btn-danger flex-1" disabled={isLoading} onClick={() => mutate({ id: post.id })}>
              <FiTrash2 /> {isLoading ? "Löscht…" : "Wirklich löschen"}
            </button>
          </div>
        ) : (
          <button className="btn btn-ghost w-full" onClick={() => setConfirming(true)}>
            <FiTrash2 /> Löschen
            {post.eventType === "meal" && <span className="text-xs text-muted">(inkl. Einkaufsliste)</span>}
          </button>
        )}
      </div>
    </div>
  );
};

// ------------------ DAY CARD ------------------
const Day: FC<{ dateKey: DateKey; posts: Post[]; onSelect: (post: Post) => void }> = ({ dateKey, posts, onSelect }) => {
  const router = useRouter();
  const { weekday, dayMonth } = formatDayHeading(dateKey);
  const relative = relativeDayLabel(dateKey);
  const isToday = dateKey === todayKey();

  return (
    <section className={`card animate-fade-in ${isToday ? "border-primary-100/50" : ""}`}>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-white">
          {weekday}
          {relative && <span className="ml-2 rounded-full bg-primary-100/15 px-2 py-0.5 text-xs font-semibold text-primary-100">{relative}</span>}
        </h2>
        <span className="text-sm text-muted">{dayMonth}</span>
      </div>

      {posts.length === 0 ? (
        <p className="mb-3 text-sm text-muted">Nichts geplant</p>
      ) : (
        <ul className="mb-3 space-y-2">
          {posts.map((post) => (
            <li key={post.id}>
              <button
                type="button"
                onClick={() => onSelect(post)}
                className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors ${
                  isSpecial(post) ? "bg-red-900/30 hover:bg-red-900/40" : "bg-surface-2 hover:bg-surface-3"
                }`}
              >
                <img
                  src={post.eventType === "meal" ? "/meal_default.png" : "/event_default.png"}
                  alt=""
                  className="h-9 w-9 shrink-0 rounded-lg"
                />
                <div className="min-w-0 flex-1">
                  <p className={`truncate font-semibold ${isSpecial(post) ? "text-red-300" : "text-white"}`}>{post.topic}</p>
                  <p className="text-xs text-muted">
                    {mealTimeLabel(post)}
                    {post.eventType !== "meal" && post.content && post.content !== "-" && (
                      <span className="text-gray-400"> · {post.content}</span>
                    )}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        className="btn btn-secondary w-full py-2 text-muted hover:text-white"
        onClick={() => void router.push(`/addevent/${dateKey}`)}
      >
        <FiPlus /> Hinzufügen
      </button>
    </section>
  );
};

// ------------------ LIST VIEW ------------------
const ListView: FC<{ onSelect: (post: Post) => void }> = ({ onSelect }) => {
  const [from] = useState(() => startOfToday());
  const [dayCount, setDayCount] = useState(14);
  const { data, isLoading, isError, refetch } = api.post.getUpcoming.useQuery({ from });

  const [infiniteRef] = useInfiniteScroll({
    loading: false,
    hasNextPage: dayCount < 365,
    onLoadMore: () => setDayCount((n) => n + 14),
    rootMargin: "0px 0px 300px 0px",
  });

  const grouped = useMemo(() => groupPostsByDate(data ?? []), [data]);
  const days = useMemo(() => Array.from({ length: dayCount }, (_, i) => toDateKey(addDays(from, i))), [from, dayCount]);

  if (isLoading) return <Loading />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;

  return (
    <div className="space-y-3">
      {days.map((key) => (
        <Day key={key} dateKey={key} posts={grouped[key] ?? []} onSelect={onSelect} />
      ))}
      <div ref={infiniteRef} className="py-4 text-center text-xs text-muted">
        {dayCount < 365 ? "Weiter scrollen für mehr Tage" : ""}
      </div>
    </div>
  );
};

// ------------------ MONTH VIEW ------------------
const MonthView: FC<{ onSelect: (post: Post) => void }> = ({ onSelect }) => {
  const [cursor, setCursor] = useState(() => {
    const d = startOfToday();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<DateKey | null>(todayKey());

  const monthStart = cursor;
  const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  const { data, isLoading, isError, refetch } = api.post.getInRange.useQuery({ from: monthStart, to: monthEnd });
  const grouped = useMemo(() => groupPostsByDate(data ?? []), [data]);

  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const leadingBlanks = (monthStart.getDay() + 6) % 7; // Monday first
  const today = todayKey();

  const move = (delta: number) => {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1));
    setSelectedDate(null);
  };

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="mb-3 flex items-center justify-between">
          <button className="btn-icon" onClick={() => move(-1)} aria-label="Vorheriger Monat">
            <FiChevronLeft className="text-xl" />
          </button>
          <span className="font-semibold capitalize">{formatMonthYear(cursor)}</span>
          <button className="btn-icon" onClick={() => move(1)} aria-label="Nächster Monat">
            <FiChevronRight className="text-xl" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((d) => (
            <div key={d} className="py-1 text-xs font-semibold text-muted">
              {d}
            </div>
          ))}
          {Array.from({ length: leadingBlanks }).map((_, i) => (
            <div key={`blank-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const key = toDateKey(new Date(cursor.getFullYear(), cursor.getMonth(), day));
            const posts = grouped[key] ?? [];
            const selected = selectedDate === key;
            const hasSpecial = posts.some(isSpecial);
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedDate(selected ? null : key)}
                className={`flex aspect-square flex-col items-center justify-center rounded-lg text-sm transition-colors ${
                  selected
                    ? "bg-primary-100 font-bold text-primary-400"
                    : key === today
                      ? "bg-surface-2 font-bold text-primary-100"
                      : "text-gray-200 hover:bg-surface-2"
                }`}
              >
                {day}
                <span
                  className={`mt-0.5 h-1.5 w-1.5 rounded-full ${
                    posts.length === 0 ? "bg-transparent" : hasSpecial ? "bg-red-400" : selected ? "bg-primary-400" : "bg-primary-100"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
      {isLoading && <Loading />}
      {isError && <ErrorState onRetry={() => void refetch()} />}
      {selectedDate && !isLoading && <Day dateKey={selectedDate} posts={grouped[selectedDate] ?? []} onSelect={onSelect} />}
    </div>
  );
};

// ------------------ HOME ------------------
export default function Home() {
  const { isLoaded, isSignedIn } = useUser();
  const [view, setView] = useState<"list" | "month">("list");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const utils = api.useContext();

  if (!isLoaded) return <Loading />;
  if (!isSignedIn) return <LandingPage />;

  const invalidateAll = () => {
    void utils.post.invalidate();
    void utils.groceryList.invalidate();
  };

  return (
    <PageShell
      title="Kalender"
      activePage="calendar"
      actions={
        <>
          <button
            className="btn-icon"
            onClick={() => setView(view === "list" ? "month" : "list")}
            aria-label={view === "list" ? "Monatsansicht" : "Listenansicht"}
            title={view === "list" ? "Monatsansicht" : "Listenansicht"}
          >
            {view === "list" ? <FiCalendar className="text-xl" /> : <FiList className="text-xl" />}
          </button>
          <button
            className="btn-icon"
            onClick={() => {
              invalidateAll();
              toast.success("Aktualisiert");
            }}
            aria-label="Aktualisieren"
          >
            <LuRefreshCw className="text-xl" />
          </button>
        </>
      }
    >
      {view === "list" ? <ListView onSelect={setSelectedPost} /> : <MonthView onSelect={setSelectedPost} />}
      {selectedPost && (
        <PostSheet
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onDeleted={() => {
            setSelectedPost(null);
            invalidateAll();
          }}
        />
      )}
    </PageShell>
  );
}
