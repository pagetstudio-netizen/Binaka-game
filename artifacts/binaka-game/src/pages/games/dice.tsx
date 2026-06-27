import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export default function Dice() {
  const { toast } = useToast();
  const [bet, setBet] = useState(100);
  const [pick, setPick] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [displayFace, setDisplayFace] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const [won, setWon] = useState<boolean | null>(null);
  const [winAmount, setWinAmount] = useState(0);

  const handleRoll = () => {
    if (isRolling) return;
    setIsRolling(true);
    setWon(null);
    setResult(null);

    let ticks = 0;
    const interval = setInterval(() => {
      setDisplayFace(Math.floor(Math.random() * 6));
      ticks++;
      if (ticks >= 20) {
        clearInterval(interval);
        const rolled = Math.floor(Math.random() * 6) + 1;
        setDisplayFace(rolled - 1);
        setResult(rolled);
        const didWin = rolled === pick;
        setWon(didWin);
        if (didWin) {
          setWinAmount(bet * 5);
          toast({ title: "🎉 Gagné!", description: `+${(bet * 5).toLocaleString("fr-FR")} FCFA`, className: "bg-green-600 text-white border-none" });
        } else {
          toast({ title: "😔 Perdu", description: `Le dé affiche ${rolled}. Réessayez!`, variant: "destructive" });
        }
        setIsRolling(false);
      }
    }, 80);
  };

  return (
    <div className="flex flex-col min-h-full bg-gradient-to-b from-red-900 to-rose-950 text-white w-full">
      <header className="sticky top-0 z-20 px-4 h-14 flex items-center gap-3 bg-black/20 backdrop-blur-sm">
        <Link href="/games">
          <motion.button whileTap={{ scale: 0.9 }} className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
            <ArrowLeft size={18} />
          </motion.button>
        </Link>
        <h1 className="font-black text-xl">🎲 Dice</h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 gap-6">
        <div className="h-16 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {won !== null && !isRolling && (
              <motion.div key={String(won)} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="text-center">
                {won ? (
                  <>
                    <p className="text-amber-400 font-black text-2xl">GAGNÉ! 🎉</p>
                    <p className="text-white font-bold text-lg">+{winAmount.toLocaleString("fr-FR")} FCFA</p>
                  </>
                ) : (
                  <p className="text-white/70 font-bold text-xl">Le dé affiche {result} — Dommage!</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          animate={isRolling ? { rotate: [0, 15, -15, 10, -10, 0], scale: [1, 1.1, 0.9, 1.05, 1] } : {}}
          transition={{ duration: 0.08, repeat: isRolling ? Infinity : 0 }}
          className="w-36 h-36 bg-white rounded-3xl flex items-center justify-center shadow-2xl border-4 border-amber-400"
        >
          <span className="text-8xl select-none">{DICE_FACES[displayFace]}</span>
        </motion.div>

        <div className="w-full max-w-sm">
          <p className="text-center text-white/80 text-sm font-bold mb-3">Choisissez votre chiffre</p>
          <div className="grid grid-cols-6 gap-2">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <motion.button key={n} whileTap={{ scale: 0.88 }} onClick={() => setPick(n)}
                className="aspect-square rounded-xl font-black text-2xl transition-all border-2"
                style={{ background: pick === n ? "#f59e0b" : "rgba(255,255,255,0.15)", borderColor: pick === n ? "#fbbf24" : "transparent" }}>
                {n}
              </motion.button>
            ))}
          </div>
          <p className="text-center text-amber-400 text-xs mt-2 font-bold">Sélectionné: {pick} • Gain si correct: x5</p>
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
          <div className="flex gap-2 mb-3">
            {[100, 500, 1000, 5000].map((v) => (
              <motion.button key={v} whileTap={{ scale: 0.9 }} onClick={() => setBet(v)} className="flex-1 py-1.5 rounded-xl text-xs font-black" style={{ background: bet === v ? "#f59e0b" : "rgba(255,255,255,0.15)" }}>
                {v >= 1000 ? `${v / 1000}k` : v}
              </motion.button>
            ))}
          </div>
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleRoll} disabled={isRolling}
            className="w-full h-14 rounded-2xl font-black text-xl text-white shadow-lg border-b-4 disabled:opacity-60"
            style={{ background: "#16a34a", borderBottomColor: "#15803d" }}>
            {isRolling ? <Loader2 className="animate-spin mx-auto" /> : "🎲 LANCER LE DÉ"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
