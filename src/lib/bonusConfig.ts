// Bonus Program Configuration
// Points: 1 point per day from Feb 16, 2026 to Aug 14, 2026 (180 days)

export const BONUS_START_DATE = new Date("2026-02-16T00:00:00");
export const BONUS_END_DATE = new Date("2026-08-14T00:00:00");
export const TOTAL_DAYS = 180;

export type GiftCategory = "small" | "medium" | "large" | "jackpot";

export interface Gift {
  id: string;
  name: string;
  revealText: string;
  category: GiftCategory;
  cost: number;
}

export interface DoublePointsPeriod {
  startDate: string; // ISO string
  durationDays: number;
}

export interface RedemptionLog {
  giftId: string;
  giftName: string;
  timestamp: string; // ISO string
}

export interface BonusState {
  scratchedGifts: string[];
  redeemedGifts: string[];
  bonusPoints: number;
  doublePointsPeriods: DoublePointsPeriod[];
  redemptionLog: RedemptionLog[];
}

export const GIFTS: Gift[] = [
  // Small Gifts (10+ Points)
  {
    id: "handwritten-letter",
    name: "Handgeschriebener Brief",
    revealText: "Handgeschriebener Brief ❤️",
    category: "small",
    cost: 10,
  },
  {
    id: "bonus-3-points",
    name: "+3 Bonus Punkte",
    revealText: "+3 Bonus Punkte! Wurden deinem Konto gutgeschrieben.",
    category: "small",
    cost: 10,
  },
  {
    id: "blumen",
    name: "Blumen liefern lassen",
    revealText: "Blumen liefern lassen 💐",
    category: "small",
    cost: 12,
  },

  // Medium Gifts (15-30 Points)
  {
    id: "bastelset",
    name: "Bastelset / Kreativ-Paket",
    revealText: "Bastelset / Kreativ-Paket 🎨",
    category: "medium",
    cost: 15,
  },
  {
    id: "essen",
    name: "Essen bestellen",
    revealText: "Essen bestellen 🍕",
    category: "medium",
    cost: 20,
  },
  {
    id: "double-points",
    name: "Doppelte Punkte für 20 Tage",
    revealText:
      "Doppelte Punkte aktiviert! Du erhältst jetzt 20 Tage lang 2 Punkte pro Tag.",
    category: "medium",
    cost: 25,
  },
  {
    id: "mittagessen",
    name: "Mittagessen bezahlen",
    revealText: "Mittagessen bezahlen 🍽️",
    category: "medium",
    cost: 30,
  },

  // Large Gifts (40-60 Points)
  {
    id: "weekend-event",
    name: "Weekend Event (Spa, Konzert, ...)",
    revealText: "Weekend Event (Spa, Konzert, ...) 🎉",
    category: "large",
    cost: 50,
  },
  {
    id: "fancy-dinner",
    name: "Fancy Dinner",
    revealText: "Fancy Dinner 🥂",
    category: "large",
    cost: 60,
  },

  // Jackpot (140 Points)
  {
    id: "jackpot",
    name: "Jackpot-Überraschung",
    revealText: "DER JACKPOT! Jackpot-Überraschung 🎰",
    category: "jackpot",
    cost: 140,
  },
];

export function getDefaultBonusState(): BonusState {
  return {
    scratchedGifts: [],
    redeemedGifts: [],
    bonusPoints: 0,
    doublePointsPeriods: [],
    redemptionLog: [],
  };
}

export function calculateBasePoints(now: Date): number {
  const elapsed = now.getTime() - BONUS_START_DATE.getTime();
  const days = Math.floor(elapsed / (1000 * 60 * 60 * 24));
  return Math.max(0, Math.min(TOTAL_DAYS, days));
}

export function calculateDoublePointsBonus(
  periods: DoublePointsPeriod[],
  now: Date
): number {
  let bonus = 0;
  for (const period of periods) {
    const start = new Date(period.startDate);
    const end = new Date(
      start.getTime() + period.durationDays * 24 * 60 * 60 * 1000
    );
    const effectiveEnd = now < end ? now : end;
    const daysActive = Math.max(
      0,
      Math.floor(
        (effectiveEnd.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      )
    );
    bonus += daysActive;
  }
  return bonus;
}

export function calculatePoints(state: BonusState, now: Date) {
  const basePoints = calculateBasePoints(now);
  const doubleBonus = calculateDoublePointsBonus(
    state.doublePointsPeriods,
    now
  );
  const earned = basePoints + doubleBonus + state.bonusPoints;

  const spent = state.redeemedGifts.reduce((total, giftId) => {
    const gift = GIFTS.find((g) => g.id === giftId);
    return total + (gift?.cost ?? 0);
  }, 0);

  return {
    earned,
    spent,
    available: earned - spent,
    daysPassed: calculateBasePoints(now),
  };
}

export function getCategoryLabel(cat: GiftCategory): string {
  switch (cat) {
    case "small":
      return "Klein";
    case "medium":
      return "Mittel";
    case "large":
      return "Groß";
    case "jackpot":
      return "Jackpot";
  }
}

export function getCategoryGradient(cat: GiftCategory): [string, string] {
  switch (cat) {
    case "small":
      return ["#86C232", "#61892F"];
    case "medium":
      return ["#3b82f6", "#1d4ed8"];
    case "large":
      return ["#a855f7", "#7c3aed"];
    case "jackpot":
      return ["#f59e0b", "#d97706"];
  }
}
