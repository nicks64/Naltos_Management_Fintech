import { useState, useEffect } from "react";
import { useQuery, useMutation, skipToken } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, FileText, Clock, TrendingUp, Download, CreditCard, Coins, PiggyBank, ArrowRight, Shield, Info, X, ChevronDown, ChevronUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { VendorStablecoinAllocation, VendorTreasuryAllocation } from "@shared/schema";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

type VendorInvoice = {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  dueDate: string;
  organizationName: string;
};

type VendorBalance = {
  vendorId: string;
  organizationName: string;
  totalBalance: number;
  availableBalance: number;
  pendingBalance: number;
};

type VendorRedemption = {
  id: string;
  amount: number;
  status: string;
  payoutMethod: string;
  requestedAt: string;
  completedAt: string | null;
};

type StablecoinAllocation = {
  id: string;
  vendorBalanceId: string;
  coin: "USDC" | "USDT" | "DAI";
  allocatedAmount: string;
  nusdEquivalent: string;
  lastUpdated: string;
};

type TreasuryAllocation = {
  id: string;
  vendorBalanceId: string;
  productCode: "NRF" | "NRK" | "NRC";
  productName: string;
  allocatedAmount: string;
  currentYield: string;
  yieldGenerated: string;
  lastUpdated: string;
  productSymbol: string;
};

// Helper function to safely format currency
function formatCurrency(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "0.00";
  const num = typeof value === "string" ? parseFloat(value) : value;
  return isNaN(num) ? "0.00" : num.toFixed(2);
}

// Helper function to safely format percentage
function formatPercent(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "0.00";
  const num = typeof value === "string" ? parseFloat(value) : value;
  return isNaN(num) ? "0.00" : num.toFixed(2);
}

// Generate mock yield chart data for demonstration
function generateYieldChartData(balances: VendorBalance[]): Array<{date: string, yield: number}> {
  const totalBalance = balances.reduce((sum, b) => sum + b.totalBalance, 0);
  const days = 30;
  const data = [];
  
  const avgDailyYield = (totalBalance * 0.04) / 365;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const cumulativeYield = avgDailyYield * (days - i);
    
    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      yield: Math.max(0, cumulativeYield)
    });
  }
  
  return data;
}

// Redemption Calculator Component
function RedemptionCalculator({ maxAmount }: { maxAmount: number }) {
  const [amount, setAmount] = useState("1000");
  
  const calculatedAmount = parseFloat(amount) || 0;
  
  const payoutOptions = [
    {
      name: "ACH (Next-Day)",
      icon: DollarSign,
      feePercent: 0,
      fixedFee: 0,
      processingTime: "Next business day",
      description: "Scheduled for Net30/60/90 due date",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950"
    },
    {
      name: "Push-to-Card",
      icon: CreditCard,
      feePercent: 1.5,
      fixedFee: 0,
      processingTime: "Instant (1-2 minutes)",
      description: "Early redemption with convenience fee",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950"
    },
    {
      name: "On-Chain Stablecoin",
      icon: Coins,
      feePercent: 0.1,
      fixedFee: 2,
      processingTime: "Instant (on-chain)",
      description: "Withdraw to your crypto wallet",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950"
    }
  ];
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="calc-amount">Amount to Redeem</Label>
        <Input
          id="calc-amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          min="0"
          max={maxAmount}
          step="10"
          data-testid="input-calculator-amount"
        />
        <p className="text-xs text-muted-foreground">
          Available: ${maxAmount.toFixed(2)}
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4">
        {payoutOptions.map((option) => {
          const Icon = option.icon;
          const fee = (calculatedAmount * option.feePercent / 100) + option.fixedFee;
          const netAmount = calculatedAmount - fee;
          
          return (
            <div 
              key={option.name} 
              className={`p-4 rounded-lg border ${option.bgColor}`}
              data-testid={`calculator-option-${option.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`h-5 w-5 ${option.color}`} />
                <h4 className="font-semibold">{option.name}</h4>
              </div>
              
              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Gross Amount:</span>
                  <span className="font-mono">${calculatedAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fee:</span>
                  <span className="font-mono text-red-600 dark:text-red-400">
                    -${fee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm border-t pt-2">
                  <span className="font-medium">Net Amount:</span>
                  <span className="font-mono font-bold text-green-600 dark:text-green-400">
                    ${netAmount.toFixed(2)}
                  </span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{option.processingTime}</span>
                </div>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="bg-muted/50 p-3 rounded-lg">
        <p className="text-xs text-muted-foreground">
          <strong>Note:</strong> ACH has no fees but follows the standard Net30/60/90 payment schedule. 
          Push-to-Card and On-Chain options allow early redemption with a small convenience fee.
        </p>
      </div>
    </div>
  );
}


export default function VendorPortal() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [rail, setRail] = useState<"ACH" | "PushToCard" | "OnChainStablecoin">("ACH");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  
  // Explainer card state (localStorage-persisted)
  const [showExplainer, setShowExplainer] = useState(true);
  const [explainerOpen, setExplainerOpen] = useState(true);
  
  useEffect(() => {
    const dismissed = localStorage.getItem('vendor-explainer-dismissed');
    if (dismissed === 'true') {
      setShowExplainer(false);
    }
  }, []);
  
  const dismissExplainer = () => {
    localStorage.setItem('vendor-explainer-dismissed', 'true');
    setShowExplainer(false);
  };

  const { data: balances, isLoading: balancesLoading } = useQuery<{ balances: VendorBalance[] }>({
    queryKey: ["/api/vendor/balances"],
  });

  const { data: invoices, isLoading: invoicesLoading } = useQuery<{ invoices: VendorInvoice[] }>({
    queryKey: ["/api/vendor/invoices"],
  });

  const { data: redemptions, isLoading: redemptionsLoading } = useQuery<{ redemptions: VendorRedemption[] }>({
    queryKey: ["/api/vendor/redemptions"],
  });

  // Auto-select first vendor if available
  const firstVendorId = balances?.balances?.[0]?.vendorId;
  const effectiveVendorId = selectedVendorId || firstVendorId;

  const totalBalance = balances?.balances.reduce((sum, b) => sum + b.totalBalance, 0) || 0;
  const totalAvailable = balances?.balances.reduce((sum, b) => sum + b.availableBalance, 0) || 0;
  const totalPending = balances?.balances.reduce((sum, b) => sum + b.pendingBalance, 0) || 0;

  // Calculate fees and net amount based on selected rail
  const requestedAmount = parseFloat(amount) || 0;
  const feePercentage = rail === "ACH" ? 0 : rail === "PushToCard" ? 0.015 : 0.001;
  const feeAmount = requestedAmount * feePercentage;
  const netAmount = requestedAmount - feeAmount;

  // Calculate scheduled payout date for ACH
  const scheduledDate = new Date();
  scheduledDate.setDate(scheduledDate.getDate() + 30);

  const createRedemptionMutation = useMutation({
    mutationFn: async (data: { rail: string; nusdAmount: string }) => {
      return await apiRequest("POST", "/api/vendor/redemptions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/redemptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/balances"] });
      toast({
        title: "Redemption Request Submitted",
        description: `Your payout request for $${netAmount.toFixed(2)} has been submitted successfully.`,
      });
      setOpen(false);
      setAmount("");
      setTermsAccepted(false);
    },
    onError: (error: any) => {
      toast({
        title: "Redemption Failed",
        description: error.message || "Failed to submit redemption request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!amount || requestedAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than zero.",
        variant: "destructive",
      });
      return;
    }

    if (requestedAmount > totalAvailable) {
      toast({
        title: "Insufficient Balance",
        description: `You can only redeem up to $${totalAvailable.toFixed(2)}`,
        variant: "destructive",
      });
      return;
    }

    if (!termsAccepted) {
      toast({
        title: "Terms Not Accepted",
        description: "Please accept the terms and conditions to continue.",
        variant: "destructive",
      });
      return;
    }

    createRedemptionMutation.mutate({
      rail,
      nusdAmount: requestedAmount.toFixed(2),
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      paid: "default",
      pending: "secondary",
      overdue: "destructive",
      completed: "default",
      processing: "secondary",
      failed: "destructive",
    };
    return <Badge variant={variants[status.toLowerCase()] || "outline"}>{status}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Vendor Portal</h1>
        <p className="text-muted-foreground">
          Manage your invoices, balances, and payment redemptions
        </p>
      </div>

      {/* Balance Summary Cards with Request Payout Button */}
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
                <div className="text-2xl font-bold" data-testid="text-total-balance">
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
            <CardTitle className="text-sm font-medium">Available Now</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {balancesLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-available-balance">
                  ${totalAvailable.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Ready to redeem
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {balancesLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-pending-balance">
                  ${totalPending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  In processing
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
                  <CardTitle className="text-lg">How NUSD & Stablecoin Orchestration Works</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" data-testid="button-toggle-explainer">
                      {explainerOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <Button variant="ghost" size="sm" onClick={dismissExplainer} data-testid="button-dismiss-explainer">
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
                      <Shield className="h-4 w-4 text-green-600" />
                      <h4 className="font-semibold">1:1 Stablecoin Backing</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Every $1 NUSD you receive is backed 1:1 by stablecoins (USDC, USDT, DAI) held in secure treasury accounts. Your balance is fully redeemable anytime.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <PiggyBank className="h-4 w-4 text-blue-600" />
                      <h4 className="font-semibold">Yield Generation</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      When property managers pay you instantly, they deploy your payment into short-term treasury products (NRF, NRK, NRC) generating 3-5% APY until you redeem.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-purple-600" />
                      <h4 className="font-semibold">Flexible Redemption</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Choose ACH (Net30 due date, no fee), Push-to-Card (instant, 1.5% fee), or On-Chain Stablecoin (instant crypto, 0.1% fee). You control when and how you get paid.
                    </p>
                  </div>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm">
                    <strong>Example:</strong> You receive $10,000 NUSD for an invoice. Property manager backs it with $10,000 USDC deployed into NRF (4.5% APY). After 30 days, you redeem via ACH receiving $10,000 + your share of yield generated during the float period.
                  </p>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Request Payout Button */}
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button 
              size="lg" 
              disabled={totalAvailable <= 0 || balancesLoading || createRedemptionMutation.isPending} 
              data-testid="button-request-payout"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {createRedemptionMutation.isPending ? "Processing..." : "Request Payout"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Request Payout</DialogTitle>
              <DialogDescription>
                Choose your payout method and amount. Funds will be deducted from your available balance.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  max={totalAvailable}
                  step="0.01"
                  data-testid="input-redemption-amount"
                />
                <p className="text-sm text-muted-foreground">
                  Available: ${totalAvailable.toFixed(2)}
                </p>
              </div>

              {/* Payout Method Selector */}
              <div className="space-y-3">
                <Label>Payout Method</Label>
                <RadioGroup value={rail} onValueChange={(value: any) => setRail(value)}>
                  <div className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover-elevate" onClick={() => setRail("ACH")}>
                    <RadioGroupItem value="ACH" id="ach" data-testid="radio-ach" />
                    <div className="flex-1">
                      <Label htmlFor="ach" className="cursor-pointer font-medium">ACH (Next-Day)</Label>
                      <p className="text-sm text-muted-foreground">
                        Scheduled for {scheduledDate.toLocaleDateString()} • No Fee
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover-elevate" onClick={() => setRail("PushToCard")}>
                    <RadioGroupItem value="PushToCard" id="card" data-testid="radio-push-to-card" />
                    <div className="flex-1">
                      <Label htmlFor="card" className="cursor-pointer font-medium">Push-to-Card (Instant)</Label>
                      <p className="text-sm text-muted-foreground">
                        Immediate payout • 1.5% fee
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover-elevate" onClick={() => setRail("OnChainStablecoin")}>
                    <RadioGroupItem value="OnChainStablecoin" id="crypto" data-testid="radio-on-chain" />
                    <div className="flex-1">
                      <Label htmlFor="crypto" className="cursor-pointer font-medium">On-Chain Stablecoin</Label>
                      <p className="text-sm text-muted-foreground">
                        Instant crypto withdrawal • 0.1% gas fee
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Fee Calculator */}
              {requestedAmount > 0 && (
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Redemption Amount:</span>
                    <span className="font-mono">${requestedAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Fee ({(feePercentage * 100).toFixed(1)}%):</span>
                    <span className="font-mono text-destructive">-${feeAmount.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Net Amount:</span>
                    <span className="font-mono text-green-600 dark:text-green-400">${netAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Terms Acceptance */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked: boolean) => setTermsAccepted(checked)}
                  data-testid="checkbox-terms"
                />
                <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                  I understand that this redemption will be deducted from my available balance and processed according to the selected payout method.
                </Label>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setOpen(false)} data-testid="button-cancel-redemption">
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createRedemptionMutation.isPending}
                  data-testid="button-submit-redemption"
                >
                  {createRedemptionMutation.isPending ? "Processing..." : "Submit Request"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabbed Interface for Orchestration Views */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3" data-testid="tabs-list">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="stablecoin" data-testid="tab-stablecoin">Stablecoin Backing</TabsTrigger>
          <TabsTrigger value="treasury" data-testid="tab-treasury">Treasury Products</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Balances by Organization */}
          <Card>
            <CardHeader>
              <CardTitle>Balances by Property Manager</CardTitle>
              <CardDescription>Your NUSD balances across organizations</CardDescription>
            </CardHeader>
            <CardContent>
          {balancesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : balances?.balances.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No balances yet</p>
          ) : (
            <div className="space-y-3">
              {balances?.balances.map((balance) => (
                <div 
                  key={balance.vendorId} 
                  className="flex items-center justify-between p-4 border rounded-lg hover-elevate cursor-pointer"
                  onClick={() => setSelectedVendorId(balance.vendorId)}
                  data-testid={`balance-${balance.vendorId}`}
                >
                  <div>
                    <p className="font-medium">{balance.organizationName}</p>
                    <p className="text-sm text-muted-foreground">
                      Available: ${balance.availableBalance.toFixed(2)} | Pending: ${balance.pendingBalance.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold font-mono">
                      ${balance.totalBalance.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedVendorId === balance.vendorId && "Selected"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

          {/* Yield Analytics Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Cumulative Yield Generated</CardTitle>
              <CardDescription>Payment float yield accumulation over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              {balancesLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={generateYieldChartData(balances?.balances || [])} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="yieldGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(value) => `$${value.toFixed(2)}`} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Yield']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="yield" 
                      stroke="hsl(var(--primary))" 
                      fillOpacity={1} 
                      fill="url(#yieldGradient)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Interactive Redemption Calculator */}
          <Card>
            <CardHeader>
              <CardTitle>Redemption Calculator</CardTitle>
              <CardDescription>Compare payout options and calculate fees</CardDescription>
            </CardHeader>
            <CardContent>
              <RedemptionCalculator maxAmount={totalAvailable} />
            </CardContent>
          </Card>

          {/* Recent Invoices */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div>
                <CardTitle>Recent Invoices</CardTitle>
                <CardDescription>Payments received from property managers</CardDescription>
              </div>
              <Button variant="outline" size="sm" data-testid="button-export-invoices">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              {invoicesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : invoices?.invoices.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No invoices yet</p>
              ) : (
                <div className="space-y-3">
                  {invoices?.invoices.map((invoice) => (
                    <div 
                      key={invoice.id} 
                      className="flex items-center justify-between p-4 border rounded-lg"
                      data-testid={`invoice-${invoice.id}`}
                    >
                      <div className="flex items-center gap-4">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{invoice.invoiceNumber}</p>
                          <p className="text-sm text-muted-foreground">{invoice.organizationName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold font-mono">${invoice.amount.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                        </div>
                        {getStatusBadge(invoice.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Redemption History */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div>
                <CardTitle>Redemption History</CardTitle>
                <CardDescription>Your payment withdrawal requests</CardDescription>
              </div>
              <Button data-testid="button-request-redemption">
                <CreditCard className="mr-2 h-4 w-4" />
                Request Redemption
              </Button>
            </CardHeader>
            <CardContent>
              {redemptionsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : redemptions?.redemptions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No redemptions yet</p>
              ) : (
                <div className="space-y-3">
                  {redemptions?.redemptions.map((redemption) => (
                    <div 
                      key={redemption.id} 
                      className="flex items-center justify-between p-4 border rounded-lg"
                      data-testid={`redemption-${redemption.id}`}
                    >
                      <div>
                        <p className="font-medium">${redemption.amount.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          {redemption.payoutMethod} • Requested {new Date(redemption.requestedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {redemption.completedAt && (
                          <p className="text-sm text-muted-foreground">
                            Completed {new Date(redemption.completedAt).toLocaleDateString()}
                          </p>
                        )}
                        {getStatusBadge(redemption.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stablecoin Backing Tab */}
        <TabsContent value="stablecoin" className="space-y-6">
          <VendorStablecoinTab 
            vendorId={effectiveVendorId} 
            organizationName={balances?.balances.find(b => b.vendorId === effectiveVendorId)?.organizationName}
          />
        </TabsContent>

        {/* Treasury Products Tab */}
        <TabsContent value="treasury" className="space-y-6">
          <VendorTreasuryTab 
            vendorId={effectiveVendorId}
            organizationName={balances?.balances.find(b => b.vendorId === effectiveVendorId)?.organizationName}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Stablecoin Backing Tab Component
function VendorStablecoinTab({ vendorId, organizationName }: { vendorId?: string | null; organizationName?: string }) {
  const { data, isLoading } = useQuery(
    vendorId
      ? {
          queryKey: ["/api/vendor/stablecoin-allocations", vendorId],
        }
      : skipToken
  );

  const allocations = data?.allocations;
  const totalBacking = allocations?.reduce((sum, a) => sum + parseFloat(a.allocatedAmount), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Stablecoin Backing Overview</CardTitle>
          <CardDescription>
            Your NUSD is 1:1 backed by stablecoins (USDC/USDT/DAI) held in secure custody
            {vendorId && organizationName && ` - ${organizationName}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!vendorId ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Select a property manager to view stablecoin backing
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Total Stablecoin Backing</p>
                <p className="text-3xl font-bold font-mono">${totalBacking.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Backing Ratio</p>
                <p className="text-3xl font-bold">100%</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Allocations by Coin */}
      <Card>
        <CardHeader>
          <CardTitle>Stablecoin Allocations</CardTitle>
          <CardDescription>Breakdown of backing by stablecoin type</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : !vendorId ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Select a property manager to view allocations
            </p>
          ) : !allocations || allocations.length === 0 ? (
            <div className="text-center py-8">
              <Coins className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No stablecoin allocations yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allocations.map((allocation) => {
                const percentage = totalBacking > 0 ? (parseFloat(allocation.allocatedAmount) / totalBacking) * 100 : 0;
                return (
                  <div
                    key={allocation.id}
                    className="p-5 border rounded-lg space-y-3"
                    data-testid={`stablecoin-${allocation.coin}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Coins className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-semibold">{allocation.coin}</p>
                          <p className="text-sm text-muted-foreground">
                            Last updated: {new Date(allocation.lastUpdated).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold font-mono">
                          ${parseFloat(allocation.allocatedAmount).toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">{percentage.toFixed(1)}% of total</p>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="font-medium">Secure & Transparent Backing</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every NUSD in your account is backed 1:1 by stablecoins (USDC, USDT, DAI) held in secure
                custody. This ensures instant redemption and full transparency of your backing assets.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Treasury Products Tab Component
function VendorTreasuryTab({ vendorId, organizationName }: { vendorId?: string | null; organizationName?: string }) {
  const { data, isLoading } = useQuery(
    vendorId
      ? {
          queryKey: ["/api/vendor/treasury-allocations", vendorId],
        }
      : skipToken
  );

  const allocations = data?.allocations;
  const totalAUM = allocations?.reduce((sum, a) => sum + parseFloat(a.allocatedAmount), 0) || 0;
  const totalYield = allocations?.reduce((sum, a) => sum + parseFloat(a.yieldAccrued), 0) || 0;
  const weightedYield = totalAUM > 0
    ? (allocations?.reduce((sum, a) => sum + (parseFloat(a.currentYield) * parseFloat(a.allocatedAmount)), 0) || 0) / totalAUM
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Treasury Deployment Overview</CardTitle>
          <CardDescription>
            Your stablecoin backing is automatically deployed into yield-generating treasury products
            {vendorId && organizationName && ` - ${organizationName}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!vendorId ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Select a property manager to view treasury deployments
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Total Assets Under Management</p>
                <p className="text-3xl font-bold font-mono">${totalAUM.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Current Yield Rate</p>
                <p className="text-3xl font-bold">{weightedYield.toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Total Yield Accrued</p>
                <p className="text-3xl font-bold font-mono text-green-600 dark:text-green-400">
                  ${totalYield.toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Treasury Product Allocations */}
      <Card>
        <CardHeader>
          <CardTitle>Active Treasury Positions</CardTitle>
          <CardDescription>Breakdown by treasury product type</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : !vendorId ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Select a property manager to view allocations
            </p>
          ) : !allocations || allocations.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No treasury deployments yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allocations.map((allocation) => {
                const percentage = totalAUM > 0 ? (parseFloat(allocation.allocatedAmount) / totalAUM) * 100 : 0;
                return (
                  <div
                    key={allocation.id}
                    className="p-5 border rounded-lg space-y-4"
                    data-testid={`treasury-${allocation.productSymbol}-${allocation.coin}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{allocation.productName}</p>
                            <Badge variant="secondary">{allocation.productSymbol}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {allocation.coin} • Deployed {new Date(allocation.deployedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold font-mono">
                          ${parseFloat(allocation.allocatedAmount).toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">{percentage.toFixed(1)}% of AUM</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground">Current Yield</p>
                        <p className="text-lg font-semibold">{parseFloat(allocation.currentYield).toFixed(2)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Yield Accrued</p>
                        <p className="text-lg font-semibold font-mono text-green-600 dark:text-green-400">
                          ${parseFloat(allocation.yieldAccrued).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Descriptions */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex gap-3">
              <TrendingUp className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="font-medium">Treasury Product Types</p>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div>
                    <span className="font-semibold">NRF (Rent Float):</span> Tokenized T-Bills with 5-15 day maturities,
                    optimized for short-duration rent collection float.
                  </div>
                  <div>
                    <span className="font-semibold">NRK (Rent Kredit):</span> Money-market equivalent instruments
                    providing stable yields with daily liquidity.
                  </div>
                  <div>
                    <span className="font-semibold">NRC (Rent Credit):</span> Delta-neutral credit positions
                    generating enhanced yields from Net30-Net90 vendor payment float.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
