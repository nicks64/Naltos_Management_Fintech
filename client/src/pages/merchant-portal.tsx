import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Clock, Download, Store, Coins, PiggyBank, Info, X, ChevronDown, ChevronUp, ArrowRight, Shield, Filter, CreditCard, ArrowUpDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from "recharts";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";

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

// Generate mock settlement analytics data for demonstration
function generateSettlementChartData(balances: MerchantBalance[] | undefined): Array<{date: string, volume: number, yield: number}> {
  if (!balances || balances.length === 0) {
    return [];
  }
  
  const totalPending = balances.reduce((sum, b) => sum + b.pendingSettlement, 0);
  const totalReceived = balances.reduce((sum, b) => sum + b.totalReceived, 0);
  const days = 30;
  const data = [];
  
  const avgDailyVolume = totalReceived / days;
  const avgDailyYield = (totalPending * 0.045) / 365;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const volume = avgDailyVolume * (0.8 + Math.random() * 0.4);
    const cumulativeYield = avgDailyYield * (days - i);
    
    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      volume: Math.max(0, volume),
      yield: Math.max(0, cumulativeYield)
    });
  }
  
  return data;
}

// Payment Method Manager Component
function PaymentMethodManager() {
  const [schedule, setSchedule] = useState(() => {
    return localStorage.getItem('merchant-settlement-schedule') || "weekly";
  });
  const [paymentMethod, setPaymentMethod] = useState(() => {
    return localStorage.getItem('merchant-payment-method') || "ach";
  });
  const [autoSettle, setAutoSettle] = useState(() => {
    const stored = localStorage.getItem('merchant-auto-settle');
    return stored === null ? true : stored === 'true';
  });
  const { toast } = useToast();
  
  const scheduleOptions = [
    { value: "daily", label: "Daily", description: "Settle funds every business day", icon: Clock },
    { value: "weekly", label: "Weekly", description: "Settle funds every Friday", icon: TrendingUp },
    { value: "monthly", label: "Monthly", description: "Settle funds on the 1st of each month", icon: DollarSign }
  ];
  
  const paymentMethods = [
    { value: "ach", label: "ACH Transfer", description: "Standard bank transfer (1-2 business days)", icon: DollarSign },
    { value: "wire", label: "Wire Transfer", description: "Same-day transfer (higher fees)", icon: Coins }
  ];
  
  const handleSave = () => {
    localStorage.setItem('merchant-settlement-schedule', schedule);
    localStorage.setItem('merchant-payment-method', paymentMethod);
    localStorage.setItem('merchant-auto-settle', autoSettle.toString());
    
    toast({
      title: "Settlement Preferences Saved",
      description: `Your settlement schedule is now ${scheduleOptions.find(s => s.value === schedule)?.label} via ${paymentMethods.find(m => m.value === paymentMethod)?.label}. Settings will persist across sessions.`
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Settlement Schedule */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Settlement Schedule</Label>
        <div className="grid md:grid-cols-3 gap-3">
          {scheduleOptions.map((option) => {
            const Icon = option.icon;
            return (
              <div
                key={option.value}
                onClick={() => setSchedule(option.value)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  schedule === option.value
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover-elevate"
                }`}
                data-testid={`schedule-option-${option.value}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <h4 className="font-medium">{option.label}</h4>
                  {schedule === option.value && (
                    <Badge variant="default" className="ml-auto">Selected</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Payment Method */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Payment Method</Label>
        <div className="grid md:grid-cols-2 gap-3">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <div
                key={method.value}
                onClick={() => setPaymentMethod(method.value)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  paymentMethod === method.value
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover-elevate"
                }`}
                data-testid={`payment-method-${method.value}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <h4 className="font-medium">{method.label}</h4>
                  {paymentMethod === method.value && (
                    <Badge variant="default" className="ml-auto">Selected</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{method.description}</p>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Auto-Settlement Toggle */}
      <div className="flex items-start justify-between p-4 rounded-lg border">
        <div className="space-y-1">
          <Label htmlFor="auto-settle" className="text-base font-medium cursor-pointer">
            Automatic Settlement
          </Label>
          <p className="text-sm text-muted-foreground">
            Automatically settle funds according to your schedule without manual approval
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="auto-settle"
            checked={autoSettle}
            onCheckedChange={(checked) => setAutoSettle(checked as boolean)}
            data-testid="checkbox-auto-settle"
          />
        </div>
      </div>
      
      {/* Current Settings Summary */}
      <div className="bg-muted/50 p-4 rounded-lg space-y-2">
        <h4 className="font-medium text-sm">Current Settings</h4>
        <div className="text-sm space-y-1">
          <p className="text-muted-foreground">
            <strong>Schedule:</strong> {scheduleOptions.find(s => s.value === schedule)?.label || schedule}
          </p>
          <p className="text-muted-foreground">
            <strong>Method:</strong> {paymentMethods.find(m => m.value === paymentMethod)?.label || paymentMethod}
          </p>
          <p className="text-muted-foreground">
            <strong>Auto-Settlement:</strong> {autoSettle ? "Enabled" : "Disabled"}
          </p>
        </div>
      </div>
      
      <Button onClick={handleSave} className="w-full" data-testid="button-save-preferences">
        <Store className="mr-2 h-4 w-4" />
        Save Preferences
      </Button>
    </div>
  );
}

// Removed custom hook - use skipToken pattern directly at call sites instead

export default function MerchantPortal() {
  const { toast } = useToast();
  const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(null);
  
  // Explainer card state (localStorage-persisted)
  const [showExplainer, setShowExplainer] = useState(true);
  const [explainerOpen, setExplainerOpen] = useState(true);
  
  // Settlement dialog state
  const [settlementOpen, setSettlementOpen] = useState(false);
  const [settlementAmount, setSettlementAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"ach" | "wire">("ach");
  
  // Transaction filter state
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date-desc");
  
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

  // Settlement mutation
  const settlementMutation = useMutation({
    mutationFn: async (data: { merchantId: string; amount: string; paymentMethod: string }) => {
      return await apiRequest("POST", "/api/merchant/settlements", data);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/merchant/balances"] });
      toast({
        title: "Settlement Initiated",
        description: data.message || `Settlement of $${settlementAmount} has been initiated successfully.`,
      });
      setSettlementOpen(false);
      setSettlementAmount("");
    },
    onError: (error: any) => {
      toast({
        title: "Settlement Failed",
        description: error.message || "Failed to initiate settlement. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSettlement = () => {
    if (!settlementAmount || parseFloat(settlementAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid settlement amount.",
        variant: "destructive",
      });
      return;
    }

    if (!effectiveMerchantId) {
      toast({
        title: "No Merchant Selected",
        description: "Please select a merchant first.",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(settlementAmount) > totalPending) {
      toast({
        title: "Insufficient Balance",
        description: `You can only settle up to $${formatCurrency(totalPending)}`,
        variant: "destructive",
      });
      return;
    }

    settlementMutation.mutate({
      merchantId: effectiveMerchantId,
      amount: settlementAmount,
      paymentMethod,
    });
  };

  // Handle transaction export (demo - just shows toast)
  const handleExport = () => {
    toast({
      title: "Export Started",
      description: `Exporting ${filteredTransactions.length} transactions to CSV. Download will begin shortly.`,
    });
  };

  // Filter and sort transactions
  const filteredTransactions = transactions?.transactions
    ? transactions.transactions.filter((tx) => {
        if (statusFilter === "all") return true;
        return tx.status === statusFilter;
      }).sort((a, b) => {
        if (sortBy === "date-desc") {
          return new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime();
        } else if (sortBy === "date-asc") {
          return new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime();
        } else if (sortBy === "amount-desc") {
          return parseFloat(b.amount) - parseFloat(a.amount);
        } else if (sortBy === "amount-asc") {
          return parseFloat(a.amount) - parseFloat(b.amount);
        }
        return 0;
      })
    : [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Merchant Portal</h1>
          <p className="text-muted-foreground">
            View your USD settlements and earnings from transaction float
          </p>
        </div>
        <Store className="h-12 w-12 text-primary" />
      </div>

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {balancesLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold font-mono" data-testid="text-total-balance">
                  ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  From customer transactions
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
                  ${totalPending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Settling to your bank in 1-3 days
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">USD Earned (Yield)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {balancesLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 font-mono" data-testid="text-total-yield">
                  ${totalYield.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  From 1-3 day settlement float
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Settle Now Button */}
      <div className="flex justify-end">
        <Dialog open={settlementOpen} onOpenChange={setSettlementOpen}>
          <DialogTrigger asChild>
            <Button 
              size="lg" 
              disabled={totalPending <= 0 || balancesLoading || settlementMutation.isPending} 
              data-testid="button-settle-now"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {settlementMutation.isPending ? "Processing..." : "Settle Now"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Initiate Settlement</DialogTitle>
              <DialogDescription>
                Settle your pending USD balance to your bank account
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="settlement-amount">Amount (USD)</Label>
                <Input
                  id="settlement-amount"
                  type="number"
                  placeholder="0.00"
                  value={settlementAmount}
                  onChange={(e) => setSettlementAmount(e.target.value)}
                  min="0"
                  max={totalPending}
                  step="0.01"
                  data-testid="input-settlement-amount"
                />
                <p className="text-sm text-muted-foreground">
                  Available for settlement: ${formatCurrency(totalPending)}
                </p>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-3">
                <Label>Payment Method</Label>
                <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                  <div className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover-elevate" onClick={() => setPaymentMethod("ach")}>
                    <RadioGroupItem value="ach" id="ach-settlement" data-testid="radio-ach-settlement" />
                    <div className="flex-1">
                      <Label htmlFor="ach-settlement" className="cursor-pointer font-medium">ACH Transfer</Label>
                      <p className="text-sm text-muted-foreground">
                        Standard bank transfer • 1-2 business days • No fee
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover-elevate" onClick={() => setPaymentMethod("wire")}>
                    <RadioGroupItem value="wire" id="wire-settlement" data-testid="radio-wire-settlement" />
                    <div className="flex-1">
                      <Label htmlFor="wire-settlement" className="cursor-pointer font-medium">Wire Transfer</Label>
                      <p className="text-sm text-muted-foreground">
                        Same-day transfer • $25 fee
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Summary */}
              {settlementAmount && parseFloat(settlementAmount) > 0 && (
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Settlement Amount:</span>
                    <span className="font-mono font-semibold">${parseFloat(settlementAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Fee:</span>
                    <span className="font-mono">${paymentMethod === "wire" ? "25.00" : "0.00"}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t pt-2">
                    <span className="font-medium">Net Amount:</span>
                    <span className="font-mono font-bold text-green-600 dark:text-green-400">
                      ${(parseFloat(settlementAmount) - (paymentMethod === "wire" ? 25 : 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleSettlement} 
                className="w-full" 
                disabled={settlementMutation.isPending}
                data-testid="button-confirm-settlement"
              >
                {settlementMutation.isPending ? "Processing..." : "Confirm Settlement"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* How Your USD Payments Work */}
      {showExplainer && (
        <Collapsible open={explainerOpen} onOpenChange={setExplainerOpen}>
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">How Your USD Payments Work</CardTitle>
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
                      <h4 className="font-semibold">Instant USD Notification</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Customers pay in USD. You receive instant confirmation that funds are secured, with automatic settlement to your bank account in 1-3 days via ACH.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <PiggyBank className="h-4 w-4 text-green-600" />
                      <h4 className="font-semibold">Earn During Float</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      During the 1-3 day settlement window, your pending USD generates yield through treasury products at 3-5% APY. A portion of this yield is shared with your customers as cashback.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-purple-600" />
                      <h4 className="font-semibold">Automatic Bank Settlement</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      USD settles to your bank automatically via ACH. No manual steps required — everything happens on your schedule (daily, weekly, or monthly).
                    </p>
                  </div>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm">
                    <strong>Example:</strong> Customer pays $20 USD for a purchase. You get instant confirmation. During the 2-day settlement period, that $20 generates yield ($0.006 at 4% APY). Customer receives $0.003 USD cashback, property owner keeps $0.002, platform takes $0.001. You receive $20 USD via ACH on settlement date.
                  </p>
                </div>
                <div className="border-t pt-3">
                  <p className="text-xs text-muted-foreground">
                    <strong>Powered by stablecoin rails:</strong> Behind the scenes, Naltos uses stablecoins (USDC/USDT/DAI) as infrastructure for instant settlement. Everything you see is in USD — stablecoins are just the backend rails that make it fast and automatic.
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
          <CardDescription>Your USD balances across all organizations</CardDescription>
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
                        Pending: ${formatCurrency(balance.pendingSettlement)} USD | Yield: ${formatCurrency(balance.totalYieldGenerated)} USD
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold font-mono">
                        ${formatCurrency(balance.nusdBalance)} USD
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
            Backend Infrastructure
          </TabsTrigger>
          <TabsTrigger value="treasury" data-testid="tab-treasury">
            Yield Earnings
          </TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          {/* Settlement Analytics Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Settlement Analytics</CardTitle>
              <CardDescription>Transaction volume and cumulative yield over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              {balancesLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={generateSettlementChartData(balances?.balances || [])} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="yieldGradientMerchant" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis yAxisId="left" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(value) => `$${value.toFixed(0)}`} />
                    <YAxis yAxisId="right" orientation="right" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(value) => `$${value.toFixed(2)}`} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number, name: string) => {
                        if (name === 'volume') return [`$${value.toFixed(2)}`, 'Transaction Volume'];
                        if (name === 'yield') return [`$${value.toFixed(2)}`, 'Cumulative Yield'];
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Area 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="volume" 
                      stroke="hsl(var(--chart-1))" 
                      fillOpacity={1} 
                      fill="url(#volumeGradient)" 
                      strokeWidth={2}
                      name="Transaction Volume"
                    />
                    <Area 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="yield" 
                      stroke="hsl(var(--primary))" 
                      fillOpacity={1} 
                      fill="url(#yieldGradientMerchant)" 
                      strokeWidth={2}
                      name="Cumulative Yield"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Payment Method Manager */}
          <Card>
            <CardHeader>
              <CardTitle>Settlement Preferences</CardTitle>
              <CardDescription>Configure your payment settlement schedule and method</CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentMethodManager />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Purchases and settlements from tenants</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleExport} data-testid="button-export-transactions">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters and Sorting */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]" data-testid="select-status-filter">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="settled">Settled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]" data-testid="select-sort-by">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date-desc">Date (Newest First)</SelectItem>
                      <SelectItem value="date-asc">Date (Oldest First)</SelectItem>
                      <SelectItem value="amount-desc">Amount (High to Low)</SelectItem>
                      <SelectItem value="amount-asc">Amount (Low to High)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="ml-auto text-sm text-muted-foreground">
                  Showing {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Transaction List */}
              {transactionsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredTransactions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No transactions found</p>
              ) : (
                <div className="space-y-3">
                  {filteredTransactions.slice(0, 10).map((tx) => (
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
              <CardTitle>How Your USD is Backed (Technical Details)</CardTitle>
              <CardDescription>
                Your USD balance is backed 1:1 by stablecoins (USDC/USDT/DAI) — the invisible rails that enable instant settlement
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
                          ≈ ${formatCurrency(allocation.nusdEquivalent)} USD
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
              <CardTitle>How Your USD Generates Yield</CardTitle>
              <CardDescription>
                Your idle USD is deployed into T-Bills and money markets (NRF/NRK/NRC) during the 1-3 day settlement period
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
