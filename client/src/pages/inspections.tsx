import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AINudgeCard, AgentInsightStrip } from "@/components/ai-nudge-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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

const kpiCards = [
  { title: "Completed (MTD)", value: "34", change: "+8 vs last month", trend: "up", icon: CheckCircle2, color: "text-emerald-600" },
  { title: "Overdue", value: "4", change: "+2 this week", trend: "down", icon: AlertTriangle, color: "text-red-600" },
  { title: "Avg Condition Score", value: "82", change: "+3 pts", trend: "up", icon: Target, color: "text-blue-600" },
  { title: "Below Threshold", value: "6", change: "-1 vs last month", trend: "up", icon: TrendingDown, color: "text-amber-600" },
  { title: "Scheduled This Week", value: "12", change: "3 tomorrow", trend: "up", icon: Calendar, color: "text-indigo-600" },
  { title: "AI Flags", value: "7", change: "3 critical", trend: "down", icon: Brain, color: "text-violet-600" },
];

const scheduledInspections = [
  { id: 1, unit: "3A", type: "Move-Out", inspector: "Sarah Mitchell", date: "Feb 22, 2026", status: "Scheduled" },
  { id: 2, unit: "7C", type: "Quarterly", inspector: "James Torres", date: "Feb 22, 2026", status: "In Progress" },
  { id: 3, unit: "2D", type: "Move-In", inspector: "Sarah Mitchell", date: "Feb 23, 2026", status: "Scheduled" },
  { id: 4, unit: "5B", type: "Annual", inspector: "David Chen", date: "Feb 24, 2026", status: "Scheduled" },
  { id: 5, unit: "1A", type: "Quarterly", inspector: "James Torres", date: "Feb 25, 2026", status: "Overdue" },
  { id: 6, unit: "4F", type: "Pre-Lease", inspector: "Sarah Mitchell", date: "Feb 25, 2026", status: "Scheduled" },
  { id: 7, unit: "8B", type: "Move-Out", inspector: "David Chen", date: "Feb 26, 2026", status: "Overdue" },
  { id: 8, unit: "6A", type: "Quarterly", inspector: "James Torres", date: "Feb 26, 2026", status: "Scheduled" },
  { id: 9, unit: "9D", type: "Annual", inspector: "Sarah Mitchell", date: "Feb 27, 2026", status: "Overdue" },
  { id: 10, unit: "10C", type: "Move-In", inspector: "David Chen", date: "Feb 28, 2026", status: "Overdue" },
];

const inspectionResults = [
  { id: 1, unit: "4A", type: "Move-Out", inspector: "Sarah Mitchell", date: "Feb 18, 2026", score: 72, issues: 8, photos: 24, followUp: true },
  { id: 2, unit: "6B", type: "Quarterly", inspector: "James Torres", date: "Feb 17, 2026", score: 91, issues: 2, photos: 12, followUp: false },
  { id: 3, unit: "2C", type: "Annual", inspector: "David Chen", date: "Feb 16, 2026", score: 85, issues: 4, photos: 18, followUp: false },
  { id: 4, unit: "8A", type: "Move-In", inspector: "Sarah Mitchell", date: "Feb 15, 2026", score: 96, issues: 1, photos: 30, followUp: false },
  { id: 5, unit: "3D", type: "Move-Out", inspector: "James Torres", date: "Feb 14, 2026", score: 58, issues: 14, photos: 42, followUp: true },
  { id: 6, unit: "1B", type: "Quarterly", inspector: "David Chen", date: "Feb 13, 2026", score: 88, issues: 3, photos: 15, followUp: false },
  { id: 7, unit: "5A", type: "Pre-Lease", inspector: "Sarah Mitchell", date: "Feb 12, 2026", score: 94, issues: 1, photos: 20, followUp: false },
  { id: 8, unit: "7B", type: "Annual", inspector: "James Torres", date: "Feb 11, 2026", score: 67, issues: 11, photos: 36, followUp: true },
];

const unitConditions = [
  { unit: "1A", lastInspection: "Jan 15, 2026", score: 88, trend: "up" as const, kitchen: 90, bath: 85, floors: 88, walls: 92, fixtures: 85, nextDue: "Apr 15, 2026" },
  { unit: "1B", lastInspection: "Feb 13, 2026", score: 85, trend: "stable" as const, kitchen: 82, bath: 88, floors: 84, walls: 87, fixtures: 84, nextDue: "May 13, 2026" },
  { unit: "2C", lastInspection: "Feb 16, 2026", score: 82, trend: "up" as const, kitchen: 80, bath: 84, floors: 82, walls: 85, fixtures: 79, nextDue: "May 16, 2026" },
  { unit: "2D", lastInspection: "Dec 20, 2025", score: 74, trend: "down" as const, kitchen: 70, bath: 76, floors: 72, walls: 78, fixtures: 74, nextDue: "Mar 20, 2026" },
  { unit: "3A", lastInspection: "Jan 28, 2026", score: 79, trend: "down" as const, kitchen: 75, bath: 80, floors: 78, walls: 82, fixtures: 80, nextDue: "Feb 22, 2026" },
  { unit: "4A", lastInspection: "Feb 18, 2026", score: 72, trend: "down" as const, kitchen: 68, bath: 74, floors: 70, walls: 76, fixtures: 72, nextDue: "May 18, 2026" },
  { unit: "4F", lastInspection: "Nov 10, 2025", score: 91, trend: "stable" as const, kitchen: 92, bath: 90, floors: 90, walls: 93, fixtures: 90, nextDue: "Feb 25, 2026" },
  { unit: "5B", lastInspection: "Feb 10, 2026", score: 65, trend: "down" as const, kitchen: 60, bath: 68, floors: 62, walls: 70, fixtures: 65, nextDue: "Mar 10, 2026" },
  { unit: "6A", lastInspection: "Jan 05, 2026", score: 87, trend: "up" as const, kitchen: 85, bath: 88, floors: 86, walls: 90, fixtures: 86, nextDue: "Apr 05, 2026" },
  { unit: "6B", lastInspection: "Feb 17, 2026", score: 91, trend: "up" as const, kitchen: 90, bath: 92, floors: 90, walls: 93, fixtures: 90, nextDue: "May 17, 2026" },
  { unit: "7C", lastInspection: "Dec 01, 2025", score: 78, trend: "stable" as const, kitchen: 76, bath: 80, floors: 77, walls: 82, fixtures: 75, nextDue: "Mar 01, 2026" },
  { unit: "8A", lastInspection: "Feb 15, 2026", score: 96, trend: "up" as const, kitchen: 95, bath: 97, floors: 96, walls: 97, fixtures: 95, nextDue: "May 15, 2026" },
];

const checklists = [
  { name: "Move-In Inspection", items: 45, lastUpdated: "Jan 10, 2026", usageCount: 128, compliance: 97 },
  { name: "Move-Out Inspection", items: 52, lastUpdated: "Feb 05, 2026", usageCount: 94, compliance: 95 },
  { name: "Quarterly Inspection", items: 28, lastUpdated: "Dec 15, 2025", usageCount: 312, compliance: 99 },
  { name: "Annual Inspection", items: 65, lastUpdated: "Nov 20, 2025", usageCount: 48, compliance: 93 },
];

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

export default function Inspections() {
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
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

      <Tabs defaultValue="scheduled" className="space-y-4">
        <TabsList data-testid="tabs-inspections">
          <TabsTrigger value="scheduled" data-testid="tab-scheduled">Scheduled Inspections</TabsTrigger>
          <TabsTrigger value="results" data-testid="tab-results">Inspection Results</TabsTrigger>
          <TabsTrigger value="conditions" data-testid="tab-conditions">Unit Conditions</TabsTrigger>
          <TabsTrigger value="checklists" data-testid="tab-checklists">Checklists</TabsTrigger>
        </TabsList>

        <TabsContent value="scheduled" className="space-y-4">
          <Card data-testid="card-scheduled-inspections">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Calendar className="w-5 h-5 text-primary" />
                <CardTitle>Upcoming Inspections</CardTitle>
                <Badge variant="secondary" className="text-xs">{scheduledInspections.length} scheduled</Badge>
              </div>
              <CardDescription>Calendar of upcoming property inspections with type, inspector, and status</CardDescription>
            </CardHeader>
            <CardContent>
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
                          <span>{insp.date}</span>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card data-testid="card-inspection-results">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <ClipboardCheck className="w-5 h-5 text-primary" />
                <CardTitle>Recent Inspection Results</CardTitle>
                <Badge variant="secondary" className="text-xs">{inspectionResults.length} completed</Badge>
              </div>
              <CardDescription>Completed inspections with scores, issues found, and follow-up status</CardDescription>
            </CardHeader>
            <CardContent>
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
                          <span>{result.date}</span>
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
            </CardContent>
          </Card>
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
          <Card data-testid="card-unit-conditions">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Target className="w-5 h-5 text-primary" />
                <CardTitle>Unit Condition Overview</CardTitle>
                <Badge variant="secondary" className="text-xs">{unitConditions.length} units tracked</Badge>
              </div>
              <CardDescription>Condition scores per unit with category breakdown and trend analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {unitConditions.map((unit) => (
                  <div
                    key={unit.unit}
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
            </CardContent>
          </Card>
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
