import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AINudgeCard, AgentInsightStrip } from "@/components/ai-nudge-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Building2,
  Home,
  Users,
  Hammer,
  AlertTriangle,
  TrendingUp,
  Brain,
  Target,
  Calendar,
  DollarSign,
  Sparkles,
  Eye,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  BarChart3,
  Layers,
  Grid3x3,
  type LucideIcon,
} from "lucide-react";

const agentInsights = [
  { text: "Vacancy rate 10.0% - above 8% target", severity: "warning" as const, confidence: 0.95 },
  { text: "8 make-ready units averaging 12 days in process", severity: "info" as const },
  { text: "15 units below market rent by >5%", severity: "critical" as const, confidence: 0.91 },
];

const kpiCards = [
  { title: "Total Units", value: "380", change: "Across 4 buildings", trend: "up", icon: Building2, color: "text-blue-600" },
  { title: "Occupied", value: "342", change: "90.0% occupancy", trend: "up", icon: Users, color: "text-emerald-600" },
  { title: "Vacant-Ready", value: "15", change: "Available now", trend: "up", icon: Home, color: "text-violet-600" },
  { title: "Make-Ready", value: "8", change: "Avg 12 days", trend: "down", icon: Hammer, color: "text-amber-600" },
  { title: "Down/Offline", value: "3", change: "2 renovations", trend: "down", icon: AlertTriangle, color: "text-red-600" },
  { title: "Occupancy Rate", value: "90.0%", change: "+1.2% vs prior", trend: "up", icon: BarChart3, color: "text-indigo-600" },
];

const unitDirectory = [
  { id: 1, unit: "101", building: "A", floor: 1, type: "Studio", sqft: 450, tenant: "Maria Gonzalez", status: "Occupied", marketRent: 1250 },
  { id: 2, unit: "102", building: "A", floor: 1, type: "1BR", sqft: 650, tenant: "James Carter", status: "Occupied", marketRent: 1550 },
  { id: 3, unit: "103", building: "A", floor: 1, type: "2BR", sqft: 900, tenant: null, status: "Vacant-Ready", marketRent: 1950 },
  { id: 4, unit: "201", building: "A", floor: 2, type: "1BR", sqft: 680, tenant: "Linda Park", status: "Occupied", marketRent: 1600 },
  { id: 5, unit: "202", building: "A", floor: 2, type: "3BR", sqft: 1200, tenant: "Robert Chen", status: "Occupied", marketRent: 2450 },
  { id: 6, unit: "203", building: "A", floor: 2, type: "2BR", sqft: 920, tenant: null, status: "Make-Ready", marketRent: 2000 },
  { id: 7, unit: "301", building: "B", floor: 3, type: "Studio", sqft: 480, tenant: "Angela Davis", status: "Occupied", marketRent: 1300 },
  { id: 8, unit: "302", building: "B", floor: 3, type: "1BR", sqft: 700, tenant: null, status: "Down", marketRent: 1650 },
  { id: 9, unit: "303", building: "B", floor: 3, type: "2BR", sqft: 950, tenant: "David Kim", status: "Occupied", marketRent: 2050 },
  { id: 10, unit: "401", building: "B", floor: 4, type: "3BR", sqft: 1250, tenant: "Sarah Mitchell", status: "Notice", marketRent: 2500 },
];

const makeReadyBoard = [
  { id: 1, unit: "103", stage: "Final Inspection", daysInProcess: 14, targetDate: "Feb 26, 2026", progress: 85 },
  { id: 2, unit: "203", stage: "Repairs", daysInProcess: 8, targetDate: "Mar 1, 2026", progress: 40 },
  { id: 3, unit: "504", stage: "Cleaning", daysInProcess: 3, targetDate: "Mar 5, 2026", progress: 20 },
  { id: 4, unit: "107", stage: "Paint", daysInProcess: 10, targetDate: "Feb 28, 2026", progress: 60 },
  { id: 5, unit: "308", stage: "Inspection", daysInProcess: 1, targetDate: "Mar 10, 2026", progress: 10 },
  { id: 6, unit: "215", stage: "Ready", daysInProcess: 18, targetDate: "Feb 22, 2026", progress: 100 },
  { id: 7, unit: "410", stage: "Cleaning", daysInProcess: 5, targetDate: "Mar 3, 2026", progress: 25 },
  { id: 8, unit: "112", stage: "Repairs", daysInProcess: 11, targetDate: "Mar 2, 2026", progress: 45 },
];

const rentRoll = [
  { id: 1, unit: "101", tenant: "Maria Gonzalez", leaseStart: "Jun 1, 2025", leaseEnd: "May 31, 2026", monthlyRent: 1200, marketRent: 1250, variance: -50, lastIncrease: "Jun 1, 2025" },
  { id: 2, unit: "102", tenant: "James Carter", leaseStart: "Aug 15, 2025", leaseEnd: "Aug 14, 2026", monthlyRent: 1500, marketRent: 1550, variance: -50, lastIncrease: "Aug 15, 2025" },
  { id: 3, unit: "201", tenant: "Linda Park", leaseStart: "Mar 1, 2025", leaseEnd: "Feb 28, 2026", monthlyRent: 1480, marketRent: 1600, variance: -120, lastIncrease: "Mar 1, 2025" },
  { id: 4, unit: "202", tenant: "Robert Chen", leaseStart: "Jan 1, 2025", leaseEnd: "Dec 31, 2025", monthlyRent: 2300, marketRent: 2450, variance: -150, lastIncrease: "Jan 1, 2025" },
  { id: 5, unit: "301", tenant: "Angela Davis", leaseStart: "Sep 1, 2025", leaseEnd: "Aug 31, 2026", monthlyRent: 1280, marketRent: 1300, variance: -20, lastIncrease: "Sep 1, 2025" },
  { id: 6, unit: "303", tenant: "David Kim", leaseStart: "Apr 1, 2025", leaseEnd: "Mar 31, 2026", monthlyRent: 1900, marketRent: 2050, variance: -150, lastIncrease: "Apr 1, 2025" },
  { id: 7, unit: "401", tenant: "Sarah Mitchell", leaseStart: "Jul 1, 2025", leaseEnd: "Jun 30, 2026", monthlyRent: 2400, marketRent: 2500, variance: -100, lastIncrease: "Jul 1, 2025" },
  { id: 8, unit: "105", tenant: "Tom Williams", leaseStart: "Nov 1, 2025", leaseEnd: "Oct 31, 2026", monthlyRent: 1700, marketRent: 1750, variance: -50, lastIncrease: "Nov 1, 2025" },
  { id: 9, unit: "204", tenant: "Karen Phillips", leaseStart: "Feb 1, 2025", leaseEnd: "Jan 31, 2026", monthlyRent: 1850, marketRent: 2000, variance: -150, lastIncrease: "Feb 1, 2025" },
  { id: 10, unit: "305", tenant: "Daniel Harris", leaseStart: "May 15, 2025", leaseEnd: "May 14, 2026", monthlyRent: 1650, marketRent: 1700, variance: -50, lastIncrease: "May 15, 2025" },
];

const unitFeatures = [
  { unit: "101", washerDryer: true, dishwasher: false, patio: false, renovated: false, hardwood: false, granite: true },
  { unit: "102", washerDryer: true, dishwasher: true, patio: true, renovated: true, hardwood: true, granite: true },
  { unit: "103", washerDryer: false, dishwasher: true, patio: false, renovated: false, hardwood: false, granite: false },
  { unit: "201", washerDryer: true, dishwasher: true, patio: true, renovated: false, hardwood: true, granite: false },
  { unit: "202", washerDryer: true, dishwasher: true, patio: true, renovated: true, hardwood: true, granite: true },
  { unit: "301", washerDryer: false, dishwasher: false, patio: false, renovated: false, hardwood: false, granite: false },
  { unit: "303", washerDryer: true, dishwasher: true, patio: false, renovated: true, hardwood: true, granite: true },
  { unit: "401", washerDryer: true, dishwasher: true, patio: true, renovated: true, hardwood: true, granite: true },
];

const occupancyMatrix = [
  { building: "A", floors: [
    { floor: 1, units: [{ unit: "101", status: "Occupied" }, { unit: "102", status: "Occupied" }, { unit: "103", status: "Vacant-Ready" }, { unit: "104", status: "Occupied" }, { unit: "105", status: "Occupied" }] },
    { floor: 2, units: [{ unit: "201", status: "Occupied" }, { unit: "202", status: "Occupied" }, { unit: "203", status: "Make-Ready" }, { unit: "204", status: "Occupied" }, { unit: "205", status: "Occupied" }] },
    { floor: 3, units: [{ unit: "301", status: "Occupied" }, { unit: "302", status: "Vacant-Ready" }, { unit: "303", status: "Occupied" }, { unit: "304", status: "Occupied" }, { unit: "305", status: "Notice" }] },
  ]},
  { building: "B", floors: [
    { floor: 1, units: [{ unit: "101", status: "Occupied" }, { unit: "102", status: "Occupied" }, { unit: "103", status: "Occupied" }, { unit: "104", status: "Vacant-Ready" }, { unit: "105", status: "Occupied" }] },
    { floor: 2, units: [{ unit: "201", status: "Occupied" }, { unit: "202", status: "Occupied" }, { unit: "203", status: "Occupied" }, { unit: "204", status: "Occupied" }, { unit: "205", status: "Make-Ready" }] },
    { floor: 3, units: [{ unit: "301", status: "Occupied" }, { unit: "302", status: "Down" }, { unit: "303", status: "Occupied" }, { unit: "304", status: "Occupied" }, { unit: "305", status: "Occupied" }] },
    { floor: 4, units: [{ unit: "401", status: "Notice" }, { unit: "402", status: "Occupied" }, { unit: "403", status: "Occupied" }, { unit: "404", status: "Vacant-Ready" }, { unit: "405", status: "Occupied" }] },
  ]},
];

const statusBadgeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "Occupied": "secondary",
  "Vacant-Ready": "default",
  "Make-Ready": "outline",
  "Down": "destructive",
  "Notice": "outline",
};

const stageColors: Record<string, string> = {
  "Inspection": "text-blue-600 dark:text-blue-400",
  "Cleaning": "text-cyan-600 dark:text-cyan-400",
  "Repairs": "text-amber-600 dark:text-amber-400",
  "Paint": "text-violet-600 dark:text-violet-400",
  "Final Inspection": "text-orange-600 dark:text-orange-400",
  "Ready": "text-emerald-600 dark:text-emerald-400",
};

const matrixStatusColors: Record<string, string> = {
  "Occupied": "bg-emerald-100 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400",
  "Vacant-Ready": "bg-blue-100 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400",
  "Make-Ready": "bg-amber-100 dark:bg-amber-900/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400",
  "Down": "bg-red-100 dark:bg-red-900/40 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400",
  "Notice": "bg-violet-100 dark:bg-violet-900/40 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-400",
};

export default function Units() {
  return (
    <div className="space-y-6" data-testid="page-units">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-page-title">Unit Inventory & Status</h1>
          <p className="text-muted-foreground">AI-powered unit tracking, rent roll, and occupancy management</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs" data-testid="badge-agent-status">
            <Brain className="w-3 h-3 mr-1 text-primary" />
            Agent Active
          </Badge>
          <Button size="sm" data-testid="button-add-unit">
            <Building2 className="w-4 h-4 mr-1" />
            Add Unit
          </Button>
        </div>
      </div>

      <AgentInsightStrip insights={agentInsights} />

      <AINudgeCard
        title="Rent Pricing Optimization Available"
        insight="Agent analysis of market comps and lease expiration timing indicates 15 units are $50-$150 below market. Staged rent increases at renewal could generate an additional $18,600/year in revenue with minimal turnover risk."
        confidence={0.89}
        severity="opportunity"
        icon={DollarSign}
        actionLabel="View Recommendations"
        onAction={() => {}}
        secondaryLabel="Export Report"
        onSecondary={() => {}}
        metric="$18,600/yr"
        metricLabel="Revenue Opportunity"
      />

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
                {card.trend === "up" ? (
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                )}
                <span className={card.trend === "up" ? "text-emerald-600" : "text-amber-600"}>{card.change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="directory" className="space-y-4">
        <TabsList data-testid="tabs-units">
          <TabsTrigger value="directory" data-testid="tab-directory">Unit Directory</TabsTrigger>
          <TabsTrigger value="make-ready" data-testid="tab-make-ready">Make-Ready Board</TabsTrigger>
          <TabsTrigger value="rent-roll" data-testid="tab-rent-roll">Rent Roll</TabsTrigger>
          <TabsTrigger value="features" data-testid="tab-features">Unit Features</TabsTrigger>
          <TabsTrigger value="occupancy" data-testid="tab-occupancy">Occupancy Matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="space-y-4">
          <Card data-testid="card-unit-directory">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Building2 className="w-5 h-5 text-primary" />
                <CardTitle>All Units</CardTitle>
                <Badge variant="secondary" className="text-xs">{unitDirectory.length} units shown</Badge>
              </div>
              <CardDescription>Complete unit directory with status, type, and current tenant information</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Unit</th>
                      <th className="p-3 font-medium text-muted-foreground">Building</th>
                      <th className="p-3 font-medium text-muted-foreground">Floor</th>
                      <th className="p-3 font-medium text-muted-foreground">Type</th>
                      <th className="p-3 font-medium text-muted-foreground">Sq Ft</th>
                      <th className="p-3 font-medium text-muted-foreground">Tenant</th>
                      <th className="p-3 font-medium text-muted-foreground">Status</th>
                      <th className="p-3 font-medium text-muted-foreground">Market Rent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unitDirectory.map((item, idx) => (
                      <tr key={item.id} className="border-b last:border-0 hover-elevate" data-testid={`row-unit-${idx}`}>
                        <td className="p-3 font-semibold font-mono">{item.unit}</td>
                        <td className="p-3 text-muted-foreground">{item.building}</td>
                        <td className="p-3 text-muted-foreground">{item.floor}</td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-xs" data-testid={`badge-type-${idx}`}>{item.type}</Badge>
                        </td>
                        <td className="p-3 text-muted-foreground font-mono text-xs">{item.sqft.toLocaleString()}</td>
                        <td className="p-3" data-testid={`text-tenant-${idx}`}>
                          {item.tenant || <span className="text-muted-foreground/50">--</span>}
                        </td>
                        <td className="p-3">
                          <Badge variant={statusBadgeVariant[item.status]} className="text-xs" data-testid={`badge-status-${idx}`}>
                            {item.status}
                          </Badge>
                        </td>
                        <td className="p-3 font-mono text-xs" data-testid={`text-market-rent-${idx}`}>
                          ${item.marketRent.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="make-ready" className="space-y-4">
          <Card data-testid="card-make-ready">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Hammer className="w-5 h-5 text-primary" />
                <CardTitle>Make-Ready Pipeline</CardTitle>
                <Badge variant="secondary" className="text-xs">{makeReadyBoard.length} units</Badge>
              </div>
              <CardDescription>Units in turn process with status pipeline tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {makeReadyBoard.map((item, idx) => (
                <div key={item.id} className="p-4 border rounded-lg space-y-3" data-testid={`card-make-ready-${idx}`}>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-semibold">Unit {item.unit}</span>
                      <span className={`text-sm font-medium ${stageColors[item.stage]}`} data-testid={`text-stage-${idx}`}>
                        {item.stage}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                      <span>{item.daysInProcess} days in process</span>
                      <span className="text-muted-foreground/50">|</span>
                      <span>Target: {item.targetDate}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{item.progress}%</span>
                    </div>
                    <Progress value={item.progress} className="h-2" data-testid={`progress-make-ready-${idx}`} />
                  </div>
                  <div className="flex gap-1">
                    {["Inspection", "Cleaning", "Repairs", "Paint", "Final Inspection", "Ready"].map((step) => {
                      const stageOrder = ["Inspection", "Cleaning", "Repairs", "Paint", "Final Inspection", "Ready"];
                      const currentIndex = stageOrder.indexOf(item.stage);
                      const stepIndex = stageOrder.indexOf(step);
                      const isComplete = stepIndex < currentIndex;
                      const isCurrent = stepIndex === currentIndex;
                      return (
                        <div
                          key={step}
                          className={`flex-1 text-center text-[10px] py-1 rounded-md border ${
                            isComplete
                              ? "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                              : isCurrent
                                ? "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 font-medium"
                                : "bg-muted/30 border-muted text-muted-foreground"
                          }`}
                        >
                          {step}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rent-roll" className="space-y-4">
          <Card data-testid="card-rent-roll">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <DollarSign className="w-5 h-5 text-primary" />
                <CardTitle>Rent Roll</CardTitle>
                <Badge variant="secondary" className="text-xs">{rentRoll.length} leases</Badge>
              </div>
              <CardDescription>Current rent roll with market rent comparison and variance analysis</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Unit</th>
                      <th className="p-3 font-medium text-muted-foreground">Tenant</th>
                      <th className="p-3 font-medium text-muted-foreground">Lease Start</th>
                      <th className="p-3 font-medium text-muted-foreground">Lease End</th>
                      <th className="p-3 font-medium text-muted-foreground">Monthly Rent</th>
                      <th className="p-3 font-medium text-muted-foreground">Market Rent</th>
                      <th className="p-3 font-medium text-muted-foreground">Variance</th>
                      <th className="p-3 font-medium text-muted-foreground">Last Increase</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rentRoll.map((item, idx) => (
                      <tr key={item.id} className="border-b last:border-0 hover-elevate" data-testid={`row-rent-${idx}`}>
                        <td className="p-3 font-semibold font-mono">{item.unit}</td>
                        <td className="p-3" data-testid={`text-rent-tenant-${idx}`}>{item.tenant}</td>
                        <td className="p-3 text-muted-foreground text-xs">{item.leaseStart}</td>
                        <td className="p-3 text-muted-foreground text-xs">{item.leaseEnd}</td>
                        <td className="p-3 font-mono text-xs" data-testid={`text-monthly-rent-${idx}`}>${item.monthlyRent.toLocaleString()}</td>
                        <td className="p-3 font-mono text-xs text-muted-foreground">${item.marketRent.toLocaleString()}</td>
                        <td className="p-3">
                          <span className={`font-mono text-xs font-medium ${Math.abs(item.variance) > 100 ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"}`} data-testid={`text-variance-${idx}`}>
                            ${item.variance}
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground text-xs">{item.lastIncrease}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card data-testid="card-unit-features">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Layers className="w-5 h-5 text-primary" />
                <CardTitle>Unit Amenities & Features</CardTitle>
                <Badge variant="secondary" className="text-xs">{unitFeatures.length} units tracked</Badge>
              </div>
              <CardDescription>Track unit-level amenities, upgrades, and features for each unit</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Unit</th>
                      <th className="p-3 font-medium text-muted-foreground">W/D</th>
                      <th className="p-3 font-medium text-muted-foreground">Dishwasher</th>
                      <th className="p-3 font-medium text-muted-foreground">Patio</th>
                      <th className="p-3 font-medium text-muted-foreground">Renovated</th>
                      <th className="p-3 font-medium text-muted-foreground">Hardwood</th>
                      <th className="p-3 font-medium text-muted-foreground">Granite</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unitFeatures.map((item, idx) => (
                      <tr key={item.unit} className="border-b last:border-0" data-testid={`row-feature-${idx}`}>
                        <td className="p-3 font-semibold font-mono">{item.unit}</td>
                        {[item.washerDryer, item.dishwasher, item.patio, item.renovated, item.hardwood, item.granite].map((has, fIdx) => (
                          <td key={fIdx} className="p-3">
                            {has ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" data-testid={`icon-feature-${idx}-${fIdx}`} />
                            ) : (
                              <span className="text-muted-foreground/30">--</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="occupancy" className="space-y-4">
          <Card data-testid="card-occupancy-matrix">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Grid3x3 className="w-5 h-5 text-primary" />
                <CardTitle>Occupancy Matrix</CardTitle>
              </div>
              <CardDescription>Visual grid of all units by building and floor with color-coded status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap text-xs">
                {Object.entries(matrixStatusColors).map(([status, colorClass]) => (
                  <div key={status} className="flex items-center gap-1.5">
                    <div className={`w-3 h-3 rounded-sm border ${colorClass}`} />
                    <span className="text-muted-foreground">{status}</span>
                  </div>
                ))}
              </div>
              {occupancyMatrix.map((bldg) => (
                <div key={bldg.building} className="space-y-2" data-testid={`matrix-building-${bldg.building}`}>
                  <h4 className="text-sm font-semibold">Building {bldg.building}</h4>
                  {bldg.floors.map((flr) => (
                    <div key={flr.floor} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-12 flex-shrink-0">Floor {flr.floor}</span>
                      <div className="flex gap-1.5 flex-wrap">
                        {flr.units.map((u) => (
                          <div
                            key={u.unit}
                            className={`w-14 h-10 rounded-md border flex items-center justify-center text-[10px] font-medium ${matrixStatusColors[u.status]}`}
                            data-testid={`matrix-unit-${bldg.building}-${u.unit}`}
                          >
                            {u.unit}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
