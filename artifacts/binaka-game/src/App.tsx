import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { AppLayout } from "@/components/layout/app-layout";

import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Games from "@/pages/games";
import Slots from "@/pages/games/slots";
import Wheel from "@/pages/games/wheel";
import Scratch from "@/pages/games/scratch";
import Dice from "@/pages/games/dice";
import CoinFlip from "@/pages/games/coin-flip";
import LuckyNumber from "@/pages/games/lucky-number";
import LuckyBox from "@/pages/games/lucky-box";
import MysteryGift from "@/pages/games/mystery-gift";
import MiniJackpot from "@/pages/games/mini-jackpot";
import Crash from "@/pages/games/crash";
import Mines from "@/pages/games/mines";
import HiLo from "@/pages/games/hilo";
import Tower from "@/pages/games/tower";
import Keno from "@/pages/games/keno";
import Plinko from "@/pages/games/plinko";
import FermeMagique from "@/pages/games/ferme-magique";
import Wallet from "@/pages/wallet";
import Deposit from "@/pages/deposit";
import Withdraw from "@/pages/withdraw";
import Promotions from "@/pages/promotions";
import Account from "@/pages/account";
import AccountProfile from "@/pages/account-profile";
import AccountSecurity from "@/pages/account-security";
import AccountSettings from "@/pages/account-settings";
import Referral from "@/pages/referral";
import Notifications from "@/pages/notifications";
import Vip from "@/pages/vip";
import Support from "@/pages/support";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function MainRoutes() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/games" component={Games} />
        <Route path="/games/slots" component={Slots} />
        <Route path="/games/wheel" component={Wheel} />
        <Route path="/games/scratch" component={Scratch} />
        <Route path="/games/dice" component={Dice} />
        <Route path="/games/coin-flip" component={CoinFlip} />
        <Route path="/games/lucky-number" component={LuckyNumber} />
        <Route path="/games/lucky-box" component={LuckyBox} />
        <Route path="/games/mystery-gift" component={MysteryGift} />
        <Route path="/games/mini-jackpot" component={MiniJackpot} />
        <Route path="/games/crash" component={Crash} />
        <Route path="/games/mines" component={Mines} />
        <Route path="/games/hilo" component={HiLo} />
        <Route path="/games/tower" component={Tower} />
        <Route path="/games/keno" component={Keno} />
        <Route path="/games/plinko" component={Plinko} />
        <Route path="/games/ferme-magique" component={FermeMagique} />
        <Route path="/wallet" component={Wallet} />
        <Route path="/promotions" component={Promotions} />
        <Route path="/account" component={Account} />
        <Route path="/account/profile" component={AccountProfile} />
        <Route path="/account/security" component={AccountSecurity} />
        <Route path="/account/settings" component={AccountSettings} />
        <Route path="/referral" component={Referral} />
        <Route path="/notifications" component={Notifications} />
        <Route path="/vip" component={Vip} />
        <Route path="/support" component={Support} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/deposit" component={Deposit} />
      <Route path="/withdraw" component={Withdraw} />
      <Route component={MainRoutes} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
