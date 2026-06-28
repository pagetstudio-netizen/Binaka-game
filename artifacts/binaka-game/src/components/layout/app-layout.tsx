import { Link, useLocation, Redirect } from "wouter";
import { ReactNode, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ArrowLeft } from "lucide-react";
import {
  useGetBalance, getGetBalanceQueryKey,
  useGetNotifications, getGetNotificationsQueryKey,
} from "@workspace/api-client-react";
import { CategoryProvider, useCategoryCtx, type CategoryId } from "@/lib/category-context";

import headerBanner from "@assets/20260627_094959_1782553814769.png";
import iconHome    from "@assets/téléchargement_(77)_1782610083217.png";
import iconGames   from "@assets/invite.7d84082f_1782610083246.png";
import iconWallet  from "@assets/deposit.6eed4230_1782610083190.png";
import iconGift    from "@assets/promo.d2428588_1782610083163.png";
import iconAccount from "@assets/member.b78f1baa_(1)_1782610083125.png";

const WHATSAPP_NUMBER = "22890000000";

const NAV_ITEMS = [
  { href: "/", icon: iconHome, label: "Accueil", matchFn: (loc: string) => loc === "/" },
  { href: "/games", icon: iconGames, label: "Jeux", matchFn: (loc: string) => loc.startsWith("/games") },
  { href: "/deposit", icon: iconWallet, label: "Dépôt", matchFn: (loc: string) => loc === "/deposit" },
  { href: "/promotions", icon: iconGift, label: "Promotions", matchFn: (loc: string) => loc === "/promotions" },
  { href: "/account", icon: iconAccount, label: "Compte", matchFn: (loc: string) => loc.startsWith("/account") },
];

const SUB_PAGES: Record<string, { title: string; back: string }> = {
  "/account/profile":   { title: "Informations Personnelles", back: "/account" },
  "/account/security":  { title: "Sécurité", back: "/account" },
  "/account/settings":  { title: "Paramètres", back: "/account" },
  "/notifications":     { title: "Notifications", back: "/" },
  "/support":           { title: "Service Client", back: "/" },
  "/vip":               { title: "Programme VIP", back: "/" },
  "/referral":          { title: "Parrainage", back: "/" },
  "/deposit":           { title: "Recharger", back: "/wallet" },
  "/withdraw":          { title: "Retrait", back: "/wallet" },
};

const CATEGORY_BAR_PAGES = ["/", "/games"];

const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "tous",       label: "⭐ Tous"       },
  { id: "jackpot",    label: "🎰 Jackpot"    },
  { id: "roue",       label: "🎡 Roue"       },
  { id: "grattage",   label: "🎟 Grattage"   },
  { id: "minijeux",   label: "🎲 Mini-jeux"  },
  { id: "nouveautes", label: "🏆 Nouveautés" },
  { id: "populaires", label: "🔥 Populaires" },
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

/* ── Category Bar ─────────────────────────────────────────────── */
function CategoryBar() {
  const { activeCategory, setActiveCategory } = useCategoryCtx();
  const [location, setLocation] = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleClick = (id: CategoryId) => {
    setActiveCategory(id);
    if (!CATEGORY_BAR_PAGES.includes(location)) {
      setLocation("/games");
    }
  };

  return (
    <div
      className="sticky z-[9990] w-full flex-shrink-0"
      style={{ top: 70, background: "#0A5C3A" }}
    >
      <div
        ref={scrollRef}
        className="category-bar-scroll flex items-center gap-2 px-3 py-2.5 overflow-x-auto"
        style={{ scrollbarWidth: "none" }}
      >
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <motion.button
              key={cat.id}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleClick(cat.id)}
              className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-black whitespace-nowrap transition-all duration-200"
              animate={{
                background: isActive ? "#F4C430" : "rgba(255,255,255,0.13)",
                color: isActive ? "#1a3a1a" : "rgba(255,255,255,0.88)",
                boxShadow: isActive ? "0 2px 8px rgba(244,196,48,0.45)" : "none",
              }}
              transition={{ duration: 0.18 }}
            >
              {cat.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Global App Header ────────────────────────────────────────── */
export function AppHeader() {
  const [location, setLocation] = useLocation();
  const { data: wallet } = useGetBalance({ query: { queryKey: getGetBalanceQueryKey() } });
  const { data: notifs } = useGetNotifications(
    { limit: 50 },
    { query: { queryKey: getGetNotificationsQueryKey({ limit: 50 }) } },
  );

  const subPage = SUB_PAGES[location];
  const unread = notifs?.unreadCount ?? 0;

  return (
    <header
      className="sticky top-0 left-0 w-full z-[9999] flex items-center px-4 flex-shrink-0"
      style={{
        height: 70,
        background: "#FFFFFF",
        borderBottom: "2px solid #0A5C3A",
        boxShadow: "0 2px 16px rgba(10,92,58,0.12)",
      }}
    >
      {/* Left — brand logo OR back button */}
      {subPage ? (
        <button
          onClick={() => setLocation(subPage.back)}
          className="p-2 -ml-1 rounded-full active:scale-95 transition-all flex-shrink-0"
          style={{ background: "#EAF8F2" }}
        >
          <ArrowLeft className="w-5 h-5" style={{ color: "#0F8A5F" }} />
        </button>
      ) : location === "/" ? (
        <img
          src={headerBanner}
          alt="Binaka Game"
          className="h-11 w-auto object-contain select-none pointer-events-none"
          draggable={false}
        />
      ) : (
        <span className="font-black text-lg tracking-wide" style={{ color: "#0F8A5F" }}>BINAKA</span>
      )}

      {/* Center — page title for sub-pages */}
      {subPage ? (
        <h1 className="flex-1 text-center text-base font-bold px-2 truncate" style={{ color: "#0A5C3A" }}>
          {subPage.title}
        </h1>
      ) : (
        <div className="flex-1" />
      )}

      {/* Right — balance + notifications bell */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {wallet !== undefined && (
          <div className="px-3 py-1 rounded-full border" style={{ background: "#EAF8F2", borderColor: "#0F8A5F40" }}>
            <span className="text-xs font-black whitespace-nowrap" style={{ color: "#0F8A5F" }}>
              {(wallet.balance ?? 0).toLocaleString()} FCFA
            </span>
          </div>
        )}
        <Link href="/notifications">
          <button className="relative p-2 rounded-full transition-colors active:scale-95" style={{ background: "#EAF8F2" }}>
            <Bell className="w-5 h-5" style={{ color: "#0F8A5F" }} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center leading-none">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>
        </Link>
      </div>
    </header>
  );
}

/* ── Floating Buttons ─────────────────────────────────────────── */
function FloatingButtons() {
  const [location] = useLocation();
  const onGame = location.startsWith("/games/");

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
                background: "linear-gradient(135deg,#F4C430,#D4A017)",
                boxShadow: "0 3px 12px rgba(244,196,48,0.5)",
                whiteSpace: "nowrap",
              }}
            >
              Jouer 🎮
            </motion.span>
          )}
        </AnimatePresence>

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
                background: "linear-gradient(135deg,#F4C430,#D4A017)",
                boxShadow: "0 6px 0 #92400e, 0 10px 28px rgba(244,196,48,0.55)",
              }}
            >
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
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{ background: "#25D366" }}
            animate={{ scale: [1, 1.55], opacity: [0.55, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut" }}
          />
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

/* ── AppLayout (inner, needs context) ────────────────────────── */
function AppLayoutInner({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, isLoading } = useAuth();

  const isGamePage = /^\/games\/.+/.test(location);
  const showCategoryBar = CATEGORY_BAR_PAGES.includes(location) && !isGamePage;

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center" style={{ background: "#EAF8F2" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#0F8A5F", borderTopColor: "transparent" }} />
          <span className="text-sm font-bold" style={{ color: "#0F8A5F" }}>Chargement…</span>
        </div>
      </div>
    );
  }

  if (!user && location !== "/login" && location !== "/register") {
    return <Redirect to="/login" />;
  }

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: "#C8EDD8" }}>
      <main
        className="flex-1 w-full max-w-[430px] mx-auto relative shadow-2xl overflow-x-hidden flex flex-col"
        style={{ background: "#EAF8F2" }}
      >
        {/* Global header — hidden on individual game pages */}
        {!isGamePage && <AppHeader />}

        {/* Category bar — only on home and games list */}
        {showCategoryBar && <CategoryBar />}

        {children}
      </main>

      {!isGamePage && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-50"
          style={{
            background: "#FFFFFF",
            boxShadow: "0 -2px 20px rgba(10,92,58,0.12)",
            borderTop: "2px solid #0A5C3A",
          }}
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
                        className="absolute -top-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full"
                        style={{ background: "#F4C430" }}
                      />
                    )}
                    <img
                      src={item.icon}
                      alt={item.label}
                      className="w-7 h-7 object-contain transition-all duration-200"
                      style={{
                        opacity: isActive ? 1 : 0.5,
                        transform: isActive ? "scale(1.15)" : "scale(1)",
                      }}
                    />
                    <span
                      className="text-[10px] font-bold transition-colors"
                      style={{ color: isActive ? "#0F8A5F" : "#9ca3af" }}
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

      {!isGamePage && <FloatingButtons />}
    </div>
  );
}

/* ── AppLayout (public, wraps with CategoryProvider) ─────────── */
export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <CategoryProvider>
      <AppLayoutInner>{children}</AppLayoutInner>
    </CategoryProvider>
  );
}
