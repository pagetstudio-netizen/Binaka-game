import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import iconSlots from "@assets/icon-slots.png";
import iconWheel from "@assets/icon-wheel.png";
import iconScratch from "@assets/icon-scratch.png";

const GAMES = [
  { id: "slots", href: "/games/slots", name: "Jackpot", desc: "Alignez les symboles, gagnez jusqu'à x50!", minBet: "100 FCFA", emoji: "🎰", image: iconSlots, gradient: "from-purple-600 to-purple-900", hot: true },
  { id: "wheel", href: "/games/wheel", name: "Roue de la Fortune", desc: "Tournez la roue et tentez le grand prix.", minBet: "200 FCFA", emoji: "🎡", image: iconWheel, gradient: "from-blue-500 to-blue-800", hot: false },
  { id: "scratch", href: "/games/scratch", name: "Carte à Gratter", desc: "3 symboles identiques = victoire instantanée!", minBet: "500 FCFA", emoji: "🎟", image: iconScratch, gradient: "from-amber-500 to-orange-700", hot: false },
  { id: "dice", href: "/games/dice", name: "Dice", desc: "Pariez sur le bon chiffre et doublez!", minBet: "100 FCFA", emoji: "🎲", gradient: "from-red-500 to-rose-800", hot: false },
  { id: "coin-flip", href: "/games/coin-flip", name: "Coin Flip", desc: "Face ou Pile — 50% de chance de gagner!", minBet: "100 FCFA", emoji: "🪙", gradient: "from-yellow-400 to-yellow-700", hot: false },
  { id: "lucky-number", href: "/games/lucky-number", name: "Lucky Number", desc: "Choisissez votre numéro chanceux (1-10).", minBet: "100 FCFA", emoji: "🎯", gradient: "from-green-500 to-emerald-800", hot: true },
  { id: "lucky-box", href: "/games/lucky-box", name: "Lucky Box", desc: "Choisissez une boîte et découvrez votre prize.", minBet: "200 FCFA", emoji: "💎", gradient: "from-cyan-500 to-cyan-900", hot: false },
  { id: "mystery-gift", href: "/games/mystery-gift", name: "Mystery Gift", desc: "Un cadeau mystère vous attend chaque partie.", minBet: "300 FCFA", emoji: "🎁", gradient: "from-pink-500 to-pink-900", hot: false },
  { id: "mini-jackpot", href: "/games/mini-jackpot", name: "Mini Jackpot", desc: "Jackpot express, victoires rapides!", minBet: "100 FCFA", emoji: "🎮", gradient: "from-indigo-500 to-indigo-900", hot: false },
];

export default function Games() {
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

      <div className="p-3 grid grid-cols-3 gap-3">
        {GAMES.map((game, i) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.35 }}
          >
            <GameCard game={game} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

type Game = {
  id: string; href: string; name: string; desc: string; minBet: string;
  emoji: string; image?: string; gradient: string; hot: boolean;
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
          {game.image ? (
            <img src={game.image} alt={game.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl drop-shadow-lg">{game.emoji}</span>
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
