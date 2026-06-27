import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useGetBalance, getGetBalanceQueryKey } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  ChevronRight, Copy, LogOut, Shield, Settings,
  Gift, Headphones, FileText, Crown, Wallet,
  ArrowUpRight, Check, Star
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import avatarImg from "@assets/1993889-belle-femme-latine-avatar-icone-personnage-gratuit-vec_1782318102114.jpg";
import rechargeIcon from "@assets/recharge-icon-BZHWSjQZ_(1)_1782317902170.png";
import withdrawIcon from "@assets/withdraw-icon-DFsum39V_(1)_1782317901916.png";

const VIP_LEVELS = ["Bronze", "Argent", "Or", "Platine", "Diamant", "Légende"];
const VIP_EMOJIS = ["🥉", "🥈", "🥇", "💎", "👑", "🏆"];
const VIP_COLORS = [
  { from: "#a78bfa", to: "#7c3aed" },
  { from: "#94a3b8", to: "#475569" },
  { from: "#fbbf24", to: "#d97706" },
  { from: "#67e8f9", to: "#0891b2" },
  { from: "#c084fc", to: "#9333ea" },
  { from: "#fb923c", to: "#dc2626" },
];

const MENU_ITEMS = [
  { icon: FileText,   label: "Historique de Solde",   href: "/wallet",           color: "#16a34a" },
  { icon: Shield,     label: "Compte & Sécurité",      href: "/account/security", color: "#3b82f6" },
  { icon: Gift,       label: "Cadeaux & Bonus",        href: "/promotions",       color: "#f59e0b" },
  { icon: Crown,      label: "Programme VIP",          href: "/vip",              color: "#9333ea" },
  { icon: Headphones, label: "Support en direct",      href: "/support",          color: "#0891b2" },
  { icon: Settings,   label: "Paramètres",             href: "/account/settings", color: "#64748b" },
];

export default function Account() {
  const { user, logout } = useAuth();
  const { data: wallet } = useGetBalance({ query: { queryKey: getGetBalanceQueryKey() } });
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  if (!user) return null;

  const vipLevel = user.vipLevel ?? 0;
  const vipColor = VIP_COLORS[Math.min(vipLevel, VIP_COLORS.length - 1)];
  const balance = wallet?.balance ?? 0;

  const handleCopyId = () => {
    navigator.clipboard.writeText(String(user.id));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "ID copié !", className: "bg-green-600 text-white border-none" });
  };

  return (
    <div className="flex flex-col w-full min-h-full bg-gray-100 pb-24">

      {/* ── TOP PROFILE SECTION ── */}
      <div className="bg-white px-4 pt-6 pb-5">

        {/* Avatar + User info */}
        <div className="flex items-center gap-4 mb-5">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 shadow-lg"
              style={{ borderColor: vipColor.from }}>
              <img src={avatarImg} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            {/* Edit overlay */}
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-green-600 border-2 border-white flex items-center justify-center shadow">
              <Star size={12} className="text-white fill-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {/* Name */}
            <div className="flex items-center gap-1.5 mb-1">
              <h2 className="font-black text-lg text-gray-900 truncate">{user.fullName}</h2>
              <span className="text-pink-500 text-sm">♀</span>
            </div>

            {/* ID row */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-gray-400 text-xs font-bold">ID: {user.id}</span>
              <motion.button whileTap={{ scale: 0.85 }} onClick={handleCopyId}
                className="w-5 h-5 rounded flex items-center justify-center bg-gray-100">
                {copied ? <Check size={11} className="text-green-600" /> : <Copy size={11} className="text-gray-400" />}
              </motion.button>
            </div>

            {/* Balance pill row */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                <span className="text-amber-500 text-xs">💰</span>
                <span className="text-xs font-black text-amber-700">{balance.toLocaleString("fr-FR")}</span>
                <span className="text-amber-500 text-xs">🪙</span>
              </div>
              {/* VIP badge */}
              <div className="flex items-center gap-1 rounded-full px-2.5 py-1 text-white text-xs font-black"
                style={{ background: `linear-gradient(135deg,${vipColor.from},${vipColor.to})` }}>
                {VIP_EMOJIS[Math.min(vipLevel, VIP_EMOJIS.length - 1)]}
                <span>VIP {vipLevel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── VIP PROMO BANNER ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="w-full rounded-2xl overflow-hidden shadow-md flex items-center justify-between px-4 py-4 gap-3"
          style={{ background: "linear-gradient(135deg,#16a34a 0%,#22c55e 60%,#16a34a 100%)" }}>
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">💎</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-black text-sm leading-snug">
              {vipLevel === 0 ? "Devenez VIP et profitez des avantages immédiatement" : `Félicitations ! Vous êtes VIP ${vipLevel} — ${VIP_LEVELS[Math.min(vipLevel - 1, VIP_LEVELS.length - 1)]}`}
            </p>
          </div>
          <Link href="/wallet">
            <motion.div whileTap={{ scale: 0.94 }}
              className="flex-shrink-0 bg-white rounded-xl px-3 py-2 text-xs font-black"
              style={{ color: "#16a34a" }}>
              Dépôt
            </motion.div>
          </Link>
        </motion.div>
      </div>

      {/* ── TWO ACTION BUTTONS ── */}
      <div className="grid grid-cols-2 gap-3 px-4 mt-3">
        <Link href="/wallet">
          <motion.div whileTap={{ scale: 0.96 }} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
            className="flex items-center gap-3 px-4 py-4 rounded-2xl shadow-sm cursor-pointer"
            style={{ background: "linear-gradient(135deg,#e0f2fe,#bfdbfe)" }}>
            <img src={withdrawIcon} alt="Retrait" className="w-11 h-11 object-contain drop-shadow" />
            <div>
              <p className="font-black text-sm text-blue-800">Retrait</p>
              <p className="text-xs text-blue-500 font-bold">{balance.toLocaleString("fr-FR")} F</p>
            </div>
          </motion.div>
        </Link>

        <Link href="/wallet">
          <motion.div whileTap={{ scale: 0.96 }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="flex items-center gap-3 px-4 py-4 rounded-2xl shadow-sm cursor-pointer"
            style={{ background: "linear-gradient(135deg,#fef9c3,#fde68a)" }}>
            <img src={rechargeIcon} alt="Dépôt" className="w-11 h-11 object-contain drop-shadow" />
            <div>
              <p className="font-black text-sm text-amber-800">Dépôt</p>
              <p className="text-xs text-amber-600 font-bold">Min 1 000 F</p>
            </div>
          </motion.div>
        </Link>
      </div>

      {/* ── MENU LIST ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="mx-4 mt-3 bg-white rounded-2xl shadow-sm overflow-hidden">
        {MENU_ITEMS.map((item, i) => {
          const Icon = item.icon;
          return (
            <Link key={item.href + i} href={item.href}>
              <motion.div whileTap={{ backgroundColor: "#f9fafb" }}
                className="flex items-center justify-between px-4 py-4 cursor-pointer"
                style={{ borderBottom: i < MENU_ITEMS.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: item.color + "18" }}>
                    <Icon size={18} style={{ color: item.color }} />
                  </div>
                  <span className="text-sm font-bold text-gray-800">{item.label}</span>
                </div>
                <ChevronRight size={16} className="text-gray-300" />
              </motion.div>
            </Link>
          );
        })}

        {/* Admin item */}
        {user.isAdmin && (
          <Link href="/admin">
            <motion.div whileTap={{ backgroundColor: "#f9fafb" }}
              className="flex items-center justify-between px-4 py-4 cursor-pointer border-t border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-50">
                  <Shield size={18} className="text-red-500" />
                </div>
                <div>
                  <span className="text-sm font-bold text-gray-800">Dashboard Admin</span>
                  <span className="ml-2 text-xs font-bold text-white bg-red-500 rounded-full px-2 py-0.5">ADMIN</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </motion.div>
          </Link>
        )}
      </motion.div>

      {/* ── PHONE & VERSION INFO ── */}
      <div className="mx-4 mt-3 bg-white rounded-2xl px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 font-bold">📱 Téléphone</span>
          <span className="text-xs font-black text-gray-600">{user.phone}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-400 font-bold">📅 Inscription</span>
          <span className="text-xs font-bold text-gray-500">
            {user.createdAt ? new Date(user.createdAt).toLocaleDateString("fr-FR") : "—"}
          </span>
        </div>
      </div>

      {/* ── LOGOUT BUTTON ── */}
      <div className="px-4 mt-4">
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowLogout(true)}
          className="w-full h-14 rounded-2xl font-black text-lg text-white shadow-lg flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg,#f97316,#ef4444)" }}>
          <LogOut size={20} />
          Déconnexion
        </motion.button>
      </div>

      {/* ── LOGOUT CONFIRM MODAL ── */}
      <AnimatePresence>
        {showLogout && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowLogout(false)}
              className="fixed inset-0 bg-black/50 z-40" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl p-6 pb-10">
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                  <LogOut size={28} className="text-red-500" />
                </div>
                <h3 className="font-black text-xl text-gray-900 mb-1">Déconnexion</h3>
                <p className="text-sm text-gray-500">Voulez-vous vraiment vous déconnecter de BINAKA GAME ?</p>
              </div>
              <div className="flex gap-3">
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowLogout(false)}
                  className="flex-1 h-13 rounded-2xl border-2 border-gray-200 font-black text-gray-600 text-sm">
                  Annuler
                </motion.button>
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => { logout(); setShowLogout(false); }}
                  className="flex-1 h-13 rounded-2xl font-black text-white text-sm"
                  style={{ background: "linear-gradient(135deg,#f97316,#ef4444)" }}>
                  Déconnecter
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
