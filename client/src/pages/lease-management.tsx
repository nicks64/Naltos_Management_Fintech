import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AINudgeCard, AgentInsightStrip } from "@/components/ai-nudge-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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

const kpiCards = [
  { title: "Active Leases", value: "342", change: "+6 this month", icon: FileText },
  { title: "Expiring (30d)", value: "18", change: "5 high-risk", icon: Clock },
  { title: "Pending Renewals", value: "12", change: "8 offers sent", icon: RefreshCw },
  { title: "Avg Lease Term", value: "13.2 mo", change: "+0.4 mo", icon: CalendarDays },
];

const activeLeases = [
  { tenant: "Sarah Mitchell", unit: "3A", start: "Mar 1, 2025", end: "Feb 28, 2026", rent: 2150, status: "Active" },
  { tenant: "James Park", unit: "7B", start: "Jun 1, 2025", end: "May 31, 2026", rent: 1875, status: "Active" },
  { tenant: "Lisa Chen", unit: "2D", start: "Sep 1, 2024", end: "Aug 31, 2025", rent: 1950, status: "Month-to-Month" },
  { tenant: "Marcus Johnson", unit: "4A", start: "Jan 15, 2025", end: "Jan 14, 2026", rent: 2300, status: "Active" },
  { tenant: "Priya Patel", unit: "5C", start: "Apr 1, 2025", end: "Mar 31, 2026", rent: 1700, status: "Notice Given" },
  { tenant: "David Kim", unit: "8A", start: "Jul 1, 2024", end: "Jun 30, 2025", rent: 2050, status: "Expired" },
  { tenant: "Rachel Torres", unit: "1B", start: "Nov 1, 2025", end: "Oct 31, 2026", rent: 1825, status: "Active" },
  { tenant: "Kevin Williams", unit: "6C", start: "Aug 1, 2025", end: "Jul 31, 2026", rent: 2200, status: "Active" },
];

const renewals = [
  { tenant: "Lisa Chen", unit: "2D", currentEnd: "Aug 31, 2025", renewalProb: 0.87, offerStatus: "Sent", adjustment: 75, newRent: 2025, aiScore: "High" },
  { tenant: "David Kim", unit: "8A", currentEnd: "Jun 30, 2025", renewalProb: 0.62, offerStatus: "Pending", adjustment: 100, newRent: 2150, aiScore: "Medium" },
  { tenant: "Amanda Foster", unit: "9A", currentEnd: "Jul 15, 2025", renewalProb: 0.34, offerStatus: "Not Sent", adjustment: 0, newRent: 1900, aiScore: "Low" },
  { tenant: "Robert Chang", unit: "3D", currentEnd: "Sep 30, 2025", renewalProb: 0.91, offerStatus: "Accepted", adjustment: 50, newRent: 1800, aiScore: "High" },
  { tenant: "Jennifer Lopez", unit: "10B", currentEnd: "Aug 15, 2025", renewalProb: 0.78, offerStatus: "Sent", adjustment: 125, newRent: 2375, aiScore: "High" },
  { tenant: "Michael Brown", unit: "4D", currentEnd: "Oct 1, 2025", renewalProb: 0.55, offerStatus: "Declined", adjustment: 150, newRent: 2100, aiScore: "Medium" },
];

const rentIncreases = [
  { tenant: "Sarah Mitchell", unit: "3A", effectiveDate: "Mar 1, 2026", currentRent: 2150, newRent: 2250, increase: 4.7, notified: "Sent", status: "Acknowledged" },
  { tenant: "James Park", unit: "7B", effectiveDate: "Jun 1, 2026", currentRent: 1875, newRent: 1975, increase: 5.3, notified: "Sent", status: "Pending" },
  { tenant: "Marcus Johnson", unit: "4A", effectiveDate: "Jan 15, 2026", currentRent: 2300, newRent: 2400, increase: 4.3, notified: "Sent", status: "Accepted" },
  { tenant: "Rachel Torres", unit: "1B", effectiveDate: "Nov 1, 2026", currentRent: 1825, newRent: 1900, increase: 4.1, notified: "Not Sent", status: "Scheduled" },
  { tenant: "Kevin Williams", unit: "6C", effectiveDate: "Aug 1, 2026", currentRent: 2200, newRent: 2310, increase: 5.0, notified: "Not Sent", status: "Scheduled" },
  { tenant: "Robert Chang", unit: "3D", effectiveDate: "Oct 1, 2025", currentRent: 1750, newRent: 1800, increase: 2.9, notified: "Sent", status: "Accepted" },
];

const violations = [
  { id: "VIO-301", tenant: "James Park", unit: "7B", type: "Noise", severity: "High", status: "Open", reported: "Feb 18, 2026", description: "Repeated noise complaints after 11pm" },
  { id: "VIO-300", tenant: "David Kim", unit: "8A", type: "Unauthorized Occupant", severity: "Critical", status: "Investigating", reported: "Feb 15, 2026", description: "Unregistered resident observed over 14 days" },
  { id: "VIO-299", tenant: "Lisa Chen", unit: "2D", type: "Pet Violation", severity: "Medium", status: "Warning Issued", reported: "Feb 12, 2026", description: "Unregistered pet found during inspection" },
  { id: "VIO-298", tenant: "Amanda Foster", unit: "9A", type: "Late Payment", severity: "Low", status: "Resolved", reported: "Feb 10, 2026", description: "Rent payment 8 days past due" },
  { id: "VIO-297", tenant: "Kevin Williams", unit: "6C", type: "Noise", severity: "Medium", status: "Open", reported: "Feb 8, 2026", description: "Party noise on weeknight past quiet hours" },
  { id: "VIO-296", tenant: "Michael Brown", unit: "4D", type: "Pet Violation", severity: "High", status: "Escalated", reported: "Feb 5, 2026", description: "Aggressive dog incident in common area" },
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
  "Month-to-Month": "outline",
  "Notice Given": "destructive",
  Expired: "secondary",
};

const violationSeverityVariant: Record<string, "destructive" | "outline" | "secondary"> = {
  Critical: "destructive",
  High: "destructive",
  Medium: "outline",
  Low: "secondary",
};

const violationStatusVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  Open: "outline",
  Investigating: "default",
  "Warning Issued": "secondary",
  Escalated: "destructive",
  Resolved: "secondary",
};

const depositStatusVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  Processing: "outline",
  Refunded: "secondary",
  Disputed: "destructive",
};

const renewalOfferVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  "Not Sent": "outline",
  Sent: "default",
  Accepted: "secondary",
  Pending: "outline",
  Declined: "destructive",
};

const increaseStatusVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  Scheduled: "outline",
  Pending: "outline",
  Acknowledged: "default",
  Accepted: "secondary",
};

export default function LeaseManagement() {
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
              <div className="text-xl font-mono tabular-nums font-semibold" data-testid={`text-kpi-value-${index}`}>{card.value}</div>
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
                <Badge variant="secondary" className="text-xs">{activeLeases.length} leases</Badge>
              </div>
              <CardDescription>Current lease inventory with status tracking</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
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
                    {activeLeases.map((lease, idx) => (
                      <tr key={idx} className="border-b last:border-0 hover-elevate" data-testid={`row-lease-${idx}`}>
                        <td className="p-3 font-medium">{lease.tenant}</td>
                        <td className="p-3 text-muted-foreground">{lease.unit}</td>
                        <td className="p-3 text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <CalendarDays className="w-3.5 h-3.5" />
                            {lease.start}
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground">{lease.end}</td>
                        <td className="p-3 font-mono tabular-nums">${lease.rent.toLocaleString()}</td>
                        <td className="p-3">
                          <Badge variant={leaseStatusVariant[lease.status]} className="text-xs" data-testid={`badge-lease-status-${idx}`}>
                            {lease.status}
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
                    {renewals.map((r, idx) => (
                      <tr key={idx} className="border-b last:border-0 hover-elevate" data-testid={`row-renewal-${idx}`}>
                        <td className="p-3 font-medium">{r.tenant}</td>
                        <td className="p-3 text-muted-foreground">{r.unit}</td>
                        <td className="p-3 text-muted-foreground">{r.currentEnd}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Progress value={r.renewalProb * 100} className="h-2 w-16" data-testid={`progress-renewal-${idx}`} />
                            <span className={`text-xs font-medium ${r.renewalProb >= 0.7 ? "text-emerald-600 dark:text-emerald-400" : r.renewalProb >= 0.5 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>
                              {Math.round(r.renewalProb * 100)}%
                            </span>
                            <Badge variant="outline" className="text-[9px] px-1 py-0" data-testid={`badge-ai-score-${idx}`}>
                              <Brain className="w-2.5 h-2.5 mr-0.5 text-primary" />
                              {r.aiScore}
                            </Badge>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant={renewalOfferVariant[r.offerStatus]} className="text-xs" data-testid={`badge-offer-${idx}`}>
                            {r.offerStatus}
                          </Badge>
                        </td>
                        <td className="p-3">
                          {r.adjustment > 0 ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                              <ArrowUpRight className="w-3 h-3" />
                              +${r.adjustment}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">--</span>
                          )}
                        </td>
                        <td className="p-3 font-mono tabular-nums">${r.newRent.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                    {rentIncreases.map((ri, idx) => (
                      <tr key={idx} className="border-b last:border-0 hover-elevate" data-testid={`row-increase-${idx}`}>
                        <td className="p-3 font-medium">{ri.tenant}</td>
                        <td className="p-3 text-muted-foreground">{ri.unit}</td>
                        <td className="p-3 text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <CalendarDays className="w-3.5 h-3.5" />
                            {ri.effectiveDate}
                          </div>
                        </td>
                        <td className="p-3 font-mono tabular-nums text-muted-foreground">${ri.currentRent.toLocaleString()}</td>
                        <td className="p-3 font-mono tabular-nums font-medium">${ri.newRent.toLocaleString()}</td>
                        <td className="p-3">
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">+{ri.increase}%</span>
                        </td>
                        <td className="p-3">
                          {ri.notified === "Sent" ? (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Send className="w-3 h-3" />
                              Sent
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Not Sent</span>
                          )}
                        </td>
                        <td className="p-3">
                          <Badge variant={increaseStatusVariant[ri.status]} className="text-xs" data-testid={`badge-increase-status-${idx}`}>
                            {ri.status}
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
                    {violations.map((v, idx) => (
                      <tr key={v.id} className="border-b last:border-0 hover-elevate" data-testid={`row-violation-${idx}`}>
                        <td className="p-3 font-mono text-xs">{v.id}</td>
                        <td className="p-3 font-medium">{v.tenant}</td>
                        <td className="p-3 text-muted-foreground">{v.unit}</td>
                        <td className="p-3 text-muted-foreground">{v.type}</td>
                        <td className="p-3">
                          <Badge variant={violationSeverityVariant[v.severity]} className="text-xs" data-testid={`badge-violation-severity-${idx}`}>
                            {v.severity}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant={violationStatusVariant[v.status]} className="text-xs" data-testid={`badge-violation-status-${idx}`}>
                            {v.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">{v.reported}</td>
                        <td className="p-3 text-muted-foreground text-xs max-w-[200px] truncate">{v.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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