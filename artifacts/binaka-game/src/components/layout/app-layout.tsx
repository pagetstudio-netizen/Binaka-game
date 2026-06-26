import { Link, useLocation, Redirect } from "wouter";
import { ReactNode } from "react";
import { useAuth } from "@/lib/auth";

import iconHome from "@assets/20260624_150018_1782317841294.png";
import iconGames from "@assets/20260624_150106_1782317841320.png";
import iconWallet from "@assets/20260624_150241_1782317841340.png";
import iconGift from "@assets/20260624_150402_1782317841358.png";
import iconAccount from "@assets/20260624_150441_1782317841381.png";

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user && location !== "/login" && location !== "/register") {
    return <Redirect to="/login" />;
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-slate-50 pb-16">
      <main className="flex-1 w-full max-w-md mx-auto relative bg-background shadow-xl overflow-hidden flex flex-col">
        {children}
      </main>

      {(
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
          <div className="flex justify-around items-center h-16 max-w-md mx-auto">
            <NavItem href="/" icon={iconHome}    label="Accueil"      isActive={location === "/"} />
            <NavItem href="/games" icon={iconGames}  label="Jeux"         isActive={location.startsWith("/games")} />
            <NavItem href="/wallet" icon={iconWallet} label="Portefeuille" isActive={location === "/wallet"} />
            <NavItem href="/promotions" icon={iconGift}   label="Promotions"  isActive={location === "/promotions"} />
            <NavItem href="/account" icon={iconAccount} label="Compte"       isActive={location === "/account"} />
          </div>
        </nav>
      )}
    </div>
  );
}

function NavItem({
  href,
  icon,
  label,
  isActive,
}: {
  href: string;
  icon: string;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center w-full h-full space-y-0.5"
    >
      <div
        className={`transition-transform duration-150 ${isActive ? "scale-110" : "scale-100"}`}
      >
        <img
          src={icon}
          alt={label}
          className="w-7 h-7 object-contain"
          style={{
            filter: isActive
              ? "invert(1) sepia(1) saturate(6) hue-rotate(90deg) brightness(0.8)"
              : "invert(1) brightness(0.45)",
          }}
        />
      </div>
      <span
        className={`text-[10px] font-semibold transition-colors ${
          isActive ? "text-primary" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}
