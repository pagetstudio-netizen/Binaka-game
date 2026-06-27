import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SYMBOLS = ["🍒", "🍋", "💎", "⭐", "7️⃣", "🔔"];
const COMBOS: Record<string, number> = {
  "7️⃣-7️⃣": 20,
  "💎-💎": 15,
  "⭐-⭐": 10,
  "🔔-🔔": 5,
  "🍒-🍒": 3,
  "🍋-🍋": 2,
};

type HistoryItem = { reels: string[]; bet: number; won: boolean; winAmount: number };

export default function MiniJackpot() {
  const { toast } = useToast();
  const [bet, setBet] = useState(100);
  const [reels, setReels] = useState(["🍒", "💎"]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWin, setLastWin] = useState<{ amount: number; key: string } | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const spin = async () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setLastWin(null);

    const interval = setInterval(() => {
      setReels([
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      ]);
    }, 80);

    setTimeout(() => {
      clearInterval(interval);
      const r0 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      const r1 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      setReels([r0, r1]);

      const comboKey = `${r0}-${r1}`;
      const mult = COMBOS[comboKey] ?? (r0 === r1 ? 2 : 0);
      const won = mult > 0;
      const winAmount = won ? bet * mult : 0;

      if (won) {
        setLastWin({ amount: winAmount, key: comboKey });
        toast({ title: "🎰 JACKPOT!", description: `+${winAmount.toLocaleString("fr-FR")} FCFA (x${mult})`, className: "bg-green-600 text-white border-none" });
      }
      setHistory((h) => [{ reels: [r0, r1], bet, won, winAmount }, ...h.slice(0, 9)]);
      setIsSpinning(false);
    }, 1800);
  };

  return (
    <div className="flex flex-col min-h-full bg-gradient-to-b from-indigo-800 to-indigo-950 text-white w-full">
      <header className="sticky top-0 z-20 px-4 h-14 flex items-center gap-3 bg-black/20 backdrop-blur-sm">
        <Link href="/games">
          <motion.button whileTap={{ scale: 0.9 }} className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
            <ArrowLeft size={18} />
          </motion.button>
        </Link>
        <h1 className="font-black text-xl">🎮 Mini Jackpot</h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 gap-6">

        {/* Gain */}
        <div className="h-16 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {lastWin && !isSpinning && (
              <motion.div key={lastWin.key} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="text-center">
                <p className="text-amber-300 font-black text-2xl">JACKPOT! 🎉</p>
                <p className="font-bold text-white text-lg">+{lastWin.amount.toLocaleString("fr-FR")} FCFA</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Machine 2 rouleaux */}
        <div className="bg-amber-600 p-2 rounded-3xl w-full max-w-xs shadow-2xl border-b-8 border-amber-700">
          <div className="bg-black/90 p-4 rounded-2xl flex justify-between gap-4 shadow-inner border-t-8 border-black">
            {reels.map((sym, i) => (
              <div key={i} className="bg-white/10 rounded-xl flex-1 aspect-square flex items-center justify-center overflow-hidden">
                <motion.span
                  animate={isSpinning ? { y: [0, -40, 40, 0] } : { y: 0 }}
                  transition={{ repeat: isSpinning ? Infinity : 0, duration: 0.15 }}
                  className="text-5xl"
                >
                  {sym}
                </motion.span>
              </div>
            ))}
          </div>
        </div>

        {/* Mise + Bouton */}
        <div className="w-full max-w-sm bg-white/10 rounded-2xl p-4 border border-white/20">
          <div className="flex items-center justify-between mb-3">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setBet(Math.max(100, bet - 100))}
              className="w-10 h-10 rounded-xl bg-white/20 font-black text-xl">−</motion.button>
            <div className="text-center">
              <p className="text-xs text-white/60 font-bold">Mise</p>
              <span className="font-black text-2xl text-amber-400">{bet.toLocaleString("fr-FR")} FCFA</span>
            </div>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setBet(bet + 100)}
              className="w-10 h-10 rounded-xl bg-white/20 font-black text-xl">+</motion.button>
          </div>
          <div className="flex gap-2 mb-3">
            {[100, 500, 1000, 5000].map((v) => (
              <motion.button key={v} whileTap={{ scale: 0.9 }} onClick={() => setBet(v)}
                className="flex-1 py-1.5 rounded-xl text-xs font-black"
                style={{ background: bet === v ? "#f59e0b" : "rgba(255,255,255,0.15)" }}>
                {v >= 1000 ? `${v / 1000}k` : v}
              </motion.button>
            ))}
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={spin}
            disabled={isSpinning}
            className="w-full h-14 rounded-2xl font-black text-xl text-white shadow-lg border-b-4 disabled:opacity-60"
            style={{ background: "#16a34a", borderBottomColor: "#15803d" }}
          >
            {isSpinning ? <Loader2 className="animate-spin mx-auto" /> : "🎰 TOURNER"}
          </motion.button>
        </div>

        {/* Historique */}
        {history.length > 0 && (
          <div className="w-full max-w-sm bg-white/5 rounded-2xl p-3 border border-white/10">
            <h3 className="font-bold mb-2 text-sm flex items-center gap-1"><History size={14} /> Historique</h3>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {history.map((h, i) => (
                <div key={i} className="flex items-center justify-between bg-black/20 p-2 rounded-xl text-sm">
                  <span className="tracking-widest">{h.reels.join(" ")}</span>
                  <span className={`font-bold ${h.won ? "text-green-400" : "text-red-400"}`}>
                    {h.won ? `+${h.winAmount}` : `-${h.bet}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
