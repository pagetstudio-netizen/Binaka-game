import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useGetBalance, getGetBalanceQueryKey } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  LogOut, ChevronRight, Crown, Eye, EyeOff, RefreshCw,
  Trophy, Bell, Settings
} from "lucide-react";

import avatarImg    from "@assets/0_1782639273983.png";
import iconDeposit  from "@assets/deposit-center.7afea0c9_1782639258954.png";
import iconWithdraw from "@assets/withdraw.8b8ab6f4_1782610371952.png";
import iconShare    from "@assets/invite.7d84082f_1782639258987.png";
import iconSecurity from "@assets/security-center.725cfbe6_1782639258892.png";

import iconGift     from "@assets/téléchargement_(66)_1782639311360.png";
import iconMission  from "@assets/téléchargement_(72)_1782639311335.png";
import iconRemise   from "@assets/téléchargement_(67)_1782639311382.png";
import iconArchive  from "@assets/téléchargement_(67)_1782639311382.png";
import iconSupport  from "@assets/mine-mod-cs-DtBQ0Sp0_1782639311404.png";
import iconSettings from "@assets/mine-mod-change-pwd-D4tL_Aft_1782639311424.png";
import iconDownload from "@assets/mine-mod-download-B1teb57W_(1)_1782639311307.png";
import iconAbout    from "@assets/mine-mod-aboutus-xnaBhqOq_1782639311462.png";

/* CSS filter: white PNG → gold #F4C430 */
const GOLD_FILTER = "brightness(0) invert(1) sepia(1) saturate(6) hue-rotate(10deg)";

const BG_DARK  = "#0A5C3A";
const BG_CARD  = "rgba(255,255,255,0.10)";
const BG_CARD2 = "rgba(255,255,255,0.07)";
const GOLD     = "#F4C430";

const QUICK_ACTIONS = [
  { img: iconDeposit,  label: "Effectuez un\ndépôt", href: "/deposit" },
  { img: iconWithdraw, label: "Retirer",              href: "/withdraw" },
  { img: iconShare,    label: "Partager",             href: "/referral" },
  { img: iconSecurity, label: "Centre de\nsécurité",  href: "/account/security" },
];

const MENU_ITEMS = [
  { img: iconGift,     label: "Récompense",          badge: 5, href: "/promotions" },
  { img: iconMission,  label: "Mission",              badge: 1, href: "/promotions" },
  { img: iconRemise,   label: "Remise manuelle",      badge: 0, href: "/wallet" },
  { img: iconArchive,  label: "Archives",             badge: 0, href: "/wallet" },
  { img: iconAbout,    label: "Registres de dépôt",   badge: 0, href: "/wallet" },
  { img: iconAbout,    label: "Programme VIP",        badge: 0, href: "/vip" },
  { img: iconSupport,  label: "Support en direct",    badge: 0, href: "/support" },
  { img: iconSettings, label: "Paramètres",           badge: 0, href: "/account/settings" },
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
    <div className="flex flex-col w-full min-h-full pb-24" style={{ background: BG_DARK }}>

      {/* ── HEADER: avatar + nom + solde ── */}
      <div className="px-4 pt-5 pb-5 relative overflow-hidden"
        style={{ background: "linear-gradient(170deg,#062E1B 0%,#0A5C3A 70%,#0F7A4E 100%)" }}>

        {/* decorative circles */}
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-16 -left-8 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />

        {/* top-right: settings + bell */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <Link href="/account/settings">
            <motion.button whileTap={{ scale: 0.85 }}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.13)" }}>
              <Settings size={17} className="text-white" />
            </motion.button>
          </Link>
          <Link href="/notifications">
            <motion.button whileTap={{ scale: 0.85 }}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.13)" }}>
              <Bell size={17} className="text-white" />
            </motion.button>
          </Link>
        </div>

        {/* avatar + infos */}
        <div className="flex items-center gap-4 relative z-10 mt-1">
          <div className="relative flex-shrink-0">
            <div className="w-[70px] h-[70px] rounded-full overflow-hidden shadow-xl"
              style={{ border: `2.5px solid ${GOLD}` }}>
              <img src={avatarImg} alt="Avatar" className="w-full h-full object-cover object-top" />
            </div>
            <Link href="/account/profile">
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow"
                style={{ background: GOLD }}>
                <Crown size={10} className="text-green-900" />
              </div>
            </Link>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-black text-white text-sm tracking-wide truncate">
                {user.phone}
              </span>
              <div className="flex items-center gap-1 rounded-full px-2 py-0.5"
                style={{ background: "rgba(244,196,48,0.18)", border: `1px solid ${GOLD}60` }}>
                <img src={iconAbout} alt="" className="w-3 h-3" style={{ filter: GOLD_FILTER }} />
                <span className="text-[11px] font-black" style={{ color: GOLD }}>VIP{vipLevel}</span>
              </div>
            </div>

            {/* solde */}
            <div className="flex items-center gap-2 mt-1">
              <span className="font-black text-2xl tracking-wide" style={{ color: GOLD }}>
                {showBalance
                  ? `₣${balance.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}`
                  : "₣ ••••••"}
              </span>
              <motion.button whileTap={{ scale: 0.8 }} onClick={handleRefresh} className="opacity-60">
                <motion.div animate={refreshing ? { rotate: 360 } : {}}
                  transition={{ duration: 0.7, repeat: refreshing ? Infinity : 0 }}>
                  <RefreshCw size={15} className="text-white" />
                </motion.div>
              </motion.button>
              <motion.button whileTap={{ scale: 0.8 }} onClick={() => setShowBalance(v => !v)} className="opacity-60">
                {showBalance ? <Eye size={15} className="text-white" /> : <EyeOff size={15} className="text-white" />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* ── VIP + Download cards ── */}
        <div className="grid grid-cols-2 gap-3 mt-5 relative z-10">
          <Link href="/vip">
            <motion.div whileTap={{ scale: 0.96 }}
              className="flex items-center gap-3 px-3 py-3.5 rounded-2xl cursor-pointer"
              style={{ background: BG_CARD, border: "1px solid rgba(255,255,255,0.15)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(244,196,48,0.22)" }}>
                <Trophy size={20} style={{ color: GOLD }} />
              </div>
              <div>
                <p className="font-black text-white text-xs leading-tight">Privilèges VIP</p>
                <p className="text-white/50 text-[10px] mt-0.5">Niveau {vipLevel}</p>
              </div>
            </motion.div>
          </Link>

          <motion.div whileTap={{ scale: 0.96 }}
            className="flex items-center gap-3 px-3 py-3.5 rounded-2xl cursor-pointer"
            style={{ background: BG_CARD, border: "1px solid rgba(255,255,255,0.15)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(244,196,48,0.22)" }}>
              <img src={iconDownload} alt="" className="w-6 h-6" style={{ filter: GOLD_FILTER }} />
            </div>
            <div>
              <p className="font-black text-white text-xs leading-tight">Télécharger</p>
              <p className="text-white/50 text-[10px] mt-0.5">l'application</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── QUICK ACTIONS (dark green, no white) ── */}
      <div className="px-4 py-5" style={{ background: BG_DARK }}>
        <div className="grid grid-cols-4 gap-2">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.href} href={action.href}>
              <motion.div whileTap={{ scale: 0.9 }} className="flex flex-col items-center gap-2">
                <div className="w-[60px] h-[60px] rounded-full flex items-center justify-center shadow-lg"
                  style={{ background: "rgba(255,255,255,0.10)", border: "1.5px solid rgba(255,255,255,0.18)" }}>
                  <img src={action.img} alt={action.label} className="w-9 h-9 object-contain" />
                </div>
                <span className="text-[11px] font-bold text-white text-center leading-tight whitespace-pre-line">
                  {action.label}
                </span>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* separator */}
      <div className="mx-4 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />

      {/* ── MENU ITEMS (dark green cards) ── */}
      <div className="px-3 py-3 flex flex-col gap-2">
        {MENU_ITEMS.map((item, i) => (
          <Link key={item.href + i} href={item.href}>
            <motion.div whileTap={{ scale: 0.98, backgroundColor: "rgba(255,255,255,0.14)" }}
              className="flex items-center justify-between px-4 py-4 rounded-2xl cursor-pointer"
              style={{ background: BG_CARD2, border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-center gap-4">
                <img
                  src={item.img}
                  alt={item.label}
                  className="w-7 h-7 object-contain flex-shrink-0"
                  style={{ filter: GOLD_FILTER }}
                />
                <span className="text-sm font-bold text-white">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.badge > 0 && (
                  <span className="min-w-[22px] h-[22px] bg-red-500 text-white text-[11px] font-black rounded-full flex items-center justify-center px-1.5">
                    {item.badge}
                  </span>
                )}
                <ChevronRight size={15} className="text-white/30" />
              </div>
            </motion.div>
          </Link>
        ))}

        {user.isAdmin && (
          <Link href="/admin">
            <motion.div whileTap={{ scale: 0.98 }}
              className="flex items-center justify-between px-4 py-4 rounded-2xl cursor-pointer"
              style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.25)" }}>
              <div className="flex items-center gap-4">
                <img src={iconSettings} alt="" className="w-7 h-7 object-contain"
                  style={{ filter: "brightness(0) invert(1) sepia(1) saturate(6) hue-rotate(300deg)" }} />
                <span className="text-sm font-bold text-white">Dashboard Admin</span>
                <span className="text-[10px] font-black text-white bg-red-500 rounded-full px-2 py-0.5">ADMIN</span>
              </div>
              <ChevronRight size={15} className="text-white/30" />
            </motion.div>
          </Link>
        )}
      </div>

      {/* ── LOGOUT ── */}
      <div className="px-3 mt-1 mb-2">
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowLogout(true)}
          className="w-full h-[52px] rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2"
          style={{ background: "rgba(239,68,68,0.25)", border: "1px solid rgba(239,68,68,0.35)" }}>
          <LogOut size={17} />
          Déconnexion
        </motion.button>
      </div>

      {/* ── MODAL DÉCONNEXION ── */}
      <AnimatePresence>
        {showLogout && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowLogout(false)}
              className="fixed inset-0 bg-black/60 z-40" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl p-6 pb-10"
              style={{ background: "#0A5C3A" }}>
              <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: "rgba(255,255,255,0.2)" }} />
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ background: "rgba(239,68,68,0.2)", border: "2px solid rgba(239,68,68,0.4)" }}>
                  <LogOut size={28} className="text-red-400" />
                </div>
                <h3 className="font-black text-xl text-white mb-1">Déconnexion</h3>
                <p className="text-sm text-white/60">Voulez-vous vraiment quitter BINAKA GAME ?</p>
              </div>
              <div className="flex gap-3">
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowLogout(false)}
                  className="flex-1 h-12 rounded-2xl font-black text-white/80 text-sm"
                  style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}>
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
