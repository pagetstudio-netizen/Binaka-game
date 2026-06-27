import { useState, useEffect } from "react";
import {
  useGetBalance, getGetBalanceQueryKey,
  useGetTransactions, getGetTransactionsQueryKey,
  useCreateWithdrawal,
} from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Headphones, FileText, Plus, ChevronRight, Check, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

/* ── Constants ─────────────────────────────────────────────── */
const DEPOSIT_PRESETS = [1000, 2000, 3000, 5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000, 2000000];
const WITHDRAW_PRESETS = [2000, 5000, 10000, 20000, 50000, 100000];

const OPERATORS = [
  { id: "TMONEY",        label: "TMoney",        emoji: "📲", color: "#e53e3e" },
  { id: "FLOOZ",         label: "Moov Flooz",    emoji: "💚", color: "#38a169" },
  { id: "ORANGE_MONEY",  label: "Orange Money",  emoji: "🟠", color: "#dd6b20" },
  { id: "MTN",           label: "MTN MoMo",      emoji: "💛", color: "#d69e2e" },
  { id: "WAVE",          label: "Wave",           emoji: "🌊", color: "#3182ce" },
  { id: "AIRTEL",        label: "Airtel Money",  emoji: "❤️", color: "#c53030" },
];

const COUNTRIES = ["Togo", "Côte d'Ivoire", "Sénégal", "Cameroun", "Mali", "Burkina Faso", "Bénin", "Niger", "Guinée"];

/* ── Types ─────────────────────────────────────────────────── */
type WithdrawalAccount = {
  id: string;
  operator: string;
  country: string;
  accountName: string;
  accountNumber: string;
};

/* ── Helpers ───────────────────────────────────────────────── */
const fmtNum = (n: number) => n >= 1_000_000
  ? `${(n / 1_000_000).toLocaleString("fr-FR")}M`
  : n >= 1_000
  ? `${(n / 1_000).toLocaleString("fr-FR")}k`
  : n.toString();

const STORAGE_KEY = "binaka_withdrawal_accounts";
const loadAccounts = (): WithdrawalAccount[] => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
};
const saveAccounts = (list: WithdrawalAccount[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
};

/* ═══════════════════════════════════════════════════════════ */
export default function Wallet() {
  const { data: wallet, refetch: refetchBalance } = useGetBalance({ query: { queryKey: getGetBalanceQueryKey() } });
  const { data: txData } = useGetTransactions({ limit: 30 }, { query: { queryKey: getGetTransactionsQueryKey({ limit: 30 }) } });
  const createWithdrawal = useCreateWithdrawal();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [tab, setTab] = useState<"deposit" | "withdraw">("deposit");
  const [spinning, setSpinning] = useState(false);

  /* ── Dépôt state ── */
  const [depositAmount, setDepositAmount] = useState<string>("");

  /* ── Retrait state ── */
  const [accounts, setAccounts] = useState<WithdrawalAccount[]>(loadAccounts);
  const [selectedAccount, setSelectedAccount] = useState<WithdrawalAccount | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [showAddAccount, setShowAddAccount] = useState(false);

  /* ── Add-account form ── */
  const [newOperator, setNewOperator] = useState(OPERATORS[0].id);
  const [newCountry, setNewCountry] = useState(COUNTRIES[0]);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");

  useEffect(() => {
    if (accounts.length > 0 && !selectedAccount) setSelectedAccount(accounts[0]);
  }, [accounts]);

  const handleRefresh = async () => {
    setSpinning(true);
    await refetchBalance();
    queryClient.invalidateQueries({ queryKey: getGetTransactionsQueryKey({ limit: 30 }) });
    setTimeout(() => setSpinning(false), 600);
  };

  /* ── Deposit → redirect to aggregator ── */
  const handleDeposit = () => {
    const amt = Number(depositAmount);
    if (!amt || amt < 1000) {
      toast({ title: "Montant invalide", description: "Minimum 1 000 FCFA", variant: "destructive" });
      return;
    }
    // TODO: replace with real aggregator URL
    const aggregatorUrl = `https://pay.binaka.game/deposit?amount=${amt}&currency=XOF`;
    toast({
      title: "Redirection vers le paiement…",
      description: `${amt.toLocaleString("fr-FR")} FCFA`,
      className: "bg-green-600 text-white border-none",
    });
    // window.location.href = aggregatorUrl;   ← décommentez quand l'agrégateur est prêt
    console.log("Redirect to:", aggregatorUrl);
  };

  /* ── Save withdrawal account ── */
  const handleSaveAccount = () => {
    if (!newName.trim() || !newNumber.trim()) {
      toast({ title: "Champs requis", description: "Nom et numéro obligatoires", variant: "destructive" });
      return;
    }
    const acc: WithdrawalAccount = {
      id: Date.now().toString(),
      operator: newOperator,
      country: newCountry,
      accountName: newName.trim(),
      accountNumber: newNumber.trim(),
    };
    const updated = [...accounts, acc];
    setAccounts(updated);
    saveAccounts(updated);
    setSelectedAccount(acc);
    setNewName(""); setNewNumber("");
    setShowAddAccount(false);
    toast({ title: "✅ Compte enregistré", description: `${acc.accountName} — ${acc.accountNumber}`, className: "bg-green-600 text-white border-none" });
  };

  /* ── Withdrawal ── */
  const handleWithdraw = async () => {
    const amt = Number(withdrawAmount);
    if (!amt || amt < 2000) {
      toast({ title: "Montant invalide", description: "Minimum 2 000 FCFA", variant: "destructive" });
      return;
    }
    if (amt > (wallet?.balance || 0)) {
      toast({ title: "Solde insuffisant", description: `Votre solde est ${(wallet?.balance || 0).toLocaleString("fr-FR")} FCFA`, variant: "destructive" });
      return;
    }
    if (!selectedAccount) {
      toast({ title: "Aucun compte", description: "Ajoutez d'abord un compte de retrait", variant: "destructive" });
      return;
    }
    try {
      await createWithdrawal.mutateAsync({
        data: { amount: amt, method: selectedAccount.operator, phone: selectedAccount.accountNumber, walletAddress: null }
      });
      toast({ title: "✅ Demande envoyée", description: `Retrait de ${amt.toLocaleString("fr-FR")} FCFA en cours`, className: "bg-green-600 text-white border-none" });
      queryClient.invalidateQueries({ queryKey: getGetBalanceQueryKey() });
      setWithdrawAmount("");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Erreur", description: err.message || "Impossible de créer le retrait" });
    }
  };

  const balance = wallet?.balance ?? 0;
  const operatorInfo = (id: string) => OPERATORS.find((o) => o.id === id) || OPERATORS[0];

  /* ════════════════════════════════════════ RENDER ════════════════════════ */
  return (
    <div className="flex flex-col w-full min-h-full bg-gray-100 pb-24">

      {/* ── GRADIENT HEADER ── */}
      <div className="bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 px-4 pt-5 pb-6 relative overflow-hidden">
        {/* decorative circles */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-12 -left-8 w-52 h-52 rounded-full bg-white/10" />

        <div className="relative z-10">
          {/* Top row */}
          <div className="flex items-center justify-between mb-5">
            <button className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Headphones size={18} className="text-white" />
            </button>
            <h1 className="text-white font-black text-xl tracking-wide">Portefeuille</h1>
            <button className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <FileText size={18} className="text-white" />
            </button>
          </div>

          {/* Balance */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white/80 text-sm font-bold">Mon Solde</span>
            <motion.button animate={{ rotate: spinning ? 360 : 0 }} transition={{ duration: 0.6 }} onClick={handleRefresh}>
              <RefreshCw size={14} className="text-white/70" />
            </motion.button>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-white font-black text-5xl">{balance.toLocaleString("fr-FR")}</span>
            <span className="text-white/70 font-bold text-lg">FCFA</span>
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="bg-white border-b border-gray-200 flex">
        {(["deposit", "withdraw"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-4 text-sm font-black relative transition-colors"
            style={{ color: tab === t ? "#111" : "#9ca3af" }}>
            {t === "deposit" ? "Dépôt" : "Retrait"}
            {tab === t && (
              <motion.div layoutId="tab-underline" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-0.5 rounded-full bg-green-600" />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ══════════════════ DÉPÔT TAB ══════════════════ */}
        {tab === "deposit" && (
          <motion.div key="deposit" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.22 }}
            className="flex flex-col gap-0 bg-white">

            {/* Amount display */}
            <div className="px-4 pt-5 pb-3">
              <div className="w-full h-14 rounded-2xl border-2 border-green-400 flex items-center justify-center bg-white">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full text-center text-3xl font-black text-green-600 outline-none bg-transparent placeholder:text-gray-300"
                />
              </div>
              <div className="flex justify-between text-xs font-bold mt-2 px-1">
                <span className="text-gray-500">Montant dépôt :</span>
                <span className="text-gray-400">Min <span className="text-green-600">1 000 F</span> · Max <span className="text-green-600">2 000 000 F</span></span>
              </div>
            </div>

            {/* Preset grid */}
            <div className="px-4 pb-4">
              <div className="grid grid-cols-3 gap-2">
                {DEPOSIT_PRESETS.map((v) => {
                  const active = depositAmount === v.toString();
                  return (
                    <motion.button key={v} whileTap={{ scale: 0.94 }} onClick={() => setDepositAmount(v.toString())}
                      className="h-11 rounded-xl text-sm font-black border-2 transition-colors"
                      style={{
                        background: active ? "#f0fdf4" : "#f9fafb",
                        borderColor: active ? "#16a34a" : "#e5e7eb",
                        color: active ? "#16a34a" : "#374151",
                      }}>
                      {fmtNum(v)} F
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Payment methods label */}
            <div className="px-4 pb-2">
              <p className="text-sm font-black text-gray-700">Méthodes de paiement :</p>
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                {["Mobile Money", "Orange Money", "Wave", "MTN MoMo"].map((m) => (
                  <div key={m} className="flex-shrink-0 px-4 py-2 rounded-full border-2 border-green-500 text-xs font-black text-green-700 bg-green-50 whitespace-nowrap">{m}</div>
                ))}
              </div>
            </div>

            {/* Déposer button */}
            <div className="px-4 pb-6 pt-2">
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleDeposit}
                className="w-full h-14 rounded-full font-black text-lg text-white shadow-lg"
                style={{ background: "linear-gradient(135deg, #16a34a, #22c55e)" }}>
                Déposer Maintenant
              </motion.button>
            </div>

            {/* Transaction history mini */}
            <div className="px-4 pb-4 border-t border-gray-100 pt-4">
              <p className="text-sm font-black text-gray-700 mb-3">Historique récent</p>
              {txData?.transactions && txData.transactions.length > 0 ? (
                <div className="space-y-2">
                  {txData.transactions.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-2.5 border-b border-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-base"
                          style={{ background: tx.type === "DEPOSIT" ? "#f0fdf4" : tx.type === "WITHDRAWAL" ? "#fef2f2" : "#fffbeb" }}>
                          {tx.type === "DEPOSIT" ? "⬇️" : tx.type === "WITHDRAWAL" ? "⬆️" : tx.type === "GAME_WIN" ? "🎮" : "🎯"}
                        </div>
                        <div>
                          <p className="text-xs font-black text-gray-800">
                            {tx.type === "DEPOSIT" ? "Dépôt" : tx.type === "WITHDRAWAL" ? "Retrait" : tx.type === "GAME_WIN" ? "Gain jeu" : "Mise"}
                          </p>
                          <p className="text-xs text-gray-400">{format(new Date(tx.createdAt), "d MMM · HH:mm", { locale: fr })}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black" style={{ color: tx.type === "DEPOSIT" || tx.type === "GAME_WIN" || tx.type === "BONUS" ? "#16a34a" : "#dc2626" }}>
                          {tx.type === "WITHDRAWAL" || tx.type === "GAME_BET" ? "−" : "+"}{Number(tx.amount).toLocaleString("fr-FR")} F
                        </p>
                        <p className="text-xs" style={{ color: tx.status === "COMPLETED" ? "#16a34a" : tx.status === "PENDING" ? "#d97706" : "#dc2626" }}>
                          {tx.status === "COMPLETED" ? "Complété" : tx.status === "PENDING" ? "En attente" : "Échoué"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-gray-400 py-6">Aucune transaction</p>
              )}
            </div>
          </motion.div>
        )}

        {/* ══════════════════ RETRAIT TAB ══════════════════ */}
        {tab === "withdraw" && (
          <motion.div key="withdraw" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.22 }}
            className="flex flex-col bg-white">

            {/* Withdrawable amount */}
            <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 font-bold">Montant retirable</p>
                <p className="text-3xl font-black text-gray-800">{balance.toLocaleString("fr-FR")} <span className="text-base text-gray-400">FCFA</span></p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 font-bold">Montant existant</p>
                <p className="text-xl font-black text-gray-800">{balance.toLocaleString("fr-FR")}</p>
              </div>
            </div>

            {/* Operator selector */}
            <div className="px-4 pt-4 pb-3">
              <p className="text-xs font-black text-gray-500 uppercase tracking-wide mb-3">Opérateur</p>
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                {OPERATORS.map((op) => {
                  const isSelected = selectedAccount?.operator === op.id;
                  return (
                    <motion.button key={op.id} whileTap={{ scale: 0.94 }}
                      onClick={() => {
                        const existing = accounts.find((a) => a.operator === op.id);
                        if (existing) setSelectedAccount(existing);
                      }}
                      className="flex-shrink-0 px-4 py-2.5 rounded-xl border-2 text-xs font-black flex items-center gap-1.5 transition-colors"
                      style={{
                        borderColor: isSelected ? op.color : "#e5e7eb",
                        background: isSelected ? `${op.color}18` : "#f9fafb",
                        color: isSelected ? op.color : "#4b5563",
                      }}>
                      {op.emoji} {op.label}
                      {isSelected && <Check size={12} />}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Withdrawal account */}
            <div className="px-4 pb-4">
              <p className="text-sm font-black text-gray-700 mb-2">Compte de retrait :</p>

              {accounts.length === 0 ? (
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowAddAccount(true)}
                  className="w-full flex items-center justify-between px-4 h-14 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50">
                  <span className="text-gray-400 text-sm font-bold">Ajouter un compte de retrait</span>
                  <div className="w-9 h-9 rounded-xl border-2 border-gray-300 flex items-center justify-center">
                    <Plus size={18} className="text-gray-400" />
                  </div>
                </motion.button>
              ) : (
                <div className="space-y-2">
                  {accounts.map((acc) => {
                    const op = operatorInfo(acc.operator);
                    const isSelected = selectedAccount?.id === acc.id;
                    return (
                      <motion.button key={acc.id} whileTap={{ scale: 0.97 }} onClick={() => setSelectedAccount(acc)}
                        className="w-full flex items-center justify-between px-4 h-14 rounded-2xl border-2 transition-colors"
                        style={{ borderColor: isSelected ? op.color : "#e5e7eb", background: isSelected ? `${op.color}10` : "white" }}>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{op.emoji}</span>
                          <div className="text-left">
                            <p className="text-xs font-black text-gray-800">{acc.accountName}</p>
                            <p className="text-xs text-gray-400">{acc.accountNumber} · {op.label}</p>
                          </div>
                        </div>
                        {isSelected ? <Check size={18} style={{ color: op.color }} /> : <ChevronRight size={16} className="text-gray-300" />}
                      </motion.button>
                    );
                  })}
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowAddAccount(true)}
                    className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border-2 border-dashed border-green-300 text-green-600 text-sm font-black bg-green-50">
                    <Plus size={16} /> Ajouter un compte
                  </motion.button>
                </div>
              )}
            </div>

            {/* Withdraw amount */}
            <div className="px-4 pb-3">
              <p className="text-sm font-black text-gray-700 mb-2">Montant du retrait :</p>
              <div className="w-full h-14 rounded-2xl border-2 border-gray-200 flex items-center px-4 focus-within:border-green-500 transition-colors bg-gray-50">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="Montant : 2 000 – 500 000 FCFA"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="flex-1 text-base font-bold text-gray-800 outline-none bg-transparent placeholder:text-gray-300 placeholder:text-sm"
                />
                <span className="text-sm font-bold text-gray-400">FCFA</span>
              </div>
            </div>

            {/* Preset amounts */}
            <div className="px-4 pb-4">
              <div className="grid grid-cols-3 gap-2">
                {WITHDRAW_PRESETS.map((v) => {
                  const active = withdrawAmount === v.toString();
                  return (
                    <motion.button key={v} whileTap={{ scale: 0.94 }} onClick={() => setWithdrawAmount(v.toString())}
                      className="h-11 rounded-xl text-sm font-black border-2 transition-colors"
                      style={{
                        background: active ? "#f0fdf4" : "#f9fafb",
                        borderColor: active ? "#16a34a" : "#e5e7eb",
                        color: active ? "#16a34a" : "#374151",
                      }}>
                      {fmtNum(v)} F
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Withdraw button */}
            <div className="px-4 pb-8">
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleWithdraw} disabled={createWithdrawal.isPending}
                className="w-full h-14 rounded-full font-black text-lg text-white shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #16a34a, #22c55e)" }}>
                {createWithdrawal.isPending ? <Loader2 className="animate-spin" size={20} /> : "Retirer"}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════ ADD ACCOUNT MODAL ══════════════════ */}
      <AnimatePresence>
        {showAddAccount && (
          <>
            {/* backdrop */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddAccount(false)}
              className="fixed inset-0 bg-black/50 z-40" />

            {/* sheet */}
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-gray-50 rounded-t-3xl pb-10 max-h-[90dvh] overflow-y-auto">

              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-gray-300" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 bg-white">
                <button onClick={() => setShowAddAccount(false)} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                  <X size={18} className="text-gray-600" />
                </button>
                <h2 className="font-black text-base text-gray-900">Informations du compte</h2>
                <div className="w-9" />
              </div>

              <div className="px-4 pt-5 space-y-5">
                {/* Operator choice */}
                <div>
                  <p className="text-sm font-black text-gray-700 mb-3">Choisir la méthode de retrait :</p>
                  <div className="grid grid-cols-3 gap-2">
                    {OPERATORS.map((op) => {
                      const active = newOperator === op.id;
                      return (
                        <motion.button key={op.id} whileTap={{ scale: 0.94 }} onClick={() => setNewOperator(op.id)}
                          className="flex flex-col items-center gap-1 py-3 rounded-2xl border-2 transition-colors"
                          style={{ borderColor: active ? op.color : "#e5e7eb", background: active ? `${op.color}15` : "white" }}>
                          <span className="text-2xl">{op.emoji}</span>
                          <span className="text-xs font-black" style={{ color: active ? op.color : "#4b5563" }}>{op.label}</span>
                          {active && <Check size={12} style={{ color: op.color }} />}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Country */}
                <div>
                  <p className="text-sm font-black text-gray-700 mb-2">Pays</p>
                  <select value={newCountry} onChange={(e) => setNewCountry(e.target.value)}
                    className="w-full h-14 px-4 rounded-2xl border-2 border-gray-200 bg-white text-sm font-bold text-gray-800 outline-none focus:border-green-500 transition-colors">
                    {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>

                {/* Account name */}
                <div>
                  <p className="text-sm font-black text-gray-700 mb-2">Nom complet</p>
                  <input type="text" placeholder="Nom sur le compte"
                    value={newName} onChange={(e) => setNewName(e.target.value)}
                    className="w-full h-14 px-4 rounded-2xl border-2 border-gray-200 bg-white text-sm font-bold text-gray-800 outline-none focus:border-green-500 transition-colors placeholder:text-gray-300 placeholder:font-normal"
                  />
                </div>

                {/* Account number */}
                <div>
                  <p className="text-sm font-black text-gray-700 mb-2">Numéro de compte</p>
                  <input type="tel" placeholder="Numéro de téléphone / compte"
                    value={newNumber} onChange={(e) => setNewNumber(e.target.value)}
                    className="w-full h-14 px-4 rounded-2xl border-2 border-gray-200 bg-white text-sm font-bold text-gray-800 outline-none focus:border-green-500 transition-colors placeholder:text-gray-300 placeholder:font-normal"
                  />
                </div>

                {/* Confirm */}
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleSaveAccount}
                  className="w-full h-14 rounded-full font-black text-lg text-white shadow-lg"
                  style={{ background: "linear-gradient(135deg, #16a34a, #22c55e)" }}>
                  Confirmer
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
