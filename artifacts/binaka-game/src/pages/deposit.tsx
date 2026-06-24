import { useState } from "react";
import { useCreateDeposit, useGetBalance, getGetBalanceQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import cryptoIcon from "@assets/cryptocurrency-3d-icon-png-download-5701572_1782317809007.png";
import mobileMoneyIcon from "@assets/20260619_074037_1782317822572.png";

type Step = "method" | "form" | "success";

const QUICK_AMOUNTS = [1000, 2000, 5000, 10000, 20000, 50000];

const pageVariants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

export default function Deposit() {
  const [step, setStep] = useState<Step>("method");
  const [payMethod, setPayMethod] = useState<"MOBILE_MONEY" | "CRYPTO">("MOBILE_MONEY");
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");

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
      toast({ title: "Crypto Monnaie", description: "La recharge USDT sera bientôt disponible. Contactez le support." });
      return;
    }
    setPayMethod(method);
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
        data: { amount: amt, method: payMethod, phone, walletAddress: null }
      });
      setStep("success");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message || "Impossible de créer le dépôt" });
    }
  };

  return (
    <div
      className="flex flex-col w-full min-h-[100dvh]"
      style={{ background: "linear-gradient(160deg, #0d1117 0%, #0f1f3d 50%, #0d1117 100%)" }}
    >
      {/* Header */}
      <header className="px-4 pt-10 pb-4 flex items-center gap-3 relative">
        <button
          onClick={handleBack}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-lg font-extrabold text-white flex-1 text-center tracking-wide">
          {step === "method" ? "Recharger" : step === "form" ? "Mobile Money" : "Succès"}
        </h1>
        <div className="w-9" />
      </header>

      {/* Balance pill */}
      <div className="mx-4 mb-6">
        <div
          className="rounded-2xl px-5 py-3 flex items-center justify-between"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
        >
          <span className="text-sm font-semibold text-white/60">Solde disponible</span>
          <span className="text-lg font-extrabold text-amber-400">
            {(wallet?.balance ?? 0).toLocaleString("fr-FR")}
            <span className="text-sm font-bold text-white/40 ml-1">FCFA</span>
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-8">
        <AnimatePresence mode="wait">

          {/* ÉTAPE 1 — Choix méthode */}
          {step === "method" && (
            <motion.div key="method" {...pageVariants} transition={{ duration: 0.25 }} className="space-y-4">
              <p className="text-white/60 text-sm font-medium text-center mb-6">
                Choisissez votre mode de recharge
              </p>

              {/* Mobile Money */}
              <button
                onClick={() => handleSelectMethod("MOBILE_MONEY")}
                className="w-full rounded-3xl p-6 flex flex-col items-center gap-4 transition-all active:scale-95 hover:scale-[1.02]"
                style={{
                  background: "linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(16,185,129,0.08) 100%)",
                  border: "1.5px solid rgba(34,197,94,0.4)",
                  boxShadow: "0 8px 32px rgba(34,197,94,0.15)",
                }}
              >
                <img
                  src={mobileMoneyIcon}
                  alt="Mobile Money"
                  className="w-40 h-auto object-contain drop-shadow-xl"
                />
                <div className="text-center">
                  <div className="text-xl font-extrabold text-white tracking-wide">MOBILE MONEY</div>
                  <div className="text-sm text-white/50 mt-1">TMoney · Flooz · Airtel Money</div>
                  <div className="mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold text-green-400" style={{ background: "rgba(34,197,94,0.12)" }}>
                    Min: 1 000 FCFA
                  </div>
                </div>
              </button>

              {/* Crypto */}
              <button
                onClick={() => handleSelectMethod("CRYPTO")}
                className="w-full rounded-3xl p-6 flex flex-col items-center gap-4 transition-all active:scale-95 hover:scale-[1.02]"
                style={{
                  background: "linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(245,158,11,0.08) 100%)",
                  border: "1.5px solid rgba(251,191,36,0.4)",
                  boxShadow: "0 8px 32px rgba(251,191,36,0.12)",
                }}
              >
                <img
                  src={cryptoIcon}
                  alt="Crypto Monnaie"
                  className="w-36 h-auto object-contain drop-shadow-xl"
                />
                <div className="text-center">
                  <div className="text-xl font-extrabold text-white tracking-wide">CRYPTO MONNAIE</div>
                  <div className="text-sm text-white/50 mt-1">USDT · BTC · ETH</div>
                  <div className="mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold text-amber-400" style={{ background: "rgba(251,191,36,0.12)" }}>
                    Bientôt disponible
                  </div>
                </div>
              </button>
            </motion.div>
          )}

          {/* ÉTAPE 2 — Formulaire Mobile Money */}
          {step === "form" && (
            <motion.div key="form" {...pageVariants} transition={{ duration: 0.25 }} className="space-y-4">

              {/* Info canal */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  <span className="text-sm text-white/50 font-medium">Canal De Recharge</span>
                  <span className="text-sm font-bold text-green-400">Mobile Money</span>
                </div>
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-sm text-white/50 font-medium leading-tight">
                    Montant Min ~ Max
                  </span>
                  <span className="text-sm font-semibold text-white/80">
                    1 000 ~ 2 000 000 FCFA
                  </span>
                </div>
              </div>

              {/* Montants rapides */}
              <div
                className="rounded-2xl p-5 space-y-5"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <div>
                  <p className="text-sm font-semibold text-white/70 mb-3">Choisissez Le Montant</p>
                  <div className="grid grid-cols-3 gap-2">
                    {QUICK_AMOUNTS.map((val) => (
                      <button
                        key={val}
                        onClick={() => setAmount(val.toString())}
                        className={`py-3 rounded-xl text-sm font-bold border transition-all ${
                          amount === val.toString()
                            ? "border-green-500 bg-green-500/20 text-green-400"
                            : "border-white/10 bg-white/5 text-white/60 hover:border-green-500/50 hover:text-white/80"
                        }`}
                      >
                        {val.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Champ montant */}
                <div>
                  <p className="text-sm font-semibold text-white/70 mb-2">Montant De La Recharge</p>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Veuillez entrer le montant"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full h-13 pr-16 pl-4 text-base font-semibold rounded-xl outline-none text-white placeholder:text-white/30"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        border: "1.5px solid rgba(255,255,255,0.15)",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "rgba(34,197,94,0.7)")}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.15)")}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-white/40">FCFA</span>
                  </div>
                </div>

                {/* Numéro de téléphone */}
                <div>
                  <p className="text-sm font-semibold text-white/70 mb-2">Numéro de téléphone</p>
                  <input
                    type="tel"
                    placeholder="Ex: 90 00 00 00"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-13 px-4 text-base font-semibold rounded-xl outline-none text-white placeholder:text-white/30"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1.5px solid rgba(255,255,255,0.15)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(34,197,94,0.7)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.15)")}
                  />
                </div>
              </div>

              {/* Boutons */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleDeposit}
                  disabled={createDeposit.isPending}
                  className="w-full h-14 text-base font-extrabold rounded-full text-white transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{
                    background: "linear-gradient(135deg, #16a34a, #15803d)",
                    boxShadow: "0 6px 0 #14532d, 0 8px 20px rgba(22,163,74,0.4)",
                  }}
                >
                  {createDeposit.isPending ? <Loader2 className="animate-spin w-5 h-5" /> : null}
                  Recharger maintenant
                </button>

                <button
                  onClick={() => toast({ title: "Guide de recharge", description: "Effectuez un virement Mobile Money sur le numéro indiqué par l'administrateur, puis soumettez votre demande." })}
                  className="w-full h-14 text-base font-bold rounded-full border-2 text-amber-400 hover:bg-amber-400/10 transition-all"
                  style={{ borderColor: "rgba(251,191,36,0.5)", background: "rgba(251,191,36,0.07)" }}
                >
                  Comment recharger ?
                </button>
              </div>
            </motion.div>
          )}

          {/* ÉTAPE 3 — Succès */}
          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-16 gap-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 10 }}
                className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{ background: "rgba(34,197,94,0.15)", border: "2px solid rgba(34,197,94,0.4)" }}
              >
                <CheckCircle2 className="w-14 h-14 text-green-400" />
              </motion.div>
              <div className="text-center">
                <h2 className="text-2xl font-extrabold text-white mb-2">Demande envoyée !</h2>
                <p className="text-white/50 text-sm max-w-xs">
                  Votre demande de recharge de{" "}
                  <span className="font-bold text-green-400">{Number(amount).toLocaleString()} FCFA</span>{" "}
                  via Mobile Money est en cours de traitement.
                </p>
                <p className="text-xs text-white/30 mt-3">
                  Votre solde sera mis à jour après vérification (quelques minutes).
                </p>
              </div>
              <button
                onClick={() => setLocation("/")}
                className="w-full max-w-xs h-14 rounded-full font-bold text-white text-base transition-all active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #16a34a, #15803d)",
                  boxShadow: "0 6px 0 #14532d, 0 8px 20px rgba(22,163,74,0.35)",
                }}
              >
                Retour à l'accueil
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
