import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AINudgeCard, AgentInsightStrip } from "@/components/ai-nudge-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign,
  FileText,
  AlertTriangle,
  Brain,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  TrendingUp,
  Activity,
  CreditCard,
  Receipt,
  Users,
  Building2,
  ShieldCheck,
  Sparkles,
  Ban,
  ChevronRight,
  Target,
  type LucideIcon,
} from "lucide-react";

const agentInsights = [
  { text: "14 invoices pending approval totaling $47,200", severity: "warning" as const },
  { text: "7 receivables overdue by 30+ days ($12,800)", severity: "critical" as const },
  { text: "1099 preparation 82% complete for tax year", severity: "positive" as const, confidence: 0.95 },
];

const kpiCards = [
  { title: "AP Outstanding", value: "$128K", change: "23 invoices", trend: "warning", icon: Receipt },
  { title: "AR Outstanding", value: "$45K", change: "18 receivables", trend: "warning", icon: CreditCard },
  { title: "Overdue Invoices", value: "7", change: "+2 this week", trend: "warning", icon: AlertTriangle },
  { title: "Payment Plans Active", value: "12", change: "3 new this month", trend: "neutral", icon: Calendar },
];

const apInvoices = [
  { vendor: "AquaFix Plumbing", invoiceNum: "INV-4821", amount: 3450, dueDate: "Feb 28, 2026", status: "Pending", approver: "J. Martinez" },
  { vendor: "CoolAir Systems", invoiceNum: "INV-4819", amount: 8200, dueDate: "Mar 3, 2026", status: "Approved", approver: "S. Johnson" },
  { vendor: "SparkPro Electric", invoiceNum: "INV-4815", amount: 2180, dueDate: "Feb 22, 2026", status: "Overdue", approver: "J. Martinez" },
  { vendor: "GreenShield Pest", invoiceNum: "INV-4812", amount: 1650, dueDate: "Mar 5, 2026", status: "Pending", approver: "S. Johnson" },
  { vendor: "TopCover Roofing", invoiceNum: "INV-4808", amount: 24500, dueDate: "Mar 10, 2026", status: "Approved", approver: "M. Chen" },
  { vendor: "LiftTech Services", invoiceNum: "INV-4805", amount: 12800, dueDate: "Feb 15, 2026", status: "Paid", approver: "M. Chen" },
  { vendor: "AllPurpose Maint.", invoiceNum: "INV-4801", amount: 4300, dueDate: "Feb 20, 2026", status: "Overdue", approver: "J. Martinez" },
  { vendor: "SafeGuard Fire Co.", invoiceNum: "INV-4798", amount: 6750, dueDate: "Feb 18, 2026", status: "Paid", approver: "S. Johnson" },
];

const arReceivables = [
  { tenant: "Sarah Mitchell", unit: "3A", amountDue: 1850, type: "Rent", daysOverdue: 0, status: "Current" },
  { tenant: "James Rivera", unit: "7C", amountDue: 2100, type: "Rent", daysOverdue: 15, status: "Overdue" },
  { tenant: "Emily Watson", unit: "2D", amountDue: 325, type: "Utility", daysOverdue: 0, status: "Current" },
  { tenant: "Michael Park", unit: "5B", amountDue: 1950, type: "Rent", daysOverdue: 32, status: "Overdue" },
  { tenant: "Lisa Chen", unit: "4A", amountDue: 475, type: "Late Fee", daysOverdue: 45, status: "Overdue" },
  { tenant: "David Thompson", unit: "1C", amountDue: 2200, type: "Rent", daysOverdue: 0, status: "Current" },
  { tenant: "Karen Okafor", unit: "6A", amountDue: 850, type: "Damage", daysOverdue: 60, status: "Overdue" },
  { tenant: "Robert Kim", unit: "8B", amountDue: 1750, type: "Rent", daysOverdue: 5, status: "Current" },
];

const paymentPlans = [
  { tenant: "James Rivera", totalOwed: 4200, planAmount: 700, frequency: "Monthly", progressPct: 33, nextPayment: "Mar 1, 2026" },
  { tenant: "Michael Park", totalOwed: 3900, planAmount: 650, frequency: "Monthly", progressPct: 17, nextPayment: "Mar 1, 2026" },
  { tenant: "Lisa Chen", totalOwed: 1425, planAmount: 475, frequency: "Monthly", progressPct: 67, nextPayment: "Mar 15, 2026" },
  { tenant: "Karen Okafor", totalOwed: 2550, planAmount: 425, frequency: "Monthly", progressPct: 50, nextPayment: "Mar 1, 2026" },
  { tenant: "Patricia Gomez", totalOwed: 5100, planAmount: 850, frequency: "Monthly", progressPct: 25, nextPayment: "Mar 5, 2026" },
  { tenant: "Brian Nguyen", totalOwed: 2800, planAmount: 700, frequency: "Bi-Weekly", progressPct: 75, nextPayment: "Feb 28, 2026" },
  { tenant: "Angela Davis", totalOwed: 1200, planAmount: 400, frequency: "Monthly", progressPct: 83, nextPayment: "Mar 1, 2026" },
];

const lateFees = [
  { tenant: "James Rivera", unit: "7C", type: "Late Fee", amount: 150, date: "Feb 6, 2026", waived: false },
  { tenant: "Michael Park", unit: "5B", type: "Late Fee", amount: 150, date: "Feb 6, 2026", waived: false },
  { tenant: "Lisa Chen", unit: "4A", type: "NSF", amount: 75, date: "Jan 22, 2026", waived: false },
  { tenant: "Karen Okafor", unit: "6A", type: "Late Fee", amount: 150, date: "Jan 6, 2026", waived: true },
  { tenant: "Patricia Gomez", unit: "9B", type: "NSF", amount: 75, date: "Feb 3, 2026", waived: false },
  { tenant: "Brian Nguyen", unit: "2C", type: "Late Fee", amount: 150, date: "Jan 6, 2026", waived: false },
  { tenant: "Angela Davis", unit: "10A", type: "Late Fee", amount: 150, date: "Dec 6, 2025", waived: true },
  { tenant: "David Thompson", unit: "1C", type: "NSF", amount: 75, date: "Nov 15, 2025", waived: false },
];

const vendor1099 = [
  { vendor: "AquaFix Plumbing", totalPaidYTD: 28400, w9Status: "On File", status1099: "Ready", filingDeadline: "Jan 31, 2027" },
  { vendor: "CoolAir Systems", totalPaidYTD: 42300, w9Status: "On File", status1099: "Ready", filingDeadline: "Jan 31, 2027" },
  { vendor: "SparkPro Electric", totalPaidYTD: 18900, w9Status: "On File", status1099: "Ready", filingDeadline: "Jan 31, 2027" },
  { vendor: "GreenShield Pest", totalPaidYTD: 9800, w9Status: "Expired", status1099: "Needs W-9", filingDeadline: "Jan 31, 2027" },
  { vendor: "TopCover Roofing", totalPaidYTD: 54200, w9Status: "On File", status1099: "Ready", filingDeadline: "Jan 31, 2027" },
  { vendor: "LiftTech Services", totalPaidYTD: 36700, w9Status: "On File", status1099: "In Review", filingDeadline: "Jan 31, 2027" },
  { vendor: "AllPurpose Maint.", totalPaidYTD: 15400, w9Status: "Missing", status1099: "Needs W-9", filingDeadline: "Jan 31, 2027" },
  { vendor: "SafeGuard Fire Co.", totalPaidYTD: 22100, w9Status: "On File", status1099: "Ready", filingDeadline: "Jan 31, 2027" },
];

const apStatusVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  Pending: "outline",
  Approved: "default",
  Paid: "secondary",
  Overdue: "destructive",
};

const arStatusVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  Current: "secondary",
  Overdue: "destructive",
};

const typeVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  Rent: "default",
  Utility: "outline",
  "Late Fee": "destructive",
  Damage: "destructive",
  NSF: "destructive",
};

const w9Variant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  "On File": "secondary",
  Expired: "outline",
  Missing: "destructive",
};

const status1099Variant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  Ready: "secondary",
  "In Review": "outline",
  "Needs W-9": "destructive",
};

function formatCurrency(val: number) {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
  return `$${val.toLocaleString()}`;
}

export default function Accounts() {
  return (
    <div className="space-y-6" data-testid="page-accounts">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-page-title">Accounts Payable / Receivable</h1>
          <p className="text-muted-foreground">Invoice processing, payment tracking, and vendor compliance management</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs" data-testid="badge-agent-status">
            <Brain className="w-3 h-3 mr-1 text-primary" />
            Agent Active
          </Badge>
          <Button size="sm" data-testid="button-new-invoice">
            <FileText className="w-3 h-3 mr-1" />
            New Invoice
          </Button>
        </div>
      </div>

      <AgentInsightStrip insights={agentInsights} />

      <AINudgeCard
        title="Early Payment Discount Opportunity"
        insight="Agent identified 3 vendor invoices eligible for early payment discounts. Paying AquaFix, CoolAir, and TopCover within 10 days saves 2% per invoice, totaling $2,400 in annual savings across recurring vendor relationships."
        confidence={0.93}
        severity="opportunity"
        icon={Target}
        actionLabel="Approve Early Payments"
        onAction={() => {}}
        secondaryLabel="View Invoices"
        onSecondary={() => {}}
        metric="$2,400"
        metricLabel="Projected Savings"
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
                {card.trend === "warning" ? (
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                ) : (
                  <Activity className="w-3 h-3 text-muted-foreground" />
                )}
                <span className={card.trend === "warning" ? "text-amber-600" : "text-muted-foreground"}>{card.change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="ap" className="space-y-4">
        <TabsList data-testid="tabs-accounts">
          <TabsTrigger value="ap" data-testid="tab-ap">Accounts Payable</TabsTrigger>
          <TabsTrigger value="ar" data-testid="tab-ar">Accounts Receivable</TabsTrigger>
          <TabsTrigger value="payment-plans" data-testid="tab-payment-plans">Payment Plans</TabsTrigger>
          <TabsTrigger value="late-fees" data-testid="tab-late-fees">Late Fees & NSF</TabsTrigger>
          <TabsTrigger value="1099" data-testid="tab-1099">1099 Preparation</TabsTrigger>
        </TabsList>

        <TabsContent value="ap" className="space-y-4">
          <Card data-testid="card-accounts-payable">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Receipt className="w-5 h-5 text-primary" />
                <CardTitle>Vendor Invoices</CardTitle>
                <Badge variant="secondary" className="text-xs">{apInvoices.length} invoices</Badge>
              </div>
              <CardDescription>Pending, approved, and paid vendor invoices with approval workflow</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Vendor</th>
                      <th className="p-3 font-medium text-muted-foreground">Invoice #</th>
                      <th className="p-3 font-medium text-muted-foreground">Amount</th>
                      <th className="p-3 font-medium text-muted-foreground">Due Date</th>
                      <th className="p-3 font-medium text-muted-foreground">Status</th>
                      <th className="p-3 font-medium text-muted-foreground">Approver</th>
                      <th className="p-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apInvoices.map((inv, idx) => (
                      <tr key={inv.invoiceNum} className="border-b last:border-0" data-testid={`row-ap-${idx}`}>
                        <td className="p-3 font-medium">{inv.vendor}</td>
                        <td className="p-3 font-mono text-xs">{inv.invoiceNum}</td>
                        <td className="p-3 font-mono text-xs">{formatCurrency(inv.amount)}</td>
                        <td className="p-3 text-muted-foreground text-xs">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {inv.dueDate}
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant={apStatusVariant[inv.status]} className="text-xs" data-testid={`badge-ap-status-${idx}`}>
                            {inv.status === "Paid" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {inv.status === "Overdue" && <AlertTriangle className="w-3 h-3 mr-1" />}
                            {inv.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground text-xs">{inv.approver}</td>
                        <td className="p-3">
                          {inv.status === "Pending" && (
                            <Button variant="outline" size="sm" data-testid={`button-approve-${idx}`}>
                              Approve
                            </Button>
                          )}
                          {inv.status === "Approved" && (
                            <Button variant="outline" size="sm" data-testid={`button-pay-${idx}`}>
                              Pay
                            </Button>
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

        <TabsContent value="ar" className="space-y-4">
          <Card data-testid="card-accounts-receivable">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <CreditCard className="w-5 h-5 text-primary" />
                <CardTitle>Tenant Receivables</CardTitle>
                <Badge variant="secondary" className="text-xs">{arReceivables.length} receivables</Badge>
              </div>
              <CardDescription>Outstanding tenant balances by type with aging status</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Tenant</th>
                      <th className="p-3 font-medium text-muted-foreground">Unit</th>
                      <th className="p-3 font-medium text-muted-foreground">Amount Due</th>
                      <th className="p-3 font-medium text-muted-foreground">Type</th>
                      <th className="p-3 font-medium text-muted-foreground">Days Overdue</th>
                      <th className="p-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {arReceivables.map((ar, idx) => (
                      <tr key={idx} className="border-b last:border-0" data-testid={`row-ar-${idx}`}>
                        <td className="p-3 font-medium">{ar.tenant}</td>
                        <td className="p-3 text-muted-foreground">{ar.unit}</td>
                        <td className="p-3 font-mono text-xs">{formatCurrency(ar.amountDue)}</td>
                        <td className="p-3">
                          <Badge variant={typeVariant[ar.type]} className="text-xs" data-testid={`badge-ar-type-${idx}`}>
                            {ar.type}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <span className={ar.daysOverdue > 30 ? "text-red-600 dark:text-red-400 font-medium" : ar.daysOverdue > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}>
                            {ar.daysOverdue > 0 ? `${ar.daysOverdue} days` : "--"}
                          </span>
                        </td>
                        <td className="p-3">
                          <Badge variant={arStatusVariant[ar.status]} className="text-xs" data-testid={`badge-ar-status-${idx}`}>
                            {ar.status === "Current" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {ar.status === "Overdue" && <AlertTriangle className="w-3 h-3 mr-1" />}
                            {ar.status}
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

        <TabsContent value="payment-plans" className="space-y-4">
          <Card data-testid="card-payment-plans">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <DollarSign className="w-5 h-5 text-primary" />
                <CardTitle>Active Payment Plans</CardTitle>
                <Badge variant="secondary" className="text-xs">{paymentPlans.length} active</Badge>
              </div>
              <CardDescription>Structured payment arrangements with progress tracking</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Tenant</th>
                      <th className="p-3 font-medium text-muted-foreground">Total Owed</th>
                      <th className="p-3 font-medium text-muted-foreground">Plan Amount</th>
                      <th className="p-3 font-medium text-muted-foreground">Frequency</th>
                      <th className="p-3 font-medium text-muted-foreground">Progress</th>
                      <th className="p-3 font-medium text-muted-foreground">Next Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentPlans.map((plan, idx) => (
                      <tr key={idx} className="border-b last:border-0" data-testid={`row-payment-plan-${idx}`}>
                        <td className="p-3 font-medium">{plan.tenant}</td>
                        <td className="p-3 font-mono text-xs">{formatCurrency(plan.totalOwed)}</td>
                        <td className="p-3 font-mono text-xs">{formatCurrency(plan.planAmount)}</td>
                        <td className="p-3 text-muted-foreground text-xs">{plan.frequency}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Progress value={plan.progressPct} className="h-2 w-16" data-testid={`progress-plan-${idx}`} />
                            <span className="text-xs text-muted-foreground">{plan.progressPct}%</span>
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground text-xs">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {plan.nextPayment}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="late-fees" className="space-y-4">
          <Card data-testid="card-late-fees">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Ban className="w-5 h-5 text-primary" />
                <CardTitle>Late Fees & NSF Charges</CardTitle>
                <Badge variant="secondary" className="text-xs">{lateFees.length} charges</Badge>
              </div>
              <CardDescription>Late payment penalties and returned check (NSF) charges</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Tenant</th>
                      <th className="p-3 font-medium text-muted-foreground">Unit</th>
                      <th className="p-3 font-medium text-muted-foreground">Type</th>
                      <th className="p-3 font-medium text-muted-foreground">Amount</th>
                      <th className="p-3 font-medium text-muted-foreground">Date</th>
                      <th className="p-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lateFees.map((fee, idx) => (
                      <tr key={idx} className="border-b last:border-0" data-testid={`row-late-fee-${idx}`}>
                        <td className="p-3 font-medium">{fee.tenant}</td>
                        <td className="p-3 text-muted-foreground">{fee.unit}</td>
                        <td className="p-3">
                          <Badge variant={typeVariant[fee.type]} className="text-xs" data-testid={`badge-fee-type-${idx}`}>
                            {fee.type}
                          </Badge>
                        </td>
                        <td className="p-3 font-mono text-xs">${fee.amount}</td>
                        <td className="p-3 text-muted-foreground text-xs">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {fee.date}
                          </div>
                        </td>
                        <td className="p-3">
                          {fee.waived ? (
                            <Badge variant="secondary" className="text-xs" data-testid={`badge-fee-waived-${idx}`}>
                              <XCircle className="w-3 h-3 mr-1" />
                              Waived
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs" data-testid={`badge-fee-active-${idx}`}>
                              <DollarSign className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
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

        <TabsContent value="1099" className="space-y-4">
          <Card data-testid="card-1099-preparation">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <CardTitle>1099 Preparation</CardTitle>
                <Badge variant="secondary" className="text-xs">Tax Year 2026</Badge>
              </div>
              <CardDescription>Vendor 1099-NEC readiness status and W-9 compliance tracking</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Vendor</th>
                      <th className="p-3 font-medium text-muted-foreground">Total Paid YTD</th>
                      <th className="p-3 font-medium text-muted-foreground">W-9 Status</th>
                      <th className="p-3 font-medium text-muted-foreground">1099 Status</th>
                      <th className="p-3 font-medium text-muted-foreground">Filing Deadline</th>
                      <th className="p-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendor1099.map((v, idx) => (
                      <tr key={idx} className="border-b last:border-0" data-testid={`row-1099-${idx}`}>
                        <td className="p-3 font-medium">{v.vendor}</td>
                        <td className="p-3 font-mono text-xs">{formatCurrency(v.totalPaidYTD)}</td>
                        <td className="p-3">
                          <Badge variant={w9Variant[v.w9Status]} className="text-xs" data-testid={`badge-w9-status-${idx}`}>
                            {v.w9Status === "On File" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {v.w9Status === "Missing" && <XCircle className="w-3 h-3 mr-1" />}
                            {v.w9Status === "Expired" && <Clock className="w-3 h-3 mr-1" />}
                            {v.w9Status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant={status1099Variant[v.status1099]} className="text-xs" data-testid={`badge-1099-status-${idx}`}>
                            {v.status1099}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground text-xs">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {v.filingDeadline}
                          </div>
                        </td>
                        <td className="p-3">
                          {v.status1099 === "Needs W-9" && (
                            <Button variant="outline" size="sm" data-testid={`button-request-w9-${idx}`}>
                              Request W-9
                            </Button>
                          )}
                          {v.status1099 === "In Review" && (
                            <Button variant="outline" size="sm" data-testid={`button-review-1099-${idx}`}>
                              Review
                            </Button>
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
