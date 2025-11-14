import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap, Clock, TrendingUp, DollarSign, CheckCircle2, Circle, 
  X, Check, ArrowRight, AlertCircle, Wallet 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VendorInvoice {
  id: string;
  vendorId: string;
  vendorName: string;
  invoiceNumber: string;
  amount: string;
  invoiceDate: string;
  dueDate: string;
  scheduledPaymentDate: string;
  paymentTerms: string;
  status: "pending" | "paid_instant" | "paid_traditional";
  paidDate: string | null;
  advanceDate: string | null;
  paidViaInstant: boolean;
  instantAdvanceAmount: string | null;
  floatDurationDays: number | null;
  floatYieldRate: string | null;
  yieldGenerated: string | null;
  description: string;
}

export default function VendorPayments() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("pending");

  // Fetch vendor invoices
  const { data: invoicesData, isLoading } = useQuery<{ invoices: VendorInvoice[] }>({
    queryKey: ["/api/vendor-invoices"],
  });

  const invoices = invoicesData?.invoices || [];

  // Filter by status
  const pendingInvoices = invoices.filter((inv) => inv.status === "pending");
  const paidInstantInvoices = invoices.filter((inv) => inv.status === "paid_instant");
  const allInvoices = invoices;

  // Pay instant mutation
  const payInstantMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const response = await fetch(`/api/vendor-invoices/${invoiceId}/pay-instant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to pay vendor");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendor-invoices"] });
      const invoice = data.invoice as VendorInvoice;
      toast({
        title: "Vendor Paid Instantly!",
        description: `Locked in ${formatCurrency(invoice.yieldGenerated || "0")} yield over ${invoice.floatDurationDays} days`,
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: error.message || "Failed to process instant payment",
      });
    },
  });

  // Calculate metrics from paid instant invoices
  const totalYieldGenerated = paidInstantInvoices.reduce(
    (sum, inv) => sum + parseFloat(inv.yieldGenerated || "0"),
    0
  );
  const totalInstantVolume = paidInstantInvoices.reduce(
    (sum, inv) => sum + parseFloat(inv.amount),
    0
  );
  const avgFloatDuration = paidInstantInvoices.length > 0
    ? Math.round(
        paidInstantInvoices.reduce((sum, inv) => sum + (inv.floatDurationDays || 0), 0) /
          paidInstantInvoices.length
      )
    : 0;

  // Pending invoices metrics
  const pendingVolume = pendingInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
  
  // Calculate potential yield for pending invoices
  const potentialYield = pendingInvoices.reduce((sum, inv) => {
    const amount = parseFloat(inv.amount);
    const termDays = inv.paymentTerms.match(/\d+/)?.[0] || "30";
    const duration = parseInt(termDays);
    const yieldRate = 5.50 / 100; // 5.50% APY
    return sum + (amount * (duration / 365) * yieldRate);
  }, 0);

  // Annual projections
  const annualYieldGenerated = totalYieldGenerated * 12; // Assume monthly cadence
  const annualPotential = potentialYield * 12;

  // Rent float baseline for comparison (10 days average)
  const rentFloatBaseline = 10;
  const durationMultiplier = avgFloatDuration / rentFloatBaseline;

  const formatCurrency = (value: number | string) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(num);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getPaymentTermsDays = (terms: string): number => {
    const match = terms.match(/\d+/);
    return match ? parseInt(match[0]) : 30;
  };

  const getPaymentTermsBadge = (terms: string) => {
    const days = getPaymentTermsDays(terms);
    
    // Visual differentiation by term length
    if (days >= 90) {
      return (
        <Badge variant="default" data-testid={`badge-terms-${terms}`} className="gap-1">
          <TrendingUp className="h-3 w-3" />
          {terms}
        </Badge>
      );
    } else if (days >= 60) {
      return (
        <Badge variant="secondary" data-testid={`badge-terms-${terms}`} className="gap-1">
          <TrendingUp className="h-3 w-3" />
          {terms}
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" data-testid={`badge-terms-${terms}`}>
          {terms}
        </Badge>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="page-vendor-payments">
      {/* Hero: The Transformation */}
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-primary/5 via-background to-emerald-500/5 p-8">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-foreground mb-3" data-testid="text-page-title">
            Vendor Instant Payments
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl" data-testid="text-hero-description">
            {paidInstantInvoices.length > 0 ? (
              <>
                <span className="font-semibold text-foreground">{formatCurrency(totalInstantVolume)} (All-Time)</span> in vendor invoices paid instantly, 
                generating <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalYieldGenerated)} (All-Time Yield)</span> in 
                amplified yield. Traditional payment (waiting Net30-90) earns <span className="font-semibold text-destructive">$0</span>. 
                Naltos turns extended payment terms into <span className="font-semibold text-emerald-600 dark:text-emerald-400">day-zero vendor cash + 3-9× yield amplification</span>.
              </>
            ) : (
              <>
                Turn Net30-90 payment terms into <span className="font-semibold text-emerald-600 dark:text-emerald-400">instant vendor funding + amplified treasury yield</span>. 
                Pay vendors today, deploy float for {avgFloatDuration || 30}-90 days, earn 3-9× vs rent float baseline.
              </>
            )}
          </p>
        </div>
      </div>

      {/* Before/After Comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Traditional Model */}
        <Card className="border-destructive/30" data-testid="card-traditional-model">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Traditional Payment</CardTitle>
              <X className="h-5 w-5 text-destructive" />
            </div>
            <CardDescription>What you're losing on vendor float</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-baseline justify-between mb-1">
                <p className="text-sm text-muted-foreground">Current Pending Volume</p>
                <p className="text-xl font-mono font-semibold">{formatCurrency(pendingVolume)}</p>
              </div>
              <div className="flex items-baseline justify-between mb-1">
                <p className="text-sm text-muted-foreground">Average Float Duration</p>
                <p className="text-xl font-mono font-semibold text-destructive">30-90 days idle</p>
              </div>
              <div className="flex items-baseline justify-between mb-1">
                <p className="text-sm text-muted-foreground">Monthly Yield on Float</p>
                <p className="text-2xl font-mono font-bold text-destructive">$0</p>
              </div>
              <div className="flex items-baseline justify-between mb-1 pt-2 border-t">
                <p className="text-sm text-muted-foreground">Annual Opportunity Cost</p>
                <p className="text-xl font-mono font-bold text-muted-foreground">{formatCurrency(annualPotential)}</p>
              </div>
            </div>
            <div className="pt-2 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <X className="h-4 w-4 text-destructive" />
                <span>Vendors wait 30-90 days</span>
              </div>
              <div className="flex items-center gap-2">
                <X className="h-4 w-4 text-destructive" />
                <span>Float sits idle, earning nothing</span>
              </div>
              <div className="flex items-center gap-2">
                <X className="h-4 w-4 text-destructive" />
                <span>No yield amplification</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Naltos Instant Model */}
        <Card className="border-emerald-500/30 bg-emerald-500/5" data-testid="card-naltos-model">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Naltos Instant Payments</CardTitle>
              <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <CardDescription>Day-zero vendor cash + amplified yield</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-baseline justify-between mb-1">
                <p className="text-sm text-muted-foreground">All-Time Instant Volume</p>
                <p className="text-xl font-mono font-semibold">{formatCurrency(totalInstantVolume)}</p>
              </div>
              <div className="flex items-baseline justify-between mb-1">
                <p className="text-sm text-muted-foreground">Avg Float Duration (Per Payment)</p>
                <p className="text-xl font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  {avgFloatDuration} days @ 5.50% APY
                </p>
              </div>
              <div className="flex items-baseline justify-between mb-1">
                <p className="text-sm text-muted-foreground">All-Time Yield Generated</p>
                <p className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(totalYieldGenerated)}
                </p>
              </div>
              <div className="flex items-baseline justify-between mb-1 pt-2 border-t">
                <p className="text-sm text-muted-foreground">Annual Yield Projection (Est.)</p>
                <p className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  +{formatCurrency(annualYieldGenerated)}
                </p>
              </div>
            </div>
            <div className="pt-2 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Zap className="h-4 w-4" />
                <span className="font-medium">Vendors paid instantly (same-day)</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">Float deployed for 30-90 days</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Check className="h-4 w-4" />
                <span className="font-medium">{durationMultiplier.toFixed(1)}× yield vs rent float</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Yield Amplification Explainer */}
      <Card data-testid="card-yield-amplifier">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            The 3-9× Yield Amplifier: Extended Payment Terms
          </CardTitle>
          <CardDescription>
            Longer float duration (Net30-90 vs rent's ~10 days) = proportionally amplified treasury yield
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 border rounded-lg bg-card hover-elevate" data-testid="card-net30-explainer">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-muted-foreground">Net30 Terms</div>
                <Badge variant="outline" className="gap-1">
                  ~3× Baseline
                </Badge>
              </div>
              <div className="text-3xl font-bold mt-1 mb-2">30 Days</div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Float duration: 30 days</div>
                <div>vs Rent float: ~10 days</div>
                <div className="font-semibold text-foreground pt-1">= 3× duration multiplier</div>
              </div>
            </div>

            <div className="p-5 border rounded-lg bg-card hover-elevate" data-testid="card-net60-explainer">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-muted-foreground">Net60 Terms</div>
                <Badge variant="secondary" className="gap-1">
                  <TrendingUp className="h-3 w-3" />
                  ~6× Baseline
                </Badge>
              </div>
              <div className="text-3xl font-bold mt-1 mb-2">60 Days</div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Float duration: 60 days</div>
                <div>vs Rent float: ~10 days</div>
                <div className="font-semibold text-foreground pt-1">= 6× duration multiplier</div>
              </div>
            </div>

            <div className="p-5 border rounded-lg bg-emerald-500/10 border-emerald-500/30 hover-elevate" data-testid="card-net90-explainer">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-muted-foreground">Net90 Terms</div>
                <Badge variant="default" className="gap-1">
                  <TrendingUp className="h-3 w-3" />
                  ~9× Baseline
                </Badge>
              </div>
              <div className="text-3xl font-bold mt-1 mb-2 text-emerald-600 dark:text-emerald-400">90 Days</div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Float duration: 90 days</div>
                <div>vs Rent float: ~10 days</div>
                <div className="font-semibold text-emerald-600 dark:text-emerald-400 pt-1">= 9× maximum amplification!</div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold mb-1">How It Works</p>
                <p className="text-muted-foreground">
                  When you pay a vendor instantly, Naltos holds the float until the scheduled payment date (Net30/60/90). 
                  This extended deployment period (3-9× longer than rent float's ~10 days) generates proportionally amplified treasury yield 
                  at the same 5.50% APY rate. Same yield rate, longer duration = higher total yield.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Tables */}
      <Card data-testid="card-invoices">
        <CardHeader>
          <CardTitle>Vendor Invoices</CardTitle>
          <CardDescription>
            Pay vendors instantly to unlock day-zero cash for them + amplified treasury yield for you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList data-testid="tabs-invoice-status">
              <TabsTrigger value="pending" data-testid="tab-pending">
                <Circle className="h-3 w-3 mr-1" />
                Pending ({pendingInvoices.length})
              </TabsTrigger>
              <TabsTrigger value="paid" data-testid="tab-paid">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Paid Instant ({paidInstantInvoices.length})
              </TabsTrigger>
              <TabsTrigger value="all" data-testid="tab-all">
                All Invoices ({allInvoices.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {pendingInvoices.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground" data-testid="text-no-pending">
                  <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium">No pending invoices</p>
                  <p className="text-sm mt-1">All vendors are paid</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="text-sm">
                      <span className="font-semibold">{formatCurrency(potentialYield)}</span> potential monthly yield available
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Pay all {pendingInvoices.length} invoices to lock in
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Terms</TableHead>
                        <TableHead>Scheduled Payment</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingInvoices.map((invoice) => {
                        const termDays = getPaymentTermsDays(invoice.paymentTerms);
                        const estimatedYield = parseFloat(invoice.amount) * (termDays / 365) * 0.055;
                        
                        return (
                          <TableRow key={invoice.id} data-testid={`row-invoice-${invoice.invoiceNumber}`}>
                            <TableCell className="font-mono text-sm" data-testid={`text-invoice-number-${invoice.invoiceNumber}`}>
                              {invoice.invoiceNumber}
                            </TableCell>
                            <TableCell data-testid={`text-vendor-${invoice.vendorName}`}>
                              <div>
                                <div className="font-medium">{invoice.vendorName}</div>
                                <div className="text-xs text-muted-foreground">{invoice.description}</div>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono font-semibold" data-testid={`text-amount-${invoice.invoiceNumber}`}>
                              {formatCurrency(invoice.amount)}
                            </TableCell>
                            <TableCell>
                              {getPaymentTermsBadge(invoice.paymentTerms)}
                              <div className="text-xs text-muted-foreground mt-1">
                                ~{formatCurrency(estimatedYield)} yield
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {formatDate(invoice.scheduledPaymentDate)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                onClick={() => payInstantMutation.mutate(invoice.id)}
                                disabled={payInstantMutation.isPending}
                                data-testid={`button-pay-instant-${invoice.invoiceNumber}`}
                                className="gap-1"
                              >
                                <Zap className="h-4 w-4" />
                                Pay Instant + Lock Yield
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="paid" className="space-y-4">
              {paidInstantInvoices.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground" data-testid="text-no-paid">
                  <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium">No instant payments yet</p>
                  <p className="text-sm mt-1">Start paying vendors instantly to generate amplified yield</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Terms</TableHead>
                      <TableHead>Float Duration</TableHead>
                      <TableHead>Yield Generated</TableHead>
                      <TableHead>Paid Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paidInstantInvoices.map((invoice) => (
                      <TableRow key={invoice.id} data-testid={`row-paid-${invoice.invoiceNumber}`}>
                        <TableCell className="font-mono text-sm" data-testid={`text-paid-invoice-${invoice.invoiceNumber}`}>
                          {invoice.invoiceNumber}
                        </TableCell>
                        <TableCell data-testid={`text-paid-vendor-${invoice.vendorName}`}>
                          <div>
                            <div className="font-medium">{invoice.vendorName}</div>
                            <div className="text-xs text-muted-foreground">{invoice.description}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono font-semibold">
                          {formatCurrency(invoice.amount)}
                        </TableCell>
                        <TableCell>{getPaymentTermsBadge(invoice.paymentTerms)}</TableCell>
                        <TableCell data-testid={`text-float-duration-${invoice.invoiceNumber}`}>
                          <div className="flex items-center gap-1 font-medium">
                            <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="font-mono text-emerald-600 dark:text-emerald-400">
                              {invoice.floatDurationDays} days
                            </span>
                          </div>
                        </TableCell>
                        <TableCell data-testid={`text-yield-${invoice.invoiceNumber}`}>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(invoice.yieldGenerated || "0")}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {invoice.paidDate && formatDate(invoice.paidDate)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              {allInvoices.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground" data-testid="text-no-invoices">
                  <p>No invoices found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Terms</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Yield</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allInvoices.map((invoice) => (
                      <TableRow key={invoice.id} data-testid={`row-all-${invoice.invoiceNumber}`}>
                        <TableCell className="font-mono text-sm">
                          {invoice.invoiceNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{invoice.vendorName}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {invoice.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono font-semibold">
                          {formatCurrency(invoice.amount)}
                        </TableCell>
                        <TableCell>{getPaymentTermsBadge(invoice.paymentTerms)}</TableCell>
                        <TableCell>
                          {invoice.status === "pending" && (
                            <Badge variant="outline" data-testid={`badge-status-pending-${invoice.invoiceNumber}`} className="gap-1">
                              <Circle className="h-3 w-3" />
                              Pending
                            </Badge>
                          )}
                          {invoice.status === "paid_instant" && (
                            <Badge variant="default" data-testid={`badge-status-paid-${invoice.invoiceNumber}`} className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Paid Instant
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-mono">
                          {invoice.yieldGenerated ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                              {formatCurrency(invoice.yieldGenerated)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {invoice.status === "pending" ? (
                            <Button
                              size="sm"
                              onClick={() => payInstantMutation.mutate(invoice.id)}
                              disabled={payInstantMutation.isPending}
                              data-testid={`button-pay-all-${invoice.invoiceNumber}`}
                              className="gap-1"
                            >
                              <Zap className="h-4 w-4" />
                              Pay + Lock
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">Completed</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
