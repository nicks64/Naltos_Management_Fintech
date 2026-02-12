import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  TrendingUp, Calendar, DollarSign, Shield, AlertCircle, ArrowRight, Clock,
  Settings, Percent, Landmark, Activity, Coins, Layers,
  Wallet, Building, X, Check, Zap, Gift, PiggyBank,
  BarChart3, Brain, Radio, Gauge, Target, RefreshCw,
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, ComposedChart, Line,
} from "recharts";
import { format, parseISO } from "date-fns";
import type { TreasuryProduct, TreasurySubscription } from "@shared/schema";

interface TreasuryProductWithSubscription extends TreasuryProduct {
  subscription?: TreasurySubscription;
}

interface CryptoTreasuryPosition {
  coin: string;
  availableBalance: number;
  deployedBalance: number;
  reservedBalance: number;
  totalYieldAccrued: number;
  asOf: string;
}

interface CryptoTreasuryDeployment {
  id: string;
  coin: string;
  productName: string;
  productType: string;
  deploymentAmount: number;
  cumulativeYield: number;
  status: string;
  deployedAt: string;
  maturityDate?: string;
  reinvestPolicy: boolean;
}

interface CryptoTreasuryFlow {
  id: string;
  flowType: string;
  coin: string;
  amount: number;
  description: string | null;
  createdAt: string;
}

interface KPIData {
  cryptoTreasuryAUM: number;
  cryptoDeployedBalance: number;
  cryptoYieldAPY: number;
}

interface RentFloatPayment {
  id: string;
  amount: string;
  paidAt: string;
  daysInFloat: number;
  yieldGenerated: string;
}

interface MonthlyTrend {
  month: string;
  floatBalance: number;
  yieldGenerated: number;
  utilization: number;
}

interface DeploymentProduct {
  product: string;
  allocation: number;
  apy: number;
  balance: number;
}

interface FloatVelocity {
  currentBalance: number;
  deployedBalance: number;
  utilization: number;
  avgCycleTime: number;
  turnoverRate: number;
  dailyYield: number;
  projectedAnnualYield: number;
  weightedAPY: number;
}

interface FloatIntelligence {
  optimalDeploymentMix: string;
  paymentTimingInsight: string;
  seasonalForecast: string;
  riskAssessment: string;
  confidenceScore: number;
}

interface EnhancedRentFloatData {
  config: {
    rentFloatEnabled: boolean;
    rentFloatYieldRate: string;
    rentFloatOwnerShare: string;
    rentFloatTenantShare: string;
    rentFloatNaltosShare: string;
    rentFloatDefaultDuration: number;
  };
  totalFloat: string;
  averageDuration: number;
  monthlyYield: string;
  ownerShare: string;
  tenantShare: string;
  naltosShare: string;
  recentPayments: RentFloatPayment[];
  monthlyTrend: MonthlyTrend[];
  deploymentAllocation: DeploymentProduct[];
  floatVelocity: FloatVelocity;
  floatIntelligence: FloatIntelligence;
}

const mockFloatTimeline = [
  { day: "Mon", rent: 120000, vendor: 85000, merchant: 15000 },
  { day: "Tue", rent: 95000, vendor: 88000, merchant: 22000 },
  { day: "Wed", rent: 82000, vendor: 90000, merchant: 18000 },
  { day: "Thu", rent: 110000, vendor: 87000, merchant: 25000 },
  { day: "Fri", rent: 140000, vendor: 92000, merchant: 30000 },
  { day: "Sat", rent: 75000, vendor: 85000, merchant: 12000 },
  { day: "Sun", rent: 60000, vendor: 85000, merchant: 8000 },
];

const mockYieldRouting = [
  { source: "Rent Float (Bucket B)", duration: "5-15d", apy: "5.0%", deployed: "$892K", yield: "$1,233/mo", product: "T-Bills" },
  { source: "Vendor Float (Bucket C)", duration: "30-90d", apy: "5.2%", deployed: "$1.4M", yield: "$6,067/mo", product: "T-Bills + MMF" },
  { source: "Merchant Float (Bucket D)", duration: "1-3d", apy: "4.8%", deployed: "$210K", yield: "$82/mo", product: "Money Market" },
  { source: "Immediate Reserve (Bucket A)", duration: "0-3d", apy: "4.5%", deployed: "$350K", yield: "$131/mo", product: "Cash + MMF" },
];

const mockYieldSharing = [
  { recipient: "Property Owners", pct: "85%", amount: "$6,386/mo", desc: "Primary yield recipient from all float buckets" },
  { recipient: "Tenants (Cashback)", pct: "5%", amount: "$376/mo", desc: "Distributed via streak rewards and rent-to-own escrow" },
  { recipient: "Vendors (Yield Share)", pct: "3%", amount: "$225/mo", desc: "Net30-90 vendors earn yield on payment float" },
  { recipient: "Naltos Platform", pct: "7%", amount: "$526/mo", desc: "Platform fee for treasury management and infrastructure" },
];

const DEPLOYMENT_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

function FloatPerformanceChart({ trend }: { trend: MonthlyTrend[] }) {
  return (
    <Card data-testid="card-float-performance">
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <CardTitle>Float Performance</CardTitle>
            <CardDescription>12-month float balance and yield generation trend</CardDescription>
          </div>
          <Badge variant="secondary" data-testid="badge-trailing-12m">Trailing 12M</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72" data-testid="chart-float-performance">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs fill-muted-foreground" tick={{ fontSize: 11 }} />
              <YAxis
                yAxisId="left"
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  fontSize: "12px",
                  color: "hsl(var(--popover-foreground))",
                }}
                formatter={(value: number, name: string) => {
                  if (name === "Float Balance") return [`$${value.toLocaleString()}`, name];
                  return [`$${value.toLocaleString()}`, name];
                }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="floatBalance"
                name="Float Balance"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary) / 0.1)"
                strokeWidth={2}
              />
              <Bar
                yAxisId="right"
                dataKey="yieldGenerated"
                name="Yield Generated"
                fill="hsl(var(--chart-2))"
                radius={[3, 3, 0, 0]}
                barSize={18}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-6 mt-4 text-xs text-muted-foreground flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-primary/30 border border-primary" />
            <span>Float Balance (left axis)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "hsl(var(--chart-2))" }} />
            <span>Monthly Yield (right axis)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DeploymentAllocationChart({ allocation }: { allocation: DeploymentProduct[] }) {
  return (
    <Card data-testid="card-deployment-allocation">
      <CardHeader>
        <CardTitle>Treasury Deployment</CardTitle>
        <CardDescription>Float allocation across yield-generating products</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-56" data-testid="chart-deployment-pie">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="allocation"
                  nameKey="product"
                >
                  {allocation.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={DEPLOYMENT_COLORS[index % DEPLOYMENT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                    fontSize: "12px",
                    color: "hsl(var(--popover-foreground))",
                  }}
                  formatter={(value: number) => [`${value}%`, "Allocation"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {allocation.map((item, idx) => (
              <div key={item.product} className="flex items-center justify-between gap-3 p-3 border rounded-lg" data-testid={`deployment-product-${idx}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: DEPLOYMENT_COLORS[idx] }} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{item.product}</p>
                    <p className="text-xs text-muted-foreground">{item.apy}% APY</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-mono font-semibold">{item.allocation}%</p>
                  <p className="text-xs text-muted-foreground font-mono">${item.balance.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FloatVelocityPanel({ velocity }: { velocity: FloatVelocity }) {
  const utilizationColor = velocity.utilization >= 90
    ? "text-emerald-600 dark:text-emerald-400"
    : velocity.utilization >= 75
      ? "text-amber-600 dark:text-amber-400"
      : "text-red-600 dark:text-red-400";

  return (
    <Card data-testid="card-float-velocity">
      <CardHeader>
        <div className="flex items-center gap-2 flex-wrap">
          <Gauge className="w-5 h-5 text-primary" />
          <CardTitle>Float Velocity</CardTitle>
          <Badge variant="secondary" data-testid="badge-velocity-live">
            <Radio className="w-3 h-3 mr-1 text-green-500 animate-pulse" />
            Live
          </Badge>
        </div>
        <CardDescription>Real-time deployment efficiency and turnover metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 border rounded-lg text-center" data-testid="metric-deployed-balance">
            <p className="text-xs text-muted-foreground">Deployed</p>
            <p className="text-lg font-bold font-mono" data-testid="text-deployed-balance">${velocity.deployedBalance.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">of ${velocity.currentBalance.toLocaleString()}</p>
          </div>
          <div className="p-3 border rounded-lg text-center" data-testid="metric-utilization">
            <p className="text-xs text-muted-foreground">Utilization</p>
            <p className={`text-lg font-bold font-mono ${utilizationColor}`} data-testid="text-utilization">{velocity.utilization}%</p>
            <p className="text-xs text-muted-foreground">deployment rate</p>
          </div>
          <div className="p-3 border rounded-lg text-center" data-testid="metric-turnover">
            <p className="text-xs text-muted-foreground">Turnover Rate</p>
            <p className="text-lg font-bold font-mono" data-testid="text-turnover">{velocity.turnoverRate}x</p>
            <p className="text-xs text-muted-foreground">cycles / month</p>
          </div>
          <div className="p-3 border rounded-lg text-center" data-testid="metric-weighted-apy">
            <p className="text-xs text-muted-foreground">Weighted APY</p>
            <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400" data-testid="text-weighted-apy">{velocity.weightedAPY}%</p>
            <p className="text-xs text-muted-foreground">blended rate</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-6 flex-wrap">
              <div data-testid="metric-daily-yield">
                <p className="text-xs text-muted-foreground">Daily Yield</p>
                <p className="text-sm font-mono font-semibold text-emerald-600 dark:text-emerald-400">${velocity.dailyYield}/day</p>
              </div>
              <div data-testid="metric-cycle-time">
                <p className="text-xs text-muted-foreground">Avg Cycle</p>
                <p className="text-sm font-mono font-semibold">{velocity.avgCycleTime} days</p>
              </div>
              <div data-testid="metric-projected-annual">
                <p className="text-xs text-muted-foreground">Projected Annual</p>
                <p className="text-sm font-mono font-semibold text-primary">${velocity.projectedAnnualYield.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FloatIntelligencePanel({ intelligence }: { intelligence: FloatIntelligence }) {
  const insights = [
    { icon: Target, label: "Optimal Deployment", text: intelligence.optimalDeploymentMix, color: "text-primary" },
    { icon: Clock, label: "Payment Timing", text: intelligence.paymentTimingInsight, color: "text-amber-600 dark:text-amber-400" },
    { icon: TrendingUp, label: "Seasonal Forecast", text: intelligence.seasonalForecast, color: "text-emerald-600 dark:text-emerald-400" },
    { icon: Shield, label: "Risk Assessment", text: intelligence.riskAssessment, color: "text-blue-600 dark:text-blue-400" },
  ];

  return (
    <Card data-testid="card-float-intelligence">
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Brain className="w-5 h-5 text-primary" />
            <CardTitle>Float Intelligence</CardTitle>
            <Badge variant="secondary" data-testid="badge-neural-confidence">
              <Radio className="w-3 h-3 mr-1 text-green-500 animate-pulse" />
              {intelligence.confidenceScore}% confidence
            </Badge>
          </div>
        </div>
        <CardDescription>Neural analysis of float deployment patterns and optimization opportunities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, idx) => (
            <div key={idx} className="p-4 border rounded-lg space-y-2" data-testid={`insight-${idx}`}>
              <div className="flex items-center gap-2">
                <insight.icon className={`w-4 h-4 ${insight.color}`} />
                <p className="text-sm font-semibold">{insight.label}</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{insight.text}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Treasury() {
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<TreasuryProductWithSubscription | null>(null);
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [activeTab, setActiveTab] = useState("products");

  const { data: products, isLoading: productsLoading } = useQuery<TreasuryProductWithSubscription[]>({
    queryKey: ["/api/treasury/products"],
  });

  const { data: positionsData, isLoading: positionsLoading } = useQuery<{ positions: CryptoTreasuryPosition[] }>({
    queryKey: ["/api/crypto-treasury/positions"],
  });

  const { data: deploymentsData, isLoading: deploymentsLoading } = useQuery<{ deployments: CryptoTreasuryDeployment[] }>({
    queryKey: ["/api/crypto-treasury/deployments"],
  });

  const { data: flowsData, isLoading: flowsLoading } = useQuery<{ flows: CryptoTreasuryFlow[] }>({
    queryKey: ["/api/crypto-treasury/flows"],
  });

  const { data: kpisData, isLoading: kpisLoading } = useQuery<KPIData>({
    queryKey: ["/api/kpis"],
  });

  const { data: rentFloatData, isLoading: rentFloatLoading } = useQuery<EnhancedRentFloatData>({
    queryKey: ["/api/rent-float/enhanced"],
  });

  const subscribeMutation = useMutation({
    mutationFn: (data: { productId: string; amount: number }) => apiRequest("POST", "/api/treasury/subscribe", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/treasury/products"] });
      setSubscribeOpen(false);
      setAmount("");
      toast({ title: "Subscription Successful", description: "Funds have been allocated to the treasury product." });
    },
  });

  const redeemMutation = useMutation({
    mutationFn: (data: { subscriptionId: string; amount: number }) => apiRequest("POST", "/api/treasury/redeem", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/treasury/products"] });
      setRedeemOpen(false);
      setAmount("");
      toast({ title: "Redemption Successful", description: "Funds will be available in 1-2 business days." });
    },
  });

  const toggleAutoRollMutation = useMutation({
    mutationFn: (data: { subscriptionId: string; autoRoll: boolean }) => apiRequest("POST", "/api/treasury/autoroll", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/treasury/products"] });
      toast({ title: "Auto-Roll Updated", description: "Your preference has been saved." });
    },
  });

  const getProductBadges = (productType: string) => {
    const badges: Record<string, string[]> = {
      NRF: ["Treasury Bills", "USD returns", "5-15d float"],
      NRK: ["Money Market", "USD returns", "30-90d float"],
      NRC: ["Enhanced Credit", "USD returns", "Qualified investors"],
    };
    return badges[productType] || [];
  };

  const positionsReady = !!(positionsData && deploymentsData && flowsData && kpisData);

  const totalAUM = kpisData?.cryptoTreasuryAUM || 0;
  const totalDeployed = kpisData?.cryptoDeployedBalance || 0;
  const estimatedAPY = kpisData?.cryptoYieldAPY || 0;
  const positions = positionsData?.positions || [];
  const deployments = deploymentsData?.deployments || [];
  const activeDeployments = deployments.filter(d => d.status === 'active');
  const totalYield = positions.reduce((sum, p) => sum + p.totalYieldAccrued, 0);

  let rentFloatComputed: {
    yieldRate: number; ownerPct: number; tenantPct: number; naltosPct: number;
    monthlyRent: number; monthlyYield: number; annualRent: number; annualYield: number;
    annualizedOwnerBenefit: number; annualizedTenantReward: number; noiBasisPoints: number;
  } | null = null;

  if (rentFloatData) {
    const yieldRate = parseFloat(rentFloatData.config.rentFloatYieldRate || "5.50");
    const ownerPct = parseFloat(rentFloatData.config.rentFloatOwnerShare || "3.00");
    const tenantPct = parseFloat(rentFloatData.config.rentFloatTenantShare || "1.25");
    const naltosPct = parseFloat(rentFloatData.config.rentFloatNaltosShare || "0.75");
    const monthlyRent = parseFloat(rentFloatData.totalFloat) || 0;
    const monthlyYield = parseFloat(rentFloatData.monthlyYield) || 0;
    const annualRent = monthlyRent * 12;
    const annualYield = monthlyYield * 12;
    const totalSharePct = ownerPct + tenantPct + naltosPct;
    const annualizedOwnerBenefit = totalSharePct > 0 ? annualYield * (ownerPct / totalSharePct) : 0;
    const annualizedTenantReward = totalSharePct > 0 ? annualYield * (tenantPct / totalSharePct) : 0;
    const noiBasisPoints = annualRent > 0 ? (annualizedOwnerBenefit / annualRent) * 10000 : 0;
    rentFloatComputed = {
      yieldRate, ownerPct, tenantPct, naltosPct,
      monthlyRent, monthlyYield, annualRent, annualYield,
      annualizedOwnerBenefit, annualizedTenantReward, noiBasisPoints,
    };
  }

  return (
    <div className="space-y-6" data-testid="page-treasury">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight mb-2">Treasury</h1>
        <p className="text-muted-foreground">
          Deploy idle USD into treasury products, manage float routing, track positions, and optimize rent float yield
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList data-testid="tabs-treasury">
          <TabsTrigger value="products" data-testid="tab-products">Products & Yield</TabsTrigger>
          <TabsTrigger value="float" data-testid="tab-float">Float Management</TabsTrigger>
          <TabsTrigger value="positions" data-testid="tab-positions">Treasury Positions</TabsTrigger>
          <TabsTrigger value="rentfloat" data-testid="tab-rentfloat">Rent Float</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-6 space-y-6">
          <div className="p-4 bg-primary/5 border-2 border-primary/10 rounded-lg text-sm">
            <div className="flex items-start gap-2">
              <DollarSign className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-semibold">USD-First Treasury Strategy</p>
                <p className="text-muted-foreground">
                  These products generate yield on <strong>idle USD</strong> during float periods. Modern digital payment infrastructure is used only as backend rails — <strong>all returns are in USD</strong>.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
            <AlertCircle className="inline w-4 h-4 mr-2" />
            Demo only. No real custody. Not investment advice.
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {productsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader><div className="h-8 bg-muted rounded w-1/2 mb-4" /><div className="h-4 bg-muted rounded w-full" /></CardHeader>
                  <CardContent>{Array.from({ length: 6 }).map((_, j) => <div key={j} className="h-10 bg-muted rounded mb-2" />)}</CardContent>
                </Card>
              ))
            ) : products && products.length > 0 ? (
              products.map((product) => (
                <Card key={product.id} className="hover-elevate" data-testid={`card-product-${product.productType}`}>
                  <CardHeader>
                    <CardTitle className="text-2xl">{product.name}</CardTitle>
                    <CardDescription>{product.description}</CardDescription>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {getProductBadges(product.productType).map((badge) => (
                        <Badge key={badge} variant="secondary" className="text-xs">{badge}</Badge>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">USD Deployed</div>
                        <div className="text-xl font-mono font-semibold">
                          ${product.subscription?.balance ? (parseFloat(product.subscription.balance) / 1000000).toFixed(2) : "0.00"}M
                        </div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">USD Yield APY</div>
                        <div className="text-xl font-mono font-semibold text-green-600">{product.currentYield}%</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">WAM (Days)</div>
                        <div className="text-xl font-mono font-semibold">{product.wam}</div>
                      </div>
                      {product.ocRatio && (
                        <div>
                          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">OC Ratio</div>
                          <div className="text-xl font-mono font-semibold">{product.ocRatio}x</div>
                        </div>
                      )}
                      <div>
                        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Duration</div>
                        <div className="text-xl font-mono font-semibold">{product.targetDuration}d</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Fees</div>
                        <div className="text-sm font-mono font-semibold">{product.managementFee}% / {product.platformFee}%</div>
                      </div>
                    </div>

                    {product.subscription && (
                      <div className="flex items-center justify-between pt-4 border-t">
                        <Label htmlFor={`autoroll-${product.id}`} className="text-sm">Auto-Roll</Label>
                        <Switch
                          id={`autoroll-${product.id}`}
                          checked={product.subscription.autoRoll}
                          onCheckedChange={(checked) => toggleAutoRollMutation.mutate({ subscriptionId: product.subscription!.id, autoRoll: checked })}
                          data-testid={`switch-autoroll-${product.productType}`}
                        />
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button onClick={() => { setSelectedProduct(product); setSubscribeOpen(true); }} className="flex-1" data-testid={`button-subscribe-${product.productType}`}>
                      <DollarSign className="mr-2 h-4 w-4" />Subscribe
                    </Button>
                    {product.subscription && (
                      <Button onClick={() => { setSelectedProduct(product); setRedeemOpen(true); }} variant="outline" className="flex-1" data-testid={`button-redeem-${product.productType}`}>
                        Redeem
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 text-muted-foreground">No treasury products available</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="float" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Float Volume by Source (7-Day Rolling)</CardTitle>
              <CardDescription>Daily USD flow through rent, vendor, and merchant float buckets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockFloatTimeline}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, ""]} />
                    <Area type="monotone" dataKey="rent" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Rent Float" />
                    <Area type="monotone" dataKey="vendor" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} name="Vendor Float" />
                    <Area type="monotone" dataKey="merchant" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Merchant Float" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              { label: "Total Float AUM", value: "$2.85M", change: "+4.2%", icon: Landmark },
              { label: "Avg Float Duration", value: "24.5 days", change: "+2.1d", icon: Clock },
              { label: "Utilization Rate", value: "94.2%", change: "+1.8%", icon: Activity },
              { label: "Monthly Yield (All)", value: "$7,513", change: "+$340", icon: TrendingUp },
            ].map((m) => (
              <Card key={m.label} className="hover-elevate">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2 gap-1">
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <m.icon className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold font-mono">{m.value}</p>
                  <p className="text-xs text-green-600 mt-1">{m.change}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Yield Routing Configuration</CardTitle>
              <CardDescription>How each float bucket is deployed into treasury products for yield generation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockYieldRouting.map((route, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border rounded-lg" data-testid={`yield-route-${i}`}>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{route.source}</p>
                      <p className="text-xs text-muted-foreground">{route.duration} duration</p>
                    </div>
                    <div className="text-center">
                      <ArrowRight className="w-4 h-4 text-muted-foreground mx-auto" />
                    </div>
                    <div className="text-center">
                      <Badge variant="secondary">{route.product}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">{route.apy} APY</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-sm">{route.deployed}</p>
                      <p className="text-xs text-green-600">{route.yield}</p>
                    </div>
                    <Button size="icon" variant="ghost" data-testid={`button-configure-route-${i}`}>
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Programmable Yield Sharing</CardTitle>
              <CardDescription>Configurable distribution of treasury yield across stakeholders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockYieldSharing.map((share, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border rounded-lg" data-testid={`yield-share-${i}`}>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{share.recipient}</p>
                      <p className="text-xs text-muted-foreground">{share.desc}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold font-mono">{share.pct}</p>
                      <p className="text-xs text-green-600 font-mono">{share.amount}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-muted">
                <div className="flex items-start gap-2">
                  <Percent className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">Total Monthly Yield</p>
                    <p className="text-sm text-muted-foreground">
                      <strong>$7,513/mo</strong> distributed across all stakeholders from $2.85M total float AUM at blended 5.0% APY.
                      Distributions are automated via internal ledger — no manual reconciliation needed.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="positions" className="mt-6 space-y-6">
          {!positionsReady ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="h-32 bg-muted animate-pulse rounded-lg" />
                <div className="h-32 bg-muted animate-pulse rounded-lg" />
                <div className="h-32 bg-muted animate-pulse rounded-lg" />
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-primary" />
                      <CardTitle className="text-sm font-medium">Total Treasury AUM</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold tabular-nums" data-testid="total-crypto-aum">
                      ${totalAUM.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Digital payment infrastructure
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-primary" />
                      <CardTitle className="text-sm font-medium">Deployed in Treasury</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold tabular-nums" data-testid="total-deployed">
                      ${totalDeployed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activeDeployments.length} active deployment{activeDeployments.length !== 1 ? 's' : ''}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <CardTitle className="text-sm font-medium">Estimated Yield APY</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold tabular-nums text-primary" data-testid="estimated-apy">
                      {estimatedAPY.toFixed(2)}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ${totalYield.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} total yield accrued
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="positions-sub" className="w-full">
                <TabsList className="grid w-full max-w-2xl grid-cols-3">
                  <TabsTrigger value="positions-sub">Positions</TabsTrigger>
                  <TabsTrigger value="deployments-sub">Deployments</TabsTrigger>
                  <TabsTrigger value="flows-sub">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="positions-sub" className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {positions.map((position, index) => {
                      const totalBalance = position.availableBalance + position.deployedBalance + position.reservedBalance;
                      const deployedPct = totalBalance > 0 ? (position.deployedBalance / totalBalance) * 100 : 0;
                      const assetLabels: Record<string, string> = {
                        "USDC": "Treasury Asset A",
                        "USDT": "Treasury Asset B",
                        "DAI": "Treasury Asset C"
                      };
                      const displayName = assetLabels[position.coin] || `Treasury Asset ${index + 1}`;

                      return (
                        <Card key={position.coin} data-testid={`position-${position.coin}`}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-xl">{displayName}</CardTitle>
                              <Badge variant="secondary" className="text-xs">
                                {deployedPct.toFixed(0)}% deployed
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Total Balance</p>
                              <p className="text-2xl font-bold tabular-nums">
                                ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Available</span>
                                <span className="font-semibold tabular-nums">
                                  ${position.availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Deployed</span>
                                <span className="font-semibold tabular-nums text-primary">
                                  ${position.deployedBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                              {position.reservedBalance > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Reserved</span>
                                  <span className="font-semibold tabular-nums">
                                    ${position.reservedBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="pt-3 border-t">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Lifetime Yield</span>
                                <span className="font-semibold tabular-nums text-primary">
                                  +${position.totalYieldAccrued.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="deployments-sub" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Active Treasury Deployments</CardTitle>
                      <CardDescription>
                        Assets automatically deployed into yield-generating treasury products
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {deployments.length > 0 ? (
                        <div className="space-y-4">
                          {deployments.map((deployment) => {
                            const assetLabels: Record<string, string> = {
                              "USDC": "Asset A",
                              "USDT": "Asset B",
                              "DAI": "Asset C"
                            };
                            const displayAsset = assetLabels[deployment.coin] || "Treasury Asset";

                            return (
                              <div
                                key={deployment.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                                data-testid={`deployment-${deployment.id}`}
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant={deployment.status === 'active' ? 'default' : 'secondary'}>
                                      {deployment.status}
                                    </Badge>
                                    <Badge variant="outline" className="font-mono">
                                      {displayAsset}
                                    </Badge>
                                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">{deployment.productName}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {deployment.productType}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Deployed {format(parseISO(deployment.deployedAt), "MMM d, yyyy")}
                                    {deployment.maturityDate && ` - Matures ${format(parseISO(deployment.maturityDate), "MMM d, yyyy")}`}
                                  </p>
                                  {deployment.reinvestPolicy && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Auto-reinvest enabled
                                    </p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-semibold tabular-nums">
                                    ${deployment.deploymentAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                  </p>
                                  <p className="text-sm text-primary font-medium">
                                    +${deployment.cumulativeYield.toLocaleString(undefined, { minimumFractionDigits: 2 })} yield
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Layers className="w-12 h-12 mx-auto mb-3 opacity-30 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">No active deployments</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="flows-sub" className="mt-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-muted-foreground" />
                        <CardTitle>Treasury Flow Activity</CardTitle>
                      </div>
                      <CardDescription>
                        Complete audit trail of bridge conversions, deployments, and yield accruals
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {flowsData?.flows && flowsData.flows.length > 0 ? (
                        <div className="space-y-3">
                          {flowsData.flows.map((flow) => {
                            const flowTypeLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
                              bridge_inbound: { label: "Bridge In", variant: "default" },
                              bridge_outbound: { label: "Bridge Out", variant: "secondary" },
                              deployment_in: { label: "Deployed", variant: "default" },
                              deployment_out: { label: "Withdrawn", variant: "secondary" },
                              yield_accrual: { label: "Yield Accrued", variant: "default" },
                              wallet_transfer: { label: "Transfer", variant: "outline" },
                            };
                            const flowInfo = flowTypeLabels[flow.flowType] || { label: flow.flowType, variant: "outline" as const };
                            const assetLabels: Record<string, string> = {
                              "USDC": "Asset A",
                              "USDT": "Asset B",
                              "DAI": "Asset C"
                            };
                            const displayAsset = assetLabels[flow.coin] || "Treasury Asset";

                            return (
                              <div
                                key={flow.id}
                                className="flex items-center justify-between p-3 border rounded-lg"
                                data-testid={`flow-${flow.id}`}
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant={flowInfo.variant}>{flowInfo.label}</Badge>
                                    <Badge variant="outline" className="font-mono text-xs">
                                      {displayAsset}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {(flow.description || flow.flowType)
                                      .replace(/USDC/g, "Asset A")
                                      .replace(/USDT/g, "Asset B")
                                      .replace(/DAI/g, "Asset C")
                                      .replace(/stablecoin/gi, "treasury asset")}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {format(parseISO(flow.createdAt), "MMM d, yyyy 'at' h:mm a")}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold tabular-nums">
                                    ${flow.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Activity className="w-12 h-12 mx-auto mb-3 opacity-30 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">No activity yet</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </TabsContent>

        <TabsContent value="rentfloat" className="mt-6 space-y-6">
          {rentFloatLoading ? (
            <div className="space-y-6" data-testid="page-rent-float-loading">
              <div className="h-8 w-48 bg-muted animate-pulse rounded" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-muted animate-pulse rounded-lg" />)}
              </div>
              <div className="h-72 bg-muted animate-pulse rounded-lg" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-64 bg-muted animate-pulse rounded-lg" />
                <div className="h-64 bg-muted animate-pulse rounded-lg" />
              </div>
            </div>
          ) : rentFloatData && rentFloatComputed ? (
            <div className="space-y-6" data-testid="page-rent-float">
              <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-primary/5 via-background to-emerald-500/5 p-6 md:p-8">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h2 className="text-3xl font-bold text-foreground" data-testid="text-page-title">Rent Float Treasury</h2>
                    <Badge variant="secondary" data-testid="badge-float-active">
                      <Activity className="w-3 h-3 mr-1 text-emerald-500" />
                      Active
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-2xl">
                    {rentFloatComputed.monthlyRent > 0 ? (
                      <>
                        <span className="font-medium text-foreground">${rentFloatComputed.monthlyRent.toLocaleString()}</span> in rent flowed through in the last 30 days.
                        Automated treasury deployment generated <span className="font-medium text-emerald-600 dark:text-emerald-400">${rentFloatComputed.monthlyYield.toLocaleString()}</span> in yield
                        at a weighted <span className="font-medium text-foreground">{rentFloatData.floatVelocity.weightedAPY}% APY</span>.
                      </>
                    ) : (
                      "Configure your rent float settings to start generating yield on idle cash."
                    )}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card data-testid="card-kpi-float-balance">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Float</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-mono font-bold" data-testid="text-kpi-float-balance">
                      ${(rentFloatData.floatVelocity.currentBalance).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {rentFloatData.floatVelocity.utilization}% deployed
                    </p>
                  </CardContent>
                </Card>

                <Card data-testid="card-kpi-monthly-yield">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Yield</CardTitle>
                    <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400" data-testid="text-kpi-monthly-yield">
                      ${rentFloatComputed.monthlyYield.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      ${rentFloatData.floatVelocity.dailyYield}/day avg
                    </p>
                  </CardContent>
                </Card>

                <Card data-testid="card-kpi-weighted-apy">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Weighted APY</CardTitle>
                    <BarChart3 className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-mono font-bold text-primary" data-testid="text-kpi-weighted-apy">
                      {rentFloatData.floatVelocity.weightedAPY}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      across {rentFloatData.deploymentAllocation.length} products
                    </p>
                  </CardContent>
                </Card>

                <Card data-testid="card-kpi-owner-noi">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Owner NOI Impact</CardTitle>
                    <Building className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-mono font-bold" data-testid="text-kpi-owner-noi">
                      +${rentFloatComputed.annualizedOwnerBenefit.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {rentFloatComputed.noiBasisPoints.toFixed(0)} bps / yr
                    </p>
                  </CardContent>
                </Card>
              </div>

              <FloatPerformanceChart trend={rentFloatData.monthlyTrend} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DeploymentAllocationChart allocation={rentFloatData.deploymentAllocation} />
                <FloatVelocityPanel velocity={rentFloatData.floatVelocity} />
              </div>

              <Tabs defaultValue="distribution" data-testid="tabs-details">
                <TabsList>
                  <TabsTrigger value="distribution" data-testid="tab-distribution">Yield Distribution</TabsTrigger>
                  <TabsTrigger value="comparison" data-testid="tab-comparison">Model Comparison</TabsTrigger>
                  <TabsTrigger value="payments" data-testid="tab-payments">Recent Payments</TabsTrigger>
                </TabsList>

                <TabsContent value="distribution" className="mt-4">
                  <Card data-testid="card-yield-distribution">
                    <CardHeader>
                      <CardTitle>Yield Distribution</CardTitle>
                      <CardDescription>How generated yield flows to stakeholders</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 border rounded-lg" data-testid="yield-share-owners">
                          <div className="flex items-center justify-between mb-2 gap-2">
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4 text-primary" />
                              <span className="text-sm font-medium">Owners</span>
                            </div>
                            <Badge variant="outline">{rentFloatComputed.ownerPct.toFixed(1)}%</Badge>
                          </div>
                          <p className="text-xl font-mono font-semibold" data-testid="text-owner-share">${parseFloat(rentFloatData.ownerShare).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground mt-1">Monthly share</p>
                        </div>
                        <div className="p-4 border rounded-lg" data-testid="yield-share-tenants">
                          <div className="flex items-center justify-between mb-2 gap-2">
                            <div className="flex items-center gap-2">
                              <Gift className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              <span className="text-sm font-medium">Tenants</span>
                            </div>
                            <Badge variant="outline">{rentFloatComputed.tenantPct.toFixed(1)}%</Badge>
                          </div>
                          <p className="text-xl font-mono font-semibold" data-testid="text-tenant-share">${parseFloat(rentFloatData.tenantShare).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground mt-1">Cashback pool</p>
                        </div>
                        <div className="p-4 border rounded-lg" data-testid="yield-share-naltos">
                          <div className="flex items-center justify-between mb-2 gap-2">
                            <div className="flex items-center gap-2">
                              <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                              <span className="text-sm font-medium">Platform</span>
                            </div>
                            <Badge variant="outline">{rentFloatComputed.naltosPct.toFixed(1)}%</Badge>
                          </div>
                          <p className="text-xl font-mono font-semibold" data-testid="text-naltos-share">${parseFloat(rentFloatData.naltosShare).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground mt-1">Operations</p>
                        </div>
                        <div className="p-4 border rounded-lg bg-muted/30" data-testid="yield-share-total">
                          <div className="flex items-center justify-between mb-2 gap-2">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              <span className="text-sm font-medium">Total</span>
                            </div>
                            <Badge variant="outline">100%</Badge>
                          </div>
                          <p className="text-xl font-mono font-bold" data-testid="text-total-yield">${rentFloatComputed.monthlyYield.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground mt-1">${rentFloatComputed.annualYield.toLocaleString()}/yr</p>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t">
                        <h4 className="text-sm font-semibold mb-3">Cash Flow Model</h4>
                        <div className="flex items-center gap-3 overflow-x-auto pb-2">
                          <div className="flex flex-col items-center gap-1 p-4 bg-primary/5 rounded-lg border border-primary/20 min-w-fit" data-testid="flow-step-payment">
                            <Wallet className="h-6 w-6 text-primary" />
                            <p className="text-xs font-medium">Payment</p>
                            <p className="text-[10px] text-muted-foreground">Day 0</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex flex-col items-center gap-1 p-4 bg-primary/5 rounded-lg border border-primary/20 min-w-fit" data-testid="flow-step-deploy">
                            <RefreshCw className="h-6 w-6 text-primary" />
                            <p className="text-xs font-medium">Deploy</p>
                            <p className="text-[10px] text-muted-foreground">Instant</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex flex-col items-center gap-1 p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/30 min-w-fit" data-testid="flow-step-yield">
                            <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            <p className="text-xs font-medium">Yield</p>
                            <p className="text-[10px] text-muted-foreground">{rentFloatData.averageDuration} days</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex flex-col items-center gap-1 p-4 bg-accent/50 rounded-lg border border-accent min-w-fit" data-testid="flow-step-disburse">
                            <Building className="h-6 w-6 text-accent-foreground" />
                            <p className="text-xs font-medium">Disburse</p>
                            <p className="text-[10px] text-muted-foreground">Day {rentFloatData.averageDuration}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="comparison" className="mt-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="border-destructive/30" data-testid="card-traditional-model">
                      <CardHeader>
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <CardTitle className="text-lg">Traditional Model</CardTitle>
                          <X className="h-5 w-5 text-destructive" />
                        </div>
                        <CardDescription>Revenue lost to idle cash</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-baseline justify-between">
                          <p className="text-sm text-muted-foreground">30-Day Rent Flow</p>
                          <p className="text-lg font-mono font-semibold">${rentFloatComputed.monthlyRent.toLocaleString()}</p>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <p className="text-sm text-muted-foreground">Cash Sits Idle</p>
                          <p className="text-lg font-mono font-semibold">{rentFloatData.averageDuration} days</p>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <p className="text-sm text-muted-foreground">Monthly Yield</p>
                          <p className="text-xl font-mono font-bold text-destructive">$0</p>
                        </div>
                        <div className="flex items-baseline justify-between pt-2 border-t">
                          <p className="text-sm text-muted-foreground">Annual Opportunity Cost</p>
                          <p className="text-lg font-mono font-bold text-muted-foreground">${rentFloatComputed.annualYield.toLocaleString()}</p>
                        </div>
                        <div className="pt-2 space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2"><X className="h-4 w-4 text-destructive flex-shrink-0" /><span>No tenant incentives</span></div>
                          <div className="flex items-center gap-2"><X className="h-4 w-4 text-destructive flex-shrink-0" /><span>No automated deployment</span></div>
                          <div className="flex items-center gap-2"><X className="h-4 w-4 text-destructive flex-shrink-0" /><span>Manual treasury management</span></div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-emerald-500/30 bg-emerald-500/5" data-testid="card-naltos-model">
                      <CardHeader>
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <CardTitle className="text-lg">Naltos Model</CardTitle>
                          <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <CardDescription>Automated yield on every dollar</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-baseline justify-between">
                          <p className="text-sm text-muted-foreground">30-Day Rent Flow</p>
                          <p className="text-lg font-mono font-semibold">${rentFloatComputed.monthlyRent.toLocaleString()}</p>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <p className="text-sm text-muted-foreground">Auto-deployed</p>
                          <p className="text-lg font-mono font-semibold text-emerald-600 dark:text-emerald-400">{rentFloatData.averageDuration} days @ {rentFloatData.floatVelocity.weightedAPY}%</p>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <p className="text-sm text-muted-foreground">Monthly Yield</p>
                          <p className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400">${rentFloatComputed.monthlyYield.toLocaleString()}</p>
                        </div>
                        <div className="flex items-baseline justify-between pt-2 border-t">
                          <p className="text-sm text-muted-foreground">Annual Net Improvement</p>
                          <p className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400">+${rentFloatComputed.annualYield.toLocaleString()}</p>
                        </div>
                        <div className="pt-2 space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400"><Check className="h-4 w-4 flex-shrink-0" /><span className="font-medium">Tenant cashback ({rentFloatComputed.tenantPct.toFixed(1)}% share)</span></div>
                          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400"><Check className="h-4 w-4 flex-shrink-0" /><span className="font-medium">24/7 automated treasury</span></div>
                          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400"><Check className="h-4 w-4 flex-shrink-0" /><span className="font-medium">{rentFloatData.floatVelocity.utilization}% deployment utilization</span></div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="payments" className="mt-4">
                  <Card data-testid="card-recent-payments">
                    <CardHeader>
                      <CardTitle>Recent Payments in Float</CardTitle>
                      <CardDescription>Last 30 days of rent payments contributing to yield generation</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {rentFloatData.recentPayments.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <PiggyBank className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                          <p className="font-medium">No payments in float period</p>
                          <p className="text-sm mt-1">Payments will appear here as tenants pay rent</p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Payment ID</TableHead>
                              <TableHead>Payment Date</TableHead>
                              <TableHead className="text-right">Amount</TableHead>
                              <TableHead className="text-right">Days in Float</TableHead>
                              <TableHead className="text-right">Yield</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {rentFloatData.recentPayments.map((payment) => (
                              <TableRow key={payment.id} data-testid={`row-payment-${payment.id}`}>
                                <TableCell className="font-mono text-xs">{payment.id.substring(0, 8)}</TableCell>
                                <TableCell>{format(parseISO(payment.paidAt.toString()), "MMM d, yyyy")}</TableCell>
                                <TableCell className="text-right font-mono">${parseFloat(payment.amount).toLocaleString()}</TableCell>
                                <TableCell className="text-right">{payment.daysInFloat} days</TableCell>
                                <TableCell className="text-right font-mono text-emerald-600 dark:text-emerald-400">${parseFloat(payment.yieldGenerated).toFixed(2)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <FloatIntelligencePanel intelligence={rentFloatData.floatIntelligence} />
            </div>
          ) : null}
        </TabsContent>
      </Tabs>

      <Dialog open={subscribeOpen} onOpenChange={setSubscribeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subscribe to {selectedProduct?.name}</DialogTitle>
            <DialogDescription>Enter the amount you'd like to allocate to this treasury product.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subscribe-amount">Amount (USD)</Label>
              <Input id="subscribe-amount" type="number" placeholder="100000" value={amount} onChange={(e) => setAmount(e.target.value)} data-testid="input-subscribe-amount" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubscribeOpen(false)}>Cancel</Button>
            <Button
              onClick={() => { if (selectedProduct && amount) subscribeMutation.mutate({ productId: selectedProduct.id, amount: parseFloat(amount) }); }}
              disabled={!amount || subscribeMutation.isPending}
              data-testid="button-confirm-subscribe"
            >Confirm Subscription</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={redeemOpen} onOpenChange={setRedeemOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redeem from {selectedProduct?.name}</DialogTitle>
            <DialogDescription>Enter the amount you'd like to redeem. Funds will be available in 1-2 business days.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="redeem-amount">Amount (USD)</Label>
              <Input id="redeem-amount" type="number" placeholder="50000" value={amount} onChange={(e) => setAmount(e.target.value)} data-testid="input-redeem-amount" />
              {selectedProduct?.subscription && (
                <p className="text-xs text-muted-foreground">Available balance: ${parseFloat(selectedProduct.subscription.balance).toLocaleString()}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRedeemOpen(false)}>Cancel</Button>
            <Button
              onClick={() => { if (selectedProduct?.subscription && amount) redeemMutation.mutate({ subscriptionId: selectedProduct.subscription.id, amount: parseFloat(amount) }); }}
              disabled={!amount || redeemMutation.isPending}
              data-testid="button-confirm-redeem"
            >Confirm Redemption</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
