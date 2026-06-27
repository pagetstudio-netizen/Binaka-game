import { Link } from "wouter";
import { motion } from "framer-motion";
import iconSlots from "@assets/icon-slots.png";
import iconWheel from "@assets/icon-wheel.png";
import iconScratch from "@assets/icon-scratch.png";

const GAMES = [
  // Original 3
  { id: "slots",         href: "/games/slots",         name: "Jackpot",           emoji: "🎰", gradient: "from-purple-600 to-purple-900", hot: true,  new: false, minBet: "100 FCFA", image: iconSlots },
  { id: "wheel",         href: "/games/wheel",          name: "Roue de Fortune",   emoji: "🎡", gradient: "from-blue-500 to-blue-800",     hot: false, new: false, minBet: "200 FCFA", image: iconWheel },
  { id: "scratch",       href: "/games/scratch",        name: "Carte à Gratter",   emoji: "🎟", gradient: "from-amber-500 to-orange-700",  hot: false, new: false, minBet: "500 FCFA", image: iconScratch },
  // Original mini games
  { id: "dice",          href: "/games/dice",           name: "Dice",              emoji: "🎲", gradient: "from-red-500 to-rose-800",      hot: false, new: false, minBet: "100 FCFA" },
  { id: "coin-flip",     href: "/games/coin-flip",      name: "Coin Flip",         emoji: "🪙", gradient: "from-yellow-400 to-yellow-700", hot: false, new: false, minBet: "100 FCFA" },
  { id: "lucky-number",  href: "/games/lucky-number",   name: "Lucky Number",      emoji: "🎯", gradient: "from-green-500 to-emerald-800", hot: true,  new: false, minBet: "100 FCFA" },
  { id: "lucky-box",     href: "/games/lucky-box",      name: "Lucky Box",         emoji: "💎", gradient: "from-cyan-500 to-cyan-900",     hot: false, new: false, minBet: "200 FCFA" },
  { id: "mystery-gift",  href: "/games/mystery-gift",   name: "Mystery Gift",      emoji: "🎁", gradient: "from-pink-500 to-pink-900",     hot: false, new: false, minBet: "300 FCFA" },
  { id: "mini-jackpot",  href: "/games/mini-jackpot",   name: "Mini Jackpot",      emoji: "🎮", gradient: "from-indigo-500 to-indigo-900", hot: false, new: false, minBet: "100 FCFA" },
  // 6 New games
  { id: "crash",         href: "/games/crash",          name: "Crash",             emoji: "🚀", gradient: "from-violet-600 to-indigo-900", hot: true,  new: true,  minBet: "100 FCFA" },
  { id: "mines",         href: "/games/mines",          name: "Mines",             emoji: "💣", gradient: "from-slate-600 to-slate-900",   hot: true,  new: true,  minBet: "100 FCFA" },
  { id: "hilo",          href: "/games/hilo",           name: "Hi-Lo",             emoji: "🃏", gradient: "from-blue-700 to-blue-950",     hot: false, new: true,  minBet: "100 FCFA" },
  { id: "tower",         href: "/games/tower",          name: "Tower",             emoji: "🗼", gradient: "from-purple-700 to-purple-950", hot: false, new: true,  minBet: "100 FCFA" },
  { id: "keno",          href: "/games/keno",           name: "Keno",              emoji: "🎱", gradient: "from-sky-600 to-sky-950",       hot: false, new: true,  minBet: "100 FCFA" },
  { id: "plinko",        href: "/games/plinko",         name: "Plinko",            emoji: "🎯", gradient: "from-emerald-600 to-teal-900",  hot: false, new: true,  minBet: "100 FCFA" },
  { id: "ferme-magique", href: "/games/ferme-magique",  name: "Ferme Magique",     emoji: "🌾", gradient: "from-green-600 to-green-950",   hot: false, new: true,  minBet: "200 FCFA" },
];

const CATEGORIES = [
  { label: "Tous", filter: (_g: typeof GAMES[0]) => true },
  { label: "🔥 Chauds", filter: (g: typeof GAMES[0]) => g.hot },
  { label: "✨ Nouveaux", filter: (g: typeof GAMES[0]) => g.new },
];

export default function Games() {
  return (
    <GamesInner />
  );
}

import { useState } from "react";

function GamesInner() {
  const [catIdx, setCatIdx] = useState(0);
  const filtered = GAMES.filter(CATEGORIES[catIdx].filter);

  return (
    <div className="flex flex-col w-full bg-gray-50 min-h-full pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 h-14 flex items-center gap-3"
        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <div className="w-1 h-5 bg-green-600 rounded-full" />
        <h1 className="text-lg font-black text-gray-900">Tous les Jeux</h1>
        <span className="ml-auto bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
          {GAMES.length} jeux
        </span>
      </header>

      {/* Category tabs */}
      <div className="flex gap-2 px-4 pt-3 pb-1 overflow-x-auto">
        {CATEGORIES.map((cat, i) => (
          <motion.button key={i} whileTap={{ scale: 0.93 }} onClick={() => setCatIdx(i)}
            className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-black border-2 transition-all"
            style={{
              background: catIdx === i ? "#16a34a" : "white",
              borderColor: catIdx === i ? "#15803d" : "#e5e7eb",
              color: catIdx === i ? "white" : "#6b7280",
            }}>
            {cat.label}
          </motion.button>
        ))}
      </div>

      <div className="p-3 grid grid-cols-3 gap-3">
        {filtered.map((game, i) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}>
            <GameCard game={game} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

type Game = {
  id: string; href: string; name: string; emoji: string;
  gradient: string; hot: boolean; new: boolean; minBet: string; image?: string;
};

function GameCard({ game }: { game: Game }) {
  return (
    <Link href={game.href}>
      <motion.div whileTap={{ scale: 0.93 }} className="group flex flex-col">
        <div className={`aspect-[3/4] rounded-2xl overflow-hidden relative bg-gradient-to-br ${game.gradient} shadow-md`}>
          {game.hot && (
            <div className="absolute top-1.5 left-1.5 z-10 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
              HOT 🔥
            </div>
          )}
          {game.new && !game.hot && (
            <div className="absolute top-1.5 left-1.5 z-10 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
              NEW ✨
            </div>
          )}
          {game.image ? (
            <img src={game.image} alt={game.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <motion.span
                className="text-5xl drop-shadow-lg"
                animate={{ scale: [1, 1.08, 1], rotate: [0, 3, -3, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: Math.random() * 2 }}>
                {game.emoji}
              </motion.span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-2 left-0 right-0 flex justify-center">
            <span className="bg-green-600 text-white text-[9px] font-black px-3 py-0.5 rounded-full uppercase tracking-wide shadow">
              Jouer
            </span>
          </div>
        </div>
        <p className="text-[11px] font-bold text-gray-700 text-center mt-1.5 truncate px-1">{game.name}</p>
        <p className="text-[9px] text-gray-400 text-center truncate px-1">{game.minBet} min</p>
      </motion.div>
    </Link>
  );
}
