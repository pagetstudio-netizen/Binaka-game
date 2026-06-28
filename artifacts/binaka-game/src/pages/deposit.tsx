import { useState } from "react";
import { useCreateDeposit, useGetBalance, getGetBalanceQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { ArrowLeft, Loader2, CheckCircle2, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import cryptoIcon from "@assets/cryptocurrency-3d-icon-png-download-5701572_1782610138485.png";
import mobileMoneyIcon from "@assets/20260619_074037_1782610122327.png";

type Step = "method" | "form" | "success";

const QUICK_AMOUNTS = [1000, 2000, 5000, 10000, 20000, 50000];

const OPERATORS = [
  { id: "TMONEY",       label: "TMoney",       color: "#dc2626" },
  { id: "FLOOZ",        label: "Moov Flooz",   color: "#16a34a" },
  { id: "AIRTEL",       label: "Airtel Money", color: "#b91c1c" },
  { id: "ORANGE_MONEY", label: "Orange Money", color: "#ea580c" },
  { id: "MTN",          label: "MTN MoMo",     color: "#ca8a04" },
  { id: "WAVE",         label: "Wave",         color: "#2563eb" },
];

export default function Deposit() {
  const [step, setStep] = useState<Step>("method");
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [operator, setOperator] = useState(OPERATORS[0].id);

  const { data: wallet } = useGetBalance({ query: { queryKey: getGetBalanceQueryKey() } });
  const createDeposit = useCreateDeposit();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleBack = () => {
    if (step === "method") setLocation("/");
    else if (step === "form") setStep("method");
    else setLocation("/");
  };

  const handleSelectMethod = (method: "MOBILE_MONEY" | "CRYPTO") => {
    if (method === "CRYPTO") {
      toast({ title: "Crypto Monnaie", description: "La recharge crypto sera bientôt disponible. Contactez le support." });
      return;
    }
    setStep("form");
  };

  const handleDeposit = async () => {
    const amt = Number(amount);
    if (!amount || isNaN(amt) || amt < 1000) {
      toast({ title: "Montant invalide", description: "Le montant minimum est de 1 000 FCFA", variant: "destructive" });
      return;
    }
    if (!phone) {
      toast({ title: "Numéro requis", description: "Veuillez entrer votre numéro de téléphone", variant: "destructive" });
      return;
    }
    try {
      await createDeposit.mutateAsync({
        data: { amount: amt, method: "MOBILE_MONEY", phone, walletAddress: null }
      });
      setStep("success");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message || "Impossible de créer le dépôt" });
    }
  };

  const selectedOp = OPERATORS.find(o => o.id === operator) || OPERATORS[0];

  return (
    <div
      className="flex flex-col w-full min-h-[100dvh] select-none"
      style={{ background: "linear-gradient(180deg,#091a0c 0%,#0d2414 55%,#102a17 100%)" }}
    >
      {/* ── HEADER ── */}
      <div className="flex items-center px-4 pt-12 pb-5 relative">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleBack}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.10)" }}
        >
          <ArrowLeft size={20} className="text-white" />
        </motion.button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-white font-black text-lg tracking-wide">
          Recharger
        </h1>
      </div>

      {/* ── BALANCE PILL ── */}
      <div className="mx-4 mb-5">
        <div
          className="rounded-2xl px-5 py-3.5 flex items-center justify-between"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.11)" }}
        >
          <span className="text-white/55 text-sm font-medium">Solde disponible</span>
          <span className="font-black text-amber-400 text-lg">
            {(wallet?.balance ?? 0).toLocaleString("fr-FR")}
            <span className="text-sm font-bold text-white/40 ml-1">FCFA</span>
          </span>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="flex-1 px-4 pb-10">
        <AnimatePresence mode="wait">

          {/* ══ ÉTAPE 1 — Choix mode ══ */}
          {step === "method" && (
            <motion.div
              key="method"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.22 }}
              className="space-y-4"
            >
              <p className="text-white/40 text-sm text-center mb-6 tracking-wide">
                Choisissez votre mode de recharge
              </p>

              {/* Mobile Money */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSelectMethod("MOBILE_MONEY")}
                className="w-full rounded-3xl p-7 flex flex-col items-center gap-4 relative overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.055)",
                  border: "1.5px solid rgba(34,197,94,0.35)",
                }}
              >
                <div
                  className="absolute inset-0 rounded-3xl pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at 50% 0%,rgba(34,197,94,0.10) 0%,transparent 65%)" }}
                />
                <img
                  src={mobileMoneyIcon}
                  alt="Mobile Money"
                  className="w-40 h-auto object-contain drop-shadow-2xl relative z-10"
                />
                <div className="text-center relative z-10">
                  <div className="text-white font-black text-xl tracking-widest">MOBILE MONEY</div>
                  <div className="text-white/45 text-sm mt-1">TMoney · Flooz · Airtel Money</div>
                  <div
                    className="mt-3 inline-block px-4 py-1.5 rounded-full text-xs font-black text-green-400"
                    style={{ background: "rgba(34,197,94,0.13)", border: "1px solid rgba(34,197,94,0.28)" }}
                  >
                    Min: 1 000 FCFA
                  </div>
                </div>
              </motion.button>

              {/* Crypto */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSelectMethod("CRYPTO")}
                className="w-full rounded-3xl p-7 flex flex-col items-center gap-4 relative overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.055)",
                  border: "1.5px solid rgba(251,191,36,0.28)",
                }}
              >
                <div
                  className="absolute inset-0 rounded-3xl pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at 50% 0%,rgba(251,191,36,0.07) 0%,transparent 65%)" }}
                />
                <img
                  src={cryptoIcon}
                  alt="Crypto"
                  className="w-32 h-auto object-contain drop-shadow-2xl relative z-10"
                />
                <div className="text-center relative z-10">
                  <div className="text-white font-black text-xl tracking-widest">CRYPTO MONNAIE</div>
                  <div className="text-white/45 text-sm mt-1">USDT · BTC · ETH</div>
                  <div
                    className="mt-3 inline-block px-4 py-1.5 rounded-full text-xs font-black text-amber-400"
                    style={{ background: "rgba(251,191,36,0.10)", border: "1px solid rgba(251,191,36,0.28)" }}
                  >
                    Bientôt disponible
                  </div>
                </div>
              </motion.button>
            </motion.div>
          )}

          {/* ══ ÉTAPE 2 — Formulaire ══ */}
          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.22 }}
              className="space-y-4"
            >
              {/* Info */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
              >
                <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <span className="text-white/50 text-sm">Canal</span>
                  <span className="text-green-400 text-sm font-black">Mobile Money</span>
                </div>
                <div className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-white/50 text-sm">Min ~ Max</span>
                  <span className="text-white text-sm font-bold">1 000 ~ 2 000 000 FCFA</span>
                </div>
              </div>

              {/* Opérateur */}
              <div
                className="rounded-2xl p-4 space-y-3"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
              >
                <p className="text-white/50 text-xs font-black uppercase tracking-widest">Opérateur</p>
                <div className="grid grid-cols-3 gap-2">
                  {OPERATORS.map((op) => (
                    <button
                      key={op.id}
                      onClick={() => setOperator(op.id)}
                      className="py-2.5 px-1 rounded-xl text-xs font-black transition-all"
                      style={{
                        background: operator === op.id ? op.color + "28" : "rgba(255,255,255,0.05)",
                        border: `1.5px solid ${operator === op.id ? op.color : "rgba(255,255,255,0.09)"}`,
                        color: operator === op.id ? op.color : "rgba(255,255,255,0.45)",
                      }}
                    >
                      {op.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Montants rapides */}
              <div
                className="rounded-2xl p-4 space-y-3"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
              >
                <p className="text-white/50 text-xs font-black uppercase tracking-widest">Montant rapide</p>
                <div className="grid grid-cols-3 gap-2">
                  {QUICK_AMOUNTS.map((val) => (
                    <button
                      key={val}
                      onClick={() => setAmount(val.toString())}
                      className="py-2.5 rounded-xl text-xs font-black transition-all"
                      style={{
                        background: amount === val.toString() ? "rgba(34,197,94,0.18)" : "rgba(255,255,255,0.05)",
                        border: `1.5px solid ${amount === val.toString() ? "rgba(34,197,94,0.55)" : "rgba(255,255,255,0.09)"}`,
                        color: amount === val.toString() ? "#4ade80" : "rgba(255,255,255,0.50)",
                      }}
                    >
                      {val.toLocaleString()}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Ou saisir un montant"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full h-12 pr-16 pl-4 rounded-xl text-sm font-bold outline-none text-white placeholder:text-white/25"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.13)" }}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-white/35">FCFA</span>
                </div>
              </div>

              {/* Téléphone */}
              <div
                className="rounded-2xl p-4 space-y-3"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
              >
                <p className="text-white/50 text-xs font-black uppercase tracking-widest">Numéro de téléphone</p>
                <div
                  className="flex items-center rounded-xl overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.13)" }}
                >
                  <Phone size={15} className="ml-4 text-white/35 shrink-0" />
                  <input
                    type="tel"
                    placeholder="Ex: 90 00 00 00"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 h-12 px-3 bg-transparent text-sm font-bold outline-none text-white placeholder:text-white/25"
                  />
                </div>
              </div>

              {/* Bouton */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleDeposit}
                disabled={createDeposit.isPending}
                className="w-full h-14 rounded-2xl font-black text-white text-base flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
                style={{
                  background: "linear-gradient(135deg,#16a34a,#22c55e)",
                  boxShadow: "0 8px 30px rgba(34,197,94,0.35)",
                }}
              >
                {createDeposit.isPending && <Loader2 className="animate-spin" size={18} />}
                RECHARGER MAINTENANT
              </motion.button>
            </motion.div>
          )}

          {/* ══ ÉTAPE 3 — Succès ══ */}
          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-16 gap-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 10 }}
                className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{ background: "rgba(34,197,94,0.15)", border: "2px solid rgba(34,197,94,0.40)" }}
              >
                <CheckCircle2 size={52} className="text-green-400" />
              </motion.div>
              <div className="text-center">
                <h2 className="text-2xl font-black text-white mb-2">Demande envoyée !</h2>
                <p className="text-white/45 text-sm max-w-xs">
                  Votre recharge de{" "}
                  <span className="font-black text-green-400">{Number(amount).toLocaleString("fr-FR")} FCFA</span>{" "}
                  est en cours de traitement.
                </p>
                <p className="text-xs text-white/25 mt-3">Votre solde sera mis à jour dans quelques minutes.</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setLocation("/")}
                className="w-full max-w-xs h-14 rounded-2xl font-black text-white text-base"
                style={{ background: "linear-gradient(135deg,#16a34a,#22c55e)", boxShadow: "0 8px 30px rgba(34,197,94,0.3)" }}
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
