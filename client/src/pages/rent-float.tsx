import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign, TrendingUp, Clock, Building, Wallet, ArrowRight, X, Check,
  Zap, Gift, PiggyBank, Activity, BarChart3, Brain, Radio, Gauge,
  ArrowUpRight, ArrowDownRight, Shield, Lightbulb, Target, RefreshCw
} from "lucide-react";
import { format, parseISO } from "date-fns";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, ComposedChart, Line
} from "recharts";

interface RentFloatPayment {
  id: string;
  amount: string;
  paidAt: string;
  daysInFloat: number;
  yieldGenerated: string;
}

interface MonthlyTrend {
  month: string;
  floatBalance: number;
  yieldGenerated: number;
  utilization: number;
}

interface DeploymentProduct {
  product: string;
  allocation: number;
  apy: number;
  balance: number;
}

interface FloatVelocity {
  currentBalance: number;
  deployedBalance: number;
  utilization: number;
  avgCycleTime: number;
  turnoverRate: number;
  dailyYield: number;
  projectedAnnualYield: number;
  weightedAPY: number;
}

interface FloatIntelligence {
  optimalDeploymentMix: string;
  paymentTimingInsight: string;
  seasonalForecast: string;
  riskAssessment: string;
  confidenceScore: number;
}

interface EnhancedRentFloatData {
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
  monthlyTrend: MonthlyTrend[];
  deploymentAllocation: DeploymentProduct[];
  floatVelocity: FloatVelocity;
  floatIntelligence: FloatIntelligence;
}

const DEPLOYMENT_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

function FloatPerformanceChart({ trend }: { trend: MonthlyTrend[] }) {
  return (
    <Card data-testid="card-float-performance">
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <CardTitle>Float Performance</CardTitle>
            <CardDescription>12-month float balance and yield generation trend</CardDescription>
          </div>
          <Badge variant="secondary" data-testid="badge-trailing-12m">Trailing 12M</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72" data-testid="chart-float-performance">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs fill-muted-foreground" tick={{ fontSize: 11 }} />
              <YAxis
                yAxisId="left"
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  fontSize: "12px",
                  color: "hsl(var(--popover-foreground))",
                }}
                formatter={(value: number, name: string) => {
                  if (name === "Float Balance") return [`$${value.toLocaleString()}`, name];
                  return [`$${value.toLocaleString()}`, name];
                }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="floatBalance"
                name="Float Balance"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary) / 0.1)"
                strokeWidth={2}
              />
              <Bar
                yAxisId="right"
                dataKey="yieldGenerated"
                name="Yield Generated"
                fill="hsl(var(--chart-2))"
                radius={[3, 3, 0, 0]}
                barSize={18}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-6 mt-4 text-xs text-muted-foreground flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-primary/30 border border-primary" />
            <span>Float Balance (left axis)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "hsl(var(--chart-2))" }} />
            <span>Monthly Yield (right axis)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DeploymentAllocationChart({ allocation }: { allocation: DeploymentProduct[] }) {
  return (
    <Card data-testid="card-deployment-allocation">
      <CardHeader>
        <CardTitle>Treasury Deployment</CardTitle>
        <CardDescription>Float allocation across yield-generating products</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-56" data-testid="chart-deployment-pie">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="allocation"
                  nameKey="product"
                >
                  {allocation.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={DEPLOYMENT_COLORS[index % DEPLOYMENT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                    fontSize: "12px",
                    color: "hsl(var(--popover-foreground))",
                  }}
                  formatter={(value: number) => [`${value}%`, "Allocation"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {allocation.map((item, idx) => (
              <div key={item.product} className="flex items-center justify-between gap-3 p-3 border rounded-lg" data-testid={`deployment-product-${idx}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: DEPLOYMENT_COLORS[idx] }} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{item.product}</p>
                    <p className="text-xs text-muted-foreground">{item.apy}% APY</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-mono font-semibold">{item.allocation}%</p>
                  <p className="text-xs text-muted-foreground font-mono">${item.balance.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FloatVelocityPanel({ velocity }: { velocity: FloatVelocity }) {
  const utilizationColor = velocity.utilization >= 90
    ? "text-emerald-600 dark:text-emerald-400"
    : velocity.utilization >= 75
      ? "text-amber-600 dark:text-amber-400"
      : "text-red-600 dark:text-red-400";

  return (
    <Card data-testid="card-float-velocity">
      <CardHeader>
        <div className="flex items-center gap-2 flex-wrap">
          <Gauge className="w-5 h-5 text-primary" />
          <CardTitle>Float Velocity</CardTitle>
          <Badge variant="secondary" data-testid="badge-velocity-live">
            <Radio className="w-3 h-3 mr-1 text-green-500 animate-pulse" />
            Live
          </Badge>
        </div>
        <CardDescription>Real-time deployment efficiency and turnover metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 border rounded-lg text-center" data-testid="metric-deployed-balance">
            <p className="text-xs text-muted-foreground">Deployed</p>
            <p className="text-lg font-bold font-mono" data-testid="text-deployed-balance">${velocity.deployedBalance.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">of ${velocity.currentBalance.toLocaleString()}</p>
          </div>
          <div className="p-3 border rounded-lg text-center" data-testid="metric-utilization">
            <p className="text-xs text-muted-foreground">Utilization</p>
            <p className={`text-lg font-bold font-mono ${utilizationColor}`} data-testid="text-utilization">{velocity.utilization}%</p>
            <p className="text-xs text-muted-foreground">deployment rate</p>
          </div>
          <div className="p-3 border rounded-lg text-center" data-testid="metric-turnover">
            <p className="text-xs text-muted-foreground">Turnover Rate</p>
            <p className="text-lg font-bold font-mono" data-testid="text-turnover">{velocity.turnoverRate}x</p>
            <p className="text-xs text-muted-foreground">cycles / month</p>
          </div>
          <div className="p-3 border rounded-lg text-center" data-testid="metric-weighted-apy">
            <p className="text-xs text-muted-foreground">Weighted APY</p>
            <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400" data-testid="text-weighted-apy">{velocity.weightedAPY}%</p>
            <p className="text-xs text-muted-foreground">blended rate</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-6 flex-wrap">
              <div data-testid="metric-daily-yield">
                <p className="text-xs text-muted-foreground">Daily Yield</p>
                <p className="text-sm font-mono font-semibold text-emerald-600 dark:text-emerald-400">${velocity.dailyYield}/day</p>
              </div>
              <div data-testid="metric-cycle-time">
                <p className="text-xs text-muted-foreground">Avg Cycle</p>
                <p className="text-sm font-mono font-semibold">{velocity.avgCycleTime} days</p>
              </div>
              <div data-testid="metric-projected-annual">
                <p className="text-xs text-muted-foreground">Projected Annual</p>
                <p className="text-sm font-mono font-semibold text-primary">${velocity.projectedAnnualYield.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FloatIntelligencePanel({ intelligence }: { intelligence: FloatIntelligence }) {
  const insights = [
    { icon: Target, label: "Optimal Deployment", text: intelligence.optimalDeploymentMix, color: "text-primary" },
    { icon: Clock, label: "Payment Timing", text: intelligence.paymentTimingInsight, color: "text-amber-600 dark:text-amber-400" },
    { icon: TrendingUp, label: "Seasonal Forecast", text: intelligence.seasonalForecast, color: "text-emerald-600 dark:text-emerald-400" },
    { icon: Shield, label: "Risk Assessment", text: intelligence.riskAssessment, color: "text-blue-600 dark:text-blue-400" },
  ];

  return (
    <Card data-testid="card-float-intelligence">
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Brain className="w-5 h-5 text-primary" />
            <CardTitle>Float Intelligence</CardTitle>
            <Badge variant="secondary" data-testid="badge-neural-confidence">
              <Radio className="w-3 h-3 mr-1 text-green-500 animate-pulse" />
              {intelligence.confidenceScore}% confidence
            </Badge>
          </div>
        </div>
        <CardDescription>Neural analysis of float deployment patterns and optimization opportunities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, idx) => (
            <div key={idx} className="p-4 border rounded-lg space-y-2" data-testid={`insight-${idx}`}>
              <div className="flex items-center gap-2">
                <insight.icon className={`w-4 h-4 ${insight.color}`} />
                <p className="text-sm font-semibold">{insight.label}</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{insight.text}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function RentFloat() {
  const { data, isLoading } = useQuery<EnhancedRentFloatData>({
    queryKey: ["/api/rent-float/enhanced"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="page-rent-float-loading">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-muted animate-pulse rounded-lg" />)}
        </div>
        <div className="h-72 bg-muted animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const yieldRate = parseFloat(data.config.rentFloatYieldRate || "5.50");
  const ownerPct = parseFloat(data.config.rentFloatOwnerShare || "3.00");
  const tenantPct = parseFloat(data.config.rentFloatTenantShare || "1.25");
  const naltosPct = parseFloat(data.config.rentFloatNaltosShare || "0.75");

  const monthlyRent = parseFloat(data.totalFloat) || 0;
  const monthlyYield = parseFloat(data.monthlyYield) || 0;
  const annualRent = monthlyRent * 12;
  const annualYield = monthlyYield * 12;
  const totalSharePct = ownerPct + tenantPct + naltosPct;
  const annualizedOwnerBenefit = totalSharePct > 0 ? annualYield * (ownerPct / totalSharePct) : 0;
  const annualizedTenantReward = totalSharePct > 0 ? annualYield * (tenantPct / totalSharePct) : 0;
  const noiBasisPoints = annualRent > 0 ? (annualizedOwnerBenefit / annualRent) * 10000 : 0;

  return (
    <div className="space-y-6" data-testid="page-rent-float">
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-primary/5 via-background to-emerald-500/5 p-6 md:p-8">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">Rent Float Treasury</h1>
            <Badge variant="secondary" data-testid="badge-float-active">
              <Activity className="w-3 h-3 mr-1 text-emerald-500" />
              Active
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            {monthlyRent > 0 ? (
              <>
                <span className="font-medium text-foreground">${monthlyRent.toLocaleString()}</span> in rent flowed through in the last 30 days.
                Automated treasury deployment generated <span className="font-medium text-emerald-600 dark:text-emerald-400">${monthlyYield.toLocaleString()}</span> in yield
                at a weighted <span className="font-medium text-foreground">{data.floatVelocity.weightedAPY}% APY</span>.
              </>
            ) : (
              "Configure your rent float settings to start generating yield on idle cash."
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card data-testid="card-kpi-float-balance">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Float</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono font-bold" data-testid="text-kpi-float-balance">
              ${(data.floatVelocity.currentBalance).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.floatVelocity.utilization}% deployed
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-kpi-monthly-yield">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Yield</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400" data-testid="text-kpi-monthly-yield">
              ${monthlyYield.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ${data.floatVelocity.dailyYield}/day avg
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-kpi-weighted-apy">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weighted APY</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono font-bold text-primary" data-testid="text-kpi-weighted-apy">
              {data.floatVelocity.weightedAPY}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              across {data.deploymentAllocation.length} products
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-kpi-owner-noi">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Owner NOI Impact</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono font-bold" data-testid="text-kpi-owner-noi">
              +${annualizedOwnerBenefit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {noiBasisPoints.toFixed(0)} bps / yr
            </p>
          </CardContent>
        </Card>
      </div>

      <FloatPerformanceChart trend={data.monthlyTrend} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DeploymentAllocationChart allocation={data.deploymentAllocation} />
        <FloatVelocityPanel velocity={data.floatVelocity} />
      </div>

      <Tabs defaultValue="distribution" data-testid="tabs-details">
        <TabsList>
          <TabsTrigger value="distribution" data-testid="tab-distribution">Yield Distribution</TabsTrigger>
          <TabsTrigger value="comparison" data-testid="tab-comparison">Model Comparison</TabsTrigger>
          <TabsTrigger value="payments" data-testid="tab-payments">Recent Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="distribution" className="mt-4">
          <Card data-testid="card-yield-distribution">
            <CardHeader>
              <CardTitle>Yield Distribution</CardTitle>
              <CardDescription>How generated yield flows to stakeholders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg" data-testid="yield-share-owners">
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Owners</span>
                    </div>
                    <Badge variant="outline">{ownerPct.toFixed(1)}%</Badge>
                  </div>
                  <p className="text-xl font-mono font-semibold" data-testid="text-owner-share">${parseFloat(data.ownerShare).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">Monthly share</p>
                </div>
                <div className="p-4 border rounded-lg" data-testid="yield-share-tenants">
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-sm font-medium">Tenants</span>
                    </div>
                    <Badge variant="outline">{tenantPct.toFixed(1)}%</Badge>
                  </div>
                  <p className="text-xl font-mono font-semibold" data-testid="text-tenant-share">${parseFloat(data.tenantShare).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">Cashback pool</p>
                </div>
                <div className="p-4 border rounded-lg" data-testid="yield-share-naltos">
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-sm font-medium">Platform</span>
                    </div>
                    <Badge variant="outline">{naltosPct.toFixed(1)}%</Badge>
                  </div>
                  <p className="text-xl font-mono font-semibold" data-testid="text-naltos-share">${parseFloat(data.naltosShare).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">Operations</p>
                </div>
                <div className="p-4 border rounded-lg bg-muted/30" data-testid="yield-share-total">
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm font-medium">Total</span>
                    </div>
                    <Badge variant="outline">100%</Badge>
                  </div>
                  <p className="text-xl font-mono font-bold" data-testid="text-total-yield">${monthlyYield.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">${annualYield.toLocaleString()}/yr</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <h4 className="text-sm font-semibold mb-3">Cash Flow Model</h4>
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  <div className="flex flex-col items-center gap-1 p-4 bg-primary/5 rounded-lg border border-primary/20 min-w-fit" data-testid="flow-step-payment">
                    <Wallet className="h-6 w-6 text-primary" />
                    <p className="text-xs font-medium">Payment</p>
                    <p className="text-[10px] text-muted-foreground">Day 0</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex flex-col items-center gap-1 p-4 bg-primary/5 rounded-lg border border-primary/20 min-w-fit" data-testid="flow-step-deploy">
                    <RefreshCw className="h-6 w-6 text-primary" />
                    <p className="text-xs font-medium">Deploy</p>
                    <p className="text-[10px] text-muted-foreground">Instant</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex flex-col items-center gap-1 p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/30 min-w-fit" data-testid="flow-step-yield">
                    <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    <p className="text-xs font-medium">Yield</p>
                    <p className="text-[10px] text-muted-foreground">{data.averageDuration} days</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex flex-col items-center gap-1 p-4 bg-accent/50 rounded-lg border border-accent min-w-fit" data-testid="flow-step-disburse">
                    <Building className="h-6 w-6 text-accent-foreground" />
                    <p className="text-xs font-medium">Disburse</p>
                    <p className="text-[10px] text-muted-foreground">Day {data.averageDuration}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="mt-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-destructive/30" data-testid="card-traditional-model">
              <CardHeader>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <CardTitle className="text-lg">Traditional Model</CardTitle>
                  <X className="h-5 w-5 text-destructive" />
                </div>
                <CardDescription>Revenue lost to idle cash</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <p className="text-sm text-muted-foreground">30-Day Rent Flow</p>
                  <p className="text-lg font-mono font-semibold">${monthlyRent.toLocaleString()}</p>
                </div>
                <div className="flex items-baseline justify-between">
                  <p className="text-sm text-muted-foreground">Cash Sits Idle</p>
                  <p className="text-lg font-mono font-semibold">{data.averageDuration} days</p>
                </div>
                <div className="flex items-baseline justify-between">
                  <p className="text-sm text-muted-foreground">Monthly Yield</p>
                  <p className="text-xl font-mono font-bold text-destructive">$0</p>
                </div>
                <div className="flex items-baseline justify-between pt-2 border-t">
                  <p className="text-sm text-muted-foreground">Annual Opportunity Cost</p>
                  <p className="text-lg font-mono font-bold text-muted-foreground">${annualYield.toLocaleString()}</p>
                </div>
                <div className="pt-2 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><X className="h-4 w-4 text-destructive flex-shrink-0" /><span>No tenant incentives</span></div>
                  <div className="flex items-center gap-2"><X className="h-4 w-4 text-destructive flex-shrink-0" /><span>No automated deployment</span></div>
                  <div className="flex items-center gap-2"><X className="h-4 w-4 text-destructive flex-shrink-0" /><span>Manual treasury management</span></div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-500/30 bg-emerald-500/5" data-testid="card-naltos-model">
              <CardHeader>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <CardTitle className="text-lg">Naltos Model</CardTitle>
                  <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <CardDescription>Automated yield on every dollar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <p className="text-sm text-muted-foreground">30-Day Rent Flow</p>
                  <p className="text-lg font-mono font-semibold">${monthlyRent.toLocaleString()}</p>
                </div>
                <div className="flex items-baseline justify-between">
                  <p className="text-sm text-muted-foreground">Auto-deployed</p>
                  <p className="text-lg font-mono font-semibold text-emerald-600 dark:text-emerald-400">{data.averageDuration} days @ {data.floatVelocity.weightedAPY}%</p>
                </div>
                <div className="flex items-baseline justify-between">
                  <p className="text-sm text-muted-foreground">Monthly Yield</p>
                  <p className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400">${monthlyYield.toLocaleString()}</p>
                </div>
                <div className="flex items-baseline justify-between pt-2 border-t">
                  <p className="text-sm text-muted-foreground">Annual Net Improvement</p>
                  <p className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400">+${annualYield.toLocaleString()}</p>
                </div>
                <div className="pt-2 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400"><Check className="h-4 w-4 flex-shrink-0" /><span className="font-medium">Tenant cashback ({tenantPct.toFixed(1)}% share)</span></div>
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400"><Check className="h-4 w-4 flex-shrink-0" /><span className="font-medium">24/7 automated treasury</span></div>
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400"><Check className="h-4 w-4 flex-shrink-0" /><span className="font-medium">{data.floatVelocity.utilization}% deployment utilization</span></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <Card data-testid="card-recent-payments">
            <CardHeader>
              <CardTitle>Recent Payments in Float</CardTitle>
              <CardDescription>Last 30 days of rent payments contributing to yield generation</CardDescription>
            </CardHeader>
            <CardContent>
              {data.recentPayments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <PiggyBank className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="font-medium">No payments in float period</p>
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
                      <TableHead className="text-right">Yield</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.recentPayments.map((payment) => (
                      <TableRow key={payment.id} data-testid={`row-payment-${payment.id}`}>
                        <TableCell className="font-mono text-xs">{payment.id.substring(0, 8)}</TableCell>
                        <TableCell>{format(parseISO(payment.paidAt.toString()), "MMM d, yyyy")}</TableCell>
                        <TableCell className="text-right font-mono">${parseFloat(payment.amount).toLocaleString()}</TableCell>
                        <TableCell className="text-right">{payment.daysInFloat} days</TableCell>
                        <TableCell className="text-right font-mono text-emerald-600 dark:text-emerald-400">${parseFloat(payment.yieldGenerated).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <FloatIntelligencePanel intelligence={data.floatIntelligence} />
    </div>
  );
}