import { useState, useCallback, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGetBalance, getGetBalanceQueryKey } from "@workspace/api-client-react";
import iconWallet  from "@assets/20260228_002852_1772238747316_1782553414380.png";
import iconMoney   from "@assets/20260228_002918_1772238747293_1782553414936.png";
import iconGift    from "@assets/20260228_080749_1772266120754_1782553414960.png";
import iconCoins   from "@assets/20260227_230031_1772234440554_1782553414994.png";

/* ── Constants ─────────────────────────────────────────────── */
const COLS = 5;
const ROWS = 4;
const GRID_SIZE = COLS * ROWS; // 20
const PRIZE_SLOTS = 8;

const CROPS: Record<string, { emoji: string; multi: number; color: string }> = {
  "🌽": { emoji: "🌽", multi: 1.2, color: "#f59e0b" },
  "🍅": { emoji: "🍅", multi: 1.5, color: "#ef4444" },
  "🥕": { emoji: "🥕", multi: 1.8, color: "#f97316" },
  "🍓": { emoji: "🍓", multi: 2.5, color: "#ec4899" },
  "🌻": { emoji: "🌻", multi: 3.0, color: "#eab308" },
  "🥦": { emoji: "🥦", multi: 4.0, color: "#22c55e" },
  "🍇": { emoji: "🍇", multi: 6.0, color: "#a855f7" },
};
const CROP_KEYS = Object.keys(CROPS);
const PESTS = ["🐛", "🦗", "🐞", "🐜"];
const BET_OPTIONS = [100, 200, 500, 1_000, 2_000];

type Cell = { symbol: string; revealed: boolean; isPest: boolean; multi: number };

function generateGrid(): Cell[] {
  const cells: Cell[] = Array(GRID_SIZE).fill(null).map(() => ({
    symbol: "", revealed: false, isPest: false, multi: 0,
  }));
  const prizes = new Set<number>();
  while (prizes.size < PRIZE_SLOTS) prizes.add(Math.floor(Math.random() * GRID_SIZE));
  cells.forEach((cell, i) => {
    if (prizes.has(i)) {
      const k = CROP_KEYS[Math.floor(Math.random() * CROP_KEYS.length)];
      cell.symbol = k;
      cell.isPest = false;
      cell.multi = CROPS[k].multi;
    } else {
      cell.symbol = PESTS[Math.floor(Math.random() * PESTS.length)];
      cell.isPest = true;
      cell.multi = 0;
    }
  });
  return cells;
}

/* ── Farmhouse SVG ──────────────────────────────────────────── */
function Farmhouse() {
  return (
    <svg width="90" height="78" viewBox="0 0 90 78" fill="none">
      {/* Base */}
      <rect x="12" y="36" width="66" height="42" rx="3" fill="#c8a46e" stroke="#92744a" strokeWidth="1.5"/>
      {/* Door */}
      <rect x="35" y="52" width="20" height="26" rx="2" fill="#7c5230" stroke="#5a3d22" strokeWidth="1.2"/>
      <circle cx="51" cy="65" r="2" fill="#f59e0b"/>
      {/* Window L */}
      <rect x="16" y="44" width="16" height="14" rx="2" fill="#bfdbfe" stroke="#3b82f6" strokeWidth="1"/>
      <line x1="24" y1="44" x2="24" y2="58" stroke="#3b82f6" strokeWidth="0.8"/>
      <line x1="16" y1="51" x2="32" y2="51" stroke="#3b82f6" strokeWidth="0.8"/>
      {/* Window R */}
      <rect x="58" y="44" width="16" height="14" rx="2" fill="#bfdbfe" stroke="#3b82f6" strokeWidth="1"/>
      <line x1="66" y1="44" x2="66" y2="58" stroke="#3b82f6" strokeWidth="0.8"/>
      <line x1="58" y1="51" x2="74" y2="51" stroke="#3b82f6" strokeWidth="0.8"/>
      {/* Roof */}
      <polygon points="6,38 45,4 84,38" fill="#475569" stroke="#334155" strokeWidth="1.5"/>
      {/* Roof ridge accent */}
      <polygon points="6,38 45,4 84,38 84,36 45,2 6,36" fill="#334155" opacity="0.3"/>
      {/* Chimney */}
      <rect x="60" y="8" width="10" height="22" rx="1" fill="#64748b"/>
      <rect x="58" y="6" width="14" height="5" rx="1" fill="#475569"/>
      {/* Smoke */}
      {[0,1,2].map(i => (
        <motion.ellipse key={i} cx={65} cy={3 - i * 5} rx="3" ry="2.5"
          fill="white" opacity={0.25 - i * 0.07}
          animate={{ y: [0, -6, -12], opacity: [0.25, 0.15, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.6, ease: "easeOut" }} />
      ))}
    </svg>
  );
}

/* ── Tree ───────────────────────────────────────────────────── */
function Tree({ size = 1 }: { size?: number }) {
  return (
    <svg width={40 * size} height={56 * size} viewBox="0 0 40 56" fill="none">
      <rect x="17" y="38" width="6" height="18" rx="2" fill="#92400e"/>
      <ellipse cx="20" cy="28" rx="16" ry="18" fill="#16a34a"/>
      <ellipse cx="20" cy="22" rx="12" ry="14" fill="#22c55e"/>
      <ellipse cx="20" cy="16" rx="8" ry="10" fill="#4ade80"/>
    </svg>
  );
}

/* ── Bush ───────────────────────────────────────────────────── */
function Bush() {
  return (
    <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
      <ellipse cx="14" cy="12" rx="12" ry="8" fill="#16a34a"/>
      <ellipse cx="8" cy="14" rx="7" ry="6" fill="#15803d"/>
      <ellipse cx="20" cy="14" rx="7" ry="6" fill="#15803d"/>
      <ellipse cx="14" cy="8" rx="8" ry="6" fill="#22c55e"/>
    </svg>
  );
}

/* ── Character ──────────────────────────────────────────────── */
function Character({ isPlaying }: { isPlaying: boolean }) {
  return (
    <motion.div
      animate={isPlaying ? { x: [0, 4, -4, 0], y: [0, -2, 0] } : { y: [0, -3, 0] }}
      transition={{ duration: isPlaying ? 0.6 : 2, repeat: Infinity, ease: "easeInOut" }}
      className="flex flex-col items-center select-none"
      style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.3))" }}
    >
      <span style={{ fontSize: 34, lineHeight: 1 }}>🧑‍🌾</span>
    </motion.div>
  );
}

/* ── Sign ───────────────────────────────────────────────────── */
function Sign({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>
      <div className="bg-amber-100 border-2 border-amber-700 rounded-lg px-2 py-0.5 text-[9px] font-black text-amber-900 whitespace-nowrap shadow">
        {text}
      </div>
      <div className="w-1.5 h-5 bg-amber-700 rounded-b-sm"/>
    </div>
  );
}

/* ── Side Button ────────────────────────────────────────────── */
function SideBtn({ emoji, label, img, onClick }: { emoji?: string; label: string; img?: string; onClick?: () => void }) {
  return (
    <motion.button whileTap={{ scale: 0.88 }} onClick={onClick}
      className="flex flex-col items-center gap-0.5">
      <div className="w-11 h-11 rounded-full border-2 border-amber-300 flex items-center justify-center shadow-lg"
        style={{ background: "linear-gradient(135deg,#fef3c7,#fde68a)", boxShadow: "0 3px 0 #b45309, 0 4px 8px rgba(0,0,0,0.3)" }}>
        {img ? (
          <img src={img} alt={label} className="w-7 h-7 object-contain" draggable={false}/>
        ) : (
          <span style={{ fontSize: 22 }}>{emoji}</span>
        )}
      </div>
      <span className="text-[9px] font-black text-white leading-tight text-center drop-shadow"
        style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>{label}</span>
    </motion.button>
  );
}

/* ══════════════════════════════════════════════════════════════ */
export default function FermeMagique() {
  const { toast } = useToast();
  const { data: wallet } = useGetBalance({ query: { queryKey: getGetBalanceQueryKey() } });
  const [bet, setBet] = useState(200);
  const [grid, setGrid] = useState<Cell[]>(generateGrid);
  const [revealedCount, setRevealedCount] = useState(0);
  const [totalMultiplier, setTotalMultiplier] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState<boolean | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showWinAnim, setShowWinAnim] = useState(false);
  const [isDay, setIsDay] = useState(true);

  /* Day/Night cycle every 30s */
  useEffect(() => {
    const t = setInterval(() => setIsDay(d => !d), 30_000);
    return () => clearInterval(t);
  }, []);

  const balance = wallet?.balance ?? 0;
  const winAmount = Math.floor(bet * totalMultiplier);

  const startGame = () => {
    setGrid(generateGrid());
    setRevealedCount(0);
    setTotalMultiplier(0);
    setGameOver(false);
    setWon(null);
    setIsPlaying(true);
    setShowWinAnim(false);
  };

  const revealCell = useCallback((idx: number) => {
    if (!isPlaying || gameOver || grid[idx].revealed) return;
    const newGrid = [...grid];
    newGrid[idx] = { ...newGrid[idx], revealed: true };
    setGrid(newGrid);

    if (newGrid[idx].isPest) {
      setGameOver(true); setWon(false); setIsPlaying(false);
      toast({ title: "🐛 Ravageur !", description: `Récolte détruite — ${bet.toLocaleString("fr-FR")} FCFA perdus`, variant: "destructive" });
      setTimeout(() => setGrid(g => g.map(c => ({ ...c, revealed: true }))), 700);
    } else {
      const multi = newGrid[idx].multi;
      const newTotal = totalMultiplier + multi;
      setTotalMultiplier(newTotal);
      const newRevealed = revealedCount + 1;
      setRevealedCount(newRevealed);
      if (newRevealed >= PRIZE_SLOTS) {
        setGameOver(true); setWon(true); setIsPlaying(false);
        setShowWinAnim(true);
        const w = Math.floor(bet * newTotal);
        toast({ title: "🌻 Récolte Parfaite !", description: `+${w.toLocaleString("fr-FR")} FCFA gagnés !`, className: "bg-green-600 text-white border-none" });
        setTimeout(() => setGrid(g => g.map(c => ({ ...c, revealed: true }))), 500);
      }
    }
  }, [isPlaying, gameOver, grid, bet, totalMultiplier, revealedCount, toast]);

  const cashOut = () => {
    if (!isPlaying || revealedCount === 0) return;
    setGameOver(true); setWon(true); setIsPlaying(false); setShowWinAnim(true);
    toast({ title: "💰 Encaissé !", description: `+${winAmount.toLocaleString("fr-FR")} FCFA`, className: "bg-amber-500 text-white border-none" });
    setGrid(g => g.map(c => ({ ...c, revealed: true })));
  };

  /* Sky gradient based on day/night */
  const skyGrad = isDay
    ? "linear-gradient(180deg,#60a5fa 0%,#93c5fd 35%,#86efac 60%,#4ade80 100%)"
    : "linear-gradient(180deg,#1e1b4b 0%,#312e81 35%,#1e3a2f 60%,#166534 100%)";

  return (
    <div className="flex flex-col min-h-full w-full overflow-hidden select-none"
      style={{ background: skyGrad, transition: "background 3s ease" }}>

      {/* ── STARS (night) ── */}
      <AnimatePresence>
        {!isDay && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none z-0">
            {Array.from({ length: 18 }).map((_, i) => (
              <motion.div key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{ left: `${5 + (i * 53) % 90}%`, top: `${3 + (i * 37) % 28}%` }}
                animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1.5 + i * 0.3, repeat: Infinity, delay: i * 0.2 }} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HEADER ── */}
      <header className="relative z-20 px-3 pt-3 pb-2 flex items-center gap-2">
        <Link href="/games">
          <motion.button whileTap={{ scale: 0.88 }}
            className="w-9 h-9 rounded-full flex items-center justify-center border-2 border-white/40"
            style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}>
            <ArrowLeft size={17} className="text-white" />
          </motion.button>
        </Link>

        {/* Balance pill */}
        <div className="flex items-center gap-1.5 rounded-full border-2 border-amber-300 px-2.5 py-1 ml-1"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
          <img src={iconWallet} alt="Balance" className="w-5 h-5 object-contain" draggable={false}/>
          <span className="text-amber-300 font-black text-sm">{balance.toLocaleString("fr-FR")}</span>
          <span className="text-amber-500 text-xs font-bold">F</span>
        </div>

        {/* Progress pill */}
        <div className="ml-auto flex items-center gap-1.5 rounded-full border-2 border-green-300 px-2.5 py-1"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
          <span className="text-green-300 font-black text-xs">{revealedCount}/{PRIZE_SLOTS}</span>
          <span className="text-base">🌿</span>
        </div>

        {/* Day/Night toggle button */}
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setIsDay(d => !d)}
          className="w-9 h-9 rounded-full flex items-center justify-center border-2 border-white/30"
          style={{ background: "rgba(0,0,0,0.35)" }}>
          <span className="text-lg">{isDay ? "🌙" : "☀️"}</span>
        </motion.button>
      </header>

      {/* ── FARM SCENE ── */}
      <div className="relative z-10 flex-1 flex flex-col" style={{ minHeight: 0 }}>

        {/* Background elements */}
        <div className="relative w-full" style={{ height: 130 }}>

          {/* Farmhouse (top-right) */}
          <div className="absolute" style={{ top: 4, right: 14 }}>
            <Farmhouse />
          </div>

          {/* Large trees left */}
          <div className="absolute" style={{ top: 10, left: 0 }}>
            <Tree size={1.1} />
          </div>
          <div className="absolute" style={{ top: 30, left: 28 }}>
            <Tree size={0.75} />
          </div>

          {/* Tree right */}
          <div className="absolute" style={{ top: 55, right: 8 }}>
            <Tree size={0.8} />
          </div>

          {/* Bushes */}
          <div className="absolute" style={{ top: 100, left: 10 }}><Bush /></div>
          <div className="absolute" style={{ top: 95, right: 110 }}><Bush /></div>

          {/* Sign */}
          <div className="absolute" style={{ top: 62, left: "48%", transform: "translateX(-50%)" }}>
            <Sign text={isPlaying ? "🌱 Récoltez !" : gameOver && won ? "🏆 Gagné !" : gameOver ? "💀 Perdu" : "⚡ Plantez !"} />
          </div>

          {/* Character */}
          <div className="absolute" style={{ top: 56, left: "38%" }}>
            <Character isPlaying={isPlaying} />
          </div>

          {/* Side buttons LEFT */}
          <div className="absolute flex flex-col gap-3" style={{ top: 8, left: 6 }}>
            <SideBtn img={iconMoney} label={"Histo-\nrique"} />
            <SideBtn img={iconGift}  label={"Bonus"} />
          </div>

          {/* Side buttons RIGHT */}
          <div className="absolute flex flex-col gap-3" style={{ top: 8, right: 6 }}>
            <SideBtn emoji="⬆️" label={"Upgrade"} />
            <SideBtn emoji="❓" label={"Règles"} />
          </div>
        </div>

        {/* ── ISOMETRIC FARM GRID ── */}
        <div className="flex flex-col items-center px-3 pb-1">

          {/* Grid container with isometric perspective */}
          <div
            className="relative w-full overflow-hidden rounded-2xl"
            style={{
              background: "linear-gradient(180deg,#78350f 0%,#92400e 20%,#a16207 100%)",
              padding: "10px 8px 14px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.1)",
              border: "3px solid #b45309",
            }}
          >
            {/* Soil texture top highlight */}
            <div className="absolute top-0 left-0 right-0 h-2 rounded-t-xl opacity-40"
              style={{ background: "linear-gradient(180deg,rgba(255,255,255,0.3),transparent)" }}/>

            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                transform: "perspective(500px) rotateX(22deg)",
                transformOrigin: "bottom center",
              }}
            >
              {grid.map((cell, idx) => {
                const crop = !cell.isPest ? CROPS[cell.symbol] : null;
                return (
                  <motion.button
                    key={idx}
                    whileTap={{ scale: 0.88, y: -2 }}
                    onClick={() => revealCell(idx)}
                    disabled={!isPlaying || cell.revealed}
                    className="relative rounded-xl flex items-center justify-center overflow-hidden"
                    style={{
                      aspectRatio: "1/1",
                      background: cell.revealed
                        ? cell.isPest
                          ? "linear-gradient(180deg,#7f1d1d,#991b1b)"
                          : "linear-gradient(180deg,#14532d,#15803d)"
                        : "linear-gradient(180deg,#4ade80,#22c55e)",
                      border: cell.revealed
                        ? `2px solid ${cell.isPest ? "#fca5a5" : "#4ade80"}`
                        : "2px solid #16a34a",
                      boxShadow: cell.revealed
                        ? "none"
                        : "inset 0 2px 0 rgba(255,255,255,0.3), 0 3px 0 #15803d",
                      cursor: isPlaying && !cell.revealed ? "pointer" : "default",
                    }}
                  >
                    {/* Grass texture for unrevealed */}
                    {!cell.revealed && (
                      <>
                        <div className="absolute inset-0 opacity-20"
                          style={{ backgroundImage: "radial-gradient(circle at 30% 30%, #bbf7d0 2px, transparent 2px), radial-gradient(circle at 70% 60%, #86efac 1.5px, transparent 1.5px)", backgroundSize: "8px 8px" }} />
                        <span className="text-xl relative z-10" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" }}>
                          {isPlaying ? "🌿" : "🟫"}
                        </span>
                      </>
                    )}

                    {/* Revealed content */}
                    {cell.revealed && (
                      <motion.div
                        initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 320, damping: 20 }}
                        className="flex flex-col items-center justify-center w-full h-full"
                      >
                        <span className="text-xl leading-none" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))" }}>
                          {cell.symbol}
                        </span>
                        {!cell.isPest && crop && (
                          <span className="text-[8px] font-black mt-0.5" style={{ color: crop.color }}>
                            x{crop.multi}
                          </span>
                        )}
                      </motion.div>
                    )}

                    {/* Sparkle on fresh reveal */}
                    {cell.revealed && !cell.isPest && (
                      <motion.div
                        initial={{ opacity: 1, scale: 0.5 }} animate={{ opacity: 0, scale: 2 }}
                        transition={{ duration: 0.6 }}
                        className="absolute inset-0 rounded-xl"
                        style={{ background: "radial-gradient(circle, rgba(250,204,21,0.5) 0%, transparent 70%)" }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Grid border decorations */}
            <div className="absolute bottom-1 left-3 flex gap-1.5">
              {["🌱","🌱","🌱"].map((s,i) => <span key={i} className="text-xs opacity-60">{s}</span>)}
            </div>
          </div>
        </div>

        {/* ── WIN/LOSE RESULT OVERLAY ── */}
        <AnimatePresence>
          {gameOver && won !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
              className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
              style={{ top: 80 }}
            >
              <div className="rounded-3xl p-5 flex flex-col items-center gap-2 text-center"
                style={{
                  background: won ? "rgba(20,83,45,0.92)" : "rgba(127,29,29,0.92)",
                  border: won ? "2px solid #4ade80" : "2px solid #fca5a5",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                }}>
                {won ? (
                  <>
                    <img src={iconCoins} alt="win" className="w-16 h-16 object-contain" draggable={false}
                      style={{ filter: "drop-shadow(0 4px 12px rgba(250,204,21,0.6))" }}/>
                    <p className="font-black text-2xl text-amber-400 tracking-wide">RÉCOLTE !</p>
                    <p className="text-white font-black text-xl">+{winAmount.toLocaleString("fr-FR")} FCFA</p>
                    <p className="text-green-300 text-xs font-bold">Multiplicateur total × {totalMultiplier.toFixed(1)}</p>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: 48 }}>🐛</span>
                    <p className="font-black text-xl text-red-400">RAVAGÉ !</p>
                    <p className="text-white/70 text-sm">Les ravageurs ont détruit la récolte</p>
                    <p className="text-red-300 font-bold text-sm">-{bet.toLocaleString("fr-FR")} FCFA</p>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── BOTTOM CONTROLS ── */}
      <div className="relative z-20 px-3 pb-5 pt-2 space-y-2"
        style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(10px)", borderTop: "1px solid rgba(255,255,255,0.1)" }}>

        {/* Multiplier + Gain bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="text-white/50 text-[9px] font-bold uppercase tracking-wide">Multi.</p>
              <p className="text-amber-400 font-black text-base leading-tight">×{totalMultiplier.toFixed(1)}</p>
            </div>
            <div className="w-px h-7 bg-white/20"/>
            <div className="text-center">
              <p className="text-white/50 text-[9px] font-bold uppercase tracking-wide">Gain</p>
              <p className="text-green-300 font-black text-base leading-tight">{winAmount.toLocaleString("fr-FR")} F</p>
            </div>
          </div>
          {/* Mise control */}
          <div className="flex items-center gap-2 bg-black/40 rounded-2xl px-3 py-2 border border-white/10">
            <motion.button whileTap={{ scale: 0.85 }}
              onClick={() => { if (!isPlaying) setBet(b => Math.max(BET_OPTIONS[0], BET_OPTIONS[BET_OPTIONS.indexOf(b) - 1] ?? b)); }}
              disabled={isPlaying}
              className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white font-black text-lg disabled:opacity-30">
              −
            </motion.button>
            <div className="text-center min-w-[60px]">
              <p className="text-white/50 text-[9px] font-bold uppercase">Mise</p>
              <p className="text-amber-300 font-black text-sm">{bet.toLocaleString("fr-FR")} F</p>
            </div>
            <motion.button whileTap={{ scale: 0.85 }}
              onClick={() => { if (!isPlaying) setBet(b => BET_OPTIONS[BET_OPTIONS.indexOf(b) + 1] ?? b); }}
              disabled={isPlaying}
              className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white font-black text-lg disabled:opacity-30">
              +
            </motion.button>
          </div>
        </div>

        {/* Bet presets (when not playing) */}
        <AnimatePresence>
          {!isPlaying && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="flex gap-1.5 overflow-hidden">
              {BET_OPTIONS.map(b => (
                <motion.button key={b} whileTap={{ scale: 0.9 }} onClick={() => setBet(b)}
                  className="flex-1 py-1.5 rounded-xl text-[10px] font-black border transition-all"
                  style={{
                    background: bet === b ? "linear-gradient(135deg,#f59e0b,#d97706)" : "rgba(255,255,255,0.08)",
                    borderColor: bet === b ? "#fbbf24" : "rgba(255,255,255,0.12)",
                    color: bet === b ? "#000" : "rgba(255,255,255,0.7)",
                  }}>
                  {b >= 1000 ? `${b/1000}k` : b}F
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div className="flex gap-2">
          {/* Cash out */}
          <AnimatePresence>
            {isPlaying && revealedCount > 0 && (
              <motion.button
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                whileTap={{ scale: 0.96 }} onClick={cashOut}
                className="flex-1 h-13 rounded-2xl font-black text-sm text-black shadow-xl flex items-center justify-center gap-1.5"
                style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", boxShadow: "0 4px 0 #92400e, 0 6px 20px rgba(245,158,11,0.5)" }}>
                <img src={iconWallet} alt="cash" className="w-6 h-6 object-contain" draggable={false}/>
                Encaisser {winAmount.toLocaleString("fr-FR")} F
              </motion.button>
            )}
          </AnimatePresence>

          {/* Plant / Replay */}
          <motion.button
            whileTap={{ scale: 0.96 }} onClick={!isPlaying ? startGame : undefined}
            disabled={isPlaying && revealedCount === 0 && !gameOver}
            className="flex-1 h-13 rounded-2xl font-black text-base text-white shadow-xl flex items-center justify-center gap-2 disabled:opacity-40"
            style={{
              background: gameOver
                ? "linear-gradient(135deg,#7c3aed,#6d28d9)"
                : isPlaying
                ? "rgba(255,255,255,0.08)"
                : "linear-gradient(135deg,#16a34a,#15803d)",
              boxShadow: !isPlaying || gameOver
                ? "0 4px 0 #166534, 0 6px 20px rgba(22,163,74,0.4)"
                : "none",
            }}>
            {gameOver
              ? <><span className="text-xl">🔄</span> Replanter</>
              : isPlaying
              ? <><span className="text-base">🌿</span> Récoltez...</>
              : <><span className="text-xl">🌱</span> Planter</>
            }
          </motion.button>
        </div>

        {/* Crop legend */}
        <div className="flex gap-1 justify-center flex-wrap pt-1">
          {Object.values(CROPS).map(c => (
            <div key={c.emoji} className="flex items-center gap-0.5 bg-black/30 rounded-full px-2 py-0.5">
              <span className="text-xs">{c.emoji}</span>
              <span className="text-[9px] font-black" style={{ color: c.color }}>×{c.multi}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
