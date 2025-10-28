import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { TrendingUp, Calendar, DollarSign, Shield, AlertCircle } from "lucide-react";
import type { TreasuryProduct, TreasurySubscription } from "@shared/schema";

interface TreasuryProductWithSubscription extends TreasuryProduct {
  subscription?: TreasurySubscription;
}

export default function Treasury() {
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<TreasuryProductWithSubscription | null>(null);
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [amount, setAmount] = useState("");

  const { data: products, isLoading } = useQuery<TreasuryProductWithSubscription[]>({
    queryKey: ["/api/treasury/products"],
  });

  const subscribeMutation = useMutation({
    mutationFn: (data: { productId: string; amount: number }) =>
      apiRequest("POST", "/api/treasury/subscribe", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/treasury/products"] });
      setSubscribeOpen(false);
      setAmount("");
      toast({
        title: "Subscription Successful",
        description: "Funds have been allocated to the treasury product.",
      });
    },
  });

  const redeemMutation = useMutation({
    mutationFn: (data: { subscriptionId: string; amount: number }) =>
      apiRequest("POST", "/api/treasury/redeem", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/treasury/products"] });
      setRedeemOpen(false);
      setAmount("");
      toast({
        title: "Redemption Successful",
        description: "Funds will be available in 1-2 business days.",
      });
    },
  });

  const toggleAutoRollMutation = useMutation({
    mutationFn: (data: { subscriptionId: string; autoRoll: boolean }) =>
      apiRequest("POST", "/api/treasury/autoroll", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/treasury/products"] });
      toast({
        title: "Auto-Roll Updated",
        description: "Your preference has been saved.",
      });
    },
  });

  const handleSubscribe = (product: TreasuryProductWithSubscription) => {
    setSelectedProduct(product);
    setSubscribeOpen(true);
  };

  const handleRedeem = (product: TreasuryProductWithSubscription) => {
    setSelectedProduct(product);
    setRedeemOpen(true);
  };

  const getProductBadges = (productType: string) => {
    const badges: Record<string, string[]> = {
      NRF: ["Capital preservation", "Short duration"],
      NRK: ["Tokenized T-Bills", "30-day rolling"],
      NRC: ["Delta-hedged", "Enhanced yield", "Accredited only"],
    };
    return badges[productType] || [];
  };

  return (
    <div className="space-y-8" data-testid="page-treasury">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight mb-2">Treasury</h1>
        <p className="text-muted-foreground">
          Naltos Reserve products for optimized cash management
        </p>
        <div className="mt-4 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          <AlertCircle className="inline w-4 h-4 mr-2" />
          Demo only. No real custody. Not investment advice.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-8 bg-muted rounded w-1/2 mb-4" />
                <div className="h-4 bg-muted rounded w-full" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <div key={j} className="h-10 bg-muted rounded" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        ) : products && products.length > 0 ? (
          products.map((product) => (
            <Card key={product.id} className="hover-elevate" data-testid={`card-product-${product.productType}`}>
              <CardHeader>
                <CardTitle className="text-2xl">{product.name}</CardTitle>
                <CardDescription>{product.description}</CardDescription>
                <div className="flex flex-wrap gap-2 mt-4">
                  {getProductBadges(product.productType).map((badge) => (
                    <Badge key={badge} variant="secondary" className="text-xs">
                      {badge}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                      AUM
                    </div>
                    <div className="text-xl font-mono font-semibold">
                      ${product.subscription?.balance ? 
                        (parseFloat(product.subscription.balance) / 1000000).toFixed(2) : 
                        "0.00"}M
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                      Current Yield
                    </div>
                    <div className="text-xl font-mono font-semibold text-green-600">
                      {product.currentYield}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                      WAM (Days)
                    </div>
                    <div className="text-xl font-mono font-semibold">
                      {product.wam}
                    </div>
                  </div>
                  {product.ocRatio && (
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                        OC Ratio
                      </div>
                      <div className="text-xl font-mono font-semibold">
                        {product.ocRatio}x
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                      Duration (Days)
                    </div>
                    <div className="text-xl font-mono font-semibold">
                      {product.targetDuration}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                      Fees (Mgmt/Platform)
                    </div>
                    <div className="text-sm font-mono font-semibold">
                      {product.managementFee}% / {product.platformFee}%
                    </div>
                  </div>
                </div>

                {product.subscription && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <Label htmlFor={`autoroll-${product.id}`} className="text-sm">
                      Auto-Roll
                    </Label>
                    <Switch
                      id={`autoroll-${product.id}`}
                      checked={product.subscription.autoRoll}
                      onCheckedChange={(checked) => 
                        toggleAutoRollMutation.mutate({
                          subscriptionId: product.subscription!.id,
                          autoRoll: checked,
                        })
                      }
                      data-testid={`switch-autoroll-${product.productType}`}
                    />
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  onClick={() => handleSubscribe(product)}
                  className="flex-1"
                  data-testid={`button-subscribe-${product.productType}`}
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Subscribe
                </Button>
                {product.subscription && (
                  <Button
                    onClick={() => handleRedeem(product)}
                    variant="outline"
                    className="flex-1"
                    data-testid={`button-redeem-${product.productType}`}
                  >
                    Redeem
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-3 text-center py-12 text-muted-foreground">
            No treasury products available
          </div>
        )}
      </div>

      <Dialog open={subscribeOpen} onOpenChange={setSubscribeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subscribe to {selectedProduct?.name}</DialogTitle>
            <DialogDescription>
              Enter the amount you'd like to allocate to this treasury product.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subscribe-amount">Amount (USD)</Label>
              <Input
                id="subscribe-amount"
                type="number"
                placeholder="100000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                data-testid="input-subscribe-amount"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubscribeOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedProduct && amount) {
                  subscribeMutation.mutate({
                    productId: selectedProduct.id,
                    amount: parseFloat(amount),
                  });
                }
              }}
              disabled={!amount || subscribeMutation.isPending}
              data-testid="button-confirm-subscribe"
            >
              Confirm Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={redeemOpen} onOpenChange={setRedeemOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redeem from {selectedProduct?.name}</DialogTitle>
            <DialogDescription>
              Enter the amount you'd like to redeem. Funds will be available in 1-2 business days.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="redeem-amount">Amount (USD)</Label>
              <Input
                id="redeem-amount"
                type="number"
                placeholder="50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                data-testid="input-redeem-amount"
              />
              {selectedProduct?.subscription && (
                <p className="text-xs text-muted-foreground">
                  Available balance: ${parseFloat(selectedProduct.subscription.balance).toLocaleString()}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRedeemOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedProduct?.subscription && amount) {
                  redeemMutation.mutate({
                    subscriptionId: selectedProduct.subscription.id,
                    amount: parseFloat(amount),
                  });
                }
              }}
              disabled={!amount || redeemMutation.isPending}
              data-testid="button-confirm-redeem"
            >
              Confirm Redemption
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
