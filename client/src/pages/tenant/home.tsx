import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  CreditCard,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Zap,
  ArrowRight,
  Wallet,
  PiggyBank,
  Users,
  Flame,
  Gift,
  Repeat,
} from "lucide-react";
import { format, parseISO } from "date-fns";

interface RentSummary {
  upcomingRent: { amount: number; dueDate: string; unit: string } | null;
  pastDueRent: { amount: number; daysOverdue: number } | null;
  recentPayments: Array<{ id: string; amount: number; date: string; status: string }>;
}

const mockStreak = {
  current: 18,
  best: 18,
  cashbackEarned: 42.75,
  nextMilestone: 24,
  nextReward: 15.00,
  tier: "Gold",
};

const mockFlexOptions = [
  { id: "full", label: "Full Payment", amount: 1500, desc: "Pay full rent now", icon: CreditCard, badge: "Best Value" },
  { id: "split2", label: "Split in 2", amount: 750, desc: "$750 now + $750 on the 15th", icon: Repeat, badge: "Popular" },
  { id: "split4", label: "Weekly Split", amount: 375, desc: "4 weekly payments of $375", icon: Calendar, badge: null },
];

export default function TenantHome() {
  const { toast } = useToast();
  const [paymentTab, setPaymentTab] = useState("pay");

  const { data: rentInfo, isLoading } = useQuery<RentSummary>({
    queryKey: ["/api/tenant/rent-summary"],
  });

  const payRentMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/tenant/pay-rent", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenant/rent-summary"] });
      toast({ title: "Payment Successful", description: "Your rent payment has been processed." });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="page-tenant-home">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" style={{ backgroundColor: "hsl(var(--tenant-muted))" }} />
        <div className="h-64 bg-muted animate-pulse rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-muted))" }} />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="page-tenant-home">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ color: "hsl(var(--tenant-foreground))" }}>Home</h1>
        <p className="text-base" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Manage your rent, rewards, and flexible payments</p>
      </div>

      {rentInfo?.upcomingRent && (
        <Card
          className="border overflow-hidden"
          style={{ backgroundColor: "hsl(var(--tenant-card))", borderColor: "hsl(var(--tenant-card-border))", borderRadius: "var(--tenant-radius-lg)", boxShadow: "var(--tenant-shadow-md)" }}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-5 flex-wrap gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5" style={{ color: "hsl(var(--tenant-primary))" }} />
                  <p className="text-sm font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>Rent Due</p>
                </div>
                <h2 className="text-4xl font-bold tabular-nums mb-1" style={{ color: "hsl(var(--tenant-foreground))" }}>
                  ${rentInfo.upcomingRent.amount.toLocaleString()}
                </h2>
                <p className="text-sm" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                  {rentInfo.upcomingRent.unit} &bull; Due {format(parseISO(rentInfo.upcomingRent.dueDate), "MMM d, yyyy")}
                </p>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-success) / 0.1)" }}>
                <Flame className="w-5 h-5" style={{ color: "hsl(var(--tenant-success))" }} />
                <div>
                  <p className="text-sm font-bold" style={{ color: "hsl(var(--tenant-success))" }}>{mockStreak.current}-month streak</p>
                  <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>{mockStreak.tier} tier</p>
                </div>
              </div>
            </div>

            <Tabs value={paymentTab} onValueChange={setPaymentTab}>
              <TabsList className="w-full mb-4" data-testid="tabs-payment">
                <TabsTrigger value="pay" className="flex-1" data-testid="tab-pay-now">Pay Now</TabsTrigger>
                <TabsTrigger value="flex" className="flex-1" data-testid="tab-flex-pay">Flexible Pay</TabsTrigger>
                <TabsTrigger value="p2p" className="flex-1" data-testid="tab-p2p">Split with Roommate</TabsTrigger>
              </TabsList>

              <TabsContent value="pay">
                <Button
                  size="lg"
                  className="w-full h-12 font-semibold rounded-lg"
                  onClick={() => payRentMutation.mutate()}
                  disabled={payRentMutation.isPending}
                  data-testid="button-pay-now"
                  style={{ backgroundColor: "hsl(var(--tenant-primary))", color: "hsl(var(--tenant-primary-foreground))" }}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {payRentMutation.isPending ? "Processing..." : `Pay $${rentInfo.upcomingRent.amount.toLocaleString()} Now`}
                </Button>
              </TabsContent>

              <TabsContent value="flex" className="space-y-3">
                {mockFlexOptions.map((opt) => (
                  <div
                    key={opt.id}
                    className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover-elevate"
                    data-testid={`flex-option-${opt.id}`}
                    style={{ borderColor: "hsl(var(--tenant-card-border))" }}
                  >
                    <opt.icon className="w-5 h-5 flex-shrink-0" style={{ color: "hsl(var(--tenant-primary))" }} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm" style={{ color: "hsl(var(--tenant-foreground))" }}>{opt.label}</p>
                        {opt.badge && <Badge variant="secondary" className="text-xs">{opt.badge}</Badge>}
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>{opt.desc}</p>
                    </div>
                    <p className="font-bold font-mono text-sm" style={{ color: "hsl(var(--tenant-foreground))" }}>${opt.amount}</p>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="p2p">
                <div className="p-4 rounded-lg space-y-3" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" style={{ color: "hsl(var(--tenant-primary))" }} />
                    <p className="font-semibold text-sm" style={{ color: "hsl(var(--tenant-foreground))" }}>
                      Split Rent with Roommates
                    </p>
                  </div>
                  <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                    Invite roommates to split rent automatically. Each person pays their share directly — no chasing payments.
                  </p>
                  <div className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: "hsl(var(--tenant-card-border))", backgroundColor: "hsl(var(--tenant-card))" }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "hsl(var(--tenant-foreground))" }}>Your share (50%)</p>
                      <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Roommate pays the other 50%</p>
                    </div>
                    <p className="text-xl font-bold font-mono" style={{ color: "hsl(var(--tenant-foreground))" }}>
                      ${(rentInfo.upcomingRent.amount / 2).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    data-testid="button-invite-roommate"
                    style={{ borderColor: "hsl(var(--tenant-primary))", color: "hsl(var(--tenant-primary))" }}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Invite Roommate
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      <Card
        className="border overflow-hidden"
        style={{ backgroundColor: "hsl(var(--tenant-card))", borderColor: "hsl(var(--tenant-primary) / 0.3)", borderRadius: "var(--tenant-radius-lg)", boxShadow: "var(--tenant-shadow-md)", borderWidth: "2px" }}
      >
        <CardHeader>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5" style={{ color: "hsl(var(--tenant-success))" }} />
            <CardTitle className="text-lg" style={{ color: "hsl(var(--tenant-foreground))" }}>Streak Cashback Engine</CardTitle>
          </div>
          <CardDescription style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
            Earn increasing cashback for consecutive on-time payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="p-3 rounded-lg text-center" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
              <p className="text-2xl font-bold font-mono" style={{ color: "hsl(var(--tenant-success))" }}>{mockStreak.current}</p>
              <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Current Streak</p>
            </div>
            <div className="p-3 rounded-lg text-center" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
              <p className="text-2xl font-bold font-mono" style={{ color: "hsl(var(--tenant-foreground))" }}>{mockStreak.best}</p>
              <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Best Streak</p>
            </div>
            <div className="p-3 rounded-lg text-center" style={{ backgroundColor: "hsl(var(--tenant-success) / 0.1)" }}>
              <p className="text-2xl font-bold font-mono" style={{ color: "hsl(var(--tenant-success))" }}>${mockStreak.cashbackEarned}</p>
              <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Total Earned</p>
            </div>
            <div className="p-3 rounded-lg text-center" style={{ backgroundColor: "hsl(var(--tenant-primary) / 0.1)" }}>
              <p className="text-2xl font-bold font-mono" style={{ color: "hsl(var(--tenant-primary))" }}>${mockStreak.nextReward}</p>
              <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Next Reward @{mockStreak.nextMilestone}mo</p>
            </div>
          </div>

          <div className="p-4 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-primary) / 0.05)", border: "1px solid hsl(var(--tenant-primary) / 0.15)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-4 h-4" style={{ color: "hsl(var(--tenant-primary))" }} />
              <p className="text-sm font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>Streak Tiers</p>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
                <p className="font-bold" style={{ color: "hsl(var(--tenant-foreground))" }}>Bronze</p>
                <p style={{ color: "hsl(var(--tenant-muted-foreground))" }}>3+ months</p>
                <p className="font-mono" style={{ color: "hsl(var(--tenant-success))" }}>$2/mo</p>
              </div>
              <div className="p-2 rounded" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
                <p className="font-bold" style={{ color: "hsl(var(--tenant-foreground))" }}>Silver</p>
                <p style={{ color: "hsl(var(--tenant-muted-foreground))" }}>6+ months</p>
                <p className="font-mono" style={{ color: "hsl(var(--tenant-success))" }}>$3.50/mo</p>
              </div>
              <div className="p-2 rounded border-2" style={{ borderColor: "hsl(var(--tenant-primary) / 0.3)", backgroundColor: "hsl(var(--tenant-primary) / 0.05)" }}>
                <p className="font-bold" style={{ color: "hsl(var(--tenant-primary))" }}>Gold</p>
                <p style={{ color: "hsl(var(--tenant-muted-foreground))" }}>12+ months</p>
                <p className="font-mono" style={{ color: "hsl(var(--tenant-success))" }}>$5/mo</p>
              </div>
              <div className="p-2 rounded" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
                <p className="font-bold" style={{ color: "hsl(var(--tenant-foreground))" }}>Platinum</p>
                <p style={{ color: "hsl(var(--tenant-muted-foreground))" }}>24+ months</p>
                <p className="font-mono" style={{ color: "hsl(var(--tenant-success))" }}>$8/mo</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card
        className="border overflow-hidden"
        style={{ backgroundColor: "hsl(var(--tenant-card))", borderColor: "hsl(var(--tenant-card-border))", borderRadius: "var(--tenant-radius-lg)", boxShadow: "var(--tenant-shadow-md)" }}
      >
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" style={{ color: "hsl(var(--tenant-primary))" }} />
            <CardTitle className="text-lg" style={{ color: "hsl(var(--tenant-foreground))" }}>How You Earn Cashback on Rent</CardTitle>
          </div>
          <CardDescription style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
            Your rent payment flows through smart treasury automation — earn USD cashback automatically
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-5 gap-3 relative">
            <div className="absolute top-10 left-0 right-0 h-0.5 hidden md:block" style={{ background: "linear-gradient(to right, hsl(var(--tenant-primary) / 0.2), hsl(var(--tenant-primary)), hsl(var(--tenant-primary) / 0.2))" }} />

            {[
              { step: 1, title: "You Pay Rent", sub: `$${rentInfo?.upcomingRent?.amount || 1500} USD`, icon: DollarSign, color: "primary" },
              { step: 2, title: "Backend Rails", sub: "Digital payment infrastructure", icon: ArrowRight, color: "muted" },
              { step: 3, title: "Smart Treasury", sub: "10-day float @ 3% APY", icon: Wallet, color: "muted" },
              { step: 4, title: "Yield Earned", sub: "$1.23 total yield", icon: TrendingUp, color: "success" },
              { step: 5, title: "Your Cashback", sub: "$0.12 USD earned", icon: Zap, color: "success" },
            ].map((s) => (
              <div key={s.step} className="relative z-10 p-4 rounded-lg border space-y-2 hover-elevate"
                style={{
                  backgroundColor: "hsl(var(--tenant-card))",
                  borderColor: s.color === "success" ? "hsl(var(--tenant-success) / 0.5)" : s.color === "primary" ? "hsl(var(--tenant-primary) / 0.3)" : "hsl(var(--tenant-card-border))",
                  borderWidth: s.color === "success" ? "2px" : undefined,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm"
                    style={{
                      backgroundColor: s.color === "success" ? "hsl(var(--tenant-success))" : s.color === "primary" ? "hsl(var(--tenant-primary))" : "hsl(var(--tenant-muted))",
                      color: s.color === "muted" ? "hsl(var(--tenant-muted-foreground))" : "white",
                    }}
                  >{s.step}</div>
                  <s.icon className="h-5 w-5" style={{ color: s.color === "success" ? "hsl(var(--tenant-success))" : s.color === "primary" ? "hsl(var(--tenant-primary))" : "hsl(var(--tenant-muted-foreground))" }} />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: s.color === "success" ? "hsl(var(--tenant-success))" : "hsl(var(--tenant-foreground))" }}>{s.title}</p>
                  <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>{s.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-primary) / 0.1)", border: "1px solid hsl(var(--tenant-primary) / 0.2)" }}>
            <div className="flex items-start gap-3">
              <PiggyBank className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: "hsl(var(--tenant-primary))" }} />
              <div className="space-y-1">
                <p className="font-semibold text-sm" style={{ color: "hsl(var(--tenant-foreground))" }}>Rent Float Yield Sharing</p>
                <p className="text-sm" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                  Your ${rentInfo?.upcomingRent?.amount || 1500} rent generates <strong style={{ color: "hsl(var(--tenant-foreground))" }}>$1.23 USD yield</strong> over 10 days (3% APY). <strong style={{ color: "hsl(var(--tenant-success))" }}>You receive $0.12 cashback</strong> (10% of yield), property owner gets $1.11 (90%).
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {rentInfo?.pastDueRent && (
        <Card
          className="border-2 overflow-hidden"
          style={{ borderColor: "hsl(0 84% 60%)", backgroundColor: "hsl(0 84% 97%)", borderRadius: "var(--tenant-radius)" }}
        >
          <CardContent className="p-5">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="p-2 rounded-lg" style={{ backgroundColor: "hsl(0 84% 90%)" }}>
                <AlertCircle className="w-5 h-5" style={{ color: "hsl(0 84% 40%)" }} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base" style={{ color: "hsl(0 84% 30%)" }}>Past Due Amount</h3>
                <p className="text-sm" style={{ color: "hsl(0 84% 40%)" }}>${rentInfo.pastDueRent.amount.toLocaleString()} &bull; {rentInfo.pastDueRent.daysOverdue} days overdue</p>
              </div>
              <Button size="default" className="font-semibold rounded-lg" style={{ backgroundColor: "hsl(0 84% 50%)", color: "white" }} data-testid="button-pay-past-due">
                Pay ${rentInfo.pastDueRent.amount.toLocaleString()}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card
        className="border overflow-hidden"
        style={{ backgroundColor: "hsl(var(--tenant-card))", borderColor: "hsl(var(--tenant-card-border))", borderRadius: "var(--tenant-radius-lg)", boxShadow: "var(--tenant-shadow-md)" }}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" style={{ color: "hsl(var(--tenant-muted-foreground))" }} />
            <CardTitle className="text-lg" style={{ color: "hsl(var(--tenant-foreground))" }}>Recent Activity</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {rentInfo?.recentPayments && rentInfo.recentPayments.length > 0 ? (
            <div className="space-y-0 divide-y" style={{ borderColor: "hsl(var(--tenant-card-border))" }}>
              {rentInfo.recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between py-4 first:pt-0" data-testid={`payment-history-${payment.id}`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full" style={{ backgroundColor: "hsl(var(--tenant-success) / 0.1)" }}>
                      <CheckCircle2 className="w-4 h-4" style={{ color: "hsl(var(--tenant-success))" }} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "hsl(var(--tenant-foreground))" }}>Rent payment</p>
                      <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>{format(parseISO(payment.date), "MMM d, yyyy")}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold tabular-nums text-sm" style={{ color: "hsl(var(--tenant-foreground))" }}>${payment.amount.toLocaleString()}</p>
                    <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-xs font-medium mt-1"
                      style={{ backgroundColor: "hsl(var(--tenant-secondary))", color: "hsl(var(--tenant-secondary-foreground))" }}
                    >{payment.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: "hsl(var(--tenant-muted-foreground))" }} />
              <p className="text-sm" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>No payment history yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
