import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { ChevronRight, LogOut, AlertCircle, CheckCircle2, Zap } from "lucide-react";

const SECURITY_ITEMS = [
  {
    id: "personal-info",
    label: "Informations personnelles",
    sub: "Informations personnelles complètes.",
    href: "/account/security/personal-info",
    completed: false,
  },
  {
    id: "password",
    label: "Modifier le mot de passe de connexion",
    sub: "Combinaison de lettres et de chiffres recommandée",
    href: "/account/security/password",
    completed: true,
  },
  {
    id: "transaction-password",
    label: "Mot de passe de transaction",
    sub: "Définissez un mot de passe de transaction pour sécuriser vos fonds.",
    href: "/account/security/transaction-password",
    completed: false,
  },
  {
    id: "security-question",
    label: "Question de sécurité",
    sub: "Après avoir défini la question de sécurité, vous pouvez modifier le mot de passe via cette question.",
    href: "/account/security/security-question",
    completed: false,
  },
  {
    id: "fund-password",
    label: "Obtenez le mot de passe du fonds",
    sub: "Répondre à la question de sécurité, réinitialiser le mot de passe de paiement",
    href: "/account/security/fund-password",
    completed: false,
  },
  {
    id: "bank-account",
    label: "Numéro de compte bancaire",
    sub: "Veuillez utiliser un véritable numéro de compte bancaire.",
    href: "/account/security/bank-account",
    completed: true,
  },
];

export default function AccountSecurity() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) return null;

  const completedCount = SECURITY_ITEMS.filter((s) => s.completed).length;
  const totalCount     = SECURITY_ITEMS.length;
  const pct            = Math.round((completedCount / totalCount) * 100);
  const boltsFilled    = Math.ceil((pct / 100) * 5);

  const secLabel = pct < 30 ? "Faible" : pct < 60 ? "Moyen" : pct < 85 ? "Fort" : "Très fort";
  const secColor = pct < 30 ? "#ef4444" : pct < 60 ? "#f59e0b" : "#22c55e";

  const circumference = 2 * Math.PI * 36;
  const dashOffset    = circumference * (1 - pct / 100);

  return (
    <div className="flex flex-col w-full min-h-full bg-gray-50 pb-24">

      {/* ── SECURITY SCORE CARD ── */}
      <div className="bg-white mx-4 mt-4 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-5 px-5 py-5">
          {/* Circular gauge */}
          <div className="relative flex-shrink-0 w-20 h-20">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="36" fill="none" stroke="#f0f0f0" strokeWidth="6" />
              <circle
                cx="40" cy="40" r="36" fill="none"
                stroke={secColor} strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-black text-gray-800">{pct}%</span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-800 text-sm mb-1">
              Sécurité du compte : <span style={{ color: secColor }}>{secLabel}</span>
            </p>
            {/* Lightning bolts */}
            <div className="flex gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Zap
                  key={i}
                  size={16}
                  className={i < boltsFilled ? "fill-current" : "opacity-20"}
                  style={{ color: i < boltsFilled ? secColor : "#9ca3af" }}
                />
              ))}
            </div>
            <p className="text-[11px] text-gray-400">Dernière adresse IP de connexion : —</p>
            <p className="text-[11px] text-gray-400">Dernière connexion : —</p>
          </div>
        </div>

        {/* Warning banner */}
        {pct < 60 && (
          <div className="mx-4 mb-4 rounded-xl px-4 py-3 bg-red-50 border border-red-200 text-center">
            <p className="text-xs font-bold text-red-600 leading-relaxed">
              Le niveau de sécurité de votre compte est faible. Veuillez compléter vos informations de sécurité.
            </p>
          </div>
        )}
      </div>

      {/* ── SECURITY ITEMS LIST ── */}
      <div className="mx-4 mt-3 bg-white rounded-2xl shadow-sm overflow-hidden">
        {SECURITY_ITEMS.map((item, i) => (
          <Link key={item.id} href={item.href}>
            <motion.div whileTap={{ backgroundColor: "#f9fafb" }}
              className="flex items-center gap-4 px-4 py-4 cursor-pointer"
              style={{ borderBottom: i < SECURITY_ITEMS.length - 1 ? "1px solid #f3f4f6" : "none" }}>
              {/* Status icon */}
              <div className="flex-shrink-0">
                {item.completed
                  ? <CheckCircle2 size={22} className="text-green-500" />
                  : <AlertCircle  size={22} className="text-red-500" />}
              </div>
              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 leading-snug">{item.label}</p>
                <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2">{item.sub}</p>
              </div>
              <ChevronRight size={15} className="text-gray-300 flex-shrink-0" />
            </motion.div>
          </Link>
        ))}
      </div>

      {/* ── LOGOUT ── */}
      <div className="mx-4 mt-3 bg-white rounded-2xl shadow-sm overflow-hidden">
        <motion.button whileTap={{ backgroundColor: "#fef2f2" }}
          onClick={logout}
          className="w-full flex items-center gap-4 px-4 py-4 cursor-pointer">
          <LogOut size={20} className="text-red-500 flex-shrink-0" />
          <span className="text-sm font-bold text-red-500">Déconnexion Mag</span>
        </motion.button>
      </div>
    </div>
  );
}
