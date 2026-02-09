import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Shield,
  ShieldCheck,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Zap,
  FileText,
  Home,
  Droplets,
  Lock,
  Layers,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface InsurancePlan {
  id: string;
  name: string;
  monthlyPremium: number;
  coverageAmount: number;
  deductible: number;
  features: string[];
  popular: boolean;
  enrolled: boolean;
}

interface InsuranceClaim {
  id: string;
  type: string;
  description: string;
  amount: number;
  status: "submitted" | "under_review" | "approved" | "paid" | "denied";
  submittedDate: string;
  resolvedDate: string | null;
  paidAmount: number | null;
}

interface CoveragePoolData {
  totalPoolSize: number;
  stablecoinBacking: Array<{ coin: string; amount: number; pct: number }>;
  reserveRatio: number;
  poolYield: number;
  yourContribution: number;
  yourYieldEarned: number;
}

interface InsuranceData {
  activePlan: InsurancePlan | null;
  availablePlans: InsurancePlan[];
  claims: InsuranceClaim[];
  coveragePool: CoveragePoolData;
  monthlyHistory: Array<{ month: string; premium: number; poolValue: number }>;
  stats: {
    totalPremiumsPaid: number;
    totalClaimsPaid: number;
    coverageMonths: number;
    yieldEarnedOnPremiums: number;
  };
}

function getClaimStatusBadge(status: string) {
  switch (status) {
    case "submitted":
      return <Badge variant="secondary" data-testid={`badge-claim-${status}`}>Submitted</Badge>;
    case "under_review":
      return <Badge variant="secondary" data-testid={`badge-claim-${status}`}>Under Review</Badge>;
    case "approved":
      return <Badge variant="default" data-testid={`badge-claim-${status}`}>Approved</Badge>;
    case "paid":
      return <Badge variant="default" data-testid={`badge-claim-${status}`}>Paid</Badge>;
    case "denied":
      return <Badge variant="destructive" data-testid={`badge-claim-${status}`}>Denied</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function RentalInsurance() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("coverage");
  const [claimOpen, setClaimOpen] = useState(false);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<InsurancePlan | null>(null);
  const [claimType, setClaimType] = useState("");
  const [claimAmount, setClaimAmount] = useState("");
  const [claimDescription, setClaimDescription] = useState("");

  const { data, isLoading } = useQuery<InsuranceData>({
    queryKey: ["/api/tenant/rental-insurance"],
  });

  const enrollMutation = useMutation({
    mutationFn: (planId: string) => apiRequest("POST", "/api/tenant/rental-insurance/enroll", { planId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenant/rental-insurance"] });
      setEnrollOpen(false);
      toast({ title: "Enrolled Successfully", description: "Your rental insurance coverage is now active." });
    },
  });

  const claimMutation = useMutation({
    mutationFn: (payload: { type: string; amount: number; description: string }) =>
      apiRequest("POST", "/api/tenant/rental-insurance/claim", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenant/rental-insurance"] });
      setClaimOpen(false);
      setClaimType("");
      setClaimAmount("");
      setClaimDescription("");
      toast({ title: "Claim Submitted", description: "Your claim is being reviewed. You'll be notified of the outcome." });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="page-rental-insurance">
        <Skeleton className="h-8 w-48" style={{ backgroundColor: "hsl(var(--tenant-muted))" }} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" style={{ backgroundColor: "hsl(var(--tenant-muted))" }} />)}
        </div>
        <Skeleton className="h-80" style={{ backgroundColor: "hsl(var(--tenant-muted))" }} />
      </div>
    );
  }

  const ins = data!;

  return (
    <div className="space-y-6" data-testid="page-rental-insurance">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ color: "hsl(var(--tenant-foreground))" }}>
          Rental Insurance
        </h1>
        <p className="text-base" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
          Monthly coverage backed by a stablecoin reserve pool — protect your home, earn yield on premiums
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Monthly Premium", value: ins.activePlan ? `$${ins.activePlan.monthlyPremium}/mo` : "Not Enrolled", icon: DollarSign, color: "primary" },
          { label: "Coverage Amount", value: ins.activePlan ? `$${ins.activePlan.coverageAmount.toLocaleString()}` : "$0", icon: Shield, color: "success" },
          { label: "Total Premiums Paid", value: `$${ins.stats.totalPremiumsPaid.toFixed(2)}`, icon: FileText, color: "muted-foreground" },
          { label: "Yield on Premiums", value: `$${ins.stats.yieldEarnedOnPremiums.toFixed(2)}`, icon: TrendingUp, color: "success" },
        ].map((kpi) => (
          <Card
            key={kpi.label}
            className="border"
            style={{ backgroundColor: "hsl(var(--tenant-card))", borderColor: "hsl(var(--tenant-card-border))", borderRadius: "var(--tenant-radius-lg)" }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <kpi.icon className="w-4 h-4" style={{ color: `hsl(var(--tenant-${kpi.color}))` }} />
                <p className="text-xs font-medium" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>{kpi.label}</p>
              </div>
              <p className="text-xl font-bold font-mono" style={{ color: "hsl(var(--tenant-foreground))" }}>{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {ins.activePlan && (
        <Card
          className="border-2"
          style={{ backgroundColor: "hsl(var(--tenant-card))", borderColor: "hsl(var(--tenant-success) / 0.4)", borderRadius: "var(--tenant-radius-lg)" }}
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-success) / 0.1)" }}>
                  <ShieldCheck className="w-6 h-6" style={{ color: "hsl(var(--tenant-success))" }} />
                </div>
                <div>
                  <p className="font-bold text-lg" style={{ color: "hsl(var(--tenant-foreground))" }}>{ins.activePlan.name}</p>
                  <p className="text-sm" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                    Active coverage &bull; ${ins.activePlan.coverageAmount.toLocaleString()} limit &bull; ${ins.activePlan.deductible} deductible
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setClaimOpen(true)}
                  data-testid="button-file-claim"
                  style={{ backgroundColor: "hsl(var(--tenant-primary))", color: "hsl(var(--tenant-primary-foreground))" }}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  File a Claim
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {ins.activePlan.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "hsl(var(--tenant-success))" }} />
                  <p className="text-xs" style={{ color: "hsl(var(--tenant-foreground))" }}>{feature}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList data-testid="tabs-insurance">
          <TabsTrigger value="coverage" data-testid="tab-coverage">Coverage Plans</TabsTrigger>
          <TabsTrigger value="claims" data-testid="tab-claims">Claims</TabsTrigger>
          <TabsTrigger value="pool" data-testid="tab-pool">Coverage Pool</TabsTrigger>
        </TabsList>

        <TabsContent value="coverage" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-3 gap-4">
            {ins.availablePlans.map((plan) => (
              <Card
                key={plan.id}
                className={`border relative ${plan.enrolled ? "border-2" : ""}`}
                data-testid={`plan-card-${plan.id}`}
                style={{
                  backgroundColor: "hsl(var(--tenant-card))",
                  borderColor: plan.enrolled ? "hsl(var(--tenant-success) / 0.5)" : plan.popular ? "hsl(var(--tenant-primary) / 0.4)" : "hsl(var(--tenant-card-border))",
                  borderRadius: "var(--tenant-radius-lg)",
                }}
              >
                {plan.popular && !plan.enrolled && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge style={{ backgroundColor: "hsl(var(--tenant-primary))", color: "hsl(var(--tenant-primary-foreground))" }}>Most Popular</Badge>
                  </div>
                )}
                {plan.enrolled && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge style={{ backgroundColor: "hsl(var(--tenant-success))", color: "white" }}>Current Plan</Badge>
                  </div>
                )}
                <CardHeader className="pt-6 pb-2">
                  <CardTitle className="text-lg text-center" style={{ color: "hsl(var(--tenant-foreground))" }}>{plan.name}</CardTitle>
                  <div className="text-center mt-2">
                    <span className="text-3xl font-bold font-mono" style={{ color: "hsl(var(--tenant-foreground))" }}>${plan.monthlyPremium}</span>
                    <span className="text-sm" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
                    <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Coverage up to</p>
                    <p className="text-xl font-bold font-mono" style={{ color: "hsl(var(--tenant-foreground))" }}>${plan.coverageAmount.toLocaleString()}</p>
                    <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>${plan.deductible} deductible</p>
                  </div>
                  <div className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "hsl(var(--tenant-success))" }} />
                        <p className="text-xs" style={{ color: "hsl(var(--tenant-foreground))" }}>{feature}</p>
                      </div>
                    ))}
                  </div>
                  {!plan.enrolled ? (
                    <Button
                      className="w-full"
                      onClick={() => {
                        setSelectedPlan(plan);
                        setEnrollOpen(true);
                      }}
                      data-testid={`button-enroll-${plan.id}`}
                      style={plan.popular
                        ? { backgroundColor: "hsl(var(--tenant-primary))", color: "hsl(var(--tenant-primary-foreground))" }
                        : { borderColor: "hsl(var(--tenant-primary))", color: "hsl(var(--tenant-primary))" }
                      }
                      variant={plan.popular ? "default" : "outline"}
                    >
                      Enroll Now
                    </Button>
                  ) : (
                    <Button className="w-full" variant="outline" disabled style={{ borderColor: "hsl(var(--tenant-success))", color: "hsl(var(--tenant-success))" }}>
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Active
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card
            className="border"
            style={{ backgroundColor: "hsl(var(--tenant-primary) / 0.05)", borderColor: "hsl(var(--tenant-primary) / 0.2)", borderRadius: "var(--tenant-radius-lg)" }}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: "hsl(var(--tenant-primary))" }} />
                <div>
                  <p className="font-semibold text-sm" style={{ color: "hsl(var(--tenant-foreground))" }}>Stablecoin-Backed Coverage</p>
                  <p className="text-xs mt-1" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                    Your monthly premiums are pooled into a stablecoin reserve fund (USDC, USDT, DAI) that earns yield while providing instant claim payouts. This means your premiums work for you — generating returns even while providing coverage. Unlike traditional insurance where premiums are a sunk cost, Naltos insurance lets you earn yield on your contributions to the pool.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="claims" className="space-y-4 mt-4">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <p className="text-sm font-medium" style={{ color: "hsl(var(--tenant-foreground))" }}>
              {ins.claims.length} claim{ins.claims.length !== 1 ? "s" : ""}
            </p>
            {ins.activePlan && (
              <Button
                size="sm"
                onClick={() => setClaimOpen(true)}
                data-testid="button-new-claim"
                style={{ backgroundColor: "hsl(var(--tenant-primary))", color: "hsl(var(--tenant-primary-foreground))" }}
              >
                <FileText className="mr-2 h-4 w-4" />
                New Claim
              </Button>
            )}
          </div>

          {ins.claims.length === 0 ? (
            <Card className="border" style={{ backgroundColor: "hsl(var(--tenant-card))", borderColor: "hsl(var(--tenant-card-border))", borderRadius: "var(--tenant-radius-lg)" }}>
              <CardContent className="p-8 text-center">
                <ShieldCheck className="w-10 h-10 mx-auto mb-3" style={{ color: "hsl(var(--tenant-success))" }} />
                <p className="font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>No claims filed</p>
                <p className="text-sm mt-1" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Your coverage is active and ready when you need it</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {ins.claims.map((claim) => (
                <Card
                  key={claim.id}
                  className="border"
                  data-testid={`claim-card-${claim.id}`}
                  style={{ backgroundColor: "hsl(var(--tenant-card))", borderColor: "hsl(var(--tenant-card-border))", borderRadius: "var(--tenant-radius-lg)" }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: claim.status === "paid" || claim.status === "approved" ? "hsl(var(--tenant-success) / 0.1)" : claim.status === "denied" ? "hsl(0 70% 95%)" : "hsl(var(--tenant-muted))" }}>
                          {claim.status === "paid" || claim.status === "approved" ? (
                            <CheckCircle2 className="w-4 h-4" style={{ color: "hsl(var(--tenant-success))" }} />
                          ) : claim.status === "denied" ? (
                            <AlertCircle className="w-4 h-4" style={{ color: "hsl(0 70% 50%)" }} />
                          ) : (
                            <Clock className="w-4 h-4" style={{ color: "hsl(var(--tenant-muted-foreground))" }} />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: "hsl(var(--tenant-foreground))" }}>{claim.type}</p>
                          <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>{claim.description}</p>
                          <p className="text-xs mt-1" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Filed: {claim.submittedDate}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold font-mono" style={{ color: "hsl(var(--tenant-foreground))" }}>${claim.amount.toLocaleString()}</p>
                        <div className="mt-1">{getClaimStatusBadge(claim.status)}</div>
                        {claim.paidAmount && (
                          <p className="text-xs mt-1 font-mono" style={{ color: "hsl(var(--tenant-success))" }}>
                            Paid: ${claim.paidAmount.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pool" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card
              className="border"
              style={{ backgroundColor: "hsl(var(--tenant-card))", borderColor: "hsl(var(--tenant-card-border))", borderRadius: "var(--tenant-radius-lg)" }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5" style={{ color: "hsl(var(--tenant-primary))" }} />
                  <CardTitle className="text-base" style={{ color: "hsl(var(--tenant-foreground))" }}>Coverage Pool</CardTitle>
                </div>
                <CardDescription style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                  Pooled stablecoin reserves backing all active policies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
                  <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Total Pool Size</p>
                  <p className="text-3xl font-bold font-mono" style={{ color: "hsl(var(--tenant-foreground))" }}>
                    ${ins.coveragePool.totalPoolSize.toLocaleString()}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "hsl(var(--tenant-success))" }}>
                    {ins.coveragePool.reserveRatio}% reserve ratio &bull; {ins.coveragePool.poolYield}% APY
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>Stablecoin Composition</p>
                  {ins.coveragePool.stablecoinBacking.map((coin) => (
                    <div key={coin.coin} className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{
                            backgroundColor: coin.coin === "USDC" ? "hsl(220 80% 55%)" : coin.coin === "USDT" ? "hsl(160 70% 40%)" : "hsl(40 90% 50%)",
                            color: "white"
                          }}
                        >
                          {coin.coin === "USDC" ? "C" : coin.coin === "USDT" ? "T" : "D"}
                        </div>
                        <p className="text-sm font-medium" style={{ color: "hsl(var(--tenant-foreground))" }}>{coin.coin}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono" style={{ color: "hsl(var(--tenant-foreground))" }}>${coin.amount.toLocaleString()}</p>
                        <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>{coin.pct}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card
              className="border"
              style={{ backgroundColor: "hsl(var(--tenant-card))", borderColor: "hsl(var(--tenant-card-border))", borderRadius: "var(--tenant-radius-lg)" }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5" style={{ color: "hsl(var(--tenant-primary))" }} />
                  <CardTitle className="text-base" style={{ color: "hsl(var(--tenant-foreground))" }}>Your Contribution</CardTitle>
                </div>
                <CardDescription style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                  How your premiums grow in the coverage pool
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg text-center" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
                    <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Your Pool Share</p>
                    <p className="text-xl font-bold font-mono" style={{ color: "hsl(var(--tenant-foreground))" }}>
                      ${ins.coveragePool.yourContribution.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg text-center" style={{ backgroundColor: "hsl(var(--tenant-success) / 0.1)" }}>
                    <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Yield Earned</p>
                    <p className="text-xl font-bold font-mono" style={{ color: "hsl(var(--tenant-success))" }}>
                      ${ins.coveragePool.yourYieldEarned.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-primary) / 0.05)", border: "1px solid hsl(var(--tenant-primary) / 0.15)" }}>
                  <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "hsl(var(--tenant-primary))" }} />
                    <div>
                      <p className="text-xs font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>Yield on Your Premiums</p>
                      <p className="text-xs mt-0.5" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                        Your premiums are deployed into stablecoin yield strategies. You earn {ins.coveragePool.poolYield}% APY on your contribution — making insurance a yield-generating asset, not just a cost.
                      </p>
                    </div>
                  </div>
                </div>

                {ins.monthlyHistory.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold mb-2" style={{ color: "hsl(var(--tenant-foreground))" }}>Pool Value Trend</p>
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={ins.monthlyHistory}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--tenant-card-border))" />
                          <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--tenant-muted-foreground))" }} />
                          <YAxis tick={{ fontSize: 10, fill: "hsl(var(--tenant-muted-foreground))" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                          <Tooltip
                            formatter={(value: number) => [`$${value.toLocaleString()}`, "Pool Value"]}
                            contentStyle={{ backgroundColor: "hsl(var(--tenant-card))", borderColor: "hsl(var(--tenant-card-border))", borderRadius: 8 }}
                          />
                          <Area type="monotone" dataKey="poolValue" stroke="hsl(var(--tenant-primary))" fill="hsl(var(--tenant-primary) / 0.1)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card
            className="border"
            style={{ backgroundColor: "hsl(var(--tenant-card))", borderColor: "hsl(var(--tenant-card-border))", borderRadius: "var(--tenant-radius-lg)" }}
          >
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5" style={{ color: "hsl(var(--tenant-primary))" }} />
                <p className="font-semibold text-sm" style={{ color: "hsl(var(--tenant-foreground))" }}>How Stablecoin-Backed Insurance Works</p>
              </div>
              <div className="grid md:grid-cols-4 gap-3">
                {[
                  { step: 1, title: "Pay Premium", sub: "Monthly USD payment", icon: DollarSign, color: "primary" },
                  { step: 2, title: "Pooled in Stablecoins", sub: "USDC, USDT, DAI reserves", icon: Layers, color: "primary" },
                  { step: 3, title: "Pool Earns Yield", sub: `${ins.coveragePool.poolYield}% APY on reserves`, icon: TrendingUp, color: "success" },
                  { step: 4, title: "Instant Claims", sub: "Stablecoin liquidity = fast payouts", icon: Zap, color: "success" },
                ].map((s) => (
                  <div key={s.step} className="p-4 rounded-lg border space-y-2"
                    style={{
                      backgroundColor: "hsl(var(--tenant-card))",
                      borderColor: s.color === "success" ? "hsl(var(--tenant-success) / 0.3)" : "hsl(var(--tenant-card-border))",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs"
                        style={{
                          backgroundColor: s.color === "success" ? "hsl(var(--tenant-success))" : "hsl(var(--tenant-primary))",
                          color: "white",
                        }}
                      >{s.step}</div>
                      <s.icon className="h-4 w-4" style={{ color: s.color === "success" ? "hsl(var(--tenant-success))" : "hsl(var(--tenant-primary))" }} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "hsl(var(--tenant-foreground))" }}>{s.title}</p>
                      <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>{s.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={claimOpen} onOpenChange={setClaimOpen}>
        <DialogContent style={{ backgroundColor: "hsl(var(--tenant-card))" }}>
          <DialogHeader>
            <DialogTitle style={{ color: "hsl(var(--tenant-foreground))" }}>File a Claim</DialogTitle>
            <DialogDescription style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
              Submit a claim for covered damages or losses. Claims are paid from the stablecoin reserve pool.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label style={{ color: "hsl(var(--tenant-foreground))" }}>Claim Type</Label>
              <Input
                placeholder="e.g., Water Damage, Theft, Fire"
                value={claimType}
                onChange={(e) => setClaimType(e.target.value)}
                data-testid="input-claim-type"
                style={{ borderColor: "hsl(var(--tenant-card-border))" }}
              />
            </div>
            <div>
              <Label style={{ color: "hsl(var(--tenant-foreground))" }}>Estimated Amount (USD)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={claimAmount}
                onChange={(e) => setClaimAmount(e.target.value)}
                data-testid="input-claim-amount"
                style={{ borderColor: "hsl(var(--tenant-card-border))" }}
              />
            </div>
            <div>
              <Label style={{ color: "hsl(var(--tenant-foreground))" }}>Description</Label>
              <Textarea
                placeholder="Describe what happened..."
                value={claimDescription}
                onChange={(e) => setClaimDescription(e.target.value)}
                data-testid="input-claim-description"
                className="resize-none"
                style={{ borderColor: "hsl(var(--tenant-card-border))" }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClaimOpen(false)} style={{ borderColor: "hsl(var(--tenant-card-border))" }}>Cancel</Button>
            <Button
              onClick={() => {
                if (claimType && claimAmount) {
                  claimMutation.mutate({ type: claimType, amount: parseFloat(claimAmount), description: claimDescription });
                }
              }}
              disabled={!claimType || !claimAmount || claimMutation.isPending}
              data-testid="button-submit-claim"
              style={{ backgroundColor: "hsl(var(--tenant-primary))", color: "hsl(var(--tenant-primary-foreground))" }}
            >
              {claimMutation.isPending ? "Submitting..." : "Submit Claim"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={enrollOpen} onOpenChange={setEnrollOpen}>
        <DialogContent style={{ backgroundColor: "hsl(var(--tenant-card))" }}>
          <DialogHeader>
            <DialogTitle style={{ color: "hsl(var(--tenant-foreground))" }}>Enroll in {selectedPlan?.name}</DialogTitle>
            <DialogDescription style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
              Confirm your enrollment. Premiums are auto-deducted monthly and deployed into the stablecoin coverage pool.
            </DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-sm" style={{ color: "hsl(var(--tenant-foreground))" }}>{selectedPlan.name}</p>
                  <p className="font-bold font-mono" style={{ color: "hsl(var(--tenant-foreground))" }}>${selectedPlan.monthlyPremium}/mo</p>
                </div>
                <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                  Coverage: ${selectedPlan.coverageAmount.toLocaleString()} &bull; Deductible: ${selectedPlan.deductible}
                </p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-success) / 0.1)" }}>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" style={{ color: "hsl(var(--tenant-success))" }} />
                  <p className="text-xs" style={{ color: "hsl(var(--tenant-success))" }}>
                    Your premiums earn ~{ins.coveragePool.poolYield}% APY in the stablecoin coverage pool
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEnrollOpen(false)} style={{ borderColor: "hsl(var(--tenant-card-border))" }}>Cancel</Button>
            <Button
              onClick={() => selectedPlan && enrollMutation.mutate(selectedPlan.id)}
              disabled={enrollMutation.isPending}
              data-testid="button-confirm-enroll"
              style={{ backgroundColor: "hsl(var(--tenant-primary))", color: "hsl(var(--tenant-primary-foreground))" }}
            >
              {enrollMutation.isPending ? "Enrolling..." : "Confirm Enrollment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
