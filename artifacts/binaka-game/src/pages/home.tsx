import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { Bell, Menu, Eye, EyeOff, Plus, Minus, History, Users, Gift, HelpCircle, Gamepad2 } from "lucide-react";
import { useGetBalance, getGetBalanceQueryKey, useGetRecentWinners, getGetRecentWinnersQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import iconSlots from "@assets/icon-slots.png";
import iconWheel from "@assets/icon-wheel.png";
import iconScratch from "@assets/icon-scratch.png";

export default function Home() {
  const { user } = useAuth();
  const { data: wallet } = useGetBalance({ query: { queryKey: getGetBalanceQueryKey() } });
  const { data: winners } = useGetRecentWinners({ limit: 5 }, { query: { queryKey: getGetRecentWinnersQueryKey({ limit: 5 }) } });
  
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
        {/* User Card */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-3 mb-2">
            <Avatar className="h-12 w-12 border-2 border-primary">
              <AvatarImage src={user.avatarUrl || ""} />
              <AvatarFallback className="bg-primary/20 text-primary font-bold">{user.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="font-bold text-lg leading-tight">Bonjour, {user.fullName}</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">VIP {user.vipLevel}</span>
                <span className="text-xs text-muted-foreground">ID: {user.id}</span>
              </div>
            </div>
          </div>
          {/* <Progress value={45} className="h-1.5" /> */}
        </div>

        {/* Balance Card */}
        <div className="px-4 py-2">
          <div className="bg-gradient-to-br from-primary to-green-700 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium opacity-90">SOLDE PRINCIPAL</span>
                <button onClick={() => setShowBalance(!showBalance)} className="p-1 opacity-80 hover:opacity-100 transition-opacity">
                  {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
              <div className="text-3xl font-extrabold mb-5 flex items-baseline gap-1">
                {showBalance ? (wallet?.balance?.toLocaleString() || "0") : "••••••"}
                <span className="text-lg font-bold opacity-90">FCFA</span>
              </div>
              
              <div className="flex gap-3">
                <Button asChild variant="secondary" className="flex-1 font-bold text-primary bg-white hover:bg-white/90">
                  <Link href="/deposit">
                    <Plus className="mr-1 h-4 w-4" /> DÉPÔT
                  </Link>
                </Button>
                <Button asChild className="flex-1 font-bold bg-amber-500 text-white hover:bg-amber-600 border-none">
                  <Link href="/withdraw">
                    <Minus className="mr-1 h-4 w-4" /> RETRAIT
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-2 px-4 py-4">
          <QuickAction icon={<History className="text-blue-500" />} label="Historique" href="/wallet" />
          <QuickAction icon={<Users className="text-purple-500" />} label="Parrainage" href="/referral" />
          <QuickAction icon={<Gift className="text-amber-500" />} label="Bonus" href="/promotions" />
          <QuickAction icon={<HelpCircle className="text-green-500" />} label="Support" href="/support" />
        </div>

        {/* Promo Banner */}
        <div className="px-4 py-2">
          <div className="rounded-xl overflow-hidden shadow-md relative" style={{background: "linear-gradient(135deg, #16a34a 0%, #065f46 100%)", minHeight: "90px"}}>
            <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -right-4 top-4 text-6xl select-none pointer-events-none opacity-30">🎁</div>
            <div className="relative z-10 flex items-center p-5 gap-4">
              <div className="flex-1 text-white">
                <div className="text-xs font-semibold uppercase tracking-wider opacity-80 mb-0.5">Offre Parrainage</div>
                <h3 className="font-extrabold text-xl leading-tight mb-1">Invitez & Gagnez</h3>
                <p className="text-sm opacity-90 mb-3">10% sur chaque dépôt de vos filleuls</p>
                <Button size="sm" asChild className="bg-amber-500 hover:bg-amber-600 text-white h-7 text-xs px-3 rounded-full">
                  <Link href="/referral">En savoir plus</Link>
                </Button>
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

        {/* Recent Winners */}
        <div className="px-4 py-4 mb-4">
          <h3 className="font-bold text-lg mb-3">GAGNANTS RÉCENTS</h3>
          <div className="bg-card rounded-xl border border-border overflow-hidden divide-y divide-border">
            {winners?.length ? winners.map((winner) => (
              <div key={winner.id} className="p-3 flex items-center justify-between hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={winner.avatarUrl || ""} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">{winner.username.substring(0,2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-sm">{winner.username}</div>
                    <div className="text-xs text-muted-foreground">{winner.gameType}</div>
                  </div>
                </div>
                <div className="font-bold text-green-600">
                  +{winner.winAmount.toLocaleString()} FCFA
                </div>
              </div>
            )) : (
              <div className="p-4 text-center text-sm text-muted-foreground">Aucun gagnant pour le moment</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon, label, href }: { icon: React.ReactNode, label: string, href: string }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-muted transition-colors">
      <div className="h-12 w-12 rounded-full bg-card shadow-sm border border-border flex items-center justify-center">
        {icon}
      </div>
      <span className="text-[10px] font-medium text-center">{label}</span>
    </Link>
  );
}

function GameCard({ href, image, name }: { href: string, image: string, name: string }) {
  return (
    <Link href={href} className="flex flex-col gap-2 group">
      <div className="aspect-square rounded-2xl overflow-hidden shadow-md border border-border group-hover:scale-105 transition-transform duration-300">
        <img src={image} alt={name} className="w-full h-full object-cover" />
      </div>
      <span className="text-xs font-bold text-center">{name}</span>
    </Link>
  );
}
