import React, { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { Bell, Menu, Eye, EyeOff, Gamepad2 } from "lucide-react";
import iconHistorique from "@assets/mine-mod-records-DgHXSKa1_1782513308641.png";
import iconParrainage from "@assets/téléchargement_(70)_1782513308679.png";
import iconBonus from "@assets/téléchargement_(66)_1782513308705.png";
import iconSupport from "@assets/mine-mod-cs-DtBQ0Sp0_1782513308727.png";
import { useGetBalance, getGetBalanceQueryKey, useGetTransactions, getGetTransactionsQueryKey } from "@workspace/api-client-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import iconSlots from "@assets/icon-slots.png";
import iconWheel from "@assets/icon-wheel.png";
import iconScratch from "@assets/icon-scratch.png";
import iconDeposit from "@assets/recharge-icon-BZHWSjQZ_(1)_1782317902170.png";
import iconWithdraw from "@assets/withdraw-icon-DFsum39V_(1)_1782317901916.png";
import cardBg from "@assets/20260617_124349_1782318016151.png";
import { getUserAvatar } from "@/lib/user-avatar";

export default function Home() {
  const { user } = useAuth();
  const { data: wallet } = useGetBalance({ query: { queryKey: getGetBalanceQueryKey() } });
  const { data: txData } = useGetTransactions({ limit: 5 }, { query: { queryKey: getGetTransactionsQueryKey({ limit: 5 }) } });

  const [showBalance, setShowBalance] = useState(true);

  if (!user) return null;

  return (
    <div className="flex flex-col flex-1 pb-6 w-full">
      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between bg-card border-b border-border shadow-sm z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <Menu className="text-muted-foreground" />
          <h1 className="text-xl font-extrabold tracking-tight">
            <span className="text-primary">BINAKA</span>{" "}
            <span className="text-amber-500">GAME</span>
          </h1>
        </div>
        <div className="relative">
          <Bell className="text-muted-foreground" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* User info */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-primary">
              <AvatarImage src={getUserAvatar(user.id, user.avatarUrl)} className="object-cover" />
            </Avatar>
            <div className="flex-1">
              <h2 className="font-bold text-lg leading-tight">Bonjour, {user.fullName}</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">VIP {user.vipLevel}</span>
                <span className="text-xs text-muted-foreground">ID: {user.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div className="px-4 py-2">
          <div
            className="rounded-2xl p-5 text-white shadow-lg relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #16a34a 0%, #15803d 60%, #166534 100%)" }}
          >
            {/* Decorative lines image */}
            <img
              src={cardBg}
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none select-none"
              style={{ mixBlendMode: "overlay" }}
            />
            {/* Glow blobs */}
            <div className="absolute -right-8 -top-8 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-8 -bottom-8 w-36 h-36 bg-black/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold tracking-widest opacity-80 uppercase">Solde Principal</span>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="p-1 opacity-80 hover:opacity-100 transition-opacity"
                >
                  {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>

              <div className="text-3xl font-extrabold mb-5 flex items-baseline gap-1">
                {showBalance ? (wallet?.balance?.toLocaleString("fr-FR") ?? "0") : "••••••"}
                <span className="text-lg font-bold opacity-80">FCFA</span>
              </div>

              {/* Deposit / Withdraw buttons with custom icons */}
              <div className="flex gap-3">
                <Link
                  href="/deposit"
                  className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl font-bold text-sm bg-white text-green-700 hover:bg-white/90 transition-all active:scale-95 shadow"
                >
                  <img
                    src={iconDeposit}
                    alt="Dépôt"
                    className="w-5 h-5 object-contain"
                    style={{ filter: "invert(27%) sepia(80%) saturate(500%) hue-rotate(100deg) brightness(0.85)" }}
                  />
                  DÉPÔT
                </Link>
                <Link
                  href="/withdraw"
                  className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl font-bold text-sm bg-amber-500 text-white hover:bg-amber-600 transition-all active:scale-95 shadow"
                >
                  <img
                    src={iconWithdraw}
                    alt="Retrait"
                    className="w-5 h-5 object-contain"
                    style={{ filter: "invert(1) brightness(1.2)" }}
                  />
                  RETRAIT
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-2 px-4 py-4">
          <QuickAction img={iconHistorique} label="Historique" href="/wallet" />
          <QuickAction img={iconParrainage} label="Parrainage" href="/referral" />
          <QuickAction img={iconBonus}      label="Bonus"      href="/promotions" />
          <QuickAction img={iconSupport}    label="Support"    href="/support" />
        </div>

        {/* Promo Banner */}
        <div className="px-4 py-2">
          <div
            className="rounded-xl overflow-hidden shadow-md relative"
            style={{ background: "linear-gradient(135deg, #16a34a 0%, #065f46 100%)", minHeight: "90px" }}
          >
            <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -right-4 top-4 text-6xl select-none pointer-events-none opacity-30">🎁</div>
            <div className="relative z-10 flex items-center p-5 gap-4">
              <div className="flex-1 text-white">
                <div className="text-xs font-semibold uppercase tracking-wider opacity-80 mb-0.5">Offre Parrainage</div>
                <h3 className="font-extrabold text-xl leading-tight mb-1">Invitez & Gagnez</h3>
                <p className="text-sm opacity-90 mb-3">10% sur chaque dépôt de vos filleuls</p>
                <Link
                  href="/referral"
                  className="inline-flex items-center h-7 px-3 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors"
                >
                  En savoir plus
                </Link>
              </div>
              <div className="text-7xl select-none hidden sm:block">💰</div>
            </div>
          </div>
        </div>

        {/* Games */}
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-lg">NOS JEUX</h3>
            <Link href="/games" className="text-sm font-medium text-primary flex items-center">
              Voir tout <Gamepad2 className="ml-1 w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <GameCard href="/games/slots" image={iconSlots} name="Jackpot" />
            <GameCard href="/games/wheel" image={iconWheel} name="Roue" />
            <GameCard href="/games/scratch" image={iconScratch} name="Gratter" />
          </div>
        </div>

        {/* Last 5 Transactions */}
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-lg">DERNIÈRES TRANSACTIONS</h3>
            <Link href="/wallet" className="text-sm font-medium text-primary">Voir tout</Link>
          </div>
          <div className="bg-card rounded-xl border border-border overflow-hidden divide-y divide-border">
            {txData?.transactions?.length ? txData.transactions.slice(0, 5).map((tx) => {
              const isDebit = tx.type === "withdrawal";
              const icon = isDebit ? iconWithdraw : iconDeposit;
              const color = isDebit ? "#f59e0b" : "#22c55e";
              const sign = isDebit ? "-" : "+";
              const label = tx.type === "deposit" ? "Dépôt" : tx.type === "withdrawal" ? "Retrait" : tx.type;
              const statusColor = tx.status === "completed" ? "text-green-500" : tx.status === "pending" ? "text-amber-500" : "text-red-500";
              const statusLabel = tx.status === "completed" ? "Complété" : tx.status === "pending" ? "En attente" : "Échoué";
              return (
                <div key={tx.id} className="p-3 flex items-center justify-between gap-3">
                  <div
                    className="h-9 w-9 rounded-xl flex-shrink-0 flex items-center justify-center"
                    style={{ background: `${color}22`, border: `1.5px solid ${color}44` }}
                  >
                    <div style={{ width: 20, height: 20, backgroundColor: color, maskImage: `url(${icon})`, WebkitMaskImage: `url(${icon})`, maskSize: "contain", WebkitMaskSize: "contain", maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat", maskPosition: "center", WebkitMaskPosition: "center" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{label}</div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${statusColor}`}>{statusLabel}</span>
                      {tx.method && <span className="text-xs text-muted-foreground">· {tx.method}</span>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-sm" style={{ color }}>{sign}{tx.amount.toLocaleString("fr-FR")} FCFA</div>
                    <div className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}</div>
                  </div>
                </div>
              );
            }) : (
              <div className="p-4 text-center text-sm text-muted-foreground">Aucune transaction pour le moment</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function QuickAction({ img, label, href }: { img: string; label: string; href: string }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-muted transition-colors active:scale-95">
      <div className="h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm bg-gray-100 border border-gray-200">
        <div
          style={{
            width: 28,
            height: 28,
            backgroundColor: "#111827",
            maskImage: `url(${img})`,
            WebkitMaskImage: `url(${img})`,
            maskSize: "contain",
            WebkitMaskSize: "contain",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            maskPosition: "center",
            WebkitMaskPosition: "center",
          }}
        />
      </div>
      <span className="text-[10px] font-bold text-center text-gray-900">{label}</span>
    </Link>
  );
}

function GameCard({ href, image, name }: { href: string; image: string; name: string }) {
  return (
    <Link href={href} className="flex flex-col gap-2 group">
      <div className="aspect-square rounded-2xl overflow-hidden shadow-md border border-border group-hover:scale-105 transition-transform duration-300">
        <img src={image} alt={name} className="w-full h-full object-cover" />
      </div>
      <span className="text-xs font-bold text-center">{name}</span>
    </Link>
  );
}
