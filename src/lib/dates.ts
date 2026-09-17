// Date helpers that work with *local* calendar days.
// Calendar keys are "YYYY-MM-DD" strings derived from local time, never from
// toISOString() (which is UTC and shifts the day around midnight).

export type DateKey = string; // "YYYY-MM-DD"

const pad = (n: number) => String(n).padStart(2, "0");

export function toDateKey(date: Date): DateKey {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Parses "YYYY-MM-DD" as local midnight. Falls back to today for bad input. */
export function parseDateKey(key: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) return startOfToday();
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

export function isDateKey(value: unknown): value is DateKey {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function todayKey(): DateKey {
  return toDateKey(new Date());
}

/** "Montag" / "17.09." */
export function formatDayHeading(key: DateKey): { weekday: string; dayMonth: string } {
  const d = parseDateKey(key);
  return {
    weekday: d.toLocaleDateString("de-DE", { weekday: "long" }),
    dayMonth: d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }),
  };
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
}

/** Relative label for a day key: "Heute", "Morgen", or null. */
export function relativeDayLabel(key: DateKey): string | null {
  const today = todayKey();
  if (key === today) return "Heute";
  if (key === toDateKey(addDays(startOfToday(), 1))) return "Morgen";
  return null;
}
