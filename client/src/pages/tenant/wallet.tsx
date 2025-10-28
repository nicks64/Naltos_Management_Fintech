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
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft, Shield } from "lucide-react";

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

  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="page-tenant-wallet">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="page-tenant-wallet">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight mb-2">Wallet</h1>
        <p className="text-muted-foreground">
          Manage your balance and earn yield
        </p>
      </div>

      {/* Balance Card */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm text-muted-foreground">Available Balance</CardTitle>
                <p className="text-4xl font-mono font-semibold mt-1" data-testid="wallet-balance">
                  ${wallet?.balance.toLocaleString() || "0"}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button 
              className="flex-1" 
              variant="outline"
              onClick={() => setDepositOpen(true)}
              data-testid="button-deposit"
            >
              <ArrowDownLeft className="mr-2 h-4 w-4" />
              Deposit
            </Button>
            <Button 
              className="flex-1" 
              variant="outline"
              onClick={() => setWithdrawOpen(true)}
              data-testid="button-withdraw"
            >
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Yield Account Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <div>
                <CardTitle>Yield Account</CardTitle>
                <CardDescription>
                  Earn {wallet?.currentYield}% APY through Naltos Reserve
                </CardDescription>
              </div>
            </div>
            <Switch 
              checked={wallet?.yieldOptIn}
              onCheckedChange={(checked) => toggleYieldMutation.mutate(checked)}
              disabled={toggleYieldMutation.isPending}
              data-testid="switch-yield-opt-in"
            />
          </div>
        </CardHeader>
        {wallet?.yieldOptIn && (
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <div>
                  <p className="text-sm text-muted-foreground">Yield Balance</p>
                  <p className="text-2xl font-mono font-semibold" data-testid="yield-balance">
                    ${wallet.yieldBalance.toLocaleString()}
                  </p>
                </div>
                <Badge variant="secondary" className="text-lg">
                  {wallet.currentYield}% APY
                </Badge>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <Shield className="w-5 h-5 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-primary">FDIC Protected</p>
                  <p className="text-muted-foreground mt-1">
                    Your deposits are invested in U.S. Treasury-backed instruments through Naltos Reserve Fund (NRF)
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Deposit Dialog */}
      <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deposit Funds</DialogTitle>
            <DialogDescription>
              Add funds to your Naltos wallet
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="deposit-amount">Amount</Label>
              <Input
                id="deposit-amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                data-testid="input-deposit-amount"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDepositOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const amountNum = parseFloat(amount);
                if (amountNum > 0) {
                  depositMutation.mutate({ amount: amountNum });
                }
              }}
              disabled={!amount || depositMutation.isPending}
              data-testid="button-confirm-deposit"
            >
              Confirm Deposit
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
              Transfer funds to your linked bank account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="withdraw-amount">Amount</Label>
              <Input
                id="withdraw-amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                data-testid="input-withdraw-amount"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Available: ${wallet?.balance.toLocaleString()}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWithdrawOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const amountNum = parseFloat(amount);
                if (amountNum > 0 && wallet && amountNum <= wallet.balance) {
                  withdrawMutation.mutate({ amount: amountNum });
                }
              }}
              disabled={!amount || withdrawMutation.isPending}
              data-testid="button-confirm-withdraw"
            >
              Confirm Withdrawal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
