import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AINudgeCard, AgentInsightStrip } from "@/components/ai-nudge-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const agentInsights = [
  { text: "3 active security incidents require attention", severity: "critical" as const },
  { text: "Night patrol coverage at 94% this month", severity: "positive" as const, confidence: 0.92 },
  { text: "2 fire inspections due within 30 days", severity: "warning" as const },
];

const kpiCards = [
  { title: "Active Incidents", value: "3", change: "+1 this week", trend: "warning", icon: ShieldAlert },
  { title: "Monthly Incidents", value: "12", change: "-3 vs last month", trend: "positive", icon: Shield },
  { title: "Camera Uptime", value: "98.5%", change: "+0.3%", trend: "positive", icon: Camera },
  { title: "Fire Inspection Due", value: "2", change: "within 30 days", trend: "warning", icon: Flame },
];

const incidentReports = [
  { id: "INC-301", date: "Feb 19, 2026", type: "Theft", location: "Parking Garage B2", reportedBy: "R. Martinez", severity: "High", status: "Open", assignedTo: "Officer Chen" },
  { id: "INC-300", date: "Feb 18, 2026", type: "Vandalism", location: "Building A Lobby", reportedBy: "Front Desk", severity: "Medium", status: "Investigating", assignedTo: "Officer Patel" },
  { id: "INC-299", date: "Feb 17, 2026", type: "Noise", location: "Unit 5C", reportedBy: "T. Johnson", severity: "Low", status: "Resolved", assignedTo: "Officer Davis" },
  { id: "INC-298", date: "Feb 16, 2026", type: "Trespass", location: "Pool Area", reportedBy: "Camera Alert", severity: "High", status: "Investigating", assignedTo: "Officer Chen" },
  { id: "INC-297", date: "Feb 15, 2026", type: "Medical", location: "Unit 8A", reportedBy: "K. Williams", severity: "Critical", status: "Closed", assignedTo: "EMS / Officer Patel" },
  { id: "INC-296", date: "Feb 14, 2026", type: "Fire Alarm", location: "Building B Floor 3", reportedBy: "System Alert", severity: "High", status: "Resolved", assignedTo: "Officer Davis" },
  { id: "INC-295", date: "Feb 13, 2026", type: "Suspicious Activity", location: "Parking Garage B1", reportedBy: "M. Garcia", severity: "Medium", status: "Closed", assignedTo: "Officer Chen" },
];

const patrolLogs = [
  { officer: "Officer Chen", dateTime: "Feb 19, 10:00 PM", route: "Perimeter Loop", areasChecked: "Parking, Entrances, Pool", findings: "All clear", duration: "45 min" },
  { officer: "Officer Patel", dateTime: "Feb 19, 6:00 PM", route: "Interior Sweep", areasChecked: "Lobbies, Hallways, Stairwells", findings: "Broken light in B stairwell", duration: "55 min" },
  { officer: "Officer Davis", dateTime: "Feb 19, 2:00 AM", route: "Night Watch", areasChecked: "Full Property", findings: "All clear", duration: "60 min" },
  { officer: "Officer Chen", dateTime: "Feb 18, 10:00 PM", route: "Perimeter Loop", areasChecked: "Parking, Entrances, Pool", findings: "Unlocked gate at pool", duration: "50 min" },
  { officer: "Officer Patel", dateTime: "Feb 18, 6:00 PM", route: "Interior Sweep", areasChecked: "Lobbies, Hallways, Stairwells", findings: "All clear", duration: "48 min" },
  { officer: "Officer Davis", dateTime: "Feb 18, 2:00 AM", route: "Night Watch", areasChecked: "Full Property", findings: "Suspicious vehicle reported, verified resident guest", duration: "65 min" },
];

const cameraSystems = [
  { cameraId: "CAM-001", location: "Main Entrance", status: "Online", lastMaintenance: "Jan 15, 2026", recordingStatus: "Recording", storageDays: 30 },
  { cameraId: "CAM-002", location: "Parking Garage B1", status: "Online", lastMaintenance: "Jan 15, 2026", recordingStatus: "Recording", storageDays: 30 },
  { cameraId: "CAM-003", location: "Parking Garage B2", status: "Offline", lastMaintenance: "Dec 20, 2025", recordingStatus: "Not Recording", storageDays: 0 },
  { cameraId: "CAM-004", location: "Pool Area", status: "Online", lastMaintenance: "Jan 20, 2026", recordingStatus: "Recording", storageDays: 30 },
  { cameraId: "CAM-005", location: "Building A Lobby", status: "Online", lastMaintenance: "Jan 15, 2026", recordingStatus: "Recording", storageDays: 30 },
  { cameraId: "CAM-006", location: "Building B Lobby", status: "Maintenance", lastMaintenance: "Feb 10, 2026", recordingStatus: "Not Recording", storageDays: 15 },
  { cameraId: "CAM-007", location: "Rear Exit", status: "Online", lastMaintenance: "Jan 18, 2026", recordingStatus: "Recording", storageDays: 30 },
];

const fireSafety = [
  { type: "Extinguisher", location: "Building A Floor 1", lastInspection: "Nov 10, 2025", nextDue: "May 10, 2026", result: "Pass", certifyingAuthority: "FireSafe Inspections" },
  { type: "Sprinkler", location: "Building A", lastInspection: "Sep 15, 2025", nextDue: "Mar 15, 2026", result: "Pass", certifyingAuthority: "National Fire Systems" },
  { type: "Alarm", location: "Building B", lastInspection: "Oct 1, 2025", nextDue: "Apr 1, 2026", result: "Pass", certifyingAuthority: "FireSafe Inspections" },
  { type: "Exit Sign", location: "Building A Floor 3", lastInspection: "Jan 5, 2026", nextDue: "Jul 5, 2026", result: "Pass", certifyingAuthority: "City Fire Marshal" },
  { type: "Standpipe", location: "Building B", lastInspection: "Aug 20, 2025", nextDue: "Feb 20, 2026", result: "Needs Repair", certifyingAuthority: "National Fire Systems" },
  { type: "Extinguisher", location: "Parking Garage", lastInspection: "Dec 1, 2025", nextDue: "Jun 1, 2026", result: "Pass", certifyingAuthority: "FireSafe Inspections" },
  { type: "Sprinkler", location: "Building B", lastInspection: "Jul 10, 2025", nextDue: "Jan 10, 2026", result: "Overdue", certifyingAuthority: "National Fire Systems" },
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
  Pass: "secondary",
  "Needs Repair": "outline",
  Overdue: "destructive",
};

const priorityVariant: Record<string, "destructive" | "outline" | "secondary"> = {
  Critical: "destructive",
  High: "destructive",
  Medium: "outline",
  Low: "secondary",
};

export default function Safety() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  const filteredIncidents = incidentReports.filter((inc) => {
    if (statusFilter !== "all" && inc.status !== statusFilter) return false;
    if (severityFilter !== "all" && inc.severity !== severityFilter) return false;
    return true;
  });

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
                      <th className="p-3 font-medium text-muted-foreground">Assigned To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIncidents.map((inc, idx) => (
                      <tr key={inc.id} className="border-b last:border-0 hover-elevate" data-testid={`row-incident-${idx}`}>
                        <td className="p-3 font-mono text-xs">{inc.id}</td>
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
                          <Badge variant={severityVariant[inc.severity]} className="text-xs" data-testid={`badge-severity-${idx}`}>
                            {inc.severity}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant={statusVariant[inc.status]} className="text-xs" data-testid={`badge-status-${idx}`}>
                            {inc.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">{inc.assignedTo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patrols" className="space-y-4">
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
                      <th className="p-3 font-medium text-muted-foreground">Date/Time</th>
                      <th className="p-3 font-medium text-muted-foreground">Route</th>
                      <th className="p-3 font-medium text-muted-foreground">Areas Checked</th>
                      <th className="p-3 font-medium text-muted-foreground">Findings</th>
                      <th className="p-3 font-medium text-muted-foreground">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patrolLogs.map((log, idx) => (
                      <tr key={idx} className="border-b last:border-0" data-testid={`row-patrol-${idx}`}>
                        <td className="p-3 font-medium">{log.officer}</td>
                        <td className="p-3 text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {log.dateTime}
                          </div>
                        </td>
                        <td className="p-3">{log.route}</td>
                        <td className="p-3 text-muted-foreground">{log.areasChecked}</td>
                        <td className="p-3">
                          <span className={log.findings === "All clear" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>
                            {log.findings}
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground">{log.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cameras" className="space-y-4">
          <Card data-testid="card-camera-systems">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Camera className="w-5 h-5 text-primary" />
                <CardTitle>Camera System Inventory</CardTitle>
                <Badge variant="secondary" className="text-xs">{cameraSystems.filter(c => c.status === "Online").length}/{cameraSystems.length} Online</Badge>
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
                      <th className="p-3 font-medium text-muted-foreground">Status</th>
                      <th className="p-3 font-medium text-muted-foreground">Last Maintenance</th>
                      <th className="p-3 font-medium text-muted-foreground">Recording</th>
                      <th className="p-3 font-medium text-muted-foreground">Storage (Days)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cameraSystems.map((cam, idx) => (
                      <tr key={cam.cameraId} className="border-b last:border-0" data-testid={`row-camera-${idx}`}>
                        <td className="p-3 font-mono text-xs">{cam.cameraId}</td>
                        <td className="p-3 font-medium">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                            {cam.location}
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant={cameraStatusVariant[cam.status]} className="text-xs" data-testid={`badge-camera-status-${idx}`}>
                            {cam.status === "Online" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {cam.status === "Offline" && <XCircle className="w-3 h-3 mr-1" />}
                            {cam.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">{cam.lastMaintenance}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <Radio className={`w-3.5 h-3.5 ${cam.recordingStatus === "Recording" ? "text-emerald-600" : "text-red-600"}`} />
                            <span className={cam.recordingStatus === "Recording" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                              {cam.recordingStatus}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground">{cam.storageDays}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fire" className="space-y-4">
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
                      <th className="p-3 font-medium text-muted-foreground">Type</th>
                      <th className="p-3 font-medium text-muted-foreground">Location</th>
                      <th className="p-3 font-medium text-muted-foreground">Last Inspection</th>
                      <th className="p-3 font-medium text-muted-foreground">Next Due</th>
                      <th className="p-3 font-medium text-muted-foreground">Result</th>
                      <th className="p-3 font-medium text-muted-foreground">Certifying Authority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fireSafety.map((item, idx) => (
                      <tr key={idx} className="border-b last:border-0" data-testid={`row-fire-${idx}`}>
                        <td className="p-3 font-medium">{item.type}</td>
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
                            {item.nextDue}
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant={fireResultVariant[item.result]} className="text-xs" data-testid={`badge-fire-result-${idx}`}>
                            {item.result === "Pass" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {item.result === "Needs Repair" && <AlertTriangle className="w-3 h-3 mr-1" />}
                            {item.result === "Overdue" && <XCircle className="w-3 h-3 mr-1" />}
                            {item.result}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">{item.certifyingAuthority}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
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