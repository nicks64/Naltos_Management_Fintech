import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  AlertCircle, 
  Home, 
  Landmark, 
  Percent,
  Zap,
  Coins,
  Layers
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface KPIData {
  onTimePercent: number;
  dso: number;
  delinquentAmount: number;
  opexPerUnit: number;
  treasuryAUM: number;
  currentYield: number;
  vendorFloatAUM: number;
  vendorFloatYield: number;
  rentFloatYield: number;
  cryptoTreasuryAUM: number;
  cryptoDeployedBalance: number;
  cryptoYieldAPY: number;
  sparklineData: Array<{ value: number }>;
}

export default function Dashboard() {
  const { data: kpis, isLoading } = useQuery<KPIData>({
    queryKey: ["/api/kpis"],
  });

  const kpiCards = [
    {
      title: "On-Time Payment",
      value: kpis?.onTimePercent ? `${kpis.onTimePercent.toFixed(1)}%` : "—",
      change: "+2.5%",
      trend: "up" as const,
      icon: Percent,
      color: "text-green-600",
    },
    {
      title: "DSO (Days)",
      value: kpis?.dso ? kpis.dso.toFixed(0) : "—",
      change: "-3 days",
      trend: "up" as const,
      icon: Clock,
      color: "text-blue-600",
    },
    {
      title: "Delinquent",
      value: kpis?.delinquentAmount ? `$${(kpis.delinquentAmount / 1000).toFixed(0)}K` : "—",
      change: "-12%",
      trend: "up" as const,
      icon: AlertCircle,
      color: "text-orange-600",
    },
    {
      title: "Opex/Unit",
      value: kpis?.opexPerUnit ? `$${kpis.opexPerUnit.toFixed(0)}` : "—",
      change: "+1.2%",
      trend: "down" as const,
      icon: Home,
      color: "text-purple-600",
    },
    {
      title: "Treasury AUM",
      value: kpis?.treasuryAUM ? `$${(kpis.treasuryAUM / 1000000).toFixed(1)}M` : "—",
      change: "+5.3%",
      trend: "up" as const,
      icon: Landmark,
      color: "text-indigo-600",
    },
    {
      title: "Current Yield",
      value: kpis?.currentYield ? `${kpis.currentYield.toFixed(2)}%` : "—",
      change: "+0.15%",
      trend: "up" as const,
      icon: DollarSign,
      color: "text-emerald-600",
    },
    {
      title: "Vendor Float AUM",
      value: kpis?.vendorFloatAUM ? `$${(kpis.vendorFloatAUM / 1000).toFixed(0)}K` : "—",
      change: "All-Time",
      trend: "up" as const,
      icon: Zap,
      color: "text-violet-600",
    },
    {
      title: "Vendor Yield",
      value: kpis?.vendorFloatYield ? `$${kpis.vendorFloatYield.toFixed(0)}` : "—",
      change: "All-Time",
      trend: "up" as const,
      icon: TrendingUp,
      color: "text-emerald-600",
    },
    {
      title: "Rent Float Yield",
      value: kpis?.rentFloatYield ? `$${kpis.rentFloatYield.toFixed(0)}` : "—",
      change: "Last 30d",
      trend: "up" as const,
      icon: TrendingUp,
      color: "text-emerald-600",
    },
    {
      title: "Crypto Treasury AUM",
      value: kpis?.cryptoTreasuryAUM ? `$${(kpis.cryptoTreasuryAUM / 1000).toFixed(0)}K` : "—",
      change: "USDC+USDT+DAI",
      trend: "up" as const,
      icon: Coins,
      color: "text-cyan-600",
    },
    {
      title: "Crypto Deployed",
      value: kpis?.cryptoDeployedBalance ? `$${(kpis.cryptoDeployedBalance / 1000).toFixed(0)}K` : "—",
      change: "In Treasury",
      trend: "up" as const,
      icon: Layers,
      color: "text-blue-600",
    },
    {
      title: "Crypto Yield APY",
      value: kpis?.cryptoYieldAPY ? `${kpis.cryptoYieldAPY.toFixed(2)}%` : "—",
      change: "Annualized",
      trend: "up" as const,
      icon: TrendingUp,
      color: "text-primary",
    },
  ];

  return (
    <div className="space-y-8" data-testid="page-dashboard">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight mb-2">Overview</h1>
        <p className="text-muted-foreground">
          Real-time insights across your property portfolio
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiCards.map((card, index) => (
          <Card key={card.title} className="hover-elevate" data-testid={`card-kpi-${index}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-mono tabular-nums font-semibold">
                    {isLoading ? (
                      <div className="h-9 w-24 bg-muted animate-pulse rounded" />
                    ) : (
                      card.value
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    {card.trend === "up" ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <span className={card.trend === "up" ? "text-green-600" : "text-red-600"}>
                      {card.change}
                    </span>
                  </div>
                </div>
                {isLoading ? (
                  <div className="h-12 w-full bg-muted animate-pulse rounded" />
                ) : kpis?.sparklineData ? (
                  <ResponsiveContainer width="100%" height={48}>
                    <LineChart data={kpis.sparklineData}>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          <div className="animate-pulse">Loading dashboard data...</div>
        </div>
      )}
    </div>
  );
}
