import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LuckyNumber() {
  const { toast } = useToast();
  const [bet, setBet] = useState(100);
  const [pick, setPick] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [displayNum, setDisplayNum] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const [won, setWon] = useState<boolean | null>(null);
  const [winAmount, setWinAmount] = useState(0);

  const handlePlay = () => {
    if (!pick || isSpinning) return;
    setIsSpinning(true);
    setWon(null);

    let ticks = 0;
    const interval = setInterval(() => {
      setDisplayNum(Math.floor(Math.random() * 10) + 1);
      ticks++;
      if (ticks >= 25) {
        clearInterval(interval);
        const rolled = Math.floor(Math.random() * 10) + 1;
        setDisplayNum(rolled);
        setResult(rolled);
        const didWin = rolled === pick;
        setWon(didWin);
        if (didWin) {
          setWinAmount(bet * 9);
          toast({ title: "🎯 Lucky! Gagné!", description: `+${(bet * 9).toLocaleString("fr-FR")} FCFA`, className: "bg-green-600 text-white border-none" });
        } else {
          toast({ title: "😔 Perdu", description: `Le numéro était ${rolled}`, variant: "destructive" });
        }
        setIsSpinning(false);
      }
    }, 80);
  };

  return (
    <div className="flex flex-col min-h-full bg-gradient-to-b from-emerald-800 to-green-950 text-white w-full">
      <header className="sticky top-0 z-20 px-4 h-14 flex items-center gap-3 bg-black/20 backdrop-blur-sm">
        <Link href="/games">
          <motion.button whileTap={{ scale: 0.9 }} className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
            <ArrowLeft size={18} />
          </motion.button>
        </Link>
        <h1 className="font-black text-xl">🎯 Lucky Number</h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 gap-6">
        <div className="h-16 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {won !== null && !isSpinning && (
              <motion.div key={String(won)} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="text-center">
                {won ? (
                  <>
                    <p className="text-amber-300 font-black text-2xl">LUCKY! 🎉</p>
                    <p className="text-white font-bold text-lg">+{winAmount.toLocaleString("fr-FR")} FCFA</p>
                  </>
                ) : (
                  <p className="text-white/70 font-bold text-xl">C'était le {result}. Retry!</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          animate={isSpinning ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.1, repeat: isSpinning ? Infinity : 0 }}
          className="w-36 h-36 rounded-3xl border-4 border-amber-400 flex items-center justify-center shadow-2xl"
          style={{ background: "rgba(0,0,0,0.3)" }}
        >
          <span className="font-black text-7xl text-amber-300">{displayNum || "?"}</span>
        </motion.div>

        <div className="w-full max-w-sm">
          <p className="text-center text-white/80 text-sm font-bold mb-3">Choisissez un numéro (1–10)</p>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <motion.button key={n} whileTap={{ scale: 0.88 }} onClick={() => setPick(n)}
                className="aspect-square rounded-xl font-black text-2xl transition-all border-2"
                style={{ background: pick === n ? "#f59e0b" : "rgba(255,255,255,0.12)", borderColor: pick === n ? "#fbbf24" : "transparent" }}>
                {n}
              </motion.button>
            ))}
          </div>
          {pick && <p className="text-center text-amber-400 text-xs mt-2 font-bold">Sélectionné: {pick} • Gain si correct: x9</p>}
        </div>

        <div className="w-full max-w-sm bg-white/10 rounded-2xl p-4 border border-white/20">
          <div className="flex items-center justify-between mb-3">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setBet(Math.max(100, bet - 100))} className="w-10 h-10 rounded-xl bg-white/20 font-black text-xl">−</motion.button>
            <div className="text-center">
              <p className="text-xs text-white/60 font-bold">Mise</p>
              <span className="font-black text-2xl text-amber-400">{bet.toLocaleString("fr-FR")} FCFA</span>
            </div>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setBet(bet + 100)} className="w-10 h-10 rounded-xl bg-white/20 font-black text-xl">+</motion.button>
          </div>
          <motion.button whileTap={{ scale: 0.97 }} onClick={handlePlay} disabled={isSpinning || !pick}
            className="w-full h-14 rounded-2xl font-black text-xl text-white shadow-lg border-b-4 disabled:opacity-50"
            style={{ background: "#16a34a", borderBottomColor: "#15803d" }}>
            {isSpinning ? <Loader2 className="animate-spin mx-auto" /> : pick ? "🎯 TIRER AU SORT" : "Choisissez un numéro"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
