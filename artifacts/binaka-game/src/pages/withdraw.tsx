import { useState } from "react";
import { useCreateWithdrawal, useGetBalance, getGetBalanceQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const METHODS = [
  { id: "TMONEY", name: "TMoney" },
  { id: "FLOOZ", name: "Moov Flooz" },
  { id: "ORANGE_MONEY", name: "Orange Money" },
];

export default function Withdraw() {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("TMONEY");
  const [phone, setPhone] = useState("");
  
  const { data: wallet } = useGetBalance({ query: { queryKey: getGetBalanceQueryKey() } });
  const createWithdrawal = useCreateWithdrawal();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleWithdraw = async () => {
    if (!amount || Number(amount) < 2000) {
      toast({ title: "Erreur", description: "Le montant minimum est de 2000 FCFA", variant: "destructive" });
      return;
    }
    
    if (Number(amount) > (wallet?.balance || 0)) {
      toast({ title: "Erreur", description: "Solde insuffisant", variant: "destructive" });
      return;
    }

    if (!phone) {
      toast({ title: "Erreur", description: "Veuillez entrer un numéro de téléphone", variant: "destructive" });
      return;
    }

    try {
      await createWithdrawal.mutateAsync({
        data: {
          amount: Number(amount),
          method,
          phone,
          walletAddress: null
        }
      });
      
      toast({
        title: "Demande envoyée",
        description: "Votre demande de retrait est en cours de traitement.",
      });
      setLocation("/wallet");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de créer le retrait",
      });
    }
  };

  return (
    <div className="flex flex-col flex-1 pb-6 w-full">
      <header className="px-4 py-4 bg-card border-b border-border flex items-center gap-3">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Retrait</h1>
      </header>

      <div className="p-4 space-y-6">
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex justify-between items-center">
          <span className="text-amber-800 font-medium">Solde Retirable</span>
          <span className="text-amber-900 font-black text-xl">{(wallet?.balance || 0).toLocaleString()} FCFA</span>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-bold text-muted-foreground">Montant (FCFA)</Label>
          <Input 
            type="number" 
            placeholder="Min 2000" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-14 text-2xl font-bold"
          />
          <div className="flex justify-between text-xs text-muted-foreground px-1">
            <span>Min: 2,000 FCFA</span>
            <span>Max: 500,000 FCFA</span>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-bold text-muted-foreground">Moyen de réception</Label>
          <div className="grid grid-cols-3 gap-2">
            {METHODS.map((m) => (
              <div 
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all text-center ${method === m.id ? 'border-amber-500 bg-amber-50' : 'border-border bg-card'}`}
              >
                <span className="text-xs font-bold">{m.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-bold text-muted-foreground">Numéro de compte</Label>
          <Input 
            placeholder="Numéro de réception" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-12"
          />
        </div>

        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 text-xs">
            Les retraits sont généralement traités en moins de 15 minutes. Assurez-vous que le numéro est correct.
          </AlertDescription>
        </Alert>

        <Button 
          onClick={handleWithdraw} 
          disabled={createWithdrawal.isPending}
          className="w-full h-14 text-lg font-bold bg-amber-500 hover:bg-amber-600 text-white"
        >
          {createWithdrawal.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
          SOUMETTRE LE RETRAIT
        </Button>
      </div>
    </div>
  );
}
