import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Lock, Eye, EyeOff, Loader2, CheckCircle2,
  ShieldCheck, ShieldAlert, KeyRound, Check, X, Sparkles,
} from "lucide-react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";

/* ─── Strength logic ─────────────────────────────────────────── */
function getStrength(pwd: string) {
  const criteria = [
    { label: "Au moins 6 caractères", ok: pwd.length >= 6 },
    { label: "Au moins 10 caractères", ok: pwd.length >= 10 },
    { label: "Lettre majuscule ou chiffre", ok: /[A-Z0-9]/.test(pwd) },
    { label: "Caractère spécial (!@#…)", ok: /[^A-Za-z0-9]/.test(pwd) },
  ];
  const score = criteria.filter((c) => c.ok).length;
  const levels = [
    { label: "Trop court", bar: "bg-red-500", text: "text-red-500", glow: "shadow-red-400/40" },
    { label: "Faible", bar: "bg-orange-400", text: "text-orange-500", glow: "shadow-orange-400/40" },
    { label: "Moyen", bar: "bg-yellow-400", text: "text-yellow-500", glow: "shadow-yellow-400/40" },
    { label: "Fort", bar: "bg-emerald-400", text: "text-emerald-500", glow: "shadow-emerald-400/40" },
    { label: "Très fort", bar: "bg-emerald-500", text: "text-emerald-600", glow: "shadow-emerald-500/40" },
  ];
  return { score, criteria, ...levels[Math.min(score, 4)] };
}

/* ─── Main page ───────────────────────────────────────────────── */
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
  const [focused, setFocused] = useState<string | null>(null);

  if (!user) return null;

  const strength = getStrength(newPassword);
  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const canSubmit = currentPassword.length > 0 && newPassword.length >= 6 && passwordsMatch && !loading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
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
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message || "Impossible de changer le mot de passe.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  /* ── Success screen ── */
  if (done) {
    return (
      <div className="flex flex-col w-full min-h-[100dvh] items-center justify-center"
        style={{ background: "linear-gradient(160deg, #0f1923 0%, #0d2818 60%, #0f1923 100%)" }}>
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="flex flex-col items-center gap-6 px-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="w-28 h-28 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #16a34a, #15803d)", boxShadow: "0 0 60px rgba(22,163,74,0.5)" }}
          >
            <ShieldCheck className="w-14 h-14 text-white" />
          </motion.div>
          <div>
            <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="text-2xl font-extrabold text-white mb-2">Mot de passe modifié !</motion.h2>
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
              className="text-slate-400 text-sm">Votre compte est maintenant sécurisé avec votre nouveau mot de passe.</motion.p>
          </div>
          <motion.button
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
            onClick={() => { setDone(false); setLocation("/account"); }}
            className="mt-2 px-8 py-3.5 rounded-full font-bold text-white text-sm"
            style={{ background: "linear-gradient(135deg, #16a34a, #15803d)", boxShadow: "0 4px 0 #14532d, 0 6px 20px rgba(22,163,74,0.4)" }}
          >
            Retour au compte
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-[100dvh]"
      style={{ background: "linear-gradient(160deg, #0f1923 0%, #0d2818 50%, #0f1923 100%)" }}>

      {/* ── Hero header ── */}
      <div className="relative overflow-hidden pt-12 pb-10 px-5">
        {/* Decorative glow */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, #16a34a, transparent)" }} />

        {/* Back button */}
        <button onClick={() => setLocation("/account")}
          className="relative z-10 w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center mb-6 active:scale-95 transition-transform">
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>

        {/* Icon + Title */}
        <div className="relative z-10 flex flex-col items-center gap-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #16a34a22, #16a34a44)", border: "1.5px solid #16a34a55", boxShadow: "0 0 40px rgba(22,163,74,0.25)" }}
          >
            <KeyRound className="w-9 h-9 text-emerald-400" />
          </motion.div>
          <div className="text-center">
            <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-2xl font-extrabold text-white tracking-tight">Changer le mot de passe</motion.h1>
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="text-sm text-slate-400 mt-1">Sécurisez votre compte avec un mot de passe robuste</motion.p>
          </div>
        </div>
      </div>

      {/* ── Form card ── */}
      <div className="flex-1 px-4 pb-10 space-y-4">

        {/* Security info banner */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 flex items-center gap-3"
          style={{ background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)" }}>
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <p className="text-xs text-emerald-300 leading-relaxed">
            Compte de <span className="font-bold text-white">{user.phone}</span> · Utilisez un mot de passe unique et difficile à deviner.
          </p>
        </motion.div>

        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="rounded-3xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(16px)" }}>

          <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Lock className="w-3 h-3" /> Modification du mot de passe
            </p>
          </div>

          <div className="p-5 space-y-5">

            {/* Current password */}
            <SecureField
              label="Mot de passe actuel"
              value={currentPassword}
              onChange={setCurrentPassword}
              show={showCurrent}
              onToggle={() => setShowCurrent(!showCurrent)}
              placeholder="Votre mot de passe actuel"
              isFocused={focused === "current"}
              onFocus={() => setFocused("current")}
              onBlur={() => setFocused(null)}
              id="current"
            />

            <div className="border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }} />

            {/* New password */}
            <SecureField
              label="Nouveau mot de passe"
              value={newPassword}
              onChange={setNewPassword}
              show={showNew}
              onToggle={() => setShowNew(!showNew)}
              placeholder="Minimum 6 caractères"
              isFocused={focused === "new"}
              onFocus={() => setFocused("new")}
              onBlur={() => setFocused(null)}
              id="new"
            />

            {/* Strength meter */}
            <AnimatePresence>
              {newPassword.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 overflow-hidden"
                >
                  {/* Bar */}
                  <div className="space-y-1.5">
                    <div className="flex gap-1.5">
                      {[0, 1, 2, 3].map((i) => (
                        <motion.div key={i}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i < strength.score ? strength.bar : "bg-white/10"}`}
                          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                          transition={{ delay: i * 0.05 }} style={{ originX: 0 }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${strength.text}`}>{strength.label}</span>
                      <span className="text-xs text-slate-500">{strength.score}/4 critères</span>
                    </div>
                  </div>
                  {/* Criteria checklist */}
                  <div className="grid grid-cols-1 gap-1">
                    {strength.criteria.map((c) => (
                      <div key={c.label} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${c.ok ? "bg-emerald-500" : "bg-white/10"}`}>
                          {c.ok ? <Check className="w-2.5 h-2.5 text-white" /> : <X className="w-2.5 h-2.5 text-white/30" />}
                        </div>
                        <span className={`text-xs transition-colors ${c.ok ? "text-emerald-400" : "text-slate-500"}`}>{c.label}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }} />

            {/* Confirm password */}
            <SecureField
              label="Confirmer le nouveau mot de passe"
              value={confirmPassword}
              onChange={setConfirmPassword}
              show={showConfirm}
              onToggle={() => setShowConfirm(!showConfirm)}
              placeholder="Répétez le nouveau mot de passe"
              isFocused={focused === "confirm"}
              onFocus={() => setFocused("confirm")}
              onBlur={() => setFocused(null)}
              id="confirm"
              match={confirmPassword.length > 0 ? (passwordsMatch ? "match" : "mismatch") : undefined}
            />

            {/* Match feedback */}
            <AnimatePresence>
              {confirmPassword.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  className={`flex items-center gap-2 text-xs font-semibold rounded-xl px-3 py-2 ${
                    passwordsMatch
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}
                >
                  {passwordsMatch
                    ? <><CheckCircle2 className="w-3.5 h-3.5" /> Les mots de passe correspondent</>
                    : <><ShieldAlert className="w-3.5 h-3.5" /> Les mots de passe ne correspondent pas</>}
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </motion.div>

        {/* Submit button */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="relative w-full h-14 rounded-2xl font-extrabold text-base text-white transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden"
            style={canSubmit ? {
              background: "linear-gradient(135deg, #16a34a, #15803d)",
              boxShadow: "0 6px 0 #14532d, 0 10px 30px rgba(22,163,74,0.4)",
            } : {
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* Shimmer when ready */}
            {canSubmit && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                style={{ width: "60%" }}
              />
            )}
            <span className="relative flex items-center justify-center gap-2.5">
              {loading
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Modification en cours…</>
                : <><Sparkles className="w-5 h-5" /> Modifier le mot de passe</>}
            </span>
          </button>
        </motion.div>

        {/* Tips */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="rounded-2xl p-4 space-y-2"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">💡 Conseils de sécurité</p>
          {[
            "N'utilisez jamais le même mot de passe sur plusieurs sites",
            "Mélangez majuscules, chiffres et caractères spéciaux",
            "Évitez les informations personnelles (date de naissance, nom…)",
          ].map((tip) => (
            <div key={tip} className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
              <p className="text-xs text-slate-500 leading-relaxed">{tip}</p>
            </div>
          ))}
        </motion.div>

      </div>
    </div>
  );
}

/* ─── Secure field component ────────────────────────────────────── */
function SecureField({
  label, value, onChange, show, onToggle, placeholder,
  isFocused, onFocus, onBlur, id,
  match,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  placeholder: string;
  isFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  id: string;
  match?: "match" | "mismatch";
}) {
  const borderColor = match === "match"
    ? "rgba(16,185,129,0.6)"
    : match === "mismatch"
    ? "rgba(239,68,68,0.5)"
    : isFocused
    ? "rgba(22,163,74,0.6)"
    : "rgba(255,255,255,0.08)";

  const glowColor = match === "match"
    ? "0 0 0 3px rgba(16,185,129,0.1)"
    : match === "mismatch"
    ? "0 0 0 3px rgba(239,68,68,0.1)"
    : isFocused
    ? "0 0 0 3px rgba(22,163,74,0.12)"
    : "none";

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
        <Lock className="w-3 h-3" /> {label}
      </label>
      <div className="relative transition-all duration-200 rounded-xl"
        style={{ boxShadow: glowColor }}>
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete="new-password"
          className="w-full h-13 pl-4 pr-12 py-3.5 rounded-xl text-white font-medium text-sm placeholder:text-slate-600 focus:outline-none transition-all duration-200"
          style={{
            background: isFocused ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
            border: `1.5px solid ${borderColor}`,
          }}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          {show
            ? <EyeOff className="w-3.5 h-3.5 text-slate-400" />
            : <Eye className="w-3.5 h-3.5 text-slate-400" />}
        </button>
      </div>
    </div>
  );
}
