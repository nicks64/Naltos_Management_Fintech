import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AINudgeCard, AgentInsightStrip } from "@/components/ai-nudge-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Droplets,
  Zap,
  Flame,
  Trash2,
  Wifi,
  DollarSign,
  Brain,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  BarChart3,
  ArrowRightLeft,
  Gauge,
  Building2,
  FileText,
  Target,
  Activity,
  type LucideIcon,
} from "lucide-react";

const agentInsights = [
  { text: "Water costs up 12% vs last quarter - investigate Unit 204", severity: "warning" as const, confidence: 0.92 },
  { text: "3 consumption anomalies detected across portfolio", severity: "critical" as const },
  { text: "February billing cycle 98% reconciled", severity: "positive" as const },
];

const kpiCards = [
  { title: "Monthly Utility Cost", value: "$42K", change: "+$3.2K vs last month", trend: "warning", icon: DollarSign },
  { title: "Avg Cost/Unit", value: "$110", change: "-$5 vs avg", trend: "positive", icon: Building2 },
  { title: "RUBS Recovery Rate", value: "92%", change: "+1.5%", trend: "positive", icon: Target },
  { title: "Consumption Anomalies", value: "3", change: "+1 new this week", trend: "warning", icon: AlertTriangle },
];

const utilityTypeIcons: Record<string, LucideIcon> = {
  Water: Droplets,
  Electric: Zap,
  Gas: Flame,
  Trash: Trash2,
  Sewer: Droplets,
  Internet: Wifi,
};

const utilityBills = [
  { id: "UB-501", type: "Water", provider: "Metro Water Authority", amount: "$8,420", billingPeriod: "Jan 15 - Feb 14", dueDate: "Mar 1, 2026", status: "Due" },
  { id: "UB-502", type: "Electric", provider: "City Power & Light", amount: "$14,680", billingPeriod: "Jan 20 - Feb 19", dueDate: "Mar 5, 2026", status: "Due" },
  { id: "UB-503", type: "Gas", provider: "NatGas Energy", amount: "$6,340", billingPeriod: "Jan 18 - Feb 17", dueDate: "Mar 3, 2026", status: "Due" },
  { id: "UB-504", type: "Trash", provider: "CleanCity Waste", amount: "$3,200", billingPeriod: "Feb 1 - Feb 28", dueDate: "Mar 10, 2026", status: "Paid" },
  { id: "UB-505", type: "Sewer", provider: "Metro Water Authority", amount: "$4,860", billingPeriod: "Jan 15 - Feb 14", dueDate: "Mar 1, 2026", status: "Due" },
  { id: "UB-506", type: "Internet", provider: "FiberNet Business", amount: "$2,400", billingPeriod: "Feb 1 - Feb 28", dueDate: "Feb 28, 2026", status: "Paid" },
  { id: "UB-507", type: "Electric", provider: "City Power & Light", amount: "$13,920", billingPeriod: "Dec 20 - Jan 19", dueDate: "Feb 5, 2026", status: "Paid" },
  { id: "UB-508", type: "Water", provider: "Metro Water Authority", amount: "$7,890", billingPeriod: "Dec 15 - Jan 14", dueDate: "Feb 1, 2026", status: "Paid" },
];

const rubsAllocations = [
  { unit: "1A", tenant: "Sarah Kim", sqft: 850, sqftRatio: "8.2%", occupants: 2, occupantRatio: "6.9%", allocated: "$198", billed: "$198", collection: "Collected" },
  { unit: "1B", tenant: "James Wilson", sqft: 1100, sqftRatio: "10.6%", occupants: 3, occupantRatio: "10.3%", allocated: "$256", billed: "$256", collection: "Collected" },
  { unit: "2A", tenant: "Maria Lopez", sqft: 750, sqftRatio: "7.2%", occupants: 1, occupantRatio: "3.4%", allocated: "$165", billed: "$165", collection: "Pending" },
  { unit: "2B", tenant: "Tom Baker", sqft: 950, sqftRatio: "9.1%", occupants: 2, occupantRatio: "6.9%", allocated: "$221", billed: "$221", collection: "Collected" },
  { unit: "3A", tenant: "Kevin Brooks", sqft: 1050, sqftRatio: "10.1%", occupants: 4, occupantRatio: "13.8%", allocated: "$288", billed: "$288", collection: "Overdue" },
  { unit: "3B", tenant: "Angela Price", sqft: 900, sqftRatio: "8.7%", occupants: 2, occupantRatio: "6.9%", allocated: "$210", billed: "$210", collection: "Collected" },
  { unit: "4A", tenant: "Robert Chen", sqft: 800, sqftRatio: "7.7%", occupants: 1, occupantRatio: "3.4%", allocated: "$172", billed: "$172", collection: "Collected" },
  { unit: "4B", tenant: "Marcus Rivera", sqft: 1200, sqftRatio: "11.5%", occupants: 3, occupantRatio: "10.3%", allocated: "$278", billed: "$278", collection: "Pending" },
];

const submeterReadings = [
  { unit: "1A", meterType: "Water", previousReading: "12,450", currentReading: "12,892", consumption: "442 gal", readDate: "Feb 15, 2026", reader: "M. Santos" },
  { unit: "1B", meterType: "Electric", previousReading: "34,210", currentReading: "35,180", consumption: "970 kWh", readDate: "Feb 15, 2026", reader: "M. Santos" },
  { unit: "2A", meterType: "Water", previousReading: "8,340", currentReading: "8,520", consumption: "180 gal", readDate: "Feb 15, 2026", reader: "D. Hall" },
  { unit: "2B", meterType: "Gas", previousReading: "5,670", currentReading: "5,812", consumption: "142 therms", readDate: "Feb 15, 2026", reader: "D. Hall" },
  { unit: "204", meterType: "Water", previousReading: "9,100", currentReading: "10,632", consumption: "1,532 gal", readDate: "Feb 15, 2026", reader: "D. Hall" },
  { unit: "3A", meterType: "Electric", previousReading: "28,900", currentReading: "29,640", consumption: "740 kWh", readDate: "Feb 15, 2026", reader: "M. Santos" },
  { unit: "3B", meterType: "Water", previousReading: "11,230", currentReading: "11,610", consumption: "380 gal", readDate: "Feb 15, 2026", reader: "M. Santos" },
  { unit: "4A", meterType: "Electric", previousReading: "22,100", currentReading: "22,780", consumption: "680 kWh", readDate: "Feb 15, 2026", reader: "D. Hall" },
];

const utilityTransfers = [
  { id: "UT-201", unit: "2B", tenant: "Tom Baker", utilityType: "Electric", transferType: "Start", date: "Feb 1, 2026", status: "Completed", confirmation: "CF-89201" },
  { id: "UT-202", unit: "2B", tenant: "Tom Baker", utilityType: "Gas", transferType: "Start", date: "Feb 1, 2026", status: "Completed", confirmation: "CF-89202" },
  { id: "UT-203", unit: "5A", tenant: "Diana Foster", utilityType: "Electric", transferType: "Stop", date: "Feb 28, 2026", status: "Scheduled", confirmation: "—" },
  { id: "UT-204", unit: "5A", tenant: "Diana Foster", utilityType: "Gas", transferType: "Stop", date: "Feb 28, 2026", status: "Scheduled", confirmation: "—" },
  { id: "UT-205", unit: "7A", tenant: "New Tenant TBD", utilityType: "Electric", transferType: "Start", date: "Mar 5, 2026", status: "Pending", confirmation: "—" },
  { id: "UT-206", unit: "7A", tenant: "New Tenant TBD", utilityType: "Water", transferType: "Start", date: "Mar 5, 2026", status: "Pending", confirmation: "—" },
  { id: "UT-207", unit: "1D", tenant: "James Wilson", utilityType: "Internet", transferType: "Start", date: "Jan 15, 2026", status: "Completed", confirmation: "CF-88910" },
];

const consumptionAnalytics = [
  { unit: "Building A", type: "Water", currentMonth: "18,200 gal", lastYear: "16,400 gal", yoyChange: "+11.0%", anomaly: false, recommendation: "Within normal range" },
  { unit: "Building A", type: "Electric", currentMonth: "42,100 kWh", lastYear: "40,800 kWh", yoyChange: "+3.2%", anomaly: false, recommendation: "Consider LED upgrade in common areas" },
  { unit: "Building B", type: "Gas", currentMonth: "8,920 therms", lastYear: "9,100 therms", yoyChange: "-2.0%", anomaly: false, recommendation: "Efficiency improving" },
  { unit: "Unit 204", type: "Water", currentMonth: "1,532 gal", lastYear: "380 gal", yoyChange: "+303.2%", anomaly: true, recommendation: "Investigate possible leak - dispatch maintenance" },
  { unit: "Unit 3A", type: "Electric", currentMonth: "740 kWh", lastYear: "520 kWh", yoyChange: "+42.3%", anomaly: true, recommendation: "Check for unauthorized space heaters" },
  { unit: "Building B", type: "Water", currentMonth: "22,400 gal", lastYear: "19,800 gal", yoyChange: "+13.1%", anomaly: false, recommendation: "Monitor - approaching threshold" },
  { unit: "Unit 6B", type: "Electric", currentMonth: "1,180 kWh", lastYear: "680 kWh", yoyChange: "+73.5%", anomaly: true, recommendation: "Usage spike after new appliance installation" },
];

const billStatusVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  "Due": "outline",
  "Paid": "secondary",
  "Overdue": "destructive",
  "Processing": "default",
};

const collectionVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  "Collected": "secondary",
  "Pending": "outline",
  "Overdue": "destructive",
};

const transferStatusVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  "Completed": "secondary",
  "Scheduled": "default",
  "Pending": "outline",
  "Failed": "destructive",
};

export default function Utilities() {
  const [activeTab, setActiveTab] = useState("billing");

  return (
    <div className="space-y-6" data-testid="page-utilities">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-page-title">Utility Management</h1>
          <p className="text-muted-foreground">Utility billing, RUBS allocation, submeter readings, and consumption analytics</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs" data-testid="badge-agent-status">
            <Brain className="w-3 h-3 mr-1 text-primary" />
            Agent Active
          </Badge>
          <Button size="sm" data-testid="button-run-rubs">
            <BarChart3 className="w-3 h-3 mr-1" />
            Run RUBS Allocation
          </Button>
        </div>
      </div>

      <AgentInsightStrip insights={agentInsights} />

      <AINudgeCard
        title="Consumption Anomaly Detected"
        insight="Unit 204 water usage is 1,532 gallons this month - 340% above the building average of 350 gallons. Pattern suggests possible plumbing leak. Recommend dispatching maintenance for inspection before next billing cycle."
        confidence={0.94}
        severity="critical"
        icon={Droplets}
        actionLabel="Create Work Order"
        onAction={() => {}}
        secondaryLabel="View Usage History"
        onSecondary={() => {}}
        metric="$840"
        metricLabel="Est. Monthly Waste"
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
        <TabsList data-testid="tabs-utilities">
          <TabsTrigger value="billing" data-testid="tab-billing">Billing Overview</TabsTrigger>
          <TabsTrigger value="rubs" data-testid="tab-rubs">RUBS Allocation</TabsTrigger>
          <TabsTrigger value="submeters" data-testid="tab-submeters">Submeter Readings</TabsTrigger>
          <TabsTrigger value="transfers" data-testid="tab-transfers">Utility Transfers</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">Consumption Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="billing" className="space-y-4">
          <Card data-testid="card-billing-overview">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <DollarSign className="w-5 h-5 text-primary" />
                <CardTitle>Monthly Utility Bills</CardTitle>
                <Badge variant="secondary" className="text-xs">{utilityBills.length} bills</Badge>
              </div>
              <CardDescription>Track utility bills by type, provider, and payment status</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">ID</th>
                      <th className="p-3 font-medium text-muted-foreground">Type</th>
                      <th className="p-3 font-medium text-muted-foreground">Provider</th>
                      <th className="p-3 font-medium text-muted-foreground">Amount</th>
                      <th className="p-3 font-medium text-muted-foreground">Billing Period</th>
                      <th className="p-3 font-medium text-muted-foreground">Due Date</th>
                      <th className="p-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {utilityBills.map((bill, idx) => {
                      const TypeIcon = utilityTypeIcons[bill.type] || Zap;
                      return (
                        <tr key={bill.id} className="border-b last:border-0 hover-elevate" data-testid={`row-bill-${idx}`}>
                          <td className="p-3 font-mono text-xs">{bill.id}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              <TypeIcon className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="font-medium">{bill.type}</span>
                            </div>
                          </td>
                          <td className="p-3 text-muted-foreground">{bill.provider}</td>
                          <td className="p-3 font-semibold font-mono tabular-nums">{bill.amount}</td>
                          <td className="p-3 text-muted-foreground">{bill.billingPeriod}</td>
                          <td className="p-3 text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {bill.dueDate}
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge variant={billStatusVariant[bill.status]} className="text-xs" data-testid={`badge-bill-status-${idx}`}>
                              {bill.status === "Paid" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                              {bill.status === "Due" && <Clock className="w-3 h-3 mr-1" />}
                              {bill.status}
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

        <TabsContent value="rubs" className="space-y-4">
          <Card data-testid="card-rubs-allocation">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <CardTitle>RUBS Allocation - February 2026</CardTitle>
                  <Badge variant="secondary" className="text-xs">Ratio Utility Billing</Badge>
                </div>
                <Button size="sm" variant="outline" data-testid="button-export-rubs">
                  <FileText className="w-3 h-3 mr-1" />
                  Export
                </Button>
              </div>
              <CardDescription>Unit-level utility cost allocation based on square footage and occupancy ratios</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Unit</th>
                      <th className="p-3 font-medium text-muted-foreground">Tenant</th>
                      <th className="p-3 font-medium text-muted-foreground">Sq Ft</th>
                      <th className="p-3 font-medium text-muted-foreground">Sq Ft Ratio</th>
                      <th className="p-3 font-medium text-muted-foreground">Occupants</th>
                      <th className="p-3 font-medium text-muted-foreground">Occ. Ratio</th>
                      <th className="p-3 font-medium text-muted-foreground">Allocated</th>
                      <th className="p-3 font-medium text-muted-foreground">Billed</th>
                      <th className="p-3 font-medium text-muted-foreground">Collection</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rubsAllocations.map((alloc, idx) => (
                      <tr key={alloc.unit} className="border-b last:border-0 hover-elevate" data-testid={`row-rubs-${idx}`}>
                        <td className="p-3 font-medium">{alloc.unit}</td>
                        <td className="p-3">{alloc.tenant}</td>
                        <td className="p-3 font-mono tabular-nums text-muted-foreground">{alloc.sqft.toLocaleString()}</td>
                        <td className="p-3 text-muted-foreground">{alloc.sqftRatio}</td>
                        <td className="p-3 text-center">{alloc.occupants}</td>
                        <td className="p-3 text-muted-foreground">{alloc.occupantRatio}</td>
                        <td className="p-3 font-mono tabular-nums font-medium">{alloc.allocated}</td>
                        <td className="p-3 font-mono tabular-nums">{alloc.billed}</td>
                        <td className="p-3">
                          <Badge variant={collectionVariant[alloc.collection]} className="text-xs" data-testid={`badge-collection-${idx}`}>
                            {alloc.collection === "Collected" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {alloc.collection === "Overdue" && <XCircle className="w-3 h-3 mr-1" />}
                            {alloc.collection === "Pending" && <Clock className="w-3 h-3 mr-1" />}
                            {alloc.collection}
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

        <TabsContent value="submeters" className="space-y-4">
          <Card data-testid="card-submeter-readings">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <Gauge className="w-5 h-5 text-primary" />
                  <CardTitle>Submeter Reading Log</CardTitle>
                  <Badge variant="secondary" className="text-xs">{submeterReadings.length} readings</Badge>
                </div>
                <Button size="sm" data-testid="button-record-reading">
                  <Gauge className="w-3 h-3 mr-1" />
                  Record Reading
                </Button>
              </div>
              <CardDescription>Individual unit submeter readings with consumption calculations</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Unit</th>
                      <th className="p-3 font-medium text-muted-foreground">Meter Type</th>
                      <th className="p-3 font-medium text-muted-foreground">Previous</th>
                      <th className="p-3 font-medium text-muted-foreground">Current</th>
                      <th className="p-3 font-medium text-muted-foreground">Consumption</th>
                      <th className="p-3 font-medium text-muted-foreground">Read Date</th>
                      <th className="p-3 font-medium text-muted-foreground">Reader</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submeterReadings.map((reading, idx) => {
                      const isAnomaly = reading.unit === "204";
                      return (
                        <tr key={idx} className={`border-b last:border-0 hover-elevate ${isAnomaly ? "bg-red-50/50 dark:bg-red-950/20" : ""}`} data-testid={`row-submeter-${idx}`}>
                          <td className="p-3 font-medium">
                            <div className="flex items-center gap-1.5">
                              {reading.unit}
                              {isAnomaly && (
                                <Badge variant="destructive" className="text-[9px] px-1 py-0" data-testid={`badge-anomaly-${idx}`}>
                                  <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
                                  Anomaly
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              {reading.meterType === "Water" && <Droplets className="w-3.5 h-3.5 text-muted-foreground" />}
                              {reading.meterType === "Electric" && <Zap className="w-3.5 h-3.5 text-muted-foreground" />}
                              {reading.meterType === "Gas" && <Flame className="w-3.5 h-3.5 text-muted-foreground" />}
                              {reading.meterType}
                            </div>
                          </td>
                          <td className="p-3 font-mono tabular-nums text-muted-foreground">{reading.previousReading}</td>
                          <td className="p-3 font-mono tabular-nums text-muted-foreground">{reading.currentReading}</td>
                          <td className="p-3 font-mono tabular-nums font-medium">
                            <span className={isAnomaly ? "text-red-600 dark:text-red-400" : ""}>{reading.consumption}</span>
                          </td>
                          <td className="p-3 text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {reading.readDate}
                            </div>
                          </td>
                          <td className="p-3 text-muted-foreground">{reading.reader}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfers" className="space-y-4">
          <Card data-testid="card-utility-transfers">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <ArrowRightLeft className="w-5 h-5 text-primary" />
                <CardTitle>Utility Account Transfers</CardTitle>
                <Badge variant="secondary" className="text-xs">{utilityTransfers.length} transfers</Badge>
              </div>
              <CardDescription>Utility account start/stop during move-in and move-out</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">ID</th>
                      <th className="p-3 font-medium text-muted-foreground">Unit</th>
                      <th className="p-3 font-medium text-muted-foreground">Tenant</th>
                      <th className="p-3 font-medium text-muted-foreground">Utility</th>
                      <th className="p-3 font-medium text-muted-foreground">Transfer</th>
                      <th className="p-3 font-medium text-muted-foreground">Date</th>
                      <th className="p-3 font-medium text-muted-foreground">Status</th>
                      <th className="p-3 font-medium text-muted-foreground">Confirmation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {utilityTransfers.map((transfer, idx) => (
                      <tr key={transfer.id} className="border-b last:border-0 hover-elevate" data-testid={`row-transfer-${idx}`}>
                        <td className="p-3 font-mono text-xs">{transfer.id}</td>
                        <td className="p-3 font-medium">{transfer.unit}</td>
                        <td className="p-3">{transfer.tenant}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            {utilityTypeIcons[transfer.utilityType] ? (() => { const Icon = utilityTypeIcons[transfer.utilityType]; return <Icon className="w-3.5 h-3.5 text-muted-foreground" />; })() : null}
                            {transfer.utilityType}
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant={transfer.transferType === "Start" ? "default" : "outline"} className="text-xs" data-testid={`badge-transfer-type-${idx}`}>
                            {transfer.transferType}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {transfer.date}
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant={transferStatusVariant[transfer.status]} className="text-xs" data-testid={`badge-transfer-status-${idx}`}>
                            {transfer.status === "Completed" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {transfer.status === "Pending" && <Clock className="w-3 h-3 mr-1" />}
                            {transfer.status}
                          </Badge>
                        </td>
                        <td className="p-3 font-mono text-xs text-muted-foreground">{transfer.confirmation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card data-testid="card-consumption-analytics">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Activity className="w-5 h-5 text-primary" />
                <CardTitle>Consumption Analytics</CardTitle>
                <Badge variant="secondary" className="text-xs">Agent-Monitored</Badge>
              </div>
              <CardDescription>Building and unit-level consumption trends with anomaly detection and efficiency recommendations</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Unit/Building</th>
                      <th className="p-3 font-medium text-muted-foreground">Type</th>
                      <th className="p-3 font-medium text-muted-foreground">Current Month</th>
                      <th className="p-3 font-medium text-muted-foreground">Last Year</th>
                      <th className="p-3 font-medium text-muted-foreground">YoY Change</th>
                      <th className="p-3 font-medium text-muted-foreground">Status</th>
                      <th className="p-3 font-medium text-muted-foreground">Recommendation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consumptionAnalytics.map((item, idx) => (
                      <tr key={idx} className={`border-b last:border-0 hover-elevate ${item.anomaly ? "bg-red-50/50 dark:bg-red-950/20" : ""}`} data-testid={`row-analytics-${idx}`}>
                        <td className="p-3 font-medium">
                          <div className="flex items-center gap-1.5">
                            {item.unit.startsWith("Building") ? <Building2 className="w-3.5 h-3.5 text-muted-foreground" /> : null}
                            {item.unit}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            {item.type === "Water" && <Droplets className="w-3.5 h-3.5 text-muted-foreground" />}
                            {item.type === "Electric" && <Zap className="w-3.5 h-3.5 text-muted-foreground" />}
                            {item.type === "Gas" && <Flame className="w-3.5 h-3.5 text-muted-foreground" />}
                            {item.type}
                          </div>
                        </td>
                        <td className="p-3 font-mono tabular-nums">{item.currentMonth}</td>
                        <td className="p-3 font-mono tabular-nums text-muted-foreground">{item.lastYear}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            {item.yoyChange.startsWith("-") ? (
                              <TrendingDown className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <TrendingUp className={`w-3 h-3 ${item.anomaly ? "text-red-600" : "text-amber-600"}`} />
                            )}
                            <span className={`font-medium ${item.anomaly ? "text-red-600 dark:text-red-400" : item.yoyChange.startsWith("-") ? "text-emerald-600" : "text-amber-600"}`} data-testid={`text-yoy-${idx}`}>
                              {item.yoyChange}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          {item.anomaly ? (
                            <Badge variant="destructive" className="text-xs" data-testid={`badge-anomaly-status-${idx}`}>
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Anomaly
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs" data-testid={`badge-normal-status-${idx}`}>
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Normal
                            </Badge>
                          )}
                        </td>
                        <td className="p-3 text-muted-foreground text-xs max-w-[200px]">{item.recommendation}</td>
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