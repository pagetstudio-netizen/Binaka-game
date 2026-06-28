import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Loader2, Eye, EyeOff, Lock, Phone, RefreshCw, ChevronDown } from "lucide-react";
import bannerImg from "@assets/file_000000007f2c71f4bdc6d0d958f5bd37_1782547684603.png";

const WHATSAPP_NUMBER = "22890000000";

const COUNTRIES = [
  { code: "TG", dial: "+228", flag: "🇹🇬", name: "Togo" },
  { code: "BJ", dial: "+229", flag: "🇧🇯", name: "Bénin" },
  { code: "CI", dial: "+225", flag: "🇨🇮", name: "Côte d'Ivoire" },
  { code: "SN", dial: "+221", flag: "🇸🇳", name: "Sénégal" },
  { code: "ML", dial: "+223", flag: "🇲🇱", name: "Mali" },
  { code: "BF", dial: "+226", flag: "🇧🇫", name: "Burkina Faso" },
  { code: "GH", dial: "+233", flag: "🇬🇭", name: "Ghana" },
  { code: "CM", dial: "+237", flag: "🇨🇲", name: "Cameroun" },
  { code: "GN", dial: "+224", flag: "🇬🇳", name: "Guinée" },
  { code: "NE", dial: "+227", flag: "🇳🇪", name: "Niger" },
];

const CAPTCHA_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const genCode = () => Array.from({ length: 6 }, () => CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)]).join("");

function CaptchaCanvas({ code }: { code: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#0D2B1E"); grad.addColorStop(1, "#071C12");
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.strokeStyle = `hsla(${Math.random() * 360},60%,65%,0.4)`;
      ctx.lineWidth = 1.5;
      ctx.moveTo(Math.random() * W, Math.random() * H);
      ctx.bezierCurveTo(Math.random() * W, Math.random() * H, Math.random() * W, Math.random() * H, Math.random() * W, Math.random() * H);
      ctx.stroke();
    }
    code.split("").forEach((ch, i) => {
      const cw = W / code.length;
      ctx.save();
      ctx.translate(cw * i + cw / 2, H / 2 + (Math.random() - 0.5) * 8);
      ctx.rotate((Math.random() - 0.5) * 0.45);
      ctx.font = `bold ${22 + Math.floor(Math.random() * 6)}px monospace`;
      ctx.fillStyle = `hsl(${[45, 140, 30, 200, 280][i % 5]},90%,65%)`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(ch, 0, 0);
      ctx.restore();
    });
    for (let i = 0; i < 35; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 1.8, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${Math.random() * 360},60%,60%,0.4)`;
      ctx.fill();
    }
  }, [code]);
  return <canvas ref={ref} width={180} height={52} className="rounded-xl shadow-inner" style={{ border: "1px solid rgba(255,255,255,0.15)" }} />;
}

const schema = z.object({
  phone: z.string().min(8, "Numéro invalide"),
  password: z.string().min(6, "Mot de passe trop court"),
});

const WA_SVG = (
  <svg viewBox="0 0 32 32" fill="white" className="w-7 h-7">
    <path d="M16.004 2C8.28 2 2 8.277 2 16a13.94 13.94 0 0 0 1.93 7.07L2 30l7.13-1.87A14.02 14.02 0 0 0 16.004 30C23.724 30 30 23.723 30 16S23.724 2 16.004 2zm0 25.6a11.64 11.64 0 0 1-5.93-1.62l-.42-.25-4.24 1.11 1.13-4.12-.27-.43A11.56 11.56 0 0 1 4.4 16c0-6.4 5.21-11.6 11.6-11.6 6.4 0 11.6 5.2 11.6 11.6S22.4 27.6 16.004 27.6zm6.36-8.68c-.35-.17-2.06-1.01-2.38-1.13-.32-.11-.55-.17-.78.17-.23.34-.9 1.13-1.1 1.36-.2.23-.4.26-.75.09-.35-.17-1.48-.54-2.81-1.73-1.04-.93-1.74-2.07-1.94-2.42-.2-.35-.02-.54.15-.71.15-.15.35-.4.52-.6.17-.2.23-.34.35-.57.11-.23.06-.43-.03-.6-.09-.17-.78-1.87-1.07-2.56-.28-.67-.57-.58-.78-.59h-.66c-.23 0-.6.09-.91.43-.32.34-1.2 1.17-1.2 2.86s1.23 3.32 1.4 3.55c.17.23 2.42 3.7 5.87 5.19.82.35 1.46.56 1.96.72.82.26 1.57.22 2.16.13.66-.1 2.06-.84 2.35-1.65.29-.81.29-1.5.2-1.65-.09-.14-.32-.23-.67-.4z" />
  </svg>
);

const BG      = "#071C12";
const CARD    = "#0D2B1E";
const BORDER  = "rgba(255,255,255,0.12)";
const INPUT_BG = "rgba(255,255,255,0.06)";
const GOLD    = "#F4C430";
const GREEN   = "#0F8A5F";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [captchaCode, setCaptchaCode] = useState(genCode);
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);

  const refreshCaptcha = useCallback(() => {
    setCaptchaCode(genCode());
    setCaptchaInput("");
    setCaptchaError(false);
  }, []);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { phone: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    if (captchaInput.toUpperCase() !== captchaCode) {
      setCaptchaError(true);
      refreshCaptcha();
      toast({ variant: "destructive", title: "Code de vérification incorrect", description: "Veuillez réessayer." });
      return;
    }
    try {
      const response = await loginMutation.mutateAsync({ data: values });
      login(response.token, response.user);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur de connexion", description: error.message || "Identifiants incorrects." });
      refreshCaptcha();
    }
  }

  const errors = form.formState.errors;

  return (
    <div className="min-h-[100dvh] w-full flex flex-col select-none" style={{ background: BG }}>

      {/* ── BANNER IMAGE ── */}
      <div className="w-full relative flex-shrink-0" style={{ maxHeight: 260 }}>
        <img src={bannerImg} alt="BINAKA GAME" className="w-full object-cover object-center" style={{ maxHeight: 260 }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, #071C12 100%)" }} />
      </div>

      {/* ── FORM CARD ── */}
      <div className="flex-1 -mt-6 rounded-t-3xl z-10 flex flex-col px-5 pt-5 pb-8" style={{ background: BG }}>

        {/* TABS */}
        <div className="flex rounded-2xl p-1 mb-6" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <div className="flex-1 py-2.5 rounded-xl text-center text-sm font-black text-white"
            style={{ background: "linear-gradient(135deg,#0F8A5F,#0A5C3A)" }}>
            Se connecter
          </div>
          <Link href="/register" className="flex-1 py-2.5 rounded-xl text-center text-sm font-bold"
            style={{ color: "rgba(255,255,255,0.45)" }}>
            S'inscrire
          </Link>
        </div>

        <div className="space-y-4">

          {/* Téléphone */}
          <div>
            <label className="text-xs font-black uppercase tracking-wide mb-1.5 block" style={{ color: "rgba(255,255,255,0.55)" }}>
              Pays & Numéro de téléphone
            </label>
            <div className="flex items-center h-13 rounded-2xl overflow-hidden transition-colors"
              style={{ background: INPUT_BG, border: `1.5px solid ${BORDER}` }}>
              <Phone size={16} className="ml-4 shrink-0" style={{ color: "rgba(255,255,255,0.40)" }} />
              <div className="relative flex items-center h-full shrink-0" style={{ borderRight: `1px solid ${BORDER}` }}>
                <select
                  className="h-full pl-2 pr-7 bg-transparent text-xs font-bold outline-none appearance-none cursor-pointer text-white"
                  value={selectedCountry.code}
                  onChange={(e) => {
                    const found = COUNTRIES.find((c) => c.code === e.target.value) || COUNTRIES[0];
                    setSelectedCountry(found);
                  }}>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code} style={{ background: "#0D2B1E" }}>{c.flag} {c.dial}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-1.5 pointer-events-none" style={{ color: "rgba(255,255,255,0.40)" }} />
              </div>
              <input type="tel" inputMode="numeric" placeholder="Ex: 90 00 00 00"
                className="flex-1 h-full px-3 bg-transparent text-sm outline-none text-white placeholder:text-white/30"
                {...form.register("phone")} />
            </div>
            {errors.phone && <p className="text-red-400 text-xs mt-1 pl-1">{errors.phone.message}</p>}
          </div>

          {/* Mot de passe */}
          <div>
            <label className="text-xs font-black uppercase tracking-wide mb-1.5 block" style={{ color: "rgba(255,255,255,0.55)" }}>
              Mot de passe
            </label>
            <div className="flex items-center h-13 rounded-2xl overflow-hidden transition-colors"
              style={{ background: INPUT_BG, border: `1.5px solid ${BORDER}` }}>
              <Lock size={16} className="ml-4 shrink-0" style={{ color: "rgba(255,255,255,0.40)" }} />
              <input type={showPassword ? "text" : "password"} placeholder="Mot de passe"
                className="flex-1 h-full px-3 bg-transparent text-sm outline-none text-white placeholder:text-white/30"
                {...form.register("password")} />
              <button type="button" className="px-4" style={{ color: "rgba(255,255,255,0.40)" }}
                onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1 pl-1">{errors.password.message}</p>}
          </div>

          {/* CAPTCHA */}
          <div>
            <label className="text-xs font-black uppercase tracking-wide mb-1.5 block" style={{ color: "rgba(255,255,255,0.55)" }}>
              Code de vérification — Confirmez que vous êtes humain
            </label>
            <div className="flex items-center gap-3 mb-2">
              <CaptchaCanvas code={captchaCode} />
              <motion.button type="button" whileTap={{ scale: 0.9 }} onClick={refreshCaptcha}
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                <RefreshCw size={16} style={{ color: GREEN }} />
              </motion.button>
            </div>
            <div className="flex items-center h-13 rounded-2xl overflow-hidden transition-colors"
              style={{ background: INPUT_BG, border: `1.5px solid ${captchaError ? "#ef4444" : BORDER}` }}>
              <input type="text" placeholder="Entrez le code ci-dessus" maxLength={6}
                value={captchaInput}
                onChange={(e) => { setCaptchaInput(e.target.value.toUpperCase()); setCaptchaError(false); }}
                className="flex-1 h-full px-4 bg-transparent text-sm font-bold outline-none text-white tracking-widest placeholder:text-white/25 placeholder:tracking-normal placeholder:font-normal"
              />
            </div>
            {captchaError && <p className="text-red-400 text-xs mt-1 pl-1">Code incorrect — un nouveau code a été généré</p>}
          </div>

          {/* SE CONNECTER */}
          <motion.button type="button" whileTap={{ scale: 0.97 }}
            onClick={form.handleSubmit(onSubmit)}
            disabled={loginMutation.isPending}
            className="w-full h-14 rounded-2xl text-white font-black text-base tracking-wide shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg,#0F8A5F,#0A5C3A)", boxShadow: "0 4px 20px rgba(15,138,95,0.4)" }}>
            {loginMutation.isPending && <Loader2 className="animate-spin" size={18} />}
            SE CONNECTER
          </motion.button>

          {/* Link to register */}
          <Link href="/register">
            <motion.div whileTap={{ scale: 0.97 }}
              className="w-full h-12 rounded-2xl flex items-center justify-center font-black text-sm"
              style={{ border: `1.5px solid ${GOLD}55`, background: "rgba(244,196,48,0.08)", color: GOLD }}>
              Pas encore de compte ? S'inscrire
            </motion.div>
          </Link>

          <p className="text-center text-[11px] pt-2" style={{ color: "rgba(255,255,255,0.30)" }}>
            🔒 Connexion sécurisée · BINAKA GAME v1.0.0
          </p>
        </div>
      </div>

      {/* WhatsApp FAB */}
      <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-5 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center z-50"
        style={{ background: "#25D366" }}>
        {WA_SVG}
      </a>
    </div>
  );
}
