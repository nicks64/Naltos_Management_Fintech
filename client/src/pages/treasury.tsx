import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  TrendingUp,
  Calendar,
  DollarSign,
  Shield,
  AlertCircle,
  ArrowRight,
  Clock,
  Settings,
  Percent,
  Landmark,
  Activity,
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";
import type { TreasuryProduct, TreasurySubscription } from "@shared/schema";

interface TreasuryProductWithSubscription extends TreasuryProduct {
  subscription?: TreasurySubscription;
}

const mockFloatTimeline = [
  { day: "Mon", rent: 120000, vendor: 85000, merchant: 15000 },
  { day: "Tue", rent: 95000, vendor: 88000, merchant: 22000 },
  { day: "Wed", rent: 82000, vendor: 90000, merchant: 18000 },
  { day: "Thu", rent: 110000, vendor: 87000, merchant: 25000 },
  { day: "Fri", rent: 140000, vendor: 92000, merchant: 30000 },
  { day: "Sat", rent: 75000, vendor: 85000, merchant: 12000 },
  { day: "Sun", rent: 60000, vendor: 85000, merchant: 8000 },
];

const mockYieldRouting = [
  { source: "Rent Float (Bucket B)", duration: "5-15d", apy: "5.0%", deployed: "$892K", yield: "$1,233/mo", product: "T-Bills" },
  { source: "Vendor Float (Bucket C)", duration: "30-90d", apy: "5.2%", deployed: "$1.4M", yield: "$6,067/mo", product: "T-Bills + MMF" },
  { source: "Merchant Float (Bucket D)", duration: "1-3d", apy: "4.8%", deployed: "$210K", yield: "$82/mo", product: "Money Market" },
  { source: "Immediate Reserve (Bucket A)", duration: "0-3d", apy: "4.5%", deployed: "$350K", yield: "$131/mo", product: "Cash + MMF" },
];

const mockYieldSharing = [
  { recipient: "Property Owners", pct: "85%", amount: "$6,386/mo", desc: "Primary yield recipient from all float buckets" },
  { recipient: "Tenants (Cashback)", pct: "5%", amount: "$376/mo", desc: "Distributed via streak rewards and rent-to-own escrow" },
  { recipient: "Vendors (Yield Share)", pct: "3%", amount: "$225/mo", desc: "Net30-90 vendors earn yield on payment float" },
  { recipient: "Naltos Platform", pct: "7%", amount: "$526/mo", desc: "Platform fee for treasury management and infrastructure" },
];

export default function Treasury() {
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<TreasuryProductWithSubscription | null>(null);
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [activeTab, setActiveTab] = useState("products");

  const { data: products, isLoading } = useQuery<TreasuryProductWithSubscription[]>({
    queryKey: ["/api/treasury/products"],
  });

  const subscribeMutation = useMutation({
    mutationFn: (data: { productId: string; amount: number }) => apiRequest("POST", "/api/treasury/subscribe", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/treasury/products"] });
      setSubscribeOpen(false);
      setAmount("");
      toast({ title: "Subscription Successful", description: "Funds have been allocated to the treasury product." });
    },
  });

  const redeemMutation = useMutation({
    mutationFn: (data: { subscriptionId: string; amount: number }) => apiRequest("POST", "/api/treasury/redeem", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/treasury/products"] });
      setRedeemOpen(false);
      setAmount("");
      toast({ title: "Redemption Successful", description: "Funds will be available in 1-2 business days." });
    },
  });

  const toggleAutoRollMutation = useMutation({
    mutationFn: (data: { subscriptionId: string; autoRoll: boolean }) => apiRequest("POST", "/api/treasury/autoroll", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/treasury/products"] });
      toast({ title: "Auto-Roll Updated", description: "Your preference has been saved." });
    },
  });

  const getProductBadges = (productType: string) => {
    const badges: Record<string, string[]> = {
      NRF: ["Treasury Bills", "USD returns", "5-15d float"],
      NRK: ["Money Market", "USD returns", "30-90d float"],
      NRC: ["Enhanced Credit", "USD returns", "Qualified investors"],
    };
    return badges[productType] || [];
  };

  return (
    <div className="space-y-6" data-testid="page-treasury">
      <div className="space-y-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight mb-2">Treasury & Float Management</h1>
          <p className="text-muted-foreground">
            Deploy idle USD into treasury products — manage float routing and yield distribution
          </p>
        </div>

        <div className="p-4 bg-primary/5 border-2 border-primary/10 rounded-lg text-sm">
          <div className="flex items-start gap-2">
            <DollarSign className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold">USD-First Treasury Strategy</p>
              <p className="text-muted-foreground">
                These products generate yield on <strong>idle USD</strong> during float periods. Modern digital payment infrastructure is used only as backend rails — <strong>all returns are in USD</strong>.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          <AlertCircle className="inline w-4 h-4 mr-2" />
          Demo only. No real custody. Not investment advice.
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList data-testid="tabs-treasury">
          <TabsTrigger value="products" data-testid="tab-products">Treasury Products</TabsTrigger>
          <TabsTrigger value="float" data-testid="tab-float">Float Management</TabsTrigger>
          <TabsTrigger value="yield" data-testid="tab-yield">Yield Routing</TabsTrigger>
          <TabsTrigger value="sharing" data-testid="tab-sharing">Yield Sharing</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader><div className="h-8 bg-muted rounded w-1/2 mb-4" /><div className="h-4 bg-muted rounded w-full" /></CardHeader>
                  <CardContent>{Array.from({ length: 6 }).map((_, j) => <div key={j} className="h-10 bg-muted rounded mb-2" />)}</CardContent>
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
                        <Badge key={badge} variant="secondary" className="text-xs">{badge}</Badge>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">USD Deployed</div>
                        <div className="text-xl font-mono font-semibold">
                          ${product.subscription?.balance ? (parseFloat(product.subscription.balance) / 1000000).toFixed(2) : "0.00"}M
                        </div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">USD Yield APY</div>
                        <div className="text-xl font-mono font-semibold text-green-600">{product.currentYield}%</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">WAM (Days)</div>
                        <div className="text-xl font-mono font-semibold">{product.wam}</div>
                      </div>
                      {product.ocRatio && (
                        <div>
                          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">OC Ratio</div>
                          <div className="text-xl font-mono font-semibold">{product.ocRatio}x</div>
                        </div>
                      )}
                      <div>
                        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Duration</div>
                        <div className="text-xl font-mono font-semibold">{product.targetDuration}d</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Fees</div>
                        <div className="text-sm font-mono font-semibold">{product.managementFee}% / {product.platformFee}%</div>
                      </div>
                    </div>

                    {product.subscription && (
                      <div className="flex items-center justify-between pt-4 border-t">
                        <Label htmlFor={`autoroll-${product.id}`} className="text-sm">Auto-Roll</Label>
                        <Switch
                          id={`autoroll-${product.id}`}
                          checked={product.subscription.autoRoll}
                          onCheckedChange={(checked) => toggleAutoRollMutation.mutate({ subscriptionId: product.subscription!.id, autoRoll: checked })}
                          data-testid={`switch-autoroll-${product.productType}`}
                        />
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button onClick={() => { setSelectedProduct(product); setSubscribeOpen(true); }} className="flex-1" data-testid={`button-subscribe-${product.productType}`}>
                      <DollarSign className="mr-2 h-4 w-4" />Subscribe
                    </Button>
                    {product.subscription && (
                      <Button onClick={() => { setSelectedProduct(product); setRedeemOpen(true); }} variant="outline" className="flex-1" data-testid={`button-redeem-${product.productType}`}>
                        Redeem
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 text-muted-foreground">No treasury products available</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="float" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Float Volume by Source (7-Day Rolling)</CardTitle>
              <CardDescription>Daily USD flow through rent, vendor, and merchant float buckets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockFloatTimeline}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, ""]} />
                    <Area type="monotone" dataKey="rent" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Rent Float" />
                    <Area type="monotone" dataKey="vendor" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} name="Vendor Float" />
                    <Area type="monotone" dataKey="merchant" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Merchant Float" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              { label: "Total Float AUM", value: "$2.85M", change: "+4.2%", icon: Landmark },
              { label: "Avg Float Duration", value: "24.5 days", change: "+2.1d", icon: Clock },
              { label: "Utilization Rate", value: "94.2%", change: "+1.8%", icon: Activity },
              { label: "Monthly Yield (All)", value: "$7,513", change: "+$340", icon: TrendingUp },
            ].map((m) => (
              <Card key={m.label} className="hover-elevate">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2 gap-1">
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <m.icon className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold font-mono">{m.value}</p>
                  <p className="text-xs text-green-600 mt-1">{m.change}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="yield" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Yield Routing Configuration</CardTitle>
              <CardDescription>How each float bucket is deployed into treasury products for yield generation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockYieldRouting.map((route, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border rounded-lg" data-testid={`yield-route-${i}`}>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{route.source}</p>
                      <p className="text-xs text-muted-foreground">{route.duration} duration</p>
                    </div>
                    <div className="text-center">
                      <ArrowRight className="w-4 h-4 text-muted-foreground mx-auto" />
                    </div>
                    <div className="text-center">
                      <Badge variant="secondary">{route.product}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">{route.apy} APY</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-sm">{route.deployed}</p>
                      <p className="text-xs text-green-600">{route.yield}</p>
                    </div>
                    <Button size="icon" variant="ghost" data-testid={`button-configure-route-${i}`}>
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sharing" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Programmable Yield Sharing</CardTitle>
              <CardDescription>Configurable distribution of treasury yield across stakeholders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockYieldSharing.map((share, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border rounded-lg" data-testid={`yield-share-${i}`}>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{share.recipient}</p>
                      <p className="text-xs text-muted-foreground">{share.desc}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold font-mono">{share.pct}</p>
                      <p className="text-xs text-green-600 font-mono">{share.amount}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-muted">
                <div className="flex items-start gap-2">
                  <Percent className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">Total Monthly Yield</p>
                    <p className="text-sm text-muted-foreground">
                      <strong>$7,513/mo</strong> distributed across all stakeholders from $2.85M total float AUM at blended 5.0% APY.
                      Distributions are automated via internal ledger — no manual reconciliation needed.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={subscribeOpen} onOpenChange={setSubscribeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subscribe to {selectedProduct?.name}</DialogTitle>
            <DialogDescription>Enter the amount you'd like to allocate to this treasury product.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subscribe-amount">Amount (USD)</Label>
              <Input id="subscribe-amount" type="number" placeholder="100000" value={amount} onChange={(e) => setAmount(e.target.value)} data-testid="input-subscribe-amount" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubscribeOpen(false)}>Cancel</Button>
            <Button
              onClick={() => { if (selectedProduct && amount) subscribeMutation.mutate({ productId: selectedProduct.id, amount: parseFloat(amount) }); }}
              disabled={!amount || subscribeMutation.isPending}
              data-testid="button-confirm-subscribe"
            >Confirm Subscription</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={redeemOpen} onOpenChange={setRedeemOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redeem from {selectedProduct?.name}</DialogTitle>
            <DialogDescription>Enter the amount you'd like to redeem. Funds will be available in 1-2 business days.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="redeem-amount">Amount (USD)</Label>
              <Input id="redeem-amount" type="number" placeholder="50000" value={amount} onChange={(e) => setAmount(e.target.value)} data-testid="input-redeem-amount" />
              {selectedProduct?.subscription && (
                <p className="text-xs text-muted-foreground">Available balance: ${parseFloat(selectedProduct.subscription.balance).toLocaleString()}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRedeemOpen(false)}>Cancel</Button>
            <Button
              onClick={() => { if (selectedProduct?.subscription && amount) redeemMutation.mutate({ subscriptionId: selectedProduct.subscription.id, amount: parseFloat(amount) }); }}
              disabled={!amount || redeemMutation.isPending}
              data-testid="button-confirm-redeem"
            >Confirm Redemption</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
