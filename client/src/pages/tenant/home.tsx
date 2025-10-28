import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CreditCard, Calendar, DollarSign, CheckCircle2, Clock, AlertCircle, Smartphone, ArrowRight } from "lucide-react";
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
      <div className="space-y-8" data-testid="page-tenant-home">
        <div className="h-12 w-64 bg-muted animate-pulse rounded-xl" style={{ backgroundColor: "hsl(var(--tenant-muted))" }} />
        <div className="h-80 bg-muted animate-pulse rounded-3xl" style={{ backgroundColor: "hsl(var(--tenant-muted))" }} />
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="page-tenant-home">
      <div>
        <h1 className="text-5xl font-bold tracking-tight mb-2" style={{ color: "hsl(var(--tenant-foreground))" }}>Home</h1>
        <p className="text-lg" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
          Your rent and payments at a glance
        </p>
      </div>

      {/* Hero Rent Card - Apple Card Style with Gradient */}
      {rentInfo?.upcomingRent && (
        <Card 
          className="border-0 overflow-hidden"
          style={{
            background: "var(--tenant-gradient-primary)",
            boxShadow: "var(--tenant-shadow-lg)",
            borderRadius: "var(--tenant-radius-lg)",
          }}
        >
          <CardContent className="p-8 text-white">
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-sm font-medium opacity-90 mb-1">RENT DUE</p>
                <h2 className="text-6xl font-bold tabular-nums">
                  ${rentInfo.upcomingRent.amount.toLocaleString()}
                </h2>
                <p className="text-base opacity-90 mt-2">
                  {rentInfo.upcomingRent.unit} • Due {format(parseISO(rentInfo.upcomingRent.dueDate), "MMM d")}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                <DollarSign className="w-8 h-8" />
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                size="lg"
                className="flex-1 h-14 text-base font-semibold rounded-xl bg-white text-purple-700 hover:bg-white/90 active-elevate-2"
                onClick={handleQuickPay}
                disabled={payRentMutation.isPending}
                data-testid="button-pay-now"
              >
                {payRentMutation.isPending ? "Processing..." : "Pay Now"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="h-14 px-6 rounded-xl border-2 border-white/30 text-white hover:bg-white/10 active-elevate-2"
                data-testid="button-pay-by-text"
              >
                <Smartphone className="h-5 w-5" />
              </Button>
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
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl" style={{ backgroundColor: "hsl(0 84% 90%)" }}>
                <AlertCircle className="w-6 h-6" style={{ color: "hsl(0 84% 40%)" }} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-xl" style={{ color: "hsl(0 84% 30%)" }}>Past Due</h3>
                <p className="text-base" style={{ color: "hsl(0 84% 40%)" }}>
                  ${rentInfo.pastDueRent.amount.toLocaleString()} • {rentInfo.pastDueRent.daysOverdue} days overdue
                </p>
              </div>
              <Button 
                size="lg"
                className="h-12 px-6 rounded-xl font-semibold"
                style={{ backgroundColor: "hsl(0 84% 50%)", color: "white" }}
                data-testid="button-pay-past-due"
              >
                Pay Now
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
          boxShadow: "var(--tenant-shadow)",
        }}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
              <Clock className="w-5 h-5" style={{ color: "hsl(var(--tenant-foreground))" }} />
            </div>
            <div>
              <CardTitle className="text-2xl" style={{ color: "hsl(var(--tenant-foreground))" }}>Recent Payments</CardTitle>
              <CardDescription className="text-base" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                Your payment history
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {rentInfo?.recentPayments && rentInfo.recentPayments.length > 0 ? (
            <div className="space-y-3">
              {rentInfo.recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-5 rounded-2xl border hover-elevate active-elevate-2 cursor-pointer transition-all"
                  style={{
                    backgroundColor: "hsl(var(--tenant-card))",
                    borderColor: "hsl(var(--tenant-card-border))",
                  }}
                  data-testid={`payment-history-${payment.id}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl" style={{ background: "var(--tenant-gradient-success)" }}>
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg tabular-nums" style={{ color: "hsl(var(--tenant-foreground))" }}>
                        ${payment.amount.toLocaleString()}
                      </p>
                      <p className="text-sm" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                        {format(parseISO(payment.date), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="rounded-full px-4 py-1.5 text-sm font-medium"
                    style={{
                      backgroundColor: "hsl(var(--tenant-secondary))",
                      color: "hsl(var(--tenant-secondary-foreground))",
                    }}
                  >
                    {payment.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex p-4 rounded-2xl mb-4" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
                <Calendar className="w-10 h-10 opacity-40" style={{ color: "hsl(var(--tenant-muted-foreground))" }} />
              </div>
              <p className="text-base" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>No payment history yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card 
        className="border overflow-hidden"
        style={{
          backgroundColor: "hsl(var(--tenant-card))",
          borderColor: "hsl(var(--tenant-card-border))",
          borderRadius: "var(--tenant-radius-lg)",
          boxShadow: "var(--tenant-shadow)",
        }}
      >
        <CardHeader>
          <CardTitle className="text-2xl" style={{ color: "hsl(var(--tenant-foreground))" }}>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-auto flex-col gap-3 py-6 rounded-2xl border-2 hover-elevate active-elevate-2"
              style={{
                borderColor: "hsl(var(--tenant-card-border))",
                color: "hsl(var(--tenant-foreground))",
              }}
              data-testid="button-setup-autopay"
            >
              <div className="p-3 rounded-xl" style={{ background: "var(--tenant-gradient-primary)" }}>
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="text-base font-semibold">Setup Autopay</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex-col gap-3 py-6 rounded-2xl border-2 hover-elevate active-elevate-2"
              style={{
                borderColor: "hsl(var(--tenant-card-border))",
                color: "hsl(var(--tenant-foreground))",
              }}
              data-testid="button-split-rent"
            >
              <div className="p-3 rounded-xl" style={{ background: "var(--tenant-gradient-success)" }}>
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <span className="text-base font-semibold">Split Rent</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
