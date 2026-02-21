import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AINudgeCard, AgentInsightStrip } from "@/components/ai-nudge-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
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

const statusBadgeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "Occupied": "secondary",
  "Vacant-Ready": "default",
  "Make-Ready": "outline",
  "Down": "destructive",
  "Notice": "outline",
};

const stageColors: Record<string, string> = {
  "inspection": "text-blue-600 dark:text-blue-400",
  "cleaning": "text-cyan-600 dark:text-cyan-400",
  "repairs": "text-amber-600 dark:text-amber-400",
  "paint": "text-violet-600 dark:text-violet-400",
  "final_inspection": "text-orange-600 dark:text-orange-400",
  "ready": "text-emerald-600 dark:text-emerald-400",
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

function formatStatus(status: string): string {
  switch (status) {
    case "occupied": return "Occupied";
    case "vacant": return "Vacant-Ready";
    case "make_ready": return "Make-Ready";
    case "down": return "Down";
    case "notice": return "Notice";
    default: return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

function formatStage(stage: string): string {
  switch (stage) {
    case "inspection": return "Inspection";
    case "cleaning": return "Cleaning";
    case "repairs": return "Repairs";
    case "paint": return "Paint";
    case "final_inspection": return "Final Inspection";
    case "ready": return "Ready";
    default: return stage.charAt(0).toUpperCase() + stage.slice(1).replace(/_/g, " ");
  }
}

function formatDate(dateVal: string | Date | null | undefined): string {
  if (!dateVal) return "--";
  const d = new Date(dateVal);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatCurrency(val: string | number | null | undefined): string {
  if (val == null) return "--";
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return "--";
  return `$${num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6" data-testid="loading-skeleton">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-1 pt-3 px-3">
              <Skeleton className="h-3 w-20" />
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <Skeleton className="h-6 w-12 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Units() {
  const { data: unitsData, isLoading: unitsLoading, error: unitsError } = useQuery<any[]>({
    queryKey: ['/api/units'],
  });

  const { data: unitTurnsData, isLoading: turnsLoading, error: turnsError } = useQuery<any[]>({
    queryKey: ['/api/unit-turns'],
  });

  const { data: leasesData, isLoading: leasesLoading, error: leasesError } = useQuery<any[]>({
    queryKey: ['/api/leases'],
  });

  const isLoading = unitsLoading || turnsLoading || leasesLoading;
  const hasError = unitsError || turnsError || leasesError;

  const units = unitsData || [];
  const unitTurns = unitTurnsData || [];
  const leases = leasesData || [];

  const activeLeaseTenantMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const lease of leases) {
      if (lease.active && lease.tenantName && lease.unitId) {
        map[lease.unitId] = lease.tenantName;
      }
    }
    return map;
  }, [leases]);

  const kpiCards = useMemo(() => {
    const total = units.length;
    const occupied = units.filter((u: any) => u.status === "occupied").length;
    const vacant = units.filter((u: any) => u.status === "vacant").length;
    const makeReady = units.filter((u: any) => u.status === "make_ready").length;
    const down = units.filter((u: any) => u.status === "down").length;
    const occupancyRate = total > 0 ? ((occupied / total) * 100).toFixed(1) : "0.0";

    return [
      { title: "Total Units", value: total.toString(), change: `Across ${new Set(units.map((u: any) => u.building).filter(Boolean)).size} buildings`, trend: "up" as const, icon: Building2, color: "text-blue-600" },
      { title: "Occupied", value: occupied.toString(), change: `${occupancyRate}% occupancy`, trend: "up" as const, icon: Users, color: "text-emerald-600" },
      { title: "Vacant-Ready", value: vacant.toString(), change: "Available now", trend: "up" as const, icon: Home, color: "text-violet-600" },
      { title: "Make-Ready", value: makeReady.toString(), change: unitTurns.length > 0 ? `Avg ${Math.round(unitTurns.reduce((s: number, t: any) => s + (t.daysInProcess || 0), 0) / unitTurns.length)} days` : "No turns", trend: "down" as const, icon: Hammer, color: "text-amber-600" },
      { title: "Down/Offline", value: down.toString(), change: `${down} offline`, trend: "down" as const, icon: AlertTriangle, color: "text-red-600" },
      { title: "Occupancy Rate", value: `${occupancyRate}%`, change: "Current rate", trend: "up" as const, icon: BarChart3, color: "text-indigo-600" },
    ];
  }, [units, unitTurns]);

  const occupancyMatrix = useMemo(() => {
    const buildingMap: Record<string, Record<number, { unit: string; status: string }[]>> = {};
    for (const u of units) {
      const bldg = u.building || "A";
      const flr = u.floor || 1;
      if (!buildingMap[bldg]) buildingMap[bldg] = {};
      if (!buildingMap[bldg][flr]) buildingMap[bldg][flr] = [];
      buildingMap[bldg][flr].push({ unit: u.unitNumber, status: formatStatus(u.status) });
    }
    return Object.entries(buildingMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([building, floors]) => ({
        building,
        floors: Object.entries(floors)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([floor, floorUnits]) => ({ floor: Number(floor), units: floorUnits })),
      }));
  }, [units]);

  const rentRoll = useMemo(() => {
    const unitMarketRentMap: Record<string, string | null> = {};
    for (const u of units) {
      unitMarketRentMap[u.id] = u.marketRent;
    }
    return leases
      .filter((l: any) => l.active)
      .map((l: any) => {
        const monthlyRent = parseFloat(l.monthlyRent) || 0;
        const marketRent = parseFloat(unitMarketRentMap[l.unitId] || l.monthlyRent) || 0;
        const variance = monthlyRent - marketRent;
        return {
          id: l.id,
          unit: l.unitNumber || "--",
          tenant: l.tenantName || "--",
          leaseStart: l.startDate,
          leaseEnd: l.endDate,
          monthlyRent,
          marketRent,
          variance,
          lastIncrease: l.rentIncreaseDate,
        };
      });
  }, [leases, units]);

  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="page-units">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-page-title">Unit Inventory & Status</h1>
            <p className="text-muted-foreground">AI-powered unit tracking, rent roll, and occupancy management</p>
          </div>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="space-y-6" data-testid="page-units">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-page-title">Unit Inventory & Status</h1>
            <p className="text-muted-foreground">AI-powered unit tracking, rent roll, and occupancy management</p>
          </div>
        </div>
        <Card data-testid="error-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Failed to load unit data. Please try refreshing the page.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <TabsTrigger value="occupancy" data-testid="tab-occupancy">Occupancy Matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="space-y-4">
          <Card data-testid="card-unit-directory">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Building2 className="w-5 h-5 text-primary" />
                <CardTitle>All Units</CardTitle>
                <Badge variant="secondary" className="text-xs">{units.length} units shown</Badge>
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
                    {units.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-6 text-center text-muted-foreground">No units found</td>
                      </tr>
                    ) : (
                      units.map((item: any, idx: number) => {
                        const displayStatus = formatStatus(item.status);
                        const tenant = activeLeaseTenantMap[item.id] || null;
                        return (
                          <tr key={item.id} className="border-b last:border-0 hover-elevate" data-testid={`row-unit-${idx}`}>
                            <td className="p-3 font-semibold font-mono">{item.unitNumber}</td>
                            <td className="p-3 text-muted-foreground">{item.building || "--"}</td>
                            <td className="p-3 text-muted-foreground">{item.floor || "--"}</td>
                            <td className="p-3">
                              <Badge variant="outline" className="text-xs" data-testid={`badge-type-${idx}`}>{item.unitType || "--"}</Badge>
                            </td>
                            <td className="p-3 text-muted-foreground font-mono text-xs">{item.sqft ? item.sqft.toLocaleString() : "--"}</td>
                            <td className="p-3" data-testid={`text-tenant-${idx}`}>
                              {tenant || <span className="text-muted-foreground/50">--</span>}
                            </td>
                            <td className="p-3">
                              <Badge variant={statusBadgeVariant[displayStatus] || "outline"} className="text-xs" data-testid={`badge-status-${idx}`}>
                                {displayStatus}
                              </Badge>
                            </td>
                            <td className="p-3 font-mono text-xs" data-testid={`text-market-rent-${idx}`}>
                              {formatCurrency(item.marketRent)}
                            </td>
                          </tr>
                        );
                      })
                    )}
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
                <Badge variant="secondary" className="text-xs">{unitTurns.length} units</Badge>
              </div>
              <CardDescription>Units in turn process with status pipeline tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {unitTurns.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground" data-testid="empty-make-ready">No unit turns in progress</div>
              ) : (
                unitTurns.map((item: any, idx: number) => {
                  const displayStage = formatStage(item.stage);
                  return (
                    <div key={item.id} className="p-4 border rounded-lg space-y-3" data-testid={`card-make-ready-${idx}`}>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-semibold">Unit {item.unitNumber}</span>
                          <span className={`text-sm font-medium ${stageColors[item.stage] || stageColors[displayStage] || "text-foreground"}`} data-testid={`text-stage-${idx}`}>
                            {displayStage}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                          <span>{item.daysInProcess || 0} days in process</span>
                          <span className="text-muted-foreground/50">|</span>
                          <span>Target: {formatDate(item.targetDate)}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{item.progress || 0}%</span>
                        </div>
                        <Progress value={item.progress || 0} className="h-2" data-testid={`progress-make-ready-${idx}`} />
                      </div>
                      <div className="flex gap-1">
                        {["Inspection", "Cleaning", "Repairs", "Paint", "Final Inspection", "Ready"].map((step) => {
                          const stageOrder = ["inspection", "cleaning", "repairs", "paint", "final_inspection", "ready"];
                          const displayOrder = ["Inspection", "Cleaning", "Repairs", "Paint", "Final Inspection", "Ready"];
                          const currentIndex = stageOrder.indexOf(item.stage?.toLowerCase?.() || "");
                          const stepIndex = displayOrder.indexOf(step);
                          const isComplete = currentIndex >= 0 && stepIndex < currentIndex;
                          const isCurrent = currentIndex >= 0 && stepIndex === currentIndex;
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
                  );
                })
              )}
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
                    {rentRoll.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-6 text-center text-muted-foreground">No active leases found</td>
                      </tr>
                    ) : (
                      rentRoll.map((item: any, idx: number) => (
                        <tr key={item.id} className="border-b last:border-0 hover-elevate" data-testid={`row-rent-${idx}`}>
                          <td className="p-3 font-semibold font-mono">{item.unit}</td>
                          <td className="p-3" data-testid={`text-rent-tenant-${idx}`}>{item.tenant}</td>
                          <td className="p-3 text-muted-foreground text-xs">{formatDate(item.leaseStart)}</td>
                          <td className="p-3 text-muted-foreground text-xs">{formatDate(item.leaseEnd)}</td>
                          <td className="p-3 font-mono text-xs" data-testid={`text-monthly-rent-${idx}`}>{formatCurrency(item.monthlyRent)}</td>
                          <td className="p-3 font-mono text-xs text-muted-foreground">{formatCurrency(item.marketRent)}</td>
                          <td className="p-3">
                            <span className={`font-mono text-xs font-medium ${Math.abs(item.variance) > 100 ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"}`} data-testid={`text-variance-${idx}`}>
                              {item.variance >= 0 ? "+" : ""}{formatCurrency(item.variance)}
                            </span>
                          </td>
                          <td className="p-3 text-muted-foreground text-xs">{formatDate(item.lastIncrease)}</td>
                        </tr>
                      ))
                    )}
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
              {occupancyMatrix.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground" data-testid="empty-occupancy">No unit data available for matrix view</div>
              ) : (
                occupancyMatrix.map((bldg) => (
                  <div key={bldg.building} className="space-y-2" data-testid={`matrix-building-${bldg.building}`}>
                    <h4 className="text-sm font-semibold">Building {bldg.building}</h4>
                    {bldg.floors.map((flr) => (
                      <div key={flr.floor} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-12 flex-shrink-0">Floor {flr.floor}</span>
                        <div className="flex gap-1.5 flex-wrap">
                          {flr.units.map((u) => (
                            <div
                              key={u.unit}
                              className={`w-14 h-10 rounded-md border flex items-center justify-center text-[10px] font-medium ${matrixStatusColors[u.status] || matrixStatusColors["Occupied"]}`}
                              data-testid={`matrix-unit-${bldg.building}-${u.unit}`}
                            >
                              {u.unit}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
