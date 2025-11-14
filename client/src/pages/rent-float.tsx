import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, TrendingUp, Clock, Users, Building, Wallet, ArrowRight, X, Check, Zap, Gift, PiggyBank } from "lucide-react";
import { format, parseISO } from "date-fns";

interface RentFloatPayment {
  id: string;
  amount: string;
  paidAt: string; // ISO string from server
  daysInFloat: number;
  yieldGenerated: string;
}

interface RentFloatData {
  config: {
    rentFloatEnabled: boolean;
    rentFloatYieldRate: string;
    rentFloatOwnerShare: string;
    rentFloatTenantShare: string;
    rentFloatNaltosShare: string;
    rentFloatDefaultDuration: number;
  };
  totalFloat: string;
  averageDuration: number;
  monthlyYield: string;
  ownerShare: string;
  tenantShare: string;
  naltosShare: string;
  recentPayments: RentFloatPayment[];
}

export default function RentFloat() {
  const { data, isLoading } = useQuery<RentFloatData>({
    queryKey: ["/api/rent-float"],
  });

  if (isLoading) {
    return (
      <div className="space-y-8" data-testid="page-rent-float">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const yieldRate = parseFloat(data.config.rentFloatYieldRate || "5.50");
  const ownerPct = parseFloat(data.config.rentFloatOwnerShare || "3.00");
  const tenantPct = parseFloat(data.config.rentFloatTenantShare || "1.25");
  const naltosPct = parseFloat(data.config.rentFloatNaltosShare || "0.75");

  // Guard against missing data
  const monthlyRent = parseFloat(data.totalFloat) || 0;
  const monthlyYield = parseFloat(data.monthlyYield) || 0;
  
  // Traditional baseline: $0 yield (rent sits idle earning nothing)
  const traditionalYield = 0;
  
  // Naltos model: Actual yield generated
  const annualRent = monthlyRent * 12;
  const annualYield = monthlyYield * 12;
  const annualizedOwnerBenefit = annualYield * (ownerPct / (ownerPct + tenantPct + naltosPct));
  const annualizedTenantReward = annualYield * (tenantPct / (ownerPct + tenantPct + naltosPct));
  
  // NOI improvement: owner benefit as % of annual rent, converted to basis points (1% = 100 bps)
  const noiBasisPoints = annualRent > 0 ? (annualizedOwnerBenefit / annualRent) * 10000 : 0;

  return (
    <div className="space-y-8" data-testid="page-rent-float">
      {/* Hero: The Transformation */}
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-primary/5 via-background to-emerald-500/5 p-8">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-foreground mb-3">Rent Float Treasury</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            {monthlyRent > 0 ? (
              <>
                In the last 30 days, <span className="font-semibold text-foreground">${monthlyRent.toLocaleString()}</span> in rent flowed through the system. 
                Traditional property management earns <span className="font-semibold text-destructive">$0</span> on this float. 
                Naltos automated treasury generated <span className="font-semibold text-emerald-600 dark:text-emerald-400">${monthlyYield.toLocaleString()}</span> in yield.
              </>
            ) : (
              "Configure your rent float settings to start generating yield on idle cash"
            )}
          </p>
        </div>
      </div>

      {/* Before/After Comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Traditional Model */}
        <Card className="border-destructive/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Traditional Model</CardTitle>
              <X className="h-5 w-5 text-destructive" />
            </div>
            <CardDescription>What you're losing every month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-baseline justify-between mb-1">
                <p className="text-sm text-muted-foreground">30-Day Rent Flow</p>
                <p className="text-xl font-mono font-semibold">${monthlyRent.toLocaleString()}</p>
              </div>
              <div className="flex items-baseline justify-between mb-1">
                <p className="text-sm text-muted-foreground">Sits Idle</p>
                <p className="text-xl font-mono font-semibold">{data.averageDuration} days</p>
              </div>
              <div className="flex items-baseline justify-between mb-1">
                <p className="text-sm text-muted-foreground">Monthly Yield</p>
                <p className="text-2xl font-mono font-bold text-destructive">${traditionalYield.toFixed(0)}</p>
              </div>
              <div className="flex items-baseline justify-between mb-1 pt-2 border-t">
                <p className="text-sm text-muted-foreground">Annual Opportunity Cost</p>
                <p className="text-xl font-mono font-bold text-muted-foreground">${annualYield.toLocaleString()}</p>
              </div>
            </div>
            <div className="pt-2 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <X className="h-4 w-4 text-destructive" />
                <span>No tenant incentives</span>
              </div>
              <div className="flex items-center gap-2">
                <X className="h-4 w-4 text-destructive" />
                <span>No automated deployment</span>
              </div>
              <div className="flex items-center gap-2">
                <X className="h-4 w-4 text-destructive" />
                <span>Manual treasury management</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Naltos Model */}
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Naltos Model</CardTitle>
              <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <CardDescription>Automated yield on every dollar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-baseline justify-between mb-1">
                <p className="text-sm text-muted-foreground">30-Day Rent Flow</p>
                <p className="text-xl font-mono font-semibold">${monthlyRent.toLocaleString()}</p>
              </div>
              <div className="flex items-baseline justify-between mb-1">
                <p className="text-sm text-muted-foreground">Auto-deployed</p>
                <p className="text-xl font-mono font-semibold text-emerald-600 dark:text-emerald-400">{data.averageDuration} days @ {yieldRate.toFixed(2)}%</p>
              </div>
              <div className="flex items-baseline justify-between mb-1">
                <p className="text-sm text-muted-foreground">Monthly Yield</p>
                <p className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">${monthlyYield.toLocaleString()}</p>
              </div>
              <div className="flex items-baseline justify-between mb-1 pt-2 border-t">
                <p className="text-sm text-muted-foreground">Annual Net Improvement</p>
                <p className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400">+${annualYield.toLocaleString()}</p>
              </div>
            </div>
            <div className="pt-2 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Check className="h-4 w-4" />
                <span className="font-medium">Tenant rewards ({tenantPct.toFixed(2)}% share)</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Check className="h-4 w-4" />
                <span className="font-medium">24/7 automated treasury</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Check className="h-4 w-4" />
                <span className="font-medium">Instant settlement ready</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Value Distribution */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card data-testid="card-owner-benefit">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Owner NOI Impact</CardTitle>
            <Building className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-bold text-primary" data-testid="text-owner-benefit">
              +${annualizedOwnerBenefit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {ownerPct.toFixed(2)}% share · {noiBasisPoints.toFixed(0)} basis points NOI improvement
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              From ${annualRent.toLocaleString()} annual rent flow
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-tenant-rewards">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tenant Rewards Pool</CardTitle>
            <Gift className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-bold text-emerald-600 dark:text-emerald-400" data-testid="text-tenant-rewards">
              ${annualizedTenantReward.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {tenantPct.toFixed(2)}% share · Distributed as rent rebates & rewards
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Reduces effective rent cost for participants
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-platform-operations">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Yield Created</CardTitle>
            <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-bold" data-testid="text-total-yield">
              ${annualYield.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From ${(monthlyRent * 12).toLocaleString()} annual rent flow
            </p>
            <div className="mt-3 pt-3 border-t">
              <p className="text-sm font-medium">Effective yield rate on rent</p>
              <p className="text-lg font-mono font-semibold mt-1">
                {annualRent > 0 ? ((annualYield / annualRent) * 100).toFixed(3) : 0}% annually
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-flow-diagram">
        <CardHeader>
          <CardTitle>Rent Float Cash Flow Model</CardTitle>
          <CardDescription>
            Visual representation of how rent payments generate yield before owner disbursement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4 min-w-fit">
                <div className="flex flex-col items-center gap-2 p-6 bg-primary/5 rounded-lg border-2 border-primary/20">
                  <Wallet className="h-8 w-8 text-primary" />
                  <div className="text-center">
                    <p className="text-sm font-medium">Tenant Payment</p>
                    <p className="text-xs text-muted-foreground mt-1">Day 0</p>
                  </div>
                </div>
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
              </div>

              <div className="flex items-center gap-4 min-w-fit">
                <div className="flex flex-col items-center gap-2 p-6 bg-emerald-500/10 rounded-lg border-2 border-emerald-500/30">
                  <TrendingUp className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  <div className="text-center">
                    <p className="text-sm font-medium">Yield Generation</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {data.averageDuration} days @ {yieldRate.toFixed(2)}%
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
              </div>

              <div className="flex flex-col items-center gap-2 p-6 bg-accent/50 rounded-lg border-2 border-accent">
                <Building className="h-8 w-8 text-accent-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium">Owner Disbursement</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Day {data.averageDuration}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t">
              <h4 className="text-sm font-semibold mb-4">Yield Distribution</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg" data-testid="yield-share-owners">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Property Owners</span>
                    <Badge variant="outline">{ownerPct.toFixed(2)}%</Badge>
                  </div>
                  <p className="text-xl font-mono font-semibold">
                    ${parseFloat(data.ownerShare).toLocaleString()}
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg" data-testid="yield-share-tenants">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Tenant Rebates</span>
                    <Badge variant="outline">{tenantPct.toFixed(2)}%</Badge>
                  </div>
                  <p className="text-xl font-mono font-semibold">
                    ${parseFloat(data.tenantShare).toLocaleString()}
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg" data-testid="yield-share-naltos">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Naltos Platform</span>
                    <Badge variant="outline">{naltosPct.toFixed(2)}%</Badge>
                  </div>
                  <p className="text-xl font-mono font-semibold">
                    ${parseFloat(data.naltosShare).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-recent-payments">
        <CardHeader>
          <CardTitle>Recent Payments in Float</CardTitle>
          <CardDescription>
            Last 30 days of rent payments contributing to yield generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.recentPayments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No payments in float period</p>
              <p className="text-sm mt-1">Payments will appear here as tenants pay rent</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Days in Float</TableHead>
                  <TableHead className="text-right">Yield (Per Payment)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentPayments.map((payment) => (
                  <TableRow key={payment.id} data-testid={`row-payment-${payment.id}`}>
                    <TableCell className="font-mono text-xs">
                      {payment.id.substring(0, 8)}
                    </TableCell>
                    <TableCell>
                      {format(parseISO(payment.paidAt.toString()), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ${parseFloat(payment.amount).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {payment.daysInFloat} days
                    </TableCell>
                    <TableCell className="text-right font-mono text-emerald-600 dark:text-emerald-400">
                      ${parseFloat(payment.yieldGenerated).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
