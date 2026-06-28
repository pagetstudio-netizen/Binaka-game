import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useUpdateMe } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, User, Mail, Globe, Camera, Loader2, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getUserAvatar } from "@/lib/user-avatar";

const COUNTRIES = [
  "Togo", "Bénin", "Côte d'Ivoire", "Sénégal", "Mali", "Burkina Faso",
  "Ghana", "Nigeria", "Cameroun", "Congo", "Guinée", "Niger", "France", "Autre"
];

export default function AccountProfile() {
  const { user, refetchUser } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const updateMe = useUpdateMe();
  const [saved, setSaved] = useState(false);

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [country, setCountry] = useState(user?.country ?? "Togo");

  if (!user) return null;

  const isDirty =
    fullName !== user.fullName ||
    email !== (user.email ?? "") ||
    country !== user.country;

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast({ title: "Nom requis", description: "Le nom complet ne peut pas être vide.", variant: "destructive" });
      return;
    }
    try {
      await updateMe.mutateAsync({ data: { fullName: fullName.trim(), email: email.trim() || undefined, country } });
      await refetchUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      toast({ title: "Profil mis à jour", description: "Vos informations ont été sauvegardées." });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message || "Impossible de mettre à jour le profil.", variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col w-full min-h-[100dvh] bg-slate-50">
      <div className="flex-1 px-4 py-6 space-y-6 max-w-md mx-auto w-full">

        {/* Avatar */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-3">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-primary shadow-lg">
              <AvatarImage src={getUserAvatar(user.id, user.avatarUrl)} className="object-cover" />
            </Avatar>
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-md">
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400">ID utilisateur</p>
            <p className="text-sm font-bold text-slate-600">#{user.id}</p>
          </div>
        </motion.div>

        {/* Champs non modifiables */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-50 bg-slate-50">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Informations du compte</p>
          </div>
          <div className="divide-y divide-slate-50">
            <ReadonlyField label="Numéro de téléphone" value={user.phone} icon={<span className="text-base">📱</span>} />
            <ReadonlyField label="Niveau VIP" value={`VIP ${user.vipLevel}`} icon={<span className="text-base">⭐</span>} />
            <ReadonlyField label="Statut" value={user.isVerified ? "Compte vérifié" : "Non vérifié"} icon={<span className="text-base">{user.isVerified ? "✅" : "⏳"}</span>} />
            <ReadonlyField label="Membre depuis" value={new Date(user.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })} icon={<span className="text-base">📅</span>} />
          </div>
        </motion.div>

        {/* Champs modifiables */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-50 bg-slate-50">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Modifier mes informations</p>
          </div>
          <div className="p-5 space-y-4">
            <Field
              label="Nom complet"
              icon={<User className="w-4 h-4 text-slate-400" />}
              value={fullName}
              onChange={setFullName}
              placeholder="Votre nom complet"
            />
            <Field
              label="Email (optionnel)"
              icon={<Mail className="w-4 h-4 text-slate-400" />}
              value={email}
              onChange={setEmail}
              placeholder="votre@email.com"
              type="email"
            />
            <div>
              <label className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-400" /> Pays
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Bouton sauvegarder */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <button
            onClick={handleSave}
            disabled={!isDirty || updateMe.isPending}
            className="w-full h-14 rounded-full font-extrabold text-base text-white transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, #16a34a, #15803d)",
              boxShadow: isDirty ? "0 6px 0 #14532d, 0 8px 20px rgba(22,163,74,0.35)" : "none",
            }}
          >
            {updateMe.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? <CheckCircle2 className="w-5 h-5" /> : null}
            {saved ? "Sauvegardé !" : "Sauvegarder les modifications"}
          </button>
        </motion.div>

      </div>
    </div>
  );
}

function ReadonlyField({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="px-5 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm text-slate-500">{label}</span>
      </div>
      <span className="text-sm font-semibold text-slate-700">{value}</span>
    </div>
  );
}

function Field({ label, icon, value, onChange, placeholder, type = "text" }: {
  label: string; icon: React.ReactNode; value: string;
  onChange: (v: string) => void; placeholder: string; type?: string;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
        {icon} {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}
