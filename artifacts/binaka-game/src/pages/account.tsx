import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useGetBalance, getGetBalanceQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  LogOut, ChevronRight, Gift, Calendar, DollarSign,
  FolderOpen, CreditCard, Shield, Star, Trophy, Headphones,
  Eye, EyeOff, RefreshCw, Download, Crown
} from "lucide-react";
import avatarImg from "@assets/1993889-belle-femme-latine-avatar-icone-personnage-gratuit-vec_1782318102114.jpg";
import iconDeposit  from "@assets/deposit-center.7afea0c9_1782610372010.png";
import iconWithdraw from "@assets/withdraw.8b8ab6f4_1782610371952.png";
import iconShare    from "@assets/invite.7d84082f_1782610372040.png";
import iconSecurity from "@assets/security-center.725cfbe6_1782610372073.png";

const QUICK_ACTIONS = [
  { img: iconDeposit,  label: "Effectuez un\ndépôt", href: "/deposit" },
  { img: iconWithdraw, label: "Retirer",              href: "/withdraw" },
  { img: iconShare,    label: "Partager",             href: "/referral" },
  { img: iconSecurity, label: "Centre de\nsécurité",  href: "/account/security" },
];

const MENU_ITEMS = [
  { icon: Gift,         label: "Récompense",         badge: 5,   href: "/promotions" },
  { icon: Calendar,     label: "Mission",             badge: 1,   href: "/promotions" },
  { icon: DollarSign,   label: "Remise manuelle",     badge: 0,   href: "/wallet" },
  { icon: FolderOpen,   label: "Archives",            badge: 0,   href: "/wallet" },
  { icon: CreditCard,   label: "Registres de dépôt",  badge: 0,   href: "/wallet" },
  { icon: Trophy,       label: "Programme VIP",       badge: 0,   href: "/vip" },
  { icon: Headphones,   label: "Support en direct",   badge: 0,   href: "/support" },
];

export default function Account() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const { data: wallet, refetch } = useGetBalance({ query: { queryKey: getGetBalanceQueryKey() } });
  const [showBalance, setShowBalance] = useState(true);
  const [showLogout, setShowLogout]   = useState(false);
  const [refreshing, setRefreshing]   = useState(false);

  if (!user) return null;

  const vipLevel = user.vipLevel ?? 0;
  const balance  = wallet?.balance ?? 0;

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <div className="flex flex-col w-full min-h-full pb-24" style={{ background: "#EAF8F2" }}>

      {/* ── TOP DARK GREEN PROFILE SECTION ── */}
      <div style={{ background: "linear-gradient(170deg, #0a4a1e 0%, #1a7a35 60%, #0f5525 100%)" }}
        className="px-4 pt-5 pb-6">

        {/* Avatar + Info */}
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/30 shadow-xl">
              <img src={avatarImg} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {/* Username + VIP badge */}
            <div className="flex items-center gap-2 mb-1">
              <span className="font-black text-white text-base tracking-wide">{user.phone}</span>
              <div className="flex items-center gap-1 bg-amber-400/20 border border-amber-400/40 rounded-full px-2 py-0.5">
                <Crown size={10} className="text-amber-300" />
                <span className="text-amber-300 text-[10px] font-black">VIP{vipLevel}</span>
              </div>
            </div>

            {/* Balance row */}
            <div className="flex items-center gap-3">
              <span className="text-white font-black text-xl tracking-wide">
                {showBalance
                  ? `₣${balance.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}`
                  : "₣ ••••••"}
              </span>
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={handleRefresh}
                className="opacity-70 active:opacity-100"
              >
                <motion.div animate={refreshing ? { rotate: 360 } : {}} transition={{ duration: 0.6 }}>
                  <RefreshCw size={15} className="text-white" />
                </motion.div>
              </motion.button>
              <motion.button whileTap={{ scale: 0.8 }} onClick={() => setShowBalance(v => !v)} className="opacity-70 active:opacity-100">
                {showBalance ? <Eye size={15} className="text-white" /> : <EyeOff size={15} className="text-white" />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* ── TWO FEATURE CARDS ── */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <Link href="/vip">
            <motion.div whileTap={{ scale: 0.96 }}
              className="flex items-center gap-3 px-4 py-4 rounded-2xl cursor-pointer"
              style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}>
                <Star size={20} className="text-white fill-white" />
              </div>
              <span className="font-black text-white text-sm leading-tight">Privilèges VIP</span>
            </motion.div>
          </Link>

          <motion.div whileTap={{ scale: 0.96 }}
            className="flex items-center gap-3 px-4 py-4 rounded-2xl cursor-pointer"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#3b82f6,#1d4ed8)" }}>
              <Download size={20} className="text-white" />
            </div>
            <span className="font-black text-white text-sm leading-tight">Télécharger l'application</span>
          </motion.div>
        </div>
      </div>

      {/* ── QUICK ACTION CIRCLES ── */}
      <div className="bg-white px-4 py-5 shadow-sm">
        <div className="grid grid-cols-4 gap-2">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.href} href={action.href}>
              <motion.div whileTap={{ scale: 0.93 }} className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-md"
                  style={{ background: "linear-gradient(135deg,#e8f5e9,#c8e6c9)", border: "1.5px solid #a5d6a7" }}>
                  <img src={action.img} alt={action.label} className="w-9 h-9 object-contain" />
                </div>
                <span className="text-[10px] font-bold text-gray-600 text-center leading-tight whitespace-pre-line">{action.label}</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── MENU LIST ── */}
      <div className="mx-4 mt-3 bg-white rounded-2xl overflow-hidden shadow-sm">
        {MENU_ITEMS.map((item, i) => (
          <Link key={item.href + i} href={item.href}>
            <motion.div whileTap={{ backgroundColor: "#f9fafb" }}
              className="flex items-center justify-between px-4 py-4 cursor-pointer"
              style={{ borderBottom: i < MENU_ITEMS.length - 1 ? "1px solid #f3f4f6" : "none" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "#f0fdf4" }}>
                  <item.icon size={18} className="text-green-600" />
                </div>
                <span className="text-sm font-bold text-gray-800">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.badge > 0 && (
                  <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
                <ChevronRight size={15} className="text-gray-300" />
              </div>
            </motion.div>
          </Link>
        ))}

        {user.isAdmin && (
          <Link href="/admin">
            <motion.div whileTap={{ backgroundColor: "#f9fafb" }}
              className="flex items-center justify-between px-4 py-4 cursor-pointer border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-50">
                  <Shield size={18} className="text-red-500" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-800">Dashboard Admin</span>
                  <span className="text-[10px] font-black text-white bg-red-500 rounded-full px-2 py-0.5">ADMIN</span>
                </div>
              </div>
              <ChevronRight size={15} className="text-gray-300" />
            </motion.div>
          </Link>
        )}
      </div>

      {/* ── LOGOUT BUTTON ── */}
      <div className="px-4 mt-4">
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowLogout(true)}
          className="w-full h-13 rounded-2xl font-black text-base text-white shadow flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg,#f97316,#ef4444)" }}>
          <LogOut size={18} />
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
                  className="flex-1 h-12 rounded-2xl border-2 border-gray-200 font-black text-gray-600 text-sm">
                  Annuler
                </motion.button>
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => { logout(); setShowLogout(false); }}
                  className="flex-1 h-12 rounded-2xl font-black text-white text-sm"
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
