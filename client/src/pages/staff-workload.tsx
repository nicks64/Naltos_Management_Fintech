import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users, Clock, Zap, TrendingUp, CheckCircle2, AlertCircle, Brain,
  BarChart3, Calendar, ArrowRight, ListChecks, User, Wrench,
  DollarSign, FileText, Mail, AlertTriangle, Radio,
} from "lucide-react";
import { useState } from "react";

interface StaffMember {
  name: string;
  role: string;
  avatar: string;
  activeItems: number;
  automatedTasks: number;
  manualTasks: number;
  utilization: number;
  status: "optimal" | "high" | "overloaded";
  neuralEfficiency: number;
  completedToday: number;
  pendingUrgent: number;
}

interface TaskItem {
  title: string;
  type: "maintenance" | "collection" | "vendor" | "lease" | "compliance" | "report";
  assignee: string;
  priority: "critical" | "high" | "medium" | "low";
  dueDate: string;
  status: "pending" | "in_progress" | "blocked" | "completed";
  aiAutomatable: boolean;
  aiSuggestion: string;
  estimatedTime: string;
}

const staffMembers: StaffMember[] = [
  { name: "Sarah Mitchell", role: "Property Manager", avatar: "SM", activeItems: 12, automatedTasks: 28, manualTasks: 8, utilization: 78, status: "optimal", neuralEfficiency: 92, completedToday: 5, pendingUrgent: 1 },
  { name: "Michael Torres", role: "Maintenance Lead", avatar: "MT", activeItems: 18, automatedTasks: 15, manualTasks: 14, utilization: 92, status: "high", neuralEfficiency: 76, completedToday: 8, pendingUrgent: 3 },
  { name: "David Chen", role: "Leasing Agent", avatar: "DC", activeItems: 8, automatedTasks: 22, manualTasks: 5, utilization: 65, status: "optimal", neuralEfficiency: 88, completedToday: 3, pendingUrgent: 0 },
  { name: "Lisa Park", role: "Accounting", avatar: "LP", activeItems: 15, automatedTasks: 42, manualTasks: 11, utilization: 85, status: "high", neuralEfficiency: 94, completedToday: 7, pendingUrgent: 2 },
  { name: "James Rodriguez", role: "Maintenance Tech", avatar: "JR", activeItems: 22, automatedTasks: 8, manualTasks: 18, utilization: 95, status: "overloaded", neuralEfficiency: 62, completedToday: 6, pendingUrgent: 5 },
];

const taskQueue: TaskItem[] = [
  { title: "HVAC repair — Unit 8C Cedar Ridge", type: "maintenance", assignee: "James Rodriguez", priority: "critical", dueDate: "Today", status: "in_progress", aiAutomatable: false, aiSuggestion: "Reassign 2 lower-priority tasks to free capacity", estimatedTime: "3 hrs" },
  { title: "Send collection nudge — 5 overdue tenants", type: "collection", assignee: "Sarah Mitchell", priority: "high", dueDate: "Today", status: "pending", aiAutomatable: true, aiSuggestion: "Auto-send via AI nudge engine — 78% historical response rate", estimatedTime: "15 min" },
  { title: "Vendor insurance renewal — Apex Maintenance", type: "vendor", assignee: "Lisa Park", priority: "high", dueDate: "Today", status: "pending", aiAutomatable: true, aiSuggestion: "Auto-approve — 96% compliance score, 3-year history", estimatedTime: "10 min" },
  { title: "Lease renewal meeting — David Kim", type: "lease", assignee: "David Chen", priority: "high", dueDate: "Tomorrow", status: "pending", aiAutomatable: false, aiSuggestion: "Prepare flat renewal offer — 45% churn risk detected", estimatedTime: "45 min" },
  { title: "Monthly reconciliation — Parkview Towers", type: "compliance", assignee: "Lisa Park", priority: "medium", dueDate: "Feb 22", status: "pending", aiAutomatable: true, aiSuggestion: "AI pre-matched 94% of transactions — review 12 exceptions", estimatedTime: "30 min" },
  { title: "Plumbing emergency — Unit 2A Sunset Heights", type: "maintenance", assignee: "Michael Torres", priority: "critical", dueDate: "Today", status: "in_progress", aiAutomatable: false, aiSuggestion: "QuickFix Plumbing dispatched — ETA 45 min", estimatedTime: "2 hrs" },
  { title: "Merchant POS install — QuickFit Gym", type: "vendor", assignee: "Sarah Mitchell", priority: "medium", dueDate: "Feb 24", status: "pending", aiAutomatable: false, aiSuggestion: "Coordinate with IT for network provisioning", estimatedTime: "1 hr" },
  { title: "Generate Q1 investor report", type: "report", assignee: "Lisa Park", priority: "low", dueDate: "Feb 28", status: "pending", aiAutomatable: true, aiSuggestion: "All data sources ready — auto-generate draft", estimatedTime: "20 min" },
  { title: "Fire extinguisher inspection — All properties", type: "compliance", assignee: "Michael Torres", priority: "medium", dueDate: "Mar 1", status: "pending", aiAutomatable: false, aiSuggestion: "Schedule bulk inspection with SecureGuard", estimatedTime: "4 hrs" },
  { title: "Lease agreement — New tenant Unit 5B", type: "lease", assignee: "David Chen", priority: "medium", dueDate: "Feb 25", status: "pending", aiAutomatable: true, aiSuggestion: "AI-generated lease ready for review — standard terms", estimatedTime: "20 min" },
];

const aiRebalanceInsights = [
  { from: "James Rodriguez", to: "Michael Torres", tasks: 3, reason: "James at 95% utilization — redistribute non-urgent maintenance tickets", impact: "-17% workload for James, +8% for Michael", neuralConfidence: 89 },
  { from: "Manual", to: "AI Engine", tasks: 5, reason: "Collection nudges, reconciliation pre-match, and report generation are AI-automatable", impact: "Save 2.5 hrs/day across team", neuralConfidence: 94 },
];

const statusConfig = {
  optimal: { label: "Optimal", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500", badgeVariant: "secondary" as const },
  high: { label: "High Load", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500", badgeVariant: "outline" as const },
  overloaded: { label: "Overloaded", color: "text-red-600 dark:text-red-400", bg: "bg-red-500", badgeVariant: "destructive" as const },
};

const priorityConfig = {
  critical: { label: "Critical", variant: "destructive" as const },
  high: { label: "High", variant: "destructive" as const },
  medium: { label: "Med", variant: "outline" as const },
  low: { label: "Low", variant: "secondary" as const },
};

const taskStatusConfig = {
  pending: { label: "Pending", variant: "outline" as const },
  in_progress: { label: "In Progress", variant: "secondary" as const },
  blocked: { label: "Blocked", variant: "destructive" as const },
  completed: { label: "Done", variant: "secondary" as const },
};

const typeIcons: Record<string, typeof Wrench> = {
  maintenance: Wrench,
  collection: DollarSign,
  vendor: Users,
  lease: FileText,
  compliance: CheckCircle2,
  report: BarChart3,
};

export default function StaffWorkload() {
  const [activeTab, setActiveTab] = useState("tasks");
  const totalAutomated = staffMembers.reduce((s, m) => s + m.automatedTasks, 0);
  const totalManual = staffMembers.reduce((s, m) => s + m.manualTasks, 0);
  const automationRate = Math.round(totalAutomated / (totalAutomated + totalManual) * 100);
  const totalUrgent = staffMembers.reduce((s, m) => s + m.pendingUrgent, 0);

  return (
    <div className="space-y-6" data-testid="page-staff-workload">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Brain className="w-5 h-5 text-primary" />
            <Badge variant="secondary" className="text-xs">
              <Radio className="w-3 h-3 mr-1 text-green-500 animate-pulse" />
              AI-Managed
            </Badge>
          </div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Staff Workload &amp; Task Management</h1>
          <p className="text-muted-foreground">AI-optimized task distribution, workload intelligence, and automation tracking</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" data-testid="button-export">
            <BarChart3 className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button data-testid="button-rebalance">
            <Brain className="w-4 h-4 mr-2" />
            AI Rebalance
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Team Size</p>
            <p className="text-2xl font-bold" data-testid="text-team-count">{staffMembers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Active Tasks</p>
            <p className="text-2xl font-bold" data-testid="text-active-tasks">{taskQueue.filter(t => t.status !== "completed").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Urgent</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400" data-testid="text-urgent">{totalUrgent}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Automation Rate</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400" data-testid="text-automation-rate">{automationRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Hours Saved/Week</p>
            <p className="text-2xl font-bold" data-testid="text-hours-saved">32</p>
          </CardContent>
        </Card>
      </div>

      {aiRebalanceInsights.length > 0 && (
        <Card className="border-primary/20 bg-primary/5" data-testid="card-ai-rebalance">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Brain className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">AI Rebalance Recommendations</CardTitle>
              <Badge variant="secondary" className="text-xs">Neuromorphic</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiRebalanceInsights.map((insight, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-background border rounded-lg flex-wrap" data-testid={`rebalance-${i}`}>
                <Zap className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0 space-y-1" data-testid={`rebalance-content-${i}`}>
                  <p className="text-sm font-medium">{insight.from} → {insight.to} ({insight.tasks} tasks)</p>
                  <p className="text-xs text-muted-foreground">{insight.reason}</p>
                  <div className="flex items-center gap-3 text-xs flex-wrap">
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">{insight.impact}</span>
                    <span className="flex items-center gap-1 text-muted-foreground flex-wrap" data-testid={`neural-confidence-${i}`}><Brain className="w-3 h-3" /> {insight.neuralConfidence}% confidence</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="shrink-0" data-testid={`button-apply-rebalance-${i}`}>
                  Apply
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="tasks" data-testid="tab-tasks">
            <ListChecks className="w-4 h-4 mr-1" />
            Task Queue ({taskQueue.length})
          </TabsTrigger>
          <TabsTrigger value="team" data-testid="tab-team">
            <Users className="w-4 h-4 mr-1" />
            Team ({staffMembers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4 space-y-2">
          {taskQueue
            .sort((a, b) => {
              const pOrder = { critical: 0, high: 1, medium: 2, low: 3 };
              return pOrder[a.priority] - pOrder[b.priority];
            })
            .map((task, i) => {
              const TypeIcon = typeIcons[task.type] || FileText;
              return (
                <div key={i} className="flex items-center gap-3 p-3 border rounded-lg flex-wrap" data-testid={`task-${i}`}>
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0" data-testid={`task-type-icon-${i}`}>
                    <TypeIcon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{task.title}</span>
                      <Badge variant={priorityConfig[task.priority].variant} className="text-xs">{priorityConfig[task.priority].label}</Badge>
                      <Badge variant={taskStatusConfig[task.status].variant} className="text-xs">{taskStatusConfig[task.status].label}</Badge>
                      {task.aiAutomatable && (
                        <Badge variant="secondary" className="text-xs">
                          <Zap className="w-3 h-3 mr-0.5" /> AI-Ready
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1 flex-wrap"><User className="w-3 h-3" /> {task.assignee}</span>
                      <span className="flex items-center gap-1 flex-wrap"><Calendar className="w-3 h-3" /> {task.dueDate}</span>
                      <span className="flex items-center gap-1 flex-wrap"><Clock className="w-3 h-3" /> {task.estimatedTime}</span>
                    </div>
                    <p className="text-xs flex items-center gap-1 flex-wrap">
                      <Brain className="w-3 h-3 text-primary shrink-0" />
                      <span className="text-muted-foreground">{task.aiSuggestion}</span>
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0" data-testid={`button-task-action-${i}`}>
                    Action
                  </Button>
                </div>
              );
            })}
        </TabsContent>

        <TabsContent value="team" className="mt-4 space-y-3">
          {staffMembers.map((member, i) => {
            const config = statusConfig[member.status];
            return (
              <Card key={i} data-testid={`staff-member-${i}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                        {member.avatar}
                      </div>
                      <div className="min-w-0 space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap" data-testid={`staff-member-stats-${i}`}>
                          <span className="font-medium">{member.name}</span>
                          <Badge variant="secondary" className="text-xs">{member.role}</Badge>
                          <Badge variant={config.badgeVariant} className="text-xs">{config.label}</Badge>
                          <div className="flex items-center gap-1 text-xs flex-wrap" data-testid={`neural-efficiency-${i}`}>
                            <Brain className="w-3 h-3 text-primary" />
                            <span className={`font-mono font-medium ${member.neuralEfficiency >= 85 ? "text-emerald-600 dark:text-emerald-400" : member.neuralEfficiency >= 70 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>
                              {member.neuralEfficiency}
                            </span>
                            <span className="text-muted-foreground">efficiency</span>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs" data-testid={`utilization-bar-${i}`}>
                            <span className="text-muted-foreground">Utilization</span>
                            <span className={`font-medium ${config.color}`}>{member.utilization}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className={`h-2 rounded-full ${config.bg}`} style={{ width: `${member.utilization}%` }} />
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-3 text-xs">
                          <div>
                            <span className="text-muted-foreground">Active</span>
                            <p className="font-medium">{member.activeItems}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Auto</span>
                            <p className="font-medium text-emerald-600 dark:text-emerald-400">{member.automatedTasks}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Manual</span>
                            <p className="font-medium">{member.manualTasks}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Urgent</span>
                            <p className={`font-medium ${member.pendingUrgent > 2 ? "text-red-600 dark:text-red-400" : ""}`}>{member.pendingUrgent}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <Button variant="outline" size="sm" data-testid={`button-view-tasks-${i}`}>
                        View Tasks
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                      <Button variant="ghost" size="sm" data-testid={`button-reassign-${i}`}>
                        Reassign
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
