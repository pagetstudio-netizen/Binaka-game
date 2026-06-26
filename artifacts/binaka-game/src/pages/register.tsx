import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, Lock, Phone, Mail, ChevronDown } from "lucide-react";

const WHATSAPP_NUMBER = "22890000000";

const WA_SVG = (
  <svg viewBox="0 0 32 32" fill="white" className="w-7 h-7">
    <path d="M16.004 2C8.28 2 2 8.277 2 16a13.94 13.94 0 0 0 1.93 7.07L2 30l7.13-1.87A14.02 14.02 0 0 0 16.004 30C23.724 30 30 23.723 30 16S23.724 2 16.004 2zm0 25.6a11.64 11.64 0 0 1-5.93-1.62l-.42-.25-4.24 1.11 1.13-4.12-.27-.43A11.56 11.56 0 0 1 4.4 16c0-6.4 5.21-11.6 11.6-11.6 6.4 0 11.6 5.2 11.6 11.6S22.4 27.6 16.004 27.6zm6.36-8.68c-.35-.17-2.06-1.01-2.38-1.13-.32-.11-.55-.17-.78.17-.23.34-.9 1.13-1.1 1.36-.2.23-.4.26-.75.09-.35-.17-1.48-.54-2.81-1.73-1.04-.93-1.74-2.07-1.94-2.42-.2-.35-.02-.54.15-.71.15-.15.35-.4.52-.6.17-.2.23-.34.35-.57.11-.23.06-.43-.03-.6-.09-.17-.78-1.87-1.07-2.56-.28-.67-.57-.58-.78-.59h-.66c-.23 0-.6.09-.91.43-.32.34-1.2 1.17-1.2 2.86s1.23 3.32 1.4 3.55c.17.23 2.42 3.7 5.87 5.19.82.35 1.46.56 1.96.72.82.26 1.57.22 2.16.13.66-.1 2.06-.84 2.35-1.65.29-.81.29-1.5.2-1.65-.09-.14-.32-.23-.67-.4z" />
  </svg>
);

const COUNTRIES = [
  { code: "TG", dial: "+228", label: "🇹🇬 +228" },
  { code: "BJ", dial: "+229", label: "🇧🇯 +229" },
  { code: "CI", dial: "+225", label: "🇨🇮 +225" },
  { code: "SN", dial: "+221", label: "🇸🇳 +221" },
  { code: "ML", dial: "+223", label: "🇲🇱 +223" },
  { code: "BF", dial: "+226", label: "🇧🇫 +226" },
  { code: "GH", dial: "+233", label: "🇬🇭 +233" },
  { code: "CM", dial: "+237", label: "🇨🇲 +237" },
];

const formSchema = z.object({
  fullName: z.string().min(3, { message: "Nom requis (min 3 car.)" }),
  country: z.string().min(1),
  phone: z.string().min(8, { message: "Numéro invalide" }),
  password: z.string().min(6, { message: "Min 6 caractères" }),
  confirmPassword: z.string().min(6, { message: "Confirmation requise" }),
  referralCode: z.string().optional(),
  terms: z.literal(true, { errorMap: () => ({ message: "Acceptez les conditions" }) }),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const registerMutation = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      country: "TG",
      phone: "",
      password: "",
      confirmPassword: "",
      referralCode: "",
      terms: undefined as any,
    },
  });

  const termsAccepted = form.watch("terms");

  async function onSubmit(values: FormValues) {
    try {
      const payload = {
        fullName: values.fullName,
        phone: values.phone,
        country: values.country,
        password: values.password,
        referralCode: values.referralCode || null,
        email: null,
      };
      const response = await registerMutation.mutateAsync({ data: payload });
      login(response.token, response.user);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur d'inscription",
        description: error.message || "Veuillez vérifier vos informations.",
      });
    }
  }

  const errors = form.formState.errors;

  return (
    <div
      className="h-[100dvh] w-full overflow-hidden flex flex-col items-center justify-center relative select-none"
      style={{ background: "linear-gradient(160deg, #f59e0b 0%, #fbbf24 50%, #f59e0b 100%)" }}
    >
      {/* Logo */}
      <div className="mb-4 text-center">
        <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-md">
          BINAKA <span className="text-green-800">GAME</span>
        </h1>
        <p className="text-white/80 text-xs mt-1 font-medium">Créez votre compte gratuitement</p>
      </div>

      {/* Carte */}
      <div className="w-full max-w-sm mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* Onglets */}
        <div className="flex border-b border-gray-100">
          <Link
            href="/login"
            className="flex-1 py-3.5 text-center text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors"
          >
            Se connecter
          </Link>
          <Link
            href="/register"
            className="flex-1 py-3.5 text-center text-sm font-bold text-green-600 border-b-2 border-green-500 bg-white"
          >
            S'inscrire
          </Link>
        </div>

        <div className="px-6 pt-4 pb-4 space-y-3">

          {/* Nom complet */}
          <div className="flex items-center bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden focus-within:border-green-400 transition-colors h-11">
            <input
              type="text"
              placeholder="Nom complet"
              className="flex-1 h-full px-4 bg-transparent text-sm outline-none text-gray-800 placeholder:text-gray-400"
              {...form.register("fullName")}
            />
          </div>
          {errors.fullName && <p className="text-red-500 text-xs -mt-1 pl-1">{errors.fullName.message}</p>}

          {/* Téléphone avec sélecteur pays */}
          <div className="flex items-center bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden focus-within:border-green-400 transition-colors h-11">
            <Phone size={14} className="ml-3 text-gray-400 shrink-0" />
            <div className="relative flex items-center border-r border-gray-200 h-full">
              <select
                className="h-full pl-2 pr-5 bg-transparent text-xs font-bold text-gray-600 outline-none appearance-none cursor-pointer"
                {...form.register("country")}
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
              <ChevronDown size={11} className="absolute right-1 text-gray-400 pointer-events-none" />
            </div>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="Numéro de téléphone"
              className="flex-1 h-full px-3 bg-transparent text-sm outline-none text-gray-800 placeholder:text-gray-400"
              {...form.register("phone")}
            />
          </div>
          {errors.phone && <p className="text-red-500 text-xs -mt-1 pl-1">{errors.phone.message}</p>}

          {/* Mot de passe */}
          <div>
            <div className="flex items-center bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden focus-within:border-green-400 transition-colors h-11">
              <Lock size={14} className="ml-3 text-gray-400 shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                className="flex-1 h-full px-3 bg-transparent text-sm outline-none text-gray-800 placeholder:text-gray-400"
                {...form.register("password")}
              />
              <button type="button" className="px-3 text-gray-400" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-0.5 pl-1">{errors.password.message}</p>}
          </div>

          {/* Confirmer mot de passe */}
          <div>
            <div className="flex items-center bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden focus-within:border-green-400 transition-colors h-11">
              <Lock size={14} className="ml-3 text-gray-400 shrink-0" />
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirmer le mot de passe"
                className="flex-1 h-full px-3 bg-transparent text-sm outline-none text-gray-800 placeholder:text-gray-400"
                {...form.register("confirmPassword")}
              />
              <button type="button" className="px-3 text-gray-400" onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-0.5 pl-1">{errors.confirmPassword.message}</p>}
          </div>

          {/* Code promo */}
          <div className="flex items-center bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden focus-within:border-green-400 transition-colors h-11">
            <Mail size={14} className="ml-3 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Code promo (optionnel)"
              className="flex-1 h-full px-3 bg-transparent text-sm outline-none text-gray-800 placeholder:text-gray-400"
              {...form.register("referralCode")}
            />
          </div>

          {/* Conditions */}
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 w-4 h-4 accent-green-600 shrink-0"
              {...form.register("terms")}
            />
            <span className="text-xs text-gray-500 leading-snug">
              J'ai lu et j'accepte les{" "}
              <span className="text-green-600 underline">conditions d'utilisation</span>{" "}
              de BINAKA GAME
            </span>
          </label>
          {errors.terms && <p className="text-red-500 text-xs -mt-1 pl-1">{errors.terms.message}</p>}

          {/* Bouton inscription */}
          <button
            type="button"
            onClick={form.handleSubmit(onSubmit)}
            disabled={registerMutation.isPending || !termsAccepted}
            className="w-full h-12 rounded-2xl text-white font-extrabold text-base tracking-wide shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: termsAccepted ? "#16a34a" : "#9ca3af" }}
          >
            {registerMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            S'INSCRIRE
          </button>
        </div>

        <p className="text-center text-[11px] text-gray-400 pb-3">numéro de version : 1.0.0</p>
      </div>

      {/* Bouton flottant WhatsApp */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-6 right-5 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-transform"
        style={{ background: "#25D366" }}
        aria-label="Service client WhatsApp"
      >
        {WA_SVG}
      </a>
    </div>
  );
}
