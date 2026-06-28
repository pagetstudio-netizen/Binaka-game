import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useCategoryCtx } from "@/lib/category-context";
import megaphoneIcon from "@assets/téléchargement_(75)_1782610207756.png";

import banner1 from "@assets/file_000000007f2c71f4bdc6d0d958f5bd37_1782547259143.png";
import banner2 from "@assets/file_000000000f0471f4a3199220c69af3b7_1782547259216.png";
import banner3 from "@assets/1c02ab26-f0bd-40a1-bb0d-c4aaadf65c82_1782547299433.png";
import iconSlots       from "@assets/icon-slots.png";
import iconWheel       from "@assets/icon-wheel.png";
import iconScratch     from "@assets/icon-scratch.png";
import iconDice        from "@assets/icon-dice.png";
import iconCoinFlip    from "@assets/icon-coin-flip.png";
import iconLuckyNumber from "@assets/icon-lucky-number.png";
import iconLuckyBox    from "@assets/icon-lucky-box.png";
import iconMysteryGift from "@assets/icon-mystery-gift.png";
import iconMiniJackpot from "@assets/icon-mini-jackpot.png";
import iconDeposit  from "@assets/20260228_002852_1772238747316_1782553073125.png";
import iconWithdraw from "@assets/20260228_002918_1772238747293_1782553073315.png";
import iconReferral from "@assets/20260228_080749_1772266120754_1782553073350.png";
import iconVip      from "@assets/fa6620bc07e2128cfd6a47b85bb73129_1782553073377.png";

const BG       = "#071C12";
const BG_CARD  = "#0D2B1E";
const GOLD     = "#F4C430";
const GREEN    = "#0F8A5F";

const BANNERS = [banner1, banner2, banner3];

const ALL_GAMES = [
  { id: "slots",        href: "/games/slots",        name: "Jackpot",      emoji: "🎰", image: iconSlots,       gradient: "from-purple-600 to-purple-900", hot: true,  isNew: false, cat: "jackpot"  },
  { id: "wheel",        href: "/games/wheel",         name: "Roue",         emoji: "🎡", image: iconWheel,       gradient: "from-blue-500 to-blue-800",     hot: false, isNew: false, cat: "roue"     },
  { id: "scratch",      href: "/games/scratch",       name: "Gratter",      emoji: "🎟", image: iconScratch,     gradient: "from-amber-500 to-orange-700",  hot: false, isNew: false, cat: "grattage" },
  { id: "dice",         href: "/games/dice",          name: "Dice",         emoji: "🎲", image: iconDice,        gradient: "from-red-500 to-rose-800",      hot: false, isNew: false, cat: "minijeux" },
  { id: "coin-flip",    href: "/games/coin-flip",     name: "Coin Flip",    emoji: "🪙", image: iconCoinFlip,    gradient: "from-yellow-400 to-yellow-700", hot: false, isNew: false, cat: "minijeux" },
  { id: "lucky-number", href: "/games/lucky-number",  name: "Lucky N°",     emoji: "🎯", image: iconLuckyNumber, gradient: "from-green-500 to-emerald-800", hot: true,  isNew: false, cat: "minijeux" },
  { id: "lucky-box",    href: "/games/lucky-box",     name: "Lucky Box",    emoji: "💎", image: iconLuckyBox,    gradient: "from-cyan-500 to-cyan-900",     hot: false, isNew: false, cat: "minijeux" },
  { id: "mystery-gift", href: "/games/mystery-gift",  name: "Mystery Gift", emoji: "🎁", image: iconMysteryGift, gradient: "from-pink-500 to-pink-900",     hot: false, isNew: false, cat: "minijeux" },
  { id: "mini-jackpot", href: "/games/mini-jackpot",  name: "Mini Jackpot", emoji: "🎮", image: iconMiniJackpot, gradient: "from-indigo-500 to-indigo-900", hot: false, isNew: true,  cat: "jackpot"  },
];

const FAKE_WINNERS = [
  { name: "Mbouma***", amount: "125 000", game: "Jackpot" },
  { name: "Dj***ck",   amount: "75 000",  game: "Roue" },
  { name: "Ange***",   amount: "200 000", game: "Jackpot" },
  { name: "Marc***",   amount: "50 000",  game: "Gratter" },
  { name: "Fran***",   amount: "98 000",  game: "Dice" },
  { name: "Alex***",   amount: "300 000", game: "Lucky Box" },
];

const QUICK_ACTIONS = [
  { label: "Dépôt",      icon: iconDeposit,  href: "/wallet",   color: GREEN,     bg: "rgba(15,138,95,0.18)" },
  { label: "Retrait",    icon: iconWithdraw, href: "/wallet",   color: "#D4A017", bg: "rgba(212,160,23,0.18)" },
  { label: "VIP",        icon: iconVip,      href: "/vip",      color: "#a855f7", bg: "rgba(168,85,247,0.18)" },
  { label: "Parrainage", icon: iconReferral, href: "/referral", color: "#3b82f6", bg: "rgba(59,130,246,0.18)" },
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

export default function Home() {
  const { user } = useAuth();
  const { activeCategory } = useCategoryCtx();
  const [bannerIndex, setBannerIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [winnerIndex, setWinnerIndex] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setIsLoaded(true), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setBannerIndex(i => (i + 1) % BANNERS.length), 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setWinnerIndex(i => (i + 1) % FAKE_WINNERS.length), 2500);
    return () => clearInterval(interval);
  }, []);

  if (!user) return null;

  const winner = FAKE_WINNERS[winnerIndex];
  const filteredGames = filterGames(ALL_GAMES, activeCategory);
  const sectionTitle = activeCategory === "tous"       ? "Jeux Populaires"
    : activeCategory === "jackpot"    ? "🎰 Jackpot"
    : activeCategory === "roue"       ? "🎡 Roue de Fortune"
    : activeCategory === "grattage"   ? "🎟 Cartes à Gratter"
    : activeCategory === "minijeux"   ? "🎲 Mini-jeux"
    : activeCategory === "nouveautes" ? "🏆 Nouveautés"
    : "🔥 Jeux Populaires";

  return (
    <div className="flex flex-col w-full min-h-full pb-20" style={{ background: BG }}>
      <div className="flex-1 overflow-x-hidden">

        {/* ── BANNIÈRE CARROUSEL ── */}
        <div className="px-3 pt-3">
          <div className="relative overflow-hidden rounded-2xl shadow-xl" style={{ aspectRatio: "2.1 / 1" }}>
            <AnimatePresence mode="wait">
              <motion.img
                key={bannerIndex}
                src={BANNERS[bannerIndex]}
                alt="Bannière BINAKA GAME"
                className="w-full h-full object-cover absolute inset-0"
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.45, ease: "easeInOut" }}
              />
            </AnimatePresence>
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.4) 100%)" }} />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {BANNERS.map((_, i) => (
                <button key={i} onClick={() => setBannerIndex(i)} className="rounded-full transition-all duration-300"
                  style={{ width: i === bannerIndex ? 22 : 8, height: 8, backgroundColor: i === bannerIndex ? GOLD : "rgba(255,255,255,0.45)" }} />
              ))}
            </div>
          </div>
        </div>

        {/* ── TICKER GAGNANTS ── */}
        <div className="mx-3 mt-3 rounded-xl px-3 py-2.5 flex items-center gap-2 shadow-sm"
          style={{ background: BG_CARD, border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <img src={megaphoneIcon} alt="Annonce" className="w-6 h-6 object-contain" />
            <span className="text-[11px] font-black uppercase tracking-wide" style={{ color: GOLD }}>Gagnants</span>
          </div>
          <div className="w-px h-4 flex-shrink-0" style={{ background: "rgba(255,255,255,0.15)" }} />
          <AnimatePresence mode="wait">
            <motion.div
              key={winnerIndex}
              className="flex items-center gap-2 flex-1 min-w-0"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-xs font-bold truncate text-white">{winner.name}</span>
              <span className="text-[10px] flex-shrink-0" style={{ color: "rgba(255,255,255,0.45)" }}>{winner.game}</span>
              <span className="ml-auto text-xs font-black flex-shrink-0" style={{ color: GOLD }}>+{winner.amount} FCFA</span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── ACTIONS RAPIDES ── */}
        <div className="px-3 mt-3 grid grid-cols-4 gap-2">
          {QUICK_ACTIONS.map((item) => (
            <Link key={item.label} href={item.href}>
              <motion.div whileTap={{ scale: 0.92 }}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl border"
                style={{ backgroundColor: item.bg, borderColor: item.color + "40" }}>
                <img src={item.icon} alt={item.label} className="w-8 h-8 object-contain" draggable={false} />
                <span className="text-[10px] font-bold" style={{ color: item.color }}>{item.label}</span>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* ── GRILLE DE JEUX ── */}
        <div className="px-3 mt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 rounded-full" style={{ background: GOLD }} />
              <h2 className="font-black text-base text-white">{sectionTitle}</h2>
            </div>
            <Link href="/games">
              <span className="text-xs font-bold flex items-center gap-0.5" style={{ color: GREEN }}>
                Voir tout <ChevronRight size={14} />
              </span>
            </Link>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
              className="grid grid-cols-3 gap-2.5"
            >
              {!isLoaded
                ? Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-1.5">
                      <div className="aspect-[3/4] rounded-2xl animate-pulse" style={{ background: "#132E20" }} />
                      <div className="h-3 rounded animate-pulse mx-2" style={{ background: "#132E20" }} />
                    </div>
                  ))
                : filteredGames.length > 0
                  ? filteredGames.map((game, i) => (
                      <motion.div key={game.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06, duration: 0.4 }}>
                        <GameCard game={game} />
                      </motion.div>
                    ))
                  : (
                    <div className="col-span-3 py-12 flex flex-col items-center gap-2">
                      <span className="text-4xl">🎮</span>
                      <p className="text-sm font-bold" style={{ color: GREEN }}>Aucun jeu dans cette catégorie</p>
                    </div>
                  )
              }
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── BANNIÈRE PARRAINAGE ── */}
        <div className="px-3 mt-4 mb-4">
          <Link href="/referral">
            <motion.div whileTap={{ scale: 0.98 }}
              className="rounded-2xl overflow-hidden relative shadow-lg"
              style={{ background: "linear-gradient(135deg, #0F8A5F 0%, #0A5C3A 100%)", minHeight: 90 }}>
              <div className="absolute right-3 top-0 bottom-0 flex items-center text-7xl opacity-20 select-none pointer-events-none">🤑</div>
              <div className="relative z-10 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider mb-0.5" style={{ color: GOLD }}>Offre Parrainage</p>
                <h3 className="text-white font-black text-xl leading-tight mb-1">Invitez & Gagnez</h3>
                <p className="text-white/80 text-xs mb-2">10% sur chaque dépôt de vos filleuls</p>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-full" style={{ background: GOLD, color: "#1a3a1a" }}>
                  En savoir plus <ChevronRight size={11} />
                </span>
              </div>
            </motion.div>
          </Link>
        </div>
      </div>
    </div>
  );
}

type Game = {
  id: string; href: string; name: string; emoji: string;
  image?: string; gradient: string; hot: boolean;
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
            <img src={game.image} alt={game.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1 relative overflow-hidden">
              <div className="absolute w-20 h-20 rounded-full opacity-30"
                style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }} />
              <motion.div className="absolute top-2 right-3 text-lg opacity-40"
                animate={{ y: [0, -4, 0], rotate: [0, 10, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}>✨</motion.div>
              <motion.div className="absolute bottom-6 left-2 text-base opacity-30"
                animate={{ y: [0, 4, 0], rotate: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}>⭐</motion.div>
              <motion.span className="text-5xl drop-shadow-lg relative z-10"
                animate={{ scale: [1, 1.1, 1], rotate: [0, 4, -4, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}>{game.emoji}</motion.span>
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          )}
        </div>
        <p className="text-[11px] font-bold text-center mt-1.5 truncate px-1 text-white/80">{game.name}</p>
      </motion.div>
    </Link>
  );
}
