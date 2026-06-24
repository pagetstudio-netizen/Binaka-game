import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useGetAdminStats, getGetAdminStatsQueryKey, useGetAdminTransactions, getGetAdminTransactionsQueryKey, useApproveTransaction, useRejectTransaction } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Check, X, ShieldAlert, Users, CreditCard, Activity } from "lucide-react";

export default function Admin() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  if (!user?.isAdmin) {
    setLocation("/");
    return null;
  }

  const { data: stats } = useGetAdminStats({ query: { queryKey: getGetAdminStatsQueryKey() } });
  const { data: txs } = useGetAdminTransactions({ status: "PENDING", limit: 20 }, { query: { queryKey: getGetAdminTransactionsQueryKey({ status: "PENDING", limit: 20 }) } });
  
  const approveTx = useApproveTransaction();
  const rejectTx = useRejectTransaction();

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') await approveTx.mutateAsync({ id });
      else await rejectTx.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getGetAdminTransactionsQueryKey({ status: "PENDING", limit: 20 }) });
      queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-4 space-y-6 w-full min-h-[100dvh] bg-slate-100">
      <header className="flex items-center gap-2 border-b pb-4">
        <ShieldAlert className="text-red-600" />
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader className="p-3 pb-0"><CardTitle className="text-xs text-muted-foreground">Total Utilisateurs</CardTitle></CardHeader>
          <CardContent className="p-3 pt-1"><div className="text-xl font-bold">{stats?.totalUsers || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="p-3 pb-0"><CardTitle className="text-xs text-muted-foreground">Revenu Plateforme</CardTitle></CardHeader>
          <CardContent className="p-3 pt-1"><div className="text-xl font-bold text-green-600">{(stats?.platformRevenue || 0).toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="p-3 pb-0"><CardTitle className="text-xs text-muted-foreground">Dépôts (Aujourd'hui)</CardTitle></CardHeader>
          <CardContent className="p-3 pt-1"><div className="text-lg font-bold">{(stats?.todayDeposits || 0).toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="p-3 pb-0"><CardTitle className="text-xs text-muted-foreground">Retraits (Aujourd'hui)</CardTitle></CardHeader>
          <CardContent className="p-3 pt-1"><div className="text-lg font-bold">{(stats?.todayWithdrawals || 0).toLocaleString()}</div></CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions">
        <TabsList className="w-full">
          <TabsTrigger value="transactions" className="flex-1">Transactions En Attente</TabsTrigger>
          <TabsTrigger value="users" className="flex-1">Utilisateurs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions" className="space-y-3 mt-4">
          {txs?.transactions?.map(tx => (
            <Card key={tx.id} className="p-3 shadow-sm border-l-4 border-l-amber-500">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-bold text-sm">{tx.type} • {tx.method}</div>
                  <div className="text-xs text-muted-foreground">User ID: {tx.userId} | Ref: {tx.reference}</div>
                </div>
                <div className="font-bold text-lg">{tx.amount}</div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button 
                  size="sm" 
                  className="flex-1 bg-green-600 hover:bg-green-700" 
                  onClick={() => handleAction(tx.id, 'approve')}
                  disabled={approveTx.isPending || rejectTx.isPending}
                >
                  <Check className="w-4 h-4 mr-1" /> Approuver
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  className="flex-1"
                  onClick={() => handleAction(tx.id, 'reject')}
                  disabled={approveTx.isPending || rejectTx.isPending}
                >
                  <X className="w-4 h-4 mr-1" /> Rejeter
                </Button>
              </div>
            </Card>
          ))}
          {(!txs?.transactions || txs.transactions.length === 0) && (
            <div className="text-center p-8 text-muted-foreground text-sm">
              Aucune transaction en attente.
            </div>
          )}
        </TabsContent>
        <TabsContent value="users">
           <div className="text-center p-8 text-muted-foreground text-sm border rounded-xl bg-white mt-4">
              Gestion détaillée des utilisateurs accessible sur la version desktop.
            </div>
        </TabsContent>
      </Tabs>
      
      <div className="pt-8">
        <Button variant="outline" className="w-full" onClick={() => setLocation("/")}>Retour à l'application</Button>
      </div>
    </div>
  );
}
