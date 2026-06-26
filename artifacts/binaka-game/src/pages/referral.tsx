import { useGetReferralInfo, getGetReferralInfoQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Share2, Users, Coins } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

export default function Referral() {
  const { data: info } = useGetReferralInfo({ query: { queryKey: getGetReferralInfoQueryKey() } });
  const { toast } = useToast();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copié !", description: "Texte copié dans le presse-papiers" });
  };

  const handleShare = () => {
    if (navigator.share && info?.referralLink) {
      navigator.share({
        title: "Rejoins BINAKA GAME",
        text: "Inscris-toi avec mon code et gagnons ensemble !",
        url: info.referralLink
      }).catch(() => handleCopy(info.referralLink));
    } else if (info?.referralLink) {
      handleCopy(info.referralLink);
    }
  };

  return (
    <div className="flex flex-col w-full pb-20">
      <header className="sticky top-0 z-20 px-4 py-4 bg-white border-b border-gray-200 shadow-sm">
        <h1 className="text-2xl font-bold">Parrainage</h1>
        <p className="text-sm text-muted-foreground mt-1">Invitez vos amis et gagnez à vie !</p>
      </header>
      <div className="p-4 space-y-6">

      <Card className="bg-primary text-white border-none shadow-lg">
        <CardContent className="p-6 text-center space-y-2">
          <div className="text-5xl mb-2">🎁</div>
          <h2 className="text-2xl font-black">{info?.commissionRate || 10}% Commission</h2>
          <p className="text-primary-foreground/80 text-sm">Gagnez {info?.commissionRate || 10}% sur chaque dépôt effectué par vos filleuls, crédité instantanément.</p>
        </CardContent>
      </Card>

      <div className="space-y-4 bg-card p-5 rounded-2xl border border-border">
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Votre code de parrainage</label>
          <div className="flex gap-2">
            <Input value={info?.referralCode || "..."} readOnly className="font-bold tracking-widest text-center text-lg bg-muted" />
            <Button variant="secondary" onClick={() => handleCopy(info?.referralCode || "")}><Copy className="w-4 h-4" /></Button>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Lien d'invitation</label>
          <div className="flex gap-2">
            <Button className="w-full font-bold" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" /> PARTAGER LE LIEN
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card p-4 rounded-xl border border-border flex flex-col items-center justify-center gap-1">
          <Users className="text-blue-500 mb-1" />
          <span className="text-2xl font-bold">{info?.totalInvited || 0}</span>
          <span className="text-xs text-muted-foreground">Amis invités</span>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border flex flex-col items-center justify-center gap-1">
          <Coins className="text-amber-500 mb-1" />
          <span className="text-xl font-bold text-green-600">{(info?.totalEarned || 0).toLocaleString()} FCFA</span>
          <span className="text-xs text-muted-foreground">Gains totaux</span>
        </div>
      </div>
      </div>
    </div>
  );
}
