import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Settings, HelpCircle, LogOut, ChevronRight, User as UserIcon } from "lucide-react";
import { Link } from "wouter";

export default function Account() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="p-4 space-y-6 pb-20 w-full bg-slate-50 min-h-[100dvh]">
      <h1 className="text-2xl font-bold">Mon Compte</h1>

      <div className="flex items-center gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
        <Avatar className="h-16 w-16 border-2 border-primary">
          <AvatarImage src={user.avatarUrl || ""} />
          <AvatarFallback className="bg-primary/20 text-primary text-xl font-bold">{user.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="font-bold text-lg">{user.fullName}</h2>
          <p className="text-sm text-muted-foreground">{user.phone}</p>
          <div className="flex gap-2 mt-1">
            <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">VIP {user.vipLevel}</span>
            {user.isVerified && <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">Vérifié</span>}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <AccountItem icon={<UserIcon />} label="Informations Personnelles" href="/account/profile" />
        <AccountItem icon={<Shield />} label="Sécurité et Mot de passe" href="/account/security" />
        <AccountItem icon={<Settings />} label="Paramètres de l'application" href="/account/settings" />
        <AccountItem icon={<HelpCircle />} label="Centre d'aide" href="/support" />
      </div>

      {user.isAdmin && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="p-4">
            <h3 className="font-bold mb-2">Zone Administrateur</h3>
            <Button asChild className="w-full">
              <Link href="/admin">Aller au Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Button 
        variant="destructive" 
        className="w-full h-12 font-bold bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-none"
        onClick={() => logout()}
      >
        <LogOut className="w-5 h-5 mr-2" /> DÉCONNEXION
      </Button>
    </div>
  );
}

function AccountItem({ icon, label, href }: { icon: React.ReactNode, label: string, href: string }) {
  return (
    <Link href={href} className="flex items-center justify-between bg-card p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground">{icon}</div>
        <span className="font-medium text-sm">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </Link>
  );
}
