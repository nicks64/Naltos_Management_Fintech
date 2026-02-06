import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ShieldCheck,
  Activity,
  Users,
  Download,
  Target,
  BarChart3,
  ArrowUpRight,
  Home,
  FileText,
  Sparkles,
  Brain,
  Zap,
  Radio,
} from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  YAxis,
  XAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
  PieChart,
  Pie,
} from "recharts";

const mockVolatility = [
  { month: "Sep", volatility: 5.1, onTime: 87 },
  { month: "Oct", volatility: 4.2, onTime: 89 },
  { month: "Nov", volatility: 3.8, onTime: 91 },
  { month: "Dec", volatility: 3.5, onTime: 90 },
  { month: "Jan", volatility: 2.1, onTime: 93 },
  { month: "Feb", volatility: 1.8, onTime: 95 },
];

const mockRiskHeatmap = [
  { property: "Sunset Towers", units: 120, riskScore: 12, volatility: 1.2, onTime: 96 },
  { property: "Maple Gardens", units: 85, riskScore: 28, volatility: 2.8, onTime: 91 },
  { property: "Riverdale Apts", units: 64, riskScore: 45, volatility: 4.1, onTime: 84 },
  { property: "Oak Ridge", units: 200, riskScore: 8, volatility: 0.9, onTime: 97 },
  { property: "Pine Valley", units: 42, riskScore: 62, volatility: 5.6, onTime: 78 },
  { property: "Harbor View", units: 156, riskScore: 15, volatility: 1.5, onTime: 94 },
];

const mockDelinquencyTiers = [
  { tier: "Green (0-5d)", count: 412, pct: 82.4, color: "#22c55e" },
  { tier: "Yellow (6-15d)", count: 52, pct: 10.4, color: "#eab308" },
  { tier: "Orange (16-30d)", count: 24, pct: 4.8, color: "#f97316" },
  { tier: "Red (31-60d)", count: 9, pct: 1.8, color: "#ef4444" },
  { tier: "Critical (60d+)", count: 3, pct: 0.6, color: "#991b1b" },
];

const mockCohortTracker = [
  { month: "Sep", tier1: 15, tier2: 8, tier3: 2 },
  { month: "Oct", tier1: 18, tier2: 10, tier3: 3 },
  { month: "Nov", tier1: 22, tier2: 12, tier3: 4 },
  { month: "Dec", tier1: 25, tier2: 14, tier3: 5 },
  { month: "Jan", tier1: 30, tier2: 16, tier3: 6 },
  { month: "Feb", tier1: 35, tier2: 19, tier3: 8 },
];

const mockRtoOpportunities = [
  { tenant: "Maria G.", unit: "Sunset #412", streak: 24, creditScore: 710, tier: 3, readiness: 92, monthlyRent: 1650 },
  { tenant: "James W.", unit: "Oak #108", streak: 18, creditScore: 685, tier: 2, readiness: 78, monthlyRent: 1400 },
  { tenant: "Sarah C.", unit: "Harbor #203", streak: 14, creditScore: 640, tier: 2, readiness: 65, monthlyRent: 1500 },
  { tenant: "David L.", unit: "Maple #305", streak: 12, creditScore: 620, tier: 1, readiness: 48, monthlyRent: 1350 },
  { tenant: "Lisa R.", unit: "Sunset #201", streak: 10, creditScore: 590, tier: 1, readiness: 35, monthlyRent: 1550 },
];

function getRiskColor(score: number) {
  if (score <= 15) return "text-green-600";
  if (score <= 30) return "text-yellow-600";
  if (score <= 50) return "text-orange-600";
  return "text-red-600";
}

function getRiskBg(score: number) {
  if (score <= 15) return "bg-green-100 dark:bg-green-900/30";
  if (score <= 30) return "bg-yellow-100 dark:bg-yellow-900/30";
  if (score <= 50) return "bg-orange-100 dark:bg-orange-900/30";
  return "bg-red-100 dark:bg-red-900/30";
}

function getTierBadge(tier: number) {
  const variants: Record<number, { label: string; className: string }> = {
    1: { label: "Tier 1 - Stable", className: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" },
    2: { label: "Tier 2 - FHA Ready", className: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" },
    3: { label: "Tier 3 - NACA Qualified", className: "bg-primary/10 text-primary" },
  };
  const v = variants[tier] || variants[1];
  return <Badge variant="secondary" className={v.className}>{v.label}</Badge>;
}

export default function RentStability() {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: stabilityData, isLoading } = useQuery({
    queryKey: ["/api/rent-stability"],
  });

  return (
    <div className="space-y-6" data-testid="page-rent-stability">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight mb-2">Rent Stability & Capital Intelligence</h1>
          <p className="text-muted-foreground">
            Portfolio-level risk analytics, delinquency forecasting, and ownership transition tracking
          </p>
        </div>
        <Button variant="outline" data-testid="button-export-refinance">
          <Download className="w-4 h-4 mr-2" />
          Export Refinance Package
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover-elevate" data-testid="card-volatility">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Portfolio Volatility</CardTitle>
            <Activity className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">1.8%</div>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <TrendingDown className="w-3 h-3" />
              -2.4% vs last quarter
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate" data-testid="card-delinquency">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Delinquency Reduction</CardTitle>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">14.2%</div>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              NOI uplift target met
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate" data-testid="card-ownership-pipeline">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ownership Pipeline</CardTitle>
            <Users className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">62 Tenants</div>
            <p className="text-xs text-muted-foreground mt-1">
              35 Tier 1 / 19 Tier 2 / 8 Tier 3
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate" data-testid="card-predictive-risk">
          <CardHeader className="flex flex-row items-center justify-between gap-1 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Payment Probability</CardTitle>
            <Target className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">94.2%</div>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              +3.1% from incentives
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList data-testid="tabs-stability">
          <TabsTrigger value="overview" data-testid="tab-overview">Volatility & Risk</TabsTrigger>
          <TabsTrigger value="delinquency" data-testid="tab-delinquency">Delinquency Tiers</TabsTrigger>
          <TabsTrigger value="cohort" data-testid="tab-cohort">Ownership Cohort</TabsTrigger>
          <TabsTrigger value="rto" data-testid="tab-rto">Rent-to-Own Index</TabsTrigger>
          <TabsTrigger value="refinance" data-testid="tab-refinance">Refinance Ready</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Volatility Trend</CardTitle>
                <CardDescription>Monthly variance in rent collection timing and amounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockVolatility}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                      <Tooltip />
                      <Area type="monotone" dataKey="volatility" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.1)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>On-Time Payment Rate</CardTitle>
                <CardDescription>Portfolio-wide on-time collection percentage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockVolatility}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} domain={[80, 100]} tickFormatter={(v) => `${v}%`} />
                      <Tooltip />
                      <Bar dataKey="onTime" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Property Risk Heatmap</CardTitle>
              <CardDescription>Unit-level risk scores across your portfolio — sorted by risk severity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockRiskHeatmap
                  .sort((a, b) => b.riskScore - a.riskScore)
                  .map((prop) => (
                    <div key={prop.property} className="flex items-center gap-4 p-3 border rounded-lg" data-testid={`risk-row-${prop.property}`}>
                      <div className={`w-3 h-3 rounded-full ${prop.riskScore <= 15 ? "bg-green-500" : prop.riskScore <= 30 ? "bg-yellow-500" : prop.riskScore <= 50 ? "bg-orange-500" : "bg-red-500"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{prop.property}</p>
                        <p className="text-xs text-muted-foreground">{prop.units} units</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-mono font-bold ${getRiskColor(prop.riskScore)}`}>{prop.riskScore}</p>
                        <p className="text-xs text-muted-foreground">Risk Score</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono font-semibold">{prop.volatility}%</p>
                        <p className="text-xs text-muted-foreground">Volatility</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono font-semibold">{prop.onTime}%</p>
                        <p className="text-xs text-muted-foreground">On-Time</p>
                      </div>
                      <Badge variant="secondary" className={getRiskBg(prop.riskScore)}>
                        {prop.riskScore <= 15 ? "Low" : prop.riskScore <= 30 ? "Moderate" : prop.riskScore <= 50 ? "Elevated" : "High"}
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delinquency" className="space-y-6 mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Delinquency Tier Distribution</CardTitle>
                <CardDescription>ML-powered forecasting assigns tenants to risk tiers based on payment history, lease terms, and seasonality</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockDelinquencyTiers.map((tier) => (
                    <div key={tier.tier} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tier.color }} />
                          <span className="font-medium">{tier.tier}</span>
                        </div>
                        <span className="font-mono text-muted-foreground">{tier.count} tenants ({tier.pct}%)</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${tier.pct}%`, backgroundColor: tier.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Forecasted Risk Actions</CardTitle>
                <CardDescription>Automated intervention recommendations based on delinquency tier</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-600" />
                    <span className="font-semibold text-sm">Early Incentive Trigger</span>
                  </div>
                  <p className="text-xs text-muted-foreground">52 tenants in Yellow tier eligible for early payment bonus ($25 cashback if paid by 3rd). Estimated conversion: 68%.</p>
                  <Button size="sm" variant="outline" data-testid="button-trigger-incentive">Launch Incentive</Button>
                </div>
                <div className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <span className="font-semibold text-sm">Outreach Queue</span>
                  </div>
                  <p className="text-xs text-muted-foreground">24 tenants in Orange tier recommended for personalized outreach. Average recovery rate with intervention: 72%.</p>
                  <Button size="sm" variant="outline" data-testid="button-outreach-queue">View Queue</Button>
                </div>
                <div className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-red-600" />
                    <span className="font-semibold text-sm">Escalation Review</span>
                  </div>
                  <p className="text-xs text-muted-foreground">12 tenants in Red/Critical tier require formal review. Estimated bad debt exposure: $18,400.</p>
                  <Button size="sm" variant="outline" data-testid="button-escalation-review">Review Cases</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cohort" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Ownership Transition Cohort Tracker</CardTitle>
              <CardDescription>Live pipeline of tenants progressing toward FHA/NACA homeownership eligibility</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockCohortTracker}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="tier1" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Tier 1 (Stable)" />
                    <Area type="monotone" dataKey="tier2" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Tier 2 (FHA Ready)" />
                    <Area type="monotone" dataKey="tier3" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} name="Tier 3 (NACA Qualified)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-4">
            <Card className="hover-elevate">
              <CardContent className="pt-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold font-mono">35</div>
                <p className="text-sm text-muted-foreground">Tier 1 — Stable Payers</p>
                <p className="text-xs text-muted-foreground">Building credit, subprime range</p>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardContent className="pt-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
                  <Home className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="text-3xl font-bold font-mono">19</div>
                <p className="text-sm text-muted-foreground">Tier 2 — FHA Eligible</p>
                <p className="text-xs text-muted-foreground">Credit 580+, income verified</p>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardContent className="pt-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl font-bold font-mono">8</div>
                <p className="text-sm text-muted-foreground">Tier 3 — NACA Qualified</p>
                <p className="text-xs text-muted-foreground">Ready for lender handoff</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rto" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Rent-to-Own Opportunity Index</CardTitle>
              <CardDescription>ML model flags tenants best suited for rent-to-own offers based on payment consistency, credit trajectory, and neighborhood equity dynamics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockRtoOpportunities.map((opp) => (
                  <div key={opp.tenant} className="flex items-center gap-4 p-4 border rounded-lg hover-elevate" data-testid={`rto-row-${opp.tenant}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-semibold text-sm">{opp.tenant}</p>
                        {getTierBadge(opp.tier)}
                      </div>
                      <p className="text-xs text-muted-foreground">{opp.unit} &middot; ${opp.monthlyRent}/mo &middot; {opp.streak}-month streak</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono font-bold">{opp.creditScore}</p>
                      <p className="text-xs text-muted-foreground">Credit</p>
                    </div>
                    <div className="w-24">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Readiness</span>
                        <span className="font-mono font-bold">{opp.readiness}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${opp.readiness}%` }}
                        />
                      </div>
                    </div>
                    <Button size="sm" variant="outline" data-testid={`button-offer-${opp.tenant}`}>
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      Offer
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refinance" className="space-y-6 mt-6">
          <Card className="bg-gradient-to-br from-primary/5 via-background to-background border-2 border-primary/10">
            <CardHeader>
              <CardTitle className="text-2xl">Refinance Readiness Package</CardTitle>
              <CardDescription>One-click export of stabilized rent performance, cohort behavior, and NOI trends for lender presentations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg space-y-1 bg-background">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Collection Stability</p>
                  <p className="text-2xl font-bold font-mono text-green-600">A+</p>
                  <p className="text-xs text-muted-foreground">95% on-time, declining variance</p>
                </div>
                <div className="p-4 border rounded-lg space-y-1 bg-background">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">NOI Trend (12mo)</p>
                  <p className="text-2xl font-bold font-mono text-green-600">+8.3%</p>
                  <p className="text-xs text-muted-foreground">Consistent upward trajectory</p>
                </div>
                <div className="p-4 border rounded-lg space-y-1 bg-background">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Variance Reduction</p>
                  <p className="text-2xl font-bold font-mono">-64%</p>
                  <p className="text-xs text-muted-foreground">Since Naltos deployment</p>
                </div>
                <div className="p-4 border rounded-lg space-y-1 bg-background">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Tenant Retention</p>
                  <p className="text-2xl font-bold font-mono">91%</p>
                  <p className="text-xs text-muted-foreground">12-month rolling average</p>
                </div>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg border border-muted">
                <div className="flex items-start gap-3">
                  <BarChart3 className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
                  <div className="space-y-2">
                    <p className="font-semibold text-sm">Package Contents</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>Stabilized rent performance (24-month rolling)</li>
                      <li>Cohort-level behavior analysis and delinquency reduction proof</li>
                      <li>NOI trends with variance reduction metrics</li>
                      <li>Tenant payment probability distributions</li>
                      <li>Ownership transition pipeline (reduces future vacancy risk)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 flex-wrap">
                <Button data-testid="button-download-pdf">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF Report
                </Button>
                <Button variant="outline" data-testid="button-download-excel">
                  <Download className="w-4 h-4 mr-2" />
                  Export Raw Data (Excel)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <NeuralRiskLayer />
    </div>
  );
}

function NeuralRiskLayer() {
  const { data: portfolio } = useQuery<any>({
    queryKey: ["/api/intelligence/portfolio"],
  });
  const { data: cohortData } = useQuery<any>({
    queryKey: ["/api/intelligence/cohort-insights"],
  });

  const isLoadingNeural = !portfolio && !cohortData;

  if (isLoadingNeural) {
    return (
      <div className="space-y-6" data-testid="section-neural-risk-layer-loading">
        <div className="h-6 w-64 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card><CardContent className="p-6"><div className="h-48 bg-muted animate-pulse rounded" /></CardContent></Card>
          <Card><CardContent className="p-6"><div className="h-48 bg-muted animate-pulse rounded" /></CardContent></Card>
        </div>
      </div>
    );
  }

  if (!portfolio || !cohortData) return null;

  const actionableInsights = cohortData.insights?.filter((i: any) => i.actionable) || [];

  return (
    <div className="space-y-6" data-testid="section-neural-risk-layer">
      <div className="flex items-center gap-2">
        <Brain className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">Neuromorphic Risk Intelligence</h2>
        <Badge variant="secondary" className="text-xs" data-testid="badge-snn-active">
          <Radio className="w-3 h-3 mr-1 text-green-500 animate-pulse" />
          SNN Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card data-testid="card-temporal-memory-risk">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 flex-wrap">
              <Activity className="w-5 h-5 text-primary" />
              Temporal Memory Risk Layer
            </CardTitle>
            <CardDescription>Signal weight decay — recent payment events weighted exponentially higher</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={portfolio.temporalMemoryDecay}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="daysAgo" reversed fontSize={11} />
                <YAxis fontSize={11} domain={[0, 1]} tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(value: number) => [(value * 100).toFixed(0) + "%"]}
                />
                <Area type="monotone" dataKey="memoryStrength" name="Memory" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
                <Area type="monotone" dataKey="signalWeight" name="Signal" stroke="#f97316" fill="#f97316" fillOpacity={0.08} strokeWidth={2} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-3 mt-4">
              {portfolio.propertyScores?.slice(0, 3).map((p: any) => (
                <div key={p.property} className="p-2 border rounded-lg text-center">
                  <p className="text-xs text-muted-foreground truncate">{p.property}</p>
                  <p className={`text-lg font-bold font-mono ${p.stabilityScore >= 80 ? "text-green-600 dark:text-green-400" : p.stabilityScore >= 60 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"}`}>
                    {p.stabilityScore}
                  </p>
                  <p className="text-xs text-muted-foreground">Stability</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-cohort-callouts">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 flex-wrap">
              <Sparkles className="w-5 h-5 text-primary" />
              Cohort Intelligence Alerts
            </CardTitle>
            <CardDescription>AI-surfaced insights from neural analysis of tenant cohorts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {actionableInsights.slice(0, 3).map((insight: any) => {
              const severityColors: Record<string, string> = {
                critical: "border-red-500/20 bg-red-500/5",
                high: "border-orange-500/20 bg-orange-500/5",
                warning: "border-yellow-500/20 bg-yellow-500/5",
                info: "border-blue-500/20 bg-blue-500/5",
              };
              return (
                <div key={insight.id} className={`p-3 border rounded-lg space-y-1 ${severityColors[insight.severity] || ""}`} data-testid={`cohort-alert-${insight.id}`}>
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <p className="text-sm font-medium">{insight.title}</p>
                    <Badge variant="outline" className="text-xs flex-shrink-0">{(insight.confidence * 100).toFixed(0)}%</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{insight.suggestedAction}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                    <span>{insight.affectedCount} of {insight.totalCohort} tenants</span>
                    <span>-</span>
                    <span>{insight.timeframe}</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
