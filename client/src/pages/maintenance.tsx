import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AINudgeCard, AgentInsightStrip } from "@/components/ai-nudge-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
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

const categoryIcons: Record<string, LucideIcon> = {
  Plumbing: Droplets,
  HVAC: Thermometer,
  Electrical: Zap,
  Appliance: Cog,
  General: Hammer,
};

const priorityVariant: Record<string, "destructive" | "outline" | "secondary"> = {
  critical: "destructive",
  urgent: "destructive",
  high: "destructive",
  Critical: "destructive",
  High: "destructive",
  medium: "outline",
  Medium: "outline",
  low: "secondary",
  Low: "secondary",
};

const statusVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  open: "outline",
  "Open": "outline",
  "in_progress": "default",
  "In Progress": "default",
  completed: "secondary",
  "Completed": "secondary",
  escalated: "destructive",
  "Escalated": "destructive",
};

const complianceVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  "On Schedule": "secondary",
  "on_schedule": "secondary",
  "Due Soon": "outline",
  "due_soon": "outline",
  "Overdue": "destructive",
  "overdue": "destructive",
  "completed": "secondary",
  "Completed": "secondary",
  "scheduled": "outline",
  "Scheduled": "outline",
};

const turnStatusColors: Record<string, string> = {
  Cleaning: "text-blue-600 dark:text-blue-400",
  cleaning: "text-blue-600 dark:text-blue-400",
  Repairs: "text-amber-600 dark:text-amber-400",
  repairs: "text-amber-600 dark:text-amber-400",
  Painting: "text-violet-600 dark:text-violet-400",
  painting: "text-violet-600 dark:text-violet-400",
  "Final Inspection": "text-orange-600 dark:text-orange-400",
  "final_inspection": "text-orange-600 dark:text-orange-400",
  inspection: "text-orange-600 dark:text-orange-400",
  Ready: "text-emerald-600 dark:text-emerald-400",
  ready: "text-emerald-600 dark:text-emerald-400",
  "make_ready": "text-emerald-600 dark:text-emerald-400",
};

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "N/A";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

function formatSla(slaDueAt: string | null | undefined, status: string): string {
  if (!slaDueAt) return "N/A";
  if (status === "completed" || status === "Completed") return "Closed";
  try {
    const due = new Date(slaDueAt);
    const now = new Date();
    const diffMs = due.getTime() - now.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    if (diffHours < 0) return `${Math.abs(diffHours)}h overdue`;
    if (diffHours < 24) return `${diffHours}h remaining`;
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
  } catch {
    return slaDueAt;
  }
}

function capitalizeStatus(status: string): string {
  if (!status) return "";
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-1 pt-3 px-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-4 rounded" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <Skeleton className="h-6 w-16 mb-1" />
            <Skeleton className="h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TableSkeleton({ rows = 5, cols = 8 }: { rows?: number; cols?: number }) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                {Array.from({ length: cols }).map((_, i) => (
                  <th key={i} className="p-3">
                    <Skeleton className="h-3 w-16" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rows }).map((_, ri) => (
                <tr key={ri} className="border-b last:border-0">
                  {Array.from({ length: cols }).map((_, ci) => (
                    <td key={ci} className="p-3">
                      <Skeleton className="h-4 w-20" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function UnitTurnsSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-64 mt-1" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function Maintenance() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const { data: workOrders = [], isLoading: woLoading, isError: woError } = useQuery<any[]>({
    queryKey: ['/api/maintenance/work-orders'],
  });

  const { data: preventiveSchedule = [], isLoading: prevLoading, isError: prevError } = useQuery<any[]>({
    queryKey: ['/api/maintenance/preventive'],
  });

  const { data: unitTurns = [], isLoading: utLoading, isError: utError } = useQuery<any[]>({
    queryKey: ['/api/unit-turns'],
  });

  const isLoading = woLoading || prevLoading || utLoading;

  const kpiCards = useMemo(() => {
    const openCount = workOrders.filter((wo: any) => wo.status === "open" || wo.status === "Open").length;

    let avgResolution = "N/A";
    const completedOrders = workOrders.filter((wo: any) => wo.status === "completed" || wo.status === "Completed");
    if (completedOrders.length > 0) {
      const totalDays = completedOrders.reduce((sum: number, wo: any) => {
        if (wo.completedAt && wo.createdAt) {
          const diff = new Date(wo.completedAt).getTime() - new Date(wo.createdAt).getTime();
          return sum + diff / (1000 * 60 * 60 * 24);
        }
        return sum;
      }, 0);
      const avg = totalDays / completedOrders.length;
      avgResolution = avg > 0 ? `${avg.toFixed(1)} days` : "N/A";
    }

    let prevRate = "N/A";
    if (preventiveSchedule.length > 0) {
      const totalCompliance = preventiveSchedule.reduce((sum: number, t: any) => {
        return sum + (t.complianceRate ?? 0);
      }, 0);
      const avgCompliance = totalCompliance / preventiveSchedule.length;
      prevRate = `${Math.round(avgCompliance)}%`;
    }

    const urgentCount = workOrders.filter((wo: any) => wo.priority === "urgent" || wo.priority === "critical").length;

    let costPerUnit = "N/A";
    if (workOrders.length > 0) {
      const totalCost = workOrders.reduce((sum: number, wo: any) => sum + (Number(wo.estimatedCost) || 0), 0);
      const unitCount = new Set(workOrders.map((wo: any) => wo.unitId).filter(Boolean)).size;
      if (unitCount > 0) {
        costPerUnit = `$${Math.round(totalCost / unitCount)}`;
      }
    }

    return [
      { title: "Open Work Orders", value: woLoading ? "..." : String(openCount), change: `${openCount} active`, trend: openCount > 10 ? "warning" : "positive", icon: Wrench },
      { title: "Avg Resolution Time", value: woLoading ? "..." : avgResolution, change: "from completed orders", trend: "positive", icon: Clock },
      { title: "Preventive Maint. Rate", value: prevLoading ? "..." : prevRate, change: "compliance rate", trend: "positive", icon: ShieldCheck },
      { title: "Emergency Calls (MTD)", value: woLoading ? "..." : String(urgentCount), change: "urgent/critical", trend: urgentCount > 5 ? "warning" : "positive", icon: Phone },
      { title: "Tenant Satisfaction", value: "4.3/5", change: "+0.2", trend: "positive", icon: ThumbsUp },
      { title: "Cost Per Unit", value: woLoading ? "..." : costPerUnit, change: "estimated avg", trend: "positive", icon: DollarSign },
    ];
  }, [workOrders, preventiveSchedule, woLoading, prevLoading]);

  const filteredOrders = workOrders.filter((wo: any) => {
    if (statusFilter !== "all") {
      const woStatus = capitalizeStatus(wo.status);
      if (woStatus !== statusFilter && wo.status !== statusFilter) return false;
    }
    if (priorityFilter !== "all") {
      const woPriority = capitalizeStatus(wo.priority);
      if (woPriority !== priorityFilter && wo.priority !== priorityFilter) return false;
    }
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

      {isLoading ? (
        <KpiSkeleton />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3" data-testid="grid-kpi-cards">
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
      )}

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

          {woLoading ? (
            <TableSkeleton rows={5} cols={9} />
          ) : woError ? (
            <Card data-testid="card-work-orders-error">
              <CardContent className="p-6 text-center">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="text-muted-foreground">Failed to load work orders. Please try again.</p>
              </CardContent>
            </Card>
          ) : (
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
                        <th className="p-3 font-medium text-muted-foreground">Description</th>
                        <th className="p-3 font-medium text-muted-foreground">Status</th>
                        <th className="p-3 font-medium text-muted-foreground">Vendor</th>
                        <th className="p-3 font-medium text-muted-foreground">Created</th>
                        <th className="p-3 font-medium text-muted-foreground">SLA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="p-6 text-center text-muted-foreground">
                            No work orders found matching your filters.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((wo: any, idx: number) => {
                          const catKey = wo.category ? wo.category.charAt(0).toUpperCase() + wo.category.slice(1).toLowerCase() : "General";
                          const CatIcon = categoryIcons[catKey] || categoryIcons[wo.category] || Wrench;
                          const slaText = formatSla(wo.slaDueAt, wo.status);
                          return (
                            <tr key={wo.id} className="border-b last:border-0 hover-elevate" data-testid={`row-work-order-${idx}`}>
                              <td className="p-3 font-mono text-xs">
                                <div className="flex items-center gap-1">
                                  WO-{wo.id}
                                  {wo.aiFlag && (
                                    <Badge variant="outline" className="text-[9px] px-1 py-0" data-testid={`badge-ai-flag-${idx}`}>
                                      <Brain className="w-2.5 h-2.5 mr-0.5 text-primary" />
                                      AI
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 font-medium" data-testid={`text-wo-unit-${idx}`}>{wo.unitNumber || "N/A"}</td>
                              <td className="p-3">
                                <div className="flex items-center gap-1.5">
                                  <CatIcon className="w-3.5 h-3.5 text-muted-foreground" />
                                  {capitalizeStatus(wo.category || "general")}
                                </div>
                              </td>
                              <td className="p-3">
                                <Badge variant={priorityVariant[wo.priority] || "outline"} className="text-xs" data-testid={`badge-priority-${idx}`}>
                                  {capitalizeStatus(wo.priority || "")}
                                </Badge>
                              </td>
                              <td className="p-3 max-w-[200px] truncate" data-testid={`text-wo-title-${idx}`}>{wo.title || ""}</td>
                              <td className="p-3">
                                <Badge variant={statusVariant[wo.status] || "outline"} className="text-xs" data-testid={`badge-status-${idx}`}>
                                  {capitalizeStatus(wo.status || "")}
                                </Badge>
                              </td>
                              <td className="p-3 text-muted-foreground" data-testid={`text-wo-vendor-${idx}`}>{wo.vendorName || "Unassigned"}</td>
                              <td className="p-3 text-muted-foreground" data-testid={`text-wo-created-${idx}`}>{formatDate(wo.createdAt)}</td>
                              <td className="p-3">
                                <span className={slaText.includes("overdue") ? "text-red-600 dark:text-red-400 font-medium" : "text-muted-foreground"} data-testid={`text-wo-sla-${idx}`}>
                                  {slaText}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="preventive" className="space-y-4">
          {prevLoading ? (
            <TableSkeleton rows={5} cols={5} />
          ) : prevError ? (
            <Card data-testid="card-preventive-error">
              <CardContent className="p-6 text-center">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="text-muted-foreground">Failed to load preventive schedule. Please try again.</p>
              </CardContent>
            </Card>
          ) : (
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
                      {preventiveSchedule.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-muted-foreground">
                            No preventive maintenance tasks found.
                          </td>
                        </tr>
                      ) : (
                        preventiveSchedule.map((task: any, idx: number) => {
                          const complianceLabel = task.status ? capitalizeStatus(task.status) : (task.complianceRate >= 90 ? "On Schedule" : task.complianceRate >= 70 ? "Due Soon" : "Overdue");
                          const complianceKey = complianceLabel;
                          return (
                            <tr key={task.id || idx} className="border-b last:border-0" data-testid={`row-preventive-${idx}`}>
                              <td className="p-3 font-medium" data-testid={`text-prev-task-${idx}`}>{task.task}</td>
                              <td className="p-3 text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {formatDate(task.nextDueDate)}
                                </div>
                              </td>
                              <td className="p-3 text-muted-foreground">{task.frequency || "N/A"}</td>
                              <td className="p-3">
                                <Badge variant={complianceVariant[complianceKey] || "outline"} className="text-xs" data-testid={`badge-compliance-${idx}`}>
                                  {complianceLabel === "On Schedule" || complianceLabel === "Completed" ? <CheckCircle2 className="w-3 h-3 mr-1" /> : null}
                                  {complianceLabel === "Due Soon" || complianceLabel === "Scheduled" ? <Timer className="w-3 h-3 mr-1" /> : null}
                                  {complianceLabel === "Overdue" ? <XCircle className="w-3 h-3 mr-1" /> : null}
                                  {complianceLabel}
                                </Badge>
                              </td>
                              <td className="p-3 text-muted-foreground" data-testid={`text-prev-vendor-${idx}`}>{task.vendorName || "Unassigned"}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="unit-turns" className="space-y-4">
          {utLoading ? (
            <UnitTurnsSkeleton />
          ) : utError ? (
            <Card data-testid="card-unit-turns-error">
              <CardContent className="p-6 text-center">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="text-muted-foreground">Failed to load unit turns. Please try again.</p>
              </CardContent>
            </Card>
          ) : (
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
                {unitTurns.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No unit turns in progress.</p>
                ) : (
                  unitTurns.map((unit: any, idx: number) => {
                    const stageLabel = capitalizeStatus(unit.stage || unit.status || "");
                    const progressVal = unit.progress ?? 0;
                    return (
                      <div key={unit.id || idx} className="p-4 border rounded-lg space-y-3" data-testid={`card-unit-turn-${idx}`}>
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-semibold" data-testid={`text-turn-unit-${idx}`}>Unit {unit.unitNumber || "N/A"}</span>
                            <Badge variant="outline" className="text-xs">
                              Move-out: {formatDate(unit.moveOutDate)}
                            </Badge>
                            <span className={`text-sm font-medium ${turnStatusColors[stageLabel] || turnStatusColors[unit.stage] || "text-muted-foreground"}`} data-testid={`text-turn-status-${idx}`}>
                              {stageLabel}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                            <span>{unit.daysInProcess ?? 0} days in turn</span>
                            <span className="text-muted-foreground/50">|</span>
                            <span>Target: {formatDate(unit.targetDate)}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{progressVal}%</span>
                          </div>
                          <Progress value={progressVal} className="h-2" data-testid={`progress-turn-${idx}`} />
                        </div>
                        <div className="flex gap-1">
                          {["Cleaning", "Repairs", "Painting", "Final Inspection", "Ready"].map((step) => {
                            const stepOrder = ["Cleaning", "Repairs", "Painting", "Final Inspection", "Ready"];
                            const currentIndex = stepOrder.findIndex((s) => s.toLowerCase().replace(/ /g, "_") === (unit.stage || "").toLowerCase() || s.toLowerCase() === (unit.stage || "").toLowerCase() || s === stageLabel);
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
                    );
                  })
                )}
              </CardContent>
            </Card>
          )}
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
