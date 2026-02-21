import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AINudgeCard, AgentInsightStrip } from "@/components/ai-nudge-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Bug,
  Calendar,
  Brain,
  AlertTriangle,
  TrendingUp,
  Activity,
  Target,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  ShieldCheck,
  Building,
  Users,
  Star,
  ClipboardList,
  Bell,
  FileText,
  type LucideIcon,
} from "lucide-react";

const agentInsights = [
  { text: "8 treatments scheduled this week across 3 properties", severity: "info" as const },
  { text: "Roach activity trending up 40% in Building B", severity: "warning" as const, confidence: 0.85 },
  { text: "Prevention programs 87% effective this quarter", severity: "positive" as const },
];

const kpiCards = [
  { title: "Scheduled Treatments", value: "8", change: "+2 this week", trend: "warning", icon: Calendar },
  { title: "Active Reports", value: "6", change: "-1 vs last week", trend: "positive", icon: Bug },
  { title: "Monthly Cost", value: "$3,200", change: "-$400", trend: "positive", icon: DollarSign },
  { title: "Prevention Score", value: "87%", change: "+3%", trend: "positive", icon: ShieldCheck },
];

const treatmentSchedule = [
  { date: "Feb 22, 2026", property: "Building A", type: "Routine", pestType: "General", vendor: "GreenShield Pest", unitsAffected: "All units", notificationStatus: "Sent" },
  { date: "Feb 23, 2026", property: "Building B Floor 2", type: "Targeted", pestType: "Roach", vendor: "GreenShield Pest", unitsAffected: "Units 2A-2F", notificationStatus: "Sent" },
  { date: "Feb 24, 2026", property: "Building B Floor 3", type: "Targeted", pestType: "Roach", vendor: "GreenShield Pest", unitsAffected: "Units 3A-3F", notificationStatus: "Pending" },
  { date: "Feb 25, 2026", property: "Building B Floor 4", type: "Targeted", pestType: "Roach", vendor: "GreenShield Pest", unitsAffected: "Units 4A-4D", notificationStatus: "Pending" },
  { date: "Feb 26, 2026", property: "Building C", type: "Routine", pestType: "General", vendor: "PestAway Pro", unitsAffected: "All units", notificationStatus: "Not Sent" },
  { date: "Mar 1, 2026", property: "Building A Unit 6B", type: "Emergency", pestType: "Bed Bug", vendor: "BedBug Specialists", unitsAffected: "6B, 6A, 7B", notificationStatus: "Sent" },
  { date: "Mar 3, 2026", property: "Building D", type: "Routine", pestType: "Rodent", vendor: "PestAway Pro", unitsAffected: "Common areas", notificationStatus: "Not Sent" },
];

const activeReports = [
  { unit: "2C", tenant: "M. Rodriguez", pestType: "Roach", severity: "High", reportedDate: "Feb 17, 2026", treatmentScheduled: "Feb 23, 2026", followUpNeeded: "Yes" },
  { unit: "3A", tenant: "J. Thompson", pestType: "Roach", severity: "Medium", reportedDate: "Feb 16, 2026", treatmentScheduled: "Feb 24, 2026", followUpNeeded: "Yes" },
  { unit: "6B", tenant: "S. Patel", pestType: "Bed Bug", severity: "Critical", reportedDate: "Feb 18, 2026", treatmentScheduled: "Mar 1, 2026", followUpNeeded: "Yes" },
  { unit: "4B", tenant: "K. Lee", pestType: "Ant", severity: "Low", reportedDate: "Feb 15, 2026", treatmentScheduled: "Feb 25, 2026", followUpNeeded: "No" },
  { unit: "3D", tenant: "R. Garcia", pestType: "Roach", severity: "Medium", reportedDate: "Feb 14, 2026", treatmentScheduled: "Feb 24, 2026", followUpNeeded: "Yes" },
  { unit: "8A", tenant: "T. Wilson", pestType: "Rodent", severity: "High", reportedDate: "Feb 19, 2026", treatmentScheduled: "Feb 22, 2026", followUpNeeded: "Yes" },
];

const unitHistory = [
  { unit: "2C", date: "Jan 15, 2026", type: "Targeted", pestType: "Roach", result: "Partial", notes: "Re-treatment recommended in 30 days", recurring: true },
  { unit: "2C", date: "Dec 10, 2025", type: "Targeted", pestType: "Roach", result: "Partial", notes: "Ongoing roach activity, baits placed", recurring: true },
  { unit: "6B", date: "Feb 5, 2026", type: "Inspection", pestType: "Bed Bug", result: "Confirmed", notes: "Bed bugs confirmed, heat treatment scheduled", recurring: false },
  { unit: "3A", date: "Jan 20, 2026", type: "Routine", pestType: "General", result: "Clear", notes: "No activity found during routine inspection", recurring: false },
  { unit: "8A", date: "Jan 8, 2026", type: "Targeted", pestType: "Rodent", result: "Resolved", notes: "Entry points sealed, traps removed", recurring: false },
  { unit: "4B", date: "Feb 1, 2026", type: "Targeted", pestType: "Ant", result: "Resolved", notes: "Perimeter treatment applied", recurring: false },
  { unit: "5C", date: "Dec 20, 2025", type: "Emergency", pestType: "Termite", result: "Resolved", notes: "Localized treatment, structural inspection passed", recurring: false },
];

const vendors = [
  { company: "GreenShield Pest", contractType: "Full Service", serviceArea: "Buildings A, B", responseTimeSla: "24 hours", satisfactionRating: 4.5, contractExpiry: "Dec 31, 2026", monthlyCost: "$1,800" },
  { company: "PestAway Pro", contractType: "Routine Only", serviceArea: "Buildings C, D", responseTimeSla: "48 hours", satisfactionRating: 4.2, contractExpiry: "Jun 30, 2026", monthlyCost: "$900" },
  { company: "BedBug Specialists", contractType: "On-Call", serviceArea: "All Properties", responseTimeSla: "12 hours", satisfactionRating: 4.8, contractExpiry: "Mar 31, 2027", monthlyCost: "$350" },
  { company: "TermiGuard Inc.", contractType: "Annual Inspection", serviceArea: "All Properties", responseTimeSla: "72 hours", satisfactionRating: 4.0, contractExpiry: "Sep 30, 2026", monthlyCost: "$150" },
  { company: "EcoSafe Solutions", contractType: "Consulting", serviceArea: "All Properties", responseTimeSla: "5 business days", satisfactionRating: 4.6, contractExpiry: "Dec 31, 2026", monthlyCost: "$0" },
];

const preventionPrograms = [
  { programName: "Quarterly Perimeter Treatment", type: "Exterior Barrier", frequency: "Quarterly", lastService: "Jan 15, 2026", nextService: "Apr 15, 2026", coverage: 95, effectiveness: 4.3 },
  { programName: "Monthly Common Area Spray", type: "Interior Prevention", frequency: "Monthly", lastService: "Feb 1, 2026", nextService: "Mar 1, 2026", coverage: 100, effectiveness: 4.1 },
  { programName: "Rodent Bait Station Program", type: "Rodent Control", frequency: "Bi-Weekly", lastService: "Feb 10, 2026", nextService: "Feb 24, 2026", coverage: 88, effectiveness: 4.5 },
  { programName: "Trash Area Sanitation", type: "Sanitation", frequency: "Weekly", lastService: "Feb 17, 2026", nextService: "Feb 24, 2026", coverage: 100, effectiveness: 3.9 },
  { programName: "Annual Termite Inspection", type: "Structural", frequency: "Annual", lastService: "Oct 1, 2025", nextService: "Oct 1, 2026", coverage: 100, effectiveness: 4.7 },
  { programName: "Drain Line Treatment", type: "Interior Prevention", frequency: "Quarterly", lastService: "Dec 15, 2025", nextService: "Mar 15, 2026", coverage: 75, effectiveness: 3.8 },
];

const severityVariant: Record<string, "destructive" | "outline" | "secondary"> = {
  Critical: "destructive",
  High: "destructive",
  Medium: "outline",
  Low: "secondary",
};

const treatmentTypeVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  Routine: "secondary",
  Targeted: "default",
  Emergency: "destructive",
  Inspection: "outline",
};

const notificationVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  Sent: "secondary",
  Pending: "outline",
  "Not Sent": "destructive",
};

const resultVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  Clear: "secondary",
  Resolved: "secondary",
  Partial: "outline",
  Confirmed: "destructive",
};

export default function PestControl() {
  const [severityFilter, setSeverityFilter] = useState("all");
  const [pestTypeFilter, setPestTypeFilter] = useState("all");

  const filteredReports = activeReports.filter((report) => {
    if (severityFilter !== "all" && report.severity !== severityFilter) return false;
    if (pestTypeFilter !== "all" && report.pestType !== pestTypeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6" data-testid="page-pest-control">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-page-title">Pest Control Management</h1>
          <p className="text-muted-foreground">Treatment scheduling, vendor coordination, and prevention programs</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs" data-testid="badge-agent-status">
            <Brain className="w-3 h-3 mr-1 text-primary" />
            Agent Active
          </Badge>
          <Button size="sm" data-testid="button-new-report">
            <Bug className="w-3 h-3 mr-1" />
            New Pest Report
          </Button>
        </div>
      </div>

      <AgentInsightStrip insights={agentInsights} />

      <AINudgeCard
        title="Pest Activity Cluster Detected"
        insight="Agent detected a cluster of roach reports in Building B, floors 2-4 over the past 30 days. Unit-by-unit treatment is costing $180/unit. Recommend building-wide treatment at $1,200 total (vs. $2,160 for individual treatments). Building-wide approach also provides 85% better long-term efficacy."
        confidence={0.91}
        severity="warning"
        icon={Target}
        actionLabel="Schedule Building Treatment"
        onAction={() => {}}
        secondaryLabel="View Pattern Analysis"
        onSecondary={() => {}}
        metric="$960 savings"
        metricLabel="Est. Cost Savings"
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

      <Tabs defaultValue="schedule" className="space-y-4">
        <TabsList data-testid="tabs-pest-control">
          <TabsTrigger value="schedule" data-testid="tab-schedule">Treatment Schedule</TabsTrigger>
          <TabsTrigger value="reports" data-testid="tab-reports">Active Reports</TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">Unit History</TabsTrigger>
          <TabsTrigger value="vendors" data-testid="tab-vendors">Vendor Management</TabsTrigger>
          <TabsTrigger value="prevention" data-testid="tab-prevention">Prevention Programs</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-4">
          <Card data-testid="card-treatment-schedule">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Calendar className="w-5 h-5 text-primary" />
                <CardTitle>Upcoming Treatments</CardTitle>
                <Badge variant="secondary" className="text-xs">{treatmentSchedule.length} scheduled</Badge>
              </div>
              <CardDescription>Scheduled pest control treatments with tenant notification tracking</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Date</th>
                      <th className="p-3 font-medium text-muted-foreground">Property/Building</th>
                      <th className="p-3 font-medium text-muted-foreground">Type</th>
                      <th className="p-3 font-medium text-muted-foreground">Pest Type</th>
                      <th className="p-3 font-medium text-muted-foreground">Vendor</th>
                      <th className="p-3 font-medium text-muted-foreground">Units Affected</th>
                      <th className="p-3 font-medium text-muted-foreground">Notification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {treatmentSchedule.map((item, idx) => (
                      <tr key={idx} className="border-b last:border-0" data-testid={`row-treatment-${idx}`}>
                        <td className="p-3 text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {item.date}
                          </div>
                        </td>
                        <td className="p-3 font-medium">
                          <div className="flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-muted-foreground" />
                            {item.property}
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant={treatmentTypeVariant[item.type]} className="text-xs" data-testid={`badge-treatment-type-${idx}`}>
                            {item.type}
                          </Badge>
                        </td>
                        <td className="p-3">{item.pestType}</td>
                        <td className="p-3 text-muted-foreground">{item.vendor}</td>
                        <td className="p-3 text-muted-foreground text-xs">{item.unitsAffected}</td>
                        <td className="p-3">
                          <Badge variant={notificationVariant[item.notificationStatus]} className="text-xs" data-testid={`badge-notification-${idx}`}>
                            {item.notificationStatus === "Sent" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {item.notificationStatus === "Pending" && <Clock className="w-3 h-3 mr-1" />}
                            {item.notificationStatus === "Not Sent" && <Bell className="w-3 h-3 mr-1" />}
                            {item.notificationStatus}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filters:</span>
            </div>
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
            <Select value={pestTypeFilter} onValueChange={setPestTypeFilter}>
              <SelectTrigger className="w-[160px]" data-testid="select-pest-type-filter">
                <SelectValue placeholder="Pest Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Roach">Roach</SelectItem>
                <SelectItem value="Rodent">Rodent</SelectItem>
                <SelectItem value="Bed Bug">Bed Bug</SelectItem>
                <SelectItem value="Ant">Ant</SelectItem>
                <SelectItem value="Termite">Termite</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="secondary" className="text-xs" data-testid="badge-filtered-count">
              {filteredReports.length} reports
            </Badge>
          </div>

          <Card data-testid="card-active-reports">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Unit</th>
                      <th className="p-3 font-medium text-muted-foreground">Tenant</th>
                      <th className="p-3 font-medium text-muted-foreground">Pest Type</th>
                      <th className="p-3 font-medium text-muted-foreground">Severity</th>
                      <th className="p-3 font-medium text-muted-foreground">Reported</th>
                      <th className="p-3 font-medium text-muted-foreground">Treatment Scheduled</th>
                      <th className="p-3 font-medium text-muted-foreground">Follow-Up</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map((report, idx) => (
                      <tr key={idx} className="border-b last:border-0 hover-elevate" data-testid={`row-report-${idx}`}>
                        <td className="p-3 font-medium">{report.unit}</td>
                        <td className="p-3 text-muted-foreground">{report.tenant}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <Bug className="w-3.5 h-3.5 text-muted-foreground" />
                            {report.pestType}
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant={severityVariant[report.severity]} className="text-xs" data-testid={`badge-severity-${idx}`}>
                            {report.severity}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">{report.reportedDate}</td>
                        <td className="p-3 text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {report.treatmentScheduled}
                          </div>
                        </td>
                        <td className="p-3">
                          {report.followUpNeeded === "Yes" ? (
                            <Badge variant="outline" className="text-xs" data-testid={`badge-followup-${idx}`}>
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Needed
                            </Badge>
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" data-testid={`icon-no-followup-${idx}`} />
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

        <TabsContent value="history" className="space-y-4">
          <Card data-testid="card-unit-history">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <FileText className="w-5 h-5 text-primary" />
                <CardTitle>Unit Treatment History</CardTitle>
                <Badge variant="secondary" className="text-xs">All Records</Badge>
              </div>
              <CardDescription>Historical treatment records by unit with results and recurring flags</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Unit</th>
                      <th className="p-3 font-medium text-muted-foreground">Date</th>
                      <th className="p-3 font-medium text-muted-foreground">Type</th>
                      <th className="p-3 font-medium text-muted-foreground">Pest Type</th>
                      <th className="p-3 font-medium text-muted-foreground">Result</th>
                      <th className="p-3 font-medium text-muted-foreground">Notes</th>
                      <th className="p-3 font-medium text-muted-foreground">Recurring</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unitHistory.map((record, idx) => (
                      <tr key={idx} className="border-b last:border-0" data-testid={`row-history-${idx}`}>
                        <td className="p-3 font-medium">{record.unit}</td>
                        <td className="p-3 text-muted-foreground">{record.date}</td>
                        <td className="p-3">
                          <Badge variant={treatmentTypeVariant[record.type] || "outline"} className="text-xs" data-testid={`badge-history-type-${idx}`}>
                            {record.type}
                          </Badge>
                        </td>
                        <td className="p-3">{record.pestType}</td>
                        <td className="p-3">
                          <Badge variant={resultVariant[record.result]} className="text-xs" data-testid={`badge-result-${idx}`}>
                            {record.result}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground text-xs max-w-[200px] truncate">{record.notes}</td>
                        <td className="p-3">
                          {record.recurring ? (
                            <Badge variant="destructive" className="text-xs" data-testid={`badge-recurring-${idx}`}>
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Recurring
                            </Badge>
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" data-testid={`icon-not-recurring-${idx}`} />
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

        <TabsContent value="vendors" className="space-y-4">
          <Card data-testid="card-vendor-management">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Users className="w-5 h-5 text-primary" />
                <CardTitle>Pest Control Vendors</CardTitle>
                <Badge variant="secondary" className="text-xs">{vendors.length} vendors</Badge>
              </div>
              <CardDescription>Vendor contracts, service areas, and performance ratings</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Company</th>
                      <th className="p-3 font-medium text-muted-foreground">Contract Type</th>
                      <th className="p-3 font-medium text-muted-foreground">Service Area</th>
                      <th className="p-3 font-medium text-muted-foreground">Response SLA</th>
                      <th className="p-3 font-medium text-muted-foreground">Rating</th>
                      <th className="p-3 font-medium text-muted-foreground">Contract Expiry</th>
                      <th className="p-3 font-medium text-muted-foreground">Monthly Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.map((vendor, idx) => (
                      <tr key={idx} className="border-b last:border-0 hover-elevate" data-testid={`row-vendor-${idx}`}>
                        <td className="p-3 font-medium">{vendor.company}</td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-xs" data-testid={`badge-contract-${idx}`}>
                            {vendor.contractType}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground text-xs">{vendor.serviceArea}</td>
                        <td className="p-3 text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {vendor.responseTimeSla}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-500" />
                            <span className="font-medium" data-testid={`text-rating-${idx}`}>{vendor.satisfactionRating}</span>
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground">{vendor.contractExpiry}</td>
                        <td className="p-3 font-medium" data-testid={`text-vendor-cost-${idx}`}>{vendor.monthlyCost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prevention" className="space-y-4">
          <Card data-testid="card-prevention-programs">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <CardTitle>Prevention Programs</CardTitle>
                <Badge variant="secondary" className="text-xs">Agent-Monitored</Badge>
              </div>
              <CardDescription>Building-wide prevention programs with coverage and effectiveness tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {preventionPrograms.map((program, idx) => (
                <div key={idx} className="p-4 border rounded-lg space-y-3" data-testid={`card-prevention-${idx}`}>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-semibold">{program.programName}</span>
                      <Badge variant="outline" className="text-xs">{program.type}</Badge>
                      <Badge variant="secondary" className="text-xs">{program.frequency}</Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-sm font-medium" data-testid={`text-effectiveness-${idx}`}>{program.effectiveness}/5</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      Last: {program.lastService}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      Next: {program.nextService}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Coverage</span>
                      <span className="font-medium">{program.coverage}%</span>
                    </div>
                    <Progress value={program.coverage} className="h-2" data-testid={`progress-coverage-${idx}`} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}