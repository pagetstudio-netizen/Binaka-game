import { Link } from "wouter";
import { Gamepad2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Games() {
  return (
    <div className="flex flex-col flex-1 pb-6 w-full">
      <header className="px-4 py-4 bg-card border-b border-border shadow-sm sticky top-0 z-10 flex items-center gap-3">
        <Gamepad2 className="text-primary" />
        <h1 className="text-xl font-bold">Jeux</h1>
      </header>

      <div className="p-4 space-y-4">
        <GameListCard 
          href="/games/slots" 
          emoji="🎰"
          gradient="from-purple-600 to-purple-900"
          title="Slot Machine Jackpot" 
          desc="Alignez les symboles et gagnez jusqu'à x50 votre mise !"
          minBet="100 FCFA"
          color="bg-purple-50"
          accent="text-purple-600"
        />
        
        <GameListCard 
          href="/games/wheel" 
          emoji="🎡"
          gradient="from-blue-500 to-blue-800"
          title="Roue de la Fortune" 
          desc="Tournez la roue et tentez de remporter le grand prix."
          minBet="200 FCFA"
          color="bg-blue-50"
          accent="text-blue-600"
        />
        
        <GameListCard 
          href="/games/scratch" 
          emoji="🎟"
          gradient="from-amber-500 to-orange-700"
          title="Cartes à Gratter" 
          desc="Découvrez 3 symboles identiques pour gagner instantanément."
          minBet="500 FCFA"
          color="bg-amber-50"
          accent="text-amber-600"
        />
      </div>
    </div>
  );
}

function GameListCard({ href, emoji, gradient, title, desc, minBet, color, accent }: any) {
  return (
    <div className={`rounded-2xl overflow-hidden border border-border shadow-sm ${color} flex flex-col`}>
      <div className={`h-32 w-full relative bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        <span className="text-6xl">{emoji}</span>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
          <h3 className="font-bold text-white text-lg">{title}</h3>
        </div>
      </div>
      <div className="p-4 bg-card flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">{desc}</p>
        <div className="flex items-center justify-between mt-1">
          <div className="text-xs font-medium">
            Mise min: <span className={`font-bold ${accent}`}>{minBet}</span>
          </div>
          <Button asChild size="sm" className="rounded-full">
            <Link href={href}>
              Jouer <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
