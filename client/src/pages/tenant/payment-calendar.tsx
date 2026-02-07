import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  DollarSign,
  Gift,
  Users,
  Calendar,
  CreditCard,
  Flame,
  TrendingUp,
  Check,
} from "lucide-react";
import { format, parseISO } from "date-fns";

interface PaymentCalendarData {
  events: Array<{
    id: string;
    type: "rent" | "cashback" | "split";
    title: string;
    amount: number;
    date: string;
    status: string;
    autopay: boolean;
    paymentMethod: string | null;
  }>;
  autopaySettings: {
    enabled: boolean;
    paymentMethod: string;
    scheduledDay: number;
    amount: number;
    nextPayment: string;
  };
  upcomingTotal: number;
  streakMonths: number;
  projectedCashback: number;
}

function getEventIcon(type: "rent" | "cashback" | "split") {
  switch (type) {
    case "rent":
      return DollarSign;
    case "cashback":
      return Gift;
    case "split":
      return Users;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "paid":
      return <Badge variant="default" data-testid={`badge-status-${status}`}>Paid</Badge>;
    case "due_soon":
      return <Badge variant="secondary" data-testid={`badge-status-${status}`}>Due Soon</Badge>;
    case "upcoming":
      return <Badge variant="outline" data-testid={`badge-status-${status}`}>Upcoming</Badge>;
    case "credited":
      return <Badge variant="default" data-testid={`badge-status-${status}`}>Credited</Badge>;
    case "projected":
      return <Badge variant="secondary" data-testid={`badge-status-${status}`}>Projected</Badge>;
    case "received":
      return <Badge variant="default" data-testid={`badge-status-${status}`}>Received</Badge>;
    default:
      return <Badge variant="outline" data-testid={`badge-status-${status}`}>{status}</Badge>;
  }
}

function getIconBg(type: "rent" | "cashback" | "split") {
  switch (type) {
    case "rent":
      return "hsl(var(--tenant-primary) / 0.1)";
    case "cashback":
      return "hsl(var(--tenant-success) / 0.1)";
    case "split":
      return "hsl(var(--tenant-primary) / 0.1)";
  }
}

function getIconColor(type: "rent" | "cashback" | "split") {
  switch (type) {
    case "rent":
      return "hsl(var(--tenant-primary))";
    case "cashback":
      return "hsl(var(--tenant-success))";
    case "split":
      return "hsl(var(--tenant-primary))";
  }
}

export default function TenantPaymentCalendar() {
  const { toast } = useToast();

  const { data, isLoading } = useQuery<PaymentCalendarData>({
    queryKey: ["/api/tenant/payment-calendar"],
  });

  const autopayMutation = useMutation({
    mutationFn: (enabled: boolean) =>
      apiRequest("POST", "/api/tenant/autopay", { enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenant/payment-calendar"] });
      toast({
        title: "Autopay Updated",
        description: data?.autopaySettings?.enabled
          ? "Autopay has been disabled"
          : "Autopay has been enabled",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update autopay settings",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="page-payment-calendar-loading">
        <div>
          <Skeleton className="h-8 w-56 mb-2" style={{ backgroundColor: "hsl(var(--tenant-muted))" }} />
          <Skeleton className="h-5 w-80" style={{ backgroundColor: "hsl(var(--tenant-muted))" }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" style={{ backgroundColor: "hsl(var(--tenant-muted))" }} />
          <Skeleton className="h-32" style={{ backgroundColor: "hsl(var(--tenant-muted))" }} />
          <Skeleton className="h-32" style={{ backgroundColor: "hsl(var(--tenant-muted))" }} />
        </div>
        <Skeleton className="h-48" style={{ backgroundColor: "hsl(var(--tenant-muted))" }} />
        <Skeleton className="h-64" style={{ backgroundColor: "hsl(var(--tenant-muted))" }} />
      </div>
    );
  }

  const sortedEvents = data?.events
    ? [...data.events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : [];

  const nextRentEvent = sortedEvents.find(
    (e) => e.type === "rent" && (e.status === "upcoming" || e.status === "due_soon")
  );

  return (
    <div className="space-y-6" data-testid="page-payment-calendar">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ color: "hsl(var(--tenant-foreground))" }}>
          Payment Schedule
        </h1>
        <p className="text-base" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
          Track upcoming payments and manage autopay
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className="border"
          style={{
            backgroundColor: "hsl(var(--tenant-card))",
            borderColor: "hsl(var(--tenant-card-border))",
            borderRadius: "var(--tenant-radius-lg)",
            boxShadow: "var(--tenant-shadow-md)",
          }}
        >
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5" style={{ color: "hsl(var(--tenant-primary))" }} />
              <p className="text-sm font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>
                Next Payment
              </p>
            </div>
            <p className="text-3xl font-bold tabular-nums" data-testid="text-next-payment-amount" style={{ color: "hsl(var(--tenant-foreground))" }}>
              ${(nextRentEvent?.amount ?? data?.autopaySettings?.amount ?? 0).toLocaleString()}
            </p>
            <p className="text-sm mt-1" data-testid="text-next-payment-date" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
              {nextRentEvent?.date
                ? format(parseISO(nextRentEvent.date), "MMM d, yyyy")
                : data?.autopaySettings?.nextPayment
                  ? format(parseISO(data.autopaySettings.nextPayment), "MMM d, yyyy")
                  : "No upcoming payment"}
            </p>
          </CardContent>
        </Card>

        <Card
          className="border"
          style={{
            backgroundColor: "hsl(var(--tenant-card))",
            borderColor: "hsl(var(--tenant-card-border))",
            borderRadius: "var(--tenant-radius-lg)",
            boxShadow: "var(--tenant-shadow-md)",
          }}
        >
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-5 h-5" style={{ color: "hsl(var(--tenant-success))" }} />
              <p className="text-sm font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>
                Payment Streak
              </p>
            </div>
            <p className="text-3xl font-bold tabular-nums" data-testid="text-streak-months" style={{ color: "hsl(var(--tenant-success))" }}>
              {data?.streakMonths ?? 0}
            </p>
            <p className="text-sm mt-1" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
              consecutive months on time
            </p>
          </CardContent>
        </Card>

        <Card
          className="border"
          style={{
            backgroundColor: "hsl(var(--tenant-card))",
            borderColor: "hsl(var(--tenant-card-border))",
            borderRadius: "var(--tenant-radius-lg)",
            boxShadow: "var(--tenant-shadow-md)",
          }}
        >
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5" style={{ color: "hsl(var(--tenant-primary))" }} />
              <p className="text-sm font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>
                Projected Annual Cashback
              </p>
            </div>
            <p className="text-3xl font-bold tabular-nums" data-testid="text-projected-cashback" style={{ color: "hsl(var(--tenant-primary))" }}>
              ${(data?.projectedCashback ?? 0).toFixed(2)}
            </p>
            <p className="text-sm mt-1" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
              based on current streak
            </p>
          </CardContent>
        </Card>
      </div>

      <Card
        className="border"
        style={{
          backgroundColor: "hsl(var(--tenant-card))",
          borderColor: "hsl(var(--tenant-card-border))",
          borderRadius: "var(--tenant-radius-lg)",
          boxShadow: "var(--tenant-shadow-md)",
        }}
      >
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" style={{ color: "hsl(var(--tenant-primary))" }} />
              <CardTitle className="text-lg" style={{ color: "hsl(var(--tenant-foreground))" }}>
                Autopay
              </CardTitle>
            </div>
            <Switch
              checked={data?.autopaySettings?.enabled ?? false}
              onCheckedChange={(checked) => autopayMutation.mutate(checked)}
              disabled={autopayMutation.isPending}
              data-testid="switch-autopay-toggle"
            />
          </div>
          <CardDescription style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
            Automatically pay rent on your scheduled day each month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
              <p className="text-xs font-medium mb-1" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                Payment Method
              </p>
              <p className="text-sm font-semibold" data-testid="text-autopay-method" style={{ color: "hsl(var(--tenant-foreground))" }}>
                {data?.autopaySettings?.paymentMethod ?? "Not set"}
              </p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
              <p className="text-xs font-medium mb-1" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                Scheduled Day
              </p>
              <p className="text-sm font-semibold" data-testid="text-autopay-day" style={{ color: "hsl(var(--tenant-foreground))" }}>
                {data?.autopaySettings?.scheduledDay
                  ? `${data.autopaySettings.scheduledDay}${getOrdinalSuffix(data.autopaySettings.scheduledDay)} of each month`
                  : "Not set"}
              </p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-muted))" }}>
              <p className="text-xs font-medium mb-1" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                Amount
              </p>
              <p className="text-sm font-semibold" data-testid="text-autopay-amount" style={{ color: "hsl(var(--tenant-foreground))" }}>
                ${(data?.autopaySettings?.amount ?? 0).toLocaleString()}
              </p>
            </div>
          </div>
          {data?.autopaySettings?.enabled && (
            <div className="flex items-center gap-2 mt-4 p-3 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-success) / 0.1)" }}>
              <Check className="w-4 h-4" style={{ color: "hsl(var(--tenant-success))" }} />
              <p className="text-sm font-medium" style={{ color: "hsl(var(--tenant-success))" }}>
                Autopay is active — next charge on{" "}
                {data.autopaySettings.nextPayment
                  ? format(parseISO(data.autopaySettings.nextPayment), "MMM d, yyyy")
                  : "your scheduled day"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card
        className="border"
        style={{
          backgroundColor: "hsl(var(--tenant-card))",
          borderColor: "hsl(var(--tenant-card-border))",
          borderRadius: "var(--tenant-radius-lg)",
          boxShadow: "var(--tenant-shadow-md)",
        }}
      >
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" style={{ color: "hsl(var(--tenant-primary))" }} />
            <CardTitle className="text-lg" style={{ color: "hsl(var(--tenant-foreground))" }}>
              Upcoming Events
            </CardTitle>
          </div>
          <CardDescription style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
            Your payment timeline for the coming months
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {sortedEvents.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" style={{ color: "hsl(var(--tenant-muted-foreground))" }} />
              <p className="text-sm" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                No upcoming payment events
              </p>
            </div>
          ) : (
            sortedEvents.map((event) => {
              const Icon = getEventIcon(event.type);
              return (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-4 border rounded-lg"
                  data-testid={`event-${event.id}`}
                  style={{ borderColor: "hsl(var(--tenant-card-border))" }}
                >
                  <div
                    className="p-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getIconBg(event.type) }}
                  >
                    <Icon className="w-4 h-4" style={{ color: getIconColor(event.type) }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>
                      {event.title}
                    </p>
                    <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                      {format(parseISO(event.date), "MMM d, yyyy")}
                      {event.autopay && (
                        <span className="ml-2" style={{ color: "hsl(var(--tenant-success))" }}>
                          Autopay
                        </span>
                      )}
                      {event.paymentMethod && (
                        <span className="ml-2">
                          {event.paymentMethod}
                        </span>
                      )}
                    </p>
                  </div>
                  <p
                    className="font-bold font-mono text-sm flex-shrink-0"
                    data-testid={`text-event-amount-${event.id}`}
                    style={{
                      color: event.type === "cashback"
                        ? "hsl(var(--tenant-success))"
                        : "hsl(var(--tenant-foreground))",
                    }}
                  >
                    {event.type === "cashback" ? "+" : ""}${event.amount.toLocaleString()}
                  </p>
                  <div className="flex-shrink-0">
                    {getStatusBadge(event.status)}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return "th";
  switch (day % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}
