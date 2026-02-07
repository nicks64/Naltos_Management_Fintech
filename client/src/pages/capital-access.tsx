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
  TrendingUp,
  TrendingDown,
  Building2,
  Shield,
  Banknote,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  Clock,
  Activity,
  BarChart3,
  Landmark,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const dscrData = [
  { month: "Jan", dscr: 1.28 },
  { month: "Feb", dscr: 1.30 },
  { month: "Mar", dscr: 1.31 },
  { month: "Apr", dscr: 1.33 },
  { month: "May", dscr: 1.35 },
  { month: "Jun", dscr: 1.34 },
  { month: "Jul", dscr: 1.36 },
  { month: "Aug", dscr: 1.38 },
  { month: "Sep", dscr: 1.37 },
  { month: "Oct", dscr: 1.39 },
  { month: "Nov", dscr: 1.41 },
  { month: "Dec", dscr: 1.42 },
];

const fundingOpportunities = [
  { source: "StackSource Marketplace", type: "Commercial Mortgage", amount: "$5M", terms: "6.2% 30yr", status: "Pre-Qualified", action: "Apply" },
  { source: "CrowdStreet", type: "Syndication", amount: "$2M", terms: "8% preferred return", status: "Open", action: "Review" },
  { source: "Naltos Capital", type: "Bridge Loan", amount: "$1.5M", terms: "7.8% 24mo", status: "Available", action: "Request" },
  { source: "Federal Programs", type: "HUD 223(f)", amount: "$8M", terms: "5.1% 35yr", status: "Eligible", action: "Explore" },
  { source: "Private Equity", type: "Equity Partnership", amount: "$3M", terms: "12% IRR target", status: "Negotiating", action: "Details" },
];

const readinessFactors = [
  { label: "NOI Trend", value: "Strong", detail: "up 8.2% YoY", icon: TrendingUp, color: "text-green-600" },
  { label: "Occupancy", value: "Excellent", detail: "96.3%", icon: CheckCircle, color: "text-green-600" },
  { label: "Debt Maturity", value: "12 months", detail: "", icon: Clock, color: "text-amber-600" },
  { label: "Documentation", value: "85% complete", detail: "", icon: FileText, color: "text-blue-600" },
];

const portfolioMetrics = [
  { label: "NOI", value: "$1.86M/yr", trend: "up", change: "+6.2%" },
  { label: "Cap Rate", value: "5.8%", trend: "stable", change: "+0.1%" },
  { label: "LTV", value: "68%", trend: "down", change: "-2.3%" },
  { label: "Vacancy Loss", value: "3.7%", trend: "down", change: "-0.5%" },
  { label: "Opex Ratio", value: "42%", trend: "down", change: "-1.8%" },
  { label: "Revenue Growth", value: "+4.1%", trend: "up", change: "+0.9%" },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "Pre-Qualified":
      return <Badge variant="default" data-testid={`badge-status-prequalified`}>{status}</Badge>;
    case "Open":
      return <Badge variant="secondary" data-testid={`badge-status-open`}>{status}</Badge>;
    case "Available":
      return <Badge variant="default" data-testid={`badge-status-available`}>{status}</Badge>;
    case "Eligible":
      return <Badge variant="secondary" data-testid={`badge-status-eligible`}>{status}</Badge>;
    case "Negotiating":
      return <Badge variant="outline" data-testid={`badge-status-negotiating`}>{status}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function getTrendIcon(trend: string) {
  if (trend === "up") return <ArrowUpRight className="w-4 h-4 text-green-600" />;
  if (trend === "down") return <ArrowDownRight className="w-4 h-4 text-green-600" />;
  return <Activity className="w-4 h-4 text-muted-foreground" />;
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
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><Skeleton className="h-5 w-48" /></CardHeader>
          <CardContent><Skeleton className="h-[300px] w-full" /></CardContent>
        </Card>
        <Card>
          <CardHeader><Skeleton className="h-5 w-48" /></CardHeader>
          <CardContent><Skeleton className="h-[300px] w-full" /></CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><Skeleton className="h-5 w-48" /></CardHeader>
        <CardContent>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full mb-2" />
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><Skeleton className="h-5 w-48" /></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CapitalAccess() {
  const { isLoading } = useQuery({
    queryKey: ["/api/capital-access"],
  });

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-8" data-testid="page-capital-access">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight mb-2">Capital Access</h1>
        <p className="text-muted-foreground">
          Alternative financing, syndication, and refinancing readiness for your portfolio
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="kpi-grid">
        <Card className="hover-elevate" data-testid="card-portfolio-valuation">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Portfolio Valuation</CardTitle>
            <Building2 className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono tabular-nums" data-testid="text-portfolio-valuation">
              $24.8M
            </div>
            <p className="text-xs text-muted-foreground mt-1">Current market estimate</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate" data-testid="card-dscr-score">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">DSCR Score</CardTitle>
            <Shield className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono tabular-nums" data-testid="text-dscr-score">
              1.42x
            </div>
            <p className="text-xs text-muted-foreground mt-1">Debt Service Coverage Ratio</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate" data-testid="card-available-capital">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available Capital</CardTitle>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono tabular-nums" data-testid="text-available-capital">
              $3.2M
            </div>
            <p className="text-xs text-muted-foreground mt-1">From various sources</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate" data-testid="card-refinance-savings">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Refinance Savings</CardTitle>
            <Banknote className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono tabular-nums" data-testid="text-refinance-savings">
              $18,500/mo
            </div>
            <p className="text-xs text-muted-foreground mt-1">Potential at current rates</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card data-testid="card-refinance-readiness">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Landmark className="w-5 h-5 text-primary" />
              <CardTitle>Refinance Readiness Score</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center">
              <div className="relative w-36 h-36">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="10"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth="10"
                    strokeDasharray={`${(78 / 100) * 2 * Math.PI * 52} ${2 * Math.PI * 52}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold font-mono" data-testid="text-readiness-score">78</span>
                  <span className="text-xs text-muted-foreground">/100</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <Badge variant="secondary" data-testid="badge-readiness-good">Good</Badge>
            </div>
            <div className="space-y-3">
              {readinessFactors.map((factor) => (
                <div key={factor.label} className="flex items-center justify-between gap-2" data-testid={`readiness-factor-${factor.label.toLowerCase().replace(/\s/g, '-')}`}>
                  <div className="flex items-center gap-2">
                    <factor.icon className={`w-4 h-4 ${factor.color}`} />
                    <span className="text-sm">{factor.label}</span>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {factor.value}{factor.detail ? ` \u2014 ${factor.detail}` : ""}
                  </span>
                </div>
              ))}
            </div>
            <Button className="w-full" data-testid="button-generate-lender-package">
              <FileText className="w-4 h-4 mr-2" />
              Generate Lender Package
            </Button>
          </CardContent>
        </Card>

        <Card data-testid="card-dscr-chart">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <CardTitle>DSCR Performance</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] w-full" data-testid="chart-dscr-trend">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dscrData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="month"
                    className="text-xs fill-muted-foreground"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    className="text-xs fill-muted-foreground"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    domain={[1.2, 1.5]}
                    tickFormatter={(v) => `${v.toFixed(2)}x`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: "hsl(var(--popover-foreground))",
                    }}
                    formatter={(value: number) => [`${value.toFixed(2)}x`, "DSCR"]}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <ReferenceLine
                    y={1.25}
                    stroke="hsl(var(--destructive))"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: "Min Threshold (1.25x)",
                      position: "insideBottomRight",
                      fill: "hsl(var(--destructive))",
                      fontSize: 10,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="dscr"
                    name="DSCR"
                    stroke="hsl(var(--chart-1))"
                    fill="hsl(var(--chart-1) / 0.15)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-funding-opportunities">
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <CardTitle>Active Funding Opportunities</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount Available</TableHead>
                <TableHead>Rate/Terms</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fundingOpportunities.map((opp, index) => (
                <TableRow key={index} data-testid={`row-funding-${index}`}>
                  <TableCell className="font-medium" data-testid={`text-source-${index}`}>{opp.source}</TableCell>
                  <TableCell data-testid={`text-type-${index}`}>{opp.type}</TableCell>
                  <TableCell className="font-mono" data-testid={`text-amount-${index}`}>{opp.amount}</TableCell>
                  <TableCell className="text-muted-foreground" data-testid={`text-terms-${index}`}>{opp.terms}</TableCell>
                  <TableCell>{getStatusBadge(opp.status)}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" data-testid={`button-action-${index}`}>
                      {opp.action}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card data-testid="card-portfolio-metrics">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <CardTitle>Portfolio Metrics for Lenders</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4" data-testid="metrics-grid">
            {portfolioMetrics.map((metric) => (
              <div
                key={metric.label}
                className="p-4 rounded-md border flex flex-col gap-1"
                data-testid={`metric-${metric.label.toLowerCase().replace(/\s/g, '-')}`}
              >
                <span className="text-sm text-muted-foreground">{metric.label}</span>
                <span className="text-xl font-bold font-mono tabular-nums">{metric.value}</span>
                <div className="flex items-center gap-1">
                  {getTrendIcon(metric.trend)}
                  <span className="text-xs text-muted-foreground">{metric.change}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
