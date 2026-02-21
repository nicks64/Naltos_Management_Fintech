import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AINudgeCard, AgentInsightStrip } from "@/components/ai-nudge-card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  BarChart3, TrendingUp, DollarSign, Users, Shield, FileText, Settings,
  Activity, Star, Calendar, Bell, LogOut, Briefcase, Target, Eye,
  Lock, Unlock, CheckCircle2, AlertCircle, Clock, Download, Copy,
  RefreshCw, ExternalLink, Search, Filter, Database, UserCheck,
  Building, Home, PiggyBank, ShieldCheck, ClipboardList, KeyRound
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const partnerInsights = [
  { text: "Lead conversion up 8% this month", severity: "positive" as const, confidence: 0.91 },
  { text: "2 compliance items need renewal", severity: "warning" as const, confidence: 0.95 },
  { text: "Insurance leads trending above benchmark", severity: "positive" as const },
];

const kpis = [
  { label: "Active Leads", value: "47", icon: Users, testId: "text-active-leads" },
  { label: "Conversion Rate", value: "32.4%", icon: Target, testId: "text-conversion-rate" },
  { label: "Revenue Share", value: "$18,420", icon: DollarSign, testId: "text-revenue-share" },
  { label: "Partner Score", value: "94/100", icon: Star, testId: "text-partner-score" },
];

const recentActivity = [
  { id: 1, text: "New insurance lead assigned: L-1089", date: "Feb 21, 2026", type: "lead", icon: Users, color: "text-blue-600 dark:text-blue-400 bg-blue-500/10" },
  { id: 2, text: "Mortgage lead L-1082 converted", date: "Feb 20, 2026", type: "conversion", icon: CheckCircle2, color: "text-green-600 dark:text-green-400 bg-green-500/10" },
  { id: 3, text: "Compliance certificate renewed", date: "Feb 19, 2026", type: "compliance", icon: Shield, color: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10" },
  { id: 4, text: "Revenue share payout: $3,240", date: "Feb 18, 2026", type: "payment", icon: DollarSign, color: "text-green-600 dark:text-green-400 bg-green-500/10" },
  { id: 5, text: "Data access audit completed", date: "Feb 17, 2026", type: "audit", icon: Eye, color: "text-amber-600 dark:text-amber-400 bg-amber-500/10" },
  { id: 6, text: "New investment lead assigned: L-1085", date: "Feb 16, 2026", type: "lead", icon: Users, color: "text-blue-600 dark:text-blue-400 bg-blue-500/10" },
];

const partnerMetrics = [
  { label: "Leads This Month", value: 23, target: 30, percent: 77 },
  { label: "Avg Response Time", value: "2.4h", target: "4h", percent: 60 },
  { label: "Client Satisfaction", value: "4.8/5", target: "4.5/5", percent: 96 },
  { label: "Compliance Score", value: "94%", target: "90%", percent: 100 },
];

const leads = [
  { id: "L-1089", tenant: "J***n S.", property: "Sunset Heights Apt 4B", type: "Insurance", subtype: "Renters Insurance", status: "New" as const, date: "2026-02-21", value: 1200 },
  { id: "L-1088", tenant: "M***a K.", property: "Parkview Towers 12A", type: "Mortgage", subtype: "First-Time Buyer", status: "Contacted" as const, date: "2026-02-20", value: 8500 },
  { id: "L-1087", tenant: "R***t P.", property: "Cedar Ridge Villa 7", type: "Investment", subtype: "Tenant Savings", status: "Qualified" as const, date: "2026-02-19", value: 3200 },
  { id: "L-1086", tenant: "S***a L.", property: "The Metropolitan 3C", type: "Insurance", subtype: "Liability", status: "Converted" as const, date: "2026-02-18", value: 2100 },
  { id: "L-1085", tenant: "D***d W.", property: "Sunset Heights Apt 8A", type: "Investment", subtype: "Investment Vehicle", status: "New" as const, date: "2026-02-17", value: 5000 },
  { id: "L-1084", tenant: "A***e M.", property: "Parkview Towers 5B", type: "Mortgage", subtype: "First-Time Buyer", status: "Declined" as const, date: "2026-02-16", value: 7200 },
  { id: "L-1083", tenant: "T***s B.", property: "Cedar Ridge Villa 2", type: "Insurance", subtype: "Renters Insurance", status: "Contacted" as const, date: "2026-02-15", value: 980 },
  { id: "L-1082", tenant: "L***a C.", property: "The Metropolitan 9D", type: "Mortgage", subtype: "First-Time Buyer", status: "Converted" as const, date: "2026-02-14", value: 9800 },
  { id: "L-1081", tenant: "K***n R.", property: "Sunset Heights Apt 2C", type: "Investment", subtype: "Tenant Savings", status: "Qualified" as const, date: "2026-02-13", value: 4100 },
  { id: "L-1080", tenant: "E***n T.", property: "Parkview Towers 8C", type: "Insurance", subtype: "Liability", status: "New" as const, date: "2026-02-12", value: 1800 },
];

const pipelineStages = [
  { stage: "New", count: 12, color: "bg-blue-500" },
  { stage: "Contacted", count: 9, color: "bg-amber-500" },
  { stage: "Qualified", count: 7, color: "bg-purple-500" },
  { stage: "Converted", count: 15, color: "bg-green-500" },
  { stage: "Declined", count: 4, color: "bg-red-500" },
];

const leadStatusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  New: "outline",
  Contacted: "secondary",
  Qualified: "secondary",
  Converted: "default",
  Declined: "destructive",
};

const complianceItems = [
  { id: "lic-1", name: "Insurance Broker License", category: "License", status: "Valid" as const, expiry: "2027-03-15", lastVerified: "2026-01-20", required: true },
  { id: "lic-2", name: "State Insurance Producer License", category: "License", status: "Valid" as const, expiry: "2026-12-01", lastVerified: "2026-01-20", required: true },
  { id: "lic-3", name: "Mortgage Originator License (NMLS)", category: "License", status: "Valid" as const, expiry: "2026-08-30", lastVerified: "2026-02-01", required: true },
  { id: "lic-4", name: "Series 65 Investment Adviser", category: "Certification", status: "Expiring" as const, expiry: "2026-04-15", lastVerified: "2025-11-10", required: true },
  { id: "lic-5", name: "Data Privacy Agreement (DPA)", category: "Agreement", status: "Valid" as const, expiry: "2027-01-01", lastVerified: "2026-01-15", required: true },
  { id: "lic-6", name: "Tenant Data Access Agreement", category: "Agreement", status: "Valid" as const, expiry: "2026-12-31", lastVerified: "2026-01-15", required: true },
  { id: "lic-7", name: "E&O Insurance Policy", category: "Insurance", status: "Valid" as const, expiry: "2026-09-01", lastVerified: "2026-02-05", required: true },
  { id: "lic-8", name: "Anti-Money Laundering (AML) Certification", category: "Certification", status: "Pending" as const, expiry: "2026-06-01", lastVerified: "N/A", required: true },
  { id: "lic-9", name: "FINRA BrokerCheck Registration", category: "Registration", status: "Valid" as const, expiry: "2027-05-01", lastVerified: "2026-01-25", required: false },
];

const complianceStatusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Valid: "default",
  Expiring: "secondary",
  Pending: "outline",
  Expired: "destructive",
};

const complianceStatusIcons: Record<string, typeof CheckCircle2> = {
  Valid: CheckCircle2,
  Expiring: AlertCircle,
  Pending: Clock,
  Expired: AlertCircle,
};

const dataCategories = [
  { category: "Contact Information", description: "Tenant name, email, phone", access: "Aggregated" as const, consents: 312, lastAccessed: "2026-02-21" },
  { category: "Lease Details", description: "Lease term, rent amount, property", access: "Full" as const, consents: 289, lastAccessed: "2026-02-21" },
  { category: "Payment History", description: "Rent payment records, on-time rate", access: "Aggregated" as const, consents: 245, lastAccessed: "2026-02-20" },
  { category: "Credit Indicators", description: "Credit-builder score, payment behavior", access: "Aggregated" as const, consents: 198, lastAccessed: "2026-02-19" },
  { category: "Insurance Status", description: "Current policies, coverage gaps", access: "Full" as const, consents: 276, lastAccessed: "2026-02-21" },
  { category: "Financial Profile", description: "Income range, savings indicators", access: "None" as const, consents: 0, lastAccessed: "N/A" },
  { category: "Maintenance Requests", description: "Service history, property condition", access: "None" as const, consents: 0, lastAccessed: "N/A" },
];

const accessLevelConfig: Record<string, { icon: typeof Eye; color: string; bg: string }> = {
  Full: { icon: Unlock, color: "text-green-600 dark:text-green-400", bg: "bg-green-500/10" },
  Aggregated: { icon: Eye, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
  None: { icon: Lock, color: "text-muted-foreground", bg: "bg-muted" },
};

const auditLog = [
  { id: "aud-1", action: "Data Export", category: "Lease Details", records: 45, user: "api-key-prod", date: "2026-02-21 14:32", status: "Completed" },
  { id: "aud-2", action: "Query", category: "Credit Indicators", records: 120, user: "partner-admin", date: "2026-02-20 09:15", status: "Completed" },
  { id: "aud-3", action: "Data Export", category: "Insurance Status", records: 89, user: "api-key-prod", date: "2026-02-19 16:44", status: "Completed" },
  { id: "aud-4", action: "Query", category: "Payment History", records: 200, user: "api-key-prod", date: "2026-02-18 11:20", status: "Completed" },
  { id: "aud-5", action: "Consent Refresh", category: "Contact Information", records: 312, user: "system", date: "2026-02-17 00:00", status: "Completed" },
];

const revenueData = [
  { month: "Sep", revenue: 12400, leads: 18 },
  { month: "Oct", revenue: 14200, leads: 22 },
  { month: "Nov", revenue: 13800, leads: 20 },
  { month: "Dec", revenue: 16500, leads: 28 },
  { month: "Jan", revenue: 17200, leads: 31 },
  { month: "Feb", revenue: 18420, leads: 34 },
];

const funnelStages = [
  { stage: "Leads Received", count: 156, percent: 100 },
  { stage: "Contacted", count: 112, percent: 72 },
  { stage: "Qualified", count: 78, percent: 50 },
  { stage: "Proposal Sent", count: 52, percent: 33 },
  { stage: "Converted", count: 38, percent: 24 },
];

const benchmarks = [
  { metric: "Conversion Rate", yours: 32.4, benchmark: 28.0, unit: "%" },
  { metric: "Avg Response Time", yours: 2.4, benchmark: 4.0, unit: "hrs" },
  { metric: "Client Satisfaction", yours: 4.8, benchmark: 4.2, unit: "/5" },
  { metric: "Revenue per Lead", yours: 484, benchmark: 380, unit: "$" },
];

const notificationPrefs = [
  { id: "notif-new-lead", label: "New Lead Assigned", description: "Get notified when a new lead is routed to you", default: true },
  { id: "notif-lead-status", label: "Lead Status Change", description: "Updates when lead status changes", default: true },
  { id: "notif-compliance", label: "Compliance Reminders", description: "License and certification expiry alerts", default: true },
  { id: "notif-payout", label: "Revenue Payouts", description: "Notifications for revenue share payments", default: true },
  { id: "notif-data-access", label: "Data Access Alerts", description: "Alerts when data access permissions change", default: false },
  { id: "notif-weekly", label: "Weekly Digest", description: "Weekly summary of leads and performance", default: true },
];

export default function PartnerPortal() {
  const [leadTypeFilter, setLeadTypeFilter] = useState("all");
  const [leadStatusFilter, setLeadStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<Record<string, boolean>>(
    Object.fromEntries(notificationPrefs.map(n => [n.id, n.default]))
  );

  const filteredLeads = leads.filter((lead) => {
    if (leadTypeFilter !== "all" && lead.type !== leadTypeFilter) return false;
    if (leadStatusFilter !== "all" && lead.status !== leadStatusFilter) return false;
    if (searchQuery && !lead.id.toLowerCase().includes(searchQuery.toLowerCase()) && !lead.tenant.toLowerCase().includes(searchQuery.toLowerCase()) && !lead.property.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const totalPipeline = pipelineStages.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between gap-4 flex-wrap p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Briefcase className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-lg font-semibold" data-testid="text-partner-name">Acme Insurance Partners</h1>
              <p className="text-xs text-muted-foreground">Partner Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="icon" data-testid="button-notifications">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" data-testid="button-logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6 space-y-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="flex flex-wrap gap-1" data-testid="tabs-list">
            <TabsTrigger value="dashboard" data-testid="tab-dashboard">
              <BarChart3 className="h-4 w-4 mr-1.5" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="leads" data-testid="tab-leads">
              <Users className="h-4 w-4 mr-1.5" />
              Leads & Referrals
            </TabsTrigger>
            <TabsTrigger value="compliance" data-testid="tab-compliance">
              <Shield className="h-4 w-4 mr-1.5" />
              Compliance
            </TabsTrigger>
            <TabsTrigger value="data-access" data-testid="tab-data-access">
              <Database className="h-4 w-4 mr-1.5" />
              Data Access
            </TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">
              <TrendingUp className="h-4 w-4 mr-1.5" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">
              <Settings className="h-4 w-4 mr-1.5" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <AgentInsightStrip insights={partnerInsights} />

            <AINudgeCard
              title="Lead Quality Optimization"
              insight="Insurance leads from properties with 90%+ occupancy convert at 2.3x the average rate. Consider prioritizing leads from Sunset Heights and The Metropolitan for highest ROI."
              severity="opportunity"
              confidence={0.87}
              actionLabel="View High-Value Leads"
              onAction={() => {}}
              metric="+$4.2K/mo"
              metricLabel="Potential Revenue"
              agentSource="Partner Agent"
              compact
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {kpis.map((kpi) => (
                <Card key={kpi.label}>
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{kpi.label}</CardTitle>
                    <kpi.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold font-mono" data-testid={kpi.testId}>
                      {kpi.value}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card data-testid="card-recent-activity">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 flex-wrap">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivity.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.id} className="flex items-start gap-3" data-testid={`activity-item-${item.id}`}>
                          <div className={`flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center ${item.color}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">{item.text}</p>
                            <p className="text-xs text-muted-foreground">{item.date}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-partner-metrics">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 flex-wrap">
                    <Target className="h-5 w-5" />
                    Program Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {partnerMetrics.map((metric) => (
                      <div key={metric.label} className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-sm">{metric.label}</span>
                          <span className="text-sm font-mono font-medium">
                            {metric.value} / {metric.target}
                          </span>
                        </div>
                        <Progress value={metric.percent} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Leads & Referrals Tab */}
          <TabsContent value="leads" className="space-y-6">
            <Card data-testid="card-lead-pipeline">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 flex-wrap">
                  <TrendingUp className="h-5 w-5" />
                  Lead Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 h-8 rounded-md overflow-hidden mb-3">
                  {pipelineStages.map((stage) => (
                    <div
                      key={stage.stage}
                      className={`h-full ${stage.color} flex items-center justify-center text-xs font-medium text-white`}
                      style={{ width: `${(stage.count / totalPipeline) * 100}%` }}
                      data-testid={`pipeline-${stage.stage.toLowerCase()}`}
                    >
                      {stage.count}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  {pipelineStages.map((stage) => (
                    <div key={stage.stage} className="flex items-center gap-1.5">
                      <div className={`w-2.5 h-2.5 rounded-sm ${stage.color}`} />
                      <span className="text-xs text-muted-foreground">{stage.stage} ({stage.count})</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-leads-table">
              <CardHeader>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <CardTitle className="flex items-center gap-2 flex-wrap">
                    <Users className="h-5 w-5" />
                    Tenant Leads
                  </CardTitle>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search leads..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 w-48"
                        data-testid="input-lead-search"
                      />
                    </div>
                    <Button
                      variant={leadTypeFilter !== "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setLeadTypeFilter(leadTypeFilter === "all" ? "Insurance" : leadTypeFilter === "Insurance" ? "Mortgage" : leadTypeFilter === "Mortgage" ? "Investment" : "all")}
                      data-testid="button-filter-type"
                    >
                      <Filter className="h-3.5 w-3.5 mr-1" />
                      {leadTypeFilter === "all" ? "All Types" : leadTypeFilter}
                    </Button>
                    <Button
                      variant={leadStatusFilter !== "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setLeadStatusFilter(leadStatusFilter === "all" ? "New" : leadStatusFilter === "New" ? "Contacted" : leadStatusFilter === "Contacted" ? "Qualified" : leadStatusFilter === "Qualified" ? "Converted" : leadStatusFilter === "Converted" ? "Declined" : "all")}
                      data-testid="button-filter-status"
                    >
                      <Filter className="h-3.5 w-3.5 mr-1" />
                      {leadStatusFilter === "all" ? "All Status" : leadStatusFilter}
                    </Button>
                    <Button variant="outline" size="sm" data-testid="button-export-leads">
                      <Download className="h-3.5 w-3.5 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-3 pr-4 font-medium text-muted-foreground">Lead ID</th>
                        <th className="pb-3 pr-4 font-medium text-muted-foreground">Tenant</th>
                        <th className="pb-3 pr-4 font-medium text-muted-foreground">Property</th>
                        <th className="pb-3 pr-4 font-medium text-muted-foreground">Type</th>
                        <th className="pb-3 pr-4 font-medium text-muted-foreground">Status</th>
                        <th className="pb-3 pr-4 font-medium text-muted-foreground">Date</th>
                        <th className="pb-3 font-medium text-muted-foreground text-right">Est. Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeads.map((lead) => (
                        <tr key={lead.id} className="border-b last:border-b-0" data-testid={`lead-row-${lead.id}`}>
                          <td className="py-3 pr-4 font-mono text-xs">{lead.id}</td>
                          <td className="py-3 pr-4">{lead.tenant}</td>
                          <td className="py-3 pr-4 text-muted-foreground">{lead.property}</td>
                          <td className="py-3 pr-4">
                            <Badge variant="outline">{lead.type}</Badge>
                          </td>
                          <td className="py-3 pr-4">
                            <Badge variant={leadStatusVariants[lead.status]}>{lead.status}</Badge>
                          </td>
                          <td className="py-3 pr-4 text-muted-foreground text-xs">{lead.date}</td>
                          <td className="py-3 text-right font-mono">{formatCurrency(lead.value)}</td>
                        </tr>
                      ))}
                      {filteredLeads.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-muted-foreground">
                            No leads match the current filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance & Licensing Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valid</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold font-mono" data-testid="text-compliance-valid">
                    {complianceItems.filter(c => c.status === "Valid").length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Expiring</CardTitle>
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold font-mono" data-testid="text-compliance-expiring">
                    {complianceItems.filter(c => c.status === "Expiring").length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold font-mono" data-testid="text-compliance-pending">
                    {complianceItems.filter(c => c.status === "Pending").length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
                  <ShieldCheck className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold font-mono" data-testid="text-compliance-score">94%</div>
                </CardContent>
              </Card>
            </div>

            <Card data-testid="card-compliance-checklist">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 flex-wrap">
                  <ClipboardList className="h-5 w-5" />
                  Compliance Checklist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {complianceItems.map((item) => {
                    const StatusIcon = complianceStatusIcons[item.status];
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-4 flex-wrap p-3 border rounded-md"
                        data-testid={`compliance-item-${item.id}`}
                      >
                        <div className="flex items-center gap-3 flex-wrap min-w-0">
                          <StatusIcon className={`h-5 w-5 flex-shrink-0 ${
                            item.status === "Valid" ? "text-green-600 dark:text-green-400" :
                            item.status === "Expiring" ? "text-amber-600 dark:text-amber-400" :
                            "text-muted-foreground"
                          }`} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.category} {item.required && <span className="text-red-500">*</span>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Expires</p>
                            <p className="text-xs font-mono">{item.expiry}</p>
                          </div>
                          <Badge variant={complianceStatusVariants[item.status]}>
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Access Tab */}
          <TabsContent value="data-access" className="space-y-6">
            <Card data-testid="card-data-categories">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 flex-wrap">
                  <Database className="h-5 w-5" />
                  Data Categories & Access Levels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dataCategories.map((cat) => {
                    const config = accessLevelConfig[cat.access];
                    const AccessIcon = config.icon;
                    return (
                      <div
                        key={cat.category}
                        className="flex items-center justify-between gap-4 flex-wrap p-3 border rounded-md"
                        data-testid={`data-category-${cat.category.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <div className="flex items-center gap-3 flex-wrap min-w-0">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center ${config.bg}`}>
                            <AccessIcon className={`h-4 w-4 ${config.color}`} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium">{cat.category}</p>
                            <p className="text-xs text-muted-foreground">{cat.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Consents</p>
                            <p className="text-sm font-mono">{cat.consents > 0 ? cat.consents : "N/A"}</p>
                          </div>
                          <Badge variant={cat.access === "Full" ? "default" : cat.access === "Aggregated" ? "secondary" : "outline"}>
                            {cat.access}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-audit-log">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 flex-wrap">
                  <FileText className="h-5 w-5" />
                  Data Access Audit Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-3 pr-4 font-medium text-muted-foreground">Action</th>
                        <th className="pb-3 pr-4 font-medium text-muted-foreground">Category</th>
                        <th className="pb-3 pr-4 font-medium text-muted-foreground">Records</th>
                        <th className="pb-3 pr-4 font-medium text-muted-foreground">User</th>
                        <th className="pb-3 pr-4 font-medium text-muted-foreground">Date</th>
                        <th className="pb-3 font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLog.map((entry) => (
                        <tr key={entry.id} className="border-b last:border-b-0" data-testid={`audit-row-${entry.id}`}>
                          <td className="py-3 pr-4">{entry.action}</td>
                          <td className="py-3 pr-4 text-muted-foreground">{entry.category}</td>
                          <td className="py-3 pr-4 font-mono">{entry.records}</td>
                          <td className="py-3 pr-4 font-mono text-xs">{entry.user}</td>
                          <td className="py-3 pr-4 text-muted-foreground text-xs">{entry.date}</td>
                          <td className="py-3">
                            <Badge variant="default">{entry.status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics & Reporting Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card data-testid="card-revenue-chart">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 flex-wrap">
                    <DollarSign className="h-5 w-5" />
                    Revenue by Month
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                        <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px' }}
                          formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.15)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-conversion-funnel">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 flex-wrap">
                    <TrendingUp className="h-5 w-5" />
                    Lead Conversion Funnel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {funnelStages.map((stage) => (
                      <div key={stage.stage} className="space-y-1.5" data-testid={`funnel-stage-${stage.stage.toLowerCase().replace(/\s+/g, '-')}`}>
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-sm">{stage.stage}</span>
                          <span className="text-sm font-mono">{stage.count} ({stage.percent}%)</span>
                        </div>
                        <Progress value={stage.percent} className="h-3" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card data-testid="card-benchmarks">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 flex-wrap">
                    <BarChart3 className="h-5 w-5" />
                    Performance Benchmarks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {benchmarks.map((bm) => {
                      const isAbove = bm.metric === "Avg Response Time" ? bm.yours < bm.benchmark : bm.yours > bm.benchmark;
                      return (
                        <div key={bm.metric} className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="text-sm">{bm.metric}</span>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-sm font-mono font-medium ${isAbove ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                {bm.metric === "Revenue per Lead" ? `$${bm.yours}` : `${bm.yours}${bm.unit}`}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                vs {bm.metric === "Revenue per Lead" ? `$${bm.benchmark}` : `${bm.benchmark}${bm.unit}`} avg
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={bm.metric === "Avg Response Time" ? (bm.benchmark / bm.yours) * 50 : (bm.yours / bm.benchmark) * 50}
                              className="h-2 flex-1"
                            />
                            <Badge variant={isAbove ? "default" : "destructive"} className="text-xs">
                              {isAbove ? "Above" : "Below"}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-roi-metrics">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 flex-wrap">
                    <Target className="h-5 w-5" />
                    ROI Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2 p-3 border rounded-md flex-wrap">
                      <div>
                        <p className="text-sm font-medium">Total Revenue (6 mo)</p>
                        <p className="text-xs text-muted-foreground">Across all partner products</p>
                      </div>
                      <p className="text-xl font-bold font-mono" data-testid="text-total-revenue">$92,520</p>
                    </div>
                    <div className="flex items-center justify-between gap-2 p-3 border rounded-md flex-wrap">
                      <div>
                        <p className="text-sm font-medium">Cost per Lead</p>
                        <p className="text-xs text-muted-foreground">Platform referral cost</p>
                      </div>
                      <p className="text-xl font-bold font-mono" data-testid="text-cost-per-lead">$12.40</p>
                    </div>
                    <div className="flex items-center justify-between gap-2 p-3 border rounded-md flex-wrap">
                      <div>
                        <p className="text-sm font-medium">Return on Investment</p>
                        <p className="text-xs text-muted-foreground">Revenue vs. platform fees</p>
                      </div>
                      <p className="text-xl font-bold font-mono text-green-600 dark:text-green-400" data-testid="text-roi">14.2x</p>
                    </div>
                    <div className="flex items-center justify-between gap-2 p-3 border rounded-md flex-wrap">
                      <div>
                        <p className="text-sm font-medium">Lifetime Value / Lead</p>
                        <p className="text-xs text-muted-foreground">Avg. revenue per converted lead</p>
                      </div>
                      <p className="text-xl font-bold font-mono" data-testid="text-ltv">$2,434</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card data-testid="card-partner-profile">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 flex-wrap">
                    <Building className="h-5 w-5" />
                    Partner Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Company Name</p>
                      <p className="text-sm font-medium" data-testid="text-company-name">Acme Insurance Partners</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Partner ID</p>
                      <p className="text-sm font-mono" data-testid="text-partner-id">PTR-00142</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Partner Type</p>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="outline">Insurance</Badge>
                        <Badge variant="outline">Mortgage</Badge>
                        <Badge variant="outline">Investment</Badge>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Primary Contact</p>
                      <p className="text-sm" data-testid="text-primary-contact">Sarah Chen, VP Partnerships</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Joined</p>
                      <p className="text-sm text-muted-foreground">January 15, 2025</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Status</p>
                      <Badge variant="default">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-notifications">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 flex-wrap">
                    <Bell className="h-5 w-5" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notificationPrefs.map((pref) => (
                      <div key={pref.id} className="flex items-center justify-between gap-3" data-testid={`notif-pref-${pref.id}`}>
                        <div className="min-w-0">
                          <Label htmlFor={pref.id} className="text-sm font-medium cursor-pointer">{pref.label}</Label>
                          <p className="text-xs text-muted-foreground">{pref.description}</p>
                        </div>
                        <Switch
                          id={pref.id}
                          checked={notifications[pref.id] ?? pref.default}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, [pref.id]: checked }))}
                          data-testid={`switch-${pref.id}`}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card data-testid="card-api-keys">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 flex-wrap">
                    <KeyRound className="h-5 w-5" />
                    API Keys
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 border rounded-md space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div>
                          <p className="text-sm font-medium">Production Key</p>
                          <p className="text-xs text-muted-foreground">Created Jan 15, 2025</p>
                        </div>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <code className="flex-1 text-xs font-mono bg-muted px-2 py-1 rounded" data-testid="text-api-key-prod">
                          pk_live_****************************a3Kf
                        </code>
                        <Button variant="ghost" size="icon" data-testid="button-copy-api-key">
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-3 border rounded-md space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div>
                          <p className="text-sm font-medium">Test Key</p>
                          <p className="text-xs text-muted-foreground">Created Jan 15, 2025</p>
                        </div>
                        <Badge variant="secondary">Test</Badge>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <code className="flex-1 text-xs font-mono bg-muted px-2 py-1 rounded" data-testid="text-api-key-test">
                          pk_test_****************************x9Mn
                        </code>
                        <Button variant="ghost" size="icon" data-testid="button-copy-test-key">
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" data-testid="button-rotate-keys">
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                      Rotate Keys
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-integrations">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 flex-wrap">
                    <ExternalLink className="h-5 w-5" />
                    Webhooks & Integrations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 border rounded-md space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="text-sm font-medium">Lead Webhook</p>
                        <Badge variant="default">Connected</Badge>
                      </div>
                      <code className="block text-xs font-mono bg-muted px-2 py-1 rounded text-muted-foreground" data-testid="text-webhook-lead">
                        https://api.acmepartners.com/webhooks/leads
                      </code>
                    </div>
                    <div className="p-3 border rounded-md space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="text-sm font-medium">Status Update Webhook</p>
                        <Badge variant="default">Connected</Badge>
                      </div>
                      <code className="block text-xs font-mono bg-muted px-2 py-1 rounded text-muted-foreground" data-testid="text-webhook-status">
                        https://api.acmepartners.com/webhooks/status
                      </code>
                    </div>
                    <div className="p-3 border rounded-md space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="text-sm font-medium">CRM Integration</p>
                        <Badge variant="secondary">Pending Setup</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Salesforce connector not yet configured</p>
                    </div>
                    <div className="p-3 border rounded-md space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="text-sm font-medium">Data Sync</p>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Last sync: Feb 21, 2026 at 2:30 PM</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}