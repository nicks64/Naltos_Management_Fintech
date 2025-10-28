import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CreditCard, Calendar, DollarSign, CheckCircle2, Clock, AlertCircle, Smartphone } from "lucide-react";
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
        <div className="flex items-center gap-2">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="page-tenant-home">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight mb-2">Home</h1>
        <p className="text-muted-foreground">
          Manage your rent and payments
        </p>
      </div>

      {/* Upcoming Rent Card */}
      {rentInfo?.upcomingRent && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Rent Due</CardTitle>
                  <CardDescription className="mt-1">
                    {rentInfo.upcomingRent.unit} • Due {format(parseISO(rentInfo.upcomingRent.dueDate), "MMM d, yyyy")}
                  </CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="text-lg font-mono px-4 py-2">
                ${rentInfo.upcomingRent.amount.toLocaleString()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button 
                className="flex-1" 
                size="lg"
                onClick={handleQuickPay}
                disabled={payRentMutation.isPending}
                data-testid="button-pay-now"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {payRentMutation.isPending ? "Processing..." : "Pay Now"}
              </Button>
              <Button variant="outline" size="lg" data-testid="button-pay-by-text">
                <Smartphone className="mr-2 h-4 w-4" />
                Pay by Text
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Payments via ACH, debit card, or Apple Pay
            </p>
          </CardContent>
        </Card>
      )}

      {/* Past Due Alert */}
      {rentInfo?.pastDueRent && (
        <Card className="border-2 border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Past Due Amount</h3>
                <p className="text-muted-foreground">
                  ${rentInfo.pastDueRent.amount.toLocaleString()} • {rentInfo.pastDueRent.daysOverdue} days overdue
                </p>
              </div>
              <Button variant="destructive" data-testid="button-pay-past-due">
                Pay ${rentInfo.pastDueRent.amount.toLocaleString()}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <CardTitle>Recent Payments</CardTitle>
          </div>
          <CardDescription>
            Your payment history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rentInfo?.recentPayments && rentInfo.recentPayments.length > 0 ? (
            <div className="space-y-3">
              {rentInfo.recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover-elevate"
                  data-testid={`payment-history-${payment.id}`}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">${payment.amount.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(parseISO(payment.date), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">{payment.status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No payment history yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-auto flex-col gap-2 py-4" data-testid="button-setup-autopay">
              <Calendar className="w-6 h-6" />
              <span className="text-sm">Setup Autopay</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4" data-testid="button-split-rent">
              <DollarSign className="w-6 h-6" />
              <span className="text-sm">Split Rent</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
