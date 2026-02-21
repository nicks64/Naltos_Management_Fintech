import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AINudgeCard, AgentInsightStrip } from "@/components/ai-nudge-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ClipboardCheck,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Camera,
  TrendingUp,
  TrendingDown,
  Minus,
  Brain,
  FileText,
  Search,
  Eye,
  ArrowRight,
  Sparkles,
  Target,
  ListChecks,
  type LucideIcon,
} from "lucide-react";

const agentInsights = [
  { text: "4 inspections overdue", severity: "warning" as const, confidence: 0.92 },
  { text: "Unit 5B condition score dropped 15 points", severity: "critical" as const, confidence: 0.89 },
  { text: "Move-out inspection for 3A scheduled tomorrow", severity: "info" as const },
];

const checklists = [
  { name: "Move-In Inspection", items: 45, lastUpdated: "Jan 10, 2026", usageCount: 128, compliance: 97 },
  { name: "Move-Out Inspection", items: 52, lastUpdated: "Feb 05, 2026", usageCount: 94, compliance: 95 },
  { name: "Quarterly Inspection", items: 28, lastUpdated: "Dec 15, 2025", usageCount: 312, compliance: 99 },
  { name: "Annual Inspection", items: 65, lastUpdated: "Nov 20, 2025", usageCount: 48, compliance: 93 },
];

interface ScheduledInspection {
  id: string;
  unit: string;
  type: string;
  inspector: string;
  inspectionDate: string;
  status: string;
}

interface InspectionResult {
  id: string;
  unit: string;
  type: string;
  inspector: string;
  inspectionDate: string;
  score: number;
  issues: number;
  photos: number;
  followUp: boolean;
}

interface UnitCondition {
  id: string;
  unit: string;
  lastInspection: string;
  score: number;
  trend: "up" | "down" | "stable";
  kitchen: number;
  bath: number;
  floors: number;
  walls: number;
  fixtures: number;
  nextDue: string;
}

function getScoreColor(score: number) {
  if (score >= 90) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 75) return "text-blue-600 dark:text-blue-400";
  if (score >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function getScoreProgressColor(score: number) {
  if (score >= 90) return "[&>div]:bg-emerald-500";
  if (score >= 75) return "[&>div]:bg-blue-500";
  if (score >= 60) return "[&>div]:bg-amber-500";
  return "[&>div]:bg-red-500";
}

function getStatusBadge(status: string) {
  const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    "Scheduled": { variant: "secondary", label: "Scheduled" },
    "In Progress": { variant: "default", label: "In Progress" },
    "Completed": { variant: "outline", label: "Completed" },
    "Overdue": { variant: "destructive", label: "Overdue" },
  };
  const c = config[status] || { variant: "outline" as const, label: status };
  return <Badge variant={c.variant} className="text-xs" data-testid={`badge-status-${status.toLowerCase().replace(/\s/g, "-")}`}>{c.label}</Badge>;
}

function getTypeBadge(type: string) {
  return <Badge variant="outline" className="text-xs" data-testid={`badge-type-${type.toLowerCase().replace(/[\s-]/g, "-")}`}>{type}</Badge>;
}

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up") return <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
  if (trend === "down") return <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
}

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" data-testid="skeleton-kpi">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-1 pt-3 px-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <Skeleton className="h-6 w-12 mb-1" />
            <Skeleton className="h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2" data-testid="skeleton-list">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-3 p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-md" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <Card data-testid="error-state">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <AlertTriangle className="w-10 h-10 text-destructive mb-3" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}

export default function Inspections() {
  const {
    data: scheduledInspections = [],
    isLoading: scheduledLoading,
    isError: scheduledError,
  } = useQuery<ScheduledInspection[]>({ queryKey: ['/api/inspections/scheduled'] });

  const {
    data: inspectionResults = [],
    isLoading: resultsLoading,
    isError: resultsError,
  } = useQuery<InspectionResult[]>({ queryKey: ['/api/inspections/results'] });

  const {
    data: unitConditions = [],
    isLoading: conditionsLoading,
    isError: conditionsError,
  } = useQuery<UnitCondition[]>({ queryKey: ['/api/inspections/conditions'] });

  const isLoading = scheduledLoading || resultsLoading || conditionsLoading;

  const kpiCards = useMemo(() => {
    const scheduledCount = scheduledInspections.length;
    const overdueCount = scheduledInspections.filter((s) => s.status === "Overdue").length;
    const completedCount = inspectionResults.length;
    const avgScore = completedCount > 0
      ? Math.round(inspectionResults.reduce((sum, r) => sum + (r.score ?? 0), 0) / completedCount)
      : 0;

    return [
      { title: "Scheduled", value: String(scheduledCount), change: `${scheduledCount} upcoming`, trend: "up" as const, icon: Calendar, color: "text-indigo-600" },
      { title: "Overdue", value: String(overdueCount), change: `${overdueCount} need attention`, trend: overdueCount > 0 ? ("down" as const) : ("up" as const), icon: AlertTriangle, color: "text-red-600" },
      { title: "Completed This Month", value: String(completedCount), change: `${completedCount} inspections`, trend: "up" as const, icon: CheckCircle2, color: "text-emerald-600" },
      { title: "Avg Score", value: String(avgScore), change: `across ${completedCount} results`, trend: avgScore >= 75 ? ("up" as const) : ("down" as const), icon: Target, color: "text-blue-600" },
    ];
  }, [scheduledInspections, inspectionResults]);

  return (
    <div className="space-y-6" data-testid="page-inspections">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-page-title">Property Inspections</h1>
          <p className="text-muted-foreground">AI-powered inspection management and unit condition tracking</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs" data-testid="badge-agent-status">
            <Brain className="w-3 h-3 mr-1 text-primary" />
            Agent Active
          </Badge>
          <Button size="sm" data-testid="button-schedule-inspection">
            <Calendar className="w-4 h-4 mr-1" />
            Schedule Inspection
          </Button>
        </div>
      </div>

      <AgentInsightStrip insights={agentInsights} />

      <AINudgeCard
        title="Window Treatment Wear Analysis"
        insight="Agent analysis of inspection history reveals units with south-facing windows have 40% higher wear on window treatments. Consider bulk replacement for south-facing units during next turn cycle. Estimated cost: $3,200 vs $8,400 if replaced individually."
        confidence={0.88}
        severity="opportunity"
        icon={Sparkles}
        actionLabel="View Analysis"
        onAction={() => {}}
        metric="$5,200 savings"
        metricLabel="Bulk vs Individual"
        agentSource="Naltos Agent"
      />

      {isLoading ? (
        <KpiSkeleton />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3" data-testid="grid-kpi">
          {kpiCards.map((card, index) => (
            <Card key={card.title} className="hover-elevate" data-testid={`card-kpi-${index}`}>
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-1 pt-3 px-3">
                <CardTitle className="text-xs font-medium text-muted-foreground">{card.title}</CardTitle>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="text-xl font-mono tabular-nums font-semibold" data-testid={`text-kpi-value-${index}`}>{card.value}</div>
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
      )}

      <Tabs defaultValue="scheduled" className="space-y-4">
        <TabsList data-testid="tabs-inspections">
          <TabsTrigger value="scheduled" data-testid="tab-scheduled">Scheduled Inspections</TabsTrigger>
          <TabsTrigger value="results" data-testid="tab-results">Inspection Results</TabsTrigger>
          <TabsTrigger value="conditions" data-testid="tab-conditions">Unit Conditions</TabsTrigger>
          <TabsTrigger value="checklists" data-testid="tab-checklists">Checklists</TabsTrigger>
        </TabsList>

        <TabsContent value="scheduled" className="space-y-4">
          {scheduledError ? (
            <ErrorState message="Failed to load scheduled inspections." />
          ) : (
            <Card data-testid="card-scheduled-inspections">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Calendar className="w-5 h-5 text-primary" />
                  <CardTitle>Upcoming Inspections</CardTitle>
                  <Badge variant="secondary" className="text-xs" data-testid="badge-scheduled-count">{scheduledInspections.length} scheduled</Badge>
                </div>
                <CardDescription>Calendar of upcoming property inspections with type, inspector, and status</CardDescription>
              </CardHeader>
              <CardContent>
                {scheduledLoading ? (
                  <ListSkeleton rows={6} />
                ) : (
                  <div className="space-y-2">
                    {scheduledInspections.map((insp) => (
                      <div
                        key={insp.id}
                        className="flex items-center justify-between gap-3 p-3 border rounded-lg flex-wrap"
                        data-testid={`row-inspection-${insp.id}`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-wrap">
                          <div className="flex-shrink-0 w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                            <span className="text-sm font-semibold" data-testid={`text-unit-${insp.id}`}>{insp.unit}</span>
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              {getTypeBadge(insp.type)}
                              <span className="text-sm text-muted-foreground">{insp.inspector}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                              <Calendar className="w-3 h-3" />
                              <span data-testid={`text-date-${insp.id}`}>{insp.inspectionDate}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {getStatusBadge(insp.status)}
                          <Button variant="ghost" size="icon" data-testid={`button-view-inspection-${insp.id}`}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {resultsError ? (
            <ErrorState message="Failed to load inspection results." />
          ) : (
            <Card data-testid="card-inspection-results">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <ClipboardCheck className="w-5 h-5 text-primary" />
                  <CardTitle>Recent Inspection Results</CardTitle>
                  <Badge variant="secondary" className="text-xs" data-testid="badge-results-count">{inspectionResults.length} completed</Badge>
                </div>
                <CardDescription>Completed inspections with scores, issues found, and follow-up status</CardDescription>
              </CardHeader>
              <CardContent>
                {resultsLoading ? (
                  <ListSkeleton rows={6} />
                ) : (
                  <div className="space-y-2">
                    {inspectionResults.map((result) => (
                      <div
                        key={result.id}
                        className="flex items-center justify-between gap-3 p-3 border rounded-lg flex-wrap"
                        data-testid={`row-result-${result.id}`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-wrap">
                          <div className="flex-shrink-0 w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                            <span className="text-sm font-semibold">{result.unit}</span>
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              {getTypeBadge(result.type)}
                              <span className="text-sm text-muted-foreground">{result.inspector}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                              <span data-testid={`text-result-date-${result.id}`}>{result.inspectionDate}</span>
                              <span className="text-muted-foreground/50">|</span>
                              <span className="flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {result.issues} issues
                              </span>
                              <span className="text-muted-foreground/50">|</span>
                              <span className="flex items-center gap-1">
                                <Camera className="w-3 h-3" />
                                {result.photos} photos
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="text-right">
                            <span className={`text-lg font-mono font-semibold ${getScoreColor(result.score)}`} data-testid={`text-score-${result.id}`}>
                              {result.score}
                            </span>
                            <span className="text-xs text-muted-foreground">/100</span>
                          </div>
                          {result.followUp && (
                            <Badge variant="destructive" className="text-xs" data-testid={`badge-followup-${result.id}`}>
                              Follow-up
                            </Badge>
                          )}
                          <Button variant="ghost" size="icon" data-testid={`button-view-result-${result.id}`}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="conditions" className="space-y-4">
          <AINudgeCard
            title="Proactive Inspection Recommendation"
            insight="Agent identified 3 units trending below acceptable condition threshold. Scheduling proactive inspections could prevent costly move-out damages."
            confidence={0.85}
            severity="warning"
            icon={AlertTriangle}
            actionLabel="Schedule Inspections"
            onAction={() => {}}
            metric="3 units at risk"
            metricLabel="Below Threshold"
            agentSource="Naltos Agent"
          />
          {conditionsError ? (
            <ErrorState message="Failed to load unit conditions." />
          ) : (
            <Card data-testid="card-unit-conditions">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Target className="w-5 h-5 text-primary" />
                  <CardTitle>Unit Condition Overview</CardTitle>
                  <Badge variant="secondary" className="text-xs" data-testid="badge-conditions-count">{unitConditions.length} units tracked</Badge>
                </div>
                <CardDescription>Condition scores per unit with category breakdown and trend analysis</CardDescription>
              </CardHeader>
              <CardContent>
                {conditionsLoading ? (
                  <ListSkeleton rows={6} />
                ) : (
                  <div className="space-y-3">
                    {unitConditions.map((unit) => (
                      <div
                        key={unit.id}
                        className="p-3 border rounded-lg space-y-2"
                        data-testid={`row-unit-condition-${unit.unit}`}
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex-shrink-0 w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                              <span className="text-sm font-semibold">{unit.unit}</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-lg font-mono font-semibold ${getScoreColor(unit.score)}`} data-testid={`text-condition-score-${unit.unit}`}>
                                  {unit.score}
                                </span>
                                <TrendIcon trend={unit.trend} />
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Last: {unit.lastInspection} | Next: {unit.nextDue}
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" data-testid={`button-unit-details-${unit.unit}`}>
                            Details
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={unit.score} className={`flex-1 h-2 ${getScoreProgressColor(unit.score)}`} />
                          <span className="text-xs text-muted-foreground w-8 text-right">{unit.score}%</span>
                        </div>
                        <div className="grid grid-cols-5 gap-2 text-xs">
                          {[
                            { label: "Kitchen", val: unit.kitchen },
                            { label: "Bath", val: unit.bath },
                            { label: "Floors", val: unit.floors },
                            { label: "Walls", val: unit.walls },
                            { label: "Fixtures", val: unit.fixtures },
                          ].map((cat) => (
                            <div key={cat.label} className="text-center">
                              <div className="text-muted-foreground">{cat.label}</div>
                              <div className={`font-semibold ${getScoreColor(cat.val)}`}>{cat.val}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="checklists" className="space-y-4">
          <Card data-testid="card-checklists">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <ListChecks className="w-5 h-5 text-primary" />
                <CardTitle>Inspection Checklist Templates</CardTitle>
                <Badge variant="secondary" className="text-xs">{checklists.length} templates</Badge>
              </div>
              <CardDescription>Standardized inspection checklists with compliance tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {checklists.map((cl, index) => (
                  <div
                    key={cl.name}
                    className="flex items-center justify-between gap-3 p-4 border rounded-lg flex-wrap"
                    data-testid={`row-checklist-${index}`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-wrap">
                      <div className="flex-shrink-0 w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-sm" data-testid={`text-checklist-name-${index}`}>{cl.name}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                          <span>{cl.items} items</span>
                          <span className="text-muted-foreground/50">|</span>
                          <span>Updated {cl.lastUpdated}</span>
                          <span className="text-muted-foreground/50">|</span>
                          <span>Used {cl.usageCount} times</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Compliance</div>
                        <div className="flex items-center gap-1">
                          <span className={`text-sm font-semibold ${getScoreColor(cl.compliance)}`} data-testid={`text-compliance-${index}`}>
                            {cl.compliance}%
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" data-testid={`button-edit-checklist-${index}`}>
                        <Search className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
