import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AINudgeCard, AgentInsightStrip } from "@/components/ai-nudge-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
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

function LoadingSkeleton() {
  return (
    <div className="space-y-6" data-testid="loading-skeleton">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-1 pt-3 px-3">
              <Skeleton className="h-3 w-24" />
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <Skeleton className="h-6 w-16 mb-1" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <Card className="border-destructive" data-testid="error-state">
      <CardContent className="flex items-center gap-3 p-6">
        <AlertTriangle className="w-5 h-5 text-destructive" />
        <div>
          <p className="font-medium text-destructive">Failed to load data</p>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PestControl() {
  const [severityFilter, setSeverityFilter] = useState("all");
  const [pestTypeFilter, setPestTypeFilter] = useState("all");

  const { data: treatments = [], isLoading: loadingTreatments, error: errorTreatments } = useQuery<any[]>({
    queryKey: ['/api/pest-control/treatments'],
  });

  const { data: reports = [], isLoading: loadingReports, error: errorReports } = useQuery<any[]>({
    queryKey: ['/api/pest-control/reports'],
  });

  const { data: history = [], isLoading: loadingHistory, error: errorHistory } = useQuery<any[]>({
    queryKey: ['/api/pest-control/history'],
  });

  const { data: vendorsData = [], isLoading: loadingVendors, error: errorVendors } = useQuery<any[]>({
    queryKey: ['/api/pest-control/vendors'],
  });

  const { data: prevention = [], isLoading: loadingPrevention, error: errorPrevention } = useQuery<any[]>({
    queryKey: ['/api/pest-control/prevention'],
  });

  const isLoading = loadingTreatments || loadingReports || loadingHistory || loadingVendors || loadingPrevention;
  const hasError = errorTreatments || errorReports || errorHistory || errorVendors || errorPrevention;

  const kpiCards = useMemo(() => {
    const activeReportsCount = reports.length;
    const scheduledTreatmentsCount = treatments.filter((t: any) => t.status === "Scheduled").length;
    const avgEffectiveness = prevention.length > 0
      ? (prevention.reduce((sum: number, p: any) => sum + parseFloat(p.effectiveness || "0"), 0) / prevention.length).toFixed(1)
      : "0";
    const recurringIssuesCount = history.filter((h: any) => h.recurring === true).length;

    return [
      { title: "Active Reports", value: String(activeReportsCount), icon: Bug },
      { title: "Scheduled Treatments", value: String(scheduledTreatmentsCount), icon: Calendar },
      { title: "Avg Effectiveness", value: `${avgEffectiveness}/5`, icon: ShieldCheck },
      { title: "Recurring Issues", value: String(recurringIssuesCount), icon: AlertTriangle },
    ];
  }, [reports, treatments, prevention, history]);

  const filteredReports = useMemo(() => {
    return reports.filter((report: any) => {
      if (severityFilter !== "all" && report.severity !== severityFilter) return false;
      if (pestTypeFilter !== "all" && report.pestType !== pestTypeFilter) return false;
      return true;
    });
  }, [reports, severityFilter, pestTypeFilter]);

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

      {isLoading ? (
        <LoadingSkeleton />
      ) : hasError ? (
        <ErrorState message={(errorTreatments || errorReports || errorHistory || errorVendors || errorPrevention)?.message || "An unexpected error occurred"} />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {kpiCards.map((card, index) => (
              <Card key={card.title} className="hover-elevate" data-testid={`card-kpi-${index}`}>
                <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-1 pt-3 px-3">
                  <CardTitle className="text-xs font-medium text-muted-foreground">{card.title}</CardTitle>
                  <card.icon className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="px-3 pb-3">
                  <div className="text-xl font-mono tabular-nums font-semibold" data-testid={`text-kpi-value-${index}`}>{card.value}</div>
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
                    <Badge variant="secondary" className="text-xs">{treatments.length} scheduled</Badge>
                  </div>
                  <CardDescription>Scheduled pest control treatments with tenant notification tracking</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="p-3 font-medium text-muted-foreground">Date</th>
                          <th className="p-3 font-medium text-muted-foreground">Unit</th>
                          <th className="p-3 font-medium text-muted-foreground">Type</th>
                          <th className="p-3 font-medium text-muted-foreground">Pest Type</th>
                          <th className="p-3 font-medium text-muted-foreground">Vendor</th>
                          <th className="p-3 font-medium text-muted-foreground">Status</th>
                          <th className="p-3 font-medium text-muted-foreground">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {treatments.map((item: any, idx: number) => (
                          <tr key={item.id || idx} className="border-b last:border-0" data-testid={`row-treatment-${idx}`}>
                            <td className="p-3 text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                {item.date}
                              </div>
                            </td>
                            <td className="p-3 font-medium">
                              <div className="flex items-center gap-1.5">
                                <Building className="w-3.5 h-3.5 text-muted-foreground" />
                                {item.unit}
                              </div>
                            </td>
                            <td className="p-3">
                              <Badge variant={treatmentTypeVariant[item.type] || "outline"} className="text-xs" data-testid={`badge-treatment-type-${idx}`}>
                                {item.type}
                              </Badge>
                            </td>
                            <td className="p-3">{item.pestType}</td>
                            <td className="p-3 text-muted-foreground">{item.vendor}</td>
                            <td className="p-3">
                              <Badge variant={item.status === "Scheduled" ? "outline" : item.status === "Completed" ? "secondary" : "default"} className="text-xs" data-testid={`badge-status-${idx}`}>
                                {item.status}
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
                        {filteredReports.map((report: any, idx: number) => (
                          <tr key={report.id || idx} className="border-b last:border-0 hover-elevate" data-testid={`row-report-${idx}`}>
                            <td className="p-3 font-medium">{report.unit}</td>
                            <td className="p-3 text-muted-foreground">{report.tenant}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-1.5">
                                <Bug className="w-3.5 h-3.5 text-muted-foreground" />
                                {report.pestType}
                              </div>
                            </td>
                            <td className="p-3">
                              <Badge variant={severityVariant[report.severity] || "outline"} className="text-xs" data-testid={`badge-severity-${idx}`}>
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
                              {report.followUpNeeded ? (
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
                        {history.map((record: any, idx: number) => (
                          <tr key={record.id || idx} className="border-b last:border-0" data-testid={`row-history-${idx}`}>
                            <td className="p-3 font-medium">{record.unit}</td>
                            <td className="p-3 text-muted-foreground">{record.date}</td>
                            <td className="p-3">
                              <Badge variant={treatmentTypeVariant[record.type] || "outline"} className="text-xs" data-testid={`badge-history-type-${idx}`}>
                                {record.type}
                              </Badge>
                            </td>
                            <td className="p-3">{record.pestType}</td>
                            <td className="p-3">
                              <Badge variant={resultVariant[record.result] || "outline"} className="text-xs" data-testid={`badge-result-${idx}`}>
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
                    <Badge variant="secondary" className="text-xs">{vendorsData.length} vendors</Badge>
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
                        {vendorsData.map((vendor: any, idx: number) => (
                          <tr key={vendor.id || idx} className="border-b last:border-0 hover-elevate" data-testid={`row-vendor-${idx}`}>
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
                  {prevention.map((program: any, idx: number) => (
                    <div key={program.id || idx} className="p-4 border rounded-lg space-y-3" data-testid={`card-prevention-${idx}`}>
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
        </>
      )}
    </div>
  );
}
