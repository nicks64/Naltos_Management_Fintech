import { useState } from "react";
import { useQuery, useMutation, skipToken } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, FileText, Clock, TrendingUp, Download, CreditCard, Coins, PiggyBank, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

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

// Custom hook to gate queries until vendorId is available
function useVendorQuery<T>(endpoint: string, vendorId?: string | null) {
  return useQuery<T>({
    queryKey: vendorId ? [endpoint, vendorId] : skipToken,
  });
}

export default function VendorPortal() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [rail, setRail] = useState<"ACH" | "PushToCard" | "OnChainStablecoin">("ACH");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);

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

  // Fetch vendor-specific orchestration data
  const { data: stablecoinAllocations, isLoading: stablecoinLoading } = useVendorQuery<{ allocations: StablecoinAllocation[] }>(
    "/api/vendor/stablecoin-allocations",
    effectiveVendorId
  );

  const { data: treasuryAllocations, isLoading: treasuryLoading } = useVendorQuery<{ allocations: TreasuryAllocation[] }>(
    "/api/vendor/treasury-allocations",
    effectiveVendorId
  );

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
      return await apiRequest("/api/vendor/redemptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
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
                  className="flex items-center justify-between p-4 border rounded-lg"
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
                  </div>
                </div>
              ))}
            </div>
          )}
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
    </div>
  );
}
