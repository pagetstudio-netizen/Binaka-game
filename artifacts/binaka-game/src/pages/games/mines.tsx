import { useState, useCallback } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Bomb, Diamond, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GRID = 25; // 5x5
const BET_OPTIONS = [100, 200, 500, 1000, 2000];
const MINE_OPTIONS = [3, 5, 8, 12, 15];

const MULTIPLIERS = [
  1.03, 1.08, 1.14, 1.21, 1.29, 1.39, 1.51, 1.65, 1.82, 2.02,
  2.27, 2.58, 2.97, 3.47, 4.12, 4.99, 6.19, 7.90, 10.5, 14.9,
  22.8, 39.3, 82.5, 247, 990,
];

type Cell = { isMine: boolean; revealed: boolean };

function generateGrid(mines: number): Cell[] {
  const cells: Cell[] = Array(GRID).fill(null).map(() => ({ isMine: false, revealed: false }));
  const positions = new Set<number>();
  while (positions.size < mines) positions.add(Math.floor(Math.random() * GRID));
  positions.forEach(i => { cells[i].isMine = true; });
  return cells;
}

export default function Mines() {
  const { toast } = useToast();
  const [bet, setBet] = useState(500);
  const [numMines, setNumMines] = useState(5);
  const [grid, setGrid] = useState<Cell[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [revealed, setRevealed] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState<boolean | null>(null);

  const currentMulti = MULTIPLIERS[Math.min(revealed, MULTIPLIERS.length - 1)] ?? 1;
  const winAmount = Math.floor(bet * currentMulti);
  const safeTiles = GRID - numMines;

  const startGame = () => {
    setGrid(generateGrid(numMines));
    setRevealed(0);
    setGameOver(false);
    setWon(null);
    setIsPlaying(true);
  };

  const revealCell = useCallback((idx: number) => {
    if (!isPlaying || gameOver || grid[idx]?.revealed) return;

    const newGrid = [...grid];
    newGrid[idx] = { ...newGrid[idx], revealed: true };
    setGrid(newGrid);

    if (newGrid[idx].isMine) {
      // Reveal all mines
      setGrid(g => g.map(c => c.isMine ? { ...c, revealed: true } : c));
      setGameOver(true);
      setWon(false);
      setIsPlaying(false);
      toast({ title: "💥 Mine !", description: `Vous perdez ${bet.toLocaleString("fr-FR")} FCFA`, variant: "destructive" });
    } else {
      const newRevealed = revealed + 1;
      setRevealed(newRevealed);
      if (newRevealed >= safeTiles) {
        setGameOver(true);
        setWon(true);
        setIsPlaying(false);
        const multi = MULTIPLIERS[Math.min(newRevealed - 1, MULTIPLIERS.length - 1)];
        const win = Math.floor(bet * multi);
        toast({ title: "💎 Parfait !", description: `+${win.toLocaleString("fr-FR")} FCFA`, className: "bg-green-600 text-white border-none" });
      }
    }
  }, [isPlaying, gameOver, grid, revealed, safeTiles, bet, toast]);

  const cashOut = () => {
    if (!isPlaying || revealed === 0) return;
    setGameOver(true);
    setWon(true);
    setIsPlaying(false);
    setGrid(g => g.map(c => ({ ...c, revealed: true })));
    toast({ title: "💰 Encaissé !", description: `+${winAmount.toLocaleString("fr-FR")} FCFA`, className: "bg-amber-500 text-white border-none" });
  };

  return (
    <div className="flex flex-col min-h-full w-full text-white"
      style={{ background: "linear-gradient(180deg,#0c0a1e 0%,#1e1040 50%,#0c0a1e 100%)" }}>

      <header className="sticky top-0 z-20 px-4 h-14 flex items-center gap-3 bg-black/40 backdrop-blur-sm">
        <Link href="/games">
          <motion.button whileTap={{ scale: 0.9 }} className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
            <ArrowLeft size={18} />
          </motion.button>
        </Link>
        <Bomb size={22} className="text-red-400" />
        <h1 className="font-black text-xl">Mines</h1>
        <div className="ml-auto bg-red-900/40 border border-red-500/30 rounded-xl px-3 py-1 text-xs font-black text-red-300">
          {numMines} 💣 cachés
        </div>
      </header>

      {/* Multiplier bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/30 gap-3">
        <div className="flex-1 bg-black/30 rounded-xl p-2.5 text-center">
          <p className="text-xs text-white/50">Multiplicateur</p>
          <p className="font-black text-lg text-amber-400">x{currentMulti.toFixed(2)}</p>
        </div>
        <div className="flex-1 bg-black/30 rounded-xl p-2.5 text-center">
          <p className="text-xs text-white/50">Gain potentiel</p>
          <p className="font-black text-lg text-green-300">{winAmount.toLocaleString("fr-FR")} F</p>
        </div>
        <div className="flex-1 bg-black/30 rounded-xl p-2.5 text-center">
          <p className="text-xs text-white/50">Diamants</p>
          <p className="font-black text-lg text-cyan-300">{revealed}/{safeTiles}</p>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 flex items-center justify-center px-4 py-4">
        {isPlaying || gameOver ? (
          <div className="w-full max-w-xs grid grid-cols-5 gap-2">
            {grid.map((cell, idx) => (
              <motion.button key={idx}
                whileTap={!cell.revealed && isPlaying ? { scale: 0.85 } : {}}
                onClick={() => revealCell(idx)}
                disabled={cell.revealed || !isPlaying}
                initial={{ scale: 0, rotateY: 180 }}
                animate={{ scale: 1, rotateY: cell.revealed ? 0 : 180 }}
                transition={{ delay: idx * 0.02, type: "spring", stiffness: 200 }}
                className="aspect-square rounded-xl flex items-center justify-center relative overflow-hidden border-2"
                style={{
                  background: cell.revealed
                    ? cell.isMine ? "linear-gradient(135deg,#7f1d1d,#991b1b)" : "linear-gradient(135deg,#064e3b,#065f46)"
                    : "linear-gradient(135deg,#1e1b4b,#312e81)",
                  borderColor: cell.revealed
                    ? cell.isMine ? "#ef4444" : "#34d399"
                    : "rgba(255,255,255,0.08)",
                  boxShadow: cell.revealed && !cell.isMine ? "0 0 12px rgba(52,211,153,0.3)" : "none",
                }}>
                {cell.revealed ? (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-xl">
                    {cell.isMine ? "💣" : "💎"}
                  </motion.span>
                ) : (
                  <div className="w-4 h-4 rounded-sm bg-white/10" />
                )}
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="text-center space-y-2">
            <p className="text-6xl">💣</p>
            <p className="text-white/60 font-bold">Configurer et lancer pour jouer</p>
          </div>
        )}
      </div>

      {/* Result */}
      <AnimatePresence>
        {gameOver && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 text-center">
            {won ? (
              <p className="text-green-400 font-black text-xl">💎 +{winAmount.toLocaleString("fr-FR")} FCFA</p>
            ) : (
              <p className="text-red-400 font-black text-xl">💥 Vous avez perdu !</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="px-4 pb-8 pt-3 space-y-3">
        {!isPlaying && (
          <>
            <div className="space-y-2">
              <p className="text-xs text-white/60 font-bold">Mise</p>
              <div className="flex gap-2 overflow-x-auto">
                {BET_OPTIONS.map(b => (
                  <motion.button key={b} whileTap={{ scale: 0.92 }} onClick={() => setBet(b)}
                    className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-black border-2"
                    style={{ background: bet === b ? "#f59e0b" : "rgba(255,255,255,0.06)", borderColor: bet === b ? "#fbbf24" : "rgba(255,255,255,0.1)", color: bet === b ? "#000" : "#fff" }}>
                    {b.toLocaleString("fr-FR")} F
                  </motion.button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-white/60 font-bold">Nombre de mines</p>
              <div className="flex gap-2">
                {MINE_OPTIONS.map(m => (
                  <motion.button key={m} whileTap={{ scale: 0.92 }} onClick={() => setNumMines(m)}
                    className="flex-1 py-2 rounded-xl text-xs font-black border-2"
                    style={{ background: numMines === m ? "#dc2626" : "rgba(255,255,255,0.06)", borderColor: numMines === m ? "#ef4444" : "rgba(255,255,255,0.1)" }}>
                    {m} 💣
                  </motion.button>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="flex gap-3">
          {isPlaying && revealed > 0 && (
            <motion.button whileTap={{ scale: 0.96 }} onClick={cashOut}
              className="flex-1 h-14 rounded-2xl font-black text-base text-black"
              style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}>
              💰 Encaisser {winAmount.toLocaleString("fr-FR")} F
            </motion.button>
          )}
          <motion.button whileTap={{ scale: 0.96 }} onClick={isPlaying ? undefined : startGame}
            disabled={isPlaying && revealed === 0}
            className="flex-1 h-14 rounded-2xl font-black text-white flex items-center justify-center gap-2"
            style={{ background: isPlaying ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
            {gameOver ? <><RefreshCw size={16} /> Rejouer</> : isPlaying ? <><Diamond size={16} /> Choisissez...</> : <><Diamond size={16} /> Jouer</>}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
