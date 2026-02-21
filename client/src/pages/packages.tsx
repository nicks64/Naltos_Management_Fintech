import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const agentInsights = [
  { text: "34 packages received today, 12% above daily average", severity: "positive" as const },
  { text: "7 packages unclaimed for 3+ days", severity: "warning" as const },
  { text: "Smart locker availability at 22% - consider expansion", severity: "critical" as const },
];

const kpiCards = [
  { title: "Today's Packages", value: "34", change: "+12% vs avg", trend: "positive", icon: Package },
  { title: "Awaiting Pickup", value: "48", change: "Across all units", trend: "neutral", icon: PackageOpen },
  { title: "Unclaimed (>3 days)", value: "7", change: "+2 this week", trend: "warning", icon: PackageX },
  { title: "Locker Utilization", value: "78%", change: "32 of 41 occupied", trend: "neutral", icon: Lock },
];

const packageLog = [
  { tracking: "1Z999AA10123456784", carrier: "UPS", recipient: "Sarah Chen", unit: "4B", received: "Feb 21, 10:15 AM", status: "Received", loggedBy: "Front Desk" },
  { tracking: "9400111899223100001", carrier: "USPS", recipient: "James Wilson", unit: "2A", received: "Feb 21, 9:30 AM", status: "Notified", loggedBy: "Concierge" },
  { tracking: "794644790280", carrier: "FedEx", recipient: "Maria Santos", unit: "6C", received: "Feb 21, 8:45 AM", status: "Picked Up", loggedBy: "Front Desk" },
  { tracking: "TBA302948571000", carrier: "Amazon", recipient: "Robert Kim", unit: "8A", received: "Feb 20, 4:20 PM", status: "Notified", loggedBy: "Concierge" },
  { tracking: "4208205591000", carrier: "DHL", recipient: "Emily Davis", unit: "5D", received: "Feb 20, 2:10 PM", status: "Received", loggedBy: "Front Desk" },
  { tracking: "1Z999BB20234567891", carrier: "UPS", recipient: "Michael Brown", unit: "3C", received: "Feb 20, 11:00 AM", status: "Picked Up", loggedBy: "Concierge" },
  { tracking: "TBA302948571001", carrier: "Amazon", recipient: "Lisa Wang", unit: "5A", received: "Feb 19, 3:30 PM", status: "Notified", loggedBy: "Front Desk" },
  { tracking: "794644790281", carrier: "FedEx", recipient: "David Park", unit: "7A", received: "Feb 18, 1:15 PM", status: "Returned", loggedBy: "Front Desk" },
];

const awaitingPickup = [
  { tracking: "9400111899223100001", recipient: "James Wilson", unit: "2A", carrier: "USPS", daysWaiting: 1, notifications: 2, locker: "L-12" },
  { tracking: "TBA302948571000", recipient: "Robert Kim", unit: "8A", carrier: "Amazon", daysWaiting: 1, notifications: 1, locker: "L-08" },
  { tracking: "4208205591000", recipient: "Emily Davis", unit: "5D", carrier: "DHL", daysWaiting: 1, notifications: 1, locker: null },
  { tracking: "TBA302948571001", recipient: "Lisa Wang", unit: "5A", carrier: "Amazon", daysWaiting: 2, notifications: 3, locker: "L-22" },
  { tracking: "1Z999CC30345678902", recipient: "Tom Harris", unit: "7B", carrier: "UPS", daysWaiting: 3, notifications: 4, locker: null },
  { tracking: "9400111899223100002", recipient: "Amanda Lopez", unit: "1D", carrier: "USPS", daysWaiting: 4, notifications: 5, locker: "L-31" },
  { tracking: "794644790282", recipient: "Kevin Nguyen", unit: "9A", carrier: "FedEx", daysWaiting: 5, notifications: 6, locker: null },
  { tracking: "TBA302948571002", recipient: "Rachel Green", unit: "2C", carrier: "Amazon", daysWaiting: 6, notifications: 7, locker: "L-15" },
];

const lockerStatus = [
  { locker: "L-01", size: "S", status: "Available", package: null, duration: null },
  { locker: "L-02", size: "S", status: "Occupied", package: "TBA302948571003", duration: "2 days" },
  { locker: "L-03", size: "M", status: "Occupied", package: "1Z999DD40456789013", duration: "1 day" },
  { locker: "L-04", size: "M", status: "Available", package: null, duration: null },
  { locker: "L-05", size: "L", status: "Occupied", package: "794644790283", duration: "3 days" },
  { locker: "L-06", size: "L", status: "Reserved", package: null, duration: null },
  { locker: "L-07", size: "XL", status: "Occupied", package: "TBA302948571004", duration: "1 day" },
  { locker: "L-08", size: "M", status: "Occupied", package: "TBA302948571000", duration: "1 day" },
  { locker: "L-09", size: "S", status: "Maintenance", package: null, duration: null },
  { locker: "L-10", size: "XL", status: "Available", package: null, duration: null },
];

const carrierSummary = [
  { carrier: "Amazon", volume: 14, avgPickupTime: "1.2 days", oversized: 3, weeklyTrend: "+8%" },
  { carrier: "UPS", volume: 8, avgPickupTime: "1.5 days", oversized: 1, weeklyTrend: "+2%" },
  { carrier: "FedEx", volume: 6, avgPickupTime: "1.8 days", oversized: 2, weeklyTrend: "-5%" },
  { carrier: "USPS", volume: 4, avgPickupTime: "2.1 days", oversized: 0, weeklyTrend: "+12%" },
  { carrier: "DHL", volume: 2, avgPickupTime: "1.4 days", oversized: 1, weeklyTrend: "0%" },
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

export default function Packages() {
  const [carrierFilter, setCarrierFilter] = useState("all");

  const filteredLog = packageLog.filter((p) => {
    if (carrierFilter !== "all" && p.carrier !== carrierFilter) return false;
    return true;
  });

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

          <Card data-testid="card-package-log">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Tracking #</th>
                      <th className="p-3 font-medium text-muted-foreground">Carrier</th>
                      <th className="p-3 font-medium text-muted-foreground">Recipient</th>
                      <th className="p-3 font-medium text-muted-foreground">Unit</th>
                      <th className="p-3 font-medium text-muted-foreground">Received</th>
                      <th className="p-3 font-medium text-muted-foreground">Status</th>
                      <th className="p-3 font-medium text-muted-foreground">Logged By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLog.map((pkg, idx) => (
                      <tr key={pkg.tracking} className="border-b last:border-0 hover-elevate" data-testid={`row-package-${idx}`}>
                        <td className="p-3 font-mono text-xs">{pkg.tracking.substring(0, 12)}...</td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-xs" data-testid={`badge-carrier-${idx}`}>
                            <Truck className="w-3 h-3 mr-1" />
                            {pkg.carrier}
                          </Badge>
                        </td>
                        <td className="p-3">{pkg.recipient}</td>
                        <td className="p-3 font-medium">{pkg.unit}</td>
                        <td className="p-3 text-muted-foreground text-xs">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {pkg.received}
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant={statusVariant[pkg.status]} className="text-xs" data-testid={`badge-package-status-${idx}`}>
                            {pkg.status === "Picked Up" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {pkg.status === "Returned" && <XCircle className="w-3 h-3 mr-1" />}
                            {pkg.status === "Notified" && <Bell className="w-3 h-3 mr-1" />}
                            {pkg.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground text-xs">{pkg.loggedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="awaiting" className="space-y-4">
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
                      <th className="p-3 font-medium text-muted-foreground">Recipient</th>
                      <th className="p-3 font-medium text-muted-foreground">Unit</th>
                      <th className="p-3 font-medium text-muted-foreground">Carrier</th>
                      <th className="p-3 font-medium text-muted-foreground">Days Waiting</th>
                      <th className="p-3 font-medium text-muted-foreground">Notifications</th>
                      <th className="p-3 font-medium text-muted-foreground">Locker #</th>
                    </tr>
                  </thead>
                  <tbody>
                    {awaitingPickup.map((pkg, idx) => (
                      <tr key={pkg.tracking} className="border-b last:border-0 hover-elevate" data-testid={`row-awaiting-${idx}`}>
                        <td className="p-3">{pkg.recipient}</td>
                        <td className="p-3 font-medium">{pkg.unit}</td>
                        <td className="p-3 text-muted-foreground">{pkg.carrier}</td>
                        <td className="p-3">
                          <span className={pkg.daysWaiting >= 3 ? "text-red-600 dark:text-red-400 font-medium" : "text-muted-foreground"}>
                            {pkg.daysWaiting} {pkg.daysWaiting === 1 ? "day" : "days"}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <Bell className="w-3.5 h-3.5 text-muted-foreground" />
                            <span data-testid={`text-notifications-${idx}`}>{pkg.notifications}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          {pkg.locker ? (
                            <Badge variant="outline" className="text-xs font-mono" data-testid={`badge-locker-${idx}`}>
                              <Lock className="w-3 h-3 mr-1" />
                              {pkg.locker}
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
        </TabsContent>

        <TabsContent value="lockers" className="space-y-4">
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
                  <div key={locker.locker} className="p-3 border rounded-lg space-y-2" data-testid={`card-locker-${idx}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-sm font-semibold">{locker.locker}</span>
                      <Badge variant={lockerStatusVariant[locker.status]} className="text-[10px]" data-testid={`badge-locker-status-${idx}`}>
                        {locker.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <span>Size: {locker.size}</span>
                    </div>
                    {locker.package && (
                      <div className="text-xs font-mono text-muted-foreground truncate" data-testid={`text-locker-package-${idx}`}>
                        {locker.package.substring(0, 12)}...
                      </div>
                    )}
                    {locker.duration && (
                      <div className="text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {locker.duration}
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
        </TabsContent>

        <TabsContent value="carriers" className="space-y-4">
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
                      <th className="p-3 font-medium text-muted-foreground">Volume</th>
                      <th className="p-3 font-medium text-muted-foreground">Avg Pickup Time</th>
                      <th className="p-3 font-medium text-muted-foreground">Oversized</th>
                      <th className="p-3 font-medium text-muted-foreground">Weekly Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carrierSummary.map((carrier, idx) => (
                      <tr key={carrier.carrier} className="border-b last:border-0 hover-elevate" data-testid={`row-carrier-${idx}`}>
                        <td className="p-3 font-medium">
                          <div className="flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-muted-foreground" />
                            {carrier.carrier}
                          </div>
                        </td>
                        <td className="p-3 font-mono" data-testid={`text-carrier-volume-${idx}`}>{carrier.volume}</td>
                        <td className="p-3 text-muted-foreground">{carrier.avgPickupTime}</td>
                        <td className="p-3 font-mono">{carrier.oversized}</td>
                        <td className="p-3">
                          <span className={carrier.weeklyTrend.startsWith("+") ? "text-emerald-600" : carrier.weeklyTrend.startsWith("-") ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}>
                            {carrier.weeklyTrend}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
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
