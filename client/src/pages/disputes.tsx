import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { AINudgeCard, AgentInsightStrip } from "@/components/ai-nudge-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Dispute, DisputeTimeline } from "@shared/schema";
import {
  Scale,
  AlertTriangle,
  Brain,
  Clock,
  Calendar,
  TrendingUp,
  TrendingDown,
  FileText,
  DollarSign,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  Filter,
  ShieldAlert,
  Users,
  Store,
  Truck,
  Gavel,
  Timer,
  Paperclip,
  MessageSquare,
  ArrowUpRight,
  BarChart3,
  Star,
  ThumbsUp,
  type LucideIcon,
} from "lucide-react";

const agentInsights = [
  { text: "3 rent disputes approaching SLA deadline", severity: "critical" as const },
  { text: "Vendor ABC Maintenance has 4 unresolved invoice disputes", severity: "warning" as const, confidence: 0.91 },
  { text: "AI suggests auto-resolution for 2 low-risk disputes", severity: "positive" as const },
];

type DisputeType = "rent" | "vendor" | "merchant";
type DisputeStatus = "open" | "under_review" | "escalated" | "mediation" | "resolved" | "closed";
type DisputePriority = "critical" | "high" | "medium" | "low";

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const formatStatus = (s: string) => {
  if (s === "under_review") return "Under Review";
  return capitalize(s);
};
const formatType = (s: string) => capitalize(s);
const formatPriority = (s: string) => capitalize(s);

const statusVariant: Record<DisputeStatus, "destructive" | "outline" | "secondary" | "default"> = {
  open: "outline",
  under_review: "default",
  escalated: "destructive",
  mediation: "outline",
  resolved: "secondary",
  closed: "secondary",
};

const priorityVariant: Record<DisputePriority, "destructive" | "outline" | "secondary" | "default"> = {
  critical: "destructive",
  high: "destructive",
  medium: "outline",
  low: "secondary",
};

const typeIcon: Record<DisputeType, LucideIcon> = {
  rent: Users,
  vendor: Truck,
  merchant: Store,
};

const statusColors: Record<string, string> = {
  open: "bg-blue-500",
  under_review: "bg-amber-500",
  escalated: "bg-red-500",
  mediation: "bg-violet-500",
  resolved: "bg-emerald-500",
  closed: "bg-slate-500",
};

function formatDate(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function computeResolutionDays(createdAt: string | Date, resolvedAt: string | Date | null | undefined): number | null {
  if (!resolvedAt) return null;
  const start = new Date(createdAt);
  const end = new Date(resolvedAt);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-80 mt-2" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-1 pt-3 px-3">
              <Skeleton className="h-3 w-24" />
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-3 w-28 mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full mb-2" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function DisputeCenter() {
  const [activeTab, setActiveTab] = useState("all");
  const [typeFilter, setTypeFilter] = useState<DisputeType | "all">("all");

  const { data: disputes = [], isLoading, isError } = useQuery<Dispute[]>({
    queryKey: ["/api/disputes"],
  });

  const filteredDisputes = useMemo(
    () => (typeFilter === "all" ? disputes : disputes.filter((d) => d.type === typeFilter)),
    [disputes, typeFilter]
  );
  const rentDisputes = useMemo(() => disputes.filter((d) => d.type === "rent"), [disputes]);
  const vendorDisputes = useMemo(() => disputes.filter((d) => d.type === "vendor"), [disputes]);
  const merchantDisputes = useMemo(() => disputes.filter((d) => d.type === "merchant"), [disputes]);
  const resolvedDisputes = useMemo(() => disputes.filter((d) => d.status === "resolved" || d.status === "closed"), [disputes]);

  const statusDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const d of disputes) {
      counts[d.status] = (counts[d.status] || 0) + 1;
    }
    return Object.entries(counts)
      .filter(([status]) => status !== "closed")
      .map(([status, count]) => ({
        status,
        count,
        color: statusColors[status] || "bg-gray-500",
      }));
  }, [disputes]);

  const totalStatusCount = statusDistribution.reduce((sum, s) => sum + s.count, 0);

  const kpiCards = useMemo(() => {
    const openCount = disputes.filter((d) => d.status === "open").length;
    const resolved = disputes.filter((d) => d.resolvedAt);
    const avgResolution = resolved.length > 0
      ? (resolved.reduce((sum, d) => sum + (computeResolutionDays(d.createdAt, d.resolvedAt) || 0), 0) / resolved.length).toFixed(1)
      : "0";
    const activeDisputes = disputes.filter((d) => d.status !== "resolved" && d.status !== "closed");
    const slaCompliant = activeDisputes.filter((d) => d.slaDeadline && new Date(d.slaDeadline) > new Date()).length;
    const slaRate = activeDisputes.length > 0 ? Math.round((slaCompliant / activeDisputes.length) * 100) : 100;
    const escalatedCount = disputes.filter((d) => d.status === "escalated").length;
    const escalationRate = disputes.length > 0 ? Math.round((escalatedCount / disputes.length) * 100) : 0;

    return [
      { title: "Open Disputes", value: String(openCount), change: `${openCount} active`, trend: openCount > 0 ? "warning" as const : "positive" as const, icon: Scale },
      { title: "Avg Resolution Time", value: `${avgResolution}d`, change: `${resolved.length} resolved`, trend: "positive" as const, icon: Timer },
      { title: "SLA Compliance", value: `${slaRate}%`, change: `${slaCompliant}/${activeDisputes.length} on track`, trend: slaRate >= 80 ? "positive" as const : "warning" as const, icon: CheckCircle2 },
      { title: "Escalation Rate", value: `${escalationRate}%`, change: `${escalatedCount} escalated`, trend: escalationRate <= 15 ? "positive" as const : "warning" as const, icon: TrendingDown },
    ];
  }, [disputes]);

  const resolutionMetrics = useMemo(() => {
    const resolved = disputes.filter((d) => d.resolvedAt);
    const avgDays = resolved.length > 0
      ? +(resolved.reduce((sum, d) => sum + (computeResolutionDays(d.createdAt, d.resolvedAt) || 0), 0) / resolved.length).toFixed(1)
      : 0;
    const scored = resolved.filter((d) => d.satisfactionScore);
    const avgSat = scored.length > 0
      ? +(scored.reduce((sum, d) => sum + (d.satisfactionScore || 0), 0) / scored.length).toFixed(1)
      : 0;
    const now = new Date();
    const thisMonthCount = resolved.filter((d) => {
      const ra = new Date(d.resolvedAt!);
      return ra.getMonth() === now.getMonth() && ra.getFullYear() === now.getFullYear();
    }).length;
    return { avgResolutionDays: avgDays, avgSatisfaction: avgSat, totalResolved: resolved.length, thisMonth: thisMonthCount };
  }, [disputes]);

  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="page-dispute-center">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-page-title">Dispute Center</h1>
            <p className="text-muted-foreground">Rent disputes, vendor invoice disputes, and merchant transaction disputes</p>
          </div>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6" data-testid="page-dispute-center">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-page-title">Dispute Center</h1>
            <p className="text-muted-foreground">Rent disputes, vendor invoice disputes, and merchant transaction disputes</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground" data-testid="text-error-message">Unable to load disputes. Please sign in as a business user to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="page-dispute-center">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-page-title">Dispute Center</h1>
          <p className="text-muted-foreground">Rent disputes, vendor invoice disputes, and merchant transaction disputes</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs" data-testid="badge-agent-status">
            <Brain className="w-3 h-3 mr-1 text-primary" />
            Agent Active
          </Badge>
          <Button size="sm" data-testid="button-file-dispute">
            <Scale className="w-3 h-3 mr-1" />
            File Dispute
          </Button>
        </div>
      </div>

      <AgentInsightStrip insights={agentInsights} />

      <AINudgeCard
        title="Auto-Resolution Candidates Identified"
        insight="AI analysis found 2 low-risk disputes eligible for auto-resolution. Both have clear evidence of duplicate charges with matching transaction records. Auto-resolving could save 4 staff-hours and improve SLA compliance by 6%."
        confidence={0.93}
        severity="opportunity"
        icon={Brain}
        actionLabel="Auto-Resolve Now"
        onAction={() => {}}
        secondaryLabel="Review Details"
        onSecondary={() => {}}
        metric="4 hrs"
        metricLabel="Est. Time Saved"
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
        <TabsList data-testid="tabs-disputes">
          <TabsTrigger value="all" data-testid="tab-all-disputes">All Disputes</TabsTrigger>
          <TabsTrigger value="rent" data-testid="tab-rent-disputes">Rent Disputes</TabsTrigger>
          <TabsTrigger value="vendor" data-testid="tab-vendor-disputes">Vendor Disputes</TabsTrigger>
          <TabsTrigger value="merchant" data-testid="tab-merchant-disputes">Merchant Disputes</TabsTrigger>
          <TabsTrigger value="resolution" data-testid="tab-resolution-center">Resolution Center</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Filter by type:</span>
            {(["all", "rent", "vendor", "merchant"] as const).map((t) => (
              <Button
                key={t}
                variant={typeFilter === t ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter(t)}
                data-testid={`button-filter-${t}`}
              >
                {t === "all" ? "All" : formatType(t)}
              </Button>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Card className="md:col-span-2" data-testid="card-all-disputes">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Scale className="w-5 h-5 text-primary" />
                  <CardTitle>All Disputes</CardTitle>
                  <Badge variant="secondary" className="text-xs">{filteredDisputes.length} disputes</Badge>
                </div>
                <CardDescription>Combined view of all dispute types</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="p-3 font-medium text-muted-foreground">ID</th>
                        <th className="p-3 font-medium text-muted-foreground">Type</th>
                        <th className="p-3 font-medium text-muted-foreground">Filed By</th>
                        <th className="p-3 font-medium text-muted-foreground">Against</th>
                        <th className="p-3 font-medium text-muted-foreground">Property</th>
                        <th className="p-3 font-medium text-muted-foreground">Unit</th>
                        <th className="p-3 font-medium text-muted-foreground">Amount</th>
                        <th className="p-3 font-medium text-muted-foreground">Status</th>
                        <th className="p-3 font-medium text-muted-foreground">Priority</th>
                        <th className="p-3 font-medium text-muted-foreground">Filed</th>
                        <th className="p-3 font-medium text-muted-foreground">SLA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDisputes.map((d, idx) => {
                        const TypeIcon = typeIcon[d.type as DisputeType];
                        return (
                          <tr key={d.id} className="border-b last:border-0 hover-elevate" data-testid={`row-dispute-${idx}`}>
                            <td className="p-3 font-mono text-xs">{d.disputeNumber}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-1.5">
                                {TypeIcon && <TypeIcon className="w-3.5 h-3.5 text-muted-foreground" />}
                                <span className="text-xs">{formatType(d.type)}</span>
                              </div>
                            </td>
                            <td className="p-3 font-medium text-xs">{d.filedBy}</td>
                            <td className="p-3 text-muted-foreground text-xs">{d.against}</td>
                            <td className="p-3 text-muted-foreground text-xs">{d.propertyName || "—"}</td>
                            <td className="p-3 text-muted-foreground text-xs">{d.unitNumber || "—"}</td>
                            <td className="p-3 font-mono tabular-nums text-xs">${Number(d.amount).toLocaleString()}</td>
                            <td className="p-3">
                              <Badge variant={statusVariant[d.status as DisputeStatus]} className="text-xs" data-testid={`badge-status-${idx}`}>
                                {formatStatus(d.status)}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <Badge variant={priorityVariant[d.priority as DisputePriority]} className="text-xs" data-testid={`badge-priority-${idx}`}>
                                {formatPriority(d.priority)}
                              </Badge>
                            </td>
                            <td className="p-3 text-muted-foreground text-xs">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(d.createdAt)}
                              </div>
                            </td>
                            <td className="p-3 text-muted-foreground text-xs">{formatDate(d.slaDeadline)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-status-distribution">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <CardTitle className="text-sm">Status Distribution</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {statusDistribution.map((s, idx) => (
                  <div key={s.status} className="space-y-1" data-testid={`status-bar-${idx}`}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{formatStatus(s.status)}</span>
                      <span className="font-medium">{s.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className={`h-2 rounded-full ${s.color}`}
                        style={{ width: `${totalStatusCount > 0 ? (s.count / totalStatusCount) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t text-xs text-muted-foreground flex items-center justify-between">
                  <span>Total Active</span>
                  <span className="font-semibold">{totalStatusCount}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rent" className="space-y-4">
          <Card data-testid="card-rent-disputes">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Users className="w-5 h-5 text-primary" />
                <CardTitle>Rent Disputes</CardTitle>
                <Badge variant="secondary" className="text-xs">{rentDisputes.length} disputes</Badge>
              </div>
              <CardDescription>Tenant rent-related disputes including charge accuracy, late fees, deposit deductions, and maintenance abatement</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">ID</th>
                      <th className="p-3 font-medium text-muted-foreground">Tenant</th>
                      <th className="p-3 font-medium text-muted-foreground">Unit</th>
                      <th className="p-3 font-medium text-muted-foreground">Category</th>
                      <th className="p-3 font-medium text-muted-foreground">Amount</th>
                      <th className="p-3 font-medium text-muted-foreground">Status</th>
                      <th className="p-3 font-medium text-muted-foreground">Priority</th>
                      <th className="p-3 font-medium text-muted-foreground">Mediator</th>
                      <th className="p-3 font-medium text-muted-foreground">Evidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rentDisputes.map((d, idx) => (
                      <tr key={d.id} className="border-b last:border-0 hover-elevate" data-testid={`row-rent-dispute-${idx}`}>
                        <td className="p-3 font-mono text-xs">{d.disputeNumber}</td>
                        <td className="p-3 font-medium">{d.filedBy}</td>
                        <td className="p-3 text-muted-foreground">{d.unitNumber || "—"}</td>
                        <td className="p-3 text-muted-foreground text-xs">{d.category}</td>
                        <td className="p-3 font-mono tabular-nums">${Number(d.amount).toLocaleString()}</td>
                        <td className="p-3">
                          <Badge variant={statusVariant[d.status as DisputeStatus]} className="text-xs" data-testid={`badge-rent-status-${idx}`}>
                            {formatStatus(d.status)}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant={priorityVariant[d.priority as DisputePriority]} className="text-xs" data-testid={`badge-rent-priority-${idx}`}>
                            {formatPriority(d.priority)}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground text-xs">{d.mediator || "Unassigned"}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1 text-muted-foreground text-xs">
                            <Paperclip className="w-3 h-3" />
                            {d.evidenceCount}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            {rentDisputes.filter((d) => d.status !== "resolved" && d.status !== "closed").slice(0, 2).map((d, idx) => (
              <RentDisputeTimeline key={d.id} dispute={d} idx={idx} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="vendor" className="space-y-4">
          <Card data-testid="card-vendor-disputes">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Truck className="w-5 h-5 text-primary" />
                <CardTitle>Vendor Invoice Disputes</CardTitle>
                <Badge variant="secondary" className="text-xs">{vendorDisputes.length} disputes</Badge>
              </div>
              <CardDescription>Vendor overcharges, incomplete work, warranty claims, and unauthorized charges</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">ID</th>
                      <th className="p-3 font-medium text-muted-foreground">Vendor</th>
                      <th className="p-3 font-medium text-muted-foreground">Property</th>
                      <th className="p-3 font-medium text-muted-foreground">Category</th>
                      <th className="p-3 font-medium text-muted-foreground">Work Order</th>
                      <th className="p-3 font-medium text-muted-foreground">Original</th>
                      <th className="p-3 font-medium text-muted-foreground">Disputed</th>
                      <th className="p-3 font-medium text-muted-foreground">Status</th>
                      <th className="p-3 font-medium text-muted-foreground">Vendor Response</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendorDisputes.map((d, idx) => (
                      <tr key={d.id} className="border-b last:border-0 hover-elevate" data-testid={`row-vendor-dispute-${idx}`}>
                        <td className="p-3 font-mono text-xs">{d.disputeNumber}</td>
                        <td className="p-3 font-medium">{d.against}</td>
                        <td className="p-3 text-muted-foreground text-xs">{d.propertyName || "—"}</td>
                        <td className="p-3 text-muted-foreground text-xs">{d.category}</td>
                        <td className="p-3 font-mono text-xs">
                          <div className="flex items-center gap-1">
                            <FileText className="w-3 h-3 text-muted-foreground" />
                            {d.workOrderRef || "—"}
                          </div>
                        </td>
                        <td className="p-3 font-mono tabular-nums text-muted-foreground">${d.originalAmount ? Number(d.originalAmount).toLocaleString() : "—"}</td>
                        <td className="p-3 font-mono tabular-nums font-medium">${Number(d.amount).toLocaleString()}</td>
                        <td className="p-3">
                          <Badge variant={statusVariant[d.status as DisputeStatus]} className="text-xs" data-testid={`badge-vendor-status-${idx}`}>
                            {formatStatus(d.status)}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge
                            variant={d.vendorResponse === "Pending" ? "outline" : d.vendorResponse === "Disputed" ? "destructive" : "secondary"}
                            className="text-xs"
                            data-testid={`badge-vendor-response-${idx}`}
                          >
                            <MessageSquare className="w-3 h-3 mr-1" />
                            {d.vendorResponse || "—"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-vendor-amount-comparison">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Amount Discrepancy Overview</CardTitle>
              <CardDescription>Original approved amounts vs disputed invoice amounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {vendorDisputes.map((d, idx) => {
                const amount = Number(d.amount);
                const original = d.originalAmount ? Number(d.originalAmount) : 0;
                return (
                  <div key={d.id} className="flex items-center gap-3 text-sm" data-testid={`vendor-comparison-${idx}`}>
                    <span className="font-mono text-xs text-muted-foreground w-20">{d.disputeNumber}</span>
                    <span className="text-xs text-muted-foreground w-36 truncate">{d.against}</span>
                    <div className="flex-1 flex items-center gap-2">
                      <span className="font-mono tabular-nums text-xs text-muted-foreground">${original.toLocaleString()}</span>
                      <ArrowUpRight className="w-3 h-3 text-red-500" />
                      <span className="font-mono tabular-nums text-xs font-medium">${amount.toLocaleString()}</span>
                      <span className="text-xs text-red-600 dark:text-red-400">
                        (+${(amount - original).toLocaleString()})
                      </span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="merchant" className="space-y-4">
          <Card data-testid="card-merchant-disputes">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Store className="w-5 h-5 text-primary" />
                <CardTitle>Merchant Transaction Disputes</CardTitle>
                <Badge variant="secondary" className="text-xs">{merchantDisputes.length} disputes</Badge>
              </div>
              <CardDescription>Unauthorized charges, refund requests, service not received, and quality complaints</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">ID</th>
                      <th className="p-3 font-medium text-muted-foreground">Tenant</th>
                      <th className="p-3 font-medium text-muted-foreground">Merchant</th>
                      <th className="p-3 font-medium text-muted-foreground">Transaction</th>
                      <th className="p-3 font-medium text-muted-foreground">Reason</th>
                      <th className="p-3 font-medium text-muted-foreground">Amount</th>
                      <th className="p-3 font-medium text-muted-foreground">Status</th>
                      <th className="p-3 font-medium text-muted-foreground">Priority</th>
                      <th className="p-3 font-medium text-muted-foreground">Filed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {merchantDisputes.map((d, idx) => (
                      <tr key={d.id} className="border-b last:border-0 hover-elevate" data-testid={`row-merchant-dispute-${idx}`}>
                        <td className="p-3 font-mono text-xs">{d.disputeNumber}</td>
                        <td className="p-3 font-medium">{d.filedBy}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <Store className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-xs">{d.merchantName || "—"}</span>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-xs text-muted-foreground">{d.transactionRef || "—"}</td>
                        <td className="p-3 text-muted-foreground text-xs">{d.category}</td>
                        <td className="p-3 font-mono tabular-nums">${Number(d.amount).toLocaleString()}</td>
                        <td className="p-3">
                          <Badge variant={statusVariant[d.status as DisputeStatus]} className="text-xs" data-testid={`badge-merchant-status-${idx}`}>
                            {formatStatus(d.status)}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant={priorityVariant[d.priority as DisputePriority]} className="text-xs" data-testid={`badge-merchant-priority-${idx}`}>
                            {formatPriority(d.priority)}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground text-xs">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(d.createdAt)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-4">
            {merchantDisputes.map((d, idx) => (
              <Card key={d.id} className="hover-elevate" data-testid={`card-merchant-detail-${idx}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <CardTitle className="text-sm">{d.disputeNumber}</CardTitle>
                    <Badge variant={statusVariant[d.status as DisputeStatus]} className="text-xs">{formatStatus(d.status)}</Badge>
                  </div>
                  <CardDescription className="text-xs">{d.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Merchant</span>
                      <p className="font-medium">{d.merchantName || "—"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Amount</span>
                      <p className="font-mono tabular-nums font-medium">${Number(d.amount).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Transaction</span>
                      <p className="font-mono">{d.transactionRef || "—"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Reason</span>
                      <p>{d.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1 border-t">
                    <Paperclip className="w-3 h-3" />
                    {d.evidenceCount} attachments
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="resolution" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="hover-elevate" data-testid="card-resolution-metric-0">
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-1 pt-3 px-3">
                <CardTitle className="text-xs font-medium text-muted-foreground">Total Resolved</CardTitle>
                <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="text-xl font-mono tabular-nums font-semibold" data-testid="text-total-resolved">{resolutionMetrics.totalResolved}</div>
                <div className="text-xs text-muted-foreground">{resolutionMetrics.thisMonth} this month</div>
              </CardContent>
            </Card>
            <Card className="hover-elevate" data-testid="card-resolution-metric-1">
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-1 pt-3 px-3">
                <CardTitle className="text-xs font-medium text-muted-foreground">Avg Resolution</CardTitle>
                <Timer className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="text-xl font-mono tabular-nums font-semibold" data-testid="text-avg-resolution">{resolutionMetrics.avgResolutionDays}d</div>
                <div className="flex items-center gap-1 text-xs text-emerald-600">
                  <TrendingDown className="w-3 h-3" />
                  Improving
                </div>
              </CardContent>
            </Card>
            <Card className="hover-elevate" data-testid="card-resolution-metric-2">
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-1 pt-3 px-3">
                <CardTitle className="text-xs font-medium text-muted-foreground">Avg Satisfaction</CardTitle>
                <Star className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="text-xl font-mono tabular-nums font-semibold" data-testid="text-avg-satisfaction">{resolutionMetrics.avgSatisfaction}/5</div>
                <div className="flex items-center gap-1 text-xs text-emerald-600">
                  <ThumbsUp className="w-3 h-3" />
                  Above target
                </div>
              </CardContent>
            </Card>
            <Card className="hover-elevate" data-testid="card-resolution-metric-3">
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-1 pt-3 px-3">
                <CardTitle className="text-xs font-medium text-muted-foreground">SLA Met Rate</CardTitle>
                <ShieldAlert className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="px-3 pb-3">
                {(() => {
                  const activeDisputes = disputes.filter((d) => d.status !== "resolved" && d.status !== "closed");
                  const slaCompliant = activeDisputes.filter((d) => d.slaDeadline && new Date(d.slaDeadline) > new Date()).length;
                  const slaRate = activeDisputes.length > 0 ? Math.round((slaCompliant / activeDisputes.length) * 100) : 100;
                  return (
                    <>
                      <div className="text-xl font-mono tabular-nums font-semibold" data-testid="text-sla-met">{slaRate}%</div>
                      <Progress value={slaRate} className="h-1.5 mt-1" data-testid="progress-sla" />
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </div>

          <Card data-testid="card-resolved-disputes">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Gavel className="w-5 h-5 text-primary" />
                <CardTitle>Resolved Disputes</CardTitle>
                <Badge variant="secondary" className="text-xs">{resolvedDisputes.length} resolved</Badge>
              </div>
              <CardDescription>Completed dispute resolutions with outcomes and satisfaction tracking</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">ID</th>
                      <th className="p-3 font-medium text-muted-foreground">Type</th>
                      <th className="p-3 font-medium text-muted-foreground">Filed By</th>
                      <th className="p-3 font-medium text-muted-foreground">Amount</th>
                      <th className="p-3 font-medium text-muted-foreground">Resolution</th>
                      <th className="p-3 font-medium text-muted-foreground">Time (days)</th>
                      <th className="p-3 font-medium text-muted-foreground">Satisfaction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resolvedDisputes.map((d, idx) => {
                      const resDays = computeResolutionDays(d.createdAt, d.resolvedAt);
                      return (
                        <tr key={d.id} className="border-b last:border-0 hover-elevate" data-testid={`row-resolved-${idx}`}>
                          <td className="p-3 font-mono text-xs">{d.disputeNumber}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              {d.type === "rent" && <Users className="w-3.5 h-3.5 text-muted-foreground" />}
                              {d.type === "vendor" && <Truck className="w-3.5 h-3.5 text-muted-foreground" />}
                              {d.type === "merchant" && <Store className="w-3.5 h-3.5 text-muted-foreground" />}
                              <span className="text-xs">{formatType(d.type)}</span>
                            </div>
                          </td>
                          <td className="p-3 font-medium">{d.filedBy}</td>
                          <td className="p-3 font-mono tabular-nums">${Number(d.amount).toLocaleString()}</td>
                          <td className="p-3">
                            <Badge variant="secondary" className="text-xs" data-testid={`badge-resolution-type-${idx}`}>
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              {d.resolutionType || "Resolved"}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              <span className={`text-xs font-medium ${(resDays || 0) <= 7 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                                {resDays !== null ? `${resDays}d` : "—"}
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${i < (d.satisfactionScore || 0) ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}`}
                                />
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-resolution-workflow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Resolution Workflow Stages</CardTitle>
              <CardDescription>Standard dispute resolution pipeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-1">
                {["Filed", "Under Review", "Evidence Collection", "Mediation", "Resolution", "Closed"].map((step, i) => (
                  <div
                    key={step}
                    className="flex-1 text-center text-[10px] py-1.5 rounded-md border bg-muted/30 border-muted text-muted-foreground"
                    data-testid={`resolution-step-${i}`}
                  >
                    {step}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RentDisputeTimeline({ dispute: d, idx }: { dispute: Dispute; idx: number }) {
  const { data: disputeDetail } = useQuery<Dispute & { timeline: DisputeTimeline[] }>({
    queryKey: ["/api/disputes", d.id],
  });

  const timeline = disputeDetail?.timeline || [];

  return (
    <Card className="hover-elevate" data-testid={`card-rent-timeline-${idx}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-sm">{d.disputeNumber} - {d.category}</CardTitle>
          <Badge variant={priorityVariant[d.priority as DisputePriority]} className="text-xs">{formatPriority(d.priority)}</Badge>
        </div>
        <CardDescription className="text-xs">{d.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-1.5">
          {timeline.length > 0 ? timeline.map((t, tIdx) => (
            <div key={t.id || tIdx} className="flex items-start gap-2 text-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <div>
                <span className="text-muted-foreground">{formatDate(t.createdAt)}</span>
                <p>{t.action}</p>
              </div>
            </div>
          )) : (
            <div className="text-xs text-muted-foreground">No timeline entries yet</div>
          )}
        </div>
        <div className="flex items-center gap-3 pt-2 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Paperclip className="w-3 h-3" />
            {d.evidenceCount} attachments
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {d.mediator || "Unassigned"}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            SLA: {formatDate(d.slaDeadline)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
