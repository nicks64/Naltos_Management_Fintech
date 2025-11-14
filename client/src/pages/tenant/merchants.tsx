import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Store, Clock, TrendingUp, ShoppingBag } from "lucide-react";

interface Merchant {
  id: string;
  name: string;
  category: string;
  description: string;
  settlementDays: number;
  yieldRate: number;
  active: boolean;
}

interface MerchantTransaction {
  id: string;
  merchantId: string;
  merchantName: string;
  amount: number;
  transactionDate: string;
  settlementDate: string;
  status: string;
  settlementDays: number;
  yieldGenerated: number;
  tenantYieldShare: number;
  description: string;
}

export default function TenantMerchants() {
  const { toast } = useToast();
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const { data: merchantsData, isLoading: merchantsLoading } = useQuery<{ merchants: Merchant[] }>({
    queryKey: ["/api/tenant/merchants"],
  });

  const { data: transactionsData } = useQuery<{ transactions: MerchantTransaction[] }>({
    queryKey: ["/api/tenant/merchant-transactions"],
  });

  const purchaseMutation = useMutation({
    mutationFn: (data: { merchantId: string; amount: number; description: string }) =>
      apiRequest("POST", "/api/tenant/merchant-transactions", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenant/merchant-transactions"] });
      setPurchaseOpen(false);
      setSelectedMerchant(null);
      setAmount("");
      setDescription("");
      toast({
        title: "Purchase Complete",
        description: "Your transaction is processing and will earn yield during settlement",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Unable to process transaction",
        variant: "destructive",
      });
    },
  });

  const handlePurchase = (merchant: Merchant) => {
    setSelectedMerchant(merchant);
    setPurchaseOpen(true);
  };

  const handleConfirmPurchase = () => {
    if (!selectedMerchant || !amount) return;
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      purchaseMutation.mutate({
        merchantId: selectedMerchant.id,
        amount: numAmount,
        description: description || `Purchase at ${selectedMerchant.name}`,
      });
    }
  };

  const merchants = merchantsData?.merchants || [];
  const recentTransactions = transactionsData?.transactions.slice(0, 5) || [];

  if (merchantsLoading) {
    return (
      <div className="space-y-6" data-testid="page-tenant-merchants">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" style={{ backgroundColor: "hsl(var(--tenant-muted))" }} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-muted))" }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="page-tenant-merchants">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ color: "hsl(var(--tenant-foreground))" }}>
          Merchant Network
        </h1>
        <p className="text-base" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
          Shop with NUSD and earn yield during settlement
        </p>
      </div>

      {/* Summary Card */}
      {recentTransactions.length > 0 && (
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
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-5 h-5" style={{ color: "hsl(var(--tenant-success))" }} />
                  <p className="text-sm font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>
                    Yield Earned from Purchases
                  </p>
                </div>
                <h2 className="text-3xl font-bold tabular-nums" data-testid="total-yield" style={{ color: "hsl(var(--tenant-foreground))" }}>
                  ${recentTransactions.reduce((sum, tx) => sum + tx.tenantYieldShare, 0).toFixed(2)}
                </h2>
                <p className="text-sm mt-1" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                  From {recentTransactions.length} recent transactions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Merchant Directory */}
      <div>
        <h2 className="text-xl font-semibold mb-4" style={{ color: "hsl(var(--tenant-foreground))" }}>
          Available Merchants
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {merchants.map((merchant) => (
            <Card 
              key={merchant.id}
              className="border overflow-hidden hover-elevate"
              style={{
                backgroundColor: "hsl(var(--tenant-card))",
                borderColor: "hsl(var(--tenant-card-border))",
                borderRadius: "var(--tenant-radius-lg)",
              }}
              data-testid={`merchant-card-${merchant.id}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Store className="w-5 h-5" style={{ color: "hsl(var(--tenant-primary))" }} />
                      <Badge variant="secondary" className="text-xs" data-testid={`badge-category-${merchant.id}`}>
                        {merchant.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg" style={{ color: "hsl(var(--tenant-foreground))" }}>
                      {merchant.name}
                    </CardTitle>
                  </div>
                </div>
                {merchant.description && (
                  <CardDescription className="text-sm mt-2" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                    {merchant.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
                    <div className="flex items-center gap-1 mb-1">
                      <Clock className="w-3.5 h-3.5" style={{ color: "hsl(var(--tenant-muted-foreground))" }} />
                      <p className="text-xs font-medium" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                        Settlement
                      </p>
                    </div>
                    <p className="text-sm font-bold" data-testid={`settlement-days-${merchant.id}`} style={{ color: "hsl(var(--tenant-foreground))" }}>
                      {merchant.settlementDays} days
                    </p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
                    <div className="flex items-center gap-1 mb-1">
                      <TrendingUp className="w-3.5 h-3.5" style={{ color: "hsl(var(--tenant-success))" }} />
                      <p className="text-xs font-medium" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                        Yield Rate
                      </p>
                    </div>
                    <p className="text-sm font-bold" data-testid={`yield-rate-${merchant.id}`} style={{ color: "hsl(var(--tenant-foreground))" }}>
                      {merchant.yieldRate.toFixed(2)}% APY
                    </p>
                  </div>
                </div>
                <Button
                  size="lg"
                  className="w-full h-11 font-semibold rounded-lg"
                  onClick={() => handlePurchase(merchant)}
                  data-testid={`button-purchase-${merchant.id}`}
                  style={{
                    backgroundColor: "hsl(var(--tenant-primary))",
                    color: "hsl(var(--tenant-primary-foreground))",
                  }}
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Purchase
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      {recentTransactions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4" style={{ color: "hsl(var(--tenant-foreground))" }}>
            Recent Transactions
          </h2>
          <Card 
            className="border overflow-hidden"
            style={{
              backgroundColor: "hsl(var(--tenant-card))",
              borderColor: "hsl(var(--tenant-card-border))",
              borderRadius: "var(--tenant-radius-lg)",
            }}
          >
            <CardContent className="p-0">
              <div className="divide-y" style={{ borderColor: "hsl(var(--tenant-card-border))" }}>
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="p-4 flex items-center justify-between" data-testid={`transaction-${tx.id}`}>
                    <div className="flex-1">
                      <p className="font-semibold text-sm" style={{ color: "hsl(var(--tenant-foreground))" }}>
                        {tx.merchantName}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                        {new Date(tx.transactionDate).toLocaleDateString()} • {tx.settlementDays} day settlement
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold tabular-nums" style={{ color: "hsl(var(--tenant-foreground))" }}>
                        ${tx.amount.toFixed(2)}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "hsl(var(--tenant-success))" }}>
                        +${tx.tenantYieldShare.toFixed(2)} yield
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Purchase Dialog */}
      <Dialog open={purchaseOpen} onOpenChange={setPurchaseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make Purchase</DialogTitle>
            <DialogDescription>
              {selectedMerchant && (
                <>
                  Purchase from {selectedMerchant.name} using NUSD and earn {selectedMerchant.yieldRate.toFixed(2)}% APY during {selectedMerchant.settlementDays}-day settlement
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="purchase-amount" className="text-sm font-medium mb-2">Amount</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>$</span>
                <Input
                  id="purchase-amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8 h-12 text-lg font-semibold"
                  data-testid="input-purchase-amount"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="purchase-description" className="text-sm font-medium mb-2">Description (Optional)</Label>
              <Textarea
                id="purchase-description"
                placeholder="What are you buying?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="resize-none"
                rows={2}
                data-testid="input-purchase-description"
              />
            </div>
            {selectedMerchant && amount && parseFloat(amount) > 0 && (
              <div className="p-4 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Purchase Amount</span>
                  <span className="font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>
                    ${parseFloat(amount).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Settlement Period</span>
                  <span className="font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>
                    {selectedMerchant.settlementDays} days
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm pt-2 border-t" style={{ borderColor: "hsl(var(--tenant-card-border))" }}>
                  <span className="font-semibold" style={{ color: "hsl(var(--tenant-success))" }}>Est. Yield Earned</span>
                  <span className="font-bold" style={{ color: "hsl(var(--tenant-success))" }}>
                    ${((parseFloat(amount) * (selectedMerchant.settlementDays / 365) * (selectedMerchant.yieldRate / 100)) * 0.0125).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPurchaseOpen(false)} data-testid="button-cancel-purchase">
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmPurchase} 
              disabled={purchaseMutation.isPending || !amount || parseFloat(amount) <= 0}
              style={{
                backgroundColor: "hsl(var(--tenant-primary))",
                color: "hsl(var(--tenant-primary-foreground))",
              }}
              data-testid="button-confirm-purchase"
            >
              {purchaseMutation.isPending ? "Processing..." : "Confirm Purchase"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
