import { useState } from "react";
import { usePlayWheel, useGetWheelHistory, getGetWheelHistoryQueryKey, getGetBalanceQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, History } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const SEGMENTS = 8;
const SEGMENT_ANGLE = 360 / SEGMENTS;

export default function Wheel() {
  const [bet, setBet] = useState(200);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWin, setLastWin] = useState<number | null>(null);
  
  const playWheel = usePlayWheel();
  const { data: history } = useGetWheelHistory({ limit: 10 }, { query: { queryKey: getGetWheelHistoryQueryKey({ limit: 10 }) } });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handlePlay = async () => {
    if (bet < 200) return;
    
    setIsSpinning(true);
    setLastWin(null);
    
    try {
      const result = await playWheel.mutateAsync({ data: { betAmount: bet } });
      
      // Calculate rotation
      const extraSpins = 5 * 360; // 5 full rotations
      const targetRotation = rotation + extraSpins + result.spinAngle - (rotation % 360);
      
      setRotation(targetRotation);
      
      // Wait for animation
      setTimeout(() => {
        setIsSpinning(false);
        if (result.won) {
          setLastWin(result.winAmount);
          toast({
            title: "Gagné !",
            description: `Prix: ${result.prize} (${result.winAmount} FCFA)`,
            className: "bg-green-600 text-white border-none",
          });
        } else {
          toast({
            title: "Perdu",
            description: "Réessayez !",
            variant: "destructive",
          });
        }
        queryClient.invalidateQueries({ queryKey: getGetBalanceQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetWheelHistoryQueryKey({ limit: 10 }) });
      }, 3000); // 3 seconds animation
      
    } catch (error: any) {
      setIsSpinning(false);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Solde insuffisant",
      });
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-blue-950 text-white w-full min-h-[100dvh]">
      <header className="p-4 flex items-center gap-3">
        <Link href="/games">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <ArrowLeft />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Roue de la Fortune</h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        
        <div className="h-12 mb-4 text-center">
          {lastWin && !isSpinning && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-2xl font-black text-amber-400"
            >
              +{lastWin} FCFA
            </motion.div>
          )}
        </div>

        {/* Wheel Container */}
        <div className="relative w-72 h-72 mb-8">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 border-l-[15px] border-r-[15px] border-t-[30px] border-l-transparent border-r-transparent border-t-amber-500 z-10 drop-shadow-md"></div>
          
          {/* The Wheel */}
          <motion.div 
            className="w-full h-full rounded-full border-8 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.5)] overflow-hidden bg-blue-900 relative"
            animate={{ rotate: rotation }}
            transition={{ duration: 3, ease: "easeOut" }}
          >
            {/* Simple CSS Wheel Segments */}
            {Array.from({ length: SEGMENTS }).map((_, i) => (
              <div 
                key={i} 
                className="absolute top-0 left-1/2 origin-bottom -translate-x-1/2 w-[120px] h-[50%] flex items-start justify-center pt-4"
                style={{ 
                  transform: `translateX(-50%) rotate(${i * SEGMENT_ANGLE}deg)`,
                  backgroundColor: i % 2 === 0 ? '#1e3a8a' : '#1e40af',
                  clipPath: 'polygon(0 0, 100% 0, 50% 100%)'
                }}
              >
                <span className="text-xs font-bold text-white/80 transform -rotate-90 origin-center translate-y-6">x{i+1}</span>
              </div>
            ))}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-amber-500 rounded-full border-4 border-white shadow-inner flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
          </motion.div>
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
                onClick={() => setBet(Math.max(200, bet - 100))}
                disabled={isSpinning || bet <= 200}
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
            className="w-full h-14 text-xl font-extrabold bg-amber-500 hover:bg-amber-600 text-white shadow-lg border-b-4 border-amber-700 active:border-b-0 active:translate-y-1 transition-all"
          >
            {isSpinning ? <Loader2 className="animate-spin" /> : "TOURNER"}
          </Button>
        </div>
      </div>

      {/* History */}
      <div className="bg-white/5 p-4 rounded-t-3xl border-t border-white/10 mt-auto">
        <h3 className="font-bold mb-3 flex items-center gap-2"><History className="w-4 h-4"/> Historique</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
          {history?.games?.map((game) => (
            <div key={game.id} className="flex justify-between items-center text-sm bg-black/20 p-2 rounded-lg">
              <span className="text-white/60 text-xs">Mise: {game.betAmount}</span>
              <span className="font-medium">{game.details}</span>
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
