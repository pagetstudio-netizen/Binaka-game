import { useState, useRef } from "react";
import { useGetReferralInfo, getGetReferralInfoQueryKey } from "@workspace/api-client-react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { Copy, Share2, Users, ChevronRight, ChevronLeft, MessageCircle, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TABS = ["Mes Gains", "Gains Filleuls", "Règles"];

const LEVELS = [
  {
    id: 0, label: "LV 0", icon: "🥉", color: "#9ca3af", bg: "from-gray-400 to-gray-600",
    teamMin: 0, teamBet: 0, betRebate: "0.00%", depositRebate: "0.00%", inviteBonus: 0, weeklyBonus: 0,
    badge: "Débutant",
  },
  {
    id: 1, label: "LV 1", icon: "🥈", color: "#6ee7b7", bg: "from-emerald-400 to-green-600",
    teamMin: 1, teamBet: 5000, betRebate: "0.30%", depositRebate: "0.10%", inviteBonus: 400, weeklyBonus: 0,
    badge: "Bronze",
  },
  {
    id: 2, label: "LV 2", icon: "🥇", color: "#fbbf24", bg: "from-amber-400 to-yellow-600",
    teamMin: 5, teamBet: 50000, betRebate: "0.50%", depositRebate: "0.20%", inviteBonus: 2000, weeklyBonus: 500,
    badge: "Argent",
  },
  {
    id: 3, label: "LV 3", icon: "💎", color: "#60a5fa", bg: "from-blue-400 to-indigo-600",
    teamMin: 20, teamBet: 300000, betRebate: "0.70%", depositRebate: "0.30%", inviteBonus: 10000, weeklyBonus: 2000,
    badge: "Or",
  },
  {
    id: 4, label: "LV 4", icon: "👑", color: "#c084fc", bg: "from-purple-400 to-violet-700",
    teamMin: 50, teamBet: 1000000, betRebate: "1.00%", depositRebate: "0.50%", inviteBonus: 30000, weeklyBonus: 8000,
    badge: "Platine",
  },
  {
    id: 5, label: "LV 5", icon: "🏆", color: "#fb923c", bg: "from-orange-400 to-red-600",
    teamMin: 100, teamBet: 5000000, betRebate: "1.50%", depositRebate: "1.00%", inviteBonus: 100000, weeklyBonus: 25000,
    badge: "Diamant",
  },
];

const PRIVILEGES = [
  {
    id: 0, icon: "💸", title: "Rebate Paris", subtitle: "Remboursement", value: "Jusqu'à 1.50%", color: "#16a34a", bg: "from-green-600 to-emerald-700",
  },
  {
    id: 1, icon: "🏦", title: "Rebate Dépôt", subtitle: "Bonus dépôt", value: "Jusqu'à 1.00%", color: "#d97706", bg: "from-amber-500 to-yellow-700",
  },
  {
    id: 2, icon: "👥", title: "Bonus Filleul", subtitle: "Par invitation", value: "Jusqu'à 100 000 FCFA", color: "#6d28d9", bg: "from-violet-500 to-purple-700",
  },
  {
    id: 3, icon: "📅", title: "Bonus Hebdo", subtitle: "Chaque semaine", value: "Jusqu'à 25 000 FCFA", color: "#0891b2", bg: "from-cyan-500 to-blue-700",
  },
];

function PrivilegeCard({ priv, active }: { priv: typeof PRIVILEGES[0]; active: boolean }) {
  return (
    <motion.div
      animate={{ scale: active ? 1 : 0.9, opacity: active ? 1 : 0.65 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`flex-shrink-0 w-44 rounded-2xl p-4 bg-gradient-to-br ${priv.bg} text-white flex flex-col items-center gap-2 shadow-lg`}
    >
      <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl shadow-inner">
        {priv.icon}
      </div>
      <p className="font-black text-sm text-center leading-tight">{priv.title}</p>
      <p className="text-xs text-white/70 text-center">{priv.subtitle}</p>
      <div className="bg-black/20 rounded-xl px-3 py-1 text-center">
        <p className="font-black text-xs text-white">{priv.value}</p>
      </div>
    </motion.div>
  );
}

function LevelCard({ level, current, active }: { level: typeof LEVELS[0]; current: number; active: boolean }) {
  const progress = Math.min((current / Math.max(level.teamMin, 1)) * 100, 100);
  return (
    <motion.div
      animate={{ scale: active ? 1 : 0.88, opacity: active ? 1 : 0.55 }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      className={`flex-shrink-0 w-64 rounded-3xl bg-gradient-to-br ${level.bg} text-white p-5 shadow-2xl`}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="bg-white/20 text-white text-xs font-black px-3 py-1 rounded-full">{level.badge}</span>
          <h3 className="font-black text-4xl mt-1">{level.label}</h3>
        </div>
        <span className="text-5xl drop-shadow-md">{level.icon}</span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-white/80 font-bold">
          <span>👥 Équipe min.</span><span>{level.teamMin} filleuls</span>
        </div>
        <div className="w-full bg-black/20 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${active ? progress : 0}%` }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="h-2 rounded-full bg-white/80"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="bg-black/20 rounded-xl p-2 text-center">
            <p className="text-xs text-white/70">Rebate Paris</p>
            <p className="font-black text-sm">{level.betRebate}</p>
          </div>
          <div className="bg-black/20 rounded-xl p-2 text-center">
            <p className="text-xs text-white/70">Bonus Invite</p>
            <p className="font-black text-sm">{level.inviteBonus > 0 ? `${level.inviteBonus.toLocaleString("fr-FR")} F` : "–"}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Referral() {
  const { data: info } = useGetReferralInfo({ query: { queryKey: getGetReferralInfoQueryKey() } });
  const { toast } = useToast();
  const [tab, setTab] = useState(0);
  const [privIdx, setPrivIdx] = useState(0);
  const [levelIdx, setLevelIdx] = useState(0);
  const privRef = useRef<HTMLDivElement>(null);
  const levelRef = useRef<HTMLDivElement>(null);

  const totalInvited = info?.totalInvited || 0;
  const totalEarned = info?.totalEarned || 0;
  const currentLevel = LEVELS.findLast((l) => totalInvited >= l.teamMin) || LEVELS[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "✅ Copié !", description: "Code copié dans le presse-papiers", className: "bg-green-600 text-white border-none" });
  };

  const handleShare = () => {
    const link = info?.referralLink || `https://binaka.game/r/${info?.referralCode}`;
    if (navigator.share) {
      navigator.share({ title: "Rejoins BINAKA GAME 🎮", text: "Inscris-toi avec mon code et gagnons ensemble !", url: link }).catch(() => handleCopy(link));
    } else {
      handleCopy(link);
    }
  };

  const scrollPriv = (dir: number) => {
    const next = Math.max(0, Math.min(PRIVILEGES.length - 1, privIdx + dir));
    setPrivIdx(next);
    const el = privRef.current;
    if (el) el.scrollTo({ left: next * 192, behavior: "smooth" });
  };

  const scrollLevel = (dir: number) => {
    const next = Math.max(0, Math.min(LEVELS.length - 1, levelIdx + dir));
    setLevelIdx(next);
    const el = levelRef.current;
    if (el) el.scrollTo({ left: next * 272, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col w-full min-h-full pb-24" style={{ background: "#EAF8F2" }}>
      {/* HEADER GRADIENT */}
      <div className="bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 px-4 pt-4 pb-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white" style={{ width: 80 + i * 40, height: 80 + i * 40, top: -20 + i * 15, right: -30 + i * 10, opacity: 0.3 }} />
          ))}
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-white font-black text-2xl">Commission Million</h1>
              <p className="text-green-200 text-xs mt-0.5">Invitez & gagnez à vie</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Gift className="text-white" size={22} />
            </div>
          </div>

          {/* TABS */}
          <div className="flex bg-black/20 rounded-2xl p-1 gap-1">
            {TABS.map((t, i) => (
              <motion.button key={t} onClick={() => setTab(i)} layout
                className="flex-1 py-2 rounded-xl text-xs font-black transition-colors"
                style={{ color: tab === i ? "#16a34a" : "rgba(255,255,255,0.7)", background: tab === i ? "white" : "transparent" }}>
                {t}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {tab === 0 && (
          <motion.div key="gains" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col gap-4 px-4 -mt-4">

            {/* TEAM LEVEL CARD */}
            <div className="bg-white rounded-3xl shadow-lg p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wide">Niveau de mon équipe</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${currentLevel.bg} flex items-center gap-1.5`}>
                      <span className="text-base">{currentLevel.icon}</span>
                      <span className="text-white font-black text-sm">{currentLevel.label}</span>
                    </div>
                  </div>
                </div>
                <motion.button whileTap={{ scale: 0.94 }}
                  className="px-4 py-2 rounded-xl font-black text-sm text-white"
                  style={{ background: "linear-gradient(135deg, #16a34a, #22c55e)" }}>
                  Détail
                </motion.button>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                    <span>👥 Nombre d'équipe</span>
                    <span className="text-green-600">{totalInvited}/{LEVELS[Math.min(currentLevel.id + 1, 5)].teamMin}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${Math.min((totalInvited / Math.max(LEVELS[Math.min(currentLevel.id + 1, 5)].teamMin, 1)) * 100, 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-2.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-400"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                    <span>🎯 Paris d'équipe</span>
                    <span className="text-green-600">0 / {LEVELS[Math.min(currentLevel.id + 1, 5)].teamBet.toLocaleString("fr-FR")} FCFA</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className="h-2.5 w-0 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* PRIVILEGES CAROUSEL */}
            <div className="bg-white rounded-3xl shadow-lg p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-r from-green-600 to-emerald-500 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-md">
                  ✨ Mes Privilèges
                </div>
                <div className="flex gap-2">
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => scrollPriv(-1)} disabled={privIdx === 0}
                    className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center disabled:opacity-30">
                    <ChevronLeft size={16} className="text-gray-600" />
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => scrollPriv(1)} disabled={privIdx === PRIVILEGES.length - 1}
                    className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center disabled:opacity-30">
                    <ChevronRight size={16} className="text-gray-600" />
                  </motion.button>
                </div>
              </div>

              <div ref={privRef} className="flex gap-3 overflow-x-auto scrollbar-hide pb-2" style={{ scrollbarWidth: "none" }}>
                {PRIVILEGES.map((p, i) => (
                  <PrivilegeCard key={p.id} priv={p} active={i === privIdx} />
                ))}
              </div>

              <div className="flex justify-center gap-1.5 mt-3">
                {PRIVILEGES.map((_, i) => (
                  <motion.button key={i} onClick={() => { setPrivIdx(i); if (privRef.current) privRef.current.scrollTo({ left: i * 192, behavior: "smooth" }); }}
                    animate={{ width: privIdx === i ? 20 : 8, background: privIdx === i ? "#16a34a" : "#d1d5db" }}
                    className="h-2 rounded-full"
                  />
                ))}
              </div>
            </div>

            {/* REWARDS */}
            <div className="bg-white rounded-3xl shadow-lg p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-black text-gray-800">Retirer Gains</span>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
                <motion.button whileTap={{ scale: 0.96 }}
                  className="px-5 py-2 rounded-xl font-black text-sm text-white shadow"
                  style={{ background: totalEarned > 0 ? "linear-gradient(135deg,#16a34a,#22c55e)" : "#9ca3af" }}>
                  Réclamer
                </motion.button>
              </div>
              <p className="text-3xl font-black text-green-600 mb-4">{totalEarned.toLocaleString("fr-FR")} <span className="text-lg text-gray-400">FCFA</span></p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-amber-50 rounded-2xl p-3 border border-amber-100">
                  <p className="text-xs text-gray-500 font-bold">Gains totaux</p>
                  <p className="text-lg font-black text-amber-600">{totalEarned.toLocaleString("fr-FR")} FCFA</p>
                </div>
                <div className="bg-green-50 rounded-2xl p-3 border border-green-100">
                  <p className="text-xs text-gray-500 font-bold">Gains du jour</p>
                  <p className="text-lg font-black text-green-600">0 FCFA</p>
                </div>
              </div>
            </div>

            {/* INVITE BUTTONS */}
            <div className="space-y-3">
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleShare}
                className="w-full h-14 rounded-2xl font-black text-white text-lg shadow-lg"
                style={{ background: "linear-gradient(135deg,#16a34a,#22c55e)" }}>
                🎉 Inviter mes Amis
              </motion.button>
              <div className="grid grid-cols-2 gap-3">
                <motion.button whileTap={{ scale: 0.96 }} onClick={handleShare}
                  className="h-12 rounded-xl font-black text-white text-sm flex items-center justify-center gap-2 shadow"
                  style={{ background: "#0088cc" }}>
                  <MessageCircle size={18} /> Telegram
                </motion.button>
                <motion.button whileTap={{ scale: 0.96 }} onClick={handleShare}
                  className="h-12 rounded-xl font-black text-white text-sm flex items-center justify-center gap-2 shadow"
                  style={{ background: "#25d366" }}>
                  <Share2 size={18} /> WhatsApp
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {tab === 1 && (
          <motion.div key="filleuls" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col gap-4 px-4 -mt-4">

            {/* NIVEAU CARDS CAROUSEL */}
            <div className="bg-white rounded-3xl shadow-lg p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-gray-800 text-base">Niveaux & Récompenses</h3>
                <div className="flex gap-2">
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => scrollLevel(-1)} disabled={levelIdx === 0}
                    className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center disabled:opacity-30">
                    <ChevronLeft size={16} className="text-gray-600" />
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => scrollLevel(1)} disabled={levelIdx === LEVELS.length - 1}
                    className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center disabled:opacity-30">
                    <ChevronRight size={16} className="text-gray-600" />
                  </motion.button>
                </div>
              </div>

              <div ref={levelRef} className="flex gap-4 overflow-x-auto pb-3" style={{ scrollbarWidth: "none" }}>
                {LEVELS.map((level, i) => (
                  <LevelCard key={level.id} level={level} current={totalInvited} active={i === levelIdx} />
                ))}
              </div>

              <div className="flex justify-center gap-1.5 mt-2">
                {LEVELS.map((_, i) => (
                  <motion.button key={i} onClick={() => { setLevelIdx(i); if (levelRef.current) levelRef.current.scrollTo({ left: i * 272, behavior: "smooth" }); }}
                    animate={{ width: levelIdx === i ? 20 : 8, background: levelIdx === i ? "#16a34a" : "#d1d5db" }}
                    className="h-2 rounded-full"
                  />
                ))}
              </div>
            </div>

            {/* COMPARAISON TABLE */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-4 py-3">
                <h3 className="text-white font-black text-sm">Tableau Comparatif des Niveaux</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-3 py-2.5 text-left font-black text-gray-500">Niveau</th>
                      <th className="px-2 py-2.5 text-center font-black text-gray-500">Min.<br />filleuls</th>
                      <th className="px-2 py-2.5 text-center font-black text-gray-500">Rebate<br />Paris</th>
                      <th className="px-2 py-2.5 text-center font-black text-gray-500">Bonus<br />Hebdo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {LEVELS.map((level, i) => {
                      const isCurrentOrPassed = totalInvited >= level.teamMin;
                      return (
                        <motion.tr key={level.id}
                          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className={`border-b border-gray-50 ${isCurrentOrPassed ? "bg-green-50" : ""}`}>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{level.icon}</span>
                              <div>
                                <p className="font-black text-gray-800">{level.label}</p>
                                <p className="text-gray-400 text-xs">{level.badge}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-2 py-3 text-center font-bold" style={{ color: isCurrentOrPassed ? "#16a34a" : "#374151" }}>
                            {level.teamMin}
                          </td>
                          <td className="px-2 py-3 text-center font-bold text-amber-600">{level.betRebate}</td>
                          <td className="px-2 py-3 text-center font-bold text-violet-600">
                            {level.weeklyBonus > 0 ? `${level.weeklyBonus.toLocaleString("fr-FR")} F` : "–"}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MON CODE */}
            <div className="bg-white rounded-3xl shadow-lg p-5 border border-gray-100">
              <p className="text-xs font-black text-gray-400 uppercase tracking-wide mb-2">Mon Code de Parrainage</p>
              <div className="flex gap-3 items-center">
                <div className="flex-1 bg-gray-50 border-2 border-dashed border-green-300 rounded-2xl px-4 py-3 text-center">
                  <p className="font-black text-2xl tracking-[0.2em] text-green-700">{info?.referralCode || "BINAKA"}</p>
                </div>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleCopy(info?.referralCode || "BINAKA")}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow"
                  style={{ background: "linear-gradient(135deg,#16a34a,#22c55e)" }}>
                  <Copy className="text-white" size={20} />
                </motion.button>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Users size={14} className="text-gray-400" />
                <span className="text-sm text-gray-500 font-bold">
                  {totalInvited} ami{totalInvited !== 1 ? "s" : ""} invité{totalInvited !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {tab === 2 && (
          <motion.div key="regles" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col gap-4 px-4 -mt-4">
            <div className="bg-white rounded-3xl shadow-lg p-5 border border-gray-100 space-y-4">
              {[
                { icon: "1️⃣", title: "Invitez un ami", desc: "Partagez votre code unique. Votre ami s'inscrit et effectue un premier dépôt." },
                { icon: "2️⃣", title: "Il joue, vous gagnez", desc: "Chaque pari de votre filleul vous rapporte un rebate en temps réel, crédité directement sur votre solde." },
                { icon: "3️⃣", title: "Montez de niveau", desc: "Plus votre équipe s'agrandit, plus vos avantages augmentent: rebates, bonus hebdomadaires, et récompenses d'invitation." },
                { icon: "4️⃣", title: "Retirez vos gains", desc: "Vos commissions sont disponibles immédiatement. Aucun minimum de retrait pour les commissions de parrainage." },
              ].map((rule, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  className="flex gap-4 items-start p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-2xl flex-shrink-0">{rule.icon}</span>
                  <div>
                    <p className="font-black text-gray-800 text-sm mb-1">{rule.title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{rule.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-green-600 to-emerald-500 rounded-3xl p-5 text-white">
              <p className="font-black text-lg mb-1">⚠️ Conditions</p>
              <ul className="text-sm text-white/80 space-y-1 list-disc list-inside">
                <li>Le filleul doit effectuer un dépôt minimum de 1 000 FCFA</li>
                <li>L'auto-parrainage est interdit</li>
                <li>Les gains sont calculés sur les paris réels uniquement</li>
                <li>BINAKA se réserve le droit de modifier ce programme</li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
