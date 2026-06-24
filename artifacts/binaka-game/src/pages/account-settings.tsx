import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Bell, BellOff, Moon, Sun, Globe, Vibrate, Volume2, VolumeX, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
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
  const [, setLocation] = useLocation();
  const [settings, setSettings] = useState<Settings>(loadSettings);

  useEffect(() => {
    localStorage.setItem("binaka_settings", JSON.stringify(settings));
  }, [settings]);

  const toggle = (key: keyof Settings) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      return next;
    });
    toast({ title: "Paramètre mis à jour", description: "La modification a été sauvegardée." });
  };

  const setLang = (lang: string) => {
    setSettings((prev) => ({ ...prev, language: lang }));
    toast({ title: "Langue mise à jour", description: lang === "fr" ? "Français sélectionné" : "English selected" });
  };

  return (
    <div className="flex flex-col w-full min-h-[100dvh] bg-slate-50">
      {/* Header */}
      <header className="px-4 pt-12 pb-4 bg-white border-b border-slate-100 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <button onClick={() => setLocation("/account")} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h1 className="text-lg font-bold flex-1 text-center text-slate-800">Paramètres</h1>
        <div className="w-9" />
      </header>

      <div className="flex-1 px-4 py-6 space-y-5 max-w-md mx-auto w-full">

        {/* Notifications & Sons */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <SectionTitle>Notifications & Sons</SectionTitle>
          <div className="divide-y divide-slate-50">
            <ToggleRow
              icon={settings.notifications ? <Bell className="w-5 h-5 text-primary" /> : <BellOff className="w-5 h-5 text-slate-400" />}
              label="Notifications push"
              description="Recevoir des alertes de jeu et de solde"
              checked={settings.notifications}
              onChange={() => toggle("notifications")}
            />
            <ToggleRow
              icon={settings.sounds ? <Volume2 className="w-5 h-5 text-primary" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
              label="Sons du jeu"
              description="Effets sonores pendant les parties"
              checked={settings.sounds}
              onChange={() => toggle("sounds")}
            />
            <ToggleRow
              icon={<Vibrate className="w-5 h-5 text-primary" />}
              label="Vibrations"
              description="Retour haptique lors des actions"
              checked={settings.vibration}
              onChange={() => toggle("vibration")}
            />
          </div>
        </motion.div>

        {/* Apparence */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <SectionTitle>Apparence</SectionTitle>
          <div className="divide-y divide-slate-50">
            <ToggleRow
              icon={settings.darkMode ? <Moon className="w-5 h-5 text-indigo-500" /> : <Sun className="w-5 h-5 text-amber-500" />}
              label="Mode sombre"
              description="Thème sombre pour économiser la batterie"
              checked={settings.darkMode}
              onChange={() => toggle("darkMode")}
            />
          </div>
        </motion.div>

        {/* Langue */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <SectionTitle>Langue</SectionTitle>
          <div className="p-4 space-y-2">
            {[
              { code: "fr", label: "🇫🇷  Français" },
              { code: "en", label: "🇬🇧  English" },
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLang(lang.code)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                  settings.language === lang.code
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200"
                }`}
              >
                <span className="font-semibold text-sm">{lang.label}</span>
                {settings.language === lang.code && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Liens légaux */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <SectionTitle>Informations légales</SectionTitle>
          <div className="divide-y divide-slate-50">
            <LinkRow label="Conditions d'utilisation" />
            <LinkRow label="Politique de confidentialité" />
            <LinkRow label="Jeu responsable" />
            <div className="px-5 py-4 text-center">
              <p className="text-xs text-slate-400">BINAKA GAME · Version 1.0.0</p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 py-3 border-b border-slate-50 bg-slate-50">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{children}</p>
    </div>
  );
}

function ToggleRow({ icon, label, description, checked, onChange }: {
  icon: React.ReactNode; label: string; description: string; checked: boolean; onChange: () => void;
}) {
  return (
    <div className="px-5 py-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <p className="text-xs text-slate-400 truncate">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? "bg-primary" : "bg-slate-200"}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}

function LinkRow({ label }: { label: string }) {
  return (
    <button className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
      <span className="text-sm text-slate-600 font-medium">{label}</span>
      <ChevronRight className="w-4 h-4 text-slate-300" />
    </button>
  );
}
