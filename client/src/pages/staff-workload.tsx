import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Clock, Zap, TrendingUp, CheckCircle2, AlertCircle, Brain, BarChart3 } from "lucide-react";

const staffMembers = [
  { name: "Sarah Mitchell", role: "Property Manager", activeItems: 12, automatedTasks: 28, manualTasks: 8, utilization: 78, status: "optimal" as const },
  { name: "Michael Torres", role: "Maintenance Lead", activeItems: 18, automatedTasks: 15, manualTasks: 14, utilization: 92, status: "high" as const },
  { name: "David Chen", role: "Leasing Agent", activeItems: 8, automatedTasks: 22, manualTasks: 5, utilization: 65, status: "optimal" as const },
  { name: "Lisa Park", role: "Accounting", activeItems: 15, automatedTasks: 42, manualTasks: 11, utilization: 85, status: "high" as const },
  { name: "James Rodriguez", role: "Maintenance Tech", activeItems: 22, automatedTasks: 8, manualTasks: 18, utilization: 95, status: "overloaded" as const },
];

const automationInsights = [
  { task: "Rent collection follow-ups", before: "2.5 hrs/day", after: "15 min/day", savings: "90%", icon: Zap },
  { task: "Invoice reconciliation", before: "4 hrs/week", after: "30 min/week", savings: "88%", icon: CheckCircle2 },
  { task: "Lease renewal processing", before: "3 hrs/lease", after: "20 min/lease", savings: "89%", icon: Brain },
  { task: "Maintenance scheduling", before: "1.5 hrs/day", after: "20 min/day", savings: "78%", icon: Clock },
];

const statusConfig = {
  optimal: { label: "Optimal", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500" },
  high: { label: "High", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500" },
  overloaded: { label: "Overloaded", color: "text-red-600 dark:text-red-400", bg: "bg-red-500" },
};

export default function StaffWorkload() {
  const totalAutomated = staffMembers.reduce((s, m) => s + m.automatedTasks, 0);
  const totalManual = staffMembers.reduce((s, m) => s + m.manualTasks, 0);

  return (
    <div className="space-y-6" data-testid="page-staff-workload">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Staff Workload Automation</h1>
          <p className="text-muted-foreground">AI-optimized task distribution and workload intelligence across your team</p>
        </div>
        <Button variant="outline" data-testid="button-rebalance">
          <Brain className="w-4 h-4 mr-2" />
          AI Rebalance
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-team-count">{staffMembers.length}</div>
            <p className="text-xs text-muted-foreground">Active staff</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Automated</CardTitle>
            <Zap className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-automated">{totalAutomated}</div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">{Math.round(totalAutomated / (totalAutomated + totalManual) * 100)}% automation rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manual Tasks</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-manual">{totalManual}</div>
            <p className="text-xs text-muted-foreground">Requiring human input</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Saved / Week</CardTitle>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-hours-saved">32</div>
            <p className="text-xs text-muted-foreground">Via AI automation</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Team Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {staffMembers.map((member, i) => {
              const config = statusConfig[member.status];
              return (
                <div key={i} className="space-y-2" data-testid={`staff-member-${i}`}>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{member.name}</span>
                      <Badge variant="secondary" className="text-xs">{member.role}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-muted-foreground">{member.activeItems} active</span>
                      <span className={`font-medium ${config.color}`}>{member.utilization}%</span>
                      <Badge variant={member.status === "overloaded" ? "destructive" : member.status === "high" ? "outline" : "secondary"}>
                        {config.label}
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className={`h-2 rounded-full ${config.bg}`} style={{ width: `${member.utilization}%` }} />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{member.automatedTasks} automated</span>
                    <span>{member.manualTasks} manual</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Automation Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {automationInsights.map((insight, i) => {
              const InsightIcon = insight.icon;
              return (
                <div key={i} className="flex items-center gap-3 p-3 rounded-md bg-muted/50" data-testid={`automation-insight-${i}`}>
                  <InsightIcon className="w-5 h-5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{insight.task}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{insight.before}</span>
                      <ArrowIcon />
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">{insight.after}</span>
                      <Badge variant="secondary" className="text-xs">{insight.savings} saved</Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ArrowIcon() {
  return <span className="text-muted-foreground">&#8594;</span>;
}
