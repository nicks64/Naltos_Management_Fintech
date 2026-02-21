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
  ArrowDownToLine,
  ArrowUpFromLine,
  Clock,
  Key,
  Zap,
  Mail,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Brain,
  Target,
  Calendar,
  FileText,
  Search,
  Hammer,
  MapPin,
  DollarSign,
  ListChecks,
} from "lucide-react";
import type { MoveIn, MoveOut, UnitTurn, MoveChecklist } from "@shared/schema";

const agentInsights = [
  { text: "8 move-ins scheduled in next 14 days", severity: "info" as const },
  { text: "2 move-outs missing forwarding address", severity: "warning" as const, confidence: 0.91 },
  { text: "Avg turn time improved to 4.2 days", severity: "positive" as const, confidence: 0.94 },
];

const inspectionStatusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "Completed": "secondary",
  "Scheduled": "default",
  "In Progress": "default",
  "Not Scheduled": "destructive",
};

const depositStatusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "Processed": "secondary",
  "Pending": "outline",
};

const stageVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "complete": "secondary",
  "inspection": "default",
  "repairs": "default",
  "cleaning": "default",
  "painting": "default",
  "in_progress": "default",
  "pending": "outline",
};

function getScoreColor(score: number) {
  if (score >= 90) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 75) return "text-blue-600 dark:text-blue-400";
  if (score >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-1 pt-3 px-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-4 rounded" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <Skeleton className="h-6 w-16 mb-1" />
            <Skeleton className="h-3 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="p-3 space-y-3">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function MoveInOut() {
  const { data: moveInsData, isLoading: loadingMoveIns, isError: errorMoveIns } = useQuery<MoveIn[]>({ queryKey: ['/api/move-ins'] });
  const { data: moveOutsData, isLoading: loadingMoveOuts, isError: errorMoveOuts } = useQuery<MoveOut[]>({ queryKey: ['/api/move-outs'] });
  const { data: unitTurnsData, isLoading: loadingTurns, isError: errorTurns } = useQuery<UnitTurn[]>({ queryKey: ['/api/unit-turns'] });
  const { data: checklistsData, isLoading: loadingChecklists, isError: errorChecklists } = useQuery<MoveChecklist[]>({ queryKey: ['/api/move-checklists'] });

  const moveIns = moveInsData ?? [];
  const moveOuts = moveOutsData ?? [];
  const unitTurns = unitTurnsData ?? [];
  const checklists = checklistsData ?? [];

  const isLoading = loadingMoveIns || loadingMoveOuts || loadingTurns || loadingChecklists;

  const kpiCards = useMemo(() => {
    const inProgressTurns = unitTurns.filter((t) => t.stage !== "complete").length;
    const avgTurnTime = unitTurns.length > 0
      ? (unitTurns.reduce((sum, t) => sum + (t.daysInProcess ?? 0), 0) / unitTurns.length).toFixed(1)
      : "0";

    return [
      { title: "Upcoming Move-Ins", value: String(moveIns.length), change: `${moveIns.length} scheduled`, trend: "up", icon: ArrowDownToLine, color: "text-emerald-600" },
      { title: "Upcoming Move-Outs", value: String(moveOuts.length), change: `${moveOuts.length} scheduled`, trend: "up", icon: ArrowUpFromLine, color: "text-amber-600" },
      { title: "In Progress Turns", value: String(inProgressTurns), change: `${unitTurns.length} total`, trend: "up", icon: Hammer, color: "text-blue-600" },
      { title: "Avg Turn Time", value: `${avgTurnTime} days`, change: `${unitTurns.length} turns`, trend: "up", icon: Clock, color: "text-violet-600" },
    ];
  }, [moveIns, moveOuts, unitTurns]);

  return (
    <div className="space-y-6" data-testid="page-move-in-out">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-page-title">Move-In / Move-Out</h1>
          <p className="text-muted-foreground">AI-powered move-in and move-out management with turn tracking</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs" data-testid="badge-agent-status">
            <Brain className="w-3 h-3 mr-1 text-primary" />
            Agent Active
          </Badge>
          <Button size="sm" data-testid="button-schedule-move">
            <Calendar className="w-4 h-4 mr-1" />
            Schedule Move
          </Button>
        </div>
      </div>

      <AgentInsightStrip insights={agentInsights} />

      <AINudgeCard
        title="Turn Time Optimization Detected"
        insight="Agent analysis shows coordinating cleaning and repair crews on the same day reduces average turn time by 1.3 days. Recommend parallel scheduling for upcoming turns in units 2B, 5A, and 9B. Estimated savings: $4,200 in vacancy loss."
        confidence={0.92}
        severity="opportunity"
        icon={Target}
        actionLabel="Apply Scheduling"
        onAction={() => {}}
        secondaryLabel="View Analysis"
        onSecondary={() => {}}
        metric="$4,200"
        metricLabel="Est. Savings"
      />

      {isLoading ? (
        <KpiSkeleton />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {kpiCards.map((card, index) => (
            <Card key={card.title} className="hover-elevate" data-testid={`card-kpi-${index}`}>
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-1 pt-3 px-3">
                <CardTitle className="text-xs font-medium text-muted-foreground">{card.title}</CardTitle>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="text-xl font-mono tabular-nums font-semibold" data-testid={`text-kpi-value-${index}`}>{card.value}</div>
                <div className="flex items-center gap-1 text-xs mt-0.5">
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-600">{card.change}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Tabs defaultValue="move-ins" className="space-y-4">
        <TabsList data-testid="tabs-move-in-out">
          <TabsTrigger value="move-ins" data-testid="tab-move-ins">Move-Ins</TabsTrigger>
          <TabsTrigger value="move-outs" data-testid="tab-move-outs">Move-Outs</TabsTrigger>
          <TabsTrigger value="unit-turns" data-testid="tab-unit-turns">Unit Turns</TabsTrigger>
          <TabsTrigger value="checklists" data-testid="tab-checklists">Checklists</TabsTrigger>
        </TabsList>

        <TabsContent value="move-ins" className="space-y-4">
          <Card data-testid="card-move-ins">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <ArrowDownToLine className="w-5 h-5 text-primary" />
                <CardTitle>Upcoming Move-Ins</CardTitle>
                <Badge variant="secondary" className="text-xs">{moveIns.length} scheduled</Badge>
              </div>
              <CardDescription>Upcoming and recent move-ins with checklist progress and key status</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loadingMoveIns ? (
                <TableSkeleton cols={7} />
              ) : errorMoveIns ? (
                <div className="p-6 text-center text-muted-foreground" data-testid="error-move-ins">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-destructive" />
                  <p>Failed to load move-ins data</p>
                </div>
              ) : moveIns.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground" data-testid="empty-move-ins">
                  <ArrowDownToLine className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No upcoming move-ins</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="p-3 font-medium text-muted-foreground">Tenant</th>
                        <th className="p-3 font-medium text-muted-foreground">Unit</th>
                        <th className="p-3 font-medium text-muted-foreground">Date</th>
                        <th className="p-3 font-medium text-muted-foreground">Checklist</th>
                        <th className="p-3 font-medium text-muted-foreground">Keys</th>
                        <th className="p-3 font-medium text-muted-foreground">Utilities</th>
                        <th className="p-3 font-medium text-muted-foreground">Welcome Packet</th>
                      </tr>
                    </thead>
                    <tbody>
                      {moveIns.map((item, idx) => (
                        <tr key={item.id} className="border-b last:border-0 hover-elevate" data-testid={`row-move-in-${idx}`}>
                          <td className="p-3 font-medium" data-testid={`text-tenant-${idx}`}>{item.tenantName}</td>
                          <td className="p-3 font-mono text-xs">{item.unitNumber}</td>
                          <td className="p-3 text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(item.moveInDate)}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Progress value={item.checklistPercent ?? 0} className="h-2 w-16" data-testid={`progress-checklist-${idx}`} />
                              <span className="text-xs text-muted-foreground">{item.checklistPercent ?? 0}%</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge variant={item.keyStatus === "Issued" ? "secondary" : "outline"} className="text-xs" data-testid={`badge-key-${idx}`}>
                              <Key className="w-3 h-3 mr-1" />
                              {item.keyStatus ?? "Pending"}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant={item.utilityStatus === "Confirmed" ? "secondary" : "outline"} className="text-xs" data-testid={`badge-utility-${idx}`}>
                              <Zap className="w-3 h-3 mr-1" />
                              {item.utilityStatus ?? "Pending"}
                            </Badge>
                          </td>
                          <td className="p-3">
                            {item.welcomePacket ? (
                              <Badge variant="secondary" className="text-xs" data-testid={`badge-welcome-${idx}`}>
                                <Mail className="w-3 h-3 mr-1" />
                                Sent
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs" data-testid={`badge-welcome-${idx}`}>
                                <Mail className="w-3 h-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="move-outs" className="space-y-4">
          <Card data-testid="card-move-outs">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <ArrowUpFromLine className="w-5 h-5 text-primary" />
                <CardTitle>Upcoming Move-Outs</CardTitle>
                <Badge variant="secondary" className="text-xs">{moveOuts.length} scheduled</Badge>
              </div>
              <CardDescription>Upcoming and recent move-outs with inspection and deposit status</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loadingMoveOuts ? (
                <TableSkeleton />
              ) : errorMoveOuts ? (
                <div className="p-6 text-center text-muted-foreground" data-testid="error-move-outs">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-destructive" />
                  <p>Failed to load move-outs data</p>
                </div>
              ) : moveOuts.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground" data-testid="empty-move-outs">
                  <ArrowUpFromLine className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No upcoming move-outs</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="p-3 font-medium text-muted-foreground">Tenant</th>
                        <th className="p-3 font-medium text-muted-foreground">Unit</th>
                        <th className="p-3 font-medium text-muted-foreground">Date</th>
                        <th className="p-3 font-medium text-muted-foreground">Inspection</th>
                        <th className="p-3 font-medium text-muted-foreground">Deposit</th>
                        <th className="p-3 font-medium text-muted-foreground">Forwarding Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {moveOuts.map((item, idx) => (
                        <tr key={item.id} className="border-b last:border-0 hover-elevate" data-testid={`row-move-out-${idx}`}>
                          <td className="p-3 font-medium" data-testid={`text-moveout-tenant-${idx}`}>{item.tenantName}</td>
                          <td className="p-3 font-mono text-xs">{item.unitNumber}</td>
                          <td className="p-3 text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(item.moveOutDate)}
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge variant={inspectionStatusVariant[item.inspectionStatus ?? "Not Scheduled"] ?? "outline"} className="text-xs" data-testid={`badge-inspection-${idx}`}>
                              {item.inspectionStatus === "Completed" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                              {item.inspectionStatus === "Not Scheduled" && <XCircle className="w-3 h-3 mr-1" />}
                              {item.inspectionStatus === "Scheduled" && <Clock className="w-3 h-3 mr-1" />}
                              {item.inspectionStatus ?? "Not Scheduled"}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant={depositStatusVariant[item.depositStatus ?? "Pending"] ?? "outline"} className="text-xs" data-testid={`badge-deposit-${idx}`}>
                              <DollarSign className="w-3 h-3 mr-1" />
                              {item.depositStatus ?? "Pending"}
                            </Badge>
                          </td>
                          <td className="p-3">
                            {item.forwardingAddress ? (
                              <Badge variant="secondary" className="text-xs" data-testid={`badge-forwarding-${idx}`}>
                                <MapPin className="w-3 h-3 mr-1" />
                                On File
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="text-xs" data-testid={`badge-forwarding-${idx}`}>
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Missing
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unit-turns" className="space-y-4">
          <Card data-testid="card-unit-turns">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Hammer className="w-5 h-5 text-primary" />
                <CardTitle>Make-Ready Board</CardTitle>
                <Badge variant="secondary" className="text-xs">{unitTurns.length} units</Badge>
              </div>
              <CardDescription>Unit turn progress from move-out to market-ready status</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loadingTurns ? (
                <TableSkeleton cols={8} />
              ) : errorTurns ? (
                <div className="p-6 text-center text-muted-foreground" data-testid="error-unit-turns">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-destructive" />
                  <p>Failed to load unit turns data</p>
                </div>
              ) : unitTurns.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground" data-testid="empty-unit-turns">
                  <Hammer className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No active unit turns</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="p-3 font-medium text-muted-foreground">Unit</th>
                        <th className="p-3 font-medium text-muted-foreground">Move-Out</th>
                        <th className="p-3 font-medium text-muted-foreground">Stage</th>
                        <th className="p-3 font-medium text-muted-foreground">Status</th>
                        <th className="p-3 font-medium text-muted-foreground">Progress</th>
                        <th className="p-3 font-medium text-muted-foreground">Target Date</th>
                        <th className="p-3 font-medium text-muted-foreground">Vendor</th>
                        <th className="p-3 font-medium text-muted-foreground">Days</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unitTurns.map((item, idx) => (
                        <tr key={item.id} className="border-b last:border-0 hover-elevate" data-testid={`row-unit-turn-${idx}`}>
                          <td className="p-3 font-semibold">{item.unitNumber}</td>
                          <td className="p-3 text-muted-foreground text-xs">{formatDate(item.moveOutDate)}</td>
                          <td className="p-3">
                            <Badge variant={stageVariant[item.stage] ?? "outline"} className="text-xs capitalize" data-testid={`badge-stage-${idx}`}>
                              {item.stage}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant={item.status === "completed" ? "secondary" : item.status === "in_progress" ? "default" : "outline"} className="text-xs capitalize" data-testid={`badge-status-${idx}`}>
                              {item.status}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Progress value={item.progress ?? 0} className="h-2 w-16" data-testid={`progress-turn-${idx}`} />
                              <span className="text-xs text-muted-foreground">{item.progress ?? 0}%</span>
                            </div>
                          </td>
                          <td className="p-3 text-muted-foreground text-xs">{formatDate(item.targetDate)}</td>
                          <td className="p-3 text-muted-foreground text-xs">{item.assignedVendor ?? "—"}</td>
                          <td className="p-3">
                            <span className={(item.daysInProcess ?? 0) > 20 ? "text-red-600 dark:text-red-400 font-medium" : "text-muted-foreground"} data-testid={`text-days-turn-${idx}`}>
                              {item.daysInProcess ?? 0}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklists" className="space-y-4">
          <Card data-testid="card-checklists">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <ListChecks className="w-5 h-5 text-primary" />
                <CardTitle>Checklist Templates</CardTitle>
                <Badge variant="secondary" className="text-xs">{checklists.length} templates</Badge>
              </div>
              <CardDescription>Move-in and move-out checklist templates with completion tracking</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingChecklists ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 border rounded-lg">
                      <Skeleton className="w-10 h-10 rounded-md" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-64" />
                      </div>
                      <Skeleton className="h-8 w-16" />
                    </div>
                  ))}
                </div>
              ) : errorChecklists ? (
                <div className="p-6 text-center text-muted-foreground" data-testid="error-checklists">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-destructive" />
                  <p>Failed to load checklists data</p>
                </div>
              ) : checklists.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground" data-testid="empty-checklists">
                  <ListChecks className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No checklist templates</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {checklists.map((cl, index) => (
                    <div
                      key={cl.id}
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
                            <Badge variant="outline" className="text-[10px]">{cl.type}</Badge>
                            <span>{cl.items} items</span>
                            <span className="text-muted-foreground/50">|</span>
                            <span>Updated {formatDate(cl.lastUpdated)}</span>
                            <span className="text-muted-foreground/50">|</span>
                            <span>Used {cl.completedUses ?? 0} times</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Compliance</div>
                          <div className="flex items-center gap-1">
                            <span className={`text-sm font-semibold ${getScoreColor(cl.compliance ?? 0)}`} data-testid={`text-compliance-${index}`}>
                              {cl.compliance ?? 0}%
                            </span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" data-testid={`button-view-checklist-${index}`}>
                          <Search className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
