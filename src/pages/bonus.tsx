import { useState, useEffect, useCallback, type FC } from "react";
import Head from "next/head";
import toast from "react-hot-toast";
import BottomNavBar from "~/components/BottomNavBar";
import ScratchCard from "~/components/bonus/ScratchCard";
import {
  type BonusState,
  type Gift,
  type GiftCategory,
  GIFTS,
  TOTAL_DAYS,
  getDefaultBonusState,
  calculatePoints,
  getCategoryLabel,
  getCategoryGradient,
} from "~/lib/bonusConfig";

const STORAGE_KEY = "bonus-state";

function useBonusState() {
  const [state, setState] = useState<BonusState>(getDefaultBonusState());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setState(JSON.parse(stored) as BonusState);
      }
    } catch {
      // ignore
    }
    setMounted(true);
  }, []);

  const updateState = useCallback(
    (updater: (prev: BonusState) => BonusState) => {
      setState((prev) => {
        const next = updater(prev);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    []
  );

  const resetState = useCallback(() => {
    const fresh = getDefaultBonusState();
    setState(fresh);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    } catch {
      // ignore
    }
  }, []);

  return { state, updateState, resetState, mounted };
}

// --- Sub-components ---

const PointsDisplay: FC<{
  earned: number;
  spent: number;
  available: number;
  hasDoubleActive: boolean;
}> = ({ earned, spent, available, hasDoubleActive }) => (
  <div className="w-full max-w-md mb-6">
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-gray-800 rounded-xl p-3 text-center border border-gray-700">
        <p className="text-xs text-gray-400 mb-1">Verdient</p>
        <p className="text-xl font-bold text-white">{earned}</p>
      </div>
      <div className="bg-gray-800 rounded-xl p-3 text-center border border-gray-700">
        <p className="text-xs text-gray-400 mb-1">Ausgegeben</p>
        <p className="text-xl font-bold text-white">{spent}</p>
      </div>
      <div className="bg-gray-800 rounded-xl p-3 text-center border border-primary-100/30">
        <p className="text-xs text-primary-100 mb-1">Verfügbar</p>
        <p className="text-xl font-bold text-primary-100">{available}</p>
      </div>
    </div>
    {hasDoubleActive && (
      <div className="mt-2 text-center">
        <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full border border-blue-500/30">
          2x Punkte aktiv!
        </span>
      </div>
    )}
  </div>
);

// Animated progress bar with characters
const ProgressBar: FC<{ daysPassed: number; onAnimationDone?: () => void }> = ({
  daysPassed,
  onAnimationDone,
}) => {
  const pct = Math.min(100, (daysPassed / TOTAL_DAYS) * 100);
  const [animatedPct, setAnimatedPct] = useState(0);
  const [showCharacters, setShowCharacters] = useState(true);
  const [boyPulling, setBoyPulling] = useState(true);

  useEffect(() => {
    // Animate the bar from 0 to actual percentage
    const timer = setTimeout(() => {
      setAnimatedPct(pct);
    }, 400);

    // Boy stops pulling after bar reaches full width
    const pullTimer = setTimeout(
      () => {
        setBoyPulling(false);
        // Signal that the first bar animation is done
        onAnimationDone?.();
      },
      1800 + pct * 15
    );

    // Characters fade out after a while
    const fadeTimer = setTimeout(() => {
      setShowCharacters(false);
    }, 4500);

    return () => {
      clearTimeout(timer);
      clearTimeout(pullTimer);
      clearTimeout(fadeTimer);
    };
  }, [pct, onAnimationDone]);

  return (
    <div className="w-full max-w-md mb-8">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>
          Tag {daysPassed} von {TOTAL_DAYS}
        </span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="relative">
        {/* Bar track */}
        <div className="h-3 bg-gray-700 rounded-full overflow-visible relative">
          {/* Filled bar */}
          <div
            className="h-full bg-primary-100 rounded-full relative"
            style={{
              width: `${animatedPct}%`,
              transition: "width 1.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            {/* Girl sitting on the bar */}
            <div
              className={`absolute -top-8 right-0 translate-x-1/2 transition-opacity duration-700 ${
                showCharacters ? "opacity-100" : "opacity-0"
              }`}
              style={{ fontSize: "20px" }}
            >
              {/* Girl with blonde hair: sitting pose */}
              <div className="relative flex flex-col items-center">
                <svg
                  width="24"
                  height="26"
                  viewBox="0 0 24 26"
                  className={`${showCharacters ? "animate-girl-bounce" : ""}`}
                >
                  {/* Hair */}
                  <ellipse cx="12" cy="7" rx="7" ry="7" fill="#F5D76E" />
                  {/* Long hair strands */}
                  <path
                    d="M5 7 C4 12, 3 18, 5 22"
                    stroke="#E8C84A"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <path
                    d="M19 7 C20 12, 21 18, 19 22"
                    stroke="#E8C84A"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                  {/* Face */}
                  <circle cx="12" cy="8" r="5" fill="#FDBCB4" />
                  {/* Eyes */}
                  <circle cx="10" cy="7.5" r="0.8" fill="#3B2E23" />
                  <circle cx="14" cy="7.5" r="0.8" fill="#3B2E23" />
                  {/* Smile */}
                  <path
                    d="M10 9.5 Q12 11.5 14 9.5"
                    stroke="#C4736D"
                    strokeWidth="0.6"
                    fill="none"
                  />
                  {/* Body / dress */}
                  <path
                    d="M8 13 L12 14 L16 13 L15 20 L9 20 Z"
                    fill="#FF69B4"
                  />
                  {/* Legs (dangling) */}
                  <line
                    x1="10"
                    y1="20"
                    x2="9"
                    y2="25"
                    stroke="#FDBCB4"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className={boyPulling ? "animate-leg-swing" : ""}
                  />
                  <line
                    x1="14"
                    y1="20"
                    x2="15"
                    y2="25"
                    stroke="#FDBCB4"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className={boyPulling ? "animate-leg-swing-alt" : ""}
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Boy pulling the bar from the right end */}
          <div
            className={`absolute -top-6 transition-opacity duration-700 ${
              showCharacters ? "opacity-100" : "opacity-0"
            }`}
            style={{
              left: `${animatedPct}%`,
              marginLeft: "14px",
              transition: `left 1.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.7s`,
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              className={`${boyPulling ? "animate-boy-pull" : ""}`}
            >
              {/* Hair (brown curly) */}
              <circle cx="14" cy="6" r="6" fill="#6B3E26" />
              <circle cx="10" cy="4" r="2.5" fill="#7A4B2A" />
              <circle cx="14" cy="3" r="2.5" fill="#7A4B2A" />
              <circle cx="18" cy="4" r="2.5" fill="#7A4B2A" />
              <circle cx="9" cy="6" r="2" fill="#6B3E26" />
              <circle cx="19" cy="6" r="2" fill="#6B3E26" />
              {/* Face */}
              <circle cx="14" cy="8" r="5" fill="#FDBCB4" />
              {/* Eyes */}
              <circle cx="12" cy="7.5" r="0.8" fill="#3B2E23" />
              <circle cx="16" cy="7.5" r="0.8" fill="#3B2E23" />
              {/* Determined mouth */}
              <path
                d="M12 10 Q14 11 16 10"
                stroke="#C4736D"
                strokeWidth="0.6"
                fill="none"
              />
              {/* Body */}
              <rect x="10" y="13" width="8" height="8" rx="1" fill="#3b82f6" />
              {/* Arms pulling left (toward bar) */}
              <line
                x1="10"
                y1="15"
                x2="2"
                y2="17"
                stroke="#FDBCB4"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="10"
                y1="17"
                x2="2"
                y2="19"
                stroke="#FDBCB4"
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Rope / handle */}
              <line
                x1="2"
                y1="17"
                x2="0"
                y2="18"
                stroke="#999"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <line
                x1="2"
                y1="19"
                x2="0"
                y2="18"
                stroke="#999"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              {/* Legs (leaning back) */}
              <line
                x1="12"
                y1="21"
                x2="14"
                y2="27"
                stroke="#2563EB"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <line
                x1="16"
                y1="21"
                x2="18"
                y2="27"
                stroke="#2563EB"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reunion countdown bar — boy and girl walking toward each other
const REUNION_START = new Date("2026-02-16T00:00:00");
const REUNION_DATE = new Date("2026-07-10T00:00:00");
const REUNION_TOTAL_DAYS = Math.round(
  (REUNION_DATE.getTime() - REUNION_START.getTime()) / (1000 * 60 * 60 * 24)
);

const ReunionBar: FC<{ daysPassed: number; active: boolean }> = ({
  daysPassed,
  active,
}) => {
  const daysUntilReunion = Math.max(0, REUNION_TOTAL_DAYS - daysPassed);
  const pct = Math.min(100, (daysPassed / REUNION_TOTAL_DAYS) * 100);
  const [animatedPct, setAnimatedPct] = useState(0);
  const [showCharacters, setShowCharacters] = useState(false);
  const [walking, setWalking] = useState(false);

  useEffect(() => {
    if (!active) return;

    // Start animations once active
    setShowCharacters(true);
    setWalking(true);

    const timer = setTimeout(() => {
      setAnimatedPct(pct);
    }, 400);

    const walkTimer = setTimeout(
      () => {
        setWalking(false);
      },
      2000 + pct * 15
    );

    const fadeTimer = setTimeout(() => {
      setShowCharacters(false);
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(walkTimer);
      clearTimeout(fadeTimer);
    };
  }, [pct, active]);

  // Boy walks from left, girl from right — they meet at the progress point
  const boyX = animatedPct / 2; // boy covers half the filled distance
  const girlX = 100 - (100 - animatedPct) / 2; // girl comes from right side

  return (
    <div className="w-full max-w-md mb-8">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span className="text-pink-400">
          {daysUntilReunion > 0
            ? `Noch ${daysUntilReunion} Tage bis zum Wiedersehen`
            : "Wiedersehen! \u2764\uFE0F"}
        </span>
        <span className="text-pink-400">
          {daysUntilReunion > 0
            ? `${Math.round(pct)}%`
            : "\u2728"}
        </span>
      </div>
      <div className="relative">
        <div className="h-3 bg-gray-700 rounded-full overflow-visible relative">
          {/* Filled bar (pink/red gradient for love theme) */}
          <div
            className="h-full rounded-full relative"
            style={{
              width: `${animatedPct}%`,
              transition: "width 2s cubic-bezier(0.34, 1.56, 0.64, 1)",
              background: "linear-gradient(90deg, #ec4899, #f43f5e)",
            }}
          />

          {/* Heart at the meeting point */}
          {animatedPct > 10 && (
            <div
              className={`absolute -top-3 transition-all duration-700 ${
                showCharacters ? "opacity-100 scale-100" : "opacity-0 scale-0"
              }`}
              style={{
                left: `${(boyX + girlX) / 2}%`,
                transform: "translateX(-50%)",
                transition: `left 2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.7s, transform 0.5s`,
              }}
            >
              <span
                className={`text-base ${walking ? "animate-heart-pulse" : ""}`}
              >
                {"\u2764\uFE0F"}
              </span>
            </div>
          )}

          {/* Boy walking from left */}
          <div
            className={`absolute -top-7 transition-opacity duration-700 ${
              showCharacters ? "opacity-100" : "opacity-0"
            }`}
            style={{
              left: `${boyX}%`,
              transform: "translateX(-50%)",
              transition: `left 2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.7s`,
            }}
          >
            <svg
              width="20"
              height="24"
              viewBox="0 0 20 24"
              className={walking ? "animate-walk" : ""}
            >
              {/* Curly brown hair */}
              <circle cx="10" cy="5" r="5" fill="#6B3E26" />
              <circle cx="7" cy="3.5" r="2" fill="#7A4B2A" />
              <circle cx="10" cy="2.5" r="2" fill="#7A4B2A" />
              <circle cx="13" cy="3.5" r="2" fill="#7A4B2A" />
              {/* Face */}
              <circle cx="10" cy="6" r="4" fill="#FDBCB4" />
              {/* Eyes */}
              <circle cx="8.5" cy="5.5" r="0.6" fill="#3B2E23" />
              <circle cx="11.5" cy="5.5" r="0.6" fill="#3B2E23" />
              {/* Smile */}
              <path
                d="M8.5 7.5 Q10 9 11.5 7.5"
                stroke="#C4736D"
                strokeWidth="0.5"
                fill="none"
              />
              {/* Body */}
              <rect x="7" y="10" width="6" height="7" rx="1" fill="#3b82f6" />
              {/* Legs walking */}
              <line
                x1="8.5"
                y1="17"
                x2="7"
                y2="23"
                stroke="#2563EB"
                strokeWidth="2"
                strokeLinecap="round"
                className={walking ? "animate-leg-swing" : ""}
              />
              <line
                x1="11.5"
                y1="17"
                x2="13"
                y2="23"
                stroke="#2563EB"
                strokeWidth="2"
                strokeLinecap="round"
                className={walking ? "animate-leg-swing-alt" : ""}
              />
              {/* Waving arm */}
              <line
                x1="13"
                y1="12"
                x2="17"
                y2="8"
                stroke="#FDBCB4"
                strokeWidth="1.5"
                strokeLinecap="round"
                className={walking ? "animate-wave" : ""}
              />
            </svg>
          </div>

          {/* Girl walking from right */}
          <div
            className={`absolute -top-7 transition-opacity duration-700 ${
              showCharacters ? "opacity-100" : "opacity-0"
            }`}
            style={{
              left: `${girlX}%`,
              transform: "translateX(-50%) scaleX(-1)",
              transition: `left 2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.7s`,
            }}
          >
            <svg
              width="20"
              height="24"
              viewBox="0 0 20 24"
              className={walking ? "animate-walk" : ""}
            >
              {/* Blonde hair */}
              <ellipse cx="10" cy="5" rx="5.5" ry="5.5" fill="#F5D76E" />
              {/* Long hair */}
              <path
                d="M4.5 5 C3.5 10, 3 15, 4.5 19"
                stroke="#E8C84A"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M15.5 5 C16.5 10, 17 15, 15.5 19"
                stroke="#E8C84A"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
              {/* Face */}
              <circle cx="10" cy="6" r="4" fill="#FDBCB4" />
              {/* Eyes */}
              <circle cx="8.5" cy="5.5" r="0.6" fill="#3B2E23" />
              <circle cx="11.5" cy="5.5" r="0.6" fill="#3B2E23" />
              {/* Smile */}
              <path
                d="M8.5 7.5 Q10 9 11.5 7.5"
                stroke="#C4736D"
                strokeWidth="0.5"
                fill="none"
              />
              {/* Dress */}
              <path d="M6 10 L10 11 L14 10 L13 17 L7 17 Z" fill="#FF69B4" />
              {/* Legs walking */}
              <line
                x1="8.5"
                y1="17"
                x2="7"
                y2="23"
                stroke="#FDBCB4"
                strokeWidth="1.5"
                strokeLinecap="round"
                className={walking ? "animate-leg-swing" : ""}
              />
              <line
                x1="11.5"
                y1="17"
                x2="13"
                y2="23"
                stroke="#FDBCB4"
                strokeWidth="1.5"
                strokeLinecap="round"
                className={walking ? "animate-leg-swing-alt" : ""}
              />
              {/* Waving arm */}
              <line
                x1="13"
                y1="12"
                x2="17"
                y2="8"
                stroke="#FDBCB4"
                strokeWidth="1.5"
                strokeLinecap="round"
                className={walking ? "animate-wave" : ""}
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

const CategorySection: FC<{
  category: GiftCategory;
  gifts: Gift[];
  state: BonusState;
  availablePoints: number;
  onScratch: (id: string) => void;
  onRedeem: (gift: Gift) => void;
}> = ({ category, gifts, state, availablePoints, onScratch, onRedeem }) => {
  const [color1] = getCategoryGradient(category);
  return (
    <div className="w-full max-w-md mb-6">
      <h2
        className="text-lg font-bold mb-3 flex items-center gap-2"
        style={{ color: color1 }}
      >
        <span
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: color1 }}
        />
        {getCategoryLabel(category)}
        <span className="text-xs font-normal text-gray-500">
          ({gifts[0]?.cost}
          {gifts[gifts.length - 1]?.cost !== gifts[0]?.cost
            ? `\u2013${gifts[gifts.length - 1]?.cost}`
            : ""}{" "}
          Punkte)
        </span>
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {gifts.map((gift) => (
          <ScratchCard
            key={gift.id}
            gift={gift}
            isScratched={state.scratchedGifts.includes(gift.id)}
            isRedeemed={state.redeemedGifts.includes(gift.id)}
            availablePoints={availablePoints}
            onScratchComplete={() => onScratch(gift.id)}
            onRedeem={() => onRedeem(gift)}
          />
        ))}
      </div>
    </div>
  );
};

const AdminLog: FC<{ state: BonusState }> = ({ state }) => {
  const [expanded, setExpanded] = useState(false);

  if (state.redemptionLog.length === 0) return null;

  return (
    <div className="w-full max-w-md mt-4 mb-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-gray-600 text-xs w-full text-center py-2 hover:text-gray-400 transition-colors"
      >
        {expanded ? "Weniger anzeigen" : "\u2022\u2022\u2022"}
      </button>
      {expanded && (
        <div className="bg-gray-900 rounded-lg p-3 border border-gray-800 space-y-2">
          <p className="text-xs text-gray-500 font-semibold">
            Einlösungs-Protokoll:
          </p>
          {state.redemptionLog.map((log, i) => (
            <div
              key={i}
              className="flex justify-between text-xs text-gray-500"
            >
              <span>{log.giftName}</span>
              <span>
                {new Date(log.timestamp).toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Main Page ---

const BonusPage: FC = () => {
  const { state, updateState, mounted } = useBonusState();
  const [reunionBarActive, setReunionBarActive] = useState(false);
  const now = new Date();
  const points = calculatePoints(state, now);

  const handleFirstBarDone = useCallback(() => {
    setReunionBarActive(true);
  }, []);

  const hasDoubleActive = state.doublePointsPeriods.some((p) => {
    const start = new Date(p.startDate);
    const end = new Date(
      start.getTime() + p.durationDays * 24 * 60 * 60 * 1000
    );
    return now >= start && now <= end;
  });

  const handleScratch = (giftId: string) => {
    updateState((prev) => ({
      ...prev,
      scratchedGifts: [...prev.scratchedGifts, giftId],
    }));
  };

  const handleRedeem = (gift: Gift) => {
    // Recalculate points from current state to avoid stale closure
    const currentPoints = calculatePoints(state, now);
    if (currentPoints.available < gift.cost) {
      toast.error("Nicht genug Punkte!");
      return;
    }

    if (state.redeemedGifts.includes(gift.id)) {
      return; // already redeemed, silently ignore
    }

    updateState((prev) => {
      const next = { ...prev };
      next.redeemedGifts = [...prev.redeemedGifts, gift.id];
      next.redemptionLog = [
        ...prev.redemptionLog,
        {
          giftId: gift.id,
          giftName: gift.name,
          timestamp: new Date().toISOString(),
        },
      ];

      if (gift.id === "bonus-3-points") {
        next.bonusPoints = prev.bonusPoints + 3;
      }
      if (gift.id === "double-points") {
        next.doublePointsPeriods = [
          ...prev.doublePointsPeriods,
          { startDate: new Date().toISOString(), durationDays: 20 },
        ];
      }

      return next;
    });

    toast.success(gift.revealText, { duration: 4000 });
  };

  const giftsByCategory: Record<GiftCategory, Gift[]> = {
    small: GIFTS.filter((g) => g.category === "small"),
    medium: GIFTS.filter((g) => g.category === "medium"),
    large: GIFTS.filter((g) => g.category === "large"),
    jackpot: GIFTS.filter((g) => g.category === "jackpot"),
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-primary-400">
        <div className="text-gray-400">Laden...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Bonus Programm</title>
      </Head>

      <main className="flex flex-col items-center min-h-screen bg-primary-400 pb-20">
        {/* Header */}
        <div className="sticky top-0 z-10 w-full bg-primary-400/95 backdrop-blur-sm border-b border-gray-800">
          <div className="max-w-md mx-auto flex items-center justify-center px-4 py-3">
            <h1 className="text-2xl font-bold text-white">
              Bonus Programm{" "}
              <span className="text-primary-100">\u2B50</span>
            </h1>
          </div>
        </div>

        <div className="w-full max-w-md px-4 pt-4">
          <PointsDisplay
            earned={points.earned}
            spent={points.spent}
            available={points.available}
            hasDoubleActive={hasDoubleActive}
          />

          <ProgressBar
            daysPassed={points.daysPassed}
            onAnimationDone={handleFirstBarDone}
          />

          <ReunionBar
            daysPassed={points.daysPassed}
            active={reunionBarActive}
          />

          {(["small", "medium", "large", "jackpot"] as GiftCategory[]).map(
            (cat) => (
              <CategorySection
                key={cat}
                category={cat}
                gifts={giftsByCategory[cat]}
                state={state}
                availablePoints={points.available}
                onScratch={handleScratch}
                onRedeem={handleRedeem}
              />
            )
          )}

          <AdminLog state={state} />
        </div>

        <BottomNavBar activePage="bonus" />
      </main>
    </>
  );
};

export default BonusPage;
