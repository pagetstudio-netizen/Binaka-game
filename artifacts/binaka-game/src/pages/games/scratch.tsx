import { useState } from "react";
import { usePlayScratch, useGetScratchHistory, getGetScratchHistoryQueryKey, getGetBalanceQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, History } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function Scratch() {
  const [cardType, setCardType] = useState("BRONZE");
  const [bet, setBet] = useState(500);
  const [symbols, setSymbols] = useState<string[]>(Array(9).fill("❓"));
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastWin, setLastWin] = useState<number | null>(null);
  
  const playScratch = usePlayScratch();
  const { data: history } = useGetScratchHistory({ limit: 10 }, { query: { queryKey: getGetScratchHistoryQueryKey({ limit: 10 }) } });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleCardType = (type: string, amount: number) => {
    setCardType(type);
    setBet(amount);
    setSymbols(Array(9).fill("❓"));
    setIsRevealed(false);
    setLastWin(null);
  };

  const handlePlay = async () => {
    setIsLoading(true);
    setIsRevealed(false);
    setSymbols(Array(9).fill("❓"));
    setLastWin(null);
    
    try {
      const result = await playScratch.mutateAsync({ data: { betAmount: bet, cardType } });
      
      setSymbols(result.symbols);
      setIsRevealed(true);
      
      if (result.won) {
        setLastWin(result.winAmount);
        toast({
          title: "Gagné !",
          description: `Vous avez remporté ${result.winAmount} FCFA`,
          className: "bg-green-600 text-white border-none",
        });
      } else {
        toast({
          title: "Perdu",
          description: "Dommage, essayez encore !",
          variant: "destructive",
        });
      }
      
      queryClient.invalidateQueries({ queryKey: getGetBalanceQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetScratchHistoryQueryKey({ limit: 10 }) });
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Solde insuffisant",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-amber-900 text-white w-full overflow-y-auto">
      <header className="sticky top-0 z-20 p-4 flex items-center gap-3 bg-inherit">
        <Link href="/games">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <ArrowLeft />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Carte à Gratter</h1>
      </header>

      <div className="flex-1 flex flex-col items-center p-4">
        
        {/* Card Selector */}
        <div className="flex gap-2 w-full max-w-sm mb-6 bg-black/20 p-1 rounded-xl">
          <Button 
            variant="ghost" 
            className={`flex-1 rounded-lg ${cardType === "BRONZE" ? "bg-orange-800/80 text-white" : "text-white/60 hover:text-white"}`}
            onClick={() => handleCardType("BRONZE", 500)}
          >
            Bronze (500)
          </Button>
          <Button 
            variant="ghost" 
            className={`flex-1 rounded-lg ${cardType === "SILVER" ? "bg-slate-400 text-slate-900" : "text-white/60 hover:text-white"}`}
            onClick={() => handleCardType("SILVER", 1000)}
          >
            Argent (1000)
          </Button>
          <Button 
            variant="ghost" 
            className={`flex-1 rounded-lg ${cardType === "GOLD" ? "bg-amber-400 text-amber-900" : "text-white/60 hover:text-white"}`}
            onClick={() => handleCardType("GOLD", 2000)}
          >
            Or (2000)
          </Button>
        </div>

        <div className="h-10 mb-2 text-center">
          {lastWin && isRevealed && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-xl font-black text-amber-300"
            >
              +{lastWin} FCFA
            </motion.div>
          )}
        </div>

        {/* Scratch Card Area */}
        <div className="bg-amber-100 p-3 rounded-2xl w-full max-w-sm shadow-xl mb-8 relative border-4 border-amber-300">
          <div className="bg-amber-800 p-2 rounded-xl text-center mb-3">
            <h2 className="font-black text-amber-200 tracking-wider">CARTE {cardType}</h2>
          </div>
          
          <div className="grid grid-cols-3 gap-2 bg-white/20 p-2 rounded-xl">
            {symbols.map((symbol, idx) => (
              <div 
                key={idx} 
                className={`aspect-square rounded-lg flex items-center justify-center text-4xl shadow-inner ${isRevealed ? 'bg-white' : 'bg-slate-300'}`}
              >
                {isRevealed ? (
                  <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }}>
                    {symbol}
                  </motion.div>
                ) : (
                  <div className="w-full h-full bg-slate-400/50 rounded-lg animate-pulse" />
                )}
              </div>
            ))}
          </div>
          
          {!isRevealed && !isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 rounded-xl backdrop-blur-[2px]">
              <span className="text-white font-bold bg-black/50 px-4 py-2 rounded-full shadow-lg">En attente de mise</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <Button 
          onClick={handlePlay} 
          disabled={isLoading}
          className="w-full max-w-sm h-14 text-xl font-extrabold bg-amber-500 hover:bg-amber-600 text-white shadow-lg border-b-4 border-amber-700 active:border-b-0 active:translate-y-1 transition-all"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : "GRATTER MAINTENANT"}
        </Button>
      </div>

      {/* History */}
      <div className="bg-black/30 p-4 rounded-t-3xl mt-auto">
        <h3 className="font-bold mb-3 flex items-center gap-2 text-amber-200"><History className="w-4 h-4"/> Historique</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
          {history?.games?.map((game) => (
            <div key={game.id} className="flex justify-between items-center text-sm bg-black/20 p-2 rounded-lg">
              <div className="flex flex-col">
                <span className="text-white/60 text-xs">{typeof game.details === 'object' ? (game.details as any)?.cardType || '—' : String(game.details ?? '—')}</span>
              </div>
              <span className={`font-bold ${game.won ? 'text-green-400' : 'text-red-400'}`}>
                {game.won ? `+${game.winAmount}` : `-${game.betAmount}`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
