import { useState } from "react";
import { useCreateDeposit } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Loader2, CreditCard, Smartphone } from "lucide-react";
import { useAuth } from "@/lib/auth";

const METHODS = [
  { id: "TMONEY", name: "TMoney", icon: Smartphone, color: "text-amber-500" },
  { id: "FLOOZ", name: "Moov Flooz", icon: Smartphone, color: "text-blue-500" },
  { id: "ORANGE_MONEY", name: "Orange Money", icon: Smartphone, color: "text-orange-500" },
  { id: "MTN_MOMO", name: "MTN MoMo", icon: Smartphone, color: "text-yellow-500" },
  { id: "CRYPTO_USDT", name: "USDT TRC20", icon: CreditCard, color: "text-emerald-500" },
];

export default function Deposit() {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("TMONEY");
  const [phone, setPhone] = useState("");
  
  const { user } = useAuth();
  const createDeposit = useCreateDeposit();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleDeposit = async () => {
    if (!amount || Number(amount) < 500) {
      toast({ title: "Erreur", description: "Le montant minimum est de 500 FCFA", variant: "destructive" });
      return;
    }
    
    if (method !== "CRYPTO_USDT" && !phone) {
      toast({ title: "Erreur", description: "Veuillez entrer un numéro de téléphone", variant: "destructive" });
      return;
    }

    try {
      await createDeposit.mutateAsync({
        data: {
          amount: Number(amount),
          method,
          phone: method !== "CRYPTO_USDT" ? phone : null,
          walletAddress: null
        }
      });
      
      toast({
        title: "Demande envoyée",
        description: "Votre demande de dépôt est en cours de traitement.",
      });
      setLocation("/wallet");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de créer le dépôt",
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
        <h1 className="text-xl font-bold">Dépôt</h1>
      </header>

      <div className="p-4 space-y-6">
        <div className="space-y-3">
          <Label className="text-base font-bold text-muted-foreground">Montant (FCFA)</Label>
          <Input 
            type="number" 
            placeholder="Min 500" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-14 text-2xl font-bold"
          />
          <div className="flex gap-2">
            {[1000, 2000, 5000, 10000].map((val) => (
              <Button 
                key={val} 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => setAmount(val.toString())}
              >
                {val}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-bold text-muted-foreground">Moyen de paiement</Label>
          <div className="grid grid-cols-2 gap-3">
            {METHODS.map((m) => {
              const Icon = m.icon;
              return (
                <div 
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${method === m.id ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}
                >
                  <Icon className={`w-6 h-6 ${m.color}`} />
                  <span className="text-sm font-medium">{m.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {method !== "CRYPTO_USDT" && (
          <div className="space-y-3">
            <Label className="text-base font-bold text-muted-foreground">Numéro de téléphone</Label>
            <Input 
              placeholder="Ex: 90 00 00 00" 
              value={phone || user?.phone || ''}
              onChange={(e) => setPhone(e.target.value)}
              className="h-12"
            />
          </div>
        )}

        <Button 
          onClick={handleDeposit} 
          disabled={createDeposit.isPending}
          className="w-full h-14 text-lg font-bold mt-4"
        >
          {createDeposit.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
          CONFIRMER LE DÉPÔT
        </Button>
      </div>
    </div>
  );
}
