import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AINudgeCard, AgentInsightStrip } from "@/components/ai-nudge-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Building2,
  Home,
  BarChart3,
  DollarSign,
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  MapPin,
  Eye,
  Users,
  Wrench,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  type LucideIcon,
} from "lucide-react";

const agentInsights = [
  { text: "Portfolio NOI up 3.2% QoQ across 8 properties", severity: "positive" as const },
  { text: "Oakwood Terrace occupancy 12% below comp set", severity: "warning" as const, confidence: 0.91 },
  { text: "3 new market opportunities identified in Southeast region", severity: "info" as const },
];

const kpiCards = [
  { title: "Total Properties", value: "8", change: "+1 this quarter", trend: "positive", icon: Building2 },
  { title: "Total Units", value: "3,240", change: "+120 units", trend: "positive", icon: Home },
  { title: "Portfolio Occupancy", value: "91.8%", change: "-0.4%", trend: "warning", icon: Users },
  { title: "Portfolio NOI", value: "$2.4M/mo", change: "+3.2% QoQ", trend: "positive", icon: DollarSign },
];

const properties = [
  { name: "Riverside Commons", address: "1200 River Rd, Austin, TX", units: 520, occupancy: 94.2, noi: 385000, delinquency: 2.1, maintenanceBacklog: 12, marketValue: 42000000, trend: "up" },
  { name: "Oakwood Terrace", address: "800 Oak Blvd, Dallas, TX", units: 340, occupancy: 82.4, noi: 195000, delinquency: 5.8, maintenanceBacklog: 28, marketValue: 24000000, trend: "down" },
  { name: "Summit View", address: "950 Summit Dr, Denver, CO", units: 480, occupancy: 93.1, noi: 420000, delinquency: 1.9, maintenanceBacklog: 8, marketValue: 52000000, trend: "up" },
  { name: "Harbor Point", address: "2100 Harbor Ln, Tampa, FL", units: 390, occupancy: 95.6, noi: 340000, delinquency: 1.4, maintenanceBacklog: 6, marketValue: 38000000, trend: "up" },
  { name: "Maple Ridge", address: "600 Maple Ave, Charlotte, NC", units: 280, occupancy: 90.5, noi: 220000, delinquency: 3.2, maintenanceBacklog: 15, marketValue: 22000000, trend: "flat" },
  { name: "Sunset Gardens", address: "1500 Sunset Blvd, Phoenix, AZ", units: 450, occupancy: 91.0, noi: 310000, delinquency: 2.7, maintenanceBacklog: 18, marketValue: 35000000, trend: "up" },
  { name: "Lakeshore Plaza", address: "3200 Lake Dr, Nashville, TN", units: 410, occupancy: 92.8, noi: 355000, delinquency: 2.0, maintenanceBacklog: 10, marketValue: 40000000, trend: "up" },
  { name: "Pinecrest Village", address: "700 Pine St, Raleigh, NC", units: 370, occupancy: 89.7, noi: 275000, delinquency: 3.5, maintenanceBacklog: 22, marketValue: 28000000, trend: "down" },
];

const comparisonMetrics = [
  { metric: "Occupancy %", riverside: "94.2%", oakwood: "82.4%", summit: "93.1%", harbor: "95.6%", maple: "90.5%", sunset: "91.0%", lakeshore: "92.8%", pinecrest: "89.7%" },
  { metric: "Avg Rent", riverside: "$1,420", oakwood: "$1,180", summit: "$1,580", harbor: "$1,350", maple: "$1,220", sunset: "$1,290", lakeshore: "$1,380", pinecrest: "$1,250" },
  { metric: "NOI", riverside: "$385K", oakwood: "$195K", summit: "$420K", harbor: "$340K", maple: "$220K", sunset: "$310K", lakeshore: "$355K", pinecrest: "$275K" },
  { metric: "Expense Ratio", riverside: "38%", oakwood: "52%", summit: "35%", harbor: "36%", maple: "42%", sunset: "40%", lakeshore: "37%", pinecrest: "44%" },
  { metric: "Turn Time (days)", riverside: "14", oakwood: "22", summit: "12", harbor: "11", maple: "18", sunset: "16", lakeshore: "13", pinecrest: "19" },
  { metric: "Maint. Cost/Unit", riverside: "$128", oakwood: "$195", summit: "$115", harbor: "$108", maple: "$155", sunset: "$142", lakeshore: "$122", pinecrest: "$168" },
  { metric: "Tenant Satisfaction", riverside: "4.5/5", oakwood: "3.6/5", summit: "4.6/5", harbor: "4.7/5", maple: "4.1/5", sunset: "4.2/5", lakeshore: "4.4/5", pinecrest: "3.9/5" },
];

const noiBenchmarks = [
  { property: "Riverside Commons", noiActual: 385000, noiTarget: 370000, variance: 4.1, revenueUnit: 1420, expenseUnit: 540, capRate: 5.5 },
  { property: "Oakwood Terrace", noiActual: 195000, noiTarget: 280000, variance: -30.4, revenueUnit: 1180, expenseUnit: 614, capRate: 3.9 },
  { property: "Summit View", noiActual: 420000, noiTarget: 400000, variance: 5.0, revenueUnit: 1580, expenseUnit: 553, capRate: 5.8 },
  { property: "Harbor Point", noiActual: 340000, noiTarget: 320000, variance: 6.3, revenueUnit: 1350, expenseUnit: 486, capRate: 5.4 },
  { property: "Maple Ridge", noiActual: 220000, noiTarget: 240000, variance: -8.3, revenueUnit: 1220, expenseUnit: 512, capRate: 4.7 },
  { property: "Sunset Gardens", noiActual: 310000, noiTarget: 305000, variance: 1.6, revenueUnit: 1290, expenseUnit: 516, capRate: 5.1 },
  { property: "Lakeshore Plaza", noiActual: 355000, noiTarget: 340000, variance: 4.4, revenueUnit: 1380, expenseUnit: 510, capRate: 5.3 },
  { property: "Pinecrest Village", noiActual: 275000, noiTarget: 310000, variance: -11.3, revenueUnit: 1250, expenseUnit: 550, capRate: 4.5 },
];

const regionalData = [
  { region: "Texas", properties: 2, totalUnits: 860, avgOccupancy: 88.3, avgNoi: 290000, marketRentTrend: "+2.1%", supplyPipeline: "1,200 units" },
  { region: "Colorado", properties: 1, totalUnits: 480, avgOccupancy: 93.1, avgNoi: 420000, marketRentTrend: "+3.5%", supplyPipeline: "800 units" },
  { region: "Florida", properties: 1, totalUnits: 390, avgOccupancy: 95.6, avgNoi: 340000, marketRentTrend: "+4.2%", supplyPipeline: "2,100 units" },
  { region: "North Carolina", properties: 2, totalUnits: 650, avgOccupancy: 90.1, avgNoi: 247500, marketRentTrend: "+2.8%", supplyPipeline: "950 units" },
  { region: "Arizona", properties: 1, totalUnits: 450, avgOccupancy: 91.0, avgNoi: 310000, marketRentTrend: "+1.9%", supplyPipeline: "1,500 units" },
  { region: "Tennessee", properties: 1, totalUnits: 410, avgOccupancy: 92.8, avgNoi: 355000, marketRentTrend: "+3.1%", supplyPipeline: "700 units" },
];

const watchlist = [
  { property: "Oakwood Terrace", metric: "Occupancy", currentValue: "82.4%", threshold: "90%", trend: "down", recommendation: "Implement targeted marketing campaign and adjust rents to market rate" },
  { property: "Oakwood Terrace", metric: "Delinquency Rate", currentValue: "5.8%", threshold: "3%", trend: "up", recommendation: "Deploy automated collection reminders and offer payment plans" },
  { property: "Pinecrest Village", metric: "NOI Variance", currentValue: "-11.3%", threshold: "-5%", trend: "down", recommendation: "Review expense categories and renegotiate vendor contracts" },
  { property: "Maple Ridge", metric: "Turn Time", currentValue: "18 days", threshold: "15 days", trend: "up", recommendation: "Pre-schedule contractors and stock common repair materials" },
  { property: "Pinecrest Village", metric: "Maintenance Backlog", currentValue: "22 orders", threshold: "15 orders", trend: "up", recommendation: "Allocate additional maintenance crew for 2-week sprint" },
  { property: "Oakwood Terrace", metric: "Tenant Satisfaction", currentValue: "3.6/5", threshold: "4.0/5", trend: "down", recommendation: "Conduct tenant survey and address top 3 complaint categories" },
  { property: "Sunset Gardens", metric: "Maintenance Backlog", currentValue: "18 orders", threshold: "15 orders", trend: "flat", recommendation: "Schedule weekend maintenance blitz to clear backlog" },
];

const trendIcon = (trend: string) => {
  if (trend === "up") return <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />;
  if (trend === "down") return <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />;
  return <Activity className="w-3.5 h-3.5 text-muted-foreground" />;
};

export default function Portfolio() {
  return (
    <div className="space-y-6" data-testid="page-portfolio">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-page-title">Portfolio Overview</h1>
          <p className="text-muted-foreground">Multi-property dashboard with AI-powered insights and benchmarking</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs" data-testid="badge-agent-status">
            <Brain className="w-3 h-3 mr-1 text-primary" />
            Agent Active
          </Badge>
          <Button size="sm" data-testid="button-add-property">
            <Building2 className="w-3 h-3 mr-1" />
            Add Property
          </Button>
        </div>
      </div>

      <AgentInsightStrip insights={agentInsights} />

      <AINudgeCard
        title="Portfolio Optimization - Oakwood Terrace"
        insight="Oakwood Terrace is underperforming by 12% vs comparable properties in the Dallas market. Agent recommends a $50-75/unit rent adjustment combined with a targeted digital marketing push. Estimated NOI improvement: $85,000/year."
        confidence={0.91}
        severity="warning"
        icon={Target}
        actionLabel="Review Plan"
        onAction={() => {}}
        secondaryLabel="View Comparables"
        onSecondary={() => {}}
        metric="$85,000/yr"
        metricLabel="Est. NOI Improvement"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpiCards.map((card, index) => (
          <Card key={card.title} className="hover-elevate" data-testid={`card-kpi-${index}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-1 pt-3 px-3">
              <CardTitle className="text-xs font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="text-xl font-mono tabular-nums font-semibold" data-testid={`text-kpi-value-${index}`}>{card.value}</div>
              <div className="flex items-center gap-1 text-xs mt-0.5">
                {card.trend === "positive" ? (
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                )}
                <span className={card.trend === "positive" ? "text-emerald-600" : "text-amber-600"}>{card.change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList data-testid="tabs-portfolio">
          <TabsTrigger value="dashboard" data-testid="tab-dashboard">Portfolio Dashboard</TabsTrigger>
          <TabsTrigger value="comparison" data-testid="tab-comparison">Property Comparison</TabsTrigger>
          <TabsTrigger value="noi" data-testid="tab-noi">NOI Benchmarking</TabsTrigger>
          <TabsTrigger value="regional" data-testid="tab-regional">Regional Analysis</TabsTrigger>
          <TabsTrigger value="watchlist" data-testid="tab-watchlist">Watchlist</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((prop, idx) => (
              <Card key={idx} className="hover-elevate" data-testid={`card-property-${idx}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <CardTitle className="text-sm">{prop.name}</CardTitle>
                    {trendIcon(prop.trend)}
                  </div>
                  <CardDescription className="flex items-center gap-1 text-xs">
                    <MapPin className="w-3 h-3" />
                    {prop.address}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Units</span>
                      <span className="font-medium" data-testid={`text-units-${idx}`}>{prop.units}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Occupancy</span>
                      <span className={`font-medium ${prop.occupancy < 90 ? "text-red-500" : "text-emerald-600"}`} data-testid={`text-occupancy-${idx}`}>{prop.occupancy}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">NOI</span>
                      <span className="font-medium" data-testid={`text-noi-${idx}`}>${(prop.noi / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Delinquency</span>
                      <span className={`font-medium ${prop.delinquency > 3 ? "text-red-500" : "text-muted-foreground"}`} data-testid={`text-delinquency-${idx}`}>{prop.delinquency}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Maint. Backlog</span>
                      <span className="font-medium" data-testid={`text-backlog-${idx}`}>{prop.maintenanceBacklog}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Market Value</span>
                      <span className="font-medium" data-testid={`text-market-value-${idx}`}>${(prop.marketValue / 1000000).toFixed(0)}M</span>
                    </div>
                  </div>
                  <Progress value={prop.occupancy} className="h-1.5" data-testid={`progress-occupancy-${idx}`} />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card data-testid="card-comparison">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <BarChart3 className="w-5 h-5 text-primary" />
                <CardTitle>Property Comparison</CardTitle>
                <Badge variant="secondary" className="text-xs">8 Properties</Badge>
              </div>
              <CardDescription>Side-by-side performance metrics across all properties</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground sticky left-0 bg-card">Metric</th>
                      {properties.map((p, i) => (
                        <th key={i} className="p-3 font-medium text-muted-foreground text-center whitespace-nowrap">{p.name.split(" ")[0]}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonMetrics.map((row, idx) => (
                      <tr key={idx} className="border-b last:border-0" data-testid={`row-comparison-${idx}`}>
                        <td className="p-3 font-medium sticky left-0 bg-card">{row.metric}</td>
                        <td className="p-3 text-center">{row.riverside}</td>
                        <td className="p-3 text-center">{row.oakwood}</td>
                        <td className="p-3 text-center">{row.summit}</td>
                        <td className="p-3 text-center">{row.harbor}</td>
                        <td className="p-3 text-center">{row.maple}</td>
                        <td className="p-3 text-center">{row.sunset}</td>
                        <td className="p-3 text-center">{row.lakeshore}</td>
                        <td className="p-3 text-center">{row.pinecrest}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="noi" className="space-y-4">
          <Card data-testid="card-noi-benchmarking">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <DollarSign className="w-5 h-5 text-primary" />
                <CardTitle>NOI Benchmarking</CardTitle>
                <Badge variant="secondary" className="text-xs">vs Market</Badge>
              </div>
              <CardDescription>Net Operating Income performance against market benchmarks</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Property</th>
                      <th className="p-3 font-medium text-muted-foreground">NOI Actual</th>
                      <th className="p-3 font-medium text-muted-foreground">NOI Target</th>
                      <th className="p-3 font-medium text-muted-foreground">Variance</th>
                      <th className="p-3 font-medium text-muted-foreground">Revenue/Unit</th>
                      <th className="p-3 font-medium text-muted-foreground">Expense/Unit</th>
                      <th className="p-3 font-medium text-muted-foreground">Cap Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {noiBenchmarks.map((row, idx) => (
                      <tr key={idx} className="border-b last:border-0" data-testid={`row-noi-${idx}`}>
                        <td className="p-3 font-medium">{row.property}</td>
                        <td className="p-3 font-mono text-xs">${(row.noiActual / 1000).toFixed(0)}K</td>
                        <td className="p-3 font-mono text-xs text-muted-foreground">${(row.noiTarget / 1000).toFixed(0)}K</td>
                        <td className="p-3">
                          <Badge variant={row.variance >= 0 ? "secondary" : "destructive"} className="text-xs" data-testid={`badge-variance-${idx}`}>
                            {row.variance >= 0 ? "+" : ""}{row.variance.toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="p-3 font-mono text-xs">${row.revenueUnit}</td>
                        <td className="p-3 font-mono text-xs">${row.expenseUnit}</td>
                        <td className="p-3 font-mono text-xs">{row.capRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regional" className="space-y-4">
          <Card data-testid="card-regional-analysis">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Globe className="w-5 h-5 text-primary" />
                <CardTitle>Regional Analysis</CardTitle>
                <Badge variant="secondary" className="text-xs">6 Markets</Badge>
              </div>
              <CardDescription>Properties grouped by region with aggregate market metrics</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Region</th>
                      <th className="p-3 font-medium text-muted-foreground">Properties</th>
                      <th className="p-3 font-medium text-muted-foreground">Total Units</th>
                      <th className="p-3 font-medium text-muted-foreground">Avg Occupancy</th>
                      <th className="p-3 font-medium text-muted-foreground">Avg NOI</th>
                      <th className="p-3 font-medium text-muted-foreground">Market Rent Trend</th>
                      <th className="p-3 font-medium text-muted-foreground">Supply Pipeline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {regionalData.map((row, idx) => (
                      <tr key={idx} className="border-b last:border-0" data-testid={`row-regional-${idx}`}>
                        <td className="p-3 font-medium">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                            {row.region}
                          </div>
                        </td>
                        <td className="p-3">{row.properties}</td>
                        <td className="p-3 font-mono text-xs">{row.totalUnits.toLocaleString()}</td>
                        <td className="p-3">
                          <span className={row.avgOccupancy < 90 ? "text-amber-600" : "text-emerald-600"}>{row.avgOccupancy}%</span>
                        </td>
                        <td className="p-3 font-mono text-xs">${(row.avgNoi / 1000).toFixed(0)}K</td>
                        <td className="p-3">
                          <Badge variant="secondary" className="text-xs" data-testid={`badge-rent-trend-${idx}`}>
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {row.marketRentTrend}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">{row.supplyPipeline}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="watchlist" className="space-y-4">
          <Card data-testid="card-watchlist">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Eye className="w-5 h-5 text-primary" />
                <CardTitle>Watchlist</CardTitle>
                <Badge variant="destructive" className="text-xs">{watchlist.length} Items</Badge>
              </div>
              <CardDescription>Properties and metrics flagged by the AI agent for attention</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Property</th>
                      <th className="p-3 font-medium text-muted-foreground">Metric</th>
                      <th className="p-3 font-medium text-muted-foreground">Current</th>
                      <th className="p-3 font-medium text-muted-foreground">Threshold</th>
                      <th className="p-3 font-medium text-muted-foreground">Trend</th>
                      <th className="p-3 font-medium text-muted-foreground">AI Recommendation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {watchlist.map((item, idx) => (
                      <tr key={idx} className="border-b last:border-0" data-testid={`row-watchlist-${idx}`}>
                        <td className="p-3 font-medium">{item.property}</td>
                        <td className="p-3">{item.metric}</td>
                        <td className="p-3 font-mono text-xs font-medium">{item.currentValue}</td>
                        <td className="p-3 font-mono text-xs text-muted-foreground">{item.threshold}</td>
                        <td className="p-3">
                          {item.trend === "up" && <Badge variant="destructive" className="text-xs"><ArrowUpRight className="w-3 h-3 mr-0.5" />Rising</Badge>}
                          {item.trend === "down" && <Badge variant="destructive" className="text-xs"><ArrowDownRight className="w-3 h-3 mr-0.5" />Falling</Badge>}
                          {item.trend === "flat" && <Badge variant="outline" className="text-xs"><Activity className="w-3 h-3 mr-0.5" />Flat</Badge>}
                        </td>
                        <td className="p-3 text-xs text-muted-foreground max-w-[300px]">
                          <div className="flex items-start gap-1">
                            <Brain className="w-3 h-3 mt-0.5 flex-shrink-0 text-primary" />
                            <span data-testid={`text-recommendation-${idx}`}>{item.recommendation}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
