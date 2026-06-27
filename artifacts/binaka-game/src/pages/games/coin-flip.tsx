import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CoinFlip() {
  const { toast } = useToast();
  const [bet, setBet] = useState(100);
  const [pick, setPick] = useState<"face" | "pile">("face");
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<"face" | "pile" | null>(null);
  const [won, setWon] = useState<boolean | null>(null);
  const [winAmount, setWinAmount] = useState(0);
  const [rotationY, setRotationY] = useState(0);

  const handleFlip = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setWon(null);
    const flips = 8 + Math.floor(Math.random() * 4);
    setRotationY((r) => r + flips * 180);

    setTimeout(() => {
      const landed: "face" | "pile" = Math.random() > 0.5 ? "face" : "pile";
      setResult(landed);
      const didWin = landed === pick;
      setWon(didWin);
      if (didWin) {
        const w = Math.floor(bet * 1.9);
        setWinAmount(w);
        toast({ title: "🎉 Gagné!", description: `+${w.toLocaleString("fr-FR")} FCFA`, className: "bg-green-600 text-white border-none" });
      } else {
        toast({ title: "😔 Perdu", description: `C'était ${landed === "face" ? "Face 😊" : "Pile 🏛"}!`, variant: "destructive" });
      }
      setIsFlipping(false);
    }, flips * 120 + 300);
  };

  return (
    <div className="flex flex-col min-h-full bg-gradient-to-b from-yellow-700 to-amber-900 text-white w-full">
      <header className="sticky top-0 z-20 px-4 h-14 flex items-center gap-3 bg-black/20 backdrop-blur-sm">
        <Link href="/games">
          <motion.button whileTap={{ scale: 0.9 }} className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
            <ArrowLeft size={18} />
          </motion.button>
        </Link>
        <h1 className="font-black text-xl">🪙 Coin Flip</h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 gap-6">
        <div className="h-16 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {won !== null && !isFlipping && (
              <motion.div key={String(won)} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="text-center">
                {won ? (
                  <>
                    <p className="text-amber-300 font-black text-2xl">GAGNÉ! 🎉</p>
                    <p className="text-white font-bold text-lg">+{winAmount.toLocaleString("fr-FR")} FCFA</p>
                  </>
                ) : (
                  <p className="text-white/70 font-bold text-xl">C'était {result === "face" ? "Face 😊" : "Pile 🏛"}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          animate={{ rotateY: rotationY }}
          transition={{ duration: isFlipping ? (8 * 0.12) : 0.6, ease: "easeOut" }}
          className="w-36 h-36 rounded-full shadow-2xl flex items-center justify-center border-4 border-amber-300"
          style={{ background: "radial-gradient(circle at 35% 35%, #fde68a, #d97706)" }}
        >
          <span className="text-7xl select-none">{result === "pile" ? "🏛" : "😊"}</span>
        </motion.div>

        <div className="flex gap-4 w-full max-w-xs">
          {(["face", "pile"] as const).map((side) => (
            <motion.button key={side} whileTap={{ scale: 0.94 }} onClick={() => setPick(side)}
              className="flex-1 py-4 rounded-2xl font-black text-lg transition-all border-2"
              style={{ background: pick === side ? "#f59e0b" : "rgba(255,255,255,0.15)", borderColor: pick === side ? "#fbbf24" : "transparent" }}>
              {side === "face" ? "😊 Face" : "🏛 Pile"}
            </motion.button>
          ))}
        </div>
        <p className="text-amber-300 text-xs font-bold">Gain si correct: x1.9 la mise</p>

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
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleFlip} disabled={isFlipping}
            className="w-full h-14 rounded-2xl font-black text-xl text-white shadow-lg border-b-4 disabled:opacity-60"
            style={{ background: "#16a34a", borderBottomColor: "#15803d" }}>
            {isFlipping ? <Loader2 className="animate-spin mx-auto" /> : "🪙 LANCER LA PIÈCE"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
