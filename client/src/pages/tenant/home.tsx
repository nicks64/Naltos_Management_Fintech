import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CreditCard, Calendar, DollarSign, CheckCircle2, Clock, AlertCircle, TrendingUp, Zap, ArrowRight, Wallet, PiggyBank } from "lucide-react";
import { format, parseISO } from "date-fns";

interface RentSummary {
  upcomingRent: {
    amount: number;
    dueDate: string;
    unit: string;
  } | null;
  pastDueRent: {
    amount: number;
    daysOverdue: number;
  } | null;
  recentPayments: Array<{
    id: string;
    amount: number;
    date: string;
    status: string;
  }>;
}

export default function TenantHome() {
  const { toast } = useToast();

  const { data: rentInfo, isLoading } = useQuery<RentSummary>({
    queryKey: ["/api/tenant/rent-summary"],
  });

  const payRentMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/tenant/pay-rent", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenant/rent-summary"] });
      toast({
        title: "Payment Successful",
        description: "Your rent payment has been processed.",
      });
    },
  });

  const handleQuickPay = () => {
    if (rentInfo?.upcomingRent) {
      payRentMutation.mutate();
    }
  };

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
        <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ color: "hsl(var(--tenant-foreground))" }}>
          Home
        </h1>
        <p className="text-base" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
          Manage your rent and payments
        </p>
      </div>

      {/* Upcoming Rent Card - PayPal Style */}
      {rentInfo?.upcomingRent && (
        <Card 
          className="border overflow-hidden"
          style={{
            backgroundColor: "hsl(var(--tenant-card))",
            borderColor: "hsl(var(--tenant-card-border))",
            borderRadius: "var(--tenant-radius-lg)",
            boxShadow: "var(--tenant-shadow-md)",
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-5">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5" style={{ color: "hsl(var(--tenant-primary))" }} />
                  <p className="text-sm font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>
                    Rent Due
                  </p>
                </div>
                <h2 className="text-4xl font-bold tabular-nums mb-1" style={{ color: "hsl(var(--tenant-foreground))" }}>
                  ${rentInfo.upcomingRent.amount.toLocaleString()}
                </h2>
                <p className="text-sm" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                  {rentInfo.upcomingRent.unit} • Due {format(parseISO(rentInfo.upcomingRent.dueDate), "MMM d, yyyy")}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                size="lg"
                className="flex-1 h-11 font-semibold rounded-lg"
                onClick={handleQuickPay}
                disabled={payRentMutation.isPending}
                data-testid="button-pay-now"
                style={{
                  backgroundColor: "hsl(var(--tenant-primary))",
                  color: "hsl(var(--tenant-primary-foreground))",
                }}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {payRentMutation.isPending ? "Processing..." : "Pay Now"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rent-to-Reward Flow Visualization */}
      {rentInfo?.upcomingRent && (
        <Card 
          className="border overflow-hidden"
          style={{
            backgroundColor: "hsl(var(--tenant-card))",
            borderColor: "hsl(var(--tenant-primary) / 0.3)",
            borderRadius: "var(--tenant-radius-lg)",
            boxShadow: "var(--tenant-shadow-md)",
            borderWidth: "2px",
          }}
        >
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" style={{ color: "hsl(var(--tenant-primary))" }} />
              <CardTitle className="text-lg" style={{ color: "hsl(var(--tenant-foreground))" }}>
                How You Earn Cashback on Rent
              </CardTitle>
            </div>
            <CardDescription style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
              Your rent payment flows through smart treasury automation — earn USD cashback automatically
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-5 gap-3 relative">
              {/* Connecting line */}
              <div className="absolute top-10 left-0 right-0 h-0.5 hidden md:block" 
                style={{ background: "linear-gradient(to right, hsl(var(--tenant-primary) / 0.2), hsl(var(--tenant-primary)), hsl(var(--tenant-primary) / 0.2))" }} 
              />
              
              {/* Step 1: You Pay Rent */}
              <div className="relative z-10 p-4 rounded-lg border space-y-2 hover-elevate" 
                style={{ 
                  backgroundColor: "hsl(var(--tenant-card))", 
                  borderColor: "hsl(var(--tenant-primary) / 0.3)" 
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm" 
                    style={{ 
                      backgroundColor: "hsl(var(--tenant-primary))", 
                      color: "hsl(var(--tenant-primary-foreground))" 
                    }}
                  >1</div>
                  <DollarSign className="h-5 w-5" style={{ color: "hsl(var(--tenant-muted-foreground))" }} />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "hsl(var(--tenant-foreground))" }}>
                    You Pay Rent
                  </p>
                  <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                    ${rentInfo.upcomingRent.amount} USD
                  </p>
                </div>
              </div>

              {/* Step 2: Stablecoin Backend */}
              <div className="relative z-10 p-4 rounded-lg border space-y-2 hover-elevate" 
                style={{ 
                  backgroundColor: "hsl(var(--tenant-card))", 
                  borderColor: "hsl(var(--tenant-card-border))" 
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm" 
                    style={{ 
                      backgroundColor: "hsl(var(--tenant-muted))", 
                      color: "hsl(var(--tenant-muted-foreground))" 
                    }}
                  >2</div>
                  <ArrowRight className="h-5 w-5" style={{ color: "hsl(var(--tenant-primary))" }} />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "hsl(var(--tenant-foreground))" }}>
                    Backend Rails
                  </p>
                  <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                    USDC (invisible)
                  </p>
                </div>
              </div>

              {/* Step 3: Treasury Deployment */}
              <div className="relative z-10 p-4 rounded-lg border space-y-2 hover-elevate" 
                style={{ 
                  backgroundColor: "hsl(var(--tenant-card))", 
                  borderColor: "hsl(var(--tenant-card-border))" 
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm" 
                    style={{ 
                      backgroundColor: "hsl(var(--tenant-muted))", 
                      color: "hsl(var(--tenant-muted-foreground))" 
                    }}
                  >3</div>
                  <Wallet className="h-5 w-5" style={{ color: "hsl(var(--tenant-muted-foreground))" }} />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "hsl(var(--tenant-foreground))" }}>
                    Smart Treasury
                  </p>
                  <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                    10-day float @ 5% APY
                  </p>
                </div>
              </div>

              {/* Step 4: Yield Generated */}
              <div className="relative z-10 p-4 rounded-lg border-2 space-y-2 hover-elevate" 
                style={{ 
                  backgroundColor: "hsl(var(--tenant-card))", 
                  borderColor: "hsl(var(--tenant-success) / 0.5)" 
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm" 
                    style={{ 
                      backgroundColor: "hsl(var(--tenant-success))", 
                      color: "white" 
                    }}
                  >4</div>
                  <TrendingUp className="h-5 w-5" style={{ color: "hsl(var(--tenant-success))" }} />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "hsl(var(--tenant-success))" }}>
                    Yield Earned
                  </p>
                  <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                    $1.23 total yield
                  </p>
                </div>
              </div>

              {/* Step 5: You Get Cashback */}
              <div className="relative z-10 p-4 rounded-lg border-2 space-y-2 hover-elevate" 
                style={{ 
                  backgroundColor: "hsl(var(--tenant-card))", 
                  borderColor: "hsl(var(--tenant-success) / 0.5)" 
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm" 
                    style={{ 
                      backgroundColor: "hsl(var(--tenant-success))", 
                      color: "white" 
                    }}
                  >5</div>
                  <Zap className="h-5 w-5" style={{ color: "hsl(var(--tenant-success))" }} />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "hsl(var(--tenant-success))" }}>
                    Your Cashback
                  </p>
                  <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                    $0.12 USD earned
                  </p>
                </div>
              </div>
            </div>

            {/* Breakdown callout */}
            <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-primary) / 0.1)", border: "1px solid hsl(var(--tenant-primary) / 0.2)" }}>
              <div className="flex items-start gap-3">
                <PiggyBank className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: "hsl(var(--tenant-primary))" }} />
                <div className="space-y-1">
                  <p className="font-semibold text-sm" style={{ color: "hsl(var(--tenant-foreground))" }}>
                    Rent Float Yield Sharing
                  </p>
                  <p className="text-sm" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                    Your ${rentInfo.upcomingRent.amount} rent generates <strong style={{ color: "hsl(var(--tenant-foreground))" }}>$1.23 USD yield</strong> over 10 days (5% APY). <strong style={{ color: "hsl(var(--tenant-success))" }}>You receive $0.12 cashback</strong> (10% of yield), property owner gets $1.11 (90%). All automatically — just pay rent as normal.
                  </p>
                </div>
              </div>
            </div>

            {/* USD-First reminder */}
            <div className="mt-4 text-center">
              <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                <strong style={{ color: "hsl(var(--tenant-foreground))" }}>Powered by stablecoin rails:</strong> Everything is in USD — stablecoins are just invisible backend infrastructure for instant settlement
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Past Due Alert */}
      {rentInfo?.pastDueRent && (
        <Card 
          className="border-2 overflow-hidden"
          style={{
            borderColor: "hsl(0 84% 60%)",
            backgroundColor: "hsl(0 84% 97%)",
            borderRadius: "var(--tenant-radius)",
          }}
        >
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: "hsl(0 84% 90%)" }}>
                <AlertCircle className="w-5 h-5" style={{ color: "hsl(0 84% 40%)" }} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base" style={{ color: "hsl(0 84% 30%)" }}>
                  Past Due Amount
                </h3>
                <p className="text-sm" style={{ color: "hsl(0 84% 40%)" }}>
                  ${rentInfo.pastDueRent.amount.toLocaleString()} • {rentInfo.pastDueRent.daysOverdue} days overdue
                </p>
              </div>
              <Button 
                size="default"
                className="font-semibold rounded-lg"
                style={{ backgroundColor: "hsl(0 84% 50%)", color: "white" }}
                data-testid="button-pay-past-due"
              >
                Pay ${rentInfo.pastDueRent.amount.toLocaleString()}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Payments */}
      <Card 
        className="border overflow-hidden"
        style={{
          backgroundColor: "hsl(var(--tenant-card))",
          borderColor: "hsl(var(--tenant-card-border))",
          borderRadius: "var(--tenant-radius-lg)",
          boxShadow: "var(--tenant-shadow-md)",
        }}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" style={{ color: "hsl(var(--tenant-muted-foreground))" }} />
            <CardTitle className="text-lg" style={{ color: "hsl(var(--tenant-foreground))" }}>
              Recent Activity
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {rentInfo?.recentPayments && rentInfo.recentPayments.length > 0 ? (
            <div className="space-y-0 divide-y" style={{ borderColor: "hsl(var(--tenant-card-border))" }}>
              {rentInfo.recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between py-4 first:pt-0"
                  data-testid={`payment-history-${payment.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full" style={{ backgroundColor: "hsl(var(--tenant-success) / 0.1)" }}>
                      <CheckCircle2 className="w-4 h-4" style={{ color: "hsl(var(--tenant-success))" }} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "hsl(var(--tenant-foreground))" }}>
                        Rent payment
                      </p>
                      <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                        {format(parseISO(payment.date), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold tabular-nums text-sm" style={{ color: "hsl(var(--tenant-foreground))" }}>
                      ${payment.amount.toLocaleString()}
                    </p>
                    <Badge 
                      variant="secondary" 
                      className="rounded-full px-2 py-0.5 text-xs font-medium mt-1"
                      style={{
                        backgroundColor: "hsl(var(--tenant-secondary))",
                        color: "hsl(var(--tenant-secondary-foreground))",
                      }}
                    >
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: "hsl(var(--tenant-muted-foreground))" }} />
              <p className="text-sm" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                No payment history yet
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
