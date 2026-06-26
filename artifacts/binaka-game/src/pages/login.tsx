import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";

// ⚠️ Remplacez ce numéro par celui du service client WhatsApp
const WHATSAPP_NUMBER = "22890000000";

const formSchema = z.object({
  phone: z.string().min(8, { message: "Numéro invalide" }),
  password: z.string().min(6, { message: "Mot de passe trop court" }),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { phone: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await loginMutation.mutateAsync({ data: values });
      login(response.token, response.user);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: error.message || "Identifiants incorrects.",
      });
    }
  }

  const errors = form.formState.errors;

  return (
    <div className="h-[100dvh] w-full overflow-hidden flex flex-col bg-[#f0f4f8] relative select-none">

      {/* Header vert */}
      <div className="bg-[#16a34a] pt-10 pb-8 px-6 flex flex-col items-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          BINAKA <span className="text-amber-300">GAME</span>
        </h1>
        <p className="text-white/70 text-sm mt-1">Connectez-vous pour jouer et gagner</p>
      </div>

      {/* Carte formulaire */}
      <div className="flex-1 flex flex-col justify-center px-5 -mt-5">
        <div className="bg-white rounded-3xl shadow-xl px-5 py-7 space-y-4">

          {/* Téléphone */}
          <div className="relative">
            <div className="flex items-center bg-[#f0f4f8] rounded-xl overflow-hidden border border-transparent focus-within:border-[#16a34a] transition-colors">
              <span className="px-3 text-sm font-bold text-slate-500 border-r border-slate-200 h-12 flex items-center">+</span>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="Numéro de téléphone"
                className="flex-1 h-12 px-3 bg-transparent text-sm outline-none text-slate-700 placeholder:text-slate-400"
                {...form.register("phone")}
              />
            </div>
            {errors.phone && <p className="text-red-500 text-xs mt-1 px-1">{errors.phone.message}</p>}
          </div>

          {/* Mot de passe */}
          <div className="relative">
            <div className="flex items-center bg-[#f0f4f8] rounded-xl overflow-hidden border border-transparent focus-within:border-[#16a34a] transition-colors">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                className="flex-1 h-12 px-4 bg-transparent text-sm outline-none text-slate-700 placeholder:text-slate-400"
                {...form.register("password")}
              />
              <button
                type="button"
                className="px-3 text-slate-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1 px-1">{errors.password.message}</p>}
          </div>

          {/* Bouton connexion */}
          <button
            type="button"
            onClick={form.handleSubmit(onSubmit)}
            disabled={loginMutation.isPending}
            className="w-full h-13 py-3.5 rounded-2xl bg-[#16a34a] text-white font-extrabold text-base tracking-wide shadow-md active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loginMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            SE CONNECTER
          </button>

          {/* Lien inscription */}
          <Link
            href="/register"
            className="block w-full py-3.5 rounded-2xl bg-amber-400 text-white font-extrabold text-base tracking-wide shadow-md active:scale-[0.98] transition-all text-center"
          >
            Pas encore de compte ? S'inscrire
          </Link>
        </div>
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
        <svg viewBox="0 0 32 32" fill="white" className="w-8 h-8">
          <path d="M16.004 2C8.28 2 2 8.277 2 16a13.94 13.94 0 0 0 1.93 7.07L2 30l7.13-1.87A14.02 14.02 0 0 0 16.004 30C23.724 30 30 23.723 30 16S23.724 2 16.004 2zm0 25.6a11.64 11.64 0 0 1-5.93-1.62l-.42-.25-4.24 1.11 1.13-4.12-.27-.43A11.56 11.56 0 0 1 4.4 16c0-6.4 5.21-11.6 11.6-11.6 6.4 0 11.6 5.2 11.6 11.6S22.4 27.6 16.004 27.6zm6.36-8.68c-.35-.17-2.06-1.01-2.38-1.13-.32-.11-.55-.17-.78.17-.23.34-.9 1.13-1.1 1.36-.2.23-.4.26-.75.09-.35-.17-1.48-.54-2.81-1.73-1.04-.93-1.74-2.07-1.94-2.42-.2-.35-.02-.54.15-.71.15-.15.35-.4.52-.6.17-.2.23-.34.35-.57.11-.23.06-.43-.03-.6-.09-.17-.78-1.87-1.07-2.56-.28-.67-.57-.58-.78-.59h-.66c-.23 0-.6.09-.91.43-.32.34-1.2 1.17-1.2 2.86s1.23 3.32 1.4 3.55c.17.23 2.42 3.7 5.87 5.19.82.35 1.46.56 1.96.72.82.26 1.57.22 2.16.13.66-.1 2.06-.84 2.35-1.65.29-.81.29-1.5.2-1.65-.09-.14-.32-.23-.67-.4z" />
        </svg>
      </a>
    </div>
  );
}
