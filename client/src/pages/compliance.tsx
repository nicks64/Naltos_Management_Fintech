import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AINudgeCard, AgentInsightStrip } from "@/components/ai-nudge-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  FileText,
  Gavel,
  AlertTriangle,
  Brain,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  ClipboardCheck,
  Scale,
  Building2,
  Flame,
  Leaf,
  Users,
  Accessibility,
  TrendingUp,
  Eye,
  Send,
  Search,
  Target,
  type LucideIcon,
} from "lucide-react";

const agentInsights = [
  { text: "2 ADA inspection deadlines within 14 days", severity: "critical" as const },
  { text: "Eviction case #EV-2024 hearing scheduled Feb 28", severity: "warning" as const, confidence: 0.95 },
  { text: "Fair housing audit passed - all units compliant", severity: "positive" as const },
];

const kpiCards = [
  { title: "Active Cases", value: "8", change: "+2 this month", trend: "warning", icon: Gavel },
  { title: "Pending Notices", value: "5", change: "-1 vs last week", trend: "positive", icon: FileText },
  { title: "Compliance Score", value: "94%", change: "+2%", trend: "positive", icon: Shield },
  { title: "Upcoming Deadlines", value: "3", change: "Next: Feb 28", trend: "warning", icon: Clock },
];

const complianceAreas = [
  { area: "Fair Housing", icon: Users, status: "Compliant", lastAudit: "Jan 15, 2026", nextAudit: "Jul 15, 2026", issues: 0 },
  { area: "ADA Compliance", icon: Accessibility, status: "Action Needed", lastAudit: "Nov 20, 2025", nextAudit: "Feb 28, 2026", issues: 2 },
  { area: "Fire Code", icon: Flame, status: "Compliant", lastAudit: "Dec 10, 2025", nextAudit: "Jun 10, 2026", issues: 0 },
  { area: "Building Code", icon: Building2, status: "Under Review", lastAudit: "Oct 5, 2025", nextAudit: "Apr 5, 2026", issues: 1 },
  { area: "Environmental", icon: Leaf, status: "Compliant", lastAudit: "Jan 22, 2026", nextAudit: "Jul 22, 2026", issues: 0 },
  { area: "Tenant Rights", icon: Scale, status: "Compliant", lastAudit: "Feb 1, 2026", nextAudit: "Aug 1, 2026", issues: 0 },
];

const evictionCases = [
  { id: "EV-2024", tenant: "Marcus Rivera", unit: "4B", reason: "Non-Payment", filingDate: "Jan 28, 2026", courtDate: "Feb 28, 2026", attorney: "J. Thompson", status: "Hearing Scheduled" },
  { id: "EV-2023", tenant: "Diana Foster", unit: "7A", reason: "Lease Violation", filingDate: "Jan 15, 2026", courtDate: "Mar 5, 2026", attorney: "J. Thompson", status: "Filed" },
  { id: "EV-2022", tenant: "Robert Chen", unit: "2C", reason: "Non-Payment", filingDate: "Dec 20, 2025", courtDate: "Feb 10, 2026", attorney: "S. Patel", status: "Judgment" },
  { id: "EV-2021", tenant: "Lisa Adams", unit: "5D", reason: "Unauthorized Occupant", filingDate: "Dec 5, 2025", courtDate: "Jan 30, 2026", attorney: "S. Patel", status: "Writ Issued" },
  { id: "EV-2020", tenant: "Kevin Brooks", unit: "3A", reason: "Non-Payment", filingDate: "Jan 10, 2026", courtDate: "—", attorney: "J. Thompson", status: "Notice Served" },
  { id: "EV-2019", tenant: "Sandra Mitchell", unit: "8C", reason: "Property Damage", filingDate: "Feb 1, 2026", courtDate: "—", attorney: "S. Patel", status: "Notice Served" },
];

const legalNotices = [
  { id: "LN-3041", type: "Pay or Quit", tenant: "Kevin Brooks", unit: "3A", servedDate: "Jan 10, 2026", responseDeadline: "Jan 13, 2026", status: "Expired" },
  { id: "LN-3042", type: "Cure or Quit", tenant: "Diana Foster", unit: "7A", servedDate: "Jan 5, 2026", responseDeadline: "Jan 19, 2026", status: "Expired" },
  { id: "LN-3043", type: "Lease Termination", tenant: "Lisa Adams", unit: "5D", servedDate: "Nov 30, 2025", responseDeadline: "Dec 30, 2025", status: "Expired" },
  { id: "LN-3044", type: "Non-Renewal", tenant: "Angela Price", unit: "6B", servedDate: "Feb 10, 2026", responseDeadline: "Mar 10, 2026", status: "Pending" },
  { id: "LN-3045", type: "Entry Notice", tenant: "James Wilson", unit: "1D", servedDate: "Feb 18, 2026", responseDeadline: "Feb 20, 2026", status: "Delivered" },
  { id: "LN-3046", type: "Pay or Quit", tenant: "Sandra Mitchell", unit: "8C", servedDate: "Feb 1, 2026", responseDeadline: "Feb 4, 2026", status: "Expired" },
  { id: "LN-3047", type: "Cure or Quit", tenant: "Marcus Rivera", unit: "4B", servedDate: "Jan 20, 2026", responseDeadline: "Feb 3, 2026", status: "Expired" },
];

const regulatoryInspections = [
  { id: "RI-401", type: "Fire Safety", inspector: "City Fire Marshal", date: "Jan 18, 2026", result: "Pass", violations: 0, correctionDeadline: "—" },
  { id: "RI-402", type: "ADA Compliance", inspector: "HUD Inspector", date: "Feb 28, 2026", result: "Pending", violations: 0, correctionDeadline: "—" },
  { id: "RI-403", type: "Building Code", inspector: "City Building Dept.", date: "Oct 12, 2025", result: "Fail", violations: 2, correctionDeadline: "Mar 15, 2026" },
  { id: "RI-404", type: "Health & Safety", inspector: "County Health Dept.", date: "Dec 5, 2025", result: "Pass", violations: 0, correctionDeadline: "—" },
  { id: "RI-405", type: "Elevator Cert.", inspector: "State Elevator Board", date: "Nov 22, 2025", result: "Pass", violations: 0, correctionDeadline: "—" },
  { id: "RI-406", type: "Lead Paint", inspector: "EPA Inspector", date: "Mar 10, 2026", result: "Pending", violations: 0, correctionDeadline: "—" },
];

const fairHousingData = {
  trainings: [
    { staff: "Maria Santos", role: "Property Manager", completedDate: "Jan 5, 2026", expiresDate: "Jan 5, 2027", status: "Current" },
    { staff: "Brian Cooper", role: "Leasing Agent", completedDate: "Dec 12, 2025", expiresDate: "Dec 12, 2026", status: "Current" },
    { staff: "Tina Nguyen", role: "Leasing Agent", completedDate: "Feb 1, 2026", expiresDate: "Feb 1, 2027", status: "Current" },
    { staff: "Derek Hall", role: "Maintenance Lead", completedDate: "Aug 15, 2025", expiresDate: "Aug 15, 2026", status: "Current" },
    { staff: "Amy Rodriguez", role: "Assistant Manager", completedDate: "Nov 1, 2025", expiresDate: "Nov 1, 2026", status: "Current" },
  ],
  complaints: [
    { id: "FH-101", date: "Jan 22, 2026", complainant: "Anonymous", basis: "Disability", description: "Denied reasonable accommodation request for service animal", status: "Under Investigation", resolution: "—" },
    { id: "FH-100", date: "Nov 10, 2025", complainant: "T. Johnson", basis: "Familial Status", description: "Alleged steering away from ground-floor units", status: "Resolved", resolution: "Policy update and retraining completed" },
  ],
  lastPolicyReview: "Jan 15, 2026",
  nextPolicyReview: "Jul 15, 2026",
  lastAuditResult: "Pass",
  lastAuditDate: "Jan 15, 2026",
};

const evictionStatusVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  "Notice Served": "outline",
  "Filed": "default",
  "Hearing Scheduled": "outline",
  "Judgment": "destructive",
  "Writ Issued": "destructive",
};

const noticeStatusVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  "Pending": "outline",
  "Delivered": "default",
  "Expired": "secondary",
  "Responded": "default",
};

const inspectionResultVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  "Pass": "secondary",
  "Fail": "destructive",
  "Pending": "outline",
};

const areaStatusVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  "Compliant": "secondary",
  "Action Needed": "destructive",
  "Under Review": "outline",
};

export default function Compliance() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="space-y-6" data-testid="page-compliance">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-page-title">Compliance & Legal</h1>
          <p className="text-muted-foreground">Fair housing, eviction tracking, legal notices, and regulatory compliance</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs" data-testid="badge-agent-status">
            <Brain className="w-3 h-3 mr-1 text-primary" />
            Agent Active
          </Badge>
          <Button size="sm" data-testid="button-generate-notice">
            <FileText className="w-3 h-3 mr-1" />
            Generate Notice
          </Button>
        </div>
      </div>

      <AgentInsightStrip insights={agentInsights} />

      <AINudgeCard
        title="ADA Inspection Deadline Approaching"
        insight="2 units (4B, 7A) are overdue for ADA accessibility inspection. City deadline is Feb 28, 2026. Non-compliance may result in fines up to $75,000 per violation. Recommend scheduling inspector immediately."
        confidence={0.96}
        severity="critical"
        icon={AlertTriangle}
        actionLabel="Schedule Inspection"
        onAction={() => {}}
        secondaryLabel="View Requirements"
        onSecondary={() => {}}
        metric="$150K"
        metricLabel="Potential Fine Exposure"
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList data-testid="tabs-compliance">
          <TabsTrigger value="dashboard" data-testid="tab-dashboard">Compliance Dashboard</TabsTrigger>
          <TabsTrigger value="evictions" data-testid="tab-evictions">Eviction Tracking</TabsTrigger>
          <TabsTrigger value="notices" data-testid="tab-notices">Legal Notices</TabsTrigger>
          <TabsTrigger value="inspections" data-testid="tab-inspections">Regulatory Inspections</TabsTrigger>
          <TabsTrigger value="fair-housing" data-testid="tab-fair-housing">Fair Housing</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {complianceAreas.map((area, idx) => {
              const AreaIcon = area.icon;
              return (
                <Card key={area.area} className="hover-elevate" data-testid={`card-compliance-area-${idx}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <AreaIcon className="w-5 h-5 text-primary" />
                        <CardTitle className="text-sm">{area.area}</CardTitle>
                      </div>
                      <Badge variant={areaStatusVariant[area.status]} className="text-xs" data-testid={`badge-area-status-${idx}`}>
                        {area.status === "Compliant" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {area.status === "Action Needed" && <XCircle className="w-3 h-3 mr-1" />}
                        {area.status === "Under Review" && <Eye className="w-3 h-3 mr-1" />}
                        {area.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Last Audit</span>
                        <p className="font-medium">{area.lastAudit}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Next Audit</span>
                        <p className="font-medium">{area.nextAudit}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Open Issues</span>
                      <span className={`font-semibold ${area.issues > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`} data-testid={`text-issues-${idx}`}>
                        {area.issues}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="evictions" className="space-y-4">
          <Card data-testid="card-eviction-tracking">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Gavel className="w-5 h-5 text-primary" />
                <CardTitle>Active Eviction Cases</CardTitle>
                <Badge variant="secondary" className="text-xs">{evictionCases.length} cases</Badge>
              </div>
              <CardDescription>Track eviction proceedings from notice through writ execution</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Case ID</th>
                      <th className="p-3 font-medium text-muted-foreground">Tenant</th>
                      <th className="p-3 font-medium text-muted-foreground">Unit</th>
                      <th className="p-3 font-medium text-muted-foreground">Reason</th>
                      <th className="p-3 font-medium text-muted-foreground">Filing Date</th>
                      <th className="p-3 font-medium text-muted-foreground">Court Date</th>
                      <th className="p-3 font-medium text-muted-foreground">Attorney</th>
                      <th className="p-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evictionCases.map((ec, idx) => (
                      <tr key={ec.id} className="border-b last:border-0 hover-elevate" data-testid={`row-eviction-${idx}`}>
                        <td className="p-3 font-mono text-xs">{ec.id}</td>
                        <td className="p-3 font-medium">{ec.tenant}</td>
                        <td className="p-3">{ec.unit}</td>
                        <td className="p-3 text-muted-foreground">{ec.reason}</td>
                        <td className="p-3 text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {ec.filingDate}
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground">{ec.courtDate}</td>
                        <td className="p-3 text-muted-foreground">{ec.attorney}</td>
                        <td className="p-3">
                          <Badge variant={evictionStatusVariant[ec.status]} className="text-xs" data-testid={`badge-eviction-status-${idx}`}>
                            {ec.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-eviction-timeline">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Eviction Process Timeline</CardTitle>
              <CardDescription>Standard eviction workflow stages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-1">
                {["Notice Served", "Filed", "Hearing Scheduled", "Judgment", "Writ Issued"].map((step, i) => (
                  <div
                    key={step}
                    className="flex-1 text-center text-[10px] py-1.5 rounded-md border bg-muted/30 border-muted text-muted-foreground"
                    data-testid={`timeline-step-${i}`}
                  >
                    {step}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notices" className="space-y-4">
          <Card data-testid="card-legal-notices">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <Send className="w-5 h-5 text-primary" />
                  <CardTitle>Legal Notice Tracking</CardTitle>
                  <Badge variant="secondary" className="text-xs">{legalNotices.length} notices</Badge>
                </div>
                <Button size="sm" data-testid="button-new-notice">
                  <FileText className="w-3 h-3 mr-1" />
                  New Notice
                </Button>
              </div>
              <CardDescription>Generate, serve, and track legal notices with automated deadline monitoring</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">ID</th>
                      <th className="p-3 font-medium text-muted-foreground">Type</th>
                      <th className="p-3 font-medium text-muted-foreground">Tenant</th>
                      <th className="p-3 font-medium text-muted-foreground">Unit</th>
                      <th className="p-3 font-medium text-muted-foreground">Served Date</th>
                      <th className="p-3 font-medium text-muted-foreground">Response Deadline</th>
                      <th className="p-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {legalNotices.map((notice, idx) => (
                      <tr key={notice.id} className="border-b last:border-0 hover-elevate" data-testid={`row-notice-${idx}`}>
                        <td className="p-3 font-mono text-xs">{notice.id}</td>
                        <td className="p-3 font-medium">{notice.type}</td>
                        <td className="p-3">{notice.tenant}</td>
                        <td className="p-3">{notice.unit}</td>
                        <td className="p-3 text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {notice.servedDate}
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground">{notice.responseDeadline}</td>
                        <td className="p-3">
                          <Badge variant={noticeStatusVariant[notice.status]} className="text-xs" data-testid={`badge-notice-status-${idx}`}>
                            {notice.status}
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

        <TabsContent value="inspections" className="space-y-4">
          <Card data-testid="card-regulatory-inspections">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <ClipboardCheck className="w-5 h-5 text-primary" />
                <CardTitle>Regulatory Inspection Schedule</CardTitle>
                <Badge variant="secondary" className="text-xs">Agent-Monitored</Badge>
              </div>
              <CardDescription>City and regulatory inspection tracking with violation management</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">ID</th>
                      <th className="p-3 font-medium text-muted-foreground">Type</th>
                      <th className="p-3 font-medium text-muted-foreground">Inspector</th>
                      <th className="p-3 font-medium text-muted-foreground">Date</th>
                      <th className="p-3 font-medium text-muted-foreground">Result</th>
                      <th className="p-3 font-medium text-muted-foreground">Violations</th>
                      <th className="p-3 font-medium text-muted-foreground">Correction Deadline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {regulatoryInspections.map((insp, idx) => (
                      <tr key={insp.id} className="border-b last:border-0 hover-elevate" data-testid={`row-inspection-${idx}`}>
                        <td className="p-3 font-mono text-xs">{insp.id}</td>
                        <td className="p-3 font-medium">{insp.type}</td>
                        <td className="p-3 text-muted-foreground">{insp.inspector}</td>
                        <td className="p-3 text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {insp.date}
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant={inspectionResultVariant[insp.result]} className="text-xs" data-testid={`badge-inspection-result-${idx}`}>
                            {insp.result === "Pass" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {insp.result === "Fail" && <XCircle className="w-3 h-3 mr-1" />}
                            {insp.result === "Pending" && <Clock className="w-3 h-3 mr-1" />}
                            {insp.result}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <span className={insp.violations > 0 ? "text-red-600 dark:text-red-400 font-medium" : "text-muted-foreground"} data-testid={`text-violations-${idx}`}>
                            {insp.violations}
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground">{insp.correctionDeadline}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fair-housing" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card data-testid="card-fh-audit">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <CardTitle className="text-sm">Audit Status</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last Audit</span>
                  <span className="font-medium">{fairHousingData.lastAuditDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Result</span>
                  <Badge variant="secondary" className="text-xs" data-testid="badge-fh-audit-result">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {fairHousingData.lastAuditResult}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="card-fh-policy">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <CardTitle className="text-sm">Policy Review</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last Review</span>
                  <span className="font-medium">{fairHousingData.lastPolicyReview}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Next Review</span>
                  <span className="font-medium">{fairHousingData.nextPolicyReview}</span>
                </div>
              </CardContent>
            </Card>
            <Card data-testid="card-fh-complaints">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-primary" />
                  <CardTitle className="text-sm">Complaints</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Open</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400" data-testid="text-fh-open-complaints">1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Resolved (12mo)</span>
                  <span className="font-medium" data-testid="text-fh-resolved-complaints">1</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card data-testid="card-fh-training">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Users className="w-5 h-5 text-primary" />
                <CardTitle>Staff Training Status</CardTitle>
                <Badge variant="secondary" className="text-xs">All Current</Badge>
              </div>
              <CardDescription>Fair housing training compliance for all property staff</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Staff Member</th>
                      <th className="p-3 font-medium text-muted-foreground">Role</th>
                      <th className="p-3 font-medium text-muted-foreground">Completed</th>
                      <th className="p-3 font-medium text-muted-foreground">Expires</th>
                      <th className="p-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fairHousingData.trainings.map((t, idx) => (
                      <tr key={idx} className="border-b last:border-0" data-testid={`row-training-${idx}`}>
                        <td className="p-3 font-medium">{t.staff}</td>
                        <td className="p-3 text-muted-foreground">{t.role}</td>
                        <td className="p-3 text-muted-foreground">{t.completedDate}</td>
                        <td className="p-3 text-muted-foreground">{t.expiresDate}</td>
                        <td className="p-3">
                          <Badge variant="secondary" className="text-xs" data-testid={`badge-training-status-${idx}`}>
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {t.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-fh-complaints-detail">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Search className="w-5 h-5 text-primary" />
                <CardTitle>Complaint Investigations</CardTitle>
                <Badge variant="secondary" className="text-xs">{fairHousingData.complaints.length} records</Badge>
              </div>
              <CardDescription>Fair housing complaint tracking and investigation status</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">ID</th>
                      <th className="p-3 font-medium text-muted-foreground">Date</th>
                      <th className="p-3 font-medium text-muted-foreground">Complainant</th>
                      <th className="p-3 font-medium text-muted-foreground">Basis</th>
                      <th className="p-3 font-medium text-muted-foreground">Description</th>
                      <th className="p-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fairHousingData.complaints.map((c, idx) => (
                      <tr key={c.id} className="border-b last:border-0" data-testid={`row-complaint-${idx}`}>
                        <td className="p-3 font-mono text-xs">{c.id}</td>
                        <td className="p-3 text-muted-foreground">{c.date}</td>
                        <td className="p-3">{c.complainant}</td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-xs">{c.basis}</Badge>
                        </td>
                        <td className="p-3 text-muted-foreground max-w-[200px] truncate">{c.description}</td>
                        <td className="p-3">
                          <Badge variant={c.status === "Resolved" ? "secondary" : "outline"} className="text-xs" data-testid={`badge-complaint-status-${idx}`}>
                            {c.status}
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
      </Tabs>
    </div>
  );
}