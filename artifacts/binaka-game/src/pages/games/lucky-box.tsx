import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PRIZES = [
  { label: "x0", amount: 0, emoji: "💀", color: "#ef4444" },
  { label: "x0.5", amount: 0.5, emoji: "😐", color: "#f59e0b" },
  { label: "x1", amount: 1, emoji: "🙂", color: "#3b82f6" },
  { label: "x2", amount: 2, emoji: "😄", color: "#22c55e" },
  { label: "x5", amount: 5, emoji: "🤩", color: "#8b5cf6" },
  { label: "x10", amount: 10, emoji: "🤑", color: "#f59e0b" },
];

const BOX_COUNT = 6;

export default function LuckyBox() {
  const { toast } = useToast();
  const [bet, setBet] = useState(200);
  const [chosen, setChosen] = useState<number | null>(null);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [prizes, setPrizes] = useState<typeof PRIZES>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [myPrize, setMyPrize] = useState<typeof PRIZES[0] | null>(null);

  const startGame = () => {
    const shuffled = [...PRIZES].sort(() => Math.random() - 0.5);
    setPrizes(shuffled);
    setChosen(null);
    setRevealed([]);
    setIsPlaying(true);
    setGameOver(false);
    setMyPrize(null);
  };

  const pickBox = (i: number) => {
    if (chosen !== null || !isPlaying || gameOver) return;
    setChosen(i);
    const prize = prizes[i];
    setMyPrize(prize);

    // Reveal all others after delay
    setTimeout(() => {
      setRevealed(Array.from({ length: BOX_COUNT }, (_, j) => j));
      setGameOver(true);
      const won = prize.amount > 0;
      const winAmt = Math.floor(bet * prize.amount);
      if (won) {
        toast({ title: `${prize.emoji} Gagné! ${prize.label}`, description: `+${winAmt.toLocaleString("fr-FR")} FCFA`, className: "bg-green-600 text-white border-none" });
      } else {
        toast({ title: "💀 Perdu!", description: "Pas de chance cette fois.", variant: "destructive" });
      }
    }, 800);
  };

  return (
    <div className="flex flex-col min-h-full bg-gradient-to-b from-cyan-800 to-cyan-950 text-white w-full">
      <header className="sticky top-0 z-20 px-4 h-14 flex items-center gap-3 bg-black/20 backdrop-blur-sm">
        <Link href="/games">
          <motion.button whileTap={{ scale: 0.9 }} className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
            <ArrowLeft size={18} />
          </motion.button>
        </Link>
        <h1 className="font-black text-xl">💎 Lucky Box</h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 gap-6">

        {/* Titre / état */}
        <div className="text-center">
          {!isPlaying && <p className="text-white/70 text-sm font-bold">Définissez votre mise puis démarrez!</p>}
          {isPlaying && !gameOver && chosen === null && <p className="text-amber-300 font-black text-lg">Choisissez une boîte! 🎁</p>}
          {gameOver && myPrize && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <p className="text-3xl">{myPrize.emoji}</p>
              <p className="font-black text-2xl" style={{ color: myPrize.color }}>
                {myPrize.amount > 0 ? `+${Math.floor(bet * myPrize.amount).toLocaleString("fr-FR")} FCFA` : "Perdu 💀"}
              </p>
            </motion.div>
          )}
        </div>

        {/* Grille de boîtes */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
          {Array.from({ length: BOX_COUNT }).map((_, i) => {
            const isChosen = chosen === i;
            const isRevealed = revealed.includes(i);
            const prize = prizes[i];
            return (
              <motion.button
                key={i}
                whileTap={!isPlaying || chosen !== null ? {} : { scale: 0.9 }}
                onClick={() => pickBox(i)}
                disabled={!isPlaying || chosen !== null}
                className="aspect-square rounded-2xl flex flex-col items-center justify-center text-center shadow-lg border-2 transition-all"
                style={{
                  background: isRevealed && prize ? prize.color + "33" : isChosen ? "#f59e0b33" : "rgba(255,255,255,0.12)",
                  borderColor: isChosen ? "#f59e0b" : isRevealed && prize ? prize.color : "rgba(255,255,255,0.2)",
                }}
              >
                <AnimatePresence mode="wait">
                  {isRevealed && prize ? (
                    <motion.div key="prize" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                      <span className="text-3xl">{prize.emoji}</span>
                      <span className="text-[10px] font-black mt-1" style={{ color: prize.color }}>{prize.label}</span>
                    </motion.div>
                  ) : (
                    <motion.span key="box" className="text-4xl">📦</motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>

        {/* Mise + Bouton */}
        <div className="w-full max-w-sm bg-white/10 rounded-2xl p-4 border border-white/20">
          {!isPlaying || gameOver ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setBet(Math.max(200, bet - 100))}
                  className="w-10 h-10 rounded-xl bg-white/20 font-black text-xl">−</motion.button>
                <div className="text-center">
                  <p className="text-xs text-white/60 font-bold">Mise</p>
                  <span className="font-black text-2xl text-amber-400">{bet.toLocaleString("fr-FR")} FCFA</span>
                </div>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setBet(bet + 100)}
                  className="w-10 h-10 rounded-xl bg-white/20 font-black text-xl">+</motion.button>
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={startGame}
                className="w-full h-14 rounded-2xl font-black text-xl text-white shadow-lg border-b-4"
                style={{ background: "#16a34a", borderBottomColor: "#15803d" }}
              >
                {gameOver ? "🔄 REJOUER" : "💎 DÉMARRER"}
              </motion.button>
            </>
          ) : (
            <p className="text-center text-white/60 font-bold text-sm py-3">Choisissez une boîte pour jouer…</p>
          )}
        </div>
      </div>
    </div>
  );
}
