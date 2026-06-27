import { Link, useLocation, Redirect } from "wouter";
import { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";

import iconHome from "@assets/20260624_150018_1782317841294.png";
import iconGames from "@assets/20260624_150106_1782317841320.png";
import iconWallet from "@assets/20260624_150241_1782317841340.png";
import iconGift from "@assets/20260624_150402_1782317841358.png";
import iconAccount from "@assets/20260624_150441_1782317841381.png";

const NAV_ITEMS = [
  { href: "/", icon: iconHome, label: "Accueil", matchFn: (loc: string) => loc === "/" },
  { href: "/games", icon: iconGames, label: "Jeux", matchFn: (loc: string) => loc.startsWith("/games") },
  { href: "/wallet", icon: iconWallet, label: "Portefeuille", matchFn: (loc: string) => loc === "/wallet" },
  { href: "/promotions", icon: iconGift, label: "Promotions", matchFn: (loc: string) => loc === "/promotions" },
  { href: "/account", icon: iconAccount, label: "Compte", matchFn: (loc: string) => loc.startsWith("/account") },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-bold text-gray-500">Chargement…</span>
        </div>
      </div>
    );
  }

  if (!user && location !== "/login" && location !== "/register") {
    return <Redirect to="/login" />;
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-gray-100">
      <main className="flex-1 w-full max-w-[430px] mx-auto relative bg-gray-50 shadow-2xl overflow-hidden flex flex-col">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-white"
        style={{ boxShadow: "0 -2px 20px rgba(0,0,0,0.10)", borderTop: "1px solid #f0f0f0" }}
      >
        <div className="flex justify-around items-center h-16 max-w-[430px] mx-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = item.matchFn(location);
            return (
              <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center flex-1 h-full relative">
                <motion.div
                  animate={isActive ? { y: -2, scale: 1.1 } : { y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="flex flex-col items-center gap-0.5"
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-green-600 rounded-full"
                    />
                  )}
                  <img
                    src={item.icon}
                    alt={item.label}
                    className="w-6 h-6 object-contain"
                    style={{
                      filter: isActive
                        ? "invert(27%) sepia(90%) saturate(600%) hue-rotate(100deg) brightness(0.9)"
                        : "invert(1) brightness(0.4)",
                    }}
                  />
                  <span
                    className="text-[10px] font-bold transition-colors"
                    style={{ color: isActive ? "#16a34a" : "#9ca3af" }}
                  >
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
