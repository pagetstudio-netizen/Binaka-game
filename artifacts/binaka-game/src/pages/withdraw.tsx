import { useState, useEffect } from "react";
import { useCreateWithdrawal, useGetBalance, getGetBalanceQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import {
  ArrowLeft, Plus, Loader2, CheckCircle2, Trash2, ChevronRight,
  Wallet, ShieldCheck, X, User, Phone, ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Types ─────────────────────────────────────────────────── */
type Screen = "wallets" | "add-form" | "amount" | "confirm" | "success";

type SavedWallet = {
  id: string;
  operator: string;
  country: string;
  countryFlag: string;
  name: string;
  phone: string;
};

/* ── Data ─────────────────────────────────────────────────── */
const OPERATORS = [
  { id: "TMONEY",       label: "TMoney",       color: "#dc2626", bg: "#fff1f2", emoji: "📲" },
  { id: "FLOOZ",        label: "Moov Flooz",   color: "#16a34a", bg: "#f0fdf4", emoji: "💚" },
  { id: "AIRTEL",       label: "Airtel Money", color: "#b91c1c", bg: "#fff1f2", emoji: "❤️" },
  { id: "ORANGE_MONEY", label: "Orange Money", color: "#ea580c", bg: "#fff7ed", emoji: "🟠" },
  { id: "MTN",          label: "MTN MoMo",     color: "#ca8a04", bg: "#fefce8", emoji: "💛" },
  { id: "WAVE",         label: "Wave",         color: "#2563eb", bg: "#eff6ff", emoji: "🌊" },
];

const COUNTRIES = [
  { id: "TG", label: "Togo",           flag: "🇹🇬" },
  { id: "CI", label: "Côte d'Ivoire",  flag: "🇨🇮" },
  { id: "SN", label: "Sénégal",        flag: "🇸🇳" },
  { id: "CM", label: "Cameroun",       flag: "🇨🇲" },
  { id: "BJ", label: "Bénin",          flag: "🇧🇯" },
  { id: "BF", label: "Burkina Faso",   flag: "🇧🇫" },
  { id: "ML", label: "Mali",           flag: "🇲🇱" },
  { id: "GN", label: "Guinée",         flag: "🇬🇳" },
  { id: "GA", label: "Gabon",          flag: "🇬🇦" },
  { id: "CG", label: "Congo Brazza",   flag: "🇨🇬" },
  { id: "CD", label: "RDC",            flag: "🇨🇩" },
  { id: "GH", label: "Ghana",          flag: "🇬🇭" },
  { id: "NG", label: "Nigéria",        flag: "🇳🇬" },
];

const PRESETS = [2000, 5000, 10000, 20000, 50000, 100000];
const STORAGE_KEY = "binaka_wallets_v2";
const MAX_WALLETS = 15;

const fmt = (n: number) => n.toLocaleString("fr-FR");

const loadWallets = (): SavedWallet[] => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
};
const saveWallets = (list: SavedWallet[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
};

/* ── Empty State Illustration ─────────────────────────────── */
function EmptyWalletIllustration() {
  return (
    <svg viewBox="0 0 200 160" className="w-44 h-36 opacity-20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="30" width="160" height="100" rx="14" fill="#9ca3af" />
      <rect x="20" y="30" width="160" height="35" rx="14" fill="#6b7280" />
      <rect x="20" y="55" width="160" height="10" fill="#6b7280" />
      <circle cx="158" cy="48" r="14" fill="#d1d5db" />
      <circle cx="144" cy="48" r="14" fill="#9ca3af" />
      <rect x="35" y="90" width="60" height="8" rx="4" fill="#d1d5db" />
      <rect x="35" y="108" width="40" height="6" rx="3" fill="#e5e7eb" />
      <ellipse cx="100" cy="148" rx="70" ry="12" fill="#f3f4f6" />
      <line x1="60" y1="135" x2="50" y2="148" stroke="#e5e7eb" strokeWidth="3" strokeLinecap="round" />
      <line x1="140" y1="135" x2="150" y2="148" stroke="#e5e7eb" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════ */
export default function Withdraw() {
  const [screen, setScreen] = useState<Screen>("wallets");
  const [wallets, setWallets] = useState<SavedWallet[]>(loadWallets);
  const [selectedWallet, setSelectedWallet] = useState<SavedWallet | null>(null);
  const [amount, setAmount] = useState("");
  const amtNum = Number(amount) || 0;

  /* ── Add-form state ── */
  const [showOperatorPopup, setShowOperatorPopup] = useState(false);
  const [showCountryPopup, setShowCountryPopup]   = useState(false);
  const [newOp, setNewOp]       = useState(OPERATORS[0].id);
  const [newCountry, setNewCountry] = useState(COUNTRIES[0]);
  const [newName, setNewName]   = useState("");
  const [newPhone, setNewPhone] = useState("");

  const { data: walletData } = useGetBalance({ query: { queryKey: getGetBalanceQueryKey() } });
  const createWithdrawal = useCreateWithdrawal();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const balance = walletData?.balance ?? 0;
  const selectedOp = OPERATORS.find(o => o.id === newOp) || OPERATORS[0];
  const selectedWalletOp = selectedWallet
    ? OPERATORS.find(o => o.id === selectedWallet.operator) || OPERATORS[0]
    : OPERATORS[0];

  /* ── Handle back ── */
  const handleBack = () => {
    if (screen === "wallets")  { setLocation("/"); return; }
    if (screen === "add-form") { setScreen("wallets"); return; }
    if (screen === "amount")   { setScreen("wallets"); return; }
    if (screen === "confirm")  { setScreen("amount");  return; }
    setLocation("/");
  };

  /* ── Save new wallet ── */
  const handleSaveWallet = () => {
    if (!newName.trim()) {
      toast({ title: "Nom requis", description: "Entrez le nom du compte", variant: "destructive" }); return;
    }
    if (!newPhone.trim()) {
      toast({ title: "Numéro requis", description: "Entrez le numéro de téléphone", variant: "destructive" }); return;
    }
    if (wallets.length >= MAX_WALLETS) {
      toast({ title: "Limite atteinte", description: `Maximum ${MAX_WALLETS} portefeuilles`, variant: "destructive" }); return;
    }
    const newWallet: SavedWallet = {
      id: Date.now().toString(),
      operator: newOp,
      country: newCountry.label,
      countryFlag: newCountry.flag,
      name: newName.trim(),
      phone: newPhone.trim(),
    };
    const updated = [...wallets, newWallet];
    setWallets(updated);
    saveWallets(updated);
    setNewName(""); setNewPhone("");
    setScreen("wallets");
    toast({ title: "✅ Portefeuille ajouté", className: "bg-green-600 text-white border-none" });
  };

  /* ── Delete wallet ── */
  const handleDelete = (id: string) => {
    const updated = wallets.filter(w => w.id !== id);
    setWallets(updated);
    saveWallets(updated);
    if (selectedWallet?.id === id) setSelectedWallet(null);
  };

  /* ── Select wallet → go to amount ── */
  const handleSelectWallet = (w: SavedWallet) => {
    setSelectedWallet(w);
    setAmount("");
    setScreen("amount");
  };

  /* ── Submit withdrawal ── */
  const handleWithdraw = async () => {
    if (!selectedWallet) return;
    try {
      await createWithdrawal.mutateAsync({
        data: { amount: amtNum, method: selectedWallet.operator, phone: selectedWallet.phone, walletAddress: null }
      });
      setScreen("success");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message || "Impossible de créer le retrait" });
    }
  };

  /* ── Header title by screen ── */
  const headerTitle: Record<Screen, string> = {
    "wallets":  "Portefeuille de retrait",
    "add-form": "Lier un portefeuille",
    "amount":   "Montant du retrait",
    "confirm":  "Confirmation",
    "success":  "Retrait envoyé",
  };

  return (
    <div className="flex flex-col w-full min-h-[100dvh]" style={{ background: "#EAF8F2" }}>

      {/* ── HEADER ── */}
      <div className="bg-green-700 px-4 pt-10 pb-4 flex items-center relative">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleBack}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-white/15 shrink-0"
        >
          <ArrowLeft size={18} className="text-white" />
        </motion.button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-white font-black text-base tracking-wide text-center px-12 leading-tight">
          {headerTitle[screen]}
        </h1>
      </div>

      {/* ── CONTENT ── */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">

          {/* ════════════════════════════════ SCREEN: WALLETS ════ */}
          {screen === "wallets" && (
            <motion.div
              key="wallets"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="flex flex-col min-h-full"
            >
              {/* Count badge */}
              <div className="px-4 pt-4 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                  <span className="text-sm text-gray-500 font-medium">
                    Portefeuilles liés :
                    <span className="font-black text-gray-800 ml-1">{wallets.length}</span>
                  </span>
                </div>
              </div>

              {wallets.length === 0 ? (
                /* Empty state */
                <div className="flex-1 flex flex-col items-center justify-center pb-24 gap-3">
                  <EmptyWalletIllustration />
                  <p className="text-gray-400 font-medium text-sm">Aucun portefeuille lié</p>
                  <p className="text-gray-300 text-xs">Un maximum de {MAX_WALLETS} est autorisé</p>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowOperatorPopup(true)}
                    className="mt-4 w-14 h-14 rounded-full bg-red-500 flex items-center justify-center shadow-lg"
                    style={{ boxShadow: "0 6px 24px rgba(239,68,68,0.45)" }}
                  >
                    <Plus size={28} className="text-white" />
                  </motion.button>
                </div>
              ) : (
                /* Wallet list */
                <div className="flex-1 px-4 pt-2 pb-28 space-y-3">
                  {wallets.map((w) => {
                    const op = OPERATORS.find(o => o.id === w.operator) || OPERATORS[0];
                    return (
                      <motion.div
                        key={w.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
                      >
                        {/* Operator color strip */}
                        <div className="h-1.5" style={{ background: op.color }} />
                        <div className="p-4 flex items-center gap-3">
                          <div
                            className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                            style={{ background: op.bg }}
                          >
                            {op.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black" style={{ color: op.color }}>{op.label}</span>
                              <span className="text-[10px] text-gray-400">{w.countryFlag} {w.country}</span>
                            </div>
                            <p className="text-sm font-black text-gray-900 truncate">{w.name}</p>
                            <p className="text-xs text-gray-500 font-medium">{w.phone}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleDelete(w.id)}
                              className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center"
                            >
                              <Trash2 size={13} className="text-red-400" />
                            </button>
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleSelectWallet(w)}
                              className="h-9 px-4 rounded-full text-xs font-black text-white flex items-center gap-1"
                              style={{ background: op.color }}
                            >
                              Retirer
                              <ChevronRight size={13} />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Add more button */}
                  {wallets.length < MAX_WALLETS && (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setShowOperatorPopup(true)}
                      className="w-full h-14 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center gap-2 text-gray-400 font-bold text-sm"
                    >
                      <Plus size={18} />
                      Ajouter un portefeuille
                    </motion.button>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ════════════════════════════════ SCREEN: ADD-FORM ══ */}
          {screen === "add-form" && (
            <motion.div
              key="add-form"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="px-4 pt-4 pb-10 space-y-4"
            >
              {/* Operator tabs */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                  Type de portefeuille électronique
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {OPERATORS.map((op) => (
                    <button
                      key={op.id}
                      onClick={() => setNewOp(op.id)}
                      className="flex-shrink-0 px-4 py-2 rounded-xl border-2 text-xs font-black transition-all"
                      style={{
                        background: newOp === op.id ? op.bg : "#f9fafb",
                        borderColor: newOp === op.id ? op.color : "#e5e7eb",
                        color: newOp === op.id ? op.color : "#6b7280",
                      }}
                    >
                      {op.emoji} {op.label}
                    </button>
                  ))}
                </div>

                {/* Selected type display */}
                <div
                  className="mt-3 px-4 py-3 rounded-xl flex items-center gap-2 border-2"
                  style={{ borderColor: selectedOp.color, background: selectedOp.bg }}
                >
                  <span className="text-lg">{selectedOp.emoji}</span>
                  <span className="text-sm font-black" style={{ color: selectedOp.color }}>
                    {selectedOp.label}
                  </span>
                </div>
              </div>

              {/* Country + Name + Phone */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
                {/* Country selector */}
                <button
                  onClick={() => setShowCountryPopup(true)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 border-gray-200 bg-gray-50 text-left"
                >
                  <span className="text-2xl">{newCountry.flag}</span>
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Pays</p>
                    <p className="text-sm font-black text-gray-800">{newCountry.label}</p>
                  </div>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>

                {/* Name */}
                <div className="relative">
                  <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="* Nom réel du compte"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full h-13 pl-10 pr-4 rounded-xl text-sm font-semibold outline-none text-gray-900 placeholder:text-gray-300 bg-gray-50 border-2 border-gray-200 focus:border-green-500 transition-colors"
                  />
                </div>
                <p className="text-xs text-red-500 font-semibold px-1 -mt-1">
                  Veuillez vous assurer que le nom correspond aux informations de retrait afin d'éviter toute déception.
                </p>

                {/* Phone */}
                <div className="relative">
                  <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="* Numéro de compte"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full h-13 pl-10 pr-4 rounded-xl text-sm font-semibold outline-none text-gray-900 placeholder:text-gray-300 bg-gray-50 border-2 border-gray-200 focus:border-green-500 transition-colors"
                  />
                </div>
              </div>

              {/* Save */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSaveWallet}
                className="w-full h-14 rounded-2xl font-black text-white text-base flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg,#16a34a,#22c55e)", boxShadow: "0 8px 28px rgba(34,197,94,0.35)" }}
              >
                <Wallet size={18} />
                Enregistrer le portefeuille
              </motion.button>
            </motion.div>
          )}

          {/* ════════════════════════════════ SCREEN: AMOUNT ═══ */}
          {screen === "amount" && selectedWallet && (
            <motion.div
              key="amount"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="px-4 pt-4 pb-10 space-y-4"
            >
              {/* Selected wallet card */}
              <div
                className="rounded-2xl p-4 flex items-center gap-3 border-2"
                style={{ background: selectedWalletOp.bg, borderColor: selectedWalletOp.color + "60" }}
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: "white" }}
                >
                  {selectedWalletOp.emoji}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black" style={{ color: selectedWalletOp.color }}>{selectedWalletOp.label}</p>
                  <p className="text-sm font-black text-gray-900">{selectedWallet.name}</p>
                  <p className="text-xs text-gray-500">{selectedWallet.countryFlag} {selectedWallet.phone}</p>
                </div>
                <CheckCircle2 size={20} style={{ color: selectedWalletOp.color }} />
              </div>

              {/* Solde */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500 font-medium">Solde disponible</span>
                <span className="font-black text-amber-500 text-base">{fmt(balance)} <span className="text-xs text-gray-400">FCFA</span></span>
              </div>

              {/* Presets */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Montant rapide</p>
                <div className="grid grid-cols-3 gap-2">
                  {PRESETS.map((val) => (
                    <button
                      key={val}
                      onClick={() => setAmount(val.toString())}
                      className="py-2.5 rounded-xl text-xs font-black transition-all border-2"
                      style={{
                        background: amount === val.toString() ? "#fef3c7" : "#f9fafb",
                        borderColor: amount === val.toString() ? "#f59e0b" : "#e5e7eb",
                        color: amount === val.toString() ? "#b45309" : "#6b7280",
                      }}
                    >
                      {fmt(val)}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Ou saisir un montant"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full h-13 pl-4 pr-16 rounded-xl text-sm font-bold outline-none text-gray-900 placeholder:text-gray-300 bg-gray-50 border-2 border-gray-200 focus:border-amber-400 transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">FCFA</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400 font-bold px-1">
                  <span>Min: 2 000 FCFA</span>
                  <span>Max: 500 000 FCFA</span>
                </div>
              </div>

              {amtNum > balance && balance > 0 && (
                <div className="rounded-xl px-4 py-3 bg-red-50 border border-red-200">
                  <span className="text-red-500 text-xs font-black">⚠ Solde insuffisant ({fmt(balance)} FCFA disponible)</span>
                </div>
              )}

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  if (!amount || amtNum < 2000) {
                    toast({ title: "Montant invalide", description: "Minimum 2 000 FCFA", variant: "destructive" }); return;
                  }
                  if (amtNum > balance) {
                    toast({ title: "Solde insuffisant", variant: "destructive" }); return;
                  }
                  setScreen("confirm");
                }}
                className="w-full h-14 rounded-2xl font-black text-white text-base flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg,#b45309,#f59e0b)", boxShadow: "0 8px 28px rgba(245,158,11,0.35)" }}
              >
                Continuer
                <ChevronRight size={18} />
              </motion.button>
            </motion.div>
          )}

          {/* ════════════════════════════════ SCREEN: CONFIRM ══ */}
          {screen === "confirm" && selectedWallet && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="px-4 pt-4 pb-10 space-y-4"
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <div className="px-5 py-4 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-amber-600" />
                  <span className="text-sm font-black text-amber-700">Récapitulatif du retrait</span>
                </div>
                {[
                  { label: "Montant",           value: `${fmt(amtNum)} FCFA`, color: "#b45309" },
                  { label: "Opérateur",          value: `${selectedWalletOp.emoji} ${selectedWalletOp.label}`, color: selectedWalletOp.color },
                  { label: "Bénéficiaire",       value: selectedWallet.name, color: "#111827" },
                  { label: "Numéro",             value: selectedWallet.phone, color: "#111827" },
                  { label: "Pays",               value: `${selectedWallet.countryFlag} ${selectedWallet.country}`, color: "#111827" },
                  { label: "Solde après retrait",value: `${fmt(balance - amtNum)} FCFA`, color: "#6b7280" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <span className="text-sm text-gray-500">{label}</span>
                    <span className="text-sm font-black" style={{ color }}>{value}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-xl px-4 py-3 bg-blue-50 border border-blue-100 flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">ℹ️</span>
                <p className="text-xs text-blue-700 font-medium leading-relaxed">
                  Les retraits sont traités en moins de 15 minutes. Vérifiez les informations avant de confirmer.
                </p>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleWithdraw}
                disabled={createWithdrawal.isPending}
                className="w-full h-14 rounded-2xl font-black text-white text-base flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#b45309,#f59e0b)", boxShadow: "0 8px 28px rgba(245,158,11,0.35)" }}
              >
                {createWithdrawal.isPending && <Loader2 className="animate-spin" size={18} />}
                CONFIRMER LE RETRAIT
              </motion.button>
            </motion.div>
          )}

          {/* ════════════════════════════════ SCREEN: SUCCESS ══ */}
          {screen === "success" && selectedWallet && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-14 px-6 gap-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 10 }}
                className="w-24 h-24 rounded-full flex items-center justify-center bg-amber-100 border-2 border-amber-300"
              >
                <CheckCircle2 size={52} className="text-amber-500" />
              </motion.div>
              <div className="text-center">
                <h2 className="text-2xl font-black text-gray-900 mb-2">Demande envoyée !</h2>
                <p className="text-gray-500 text-sm max-w-xs">
                  Votre retrait de{" "}
                  <span className="font-black text-amber-600">{fmt(amtNum)} FCFA</span>{" "}
                  via <span className="font-bold">{selectedWalletOp.label}</span> est en cours de traitement.
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100">
                  <span className="text-xs text-blue-600 font-bold">⏱ Traitement en moins de 15 min</span>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setLocation("/")}
                className="w-full max-w-xs h-14 rounded-2xl font-black text-white text-base"
                style={{ background: "linear-gradient(135deg,#b45309,#f59e0b)", boxShadow: "0 8px 28px rgba(245,158,11,0.30)" }}
              >
                Retour à l'accueil
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ════════════════ OVERLAY: OPERATOR POPUP ════════════════ */}
      <AnimatePresence>
        {showOperatorPopup && (
          <>
            <motion.div
              key="op-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowOperatorPopup(false)}
            />
            <motion.div
              key="op-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 pb-safe"
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <h3 className="text-base font-black text-gray-900">Ajouter un nouveau</h3>
                <button onClick={() => setShowOperatorPopup(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <X size={16} className="text-gray-500" />
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                {OPERATORS.map((op) => (
                  <button
                    key={op.id}
                    onClick={() => { setNewOp(op.id); setShowOperatorPopup(false); setScreen("add-form"); }}
                    className="w-full flex items-center gap-4 px-5 py-4 active:bg-gray-50 transition-colors"
                  >
                    <span className="text-2xl">{op.emoji}</span>
                    <span className="text-base font-black" style={{ color: op.color }}>{op.label}</span>
                    <ChevronRight size={16} className="ml-auto text-gray-300" />
                  </button>
                ))}
              </div>
              <div className="px-5 py-4">
                <button
                  onClick={() => setShowOperatorPopup(false)}
                  className="w-full h-12 rounded-2xl border-2 border-gray-200 text-gray-500 font-black text-sm"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ════════════════ OVERLAY: COUNTRY POPUP ════════════════ */}
      <AnimatePresence>
        {showCountryPopup && (
          <>
            <motion.div
              key="ct-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowCountryPopup(false)}
            />
            <motion.div
              key="ct-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[70vh] flex flex-col"
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
                <h3 className="text-base font-black text-gray-900">Choisir un pays</h3>
                <button onClick={() => setShowCountryPopup(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <X size={16} className="text-gray-500" />
                </button>
              </div>
              <div className="overflow-y-auto divide-y divide-gray-100">
                {COUNTRIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setNewCountry(c); setShowCountryPopup(false); }}
                    className="w-full flex items-center gap-4 px-5 py-3.5 active:bg-gray-50 transition-colors"
                  >
                    <span className="text-3xl">{c.flag}</span>
                    <span className="text-base font-semibold text-gray-800">{c.label}</span>
                    {newCountry.id === c.id && (
                      <CheckCircle2 size={18} className="ml-auto text-green-500" />
                    )}
                  </button>
                ))}
              </div>
              <div className="px-5 py-4 flex-shrink-0 border-t border-gray-100">
                <button
                  onClick={() => setShowCountryPopup(false)}
                  className="w-full h-12 rounded-2xl border-2 border-gray-200 text-gray-500 font-black text-sm"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
