import { Link, useLocation, Redirect } from "wouter";
import { Home, Gamepad2, Wallet, Gift, User as UserIcon } from "lucide-react";
import { ReactNode } from "react";
import { useAuth } from "@/lib/auth";

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-[100dvh] flex items-center justify-center bg-background"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  // Redirect to login if not authenticated
  if (!user && location !== "/login" && location !== "/register") {
    return <Redirect to="/login" />;
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-slate-50 pb-16">
      <main className="flex-1 w-full max-w-md mx-auto relative bg-background shadow-xl overflow-hidden flex flex-col">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          <NavItem href="/" icon={<Home size={24} />} label="Accueil" isActive={location === "/"} />
          <NavItem href="/games" icon={<Gamepad2 size={24} />} label="Jeux" isActive={location.startsWith("/games")} />
          <NavItem href="/wallet" icon={<Wallet size={24} />} label="Portefeuille" isActive={location === "/wallet"} />
          <NavItem href="/promotions" icon={<Gift size={24} />} label="Promotions" isActive={location === "/promotions"} />
          <NavItem href="/account" icon={<UserIcon size={24} />} label="Compte" isActive={location === "/account"} />
        </div>
      </nav>
    </div>
  );
}

function NavItem({ href, icon, label, isActive }: { href: string; icon: ReactNode; label: string; isActive: boolean }) {
  return (
    <Link href={href} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
      <div className={`${isActive ? "scale-110 transition-transform" : ""}`}>
        {icon}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
