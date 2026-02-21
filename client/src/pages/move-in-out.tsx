import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AINudgeCard, AgentInsightStrip } from "@/components/ai-nudge-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
  ClipboardList,
  FileText,
  Search,
  Eye,
  Hammer,
  UserCheck,
  MapPin,
  DollarSign,
  Sparkles,
  ListChecks,
  type LucideIcon,
} from "lucide-react";

const agentInsights = [
  { text: "8 move-ins scheduled in next 14 days", severity: "info" as const },
  { text: "2 move-outs missing forwarding address", severity: "warning" as const, confidence: 0.91 },
  { text: "Avg turn time improved to 4.2 days", severity: "positive" as const, confidence: 0.94 },
];

const kpiCards = [
  { title: "Upcoming Move-Ins", value: "8", change: "+3 this week", trend: "up", icon: ArrowDownToLine, color: "text-emerald-600" },
  { title: "Upcoming Move-Outs", value: "5", change: "+1 this week", trend: "up", icon: ArrowUpFromLine, color: "text-amber-600" },
  { title: "In Progress Turns", value: "3", change: "-1 vs last month", trend: "up", icon: Hammer, color: "text-blue-600" },
  { title: "Avg Turn Time", value: "4.2 days", change: "-0.8 days", trend: "up", icon: Clock, color: "text-violet-600" },
];

const moveIns = [
  { id: 1, tenant: "Maria Gonzalez", unit: "3A", date: "Feb 25, 2026", checklist: 85, keyStatus: "Issued", utilityStatus: "Confirmed", welcomePacket: true },
  { id: 2, tenant: "James Carter", unit: "7B", date: "Feb 27, 2026", checklist: 60, keyStatus: "Pending", utilityStatus: "Pending", welcomePacket: false },
  { id: 3, tenant: "Linda Park", unit: "2D", date: "Mar 1, 2026", checklist: 40, keyStatus: "Pending", utilityStatus: "Confirmed", welcomePacket: false },
  { id: 4, tenant: "Robert Chen", unit: "5C", date: "Mar 3, 2026", checklist: 100, keyStatus: "Issued", utilityStatus: "Confirmed", welcomePacket: true },
  { id: 5, tenant: "Angela Davis", unit: "1A", date: "Mar 5, 2026", checklist: 20, keyStatus: "Pending", utilityStatus: "Pending", welcomePacket: false },
  { id: 6, tenant: "David Kim", unit: "8E", date: "Mar 7, 2026", checklist: 70, keyStatus: "Issued", utilityStatus: "Confirmed", welcomePacket: true },
  { id: 7, tenant: "Sarah Mitchell", unit: "4F", date: "Mar 10, 2026", checklist: 50, keyStatus: "Pending", utilityStatus: "Pending", welcomePacket: false },
  { id: 8, tenant: "Tom Williams", unit: "6A", date: "Mar 12, 2026", checklist: 10, keyStatus: "Pending", utilityStatus: "Pending", welcomePacket: false },
];

const moveOuts = [
  { id: 1, tenant: "Patricia Lane", unit: "2B", date: "Feb 24, 2026", inspectionStatus: "Completed", depositStatus: "Processed", forwardingAddress: true },
  { id: 2, tenant: "Michael Torres", unit: "5A", date: "Feb 26, 2026", inspectionStatus: "Scheduled", depositStatus: "Pending", forwardingAddress: true },
  { id: 3, tenant: "Jennifer Brown", unit: "4C", date: "Mar 1, 2026", inspectionStatus: "Not Scheduled", depositStatus: "Pending", forwardingAddress: false },
  { id: 4, tenant: "Steven Wright", unit: "7A", date: "Mar 4, 2026", inspectionStatus: "Scheduled", depositStatus: "Pending", forwardingAddress: true },
  { id: 5, tenant: "Karen Phillips", unit: "1D", date: "Mar 8, 2026", inspectionStatus: "Not Scheduled", depositStatus: "Pending", forwardingAddress: false },
  { id: 6, tenant: "Daniel Harris", unit: "9C", date: "Mar 10, 2026", inspectionStatus: "Not Scheduled", depositStatus: "Pending", forwardingAddress: true },
];

const unitTurns = [
  { id: 1, unit: "2B", previousTenant: "Patricia Lane", moveOutDate: "Feb 10, 2026", cleaning: "Complete", repairs: "In Progress", inspection: "Pending", targetMoveIn: "Feb 28, 2026", daysInTurn: 11 },
  { id: 2, unit: "5A", previousTenant: "Hector Ramirez", moveOutDate: "Feb 5, 2026", cleaning: "Complete", repairs: "Complete", inspection: "In Progress", targetMoveIn: "Feb 26, 2026", daysInTurn: 16 },
  { id: 3, unit: "4C", previousTenant: "Lisa Monroe", moveOutDate: "Feb 1, 2026", cleaning: "Complete", repairs: "Complete", inspection: "Complete", targetMoveIn: "Feb 24, 2026", daysInTurn: 20 },
  { id: 4, unit: "7A", previousTenant: "Greg Olson", moveOutDate: "Jan 28, 2026", cleaning: "Complete", repairs: "Complete", inspection: "Complete", targetMoveIn: "Feb 22, 2026", daysInTurn: 24 },
  { id: 5, unit: "1D", previousTenant: "Amy Foster", moveOutDate: "Jan 25, 2026", cleaning: "Complete", repairs: "Complete", inspection: "Complete", targetMoveIn: "Feb 20, 2026", daysInTurn: 27 },
  { id: 6, unit: "9B", previousTenant: "Mark Sullivan", moveOutDate: "Feb 12, 2026", cleaning: "In Progress", repairs: "Pending", inspection: "Pending", targetMoveIn: "Mar 1, 2026", daysInTurn: 9 },
];

const checklists = [
  { id: 1, name: "Standard Move-In Checklist", type: "Move-In", items: 32, completedUses: 145, lastUpdated: "Jan 15, 2026", compliance: 96 },
  { id: 2, name: "Standard Move-Out Checklist", type: "Move-Out", items: 38, completedUses: 112, lastUpdated: "Feb 1, 2026", compliance: 94 },
  { id: 3, name: "Key Handoff Procedure", type: "Move-In", items: 12, completedUses: 145, lastUpdated: "Dec 10, 2025", compliance: 99 },
  { id: 4, name: "Utility Transfer Checklist", type: "Move-In", items: 8, completedUses: 145, lastUpdated: "Jan 20, 2026", compliance: 97 },
  { id: 5, name: "Damage Assessment Form", type: "Move-Out", items: 45, completedUses: 112, lastUpdated: "Feb 5, 2026", compliance: 92 },
  { id: 6, name: "Deposit Reconciliation", type: "Move-Out", items: 15, completedUses: 112, lastUpdated: "Jan 28, 2026", compliance: 95 },
  { id: 7, name: "Welcome Packet Distribution", type: "Move-In", items: 10, completedUses: 140, lastUpdated: "Feb 10, 2026", compliance: 98 },
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

const turnStepVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "Complete": "secondary",
  "In Progress": "default",
  "Pending": "outline",
};

function getScoreColor(score: number) {
  if (score >= 90) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 75) return "text-blue-600 dark:text-blue-400";
  if (score >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

export default function MoveInOut() {
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
                        <td className="p-3 font-medium" data-testid={`text-tenant-${idx}`}>{item.tenant}</td>
                        <td className="p-3 font-mono text-xs">{item.unit}</td>
                        <td className="p-3 text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {item.date}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Progress value={item.checklist} className="h-2 w-16" data-testid={`progress-checklist-${idx}`} />
                            <span className="text-xs text-muted-foreground">{item.checklist}%</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant={item.keyStatus === "Issued" ? "secondary" : "outline"} className="text-xs" data-testid={`badge-key-${idx}`}>
                            <Key className="w-3 h-3 mr-1" />
                            {item.keyStatus}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant={item.utilityStatus === "Confirmed" ? "secondary" : "outline"} className="text-xs" data-testid={`badge-utility-${idx}`}>
                            <Zap className="w-3 h-3 mr-1" />
                            {item.utilityStatus}
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
                        <td className="p-3 font-medium" data-testid={`text-moveout-tenant-${idx}`}>{item.tenant}</td>
                        <td className="p-3 font-mono text-xs">{item.unit}</td>
                        <td className="p-3 text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {item.date}
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant={inspectionStatusVariant[item.inspectionStatus]} className="text-xs" data-testid={`badge-inspection-${idx}`}>
                            {item.inspectionStatus === "Completed" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {item.inspectionStatus === "Not Scheduled" && <XCircle className="w-3 h-3 mr-1" />}
                            {item.inspectionStatus === "Scheduled" && <Clock className="w-3 h-3 mr-1" />}
                            {item.inspectionStatus}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant={depositStatusVariant[item.depositStatus]} className="text-xs" data-testid={`badge-deposit-${idx}`}>
                            <DollarSign className="w-3 h-3 mr-1" />
                            {item.depositStatus}
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
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Unit</th>
                      <th className="p-3 font-medium text-muted-foreground">Previous Tenant</th>
                      <th className="p-3 font-medium text-muted-foreground">Move-Out</th>
                      <th className="p-3 font-medium text-muted-foreground">Cleaning</th>
                      <th className="p-3 font-medium text-muted-foreground">Repairs</th>
                      <th className="p-3 font-medium text-muted-foreground">Inspection</th>
                      <th className="p-3 font-medium text-muted-foreground">Target Move-In</th>
                      <th className="p-3 font-medium text-muted-foreground">Days</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unitTurns.map((item, idx) => (
                      <tr key={item.id} className="border-b last:border-0 hover-elevate" data-testid={`row-unit-turn-${idx}`}>
                        <td className="p-3 font-semibold">{item.unit}</td>
                        <td className="p-3 text-muted-foreground">{item.previousTenant}</td>
                        <td className="p-3 text-muted-foreground text-xs">{item.moveOutDate}</td>
                        <td className="p-3">
                          <Badge variant={turnStepVariant[item.cleaning]} className="text-xs" data-testid={`badge-cleaning-${idx}`}>
                            {item.cleaning}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant={turnStepVariant[item.repairs]} className="text-xs" data-testid={`badge-repairs-${idx}`}>
                            {item.repairs}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant={turnStepVariant[item.inspection]} className="text-xs" data-testid={`badge-turn-inspection-${idx}`}>
                            {item.inspection}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground text-xs">{item.targetMoveIn}</td>
                        <td className="p-3">
                          <span className={item.daysInTurn > 20 ? "text-red-600 dark:text-red-400 font-medium" : "text-muted-foreground"} data-testid={`text-days-turn-${idx}`}>
                            {item.daysInTurn}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                          <span>Updated {cl.lastUpdated}</span>
                          <span className="text-muted-foreground/50">|</span>
                          <span>Used {cl.completedUses} times</span>
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
                      <Button variant="outline" size="sm" data-testid={`button-view-checklist-${index}`}>
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
