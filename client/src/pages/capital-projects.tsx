import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AINudgeCard, AgentInsightStrip } from "@/components/ai-nudge-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Hammer,
  DollarSign,
  Brain,
  TrendingUp,
  AlertTriangle,
  Target,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  HardHat,
  Milestone,
  ShieldCheck,
  Wrench,
  Building2,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";

const agentInsights = [
  { text: "6 active projects totaling $1.8M in budget", severity: "info" as const },
  { text: "Building A elevator project 18% over budget", severity: "critical" as const, confidence: 0.94 },
  { text: "3 milestones due within next 14 days", severity: "warning" as const },
];

const kpiCards = [
  { title: "Active Projects", value: "6", change: "+1 this quarter", trend: "positive", icon: HardHat },
  { title: "Total Budget", value: "$1.8M", change: "Across 6 projects", trend: "positive", icon: DollarSign },
  { title: "Spent to Date", value: "$720K", change: "40% of total", trend: "positive", icon: FileText },
  { title: "On Schedule", value: "4/6", change: "2 delayed", trend: "warning", icon: Clock },
];

const categoryVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  Renovation: "default",
  Repair: "outline",
  Upgrade: "secondary",
  "New Construction": "destructive",
};

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  "In Progress": "default",
  "On Hold": "outline",
  Planning: "secondary",
  Completed: "secondary",
  Delayed: "destructive",
};

const activeProjects = [
  { name: "Elevator Modernization", property: "Building A - Riverside Commons", category: "Upgrade", contractor: "LiftTech Services", startDate: "Jan 15, 2026", endDate: "Jun 30, 2026", budget: 420000, spent: 248000, progress: 52, status: "Delayed" },
  { name: "Roof Replacement", property: "Oakwood Terrace", category: "Repair", contractor: "TopCover Roofing", startDate: "Feb 1, 2026", endDate: "Apr 15, 2026", budget: 185000, spent: 72000, progress: 35, status: "In Progress" },
  { name: "Lobby Renovation", property: "Summit View", category: "Renovation", contractor: "DesignBuild Co.", startDate: "Mar 1, 2026", endDate: "May 30, 2026", budget: 310000, spent: 45000, progress: 12, status: "In Progress" },
  { name: "Pool Deck Resurfacing", property: "Harbor Point", category: "Repair", contractor: "AquaClear Pool Co.", startDate: "Feb 10, 2026", endDate: "Mar 20, 2026", budget: 95000, spent: 68000, progress: 72, status: "In Progress" },
  { name: "Parking Garage Lighting", property: "Lakeshore Plaza", category: "Upgrade", contractor: "BrightPath Electric", startDate: "Jan 20, 2026", endDate: "Mar 10, 2026", budget: 125000, spent: 110000, progress: 88, status: "In Progress" },
  { name: "HVAC System Overhaul", property: "Pinecrest Village", category: "Renovation", contractor: "CoolAir Systems", startDate: "Mar 15, 2026", endDate: "Aug 30, 2026", budget: 665000, spent: 177000, progress: 22, status: "Planning" },
];

const milestones = [
  { project: "Elevator Modernization", milestone: "Design", date: "Jan 20, 2026", status: "Completed" },
  { project: "Elevator Modernization", milestone: "Permit", date: "Feb 5, 2026", status: "Completed" },
  { project: "Elevator Modernization", milestone: "Demo", date: "Feb 20, 2026", status: "Completed" },
  { project: "Elevator Modernization", milestone: "Construction", date: "Mar 1, 2026", status: "In Progress" },
  { project: "Elevator Modernization", milestone: "Inspection", date: "Jun 15, 2026", status: "Pending" },
  { project: "Elevator Modernization", milestone: "Completion", date: "Jun 30, 2026", status: "Pending" },
  { project: "Roof Replacement", milestone: "Design", date: "Feb 1, 2026", status: "Completed" },
  { project: "Roof Replacement", milestone: "Permit", date: "Feb 10, 2026", status: "Completed" },
  { project: "Roof Replacement", milestone: "Demo", date: "Feb 18, 2026", status: "In Progress" },
  { project: "Roof Replacement", milestone: "Construction", date: "Mar 1, 2026", status: "Pending" },
  { project: "Roof Replacement", milestone: "Inspection", date: "Apr 10, 2026", status: "Pending" },
  { project: "Lobby Renovation", milestone: "Design", date: "Mar 1, 2026", status: "In Progress" },
  { project: "Lobby Renovation", milestone: "Permit", date: "Mar 20, 2026", status: "Pending" },
  { project: "Lobby Renovation", milestone: "Construction", date: "Apr 5, 2026", status: "Pending" },
  { project: "Lobby Renovation", milestone: "Completion", date: "May 30, 2026", status: "Pending" },
  { project: "Pool Deck Resurfacing", milestone: "Demo", date: "Feb 12, 2026", status: "Completed" },
  { project: "Pool Deck Resurfacing", milestone: "Construction", date: "Feb 20, 2026", status: "In Progress" },
  { project: "Pool Deck Resurfacing", milestone: "Inspection", date: "Mar 15, 2026", status: "Pending" },
  { project: "Pool Deck Resurfacing", milestone: "Completion", date: "Mar 20, 2026", status: "Pending" },
  { project: "Parking Garage Lighting", milestone: "Construction", date: "Feb 1, 2026", status: "Completed" },
  { project: "Parking Garage Lighting", milestone: "Inspection", date: "Mar 5, 2026", status: "In Progress" },
  { project: "Parking Garage Lighting", milestone: "Completion", date: "Mar 10, 2026", status: "Pending" },
];

const milestoneStatusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  Completed: "secondary",
  "In Progress": "default",
  Pending: "outline",
};

const budgetTracking = [
  { project: "Elevator Modernization", originalBudget: 380000, changeOrders: 40000, revisedBudget: 420000, invoiced: 268000, paid: 248000, remaining: 152000, pctUsed: 64 },
  { project: "Roof Replacement", originalBudget: 185000, changeOrders: 0, revisedBudget: 185000, invoiced: 78000, paid: 72000, remaining: 113000, pctUsed: 42 },
  { project: "Lobby Renovation", originalBudget: 310000, changeOrders: 0, revisedBudget: 310000, invoiced: 50000, paid: 45000, remaining: 265000, pctUsed: 16 },
  { project: "Pool Deck Resurfacing", originalBudget: 95000, changeOrders: 0, revisedBudget: 95000, invoiced: 72000, paid: 68000, remaining: 27000, pctUsed: 76 },
  { project: "Parking Garage Lighting", originalBudget: 120000, changeOrders: 5000, revisedBudget: 125000, invoiced: 115000, paid: 110000, remaining: 15000, pctUsed: 92 },
  { project: "HVAC System Overhaul", originalBudget: 665000, changeOrders: 0, revisedBudget: 665000, invoiced: 195000, paid: 177000, remaining: 488000, pctUsed: 29 },
];

const contractorBids = [
  { project: "Lobby Renovation", contractor: "DesignBuild Co.", bidAmount: 310000, timeline: "90 days", warranty: "2 years", references: 12, aiScore: 92, status: "Selected" },
  { project: "Lobby Renovation", contractor: "Premier Interiors", bidAmount: 335000, timeline: "75 days", warranty: "1 year", references: 8, aiScore: 78, status: "Rejected" },
  { project: "Lobby Renovation", contractor: "ModernSpace LLC", bidAmount: 298000, timeline: "110 days", warranty: "2 years", references: 5, aiScore: 71, status: "Rejected" },
  { project: "HVAC System Overhaul", contractor: "CoolAir Systems", bidAmount: 665000, timeline: "165 days", warranty: "5 years", references: 18, aiScore: 95, status: "Selected" },
  { project: "HVAC System Overhaul", contractor: "AirFlow Masters", bidAmount: 710000, timeline: "150 days", warranty: "3 years", references: 14, aiScore: 85, status: "Pending" },
  { project: "HVAC System Overhaul", contractor: "ClimateControl Inc.", bidAmount: 595000, timeline: "200 days", warranty: "2 years", references: 6, aiScore: 68, status: "Rejected" },
  { project: "HVAC System Overhaul", contractor: "TempRight Solutions", bidAmount: 680000, timeline: "170 days", warranty: "4 years", references: 10, aiScore: 82, status: "Pending" },
];

const bidStatusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  Selected: "default",
  Pending: "outline",
  Rejected: "secondary",
};

const warranties = [
  { item: "Parking Garage LED Fixtures", contractor: "BrightPath Electric", installDate: "Mar 2026", warrantyPeriod: "5 years", expiryDate: "Mar 2031", coverageType: "Full Replacement", claimHistory: 0, status: "Active" },
  { item: "Pool Pump System", contractor: "AquaClear Pool Co.", installDate: "Jan 2025", warrantyPeriod: "3 years", expiryDate: "Jan 2028", coverageType: "Parts & Labor", claimHistory: 1, status: "Active" },
  { item: "Elevator Cab Interior", contractor: "LiftTech Services", installDate: "Nov 2024", warrantyPeriod: "2 years", expiryDate: "Nov 2026", coverageType: "Parts Only", claimHistory: 0, status: "Active" },
  { item: "Lobby Flooring", contractor: "DesignBuild Co.", installDate: "Aug 2023", warrantyPeriod: "5 years", expiryDate: "Aug 2028", coverageType: "Full Replacement", claimHistory: 0, status: "Active" },
  { item: "Roof Membrane - Bldg C", contractor: "TopCover Roofing", installDate: "Jun 2022", warrantyPeriod: "10 years", expiryDate: "Jun 2032", coverageType: "Material & Labor", claimHistory: 2, status: "Active" },
  { item: "Boiler System", contractor: "HeatPro Services", installDate: "Dec 2020", warrantyPeriod: "5 years", expiryDate: "Dec 2025", coverageType: "Parts & Labor", claimHistory: 3, status: "Expired" },
];

const warrantyStatusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  Active: "default",
  Expired: "destructive",
  "Expiring Soon": "outline",
};

export default function CapitalProjects() {
  return (
    <div className="space-y-6" data-testid="page-capital-projects">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-page-title">Capital Projects</h1>
          <p className="text-muted-foreground">Project tracking, budgets, contractor management, and warranty oversight</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs" data-testid="badge-agent-status">
            <Brain className="w-3 h-3 mr-1 text-primary" />
            Agent Active
          </Badge>
          <Button size="sm" data-testid="button-new-project">
            <HardHat className="w-3 h-3 mr-1" />
            New Project
          </Button>
        </div>
      </div>

      <AgentInsightStrip insights={agentInsights} />

      <AINudgeCard
        title="Budget Risk Alert - Elevator Modernization"
        insight="Building A Elevator Modernization is 18% over budget due to a pending contractor change order ($40,000). Agent recommends reviewing the change order scope and negotiating phased payment terms. Similar projects in the region averaged 8% overruns."
        confidence={0.94}
        severity="critical"
        icon={AlertTriangle}
        actionLabel="Review Change Order"
        onAction={() => {}}
        secondaryLabel="View Budget Details"
        onSecondary={() => {}}
        metric="$40,000"
        metricLabel="Change Order Amount"
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

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList data-testid="tabs-capital-projects">
          <TabsTrigger value="active" data-testid="tab-active">Active Projects</TabsTrigger>
          <TabsTrigger value="timeline" data-testid="tab-timeline">Timeline</TabsTrigger>
          <TabsTrigger value="budget" data-testid="tab-budget">Budget Tracking</TabsTrigger>
          <TabsTrigger value="bids" data-testid="tab-bids">Contractor Bids</TabsTrigger>
          <TabsTrigger value="warranty" data-testid="tab-warranty">Warranty Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <Card data-testid="card-active-projects">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Hammer className="w-5 h-5 text-primary" />
                <CardTitle>Active Projects</CardTitle>
                <Badge variant="secondary" className="text-xs">{activeProjects.length} Projects</Badge>
              </div>
              <CardDescription>Current capital improvement projects across all properties</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Project</th>
                      <th className="p-3 font-medium text-muted-foreground">Property</th>
                      <th className="p-3 font-medium text-muted-foreground">Category</th>
                      <th className="p-3 font-medium text-muted-foreground">Contractor</th>
                      <th className="p-3 font-medium text-muted-foreground">Dates</th>
                      <th className="p-3 font-medium text-muted-foreground">Budget</th>
                      <th className="p-3 font-medium text-muted-foreground">Progress</th>
                      <th className="p-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeProjects.map((proj, idx) => (
                      <tr key={idx} className="border-b last:border-0" data-testid={`row-project-${idx}`}>
                        <td className="p-3 font-medium">{proj.name}</td>
                        <td className="p-3 text-muted-foreground text-xs">{proj.property}</td>
                        <td className="p-3">
                          <Badge variant={categoryVariant[proj.category]} className="text-xs" data-testid={`badge-category-${idx}`}>{proj.category}</Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">{proj.contractor}</td>
                        <td className="p-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {proj.startDate} - {proj.endDate}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-xs">
                            <span className="font-mono font-medium">${(proj.spent / 1000).toFixed(0)}K</span>
                            <span className="text-muted-foreground"> / ${(proj.budget / 1000).toFixed(0)}K</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2 min-w-[100px]">
                            <Progress value={proj.progress} className="h-1.5 flex-1" data-testid={`progress-project-${idx}`} />
                            <span className="text-xs font-mono">{proj.progress}%</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant={statusVariant[proj.status]} className="text-xs" data-testid={`badge-status-${idx}`}>{proj.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card data-testid="card-timeline">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Milestone className="w-5 h-5 text-primary" />
                <CardTitle>Project Milestones</CardTitle>
                <Badge variant="secondary" className="text-xs">All Projects</Badge>
              </div>
              <CardDescription>Milestone tracking across all active capital projects</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Project</th>
                      <th className="p-3 font-medium text-muted-foreground">Milestone</th>
                      <th className="p-3 font-medium text-muted-foreground">Date</th>
                      <th className="p-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {milestones.map((ms, idx) => (
                      <tr key={idx} className="border-b last:border-0" data-testid={`row-milestone-${idx}`}>
                        <td className="p-3 font-medium">{ms.project}</td>
                        <td className="p-3">{ms.milestone}</td>
                        <td className="p-3 text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {ms.date}
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant={milestoneStatusVariant[ms.status]} className="text-xs" data-testid={`badge-milestone-status-${idx}`}>
                            {ms.status === "Completed" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {ms.status === "In Progress" && <Clock className="w-3 h-3 mr-1" />}
                            {ms.status}
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

        <TabsContent value="budget" className="space-y-4">
          <Card data-testid="card-budget-tracking">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <DollarSign className="w-5 h-5 text-primary" />
                <CardTitle>Budget Tracking</CardTitle>
                <Badge variant="secondary" className="text-xs">All Projects</Badge>
              </div>
              <CardDescription>Detailed budget breakdown including change orders and payment status</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Project</th>
                      <th className="p-3 font-medium text-muted-foreground">Original Budget</th>
                      <th className="p-3 font-medium text-muted-foreground">Change Orders</th>
                      <th className="p-3 font-medium text-muted-foreground">Revised Budget</th>
                      <th className="p-3 font-medium text-muted-foreground">Invoiced</th>
                      <th className="p-3 font-medium text-muted-foreground">Paid</th>
                      <th className="p-3 font-medium text-muted-foreground">Remaining</th>
                      <th className="p-3 font-medium text-muted-foreground">% Used</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budgetTracking.map((row, idx) => (
                      <tr key={idx} className="border-b last:border-0" data-testid={`row-budget-${idx}`}>
                        <td className="p-3 font-medium">{row.project}</td>
                        <td className="p-3 font-mono text-xs">${(row.originalBudget / 1000).toFixed(0)}K</td>
                        <td className="p-3 font-mono text-xs">
                          {row.changeOrders > 0 ? (
                            <span className="text-amber-600">+${(row.changeOrders / 1000).toFixed(0)}K</span>
                          ) : (
                            <span className="text-muted-foreground">--</span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-xs font-medium">${(row.revisedBudget / 1000).toFixed(0)}K</td>
                        <td className="p-3 font-mono text-xs">${(row.invoiced / 1000).toFixed(0)}K</td>
                        <td className="p-3 font-mono text-xs">${(row.paid / 1000).toFixed(0)}K</td>
                        <td className="p-3 font-mono text-xs">${(row.remaining / 1000).toFixed(0)}K</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2 min-w-[80px]">
                            <Progress value={row.pctUsed} className="h-1.5 flex-1" data-testid={`progress-budget-${idx}`} />
                            <span className={`text-xs font-mono ${row.pctUsed > 80 ? "text-amber-600" : ""}`}>{row.pctUsed}%</span>
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

        <TabsContent value="bids" className="space-y-4">
          <Card data-testid="card-contractor-bids">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <ClipboardList className="w-5 h-5 text-primary" />
                <CardTitle>Contractor Bids</CardTitle>
                <Badge variant="secondary" className="text-xs">{contractorBids.length} Bids</Badge>
              </div>
              <CardDescription>Bid comparison and AI-scored contractor evaluations</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Project</th>
                      <th className="p-3 font-medium text-muted-foreground">Contractor</th>
                      <th className="p-3 font-medium text-muted-foreground">Bid Amount</th>
                      <th className="p-3 font-medium text-muted-foreground">Timeline</th>
                      <th className="p-3 font-medium text-muted-foreground">Warranty</th>
                      <th className="p-3 font-medium text-muted-foreground">References</th>
                      <th className="p-3 font-medium text-muted-foreground">AI Score</th>
                      <th className="p-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contractorBids.map((bid, idx) => (
                      <tr key={idx} className="border-b last:border-0" data-testid={`row-bid-${idx}`}>
                        <td className="p-3 font-medium">{bid.project}</td>
                        <td className="p-3">{bid.contractor}</td>
                        <td className="p-3 font-mono text-xs">${(bid.bidAmount / 1000).toFixed(0)}K</td>
                        <td className="p-3 text-muted-foreground">{bid.timeline}</td>
                        <td className="p-3 text-muted-foreground">{bid.warranty}</td>
                        <td className="p-3 text-center">{bid.references}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <Brain className="w-3 h-3 text-primary" />
                            <span className={`font-mono text-xs font-medium ${bid.aiScore >= 90 ? "text-emerald-600" : bid.aiScore >= 75 ? "text-amber-600" : "text-red-500"}`} data-testid={`text-ai-score-${idx}`}>
                              {bid.aiScore}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant={bidStatusVariant[bid.status]} className="text-xs" data-testid={`badge-bid-status-${idx}`}>{bid.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warranty" className="space-y-4">
          <Card data-testid="card-warranty-tracking">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <CardTitle>Warranty Tracking</CardTitle>
                <Badge variant="secondary" className="text-xs">{warranties.length} Records</Badge>
              </div>
              <CardDescription>Active and expired warranty records for capital improvements</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Item</th>
                      <th className="p-3 font-medium text-muted-foreground">Contractor</th>
                      <th className="p-3 font-medium text-muted-foreground">Install Date</th>
                      <th className="p-3 font-medium text-muted-foreground">Warranty Period</th>
                      <th className="p-3 font-medium text-muted-foreground">Expiry Date</th>
                      <th className="p-3 font-medium text-muted-foreground">Coverage</th>
                      <th className="p-3 font-medium text-muted-foreground">Claims</th>
                      <th className="p-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {warranties.map((w, idx) => (
                      <tr key={idx} className="border-b last:border-0" data-testid={`row-warranty-${idx}`}>
                        <td className="p-3 font-medium">{w.item}</td>
                        <td className="p-3 text-muted-foreground">{w.contractor}</td>
                        <td className="p-3 text-muted-foreground">{w.installDate}</td>
                        <td className="p-3 text-muted-foreground">{w.warrantyPeriod}</td>
                        <td className="p-3 text-muted-foreground">{w.expiryDate}</td>
                        <td className="p-3 text-xs">{w.coverageType}</td>
                        <td className="p-3 text-center" data-testid={`text-claims-${idx}`}>{w.claimHistory}</td>
                        <td className="p-3">
                          <Badge variant={warrantyStatusVariant[w.status]} className="text-xs" data-testid={`badge-warranty-status-${idx}`}>{w.status}</Badge>
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
