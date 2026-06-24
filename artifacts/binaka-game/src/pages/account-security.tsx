import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Lock, Eye, EyeOff, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";

export default function AccountSecurity() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!user) return null;

  const strength = getStrength(newPassword);

  const handleChangePassword = async () => {
    if (!currentPassword) {
      toast({ title: "Champ requis", description: "Entrez votre mot de passe actuel.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Mot de passe trop court", description: "Le nouveau mot de passe doit contenir au moins 6 caractères.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Mots de passe différents", description: "La confirmation ne correspond pas.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("binaka_token");
      const res = await fetch("/api/users/me/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Mot de passe actuel incorrect.");
      }
      setDone(true);
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      toast({ title: "Mot de passe modifié", description: "Votre mot de passe a été mis à jour avec succès." });
      setTimeout(() => setDone(false), 3000);
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message || "Impossible de changer le mot de passe.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-[100dvh] bg-slate-50">
      {/* Header */}
      <header className="px-4 pt-12 pb-4 bg-white border-b border-slate-100 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <button onClick={() => setLocation("/account")} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h1 className="text-lg font-bold flex-1 text-center text-slate-800">Sécurité et Mot de passe</h1>
        <div className="w-9" />
      </header>

      <div className="flex-1 px-4 py-6 space-y-5 max-w-md mx-auto w-full">

        {/* Bannière sécurité */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-green-800">Compte sécurisé</p>
            <p className="text-xs text-green-600 mt-0.5">
              Utilisez un mot de passe unique et difficile à deviner pour protéger votre compte.
            </p>
          </div>
        </motion.div>

        {/* Statut sécurité */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-50 bg-slate-50">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Statut du compte</p>
          </div>
          <div className="divide-y divide-slate-50">
            <div className="px-5 py-4 flex items-center justify-between">
              <span className="text-sm text-slate-500">Téléphone</span>
              <span className="text-sm font-semibold text-green-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> {user.phone}</span>
            </div>
            <div className="px-5 py-4 flex items-center justify-between">
              <span className="text-sm text-slate-500">Compte vérifié</span>
              <span className={`text-sm font-semibold flex items-center gap-1 ${user.isVerified ? "text-green-600" : "text-amber-500"}`}>
                {user.isVerified ? <><CheckCircle2 className="w-4 h-4" /> Oui</> : "En attente"}
              </span>
            </div>
            <div className="px-5 py-4 flex items-center justify-between">
              <span className="text-sm text-slate-500">Authentification à 2 facteurs</span>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">Bientôt</span>
            </div>
          </div>
        </motion.div>

        {/* Formulaire changement de mot de passe */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-50 bg-slate-50">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Changer le mot de passe</p>
          </div>
          <div className="p-5 space-y-4">

            <PasswordField
              label="Mot de passe actuel"
              value={currentPassword}
              onChange={setCurrentPassword}
              show={showCurrent}
              onToggle={() => setShowCurrent(!showCurrent)}
              placeholder="••••••••"
            />

            <PasswordField
              label="Nouveau mot de passe"
              value={newPassword}
              onChange={setNewPassword}
              show={showNew}
              onToggle={() => setShowNew(!showNew)}
              placeholder="Minimum 6 caractères"
            />

            {/* Indicateur de force */}
            {newPassword.length > 0 && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= strength.score ? strength.color : "bg-slate-200"}`} />
                  ))}
                </div>
                <p className={`text-xs font-semibold ${strength.textColor}`}>{strength.label}</p>
              </div>
            )}

            <PasswordField
              label="Confirmer le nouveau mot de passe"
              value={confirmPassword}
              onChange={setConfirmPassword}
              show={showConfirm}
              onToggle={() => setShowConfirm(!showConfirm)}
              placeholder="Répétez le nouveau mot de passe"
              error={confirmPassword.length > 0 && confirmPassword !== newPassword ? "Les mots de passe ne correspondent pas" : ""}
            />

          </div>
        </motion.div>

        {/* Bouton */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <button
            onClick={handleChangePassword}
            disabled={loading || !currentPassword || !newPassword || !confirmPassword}
            className="w-full h-14 rounded-full font-extrabold text-base text-white transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, #16a34a, #15803d)",
              boxShadow: "0 6px 0 #14532d, 0 8px 20px rgba(22,163,74,0.35)",
            }}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : done ? <CheckCircle2 className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            {done ? "Mot de passe modifié !" : "Modifier le mot de passe"}
          </button>
        </motion.div>

      </div>
    </div>
  );
}

function PasswordField({ label, value, onChange, show, onToggle, placeholder, error = "" }: {
  label: string; value: string; onChange: (v: string) => void;
  show: boolean; onToggle: () => void; placeholder: string; error?: string;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
        <Lock className="w-4 h-4 text-slate-400" /> {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full h-12 pl-4 pr-12 rounded-xl border text-slate-800 font-medium text-sm focus:outline-none focus:ring-2 transition-colors ${
            error ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-200" : "border-slate-200 bg-slate-50 focus:border-primary focus:ring-primary/20"
          }`}
        />
        <button type="button" onClick={onToggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function getStrength(pwd: string) {
  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd) || /[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  const levels = [
    { label: "Trop court", color: "bg-red-400", textColor: "text-red-500" },
    { label: "Faible", color: "bg-orange-400", textColor: "text-orange-500" },
    { label: "Moyen", color: "bg-yellow-400", textColor: "text-yellow-600" },
    { label: "Fort", color: "bg-green-400", textColor: "text-green-600" },
    { label: "Très fort", color: "bg-green-600", textColor: "text-green-700" },
  ];
  return { score, ...levels[Math.min(score, 4)] };
}
