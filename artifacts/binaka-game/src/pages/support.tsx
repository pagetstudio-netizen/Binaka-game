import { ChevronRight, Clock, Zap, ShieldCheck } from "lucide-react";

const TELEGRAM_SERVICE = "https://t.me/BInakaGame_service";
const TELEGRAM_GROUPE  = "https://t.me/BInakaGame_groupe";
const TELEGRAM_CHAINE  = "https://t.me/BInakaGame";
const HEURES_EN_LIGNE  = "9:00 AM – 7:00 PM";

const GREEN = "#0F8A5F";

export default function Support() {
  return (
    <div className="flex-1 w-full overflow-y-auto flex flex-col" style={{ background: "#071C12" }}>

      {/* ── Bandeau 3 atouts ── */}
      <div className="px-4 py-5" style={{ background: "#0A2118", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { icon: <Clock size={24} style={{ color: GREEN }} />, label: "Support toute\nla journée", sub: "Service en ligne\n24h/24" },
            { icon: <Zap size={24} style={{ color: GREEN }} />, label: "Haute\nefficacité", sub: "Délai de réponse\nrapide" },
            { icon: <ShieldCheck size={24} style={{ color: GREEN }} />, label: "Profession-\nnalisme", sub: "Réponses à vos\nquestions" },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center"
                style={{ border: `2px solid ${GREEN}`, background: "rgba(15,138,95,0.12)" }}>
                {item.icon}
              </div>
              <p className="text-[11px] font-bold leading-tight" style={{ color: GREEN }}>
                {item.label.split("\n").map((l, j) => <span key={j}>{l}{j === 0 && <br />}</span>)}
              </p>
              <p className="text-[10px] leading-tight" style={{ color: "rgba(255,255,255,0.40)" }}>
                {item.sub.split("\n").map((l, j) => <span key={j}>{l}{j === 0 && <br />}</span>)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bloc Telegram ── */}
      <div className="flex-1 flex flex-col px-5 pt-6 pb-5" style={{ background: "linear-gradient(160deg, #0A5C3A 0%, #071C12 100%)" }}>

        <h2 className="text-white text-2xl font-bold text-center mb-5">Telegram</h2>

        <div className="flex gap-3 items-start mb-6">
          {/* Illustration Telegram */}
          <div className="w-[130px] h-[140px] flex-shrink-0 rounded-2xl overflow-hidden flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.08)" }}>
            <svg viewBox="0 0 100 100" className="w-20 h-20" fill="none">
              <circle cx="50" cy="50" r="46" fill="white" fillOpacity="0.10"/>
              <path d="M18 50 L82 22 L62 80 L45 63 L18 50Z" fill="white" fillOpacity="0.90"/>
              <path d="M45 63 L43 80 L55 67" fill="white" fillOpacity="0.60"/>
              <path d="M45 63 L82 22" stroke="white" strokeWidth="2" strokeOpacity="0.35"/>
            </svg>
          </div>

          {/* Boutons */}
          <div className="flex-1 flex flex-col gap-3">
            {[
              { href: TELEGRAM_SERVICE, label: "@Service Telegram" },
              { href: TELEGRAM_GROUPE,  label: "@Groupe officiel\nTelegram" },
              { href: TELEGRAM_CHAINE,  label: "@Chaîne officielle\nTelegram" },
            ].map((link, i) => (
              <a key={i} href={link.href} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between rounded-full px-4 py-3 shadow-md active:scale-95 transition-transform"
                style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.20)" }}>
                <span className="font-semibold text-sm leading-tight text-white">{link.label.split("\n").map((l, j) => <span key={j}>{l}{j === 0 && link.label.includes("\n") && <br />}</span>)}</span>
                <ChevronRight size={16} style={{ color: "rgba(255,255,255,0.55)" }} className="flex-shrink-0 ml-2" />
              </a>
            ))}
          </div>
        </div>

        {/* Heures en ligne */}
        <div className="text-center mt-auto">
          <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.65)" }}>Heures en ligne :</p>
          <p className="text-white text-2xl font-bold mt-0.5">{HEURES_EN_LIGNE}</p>
        </div>

        <p className="text-[11px] text-center mt-3 leading-snug px-2" style={{ color: "rgba(255,255,255,0.40)" }}>
          Pour toute question, n'hésitez pas à contacter notre service client. Nous serons ravis de vous aider.
        </p>
      </div>
    </div>
  );
}
