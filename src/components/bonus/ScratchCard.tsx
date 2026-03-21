import { useRef, useEffect, useState, useCallback, type FC } from "react";
import {
  type Gift,
  getCategoryGradient,
  getCategoryLabel,
} from "~/lib/bonusConfig";

interface ScratchCardProps {
  gift: Gift;
  isScratched: boolean;
  isRedeemed: boolean;
  availablePoints: number;
  onScratchComplete: () => void;
  onRedeem: () => void;
}

const SCRATCH_RADIUS = 22;
const REVEAL_THRESHOLD = 0.45;

const ScratchCard: FC<ScratchCardProps> = ({
  gift,
  isScratched,
  isRedeemed,
  availablePoints,
  onScratchComplete,
  onRedeem,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const hasRevealedRef = useRef(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [justRedeemed, setJustRedeemed] = useState(false);
  const canAfford = availablePoints >= gift.cost;

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || isScratched) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(dpr, dpr);

    // Draw gradient background
    const [color1, color2] = getCategoryGradient(gift.category);
    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Add subtle pattern (dots)
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    for (let x = 0; x < rect.width; x += 12) {
      for (let y = 0; y < rect.height; y += 12) {
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw text on scratch surface
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.font = "bold 14px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      getCategoryLabel(gift.category),
      rect.width / 2,
      rect.height / 2 - 14
    );
    ctx.font = "bold 22px system-ui, sans-serif";
    ctx.fillText(`${gift.cost} Punkte`, rect.width / 2, rect.height / 2 + 16);
    ctx.font = "12px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText("Kratze um aufzudecken", rect.width / 2, rect.height / 2 + 38);

    hasRevealedRef.current = false;
  }, [gift.category, gift.cost, isScratched]);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  useEffect(() => {
    const handleResize = () => initCanvas();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [initCanvas]);

  const getPos = (
    e: MouseEvent | TouchEvent
  ): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;
    if ("touches" in e) {
      const touch = e.touches[0];
      if (!touch) return null;
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const scratch = useCallback(
    (pos: { x: number; y: number }) => {
      const canvas = canvasRef.current;
      if (!canvas || hasRevealedRef.current) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, SCRATCH_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      if (lastPosRef.current) {
        ctx.lineWidth = SCRATCH_RADIUS * 2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
      ctx.restore();

      lastPosRef.current = pos;
    },
    []
  );

  const checkRevealThreshold = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || hasRevealedRef.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparent = 0;
    const total = pixels.length / 4;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparent++;
    }

    if (transparent / total > REVEAL_THRESHOLD) {
      hasRevealedRef.current = true;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      onScratchComplete();

      // Auto-redeem if affordable
      if (canAfford) {
        setShowCelebration(true);
        setJustRedeemed(true);
        // Small delay so the user sees the reveal before redeeming
        setTimeout(() => {
          onRedeem();
        }, 300);
        // Hide celebration after animation
        setTimeout(() => {
          setShowCelebration(false);
        }, 2500);
        setTimeout(() => {
          setJustRedeemed(false);
        }, 1500);
      }
    }
  }, [onScratchComplete, onRedeem, canAfford]);

  // Touch/mouse event handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isScratched) return;

    const handleStart = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      isDrawingRef.current = true;
      const pos = getPos(e);
      if (pos) {
        lastPosRef.current = pos;
        scratch(pos);
      }
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      if (!isDrawingRef.current) return;
      const pos = getPos(e);
      if (pos) scratch(pos);
    };

    const handleEnd = () => {
      isDrawingRef.current = false;
      lastPosRef.current = null;
      checkRevealThreshold();
    };

    canvas.addEventListener("mousedown", handleStart);
    canvas.addEventListener("mousemove", handleMove);
    canvas.addEventListener("mouseup", handleEnd);
    canvas.addEventListener("mouseleave", handleEnd);
    canvas.addEventListener("touchstart", handleStart, { passive: false });
    canvas.addEventListener("touchmove", handleMove, { passive: false });
    canvas.addEventListener("touchend", handleEnd);
    canvas.addEventListener("touchcancel", handleEnd);

    return () => {
      canvas.removeEventListener("mousedown", handleStart);
      canvas.removeEventListener("mousemove", handleMove);
      canvas.removeEventListener("mouseup", handleEnd);
      canvas.removeEventListener("mouseleave", handleEnd);
      canvas.removeEventListener("touchstart", handleStart);
      canvas.removeEventListener("touchmove", handleMove);
      canvas.removeEventListener("touchend", handleEnd);
      canvas.removeEventListener("touchcancel", handleEnd);
    };
  }, [isScratched, scratch, checkRevealThreshold]);

  // Celebration particles
  const particles = showCelebration
    ? Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const distance = 40 + Math.random() * 30;
        const emojis = ["\u2728", "\u2B50", "\uD83C\uDF89", "\uD83C\uDF81", "\uD83D\uDC96", "\uD83C\uDF8A"];
        return {
          emoji: emojis[i % emojis.length],
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          delay: i * 0.05,
        };
      })
    : [];

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-xl bg-gray-800 border transition-all duration-500 ${
        justRedeemed
          ? "border-primary-100 shadow-lg shadow-primary-100/20 scale-[1.02]"
          : isRedeemed
          ? "border-gray-600"
          : "border-gray-700"
      }`}
      style={{ minHeight: "160px", touchAction: "none" }}
    >
      {/* Content layer */}
      <div className="flex flex-col items-center justify-center p-4 h-full min-h-[160px] text-center relative">
        {isRedeemed || (isScratched && canAfford) ? (
          <div
            className={`space-y-2 transition-all duration-700 ${
              justRedeemed ? "animate-bounce-in" : ""
            }`}
          >
            <div className="text-3xl">{gift.revealName ? "\u2728" : "\uD83C\uDF81"}</div>
            <p className="text-sm text-gray-200 leading-relaxed">
              {gift.revealText}
            </p>
            <span className="inline-block px-3 py-1 bg-primary-100/10 text-primary-100 rounded-full text-xs font-medium border border-primary-100/20">
              -{gift.cost} Punkte
            </span>
          </div>
        ) : isScratched && !canAfford ? (
          <div className="space-y-3">
            <div className="text-3xl">{"\uD83D\uDD12"}</div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Nicht genug Punkte
            </p>
            <p className="text-xs text-gray-500">
              Benötigt: {gift.cost} Punkte
            </p>
          </div>
        ) : (
          <div className="text-gray-600 text-4xl select-none">\u2753</div>
        )}

        {/* Celebration particles */}
        {particles.map((p, i) => (
          <span
            key={i}
            className="absolute text-lg pointer-events-none"
            style={{
              left: "50%",
              top: "50%",
              animation: `particle-fly 0.8s ease-out ${p.delay}s both`,
              transform: `translate(-50%, -50%)`,
              "--px": `${p.x}px`,
              "--py": `${p.y}px`,
            } as React.CSSProperties}
          >
            {p.emoji}
          </span>
        ))}
      </div>

      {/* Canvas scratch overlay */}
      {!isScratched && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 rounded-xl cursor-pointer"
          style={{ touchAction: "none" }}
        />
      )}
    </div>
  );
};

export default ScratchCard;
