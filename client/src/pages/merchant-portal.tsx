import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Clock, Download, Store, Coins, PiggyBank, Info, X, ChevronDown, ChevronUp, ArrowRight, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface MerchantBalance {
  merchantId: string;
  organizationName: string;
  nusdBalance: number;
  pendingSettlement: number;
  totalReceived: number;
  totalSettled: number;
  totalYieldGenerated: number;
}

interface MerchantTransaction {
  id: string;
  merchantId: string;
  tenantId: string;
  organizationId: string;
  amount: string;
  transactionDate: string;
  settlementDate: string | null;
  status: "pending" | "settled";
  settledAt: string | null;
  settlementDays: number | null;
  yieldRate: string | null;
  yieldGenerated: string | null;
  propertyYieldShare: string | null;
  tenantYieldShare: string | null;
  platformYieldShare: string | null;
  description: string | null;
  merchantName: string;
}

interface StablecoinAllocation {
  id: string;
  merchantBalanceId: string;
  coin: "USDC" | "USDT" | "DAI";
  allocatedAmount: string;
  nusdEquivalent: string;
  lastUpdated: string;
}

interface TreasuryAllocation {
  id: string;
  merchantBalanceId: string;
  treasuryProductId: string;
  coin: "USDC" | "USDT" | "DAI";
  allocatedAmount: string;
  currentYield: string;
  yieldAccrued: string;
  deployedAt: string;
  lastUpdated: string;
  productName: string;
  productSymbol: string;
}

function getStatusBadge(status: string) {
  const statusMap = {
    pending: { label: "Pending", variant: "secondary" as const },
    settled: { label: "Settled", variant: "default" as const },
  };
  const config = statusMap[status as keyof typeof statusMap] || { label: status, variant: "secondary" as const };
  return <Badge variant={config.variant} data-testid={`badge-${status}`}>{config.label}</Badge>;
}

// Safe number formatting helpers
function formatCurrency(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "0.00";
  const num = typeof value === "string" ? parseFloat(value) : value;
  return isNaN(num) ? "0.00" : num.toFixed(2);
}

function formatPercent(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "0.00";
  const num = typeof value === "string" ? parseFloat(value) : value;
  // Note: currentYield is already stored as a percentage (e.g., 4.5 = 4.5%), so don't multiply by 100
  return isNaN(num) ? "0.00" : num.toFixed(2);
}

// Removed custom hook - use skipToken pattern directly at call sites instead

export default function MerchantPortal() {
  const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(null);
  
  // Explainer card state (localStorage-persisted)
  const [showExplainer, setShowExplainer] = useState(true);
  const [explainerOpen, setExplainerOpen] = useState(true);
  
  useEffect(() => {
    const dismissed = localStorage.getItem('merchant-explainer-dismissed');
    if (dismissed === 'true') {
      setShowExplainer(false);
    }
  }, []);
  
  const dismissExplainer = () => {
    localStorage.setItem('merchant-explainer-dismissed', 'true');
    setShowExplainer(false);
  };

  // Fetch merchant balances
  const { data: balances, isLoading: balancesLoading } = useQuery<{ balances: MerchantBalance[] }>({
    queryKey: ["/api/merchant/balances"],
  });

  // Auto-select first merchant if available
  const firstMerchantId = balances?.balances?.[0]?.merchantId;
  const effectiveMerchantId = selectedMerchantId || firstMerchantId;

  // Fetch merchant-specific data using enabled option
  const { data: transactions, isLoading: transactionsLoading } = useQuery<{ transactions: MerchantTransaction[] }>({
    queryKey: ["/api/merchant/transactions", effectiveMerchantId],
    enabled: !!effectiveMerchantId,
  });

  const { data: stablecoinAllocations, isLoading: stablecoinLoading } = useQuery<{ allocations: StablecoinAllocation[] }>({
    queryKey: ["/api/merchant/stablecoin-allocations", effectiveMerchantId],
    enabled: !!effectiveMerchantId,
  });

  const { data: treasuryAllocations, isLoading: treasuryLoading } = useQuery<{ allocations: TreasuryAllocation[] }>({
    queryKey: ["/api/merchant/treasury-allocations", effectiveMerchantId],
    enabled: !!effectiveMerchantId,
  });

  // Calculate totals
  const totalBalance = balances?.balances.reduce((sum, b) => sum + b.nusdBalance, 0) || 0;
  const totalPending = balances?.balances.reduce((sum, b) => sum + b.pendingSettlement, 0) || 0;
  const totalYield = balances?.balances.reduce((sum, b) => sum + b.totalYieldGenerated, 0) || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Merchant Portal</h1>
          <p className="text-muted-foreground">
            View your NUSD settlements and yield across property managers
          </p>
        </div>
        <Store className="h-12 w-12 text-primary" />
      </div>

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total NUSD Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {balancesLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold font-mono" data-testid="text-total-balance">
                  ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all property managers
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Settlement</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {balancesLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold font-mono" data-testid="text-pending-settlement">
                  ${totalPending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  In 1-3 day float
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Yield Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {balancesLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 font-mono" data-testid="text-total-yield">
                  ${totalYield.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  From settlement float
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* NUSD Orchestration Explainer Card */}
      {showExplainer && (
        <Collapsible open={explainerOpen} onOpenChange={setExplainerOpen}>
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">How Merchant NUSD Payments Work</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" data-testid="button-toggle-merchant-explainer">
                      {explainerOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <Button variant="ghost" size="sm" onClick={dismissExplainer} data-testid="button-dismiss-merchant-explainer">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-blue-600" />
                      <h4 className="font-semibold">NUSD Payments</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Tenants pay you with NUSD, backed 1:1 by stablecoins (USDC/USDT/DAI). You receive instant settlement notification while actual fund transfer occurs within 1-3 days.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <PiggyBank className="h-4 w-4 text-green-600" />
                      <h4 className="font-semibold">Settlement Float Yield</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      During the 1-3 day settlement period, property owners deploy your pending payment into treasury products generating 3-5% APY. Yield is shared with tenants as cashback.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-purple-600" />
                      <h4 className="font-semibold">Automatic Settlement</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Funds automatically settle to your bank account via ACH within the agreed timeframe. No action needed - the stablecoin orchestration handles everything automatically.
                    </p>
                  </div>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm">
                    <strong>Example:</strong> A tenant pays $500 for a purchase. You receive instant NUSD confirmation backed by $500 USDC. During 2-day settlement, the property manager deploys it into NRK (4% APY) generating ~$0.11 yield. Tenant gets $0.06 cashback, property owner keeps $0.04, platform takes $0.01. You receive $500 via ACH on settlement date.
                  </p>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Balances by Property Manager */}
      <Card>
        <CardHeader>
          <CardTitle>Balances by Property Manager</CardTitle>
          <CardDescription>Your NUSD balances across organizations</CardDescription>
        </CardHeader>
        <CardContent>
          {balancesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : balances?.balances.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No balances yet</p>
          ) : (
            <div className="space-y-3">
              {balances?.balances.map((balance) => (
                <div 
                  key={balance.merchantId} 
                  className="p-4 border rounded-lg hover-elevate cursor-pointer"
                  onClick={() => setSelectedMerchantId(balance.merchantId)}
                  data-testid={`balance-${balance.merchantId}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{balance.organizationName}</p>
                      <p className="text-sm text-muted-foreground">
                        Pending: ${formatCurrency(balance.pendingSettlement)} | Yield: ${formatCurrency(balance.totalYieldGenerated)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold font-mono">
                        ${formatCurrency(balance.nusdBalance)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedMerchantId === balance.merchantId && "Selected"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Orchestration Details */}
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions" data-testid="tab-transactions">
            Transactions
          </TabsTrigger>
          <TabsTrigger value="stablecoin" data-testid="tab-stablecoin">
            Stablecoin Backing
          </TabsTrigger>
          <TabsTrigger value="treasury" data-testid="tab-treasury">
            Treasury Products
          </TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Purchases and settlements from tenants</CardDescription>
              </div>
              <Button variant="outline" size="sm" data-testid="button-export-transactions">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : transactions?.transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No transactions yet</p>
              ) : (
                <div className="space-y-3">
                  {transactions?.transactions.slice(0, 10).map((tx) => (
                    <div 
                      key={tx.id} 
                      className="flex items-center justify-between p-4 border rounded-lg"
                      data-testid={`transaction-${tx.id}`}
                    >
                      <div>
                        <p className="font-medium">${formatCurrency(tx.amount)}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(tx.transactionDate).toLocaleDateString()}
                          {tx.description && ` • ${tx.description}`}
                        </p>
                        {tx.yieldGenerated && parseFloat(tx.yieldGenerated) > 0 && (
                          <p className="text-xs text-green-600 dark:text-green-400">
                            Yield: ${formatCurrency(tx.yieldGenerated)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        {tx.settlementDate && (
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              Settlement: {new Date(tx.settlementDate).toLocaleDateString()}
                            </p>
                            {tx.settlementDays && (
                              <p className="text-xs text-muted-foreground">
                                {tx.settlementDays} day float
                              </p>
                            )}
                          </div>
                        )}
                        {getStatusBadge(tx.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stablecoin Backing Tab */}
        <TabsContent value="stablecoin">
          <Card>
            <CardHeader>
              <CardTitle>Stablecoin Backing</CardTitle>
              <CardDescription>
                NUSD is 1:1 backed by stablecoins (USDC/USDT/DAI)
                {effectiveMerchantId && balances?.balances.find(b => b.merchantId === effectiveMerchantId) && 
                  ` - ${balances.balances.find(b => b.merchantId === effectiveMerchantId)?.organizationName}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stablecoinLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : !effectiveMerchantId ? (
                <p className="text-sm text-muted-foreground text-center py-8">Select a property manager to view allocations</p>
              ) : stablecoinAllocations?.allocations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No stablecoin allocations yet</p>
              ) : (
                <div className="space-y-3">
                  {stablecoinAllocations?.allocations.map((allocation) => (
                    <div 
                      key={allocation.id} 
                      className="flex items-center justify-between p-4 border rounded-lg"
                      data-testid={`stablecoin-${allocation.coin}`}
                    >
                      <div className="flex items-center gap-4">
                        <Coins className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{allocation.coin}</p>
                          <p className="text-sm text-muted-foreground">
                            Last updated: {new Date(allocation.lastUpdated).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold font-mono">
                          {formatCurrency(allocation.allocatedAmount)} {allocation.coin}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ≈ ${formatCurrency(allocation.nusdEquivalent)} NUSD
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Treasury Products Tab */}
        <TabsContent value="treasury">
          <Card>
            <CardHeader>
              <CardTitle>Treasury Product Allocations</CardTitle>
              <CardDescription>
                Stablecoins deployed into yield-generating products (NRF/NRK/NRC)
                {effectiveMerchantId && balances?.balances.find(b => b.merchantId === effectiveMerchantId) && 
                  ` - ${balances.balances.find(b => b.merchantId === effectiveMerchantId)?.organizationName}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {treasuryLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : !effectiveMerchantId ? (
                <p className="text-sm text-muted-foreground text-center py-8">Select a property manager to view allocations</p>
              ) : treasuryAllocations?.allocations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No treasury allocations yet</p>
              ) : (
                <div className="space-y-3">
                  {treasuryAllocations?.allocations.map((allocation) => (
                    <div 
                      key={allocation.id} 
                      className="p-4 border rounded-lg"
                      data-testid={`treasury-${allocation.productSymbol}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <PiggyBank className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{allocation.productName} ({allocation.productSymbol})</p>
                            <p className="text-sm text-muted-foreground">
                              {allocation.coin} • Deployed {new Date(allocation.deployedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold font-mono">
                            {formatCurrency(allocation.allocatedAmount)} {allocation.coin}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-muted-foreground">
                          Current Yield: {formatPercent(allocation.currentYield)}% APY
                        </div>
                        <div className="text-green-600 dark:text-green-400">
                          Earned: ${formatCurrency(allocation.yieldAccrued)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
