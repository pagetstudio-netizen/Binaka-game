import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, TrendingUp, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BET_OPTIONS = [100, 200, 500, 1000, 2000, 5000];

type Phase = "waiting" | "flying" | "crashed" | "cashedout";

const HISTORY = [1.24, 3.57, 1.01, 8.42, 1.88, 2.31, 15.7, 1.03, 4.56, 1.12, 6.88, 2.02];

function getCrashPoint(): number {
  const r = Math.random();
  if (r < 0.35) return 1.0 + Math.random() * 0.3;
  if (r < 0.60) return 1.3 + Math.random() * 1.2;
  if (r < 0.80) return 2.5 + Math.random() * 3.5;
  if (r < 0.93) return 6.0 + Math.random() * 10;
  return 16 + Math.random() * 30;
}

export default function Crash() {
  const { toast } = useToast();
  const [bet, setBet] = useState(500);
  const [phase, setPhase] = useState<Phase>("waiting");
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashAt, setCrashAt] = useState(0);
  const [cashedAt, setCashedAt] = useState<number | null>(null);
  const [history, setHistory] = useState(HISTORY);
  const [autoCashout, setAutoCashout] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const crashRef = useRef(0);

  const startGame = useCallback(() => {
    const crash = getCrashPoint();
    crashRef.current = crash;
    setCrashAt(crash);
    setMultiplier(1.0);
    setCashedAt(null);
    setPhase("flying");
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const current = 1 + elapsed * 0.5 + elapsed * elapsed * 0.2;

      if (current >= crashRef.current) {
        clearInterval(intervalRef.current!);
        setMultiplier(crashRef.current);
        setPhase("crashed");
        setHistory(h => [crashRef.current, ...h].slice(0, 12));
        toast({ title: "💥 CRASH !", description: `Crash à x${crashRef.current.toFixed(2)}`, variant: "destructive" });
      } else {
        setMultiplier(parseFloat(current.toFixed(2)));
        // Auto cashout check
        if (autoCashout && current >= autoCashout) {
          clearInterval(intervalRef.current!);
          setCashedAt(autoCashout);
          setPhase("cashedout");
          const win = Math.floor(bet * autoCashout);
          toast({ title: "🚀 Auto-Encaissé!", description: `+${win.toLocaleString("fr-FR")} FCFA à x${autoCashout.toFixed(2)}`, className: "bg-green-600 text-white border-none" });
        }
      }
    }, 100);
  }, [autoCashout, bet, toast]);

  const cashOut = () => {
    if (phase !== "flying") return;
    clearInterval(intervalRef.current!);
    setCashedAt(multiplier);
    setPhase("cashedout");
    setHistory(h => [multiplier, ...h].slice(0, 12));
    const win = Math.floor(bet * multiplier);
    toast({ title: "💰 Encaissé !", description: `+${win.toLocaleString("fr-FR")} FCFA`, className: "bg-amber-500 text-white border-none" });
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const getMultColor = () => {
    if (multiplier < 1.5) return "#f87171";
    if (multiplier < 3) return "#fbbf24";
    return "#4ade80";
  };

  const winAmount = cashedAt ? Math.floor(bet * cashedAt) : Math.floor(bet * multiplier);

  return (
    <div className="flex flex-col min-h-full w-full text-white"
      style={{ background: "linear-gradient(180deg,#0f0f1a 0%,#1a0a2e 50%,#0a0a1a 100%)" }}>

      <header className="sticky top-0 z-20 px-4 h-14 flex items-center gap-3 bg-black/40 backdrop-blur-sm">
        <Link href="/games">
          <motion.button whileTap={{ scale: 0.9 }} className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
            <ArrowLeft size={18} />
          </motion.button>
        </Link>
        <span className="text-2xl">🚀</span>
        <h1 className="font-black text-xl">Crash</h1>
        <div className="ml-auto flex gap-1 overflow-x-auto max-w-[200px]">
          {history.slice(0, 8).map((h, i) => (
            <span key={i} className="flex-shrink-0 text-[10px] font-black px-1.5 py-0.5 rounded-md"
              style={{ background: h >= 2 ? "#16a34a33" : "#dc262633", color: h >= 2 ? "#4ade80" : "#f87171" }}>
              {h.toFixed(2)}x
            </span>
          ))}
        </div>
      </header>

      {/* Main display */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative">
        {/* Stars background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div key={i} className="absolute w-1 h-1 bg-white rounded-full"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, opacity: Math.random() * 0.6 + 0.2 }}
              animate={{ opacity: [0.2, 0.8, 0.2] }} transition={{ duration: 1 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }} />
          ))}
        </div>

        {/* Rocket */}
        <motion.div
          animate={phase === "flying" ? { y: [-5, 5, -5], x: [-2, 2, -2] } : phase === "crashed" ? { rotate: [0, 45, 90], y: 60, opacity: 0 } : {}}
          transition={phase === "flying" ? { duration: 0.8, repeat: Infinity } : { duration: 0.6 }}
          className="text-7xl mb-4 relative z-10">
          {phase === "crashed" ? "💥" : "🚀"}
        </motion.div>

        {/* Multiplier */}
        <motion.div key={phase}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="text-center relative z-10">
          <motion.p className="font-black leading-none"
            style={{ fontSize: "72px", color: phase === "crashed" ? "#ef4444" : getMultColor() }}>
            x{multiplier.toFixed(2)}
          </motion.p>
          <p className="text-white/50 text-sm font-bold mt-1">
            {phase === "waiting" && "En attente..."}
            {phase === "flying" && "🔥 En vol — Encaissez !"}
            {phase === "crashed" && "💥 CRASH !"}
            {phase === "cashedout" && `✅ Encaissé à x${cashedAt?.toFixed(2)}`}
          </p>
        </motion.div>

        {/* Win display */}
        <AnimatePresence>
          {phase === "cashedout" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-green-600/30 border border-green-500/40 rounded-2xl px-6 py-3 text-center relative z-10">
              <p className="font-black text-2xl text-green-300">+{winAmount.toLocaleString("fr-FR")} FCFA</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Graph line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden">
          <motion.div className="h-full"
            style={{ background: "linear-gradient(90deg,transparent,#4ade80,#fbbf24)" }}
            animate={{ scaleX: phase === "flying" ? [0, 1] : 1 }}
            transition={{ duration: 2, repeat: phase === "flying" ? Infinity : 0 }} />
        </div>
      </div>

      {/* Controls */}
      <div className="px-4 pb-8 pt-3 space-y-3 bg-black/30 backdrop-blur-sm">

        {/* Bet options */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {BET_OPTIONS.map(b => (
            <motion.button key={b} whileTap={{ scale: 0.92 }} onClick={() => phase === "waiting" || phase === "crashed" || phase === "cashedout" ? setBet(b) : null}
              disabled={phase === "flying"}
              className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-black border-2 transition-all"
              style={{
                background: bet === b ? "#f59e0b" : "rgba(255,255,255,0.06)",
                borderColor: bet === b ? "#fbbf24" : "rgba(255,255,255,0.1)",
                color: bet === b ? "#000" : "#fff",
              }}>
              {b.toLocaleString("fr-FR")} F
            </motion.button>
          ))}
        </div>

        {/* Auto cashout */}
        <div className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2">
          <TrendingUp size={16} className="text-amber-400" />
          <span className="text-xs text-white/70 font-bold">Auto-encaissement à x</span>
          <div className="flex gap-1 ml-auto">
            {[2, 3, 5, 10].map(v => (
              <motion.button key={v} whileTap={{ scale: 0.9 }} onClick={() => setAutoCashout(autoCashout === v ? null : v)}
                className="w-9 h-7 rounded-lg text-xs font-black border"
                style={{
                  background: autoCashout === v ? "#16a34a" : "transparent",
                  borderColor: autoCashout === v ? "#22c55e" : "rgba(255,255,255,0.2)",
                }}>
                {v}x
              </motion.button>
            ))}
          </div>
        </div>

        {/* Action button */}
        {phase === "flying" ? (
          <motion.button whileTap={{ scale: 0.96 }} onClick={cashOut}
            animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 0.5, repeat: Infinity }}
            className="w-full h-16 rounded-2xl font-black text-xl text-black shadow-2xl flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}>
            <Zap size={24} fill="currentColor" />
            ENCAISSER {winAmount.toLocaleString("fr-FR")} F
          </motion.button>
        ) : (
          <motion.button whileTap={{ scale: 0.96 }} onClick={startGame}
            className="w-full h-14 rounded-2xl font-black text-lg text-white shadow-lg flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
            🚀 Lancer ({bet.toLocaleString("fr-FR")} F)
          </motion.button>
        )}
      </div>
    </div>
  );
}
