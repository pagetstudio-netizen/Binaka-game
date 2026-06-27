import { Link, useLocation, Redirect } from "wouter";
import { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";

import iconHome from "@assets/20260624_150018_1782317841294.png";
import iconGames from "@assets/20260624_150106_1782317841320.png";
import iconWallet from "@assets/20260624_150241_1782317841340.png";
import iconGift from "@assets/20260624_150402_1782317841358.png";
import iconAccount from "@assets/20260624_150441_1782317841381.png";

const WHATSAPP_NUMBER = "22890000000";

const NAV_ITEMS = [
  { href: "/", icon: iconHome, label: "Accueil", matchFn: (loc: string) => loc === "/" },
  { href: "/games", icon: iconGames, label: "Jeux", matchFn: (loc: string) => loc.startsWith("/games") },
  { href: "/wallet", icon: iconWallet, label: "Portefeuille", matchFn: (loc: string) => loc === "/wallet" },
  { href: "/promotions", icon: iconGift, label: "Promotions", matchFn: (loc: string) => loc === "/promotions" },
  { href: "/account", icon: iconAccount, label: "Compte", matchFn: (loc: string) => loc.startsWith("/account") },
];

/* ── WhatsApp SVG ─────────────────────────────────────────────── */
const WA_SVG = (
  <svg viewBox="0 0 32 32" fill="white" className="w-6 h-6">
    <path d="M16.004 2C8.28 2 2 8.277 2 16a13.94 13.94 0 0 0 1.93 7.07L2 30l7.13-1.87A14.02 14.02 0 0 0 16.004 30C23.724 30 30 23.723 30 16S23.724 2 16.004 2zm0 25.6a11.64 11.64 0 0 1-5.93-1.62l-.42-.25-4.24 1.11 1.13-4.12-.27-.43A11.56 11.56 0 0 1 4.4 16c0-6.4 5.21-11.6 11.6-11.6 6.4 0 11.6 5.2 11.6 11.6S22.4 27.6 16.004 27.6zm6.36-8.68c-.35-.17-2.06-1.01-2.38-1.13-.32-.11-.55-.17-.78.17-.23.34-.9 1.13-1.1 1.36-.2.23-.4.26-.75.09-.35-.17-1.48-.54-2.81-1.73-1.04-.93-1.74-2.07-1.94-2.42-.2-.35-.02-.54.15-.71.15-.15.35-.4.52-.6.17-.2.23-.34.35-.57.11-.23.06-.43-.03-.6-.09-.17-.78-1.87-1.07-2.56-.28-.67-.57-.58-.78-.59h-.66c-.23 0-.6.09-.91.43-.32.34-1.2 1.17-1.2 2.86s1.23 3.32 1.4 3.55c.17.23 2.42 3.7 5.87 5.19.82.35 1.46.56 1.96.72.82.26 1.57.22 2.16.13.66-.1 2.06-.84 2.35-1.65.29-.81.29-1.5.2-1.65-.09-.14-.32-.23-.67-.4z" />
  </svg>
);

/* ── Gamepad SVG ──────────────────────────────────────────────── */
const GAMEPAD_SVG = (
  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <line x1="6" y1="12" x2="10" y2="12" />
    <line x1="8" y1="10" x2="8" y2="14" />
    <circle cx="15" cy="11" r="1" fill="white" stroke="none" />
    <circle cx="17" cy="13" r="1" fill="white" stroke="none" />
    <path d="M6 5h12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
    <path d="M8 19l1-4h6l1 4" />
    <line x1="6" y1="19" x2="18" y2="19" />
  </svg>
);

/* ── Floating Buttons ─────────────────────────────────────────── */
function FloatingButtons() {
  const [location] = useLocation();
  const onGame = location.startsWith("/games");

  return (
    <div
      className="fixed right-4 z-40 flex flex-col items-end gap-3"
      style={{ bottom: "88px" }}
    >
      {/* ── Games FAB ── */}
      <motion.div
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 340, damping: 26, delay: 0.1 }}
        className="relative flex items-center gap-2"
      >
        {/* Label tooltip */}
        <AnimatePresence>
          {!onGame && (
            <motion.span
              key="game-label"
              initial={{ opacity: 0, x: 8, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 8, scale: 0.9 }}
              transition={{ delay: 0.6 }}
              className="text-xs font-extrabold text-white px-2.5 py-1 rounded-full pointer-events-none select-none"
              style={{
                background: "linear-gradient(135deg,#f59e0b,#d97706)",
                boxShadow: "0 3px 12px rgba(245,158,11,0.5)",
                whiteSpace: "nowrap",
              }}
            >
              Jouer 🎮
            </motion.span>
          )}
        </AnimatePresence>

        {/* Float oscillation wrapper */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut" }}
        >
          <Link href="/games">
            <motion.button
              whileTap={{ scale: 0.88 }}
              whileHover={{ scale: 1.1 }}
              className="relative w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden"
              style={{
                background: "linear-gradient(135deg,#f59e0b,#d97706)",
                boxShadow: "0 6px 0 #92400e, 0 10px 28px rgba(245,158,11,0.55)",
              }}
            >
              {/* Shimmer sweep */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear", repeatDelay: 1 }}
                style={{ width: "60%" }}
              />
              {GAMEPAD_SVG}
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>

      {/* ── WhatsApp FAB ── */}
      <motion.div
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 24, delay: 0.22 }}
        className="relative flex items-center gap-2"
      >
        {/* Label tooltip */}
        <motion.span
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.75 }}
          className="text-xs font-extrabold text-white px-2.5 py-1 rounded-full pointer-events-none select-none"
          style={{
            background: "linear-gradient(135deg,#25D366,#128C7E)",
            boxShadow: "0 3px 12px rgba(37,211,102,0.5)",
            whiteSpace: "nowrap",
          }}
        >
          Support 💬
        </motion.span>

        <div className="relative">
          {/* Pulse ring 1 */}
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{ background: "#25D366" }}
            animate={{ scale: [1, 1.55], opacity: [0.55, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut" }}
          />
          {/* Pulse ring 2 (offset) */}
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{ background: "#25D366" }}
            animate={{ scale: [1, 1.35], opacity: [0.35, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut", delay: 0.5 }}
          />

          <motion.a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.1 }}
            className="relative w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg,#25D366,#128C7E)",
              boxShadow: "0 6px 0 #075E54, 0 10px 28px rgba(37,211,102,0.55)",
            }}
          >
            {WA_SVG}
          </motion.a>
        </div>
      </motion.div>
    </div>
  );
}

/* ── AppLayout ────────────────────────────────────────────────── */
export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, isLoading } = useAuth();

  // Pages de jeu individuelles (ex: /games/slots) — pas la liste /games
  const isGamePage = /^\/games\/.+/.test(location);

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

      {/* Floating Action Buttons — masqués sur les pages de jeu individuelles */}
      {user && !isGamePage && <FloatingButtons />}

      {/* Bottom Navigation — masquée sur les pages de jeu individuelles */}
      {!isGamePage && (
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
      )}
    </div>
  );
}
