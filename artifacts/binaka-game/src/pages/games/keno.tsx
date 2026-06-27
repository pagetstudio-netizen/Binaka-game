import { useState, useCallback } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TOTAL_NUMBERS = 40;
const DRAWN_COUNT = 20;
const MAX_PICK = 10;
const MIN_PICK = 1;
const BET_OPTIONS = [100, 200, 500, 1000, 2000];

const PAYOUT_TABLE: Record<number, Record<number, number>> = {
  1:  { 1: 3.8 },
  2:  { 1: 1.0, 2: 8.0 },
  3:  { 2: 2.5, 3: 18.0 },
  4:  { 2: 1.5, 3: 6.0,  4: 40.0 },
  5:  { 3: 2.0, 4: 8.0,  5: 80.0 },
  6:  { 3: 1.2, 4: 4.0,  5: 24.0,  6: 160.0 },
  7:  { 4: 2.0, 5: 8.0,  6: 50.0,  7: 300.0 },
  8:  { 4: 1.5, 5: 5.0,  6: 20.0,  7: 150.0,  8: 800.0 },
  9:  { 5: 2.5, 6: 10.0, 7: 40.0,  8: 200.0,  9: 1200.0 },
  10: { 5: 1.5, 6: 5.0,  7: 20.0,  8: 80.0,   9: 500.0, 10: 3000.0 },
};

function drawNumbers(): number[] {
  const pool = Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1);
  const drawn: number[] = [];
  while (drawn.length < DRAWN_COUNT) {
    const idx = Math.floor(Math.random() * pool.length);
    drawn.push(pool.splice(idx, 1)[0]);
  }
  return drawn.sort((a, b) => a - b);
}

export default function Keno() {
  const { toast } = useToast();
  const [bet, setBet] = useState(200);
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [drawn, setDrawn] = useState<number[]>([]);
  const [hits, setHits] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [revealedDrawn, setRevealedDrawn] = useState<number[]>([]);

  const toggleNumber = useCallback((n: number) => {
    if (isPlaying || gameOver) return;
    setPicked(prev => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else if (next.size < MAX_PICK) next.add(n);
      return next;
    });
  }, [isPlaying, gameOver]);

  const play = () => {
    if (picked.size < MIN_PICK) {
      toast({ title: "Choisissez au moins 1 numéro", variant: "destructive" });
      return;
    }
    const drawnNums = drawNumbers();
    setDrawn(drawnNums);
    setRevealedDrawn([]);
    setIsPlaying(true);
    setGameOver(false);
    setIsAnimating(true);

    let i = 0;
    const interval = setInterval(() => {
      setRevealedDrawn(prev => [...prev, drawnNums[i]]);
      i++;
      if (i >= DRAWN_COUNT) {
        clearInterval(interval);
        setIsAnimating(false);
        setIsPlaying(false);
        setGameOver(true);

        const h = drawnNums.filter(d => picked.has(d)).length;
        setHits(h);
        const table = PAYOUT_TABLE[picked.size] ?? {};
        const multi = table[h] ?? 0;
        const win = Math.floor(bet * multi);
        if (win > 0) {
          toast({ title: `🎉 ${h}/${picked.size} — x${multi}`, description: `+${win.toLocaleString("fr-FR")} FCFA`, className: "bg-green-600 text-white border-none" });
        } else {
          toast({ title: `${h}/${picked.size} correspondances`, description: "Pas de gain cette fois", variant: "destructive" });
        }
      }
    }, 120);
  };

  const reset = () => {
    setPicked(new Set());
    setDrawn([]);
    setRevealedDrawn([]);
    setHits(0);
    setIsPlaying(false);
    setGameOver(false);
  };

  const pickedCount = picked.size;
  const table = PAYOUT_TABLE[pickedCount] ?? {};
  const currentMulti = gameOver ? (table[hits] ?? 0) : 0;
  const winAmount = Math.floor(bet * currentMulti);

  return (
    <div className="flex flex-col min-h-full w-full text-white"
      style={{ background: "linear-gradient(180deg,#0a1628 0%,#0f2240 50%,#0a1628 100%)" }}>

      <header className="sticky top-0 z-20 px-4 h-14 flex items-center gap-3 bg-black/40 backdrop-blur-sm">
        <Link href="/games">
          <motion.button whileTap={{ scale: 0.9 }} className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
            <ArrowLeft size={18} />
          </motion.button>
        </Link>
        <span className="text-2xl">🎱</span>
        <h1 className="font-black text-xl">Keno</h1>
        <div className="ml-auto flex gap-3 text-sm">
          <span className="text-white/50 font-bold">Sélectionnés: <span className="text-amber-400">{pickedCount}/{MAX_PICK}</span></span>
        </div>
      </header>

      {/* Result bar */}
      <AnimatePresence>
        {gameOver && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between px-4 py-3 gap-3"
            style={{ background: currentMulti > 0 ? "rgba(22,163,74,0.2)" : "rgba(220,38,38,0.15)" }}>
            <p className="font-black text-lg">
              {hits}/{pickedCount} hits {currentMulti > 0 ? `— x${currentMulti}` : ""}
            </p>
            {currentMulti > 0 && (
              <p className="font-black text-xl text-green-400">+{winAmount.toLocaleString("fr-FR")} FCFA</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Number grid */}
      <div className="flex-1 px-3 py-3 flex flex-col gap-4">
        <div className="grid grid-cols-8 gap-1.5">
          {Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1).map(n => {
            const isPicked = picked.has(n);
            const isDrawn = revealedDrawn.includes(n);
            const isHit = isPicked && isDrawn;
            const isMiss = isDrawn && !isPicked;
            return (
              <motion.button key={n}
                whileTap={{ scale: 0.85 }}
                onClick={() => toggleNumber(n)}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: isHit ? [1, 1.25, 1] : 1,
                  opacity: 1,
                }}
                transition={{ delay: n * 0.01 }}
                className="aspect-square rounded-xl flex items-center justify-center text-xs font-black border transition-all"
                style={{
                  background: isHit ? "linear-gradient(135deg,#16a34a,#15803d)" :
                    isMiss ? "rgba(255,255,255,0.06)" :
                    isPicked ? "linear-gradient(135deg,#f59e0b,#d97706)" :
                    "rgba(255,255,255,0.08)",
                  borderColor: isHit ? "#4ade80" :
                    isMiss ? "rgba(255,255,255,0.05)" :
                    isPicked ? "#fbbf24" :
                    "rgba(255,255,255,0.08)",
                  color: isHit ? "white" : isMiss ? "rgba(255,255,255,0.25)" : "white",
                  boxShadow: isHit ? "0 0 10px rgba(74,222,128,0.5)" : "none",
                }}>
                {n}
              </motion.button>
            );
          })}
        </div>

        {/* Drawn numbers row */}
        {revealedDrawn.length > 0 && (
          <div>
            <p className="text-xs text-white/40 font-bold mb-2">Numéros tirés</p>
            <div className="flex flex-wrap gap-1.5">
              {revealedDrawn.map((n, i) => (
                <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
                  style={{
                    background: picked.has(n) ? "linear-gradient(135deg,#16a34a,#15803d)" : "rgba(255,255,255,0.15)",
                    border: picked.has(n) ? "2px solid #4ade80" : "2px solid transparent",
                  }}>
                  {n}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {/* Payout table preview */}
        {pickedCount > 0 && !gameOver && (
          <div className="bg-white/05 rounded-2xl border border-white/10 p-3">
            <p className="text-xs text-white/50 font-bold mb-2">Table des gains ({pickedCount} numéros)</p>
            <div className="grid grid-cols-3 gap-1">
              {Object.entries(table).map(([hits, multi]) => (
                <div key={hits} className="text-center bg-white/5 rounded-xl py-1.5">
                  <p className="text-xs text-white/50">{hits} hits</p>
                  <p className="font-black text-amber-400 text-sm">x{multi}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="px-4 pb-8 pt-3 space-y-3 bg-black/30">
        <div className="flex gap-2 overflow-x-auto">
          {BET_OPTIONS.map(b => (
            <motion.button key={b} whileTap={{ scale: 0.92 }} onClick={() => !isPlaying ? setBet(b) : null}
              disabled={isPlaying}
              className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-black border-2"
              style={{ background: bet === b ? "#f59e0b" : "rgba(255,255,255,0.06)", borderColor: bet === b ? "#fbbf24" : "rgba(255,255,255,0.1)", color: bet === b ? "#000" : "#fff" }}>
              {b.toLocaleString("fr-FR")} F
            </motion.button>
          ))}
        </div>

        <div className="flex gap-3">
          {gameOver && (
            <motion.button whileTap={{ scale: 0.96 }} onClick={reset}
              className="flex-1 h-14 rounded-2xl font-black text-white border-2 border-white/20 flex items-center justify-center gap-2">
              <RefreshCw size={16} /> Recommencer
            </motion.button>
          )}
          {!gameOver && (
            <motion.button whileTap={{ scale: 0.96 }} onClick={play}
              disabled={isAnimating || pickedCount < MIN_PICK}
              className="flex-1 h-14 rounded-2xl font-black text-white flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#0ea5e9,#0284c7)" }}>
              {isAnimating ? "🎱 Tirage..." : `🎱 Tirer (${bet.toLocaleString("fr-FR")} F)`}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
