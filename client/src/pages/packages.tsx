import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AINudgeCard, AgentInsightStrip } from "@/components/ai-nudge-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Package,
  PackageCheck,
  PackageX,
  PackageOpen,
  Clock,
  Bell,
  Brain,
  AlertTriangle,
  Target,
  Filter,
  CheckCircle2,
  XCircle,
  Truck,
  Lock,
  Unlock,
  Wrench,
  BarChart3,
  TrendingUp,
  Activity,
  type LucideIcon,
} from "lucide-react";
import type {
  PackageLogEntry,
  PackageAwaitingPickupEntry,
  PackageLockerStatusEntry,
  PackageCarrierSummaryEntry,
} from "@shared/schema";

const agentInsights = [
  { text: "34 packages received today, 12% above daily average", severity: "positive" as const },
  { text: "7 packages unclaimed for 3+ days", severity: "warning" as const },
  { text: "Smart locker availability at 22% - consider expansion", severity: "critical" as const },
];

const unclaimed = [
  { tracking: "1Z999CC30345678902", recipient: "Tom Harris", unit: "7B", carrier: "UPS", daysUnclaimed: 3, notifications: 4, returnBy: "Feb 28", escalation: "Final Notice" },
  { tracking: "9400111899223100002", recipient: "Amanda Lopez", unit: "1D", carrier: "USPS", daysUnclaimed: 4, notifications: 5, returnBy: "Feb 27", escalation: "Final Notice" },
  { tracking: "794644790282", recipient: "Kevin Nguyen", unit: "9A", carrier: "FedEx", daysUnclaimed: 5, notifications: 6, returnBy: "Feb 26", escalation: "Return Scheduled" },
  { tracking: "TBA302948571002", recipient: "Rachel Green", unit: "2C", carrier: "Amazon", daysUnclaimed: 6, notifications: 7, returnBy: "Feb 25", escalation: "Return Scheduled" },
  { tracking: "1Z999EE50567890124", recipient: "Steve Adams", unit: "4A", carrier: "UPS", daysUnclaimed: 4, notifications: 5, returnBy: "Feb 27", escalation: "Final Notice" },
  { tracking: "TBA302948571005", recipient: "Diana Ross", unit: "6B", carrier: "Amazon", daysUnclaimed: 3, notifications: 3, returnBy: "Feb 28", escalation: "Warning Sent" },
  { tracking: "794644790284", recipient: "Frank Miller", unit: "8C", carrier: "FedEx", daysUnclaimed: 7, notifications: 8, returnBy: "Feb 24", escalation: "Returning Today" },
];

const statusVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  Received: "outline",
  Notified: "default",
  "Picked Up": "secondary",
  Returned: "destructive",
};

const lockerStatusVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  Available: "secondary",
  Occupied: "default",
  Reserved: "outline",
  Maintenance: "destructive",
};

const escalationVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  "Warning Sent": "outline",
  "Final Notice": "default",
  "Return Scheduled": "destructive",
  "Returning Today": "destructive",
};

function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="p-3 space-y-3" data-testid="skeleton-table">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3" data-testid="skeleton-kpi">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-1 pt-3 px-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <Skeleton className="h-6 w-16 mb-1" />
            <Skeleton className="h-3 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <Card data-testid="error-state">
      <CardContent className="p-6 text-center">
        <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
        <p className="text-sm text-destructive font-medium">{message}</p>
        <p className="text-xs text-muted-foreground mt-1">Please try refreshing the page</p>
      </CardContent>
    </Card>
  );
}

export default function Packages() {
  const [carrierFilter, setCarrierFilter] = useState("all");

  const { data: logData, isLoading: logLoading, isError: logError } = useQuery<PackageLogEntry[]>({
    queryKey: ['/api/packages/log'],
  });

  const { data: awaitingData, isLoading: awaitingLoading, isError: awaitingError } = useQuery<PackageAwaitingPickupEntry[]>({
    queryKey: ['/api/packages/awaiting'],
  });

  const { data: lockerData, isLoading: lockerLoading, isError: lockerError } = useQuery<PackageLockerStatusEntry[]>({
    queryKey: ['/api/packages/lockers'],
  });

  const { data: carrierData, isLoading: carrierLoading, isError: carrierError } = useQuery<PackageCarrierSummaryEntry[]>({
    queryKey: ['/api/packages/carriers'],
  });

  const packageLogEntries = logData ?? [];
  const awaitingPickup = awaitingData ?? [];
  const lockerStatus = lockerData ?? [];
  const carrierSummary = carrierData ?? [];

  const kpiCards = useMemo(() => {
    const todayCount = packageLogEntries.filter((p) => p.received?.includes("Feb 21")).length;
    const awaitingCount = awaitingPickup.length;
    const occupiedLockers = lockerStatus.filter((l) => l.status === "Occupied").length;
    const totalLockers = lockerStatus.length;
    const utilization = totalLockers > 0 ? Math.round((occupiedLockers / totalLockers) * 100) : 0;

    return [
      { title: "Today's Packages", value: String(todayCount), change: `${todayCount} received today`, trend: "positive" as string, icon: Package },
      { title: "Awaiting Pickup", value: String(awaitingCount), change: "Across all units", trend: awaitingCount > 5 ? "warning" : "neutral" as string, icon: PackageOpen },
      { title: "Locker Utilization", value: `${utilization}%`, change: `${occupiedLockers} of ${totalLockers} occupied`, trend: utilization > 80 ? "warning" : "neutral" as string, icon: Lock },
      { title: "Avg Pickup Time", value: "4.2 hrs", change: "Below target", trend: "positive" as string, icon: Clock },
    ];
  }, [packageLogEntries, awaitingPickup, lockerStatus]);

  const filteredLog = packageLogEntries.filter((p) => {
    if (carrierFilter !== "all" && p.carrier !== carrierFilter) return false;
    return true;
  });

  const isKpiLoading = logLoading || awaitingLoading || lockerLoading;

  return (
    <div className="space-y-6" data-testid="page-packages">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-page-title">Package & Delivery Management</h1>
          <p className="text-muted-foreground">Package logging, smart locker integration, and carrier tracking</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs" data-testid="badge-agent-status">
            <Brain className="w-3 h-3 mr-1 text-primary" />
            Agent Active
          </Badge>
          <Button size="sm" data-testid="button-log-package">
            <Package className="w-3 h-3 mr-1" />
            Log Package
          </Button>
        </div>
      </div>

      <AgentInsightStrip insights={agentInsights} />

      <AINudgeCard
        title="Unclaimed Package Alert"
        insight="7 packages have been unclaimed for 3+ days. 2 packages are approaching the carrier return threshold and will be sent back within 48 hours if not collected. Consider sending final SMS/email reminders to affected tenants."
        confidence={0.95}
        severity="warning"
        icon={AlertTriangle}
        actionLabel="Send Reminders"
        onAction={() => {}}
        secondaryLabel="View Details"
        onSecondary={() => {}}
        metric="7 packages"
        metricLabel="Unclaimed"
      />

      {isKpiLoading ? (
        <KpiSkeleton />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {kpiCards.map((card, index) => (
            <Card key={card.title} className="hover-elevate" data-testid={`card-kpi-${index}`}>
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-1 pt-3 px-3">
                <CardTitle className="text-xs font-medium text-muted-foreground">{card.title}</CardTitle>
                <card.icon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="text-xl font-mono tabular-nums font-semibold" data-testid={`text-kpi-value-${index}`}>{card.value}</div>
                <div className="flex items-center gap-1 text-xs mt-0.5">
                  {card.trend === "positive" ? (
                    <TrendingUp className="w-3 h-3 text-emerald-600" />
                  ) : card.trend === "warning" ? (
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                  ) : (
                    <Activity className="w-3 h-3 text-muted-foreground" />
                  )}
                  <span className={card.trend === "positive" ? "text-emerald-600" : card.trend === "warning" ? "text-amber-600" : "text-muted-foreground"}>{card.change}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Tabs defaultValue="log" className="space-y-4">
        <TabsList data-testid="tabs-packages">
          <TabsTrigger value="log" data-testid="tab-log">Package Log</TabsTrigger>
          <TabsTrigger value="awaiting" data-testid="tab-awaiting">Awaiting Pickup</TabsTrigger>
          <TabsTrigger value="lockers" data-testid="tab-lockers">Locker Status</TabsTrigger>
          <TabsTrigger value="carriers" data-testid="tab-carriers">Carrier Summary</TabsTrigger>
          <TabsTrigger value="unclaimed" data-testid="tab-unclaimed">Unclaimed</TabsTrigger>
        </TabsList>

        <TabsContent value="log" className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filter:</span>
            </div>
            <Select value={carrierFilter} onValueChange={setCarrierFilter}>
              <SelectTrigger className="w-[160px]" data-testid="select-carrier-filter">
                <SelectValue placeholder="Carrier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Carriers</SelectItem>
                <SelectItem value="UPS">UPS</SelectItem>
                <SelectItem value="FedEx">FedEx</SelectItem>
                <SelectItem value="USPS">USPS</SelectItem>
                <SelectItem value="Amazon">Amazon</SelectItem>
                <SelectItem value="DHL">DHL</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="secondary" className="text-xs" data-testid="badge-filtered-count">
              {filteredLog.length} packages
            </Badge>
          </div>

          {logError ? (
            <ErrorState message="Failed to load package log" />
          ) : logLoading ? (
            <Card data-testid="card-package-log">
              <CardContent className="p-0">
                <TableSkeleton rows={6} cols={7} />
              </CardContent>
            </Card>
          ) : (
            <Card data-testid="card-package-log">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="p-3 font-medium text-muted-foreground">Tracking #</th>
                        <th className="p-3 font-medium text-muted-foreground">Carrier</th>
                        <th className="p-3 font-medium text-muted-foreground">Resident</th>
                        <th className="p-3 font-medium text-muted-foreground">Unit</th>
                        <th className="p-3 font-medium text-muted-foreground">Received</th>
                        <th className="p-3 font-medium text-muted-foreground">Status</th>
                        <th className="p-3 font-medium text-muted-foreground">Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLog.map((pkg, idx) => (
                        <tr key={pkg.id} className="border-b last:border-0 hover-elevate" data-testid={`row-package-${idx}`}>
                          <td className="p-3 font-mono text-xs">{pkg.tracking ? `${pkg.tracking.substring(0, 12)}...` : "—"}</td>
                          <td className="p-3">
                            <Badge variant="outline" className="text-xs" data-testid={`badge-carrier-${idx}`}>
                              <Truck className="w-3 h-3 mr-1" />
                              {pkg.carrier}
                            </Badge>
                          </td>
                          <td className="p-3">{pkg.resident}</td>
                          <td className="p-3 font-medium">{pkg.unit}</td>
                          <td className="p-3 text-muted-foreground text-xs">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              {pkg.received}
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge variant={statusVariant[pkg.status ?? ""] ?? "outline"} className="text-xs" data-testid={`badge-package-status-${idx}`}>
                              {pkg.status === "Picked Up" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                              {pkg.status === "Returned" && <XCircle className="w-3 h-3 mr-1" />}
                              {pkg.status === "Notified" && <Bell className="w-3 h-3 mr-1" />}
                              {pkg.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-muted-foreground text-xs">{pkg.location}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="awaiting" className="space-y-4">
          {awaitingError ? (
            <ErrorState message="Failed to load awaiting pickup data" />
          ) : awaitingLoading ? (
            <Card data-testid="card-awaiting-pickup">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <PackageOpen className="w-5 h-5 text-primary" />
                  <CardTitle>Awaiting Pickup</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <TableSkeleton rows={6} cols={6} />
              </CardContent>
            </Card>
          ) : (
            <Card data-testid="card-awaiting-pickup">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <PackageOpen className="w-5 h-5 text-primary" />
                  <CardTitle>Awaiting Pickup</CardTitle>
                  <Badge variant="secondary" className="text-xs">{awaitingPickup.length} packages</Badge>
                </div>
                <CardDescription>Packages waiting for tenant collection with notification tracking</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="p-3 font-medium text-muted-foreground">Resident</th>
                        <th className="p-3 font-medium text-muted-foreground">Unit</th>
                        <th className="p-3 font-medium text-muted-foreground">Carrier</th>
                        <th className="p-3 font-medium text-muted-foreground">Days Held</th>
                        <th className="p-3 font-medium text-muted-foreground">Notifications</th>
                        <th className="p-3 font-medium text-muted-foreground">Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {awaitingPickup.map((pkg, idx) => (
                        <tr key={pkg.id} className="border-b last:border-0 hover-elevate" data-testid={`row-awaiting-${idx}`}>
                          <td className="p-3">{pkg.resident}</td>
                          <td className="p-3 font-medium">{pkg.unit}</td>
                          <td className="p-3 text-muted-foreground">{pkg.carrier}</td>
                          <td className="p-3">
                            <span className={(pkg.daysHeld ?? 0) >= 3 ? "text-red-600 dark:text-red-400 font-medium" : "text-muted-foreground"}>
                              {pkg.daysHeld} {(pkg.daysHeld ?? 0) === 1 ? "day" : "days"}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              <Bell className="w-3.5 h-3.5 text-muted-foreground" />
                              <span data-testid={`text-notifications-${idx}`}>{pkg.notified}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            {pkg.location ? (
                              <Badge variant="outline" className="text-xs font-mono" data-testid={`badge-locker-${idx}`}>
                                <Lock className="w-3 h-3 mr-1" />
                                {pkg.location}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">Front Desk</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="lockers" className="space-y-4">
          {lockerError ? (
            <ErrorState message="Failed to load locker status" />
          ) : lockerLoading ? (
            <Card data-testid="card-locker-status">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Lock className="w-5 h-5 text-primary" />
                  <CardTitle>Smart Locker Grid</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 rounded-lg" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card data-testid="card-locker-status">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Lock className="w-5 h-5 text-primary" />
                  <CardTitle>Smart Locker Grid</CardTitle>
                  <Badge variant="secondary" className="text-xs">{lockerStatus.length} lockers</Badge>
                </div>
                <CardDescription>Real-time status of smart package lockers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {lockerStatus.map((locker, idx) => (
                    <div key={locker.id} className="p-3 border rounded-lg space-y-2" data-testid={`card-locker-${idx}`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-sm font-semibold">{locker.locker}</span>
                        <Badge variant={lockerStatusVariant[locker.status ?? ""] ?? "outline"} className="text-[10px]" data-testid={`badge-locker-status-${idx}`}>
                          {locker.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <span>Size: {locker.size}</span>
                      </div>
                      {locker.code && (
                        <div className="text-xs font-mono text-muted-foreground truncate" data-testid={`text-locker-package-${idx}`}>
                          Code: {locker.code}
                        </div>
                      )}
                      {locker.loaded && (
                        <div className="text-xs text-muted-foreground">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {locker.loaded}
                        </div>
                      )}
                      {locker.status === "Available" && (
                        <div className="flex items-center gap-1 text-xs text-emerald-600">
                          <Unlock className="w-3 h-3" />
                          Ready
                        </div>
                      )}
                      {locker.status === "Maintenance" && (
                        <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                          <Wrench className="w-3 h-3" />
                          Service needed
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="carriers" className="space-y-4">
          {carrierError ? (
            <ErrorState message="Failed to load carrier summary" />
          ) : carrierLoading ? (
            <Card data-testid="card-carrier-summary">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <CardTitle>Carrier Summary</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <TableSkeleton rows={5} cols={5} />
              </CardContent>
            </Card>
          ) : (
            <Card data-testid="card-carrier-summary">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <CardTitle>Carrier Summary</CardTitle>
                  <Badge variant="secondary" className="text-xs">This Week</Badge>
                </div>
                <CardDescription>Weekly breakdown by carrier with volume and pickup metrics</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="p-3 font-medium text-muted-foreground">Carrier</th>
                        <th className="p-3 font-medium text-muted-foreground">Deliveries</th>
                        <th className="p-3 font-medium text-muted-foreground">Avg Per Day</th>
                        <th className="p-3 font-medium text-muted-foreground">Issues</th>
                        <th className="p-3 font-medium text-muted-foreground">Rating</th>
                        <th className="p-3 font-medium text-muted-foreground">Last Delivery</th>
                      </tr>
                    </thead>
                    <tbody>
                      {carrierSummary.map((carrier, idx) => (
                        <tr key={carrier.id} className="border-b last:border-0 hover-elevate" data-testid={`row-carrier-${idx}`}>
                          <td className="p-3 font-medium">
                            <div className="flex items-center gap-1.5">
                              <Truck className="w-3.5 h-3.5 text-muted-foreground" />
                              {carrier.carrier}
                            </div>
                          </td>
                          <td className="p-3 font-mono" data-testid={`text-carrier-volume-${idx}`}>{carrier.deliveries}</td>
                          <td className="p-3 text-muted-foreground">{carrier.avgPerDay}</td>
                          <td className="p-3 font-mono">{carrier.issues}</td>
                          <td className="p-3 text-muted-foreground">{carrier.rating}</td>
                          <td className="p-3 text-muted-foreground text-xs">{carrier.lastDelivery}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="unclaimed" className="space-y-4">
          <Card data-testid="card-unclaimed">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <PackageX className="w-5 h-5 text-primary" />
                <CardTitle>Unclaimed Packages</CardTitle>
                <Badge variant="destructive" className="text-xs">{unclaimed.length} overdue</Badge>
              </div>
              <CardDescription>Packages past the 3-day pickup window requiring escalation</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Recipient</th>
                      <th className="p-3 font-medium text-muted-foreground">Unit</th>
                      <th className="p-3 font-medium text-muted-foreground">Carrier</th>
                      <th className="p-3 font-medium text-muted-foreground">Days Unclaimed</th>
                      <th className="p-3 font-medium text-muted-foreground">Return By</th>
                      <th className="p-3 font-medium text-muted-foreground">Escalation</th>
                      <th className="p-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unclaimed.map((pkg, idx) => (
                      <tr key={pkg.tracking} className="border-b last:border-0 hover-elevate" data-testid={`row-unclaimed-${idx}`}>
                        <td className="p-3">{pkg.recipient}</td>
                        <td className="p-3 font-medium">{pkg.unit}</td>
                        <td className="p-3 text-muted-foreground">{pkg.carrier}</td>
                        <td className="p-3">
                          <span className="text-red-600 dark:text-red-400 font-medium">{pkg.daysUnclaimed} days</span>
                        </td>
                        <td className="p-3 text-muted-foreground">{pkg.returnBy}</td>
                        <td className="p-3">
                          <Badge variant={escalationVariant[pkg.escalation]} className="text-xs" data-testid={`badge-escalation-${idx}`}>
                            {pkg.escalation}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Button variant="outline" size="sm" data-testid={`button-remind-${idx}`}>
                            <Bell className="w-3 h-3 mr-1" />
                            Remind
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
