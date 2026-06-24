import { useGetVipInfo, getGetVipInfoQueryKey } from "@workspace/api-client-react";
import { Progress } from "@/components/ui/progress";
import { Crown, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Vip() {
  const { data: vip } = useGetVipInfo({ query: { queryKey: getGetVipInfoQueryKey() } });

  if (!vip) return <div className="p-4">Chargement...</div>;

  const progress = vip.nextLevelXp > 0 ? (vip.currentXp / vip.nextLevelXp) * 100 : 100;

  return (
    <div className="p-4 space-y-6 pb-20 w-full min-h-[100dvh] bg-slate-950 text-white">
      <header className="flex flex-col items-center justify-center pt-6 pb-2">
        <Crown className="w-12 h-12 text-amber-400 mb-2" />
        <h1 className="text-2xl font-black text-amber-400 tracking-wider">CLUB VIP</h1>
        <p className="text-sm text-slate-400">Des privilèges exclusifs pour nos meilleurs joueurs</p>
      </header>

      <Card className="bg-slate-900 border-slate-800 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>
        <CardContent className="p-6">
          <div className="flex justify-between items-end mb-4">
            <div>
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Votre Niveau</div>
              <div className="text-3xl font-black text-amber-500">NIVEAU {vip.currentLevel}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{vip.currentXp} <span className="text-sm text-slate-400 font-normal">XP</span></div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-400">Progression</span>
              <span className="text-amber-500">{vip.nextLevelXp - vip.currentXp} XP restants</span>
            </div>
            <Progress value={progress} className="h-2 bg-slate-800 [&>div]:bg-gradient-to-r [&>div]:from-amber-600 [&>div]:to-amber-400" />
            <div className="flex justify-between text-xs text-slate-500">
              <span>Niveau {vip.currentLevel}</span>
              <span>Niveau {vip.currentLevel + 1}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Star className="text-amber-500 w-5 h-5"/> Avantages par niveau</h2>
        <div className="space-y-3">
          {vip.levels.map((level) => (
            <div 
              key={level.level} 
              className={`p-4 rounded-xl border flex gap-4 ${level.level === vip.currentLevel ? 'bg-amber-500/10 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'bg-slate-900 border-slate-800'}`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg ${level.level === vip.currentLevel ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                {level.level}
              </div>
              <div className="flex-1">
                <h3 className={`font-bold ${level.level === vip.currentLevel ? 'text-amber-400' : 'text-slate-200'}`}>{level.name}</h3>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="text-xs">
                    <div className="text-slate-500">Bonus Quotidien</div>
                    <div className="font-bold text-slate-300">{level.dailyBonus} FCFA</div>
                  </div>
                  <div className="text-xs">
                    <div className="text-slate-500">Cashback</div>
                    <div className="font-bold text-slate-300">{level.cashbackRate}%</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
