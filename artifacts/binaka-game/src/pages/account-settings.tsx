import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Bell, BellOff, Moon, Sun, Globe, Vibrate, Volume2, VolumeX,
  ChevronRight, Shield, FileText, Scale, Gamepad2, Info
} from "lucide-react";
import { motion } from "framer-motion";

interface Settings {
  notifications: boolean;
  sounds: boolean;
  vibration: boolean;
  darkMode: boolean;
  language: string;
}

const DEFAULTS: Settings = {
  notifications: true,
  sounds: true,
  vibration: true,
  darkMode: false,
  language: "fr",
};

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem("binaka_settings");
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULTS;
}

export default function AccountSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings>(loadSettings);

  useEffect(() => {
    localStorage.setItem("binaka_settings", JSON.stringify(settings));
  }, [settings]);

  const toggle = (key: keyof Settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    toast({ title: "Paramètre mis à jour", description: "La modification a été sauvegardée." });
  };

  const setLang = (lang: string) => {
    setSettings((prev) => ({ ...prev, language: lang }));
    toast({ title: "Langue mise à jour", description: lang === "fr" ? "Français sélectionné" : "English selected" });
  };

  return (
    <div className="flex flex-col w-full min-h-[100dvh] pb-6" style={{ background: "#EAF8F2" }}>
      <div className="px-3 pt-4 space-y-3">

        {/* ── NOTIFICATIONS & SONS ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm overflow-hidden"
          style={{ border: "1px solid #D4EDDA" }}>
          <SectionHead icon={<Bell size={14} />} title="Notifications & Sons" />
          <ToggleRow
            icon={<Bell size={18} />}
            iconColor={settings.notifications ? "#0F8A5F" : "#9CA3AF"}
            iconBg={settings.notifications ? "#F0FDF4" : "#F9FAFB"}
            label="Notifications push"
            description="Alertes de jeu et de solde"
            checked={settings.notifications}
            onChange={() => toggle("notifications")}
          />
          <ToggleRow
            icon={settings.sounds ? <Volume2 size={18} /> : <VolumeX size={18} />}
            iconColor={settings.sounds ? "#3B82F6" : "#9CA3AF"}
            iconBg={settings.sounds ? "#EFF6FF" : "#F9FAFB"}
            label="Sons du jeu"
            description="Effets sonores pendant les parties"
            checked={settings.sounds}
            onChange={() => toggle("sounds")}
            last={false}
          />
          <ToggleRow
            icon={<Vibrate size={18} />}
            iconColor={settings.vibration ? "#8B5CF6" : "#9CA3AF"}
            iconBg={settings.vibration ? "#F5F3FF" : "#F9FAFB"}
            label="Vibrations"
            description="Retour haptique lors des actions"
            checked={settings.vibration}
            onChange={() => toggle("vibration")}
            last
          />
        </motion.div>

        {/* ── APPARENCE ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}
          className="bg-white rounded-2xl shadow-sm overflow-hidden"
          style={{ border: "1px solid #D4EDDA" }}>
          <SectionHead icon={<Sun size={14} />} title="Apparence" />
          <ToggleRow
            icon={settings.darkMode ? <Moon size={18} /> : <Sun size={18} />}
            iconColor={settings.darkMode ? "#6366F1" : "#F59E0B"}
            iconBg={settings.darkMode ? "#EEF2FF" : "#FFFBEB"}
            label="Mode sombre"
            description="Thème sombre pour économiser la batterie"
            checked={settings.darkMode}
            onChange={() => toggle("darkMode")}
            last
          />
        </motion.div>

        {/* ── LANGUE ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="bg-white rounded-2xl shadow-sm overflow-hidden"
          style={{ border: "1px solid #D4EDDA" }}>
          <SectionHead icon={<Globe size={14} />} title="Langue" />
          <div className="p-4 grid grid-cols-2 gap-2">
            {[
              { code: "fr", label: "Français", flag: "🇫🇷" },
              { code: "en", label: "English",  flag: "🇬🇧" },
            ].map((lang) => {
              const active = settings.language === lang.code;
              return (
                <motion.button
                  key={lang.code}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setLang(lang.code)}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all"
                  style={{
                    border: `2px solid ${active ? "#0F8A5F" : "#E5E7EB"}`,
                    background: active ? "#F0FDF4" : "#FAFAFA",
                  }}>
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="text-left">
                    <p className="text-sm font-bold" style={{ color: active ? "#0F8A5F" : "#374151" }}>{lang.label}</p>
                    {active && <p className="text-[10px] font-black" style={{ color: "#0F8A5F" }}>Actif</p>}
                  </div>
                  {active && (
                    <div className="ml-auto w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: "#0F8A5F" }}>
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* ── LÉGAL ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
          className="bg-white rounded-2xl shadow-sm overflow-hidden"
          style={{ border: "1px solid #D4EDDA" }}>
          <SectionHead icon={<Scale size={14} />} title="Informations légales" />
          <LegalRow icon={<FileText size={17} />}  iconColor="#3B82F6" iconBg="#EFF6FF"  label="Conditions d'utilisation" />
          <LegalRow icon={<Shield size={17} />}    iconColor="#8B5CF6" iconBg="#F5F3FF"  label="Politique de confidentialité" />
          <LegalRow icon={<Gamepad2 size={17} />}  iconColor="#0F8A5F" iconBg="#F0FDF4"  label="Jeu responsable" last />
        </motion.div>

        {/* ── VERSION ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
          className="bg-white rounded-2xl shadow-sm overflow-hidden"
          style={{ border: "1px solid #D4EDDA" }}>
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "#F0FDF4" }}>
              <Info size={18} style={{ color: "#0F8A5F" }} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">BINAKA GAME</p>
              <p className="text-xs text-gray-400">Version 1.0.0</p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

function SectionHead({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="px-4 py-3 flex items-center gap-2" style={{ background: "#F5FDF9", borderBottom: "1px solid #EAF8F2" }}>
      <span style={{ color: "#0F8A5F" }}>{icon}</span>
      <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#0F8A5F" }}>{title}</p>
    </div>
  );
}

function ToggleRow({ icon, iconColor, iconBg, label, description, checked, onChange, last = false }: {
  icon: React.ReactNode; iconColor: string; iconBg: string;
  label: string; description: string; checked: boolean; onChange: () => void; last?: boolean;
}) {
  return (
    <div className="px-4 py-3.5 flex items-center gap-3"
      style={{ borderBottom: last ? "none" : "1px solid #F0FDF4" }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg, color: iconColor }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <p className="text-xs text-gray-400 truncate">{description}</p>
      </div>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onChange}
        className="relative w-12 h-6 rounded-full transition-colors flex-shrink-0"
        style={{ background: checked ? "#0F8A5F" : "#E5E7EB" }}>
        <motion.span
          animate={{ x: checked ? 24 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm" />
      </motion.button>
    </div>
  );
}

function LegalRow({ icon, iconColor, iconBg, label, last = false }: {
  icon: React.ReactNode; iconColor: string; iconBg: string; label: string; last?: boolean;
}) {
  return (
    <motion.button whileTap={{ backgroundColor: "#F5FDF9" }}
      className="w-full flex items-center gap-3 px-4 py-3.5"
      style={{ borderBottom: last ? "none" : "1px solid #F0FDF4" }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg, color: iconColor }}>
        {icon}
      </div>
      <span className="text-sm font-medium text-gray-700 flex-1 text-left">{label}</span>
      <ChevronRight size={15} className="text-gray-300" />
    </motion.button>
  );
}
