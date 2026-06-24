import { useGetBalance, getGetBalanceQueryKey, useGetTransactions, getGetTransactionsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Gift, Gamepad2, Coins } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

export default function Wallet() {
  const { data: wallet } = useGetBalance({ query: { queryKey: getGetBalanceQueryKey() } });
  const { data: txData } = useGetTransactions({ limit: 50 }, { query: { queryKey: getGetTransactionsQueryKey({ limit: 50 }) } });

  const formatMoney = (amount: number | undefined) => {
    return (amount || 0).toLocaleString() + " FCFA";
  };

  const getTxIcon = (type: string) => {
    switch(type) {
      case 'DEPOSIT': return <ArrowDownLeft className="text-green-500" />;
      case 'WITHDRAWAL': return <ArrowUpRight className="text-red-500" />;
      case 'GAME_WIN': return <Gamepad2 className="text-primary" />;
      case 'GAME_BET': return <Coins className="text-amber-500" />;
      case 'BONUS': return <Gift className="text-purple-500" />;
      default: return <ArrowLeftRight className="text-gray-500" />;
    }
  };

  const getTxName = (type: string) => {
    switch(type) {
      case 'DEPOSIT': return 'Dépôt';
      case 'WITHDRAWAL': return 'Retrait';
      case 'GAME_WIN': return 'Gain de jeu';
      case 'GAME_BET': return 'Mise';
      case 'BONUS': return 'Bonus';
      default: return 'Transaction';
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'COMPLETED': return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Complété</Badge>;
      case 'PENDING': return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">En attente</Badge>;
      case 'FAILED': return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Échoué</Badge>;
      default: return null;
    }
  };

  return (
    <div className="p-4 space-y-4 pb-20 w-full">
      <h1 className="text-2xl font-bold">Portefeuille</h1>

      <div className="grid grid-cols-2 gap-3">
        <Card className="col-span-2 bg-gradient-to-r from-primary to-green-600 text-white border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Solde Disponible</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold">{formatMoney(wallet?.balance)}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-1 p-4">
            <CardTitle className="text-xs text-muted-foreground font-medium">Total Déposé</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="font-bold text-sm">{formatMoney(wallet?.totalDeposited)}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-1 p-4">
            <CardTitle className="text-xs text-muted-foreground font-medium">Total Retiré</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="font-bold text-sm">{formatMoney(wallet?.totalWithdrawn)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto rounded-xl p-1 bg-muted">
          <TabsTrigger value="all" className="rounded-lg text-xs">Tout</TabsTrigger>
          <TabsTrigger value="deposits" className="rounded-lg text-xs">Dépôts</TabsTrigger>
          <TabsTrigger value="withdrawals" className="rounded-lg text-xs">Retraits</TabsTrigger>
          <TabsTrigger value="games" className="rounded-lg text-xs">Jeux</TabsTrigger>
        </TabsList>

        <div className="mt-4 space-y-3">
          {txData?.transactions?.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-3 bg-card rounded-xl border border-border shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  {getTxIcon(tx.type)}
                </div>
                <div>
                  <div className="font-medium text-sm">{getTxName(tx.type)}</div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(tx.createdAt), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className={`font-bold ${tx.type === 'DEPOSIT' || tx.type === 'GAME_WIN' || tx.type === 'BONUS' ? 'text-green-600' : 'text-foreground'}`}>
                  {tx.type === 'WITHDRAWAL' || tx.type === 'GAME_BET' ? '-' : '+'}{tx.amount}
                </div>
                {getStatusBadge(tx.status)}
              </div>
            </div>
          ))}
          {(!txData?.transactions || txData.transactions.length === 0) && (
            <div className="text-center p-8 text-muted-foreground text-sm">
              Aucune transaction trouvée.
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}
