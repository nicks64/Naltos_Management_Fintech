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

const activityFeed = [
  { type: "payment", title: "Rent payment received", desc: "Marcus Johnson — Unit 4A, Sunset Heights", amount: "$2,450.00", time: "12 min ago", icon: DollarSign, color: "text-emerald-600 dark:text-emerald-400" },
  { type: "vendor", title: "Vendor onboarding approved", desc: "GreenScape Landscaping — compliance docs verified by AI", amount: null, time: "28 min ago", icon: CheckCircle2, color: "text-blue-600 dark:text-blue-400" },
  { type: "alert", title: "Late payment flagged", desc: "Rachel Chen — Unit 2D, The Metropolitan — 3 days overdue", amount: "$3,200.00", time: "1h ago", icon: AlertTriangle, color: "text-amber-600 dark:text-amber-400" },
  { type: "lease", title: "Lease renewal auto-generated", desc: "Priya Patel — Unit 3B, Willow Creek — 95% renewal probability", amount: null, time: "2h ago", icon: FileText, color: "text-indigo-600 dark:text-indigo-400" },
  { type: "merchant", title: "New merchant application", desc: "QuickFit Gym — The Metropolitan B1 — pending review", amount: null, time: "3h ago", icon: Store, color: "text-violet-600 dark:text-violet-400" },
  { type: "maintenance", title: "Work order completed", desc: "Apex Maintenance — HVAC repair, Unit 8C Cedar Ridge", amount: "$1,850.00", time: "4h ago", icon: Wrench, color: "text-muted-foreground" },
  { type: "nudge", title: "AI collection nudge sent", desc: "James Foster — Unit 6A — behavioral incentive offered", amount: null, time: "5h ago", icon: Send, color: "text-primary" },
  { type: "payment", title: "Vendor instant payment processed", desc: "CleanPro Services — Net60 float locked at 5.5% APY", amount: "$4,200.00", time: "6h ago", icon: Zap, color: "text-emerald-600 dark:text-emerald-400" },
];

const upcomingTasks = [
  { title: "Review GreenScape insurance renewal", type: "vendor", dueDate: "Today", priority: "high" as const, assignee: "Sarah M.", aiSuggestion: "Auto-approve — 96% compliance score" },
  { title: "Send Net60 payout — Summit Electric", type: "payment", dueDate: "Today", priority: "medium" as const, assignee: "Lisa P.", aiSuggestion: "Lock float at current 5.5% yield" },
  { title: "Lease renewal meeting — David Kim", type: "lease", dueDate: "Tomorrow", priority: "high" as const, assignee: "David C.", aiSuggestion: "Offer flat renewal — 45% churn risk" },
  { title: "Merchant onboarding review — PetCare Plus", type: "merchant", dueDate: "Feb 22", priority: "medium" as const, assignee: "Sarah M.", aiSuggestion: "Strong tenant overlap — 78% fit score" },
  { title: "Q1 investor report generation", type: "report", dueDate: "Feb 28", priority: "low" as const, assignee: "Lisa P.", aiSuggestion: "All data sources ready — auto-generate" },
  { title: "Staff rebalance review — maintenance", type: "staff", dueDate: "Mar 1", priority: "medium" as const, assignee: "Michael T.", aiSuggestion: "James R. at 95% utilization — redistribute 4 tasks" },
];

const pipelineSummary = {
  vendors: { lead: 1, documents: 1, review: 1, approved: 0, active: 3 },
  merchants: { lead: 2, onboarding: 1, active: 3 },
  renewals: { autoRenew: 3, needsOutreach: 1, atRisk: 2 },
  collections: { current: 42, late: 5, overdue: 3, critical: 1 },
};

const quickActions = [
  { label: "Send Collection Nudge", icon: Mail, desc: "5 tenants overdue", path: "/collections" },
  { label: "Review Vendor Docs", icon: ClipboardList, desc: "2 pending", path: "/vendor-onboarding" },
  { label: "Generate Investor Report", icon: FileText, desc: "Q1 ready", path: "/investor-reporting" },
  { label: "Invite New Vendor", icon: UserPlus, desc: "Open intake form", path: "/vendor-onboarding" },
];

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
          <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-page-title">Operator Dashboard</h1>
          <p className="text-muted-foreground">
            AI-powered CRM &amp; financial intelligence — real-time portfolio management
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs" data-testid="badge-neural-status">
            <Radio className="w-3 h-3 mr-1 text-green-500 animate-pulse" />
            Neural Engine Active
          </Badge>
        </div>
      </div>

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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickActions.map((action, i) => (
          <Link key={i} href={action.path} data-testid={`link-quick-action-${i}`}>
            <Card className="hover-elevate cursor-pointer">
              <CardContent className="p-3 flex items-center gap-3 flex-wrap">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <action.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" data-testid={`text-quick-action-label-${i}`}>{action.label}</p>
                  <p className="text-xs text-muted-foreground" data-testid={`text-quick-action-desc-${i}`}>{action.desc}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card data-testid="card-pipeline-overview">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Briefcase className="w-5 h-5 text-primary" />
                <CardTitle>Pipeline Overview</CardTitle>
              </div>
              <CardDescription>Cross-module pipeline health at a glance</CardDescription>
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
          <Card data-testid="card-ai-actions">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Brain className="w-5 h-5 text-primary" />
                <CardTitle className="text-base">AI Action Items</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {upcomingTasks.slice(0, 4).map((task, i) => (
                <div key={i} className="p-2.5 border rounded-lg space-y-1.5" data-testid={`ai-task-${i}`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-tight">{task.title}</p>
                    <Badge variant={priorityConfig[task.priority].variant} className="text-xs shrink-0">
                      {priorityConfig[task.priority].label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarDays className="w-3 h-3" />
                    <span>{task.dueDate}</span>
                    <span className="text-muted-foreground/50">|</span>
                    <span>{task.assignee}</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-xs">
                    <Brain className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground" data-testid={`text-ai-suggestion-${i}`}>{task.aiSuggestion}</span>
                  </div>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full mt-1" data-testid="button-view-all-tasks">
                View all {upcomingTasks.length} tasks
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
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
                { severity: "warning", title: "Elevated Delinquency — Pine Valley", desc: "5.6% volatility spike. 8 tenants flagged.", time: "2h ago" },
                { severity: "info", title: "Vendor Float Approaching Net90", desc: "$45K maturing in 5 days.", time: "6h ago" },
                { severity: "success", title: "Collection Rate Improving", desc: "+2.5% MTD. Incentives driving 68% conversion.", time: "1d ago" },
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
          <CardDescription>Real-time CRM activity across all modules — payments, vendors, merchants, leases</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-0">
              {activityFeed.map((item, i) => (
                <div key={i} className="relative flex items-start gap-3 py-3 pl-8" data-testid={`activity-${i}`}>
                  <div className="absolute left-2.5 top-4 w-3 h-3 rounded-full bg-background border-2 border-border z-10" />
                  <div className={`w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 ${item.color}`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="text-sm font-medium" data-testid={`activity-title-${i}`}>{item.title}</p>
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

      <Card data-testid="card-upcoming-tasks">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <ClipboardList className="w-5 h-5 text-primary" />
              <CardTitle>Task Queue</CardTitle>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">{upcomingTasks.filter(t => t.priority === "high").length} urgent</Badge>
              <Badge variant="secondary" className="text-xs">{upcomingTasks.length} total</Badge>
            </div>
          </div>
          <CardDescription>AI-prioritized action items across vendor, merchant, lease, and collection workflows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {upcomingTasks.map((task, i) => (
              <div key={i} className="flex items-center gap-3 p-3 border rounded-lg flex-wrap" data-testid={`task-${i}`}>
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  {task.type === "vendor" && <Users className="w-4 h-4 text-muted-foreground" />}
                  {task.type === "payment" && <DollarSign className="w-4 h-4 text-muted-foreground" />}
                  {task.type === "lease" && <FileText className="w-4 h-4 text-muted-foreground" />}
                  {task.type === "merchant" && <Store className="w-4 h-4 text-muted-foreground" />}
                  {task.type === "report" && <FileText className="w-4 h-4 text-muted-foreground" />}
                  {task.type === "staff" && <Users className="w-4 h-4 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium" data-testid={`text-task-title-${i}`}>{task.title}</span>
                    <Badge variant={priorityConfig[task.priority].variant} className="text-xs" data-testid={`badge-task-priority-${i}`}>{priorityConfig[task.priority].label}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {task.dueDate}</span>
                    <span>{task.assignee}</span>
                    <span className="flex items-center gap-1"><Brain className="w-3 h-3 text-primary" /> <span data-testid={`text-task-suggestion-${i}`}>{task.aiSuggestion}</span></span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="shrink-0" data-testid={`button-task-action-${i}`}>
                  Action
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
          <CardDescription>Spiking neural network analysis — detecting pre-delinquency patterns across your portfolio</CardDescription>
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
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <TrendingUp className="w-5 h-5 text-primary" />
            <CardTitle>NOI Neural Forecast</CardTitle>
            <Badge variant="secondary" className="text-xs">Neuromorphic</Badge>
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
              Incentive ROI: <strong className="text-green-600 dark:text-green-400" data-testid="text-incentive-roi-value">{noiData.incentiveImpact?.roi}%</strong>
            </span>
            <span className="text-muted-foreground">
              Refinance Window: <strong className="text-primary" data-testid="text-refinance-window-value">{noiData.refinanceTiming?.optimalWindow}</strong>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
