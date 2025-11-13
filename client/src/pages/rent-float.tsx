import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, TrendingUp, Clock, Users, Building, Wallet, ArrowRight } from "lucide-react";
import { format, parseISO } from "date-fns";

interface RentFloatPayment {
  id: string;
  amount: string;
  paidAt: Date;
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

  return (
    <div className="space-y-8" data-testid="page-rent-float">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Rent Float Treasury</h1>
        <p className="text-muted-foreground mt-2">
          Generate yield on rent payment float between tenant payment and owner disbursement
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card data-testid="card-total-float">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rent Float</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono font-semibold" data-testid="text-total-float">
              ${parseFloat(data.totalFloat).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Last 30 days rent payments
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-average-duration">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Float Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono font-semibold" data-testid="text-avg-duration">
              {data.averageDuration} days
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Payment to disbursement
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-monthly-yield">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Yield Generated</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono font-semibold text-emerald-600 dark:text-emerald-400" data-testid="text-monthly-yield">
              ${parseFloat(data.monthlyYield).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              At {yieldRate.toFixed(2)}% APY
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-enabled-status">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Float Status</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={data.config.rentFloatEnabled ? "default" : "secondary"} data-testid="badge-float-status">
                {data.config.rentFloatEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {data.recentPayments.length} payments in float
            </p>
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
                  <TableHead className="text-right">Yield Generated</TableHead>
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
