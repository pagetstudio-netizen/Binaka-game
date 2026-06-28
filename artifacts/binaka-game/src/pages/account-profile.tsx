import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useUpdateMe } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Globe, Camera, Loader2, CheckCircle2, Phone, Star, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { getUserAvatar } from "@/lib/user-avatar";

const COUNTRIES = [
  "Togo", "Bénin", "Côte d'Ivoire", "Sénégal", "Mali", "Burkina Faso",
  "Ghana", "Nigeria", "Cameroun", "Congo", "Guinée", "Niger", "France", "Autre"
];

export default function AccountProfile() {
  const { user, refetchUser } = useAuth();
  const { toast } = useToast();
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
    <div className="flex flex-col w-full min-h-[100dvh] pb-6" style={{ background: "#EAF8F2" }}>

      {/* ── AVATAR HEADER ── */}
      <div className="pt-6 pb-8 flex flex-col items-center relative"
        style={{ background: "linear-gradient(160deg, #062E1B 0%, #0A5C3A 60%, #0F8A5F 100%)" }}>
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-10 bg-white" />
        <div className="absolute -bottom-10 -left-6 w-40 h-40 rounded-full opacity-5 bg-white" />

        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="relative z-10">
          <div className="w-24 h-24 rounded-full overflow-hidden shadow-xl"
            style={{ border: "3px solid rgba(244,196,48,0.8)" }}>
            <img src={getUserAvatar(user.id, user.avatarUrl)} alt="Avatar"
              className="w-full h-full object-cover" />
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
            style={{ background: "#F4C430" }}>
            <Camera className="w-4 h-4 text-green-900" />
          </button>
        </motion.div>

        <p className="mt-3 font-black text-white text-lg relative z-10">{user.fullName || user.phone}</p>
        <div className="flex items-center gap-2 mt-1 relative z-10">
          <span className="text-white/60 text-xs">ID #{user.id}</span>
          <div className="w-1 h-1 rounded-full bg-white/30" />
          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(244,196,48,0.2)", color: "#F4C430", border: "1px solid rgba(244,196,48,0.4)" }}>
            VIP {user.vipLevel ?? 0}
          </span>
        </div>
      </div>

      <div className="px-4 -mt-0 space-y-4 pt-4">

        {/* ── INFO NON-MODIFIABLES ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm overflow-hidden"
          style={{ border: "1px solid #D4EDDA" }}>
          <div className="px-4 py-3" style={{ background: "#F5FDF9", borderBottom: "1px solid #EAF8F2" }}>
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#0F8A5F" }}>
              Informations du compte
            </p>
          </div>
          <div style={{ borderTop: "none" }}>
            <InfoRow icon={<Phone size={15} style={{ color: "#0F8A5F" }} />} label="Téléphone" value={user.phone} />
            <InfoRow icon={<Star size={15} style={{ color: "#F4C430" }} />}  label="Niveau VIP"  value={`VIP ${user.vipLevel ?? 0}`} last={false} />
            <InfoRow icon={<Shield size={15} style={{ color: user.isVerified ? "#22C55E" : "#F97316" }} />}
              label="Statut"
              value={user.isVerified ? "Vérifié ✓" : "Non vérifié"}
              last />
          </div>
        </motion.div>

        {/* ── CHAMPS MODIFIABLES ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
          className="bg-white rounded-2xl shadow-sm overflow-hidden"
          style={{ border: "1px solid #D4EDDA" }}>
          <div className="px-4 py-3" style={{ background: "#F5FDF9", borderBottom: "1px solid #EAF8F2" }}>
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#0F8A5F" }}>
              Modifier mes informations
            </p>
          </div>

          <div className="p-4 space-y-4">
            <FormField
              label="Nom complet"
              icon={<User size={15} style={{ color: "#0F8A5F" }} />}
              value={fullName}
              onChange={setFullName}
              placeholder="Votre nom complet"
            />
            <FormField
              label="Email (optionnel)"
              icon={<Mail size={15} style={{ color: "#0F8A5F" }} />}
              value={email}
              onChange={setEmail}
              placeholder="votre@email.com"
              type="email"
            />
            <div>
              <label className="flex items-center gap-2 text-xs font-bold mb-2" style={{ color: "#374151" }}>
                <Globe size={15} style={{ color: "#0F8A5F" }} /> Pays
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full h-12 px-4 rounded-xl text-gray-800 font-medium text-sm focus:outline-none"
                style={{
                  border: "1.5px solid #D4EDDA",
                  background: "#F5FDF9",
                  WebkitAppearance: "none",
                }}>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </motion.div>

        {/* ── SAVE BUTTON ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <button
            onClick={handleSave}
            disabled={!isDirty || updateMe.isPending}
            className="w-full h-14 rounded-2xl font-black text-base text-white transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg"
            style={{
              background: isDirty
                ? "linear-gradient(135deg, #0F8A5F, #0A5C3A)"
                : "#CBD5E1",
              boxShadow: isDirty ? "0 4px 0 #064E2E, 0 6px 18px rgba(15,138,95,0.35)" : "none",
            }}
          >
            {updateMe.isPending
              ? <Loader2 className="w-5 h-5 animate-spin" />
              : saved
              ? <CheckCircle2 className="w-5 h-5" />
              : null}
            {saved ? "Sauvegardé !" : "Sauvegarder les modifications"}
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, last = false }: {
  icon: React.ReactNode; label: string; value: string; last?: boolean;
}) {
  return (
    <div className="px-4 py-3.5 flex items-center justify-between"
      style={{ borderBottom: last ? "none" : "1px solid #F0FDF4" }}>
      <div className="flex items-center gap-2.5">
        {icon}
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <span className="text-sm font-bold text-gray-700">{value}</span>
    </div>
  );
}

function FormField({ label, icon, value, onChange, placeholder, type = "text" }: {
  label: string; icon: React.ReactNode; value: string;
  onChange: (v: string) => void; placeholder: string; type?: string;
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-xs font-bold mb-2" style={{ color: "#374151" }}>
        {icon} {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-12 px-4 rounded-xl text-gray-800 font-medium text-sm focus:outline-none"
        style={{
          border: "1.5px solid #D4EDDA",
          background: "#F5FDF9",
          outline: "none",
        }}
        onFocus={(e) => { e.target.style.borderColor = "#0F8A5F"; e.target.style.boxShadow = "0 0 0 3px rgba(15,138,95,0.15)"; }}
        onBlur={(e)  => { e.target.style.borderColor = "#D4EDDA"; e.target.style.boxShadow = "none"; }}
      />
    </div>
  );
}
