import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Eye, EyeOff, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AccountSecurityTransaction() {
  const { toast } = useToast();
  const [newPwd, setNewPwd]   = useState("");
  const [confirm, setConfirm] = useState("");
  const [showN, setShowN]   = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);

  const canSubmit = newPwd.length >= 6 && newPwd === confirm;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setDone(true);
    toast({ title: "Mot de passe de transaction défini", description: "Vos fonds sont maintenant protégés." });
  };

  return (
    <div className="flex flex-col w-full min-h-[100dvh] pb-8" style={{ background: "#EAF8F2" }}>

      {/* Banner */}
      <div className="mx-3 mt-4 rounded-2xl px-4 py-4 flex items-center gap-3"
        style={{ background: "linear-gradient(135deg,#F0FDF4,#DCFCE7)", border: "1px solid #BBF7D0" }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "#D1FAE5" }}>
          <ShieldCheck size={20} style={{ color: "#0F8A5F" }} />
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: "#065F46" }}>Mot de passe de transaction</p>
          <p className="text-xs mt-0.5" style={{ color: "#059669" }}>
            Saisissez de 6 à 16 caractères alphanumériques sans caractères spéciaux.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="mx-3 mt-3 bg-white rounded-2xl shadow-sm overflow-hidden"
        style={{ border: "1px solid #D4EDDA" }}>

        <PwdField
          label="Nouveau mot de passe"
          icon={<ShieldCheck size={15} style={{ color: "#0F8A5F" }} />}
          value={newPwd}
          onChange={setNewPwd}
          show={showN}
          onToggle={() => setShowN(v => !v)}
          placeholder="6 à 16 caractères"
        />
        <PwdField
          label="Confirmer le mot de passe"
          icon={<ShieldCheck size={15} style={{ color: "#0F8A5F" }} />}
          value={confirm}
          onChange={setConfirm}
          show={showCf}
          onToggle={() => setShowCf(v => !v)}
          placeholder="Répétez le mot de passe"
          last
          error={confirm.length > 0 && newPwd !== confirm ? "Les mots de passe ne correspondent pas" : undefined}
        />
      </div>

      <div className="mx-3 mt-4">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={!canSubmit || loading || done}
          className="w-full h-14 rounded-2xl font-black text-base text-white flex items-center justify-center gap-2 disabled:opacity-40 shadow-lg"
          style={{
            background: canSubmit ? "linear-gradient(135deg, #0F8A5F, #0A5C3A)" : "#CBD5E1",
            boxShadow: canSubmit ? "0 4px 0 #064E2E, 0 6px 18px rgba(15,138,95,0.35)" : "none",
          }}>
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : done ? <CheckCircle2 className="w-5 h-5" /> : null}
          {done ? "Défini avec succès !" : "Confirmer"}
        </motion.button>
      </div>
    </div>
  );
}

function PwdField({ label, icon, value, onChange, show, onToggle, placeholder, last = false, error }: {
  label: string; icon: React.ReactNode; value: string; onChange: (v: string) => void;
  show: boolean; onToggle: () => void; placeholder: string; last?: boolean; error?: string;
}) {
  return (
    <div style={{ borderBottom: last ? "none" : "1px solid #F0FDF4" }}>
      <div className="px-4 pt-4 pb-3">
        <label className="flex items-center gap-2 text-xs font-bold mb-2.5" style={{ color: "#374151" }}>
          {icon} {label}
        </label>
        <div className="flex items-center gap-2 h-12 px-4 rounded-xl"
          style={{ border: `1.5px solid ${error ? "#FECACA" : "#D4EDDA"}`, background: "#F5FDF9" }}>
          <input
            type={show ? "text" : "password"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-sm text-gray-800 font-medium focus:outline-none placeholder-gray-300"
          />
          <motion.button whileTap={{ scale: 0.85 }} onClick={onToggle} type="button">
            {show ? <EyeOff size={16} className="text-gray-400" /> : <Eye size={16} className="text-gray-400" />}
          </motion.button>
        </div>
        {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
      </div>
    </div>
  );
}
