import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  BarChart3,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from "recharts";

interface ForecastData {
  daily: Array<{
    date: string;
    dayLabel: string;
    inflow: number;
    outflow: number;
    netCashFlow: number;
    cumulativeNet: number;
    rentCollected: number;
    vendorPayments: number;
    confidence: number;
  }>;
  weekly: Array<{
    week: string;
    startDate: string;
    inflow: number;
    outflow: number;
    netCashFlow: number;
    avgConfidence: number;
  }>;
  summary: {
    totalProjectedInflow: number;
    totalProjectedOutflow: number;
    netCashPosition: number;
    avgDailyInflow: number;
    avgDailyOutflow: number;
    liquidityRiskDays: number;
    peakInflowDay: string;
    lowestCashDay: string;
  };
  scenarios: Array<{
    name: string;
    description: string;
    probability: number;
    noi90Day: number;
    cashReserve: number;
    delinquencyRate: number;
  }>;
  assumptions: {
    occupancyRate: number;
    avgRent: number;
    onTimeRate: number;
    vendorTerms: string;
    maintenanceReserve: number;
    yieldOnFloat: number;
  };
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8" data-testid="loading-skeleton">
      <div>
        <Skeleton className="h-10 w-72 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-lg" />
    </div>
  );
}

function getScenarioIcon(name: string) {
  if (name.toLowerCase().includes("optimistic")) return ArrowUpRight;
  if (name.toLowerCase().includes("stress")) return AlertTriangle;
  return Activity;
}

function getScenarioColor(name: string) {
  if (name.toLowerCase().includes("optimistic")) return "text-green-600 dark:text-green-400";
  if (name.toLowerCase().includes("stress")) return "text-red-600 dark:text-red-400";
  return "text-blue-600 dark:text-blue-400";
}

export default function CashFlowForecast() {
  const [view, setView] = useState<"daily" | "weekly">("daily");

  const { data, isLoading } = useQuery<ForecastData>({
    queryKey: ["/api/forecast"],
  });

  if (isLoading || !data) {
    return <LoadingSkeleton />;
  }

  const { summary, daily, weekly, scenarios, assumptions } = data;

  const kpiCards = [
    {
      title: "Total Projected Inflow",
      value: `$${summary.totalProjectedInflow.toLocaleString()}`,
      icon: ArrowUpRight,
      color: "text-green-600",
      description: `Peak: ${summary.peakInflowDay}`,
    },
    {
      title: "Total Projected Outflow",
      value: `$${summary.totalProjectedOutflow.toLocaleString()}`,
      icon: ArrowDownRight,
      color: "text-red-600",
      description: `Avg daily: $${summary.avgDailyOutflow.toLocaleString()}`,
    },
    {
      title: "Net Cash Position",
      value: `$${summary.netCashPosition.toLocaleString()}`,
      icon: DollarSign,
      color: summary.netCashPosition >= 0 ? "text-green-600" : "text-red-600",
      description: `Avg daily inflow: $${summary.avgDailyInflow.toLocaleString()}`,
    },
    {
      title: "Liquidity Risk Days",
      value: `${summary.liquidityRiskDays}`,
      icon: AlertTriangle,
      color: summary.liquidityRiskDays > 5 ? "text-red-600" : summary.liquidityRiskDays > 2 ? "text-amber-600" : "text-green-600",
      description: `Lowest cash: ${summary.lowestCashDay}`,
    },
  ];

  const chartData = view === "daily" ? daily : weekly;
  const xKey = view === "daily" ? "dayLabel" : "week";

  return (
    <div className="space-y-8" data-testid="page-cash-flow-forecast">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight mb-2">Cash Flow Forecast</h1>
        <p className="text-muted-foreground">
          30/60/90-day liquidity projection with scenario analysis
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="kpi-grid">
        {kpiCards.map((card, index) => (
          <Card key={card.title} className="hover-elevate" data-testid={`card-kpi-${index}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-mono tabular-nums font-semibold" data-testid={`kpi-value-${index}`}>
                {card.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card data-testid="card-cash-flow-chart">
        <CardHeader>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <div>
                <CardTitle>Cash Flow Projection</CardTitle>
                <CardDescription>Inflow vs outflow over the forecast period</CardDescription>
              </div>
            </div>
            <Tabs value={view} onValueChange={(v) => setView(v as "daily" | "weekly")} data-testid="tabs-view-toggle">
              <TabsList>
                <TabsTrigger value="daily" data-testid="tab-daily">
                  <Calendar className="w-4 h-4 mr-1" />
                  Daily
                </TabsTrigger>
                <TabsTrigger value="weekly" data-testid="tab-weekly">
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Weekly
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[360px] w-full" data-testid="chart-area-cashflow">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey={xKey}
                  className="text-xs fill-muted-foreground"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  className="text-xs fill-muted-foreground"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                    fontSize: "12px",
                    color: "hsl(var(--popover-foreground))",
                  }}
                  formatter={(value: number, name: string) => [
                    `$${value.toLocaleString()}`,
                    name,
                  ]}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="inflow"
                  name="Inflow"
                  stroke="hsl(var(--chart-1))"
                  fill="hsl(var(--chart-1) / 0.15)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="outflow"
                  name="Outflow"
                  stroke="hsl(var(--chart-2))"
                  fill="hsl(var(--chart-2) / 0.15)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Scenario Comparison</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="scenarios-grid">
          {scenarios.map((scenario, index) => {
            const Icon = getScenarioIcon(scenario.name);
            const colorClass = getScenarioColor(scenario.name);
            return (
              <Card key={scenario.name} className="hover-elevate" data-testid={`card-scenario-${index}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-5 h-5 ${colorClass}`} />
                      <CardTitle className="text-base">{scenario.name}</CardTitle>
                    </div>
                    <Badge variant="secondary" data-testid={`badge-probability-${index}`}>
                      {(scenario.probability * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">{scenario.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-muted-foreground">90-Day NOI</span>
                    <span className="text-sm font-mono font-semibold" data-testid={`text-noi-${index}`}>
                      ${scenario.noi90Day.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-muted-foreground">Cash Reserve</span>
                    <span className="text-sm font-mono font-semibold" data-testid={`text-reserve-${index}`}>
                      ${scenario.cashReserve.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-muted-foreground">Delinquency Rate</span>
                    <span className="text-sm font-mono font-semibold" data-testid={`text-delinquency-${index}`}>
                      {(scenario.delinquencyRate * 100).toFixed(1)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Card data-testid="card-assumptions">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <div>
              <CardTitle>Model Assumptions</CardTitle>
              <CardDescription>Current parameters driving the forecast model</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-3 border rounded-lg" data-testid="assumption-occupancy">
              <p className="text-xs text-muted-foreground">Occupancy Rate</p>
              <p className="text-lg font-mono font-semibold">{(assumptions.occupancyRate * 100).toFixed(1)}%</p>
            </div>
            <div className="p-3 border rounded-lg" data-testid="assumption-avg-rent">
              <p className="text-xs text-muted-foreground">Avg Rent</p>
              <p className="text-lg font-mono font-semibold">${assumptions.avgRent.toLocaleString()}</p>
            </div>
            <div className="p-3 border rounded-lg" data-testid="assumption-on-time">
              <p className="text-xs text-muted-foreground">On-Time Rate</p>
              <p className="text-lg font-mono font-semibold">{(assumptions.onTimeRate * 100).toFixed(1)}%</p>
            </div>
            <div className="p-3 border rounded-lg" data-testid="assumption-vendor-terms">
              <p className="text-xs text-muted-foreground">Vendor Terms</p>
              <p className="text-lg font-mono font-semibold">{assumptions.vendorTerms}</p>
            </div>
            <div className="p-3 border rounded-lg" data-testid="assumption-maintenance">
              <p className="text-xs text-muted-foreground">Maintenance Reserve</p>
              <p className="text-lg font-mono font-semibold">${assumptions.maintenanceReserve.toLocaleString()}</p>
            </div>
            <div className="p-3 border rounded-lg" data-testid="assumption-yield">
              <p className="text-xs text-muted-foreground">Yield on Float</p>
              <p className="text-lg font-mono font-semibold">{(assumptions.yieldOnFloat * 100).toFixed(2)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}