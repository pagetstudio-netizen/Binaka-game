import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowUp, ArrowDown, Minus, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const RANK_VALUES: Record<string, number> = {
  A: 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8,
  "9": 9, "10": 10, J: 11, Q: 12, K: 13,
};

type Card = { rank: string; suit: string; value: number };
type Guess = "higher" | "lower" | "equal";

function randomCard(): Card {
  const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
  const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
  return { rank, suit, value: RANK_VALUES[rank] };
}

const isRed = (suit: string) => suit === "♥" || suit === "♦";

const BET_OPTIONS = [100, 200, 500, 1000, 2000];

export default function HiLo() {
  const { toast } = useToast();
  const [bet, setBet] = useState(200);
  const [currentCard, setCurrentCard] = useState<Card>(randomCard());
  const [nextCard, setNextCard] = useState<Card | null>(null);
  const [streak, setStreak] = useState(0);
  const [multiplier, setMultiplier] = useState(1.0);
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState<"win" | "loss" | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastGuess, setLastGuess] = useState<Guess | null>(null);
  const [showNext, setShowNext] = useState(false);

  const startGame = () => {
    setCurrentCard(randomCard());
    setNextCard(null);
    setStreak(0);
    setMultiplier(1.0);
    setGameOver(false);
    setResult(null);
    setIsPlaying(true);
    setShowNext(false);
    setLastGuess(null);
  };

  const guess = (g: Guess) => {
    if (!isPlaying || gameOver || showNext) return;

    const next = randomCard();
    setNextCard(next);
    setLastGuess(g);
    setShowNext(true);

    let correct = false;
    if (g === "higher") correct = next.value > currentCard.value;
    else if (g === "lower") correct = next.value < currentCard.value;
    else correct = next.value === currentCard.value;

    setTimeout(() => {
      if (correct) {
        const bonus = g === "equal" ? 3.5 : 1.4;
        const newMulti = parseFloat((multiplier * bonus).toFixed(2));
        const newStreak = streak + 1;
        setMultiplier(newMulti);
        setStreak(newStreak);
        setCurrentCard(next);
        setNextCard(null);
        setShowNext(false);
        setLastGuess(null);
        toast({ title: `✅ ${g === "equal" ? "Égalité !" : g === "higher" ? "Plus haut !" : "Plus bas !"}`, description: `Série: ${newStreak} — x${newMulti}`, className: "bg-green-600 text-white border-none" });
      } else {
        setGameOver(true);
        setResult("loss");
        setIsPlaying(false);
        toast({ title: "❌ Mauvaise prédiction", description: `Vous perdez ${bet.toLocaleString("fr-FR")} FCFA`, variant: "destructive" });
      }
    }, 1000);
  };

  const cashOut = () => {
    if (!isPlaying || streak === 0) return;
    const win = Math.floor(bet * multiplier);
    setGameOver(true);
    setResult("win");
    setIsPlaying(false);
    toast({ title: "💰 Encaissé !", description: `+${win.toLocaleString("fr-FR")} FCFA`, className: "bg-amber-500 text-white border-none" });
  };

  const winAmount = Math.floor(bet * multiplier);

  function CardDisplay({ card, label, dim }: { card: Card; label?: string; dim?: boolean }) {
    return (
      <div className="flex flex-col items-center gap-1">
        {label && <p className="text-xs text-white/50 font-bold">{label}</p>}
        <motion.div initial={{ rotateY: 90, scale: 0.8 }} animate={{ rotateY: 0, scale: 1 }}
          className="w-24 h-36 rounded-2xl flex items-center justify-center flex-col border-2 shadow-2xl relative"
          style={{
            background: dim ? "rgba(255,255,255,0.04)" : "white",
            borderColor: dim ? "rgba(255,255,255,0.1)" : isRed(card.suit) ? "#ef4444" : "#1e293b",
            opacity: dim ? 0.4 : 1,
          }}>
          <p className="font-black text-4xl" style={{ color: isRed(card.suit) ? "#ef4444" : "#1e293b" }}>
            {card.rank}
          </p>
          <p className="text-3xl">{card.suit}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full w-full text-white"
      style={{ background: "linear-gradient(180deg,#0f1729 0%,#1a2744 50%,#0f1729 100%)" }}>

      <header className="sticky top-0 z-20 px-4 h-14 flex items-center gap-3 bg-black/40 backdrop-blur-sm">
        <Link href="/games">
          <motion.button whileTap={{ scale: 0.9 }} className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
            <ArrowLeft size={18} />
          </motion.button>
        </Link>
        <span className="text-2xl">🃏</span>
        <h1 className="font-black text-xl">Hi-Lo</h1>
        <div className="ml-auto flex gap-3">
          <div className="text-center">
            <p className="text-xs text-white/50">Série</p>
            <p className="font-black text-amber-400">{streak}🔥</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-white/50">Multiplicateur</p>
            <p className="font-black text-green-400">x{multiplier.toFixed(2)}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">

        {/* Cards area */}
        <div className="flex items-center justify-center gap-8 relative">
          <CardDisplay card={currentCard} label="Carte actuelle" />

          <div className="flex flex-col items-center gap-2">
            <AnimatePresence>
              {lastGuess && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: lastGuess === "higher" ? "#16a34a" : lastGuess === "lower" ? "#dc2626" : "#f59e0b" }}>
                  {lastGuess === "higher" ? <ArrowUp size={20} /> : lastGuess === "lower" ? <ArrowDown size={20} /> : <Minus size={20} />}
                </motion.div>
              )}
            </AnimatePresence>
            {!lastGuess && <div className="text-3xl">❓</div>}
          </div>

          {showNext && nextCard ? (
            <CardDisplay card={nextCard} label="Prochaine" />
          ) : (
            <div className="flex flex-col items-center gap-1">
              <p className="text-xs text-white/50 font-bold">Prochaine</p>
              <div className="w-24 h-36 rounded-2xl border-2 border-dashed border-white/20 flex items-center justify-center">
                <span className="text-4xl">🂠</span>
              </div>
            </div>
          )}
        </div>

        {/* Result */}
        <AnimatePresence>
          {gameOver && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              {result === "win" ? (
                <p className="font-black text-2xl text-green-400">+{winAmount.toLocaleString("fr-FR")} FCFA 🎉</p>
              ) : (
                <p className="font-black text-xl text-red-400">Mauvaise prédiction 😔</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Guess buttons */}
        {isPlaying && !showNext && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 w-full max-w-xs">
            <motion.button whileTap={{ scale: 0.92 }} onClick={() => guess("lower")}
              className="flex-1 py-4 rounded-2xl font-black text-sm flex flex-col items-center gap-1 border-2"
              style={{ background: "linear-gradient(135deg,#dc2626,#b91c1c)", borderColor: "#ef4444" }}>
              <ArrowDown size={24} />
              Plus bas
            </motion.button>
            <motion.button whileTap={{ scale: 0.92 }} onClick={() => guess("equal")}
              className="flex-1 py-4 rounded-2xl font-black text-sm flex flex-col items-center gap-1 border-2"
              style={{ background: "linear-gradient(135deg,#d97706,#b45309)", borderColor: "#f59e0b" }}>
              <Minus size={24} />
              Égal x3.5
            </motion.button>
            <motion.button whileTap={{ scale: 0.92 }} onClick={() => guess("higher")}
              className="flex-1 py-4 rounded-2xl font-black text-sm flex flex-col items-center gap-1 border-2"
              style={{ background: "linear-gradient(135deg,#16a34a,#15803d)", borderColor: "#22c55e" }}>
              <ArrowUp size={24} />
              Plus haut
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="px-4 pb-8 pt-3 space-y-3">
        {!isPlaying && (
          <div className="flex gap-2 overflow-x-auto">
            {BET_OPTIONS.map(b => (
              <motion.button key={b} whileTap={{ scale: 0.92 }} onClick={() => setBet(b)}
                className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-black border-2"
                style={{ background: bet === b ? "#f59e0b" : "rgba(255,255,255,0.06)", borderColor: bet === b ? "#fbbf24" : "rgba(255,255,255,0.1)", color: bet === b ? "#000" : "#fff" }}>
                {b.toLocaleString("fr-FR")} F
              </motion.button>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          {isPlaying && streak > 0 && !showNext && (
            <motion.button whileTap={{ scale: 0.96 }} onClick={cashOut}
              className="flex-1 h-14 rounded-2xl font-black text-base text-black"
              style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}>
              💰 {winAmount.toLocaleString("fr-FR")} F
            </motion.button>
          )}
          {!isPlaying && (
            <motion.button whileTap={{ scale: 0.96 }} onClick={startGame}
              className="flex-1 h-14 rounded-2xl font-black text-white flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg,#1d4ed8,#1e40af)" }}>
              {gameOver ? <><RefreshCw size={16} /> Rejouer</> : "🃏 Commencer"}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
