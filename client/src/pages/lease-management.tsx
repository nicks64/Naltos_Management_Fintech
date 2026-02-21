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
  CalendarDays,
  TrendingUp,
  Brain,
  AlertTriangle,
  Target,
  Users,
  DollarSign,
  CheckCircle2,
  XCircle,
  Timer,
  RefreshCw,
  ShieldAlert,
  Ban,
  Banknote,
  ArrowUpRight,
  Send,
  type LucideIcon,
} from "lucide-react";

const agentInsights = [
  { text: "18 leases expiring within 30 days", severity: "warning" as const },
  { text: "5 renewal offers pending tenant response", severity: "critical" as const },
  { text: "3 active lease violations require follow-up", severity: "warning" as const, confidence: 0.92 },
];

const depositDispositions = [
  { tenant: "Tom Harris", unit: "2B", moveOut: "Feb 10, 2026", deposit: 2400, deductions: 350, refund: 2050, status: "Processing", reason: "Carpet cleaning, wall repair" },
  { tenant: "Nina Gonzalez", unit: "5A", moveOut: "Feb 5, 2026", deposit: 1800, deductions: 0, refund: 1800, status: "Refunded", reason: "No deductions" },
  { tenant: "Chris Taylor", unit: "4C", moveOut: "Feb 1, 2026", deposit: 2200, deductions: 875, refund: 1325, status: "Disputed", reason: "Broken blinds, paint damage, appliance repair" },
  { tenant: "Emily White", unit: "7A", moveOut: "Jan 28, 2026", deposit: 2000, deductions: 150, refund: 1850, status: "Refunded", reason: "Minor cleaning fee" },
  { tenant: "Derek Adams", unit: "1D", moveOut: "Jan 25, 2026", deposit: 1900, deductions: 1200, refund: 700, status: "Processing", reason: "Smoke damage, deep clean, lock replacement" },
  { tenant: "Sophie Lee", unit: "8C", moveOut: "Jan 20, 2026", deposit: 2100, deductions: 0, refund: 2100, status: "Refunded", reason: "No deductions" },
];

const leaseStatusVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  Active: "default",
  active: "default",
  "Month-to-Month": "outline",
  "month-to-month": "outline",
  "Notice Given": "destructive",
  "notice given": "destructive",
  Expired: "secondary",
  expired: "secondary",
};

const violationSeverityVariant: Record<string, "destructive" | "outline" | "secondary"> = {
  Critical: "destructive",
  critical: "destructive",
  High: "destructive",
  high: "destructive",
  Medium: "outline",
  medium: "outline",
  Low: "secondary",
  low: "secondary",
};

const violationStatusVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  Open: "outline",
  open: "outline",
  Investigating: "default",
  investigating: "default",
  "Warning Issued": "secondary",
  "warning issued": "secondary",
  Escalated: "destructive",
  escalated: "destructive",
  Resolved: "secondary",
  resolved: "secondary",
};

const depositStatusVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  Processing: "outline",
  Refunded: "secondary",
  Disputed: "destructive",
};

const renewalOfferVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  "Not Sent": "outline",
  "not sent": "outline",
  Sent: "default",
  sent: "default",
  Accepted: "secondary",
  accepted: "secondary",
  Pending: "outline",
  pending: "outline",
  Declined: "destructive",
  declined: "destructive",
};

const increaseStatusVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  Scheduled: "outline",
  scheduled: "outline",
  Pending: "outline",
  pending: "outline",
  Acknowledged: "default",
  acknowledged: "default",
  Accepted: "secondary",
  accepted: "secondary",
};

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "--";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function capitalize(str: string | null | undefined): string {
  if (!str) return "--";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getAiScore(prob: number | null | undefined): string {
  if (prob == null) return "Low";
  if (prob >= 0.7) return "High";
  if (prob >= 0.5) return "Medium";
  return "Low";
}

function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="p-3 space-y-3" data-testid="skeleton-table">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function LeaseManagement() {
  const { data: leases = [], isLoading: leasesLoading, error: leasesError } = useQuery<any[]>({
    queryKey: ['/api/leases'],
  });

  const { data: violationsData = [], isLoading: violationsLoading, error: violationsError } = useQuery<any[]>({
    queryKey: ['/api/lease-violations'],
  });

  const renewals = leases.filter((l: any) => l.renewalOfferStatus != null);
  const rentIncreases = leases.filter((l: any) => l.rentIncreaseStatus != null);

  const activeCount = leases.length;
  const expiringCount = leases.filter((l: any) => {
    if (!l.endDate) return false;
    const end = new Date(l.endDate);
    const now = new Date();
    const diffDays = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 30;
  }).length;
  const pendingRenewals = renewals.length;
  const avgTermMonths = leases.length > 0
    ? (leases.reduce((sum: number, l: any) => {
        if (!l.startDate || !l.endDate) return sum;
        const start = new Date(l.startDate);
        const end = new Date(l.endDate);
        const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        return sum + months;
      }, 0) / leases.length).toFixed(1)
    : "0";

  const kpiCards = [
    { title: "Active Leases", value: String(activeCount), change: leasesLoading ? "Loading..." : `${activeCount} total`, icon: FileText },
    { title: "Expiring (30d)", value: String(expiringCount), change: leasesLoading ? "Loading..." : `${expiringCount} upcoming`, icon: Clock },
    { title: "Pending Renewals", value: String(pendingRenewals), change: leasesLoading ? "Loading..." : `${renewals.filter((r: any) => r.renewalOfferStatus?.toLowerCase() === 'sent').length} offers sent`, icon: RefreshCw },
    { title: "Avg Lease Term", value: `${avgTermMonths} mo`, change: leasesLoading ? "Loading..." : "computed", icon: CalendarDays },
  ];

  return (
    <div className="space-y-6" data-testid="page-lease-management">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-page-title">Lease Management</h1>
          <p className="text-muted-foreground">Lease lifecycle tracking, renewals, and compliance workflows</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs" data-testid="badge-agent-status">
            <Brain className="w-3 h-3 mr-1 text-primary" />
            Agent Active
          </Badge>
          <Button size="sm" data-testid="button-new-lease">
            <FileText className="w-3 h-3 mr-1" />
            New Lease
          </Button>
        </div>
      </div>

      <AgentInsightStrip insights={agentInsights} />

      <AINudgeCard
        title="Renewal Risk Alert"
        insight="Agent identified 4 tenants with renewal probability below 50%. Proactive retention outreach recommended for units 8A, 9A, 4D, and 6C. Early engagement increases renewal likelihood by 23% on average."
        confidence={0.88}
        severity="warning"
        icon={Target}
        actionLabel="Launch Retention Campaign"
        onAction={() => {}}
        secondaryLabel="View Risk Details"
        onSecondary={() => {}}
        metric="4 at-risk tenants"
        metricLabel="Renewal Risk"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpiCards.map((card, index) => (
          <Card key={card.title} className="hover-elevate" data-testid={`card-kpi-${index}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-1 pt-3 px-3">
              <CardTitle className="text-xs font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-3 pb-3">
              {leasesLoading ? (
                <Skeleton className="h-6 w-16 mb-1" />
              ) : (
                <div className="text-xl font-mono tabular-nums font-semibold" data-testid={`text-kpi-value-${index}`}>{card.value}</div>
              )}
              <div className="flex items-center gap-1 text-xs mt-0.5 text-muted-foreground">
                {card.change}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="active-leases" className="space-y-4">
        <TabsList data-testid="tabs-lease-management">
          <TabsTrigger value="active-leases" data-testid="tab-active-leases">Active Leases</TabsTrigger>
          <TabsTrigger value="renewals" data-testid="tab-renewals">Renewals</TabsTrigger>
          <TabsTrigger value="rent-increases" data-testid="tab-rent-increases">Rent Increases</TabsTrigger>
          <TabsTrigger value="violations" data-testid="tab-violations">Violations</TabsTrigger>
          <TabsTrigger value="deposits" data-testid="tab-deposits">Deposit Dispositions</TabsTrigger>
        </TabsList>

        <TabsContent value="active-leases" className="space-y-4">
          <Card data-testid="card-active-leases">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <FileText className="w-5 h-5 text-primary" />
                <CardTitle>Active Lease Portfolio</CardTitle>
                <Badge variant="secondary" className="text-xs">{leases.length} leases</Badge>
              </div>
              <CardDescription>Current lease inventory with status tracking</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {leasesLoading ? (
                <TableSkeleton rows={5} cols={6} />
              ) : leasesError ? (
                <div className="p-6 text-center text-muted-foreground" data-testid="error-leases">
                  <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-destructive" />
                  <p>Failed to load leases. Please try again later.</p>
                </div>
              ) : leases.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground" data-testid="empty-leases">
                  <p>No active leases found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="p-3 font-medium text-muted-foreground">Tenant</th>
                        <th className="p-3 font-medium text-muted-foreground">Unit</th>
                        <th className="p-3 font-medium text-muted-foreground">Start Date</th>
                        <th className="p-3 font-medium text-muted-foreground">End Date</th>
                        <th className="p-3 font-medium text-muted-foreground">Rent</th>
                        <th className="p-3 font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leases.map((lease: any, idx: number) => (
                        <tr key={lease.id || idx} className="border-b last:border-0 hover-elevate" data-testid={`row-lease-${idx}`}>
                          <td className="p-3 font-medium">{lease.tenantName || "--"}</td>
                          <td className="p-3 text-muted-foreground">{lease.unitNumber || "--"}</td>
                          <td className="p-3 text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <CalendarDays className="w-3.5 h-3.5" />
                              {formatDate(lease.startDate)}
                            </div>
                          </td>
                          <td className="p-3 text-muted-foreground">{formatDate(lease.endDate)}</td>
                          <td className="p-3 font-mono tabular-nums">${(lease.monthlyRent ?? 0).toLocaleString()}</td>
                          <td className="p-3">
                            <Badge variant={leaseStatusVariant[lease.status] || leaseStatusVariant[capitalize(lease.status)] || "outline"} className="text-xs" data-testid={`badge-lease-status-${idx}`}>
                              {capitalize(lease.status)}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="renewals" className="space-y-4">
          <Card data-testid="card-renewals">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <RefreshCw className="w-5 h-5 text-primary" />
                <CardTitle>Renewal Pipeline</CardTitle>
                <Badge variant="secondary" className="text-xs">AI-Scored</Badge>
              </div>
              <CardDescription>AI-powered renewal probability scoring and offer tracking</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {leasesLoading ? (
                <TableSkeleton rows={4} cols={7} />
              ) : leasesError ? (
                <div className="p-6 text-center text-muted-foreground" data-testid="error-renewals">
                  <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-destructive" />
                  <p>Failed to load renewals. Please try again later.</p>
                </div>
              ) : renewals.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground" data-testid="empty-renewals">
                  <p>No pending renewals found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="p-3 font-medium text-muted-foreground">Tenant</th>
                        <th className="p-3 font-medium text-muted-foreground">Unit</th>
                        <th className="p-3 font-medium text-muted-foreground">Lease End</th>
                        <th className="p-3 font-medium text-muted-foreground">Renewal Prob.</th>
                        <th className="p-3 font-medium text-muted-foreground">Offer Status</th>
                        <th className="p-3 font-medium text-muted-foreground">Adjustment</th>
                        <th className="p-3 font-medium text-muted-foreground">New Rent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {renewals.map((r: any, idx: number) => {
                        const prob = r.renewalProbability ?? 0;
                        const adjustment = r.renewalAdjustment ?? 0;
                        const newRent = r.proposedRent ?? ((r.monthlyRent ?? 0) + adjustment);
                        const aiScore = getAiScore(r.renewalProbability);
                        return (
                          <tr key={r.id || idx} className="border-b last:border-0 hover-elevate" data-testid={`row-renewal-${idx}`}>
                            <td className="p-3 font-medium">{r.tenantName || "--"}</td>
                            <td className="p-3 text-muted-foreground">{r.unitNumber || "--"}</td>
                            <td className="p-3 text-muted-foreground">{formatDate(r.endDate)}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <Progress value={prob * 100} className="h-2 w-16" data-testid={`progress-renewal-${idx}`} />
                                <span className={`text-xs font-medium ${prob >= 0.7 ? "text-emerald-600 dark:text-emerald-400" : prob >= 0.5 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>
                                  {Math.round(prob * 100)}%
                                </span>
                                <Badge variant="outline" className="text-[9px] px-1 py-0" data-testid={`badge-ai-score-${idx}`}>
                                  <Brain className="w-2.5 h-2.5 mr-0.5 text-primary" />
                                  {aiScore}
                                </Badge>
                              </div>
                            </td>
                            <td className="p-3">
                              <Badge variant={renewalOfferVariant[r.renewalOfferStatus] || renewalOfferVariant[capitalize(r.renewalOfferStatus)] || "outline"} className="text-xs" data-testid={`badge-offer-${idx}`}>
                                {capitalize(r.renewalOfferStatus)}
                              </Badge>
                            </td>
                            <td className="p-3">
                              {adjustment > 0 ? (
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                                  <ArrowUpRight className="w-3 h-3" />
                                  +${adjustment}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">--</span>
                              )}
                            </td>
                            <td className="p-3 font-mono tabular-nums">${newRent.toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rent-increases" className="space-y-4">
          <Card data-testid="card-rent-increases">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <TrendingUp className="w-5 h-5 text-primary" />
                <CardTitle>Scheduled Rent Increases</CardTitle>
                <Badge variant="secondary" className="text-xs">{rentIncreases.length} scheduled</Badge>
              </div>
              <CardDescription>Upcoming rent adjustments with tenant notification tracking</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {leasesLoading ? (
                <TableSkeleton rows={4} cols={8} />
              ) : leasesError ? (
                <div className="p-6 text-center text-muted-foreground" data-testid="error-rent-increases">
                  <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-destructive" />
                  <p>Failed to load rent increases. Please try again later.</p>
                </div>
              ) : rentIncreases.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground" data-testid="empty-rent-increases">
                  <p>No scheduled rent increases found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="p-3 font-medium text-muted-foreground">Tenant</th>
                        <th className="p-3 font-medium text-muted-foreground">Unit</th>
                        <th className="p-3 font-medium text-muted-foreground">Effective Date</th>
                        <th className="p-3 font-medium text-muted-foreground">Current Rent</th>
                        <th className="p-3 font-medium text-muted-foreground">New Rent</th>
                        <th className="p-3 font-medium text-muted-foreground">Increase</th>
                        <th className="p-3 font-medium text-muted-foreground">Notice</th>
                        <th className="p-3 font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rentIncreases.map((ri: any, idx: number) => {
                        const currentRent = ri.monthlyRent ?? 0;
                        const increaseAmt = ri.rentIncreaseAmount ?? 0;
                        const newRent = currentRent + increaseAmt;
                        const increasePercent = currentRent > 0 ? ((increaseAmt / currentRent) * 100).toFixed(1) : "0.0";
                        const noticeSent = ri.noticeDate != null;
                        return (
                          <tr key={ri.id || idx} className="border-b last:border-0 hover-elevate" data-testid={`row-increase-${idx}`}>
                            <td className="p-3 font-medium">{ri.tenantName || "--"}</td>
                            <td className="p-3 text-muted-foreground">{ri.unitNumber || "--"}</td>
                            <td className="p-3 text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <CalendarDays className="w-3.5 h-3.5" />
                                {formatDate(ri.rentIncreaseDate)}
                              </div>
                            </td>
                            <td className="p-3 font-mono tabular-nums text-muted-foreground">${currentRent.toLocaleString()}</td>
                            <td className="p-3 font-mono tabular-nums font-medium">${newRent.toLocaleString()}</td>
                            <td className="p-3">
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium">+{increasePercent}%</span>
                            </td>
                            <td className="p-3">
                              {noticeSent ? (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Send className="w-3 h-3" />
                                  Sent
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">Not Sent</span>
                              )}
                            </td>
                            <td className="p-3">
                              <Badge variant={increaseStatusVariant[ri.rentIncreaseStatus] || increaseStatusVariant[capitalize(ri.rentIncreaseStatus)] || "outline"} className="text-xs" data-testid={`badge-increase-status-${idx}`}>
                                {capitalize(ri.rentIncreaseStatus)}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="violations" className="space-y-4">
          <Card data-testid="card-violations">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <ShieldAlert className="w-5 h-5 text-primary" />
                <CardTitle>Lease Violations</CardTitle>
                <Badge variant="secondary" className="text-xs">Agent-Tracked</Badge>
              </div>
              <CardDescription>Active lease violation tracking and enforcement status</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {violationsLoading ? (
                <TableSkeleton rows={4} cols={8} />
              ) : violationsError ? (
                <div className="p-6 text-center text-muted-foreground" data-testid="error-violations">
                  <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-destructive" />
                  <p>Failed to load violations. Please try again later.</p>
                </div>
              ) : violationsData.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground" data-testid="empty-violations">
                  <p>No lease violations found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="p-3 font-medium text-muted-foreground">ID</th>
                        <th className="p-3 font-medium text-muted-foreground">Tenant</th>
                        <th className="p-3 font-medium text-muted-foreground">Unit</th>
                        <th className="p-3 font-medium text-muted-foreground">Type</th>
                        <th className="p-3 font-medium text-muted-foreground">Severity</th>
                        <th className="p-3 font-medium text-muted-foreground">Status</th>
                        <th className="p-3 font-medium text-muted-foreground">Reported</th>
                        <th className="p-3 font-medium text-muted-foreground">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {violationsData.map((v: any, idx: number) => (
                        <tr key={v.id || idx} className="border-b last:border-0 hover-elevate" data-testid={`row-violation-${idx}`}>
                          <td className="p-3 font-mono text-xs">VIO-{v.id}</td>
                          <td className="p-3 font-medium">{v.tenantName || "--"}</td>
                          <td className="p-3 text-muted-foreground">{v.unitNumber || "--"}</td>
                          <td className="p-3 text-muted-foreground">{v.type || "--"}</td>
                          <td className="p-3">
                            <Badge variant={violationSeverityVariant[v.severity] || violationSeverityVariant[capitalize(v.severity)] || "outline"} className="text-xs" data-testid={`badge-violation-severity-${idx}`}>
                              {capitalize(v.severity)}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant={violationStatusVariant[v.status] || violationStatusVariant[capitalize(v.status)] || "outline"} className="text-xs" data-testid={`badge-violation-status-${idx}`}>
                              {capitalize(v.status)}
                            </Badge>
                          </td>
                          <td className="p-3 text-muted-foreground">{formatDate(v.createdAt)}</td>
                          <td className="p-3 text-muted-foreground text-xs max-w-[200px] truncate">{v.description || "--"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deposits" className="space-y-4">
          <Card data-testid="card-deposit-dispositions">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Banknote className="w-5 h-5 text-primary" />
                <CardTitle>Security Deposit Dispositions</CardTitle>
                <Badge variant="secondary" className="text-xs">{depositDispositions.length} records</Badge>
              </div>
              <CardDescription>Move-out deposit accounting and refund tracking</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Tenant</th>
                      <th className="p-3 font-medium text-muted-foreground">Unit</th>
                      <th className="p-3 font-medium text-muted-foreground">Move-Out</th>
                      <th className="p-3 font-medium text-muted-foreground">Deposit</th>
                      <th className="p-3 font-medium text-muted-foreground">Deductions</th>
                      <th className="p-3 font-medium text-muted-foreground">Refund</th>
                      <th className="p-3 font-medium text-muted-foreground">Status</th>
                      <th className="p-3 font-medium text-muted-foreground">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {depositDispositions.map((d, idx) => (
                      <tr key={idx} className="border-b last:border-0 hover-elevate" data-testid={`row-deposit-${idx}`}>
                        <td className="p-3 font-medium">{d.tenant}</td>
                        <td className="p-3 text-muted-foreground">{d.unit}</td>
                        <td className="p-3 text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <CalendarDays className="w-3.5 h-3.5" />
                            {d.moveOut}
                          </div>
                        </td>
                        <td className="p-3 font-mono tabular-nums">${d.deposit.toLocaleString()}</td>
                        <td className="p-3 font-mono tabular-nums">
                          {d.deductions > 0 ? (
                            <span className="text-red-600 dark:text-red-400">-${d.deductions.toLocaleString()}</span>
                          ) : (
                            <span className="text-muted-foreground">$0</span>
                          )}
                        </td>
                        <td className="p-3 font-mono tabular-nums font-medium">${d.refund.toLocaleString()}</td>
                        <td className="p-3">
                          <Badge variant={depositStatusVariant[d.status]} className="text-xs" data-testid={`badge-deposit-status-${idx}`}>
                            {d.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground text-xs max-w-[180px] truncate">{d.reason}</td>
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