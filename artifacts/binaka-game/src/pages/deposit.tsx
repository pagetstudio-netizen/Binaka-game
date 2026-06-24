import { useState } from "react";
import { useCreateDeposit, useGetBalance, getGetBalanceQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Loader2, ChevronRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Step = "method" | "operator" | "form" | "success";

const MOBILE_OPERATORS = [
  {
    id: "TMONEY",
    name: "TMoney",
    desc: "Togocel Mobile Money",
    min: 1000,
    max: 2000000,
    color: "#e11d48",
    emoji: "📱",
  },
  {
    id: "FLOOZ",
    name: "Moov Flooz",
    desc: "Moov Africa Mobile Money",
    min: 1000,
    max: 2000000,
    color: "#2563eb",
    emoji: "📲",
  },
  {
    id: "ORANGE_MONEY",
    name: "Orange Money",
    desc: "Orange Mobile Money",
    min: 1000,
    max: 2000000,
    color: "#ea580c",
    emoji: "💰",
  },
  {
    id: "MTN_MOMO",
    name: "MTN MoMo",
    desc: "MTN Mobile Money",
    min: 1000,
    max: 2000000,
    color: "#ca8a04",
    emoji: "📳",
  },
];

const QUICK_AMOUNTS = [1000, 2000, 5000, 10000];

export default function Deposit() {
  const [step, setStep] = useState<Step>("method");
  const [selectedOperator, setSelectedOperator] = useState(MOBILE_OPERATORS[0]);
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");

  const { data: wallet } = useGetBalance({ query: { queryKey: getGetBalanceQueryKey() } });
  const createDeposit = useCreateDeposit();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleDeposit = async () => {
    const amt = Number(amount);
    if (!amount || isNaN(amt) || amt < selectedOperator.min) {
      toast({ title: "Montant invalide", description: `Le montant minimum est de ${selectedOperator.min.toLocaleString()} FCFA`, variant: "destructive" });
      return;
    }
    if (!phone) {
      toast({ title: "Numéro requis", description: "Veuillez entrer votre numéro de téléphone", variant: "destructive" });
      return;
    }

    try {
      await createDeposit.mutateAsync({
        data: { amount: amt, method: selectedOperator.id, phone, walletAddress: null }
      });
      setStep("success");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message || "Impossible de créer le dépôt" });
    }
  };

  const handleCryptoDeposit = async () => {
    toast({ title: "Crypto", description: "Fonctionnalité USDT bientôt disponible. Contactez le support.", });
  };

  const pageVariants = {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  return (
    <div className="flex flex-col flex-1 w-full bg-slate-50 min-h-[100dvh]">
      {/* Header */}
      <header className="px-4 py-4 bg-white border-b border-slate-100 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <button
          onClick={() => {
            if (step === "method") setLocation("/");
            else if (step === "operator") setStep("method");
            else if (step === "form") setStep("operator");
            else setLocation("/");
          }}
          className="p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h1 className="text-lg font-bold flex-1 text-center text-slate-800">Recharger</h1>
        <div className="w-9" />
      </header>

      {/* Balance Bar */}
      <div className="mx-4 mt-4 bg-white rounded-2xl px-5 py-3 flex items-center justify-between shadow-sm border border-slate-100">
        <span className="text-sm font-semibold text-slate-500">Solde</span>
        <span className="text-lg font-extrabold text-amber-500">
          {(wallet?.balance ?? 0).toLocaleString("fr-FR")}
          <span className="text-sm font-bold text-slate-400 ml-1">FCFA</span>
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <AnimatePresence mode="wait">

          {/* STEP 1 — Choix du mode de paiement */}
          {step === "method" && (
            <motion.div key="method" {...pageVariants} transition={{ duration: 0.22 }} className="space-y-4">
              <p className="text-sm text-slate-500 font-medium mt-2">Choisissez votre mode de recharge</p>

              {/* Mobile Money Card */}
              <button
                onClick={() => setStep("operator")}
                className="w-full bg-white rounded-2xl p-5 flex items-center gap-4 border border-slate-100 shadow-sm hover:border-green-400 hover:shadow-md transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <span className="text-2xl">📱</span>
                </div>
                <div className="flex-1 text-left">
                  <div className="font-bold text-slate-800 text-base">Mobile Money</div>
                  <div className="text-xs text-slate-500 mt-0.5">TMoney · Flooz · Orange · MTN</div>
                  <div className="text-xs font-semibold text-green-600 mt-1">Min: 1 000 FCFA</div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-green-500 transition-colors" />
              </button>

              {/* Crypto Card */}
              <button
                onClick={handleCryptoDeposit}
                className="w-full bg-white rounded-2xl p-5 flex items-center gap-4 border border-slate-100 shadow-sm hover:border-amber-400 hover:shadow-md transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <span className="text-2xl">🪙</span>
                </div>
                <div className="flex-1 text-left">
                  <div className="font-bold text-slate-800 text-base">Crypto Monnaie</div>
                  <div className="text-xs text-slate-500 mt-0.5">USDT TRC20</div>
                  <div className="text-xs font-semibold text-amber-600 mt-1">Min: 2 000 FCFA</div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-amber-500 transition-colors" />
              </button>
            </motion.div>
          )}

          {/* STEP 2 — Sélection opérateur */}
          {step === "operator" && (
            <motion.div key="operator" {...pageVariants} transition={{ duration: 0.22 }} className="space-y-3">
              <p className="text-sm text-slate-500 font-medium mt-2">Sélectionnez votre opérateur</p>

              {MOBILE_OPERATORS.map((op) => (
                <button
                  key={op.id}
                  onClick={() => { setSelectedOperator(op); setStep("form"); }}
                  className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 border border-slate-100 shadow-sm hover:border-green-400 hover:shadow-md transition-all group"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm text-2xl group-hover:scale-105 transition-transform"
                    style={{ background: `${op.color}18` }}
                  >
                    {op.emoji}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-bold text-slate-800">{op.name}</div>
                    <div className="text-xs text-slate-400">{op.desc}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Min: <span className="font-semibold text-green-600">{op.min.toLocaleString()} FCFA</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-green-500 transition-colors" />
                </button>
              ))}
            </motion.div>
          )}

          {/* STEP 3 — Formulaire de recharge */}
          {step === "form" && (
            <motion.div key="form" {...pageVariants} transition={{ duration: 0.22 }} className="space-y-4">

              {/* Canal sélectionné */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
                  <span className="text-sm text-slate-500 font-medium">Canal De Recharge</span>
                  <span className="text-sm font-bold text-slate-700">{selectedOperator.name}</span>
                </div>
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-sm text-slate-500 font-medium leading-tight">Montant De Recharge<br />Minimum</span>
                  <span className="text-sm font-semibold text-slate-700">
                    {selectedOperator.min.toLocaleString()} ~ {selectedOperator.max.toLocaleString()} FCFA
                  </span>
                </div>
              </div>

              {/* Montants rapides */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-3">Choisissez Le Montant</p>
                  <div className="grid grid-cols-3 gap-2">
                    {QUICK_AMOUNTS.map((val) => (
                      <button
                        key={val}
                        onClick={() => setAmount(val.toString())}
                        className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${
                          amount === val.toString()
                            ? "border-green-500 bg-green-50 text-green-700"
                            : "border-slate-200 bg-slate-50 text-slate-600 hover:border-green-300"
                        }`}
                      >
                        {val.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Champ montant */}
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-2">Montant De La Recharge</p>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="Veuillez entrer le montant"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="h-12 pr-16 text-base font-semibold border-slate-200 rounded-xl focus-visible:ring-green-500 focus-visible:border-green-400"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">FCFA</span>
                  </div>
                </div>

                {/* Numéro de téléphone */}
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-2">Numéro de téléphone</p>
                  <Input
                    type="tel"
                    placeholder="Ex: 90 00 00 00"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-12 text-base font-semibold border-slate-200 rounded-xl focus-visible:ring-green-500 focus-visible:border-green-400"
                  />
                </div>
              </div>

              {/* Boutons */}
              <div className="space-y-3 pt-2">
                <Button
                  onClick={handleDeposit}
                  disabled={createDeposit.isPending}
                  className="w-full h-14 text-base font-extrabold rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200 border-b-4 border-green-800 active:border-b-0 active:translate-y-1 transition-all"
                >
                  {createDeposit.isPending ? <Loader2 className="animate-spin mr-2 w-5 h-5" /> : null}
                  Recharger maintenant
                </Button>
                <Button
                  variant="outline"
                  onClick={() => toast({ title: "Guide de recharge", description: "Effectuez un virement Mobile Money sur le numéro indiqué par l'administrateur, puis soumettez votre demande." })}
                  className="w-full h-14 text-base font-bold rounded-full border-2 border-amber-400 text-amber-600 hover:bg-amber-50 bg-white shadow-sm"
                >
                  Comment recharger ?
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 4 — Succès */}
          {step === "success" && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-16 gap-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 10 }}
                className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center"
              >
                <CheckCircle2 className="w-14 h-14 text-green-600" />
              </motion.div>
              <div className="text-center">
                <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Demande envoyée !</h2>
                <p className="text-slate-500 text-sm max-w-xs">
                  Votre demande de recharge de <span className="font-bold text-green-600">{Number(amount).toLocaleString()} FCFA</span> via <span className="font-bold">{selectedOperator.name}</span> est en cours de traitement.
                </p>
                <p className="text-xs text-slate-400 mt-3">Votre solde sera mis à jour après vérification (quelques minutes).</p>
              </div>
              <Button
                onClick={() => setLocation("/")}
                className="w-full max-w-xs h-13 rounded-full font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg"
              >
                Retour à l'accueil
              </Button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
