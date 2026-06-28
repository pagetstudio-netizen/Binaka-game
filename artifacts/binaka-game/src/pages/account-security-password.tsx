import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AccountSecurityPassword() {
  const { toast } = useToast();
  const [current, setCurrent] = useState("");
  const [newPwd, setNewPwd]   = useState("");
  const [confirm, setConfirm] = useState("");
  const [showC, setShowC]   = useState(false);
  const [showN, setShowN]   = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);

  const canSubmit = current.length >= 6 && newPwd.length >= 6 && newPwd === confirm;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (newPwd !== confirm) {
      toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas.", variant: "destructive" });
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setDone(true);
    toast({ title: "Mot de passe modifié", description: "Votre mot de passe a été mis à jour avec succès." });
  };

  return (
    <div className="flex flex-col w-full min-h-[100dvh] pb-8" style={{ background: "#EAF8F2" }}>

      {/* Banner */}
      <div className="mx-3 mt-4 rounded-2xl px-4 py-4 flex items-center gap-3"
        style={{ background: "linear-gradient(135deg,#EFF6FF,#DBEAFE)", border: "1px solid #BFDBFE" }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-100 flex-shrink-0">
          <Lock size={20} className="text-blue-500" />
        </div>
        <div>
          <p className="text-sm font-bold text-blue-700">Modifier le mot de passe</p>
          <p className="text-xs text-blue-500 mt-0.5">Saisissez 6 à 12 caractères alphanumériques sans caractères spéciaux.</p>
        </div>
      </div>

      {/* Form */}
      <div className="mx-3 mt-3 bg-white rounded-2xl shadow-sm overflow-hidden space-y-0"
        style={{ border: "1px solid #D4EDDA" }}>

        <PwdField
          label="Mot de passe actuel"
          icon={<Lock size={15} className="text-gray-400" />}
          value={current}
          onChange={setCurrent}
          show={showC}
          onToggle={() => setShowC(v => !v)}
          placeholder="Saisissez votre mot de passe actuel"
        />
        <PwdField
          label="Nouveau mot de passe"
          icon={<Lock size={15} className="text-green-500" />}
          value={newPwd}
          onChange={setNewPwd}
          show={showN}
          onToggle={() => setShowN(v => !v)}
          placeholder="6 à 12 caractères"
        />
        <PwdField
          label="Confirmer le nouveau mot de passe"
          icon={<Lock size={15} className="text-green-500" />}
          value={confirm}
          onChange={setConfirm}
          show={showCf}
          onToggle={() => setShowCf(v => !v)}
          placeholder="Répétez le nouveau mot de passe"
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
          {done ? "Mot de passe modifié !" : "Confirmer"}
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
