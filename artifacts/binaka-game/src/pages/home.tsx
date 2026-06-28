import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Trophy } from "lucide-react";
import { useAuth } from "@/lib/auth";

import banner1 from "@assets/file_000000007f2c71f4bdc6d0d958f5bd37_1782547259143.png";
import banner2 from "@assets/file_000000000f0471f4a3199220c69af3b7_1782547259216.png";
import banner3 from "@assets/1c02ab26-f0bd-40a1-bb0d-c4aaadf65c82_1782547299433.png";
import iconSlots from "@assets/icon-slots.png";
import iconWheel from "@assets/icon-wheel.png";
import iconScratch from "@assets/icon-scratch.png";
import headerBanner from "@assets/20260627_094959_1782553814769.png";
import iconDeposit  from "@assets/20260228_002852_1772238747316_1782553073125.png";
import iconWithdraw from "@assets/20260228_002918_1772238747293_1782553073315.png";
import iconReferral from "@assets/20260228_080749_1772266120754_1782553073350.png";
import iconVip      from "@assets/fa6620bc07e2128cfd6a47b85bb73129_1782553073377.png";

const BANNERS = [banner1, banner2, banner3];

const GAMES = [
  { id: "slots", href: "/games/slots", name: "Jackpot", emoji: "🎰", image: iconSlots, gradient: "from-purple-600 to-purple-900", hot: true },
  { id: "wheel", href: "/games/wheel", name: "Roue", emoji: "🎡", image: iconWheel, gradient: "from-blue-500 to-blue-800", hot: false },
  { id: "scratch", href: "/games/scratch", name: "Gratter", emoji: "🎟", image: iconScratch, gradient: "from-amber-500 to-orange-700", hot: false },
  { id: "dice", href: "/games/dice", name: "Dice", emoji: "🎲", gradient: "from-red-500 to-rose-800", hot: false },
  { id: "coin-flip", href: "/games/coin-flip", name: "Coin Flip", emoji: "🪙", gradient: "from-yellow-400 to-yellow-700", hot: false },
  { id: "lucky-number", href: "/games/lucky-number", name: "Lucky N°", emoji: "🎯", gradient: "from-green-500 to-emerald-800", hot: true },
  { id: "lucky-box", href: "/games/lucky-box", name: "Lucky Box", emoji: "💎", gradient: "from-cyan-500 to-cyan-900", hot: false },
  { id: "mystery-gift", href: "/games/mystery-gift", name: "Mystery Gift", emoji: "🎁", gradient: "from-pink-500 to-pink-900", hot: false },
  { id: "mini-jackpot", href: "/games/mini-jackpot", name: "Mini Jackpot", emoji: "🎮", gradient: "from-indigo-500 to-indigo-900", hot: false },
];

const FAKE_WINNERS = [
  { name: "Mbouma***", amount: "125 000", game: "Jackpot" },
  { name: "Dj***ck", amount: "75 000", game: "Roue" },
  { name: "Ange***", amount: "200 000", game: "Jackpot" },
  { name: "Marc***", amount: "50 000", game: "Gratter" },
  { name: "Fran***", amount: "98 000", game: "Dice" },
  { name: "Alex***", amount: "300 000", game: "Lucky Box" },
];

export default function Home() {
  const { user } = useAuth();
  const [bannerIndex, setBannerIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [winnerIndex, setWinnerIndex] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setIsLoaded(true), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIndex((i) => (i + 1) % BANNERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setWinnerIndex((i) => (i + 1) % FAKE_WINNERS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  if (!user) return null;

  const winner = FAKE_WINNERS[winnerIndex];

  return (
    <div className="flex flex-col w-full bg-gray-50 min-h-full pb-20">

      {/* ── HEADER BANNIÈRE FIXE ── */}
      <header
        className="sticky top-0 z-50 bg-white"
        style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}
      >
        <img
          src={headerBanner}
          alt="Binaka Game"
          className="w-full object-cover pointer-events-none select-none"
          draggable={false}
          style={{ display: "block", maxHeight: 80 }}
        />
      </header>

      <div className="flex-1 overflow-x-hidden">

        {/* ── BANNIÈRE CARROUSEL ── */}
        <div className="px-3 pt-3">
          <div className="relative overflow-hidden rounded-2xl shadow-md" style={{ aspectRatio: "2.1 / 1" }}>
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
            {/* Indicateurs (points) */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {BANNERS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setBannerIndex(i)}
                  className="rounded-full transition-all duration-300"
                  style={{ width: i === bannerIndex ? 22 : 8, height: 8, backgroundColor: i === bannerIndex ? "#ffffff" : "rgba(255,255,255,0.5)" }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── TICKER GAGNANTS ── */}
        <div className="mx-3 mt-3 bg-white rounded-xl px-3 py-2.5 flex items-center gap-2 shadow-sm border border-gray-100">
          <div className="flex items-center gap-1 flex-shrink-0">
            <Trophy size={14} className="text-amber-500" />
            <span className="text-[11px] font-black text-amber-500 uppercase tracking-wide">Gagnants</span>
          </div>
          <div className="w-px h-4 bg-gray-200 flex-shrink-0" />
          <AnimatePresence mode="wait">
            <motion.div
              key={winnerIndex}
              className="flex items-center gap-2 flex-1 min-w-0"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-xs font-bold text-gray-800 truncate">{winner.name}</span>
              <span className="text-[10px] text-gray-400 flex-shrink-0">{winner.game}</span>
              <span className="ml-auto text-xs font-black text-green-600 flex-shrink-0">+{winner.amount} FCFA</span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── ACTIONS RAPIDES ── */}
        <div className="px-3 mt-3 grid grid-cols-4 gap-2">
          {[
            { label: "Dépôt",      icon: iconDeposit,  href: "/wallet",   bg: "#f0fdf4", color: "#16a34a" },
            { label: "Retrait",    icon: iconWithdraw, href: "/wallet",   bg: "#fffbeb", color: "#d97706" },
            { label: "VIP",        icon: iconVip,      href: "/referral", bg: "#faf5ff", color: "#9333ea" },
            { label: "Parrainage", icon: iconReferral, href: "/referral", bg: "#eff6ff", color: "#2563eb" },
          ].map((item) => (
            <Link key={item.label} href={item.href}>
              <motion.div
                whileTap={{ scale: 0.92 }}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl border"
                style={{ backgroundColor: item.bg, borderColor: item.color + "30" }}
              >
                <img
                  src={item.icon}
                  alt={item.label}
                  className="w-8 h-8 object-contain"
                  draggable={false}
                />
                <span className="text-[10px] font-bold" style={{ color: item.color }}>{item.label}</span>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* ── GRILLE DE JEUX ── */}
        <div className="px-3 mt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-green-600 rounded-full" />
              <h2 className="font-black text-gray-900 text-base">Jeux Populaires</h2>
            </div>
            <Link href="/games">
              <span className="text-xs font-bold text-green-600 flex items-center gap-0.5">
                Voir tout <ChevronRight size={14} />
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {!isLoaded
              ? Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                    <div className="aspect-[3/4] bg-gray-200 animate-pulse rounded-2xl" />
                    <div className="h-3 bg-gray-200 animate-pulse rounded mx-2" />
                  </div>
                ))
              : GAMES.map((game, i) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.4 }}
                  >
                    <GameCard game={game} />
                  </motion.div>
                ))}
          </div>
        </div>

        {/* ── BANNIÈRE PARRAINAGE ── */}
        <div className="px-3 mt-4 mb-4">
          <Link href="/referral">
            <motion.div
              whileTap={{ scale: 0.98 }}
              className="rounded-2xl overflow-hidden relative shadow-md"
              style={{ background: "linear-gradient(135deg, #16a34a 0%, #064e3b 100%)", minHeight: 90 }}
            >
              <div className="absolute right-3 top-0 bottom-0 flex items-center text-7xl opacity-20 select-none pointer-events-none">🤑</div>
              <div className="relative z-10 p-4">
                <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-0.5">Offre Parrainage</p>
                <h3 className="text-white font-black text-xl leading-tight mb-1">Invitez & Gagnez</h3>
                <p className="text-white/80 text-xs mb-2">10% sur chaque dépôt de vos filleuls</p>
                <span className="inline-flex items-center gap-1 bg-amber-400 text-white text-[11px] font-bold px-3 py-1.5 rounded-full">
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
            <img
              src={game.image}
              alt={game.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1 relative overflow-hidden">
              {/* Cercle de lueur derrière l'emoji */}
              <div className="absolute w-20 h-20 rounded-full opacity-30"
                style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }} />
              {/* Décorations flottantes */}
              <motion.div
                className="absolute top-2 right-3 text-lg opacity-40"
                animate={{ y: [0, -4, 0], rotate: [0, 10, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}>
                ✨
              </motion.div>
              <motion.div
                className="absolute bottom-6 left-2 text-base opacity-30"
                animate={{ y: [0, 4, 0], rotate: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}>
                ⭐
              </motion.div>
              {/* Emoji principal animé */}
              <motion.span
                className="text-5xl drop-shadow-lg relative z-10"
                animate={{ scale: [1, 1.1, 1], rotate: [0, 4, -4, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}>
                {game.emoji}
              </motion.span>
              {/* Nom du jeu en overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          )}
        </div>
        <p className="text-[11px] font-bold text-gray-700 text-center mt-1.5 truncate px-1">{game.name}</p>
      </motion.div>
    </Link>
  );
}
