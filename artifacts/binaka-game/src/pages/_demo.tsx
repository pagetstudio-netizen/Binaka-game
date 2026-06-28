import { useState } from "react";
import { motion } from "framer-motion";
import { LogOut, ChevronRight, Crown, Eye, EyeOff, RefreshCw, Trophy, Bell, Settings } from "lucide-react";

import avatarImg    from "@assets/0_1782639273983.png";
import iconDeposit  from "@assets/deposit-center.7afea0c9_1782639258954.png";
import iconWithdraw from "@assets/withdraw.8b8ab6f4_1782610371952.png";
import iconShare    from "@assets/invite.7d84082f_1782639258987.png";
import iconSecurity from "@assets/security-center.725cfbe6_1782639258892.png";
import iconGift     from "@assets/téléchargement_(67)_1782639311382.png";
import iconMission  from "@assets/téléchargement_(72)_1782639311335.png";
import iconRemise   from "@assets/téléchargement_(66)_1782639311360.png";
import iconSupport  from "@assets/mine-mod-cs-DtBQ0Sp0_1782639311404.png";
import iconSettings from "@assets/mine-mod-change-pwd-D4tL_Aft_1782639311424.png";
import iconDownload from "@assets/mine-mod-download-B1teb57W_(1)_1782639311307.png";
import iconAbout    from "@assets/mine-mod-aboutus-xnaBhqOq_1782639311462.png";

const GOLD_FILTER = "brightness(0) invert(1) sepia(1) saturate(6) hue-rotate(10deg)";
const BG_DARK = "#0A5C3A";
const BG_CARD = "rgba(255,255,255,0.10)";
const BG_CARD2 = "rgba(255,255,255,0.07)";
const GOLD = "#F4C430";

const QUICK = [
  { img: iconDeposit,  label: "Effectuez un\ndépôt" },
  { img: iconWithdraw, label: "Retirer" },
  { img: iconShare,    label: "Partager" },
  { img: iconSecurity, label: "Centre de\nsécurité" },
];
const MENU = [
  { img: iconGift,     label: "Récompense",        badge: 5 },
  { img: iconMission,  label: "Mission",             badge: 1 },
  { img: iconRemise,   label: "Remise manuelle",     badge: 0 },
  { img: iconRemise,   label: "Archives",            badge: 0 },
  { img: iconRemise,   label: "Registres de dépôt",  badge: 0 },
  { img: iconAbout,    label: "Programme VIP",       badge: 0 },
  { img: iconSupport,  label: "Support en direct",   badge: 0 },
  { img: iconSettings, label: "Paramètres",          badge: 0 },
];

export default function Demo() {
  const [showBal, setShowBal] = useState(true);
  return (
    <div style={{ background: BG_DARK, minHeight: "100dvh", paddingBottom: 80 }}>

      {/* Header */}
      <div className="px-4 pt-5 pb-5 relative overflow-hidden"
        style={{ background: "linear-gradient(170deg,#062E1B 0%,#0A5C3A 70%,#0F7A4E 100%)" }}>
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/5" />

        {/* top icons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.13)" }}>
            <Settings size={17} className="text-white" />
          </div>
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.13)" }}>
            <Bell size={17} className="text-white" />
          </div>
        </div>

        {/* avatar + info */}
        <div className="flex items-center gap-4 mt-1">
          <div className="relative">
            <div className="w-[70px] h-[70px] rounded-full overflow-hidden" style={{ border: `2.5px solid ${GOLD}` }}>
              <img src={avatarImg} className="w-full h-full object-cover object-top" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: GOLD }}>
              <Crown size={10} className="text-green-900" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-black text-white text-sm">t2776105506</span>
              <div className="flex items-center gap-1 rounded-full px-2 py-0.5" style={{ background: "rgba(244,196,48,0.18)", border: `1px solid ${GOLD}60` }}>
                <span className="text-[11px] font-black" style={{ color: GOLD }}>VIP0</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-black text-2xl" style={{ color: GOLD }}>{showBal ? "₣0,00" : "₣ ••••"}</span>
              <RefreshCw size={15} className="text-white opacity-60" />
              <button onClick={() => setShowBal(v => !v)}>{showBal ? <Eye size={15} className="text-white opacity-60" /> : <EyeOff size={15} className="text-white opacity-60" />}</button>
            </div>
          </div>
        </div>

        {/* VIP + Download cards */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="flex items-center gap-3 px-3 py-3.5 rounded-2xl" style={{ background: BG_CARD, border: "1px solid rgba(255,255,255,0.15)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(244,196,48,0.22)" }}>
              <Trophy size={20} style={{ color: GOLD }} />
            </div>
            <div>
              <p className="font-black text-white text-xs">Privilèges VIP</p>
              <p className="text-white/50 text-[10px]">Niveau 0</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-3 py-3.5 rounded-2xl" style={{ background: BG_CARD, border: "1px solid rgba(255,255,255,0.15)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(244,196,48,0.22)" }}>
              <img src={iconDownload} className="w-6 h-6" style={{ filter: GOLD_FILTER }} />
            </div>
            <div>
              <p className="font-black text-white text-xs">Télécharger</p>
              <p className="text-white/50 text-[10px]">l'application</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-4 py-5" style={{ background: BG_DARK }}>
        <div className="grid grid-cols-4 gap-2">
          {QUICK.map((a, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-[60px] h-[60px] rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.10)", border: "1.5px solid rgba(255,255,255,0.18)" }}>
                <img src={a.img} className="w-9 h-9 object-contain" />
              </div>
              <span className="text-[11px] font-bold text-white text-center whitespace-pre-line">{a.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-4 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />

      {/* Menu items */}
      <div className="px-3 py-3 flex flex-col gap-2">
        {MENU.map((item, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-4 rounded-2xl"
            style={{ background: BG_CARD2, border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center gap-4">
              <img src={item.img} className="w-7 h-7 object-contain" style={{ filter: GOLD_FILTER }} />
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
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className="px-3 mt-1">
        <div className="w-full h-[52px] rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2"
          style={{ background: "rgba(239,68,68,0.25)", border: "1px solid rgba(239,68,68,0.35)" }}>
          <LogOut size={17} /> Déconnexion
        </div>
      </div>
    </div>
  );
}
