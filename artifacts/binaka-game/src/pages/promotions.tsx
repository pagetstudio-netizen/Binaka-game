import { useGetBonusList, getGetBonusListQueryKey, useClaimDailyBonus, getGetBalanceQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Gift, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

export default function Promotions() {
  const { data: bonuses } = useGetBonusList({ query: { queryKey: getGetBonusListQueryKey() } });
  const claimBonus = useClaimDailyBonus();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleClaim = async () => {
    try {
      const res = await claimBonus.mutateAsync();
      toast({
        title: "Bonus réclamé !",
        description: res.message || `Vous avez reçu ${res.amount} FCFA`,
        className: "bg-green-600 text-white",
      });
      queryClient.invalidateQueries({ queryKey: getGetBalanceQueryKey() });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Bonus déjà réclamé aujourd'hui",
      });
    }
  };

  return (
    <div className="flex flex-col w-full pb-20">
      <header className="sticky top-0 z-20 px-4 py-4 bg-white border-b border-gray-200 shadow-sm flex items-center gap-3">
        <Gift className="text-primary w-6 h-6" />
        <h1 className="text-2xl font-bold">Promotions</h1>
      </header>
      <div className="p-4 space-y-6">

      <Card className="bg-gradient-to-br from-primary to-green-700 text-white border-none overflow-hidden relative">
        <div className="absolute right-0 top-0 opacity-20 transform translate-x-4 -translate-y-4">
          <Gift size={100} />
        </div>
        <CardContent className="p-6 relative z-10">
          <h2 className="text-xl font-bold mb-2">Bonus Quotidien</h2>
          <p className="text-green-100 text-sm mb-4">Connectez-vous chaque jour pour réclamer votre récompense gratuite !</p>
          <Button 
            onClick={handleClaim} 
            disabled={claimBonus.isPending}
            variant="secondary"
            className="w-full font-bold bg-white text-primary hover:bg-white/90"
          >
            {claimBonus.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
            RÉCLAMER MON BONUS
          </Button>
        </CardContent>
      </Card>

      <div>
        <h3 className="font-bold text-lg mb-3">Bonus Actifs</h3>
        <div className="space-y-3">
          {bonuses?.map((bonus) => (
            <div key={bonus.id} className="p-4 bg-card rounded-xl border border-border shadow-sm flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm">{bonus.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{bonus.description}</p>
                <span className="inline-block mt-2 text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                  {bonus.amount} FCFA
                </span>
              </div>
              <CheckCircle2 className="text-green-500 w-5 h-5" />
            </div>
          ))}
          {(!bonuses || bonuses.length === 0) && (
            <div className="text-center p-8 text-muted-foreground text-sm border border-dashed rounded-xl">
              Aucun autre bonus disponible pour le moment.
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
