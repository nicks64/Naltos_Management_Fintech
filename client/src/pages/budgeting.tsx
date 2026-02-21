import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AINudgeCard, AgentInsightStrip } from "@/components/ai-nudge-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Brain,
  Target,
  Wallet,
  BarChart3,
  PieChart,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Users,
  Sparkles,
  Activity,
  ChevronRight,
  Landmark,
  ShieldCheck,
} from "lucide-react";

const agentInsights = [
  { text: "Insurance line item trending 8% over budget", severity: "warning" as const, confidence: 0.91 },
  { text: "Utility costs down 4.2% vs forecast", severity: "positive" as const },
  { text: "CapEx roof project should move to Q2 for optimal pricing", severity: "info" as const, confidence: 0.84 },
];

const kpiCards = [
  { title: "Annual Budget", value: "$4.2M", change: "FY 2026", trend: "neutral", icon: Wallet },
  { title: "YTD Spend", value: "$1.85M", change: "44% of budget", trend: "positive", icon: DollarSign },
  { title: "Variance", value: "-2.3%", change: "Under budget", trend: "positive", icon: BarChart3 },
  { title: "CapEx Reserve", value: "$380K", change: "Fully funded", trend: "positive", icon: Landmark },
];

const budgetLineItems = [
  { category: "Payroll", budgeted: 1260000, actual: 558600, icon: Users },
  { category: "Maintenance", budgeted: 504000, actual: 237400, icon: Target },
  { category: "Utilities", budgeted: 420000, actual: 178200, icon: Activity },
  { category: "Insurance", budgeted: 336000, actual: 163800, icon: ShieldCheck },
  { category: "Marketing", budgeted: 252000, actual: 104500, icon: TrendingUp },
  { category: "Admin", budgeted: 210000, actual: 96300, icon: Building2 },
  { category: "Landscaping", budgeted: 168000, actual: 72100, icon: Target },
  { category: "Pest Control", budgeted: 84000, actual: 38200, icon: ShieldCheck },
  { category: "Security", budgeted: 126000, actual: 54800, icon: ShieldCheck },
  { category: "Trash", budgeted: 63000, actual: 28400, icon: Target },
];

const varianceData = [
  { category: "Payroll", budget: 558600, actual: 558600, dollarVariance: 0, pctVariance: 0, trend: "flat", aiExplanation: "On track with seasonal staffing plan" },
  { category: "Maintenance", budget: 237400, actual: 245100, dollarVariance: 7700, pctVariance: 3.2, trend: "up", aiExplanation: "Unplanned HVAC repairs in Building C drove overage" },
  { category: "Utilities", budget: 178200, actual: 170700, dollarVariance: -7500, pctVariance: -4.2, trend: "down", aiExplanation: "LED retrofit and smart thermostat savings materializing" },
  { category: "Insurance", budget: 163800, actual: 176900, dollarVariance: 13100, pctVariance: 8.0, trend: "up", aiExplanation: "Premium increase due to regional storm claims; renegotiation recommended" },
  { category: "Marketing", budget: 104500, actual: 98200, dollarVariance: -6300, pctVariance: -6.0, trend: "down", aiExplanation: "Digital spend lower than planned; shifting to Q3 campaign" },
  { category: "Admin", budget: 96300, actual: 99100, dollarVariance: 2800, pctVariance: 2.9, trend: "up", aiExplanation: "Software license true-up added mid-quarter" },
  { category: "Landscaping", budget: 72100, actual: 68400, dollarVariance: -3700, pctVariance: -5.1, trend: "down", aiExplanation: "Vendor renegotiation yielded 5% discount" },
  { category: "Security", budget: 54800, actual: 56200, dollarVariance: 1400, pctVariance: 2.6, trend: "up", aiExplanation: "After-hours patrol added for Building A parking" },
];

const capexProjects = [
  { name: "Roof Replacement - Building A", estimatedCost: 185000, priority: "High", status: "Approved", fundedPct: 100, timeline: "Q2 2026" },
  { name: "Elevator Modernization", estimatedCost: 320000, priority: "High", status: "In Progress", fundedPct: 75, timeline: "Q1-Q2 2026" },
  { name: "Parking Lot Resurfacing", estimatedCost: 95000, priority: "Medium", status: "Planned", fundedPct: 40, timeline: "Q3 2026" },
  { name: "Pool Area Renovation", estimatedCost: 68000, priority: "Low", status: "Planned", fundedPct: 20, timeline: "Q4 2026" },
  { name: "HVAC System Upgrade - Bldg C", estimatedCost: 142000, priority: "High", status: "In Progress", fundedPct: 90, timeline: "Q1 2026" },
  { name: "Lobby Renovation", estimatedCost: 55000, priority: "Medium", status: "Approved", fundedPct: 100, timeline: "Q2 2026" },
  { name: "Fire Alarm System Update", estimatedCost: 78000, priority: "High", status: "Complete", fundedPct: 100, timeline: "Q1 2026" },
  { name: "Fitness Center Equipment", estimatedCost: 42000, priority: "Low", status: "Planned", fundedPct: 0, timeline: "Q4 2026" },
];

const ownerDistributions = [
  { property: "Oakwood Apartments", owner: "Naltos Fund I, LLC", netIncome: 124500, distribution: 99600, date: "Mar 15, 2026", status: "Scheduled" },
  { property: "Riverside Commons", owner: "J. Mitchell Trust", netIncome: 98200, distribution: 78560, date: "Mar 15, 2026", status: "Scheduled" },
  { property: "Maple Grove Residences", owner: "Naltos Fund I, LLC", netIncome: 87400, distribution: 69920, date: "Mar 15, 2026", status: "Scheduled" },
  { property: "Pine Valley Estates", owner: "K. Rodriguez Holdings", netIncome: 112300, distribution: 89840, date: "Feb 15, 2026", status: "Paid" },
  { property: "Summit View Towers", owner: "Naltos Fund II, LLC", netIncome: 156800, distribution: 125440, date: "Feb 15, 2026", status: "Paid" },
  { property: "Lakeshore Village", owner: "D. Chen Partners", netIncome: 73600, distribution: 58880, date: "Feb 15, 2026", status: "Paid" },
  { property: "Heritage Park", owner: "Naltos Fund I, LLC", netIncome: 91200, distribution: 72960, date: "Jan 15, 2026", status: "Paid" },
];

const forecastCards = [
  { label: "Revenue", current: "$1.12M", forecast: "$1.18M", change: "+5.4%", direction: "up", confidence: 0.92 },
  { label: "Expenses", current: "$620K", forecast: "$645K", change: "+4.0%", direction: "up", confidence: 0.88 },
  { label: "NOI", current: "$500K", forecast: "$535K", change: "+7.0%", direction: "up", confidence: 0.85 },
  { label: "Occupancy", current: "94.2%", forecast: "95.8%", change: "+1.6%", direction: "up", confidence: 0.90 },
];

const priorityVariant: Record<string, "destructive" | "outline" | "secondary"> = {
  High: "destructive",
  Medium: "outline",
  Low: "secondary",
};

const statusVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  Planned: "outline",
  Approved: "default",
  "In Progress": "default",
  Complete: "secondary",
  Scheduled: "outline",
  Paid: "secondary",
};

function formatCurrency(val: number) {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
  return `$${val.toLocaleString()}`;
}

export default function Budgeting() {
  return (
    <div className="space-y-6" data-testid="page-budgeting">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-page-title">Budgeting & Forecasting</h1>
          <p className="text-muted-foreground">Annual operating budgets, variance analysis, and AI-driven forecasting</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs" data-testid="badge-agent-status">
            <Brain className="w-3 h-3 mr-1 text-primary" />
            Agent Active
          </Badge>
          <Button size="sm" data-testid="button-export-budget">
            <BarChart3 className="w-3 h-3 mr-1" />
            Export Budget
          </Button>
        </div>
      </div>

      <AgentInsightStrip insights={agentInsights} />

      <AINudgeCard
        title="Insurance Expense Trending Over Budget"
        insight="Agent detected insurance costs trending 8% above budget due to regional premium increases. Recommend requesting competitive bids from 2-3 carriers to offset $13,100 projected overage. Early renegotiation could save $9,200 annually."
        confidence={0.91}
        severity="warning"
        icon={AlertTriangle}
        actionLabel="Request Bids"
        onAction={() => {}}
        secondaryLabel="View Breakdown"
        onSecondary={() => {}}
        metric="$9,200"
        metricLabel="Potential Savings"
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
                  <Activity className="w-3 h-3 text-muted-foreground" />
                )}
                <span className={card.trend === "positive" ? "text-emerald-600" : "text-muted-foreground"}>{card.change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="budget-overview" className="space-y-4">
        <TabsList data-testid="tabs-budgeting">
          <TabsTrigger value="budget-overview" data-testid="tab-budget-overview">Budget Overview</TabsTrigger>
          <TabsTrigger value="variance" data-testid="tab-variance">Variance Analysis</TabsTrigger>
          <TabsTrigger value="capex" data-testid="tab-capex">CapEx Planning</TabsTrigger>
          <TabsTrigger value="distributions" data-testid="tab-distributions">Owner Distributions</TabsTrigger>
          <TabsTrigger value="forecasting" data-testid="tab-forecasting">Forecasting</TabsTrigger>
        </TabsList>

        <TabsContent value="budget-overview" className="space-y-4">
          <Card data-testid="card-budget-overview">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <PieChart className="w-5 h-5 text-primary" />
                <CardTitle>Budget Line Items</CardTitle>
                <Badge variant="secondary" className="text-xs">FY 2026</Badge>
              </div>
              <CardDescription>Operating budget by category with year-to-date actuals</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Category</th>
                      <th className="p-3 font-medium text-muted-foreground">Budgeted</th>
                      <th className="p-3 font-medium text-muted-foreground">Actual (YTD)</th>
                      <th className="p-3 font-medium text-muted-foreground">Remaining</th>
                      <th className="p-3 font-medium text-muted-foreground">% Used</th>
                      <th className="p-3 font-medium text-muted-foreground min-w-[120px]">Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budgetLineItems.map((item, idx) => {
                      const remaining = item.budgeted - item.actual;
                      const pctUsed = Math.round((item.actual / item.budgeted) * 100);
                      const IconComp = item.icon;
                      return (
                        <tr key={item.category} className="border-b last:border-0" data-testid={`row-budget-${idx}`}>
                          <td className="p-3 font-medium">
                            <div className="flex items-center gap-1.5">
                              <IconComp className="w-3.5 h-3.5 text-muted-foreground" />
                              {item.category}
                            </div>
                          </td>
                          <td className="p-3 font-mono text-xs">{formatCurrency(item.budgeted)}</td>
                          <td className="p-3 font-mono text-xs">{formatCurrency(item.actual)}</td>
                          <td className="p-3 font-mono text-xs">{formatCurrency(remaining)}</td>
                          <td className="p-3">
                            <Badge variant={pctUsed > 50 ? "outline" : "secondary"} className="text-xs" data-testid={`badge-pct-used-${idx}`}>
                              {pctUsed}%
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Progress value={pctUsed} className="h-2" data-testid={`progress-budget-${idx}`} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variance" className="space-y-4">
          <Card data-testid="card-variance-analysis">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <BarChart3 className="w-5 h-5 text-primary" />
                <CardTitle>Variance Analysis</CardTitle>
                <Badge variant="secondary" className="text-xs">Agent-Analyzed</Badge>
              </div>
              <CardDescription>Budget vs actual with AI-generated explanations for variances</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Category</th>
                      <th className="p-3 font-medium text-muted-foreground">Budget (YTD)</th>
                      <th className="p-3 font-medium text-muted-foreground">Actual</th>
                      <th className="p-3 font-medium text-muted-foreground">$ Variance</th>
                      <th className="p-3 font-medium text-muted-foreground">% Variance</th>
                      <th className="p-3 font-medium text-muted-foreground">Trend</th>
                      <th className="p-3 font-medium text-muted-foreground">AI Explanation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {varianceData.map((item, idx) => (
                      <tr key={item.category} className="border-b last:border-0" data-testid={`row-variance-${idx}`}>
                        <td className="p-3 font-medium">{item.category}</td>
                        <td className="p-3 font-mono text-xs">{formatCurrency(item.budget)}</td>
                        <td className="p-3 font-mono text-xs">{formatCurrency(item.actual)}</td>
                        <td className="p-3 font-mono text-xs">
                          <span className={item.dollarVariance > 0 ? "text-red-600 dark:text-red-400" : item.dollarVariance < 0 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}>
                            {item.dollarVariance > 0 ? "+" : ""}{formatCurrency(Math.abs(item.dollarVariance))}
                          </span>
                        </td>
                        <td className="p-3">
                          <Badge
                            variant={Math.abs(item.pctVariance) > 5 ? "destructive" : Math.abs(item.pctVariance) > 2 ? "outline" : "secondary"}
                            className="text-xs"
                            data-testid={`badge-variance-${idx}`}
                          >
                            {item.pctVariance > 0 ? "+" : ""}{item.pctVariance}%
                          </Badge>
                        </td>
                        <td className="p-3">
                          {item.trend === "up" && <ArrowUpRight className="w-4 h-4 text-red-600 dark:text-red-400" />}
                          {item.trend === "down" && <ArrowDownRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                          {item.trend === "flat" && <Activity className="w-4 h-4 text-muted-foreground" />}
                        </td>
                        <td className="p-3 text-xs text-muted-foreground max-w-[240px]">
                          <div className="flex items-start gap-1">
                            <Brain className="w-3 h-3 mt-0.5 flex-shrink-0 text-primary" />
                            <span>{item.aiExplanation}</span>
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

        <TabsContent value="capex" className="space-y-4">
          <Card data-testid="card-capex-planning">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Building2 className="w-5 h-5 text-primary" />
                <CardTitle>Capital Expenditure Projects</CardTitle>
                <Badge variant="secondary" className="text-xs">{capexProjects.length} projects</Badge>
              </div>
              <CardDescription>Planned and active capital improvement projects with funding status</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Project</th>
                      <th className="p-3 font-medium text-muted-foreground">Est. Cost</th>
                      <th className="p-3 font-medium text-muted-foreground">Priority</th>
                      <th className="p-3 font-medium text-muted-foreground">Status</th>
                      <th className="p-3 font-medium text-muted-foreground">Funded</th>
                      <th className="p-3 font-medium text-muted-foreground">Timeline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {capexProjects.map((project, idx) => (
                      <tr key={idx} className="border-b last:border-0" data-testid={`row-capex-${idx}`}>
                        <td className="p-3 font-medium">{project.name}</td>
                        <td className="p-3 font-mono text-xs">{formatCurrency(project.estimatedCost)}</td>
                        <td className="p-3">
                          <Badge variant={priorityVariant[project.priority]} className="text-xs" data-testid={`badge-capex-priority-${idx}`}>
                            {project.priority}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant={statusVariant[project.status]} className="text-xs" data-testid={`badge-capex-status-${idx}`}>
                            {project.status === "Complete" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {project.status === "In Progress" && <Clock className="w-3 h-3 mr-1" />}
                            {project.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Progress value={project.fundedPct} className="h-2 w-16" data-testid={`progress-capex-funded-${idx}`} />
                            <span className="text-xs text-muted-foreground">{project.fundedPct}%</span>
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground text-xs">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {project.timeline}
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

        <TabsContent value="distributions" className="space-y-4">
          <Card data-testid="card-owner-distributions">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Users className="w-5 h-5 text-primary" />
                <CardTitle>Owner Distribution Schedule</CardTitle>
                <Badge variant="secondary" className="text-xs">Monthly</Badge>
              </div>
              <CardDescription>Net income distributions to property owners and investment entities</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Property</th>
                      <th className="p-3 font-medium text-muted-foreground">Owner</th>
                      <th className="p-3 font-medium text-muted-foreground">Net Income</th>
                      <th className="p-3 font-medium text-muted-foreground">Distribution</th>
                      <th className="p-3 font-medium text-muted-foreground">Date</th>
                      <th className="p-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ownerDistributions.map((dist, idx) => (
                      <tr key={idx} className="border-b last:border-0" data-testid={`row-distribution-${idx}`}>
                        <td className="p-3 font-medium">{dist.property}</td>
                        <td className="p-3 text-muted-foreground">{dist.owner}</td>
                        <td className="p-3 font-mono text-xs">{formatCurrency(dist.netIncome)}</td>
                        <td className="p-3 font-mono text-xs font-medium">{formatCurrency(dist.distribution)}</td>
                        <td className="p-3 text-muted-foreground text-xs">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {dist.date}
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant={statusVariant[dist.status]} className="text-xs" data-testid={`badge-distribution-status-${idx}`}>
                            {dist.status === "Paid" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {dist.status === "Scheduled" && <Clock className="w-3 h-3 mr-1" />}
                            {dist.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-4">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">AI-Generated Q2 2026 Forecast</h3>
            <Badge variant="secondary" className="text-xs">Neural Analysis</Badge>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {forecastCards.map((fc, idx) => (
              <Card key={idx} className="hover-elevate" data-testid={`card-forecast-${idx}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">{fc.label}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Current Quarter</p>
                    <p className="text-lg font-mono font-semibold" data-testid={`text-forecast-current-${idx}`}>{fc.current}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Next Quarter Forecast</p>
                    <p className="text-lg font-mono font-semibold" data-testid={`text-forecast-next-${idx}`}>{fc.forecast}</p>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      {fc.direction === "up" ? (
                        <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-600" />
                      )}
                      <span className="text-sm font-medium text-emerald-600">{fc.change}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      <Brain className="w-3 h-3 mr-0.5" />
                      {Math.round(fc.confidence * 100)}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
