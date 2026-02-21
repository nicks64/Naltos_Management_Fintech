import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AINudgeCard, AgentInsightStrip } from "@/components/ai-nudge-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  TrendingUp,
  Brain,
  Sparkles,
  Shield,
  Search,
  ArrowRight,
  CalendarDays,
  Mail,
  Phone,
  Home,
  CreditCard,
  UserCheck,
  ClipboardList,
  AlertTriangle,
  Eye,
  Star,
} from "lucide-react";

const agentInsights = [
  { text: "6 applications pending review", severity: "info" as const },
  { text: "Agent auto-scored 3 applications overnight", severity: "positive" as const },
  { text: "Background check complete for Martinez, J.", severity: "positive" as const },
];

const kpiCards = [
  { title: "Active Applications", value: "12", change: "+4 this week", icon: FileText, color: "text-blue-600" },
  { title: "Avg Processing Time", value: "3.2d", change: "-0.5 days", icon: Clock, color: "text-violet-600" },
  { title: "Approval Rate", value: "72%", change: "+3%", icon: CheckCircle2, color: "text-emerald-600" },
  { title: "Pending Screening", value: "4", change: "2 in progress", icon: Search, color: "text-orange-600" },
  { title: "This Month Approved", value: "8", change: "+2 vs last month", icon: UserCheck, color: "text-green-600" },
  { title: "Avg Credit Score", value: "712", change: "+8 pts", icon: CreditCard, color: "text-indigo-600" },
];

const pipelineStages = [
  {
    name: "Submitted",
    applications: [
      { name: "Carlos Mendez", unit: "3C", submitted: "Feb 20", incomeRatio: 3.1, risk: "Medium", missingDocs: 2 },
      { name: "Priya Sharma", unit: "7A", submitted: "Feb 21", incomeRatio: 4.5, risk: "Low", missingDocs: 0 },
    ],
  },
  {
    name: "Documents Pending",
    applications: [
      { name: "Jordan Williams", unit: "5D", submitted: "Feb 18", incomeRatio: 2.8, risk: "Medium", missingDocs: 3 },
      { name: "Aisha Mohamed", unit: "9F", submitted: "Feb 17", incomeRatio: 3.6, risk: "Low", missingDocs: 1 },
    ],
  },
  {
    name: "Screening",
    applications: [
      { name: "Sarah Chen", unit: "4B", submitted: "Feb 15", incomeRatio: 4.2, risk: "Low", missingDocs: 0 },
      { name: "Michael Torres", unit: "2B", submitted: "Feb 16", incomeRatio: 2.5, risk: "High", missingDocs: 0 },
    ],
  },
  {
    name: "Under Review",
    applications: [
      { name: "Emily Rodriguez", unit: "1A", submitted: "Feb 12", incomeRatio: 3.8, risk: "Low", missingDocs: 0 },
      { name: "James Park", unit: "6C", submitted: "Feb 13", incomeRatio: 2.9, risk: "Medium", missingDocs: 0 },
    ],
  },
  {
    name: "Decision",
    applications: [
      { name: "Rachel Green", unit: "8A", submitted: "Feb 10", incomeRatio: 3.5, risk: "Low", missingDocs: 0 },
      { name: "David Kim", unit: "5A", submitted: "Feb 11", incomeRatio: 2.1, risk: "High", missingDocs: 0 },
    ],
  },
];

const screeningResults = [
  { name: "Sarah Chen", unit: "4B", credit: 780, criminal: "Clear", eviction: "None", income: "Verified", references: "Positive", recommendation: "Approve", confidence: 0.96 },
  { name: "Emily Rodriguez", unit: "1A", credit: 745, criminal: "Clear", eviction: "None", income: "Verified", references: "Positive", recommendation: "Approve", confidence: 0.92 },
  { name: "James Park", unit: "6C", credit: 690, criminal: "Clear", eviction: "None", income: "Verified", references: "Mixed", recommendation: "Conditional", confidence: 0.74 },
  { name: "Michael Torres", unit: "2B", credit: 620, criminal: "Flagged", eviction: "1", income: "Pending", references: "Mixed", recommendation: "Deny", confidence: 0.82 },
  { name: "Rachel Green", unit: "8A", credit: 735, criminal: "Clear", eviction: "None", income: "Verified", references: "Positive", recommendation: "Approve", confidence: 0.89 },
  { name: "David Kim", unit: "5A", credit: 580, criminal: "Clear", eviction: "2+", income: "Failed", references: "Negative", recommendation: "Deny", confidence: 0.91 },
  { name: "Aisha Mohamed", unit: "9F", credit: 720, criminal: "Clear", eviction: "None", income: "Verified", references: "Positive", recommendation: "Approve", confidence: 0.88 },
  { name: "Jordan Williams", unit: "5D", credit: 665, criminal: "Clear", eviction: "None", income: "Pending", references: "Mixed", recommendation: "Conditional", confidence: 0.68 },
];

const approvedTenants = [
  { name: "Sarah Chen", unit: "4B", leaseStart: "Mar 1, 2026", deposit: "Paid", welcomePacket: true, keyPickup: "Feb 28", moveInInspection: "Feb 28" },
  { name: "Emily Rodriguez", unit: "1A", leaseStart: "Mar 1, 2026", deposit: "Paid", welcomePacket: true, keyPickup: "Feb 27", moveInInspection: "Feb 27" },
  { name: "Rachel Green", unit: "8A", leaseStart: "Mar 15, 2026", deposit: "Pending", welcomePacket: false, keyPickup: "Not Scheduled", moveInInspection: "Not Scheduled" },
  { name: "Aisha Mohamed", unit: "9F", leaseStart: "Apr 1, 2026", deposit: "Pending", welcomePacket: false, keyPickup: "Not Scheduled", moveInInspection: "Not Scheduled" },
  { name: "Marcus Rivera", unit: "5D", leaseStart: "Mar 1, 2026", deposit: "Paid", welcomePacket: true, keyPickup: "Feb 26", moveInInspection: "Feb 26" },
];

const waitlist = [
  { name: "Linda Park", type: "2 BR", dateAdded: "Jan 15, 2026", position: 1, contact: "Email", notes: "Flexible on move-in date" },
  { name: "Thomas Wright", type: "1 BR", dateAdded: "Jan 22, 2026", position: 2, contact: "Phone", notes: "Needs pet-friendly unit" },
  { name: "Sophie Martinez", type: "Studio", dateAdded: "Feb 1, 2026", position: 3, contact: "Email", notes: "Budget up to $1,500" },
  { name: "Ryan Chen", type: "3 BR", dateAdded: "Feb 5, 2026", position: 4, contact: "Phone", notes: "Family of 4, needs parking" },
  { name: "Natalie Brooks", type: "2 BR", dateAdded: "Feb 10, 2026", position: 5, contact: "Email", notes: "Relocating for work in April" },
  { name: "Omar Hassan", type: "1 BR", dateAdded: "Feb 14, 2026", position: 6, contact: "Phone", notes: "Current tenant referral" },
];

const riskConfig: Record<string, { color: string; bg: string }> = {
  Low: { color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  Medium: { color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30" },
  High: { color: "text-red-700 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30" },
};

const recConfig: Record<string, { variant: "default" | "secondary" | "destructive" }> = {
  Approve: { variant: "default" },
  Conditional: { variant: "secondary" },
  Deny: { variant: "destructive" },
};

const checkConfig: Record<string, { icon: typeof CheckCircle2; color: string }> = {
  Clear: { icon: CheckCircle2, color: "text-emerald-600" },
  Verified: { icon: CheckCircle2, color: "text-emerald-600" },
  Positive: { icon: CheckCircle2, color: "text-emerald-600" },
  None: { icon: CheckCircle2, color: "text-emerald-600" },
  Flagged: { icon: AlertTriangle, color: "text-red-600" },
  Failed: { icon: XCircle, color: "text-red-600" },
  Negative: { icon: XCircle, color: "text-red-600" },
  Pending: { icon: Clock, color: "text-amber-600" },
  Mixed: { icon: AlertCircle, color: "text-amber-600" },
  "1": { icon: AlertTriangle, color: "text-amber-600" },
  "2+": { icon: XCircle, color: "text-red-600" },
};

export default function Applications() {
  return (
    <div className="space-y-6" data-testid="page-applications">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-page-title">Applications & Screening</h1>
          <p className="text-muted-foreground">AI-powered tenant application and screening workflow</p>
        </div>
        <Badge variant="outline" className="text-xs" data-testid="badge-agent-status">
          <Brain className="w-3 h-3 mr-1 text-primary" />
          Agent Active
        </Badge>
      </div>

      <AgentInsightStrip insights={agentInsights} />

      <AINudgeCard
        title="Auto-Approval Recommendation"
        insight="Agent detected applicant Sarah Chen (Unit 4B) has excellent payment history across 3 prior rentals, 780 credit score, and income 4.2x rent. Auto-approval recommended with standard deposit."
        confidence={0.96}
        severity="positive"
        metric="96%"
        metricLabel="Approval Confidence"
        actionLabel="Approve Application"
        onAction={() => {}}
        secondaryLabel="Review Details"
        onSecondary={() => {}}
        icon={UserCheck}
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
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-green-600">{card.change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="pipeline" className="space-y-4">
        <TabsList data-testid="tabs-applications">
          <TabsTrigger value="pipeline" data-testid="tab-pipeline">Application Pipeline</TabsTrigger>
          <TabsTrigger value="screening" data-testid="tab-screening">Screening Results</TabsTrigger>
          <TabsTrigger value="approved" data-testid="tab-approved">Approved Tenants</TabsTrigger>
          <TabsTrigger value="waitlist" data-testid="tab-waitlist">Waitlist</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-4">
          <Card data-testid="card-application-pipeline">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <ClipboardList className="w-5 h-5 text-primary" />
                <CardTitle>Application Pipeline</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {pipelineStages.reduce((sum, s) => sum + s.applications.length, 0)} applications
                </Badge>
              </div>
              <CardDescription>Kanban-style application tracking with AI risk scoring across all stages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {pipelineStages.map((stage, stageIdx) => (
                  <div key={stage.name} className="space-y-2" data-testid={`column-stage-${stageIdx}`}>
                    <div className="flex items-center justify-between gap-1 px-1">
                      <span className="text-sm font-semibold">{stage.name}</span>
                      <Badge variant="secondary" className="text-[10px]">{stage.applications.length}</Badge>
                    </div>
                    <div className="space-y-2">
                      {stage.applications.map((app, appIdx) => (
                        <Card key={appIdx} className="hover-elevate" data-testid={`card-application-${stageIdx}-${appIdx}`}>
                          <CardContent className="p-3 space-y-2">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-sm font-medium truncate">{app.name}</span>
                              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${riskConfig[app.risk].bg} ${riskConfig[app.risk].color}`}>
                                {app.risk}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Home className="w-3 h-3" />
                              <span>Unit {app.unit}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{app.submitted}</span>
                              <span>{app.incomeRatio}x income</span>
                            </div>
                            {app.missingDocs > 0 && (
                              <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                                <AlertCircle className="w-3 h-3" />
                                <span>{app.missingDocs} docs missing</span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="screening" className="space-y-4">
          <Card data-testid="card-screening-results">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Shield className="w-5 h-5 text-primary" />
                <CardTitle>Screening Results</CardTitle>
                <Badge variant="outline" className="text-xs">
                  <Brain className="w-3 h-3 mr-1" />
                  Agent-Scored
                </Badge>
              </div>
              <CardDescription>Completed background screenings with AI recommendation engine</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-2 pr-3 font-medium text-muted-foreground">Applicant</th>
                      <th className="pb-2 pr-3 font-medium text-muted-foreground">Unit</th>
                      <th className="pb-2 pr-3 font-medium text-muted-foreground">Credit</th>
                      <th className="pb-2 pr-3 font-medium text-muted-foreground">Criminal</th>
                      <th className="pb-2 pr-3 font-medium text-muted-foreground">Eviction</th>
                      <th className="pb-2 pr-3 font-medium text-muted-foreground">Income</th>
                      <th className="pb-2 pr-3 font-medium text-muted-foreground">References</th>
                      <th className="pb-2 pr-3 font-medium text-muted-foreground">Recommendation</th>
                      <th className="pb-2 font-medium text-muted-foreground">Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {screeningResults.map((result, idx) => {
                      const CrimIcon = checkConfig[result.criminal]?.icon || AlertCircle;
                      const EvicIcon = checkConfig[result.eviction]?.icon || AlertCircle;
                      const IncIcon = checkConfig[result.income]?.icon || AlertCircle;
                      const RefIcon = checkConfig[result.references]?.icon || AlertCircle;
                      return (
                        <tr key={idx} className="border-b last:border-0" data-testid={`row-screening-${idx}`}>
                          <td className="py-2.5 pr-3 font-medium">{result.name}</td>
                          <td className="py-2.5 pr-3">{result.unit}</td>
                          <td className="py-2.5 pr-3">
                            <span className={`font-mono font-semibold ${result.credit >= 700 ? "text-emerald-600" : result.credit >= 620 ? "text-amber-600" : "text-red-600"}`}>
                              {result.credit}
                            </span>
                          </td>
                          <td className="py-2.5 pr-3">
                            <span className={`flex items-center gap-1 ${checkConfig[result.criminal]?.color}`}>
                              <CrimIcon className="w-3 h-3" />
                              {result.criminal}
                            </span>
                          </td>
                          <td className="py-2.5 pr-3">
                            <span className={`flex items-center gap-1 ${checkConfig[result.eviction]?.color}`}>
                              <EvicIcon className="w-3 h-3" />
                              {result.eviction}
                            </span>
                          </td>
                          <td className="py-2.5 pr-3">
                            <span className={`flex items-center gap-1 ${checkConfig[result.income]?.color}`}>
                              <IncIcon className="w-3 h-3" />
                              {result.income}
                            </span>
                          </td>
                          <td className="py-2.5 pr-3">
                            <span className={`flex items-center gap-1 ${checkConfig[result.references]?.color}`}>
                              <RefIcon className="w-3 h-3" />
                              {result.references}
                            </span>
                          </td>
                          <td className="py-2.5 pr-3">
                            <Badge variant={recConfig[result.recommendation]?.variant || "outline"} className="text-xs" data-testid={`badge-recommendation-${idx}`}>
                              {result.recommendation}
                            </Badge>
                          </td>
                          <td className="py-2.5">
                            <Badge variant="outline" className="text-xs">
                              {Math.round(result.confidence * 100)}%
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <Card data-testid="card-approved-tenants">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <UserCheck className="w-5 h-5 text-primary" />
                <CardTitle>Approved Tenants</CardTitle>
                <Badge variant="secondary" className="text-xs">{approvedTenants.length} ready for move-in</Badge>
              </div>
              <CardDescription>Recently approved tenants with move-in preparation tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {approvedTenants.map((tenant, idx) => (
                  <div key={idx} className="p-3 border rounded-lg space-y-2" data-testid={`card-approved-${idx}`}>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-medium">{tenant.name}</span>
                        <Badge variant="outline" className="text-xs">Unit {tenant.unit}</Badge>
                      </div>
                      <Badge variant={tenant.deposit === "Paid" ? "default" : "secondary"} className="text-xs">
                        Deposit: {tenant.deposit}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        Lease Start: {tenant.leaseStart}
                      </span>
                      <span className="flex items-center gap-1">
                        {tenant.welcomePacket ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
                        Welcome Packet {tenant.welcomePacket ? "Sent" : "Pending"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        {tenant.keyPickup !== "Not Scheduled" ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
                        Key Pickup: {tenant.keyPickup}
                      </span>
                      <span className="flex items-center gap-1">
                        {tenant.moveInInspection !== "Not Scheduled" ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
                        Move-in Inspection: {tenant.moveInInspection}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="waitlist" className="space-y-4">
          <Card data-testid="card-waitlist">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Users className="w-5 h-5 text-primary" />
                <CardTitle>Waitlist</CardTitle>
                <Badge variant="secondary" className="text-xs">{waitlist.length} applicants</Badge>
              </div>
              <CardDescription>Prospective applicants waiting for preferred unit availability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-2 pr-3 font-medium text-muted-foreground">Position</th>
                      <th className="pb-2 pr-3 font-medium text-muted-foreground">Name</th>
                      <th className="pb-2 pr-3 font-medium text-muted-foreground">Preferred Type</th>
                      <th className="pb-2 pr-3 font-medium text-muted-foreground">Date Added</th>
                      <th className="pb-2 pr-3 font-medium text-muted-foreground">Contact Pref</th>
                      <th className="pb-2 font-medium text-muted-foreground">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {waitlist.map((entry, idx) => (
                      <tr key={idx} className="border-b last:border-0" data-testid={`row-waitlist-${idx}`}>
                        <td className="py-2.5 pr-3">
                          <Badge variant="outline" className="text-xs font-mono">#{entry.position}</Badge>
                        </td>
                        <td className="py-2.5 pr-3 font-medium">{entry.name}</td>
                        <td className="py-2.5 pr-3">{entry.type}</td>
                        <td className="py-2.5 pr-3 text-muted-foreground">{entry.dateAdded}</td>
                        <td className="py-2.5 pr-3">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            {entry.contact === "Email" ? <Mail className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
                            {entry.contact}
                          </span>
                        </td>
                        <td className="py-2.5 text-muted-foreground text-xs">{entry.notes}</td>
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
