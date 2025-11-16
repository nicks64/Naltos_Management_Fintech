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
      title: "Vendor Float (USD)",
      value: kpis?.vendorFloatAUM ? `$${(kpis.vendorFloatAUM / 1000).toFixed(0)}K` : "—",
      change: "Net30-90",
      trend: "up" as const,
      icon: Zap,
      color: "text-violet-600",
    },
    {
      title: "Vendor Yield (USD Earned)",
      value: kpis?.vendorFloatYield ? `$${kpis.vendorFloatYield.toFixed(0)}` : "—",
      change: "All-Time",
      trend: "up" as const,
      icon: TrendingUp,
      color: "text-emerald-600",
    },
    {
      title: "Rent Float Yield (USD Earned)",
      value: kpis?.rentFloatYield ? `$${kpis.rentFloatYield.toFixed(0)}` : "—",
      change: "Last 30d",
      trend: "up" as const,
      icon: TrendingUp,
      color: "text-emerald-600",
    },
    {
      title: "Digital Infrastructure",
      value: kpis?.cryptoTreasuryAUM ? `$${(kpis.cryptoTreasuryAUM / 1000).toFixed(0)}K` : "—",
      change: "Backend Rails",
      trend: "up" as const,
      icon: Coins,
      color: "text-cyan-600",
    },
    {
      title: "USD Deployed (Treasury)",
      value: kpis?.cryptoDeployedBalance ? `$${(kpis.cryptoDeployedBalance / 1000).toFixed(0)}K` : "—",
      change: "T-Bills+MMF",
      trend: "up" as const,
      icon: Layers,
      color: "text-blue-600",
    },
    {
      title: "Treasury Yield APY",
      value: kpis?.cryptoYieldAPY ? `${kpis.cryptoYieldAPY.toFixed(2)}%` : "—",
      change: "USD Returns",
      trend: "up" as const,
      icon: TrendingUp,
      color: "text-primary",
    },
  ];

  return (
    <div className="space-y-8" data-testid="page-dashboard">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight mb-2">Business Console</h1>
        <p className="text-muted-foreground">
          USD-based yield orchestration — turn idle rent, vendor payments, and merchant float into treasury-optimized assets
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

      {/* USD-First Architecture Explainer */}
      <Card className="bg-gradient-to-br from-primary/5 via-background to-background border-2 border-primary/10">
        <CardHeader>
          <CardTitle className="text-2xl">How Naltos Works: USD-First Yield Orchestration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Currency Never Changes</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Everyone operates in <strong>USD</strong> — tenants pay in USD, vendors receive USD, owners earn USD. Modern digital payment infrastructure provides <strong>invisible backend rails</strong> for instant settlement and programmability.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Treasury Generates Yield</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Idle USD is deployed into <strong>T-Bills (NRF)</strong>, <strong>Money Markets (NRK)</strong>, and <strong>Delta-Neutral Credit (NRC)</strong> during predictable float windows. Yield comes from treasury products, not digital rails.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Four Float Buckets</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                <strong>Immediate (0-3d)</strong>: Liquidity reserves • <strong>Rent (5-15d)</strong>: Short-term T-Bills • <strong>Vendor (30-90d)</strong>: Highest yield, longest duration • <strong>Merchant (1-3d)</strong>: High-volume micro-float
              </p>
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border border-muted text-sm">
            <p className="text-muted-foreground">
              <strong>Key Insight:</strong> Naltos doesn't change your currency — we simply use modern digital payment infrastructure in the backend to move USD faster, automate treasury management, and turn rent, vendor payments, and merchant transactions into a yield-generating financial system.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Float Bucket Strategy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Treasury Allocation Strategy: Four Float Buckets</CardTitle>
          <p className="text-sm text-muted-foreground">
            Every USD flowing through Naltos is allocated to one of four duration-optimized buckets — each matched to predictable float windows and treasury products
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Bucket A - Immediate Liquidity */}
            <div className="p-4 border rounded-lg space-y-3" data-testid="bucket-immediate">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-sm">Bucket A — Immediate Liquidity</h3>
                  <p className="text-xs text-muted-foreground">0–3 days</p>
                </div>
                <Clock className="w-4 h-4 text-cyan-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Emergency withdrawal reserve for merchant, P2P, vendor redemptions</p>
              </div>
              <div className="space-y-1 text-xs mt-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cash/Bank Reserve</span>
                  <span className="font-mono">40-60%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">NRK (MMF)</span>
                  <span className="font-mono">40-60%</span>
                </div>
              </div>
            </div>

            {/* Bucket B - Rent Float */}
            <div className="p-4 border rounded-lg space-y-3" data-testid="bucket-rent">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-sm">Bucket B — Rent Float</h3>
                  <p className="text-xs text-muted-foreground">5–15 days ($900K/month base)</p>
                </div>
                <Home className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Predictable, short-duration float from multifamily rent payments (~$900K monthly volume)</p>
              </div>
              <div className="space-y-1 text-xs mt-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">NRF (T-Bills)</span>
                  <span className="font-mono">70-80%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">NRK (MMF)</span>
                  <span className="font-mono">20-30%</span>
                </div>
                <div className="flex justify-between border-t pt-1 mt-2">
                  <span className="text-muted-foreground font-medium">10-day float yield (5% APY)</span>
                  <span className="font-mono text-primary">~$1,233/month</span>
                </div>
              </div>
            </div>

            {/* Bucket C - Vendor Float */}
            <div className="p-4 border rounded-lg space-y-3" data-testid="bucket-vendor">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-sm">Bucket C — Vendor Float</h3>
                  <p className="text-xs text-muted-foreground">30–90 days</p>
                </div>
                <Zap className="w-4 h-4 text-violet-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Highest yield, longest duration (Net30-Net90 payment terms)</p>
              </div>
              <div className="space-y-1 text-xs mt-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">NRF (T-Bills)</span>
                  <span className="font-mono">50%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">NRK (MMF)</span>
                  <span className="font-mono">30%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">NRC (Credit)</span>
                  <span className="font-mono">20%</span>
                </div>
              </div>
            </div>

            {/* Bucket D - Merchant/P2P Micro Float */}
            <div className="p-4 border rounded-lg space-y-3" data-testid="bucket-merchant">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-sm">Bucket D — Merchant/P2P Micro Float</h3>
                  <p className="text-xs text-muted-foreground">1–3 days</p>
                </div>
                <Coins className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">High-volume, fast-moving merchant settlement float</p>
              </div>
              <div className="space-y-1 text-xs mt-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">NRK (MMF)</span>
                  <span className="font-mono">50-70%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Liquidity Buffer</span>
                  <span className="font-mono">30-50%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
