import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AINudgeCard, AgentInsightStrip } from "@/components/ai-nudge-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Key,
  KeyRound,
  CreditCard,
  Lock,
  Unlock,
  Shield,
  ShieldAlert,
  Clock,
  Brain,
  AlertTriangle,
  Filter,
  CheckCircle2,
  XCircle,
  Wifi,
  WifiOff,
  BatteryFull,
  BatteryMedium,
  BatteryLow,
  Smartphone,
  DoorOpen,
  Activity,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

const agentInsights = [
  { text: "Key inventory reconciled - 3 unaccounted copies flagged", severity: "warning" as const },
  { text: "Unit 312: 3 failed access attempts at 2:30 AM", severity: "critical" as const },
  { text: "2 lockout requests pending resolution", severity: "warning" as const },
];

const kpiCards = [
  { title: "Keys Issued", value: "890", change: "Across all types", trend: "neutral", icon: Key },
  { title: "Fobs Active", value: "412", change: "+8 this month", trend: "positive", icon: CreditCard },
  { title: "Smart Locks", value: "186", change: "98% online", trend: "positive", icon: Lock },
  { title: "After-Hours Events", value: "23", change: "+5 this week", trend: "warning", icon: ShieldAlert },
];

const keyInventory = [
  { key: "K-0401", type: "Unit", assignedTo: "Sarah Chen", unit: "4B", copies: 2, deposit: "$50", status: "Active" },
  { key: "K-0402", type: "Mailbox", assignedTo: "Sarah Chen", unit: "4B", copies: 1, deposit: "$25", status: "Active" },
  { key: "K-0201", type: "Storage", assignedTo: "James Wilson", unit: "2A", copies: 1, deposit: "$25", status: "Active" },
  { key: "K-POOL", type: "Pool", assignedTo: "Common Area", unit: "N/A", copies: 12, deposit: "$0", status: "Active" },
  { key: "K-GYM", type: "Gym", assignedTo: "Common Area", unit: "N/A", copies: 8, deposit: "$0", status: "Active" },
  { key: "K-MSTR-01", type: "Master", assignedTo: "Property Manager", unit: "Office", copies: 3, deposit: "$0", status: "Active" },
  { key: "K-EMRG-01", type: "Emergency", assignedTo: "Fire Dept Lockbox", unit: "Lobby", copies: 1, deposit: "$0", status: "Active" },
];

const accessCards = [
  { id: "FOB-1001", tenant: "Sarah Chen", unit: "4B", zones: "Building, Garage, Pool, Gym", issued: "Jan 15, 2026", lastUsed: "Feb 21, 10:30 AM", status: "Active" },
  { id: "FOB-1002", tenant: "James Wilson", unit: "2A", zones: "Building, Garage", issued: "Jan 20, 2026", lastUsed: "Feb 21, 8:15 AM", status: "Active" },
  { id: "FOB-1003", tenant: "Maria Santos", unit: "6C", zones: "Building, Pool, Gym, Laundry", issued: "Feb 1, 2026", lastUsed: "Feb 20, 6:45 PM", status: "Active" },
  { id: "FOB-1004", tenant: "Robert Kim", unit: "8A", zones: "Building, Garage, Pool, Gym", issued: "Dec 10, 2025", lastUsed: "Feb 21, 7:00 AM", status: "Active" },
  { id: "FOB-1005", tenant: "Emily Davis", unit: "5D", zones: "Building, Laundry", issued: "Nov 15, 2025", lastUsed: "Feb 19, 5:30 PM", status: "Active" },
  { id: "FOB-1006", tenant: "Tom Harris", unit: "7B", zones: "Building, Garage, Pool", issued: "Oct 1, 2025", lastUsed: "Jan 28, 2:00 PM", status: "Suspended" },
];

const smartLocks = [
  { unit: "4B", model: "Yale Assure Lock 2", battery: 92, firmware: "v3.2.1", connectivity: "Online", lastActivity: "Feb 21, 10:32 AM", autoLock: "Enabled" },
  { unit: "2A", model: "Schlage Encode Plus", battery: 78, firmware: "v2.8.4", connectivity: "Online", lastActivity: "Feb 21, 8:15 AM", autoLock: "Enabled" },
  { unit: "6C", model: "Yale Assure Lock 2", battery: 45, firmware: "v3.2.1", connectivity: "Online", lastActivity: "Feb 20, 6:45 PM", autoLock: "Enabled" },
  { unit: "8A", model: "August Wi-Fi Smart Lock", battery: 15, firmware: "v4.1.0", connectivity: "Online", lastActivity: "Feb 21, 7:00 AM", autoLock: "Disabled" },
  { unit: "5D", model: "Schlage Encode Plus", battery: 88, firmware: "v2.8.3", connectivity: "Offline", lastActivity: "Feb 19, 5:30 PM", autoLock: "Enabled" },
  { unit: "3C", model: "Yale Assure Lock 2", battery: 65, firmware: "v3.1.8", connectivity: "Online", lastActivity: "Feb 21, 9:00 AM", autoLock: "Enabled" },
];

const accessLog = [
  { timestamp: "Feb 21, 10:32 AM", location: "Unit 4B - Front Door", method: "Smart Lock", person: "Sarah Chen", result: "Granted", flagged: false },
  { timestamp: "Feb 21, 10:15 AM", location: "Main Lobby", method: "Fob", person: "James Wilson", result: "Granted", flagged: false },
  { timestamp: "Feb 21, 8:15 AM", location: "Garage Gate A", method: "Fob", person: "Robert Kim", result: "Granted", flagged: false },
  { timestamp: "Feb 21, 2:30 AM", location: "Unit 312 - Front Door", method: "Code", person: "Unknown", result: "Denied", flagged: true },
  { timestamp: "Feb 21, 2:28 AM", location: "Unit 312 - Front Door", method: "Code", person: "Unknown", result: "Denied", flagged: true },
  { timestamp: "Feb 21, 2:25 AM", location: "Unit 312 - Front Door", method: "Code", person: "Unknown", result: "Denied", flagged: true },
  { timestamp: "Feb 20, 11:45 PM", location: "Pool Area Gate", method: "Key", person: "Michael Brown", result: "Granted", flagged: true },
];

const lockoutRequests = [
  { tenant: "Amanda Lopez", unit: "1D", datetime: "Feb 21, 9:15 AM", method: "Temporary code issued", fee: "$25", resolvedBy: "Front Desk - Mark" },
  { tenant: "Kevin Nguyen", unit: "9A", datetime: "Feb 20, 11:30 PM", method: "After-hours locksmith", fee: "$75", resolvedBy: "SecureLock Services" },
  { tenant: "Rachel Green", unit: "2C", datetime: "Feb 19, 3:00 PM", method: "Master key entry", fee: "$0", resolvedBy: "Property Manager" },
  { tenant: "Steve Adams", unit: "4A", datetime: "Feb 18, 8:45 PM", method: "Smart lock code reset", fee: "$0", resolvedBy: "Remote - IT Support" },
  { tenant: "Diana Ross", unit: "6B", datetime: "Feb 17, 6:00 PM", method: "Spare key from office", fee: "$0", resolvedBy: "Front Desk - Lisa" },
];

const statusVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  Active: "secondary",
  Suspended: "destructive",
  Lost: "destructive",
  Online: "secondary",
  Offline: "destructive",
  Enabled: "secondary",
  Disabled: "outline",
};

const resultVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  Granted: "secondary",
  Denied: "destructive",
};

const keyTypeVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  Unit: "default",
  Mailbox: "secondary",
  Storage: "secondary",
  Pool: "outline",
  Gym: "outline",
  Master: "destructive",
  Emergency: "destructive",
};

export default function AccessControl() {
  const [keyTypeFilter, setKeyTypeFilter] = useState("all");

  const filteredKeys = keyInventory.filter((k) => {
    if (keyTypeFilter !== "all" && k.type !== keyTypeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6" data-testid="page-access-control">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-page-title">Key & Access Control</h1>
          <p className="text-muted-foreground">Key inventory, smart locks, access logs, and lockout management</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs" data-testid="badge-agent-status">
            <Brain className="w-3 h-3 mr-1 text-primary" />
            Agent Active
          </Badge>
          <Button size="sm" data-testid="button-issue-key">
            <Key className="w-3 h-3 mr-1" />
            Issue Key/Fob
          </Button>
        </div>
      </div>

      <AgentInsightStrip insights={agentInsights} />

      <AINudgeCard
        title="Access Anomaly Detected"
        insight="Unit 312 had 3 failed access attempts at 2:30 AM using incorrect PIN codes. This pattern suggests a possible unauthorized entry attempt. The tenant has been notified and the unit's access code has been temporarily elevated to require dual authentication."
        confidence={0.92}
        severity="critical"
        icon={ShieldAlert}
        actionLabel="Review Incident"
        onAction={() => {}}
        secondaryLabel="View Access Log"
        onSecondary={() => {}}
        metric="3 attempts"
        metricLabel="Failed Access"
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

      <Tabs defaultValue="keys" className="space-y-4">
        <TabsList data-testid="tabs-access-control">
          <TabsTrigger value="keys" data-testid="tab-keys">Key Inventory</TabsTrigger>
          <TabsTrigger value="fobs" data-testid="tab-fobs">Access Cards & Fobs</TabsTrigger>
          <TabsTrigger value="smart-locks" data-testid="tab-smart-locks">Smart Locks</TabsTrigger>
          <TabsTrigger value="log" data-testid="tab-access-log">Access Log</TabsTrigger>
          <TabsTrigger value="lockouts" data-testid="tab-lockouts">Lockout Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filter:</span>
            </div>
            <Select value={keyTypeFilter} onValueChange={setKeyTypeFilter}>
              <SelectTrigger className="w-[160px]" data-testid="select-key-type-filter">
                <SelectValue placeholder="Key Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Unit">Unit</SelectItem>
                <SelectItem value="Mailbox">Mailbox</SelectItem>
                <SelectItem value="Storage">Storage</SelectItem>
                <SelectItem value="Pool">Pool</SelectItem>
                <SelectItem value="Gym">Gym</SelectItem>
                <SelectItem value="Master">Master</SelectItem>
                <SelectItem value="Emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="secondary" className="text-xs" data-testid="badge-filtered-count">
              {filteredKeys.length} keys
            </Badge>
          </div>

          <Card data-testid="card-key-inventory">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Key #</th>
                      <th className="p-3 font-medium text-muted-foreground">Type</th>
                      <th className="p-3 font-medium text-muted-foreground">Assigned To</th>
                      <th className="p-3 font-medium text-muted-foreground">Unit</th>
                      <th className="p-3 font-medium text-muted-foreground">Copies Out</th>
                      <th className="p-3 font-medium text-muted-foreground">Deposit</th>
                      <th className="p-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredKeys.map((key, idx) => (
                      <tr key={key.key} className="border-b last:border-0 hover-elevate" data-testid={`row-key-${idx}`}>
                        <td className="p-3 font-mono text-xs font-medium">{key.key}</td>
                        <td className="p-3">
                          <Badge variant={keyTypeVariant[key.type]} className="text-xs" data-testid={`badge-key-type-${idx}`}>
                            {key.type}
                          </Badge>
                        </td>
                        <td className="p-3">{key.assignedTo}</td>
                        <td className="p-3 font-medium">{key.unit}</td>
                        <td className="p-3 font-mono" data-testid={`text-copies-${idx}`}>{key.copies}</td>
                        <td className="p-3 font-mono">{key.deposit}</td>
                        <td className="p-3">
                          <Badge variant={statusVariant[key.status]} className="text-xs" data-testid={`badge-key-status-${idx}`}>
                            {key.status === "Active" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {key.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fobs" className="space-y-4">
          <Card data-testid="card-access-cards">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <CreditCard className="w-5 h-5 text-primary" />
                <CardTitle>Access Cards & Fobs</CardTitle>
                <Badge variant="secondary" className="text-xs">{accessCards.length} active</Badge>
              </div>
              <CardDescription>Electronic access card and fob inventory with zone permissions</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">ID</th>
                      <th className="p-3 font-medium text-muted-foreground">Tenant</th>
                      <th className="p-3 font-medium text-muted-foreground">Unit</th>
                      <th className="p-3 font-medium text-muted-foreground">Access Zones</th>
                      <th className="p-3 font-medium text-muted-foreground">Issued</th>
                      <th className="p-3 font-medium text-muted-foreground">Last Used</th>
                      <th className="p-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accessCards.map((card, idx) => (
                      <tr key={card.id} className="border-b last:border-0 hover-elevate" data-testid={`row-fob-${idx}`}>
                        <td className="p-3 font-mono text-xs font-medium">{card.id}</td>
                        <td className="p-3">{card.tenant}</td>
                        <td className="p-3 font-medium">{card.unit}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {card.zones.split(", ").map((zone) => (
                              <Badge key={zone} variant="outline" className="text-[10px]">
                                {zone}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground text-xs">{card.issued}</td>
                        <td className="p-3 text-muted-foreground text-xs">{card.lastUsed}</td>
                        <td className="p-3">
                          <Badge variant={statusVariant[card.status]} className="text-xs" data-testid={`badge-fob-status-${idx}`}>
                            {card.status === "Active" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {card.status === "Suspended" && <XCircle className="w-3 h-3 mr-1" />}
                            {card.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="smart-locks" className="space-y-4">
          <Card data-testid="card-smart-locks">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Smartphone className="w-5 h-5 text-primary" />
                <CardTitle>Smart Lock Devices</CardTitle>
                <Badge variant="secondary" className="text-xs">{smartLocks.length} devices</Badge>
              </div>
              <CardDescription>Smart lock status, battery levels, and firmware management</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Unit</th>
                      <th className="p-3 font-medium text-muted-foreground">Lock Model</th>
                      <th className="p-3 font-medium text-muted-foreground">Battery</th>
                      <th className="p-3 font-medium text-muted-foreground">Firmware</th>
                      <th className="p-3 font-medium text-muted-foreground">Connectivity</th>
                      <th className="p-3 font-medium text-muted-foreground">Last Activity</th>
                      <th className="p-3 font-medium text-muted-foreground">Auto-Lock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {smartLocks.map((lock, idx) => {
                      const BatteryIcon = lock.battery > 60 ? BatteryFull : lock.battery > 25 ? BatteryMedium : BatteryLow;
                      const batteryColor = lock.battery > 60 ? "text-emerald-600" : lock.battery > 25 ? "text-amber-600" : "text-red-600 dark:text-red-400";
                      return (
                        <tr key={lock.unit} className="border-b last:border-0 hover-elevate" data-testid={`row-lock-${idx}`}>
                          <td className="p-3 font-medium">{lock.unit}</td>
                          <td className="p-3 text-muted-foreground text-xs">{lock.model}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              <BatteryIcon className={`w-4 h-4 ${batteryColor}`} />
                              <span className={`text-xs font-medium ${batteryColor}`} data-testid={`text-battery-${idx}`}>{lock.battery}%</span>
                            </div>
                          </td>
                          <td className="p-3 font-mono text-xs text-muted-foreground">{lock.firmware}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              {lock.connectivity === "Online" ? (
                                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <WifiOff className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                              )}
                              <Badge variant={statusVariant[lock.connectivity]} className="text-xs" data-testid={`badge-connectivity-${idx}`}>
                                {lock.connectivity}
                              </Badge>
                            </div>
                          </td>
                          <td className="p-3 text-muted-foreground text-xs">{lock.lastActivity}</td>
                          <td className="p-3">
                            <Badge variant={statusVariant[lock.autoLock]} className="text-xs" data-testid={`badge-autolock-${idx}`}>
                              {lock.autoLock === "Enabled" && <Lock className="w-3 h-3 mr-1" />}
                              {lock.autoLock === "Disabled" && <Unlock className="w-3 h-3 mr-1" />}
                              {lock.autoLock}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="log" className="space-y-4">
          <Card data-testid="card-access-log">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Activity className="w-5 h-5 text-primary" />
                <CardTitle>Access Log</CardTitle>
                <Badge variant="secondary" className="text-xs">Recent Events</Badge>
              </div>
              <CardDescription>Real-time access events across all entry points</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Timestamp</th>
                      <th className="p-3 font-medium text-muted-foreground">Location</th>
                      <th className="p-3 font-medium text-muted-foreground">Method</th>
                      <th className="p-3 font-medium text-muted-foreground">Person</th>
                      <th className="p-3 font-medium text-muted-foreground">Result</th>
                      <th className="p-3 font-medium text-muted-foreground">Flagged</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accessLog.map((event, idx) => (
                      <tr key={idx} className={`border-b last:border-0 hover-elevate ${event.flagged ? "bg-red-50/30 dark:bg-red-950/10" : ""}`} data-testid={`row-access-${idx}`}>
                        <td className="p-3 text-muted-foreground text-xs">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {event.timestamp}
                          </div>
                        </td>
                        <td className="p-3 text-xs">
                          <div className="flex items-center gap-1.5">
                            <DoorOpen className="w-3.5 h-3.5 text-muted-foreground" />
                            {event.location}
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-xs" data-testid={`badge-method-${idx}`}>
                            {event.method === "Smart Lock" && <Smartphone className="w-3 h-3 mr-1" />}
                            {event.method === "Fob" && <CreditCard className="w-3 h-3 mr-1" />}
                            {event.method === "Key" && <Key className="w-3 h-3 mr-1" />}
                            {event.method === "Code" && <KeyRound className="w-3 h-3 mr-1" />}
                            {event.method}
                          </Badge>
                        </td>
                        <td className="p-3">{event.person}</td>
                        <td className="p-3">
                          <Badge variant={resultVariant[event.result]} className="text-xs" data-testid={`badge-result-${idx}`}>
                            {event.result === "Granted" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {event.result === "Denied" && <XCircle className="w-3 h-3 mr-1" />}
                            {event.result}
                          </Badge>
                        </td>
                        <td className="p-3">
                          {event.flagged ? (
                            <Badge variant="destructive" className="text-xs" data-testid={`badge-flagged-${idx}`}>
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Flagged
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">--</span>
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

        <TabsContent value="lockouts" className="space-y-4">
          <Card data-testid="card-lockout-requests">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <DoorOpen className="w-5 h-5 text-primary" />
                <CardTitle>Lockout Requests</CardTitle>
                <Badge variant="secondary" className="text-xs">{lockoutRequests.length} recent</Badge>
              </div>
              <CardDescription>Tenant lockout service history and resolution tracking</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Tenant</th>
                      <th className="p-3 font-medium text-muted-foreground">Unit</th>
                      <th className="p-3 font-medium text-muted-foreground">Date/Time</th>
                      <th className="p-3 font-medium text-muted-foreground">Method Used</th>
                      <th className="p-3 font-medium text-muted-foreground">Fee Charged</th>
                      <th className="p-3 font-medium text-muted-foreground">Resolved By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lockoutRequests.map((req, idx) => (
                      <tr key={idx} className="border-b last:border-0 hover-elevate" data-testid={`row-lockout-${idx}`}>
                        <td className="p-3">{req.tenant}</td>
                        <td className="p-3 font-medium">{req.unit}</td>
                        <td className="p-3 text-muted-foreground text-xs">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {req.datetime}
                          </div>
                        </td>
                        <td className="p-3 text-xs">{req.method}</td>
                        <td className="p-3 font-mono">{req.fee}</td>
                        <td className="p-3 text-muted-foreground text-xs">{req.resolvedBy}</td>
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
