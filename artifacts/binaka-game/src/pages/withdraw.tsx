import { useState } from "react";
import { useCreateWithdrawal, useGetBalance, getGetBalanceQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { ArrowLeft, Loader2, CheckCircle2, Banknote, Phone, ShieldCheck, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Step = "amount" | "account" | "confirm" | "success";

const METHODS = [
  { id: "TMONEY",       label: "TMoney",       emoji: "🟡", color: "#dc2626", bg: "#fef2f2" },
  { id: "FLOOZ",        label: "Moov Flooz",   emoji: "💚", color: "#16a34a", bg: "#f0fdf4" },
  { id: "AIRTEL",       label: "Airtel Money", emoji: "🔴", color: "#b91c1c", bg: "#fef2f2" },
  { id: "ORANGE_MONEY", label: "Orange Money", emoji: "🟠", color: "#ea580c", bg: "#fff7ed" },
  { id: "MTN",          label: "MTN MoMo",     emoji: "💛", color: "#ca8a04", bg: "#fefce8" },
  { id: "WAVE",         label: "Wave",         emoji: "🌊", color: "#2563eb", bg: "#eff6ff" },
];

const PRESETS = [2000, 5000, 10000, 20000, 50000, 100000];

const fmt = (n: number) => n.toLocaleString("fr-FR");

export default function Withdraw() {
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState(METHODS[0].id);
  const [phone, setPhone]   = useState("");

  const { data: wallet } = useGetBalance({ query: { queryKey: getGetBalanceQueryKey() } });
  const createWithdrawal = useCreateWithdrawal();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const balance   = wallet?.balance ?? 0;
  const amtNum    = Number(amount) || 0;
  const selectedM = METHODS.find(m => m.id === method) || METHODS[0];

  const handleBack = () => {
    if (step === "amount")  setLocation("/");
    else if (step === "account")  setStep("amount");
    else if (step === "confirm")  setStep("account");
    else setLocation("/");
  };

  const goToAccount = () => {
    if (!amount || amtNum < 2000) {
      toast({ title: "Montant invalide", description: "Minimum 2 000 FCFA", variant: "destructive" }); return;
    }
    if (amtNum > balance) {
      toast({ title: "Solde insuffisant", description: `Votre solde est de ${fmt(balance)} FCFA`, variant: "destructive" }); return;
    }
    setStep("account");
  };

  const goToConfirm = () => {
    if (!phone.trim()) {
      toast({ title: "Numéro requis", description: "Veuillez entrer votre numéro de téléphone", variant: "destructive" }); return;
    }
    setStep("confirm");
  };

  const handleWithdraw = async () => {
    try {
      await createWithdrawal.mutateAsync({
        data: { amount: amtNum, method, phone: phone.trim(), walletAddress: null }
      });
      setStep("success");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message || "Impossible de créer le retrait" });
    }
  };

  const steps = ["amount", "account", "confirm"];
  const stepIdx = steps.indexOf(step === "success" ? "confirm" : step);

  return (
    <div className="flex flex-col w-full min-h-[100dvh] bg-gray-50">

      {/* ── HEADER amber gradient ── */}
      <div
        className="px-4 pt-10 pb-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#92400e 0%,#b45309 50%,#d97706 100%)" }}
      >
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-14 -left-10 w-52 h-52 rounded-full bg-white/10 pointer-events-none" />

        <div className="relative z-10 flex items-center mb-6">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleBack}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/15"
          >
            <ArrowLeft size={20} className="text-white" />
          </motion.button>
          <h1 className="absolute left-1/2 -translate-x-1/2 text-white font-black text-lg tracking-wide">Retrait</h1>
        </div>

        {/* Balance */}
        <div className="relative z-10">
          <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Solde disponible</p>
          <div className="flex items-baseline gap-2">
            <span className="text-white font-black text-4xl">{fmt(balance)}</span>
            <span className="text-white/60 font-bold text-base">FCFA</span>
          </div>
        </div>

        {/* Step progress dots */}
        {step !== "success" && (
          <div className="relative z-10 flex items-center gap-2 mt-5">
            {["Montant", "Compte", "Confirm"].map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black transition-all"
                    style={{
                      background: i <= stepIdx ? "white" : "rgba(255,255,255,0.25)",
                      color: i <= stepIdx ? "#b45309" : "rgba(255,255,255,0.6)",
                    }}
                  >
                    {i < stepIdx ? "✓" : i + 1}
                  </div>
                  <span className="text-[10px] font-bold text-white/70">{label}</span>
                </div>
                {i < 2 && <div className="w-6 h-px bg-white/25" />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── CONTENT ── */}
      <div className="flex-1 px-4 py-5 pb-10">
        <AnimatePresence mode="wait">

          {/* ══ STEP 1 — Montant ══ */}
          {step === "amount" && (
            <motion.div
              key="amount"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Presets */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Montant rapide</p>
                <div className="grid grid-cols-3 gap-2 mb-4">
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

                {/* Custom input */}
                <div className="relative">
                  <Banknote size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400" />
                  <input
                    type="number"
                    placeholder="Ou saisir un montant"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full h-13 pl-10 pr-16 rounded-xl text-sm font-bold outline-none text-gray-900 placeholder:text-gray-300 bg-gray-50 border-2 border-gray-200 focus:border-amber-400 transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">FCFA</span>
                </div>

                <div className="flex justify-between text-xs text-gray-400 font-bold px-1 mt-2">
                  <span>Min: 2 000 FCFA</span>
                  <span>Max: 500 000 FCFA</span>
                </div>
              </div>

              {/* Warning if insufficient */}
              {amtNum > balance && balance > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="rounded-xl px-4 py-3 bg-red-50 border border-red-200 flex items-center gap-2"
                >
                  <span className="text-red-500 text-xs font-black">⚠ Solde insuffisant ({fmt(balance)} FCFA disponible)</span>
                </motion.div>
              )}

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={goToAccount}
                className="w-full h-14 rounded-2xl font-black text-white text-base flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg,#b45309,#f59e0b)", boxShadow: "0 8px 28px rgba(245,158,11,0.35)" }}
              >
                Continuer
                <ChevronRight size={18} />
              </motion.button>
            </motion.div>
          )}

          {/* ══ STEP 2 — Compte ══ */}
          {step === "account" && (
            <motion.div
              key="account"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Operator selector */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Opérateur de retrait</p>
                <div className="grid grid-cols-2 gap-2">
                  {METHODS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      className="flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all"
                      style={{
                        background: method === m.id ? m.bg : "#f9fafb",
                        borderColor: method === m.id ? m.color : "#e5e7eb",
                      }}
                    >
                      <span className="text-lg">{m.emoji}</span>
                      <span
                        className="text-xs font-black"
                        style={{ color: method === m.id ? m.color : "#6b7280" }}
                      >
                        {m.label}
                      </span>
                      {method === m.id && (
                        <CheckCircle2 size={14} className="ml-auto" style={{ color: m.color }} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone number */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Numéro {selectedM.label}</p>
                <div
                  className="flex items-center rounded-xl overflow-hidden border-2 transition-colors"
                  style={{ borderColor: "#e5e7eb" }}
                >
                  <Phone size={15} className="ml-4 text-amber-400 shrink-0" />
                  <input
                    type="tel"
                    placeholder="Ex: 90 00 00 00"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 h-12 px-3 bg-transparent text-sm font-bold outline-none text-gray-900 placeholder:text-gray-300"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2 px-1">Le montant sera envoyé sur ce numéro. Vérifiez bien.</p>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={goToConfirm}
                className="w-full h-14 rounded-2xl font-black text-white text-base flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg,#b45309,#f59e0b)", boxShadow: "0 8px 28px rgba(245,158,11,0.35)" }}
              >
                Vérifier le retrait
                <ChevronRight size={18} />
              </motion.button>
            </motion.div>
          )}

          {/* ══ STEP 3 — Confirmation ══ */}
          {step === "confirm" && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Summary card */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <div className="px-5 py-4 bg-amber-50 border-b border-amber-100">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={18} className="text-amber-600" />
                    <span className="text-sm font-black text-amber-700">Récapitulatif du retrait</span>
                  </div>
                </div>
                {[
                  { label: "Montant", value: `${fmt(amtNum)} FCFA`, bold: true, color: "#b45309" },
                  { label: "Opérateur", value: selectedM.label, bold: false },
                  { label: "Numéro", value: phone, bold: false },
                  { label: "Solde après retrait", value: `${fmt(balance - amtNum)} FCFA`, bold: false },
                ].map(({ label, value, bold, color }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between px-5 py-3.5"
                    style={{ borderBottom: "1px solid #f3f4f6" }}
                  >
                    <span className="text-sm text-gray-500">{label}</span>
                    <span
                      className="text-sm font-black"
                      style={{ color: color || "#111827" }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Info */}
              <div className="rounded-xl px-4 py-3 bg-blue-50 border border-blue-100 flex items-start gap-2">
                <span className="text-blue-400 mt-0.5 text-base">ℹ️</span>
                <p className="text-xs text-blue-700 font-medium leading-relaxed">
                  Les retraits sont traités en moins de 15 minutes. Assurez-vous que le numéro est correct avant de confirmer.
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

          {/* ══ STEP 4 — Succès ══ */}
          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-14 gap-6"
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
                  via <span className="font-bold">{selectedM.label}</span> est en cours de traitement.
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
    </div>
  );
}
