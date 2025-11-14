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
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft, Shield, Store } from "lucide-react";

interface WalletData {
  balance: number;
  yieldOptIn: boolean;
  yieldBalance: number;
  currentYield: number;
}

interface MerchantTransaction {
  id: string;
  merchantName: string;
  amount: number;
  transactionDate: string;
  settlementDays: number;
  propertyYieldShare: number;
  tenantYieldShare: number;
  platformYieldShare: number;
  status: string;
}

export default function TenantWallet() {
  const { toast } = useToast();
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [amount, setAmount] = useState("");

  const { data: wallet, isLoading } = useQuery<WalletData>({
    queryKey: ["/api/tenant/wallet"],
  });

  const { data: merchantTransactionsData } = useQuery<{ transactions: MerchantTransaction[] }>({
    queryKey: ["/api/tenant/merchant-transactions"],
  });

  const recentMerchantTxs = merchantTransactionsData?.transactions.slice(0, 5) || [];

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
      <div className="space-y-6" data-testid="page-tenant-wallet">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" style={{ backgroundColor: "hsl(var(--tenant-muted))" }} />
        <div className="h-64 bg-muted animate-pulse rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-muted))" }} />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="page-tenant-wallet">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ color: "hsl(var(--tenant-foreground))" }}>
          Wallet
        </h1>
        <p className="text-base" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
          Manage your balance and transactions
        </p>
      </div>

      {/* Balance Card - PayPal Style */}
      <Card 
        className="border overflow-hidden"
        style={{
          backgroundColor: "hsl(var(--tenant-card))",
          borderColor: "hsl(var(--tenant-card-border))",
          borderRadius: "var(--tenant-radius-lg)",
          boxShadow: "var(--tenant-shadow-md)",
        }}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-5 h-5" style={{ color: "hsl(var(--tenant-primary))" }} />
                <p className="text-sm font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>
                  Available Balance
                </p>
              </div>
              <h2 className="text-4xl font-bold tabular-nums mb-1" data-testid="wallet-balance" style={{ color: "hsl(var(--tenant-foreground))" }}>
                ${wallet?.balance.toLocaleString() || "0"}
              </h2>
              {wallet?.yieldOptIn && (
                <p className="text-sm" style={{ color: "hsl(var(--tenant-success))" }}>
                  Earning {wallet.currentYield}% APY
                </p>
              )}
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              size="lg"
              variant="outline"
              className="flex-1 h-11 font-semibold rounded-lg border-2"
              onClick={() => setDepositOpen(true)}
              data-testid="button-deposit"
              style={{
                borderColor: "hsl(var(--tenant-primary))",
                color: "hsl(var(--tenant-primary))",
              }}
            >
              <ArrowDownLeft className="mr-2 h-4 w-4" />
              Add Funds
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="flex-1 h-11 font-semibold rounded-lg border-2"
              onClick={() => setWithdrawOpen(true)}
              data-testid="button-withdraw"
              style={{
                borderColor: "hsl(var(--tenant-card-border))",
                color: "hsl(var(--tenant-foreground))",
              }}
            >
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Yield Earnings */}
      {wallet?.yieldOptIn && (
        <Card 
          className="border overflow-hidden"
          style={{
            backgroundColor: "hsl(var(--tenant-card))",
            borderColor: "hsl(var(--tenant-card-border))",
            borderRadius: "var(--tenant-radius-lg)",
            boxShadow: "var(--tenant-shadow-md)",
          }}
        >
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" style={{ color: "hsl(var(--tenant-success))" }} />
              <CardTitle className="text-lg" style={{ color: "hsl(var(--tenant-foreground))" }}>
                Yield Earnings
              </CardTitle>
            </div>
            <CardDescription className="text-sm" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
              Powered by Naltos Reserve
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
                <p className="text-xs font-medium mb-1" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                  Total Earned
                </p>
                <p className="text-2xl font-bold tabular-nums" style={{ color: "hsl(var(--tenant-foreground))" }}>
                  ${wallet.yieldBalance.toFixed(2)}
                </p>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
                <p className="text-xs font-medium mb-1" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                  Current APY
                </p>
                <p className="text-2xl font-bold tabular-nums" style={{ color: "hsl(var(--tenant-success))" }}>
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
          boxShadow: "var(--tenant-shadow-md)",
        }}
      >
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" style={{ color: "hsl(var(--tenant-muted-foreground))" }} />
            <CardTitle className="text-lg" style={{ color: "hsl(var(--tenant-foreground))" }}>
              Earn Interest
            </CardTitle>
          </div>
          <CardDescription className="text-sm" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
            Turn on to earn {wallet?.currentYield || "5.2"}% APY on your balance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
            <div className="flex-1">
              <Label htmlFor="yield-toggle" className="text-sm font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>
                Interest Earnings
              </Label>
              <p className="text-xs mt-0.5" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                Earn automatically on your available balance
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

      {/* Merchant Purchase Yield */}
      {recentMerchantTxs.length > 0 && (
        <Card 
          className="border overflow-hidden"
          style={{
            backgroundColor: "hsl(var(--tenant-card))",
            borderColor: "hsl(var(--tenant-card-border))",
            borderRadius: "var(--tenant-radius-lg)",
            boxShadow: "var(--tenant-shadow-md)",
          }}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5" style={{ color: "hsl(var(--tenant-primary))" }} />
                <CardTitle className="text-lg" style={{ color: "hsl(var(--tenant-foreground))" }}>
                  Purchase Yield
                </CardTitle>
              </div>
              <p className="text-sm font-bold tabular-nums" style={{ color: "hsl(var(--tenant-success))" }}>
                +${recentMerchantTxs.reduce((sum, tx) => sum + tx.tenantYieldShare, 0).toFixed(2)}
              </p>
            </div>
            <CardDescription className="text-sm" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
              Earned from merchant settlement float
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y" style={{ borderColor: "hsl(var(--tenant-card-border))" }}>
              {recentMerchantTxs.map((tx) => (
                <div key={tx.id} className="p-4" data-testid={`merchant-tx-${tx.id}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-sm" style={{ color: "hsl(var(--tenant-foreground))" }}>
                        {tx.merchantName}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                        {new Date(tx.transactionDate).toLocaleDateString()} • {tx.settlementDays} day settlement
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold tabular-nums text-sm" style={{ color: "hsl(var(--tenant-foreground))" }}>
                        ${tx.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 rounded" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
                      <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                        Property (80%)
                      </p>
                      <p className="text-xs font-semibold tabular-nums mt-0.5" style={{ color: "hsl(var(--tenant-foreground))" }}>
                        ${tx.propertyYieldShare.toFixed(4)}
                      </p>
                    </div>
                    <div className="p-2 rounded" style={{ backgroundColor: "hsl(var(--tenant-success) / 0.1)" }}>
                      <p className="text-xs font-medium" style={{ color: "hsl(var(--tenant-success))" }}>
                        You (12.5%)
                      </p>
                      <p className="text-xs font-bold tabular-nums mt-0.5" style={{ color: "hsl(var(--tenant-success))" }}>
                        ${tx.tenantYieldShare.toFixed(4)}
                      </p>
                    </div>
                    <div className="p-2 rounded" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
                      <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                        Platform (7.5%)
                      </p>
                      <p className="text-xs font-semibold tabular-nums mt-0.5" style={{ color: "hsl(var(--tenant-foreground))" }}>
                        ${tx.platformYieldShare.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deposit Dialog */}
      <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Funds</DialogTitle>
            <DialogDescription>
              Transfer money to your Naltos wallet
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="deposit-amount" className="text-sm font-medium mb-2">Amount</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>$</span>
                <Input
                  id="deposit-amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8 h-12 text-lg font-semibold"
                  data-testid="input-deposit-amount"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDepositOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeposit} 
              disabled={depositMutation.isPending || !amount}
              style={{
                backgroundColor: "hsl(var(--tenant-primary))",
                color: "hsl(var(--tenant-primary-foreground))",
              }}
              data-testid="button-confirm-deposit"
            >
              {depositMutation.isPending ? "Processing..." : "Add Funds"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
            <DialogDescription>
              Transfer money to your bank account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="withdraw-amount" className="text-sm font-medium mb-2">Amount</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>$</span>
                <Input
                  id="withdraw-amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8 h-12 text-lg font-semibold"
                  max={wallet?.balance}
                  data-testid="input-withdraw-amount"
                />
              </div>
              <p className="text-xs mt-2" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                Available: ${wallet?.balance.toLocaleString() || "0"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWithdrawOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleWithdraw} 
              disabled={withdrawMutation.isPending || !amount}
              style={{
                backgroundColor: "hsl(var(--tenant-primary))",
                color: "hsl(var(--tenant-primary-foreground))",
              }}
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
