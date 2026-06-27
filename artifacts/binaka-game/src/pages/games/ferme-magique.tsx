import { useState, useCallback } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GRID_SIZE = 20; // 4x5 grid
const COLS = 4;
const ROWS = 5;
const PRIZE_SLOTS = 7; // 7 good slots, 13 bad

const CROPS = ["🌽", "🍅", "🥕", "🍓", "🌻", "🥦", "🍇"];
const PESTS = ["🐛", "🦗", "🐞", "🐜"];

const PRIZES: Record<string, number> = {
  "🌽": 1.2, "🍅": 1.5, "🥕": 1.8, "🍓": 2.5, "🌻": 3.0, "🥦": 4.0, "🍇": 6.0,
};

type Cell = { symbol: string; revealed: boolean; isPest: boolean };

function generateGrid(): Cell[] {
  const cells: Cell[] = Array(GRID_SIZE).fill(null).map(() => ({
    symbol: "", revealed: false, isPest: false,
  }));

  const prizePositions = new Set<number>();
  while (prizePositions.size < PRIZE_SLOTS) {
    prizePositions.add(Math.floor(Math.random() * GRID_SIZE));
  }

  cells.forEach((cell, i) => {
    if (prizePositions.has(i)) {
      cell.symbol = CROPS[Math.floor(Math.random() * CROPS.length)];
      cell.isPest = false;
    } else {
      cell.symbol = PESTS[Math.floor(Math.random() * PESTS.length)];
      cell.isPest = true;
    }
  });

  return cells;
}

const BET_OPTIONS = [100, 200, 500, 1000, 2000];

export default function FermeMagique() {
  const { toast } = useToast();
  const [bet, setBet] = useState(200);
  const [grid, setGrid] = useState<Cell[]>(generateGrid);
  const [revealedCount, setRevealedCount] = useState(0);
  const [totalMultiplier, setTotalMultiplier] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState<boolean | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const startGame = () => {
    setGrid(generateGrid());
    setRevealedCount(0);
    setTotalMultiplier(0);
    setGameOver(false);
    setWon(null);
    setIsPlaying(true);
  };

  const revealCell = useCallback((idx: number) => {
    if (!isPlaying || gameOver || grid[idx].revealed) return;

    const newGrid = [...grid];
    newGrid[idx] = { ...newGrid[idx], revealed: true };
    setGrid(newGrid);

    if (newGrid[idx].isPest) {
      setGameOver(true);
      setWon(false);
      setIsPlaying(false);
      toast({ title: "🐛 Ravageur !", description: `Vous avez perdu ${bet.toLocaleString("fr-FR")} FCFA`, variant: "destructive" });
      // Reveal all
      setTimeout(() => {
        setGrid(g => g.map(c => ({ ...c, revealed: true })));
      }, 600);
    } else {
      const multi = PRIZES[newGrid[idx].symbol] ?? 1.2;
      const newTotal = totalMultiplier + multi;
      setTotalMultiplier(newTotal);
      setRevealedCount(c => c + 1);

      const newRevealed = revealedCount + 1;
      if (newRevealed >= PRIZE_SLOTS) {
        setGameOver(true);
        setWon(true);
        setIsPlaying(false);
        const winAmount = Math.floor(bet * newTotal);
        toast({ title: "🌻 Récolte Parfaite !", description: `+${winAmount.toLocaleString("fr-FR")} FCFA`, className: "bg-green-600 text-white border-none" });
      }
    }
  }, [isPlaying, gameOver, grid, bet, totalMultiplier, revealedCount, toast]);

  const cashOut = () => {
    if (!isPlaying || revealedCount === 0) return;
    setGameOver(true);
    setWon(true);
    setIsPlaying(false);
    const winAmount = Math.floor(bet * totalMultiplier);
    toast({ title: "💰 Encaissé !", description: `+${winAmount.toLocaleString("fr-FR")} FCFA`, className: "bg-amber-500 text-white border-none" });
    setGrid(g => g.map(c => ({ ...c, revealed: true })));
  };

  const winAmount = Math.floor(bet * totalMultiplier);

  return (
    <div className="flex flex-col min-h-full w-full text-white"
      style={{ background: "linear-gradient(180deg,#1a4a0a 0%,#2d7a1a 40%,#3d9e28 100%)" }}>

      <header className="sticky top-0 z-20 px-4 h-14 flex items-center gap-3 bg-black/30 backdrop-blur-sm">
        <Link href="/games">
          <motion.button whileTap={{ scale: 0.9 }} className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
            <ArrowLeft size={18} />
          </motion.button>
        </Link>
        <span className="text-2xl">🌾</span>
        <h1 className="font-black text-xl">Ferme Magique</h1>
        <div className="ml-auto bg-black/30 rounded-xl px-3 py-1.5 text-xs font-black text-amber-300">
          {revealedCount}/{PRIZE_SLOTS} 🌿
        </div>
      </header>

      {/* Stats bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/20 gap-3">
        <div className="flex-1 bg-black/30 rounded-xl p-2.5 text-center">
          <p className="text-xs text-white/60">Multiplicateur</p>
          <p className="font-black text-lg text-amber-400">x{totalMultiplier.toFixed(1)}</p>
        </div>
        <div className="flex-1 bg-black/30 rounded-xl p-2.5 text-center">
          <p className="text-xs text-white/60">Gain potentiel</p>
          <p className="font-black text-lg text-green-300">{winAmount.toLocaleString("fr-FR")} F</p>
        </div>
        <div className="flex-1 bg-black/30 rounded-xl p-2.5 text-center">
          <p className="text-xs text-white/60">Mise</p>
          <p className="font-black text-lg text-white">{bet.toLocaleString("fr-FR")} F</p>
        </div>
      </div>

      {/* Game Grid */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4">
        <div className="w-full max-w-xs grid gap-2" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
          {grid.map((cell, idx) => (
            <motion.button key={idx} whileTap={{ scale: 0.9 }}
              onClick={() => revealCell(idx)} disabled={!isPlaying || cell.revealed}
              className="aspect-square rounded-2xl flex items-center justify-center text-2xl font-bold relative overflow-hidden shadow-lg border-2"
              style={{
                background: cell.revealed
                  ? cell.isPest ? "linear-gradient(135deg,#7f1d1d,#991b1b)" : "linear-gradient(135deg,#14532d,#16a34a)"
                  : "linear-gradient(135deg,#92400e,#78350f)",
                borderColor: cell.revealed ? (cell.isPest ? "#fca5a5" : "#4ade80") : "#d97706",
              }}>
              {cell.revealed ? (
                <motion.span initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300 }}>
                  {cell.symbol}
                </motion.span>
              ) : (
                <span className="text-amber-600 text-3xl font-black opacity-60">?</span>
              )}
              {cell.revealed && !cell.isPest && (
                <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-0.5 right-0.5 bg-amber-400 rounded-full text-[8px] font-black text-black px-1">
                  x{PRIZES[cell.symbol]}
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Result overlay */}
        <AnimatePresence>
          {gameOver && won !== null && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-center">
              {won ? (
                <>
                  <p className="text-4xl mb-1">🏆</p>
                  <p className="font-black text-2xl text-amber-400">RÉCOLTE !</p>
                  <p className="text-white font-bold">+{winAmount.toLocaleString("fr-FR")} FCFA</p>
                </>
              ) : (
                <>
                  <p className="text-4xl mb-1">🐛</p>
                  <p className="font-black text-xl text-red-400">RAVAGÉ !</p>
                  <p className="text-white/70">Les ravageurs ont détruit la récolte</p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="px-4 pb-8 pt-2 space-y-3">
        {/* Bet selection */}
        {!isPlaying && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {BET_OPTIONS.map(b => (
              <motion.button key={b} whileTap={{ scale: 0.92 }} onClick={() => setBet(b)}
                className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-black border-2 transition-all"
                style={{
                  background: bet === b ? "#f59e0b" : "rgba(0,0,0,0.3)",
                  borderColor: bet === b ? "#fbbf24" : "rgba(255,255,255,0.1)",
                  color: bet === b ? "#000" : "#fff",
                }}>
                {b.toLocaleString("fr-FR")} F
              </motion.button>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          {isPlaying && revealedCount > 0 && (
            <motion.button whileTap={{ scale: 0.96 }} onClick={cashOut}
              className="flex-1 h-14 rounded-2xl font-black text-base text-black shadow-lg"
              style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}>
              💰 Encaisser {winAmount.toLocaleString("fr-FR")} F
            </motion.button>
          )}
          <motion.button whileTap={{ scale: 0.96 }}
            onClick={isPlaying ? undefined : startGame}
            disabled={isPlaying && revealedCount === 0}
            className="flex-1 h-14 rounded-2xl font-black text-base text-white shadow-lg flex items-center justify-center gap-2"
            style={{ background: isPlaying ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg,#16a34a,#15803d)" }}>
            {gameOver ? <><RefreshCw size={18} /> Replanter</> : isPlaying ? "🌱 Choisissez..." : "🌱 Planter"}
          </motion.button>
        </div>

        {/* Legend */}
        <div className="flex gap-2 justify-center flex-wrap">
          {CROPS.map(c => (
            <div key={c} className="flex items-center gap-1 text-xs text-white/70">
              <span>{c}</span><span className="text-amber-400 font-bold">x{PRIZES[c]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
