import { useState, useEffect } from "react";
import { usePlaySlots, useGetSlotsHistory, getGetSlotsHistoryQueryKey, getGetBalanceQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, History } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const SYMBOLS = ["🍒", "🍋", "🍇", "💎", "7️⃣", "⭐", "🔔"];

export default function Slots() {
  const [bet, setBet] = useState(100);
  const [reels, setReels] = useState(["🍒", "7️⃣", "💎"]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWin, setLastWin] = useState<{ amount: number; multiplier: number } | null>(null);
  
  const playSlots = usePlaySlots();
  const { data: history } = useGetSlotsHistory({ limit: 10 }, { query: { queryKey: getGetSlotsHistoryQueryKey({ limit: 10 }) } });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handlePlay = async () => {
    if (bet < 100) return;
    
    setIsSpinning(true);
    setLastWin(null);
    
    // Fake spin animation
    const spinInterval = setInterval(() => {
      setReels([
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      ]);
    }, 100);

    try {
      const result = await playSlots.mutateAsync({ data: { betAmount: bet } });
      
      clearInterval(spinInterval);
      setReels(result.reels);
      
      if (result.won) {
        setLastWin({ amount: result.winAmount, multiplier: result.multiplier });
        toast({
          title: "Félicitations !",
          description: `Vous avez gagné ${result.winAmount} FCFA (x${result.multiplier})`,
          variant: "default",
          className: "bg-green-600 text-white border-none",
        });
      }
      
      queryClient.invalidateQueries({ queryKey: getGetBalanceQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetSlotsHistoryQueryKey({ limit: 10 }) });
    } catch (error: any) {
      clearInterval(spinInterval);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Solde insuffisant ou erreur serveur",
      });
    } finally {
      setIsSpinning(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-purple-950 text-white w-full overflow-y-auto">
      <header className="p-4 flex items-center gap-3">
        <Link href="/games">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <ArrowLeft />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Jackpot Slots</h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Win Celebration */}
        <div className="h-20 flex items-center justify-center">
          <AnimatePresence>
            {lastWin && (
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="text-center text-amber-400 font-black"
              >
                <div className="text-xl">JACKPOT!</div>
                <div className="text-3xl">+{lastWin.amount} FCFA</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Machine */}
        <div className="bg-yellow-600 p-2 rounded-3xl w-full max-w-sm shadow-2xl mb-8 relative border-b-8 border-yellow-700">
          <div className="bg-black/90 p-4 rounded-2xl flex justify-between gap-2 shadow-inner border-t-8 border-black">
            {reels.map((symbol, idx) => (
              <div key={idx} className="bg-white/10 rounded-xl flex-1 aspect-[3/4] flex items-center justify-center text-5xl md:text-6xl overflow-hidden relative">
                <motion.div
                  animate={isSpinning ? { y: [0, -100, 100, 0] } : { y: 0 }}
                  transition={{ repeat: isSpinning ? Infinity : 0, duration: 0.2 }}
                >
                  {symbol}
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="w-full max-w-sm bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/20">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-white/70">Mise (FCFA)</span>
            <div className="flex items-center gap-3 bg-black/30 rounded-full px-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
                onClick={() => setBet(Math.max(100, bet - 100))}
                disabled={isSpinning || bet <= 100}
              >
                -
              </Button>
              <span className="font-bold w-12 text-center">{bet}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
                onClick={() => setBet(bet + 100)}
                disabled={isSpinning}
              >
                +
              </Button>
            </div>
          </div>
          
          <Button 
            onClick={handlePlay} 
            disabled={isSpinning}
            className="w-full h-14 text-xl font-extrabold bg-green-500 hover:bg-green-600 text-white shadow-lg border-b-4 border-green-700 active:border-b-0 active:translate-y-1 transition-all"
          >
            {isSpinning ? <Loader2 className="animate-spin" /> : "JOUER"}
          </Button>
        </div>
      </div>

      {/* History */}
      <div className="bg-white/5 p-4 rounded-t-3xl border-t border-white/10 mt-auto">
        <h3 className="font-bold mb-3 flex items-center gap-2"><History className="w-4 h-4"/> Historique</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
          {history?.games?.map((game) => (
            <div key={game.id} className="flex justify-between items-center text-sm bg-black/20 p-2 rounded-lg">
              <div className="flex flex-col">
                <span className="text-white/60 text-xs">Mise: {game.betAmount}</span>
                <span className="tracking-widest text-sm">{typeof game.details === 'object' ? (game.details as any)?.symbols?.join(' ') || '—' : String(game.details ?? '—')}</span>
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
