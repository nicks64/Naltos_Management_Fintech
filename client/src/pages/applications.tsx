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
import type { LeasingApplication, ApplicantWaitlistEntry } from "@shared/schema";

const agentInsights = [
  { text: "6 applications pending review", severity: "info" as const },
  { text: "Agent auto-scored 3 applications overnight", severity: "positive" as const },
  { text: "Background check complete for Martinez, J.", severity: "positive" as const },
];

const STAGE_ORDER = ["Submitted", "Documents Pending", "Screening", "Under Review", "Decision"];

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

function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "N/A";
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatShortDate(value: string | Date | null | undefined): string {
  if (!value) return "N/A";
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-1 pt-3 px-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-4 rounded" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <Skeleton className="h-6 w-12 mb-1" />
            <Skeleton className="h-3 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export default function Applications() {
  const { data: applications = [], isLoading: appsLoading, error: appsError } = useQuery<LeasingApplication[]>({
    queryKey: ['/api/applications'],
  });

  const { data: waitlistData = [], isLoading: waitlistLoading, error: waitlistError } = useQuery<ApplicantWaitlistEntry[]>({
    queryKey: ['/api/applications/waitlist'],
  });

  const pipelineStages = useMemo(() => {
    const grouped: Record<string, LeasingApplication[]> = {};
    for (const stage of STAGE_ORDER) {
      grouped[stage] = [];
    }
    for (const app of applications) {
      const stage = app.stage || "Submitted";
      if (!grouped[stage]) grouped[stage] = [];
      grouped[stage].push(app);
    }
    return STAGE_ORDER.map((name) => ({
      name,
      applications: grouped[name] || [],
    }));
  }, [applications]);

  const screeningResults = useMemo(() => {
    return applications.filter((app) => app.creditScore != null);
  }, [applications]);

  const approvedTenants = useMemo(() => {
    return applications.filter((app) => app.approved === true);
  }, [applications]);

  const kpiCards = useMemo(() => {
    const total = applications.length;
    const approvedCount = applications.filter((a) => a.approved).length;
    const withRec = applications.filter((a) => a.recommendation).length;
    const approvalRate = withRec > 0 ? Math.round((approvedCount / withRec) * 100) : 0;
    const pendingScreening = applications.filter((a) => a.stage === "Screening").length;
    const withCredit = applications.filter((a) => a.creditScore != null);
    const avgCredit = withCredit.length > 0
      ? Math.round(withCredit.reduce((sum, a) => sum + (a.creditScore || 0), 0) / withCredit.length)
      : 0;

    return [
      { title: "Active Applications", value: String(total), change: `${total} total`, icon: FileText, color: "text-blue-600" },
      { title: "Avg Processing Time", value: "3.2d", change: "-0.5 days", icon: Clock, color: "text-violet-600" },
      { title: "Approval Rate", value: `${approvalRate}%`, change: `${approvedCount} approved`, icon: CheckCircle2, color: "text-emerald-600" },
      { title: "Pending Screening", value: String(pendingScreening), change: `${pendingScreening} in queue`, icon: Search, color: "text-orange-600" },
      { title: "This Month Approved", value: String(approvedCount), change: `${approvedCount} approved`, icon: UserCheck, color: "text-green-600" },
      { title: "Avg Credit Score", value: avgCredit > 0 ? String(avgCredit) : "N/A", change: avgCredit > 0 ? "from screened" : "no data", icon: CreditCard, color: "text-indigo-600" },
    ];
  }, [applications]);

  const isLoading = appsLoading || waitlistLoading;
  const hasError = appsError || waitlistError;

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

      {hasError && (
        <Card className="border-destructive" data-testid="card-error">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Failed to load applications data. Please try again later.</span>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <KpiSkeleton />
      ) : (
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
      )}

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
                  {applications.length} applications
                </Badge>
              </div>
              <CardDescription>Kanban-style application tracking with AI risk scoring across all stages</CardDescription>
            </CardHeader>
            <CardContent>
              {appsLoading ? (
                <TableSkeleton rows={4} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {pipelineStages.map((stage, stageIdx) => (
                    <div key={stage.name} className="space-y-2" data-testid={`column-stage-${stageIdx}`}>
                      <div className="flex items-center justify-between gap-1 px-1">
                        <span className="text-sm font-semibold">{stage.name}</span>
                        <Badge variant="secondary" className="text-[10px]">{stage.applications.length}</Badge>
                      </div>
                      <div className="space-y-2">
                        {stage.applications.map((app, appIdx) => {
                          const risk = app.risk || "Medium";
                          const riskStyle = riskConfig[risk] || riskConfig["Medium"];
                          return (
                            <Card key={app.id} className="hover-elevate" data-testid={`card-application-${stageIdx}-${appIdx}`}>
                              <CardContent className="p-3 space-y-2">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-sm font-medium truncate" data-testid={`text-applicant-name-${app.id}`}>{app.applicantName}</span>
                                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${riskStyle.bg} ${riskStyle.color}`}>
                                    {risk}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Home className="w-3 h-3" />
                                  <span data-testid={`text-unit-${app.id}`}>Unit {app.unitNumber}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span data-testid={`text-submitted-${app.id}`}>{formatShortDate(app.submittedAt)}</span>
                                  <span>{app.incomeRatio ? `${Number(app.incomeRatio).toFixed(1)}x income` : ""}</span>
                                </div>
                                {(app.missingDocs ?? 0) > 0 && (
                                  <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                                    <AlertCircle className="w-3 h-3" />
                                    <span>{app.missingDocs} docs missing</span>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
              {appsLoading ? (
                <TableSkeleton rows={6} />
              ) : (
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
                        const criminal = result.criminal || "Pending";
                        const eviction = result.eviction || "None";
                        const income = result.incomeVerified || "Pending";
                        const references = result.referencesStatus || "Pending";
                        const recommendation = result.recommendation || "Pending";
                        const confidence = result.confidence ? Number(result.confidence) : 0;

                        const CrimIcon = checkConfig[criminal]?.icon || AlertCircle;
                        const EvicIcon = checkConfig[eviction]?.icon || AlertCircle;
                        const IncIcon = checkConfig[income]?.icon || AlertCircle;
                        const RefIcon = checkConfig[references]?.icon || AlertCircle;
                        return (
                          <tr key={result.id} className="border-b last:border-0" data-testid={`row-screening-${idx}`}>
                            <td className="py-2.5 pr-3 font-medium" data-testid={`text-screening-name-${result.id}`}>{result.applicantName}</td>
                            <td className="py-2.5 pr-3" data-testid={`text-screening-unit-${result.id}`}>{result.unitNumber}</td>
                            <td className="py-2.5 pr-3">
                              <span className={`font-mono font-semibold ${(result.creditScore || 0) >= 700 ? "text-emerald-600" : (result.creditScore || 0) >= 620 ? "text-amber-600" : "text-red-600"}`} data-testid={`text-credit-score-${result.id}`}>
                                {result.creditScore}
                              </span>
                            </td>
                            <td className="py-2.5 pr-3">
                              <span className={`flex items-center gap-1 ${checkConfig[criminal]?.color || ""}`}>
                                <CrimIcon className="w-3 h-3" />
                                {criminal}
                              </span>
                            </td>
                            <td className="py-2.5 pr-3">
                              <span className={`flex items-center gap-1 ${checkConfig[eviction]?.color || ""}`}>
                                <EvicIcon className="w-3 h-3" />
                                {eviction}
                              </span>
                            </td>
                            <td className="py-2.5 pr-3">
                              <span className={`flex items-center gap-1 ${checkConfig[income]?.color || ""}`}>
                                <IncIcon className="w-3 h-3" />
                                {income}
                              </span>
                            </td>
                            <td className="py-2.5 pr-3">
                              <span className={`flex items-center gap-1 ${checkConfig[references]?.color || ""}`}>
                                <RefIcon className="w-3 h-3" />
                                {references}
                              </span>
                            </td>
                            <td className="py-2.5 pr-3">
                              <Badge variant={recConfig[recommendation]?.variant || "outline"} className="text-xs" data-testid={`badge-recommendation-${idx}`}>
                                {recommendation}
                              </Badge>
                            </td>
                            <td className="py-2.5">
                              <Badge variant="outline" className="text-xs" data-testid={`badge-confidence-${idx}`}>
                                {Math.round(confidence * 100)}%
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                      {screeningResults.length === 0 && (
                        <tr>
                          <td colSpan={9} className="py-8 text-center text-muted-foreground">No screening results available</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
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
              {appsLoading ? (
                <TableSkeleton rows={4} />
              ) : (
                <div className="space-y-3">
                  {approvedTenants.map((tenant, idx) => {
                    const deposit = tenant.depositStatus || "Pending";
                    const keyPickup = tenant.keyPickup || "Not Scheduled";
                    const moveInInspection = tenant.moveInInspection || "Not Scheduled";
                    return (
                      <div key={tenant.id} className="p-3 border rounded-lg space-y-2" data-testid={`card-approved-${idx}`}>
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm font-medium" data-testid={`text-approved-name-${tenant.id}`}>{tenant.applicantName}</span>
                            <Badge variant="outline" className="text-xs">Unit {tenant.unitNumber}</Badge>
                          </div>
                          <Badge variant={deposit === "Paid" ? "default" : "secondary"} className="text-xs" data-testid={`badge-deposit-${tenant.id}`}>
                            Deposit: {deposit}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" />
                            Lease Start: {formatDate(tenant.leaseStart)}
                          </span>
                          <span className="flex items-center gap-1">
                            {tenant.welcomePacket ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
                            Welcome Packet {tenant.welcomePacket ? "Sent" : "Pending"}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            {keyPickup !== "Not Scheduled" ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
                            Key Pickup: {keyPickup}
                          </span>
                          <span className="flex items-center gap-1">
                            {moveInInspection !== "Not Scheduled" ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
                            Move-in Inspection: {moveInInspection}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {approvedTenants.length === 0 && (
                    <div className="py-8 text-center text-muted-foreground" data-testid="text-no-approved">No approved tenants</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="waitlist" className="space-y-4">
          <Card data-testid="card-waitlist">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Users className="w-5 h-5 text-primary" />
                <CardTitle>Waitlist</CardTitle>
                <Badge variant="secondary" className="text-xs">{waitlistData.length} applicants</Badge>
              </div>
              <CardDescription>Prospective applicants waiting for preferred unit availability</CardDescription>
            </CardHeader>
            <CardContent>
              {waitlistLoading ? (
                <TableSkeleton rows={5} />
              ) : (
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
                      {waitlistData.map((entry, idx) => (
                        <tr key={entry.id} className="border-b last:border-0" data-testid={`row-waitlist-${idx}`}>
                          <td className="py-2.5 pr-3">
                            <Badge variant="outline" className="text-xs font-mono" data-testid={`badge-position-${entry.id}`}>#{entry.position}</Badge>
                          </td>
                          <td className="py-2.5 pr-3 font-medium" data-testid={`text-waitlist-name-${entry.id}`}>{entry.applicantName}</td>
                          <td className="py-2.5 pr-3" data-testid={`text-waitlist-type-${entry.id}`}>{entry.unitType}</td>
                          <td className="py-2.5 pr-3 text-muted-foreground" data-testid={`text-waitlist-date-${entry.id}`}>{formatDate(entry.dateAdded)}</td>
                          <td className="py-2.5 pr-3">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              {entry.contact === "Email" ? <Mail className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
                              {entry.contact}
                            </span>
                          </td>
                          <td className="py-2.5 text-muted-foreground text-xs" data-testid={`text-waitlist-notes-${entry.id}`}>{entry.notes}</td>
                        </tr>
                      ))}
                      {waitlistData.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-muted-foreground">No waitlist entries</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
