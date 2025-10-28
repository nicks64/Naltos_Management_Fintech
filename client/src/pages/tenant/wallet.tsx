import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft, Shield, Sparkles } from "lucide-react";

interface WalletData {
  balance: number;
  yieldOptIn: boolean;
  yieldBalance: number;
  currentYield: number;
}

export default function TenantWallet() {
  const { toast } = useToast();
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [amount, setAmount] = useState("");

  const { data: wallet, isLoading } = useQuery<WalletData>({
    queryKey: ["/api/tenant/wallet"],
  });

  const toggleYieldMutation = useMutation({
    mutationFn: (optIn: boolean) => apiRequest("POST", "/api/tenant/wallet/yield-opt-in", { optIn }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenant/wallet"] });
      toast({
        title: "Yield Settings Updated",
        description: wallet?.yieldOptIn 
          ? "You've opted out of yield earnings" 
          : "Your balance will now earn yield via Naltos Reserve",
      });
    },
  });

  const depositMutation = useMutation({
    mutationFn: (data: { amount: number }) => apiRequest("POST", "/api/tenant/wallet/deposit", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenant/wallet"] });
      setDepositOpen(false);
      setAmount("");
      toast({
        title: "Deposit Successful",
        description: "Funds added to your wallet",
      });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: (data: { amount: number }) => apiRequest("POST", "/api/tenant/wallet/withdraw", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenant/wallet"] });
      setWithdrawOpen(false);
      setAmount("");
      toast({
        title: "Withdrawal Initiated",
        description: "Funds will arrive in 1-2 business days",
      });
    },
  });

  const handleDeposit = () => {
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      depositMutation.mutate({ amount: numAmount });
    }
  };

  const handleWithdraw = () => {
    const numAmount = parseFloat(amount);
    if (numAmount > 0 && wallet && numAmount <= wallet.balance) {
      withdrawMutation.mutate({ amount: numAmount });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8" data-testid="page-tenant-wallet">
        <div className="h-12 w-64 bg-muted animate-pulse rounded-xl" style={{ backgroundColor: "hsl(var(--tenant-muted))" }} />
        <div className="h-80 bg-muted animate-pulse rounded-3xl" style={{ backgroundColor: "hsl(var(--tenant-muted))" }} />
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="page-tenant-wallet">
      <div>
        <h1 className="text-5xl font-bold tracking-tight mb-2" style={{ color: "hsl(var(--tenant-foreground))" }}>Wallet</h1>
        <p className="text-lg" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
          Manage your balance and grow your savings
        </p>
      </div>

      {/* Hero Balance Card with Gradient */}
      <Card 
        className="border-0 overflow-hidden"
        style={{
          background: "var(--tenant-gradient-wallet)",
          boxShadow: "var(--tenant-shadow-lg)",
          borderRadius: "var(--tenant-radius-lg)",
        }}
      >
        <CardContent className="p-8 text-white">
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="text-sm font-medium opacity-90 mb-1">AVAILABLE BALANCE</p>
              <h2 className="text-6xl font-bold tabular-nums" data-testid="wallet-balance">
                ${wallet?.balance.toLocaleString() || "0"}
              </h2>
              {wallet?.yieldOptIn && (
                <div className="flex items-center gap-2 mt-3">
                  <Sparkles className="w-4 h-4" />
                  <p className="text-sm font-medium opacity-90">
                    Earning {wallet.currentYield}% APY
                  </p>
                </div>
              )}
            </div>
            <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
              <Wallet className="w-8 h-8" />
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              size="lg"
              className="flex-1 h-14 text-base font-semibold rounded-xl bg-white text-pink-700 hover:bg-white/90 active-elevate-2"
              onClick={() => setDepositOpen(true)}
              data-testid="button-deposit"
            >
              <ArrowDownLeft className="mr-2 h-5 w-5" />
              Deposit
            </Button>
            <Button 
              size="lg"
              className="flex-1 h-14 text-base font-semibold rounded-xl bg-white text-pink-700 hover:bg-white/90 active-elevate-2"
              onClick={() => setWithdrawOpen(true)}
              data-testid="button-withdraw"
            >
              <ArrowUpRight className="mr-2 h-5 w-5" />
              Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Yield Earnings Card */}
      {wallet?.yieldOptIn && (
        <Card 
          className="border overflow-hidden"
          style={{
            backgroundColor: "hsl(var(--tenant-card))",
            borderColor: "hsl(var(--tenant-card-border))",
            borderRadius: "var(--tenant-radius-lg)",
            boxShadow: "var(--tenant-shadow)",
          }}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl" style={{ background: "var(--tenant-gradient-premium)" }}>
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl" style={{ color: "hsl(var(--tenant-foreground))" }}>
                  Yield Earnings
                </CardTitle>
                <CardDescription className="text-base" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                  Powered by Naltos Reserve
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
                <p className="text-sm font-medium mb-1" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                  Total Earned
                </p>
                <p className="text-3xl font-bold tabular-nums" style={{ color: "hsl(var(--tenant-foreground))" }}>
                  ${wallet.yieldBalance.toFixed(2)}
                </p>
              </div>
              <div className="p-5 rounded-2xl" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
                <p className="text-sm font-medium mb-1" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                  Current APY
                </p>
                <p className="text-3xl font-bold tabular-nums" style={{ color: "hsl(var(--tenant-foreground))" }}>
                  {wallet.currentYield}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Yield Settings */}
      <Card 
        className="border overflow-hidden"
        style={{
          backgroundColor: "hsl(var(--tenant-card))",
          borderColor: "hsl(var(--tenant-card-border))",
          borderRadius: "var(--tenant-radius-lg)",
          boxShadow: "var(--tenant-shadow)",
        }}
      >
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
              <Shield className="w-5 h-5" style={{ color: "hsl(var(--tenant-foreground))" }} />
            </div>
            <div>
              <CardTitle className="text-2xl" style={{ color: "hsl(var(--tenant-foreground))" }}>
                Yield Settings
              </CardTitle>
              <CardDescription className="text-base" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                Grow your balance automatically
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-5 rounded-2xl" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
            <div className="flex-1">
              <Label htmlFor="yield-toggle" className="text-base font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>
                Enable Yield Earnings
              </Label>
              <p className="text-sm mt-1" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                Earn {wallet?.currentYield || "5.2"}% APY on your balance via institutional treasury products
              </p>
            </div>
            <Switch
              id="yield-toggle"
              checked={wallet?.yieldOptIn}
              onCheckedChange={(checked) => toggleYieldMutation.mutate(checked)}
              data-testid="switch-yield-opt-in"
              className="ml-4"
            />
          </div>
        </CardContent>
      </Card>

      {/* Deposit Dialog */}
      <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Deposit Funds</DialogTitle>
            <DialogDescription className="text-base">
              Add money to your Naltos wallet
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="deposit-amount" className="text-sm font-medium mb-2">Amount</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-semibold" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>$</span>
                <Input
                  id="deposit-amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8 h-14 text-xl font-semibold rounded-xl"
                  data-testid="input-deposit-amount"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDepositOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button 
              onClick={handleDeposit} 
              disabled={depositMutation.isPending || !amount}
              className="rounded-xl"
              style={{ background: "var(--tenant-gradient-wallet)", color: "white" }}
              data-testid="button-confirm-deposit"
            >
              {depositMutation.isPending ? "Processing..." : "Deposit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Withdraw Funds</DialogTitle>
            <DialogDescription className="text-base">
              Transfer money to your bank account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="withdraw-amount" className="text-sm font-medium mb-2">Amount</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-semibold" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>$</span>
                <Input
                  id="withdraw-amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8 h-14 text-xl font-semibold rounded-xl"
                  max={wallet?.balance}
                  data-testid="input-withdraw-amount"
                />
              </div>
              <p className="text-sm mt-2" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                Available: ${wallet?.balance.toLocaleString() || "0"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWithdrawOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button 
              onClick={handleWithdraw} 
              disabled={withdrawMutation.isPending || !amount}
              className="rounded-xl"
              style={{ background: "var(--tenant-gradient-wallet)", color: "white" }}
              data-testid="button-confirm-withdraw"
            >
              {withdrawMutation.isPending ? "Processing..." : "Withdraw"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
