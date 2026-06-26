import { useState } from "react";
import { useCreateDeposit, useGetBalance, getGetBalanceQueryKey } from "@workspace/api-client-react";
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
    <div className="flex flex-col w-full min-h-[100dvh] bg-gray-50">
      {/* Header — fixé */}
      <header className="sticky top-0 z-20 px-4 py-4 flex items-center gap-3 bg-white border-b border-gray-200 shadow-sm">
        <button
          onClick={handleBack}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-extrabold text-gray-900 flex-1 text-center tracking-wide">
          {step === "method" ? "Recharger" : step === "form" ? "Mobile Money" : "Succès"}
        </h1>
        <div className="w-9" />
      </header>

      {/* Balance pill */}
      <div className="mx-4 mt-4 mb-4">
        <div className="rounded-2xl px-5 py-3 flex items-center justify-between bg-white border border-gray-200 shadow-sm">
          <span className="text-sm font-semibold text-gray-500">Solde disponible</span>
          <span className="text-lg font-extrabold text-amber-500">
            {(wallet?.balance ?? 0).toLocaleString("fr-FR")}
            <span className="text-sm font-bold text-gray-400 ml-1">FCFA</span>
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-8">
        <AnimatePresence mode="wait">

          {/* ÉTAPE 1 — Choix méthode */}
          {step === "method" && (
            <motion.div key="method" {...pageVariants} transition={{ duration: 0.25 }} className="space-y-4">
              <p className="text-gray-500 text-sm font-medium text-center mb-4">
                Choisissez votre mode de recharge
              </p>

              {/* Mobile Money */}
              <button
                onClick={() => handleSelectMethod("MOBILE_MONEY")}
                className="w-full rounded-3xl p-6 flex flex-col items-center gap-4 transition-all active:scale-95 hover:scale-[1.02] bg-white border-2 border-green-200 shadow-sm hover:border-green-400 hover:shadow-md"
              >
                <img
                  src={mobileMoneyIcon}
                  alt="Mobile Money"
                  className="w-40 h-auto object-contain drop-shadow-xl"
                />
                <div className="text-center">
                  <div className="text-xl font-extrabold text-gray-900 tracking-wide">MOBILE MONEY</div>
                  <div className="text-sm text-gray-500 mt-1">TMoney · Flooz · Airtel Money</div>
                  <div className="mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold text-green-700 bg-green-100">
                    Min: 1 000 FCFA
                  </div>
                </div>
              </button>

              {/* Crypto */}
              <button
                onClick={() => handleSelectMethod("CRYPTO")}
                className="w-full rounded-3xl p-6 flex flex-col items-center gap-4 transition-all active:scale-95 hover:scale-[1.02] bg-white border-2 border-amber-200 shadow-sm hover:border-amber-400 hover:shadow-md"
              >
                <img
                  src={cryptoIcon}
                  alt="Crypto Monnaie"
                  className="w-36 h-auto object-contain drop-shadow-xl"
                />
                <div className="text-center">
                  <div className="text-xl font-extrabold text-gray-900 tracking-wide">CRYPTO MONNAIE</div>
                  <div className="text-sm text-gray-500 mt-1">USDT · BTC · ETH</div>
                  <div className="mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold text-amber-700 bg-amber-100">
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
              <div className="rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <span className="text-sm text-gray-500 font-medium">Canal De Recharge</span>
                  <span className="text-sm font-bold text-green-600">Mobile Money</span>
                </div>
                <div className="flex items-center justify-between px-5 py-4">
                  <span className="text-sm text-gray-500 font-medium">Montant Min ~ Max</span>
                  <span className="text-sm font-semibold text-gray-800">1 000 ~ 2 000 000 FCFA</span>
                </div>
              </div>

              {/* Montants rapides + champs */}
              <div className="rounded-2xl p-5 space-y-5 bg-white border border-gray-200 shadow-sm">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">Choisissez Le Montant</p>
                  <div className="grid grid-cols-3 gap-2">
                    {QUICK_AMOUNTS.map((val) => (
                      <button
                        key={val}
                        onClick={() => setAmount(val.toString())}
                        className={`py-3 rounded-xl text-sm font-bold border transition-all ${
                          amount === val.toString()
                            ? "border-green-500 bg-green-50 text-green-700"
                            : "border-gray-200 bg-gray-50 text-gray-700 hover:border-green-300 hover:text-gray-900"
                        }`}
                      >
                        {val.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Champ montant */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Montant De La Recharge</p>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Veuillez entrer le montant"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full h-13 pr-16 pl-4 text-base font-semibold rounded-xl outline-none text-gray-900 placeholder:text-gray-400 bg-gray-50 border border-gray-200 focus:border-green-500 transition-colors"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">FCFA</span>
                  </div>
                </div>

                {/* Numéro de téléphone */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Numéro de téléphone</p>
                  <input
                    type="tel"
                    placeholder="Ex: 90 00 00 00"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-13 px-4 text-base font-semibold rounded-xl outline-none text-gray-900 placeholder:text-gray-400 bg-gray-50 border border-gray-200 focus:border-green-500 transition-colors"
                  />
                </div>
              </div>

              {/* Boutons */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleDeposit}
                  disabled={createDeposit.isPending}
                  className="w-full h-14 text-base font-extrabold rounded-full text-white bg-green-600 hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg"
                >
                  {createDeposit.isPending ? <Loader2 className="animate-spin w-5 h-5" /> : null}
                  Recharger maintenant
                </button>

                <button
                  onClick={() => toast({ title: "Guide de recharge", description: "Effectuez un virement Mobile Money sur le numéro indiqué par l'administrateur, puis soumettez votre demande." })}
                  className="w-full h-14 text-base font-bold rounded-full border-2 border-amber-300 text-amber-600 hover:bg-amber-50 transition-all"
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
                className="w-24 h-24 rounded-full flex items-center justify-center bg-green-100 border-2 border-green-300"
              >
                <CheckCircle2 className="w-14 h-14 text-green-600" />
              </motion.div>
              <div className="text-center">
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Demande envoyée !</h2>
                <p className="text-gray-500 text-sm max-w-xs">
                  Votre demande de recharge de{" "}
                  <span className="font-bold text-green-600">{Number(amount).toLocaleString()} FCFA</span>{" "}
                  via Mobile Money est en cours de traitement.
                </p>
                <p className="text-xs text-gray-400 mt-3">
                  Votre solde sera mis à jour après vérification (quelques minutes).
                </p>
              </div>
              <button
                onClick={() => setLocation("/")}
                className="w-full max-w-xs h-14 rounded-full font-bold text-white text-base bg-green-600 hover:bg-green-700 active:scale-95 transition-all shadow-lg"
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
