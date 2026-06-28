import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useGetBalance, getGetBalanceQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  LogOut, ChevronRight, Gift, Calendar, DollarSign,
  FolderOpen, CreditCard, Shield, Star, Trophy, Headphones,
  Eye, EyeOff, RefreshCw, Download, Crown, Settings,
  User, Bell, Wallet, ArrowDownToLine, Share2, Lock
} from "lucide-react";
import avatarImg from "@assets/1993889-belle-femme-latine-avatar-icone-personnage-gratuit-vec_1782318102114.jpg";
import iconDeposit  from "@assets/deposit-center.7afea0c9_1782610372010.png";
import iconWithdraw from "@assets/withdraw.8b8ab6f4_1782610371952.png";
import iconShare    from "@assets/invite.7d84082f_1782610372040.png";
import iconSecurity from "@assets/security-center.725cfbe6_1782610372073.png";

const QUICK_ACTIONS = [
  { img: iconDeposit,  label: "Dépôt",     href: "/deposit",           color: "#E8F5E9", border: "#A5D6A7" },
  { img: iconWithdraw, label: "Retrait",    href: "/withdraw",          color: "#E3F2FD", border: "#90CAF9" },
  { img: iconShare,    label: "Partager",   href: "/referral",          color: "#FFF8E1", border: "#FFE082" },
  { img: iconSecurity, label: "Sécurité",   href: "/account/security",  color: "#FCE4EC", border: "#F48FB1" },
];

const MENU_ITEMS = [
  { icon: Gift,       label: "Récompenses",        badge: 5,  href: "/promotions",        color: "#FF6B6B", bg: "#FFF0F0" },
  { icon: Calendar,   label: "Missions",            badge: 1,  href: "/promotions",        color: "#FF9800", bg: "#FFF3E0" },
  { icon: DollarSign, label: "Remise manuelle",     badge: 0,  href: "/wallet",            color: "#4CAF50", bg: "#F1F8E9" },
  { icon: FolderOpen, label: "Archives",            badge: 0,  href: "/wallet",            color: "#9C27B0", bg: "#F3E5F5" },
  { icon: CreditCard, label: "Registres de dépôt",  badge: 0,  href: "/wallet",            color: "#2196F3", bg: "#E3F2FD" },
  { icon: Trophy,     label: "Programme VIP",       badge: 0,  href: "/vip",               color: "#F4C430", bg: "#FFFDE7" },
  { icon: Bell,       label: "Notifications",       badge: 0,  href: "/notifications",     color: "#00BCD4", bg: "#E0F7FA" },
  { icon: Headphones, label: "Support en direct",   badge: 0,  href: "/support",           color: "#607D8B", bg: "#ECEFF1" },
  { icon: Settings,   label: "Paramètres",          badge: 0,  href: "/account/settings",  color: "#78909C", bg: "#ECEFF1" },
];

export default function Account() {
  const { user, logout } = useAuth();
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

      {/* ── HEADER GRADIENT ── */}
      <div style={{ background: "linear-gradient(160deg, #062E1B 0%, #0A5C3A 50%, #0F8A5F 100%)" }}
        className="px-4 pt-6 pb-8 relative overflow-hidden">

        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full opacity-10 bg-white" />
        <div className="absolute -bottom-16 -left-8 w-56 h-56 rounded-full opacity-5 bg-white" />

        {/* Top row: settings + notification icons */}
        <div className="flex justify-end gap-3 mb-4 relative z-10">
          <Link href="/account/settings">
            <motion.button whileTap={{ scale: 0.88 }}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.15)" }}>
              <Settings size={17} className="text-white" />
            </motion.button>
          </Link>
          <Link href="/notifications">
            <motion.button whileTap={{ scale: 0.88 }}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.15)" }}>
              <Bell size={17} className="text-white" />
            </motion.button>
          </Link>
        </div>

        {/* Avatar + Info */}
        <div className="flex items-center gap-4 relative z-10">
          <div className="relative flex-shrink-0">
            <div className="w-18 h-18 w-[72px] h-[72px] rounded-full overflow-hidden shadow-xl"
              style={{ border: "3px solid rgba(244,196,48,0.7)" }}>
              <img src={avatarImg} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <Link href="/account/profile">
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
                style={{ background: "#F4C430" }}>
                <User size={12} className="text-green-900" />
              </div>
            </Link>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-black text-white text-base tracking-wide truncate">
                {user.fullName || user.phone}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-white/60 text-xs">{user.phone}</span>
              <div className="flex items-center gap-1 rounded-full px-2 py-0.5"
                style={{ background: "rgba(244,196,48,0.2)", border: "1px solid rgba(244,196,48,0.5)" }}>
                <Crown size={10} style={{ color: "#F4C430" }} />
                <span className="text-xs font-black" style={{ color: "#F4C430" }}>VIP{vipLevel}</span>
              </div>
            </div>

            {/* Balance */}
            <div className="flex items-center gap-2">
              <span className="font-black text-xl text-white tracking-wide">
                {showBalance
                  ? `₣${balance.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}`
                  : "₣ ••••••"}
              </span>
              <motion.button whileTap={{ scale: 0.8 }} onClick={handleRefresh} className="opacity-60 active:opacity-100">
                <motion.div animate={refreshing ? { rotate: 360 } : {}} transition={{ duration: 0.6, repeat: refreshing ? Infinity : 0 }}>
                  <RefreshCw size={14} className="text-white" />
                </motion.div>
              </motion.button>
              <motion.button whileTap={{ scale: 0.8 }} onClick={() => setShowBalance(v => !v)} className="opacity-60 active:opacity-100">
                {showBalance ? <Eye size={14} className="text-white" /> : <EyeOff size={14} className="text-white" />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* ── VIP + Download cards ── */}
        <div className="grid grid-cols-2 gap-3 mt-5 relative z-10">
          <Link href="/vip">
            <motion.div whileTap={{ scale: 0.96 }}
              className="flex items-center gap-3 px-3 py-3.5 rounded-2xl cursor-pointer"
              style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#F4C430,#e09e00)" }}>
                <Star size={20} className="text-white fill-white" />
              </div>
              <div>
                <p className="font-black text-white text-xs leading-tight">Privilèges VIP</p>
                <p className="text-white/50 text-[10px] mt-0.5">Niveau {vipLevel}</p>
              </div>
            </motion.div>
          </Link>

          <motion.div whileTap={{ scale: 0.96 }}
            className="flex items-center gap-3 px-3 py-3.5 rounded-2xl cursor-pointer"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#3b82f6,#1d4ed8)" }}>
              <Download size={20} className="text-white" />
            </div>
            <div>
              <p className="font-black text-white text-xs leading-tight">Télécharger</p>
              <p className="text-white/50 text-[10px] mt-0.5">l'application</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── QUICK ACTION CIRCLES ── */}
      <div className="bg-white px-4 py-5 shadow-sm" style={{ borderBottom: "1px solid #D4EDDA" }}>
        <div className="grid grid-cols-4 gap-2">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.href} href={action.href}>
              <motion.div whileTap={{ scale: 0.9 }} className="flex flex-col items-center gap-2">
                <div className="w-[58px] h-[58px] rounded-full flex items-center justify-center shadow-md"
                  style={{ background: action.color, border: `1.5px solid ${action.border}` }}>
                  <img src={action.img} alt={action.label} className="w-9 h-9 object-contain" />
                </div>
                <span className="text-[11px] font-bold text-gray-600 text-center leading-tight">{action.label}</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── MENU LIST ── */}
      <div className="mx-3 mt-3 bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border: "1px solid #D4EDDA" }}>
        <div className="px-4 py-3" style={{ borderBottom: "1px solid #EAF8F2", background: "#F5FDF9" }}>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#0F8A5F" }}>Mon compte</p>
        </div>

        {MENU_ITEMS.map((item, i) => (
          <Link key={item.href + i} href={item.href}>
            <motion.div whileTap={{ backgroundColor: "#F5FDF9" }}
              className="flex items-center justify-between px-4 py-3.5 cursor-pointer"
              style={{ borderBottom: i < MENU_ITEMS.length - 1 ? "1px solid #F0FDF4" : "none" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: item.bg }}>
                  <item.icon size={18} style={{ color: item.color }} />
                </div>
                <span className="text-sm font-semibold text-gray-800">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.badge > 0 && (
                  <span className="min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1.5">
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
            <motion.div whileTap={{ backgroundColor: "#FFF5F5" }}
              className="flex items-center justify-between px-4 py-3.5 cursor-pointer"
              style={{ borderTop: "1px solid #F0FDF4" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-50">
                  <Shield size={18} className="text-red-500" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-800">Dashboard Admin</span>
                  <span className="text-[10px] font-black text-white bg-red-500 rounded-full px-2 py-0.5">ADMIN</span>
                </div>
              </div>
              <ChevronRight size={15} className="text-gray-300" />
            </motion.div>
          </Link>
        )}
      </div>

      {/* ── LOGOUT BUTTON ── */}
      <div className="px-3 mt-3 mb-2">
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowLogout(true)}
          className="w-full h-13 h-[52px] rounded-2xl font-black text-sm text-white shadow-md flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg,#f97316,#ef4444)" }}>
          <LogOut size={17} />
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
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3"
                  style={{ border: "2px solid #FCA5A5" }}>
                  <LogOut size={28} className="text-red-500" />
                </div>
                <h3 className="font-black text-xl text-gray-900 mb-1">Déconnexion</h3>
                <p className="text-sm text-gray-500">Voulez-vous vraiment quitter BINAKA GAME ?</p>
              </div>
              <div className="flex gap-3">
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowLogout(false)}
                  className="flex-1 h-12 rounded-2xl font-black text-gray-600 text-sm"
                  style={{ border: "2px solid #E5E7EB" }}>
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
