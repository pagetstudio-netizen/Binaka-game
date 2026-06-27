import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GIFTS = [
  { emoji: "💎", label: "Diamant", multiplier: 20, color: "#06b6d4", rare: true },
  { emoji: "🥇", label: "Or", multiplier: 10, color: "#f59e0b", rare: true },
  { emoji: "🥈", label: "Argent", multiplier: 5, color: "#94a3b8", rare: false },
  { emoji: "🥉", label: "Bronze", multiplier: 2, color: "#b45309", rare: false },
  { emoji: "🎟", label: "Ticket", multiplier: 1, color: "#22c55e", rare: false },
  { emoji: "💀", label: "Perdu", multiplier: 0, color: "#ef4444", rare: false },
  { emoji: "💀", label: "Perdu", multiplier: 0, color: "#ef4444", rare: false },
  { emoji: "💀", label: "Perdu", multiplier: 0, color: "#ef4444", rare: false },
];

export default function MysteryGift() {
  const { toast } = useToast();
  const [bet, setBet] = useState(300);
  const [isOpening, setIsOpening] = useState(false);
  const [gift, setGift] = useState<typeof GIFTS[0] | null>(null);
  const [shake, setShake] = useState(false);

  const openGift = () => {
    if (isOpening) return;
    setIsOpening(true);
    setGift(null);
    setShake(true);

    setTimeout(() => setShake(false), 1000);

    setTimeout(() => {
      const weights = GIFTS.map((g, i) => (g.rare ? 1 : 3));
      const total = weights.reduce((a, b) => a + b, 0);
      let rand = Math.random() * total;
      let selectedIndex = 0;
      for (let i = 0; i < weights.length; i++) {
        rand -= weights[i];
        if (rand <= 0) { selectedIndex = i; break; }
      }
      const selected = GIFTS[selectedIndex];
      setGift(selected);
      setIsOpening(false);
      const winAmt = Math.floor(bet * selected.multiplier);
      if (selected.multiplier > 0) {
        toast({ title: `${selected.emoji} ${selected.label}!`, description: `+${winAmt.toLocaleString("fr-FR")} FCFA (x${selected.multiplier})`, className: "bg-green-600 text-white border-none" });
      } else {
        toast({ title: "💀 Perdu!", description: "Dommage, réessayez!", variant: "destructive" });
      }
    }, 1800);
  };

  return (
    <div className="flex flex-col min-h-full bg-gradient-to-b from-pink-700 to-pink-950 text-white w-full">
      <header className="sticky top-0 z-20 px-4 h-14 flex items-center gap-3 bg-black/20 backdrop-blur-sm">
        <Link href="/games">
          <motion.button whileTap={{ scale: 0.9 }} className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
            <ArrowLeft size={18} />
          </motion.button>
        </Link>
        <h1 className="font-black text-xl">🎁 Mystery Gift</h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 gap-6">

        {/* Résultat */}
        <div className="h-20 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {gift && !isOpening && (
              <motion.div key={gift.label} initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} className="text-center">
                <span className="text-6xl">{gift.emoji}</span>
                <p className="font-black text-xl mt-1" style={{ color: gift.color }}>{gift.label}</p>
                <p className="font-bold text-white/80 text-sm">
                  {gift.multiplier > 0 ? `+${Math.floor(bet * gift.multiplier).toLocaleString("fr-FR")} FCFA` : "Pas de gain"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Cadeau animé */}
        <motion.div
          animate={shake ? { rotate: [-5, 5, -8, 8, -5, 5, 0], scale: [1, 1.05, 1, 1.08, 1] } : {}}
          transition={{ duration: 0.15, repeat: shake ? Infinity : 0 }}
          className="w-44 h-44 rounded-3xl flex items-center justify-center shadow-2xl border-4 border-pink-300 cursor-pointer"
          style={{ background: "rgba(0,0,0,0.25)" }}
          onClick={!isOpening ? openGift : undefined}
        >
          <AnimatePresence mode="wait">
            {isOpening ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Loader2 size={60} className="animate-spin text-pink-300" />
              </motion.div>
            ) : gift ? (
              <motion.span key="gift" initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-8xl">{gift.emoji}</motion.span>
            ) : (
              <motion.span key="box" className="text-8xl select-none">🎁</motion.span>
            )}
          </AnimatePresence>
        </motion.div>
        <p className="text-pink-200 text-xs font-bold">{isOpening ? "Ouverture en cours…" : "Appuyez sur le cadeau ou le bouton pour ouvrir!"}</p>

        {/* Tableau des prizes */}
        <div className="w-full max-w-sm grid grid-cols-4 gap-2">
          {[...new Map(GIFTS.map(g => [g.label, g])).values()].map((g) => (
            <div key={g.label} className="flex flex-col items-center bg-white/10 rounded-xl py-2 px-1">
              <span className="text-xl">{g.emoji}</span>
              <span className="text-[9px] font-bold text-white/70">{g.label}</span>
              <span className="text-[9px] font-black" style={{ color: g.color }}>x{g.multiplier}</span>
            </div>
          ))}
        </div>

        {/* Mise + Bouton */}
        <div className="w-full max-w-sm bg-white/10 rounded-2xl p-4 border border-white/20">
          <div className="flex items-center justify-between mb-3">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setBet(Math.max(300, bet - 100))}
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
            onClick={openGift}
            disabled={isOpening}
            className="w-full h-14 rounded-2xl font-black text-xl text-white shadow-lg border-b-4 disabled:opacity-60"
            style={{ background: "#16a34a", borderBottomColor: "#15803d" }}
          >
            {isOpening ? <Loader2 className="animate-spin mx-auto" /> : "🎁 OUVRIR LE CADEAU"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
