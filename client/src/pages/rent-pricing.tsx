import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Home,
  Users,
  Brain,
  Calendar,
  Target,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const pricingData = [
  { month: "Jan", marketRate: 1520, currentRent: 1480 },
  { month: "Feb", marketRate: 1535, currentRent: 1480 },
  { month: "Mar", marketRate: 1550, currentRent: 1490 },
  { month: "Apr", marketRate: 1570, currentRent: 1500 },
  { month: "May", marketRate: 1590, currentRent: 1520 },
  { month: "Jun", marketRate: 1620, currentRent: 1540 },
  { month: "Jul", marketRate: 1650, currentRent: 1560 },
  { month: "Aug", marketRate: 1670, currentRent: 1580 },
  { month: "Sep", marketRate: 1680, currentRent: 1600 },
  { month: "Oct", marketRate: 1660, currentRent: 1600 },
  { month: "Nov", marketRate: 1640, currentRent: 1610 },
  { month: "Dec", marketRate: 1650, currentRent: 1620 },
];

const leaseExpirationData = [
  { month: "Jan", count: 8 },
  { month: "Feb", count: 12 },
  { month: "Mar", count: 10 },
  { month: "Apr", count: 6 },
  { month: "May", count: 14 },
  { month: "Jun", count: 9 },
  { month: "Jul", count: 11 },
  { month: "Aug", count: 22 },
  { month: "Sep", count: 7 },
  { month: "Oct", count: 5 },
  { month: "Nov", count: 8 },
  { month: "Dec", count: 10 },
];

const totalLeases = leaseExpirationData.reduce((sum, d) => sum + d.count, 0);

const unitRecommendations = [
  { unit: "Unit 101", currentRent: 1480, marketRate: 1550, recommended: 1530, confidence: "High", delta: 50 },
  { unit: "Unit 204", currentRent: 1420, marketRate: 1520, recommended: 1505, confidence: "High", delta: 85 },
  { unit: "Unit 305", currentRent: 1600, marketRate: 1620, recommended: 1615, confidence: "Medium", delta: 15 },
  { unit: "Unit 412", currentRent: 1750, marketRate: 1680, recommended: 1710, confidence: "Low", delta: -40 },
  { unit: "Unit 508", currentRent: 1380, marketRate: 1490, recommended: 1470, confidence: "High", delta: 90 },
  { unit: "Unit 602", currentRent: 1550, marketRate: 1590, recommended: 1580, confidence: "Medium", delta: 30 },
];

const insights = [
  {
    icon: Calendar,
    title: "Stagger Q3 renewals to avoid 23% cluster in August",
    priority: "High",
  },
  {
    icon: TrendingUp,
    title: "Units 204-208 are $85/mo below market - gradual increase recommended",
    priority: "High",
  },
  {
    icon: Calendar,
    title: "Offer 14-month leases for Jan-Mar move-ins to smooth summer expirations",
    priority: "Medium",
  },
  {
    icon: Target,
    title: "Early renewal incentive of $50 off could improve retention by 8%",
    priority: "Medium",
  },
];

function getConfidenceBadge(level: string) {
  switch (level) {
    case "High":
      return <Badge variant="default" data-testid={`badge-confidence-high`}>{level}</Badge>;
    case "Medium":
      return <Badge variant="secondary" data-testid={`badge-confidence-medium`}>{level}</Badge>;
    case "Low":
      return <Badge variant="outline" data-testid={`badge-confidence-low`}>{level}</Badge>;
    default:
      return <Badge variant="outline">{level}</Badge>;
  }
}

function getPriorityBadge(priority: string) {
  switch (priority) {
    case "High":
      return <Badge variant="destructive" data-testid={`badge-priority-high`}>{priority}</Badge>;
    case "Medium":
      return <Badge variant="secondary" data-testid={`badge-priority-medium`}>{priority}</Badge>;
    default:
      return <Badge variant="outline">{priority}</Badge>;
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
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full mb-2" />
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><Skeleton className="h-5 w-48" /></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function RentPricing() {
  const { isLoading } = useQuery({
    queryKey: ["/api/rent-pricing"],
  });

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-8" data-testid="page-rent-pricing">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight mb-2">Rent Pricing Intelligence</h1>
        <p className="text-muted-foreground">
          AI-driven dynamic pricing and lease optimization to maximize yield
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="kpi-grid">
        <Card className="hover-elevate" data-testid="card-revenue-uplift">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue Uplift</CardTitle>
            <DollarSign className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono tabular-nums" data-testid="text-revenue-uplift">
              +$42,800/mo
            </div>
            <p className="text-xs text-muted-foreground mt-1">vs static pricing</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate" data-testid="card-optimal-occupancy">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Optimal Occupancy</CardTitle>
            <Home className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono tabular-nums" data-testid="text-optimal-occupancy">
              96.3%
            </div>
            <p className="text-xs text-muted-foreground mt-1">target: 95%</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate" data-testid="card-avg-rent-growth">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Rent Growth</CardTitle>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono tabular-nums" data-testid="text-avg-rent-growth">
              +3.2% YoY
            </div>
            <p className="text-xs text-muted-foreground mt-1">across all units</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate" data-testid="card-lease-renewal-rate">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lease Renewal Rate</CardTitle>
            <Users className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono tabular-nums" data-testid="text-lease-renewal-rate">
              82.5%
            </div>
            <p className="text-xs text-muted-foreground mt-1">current period</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card data-testid="card-pricing-chart">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <CardTitle>Market Rate vs Current Rent</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full" data-testid="chart-pricing">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pricingData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
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
                    tickFormatter={(v) => `$${v.toLocaleString()}`}
                    domain={[1400, 1750]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: "hsl(var(--popover-foreground))",
                    }}
                    formatter={(value: number, name: string) => [
                      `$${value.toLocaleString()}`,
                      name,
                    ]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="marketRate"
                    name="Market Rate"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="currentRent"
                    name="Current Rent"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-lease-expiration">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <CardTitle>Lease Expiration Distribution</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full" data-testid="chart-lease-expiration">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leaseExpirationData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
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
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: "hsl(var(--popover-foreground))",
                    }}
                    formatter={(value: number) => [`${value} leases`, "Expiring"]}
                  />
                  <Bar
                    dataKey="count"
                    name="Expiring Leases"
                    radius={[4, 4, 0, 0]}
                    fill="hsl(var(--chart-1))"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              {leaseExpirationData
                .filter((d) => (d.count / totalLeases) * 100 > 15)
                .map((d) => (
                  <Badge key={d.month} variant="destructive" data-testid={`badge-cluster-risk-${d.month.toLowerCase()}`}>
                    {d.month}: {((d.count / totalLeases) * 100).toFixed(0)}% cluster risk
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-pricing-recommendations">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <CardTitle>AI Pricing Recommendations</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unit</TableHead>
                <TableHead>Current Rent</TableHead>
                <TableHead>Market Rate</TableHead>
                <TableHead>Recommended</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unitRecommendations.map((row, index) => (
                <TableRow key={row.unit} data-testid={`row-unit-${index}`}>
                  <TableCell className="font-medium" data-testid={`text-unit-${index}`}>{row.unit}</TableCell>
                  <TableCell className="font-mono tabular-nums" data-testid={`text-current-rent-${index}`}>
                    ${row.currentRent.toLocaleString()}
                  </TableCell>
                  <TableCell className="font-mono tabular-nums" data-testid={`text-market-rate-${index}`}>
                    ${row.marketRate.toLocaleString()}
                  </TableCell>
                  <TableCell data-testid={`text-recommended-${index}`}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono tabular-nums font-semibold">
                        ${row.recommended.toLocaleString()}
                      </span>
                      <span className={`text-xs font-mono ${row.delta >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                        {row.delta >= 0 ? "+" : ""}${row.delta}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getConfidenceBadge(row.confidence)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" data-testid={`button-apply-${index}`}>Apply</Button>
                      <Button size="sm" variant="outline" data-testid={`button-adjust-${index}`}>Adjust</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card data-testid="card-optimization-insights">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <CardTitle>Optimization Insights</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <Card key={index} className="hover-elevate" data-testid={`card-insight-${index}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <insight.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {getPriorityBadge(insight.priority)}
                      </div>
                      <p className="text-sm" data-testid={`text-insight-${index}`}>
                        {insight.title}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}