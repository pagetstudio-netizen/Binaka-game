import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Loader2, Eye, EyeOff, Lock, Phone, User, Gift, RefreshCw, ChevronDown } from "lucide-react";
import bannerImg from "@assets/file_000000007f2c71f4bdc6d0d958f5bd37_1782547684603.png";

const WHATSAPP_NUMBER = "22890000000";

/* ── COUNTRIES ──────────────────────────────────────── */
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

/* ── CAPTCHA ────────────────────────────────────────── */
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
    grad.addColorStop(0, "#f0fdf4"); grad.addColorStop(1, "#fefce8");
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.strokeStyle = `hsla(${Math.random() * 360},60%,55%,0.55)`;
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
      ctx.fillStyle = `hsl(${[140, 30, 220, 0, 270][i % 5]},75%,30%)`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(ch, 0, 0);
      ctx.restore();
    });
    for (let i = 0; i < 35; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 1.8, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${Math.random() * 360},60%,40%,0.5)`;
      ctx.fill();
    }
  }, [code]);
  return <canvas ref={ref} width={180} height={52} className="rounded-xl border-2 border-green-200 shadow-inner" />;
}

/* ── Schema ─────────────────────────────────────────── */
const schema = z.object({
  fullName: z.string().min(3, "Nom requis (min 3 caractères)"),
  country: z.string().min(1),
  phone: z.string().min(8, "Numéro invalide"),
  password: z.string().min(6, "Min 6 caractères"),
  confirmPassword: z.string().min(6, "Confirmation requise"),
  referralCode: z.string().optional(),
  terms: z.literal(true, { errorMap: () => ({ message: "Veuillez accepter les conditions" }) }),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof schema>;

/* ── WA SVG ─────────────────────────────────────────── */
const WA_SVG = (
  <svg viewBox="0 0 32 32" fill="white" className="w-7 h-7">
    <path d="M16.004 2C8.28 2 2 8.277 2 16a13.94 13.94 0 0 0 1.93 7.07L2 30l7.13-1.87A14.02 14.02 0 0 0 16.004 30C23.724 30 30 23.723 30 16S23.724 2 16.004 2zm0 25.6a11.64 11.64 0 0 1-5.93-1.62l-.42-.25-4.24 1.11 1.13-4.12-.27-.43A11.56 11.56 0 0 1 4.4 16c0-6.4 5.21-11.6 11.6-11.6 6.4 0 11.6 5.2 11.6 11.6S22.4 27.6 16.004 27.6zm6.36-8.68c-.35-.17-2.06-1.01-2.38-1.13-.32-.11-.55-.17-.78.17-.23.34-.9 1.13-1.1 1.36-.2.23-.4.26-.75.09-.35-.17-1.48-.54-2.81-1.73-1.04-.93-1.74-2.07-1.94-2.42-.2-.35-.02-.54.15-.71.15-.15.35-.4.52-.6.17-.2.23-.34.35-.57.11-.23.06-.43-.03-.6-.09-.17-.78-1.87-1.07-2.56-.28-.67-.57-.58-.78-.59h-.66c-.23 0-.6.09-.91.43-.32.34-1.2 1.17-1.2 2.86s1.23 3.32 1.4 3.55c.17.23 2.42 3.7 5.87 5.19.82.35 1.46.56 1.96.72.82.26 1.57.22 2.16.13.66-.1 2.06-.84 2.35-1.65.29-.81.29-1.5.2-1.65-.09-.14-.32-.23-.67-.4z" />
  </svg>
);

/* ══════════════════════════════════════════════════════ */
export default function Register() {
  const { login } = useAuth();
  const { toast } = useToast();
  const registerMutation = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [captchaCode, setCaptchaCode] = useState(genCode);
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);

  const refreshCaptcha = useCallback(() => {
    setCaptchaCode(genCode());
    setCaptchaInput("");
    setCaptchaError(false);
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", country: "TG", phone: "", password: "", confirmPassword: "", referralCode: "", terms: undefined as any },
  });

  const termsAccepted = form.watch("terms");

  async function onSubmit(values: FormValues) {
    if (captchaInput.toUpperCase() !== captchaCode) {
      setCaptchaError(true);
      refreshCaptcha();
      toast({ variant: "destructive", title: "Code de vérification incorrect", description: "Un nouveau code a été généré." });
      return;
    }
    try {
      const response = await registerMutation.mutateAsync({
        data: { fullName: values.fullName, phone: values.phone, country: values.country, password: values.password, referralCode: values.referralCode || null, email: null }
      });
      login(response.token, response.user);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur d'inscription", description: error.message || "Vérifiez vos informations." });
      refreshCaptcha();
    }
  }

  const errors = form.formState.errors;

  /* Field helper */
  const Field = ({ label, icon, children, error }: { label: string; icon?: React.ReactNode; children: React.ReactNode; error?: string }) => (
    <div>
      <label className="text-xs font-black text-gray-500 uppercase tracking-wide mb-1.5 block">{label}</label>
      <div className="flex items-center h-13 rounded-2xl border-2 border-gray-200 overflow-hidden focus-within:border-green-500 transition-colors bg-gray-50">
        {icon && <span className="ml-4 text-gray-400 shrink-0">{icon}</span>}
        {children}
      </div>
      {error && <p className="text-red-500 text-xs mt-1 pl-1">{error}</p>}
    </div>
  );

  return (
    <div className="min-h-[100dvh] w-full flex flex-col bg-white select-none">

      {/* ── BANNER IMAGE ── */}
      <div className="w-full relative flex-shrink-0" style={{ maxHeight: 220 }}>
        <img src={bannerImg} alt="BINAKA GAME" className="w-full object-cover object-top" style={{ maxHeight: 220 }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/20" />
      </div>

      {/* ── WHITE CARD ── */}
      <div className="flex-1 bg-white -mt-6 rounded-t-3xl shadow-xl z-10 flex flex-col px-5 pt-5 pb-10">

        {/* TABS */}
        <div className="flex rounded-2xl bg-gray-100 p-1 mb-5">
          <Link href="/login" className="flex-1 py-2.5 rounded-xl text-center text-sm font-bold text-gray-500">
            Se connecter
          </Link>
          <div className="flex-1 py-2.5 rounded-xl text-center text-sm font-black text-white" style={{ background: "linear-gradient(135deg,#16a34a,#22c55e)" }}>
            S'inscrire
          </div>
        </div>

        <div className="space-y-4">

          {/* Nom complet */}
          <Field label="Nom complet" icon={<User size={16} />} error={errors.fullName?.message}>
            <input type="text" placeholder="Votre nom et prénom"
              className="flex-1 h-full px-3 bg-transparent text-sm outline-none text-gray-800 placeholder:text-gray-400"
              {...form.register("fullName")} />
          </Field>

          {/* Pays + Téléphone */}
          <div>
            <label className="text-xs font-black text-gray-500 uppercase tracking-wide mb-1.5 block">Pays & Numéro de téléphone</label>
            <div className="flex items-center h-13 rounded-2xl border-2 border-gray-200 overflow-hidden focus-within:border-green-500 transition-colors bg-gray-50">
              <Phone size={16} className="ml-4 text-gray-400 shrink-0" />
              <div className="relative flex items-center border-r border-gray-200 h-full shrink-0">
                <select className="h-full pl-2 pr-7 bg-transparent text-xs font-bold text-gray-700 outline-none appearance-none cursor-pointer"
                  {...form.register("country")}
                  onChange={(e) => {
                    form.setValue("country", e.target.value);
                    setSelectedCountry(COUNTRIES.find((c) => c.code === e.target.value) || COUNTRIES[0]);
                  }}>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.flag} {c.dial}</option>
                  ))}
                </select>
                <ChevronDown size={11} className="absolute right-1 text-gray-400 pointer-events-none" />
              </div>
              <input type="tel" inputMode="numeric" placeholder="Numéro de téléphone"
                className="flex-1 h-full px-3 bg-transparent text-sm outline-none text-gray-800 placeholder:text-gray-400"
                {...form.register("phone")} />
            </div>
            {errors.phone && <p className="text-red-500 text-xs mt-1 pl-1">{errors.phone.message}</p>}
          </div>

          {/* Mot de passe */}
          <div>
            <label className="text-xs font-black text-gray-500 uppercase tracking-wide mb-1.5 block">Mot de passe</label>
            <div className="flex items-center h-13 rounded-2xl border-2 border-gray-200 overflow-hidden focus-within:border-green-500 transition-colors bg-gray-50">
              <Lock size={16} className="ml-4 text-gray-400 shrink-0" />
              <input type={showPassword ? "text" : "password"} placeholder="Min. 6 caractères"
                className="flex-1 h-full px-3 bg-transparent text-sm outline-none text-gray-800 placeholder:text-gray-400"
                {...form.register("password")} />
              <button type="button" className="px-4 text-gray-400" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1 pl-1">{errors.password.message}</p>}
          </div>

          {/* Confirmer mot de passe */}
          <div>
            <label className="text-xs font-black text-gray-500 uppercase tracking-wide mb-1.5 block">Confirmer le mot de passe</label>
            <div className="flex items-center h-13 rounded-2xl border-2 border-gray-200 overflow-hidden focus-within:border-green-500 transition-colors bg-gray-50">
              <Lock size={16} className="ml-4 text-gray-400 shrink-0" />
              <input type={showConfirm ? "text" : "password"} placeholder="Retapez le mot de passe"
                className="flex-1 h-full px-3 bg-transparent text-sm outline-none text-gray-800 placeholder:text-gray-400"
                {...form.register("confirmPassword")} />
              <button type="button" className="px-4 text-gray-400" onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 pl-1">{errors.confirmPassword.message}</p>}
          </div>

          {/* Code promo */}
          <Field label="Code promo (optionnel)" icon={<Gift size={16} />}>
            <input type="text" placeholder="Code de parrainage"
              className="flex-1 h-full px-3 bg-transparent text-sm outline-none text-gray-800 placeholder:text-gray-400"
              {...form.register("referralCode")} />
          </Field>

          {/* CAPTCHA */}
          <div>
            <label className="text-xs font-black text-gray-500 uppercase tracking-wide mb-1.5 block">
              Code de vérification — Confirmez que vous êtes humain
            </label>
            <div className="flex items-center gap-3 mb-2">
              <CaptchaCanvas code={captchaCode} />
              <motion.button type="button" whileTap={{ scale: 0.9 }} onClick={refreshCaptcha}
                className="w-10 h-10 rounded-xl border-2 border-green-200 flex items-center justify-center bg-green-50">
                <RefreshCw size={16} className="text-green-600" />
              </motion.button>
              <p className="text-xs text-gray-400 flex-1 leading-snug">Cliquez sur 🔄 pour un nouveau code</p>
            </div>
            <div className="flex items-center h-13 rounded-2xl border-2 overflow-hidden transition-colors bg-gray-50"
              style={{ borderColor: captchaError ? "#dc2626" : "#e5e7eb" }}>
              <input type="text" placeholder="Entrez le code affiché" maxLength={6}
                value={captchaInput}
                onChange={(e) => { setCaptchaInput(e.target.value.toUpperCase()); setCaptchaError(false); }}
                className="flex-1 h-full px-4 bg-transparent text-sm font-bold outline-none text-gray-800 tracking-widest placeholder:text-gray-400 placeholder:tracking-normal placeholder:font-normal"
              />
            </div>
            {captchaError && <p className="text-red-500 text-xs mt-1 pl-1">Code incorrect — un nouveau code a été généré</p>}
          </div>

          {/* CGU */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" className="mt-0.5 w-4 h-4 accent-green-600 shrink-0" {...form.register("terms")} />
            <span className="text-xs text-gray-500 leading-snug">
              J'ai lu et j'accepte les{" "}
              <span className="text-green-600 font-bold underline">conditions d'utilisation</span>{" "}
              de BINAKA GAME. Je certifie avoir plus de 18 ans.
            </span>
          </label>
          {errors.terms && <p className="text-red-500 text-xs -mt-1 pl-1">{errors.terms.message}</p>}

          {/* S'INSCRIRE */}
          <motion.button type="button" whileTap={{ scale: 0.97 }}
            onClick={form.handleSubmit(onSubmit)}
            disabled={registerMutation.isPending || !termsAccepted}
            className="w-full h-14 rounded-2xl text-white font-black text-base tracking-wide shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: termsAccepted ? "linear-gradient(135deg,#16a34a,#22c55e)" : "#9ca3af" }}>
            {registerMutation.isPending && <Loader2 className="animate-spin" size={18} />}
            CRÉER MON COMPTE
          </motion.button>

          <Link href="/login">
            <motion.div whileTap={{ scale: 0.97 }}
              className="w-full h-12 rounded-2xl flex items-center justify-center font-black text-sm border-2 border-amber-400 text-amber-600 bg-amber-50">
              Déjà un compte ? Se connecter
            </motion.div>
          </Link>

          <p className="text-center text-[11px] text-gray-400 pt-1">🔒 Inscription sécurisée · BINAKA GAME v1.0.0</p>
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
