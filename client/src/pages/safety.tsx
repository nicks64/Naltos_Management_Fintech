import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AINudgeCard, AgentInsightStrip } from "@/components/ai-nudge-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Shield,
  ShieldAlert,
  Camera,
  Flame,
  FileText,
  Phone,
  Brain,
  AlertTriangle,
  TrendingUp,
  Activity,
  Target,
  Filter,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Users,
  MapPin,
  Radio,
  type LucideIcon,
} from "lucide-react";
import type {
  IncidentReport,
  PatrolLogEntry,
  CameraSystem,
  FireSafetyItem,
} from "@shared/schema";

const agentInsights = [
  { text: "3 active security incidents require attention", severity: "critical" as const },
  { text: "Night patrol coverage at 94% this month", severity: "positive" as const, confidence: 0.92 },
  { text: "2 fire inspections due within 30 days", severity: "warning" as const },
];

const emergencyPlans = [
  { type: "Evacuation", lastUpdated: "Jan 10, 2026", nextReview: "Jul 10, 2026", drillDate: "Mar 15, 2026" },
  { type: "Shelter-in-Place", lastUpdated: "Nov 5, 2025", nextReview: "May 5, 2026", drillDate: "Apr 20, 2026" },
  { type: "Active Shooter", lastUpdated: "Dec 1, 2025", nextReview: "Jun 1, 2026", drillDate: "May 10, 2026" },
  { type: "Natural Disaster", lastUpdated: "Oct 15, 2025", nextReview: "Apr 15, 2026", drillDate: "Jun 1, 2026" },
  { type: "Power Outage", lastUpdated: "Feb 1, 2026", nextReview: "Aug 1, 2026", drillDate: "N/A" },
];

const afterHoursCalls = [
  { dateTime: "Feb 19, 11:45 PM", caller: "T. Adams", unit: "3B", issue: "Water leak under sink", priority: "High", response: "Dispatched on-call plumber", resolved: "Yes" },
  { dateTime: "Feb 18, 1:30 AM", caller: "S. Lopez", unit: "6D", issue: "Locked out of unit", priority: "Medium", response: "Security escort, locksmith called", resolved: "Yes" },
  { dateTime: "Feb 17, 10:15 PM", caller: "J. Park", unit: "2A", issue: "Noise complaint - neighbor", priority: "Low", response: "Officer dispatched, verbal warning issued", resolved: "Yes" },
  { dateTime: "Feb 16, 3:00 AM", caller: "Front Desk", unit: "N/A", issue: "Fire alarm activation", priority: "Critical", response: "Full evacuation, FD responded, false alarm", resolved: "Yes" },
  { dateTime: "Feb 15, 9:30 PM", caller: "R. Kim", unit: "4C", issue: "Broken window - security concern", priority: "High", response: "Boarded window, repair scheduled", resolved: "No" },
  { dateTime: "Feb 14, 11:00 PM", caller: "D. Brown", unit: "7A", issue: "Suspicious person in hallway", priority: "High", response: "Officer responded, non-resident escorted out", resolved: "Yes" },
];

const severityVariant: Record<string, "destructive" | "outline" | "secondary"> = {
  Critical: "destructive",
  High: "destructive",
  Medium: "outline",
  Low: "secondary",
};

const statusVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  Open: "outline",
  Investigating: "default",
  Resolved: "secondary",
  Closed: "secondary",
};

const cameraStatusVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  Online: "secondary",
  Offline: "destructive",
  Maintenance: "outline",
};

const fireResultVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  Compliant: "secondary",
  "Non-Compliant": "destructive",
};

const priorityVariant: Record<string, "destructive" | "outline" | "secondary"> = {
  Critical: "destructive",
  High: "destructive",
  Medium: "outline",
  Low: "secondary",
};

function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="p-3 space-y-3" data-testid="skeleton-table">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-3">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <Card data-testid="error-state">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 text-destructive">
          <XCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{message}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Safety() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  const { data: incidents = [], isLoading: incidentsLoading, isError: incidentsError } = useQuery<IncidentReport[]>({
    queryKey: ['/api/safety/incidents'],
  });

  const { data: patrols = [], isLoading: patrolsLoading, isError: patrolsError } = useQuery<PatrolLogEntry[]>({
    queryKey: ['/api/safety/patrols'],
  });

  const { data: cameras = [], isLoading: camerasLoading, isError: camerasError } = useQuery<CameraSystem[]>({
    queryKey: ['/api/safety/cameras'],
  });

  const { data: fire = [], isLoading: fireLoading, isError: fireError } = useQuery<FireSafetyItem[]>({
    queryKey: ['/api/safety/fire'],
  });

  const kpiCards = useMemo(() => {
    const openIncidents = incidents.filter(i => i.status !== 'Resolved' && i.status !== 'Closed').length;
    const patrolsToday = patrols.filter(p => p.date?.includes("Feb 21")).length;
    const camerasOnline = cameras.filter(c => c.status === 'Online').length;
    const fireCompliant = fire.filter(f => f.compliance === 'Compliant').length;

    return [
      { title: "Open Incidents", value: String(openIncidents), change: `${incidents.length} total`, trend: openIncidents > 0 ? "warning" : "positive", icon: ShieldAlert },
      { title: "Patrols Today", value: String(patrolsToday), change: `${patrols.length} total logs`, trend: "positive", icon: Shield },
      { title: "Cameras Online", value: `${camerasOnline}/${cameras.length}`, change: cameras.length > 0 ? `${Math.round((camerasOnline / cameras.length) * 100)}% uptime` : "No data", trend: camerasOnline === cameras.length ? "positive" : "warning", icon: Camera },
      { title: "Fire Systems", value: `${fireCompliant}/${fire.length}`, change: `${fireCompliant} compliant`, trend: fireCompliant === fire.length ? "positive" : "warning", icon: Flame },
    ];
  }, [incidents, patrols, cameras, fire]);

  const kpiLoading = incidentsLoading || patrolsLoading || camerasLoading || fireLoading;

  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      if (statusFilter !== "all" && inc.status !== statusFilter) return false;
      if (severityFilter !== "all" && inc.severity !== severityFilter) return false;
      return true;
    });
  }, [incidents, statusFilter, severityFilter]);

  return (
    <div className="space-y-6" data-testid="page-safety">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-page-title">Safety & Security</h1>
          <p className="text-muted-foreground">Incident reporting, patrol oversight, and emergency preparedness</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs" data-testid="badge-agent-status">
            <Brain className="w-3 h-3 mr-1 text-primary" />
            Agent Active
          </Badge>
          <Button size="sm" data-testid="button-report-incident">
            <ShieldAlert className="w-3 h-3 mr-1" />
            Report Incident
          </Button>
        </div>
      </div>

      <AgentInsightStrip insights={agentInsights} />

      <AINudgeCard
        title="Security Pattern Alert"
        insight="3 theft reports in the parking garage this month, a 200% increase over last month. Recommend increased patrol coverage during evening hours and improved lighting in B2 level. Historical data shows lighting improvements reduce garage incidents by 60%."
        confidence={0.88}
        severity="warning"
        icon={Target}
        actionLabel="Increase Patrols"
        onAction={() => {}}
        secondaryLabel="View Analysis"
        onSecondary={() => {}}
        metric="3 incidents"
        metricLabel="Garage Theft Reports"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpiCards.map((card, index) => (
          <Card key={card.title} className="hover-elevate" data-testid={`card-kpi-${index}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-1 pt-3 px-3">
              <CardTitle className="text-xs font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-3 pb-3">
              {kpiLoading ? (
                <Skeleton className="h-7 w-16" data-testid={`skeleton-kpi-${index}`} />
              ) : (
                <>
                  <div className="text-xl font-mono tabular-nums font-semibold" data-testid={`text-kpi-value-${index}`}>{card.value}</div>
                  <div className="flex items-center gap-1 text-xs mt-0.5">
                    {card.trend === "positive" ? (
                      <TrendingUp className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                    )}
                    <span className={card.trend === "positive" ? "text-emerald-600" : "text-amber-600"}>{card.change}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="incidents" className="space-y-4">
        <TabsList data-testid="tabs-safety">
          <TabsTrigger value="incidents" data-testid="tab-incidents">Incident Reports</TabsTrigger>
          <TabsTrigger value="patrols" data-testid="tab-patrols">Patrol Logs</TabsTrigger>
          <TabsTrigger value="cameras" data-testid="tab-cameras">Camera Systems</TabsTrigger>
          <TabsTrigger value="fire" data-testid="tab-fire">Fire Safety</TabsTrigger>
          <TabsTrigger value="emergency" data-testid="tab-emergency">Emergency Plans</TabsTrigger>
          <TabsTrigger value="after-hours" data-testid="tab-after-hours">After-Hours Calls</TabsTrigger>
        </TabsList>

        <TabsContent value="incidents" className="space-y-4">
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
                <SelectItem value="Investigating">Investigating</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[160px]" data-testid="select-severity-filter">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="secondary" className="text-xs" data-testid="badge-filtered-count">
              {filteredIncidents.length} incidents
            </Badge>
          </div>

          {incidentsError ? (
            <ErrorState message="Failed to load incident reports" />
          ) : incidentsLoading ? (
            <Card data-testid="card-incident-reports"><CardContent className="p-0"><TableSkeleton cols={8} /></CardContent></Card>
          ) : (
            <Card data-testid="card-incident-reports">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="p-3 font-medium text-muted-foreground">ID</th>
                        <th className="p-3 font-medium text-muted-foreground">Date</th>
                        <th className="p-3 font-medium text-muted-foreground">Type</th>
                        <th className="p-3 font-medium text-muted-foreground">Location</th>
                        <th className="p-3 font-medium text-muted-foreground">Reported By</th>
                        <th className="p-3 font-medium text-muted-foreground">Severity</th>
                        <th className="p-3 font-medium text-muted-foreground">Status</th>
                        <th className="p-3 font-medium text-muted-foreground">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredIncidents.map((inc, idx) => (
                        <tr key={inc.id} className="border-b last:border-0 hover-elevate" data-testid={`row-incident-${idx}`}>
                          <td className="p-3 font-mono text-xs">{inc.incidentId}</td>
                          <td className="p-3 text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {inc.date}
                            </div>
                          </td>
                          <td className="p-3 font-medium">{inc.type}</td>
                          <td className="p-3 text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5" />
                              {inc.location}
                            </div>
                          </td>
                          <td className="p-3 text-muted-foreground">{inc.reportedBy}</td>
                          <td className="p-3">
                            <Badge variant={severityVariant[inc.severity || ""] || "outline"} className="text-xs" data-testid={`badge-severity-${idx}`}>
                              {inc.severity}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant={statusVariant[inc.status || ""] || "outline"} className="text-xs" data-testid={`badge-status-${idx}`}>
                              {inc.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-muted-foreground text-xs max-w-[200px] truncate">{inc.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="patrols" className="space-y-4">
          {patrolsError ? (
            <ErrorState message="Failed to load patrol logs" />
          ) : patrolsLoading ? (
            <Card data-testid="card-patrol-logs"><CardContent className="p-0"><TableSkeleton cols={6} /></CardContent></Card>
          ) : (
            <Card data-testid="card-patrol-logs">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Users className="w-5 h-5 text-primary" />
                  <CardTitle>Security Patrol Logs</CardTitle>
                  <Badge variant="secondary" className="text-xs">Agent-Monitored</Badge>
                </div>
                <CardDescription>Daily patrol records with route coverage and findings</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="p-3 font-medium text-muted-foreground">Officer</th>
                        <th className="p-3 font-medium text-muted-foreground">Date</th>
                        <th className="p-3 font-medium text-muted-foreground">Route</th>
                        <th className="p-3 font-medium text-muted-foreground">Time</th>
                        <th className="p-3 font-medium text-muted-foreground">Findings</th>
                        <th className="p-3 font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patrols.map((log, idx) => (
                        <tr key={log.id} className="border-b last:border-0" data-testid={`row-patrol-${idx}`}>
                          <td className="p-3 font-medium">{log.officer}</td>
                          <td className="p-3 text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              {log.date}
                            </div>
                          </td>
                          <td className="p-3">{log.route}</td>
                          <td className="p-3 text-muted-foreground">{log.startTime} - {log.endTime}</td>
                          <td className="p-3">
                            <span className={log.findings === "All clear" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>
                              {log.findings}
                            </span>
                          </td>
                          <td className="p-3">
                            <Badge variant="secondary" className="text-xs" data-testid={`badge-patrol-status-${idx}`}>
                              {log.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="cameras" className="space-y-4">
          {camerasError ? (
            <ErrorState message="Failed to load camera systems" />
          ) : camerasLoading ? (
            <Card data-testid="card-camera-systems"><CardContent className="p-0"><TableSkeleton cols={6} /></CardContent></Card>
          ) : (
            <Card data-testid="card-camera-systems">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Camera className="w-5 h-5 text-primary" />
                  <CardTitle>Camera System Inventory</CardTitle>
                  <Badge variant="secondary" className="text-xs">{cameras.filter(c => c.status === "Online").length}/{cameras.length} Online</Badge>
                </div>
                <CardDescription>Surveillance camera status, maintenance, and recording overview</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="p-3 font-medium text-muted-foreground">Camera ID</th>
                        <th className="p-3 font-medium text-muted-foreground">Location</th>
                        <th className="p-3 font-medium text-muted-foreground">Type</th>
                        <th className="p-3 font-medium text-muted-foreground">Status</th>
                        <th className="p-3 font-medium text-muted-foreground">Resolution</th>
                        <th className="p-3 font-medium text-muted-foreground">Last Maintenance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cameras.map((cam, idx) => (
                        <tr key={cam.id} className="border-b last:border-0" data-testid={`row-camera-${idx}`}>
                          <td className="p-3 font-mono text-xs">{cam.cameraId}</td>
                          <td className="p-3 font-medium">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                              {cam.location}
                            </div>
                          </td>
                          <td className="p-3 text-muted-foreground">{cam.type}</td>
                          <td className="p-3">
                            <Badge variant={cameraStatusVariant[cam.status || ""] || "outline"} className="text-xs" data-testid={`badge-camera-status-${idx}`}>
                              {cam.status === "Online" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                              {cam.status === "Offline" && <XCircle className="w-3 h-3 mr-1" />}
                              {cam.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-muted-foreground">{cam.resolution}</td>
                          <td className="p-3 text-muted-foreground">{cam.lastMaintenance}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="fire" className="space-y-4">
          {fireError ? (
            <ErrorState message="Failed to load fire safety data" />
          ) : fireLoading ? (
            <Card data-testid="card-fire-safety"><CardContent className="p-0"><TableSkeleton cols={6} /></CardContent></Card>
          ) : (
            <Card data-testid="card-fire-safety">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Flame className="w-5 h-5 text-primary" />
                  <CardTitle>Fire Safety Inspections</CardTitle>
                  <Badge variant="secondary" className="text-xs">Compliance Tracking</Badge>
                </div>
                <CardDescription>Fire safety equipment inspection records and certification status</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="p-3 font-medium text-muted-foreground">System</th>
                        <th className="p-3 font-medium text-muted-foreground">Location</th>
                        <th className="p-3 font-medium text-muted-foreground">Last Inspection</th>
                        <th className="p-3 font-medium text-muted-foreground">Next Inspection</th>
                        <th className="p-3 font-medium text-muted-foreground">Compliance</th>
                        <th className="p-3 font-medium text-muted-foreground">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fire.map((item, idx) => (
                        <tr key={item.id} className="border-b last:border-0" data-testid={`row-fire-${idx}`}>
                          <td className="p-3 font-medium">{item.system}</td>
                          <td className="p-3 text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5" />
                              {item.location}
                            </div>
                          </td>
                          <td className="p-3 text-muted-foreground">{item.lastInspection}</td>
                          <td className="p-3 text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {item.nextInspection}
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge variant={fireResultVariant[item.compliance || ""] || "outline"} className="text-xs" data-testid={`badge-fire-result-${idx}`}>
                              {item.compliance === "Compliant" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                              {item.compliance === "Non-Compliant" && <AlertTriangle className="w-3 h-3 mr-1" />}
                              {item.compliance}
                            </Badge>
                          </td>
                          <td className="p-3 text-muted-foreground text-xs max-w-[200px] truncate">{item.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="emergency" className="space-y-4">
          <Card data-testid="card-emergency-plans">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <FileText className="w-5 h-5 text-primary" />
                <CardTitle>Emergency Preparedness Plans</CardTitle>
                <Badge variant="secondary" className="text-xs">{emergencyPlans.length} Plans</Badge>
              </div>
              <CardDescription>Emergency response plans, review schedules, and drill dates</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Plan Type</th>
                      <th className="p-3 font-medium text-muted-foreground">Last Updated</th>
                      <th className="p-3 font-medium text-muted-foreground">Next Review</th>
                      <th className="p-3 font-medium text-muted-foreground">Drill Date</th>
                      <th className="p-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emergencyPlans.map((plan, idx) => (
                      <tr key={idx} className="border-b last:border-0" data-testid={`row-emergency-${idx}`}>
                        <td className="p-3 font-medium">{plan.type}</td>
                        <td className="p-3 text-muted-foreground">{plan.lastUpdated}</td>
                        <td className="p-3 text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {plan.nextReview}
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground">{plan.drillDate}</td>
                        <td className="p-3">
                          <Button variant="ghost" size="sm" data-testid={`button-view-plan-${idx}`}>
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="after-hours" className="space-y-4">
          <Card data-testid="card-after-hours">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Phone className="w-5 h-5 text-primary" />
                <CardTitle>After-Hours Call Log</CardTitle>
                <Badge variant="secondary" className="text-xs">Last 7 Days</Badge>
              </div>
              <CardDescription>Emergency and after-hours calls with response tracking</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Date/Time</th>
                      <th className="p-3 font-medium text-muted-foreground">Caller</th>
                      <th className="p-3 font-medium text-muted-foreground">Unit</th>
                      <th className="p-3 font-medium text-muted-foreground">Issue</th>
                      <th className="p-3 font-medium text-muted-foreground">Priority</th>
                      <th className="p-3 font-medium text-muted-foreground">Response</th>
                      <th className="p-3 font-medium text-muted-foreground">Resolved</th>
                    </tr>
                  </thead>
                  <tbody>
                    {afterHoursCalls.map((call, idx) => (
                      <tr key={idx} className="border-b last:border-0" data-testid={`row-after-hours-${idx}`}>
                        <td className="p-3 text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {call.dateTime}
                          </div>
                        </td>
                        <td className="p-3 font-medium">{call.caller}</td>
                        <td className="p-3 text-muted-foreground">{call.unit}</td>
                        <td className="p-3">{call.issue}</td>
                        <td className="p-3">
                          <Badge variant={priorityVariant[call.priority]} className="text-xs" data-testid={`badge-call-priority-${idx}`}>
                            {call.priority}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground text-xs">{call.response}</td>
                        <td className="p-3">
                          {call.resolved === "Yes" ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" data-testid={`icon-resolved-${idx}`} />
                          ) : (
                            <XCircle className="w-4 h-4 text-amber-600" data-testid={`icon-unresolved-${idx}`} />
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
      </Tabs>
    </div>
  );
}
