import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useCategoryCtx } from "@/lib/category-context";
import iconSlots       from "@assets/icon-slots.png";
import iconWheel       from "@assets/icon-wheel.png";
import iconScratch     from "@assets/icon-scratch.png";
import iconDice        from "@assets/icon-dice.png";
import iconCoinFlip    from "@assets/icon-coin-flip.png";
import iconLuckyNumber from "@assets/icon-lucky-number.png";
import iconLuckyBox    from "@assets/icon-lucky-box.png";
import iconMysteryGift from "@assets/icon-mystery-gift.png";
import iconMiniJackpot from "@assets/icon-mini-jackpot.png";
import iconCrash       from "@assets/icon-crash.png";
import iconMines       from "@assets/icon-mines.png";
import iconHilo        from "@assets/icon-hilo.png";
import iconTower       from "@assets/icon-tower.png";

const ALL_GAMES = [
  { id: "slots",         href: "/games/slots",         name: "Jackpot",         emoji: "🎰", gradient: "from-purple-600 to-purple-900", hot: true,  isNew: false, minBet: "100 FCFA",  image: iconSlots,       cat: "jackpot"  },
  { id: "wheel",         href: "/games/wheel",          name: "Roue de Fortune", emoji: "🎡", gradient: "from-blue-500 to-blue-800",     hot: false, isNew: false, minBet: "200 FCFA",  image: iconWheel,       cat: "roue"     },
  { id: "scratch",       href: "/games/scratch",        name: "Carte à Gratter", emoji: "🎟", gradient: "from-amber-500 to-orange-700",  hot: false, isNew: false, minBet: "500 FCFA",  image: iconScratch,     cat: "grattage" },
  { id: "dice",          href: "/games/dice",           name: "Dice",            emoji: "🎲", gradient: "from-red-500 to-rose-800",      hot: false, isNew: false, minBet: "100 FCFA",  image: iconDice,        cat: "minijeux" },
  { id: "coin-flip",     href: "/games/coin-flip",      name: "Coin Flip",       emoji: "🪙", gradient: "from-yellow-400 to-yellow-700", hot: false, isNew: false, minBet: "100 FCFA",  image: iconCoinFlip,    cat: "minijeux" },
  { id: "lucky-number",  href: "/games/lucky-number",   name: "Lucky Number",    emoji: "🎯", gradient: "from-green-500 to-emerald-800", hot: true,  isNew: false, minBet: "100 FCFA",  image: iconLuckyNumber, cat: "minijeux" },
  { id: "lucky-box",     href: "/games/lucky-box",      name: "Lucky Box",       emoji: "💎", gradient: "from-cyan-500 to-cyan-900",     hot: false, isNew: false, minBet: "200 FCFA",  image: iconLuckyBox,    cat: "minijeux" },
  { id: "mystery-gift",  href: "/games/mystery-gift",   name: "Mystery Gift",    emoji: "🎁", gradient: "from-pink-500 to-pink-900",     hot: false, isNew: false, minBet: "300 FCFA",  image: iconMysteryGift, cat: "minijeux" },
  { id: "mini-jackpot",  href: "/games/mini-jackpot",   name: "Mini Jackpot",    emoji: "🎮", gradient: "from-indigo-500 to-indigo-900", hot: false, isNew: true,  minBet: "100 FCFA",  image: iconMiniJackpot, cat: "jackpot"  },
  { id: "crash",         href: "/games/crash",          name: "Crash",           emoji: "🚀", gradient: "from-violet-600 to-indigo-900", hot: true,  isNew: true,  minBet: "100 FCFA",  image: iconCrash,       cat: "minijeux" },
  { id: "mines",         href: "/games/mines",          name: "Mines",           emoji: "💣", gradient: "from-slate-600 to-slate-900",   hot: true,  isNew: true,  minBet: "100 FCFA",  image: iconMines,       cat: "minijeux" },
  { id: "hilo",          href: "/games/hilo",           name: "Hi-Lo",           emoji: "🃏", gradient: "from-blue-700 to-blue-950",     hot: false, isNew: true,  minBet: "100 FCFA",  image: iconHilo,        cat: "minijeux" },
  { id: "tower",         href: "/games/tower",          name: "Tower",           emoji: "🗼", gradient: "from-purple-700 to-purple-950", hot: false, isNew: true,  minBet: "100 FCFA",  image: iconTower,       cat: "minijeux" },
  { id: "keno",          href: "/games/keno",           name: "Keno",            emoji: "🎱", gradient: "from-sky-600 to-sky-950",       hot: false, isNew: true,  minBet: "100 FCFA",                          cat: "minijeux" },
  { id: "plinko",        href: "/games/plinko",         name: "Plinko",          emoji: "🎯", gradient: "from-emerald-600 to-teal-900",  hot: false, isNew: true,  minBet: "100 FCFA",                          cat: "minijeux" },
  { id: "ferme-magique", href: "/games/ferme-magique",  name: "Ferme Magique",   emoji: "🌾", gradient: "from-green-600 to-green-950",   hot: false, isNew: true,  minBet: "200 FCFA",                          cat: "minijeux" },
];

function filterGames(games: typeof ALL_GAMES, cat: string) {
  switch (cat) {
    case "jackpot":    return games.filter(g => g.cat === "jackpot");
    case "roue":       return games.filter(g => g.cat === "roue");
    case "grattage":   return games.filter(g => g.cat === "grattage");
    case "minijeux":   return games.filter(g => g.cat === "minijeux");
    case "nouveautes": return games.filter(g => g.isNew);
    case "populaires": return games.filter(g => g.hot);
    default:           return games;
  }
}

export default function Games() {
  return <GamesInner />;
}

function GamesInner() {
  const { activeCategory } = useCategoryCtx();
  const filtered = filterGames(ALL_GAMES, activeCategory);

  const sectionTitle = activeCategory === "tous"       ? `Tous les Jeux (${ALL_GAMES.length})`
    : activeCategory === "jackpot"    ? "🎰 Jackpot"
    : activeCategory === "roue"       ? "🎡 Roue de Fortune"
    : activeCategory === "grattage"   ? "🎟 Cartes à Gratter"
    : activeCategory === "minijeux"   ? "🎲 Mini-jeux"
    : activeCategory === "nouveautes" ? "🏆 Nouveautés"
    : "🔥 Jeux Populaires";

  return (
    <div className="flex flex-col w-full min-h-full pb-20" style={{ background: "#EAF8F2" }}>

      {/* Header */}
      <header className="px-4 h-14 flex items-center gap-3" style={{ background: "#FFFFFF", borderBottom: "1px solid #D4EDDA" }}>
        <div className="w-1 h-5 rounded-full" style={{ background: "#F4C430" }} />
        <h1 className="text-lg font-black" style={{ color: "#0A5C3A" }}>{sectionTitle}</h1>
        <span className="ml-auto text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "#EAF8F2", color: "#0F8A5F" }}>
          {filtered.length} jeux
        </span>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="p-3 grid grid-cols-3 gap-3"
        >
          {filtered.length > 0 ? (
            filtered.map((game, i) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}>
                <GameCard game={game} />
              </motion.div>
            ))
          ) : (
            <div className="col-span-3 py-16 flex flex-col items-center gap-3">
              <span className="text-5xl">🎮</span>
              <p className="text-sm font-bold" style={{ color: "#0F8A5F" }}>Aucun jeu dans cette catégorie</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

type Game = {
  id: string; href: string; name: string; emoji: string;
  gradient: string; hot: boolean; isNew: boolean; minBet: string; image?: string;
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
          {game.isNew && !game.hot && (
            <div className="absolute top-1.5 left-1.5 z-10 text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{ background: "#F4C430", color: "#1a3a1a" }}>
              NEW ✨
            </div>
          )}

          {game.image ? (
            <img src={game.image} alt={game.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute w-24 h-24 rounded-full opacity-25"
                style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }} />
              <motion.div
                className="absolute top-2 right-3 text-base opacity-40"
                animate={{ y: [0, -5, 0], rotate: [0, 12, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}>
                ✨
              </motion.div>
              <motion.div
                className="absolute bottom-8 left-2 text-sm opacity-30"
                animate={{ y: [0, 5, 0], rotate: [0, -10, 0] }}
                transition={{ duration: 4.1, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
                ⭐
              </motion.div>
              <motion.span
                className="text-5xl drop-shadow-lg relative z-10"
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}>
                {game.emoji}
              </motion.span>
              <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          )}
        </div>
        <p className="text-[11px] font-bold text-center mt-1.5 truncate px-1" style={{ color: "#0A5C3A" }}>{game.name}</p>
        <p className="text-[9px] text-center truncate px-1" style={{ color: "#6b9e7f" }}>{game.minBet} min</p>
      </motion.div>
    </Link>
  );
}
