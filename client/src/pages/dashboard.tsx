import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  AlertCircle,
  Home,
  Landmark,
  Percent,
  Zap,
  Layers,
  ShieldAlert,
  Activity,
  Target,
  AlertTriangle,
  Brain,
  ArrowUpRight,
  ArrowDownRight,
  Radio,
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface KPIData {
  onTimePercent: number;
  dso: number;
  delinquentAmount: number;
  opexPerUnit: number;
  treasuryAUM: number;
  currentYield: number;
  vendorFloatAUM: number;
  vendorFloatYield: number;
  rentFloatYield: number;
  sparklineData: Array<{ value: number }>;
}

const riskAlerts = [
  { severity: "warning", title: "Elevated Delinquency — Pine Valley", desc: "5.6% volatility spike detected. 8 tenants flagged for early outreach.", time: "2h ago" },
  { severity: "info", title: "Vendor Float Approaching Net90", desc: "$45K in vendor invoices maturing in 5 days. Confirm payout routing.", time: "6h ago" },
  { severity: "success", title: "Collection Rate Improving", desc: "On-time payment rate up +2.5% MTD across portfolio. Incentive programs driving 68% conversion.", time: "1d ago" },
];

const anomalyData = [
  { month: "Sep", expected: 92, actual: 87, gap: -5 },
  { month: "Oct", expected: 92, actual: 89, gap: -3 },
  { month: "Nov", expected: 93, actual: 91, gap: -2 },
  { month: "Dec", expected: 93, actual: 90, gap: -3 },
  { month: "Jan", expected: 94, actual: 93, gap: -1 },
  { month: "Feb", expected: 94, actual: 95, gap: 1 },
];

export default function Dashboard() {
  const { data: kpis, isLoading } = useQuery<KPIData>({
    queryKey: ["/api/kpis"],
  });

  const kpiCards = [
    { title: "On-Time Payment", value: kpis?.onTimePercent ? `${kpis.onTimePercent.toFixed(1)}%` : "—", change: "+2.5%", trend: "up" as const, icon: Percent, color: "text-green-600" },
    { title: "DSO (Days)", value: kpis?.dso ? kpis.dso.toFixed(0) : "—", change: "-3 days", trend: "up" as const, icon: Clock, color: "text-blue-600" },
    { title: "Delinquent", value: kpis?.delinquentAmount ? `$${(kpis.delinquentAmount / 1000).toFixed(0)}K` : "—", change: "-12%", trend: "up" as const, icon: AlertCircle, color: "text-orange-600" },
    { title: "Opex/Unit", value: kpis?.opexPerUnit ? `$${kpis.opexPerUnit.toFixed(0)}` : "—", change: "+1.2%", trend: "down" as const, icon: Home, color: "text-purple-600" },
    { title: "Treasury AUM", value: kpis?.treasuryAUM ? `$${(kpis.treasuryAUM / 1000000).toFixed(1)}M` : "—", change: "+5.3%", trend: "up" as const, icon: Landmark, color: "text-indigo-600" },
    { title: "Current Yield", value: kpis?.currentYield ? `${kpis.currentYield.toFixed(2)}%` : "—", change: "+0.15%", trend: "up" as const, icon: DollarSign, color: "text-emerald-600" },
    { title: "Vendor Float", value: kpis?.vendorFloatAUM ? `$${(kpis.vendorFloatAUM / 1000).toFixed(0)}K` : "—", change: "Net30-90", trend: "up" as const, icon: Zap, color: "text-violet-600" },
    { title: "Vendor Yield", value: kpis?.vendorFloatYield ? `$${kpis.vendorFloatYield.toFixed(0)}` : "—", change: "All-Time", trend: "up" as const, icon: TrendingUp, color: "text-emerald-600" },
    { title: "Rent Float Yield", value: kpis?.rentFloatYield ? `$${kpis.rentFloatYield.toFixed(0)}` : "—", change: "Last 30d", trend: "up" as const, icon: TrendingUp, color: "text-emerald-600" },
  ];

  return (
    <div className="space-y-8" data-testid="page-dashboard">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight mb-2">Business Console</h1>
        <p className="text-muted-foreground">
          Real-time operational metrics — track rent collection, vendor payments, and treasury performance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((card, index) => (
          <Card key={card.title} className="hover-elevate" data-testid={`card-kpi-${index}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-baseline justify-between flex-wrap gap-1">
                  <div className="text-3xl font-mono tabular-nums font-semibold">
                    {isLoading ? <div className="h-9 w-24 bg-muted animate-pulse rounded" /> : card.value}
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    {card.trend === "up" ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <span className={card.trend === "up" ? "text-green-600" : "text-red-600"}>{card.change}</span>
                  </div>
                </div>
                {isLoading ? (
                  <div className="h-12 w-full bg-muted animate-pulse rounded" />
                ) : kpis?.sparklineData ? (
                  <ResponsiveContainer width="100%" height={48}>
                    <LineChart data={kpis.sparklineData}>
                      <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card data-testid="card-risk-alerts">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-orange-600" />
              <CardTitle>Operational Risk Alerts</CardTitle>
            </div>
            <CardDescription>Live anomaly detection and early warning indicators across your portfolio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {riskAlerts.map((alert, i) => (
              <div key={i} className="flex items-start gap-3 p-3 border rounded-lg" data-testid={`alert-${i}`}>
                {alert.severity === "warning" && <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />}
                {alert.severity === "info" && <Activity className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />}
                {alert.severity === "success" && <TrendingUp className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{alert.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{alert.desc}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{alert.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card data-testid="card-anomaly-detection">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <CardTitle>Collection Anomaly Detection</CardTitle>
            </div>
            <CardDescription>ML model: expected vs actual collection rate with gap analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={anomalyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} domain={[80, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip />
                  <Bar dataKey="expected" fill="hsl(var(--muted-foreground) / 0.3)" radius={[4, 4, 0, 0]} name="Expected" />
                  <Bar dataKey="actual" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Actual" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-primary/5 via-background to-background border-2 border-primary/10">
        <CardHeader>
          <CardTitle className="text-2xl">How Naltos Works: Automated Treasury Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Currency Never Changes</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Everyone operates in <strong>USD</strong> — tenants pay in USD, vendors receive USD, owners earn USD. Modern digital payment infrastructure provides <strong>invisible backend rails</strong> for instant settlement and programmability.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Treasury Generates Yield</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Idle USD is deployed into <strong>Treasury Bills</strong>, <strong>Money Markets</strong>, and <strong>Enhanced Credit</strong> products during predictable float windows.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Four Float Buckets</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                <strong>Immediate (0-3d)</strong>: Liquidity reserves &bull; <strong>Rent (5-15d)</strong>: Short-term T-Bills &bull; <strong>Vendor (30-90d)</strong>: Highest yield &bull; <strong>Merchant (1-3d)</strong>: Micro-float
              </p>
            </div>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg border border-muted text-sm">
            <p className="text-muted-foreground">
              <strong>Key Insight:</strong> Naltos doesn't change your currency — we simply use modern digital payment infrastructure in the backend to move USD faster, automate treasury management, and turn rent, vendor payments, and merchant transactions into a yield-generating financial system.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Treasury Allocation Strategy: Four Float Buckets</CardTitle>
          <p className="text-sm text-muted-foreground">
            Every USD flowing through Naltos is allocated to one of four duration-optimized buckets — each matched to predictable float windows and treasury products
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg space-y-3" data-testid="bucket-immediate">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-sm">Bucket A — Immediate Liquidity</h3>
                  <p className="text-xs text-muted-foreground">0-3 days</p>
                </div>
                <Clock className="w-4 h-4 text-cyan-600" />
              </div>
              <p className="text-xs text-muted-foreground">Emergency withdrawal reserve for merchant, P2P, vendor redemptions</p>
              <div className="space-y-1 text-xs mt-3">
                <div className="flex justify-between gap-1"><span className="text-muted-foreground">Cash/Bank Reserve</span><span className="font-mono">40-60%</span></div>
                <div className="flex justify-between gap-1"><span className="text-muted-foreground">Money Market</span><span className="font-mono">40-60%</span></div>
              </div>
            </div>
            <div className="p-4 border rounded-lg space-y-3" data-testid="bucket-rent">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-sm">Bucket B — Rent Float</h3>
                  <p className="text-xs text-muted-foreground">5-15 days</p>
                </div>
                <Home className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-xs text-muted-foreground">Predictable, short-duration float from multifamily rent payments</p>
              <div className="space-y-1 text-xs mt-3">
                <div className="flex justify-between gap-1"><span className="text-muted-foreground">T-Bills</span><span className="font-mono">70-80%</span></div>
                <div className="flex justify-between gap-1"><span className="text-muted-foreground">Money Market</span><span className="font-mono">20-30%</span></div>
                <div className="flex justify-between gap-1 border-t pt-1 mt-2"><span className="text-muted-foreground font-medium">10-day float yield (5% APY)</span><span className="font-mono text-primary">~$1,233/mo</span></div>
              </div>
            </div>
            <div className="p-4 border rounded-lg space-y-3" data-testid="bucket-vendor">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-sm">Bucket C — Vendor Float</h3>
                  <p className="text-xs text-muted-foreground">30-90 days</p>
                </div>
                <Zap className="w-4 h-4 text-violet-600" />
              </div>
              <p className="text-xs text-muted-foreground">Highest yield, longest duration (Net30-Net90 payment terms)</p>
              <div className="space-y-1 text-xs mt-3">
                <div className="flex justify-between gap-1"><span className="text-muted-foreground">T-Bills</span><span className="font-mono">50%</span></div>
                <div className="flex justify-between gap-1"><span className="text-muted-foreground">Money Market</span><span className="font-mono">30%</span></div>
                <div className="flex justify-between gap-1"><span className="text-muted-foreground">Enhanced Credit</span><span className="font-mono">20%</span></div>
              </div>
            </div>
            <div className="p-4 border rounded-lg space-y-3" data-testid="bucket-merchant">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-sm">Bucket D — Merchant/P2P Micro Float</h3>
                  <p className="text-xs text-muted-foreground">1-3 days</p>
                </div>
                <Layers className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs text-muted-foreground">High-volume, fast-moving merchant settlement float</p>
              <div className="space-y-1 text-xs mt-3">
                <div className="flex justify-between gap-1"><span className="text-muted-foreground">Money Market</span><span className="font-mono">50-70%</span></div>
                <div className="flex justify-between gap-1"><span className="text-muted-foreground">Liquidity Buffer</span><span className="font-mono">30-50%</span></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <NeuralIntelligencePanel />

      {isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          <div className="animate-pulse">Loading dashboard data...</div>
        </div>
      )}
    </div>
  );
}

function NeuralIntelligencePanel() {
  const { data: portfolio } = useQuery<any>({
    queryKey: ["/api/intelligence/portfolio"],
  });
  const { data: noiData } = useQuery<any>({
    queryKey: ["/api/intelligence/noi-forecast"],
  });
  const { data: inflectionData } = useQuery<any>({
    queryKey: ["/api/intelligence/inflection-points"],
  });

  const isLoadingIntelligence = !portfolio && !noiData && !inflectionData;

  if (isLoadingIntelligence) {
    return (
      <div className="grid lg:grid-cols-2 gap-6" data-testid="section-neural-intelligence-loading">
        <Card><CardContent className="p-6"><div className="h-48 bg-muted animate-pulse rounded" /></CardContent></Card>
        <Card><CardContent className="p-6"><div className="h-48 bg-muted animate-pulse rounded" /></CardContent></Card>
      </div>
    );
  }

  if (!portfolio || !noiData || !inflectionData) return null;

  const negativeInflections = inflectionData.inflectionPoints?.filter((ip: any) => ip.direction === "negative") || [];

  return (
    <div className="grid lg:grid-cols-2 gap-6" data-testid="section-neural-intelligence">
      <Card data-testid="card-neural-early-warning">
        <CardHeader>
          <div className="flex items-center gap-2 flex-wrap">
            <Brain className="w-5 h-5 text-primary" />
            <CardTitle>Neural Early Warning System</CardTitle>
            <Badge variant="secondary" className="text-xs" data-testid="badge-neural-live">
              <Radio className="w-3 h-3 mr-1 text-green-500 animate-pulse" />
              Live
            </Badge>
          </div>
          <CardDescription>Spiking neural network analysis of payment behavior — detecting pre-delinquency patterns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 border rounded-lg text-center" data-testid="metric-neural-activity">
              <p className="text-xs text-muted-foreground">Neural Activity</p>
              <p className="text-lg font-bold font-mono" data-testid="text-neural-activity-value">{((portfolio.neuralActivityLevel ?? 0) * 100).toFixed(0)}%</p>
            </div>
            <div className="p-3 border rounded-lg text-center" data-testid="metric-stability-score">
              <p className="text-xs text-muted-foreground">Stability Score</p>
              <p className="text-lg font-bold font-mono text-green-600 dark:text-green-400" data-testid="text-stability-score-value">{portfolio.portfolioStabilityScore?.toFixed(1)}</p>
            </div>
            <div className="p-3 border rounded-lg text-center" data-testid="metric-active-alerts">
              <p className="text-xs text-muted-foreground">Active Alerts</p>
              <p className="text-lg font-bold font-mono text-orange-600 dark:text-orange-400" data-testid="text-active-alerts-value">{portfolio.activeInflectionPoints}</p>
            </div>
          </div>

          {negativeInflections.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Predicted Inflection Points</p>
              {negativeInflections.slice(0, 3).map((ip: any) => (
                <div key={ip.id} className="flex items-center gap-3 p-2 border rounded-lg border-red-500/20 bg-red-500/5 flex-wrap" data-testid={`warning-${ip.id}`}>
                  <ArrowDownRight className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{ip.tenant || ip.property}</p>
                    <p className="text-xs text-muted-foreground">{ip.neuralDrivers?.[0]}</p>
                  </div>
                  <Badge variant="outline" className="text-xs flex-shrink-0">{(ip.probability * 100).toFixed(0)}%</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card data-testid="card-noi-neural-forecast">
        <CardHeader>
          <div className="flex items-center gap-2 flex-wrap">
            <TrendingUp className="w-5 h-5 text-primary" />
            <CardTitle>NOI Neural Forecast</CardTitle>
          </div>
          <CardDescription>6-month projection with optimistic/pessimistic uncertainty bands</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={noiData.forecast}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="month" fontSize={11} />
              <YAxis fontSize={11} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                formatter={(value: number) => [`$${(value / 1000).toFixed(0)}K`]}
              />
              <Area type="monotone" dataKey="optimistic" name="Optimistic" stroke="none" fill="#22c55e" fillOpacity={0.08} />
              <Area type="monotone" dataKey="pessimistic" name="Pessimistic" stroke="none" fill="#ef4444" fillOpacity={0.08} />
              <Line type="monotone" dataKey="neural" name="Neural" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="baseline" name="Baseline" stroke="#94a3b8" strokeWidth={1} strokeDasharray="5 5" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-between gap-2 text-xs flex-wrap">
            <span className="text-muted-foreground">
              Incentive ROI: <strong className="text-green-600 dark:text-green-400">{noiData.incentiveImpact?.roi}%</strong>
            </span>
            <span className="text-muted-foreground">
              Refinance Window: <strong className="text-primary">{noiData.refinanceTiming?.optimalWindow}</strong>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
