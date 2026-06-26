import { Link } from "wouter";
import { ArrowLeft, ChevronRight, Clock, Zap, ShieldCheck } from "lucide-react";

// ⚠️ Configurez vos liens Telegram ici
const TELEGRAM_SERVICE = "https://t.me/BInakaGame_service";
const TELEGRAM_GROUPE  = "https://t.me/BInakaGame_groupe";
const TELEGRAM_CHAINE  = "https://t.me/BInakaGame";

// ⚠️ Heures de service
const HEURES_EN_LIGNE = "9:00 AM – 7:00 PM";

export default function Support() {
  return (
    <div className="h-[100dvh] w-full overflow-hidden flex flex-col bg-white">

      {/* ── Header ── */}
      <header className="sticky top-0 z-20 flex items-center px-4 py-4 border-b border-gray-200 bg-white shadow-sm">
        <Link href="/">
          <button className="p-1.5 rounded-full hover:bg-gray-100 transition-colors active:scale-95">
            <ArrowLeft size={22} className="text-gray-700" />
          </button>
        </Link>
        <h1 className="text-lg font-bold text-gray-800 flex-1 text-center pr-8">
          Service client
        </h1>
      </header>

      {/* ── Bandeau 3 atouts ── */}
      <div className="bg-gray-50 border-b border-gray-100 px-4 py-5">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-13 h-13 w-[52px] h-[52px] rounded-full border-2 border-[#16a34a] flex items-center justify-center">
              <Clock size={24} className="text-[#16a34a]" />
            </div>
            <p className="text-[11px] font-bold text-[#16a34a] leading-tight">Support toute<br />la journée</p>
            <p className="text-[10px] text-gray-400 leading-tight">Service en ligne<br />24h/24</p>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <div className="w-[52px] h-[52px] rounded-full border-2 border-[#16a34a] flex items-center justify-center">
              <Zap size={24} className="text-[#16a34a]" />
            </div>
            <p className="text-[11px] font-bold text-[#16a34a] leading-tight">Haute<br />efficacité</p>
            <p className="text-[10px] text-gray-400 leading-tight">Délai de réponse<br />rapide</p>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <div className="w-[52px] h-[52px] rounded-full border-2 border-[#16a34a] flex items-center justify-center">
              <ShieldCheck size={24} className="text-[#16a34a]" />
            </div>
            <p className="text-[11px] font-bold text-[#16a34a] leading-tight">Profession-<br />nalisme</p>
            <p className="text-[10px] text-gray-400 leading-tight">Réponses à vos<br />questions</p>
          </div>
        </div>
      </div>

      {/* ── Bloc Telegram (fond vert) ── */}
      <div className="flex-1 bg-[#16a34a] flex flex-col px-5 pt-6 pb-5">

        <h2 className="text-white text-2xl font-bold text-center mb-5">Telegram</h2>

        {/* Image + boutons */}
        <div className="flex gap-3 items-start mb-6">
          {/* Illustration Telegram */}
          <div className="w-[130px] h-[140px] flex-shrink-0 rounded-2xl overflow-hidden bg-white/15 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-20 h-20" fill="none">
              <circle cx="50" cy="50" r="46" fill="white" fillOpacity="0.15"/>
              <path d="M18 50 L82 22 L62 80 L45 63 L18 50Z" fill="white" fillOpacity="0.92"/>
              <path d="M45 63 L43 80 L55 67" fill="white" fillOpacity="0.65"/>
              <path d="M45 63 L82 22" stroke="white" strokeWidth="2" strokeOpacity="0.4"/>
            </svg>
          </div>

          {/* Boutons */}
          <div className="flex-1 flex flex-col gap-3">
            <a
              href={TELEGRAM_SERVICE}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between bg-white rounded-full px-4 py-3 shadow-md active:scale-95 transition-transform"
            >
              <span className="text-[#16a34a] font-semibold text-sm">@Service Telegram</span>
              <ChevronRight size={16} className="text-[#16a34a] flex-shrink-0" />
            </a>

            <a
              href={TELEGRAM_GROUPE}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between bg-white rounded-full px-4 py-3 shadow-md active:scale-95 transition-transform"
            >
              <span className="text-[#16a34a] font-semibold text-sm leading-tight">@Groupe officiel<br />Telegram</span>
              <ChevronRight size={16} className="text-[#16a34a] flex-shrink-0" />
            </a>

            <a
              href={TELEGRAM_CHAINE}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between bg-white rounded-full px-4 py-3 shadow-md active:scale-95 transition-transform"
            >
              <span className="text-[#16a34a] font-semibold text-sm leading-tight">@Chaîne officielle<br />Telegram</span>
              <ChevronRight size={16} className="text-[#16a34a] flex-shrink-0" />
            </a>
          </div>
        </div>

        {/* Heures en ligne */}
        <div className="text-center mt-auto">
          <p className="text-white/75 text-sm font-medium">Heures en ligne :</p>
          <p className="text-white text-2xl font-bold mt-0.5">{HEURES_EN_LIGNE}</p>
        </div>

        {/* Note bas */}
        <p className="text-white/55 text-[11px] text-center mt-3 leading-snug px-2">
          Pour toute question, n'hésitez pas à contacter notre service client. Nous serons ravis de vous aider.
        </p>
      </div>
    </div>
  );
}
