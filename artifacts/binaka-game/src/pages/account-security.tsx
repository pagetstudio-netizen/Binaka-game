import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  ChevronRight, LogOut, Zap,
  User, Lock, ShieldCheck, HelpCircle, KeyRound, Landmark, Power
} from "lucide-react";

interface SecurityItem {
  id: string;
  label: string;
  sub: string;
  href: string;
  completed: boolean;
  Icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

const SECURITY_ITEMS: SecurityItem[] = [
  {
    id: "personal-info",
    label: "Informations personnelles",
    sub: "Complétez vos informations personnelles.",
    href: "/account/security/personal-info",
    completed: false,
    Icon: User,
    iconColor: "#8B5CF6",
    iconBg: "#F5F3FF",
  },
  {
    id: "password",
    label: "Modifier le mot de passe de connexion",
    sub: "Combinaison de lettres et de chiffres recommandée",
    href: "/account/security/password",
    completed: true,
    Icon: Lock,
    iconColor: "#3B82F6",
    iconBg: "#EFF6FF",
  },
  {
    id: "transaction-password",
    label: "Mot de passe de transaction",
    sub: "Définissez un mot de passe pour sécuriser vos fonds.",
    href: "/account/security/transaction-password",
    completed: false,
    Icon: ShieldCheck,
    iconColor: "#0F8A5F",
    iconBg: "#F0FDF4",
  },
  {
    id: "security-question",
    label: "Question de sécurité",
    sub: "Permet de réinitialiser votre mot de passe via une question.",
    href: "/account/security/security-question",
    completed: false,
    Icon: HelpCircle,
    iconColor: "#F97316",
    iconBg: "#FFF7ED",
  },
  {
    id: "fund-password",
    label: "Mot de passe du fonds",
    sub: "Répondre à la question de sécurité pour réinitialiser.",
    href: "/account/security/fund-password",
    completed: false,
    Icon: KeyRound,
    iconColor: "#EAB308",
    iconBg: "#FEFCE8",
  },
  {
    id: "bank-account",
    label: "Numéro de compte bancaire",
    sub: "Veuillez utiliser un véritable numéro de compte.",
    href: "/account/security/bank-account",
    completed: true,
    Icon: Landmark,
    iconColor: "#10B981",
    iconBg: "#ECFDF5",
  },
];

export default function AccountSecurity() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const completedCount = SECURITY_ITEMS.filter((s) => s.completed).length;
  const totalCount     = SECURITY_ITEMS.length;
  const pct            = Math.round((completedCount / totalCount) * 100);
  const boltsFilled    = Math.ceil((pct / 100) * 5);

  const secLabel = pct < 30 ? "Faible" : pct < 60 ? "Moyen" : pct < 85 ? "Fort" : "Très fort";
  const secColor = pct < 30 ? "#EF4444" : pct < 60 ? "#F59E0B" : "#22C55E";
  const secBg    = pct < 30 ? "#FEF2F2" : pct < 60 ? "#FFFBEB" : "#F0FDF4";
  const secBorder= pct < 30 ? "#FECACA" : pct < 60 ? "#FDE68A" : "#BBF7D0";

  const circumference = 2 * Math.PI * 36;
  const dashOffset    = circumference * (1 - pct / 100);

  return (
    <div className="flex flex-col w-full min-h-full pb-24" style={{ background: "#EAF8F2" }}>

      {/* ── SECURITY SCORE CARD ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="mx-3 mt-4 bg-white rounded-2xl shadow-sm overflow-hidden"
        style={{ border: "1px solid #D4EDDA" }}>

        <div className="px-4 py-3" style={{ background: "#F5FDF9", borderBottom: "1px solid #EAF8F2" }}>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#0F8A5F" }}>
            Niveau de sécurité
          </p>
        </div>

        <div className="flex items-center gap-4 px-5 py-5">
          {/* Circular gauge */}
          <div className="relative flex-shrink-0 w-20 h-20">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="36" fill="none" stroke="#F0F0F0" strokeWidth="7" />
              <circle
                cx="40" cy="40" r="36" fill="none"
                stroke={secColor} strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-lg font-black" style={{ color: secColor }}>{pct}%</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-800 text-sm mb-1">
              Sécurité du compte : <span style={{ color: secColor, fontWeight: 900 }}>{secLabel}</span>
            </p>
            <div className="flex gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Zap
                  key={i}
                  size={17}
                  className={i < boltsFilled ? "fill-current" : "opacity-20"}
                  style={{ color: i < boltsFilled ? secColor : "#9CA3AF" }}
                />
              ))}
            </div>
            <p className="text-[11px] text-gray-400">Dernière IP de connexion : —</p>
            <p className="text-[11px] text-gray-400">Dernière connexion : —</p>
          </div>
        </div>

        {pct < 60 && (
          <div className="mx-4 mb-4 rounded-xl px-4 py-3 text-center"
            style={{ background: secBg, border: `1px solid ${secBorder}` }}>
            <p className="text-xs font-bold leading-relaxed" style={{ color: secColor }}>
              ⚠️ Le niveau de sécurité de votre compte est {secLabel.toLowerCase()}. Veuillez compléter vos informations de sécurité.
            </p>
          </div>
        )}
      </motion.div>

      {/* ── SECURITY ITEMS LIST ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
        className="mx-3 mt-3 bg-white rounded-2xl shadow-sm overflow-hidden"
        style={{ border: "1px solid #D4EDDA" }}>

        <div className="px-4 py-3" style={{ background: "#F5FDF9", borderBottom: "1px solid #EAF8F2" }}>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#0F8A5F" }}>
            Éléments de sécurité
          </p>
        </div>

        {SECURITY_ITEMS.map((item, i) => (
          <Link key={item.id} href={item.href}>
            <motion.div whileTap={{ backgroundColor: "#F5FDF9" }}
              className="flex items-center gap-4 px-4 py-4 cursor-pointer"
              style={{ borderBottom: i < SECURITY_ITEMS.length - 1 ? "1px solid #F0FDF4" : "none" }}>

              {/* Colored icon */}
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: item.iconBg }}>
                <item.Icon size={20} style={{ color: item.iconColor }} />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-gray-800 leading-snug">{item.label}</p>
                  {item.completed
                    ? <span className="text-[10px] font-black text-white rounded-full px-2 py-0.5"
                        style={{ background: "#22C55E" }}>✓ OK</span>
                    : <span className="text-[10px] font-black text-white rounded-full px-2 py-0.5"
                        style={{ background: "#EF4444" }}>!</span>
                  }
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2">{item.sub}</p>
              </div>

              <ChevronRight size={15} className="text-gray-300 flex-shrink-0" />
            </motion.div>
          </Link>
        ))}
      </motion.div>

      {/* ── LOGOUT ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
        className="mx-3 mt-3 bg-white rounded-2xl shadow-sm overflow-hidden"
        style={{ border: "1px solid #FECACA" }}>
        <motion.button whileTap={{ backgroundColor: "#FEF2F2" }}
          onClick={logout}
          className="w-full flex items-center gap-4 px-4 py-4 cursor-pointer">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-red-50 flex-shrink-0">
            <Power size={20} className="text-red-500" />
          </div>
          <span className="text-sm font-bold text-red-500 flex-1 text-left">Déconnexion</span>
          <ChevronRight size={15} className="text-red-300" />
        </motion.button>
      </motion.div>
    </div>
  );
}
