import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AINudgeCard, AgentInsightStrip } from "@/components/ai-nudge-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const kpiCards = [
  { title: "Open Disputes", value: "14", change: "+3 this week", trend: "warning" as const, icon: Scale },
  { title: "Avg Resolution Time", value: "6.2d", change: "-1.1d vs last month", trend: "positive" as const, icon: Timer },
  { title: "SLA Compliance", value: "87%", change: "+4%", trend: "positive" as const, icon: CheckCircle2 },
  { title: "Escalation Rate", value: "12%", change: "-2%", trend: "positive" as const, icon: TrendingDown },
];

type DisputeType = "Rent" | "Vendor" | "Merchant";
type DisputeStatus = "Open" | "Under Review" | "Escalated" | "Mediation" | "Resolved" | "Closed";
type DisputePriority = "Critical" | "High" | "Medium" | "Low";

interface Dispute {
  id: string;
  type: DisputeType;
  filedBy: string;
  against: string;
  property: string;
  unit: string;
  amount: number;
  status: DisputeStatus;
  priority: DisputePriority;
  filedDate: string;
  slaDeadline: string;
  category: string;
  description: string;
  mediator?: string;
  evidenceCount: number;
  timeline: { date: string; action: string }[];
  workOrderRef?: string;
  originalAmount?: number;
  vendorResponse?: string;
  transactionRef?: string;
  merchantName?: string;
  resolutionType?: string;
  resolutionTime?: number;
  satisfactionScore?: number;
}

const disputes: Dispute[] = [
  {
    id: "DSP-1001",
    type: "Rent",
    filedBy: "Sarah Mitchell",
    against: "Oakwood Properties",
    property: "Oakwood Apartments",
    unit: "3A",
    amount: 425,
    status: "Open",
    priority: "High",
    filedDate: "Feb 10, 2026",
    slaDeadline: "Feb 24, 2026",
    category: "Charge Accuracy",
    description: "Incorrect late fee charged despite on-time payment via ACH",
    mediator: "Maria Santos",
    evidenceCount: 3,
    timeline: [
      { date: "Feb 10, 2026", action: "Dispute filed by tenant" },
      { date: "Feb 11, 2026", action: "Assigned to Maria Santos" },
      { date: "Feb 13, 2026", action: "Payment records requested" },
    ],
  },
  {
    id: "DSP-1002",
    type: "Rent",
    filedBy: "James Park",
    against: "Oakwood Properties",
    property: "Oakwood Apartments",
    unit: "7B",
    amount: 1200,
    status: "Escalated",
    priority: "Critical",
    filedDate: "Jan 28, 2026",
    slaDeadline: "Feb 18, 2026",
    category: "Deposit Deduction",
    description: "Disputed security deposit deductions for pre-existing damage",
    mediator: "Brian Cooper",
    evidenceCount: 7,
    timeline: [
      { date: "Jan 28, 2026", action: "Dispute filed by tenant" },
      { date: "Jan 29, 2026", action: "Assigned to Brian Cooper" },
      { date: "Feb 3, 2026", action: "Move-in inspection photos reviewed" },
      { date: "Feb 10, 2026", action: "Escalated - conflicting evidence" },
    ],
  },
  {
    id: "DSP-1003",
    type: "Rent",
    filedBy: "Priya Patel",
    against: "Oakwood Properties",
    property: "Riverside Complex",
    unit: "5C",
    amount: 850,
    status: "Under Review",
    priority: "Medium",
    filedDate: "Feb 5, 2026",
    slaDeadline: "Feb 26, 2026",
    category: "Maintenance Abatement",
    description: "Rent abatement request due to 2-week HVAC outage in winter",
    mediator: "Maria Santos",
    evidenceCount: 4,
    timeline: [
      { date: "Feb 5, 2026", action: "Dispute filed by tenant" },
      { date: "Feb 6, 2026", action: "Maintenance logs pulled" },
      { date: "Feb 8, 2026", action: "HVAC contractor statement received" },
    ],
  },
  {
    id: "DSP-1004",
    type: "Vendor",
    filedBy: "Oakwood Properties",
    against: "ABC Maintenance Co.",
    property: "Oakwood Apartments",
    unit: "Common",
    amount: 3200,
    status: "Open",
    priority: "High",
    filedDate: "Feb 12, 2026",
    slaDeadline: "Feb 26, 2026",
    category: "Overcharge",
    description: "Invoice $3,200 exceeds approved PO of $1,800 for lobby renovation",
    evidenceCount: 5,
    workOrderRef: "WO-4521",
    originalAmount: 1800,
    vendorResponse: "Pending",
    timeline: [
      { date: "Feb 12, 2026", action: "Dispute filed against vendor" },
      { date: "Feb 13, 2026", action: "PO and invoice comparison generated" },
    ],
  },
  {
    id: "DSP-1005",
    type: "Vendor",
    filedBy: "Oakwood Properties",
    against: "QuickFix Plumbing",
    property: "Riverside Complex",
    unit: "Building B",
    amount: 1450,
    status: "Mediation",
    priority: "Medium",
    filedDate: "Jan 20, 2026",
    slaDeadline: "Feb 20, 2026",
    category: "Incomplete Work",
    description: "Plumbing repair incomplete - recurring leak in units 2A, 2B after service",
    evidenceCount: 6,
    workOrderRef: "WO-4498",
    originalAmount: 1450,
    vendorResponse: "Disputed",
    timeline: [
      { date: "Jan 20, 2026", action: "Dispute filed against vendor" },
      { date: "Jan 22, 2026", action: "Re-inspection scheduled" },
      { date: "Jan 28, 2026", action: "Vendor denied responsibility" },
      { date: "Feb 1, 2026", action: "Escalated to mediation" },
    ],
  },
  {
    id: "DSP-1006",
    type: "Vendor",
    filedBy: "Oakwood Properties",
    against: "ABC Maintenance Co.",
    property: "Oakwood Apartments",
    unit: "Parking Garage",
    amount: 2100,
    status: "Under Review",
    priority: "Low",
    filedDate: "Feb 8, 2026",
    slaDeadline: "Mar 1, 2026",
    category: "Unauthorized Charge",
    description: "Unauthorized additional materials charge not in original scope",
    evidenceCount: 2,
    workOrderRef: "WO-4510",
    originalAmount: 950,
    vendorResponse: "Acknowledged",
    timeline: [
      { date: "Feb 8, 2026", action: "Dispute filed against vendor" },
      { date: "Feb 10, 2026", action: "Vendor acknowledged discrepancy" },
    ],
  },
  {
    id: "DSP-1007",
    type: "Merchant",
    filedBy: "Lisa Chen",
    against: "GreenClean Laundry",
    property: "Oakwood Apartments",
    unit: "2D",
    amount: 89,
    status: "Open",
    priority: "Low",
    filedDate: "Feb 14, 2026",
    slaDeadline: "Feb 28, 2026",
    category: "Unauthorized Charge",
    description: "Double charge for laundry service on Feb 12",
    evidenceCount: 2,
    transactionRef: "TXN-88421",
    merchantName: "GreenClean Laundry",
    timeline: [
      { date: "Feb 14, 2026", action: "Dispute filed by tenant" },
      { date: "Feb 15, 2026", action: "Transaction records pulled" },
    ],
  },
  {
    id: "DSP-1008",
    type: "Merchant",
    filedBy: "Marcus Johnson",
    against: "FreshBite Cafe",
    property: "Oakwood Apartments",
    unit: "4A",
    amount: 156,
    status: "Under Review",
    priority: "Medium",
    filedDate: "Feb 6, 2026",
    slaDeadline: "Feb 20, 2026",
    category: "Service Not Received",
    description: "Catering order charged but never delivered for unit event",
    evidenceCount: 3,
    transactionRef: "TXN-87955",
    merchantName: "FreshBite Cafe",
    timeline: [
      { date: "Feb 6, 2026", action: "Dispute filed by tenant" },
      { date: "Feb 7, 2026", action: "Merchant contacted for delivery proof" },
      { date: "Feb 10, 2026", action: "Merchant unable to provide proof" },
    ],
  },
  {
    id: "DSP-1009",
    type: "Merchant",
    filedBy: "Rachel Torres",
    against: "PetCare Plus",
    property: "Riverside Complex",
    unit: "1B",
    amount: 275,
    status: "Resolved",
    priority: "Medium",
    filedDate: "Jan 15, 2026",
    slaDeadline: "Jan 29, 2026",
    category: "Quality Complaint",
    description: "Pet grooming service resulted in injury, vet bills incurred",
    evidenceCount: 5,
    transactionRef: "TXN-86102",
    merchantName: "PetCare Plus",
    resolutionType: "Full Refund",
    resolutionTime: 11,
    satisfactionScore: 4,
    timeline: [
      { date: "Jan 15, 2026", action: "Dispute filed by tenant" },
      { date: "Jan 16, 2026", action: "Vet records and photos submitted" },
      { date: "Jan 20, 2026", action: "Merchant accepted responsibility" },
      { date: "Jan 26, 2026", action: "Full refund issued" },
    ],
  },
  {
    id: "DSP-1010",
    type: "Rent",
    filedBy: "Kevin Williams",
    against: "Oakwood Properties",
    property: "Oakwood Apartments",
    unit: "6C",
    amount: 200,
    status: "Resolved",
    priority: "Low",
    filedDate: "Jan 10, 2026",
    slaDeadline: "Jan 24, 2026",
    category: "Late Fee",
    description: "Late fee disputed due to bank processing delay with documentation",
    evidenceCount: 2,
    mediator: "Brian Cooper",
    resolutionType: "Credit",
    resolutionTime: 5,
    satisfactionScore: 5,
    timeline: [
      { date: "Jan 10, 2026", action: "Dispute filed by tenant" },
      { date: "Jan 11, 2026", action: "Bank statement reviewed" },
      { date: "Jan 15, 2026", action: "Credit applied to account" },
    ],
  },
];

const statusVariant: Record<DisputeStatus, "destructive" | "outline" | "secondary" | "default"> = {
  Open: "outline",
  "Under Review": "default",
  Escalated: "destructive",
  Mediation: "outline",
  Resolved: "secondary",
  Closed: "secondary",
};

const priorityVariant: Record<DisputePriority, "destructive" | "outline" | "secondary" | "default"> = {
  Critical: "destructive",
  High: "destructive",
  Medium: "outline",
  Low: "secondary",
};

const typeIcon: Record<DisputeType, LucideIcon> = {
  Rent: Users,
  Vendor: Truck,
  Merchant: Store,
};

const statusDistribution = [
  { status: "Open", count: 4, color: "bg-blue-500" },
  { status: "Under Review", count: 3, color: "bg-amber-500" },
  { status: "Escalated", count: 1, color: "bg-red-500" },
  { status: "Mediation", count: 1, color: "bg-violet-500" },
  { status: "Resolved", count: 2, color: "bg-emerald-500" },
];

const resolvedDisputes = disputes.filter((d) => d.status === "Resolved" || d.status === "Closed");

const resolutionMetrics = {
  avgResolutionDays: 6.2,
  avgSatisfaction: 4.3,
  totalResolved: 28,
  thisMonth: 5,
};

export default function DisputeCenter() {
  const [activeTab, setActiveTab] = useState("all");
  const [typeFilter, setTypeFilter] = useState<DisputeType | "All">("All");

  const filteredDisputes = typeFilter === "All" ? disputes : disputes.filter((d) => d.type === typeFilter);
  const rentDisputes = disputes.filter((d) => d.type === "Rent");
  const vendorDisputes = disputes.filter((d) => d.type === "Vendor");
  const merchantDisputes = disputes.filter((d) => d.type === "Merchant");
  const totalStatusCount = statusDistribution.reduce((sum, s) => sum + s.count, 0);

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
        insight="AI analysis found 2 low-risk disputes (DSP-1007, DSP-1010) eligible for auto-resolution. Both have clear evidence of duplicate charges with matching transaction records. Auto-resolving could save 4 staff-hours and improve SLA compliance by 6%."
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
            {(["All", "Rent", "Vendor", "Merchant"] as const).map((t) => (
              <Button
                key={t}
                variant={typeFilter === t ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter(t)}
                data-testid={`button-filter-${t.toLowerCase()}`}
              >
                {t}
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
                        const TypeIcon = typeIcon[d.type];
                        return (
                          <tr key={d.id} className="border-b last:border-0 hover-elevate" data-testid={`row-dispute-${idx}`}>
                            <td className="p-3 font-mono text-xs">{d.id}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-1.5">
                                <TypeIcon className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="text-xs">{d.type}</span>
                              </div>
                            </td>
                            <td className="p-3 font-medium text-xs">{d.filedBy}</td>
                            <td className="p-3 text-muted-foreground text-xs">{d.against}</td>
                            <td className="p-3 text-muted-foreground text-xs">{d.property}</td>
                            <td className="p-3 text-muted-foreground text-xs">{d.unit}</td>
                            <td className="p-3 font-mono tabular-nums text-xs">${d.amount.toLocaleString()}</td>
                            <td className="p-3">
                              <Badge variant={statusVariant[d.status]} className="text-xs" data-testid={`badge-status-${idx}`}>
                                {d.status}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <Badge variant={priorityVariant[d.priority]} className="text-xs" data-testid={`badge-priority-${idx}`}>
                                {d.priority}
                              </Badge>
                            </td>
                            <td className="p-3 text-muted-foreground text-xs">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {d.filedDate}
                              </div>
                            </td>
                            <td className="p-3 text-muted-foreground text-xs">{d.slaDeadline}</td>
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
                      <span className="text-muted-foreground">{s.status}</span>
                      <span className="font-medium">{s.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className={`h-2 rounded-full ${s.color}`}
                        style={{ width: `${(s.count / totalStatusCount) * 100}%` }}
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
                        <td className="p-3 font-mono text-xs">{d.id}</td>
                        <td className="p-3 font-medium">{d.filedBy}</td>
                        <td className="p-3 text-muted-foreground">{d.unit}</td>
                        <td className="p-3 text-muted-foreground text-xs">{d.category}</td>
                        <td className="p-3 font-mono tabular-nums">${d.amount.toLocaleString()}</td>
                        <td className="p-3">
                          <Badge variant={statusVariant[d.status]} className="text-xs" data-testid={`badge-rent-status-${idx}`}>
                            {d.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant={priorityVariant[d.priority]} className="text-xs" data-testid={`badge-rent-priority-${idx}`}>
                            {d.priority}
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
            {rentDisputes.filter((d) => d.status !== "Resolved" && d.status !== "Closed").slice(0, 2).map((d, idx) => (
              <Card key={d.id} className="hover-elevate" data-testid={`card-rent-timeline-${idx}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <CardTitle className="text-sm">{d.id} - {d.category}</CardTitle>
                    <Badge variant={priorityVariant[d.priority]} className="text-xs">{d.priority}</Badge>
                  </div>
                  <CardDescription className="text-xs">{d.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1.5">
                    {d.timeline.map((t, tIdx) => (
                      <div key={tIdx} className="flex items-start gap-2 text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        <div>
                          <span className="text-muted-foreground">{t.date}</span>
                          <p>{t.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 pt-2 border-t text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Paperclip className="w-3 h-3" />
                      {d.evidenceCount} attachments
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {d.mediator}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      SLA: {d.slaDeadline}
                    </div>
                  </div>
                </CardContent>
              </Card>
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
                        <td className="p-3 font-mono text-xs">{d.id}</td>
                        <td className="p-3 font-medium">{d.against}</td>
                        <td className="p-3 text-muted-foreground text-xs">{d.property}</td>
                        <td className="p-3 text-muted-foreground text-xs">{d.category}</td>
                        <td className="p-3 font-mono text-xs">
                          <div className="flex items-center gap-1">
                            <FileText className="w-3 h-3 text-muted-foreground" />
                            {d.workOrderRef}
                          </div>
                        </td>
                        <td className="p-3 font-mono tabular-nums text-muted-foreground">${d.originalAmount?.toLocaleString()}</td>
                        <td className="p-3 font-mono tabular-nums font-medium">${d.amount.toLocaleString()}</td>
                        <td className="p-3">
                          <Badge variant={statusVariant[d.status]} className="text-xs" data-testid={`badge-vendor-status-${idx}`}>
                            {d.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge
                            variant={d.vendorResponse === "Pending" ? "outline" : d.vendorResponse === "Disputed" ? "destructive" : "secondary"}
                            className="text-xs"
                            data-testid={`badge-vendor-response-${idx}`}
                          >
                            <MessageSquare className="w-3 h-3 mr-1" />
                            {d.vendorResponse}
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
              {vendorDisputes.map((d, idx) => (
                <div key={d.id} className="flex items-center gap-3 text-sm" data-testid={`vendor-comparison-${idx}`}>
                  <span className="font-mono text-xs text-muted-foreground w-20">{d.id}</span>
                  <span className="text-xs text-muted-foreground w-36 truncate">{d.against}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <span className="font-mono tabular-nums text-xs text-muted-foreground">${d.originalAmount?.toLocaleString()}</span>
                    <ArrowUpRight className="w-3 h-3 text-red-500" />
                    <span className="font-mono tabular-nums text-xs font-medium">${d.amount.toLocaleString()}</span>
                    <span className="text-xs text-red-600 dark:text-red-400">
                      (+${((d.amount - (d.originalAmount || 0))).toLocaleString()})
                    </span>
                  </div>
                </div>
              ))}
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
                        <td className="p-3 font-mono text-xs">{d.id}</td>
                        <td className="p-3 font-medium">{d.filedBy}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <Store className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-xs">{d.merchantName}</span>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-xs text-muted-foreground">{d.transactionRef}</td>
                        <td className="p-3 text-muted-foreground text-xs">{d.category}</td>
                        <td className="p-3 font-mono tabular-nums">${d.amount.toLocaleString()}</td>
                        <td className="p-3">
                          <Badge variant={statusVariant[d.status]} className="text-xs" data-testid={`badge-merchant-status-${idx}`}>
                            {d.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant={priorityVariant[d.priority]} className="text-xs" data-testid={`badge-merchant-priority-${idx}`}>
                            {d.priority}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground text-xs">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {d.filedDate}
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
                    <CardTitle className="text-sm">{d.id}</CardTitle>
                    <Badge variant={statusVariant[d.status]} className="text-xs">{d.status}</Badge>
                  </div>
                  <CardDescription className="text-xs">{d.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Merchant</span>
                      <p className="font-medium">{d.merchantName}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Amount</span>
                      <p className="font-mono tabular-nums font-medium">${d.amount}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Transaction</span>
                      <p className="font-mono">{d.transactionRef}</p>
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
                <div className="text-xl font-mono tabular-nums font-semibold" data-testid="text-sla-met">87%</div>
                <Progress value={87} className="h-1.5 mt-1" data-testid="progress-sla" />
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
                    {resolvedDisputes.map((d, idx) => (
                      <tr key={d.id} className="border-b last:border-0 hover-elevate" data-testid={`row-resolved-${idx}`}>
                        <td className="p-3 font-mono text-xs">{d.id}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            {d.type === "Rent" && <Users className="w-3.5 h-3.5 text-muted-foreground" />}
                            {d.type === "Vendor" && <Truck className="w-3.5 h-3.5 text-muted-foreground" />}
                            {d.type === "Merchant" && <Store className="w-3.5 h-3.5 text-muted-foreground" />}
                            <span className="text-xs">{d.type}</span>
                          </div>
                        </td>
                        <td className="p-3 font-medium">{d.filedBy}</td>
                        <td className="p-3 font-mono tabular-nums">${d.amount.toLocaleString()}</td>
                        <td className="p-3">
                          <Badge variant="secondary" className="text-xs" data-testid={`badge-resolution-type-${idx}`}>
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {d.resolutionType}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className={`text-xs font-medium ${(d.resolutionTime || 0) <= 7 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                              {d.resolutionTime}d
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
                    ))}
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
