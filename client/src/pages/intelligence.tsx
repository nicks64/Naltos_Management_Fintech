import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  Activity,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Users,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Sparkles,
  BarChart3,
  Layers,
  Eye,
  Radio,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell,
} from "recharts";

interface SpikeTrainPoint {
  time: string;
  rentSpikes: number;
  vendorSpikes: number;
  p2pSpikes: number;
  volatility: number;
}

interface TemporalMemoryPoint {
  daysAgo: number;
  memoryStrength: number;
  signalWeight: number;
}

interface PropertyScore {
  property: string;
  stabilityScore: number;
  refinanceIndex: number;
  spikeRate: number;
  trend: string;
  units: number;
  riskLevel: string;
}

interface PortfolioData {
  neuralActivityLevel: number;
  spikeFrequency: number;
  temporalMemoryDepth: number;
  portfolioStabilityScore: number;
  portfolioStabilityTrend: string;
  activeInflectionPoints: number;
  modelConfidence: number;
  lastModelUpdate: string;
  spikeTrainData: SpikeTrainPoint[];
  temporalMemoryDecay: TemporalMemoryPoint[];
  propertyScores: PropertyScore[];
}

interface TenantScoreDriver {
  factor: string;
  weight: number;
  score: number;
}

interface TenantScore {
  id: string;
  name: string;
  unit: string;
  stabilityScore: number;
  paymentPattern: string;
  spikeEvents: number;
  streakMonths: number;
  tierMigration: string;
  drivers: TenantScoreDriver[];
}

interface CohortInsight {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  affectedCount: number;
  totalCohort: number;
  confidence: number;
  timeframe: string;
  actionable: boolean;
  suggestedAction: string;
}

interface CohortMigrationPoint {
  period: string;
  tier0: number;
  tier1: number;
  tier2: number;
  tier3: number;
}

interface InflectionPoint {
  id: string;
  type: string;
  direction: string;
  probability: number;
  tenant: string | null;
  unit: string | null;
  property: string;
  detectedAt: string;
  predictedDate: string;
  signalStrength: number;
  spikeHistory: number[];
  neuralDrivers: string[];
}

interface NOIForecastPoint {
  month: string;
  baseline: number;
  optimistic: number;
  pessimistic: number;
  neural: number;
}

interface NOIForecastData {
  forecast: NOIForecastPoint[];
  currentNOI: number;
  projectedNOI: number;
  noiForecastChange: number;
  incentiveImpact: {
    currentSpend: number;
    projectedReturn: number;
    roi: number;
    optimalSpend: number;
    optimalReturn: number;
    optimalRoi: number;
  };
  refinanceTiming: {
    optimalWindow: string;
    currentDSCR: number;
    projectedDSCR: number;
    currentLTV: number;
    projectedLTV: number;
    readyProperties: number;
    totalProperties: number;
    recommendation: string;
  };
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical": return "text-red-600 dark:text-red-400";
    case "high": return "text-orange-600 dark:text-orange-400";
    case "warning": return "text-yellow-600 dark:text-yellow-400";
    case "info": return "text-blue-600 dark:text-blue-400";
    case "success": return "text-green-600 dark:text-green-400";
    default: return "text-muted-foreground";
  }
};

const getSeverityBg = (severity: string) => {
  switch (severity) {
    case "critical": return "bg-red-500/10 border-red-500/20";
    case "high": return "bg-orange-500/10 border-orange-500/20";
    case "warning": return "bg-yellow-500/10 border-yellow-500/20";
    case "info": return "bg-blue-500/10 border-blue-500/20";
    case "success": return "bg-green-500/10 border-green-500/20";
    default: return "bg-muted/50";
  }
};

const getRiskBadge = (level: string) => {
  switch (level) {
    case "low": return <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400">Low Risk</Badge>;
    case "medium": return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">Medium</Badge>;
    case "high": return <Badge variant="secondary" className="bg-orange-500/10 text-orange-700 dark:text-orange-400">High</Badge>;
    case "critical": return <Badge variant="secondary" className="bg-red-500/10 text-red-700 dark:text-red-400">Critical</Badge>;
    default: return <Badge variant="secondary">Unknown</Badge>;
  }
};

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-green-600 dark:text-green-400";
  if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
  if (score >= 40) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
};

const getScoreBarColor = (score: number) => {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#eab308";
  if (score >= 40) return "#f97316";
  return "#ef4444";
};

export default function Intelligence() {
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);

  const { data: portfolio, isLoading: portfolioLoading } = useQuery<PortfolioData>({
    queryKey: ["/api/intelligence/portfolio"],
  });

  const { data: tenantData, isLoading: tenantsLoading } = useQuery<{ tenantScores: TenantScore[]; scoringModel: any }>({
    queryKey: ["/api/intelligence/tenant-scores"],
  });

  const { data: cohortData, isLoading: cohortsLoading } = useQuery<{ insights: CohortInsight[]; cohortMigration: CohortMigrationPoint[] }>({
    queryKey: ["/api/intelligence/cohort-insights"],
  });

  const { data: inflectionData, isLoading: inflectionsLoading } = useQuery<{ inflectionPoints: InflectionPoint[] }>({
    queryKey: ["/api/intelligence/inflection-points"],
  });

  const { data: noiData, isLoading: noiLoading } = useQuery<NOIForecastData>({
    queryKey: ["/api/intelligence/noi-forecast"],
  });

  const isLoading = portfolioLoading || tenantsLoading || cohortsLoading || inflectionsLoading || noiLoading;

  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="page-intelligence">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-muted animate-pulse rounded-lg" />)}
        </div>
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  const selectedTenantData = tenantData?.tenantScores.find(t => t.id === selectedTenant);

  return (
    <div className="space-y-6" data-testid="page-intelligence">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">Intelligence Hub</h1>
            <p className="text-muted-foreground">
              Neuromorphic behavioral intelligence — spiking neural network analysis of rent patterns, tenant risk, and portfolio health
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Radio className="w-3 h-3 text-green-500 animate-pulse" />
            Model Active — SNN v2.4
          </span>
          <span>Confidence: {((portfolio?.modelConfidence ?? 0) * 100).toFixed(0)}%</span>
          <span>Temporal Depth: {portfolio?.temporalMemoryDepth}d</span>
          <span>Last Updated: {portfolio?.lastModelUpdate ? new Date(portfolio.lastModelUpdate).toLocaleTimeString() : "—"}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="intelligence-kpi-grid">
        <Card data-testid="kpi-neural-activity">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Neural Activity</p>
                <p className="text-2xl font-bold font-mono">{((portfolio?.neuralActivityLevel ?? 0) * 100).toFixed(0)}%</p>
              </div>
              <Activity className="w-8 h-8 text-primary/40" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{portfolio?.spikeFrequency} spikes/hr detected</p>
          </CardContent>
        </Card>

        <Card data-testid="kpi-stability-score">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Portfolio Stability</p>
                <p className={`text-2xl font-bold font-mono ${getScoreColor(portfolio?.portfolioStabilityScore ?? 0)}`}>
                  {portfolio?.portfolioStabilityScore?.toFixed(1)}
                </p>
              </div>
              <ShieldCheck className="w-8 h-8 text-green-600/40" />
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-600" /> {portfolio?.portfolioStabilityTrend}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="kpi-inflection-points">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Active Inflection Points</p>
                <p className="text-2xl font-bold font-mono text-orange-600 dark:text-orange-400">{portfolio?.activeInflectionPoints}</p>
              </div>
              <Zap className="w-8 h-8 text-orange-600/40" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Behavioral shifts detected</p>
          </CardContent>
        </Card>

        <Card data-testid="kpi-noi-forecast">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">NOI Forecast</p>
                <p className="text-2xl font-bold font-mono text-green-600 dark:text-green-400">
                  +{noiData?.noiForecastChange?.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600/40" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              ${((noiData?.currentNOI ?? 0) / 1000).toFixed(0)}K → ${((noiData?.projectedNOI ?? 0) / 1000).toFixed(0)}K projected
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="neural" data-testid="tabs-intelligence">
        <TabsList className="flex flex-wrap gap-1">
          <TabsTrigger value="neural" data-testid="tab-neural">Neural Activity</TabsTrigger>
          <TabsTrigger value="scores" data-testid="tab-scores">Tenant Scores</TabsTrigger>
          <TabsTrigger value="inflections" data-testid="tab-inflections">Inflection Points</TabsTrigger>
          <TabsTrigger value="cohorts" data-testid="tab-cohorts">Cohort Insights</TabsTrigger>
          <TabsTrigger value="noi" data-testid="tab-noi">NOI Forecast</TabsTrigger>
        </TabsList>

        <TabsContent value="neural" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card data-testid="card-spike-train">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 flex-wrap">
                  <Zap className="w-5 h-5 text-primary" />
                  Neural Spike Train
                </CardTitle>
                <CardDescription>
                  Real-time payment event spikes by source — each spike represents a financial event processed by the SNN
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={portfolio?.spikeTrainData} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="time" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="rentSpikes" name="Rent Spikes" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="vendorSpikes" name="Vendor Spikes" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="p2pSpikes" name="P2P Spikes" fill="#06b6d4" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> Rent</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: "#8b5cf6" }} /> Vendor</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: "#06b6d4" }} /> P2P</span>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-temporal-memory">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 flex-wrap">
                  <Clock className="w-5 h-5 text-primary" />
                  Temporal Memory Decay
                </CardTitle>
                <CardDescription>
                  Signal weight decay over time — recent events weighted exponentially higher in behavioral predictions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={portfolio?.temporalMemoryDecay}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="daysAgo" reversed fontSize={11} label={{ value: "Days Ago", position: "insideBottom", offset: -2, fontSize: 10 }} />
                    <YAxis fontSize={11} domain={[0, 1]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(value: number) => [(value * 100).toFixed(0) + "%"]}
                    />
                    <Area type="monotone" dataKey="memoryStrength" name="Memory Strength" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
                    <Area type="monotone" dataKey="signalWeight" name="Signal Weight" stroke="#f97316" fill="#f97316" fillOpacity={0.08} strokeWidth={2} strokeDasharray="5 5" />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> Memory Strength</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: "#f97316" }} /> Signal Weight</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card data-testid="card-property-neural-scores">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 flex-wrap">
                <Layers className="w-5 h-5 text-primary" />
                Property Neural Scores
              </CardTitle>
              <CardDescription>
                Stability Score and Refinance Readiness Index per property — computed from aggregated tenant neural activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {portfolio?.propertyScores.map((p) => (
                  <div key={p.property} className="flex items-center gap-4 p-3 border rounded-lg flex-wrap" data-testid={`property-score-${p.property.toLowerCase().replace(/\s+/g, '-')}`}>
                    <div className="min-w-[160px]">
                      <p className="font-medium text-sm">{p.property}</p>
                      <p className="text-xs text-muted-foreground">{p.units} units</p>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">Stability</span>
                        <span className={`text-sm font-mono font-bold ${getScoreColor(p.stabilityScore)}`}>{p.stabilityScore}</span>
                      </div>
                      <Progress value={p.stabilityScore} className="h-2" />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">Refinance Index</span>
                        <span className={`text-sm font-mono font-bold ${getScoreColor(p.refinanceIndex)}`}>{p.refinanceIndex}</span>
                      </div>
                      <Progress value={p.refinanceIndex} className="h-2" />
                    </div>
                    <div className="text-center min-w-[80px]">
                      <p className="text-xs text-muted-foreground">Spike Rate</p>
                      <p className="font-mono text-sm">{(p.spikeRate * 100).toFixed(0)}%</p>
                    </div>
                    <div className="min-w-[80px] text-right">
                      {getRiskBadge(p.riskLevel)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scores" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Card data-testid="card-tenant-scores">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 flex-wrap">
                    <Users className="w-5 h-5 text-primary" />
                    Tenant Stability Scores
                  </CardTitle>
                  <CardDescription>
                    Explainable scores computed from 4 weighted neural factors — click a tenant to see detailed driver breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {tenantData?.tenantScores.map((t) => (
                      <div
                        key={t.id}
                        className={`flex items-center gap-4 p-3 border rounded-lg cursor-pointer hover-elevate transition-colors flex-wrap ${selectedTenant === t.id ? 'border-primary bg-primary/5' : ''}`}
                        onClick={() => setSelectedTenant(selectedTenant === t.id ? null : t.id)}
                        data-testid={`tenant-score-${t.id}`}
                      >
                        <div className="min-w-[120px]">
                          <p className="font-medium text-sm">{t.name}</p>
                          <p className="text-xs text-muted-foreground">{t.unit}</p>
                        </div>
                        <div className="flex-1 min-w-[140px]">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-lg font-bold font-mono ${getScoreColor(t.stabilityScore)}`}>
                              {t.stabilityScore}
                            </span>
                            <span className="text-xs text-muted-foreground">/100</span>
                          </div>
                          <Progress value={t.stabilityScore} className="h-1.5" />
                        </div>
                        <div className="text-center min-w-[60px]">
                          <p className="text-xs text-muted-foreground">Spikes</p>
                          <p className="font-mono text-sm">{t.spikeEvents}</p>
                        </div>
                        <div className="text-center min-w-[60px]">
                          <p className="text-xs text-muted-foreground">Streak</p>
                          <p className="font-mono text-sm">{t.streakMonths}mo</p>
                        </div>
                        <div className="min-w-[60px]">
                          <Badge variant="secondary" className="text-xs">
                            Tier {t.tierMigration}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card data-testid="card-score-explainer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 flex-wrap">
                    <Eye className="w-5 h-5 text-primary" />
                    Score Explainability
                  </CardTitle>
                  <CardDescription>
                    {selectedTenantData ? `Driver breakdown for ${selectedTenantData.name}` : "Select a tenant to view score drivers"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedTenantData ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className={`text-4xl font-bold font-mono ${getScoreColor(selectedTenantData.stabilityScore)}`}>
                          {selectedTenantData.stabilityScore}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Stability Score</p>
                      </div>
                      <ResponsiveContainer width="100%" height={200}>
                        <RadarChart data={selectedTenantData.drivers.map(d => ({ factor: d.factor.split(' ')[0], score: d.score, fullMark: 100 }))}>
                          <PolarGrid stroke="hsl(var(--border))" />
                          <PolarAngleAxis dataKey="factor" fontSize={10} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={9} />
                          <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                        </RadarChart>
                      </ResponsiveContainer>
                      <div className="space-y-2">
                        {selectedTenantData.drivers.map((d) => (
                          <div key={d.factor} className="space-y-1">
                            <div className="flex items-center justify-between gap-2 text-xs">
                              <span className="text-muted-foreground">{d.factor} ({(d.weight * 100).toFixed(0)}%)</span>
                              <span className={`font-mono font-bold ${getScoreColor(d.score)}`}>{d.score}</span>
                            </div>
                            <Progress value={d.score} className="h-1" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Eye className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p className="text-sm">Click a tenant to explore their score drivers</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card data-testid="card-model-info">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2 flex-wrap">
                    <Brain className="w-4 h-4 text-primary" />
                    Model Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex justify-between gap-2"><span className="text-muted-foreground">Version</span><span className="font-mono">{tenantData?.scoringModel.version}</span></div>
                  <div className="flex justify-between gap-2"><span className="text-muted-foreground">Accuracy</span><span className="font-mono">{((tenantData?.scoringModel.accuracy ?? 0) * 100).toFixed(1)}%</span></div>
                  <div className="flex justify-between gap-2"><span className="text-muted-foreground">Last Trained</span><span className="font-mono">{tenantData?.scoringModel.lastTrained ? new Date(tenantData.scoringModel.lastTrained).toLocaleDateString() : "—"}</span></div>
                  <div className="mt-3 pt-3 border-t space-y-1">
                    <p className="text-muted-foreground font-medium">Scoring Factors:</p>
                    {tenantData?.scoringModel.factors.map((f: string) => (
                      <p key={f} className="text-muted-foreground">- {f}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="inflections" className="space-y-6 mt-4">
          <Card data-testid="card-inflection-points">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 flex-wrap">
                <Zap className="w-5 h-5 text-primary" />
                Behavioral Inflection Points
              </CardTitle>
              <CardDescription>
                Neural network detected behavioral shifts — each inflection represents a predicted change in tenant or portfolio behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {inflectionData?.inflectionPoints.map((ip) => (
                <div key={ip.id} className={`p-4 border rounded-lg space-y-3 ${ip.direction === 'negative' ? 'border-red-500/20' : 'border-green-500/20'}`} data-testid={`inflection-${ip.id}`}>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      {ip.direction === "negative" ? (
                        <ArrowDownRight className="w-5 h-5 text-red-600 dark:text-red-400" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 text-green-600 dark:text-green-400" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{ip.tenant || ip.property}</p>
                        <p className="text-xs text-muted-foreground">{ip.unit ? `${ip.unit} — ` : ""}{ip.property}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className={ip.direction === "negative" ? "bg-red-500/10 text-red-700 dark:text-red-400" : "bg-green-500/10 text-green-700 dark:text-green-400"}>
                        {ip.type.replace(/_/g, " ")}
                      </Badge>
                      <Badge variant="outline">
                        {(ip.probability * 100).toFixed(0)}% probability
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Signal:</span>
                    <div className="flex items-end gap-px h-6">
                      {ip.spikeHistory.map((v, i) => (
                        <div
                          key={i}
                          className="w-3 rounded-t-sm"
                          style={{
                            height: `${v * 24}px`,
                            backgroundColor: ip.direction === "negative"
                              ? `rgba(239, 68, 68, ${0.3 + v * 0.7})`
                              : `rgba(34, 197, 94, ${0.3 + v * 0.7})`,
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">
                      Strength: {(ip.signalStrength * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Neural Drivers:</p>
                    {ip.neuralDrivers.map((driver, i) => (
                      <p key={i} className="text-xs text-muted-foreground pl-3">- {driver}</p>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                    <span>Detected: {new Date(ip.detectedAt).toLocaleDateString()}</span>
                    <span>Predicted: {new Date(ip.predictedDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cohorts" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Card data-testid="card-cohort-insights">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 flex-wrap">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Cohort Intelligence
                  </CardTitle>
                  <CardDescription>
                    AI-powered insights surfaced from spiking neural network analysis of tenant cohorts and portfolio patterns
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {cohortData?.insights.map((insight) => (
                    <div key={insight.id} className={`p-4 border rounded-lg space-y-2 ${getSeverityBg(insight.severity)}`} data-testid={`insight-${insight.id}`}>
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <AlertTriangle className={`w-4 h-4 ${getSeverityColor(insight.severity)}`} />
                          <p className="font-medium text-sm">{insight.title}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">{(insight.confidence * 100).toFixed(0)}% confidence</Badge>
                          <Badge variant="secondary" className="text-xs">{insight.timeframe}</Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{insight.description}</p>
                      <div className="flex items-center gap-4 text-xs flex-wrap">
                        <span className="text-muted-foreground">
                          Affected: <strong>{insight.affectedCount}</strong> of {insight.totalCohort}
                        </span>
                        {insight.actionable && (
                          <span className="text-primary flex items-center gap-1">
                            <Target className="w-3 h-3" /> {insight.suggestedAction}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card data-testid="card-cohort-migration">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2 flex-wrap">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Tier Migration Flow
                </CardTitle>
                <CardDescription className="text-xs">Tenant movement across ownership readiness tiers</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={cohortData?.cohortMigration}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="period" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Area type="monotone" dataKey="tier3" name="Tier 3 (NACA)" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="tier2" name="Tier 2 (FHA)" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="tier1" name="Tier 1 (Stable)" stackId="1" stroke="#eab308" fill="#eab308" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="tier0" name="Tier 0 (Not Ready)" stackId="1" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Tier 3</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Tier 2</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" /> Tier 1</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400" /> Tier 0</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="noi" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card data-testid="card-noi-forecast">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 flex-wrap">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    NOI Forecast with Uncertainty Bands
                  </CardTitle>
                  <CardDescription>
                    Neural model prediction with confidence intervals — baseline vs optimistic/pessimistic scenarios
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={noiData?.forecast}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="month" fontSize={11} />
                      <YAxis fontSize={11} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                        formatter={(value: number) => [`$${(value / 1000).toFixed(0)}K`]}
                      />
                      <Area type="monotone" dataKey="optimistic" name="Optimistic" stroke="none" fill="#22c55e" fillOpacity={0.08} />
                      <Area type="monotone" dataKey="pessimistic" name="Pessimistic" stroke="none" fill="#ef4444" fillOpacity={0.08} />
                      <Line type="monotone" dataKey="baseline" name="Baseline" stroke="#94a3b8" strokeWidth={1} strokeDasharray="5 5" dot={false} />
                      <Line type="monotone" dataKey="neural" name="Neural Forecast" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-primary inline-block" /> Neural Forecast</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-slate-400 inline-block" style={{ borderTop: "1px dashed" }} /> Baseline</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500/20" /> Optimistic Band</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500/20" /> Pessimistic Band</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card data-testid="card-incentive-roi">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2 flex-wrap">
                    <Target className="w-4 h-4 text-primary" />
                    Incentive Impact Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">Current Program</p>
                    <div className="flex justify-between gap-2"><span className="text-muted-foreground">Spend</span><span className="font-mono">${noiData?.incentiveImpact.currentSpend?.toLocaleString()}/mo</span></div>
                    <div className="flex justify-between gap-2"><span className="text-muted-foreground">Return</span><span className="font-mono text-green-600 dark:text-green-400">${noiData?.incentiveImpact.projectedReturn?.toLocaleString()}/mo</span></div>
                    <div className="flex justify-between gap-2"><span className="text-muted-foreground">ROI</span><span className="font-mono font-bold text-green-600 dark:text-green-400">{noiData?.incentiveImpact.roi}%</span></div>
                  </div>
                  <div className="border-t pt-3 space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">Neural Optimal</p>
                    <div className="flex justify-between gap-2"><span className="text-muted-foreground">Optimal Spend</span><span className="font-mono">${noiData?.incentiveImpact.optimalSpend?.toLocaleString()}/mo</span></div>
                    <div className="flex justify-between gap-2"><span className="text-muted-foreground">Projected Return</span><span className="font-mono text-green-600 dark:text-green-400">${noiData?.incentiveImpact.optimalReturn?.toLocaleString()}/mo</span></div>
                    <div className="flex justify-between gap-2"><span className="text-muted-foreground">Optimal ROI</span><span className="font-mono font-bold text-green-600 dark:text-green-400">{noiData?.incentiveImpact.optimalRoi}%</span></div>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-refinance-timing">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2 flex-wrap">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Refinance Timing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Optimal Window</p>
                    <p className="text-lg font-bold text-primary">{noiData?.refinanceTiming.optimalWindow}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between gap-2"><span className="text-muted-foreground">Current DSCR</span><span className="font-mono">{noiData?.refinanceTiming.currentDSCR}</span></div>
                    <div className="flex justify-between gap-2"><span className="text-muted-foreground">Projected DSCR</span><span className="font-mono text-green-600 dark:text-green-400">{noiData?.refinanceTiming.projectedDSCR}</span></div>
                    <div className="flex justify-between gap-2"><span className="text-muted-foreground">Current LTV</span><span className="font-mono">{((noiData?.refinanceTiming.currentLTV ?? 0) * 100).toFixed(0)}%</span></div>
                    <div className="flex justify-between gap-2"><span className="text-muted-foreground">Projected LTV</span><span className="font-mono text-green-600 dark:text-green-400">{((noiData?.refinanceTiming.projectedLTV ?? 0) * 100).toFixed(0)}%</span></div>
                    <div className="flex justify-between gap-2"><span className="text-muted-foreground">Ready Properties</span><span className="font-mono">{noiData?.refinanceTiming.readyProperties}/{noiData?.refinanceTiming.totalProperties}</span></div>
                  </div>
                  <p className="text-xs text-muted-foreground border-t pt-2">{noiData?.refinanceTiming.recommendation}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
