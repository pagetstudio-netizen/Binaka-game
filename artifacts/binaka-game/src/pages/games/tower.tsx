import { useState, useCallback } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LEVELS = 8;
const COLS = 3;
const BET_OPTIONS = [100, 200, 500, 1000, 2000];
const DIFFICULTY = [
  { label: "Facile", bombs: 1 },
  { label: "Moyen", bombs: 2 },
  { label: "Difficile", bombs: 3 },
];
const MULTIPLIERS_PER_LEVEL = [1.3, 1.8, 2.5, 3.5, 5.2, 8.0, 13.5, 22.0, 40.0];

type TileState = "hidden" | "safe" | "bomb" | "active";
type LevelRow = { tiles: TileState[]; bombIdx: Set<number> };

function generateTower(bombsPerRow: number): LevelRow[] {
  return Array.from({ length: LEVELS }, () => {
    const bombIdx = new Set<number>();
    while (bombIdx.size < bombsPerRow) bombIdx.add(Math.floor(Math.random() * COLS));
    return { tiles: Array(COLS).fill("hidden") as TileState[], bombIdx };
  }).reverse();
}

export default function Tower() {
  const { toast } = useToast();
  const [bet, setBet] = useState(200);
  const [diffIdx, setDiffIdx] = useState(0);
  const [tower, setTower] = useState<LevelRow[]>([]);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState<boolean | null>(null);

  const diff = DIFFICULTY[diffIdx];
  const multi = MULTIPLIERS_PER_LEVEL[Math.min(currentLevel, MULTIPLIERS_PER_LEVEL.length - 1)];
  const winAmount = Math.floor(bet * multi);

  const startGame = () => {
    setTower(generateTower(diff.bombs));
    setCurrentLevel(0);
    setIsPlaying(true);
    setGameOver(false);
    setWon(null);
  };

  const selectTile = useCallback((rowIdx: number, tileIdx: number) => {
    if (!isPlaying || gameOver) return;
    const activeLevelRow = LEVELS - 1 - currentLevel;
    if (rowIdx !== activeLevelRow) return;

    const newTower = tower.map((row, ri) => ({ ...row, tiles: [...row.tiles] }));
    const row = newTower[rowIdx];

    if (row.bombIdx.has(tileIdx)) {
      // Hit a bomb — reveal all
      row.tiles[tileIdx] = "bomb";
      newTower.forEach((r, ri) => {
        if (ri === rowIdx) return;
        r.tiles = r.tiles.map((_, ti) => r.bombIdx.has(ti) ? "bomb" : "hidden");
      });
      setTower(newTower);
      setGameOver(true);
      setWon(false);
      setIsPlaying(false);
      toast({ title: "💥 Boom !", description: `Vous perdez ${bet.toLocaleString("fr-FR")} FCFA`, variant: "destructive" });
    } else {
      row.tiles[tileIdx] = "safe";
      // Reveal bombs in current row
      row.tiles = row.tiles.map((t, ti) => row.bombIdx.has(ti) ? "bomb" : t === "safe" ? "safe" : "hidden");
      setTower(newTower);

      const newLevel = currentLevel + 1;
      if (newLevel >= LEVELS) {
        setCurrentLevel(newLevel);
        setGameOver(true);
        setWon(true);
        setIsPlaying(false);
        const finalWin = Math.floor(bet * MULTIPLIERS_PER_LEVEL[LEVELS - 1]);
        toast({ title: "🏆 Sommet !", description: `+${finalWin.toLocaleString("fr-FR")} FCFA`, className: "bg-amber-500 text-white border-none" });
      } else {
        setCurrentLevel(newLevel);
      }
    }
  }, [isPlaying, gameOver, tower, currentLevel, bet, diff, toast]);

  const cashOut = () => {
    if (!isPlaying || currentLevel === 0) return;
    setGameOver(true);
    setWon(true);
    setIsPlaying(false);
    toast({ title: "💰 Encaissé !", description: `+${winAmount.toLocaleString("fr-FR")} FCFA`, className: "bg-amber-500 text-white border-none" });
  };

  const activeLevelRow = LEVELS - 1 - currentLevel;

  return (
    <div className="flex flex-col min-h-full w-full text-white"
      style={{ background: "linear-gradient(180deg,#1a0a2e 0%,#2d1a52 50%,#1a0a2e 100%)" }}>

      <header className="sticky top-0 z-20 px-4 h-14 flex items-center gap-3 bg-black/40 backdrop-blur-sm">
        <Link href="/games">
          <motion.button whileTap={{ scale: 0.9 }} className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
            <ArrowLeft size={18} />
          </motion.button>
        </Link>
        <span className="text-2xl">🗼</span>
        <h1 className="font-black text-xl">Tower</h1>
        <div className="ml-auto bg-purple-900/40 border border-purple-500/30 rounded-xl px-3 py-1 text-xs font-black text-purple-300">
          Étage {currentLevel}/{LEVELS}
        </div>
      </header>

      {/* Stats */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/30 gap-3">
        <div className="flex-1 bg-black/30 rounded-xl p-2.5 text-center">
          <p className="text-xs text-white/50">Multiplicateur</p>
          <p className="font-black text-lg text-amber-400">x{multi.toFixed(1)}</p>
        </div>
        <div className="flex-1 bg-black/30 rounded-xl p-2.5 text-center">
          <p className="text-xs text-white/50">Gain potentiel</p>
          <p className="font-black text-lg text-green-300">{winAmount.toLocaleString("fr-FR")} F</p>
        </div>
        <div className="flex-1 bg-black/30 rounded-xl p-2.5 text-center">
          <p className="text-xs text-white/50">Bombes/étage</p>
          <p className="font-black text-lg text-red-400">{diff.bombs} 💣</p>
        </div>
      </div>

      {/* Tower */}
      <div className="flex-1 flex flex-col-reverse items-center justify-start px-6 py-4 gap-2 overflow-y-auto">
        {isPlaying || gameOver ? tower.map((row, rowIdx) => {
          const isActive = rowIdx === activeLevelRow && isPlaying;
          const isPassed = rowIdx > activeLevelRow;
          const level = LEVELS - 1 - rowIdx;
          return (
            <div key={rowIdx} className="w-full max-w-xs flex items-center gap-2">
              <div className="text-xs font-black text-white/40 w-5 text-right">{level + 1}</div>
              <div className="flex-1 flex gap-2">
                {row.tiles.map((tile, tileIdx) => (
                  <motion.button key={tileIdx} whileTap={isActive ? { scale: 0.88 } : {}}
                    onClick={() => selectTile(rowIdx, tileIdx)}
                    disabled={!isActive || tile !== "hidden"}
                    className="flex-1 h-12 rounded-xl flex items-center justify-center text-xl border-2 transition-all"
                    style={{
                      background: tile === "safe" ? "linear-gradient(135deg,#065f46,#047857)" :
                        tile === "bomb" ? "linear-gradient(135deg,#7f1d1d,#991b1b)" :
                        isPassed ? "rgba(255,255,255,0.03)" :
                        isActive ? "linear-gradient(135deg,#312e81,#4338ca)" :
                        "rgba(255,255,255,0.05)",
                      borderColor: tile === "safe" ? "#34d399" :
                        tile === "bomb" ? "#ef4444" :
                        isActive ? "#818cf8" : "rgba(255,255,255,0.05)",
                      boxShadow: isActive ? "0 0 20px rgba(99,102,241,0.4)" : "none",
                    }}>
                    {tile === "safe" ? "⭐" : tile === "bomb" ? "💣" : isActive ? "?" : ""}
                  </motion.button>
                ))}
              </div>
              <div className="text-xs font-black text-amber-400 w-10 text-left">
                x{MULTIPLIERS_PER_LEVEL[level].toFixed(1)}
              </div>
            </div>
          );
        }) : (
          <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center">
            <span className="text-7xl">🗼</span>
            <p className="text-white/60 font-bold">Montez jusqu'au sommet sans tomber sur une bombe !</p>
          </div>
        )}

        {/* Result */}
        <AnimatePresence>
          {gameOver && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-2">
              {won ? <p className="font-black text-2xl text-amber-400">🏆 +{winAmount.toLocaleString("fr-FR")} FCFA</p>
                : <p className="font-black text-xl text-red-400">💥 Boom ! Recommencez</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="px-4 pb-8 pt-3 space-y-3 bg-black/30">
        {!isPlaying && (
          <>
            <div className="flex gap-2 overflow-x-auto">
              {BET_OPTIONS.map(b => (
                <motion.button key={b} whileTap={{ scale: 0.92 }} onClick={() => setBet(b)}
                  className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-black border-2"
                  style={{ background: bet === b ? "#f59e0b" : "rgba(255,255,255,0.06)", borderColor: bet === b ? "#fbbf24" : "rgba(255,255,255,0.1)", color: bet === b ? "#000" : "#fff" }}>
                  {b.toLocaleString("fr-FR")} F
                </motion.button>
              ))}
            </div>
            <div className="flex gap-2">
              {DIFFICULTY.map((d, i) => (
                <motion.button key={d.label} whileTap={{ scale: 0.92 }} onClick={() => setDiffIdx(i)}
                  className="flex-1 py-2 rounded-xl text-xs font-black border-2"
                  style={{ background: diffIdx === i ? "#9333ea" : "rgba(255,255,255,0.06)", borderColor: diffIdx === i ? "#c084fc" : "rgba(255,255,255,0.1)" }}>
                  {d.label}
                </motion.button>
              ))}
            </div>
          </>
        )}

        <div className="flex gap-3">
          {isPlaying && currentLevel > 0 && (
            <motion.button whileTap={{ scale: 0.96 }} onClick={cashOut}
              className="flex-1 h-14 rounded-2xl font-black text-base text-black"
              style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}>
              💰 {winAmount.toLocaleString("fr-FR")} F
            </motion.button>
          )}
          {!isPlaying && (
            <motion.button whileTap={{ scale: 0.96 }} onClick={startGame}
              className="flex-1 h-14 rounded-2xl font-black text-white flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg,#9333ea,#7c3aed)" }}>
              {gameOver ? <><RefreshCw size={16} /> Rejouer</> : "🗼 Grimper"}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
