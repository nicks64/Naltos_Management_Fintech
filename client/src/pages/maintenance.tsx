import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AINudgeCard, AgentInsightStrip } from "@/components/ai-nudge-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Wrench,
  Clock,
  ShieldCheck,
  Phone,
  ThumbsUp,
  DollarSign,
  Brain,
  Sparkles,
  AlertTriangle,
  Filter,
  ChevronRight,
  Calendar,
  CheckCircle2,
  XCircle,
  Timer,
  Thermometer,
  Droplets,
  Zap,
  Cog,
  Hammer,
  ClipboardList,
  TrendingUp,
  Activity,
  Target,
  type LucideIcon,
} from "lucide-react";

const agentInsights = [
  { text: "3 urgent work orders need attention", severity: "critical" as const },
  { text: "HVAC unit 4B predicted to fail in 14 days", severity: "warning" as const, confidence: 0.89 },
  { text: "Preventive maintenance 92% on schedule", severity: "positive" as const },
];

const kpiCards = [
  { title: "Open Work Orders", value: "17", change: "+3 this week", trend: "warning", icon: Wrench },
  { title: "Avg Resolution Time", value: "2.4 days", change: "-0.6 days", trend: "positive", icon: Clock },
  { title: "Preventive Maint. Rate", value: "92%", change: "+4%", trend: "positive", icon: ShieldCheck },
  { title: "Emergency Calls (MTD)", value: "8", change: "-2 vs last month", trend: "positive", icon: Phone },
  { title: "Tenant Satisfaction", value: "4.3/5", change: "+0.2", trend: "positive", icon: ThumbsUp },
  { title: "Cost Per Unit", value: "$142", change: "-$18", trend: "positive", icon: DollarSign },
];

const categoryIcons: Record<string, LucideIcon> = {
  Plumbing: Droplets,
  HVAC: Thermometer,
  Electrical: Zap,
  Appliance: Cog,
  General: Hammer,
};

const workOrders = [
  { id: "WO-1041", unit: "3A", category: "Plumbing", manualPriority: "Medium", agentPriority: "High", status: "Open", vendor: "AquaFix Plumbing", created: "Feb 18", sla: "6h remaining", aiFlag: true },
  { id: "WO-1040", unit: "7C", category: "HVAC", manualPriority: "High", agentPriority: "High", status: "In Progress", vendor: "CoolAir Systems", created: "Feb 17", sla: "On Track", aiFlag: false },
  { id: "WO-1039", unit: "2D", category: "Electrical", manualPriority: "High", agentPriority: "Critical", status: "Escalated", vendor: "SparkPro Electric", created: "Feb 16", sla: "2h overdue", aiFlag: true },
  { id: "WO-1038", unit: "5B", category: "Appliance", manualPriority: "Low", agentPriority: "Low", status: "Open", vendor: "HomeGuard Repair", created: "Feb 16", sla: "3 days", aiFlag: false },
  { id: "WO-1037", unit: "4A", category: "Plumbing", manualPriority: "Medium", agentPriority: "Medium", status: "In Progress", vendor: "AquaFix Plumbing", created: "Feb 15", sla: "On Track", aiFlag: false },
  { id: "WO-1036", unit: "1C", category: "General", manualPriority: "Low", agentPriority: "Medium", status: "Completed", vendor: "AllPurpose Maint.", created: "Feb 14", sla: "Closed", aiFlag: true },
  { id: "WO-1035", unit: "6A", category: "HVAC", manualPriority: "Medium", agentPriority: "High", status: "Open", vendor: "CoolAir Systems", created: "Feb 14", sla: "12h remaining", aiFlag: true },
  { id: "WO-1034", unit: "8B", category: "Electrical", manualPriority: "High", agentPriority: "High", status: "In Progress", vendor: "SparkPro Electric", created: "Feb 13", sla: "On Track", aiFlag: false },
  { id: "WO-1033", unit: "3D", category: "Plumbing", manualPriority: "Low", agentPriority: "Low", status: "Completed", vendor: "AquaFix Plumbing", created: "Feb 12", sla: "Closed", aiFlag: false },
  { id: "WO-1032", unit: "9A", category: "Appliance", manualPriority: "Medium", agentPriority: "Medium", status: "Open", vendor: "HomeGuard Repair", created: "Feb 11", sla: "1 day", aiFlag: false },
];

const preventiveSchedule = [
  { task: "HVAC Filter Replacement", nextDue: "Feb 28, 2026", frequency: "Quarterly", compliance: "On Schedule", vendor: "CoolAir Systems" },
  { task: "Fire Alarm Testing", nextDue: "Mar 5, 2026", frequency: "Semi-Annual", compliance: "On Schedule", vendor: "SafeGuard Fire Co." },
  { task: "Elevator Inspection", nextDue: "Mar 12, 2026", frequency: "Annual", compliance: "On Schedule", vendor: "LiftTech Services" },
  { task: "Pest Control Treatment", nextDue: "Mar 1, 2026", frequency: "Monthly", compliance: "Due Soon", vendor: "GreenShield Pest" },
  { task: "Roof Inspection", nextDue: "Apr 15, 2026", frequency: "Semi-Annual", compliance: "On Schedule", vendor: "TopCover Roofing" },
  { task: "Pool Maintenance", nextDue: "Feb 25, 2026", frequency: "Weekly", compliance: "Overdue", vendor: "AquaClear Pool Co." },
];

const unitTurns = [
  { unit: "2B", moveOut: "Feb 10", status: "Cleaning", daysInTurn: 11, target: "Feb 28", progress: 20 },
  { unit: "5A", moveOut: "Feb 5", status: "Repairs", daysInTurn: 16, target: "Feb 26", progress: 45 },
  { unit: "4C", moveOut: "Feb 1", status: "Painting", daysInTurn: 20, target: "Feb 24", progress: 65 },
  { unit: "7A", moveOut: "Jan 28", status: "Final Inspection", daysInTurn: 24, target: "Feb 22", progress: 85 },
  { unit: "1D", moveOut: "Jan 25", status: "Ready", daysInTurn: 27, target: "Feb 20", progress: 100 },
];

const aiPredictions = [
  {
    title: "HVAC Unit 7C Compressor",
    description: "Compressor showing early failure signatures based on vibration analysis and power draw anomalies. Recommend proactive replacement during next scheduled downtime.",
    confidence: 0.87,
    severity: "warning" as const,
    action: "Schedule Replacement",
    timeframe: "Within 21 days",
    estimatedCost: "$3,200",
  },
  {
    title: "Water Heater Unit 2A",
    description: "Water heater approaching end of useful life (11.2 years installed, avg lifespan 10-12 years). Sediment buildup detected via energy consumption patterns. Risk of catastrophic leak increases 340% past 12 years.",
    confidence: 0.94,
    severity: "critical" as const,
    action: "Order Replacement",
    timeframe: "Within 30 days",
    estimatedCost: "$1,800",
  },
  {
    title: "Elevator #2 Brake Wear",
    description: "Brake wear pattern suggests service needed based on cycle count analysis and door timing drift. Current wear at 78% of recommended replacement threshold.",
    confidence: 0.82,
    severity: "warning" as const,
    action: "Schedule Service",
    timeframe: "Within 30 days",
    estimatedCost: "$2,400",
  },
  {
    title: "Building B Exterior Caulking",
    description: "Weather exposure analysis combined with last maintenance date (18 months ago) indicates window caulking degradation on floors 3-6. Water intrusion risk rising with spring rain season.",
    confidence: 0.78,
    severity: "info" as const,
    action: "Request Quote",
    timeframe: "Before Apr 2026",
    estimatedCost: "$5,500",
  },
];

const priorityVariant: Record<string, "destructive" | "outline" | "secondary"> = {
  Critical: "destructive",
  High: "destructive",
  Medium: "outline",
  Low: "secondary",
};

const statusVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  Open: "outline",
  "In Progress": "default",
  Completed: "secondary",
  Escalated: "destructive",
};

const complianceVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  "On Schedule": "secondary",
  "Due Soon": "outline",
  Overdue: "destructive",
};

const turnStatusColors: Record<string, string> = {
  Cleaning: "text-blue-600 dark:text-blue-400",
  Repairs: "text-amber-600 dark:text-amber-400",
  Painting: "text-violet-600 dark:text-violet-400",
  "Final Inspection": "text-orange-600 dark:text-orange-400",
  Ready: "text-emerald-600 dark:text-emerald-400",
};

export default function Maintenance() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const filteredOrders = workOrders.filter((wo) => {
    if (statusFilter !== "all" && wo.status !== statusFilter) return false;
    if (priorityFilter !== "all" && wo.agentPriority !== priorityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6" data-testid="page-maintenance">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-page-title">Maintenance Hub</h1>
          <p className="text-muted-foreground">AI-powered maintenance management and predictive operations</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs" data-testid="badge-agent-status">
            <Brain className="w-3 h-3 mr-1 text-primary" />
            Agent Active
          </Badge>
          <Button size="sm" data-testid="button-create-work-order">
            <Wrench className="w-3 h-3 mr-1" />
            New Work Order
          </Button>
        </div>
      </div>

      <AgentInsightStrip insights={agentInsights} />

      <AINudgeCard
        title="Preventive Maintenance Pattern Detected"
        insight="Agent detected pattern: Unit 3A plumbing issues correlate with building-wide pipe age. Recommend preventive pipe inspection for floors 3-5 to avoid emergency repairs. Estimated savings: $12,000."
        confidence={0.91}
        severity="opportunity"
        icon={Target}
        actionLabel="Schedule Inspection"
        onAction={() => {}}
        secondaryLabel="View Analysis"
        onSecondary={() => {}}
        metric="$12,000"
        metricLabel="Est. Savings"
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
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

      <Tabs defaultValue="work-orders" className="space-y-4">
        <TabsList data-testid="tabs-maintenance">
          <TabsTrigger value="work-orders" data-testid="tab-work-orders">Active Work Orders</TabsTrigger>
          <TabsTrigger value="preventive" data-testid="tab-preventive">Preventive Schedule</TabsTrigger>
          <TabsTrigger value="unit-turns" data-testid="tab-unit-turns">Unit Turns</TabsTrigger>
          <TabsTrigger value="predictions" data-testid="tab-predictions">AI Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="work-orders" className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filters:</span>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]" data-testid="select-status-filter">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Escalated">Escalated</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[160px]" data-testid="select-priority-filter">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="secondary" className="text-xs" data-testid="badge-filtered-count">
              {filteredOrders.length} orders
            </Badge>
          </div>

          <Card data-testid="card-work-orders">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">ID</th>
                      <th className="p-3 font-medium text-muted-foreground">Unit</th>
                      <th className="p-3 font-medium text-muted-foreground">Category</th>
                      <th className="p-3 font-medium text-muted-foreground">Priority</th>
                      <th className="p-3 font-medium text-muted-foreground">Status</th>
                      <th className="p-3 font-medium text-muted-foreground">Vendor</th>
                      <th className="p-3 font-medium text-muted-foreground">Created</th>
                      <th className="p-3 font-medium text-muted-foreground">SLA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((wo, idx) => {
                      const CatIcon = categoryIcons[wo.category] || Wrench;
                      return (
                        <tr key={wo.id} className="border-b last:border-0 hover-elevate" data-testid={`row-work-order-${idx}`}>
                          <td className="p-3 font-mono text-xs">
                            <div className="flex items-center gap-1">
                              {wo.id}
                              {wo.aiFlag && (
                                <Badge variant="outline" className="text-[9px] px-1 py-0" data-testid={`badge-ai-flag-${idx}`}>
                                  <Brain className="w-2.5 h-2.5 mr-0.5 text-primary" />
                                  AI
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-3 font-medium">{wo.unit}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              <CatIcon className="w-3.5 h-3.5 text-muted-foreground" />
                              {wo.category}
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge variant={priorityVariant[wo.agentPriority]} className="text-xs" data-testid={`badge-priority-${idx}`}>
                              {wo.agentPriority}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant={statusVariant[wo.status]} className="text-xs" data-testid={`badge-status-${idx}`}>
                              {wo.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-muted-foreground">{wo.vendor}</td>
                          <td className="p-3 text-muted-foreground">{wo.created}</td>
                          <td className="p-3">
                            <span className={wo.sla.includes("overdue") ? "text-red-600 dark:text-red-400 font-medium" : "text-muted-foreground"}>
                              {wo.sla}
                            </span>
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

        <TabsContent value="preventive" className="space-y-4">
          <Card data-testid="card-preventive-schedule">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <ClipboardList className="w-5 h-5 text-primary" />
                <CardTitle>Preventive Maintenance Schedule</CardTitle>
                <Badge variant="secondary" className="text-xs">Agent-Monitored</Badge>
              </div>
              <CardDescription>Scheduled maintenance tasks tracked by the AI agent for compliance</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Task</th>
                      <th className="p-3 font-medium text-muted-foreground">Next Due</th>
                      <th className="p-3 font-medium text-muted-foreground">Frequency</th>
                      <th className="p-3 font-medium text-muted-foreground">Compliance</th>
                      <th className="p-3 font-medium text-muted-foreground">Assigned Vendor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preventiveSchedule.map((task, idx) => (
                      <tr key={idx} className="border-b last:border-0" data-testid={`row-preventive-${idx}`}>
                        <td className="p-3 font-medium">{task.task}</td>
                        <td className="p-3 text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {task.nextDue}
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground">{task.frequency}</td>
                        <td className="p-3">
                          <Badge variant={complianceVariant[task.compliance]} className="text-xs" data-testid={`badge-compliance-${idx}`}>
                            {task.compliance === "On Schedule" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {task.compliance === "Due Soon" && <Timer className="w-3 h-3 mr-1" />}
                            {task.compliance === "Overdue" && <XCircle className="w-3 h-3 mr-1" />}
                            {task.compliance}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">{task.vendor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unit-turns" className="space-y-4">
          <Card data-testid="card-unit-turns">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Hammer className="w-5 h-5 text-primary" />
                <CardTitle>Unit Turn Pipeline</CardTitle>
                <Badge variant="secondary" className="text-xs">{unitTurns.length} units</Badge>
              </div>
              <CardDescription>Track unit turnover progress from move-out to market-ready</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {unitTurns.map((unit, idx) => (
                <div key={idx} className="p-4 border rounded-lg space-y-3" data-testid={`card-unit-turn-${idx}`}>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-semibold">Unit {unit.unit}</span>
                      <Badge variant="outline" className="text-xs">
                        Move-out: {unit.moveOut}
                      </Badge>
                      <span className={`text-sm font-medium ${turnStatusColors[unit.status]}`} data-testid={`text-turn-status-${idx}`}>
                        {unit.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                      <span>{unit.daysInTurn} days in turn</span>
                      <span className="text-muted-foreground/50">|</span>
                      <span>Target: {unit.target}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{unit.progress}%</span>
                    </div>
                    <Progress value={unit.progress} className="h-2" data-testid={`progress-turn-${idx}`} />
                  </div>
                  <div className="flex gap-1">
                    {["Cleaning", "Repairs", "Painting", "Final Inspection", "Ready"].map((step) => {
                      const stepOrder = ["Cleaning", "Repairs", "Painting", "Final Inspection", "Ready"];
                      const currentIndex = stepOrder.indexOf(unit.status);
                      const stepIndex = stepOrder.indexOf(step);
                      const isComplete = stepIndex < currentIndex;
                      const isCurrent = stepIndex === currentIndex;
                      return (
                        <div
                          key={step}
                          className={`flex-1 text-center text-[10px] py-1 rounded-md border ${
                            isComplete
                              ? "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                              : isCurrent
                                ? "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 font-medium"
                                : "bg-muted/30 border-muted text-muted-foreground"
                          }`}
                        >
                          {step}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">AI Predicted Maintenance Needs</h3>
            <Badge variant="secondary" className="text-xs">Neural Analysis</Badge>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {aiPredictions.map((pred, idx) => (
              <AINudgeCard
                key={idx}
                title={pred.title}
                insight={pred.description}
                confidence={pred.confidence}
                severity={pred.severity}
                actionLabel={pred.action}
                onAction={() => {}}
                metric={pred.estimatedCost}
                metricLabel="Est. Cost"
                agentSource="Predictive Engine"
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
