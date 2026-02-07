import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  Shield,
  TrendingUp,
  Users,
  BarChart3,
  Clock,
  AlertTriangle,
  CheckCircle,
  Loader2,
  ShieldCheck,
  Percent,
  PiggyBank,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const programs = [
  {
    id: "zero-deposit",
    name: "Zero-Deposit Program",
    description: "Eliminate traditional security deposits entirely. Tenants pay a small monthly fee instead, increasing lease conversion rates and reducing vacancy.",
    monthlyCost: 12,
    adoption: 94,
    totalCoverage: 425000,
    claimMultiplier: 6,
    claimRate: 0.8,
  },
  {
    id: "deposit-insurance",
    name: "Deposit Insurance",
    description: "Replace cash deposits with affordable insurance policies. Tenants keep their savings while properties maintain full damage coverage.",
    monthlyCost: 8,
    adoption: 78,
    totalCoverage: 312000,
    claimMultiplier: 4,
    claimRate: 1.2,
  },
  {
    id: "flexible-deposit",
    name: "Flexible Deposit",
    description: "Custom deposit program allowing tenants to pay a reduced upfront deposit with supplemental coverage. One-time enrollment fee structure.",
    monthlyCost: 0,
    adoption: 45,
    totalCoverage: 110000,
    claimMultiplier: 2,
    claimRate: 2.1,
  },
];

const liquidityData = [
  { month: "Oct", amount: 125000 },
  { month: "Nov", amount: 138000 },
  { month: "Dec", amount: 142000 },
  { month: "Jan", amount: 155000 },
  { month: "Feb", amount: 148000 },
  { month: "Mar", amount: 140000 },
];

const propertyData = [
  { property: "Sunset Towers", units: 120, enrolled: 114, coverage: 95.0, program: "Zero-Deposit", monthlyCost: 1368 },
  { property: "Maple Gardens", units: 85, enrolled: 72, coverage: 84.7, program: "Deposit Insurance", monthlyCost: 576 },
  { property: "Oak Ridge", units: 200, enrolled: 192, coverage: 96.0, program: "Zero-Deposit", monthlyCost: 2304 },
  { property: "Harbor View", units: 156, enrolled: 140, coverage: 89.7, program: "Flexible Deposit", monthlyCost: 0 },
  { property: "Pine Valley", units: 42, enrolled: 38, coverage: 90.5, program: "Deposit Insurance", monthlyCost: 304 },
];

const claimsData = [
  { unit: "Sunset #412", amount: 3200, status: "Resolved", date: "2025-12-15" },
  { unit: "Maple #207", amount: 1850, status: "Pending", date: "2026-01-22" },
  { unit: "Oak Ridge #108", amount: 5400, status: "Under Review", date: "2026-01-28" },
  { unit: "Harbor #305", amount: 2100, status: "Resolved", date: "2025-11-10" },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "Resolved":
      return <Badge variant="secondary" data-testid={`badge-status-resolved`}>{status}</Badge>;
    case "Pending":
      return <Badge variant="outline" data-testid={`badge-status-pending`}>{status}</Badge>;
    case "Under Review":
      return <Badge variant="destructive" data-testid={`badge-status-review`}>{status}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8" data-testid="loading-skeleton">
      <div>
        <Skeleton className="h-10 w-72 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-5 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><Skeleton className="h-5 w-48" /></CardHeader>
        <CardContent><Skeleton className="h-[280px] w-full" /></CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full mb-2" />
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
        <CardContent>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full mb-2" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function DepositAlternatives() {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/deposit-alternatives"],
  });

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-8" data-testid="page-deposit-alternatives">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight mb-2">Deposit Alternatives</h1>
        <p className="text-muted-foreground">
          Reduce vacancy costs and unlock capital with modern deposit programs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="kpi-grid">
        <Card className="hover-elevate" data-testid="card-capital-unlocked">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Capital Unlocked</CardTitle>
            <DollarSign className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono tabular-nums" data-testid="text-capital-unlocked">
              $847,500
            </div>
            <p className="text-xs text-muted-foreground mt-1">From eliminating traditional deposits</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate" data-testid="card-active-programs">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Programs</CardTitle>
            <ShieldCheck className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono tabular-nums" data-testid="text-active-programs">
              3
            </div>
            <p className="text-xs text-muted-foreground mt-1">Programs active</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate" data-testid="card-coverage-rate">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Coverage Rate</CardTitle>
            <Percent className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono tabular-nums" data-testid="text-coverage-rate">
              94.2%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Of units covered</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate" data-testid="card-avg-savings">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Savings Per Unit</CardTitle>
            <PiggyBank className="w-5 h-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono tabular-nums" data-testid="text-avg-savings">
              $1,250
            </div>
            <p className="text-xs text-muted-foreground mt-1">Per unit vs traditional deposits</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Deposit Programs</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" data-testid="programs-grid">
          {programs.map((program) => (
            <Card key={program.id} className="hover-elevate" data-testid={`card-program-${program.id}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{program.name}</CardTitle>
                <CardDescription className="text-xs">{program.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">Monthly Cost</span>
                  <span className="text-sm font-mono font-semibold" data-testid={`text-cost-${program.id}`}>
                    {program.monthlyCost === 0 ? "$0 (one-time fee)" : `$${program.monthlyCost}/mo per unit`}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">Adoption Rate</span>
                  <span className="text-sm font-mono font-semibold" data-testid={`text-adoption-${program.id}`}>
                    {program.adoption}%
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">Total Coverage</span>
                  <span className="text-sm font-mono font-semibold" data-testid={`text-coverage-${program.id}`}>
                    ${program.totalCoverage.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">Claim Coverage</span>
                  <span className="text-sm font-mono font-semibold" data-testid={`text-multiplier-${program.id}`}>
                    {program.claimMultiplier}x
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">Claim Rate</span>
                  <span className="text-sm font-mono font-semibold" data-testid={`text-claim-rate-${program.id}`}>
                    {program.claimRate}%
                  </span>
                </div>
                <Button className="w-full mt-2" variant="outline" data-testid={`button-manage-${program.id}`}>
                  Manage
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card data-testid="card-liquidity-analysis">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <div>
              <CardTitle>Liquidity Analysis</CardTitle>
              <CardDescription>Monthly capital freed up over the last 6 months</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full" data-testid="chart-liquidity">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={liquidityData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  className="text-xs fill-muted-foreground"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  className="text-xs fill-muted-foreground"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                    fontSize: "12px",
                    color: "hsl(var(--popover-foreground))",
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Capital Freed"]}
                />
                <Bar dataKey="amount" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-coverage-by-property">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <div>
              <CardTitle>Coverage by Property</CardTitle>
              <CardDescription>Enrollment and program details across properties</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Units</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead>Coverage %</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Monthly Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {propertyData.map((row, index) => (
                <TableRow key={row.property} data-testid={`row-property-${index}`}>
                  <TableCell className="font-medium">{row.property}</TableCell>
                  <TableCell className="font-mono tabular-nums">{row.units}</TableCell>
                  <TableCell className="font-mono tabular-nums">{row.enrolled}</TableCell>
                  <TableCell className="font-mono tabular-nums">{row.coverage.toFixed(1)}%</TableCell>
                  <TableCell>
                    <Badge variant="secondary" data-testid={`badge-program-${index}`}>{row.program}</Badge>
                  </TableCell>
                  <TableCell className="font-mono tabular-nums">
                    {row.monthlyCost === 0 ? "N/A" : `$${row.monthlyCost.toLocaleString()}`}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card data-testid="card-risk-claims">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary" />
            <div>
              <CardTitle>Risk & Claims</CardTitle>
              <CardDescription>Year-to-date claims activity and resolution metrics</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col items-center p-4 border rounded-md" data-testid="metric-total-claims">
              <span className="text-sm text-muted-foreground mb-1">Total Claims YTD</span>
              <span className="text-2xl font-bold font-mono tabular-nums">$18,450</span>
            </div>
            <div className="flex flex-col items-center p-4 border rounded-md" data-testid="metric-avg-resolution">
              <span className="text-sm text-muted-foreground mb-1">Avg Resolution</span>
              <span className="text-2xl font-bold font-mono tabular-nums">12 days</span>
            </div>
            <div className="flex flex-col items-center p-4 border rounded-md" data-testid="metric-loss-ratio">
              <span className="text-sm text-muted-foreground mb-1">Loss Ratio</span>
              <span className="text-2xl font-bold font-mono tabular-nums">2.1%</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Recent Claims</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {claimsData.map((claim, index) => (
                  <TableRow key={index} data-testid={`row-claim-${index}`}>
                    <TableCell className="font-medium">{claim.unit}</TableCell>
                    <TableCell className="font-mono tabular-nums">${claim.amount.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(claim.status)}</TableCell>
                    <TableCell className="text-muted-foreground">{claim.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
