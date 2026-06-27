import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ROWS = 8;
const BET_OPTIONS = [100, 200, 500, 1000, 2000];

const RISK_CONFIGS = {
  faible: {
    multipliers: [5.6, 2.1, 1.1, 1.0, 0.5, 1.0, 1.1, 2.1, 5.6],
    colors: ["#f59e0b", "#fbbf24", "#fde68a", "#d1fae5", "#fee2e2", "#d1fae5", "#fde68a", "#fbbf24", "#f59e0b"],
  },
  moyen: {
    multipliers: [13.0, 3.0, 1.3, 0.7, 0.4, 0.7, 1.3, 3.0, 13.0],
    colors: ["#f59e0b", "#fb923c", "#fde68a", "#d1fae5", "#fee2e2", "#d1fae5", "#fde68a", "#fb923c", "#f59e0b"],
  },
  elevé: {
    multipliers: [29.0, 4.0, 1.5, 0.3, 0.2, 0.3, 1.5, 4.0, 29.0],
    colors: ["#ef4444", "#f97316", "#fbbf24", "#d1fae5", "#fee2e2", "#d1fae5", "#fbbf24", "#f97316", "#ef4444"],
  },
};

type Risk = "faible" | "moyen" | "elevé";

interface Ball {
  id: number;
  x: number;
  y: number;
  path: number[];
  slot: number;
  done: boolean;
}

let ballId = 0;

export default function Plinko() {
  const { toast } = useToast();
  const [bet, setBet] = useState(200);
  const [risk, setRisk] = useState<Risk>("moyen");
  const [balls, setBalls] = useState<Ball[]>([]);
  const [lastSlot, setLastSlot] = useState<number | null>(null);
  const [isDropping, setIsDropping] = useState(false);
  const config = RISK_CONFIGS[risk];
  const slots = config.multipliers.length;

  const dropBall = useCallback(() => {
    if (isDropping) return;
    setIsDropping(true);
    setLastSlot(null);

    // Simulate path through pegs
    const path: number[] = [];
    let pos = 0; // relative offset from center
    for (let row = 0; row < ROWS; row++) {
      const goRight = Math.random() > 0.5;
      pos += goRight ? 1 : -1;
      path.push(pos);
    }
    const slot = Math.max(0, Math.min(slots - 1, Math.floor((pos + ROWS) / 2)));

    const id = ballId++;
    const newBall: Ball = { id, x: 50, y: 0, path, slot, done: false };
    setBalls(prev => [...prev, newBall]);

    // Animate ball dropping through rows
    let step = 0;
    const totalSteps = ROWS * 8;
    const interval = setInterval(() => {
      step++;
      const progress = step / totalSteps;
      const row = Math.floor(progress * ROWS);
      const xOffset = row < path.length ? path[row] : path[ROWS - 1];

      setBalls(prev => prev.map(b => b.id === id
        ? { ...b, x: 50 + xOffset * (50 / ROWS), y: progress * 85 }
        : b));

      if (step >= totalSteps) {
        clearInterval(interval);
        setBalls(prev => prev.map(b => b.id === id ? { ...b, done: true, y: 85, x: 50 + (slot - (slots - 1) / 2) * (100 / slots) } : b));
        setLastSlot(slot);
        setIsDropping(false);

        const multi = config.multipliers[slot];
        const win = Math.floor(bet * multi);
        if (multi >= 1) {
          toast({ title: `🏆 x${multi} !`, description: `+${win.toLocaleString("fr-FR")} FCFA`, className: "bg-green-600 text-white border-none" });
        } else {
          toast({ title: `x${multi}`, description: `${win.toLocaleString("fr-FR")} FCFA récupéré`, variant: "destructive" });
        }

        setTimeout(() => setBalls(prev => prev.filter(b => b.id !== id)), 2000);
      }
    }, 30);
  }, [isDropping, bet, risk, config, slots, toast]);

  const lastMulti = lastSlot !== null ? config.multipliers[lastSlot] : null;

  return (
    <div className="flex flex-col min-h-full w-full text-white"
      style={{ background: "linear-gradient(180deg,#020617 0%,#0c0a1e 50%,#020617 100%)" }}>

      <header className="sticky top-0 z-20 px-4 h-14 flex items-center gap-3 bg-black/40 backdrop-blur-sm">
        <Link href="/games">
          <motion.button whileTap={{ scale: 0.9 }} className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
            <ArrowLeft size={18} />
          </motion.button>
        </Link>
        <span className="text-2xl">🎯</span>
        <h1 className="font-black text-xl">Plinko</h1>
        <AnimatePresence>
          {lastMulti !== null && (
            <motion.div key={lastMulti} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
              className="ml-auto bg-amber-500 rounded-xl px-3 py-1 text-xs font-black text-black">
              x{lastMulti}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Plinko board */}
      <div className="flex-1 relative overflow-hidden px-4 pt-2">
        <div className="relative w-full" style={{ paddingBottom: "90%" }}>

          {/* Pegs */}
          {Array.from({ length: ROWS }, (_, row) => {
            const pegsInRow = row + 3;
            return Array.from({ length: pegsInRow }, (_, col) => {
              const x = ((col + 0.5) / pegsInRow) * 100;
              const y = ((row + 0.5) / (ROWS + 1)) * 80;
              return (
                <div key={`${row}-${col}`} className="absolute w-3 h-3 rounded-full bg-white/30 border border-white/50 shadow-lg"
                  style={{ left: `calc(${x}% - 6px)`, top: `${y}%` }} />
              );
            });
          })}

          {/* Balls */}
          {balls.map(ball => (
            <motion.div key={ball.id}
              className="absolute w-5 h-5 rounded-full z-10 border-2 border-amber-300"
              style={{
                left: `calc(${ball.x}% - 10px)`,
                top: `${ball.y}%`,
                background: "linear-gradient(135deg,#f59e0b,#d97706)",
                boxShadow: "0 0 12px rgba(245,158,11,0.8)",
              }} />
          ))}

          {/* Multiplier slots */}
          <div className="absolute bottom-0 left-0 right-0 flex gap-1 px-1">
            {config.multipliers.map((m, i) => (
              <motion.div key={i}
                animate={lastSlot === i ? { scale: [1, 1.2, 1] } : {}}
                className="flex-1 rounded-xl py-2 flex items-center justify-center text-center border-2"
                style={{
                  background: lastSlot === i ? config.colors[i] + "cc" : config.colors[i] + "33",
                  borderColor: lastSlot === i ? config.colors[i] : config.colors[i] + "44",
                }}>
                <span className="font-black text-[10px] leading-tight text-white" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
                  x{m}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-4 pb-8 pt-3 space-y-3 bg-black/30">
        {/* Risk selector */}
        <div className="flex gap-2">
          {(Object.keys(RISK_CONFIGS) as Risk[]).map(r => (
            <motion.button key={r} whileTap={{ scale: 0.92 }} onClick={() => !isDropping ? setRisk(r) : null}
              className="flex-1 py-2 rounded-xl text-xs font-black border-2 capitalize"
              style={{ background: risk === r ? "#16a34a" : "rgba(255,255,255,0.06)", borderColor: risk === r ? "#22c55e" : "rgba(255,255,255,0.1)" }}>
              {r === "faible" ? "🟢 Faible" : r === "moyen" ? "🟡 Moyen" : "🔴 Élevé"}
            </motion.button>
          ))}
        </div>

        {/* Bet */}
        <div className="flex gap-2 overflow-x-auto">
          {BET_OPTIONS.map(b => (
            <motion.button key={b} whileTap={{ scale: 0.92 }} onClick={() => setBet(b)}
              className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-black border-2"
              style={{ background: bet === b ? "#f59e0b" : "rgba(255,255,255,0.06)", borderColor: bet === b ? "#fbbf24" : "rgba(255,255,255,0.1)", color: bet === b ? "#000" : "#fff" }}>
              {b.toLocaleString("fr-FR")} F
            </motion.button>
          ))}
        </div>

        <motion.button whileTap={{ scale: 0.96 }} onClick={dropBall} disabled={isDropping}
          className="w-full h-14 rounded-2xl font-black text-white flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ background: "linear-gradient(135deg,#16a34a,#15803d)" }}>
          {isDropping ? "🎯 En cours..." : `🎯 Lâcher la balle (${bet.toLocaleString("fr-FR")} F)`}
        </motion.button>
      </div>
    </div>
  );
}
