import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ShieldAlert,
  Activity,
  Target,
  AlertTriangle,
  Brain,
  ArrowDownRight,
  Radio,
  CheckCircle2,
  Users,
  Store,
  FileText,
  Mail,
  CalendarDays,
  ArrowRight,
  Briefcase,
  UserPlus,
  Send,
  Eye,
  Wrench,
  ClipboardList,
  Sparkles,
  Shield,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { AINudgeCard, AgentInsightStrip } from "@/components/ai-nudge-card";

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

const agentDigest = [
  {
    title: "Delinquency Risk Detected",
    insight: "Kevin M. (Riverdale #102) shows 91% delinquency probability. 3 consecutive late payments detected. Neural model recommends immediate behavioral nudge with $50 incentive offer.",
    severity: "critical" as const,
    confidence: 0.91,
    actionLabel: "Send AI Nudge",
    metric: "$3,200 at risk",
    metricLabel: "Exposure",
    icon: AlertTriangle,
  },
  {
    title: "Vendor Float Optimization",
    insight: "3 vendor invoices totaling $85K mature on the same date (Mar 15). Shifting $45K to the enhanced treasury product before maturity could capture an additional $420/yr in yield.",
    severity: "opportunity" as const,
    confidence: 0.87,
    actionLabel: "Optimize Float",
    metric: "+$420/yr",
    metricLabel: "Projected Yield",
    icon: Sparkles,
  },
  {
    title: "Lease Renewal — High Churn Risk",
    insight: "David Kim's lease expires in 28 days with a 45% churn risk. Renewal prediction model suggests offering a flat renewal with 2% cashback incentive to reduce churn to 12%.",
    severity: "warning" as const,
    confidence: 0.88,
    actionLabel: "Generate Offer",
    metric: "45% churn risk",
    metricLabel: "Current Risk",
    icon: Target,
  },
];

const agentTopInsights = [
  { text: "2 delinquency risks flagged", severity: "critical" as const, confidence: 0.91 },
  { text: "Collection rate +2.5% MTD", severity: "positive" as const },
  { text: "$85K vendor float maturing", severity: "warning" as const, confidence: 0.87 },
  { text: "3 leases auto-renewable", severity: "positive" as const },
];

const activityFeed = [
  { type: "ai_action", title: "Agent sent behavioral nudge", desc: "Rachel Chen — Unit 2D — $50 early-pay incentive triggered by neural model", amount: null, time: "5 min ago", icon: Brain, color: "text-primary" },
  { type: "payment", title: "Rent payment received", desc: "Marcus Johnson — Unit 4A, Sunset Heights", amount: "$2,450.00", time: "12 min ago", icon: DollarSign, color: "text-emerald-600 dark:text-emerald-400" },
  { type: "ai_action", title: "Agent auto-reconciled 14 transactions", desc: "February batch — 98.5% match confidence — 2 flagged for manual review", amount: null, time: "25 min ago", icon: Sparkles, color: "text-primary" },
  { type: "vendor", title: "Vendor onboarding approved", desc: "GreenScape Landscaping — compliance docs verified by AI agent", amount: null, time: "28 min ago", icon: CheckCircle2, color: "text-blue-600 dark:text-blue-400" },
  { type: "alert", title: "Late payment flagged", desc: "Rachel Chen — Unit 2D, The Metropolitan — 3 days overdue", amount: "$3,200.00", time: "1h ago", icon: AlertTriangle, color: "text-amber-600 dark:text-amber-400" },
  { type: "ai_action", title: "Agent generated investor report draft", desc: "Q1 report auto-compiled — NOI trending +4.2% — pending review", amount: null, time: "1.5h ago", icon: Brain, color: "text-primary" },
  { type: "lease", title: "Lease renewal auto-generated", desc: "Priya Patel — Unit 3B, Willow Creek — 95% renewal probability", amount: null, time: "2h ago", icon: FileText, color: "text-indigo-600 dark:text-indigo-400" },
  { type: "merchant", title: "New merchant application", desc: "QuickFit Gym — The Metropolitan B1 — agent scored 78% fit", amount: null, time: "3h ago", icon: Store, color: "text-violet-600 dark:text-violet-400" },
];

const aiTasks = [
  { title: "Review delinquency intervention — Kevin M.", type: "collections", dueDate: "Now", priority: "high" as const, assignee: "Agent", aiSuggestion: "Behavioral nudge ready — approve to send", agentConfidence: 0.91, agentAction: true },
  { title: "Approve vendor float reallocation", type: "treasury", dueDate: "Today", priority: "high" as const, assignee: "Agent", aiSuggestion: "Shift $45K before Mar 15 maturity", agentConfidence: 0.87, agentAction: true },
  { title: "Review GreenScape insurance renewal", type: "vendor", dueDate: "Today", priority: "high" as const, assignee: "Sarah M.", aiSuggestion: "Auto-approve — 96% compliance score", agentConfidence: 0.96, agentAction: false },
  { title: "Send Net60 payout — Summit Electric", type: "payment", dueDate: "Today", priority: "medium" as const, assignee: "Lisa P.", aiSuggestion: "Lock float at current 5.5% yield", agentConfidence: 0.82, agentAction: false },
  { title: "Lease renewal outreach — David Kim", type: "lease", dueDate: "Tomorrow", priority: "high" as const, assignee: "David C.", aiSuggestion: "Offer flat renewal — 45% churn risk", agentConfidence: 0.88, agentAction: true },
  { title: "Merchant onboarding review — PetCare Plus", type: "merchant", dueDate: "Feb 22", priority: "medium" as const, assignee: "Sarah M.", aiSuggestion: "Strong tenant overlap — 78% fit score", agentConfidence: 0.78, agentAction: false },
];

const pipelineSummary = {
  vendors: { lead: 1, documents: 1, review: 1, approved: 0, active: 3 },
  merchants: { lead: 2, onboarding: 1, active: 3 },
  renewals: { autoRenew: 3, needsOutreach: 1, atRisk: 2 },
  collections: { current: 42, late: 5, overdue: 3, critical: 1 },
};

const anomalyData = [
  { month: "Sep", expected: 92, actual: 87 },
  { month: "Oct", expected: 92, actual: 89 },
  { month: "Nov", expected: 93, actual: 91 },
  { month: "Dec", expected: 93, actual: 90 },
  { month: "Jan", expected: 94, actual: 93 },
  { month: "Feb", expected: 94, actual: 95 },
];

const priorityConfig = {
  high: { label: "High", variant: "destructive" as const },
  medium: { label: "Med", variant: "outline" as const },
  low: { label: "Low", variant: "secondary" as const },
};

export default function Dashboard() {
  const { data: kpis, isLoading } = useQuery<KPIData>({
    queryKey: ["/api/kpis"],
  });

  const kpiCards = [
    { title: "On-Time Payment", value: kpis?.onTimePercent ? `${kpis.onTimePercent.toFixed(1)}%` : "—", change: "+2.5%", trend: "up" as const, icon: Percent, color: "text-green-600" },
    { title: "DSO (Days)", value: kpis?.dso ? kpis.dso.toFixed(0) : "—", change: "-3 days", trend: "up" as const, icon: Clock, color: "text-blue-600" },
    { title: "Delinquent", value: kpis?.delinquentAmount ? `$${(kpis.delinquentAmount / 1000).toFixed(0)}K` : "—", change: "-12%", trend: "up" as const, icon: AlertCircle, color: "text-orange-600" },
    { title: "Treasury AUM", value: kpis?.treasuryAUM ? `$${(kpis.treasuryAUM / 1000000).toFixed(1)}M` : "—", change: "+5.3%", trend: "up" as const, icon: Landmark, color: "text-indigo-600" },
    { title: "Current Yield", value: kpis?.currentYield ? `${kpis.currentYield.toFixed(2)}%` : "—", change: "+0.15%", trend: "up" as const, icon: DollarSign, color: "text-emerald-600" },
    { title: "Vendor Float", value: kpis?.vendorFloatAUM ? `$${(kpis.vendorFloatAUM / 1000).toFixed(0)}K` : "—", change: "Net30-90", trend: "up" as const, icon: Zap, color: "text-violet-600" },
  ];

  return (
    <div className="space-y-6" data-testid="page-dashboard">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-page-title">Command Center</h1>
          <p className="text-muted-foreground">
            Agentic financial intelligence — your AI agent manages, alerts, and acts across your portfolio
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs" data-testid="badge-agent-status">
            <Brain className="w-3 h-3 mr-1 text-primary" />
            Agent Active
          </Badge>
          <Badge variant="secondary" className="text-xs" data-testid="badge-neural-status">
            <Radio className="w-3 h-3 mr-1 text-green-500 animate-pulse" />
            Neural Engine
          </Badge>
        </div>
      </div>

      <AgentInsightStrip insights={agentTopInsights} />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpiCards.map((card, index) => (
          <Card key={card.title} className="hover-elevate" data-testid={`card-kpi-${index}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-1 pt-3 px-3">
              <CardTitle className="text-xs font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="text-xl font-mono tabular-nums font-semibold">
                {isLoading ? <div className="h-7 w-16 bg-muted animate-pulse rounded" /> : card.value}
              </div>
              <div className="flex items-center gap-1 text-xs mt-0.5">
                {card.trend === "up" ? (
                  <TrendingUp className="w-3 h-3 text-green-600" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-600" />
                )}
                <span className={card.trend === "up" ? "text-green-600" : "text-red-600"}>{card.change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card data-testid="card-agent-digest">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <Brain className="w-5 h-5 text-primary" />
                  <CardTitle>Agent Digest</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {agentDigest.length} actions recommended
                  </Badge>
                </div>
              </div>
              <CardDescription>Your AI agent analyzed overnight activity and surfaced these priority items</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {agentDigest.map((item, idx) => (
                <AINudgeCard
                  key={idx}
                  title={item.title}
                  insight={item.insight}
                  severity={item.severity}
                  confidence={item.confidence}
                  actionLabel={item.actionLabel}
                  onAction={() => {}}
                  metric={item.metric}
                  metricLabel={item.metricLabel}
                  icon={item.icon}
                  agentSource="Naltos Agent"
                />
              ))}
            </CardContent>
          </Card>

          <Card data-testid="card-pipeline-overview">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Briefcase className="w-5 h-5 text-primary" />
                <CardTitle>Pipeline Overview</CardTitle>
                <Badge variant="secondary" className="text-xs">Agent-Monitored</Badge>
              </div>
              <CardDescription>Cross-module pipeline health — agent tracks and alerts on status changes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium flex items-center gap-2"><Users className="w-4 h-4 text-muted-foreground" /> Vendor Pipeline</span>
                  <span className="text-muted-foreground">{Object.values(pipelineSummary.vendors).reduce((a, b) => a + b, 0)} total</span>
                </div>
                <div className="flex gap-1 h-6">
                  {[
                    { label: "Lead", count: pipelineSummary.vendors.lead, color: "bg-muted-foreground/30" },
                    { label: "Docs", count: pipelineSummary.vendors.documents, color: "bg-amber-500/70" },
                    { label: "Review", count: pipelineSummary.vendors.review, color: "bg-blue-500/70" },
                    { label: "Active", count: pipelineSummary.vendors.active, color: "bg-emerald-500/70" },
                  ].map((stage, i) => (
                    stage.count > 0 ? (
                      <div key={i} className={`${stage.color} rounded-md flex items-center justify-center text-xs font-medium text-white px-2`}
                        style={{ flex: stage.count }} data-testid={`vendor-pipeline-bar-${stage.label.toLowerCase()}`}>
                        {stage.count} {stage.label}
                      </div>
                    ) : null
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium flex items-center gap-2"><Store className="w-4 h-4 text-muted-foreground" /> Merchant Pipeline</span>
                  <span className="text-muted-foreground">{Object.values(pipelineSummary.merchants).reduce((a, b) => a + b, 0)} total</span>
                </div>
                <div className="flex gap-1 h-6">
                  {[
                    { label: "Lead", count: pipelineSummary.merchants.lead, color: "bg-muted-foreground/30" },
                    { label: "Onboarding", count: pipelineSummary.merchants.onboarding, color: "bg-blue-500/70" },
                    { label: "Active", count: pipelineSummary.merchants.active, color: "bg-emerald-500/70" },
                  ].map((stage, i) => (
                    stage.count > 0 ? (
                      <div key={i} className={`${stage.color} rounded-md flex items-center justify-center text-xs font-medium text-white px-2`}
                        style={{ flex: stage.count }} data-testid={`merchant-pipeline-bar-${stage.label.toLowerCase()}`}>
                        {stage.count} {stage.label}
                      </div>
                    ) : null
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium flex items-center gap-2"><FileText className="w-4 h-4 text-muted-foreground" /> Lease Renewals</span>
                  <span className="text-muted-foreground">{Object.values(pipelineSummary.renewals).reduce((a, b) => a + b, 0)} expiring</span>
                </div>
                <div className="flex gap-1 h-6">
                  {[
                    { label: "Auto-Renew", count: pipelineSummary.renewals.autoRenew, color: "bg-emerald-500/70" },
                    { label: "Outreach", count: pipelineSummary.renewals.needsOutreach, color: "bg-amber-500/70" },
                    { label: "At Risk", count: pipelineSummary.renewals.atRisk, color: "bg-red-500/70" },
                  ].map((stage, i) => (
                    stage.count > 0 ? (
                      <div key={i} className={`${stage.color} rounded-md flex items-center justify-center text-xs font-medium text-white px-2`}
                        style={{ flex: stage.count }} data-testid={`renewal-pipeline-bar-${stage.label.toLowerCase().replace(/\s/g, '-')}`}>
                        {stage.count} {stage.label}
                      </div>
                    ) : null
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium flex items-center gap-2"><DollarSign className="w-4 h-4 text-muted-foreground" /> Collections</span>
                  <span className="text-muted-foreground">{Object.values(pipelineSummary.collections).reduce((a, b) => a + b, 0)} accounts</span>
                </div>
                <div className="flex gap-1 h-6">
                  {[
                    { label: "Current", count: pipelineSummary.collections.current, color: "bg-emerald-500/70" },
                    { label: "Late", count: pipelineSummary.collections.late, color: "bg-amber-500/70" },
                    { label: "Overdue", count: pipelineSummary.collections.overdue, color: "bg-orange-500/70" },
                    { label: "Critical", count: pipelineSummary.collections.critical, color: "bg-red-500/70" },
                  ].map((stage, i) => (
                    stage.count > 0 ? (
                      <div key={i} className={`${stage.color} rounded-md flex items-center justify-center text-xs font-medium text-white px-2`}
                        style={{ flex: stage.count }} data-testid={`collection-pipeline-bar-${stage.label.toLowerCase()}`}>
                        {stage.count} {stage.label}
                      </div>
                    ) : null
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-anomaly-detection">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Target className="w-5 h-5 text-primary" />
                <CardTitle>Collection Anomaly Detection</CardTitle>
                <Badge variant="secondary" className="text-xs">Neuromorphic</Badge>
              </div>
              <CardDescription>Spiking neural network: expected vs actual collection rate with gap analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full">
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

        <div className="space-y-6">
          <Card data-testid="card-agent-task-queue">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Brain className="w-5 h-5 text-primary" />
                <CardTitle className="text-base">Agent Task Queue</CardTitle>
              </div>
              <CardDescription className="text-xs">AI-prioritized actions — agent-generated items marked with a signal indicator</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {aiTasks.slice(0, 5).map((task, i) => (
                <div key={i} className="p-2.5 border rounded-lg space-y-1.5" data-testid={`ai-task-${i}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {task.agentAction && <Sparkles className="w-3 h-3 text-primary flex-shrink-0" />}
                      <p className="text-sm font-medium leading-tight truncate">{task.title}</p>
                    </div>
                    <Badge variant={priorityConfig[task.priority].variant} className="text-xs shrink-0">
                      {priorityConfig[task.priority].label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                    <CalendarDays className="w-3 h-3" />
                    <span>{task.dueDate}</span>
                    <span className="text-muted-foreground/50">|</span>
                    <span>{task.assignee}</span>
                    <Badge variant="outline" className="text-[10px] ml-auto">{Math.round(task.agentConfidence * 100)}%</Badge>
                  </div>
                  <div className="flex items-start gap-1.5 text-xs">
                    <Brain className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground" data-testid={`text-ai-suggestion-${i}`}>{task.aiSuggestion}</span>
                  </div>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full mt-1" data-testid="button-view-all-tasks">
                View all {aiTasks.length} tasks
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardContent>
          </Card>

          <Card data-testid="card-agent-actions-log">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Sparkles className="w-5 h-5 text-primary" />
                <CardTitle className="text-base">Agent Actions Log</CardTitle>
              </div>
              <CardDescription className="text-xs">Actions your AI agent has taken autonomously or is requesting approval</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { action: "Sent behavioral nudge to Rachel Chen", status: "completed", time: "5m ago", confidence: 0.94 },
                { action: "Auto-reconciled 14 transactions", status: "completed", time: "25m ago", confidence: 0.98 },
                { action: "Verified GreenScape compliance docs", status: "completed", time: "28m ago", confidence: 0.96 },
                { action: "Generated Q1 investor report draft", status: "pending_review", time: "1.5h ago", confidence: 0.89 },
                { action: "Proposed vendor float reallocation", status: "pending_approval", time: "2h ago", confidence: 0.87 },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg border text-xs" data-testid={`agent-action-${i}`}>
                  {item.status === "completed" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />}
                  {item.status === "pending_review" && <Eye className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                  {item.status === "pending_approval" && <Shield className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />}
                  <span className="flex-1 min-w-0 truncate">{item.action}</span>
                  <Badge variant="outline" className="text-[10px] flex-shrink-0">{Math.round(item.confidence * 100)}%</Badge>
                  <span className="text-muted-foreground flex-shrink-0">{item.time}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card data-testid="card-risk-alerts">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <ShieldAlert className="w-5 h-5 text-orange-600" />
                <CardTitle className="text-base">Risk Alerts</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { severity: "warning", title: "Elevated Delinquency — Pine Valley", desc: "5.6% volatility spike. 8 tenants flagged by neural model.", time: "2h ago" },
                { severity: "info", title: "Vendor Float Approaching Net90", desc: "$45K maturing in 5 days. Agent recommends reallocation.", time: "6h ago" },
                { severity: "success", title: "Collection Rate Improving", desc: "+2.5% MTD. Agent incentives drove 68% conversion.", time: "1d ago" },
              ].map((alert, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2.5 border rounded-lg" data-testid={`alert-${i}`}>
                  {alert.severity === "warning" && <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />}
                  {alert.severity === "info" && <Activity className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />}
                  {alert.severity === "success" && <TrendingUp className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs leading-tight">{alert.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{alert.desc}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{alert.time}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card data-testid="card-activity-feed">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Activity className="w-5 h-5 text-primary" />
              <CardTitle>Activity Feed</CardTitle>
              <Badge variant="secondary" className="text-xs">Live</Badge>
            </div>
            <Button variant="ghost" size="sm" data-testid="button-filter-activity">
              <Eye className="w-4 h-4 mr-1" />
              Filter
            </Button>
          </div>
          <CardDescription>Real-time CRM activity — agent actions, payments, vendors, merchants, leases</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-0">
              {activityFeed.map((item, i) => (
                <div key={i} className="relative flex items-start gap-3 py-3 pl-8" data-testid={`activity-${i}`}>
                  <div className={`absolute left-2.5 top-4 w-3 h-3 rounded-full bg-background border-2 ${item.type === "ai_action" ? "border-primary" : "border-border"} z-10`} />
                  <div className={`w-8 h-8 rounded-lg ${item.type === "ai_action" ? "bg-primary/10" : "bg-muted"} flex items-center justify-center shrink-0 ${item.color}`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        {item.type === "ai_action" && <Badge variant="outline" className="text-[10px]">Agent</Badge>}
                        <p className="text-sm font-medium" data-testid={`activity-title-${i}`}>{item.title}</p>
                      </div>
                      {item.amount && <span className="text-sm font-mono font-medium" data-testid={`activity-amount-${i}`}>{item.amount}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5" data-testid={`activity-description-${i}`}>{item.desc}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
                </div>
              ))}
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
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Brain className="w-5 h-5 text-primary" />
            <CardTitle>Neural Early Warning System</CardTitle>
            <Badge variant="secondary" className="text-xs" data-testid="badge-neural-live">
              <Radio className="w-3 h-3 mr-1 text-green-500 animate-pulse" />
              Live
            </Badge>
          </div>
          <CardDescription>Spiking neural network analysis — detecting pre-delinquency patterns</CardDescription>
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
                <div key={ip.id} className="flex items-start gap-2 p-2 border rounded-lg" data-testid={`inflection-${ip.id}`}>
                  <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-medium">{ip.tenant || ip.property}</p>
                      <Badge variant="destructive" className="text-[10px]">{Math.round(ip.probability * 100)}%</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{ip.neuralDrivers?.[0]}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card data-testid="card-noi-forecast">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <TrendingUp className="w-5 h-5 text-primary" />
            <CardTitle>NOI Forecast</CardTitle>
            <Badge variant="secondary" className="text-xs">Agent-Projected</Badge>
          </div>
          <CardDescription>Neural-optimized NOI projections — agent continuously refines based on signals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={noiData.forecast || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} />
                <Area type="monotone" dataKey="pessimistic" fill="hsl(var(--destructive) / 0.1)" stroke="hsl(var(--destructive) / 0.3)" strokeWidth={1} />
                <Area type="monotone" dataKey="neural" fill="hsl(var(--primary) / 0.2)" stroke="hsl(var(--primary))" strokeWidth={2} />
                <Area type="monotone" dataKey="optimistic" fill="hsl(var(--chart-2) / 0.1)" stroke="hsl(var(--chart-2) / 0.3)" strokeWidth={1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
