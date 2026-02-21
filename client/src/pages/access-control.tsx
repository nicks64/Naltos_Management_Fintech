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

interface KeyRecord {
  id: string;
  unit: string;
  keyType: string;
  copies: number;
  assignedTo: string;
  lastIssued: string;
  status: string;
  deposit: string;
}

interface CardRecord {
  id: string;
  cardId: string;
  type: string;
  holder: string;
  unit: string;
  zones: string;
  issued: string;
  expires: string;
  status: string;
}

interface LockRecord {
  id: string;
  device: string;
  unit: string;
  battery: number;
  firmware: string;
  status: string;
  lastAccess: string;
  autoLock: boolean;
  logs: number;
}

interface LogRecord {
  id: string;
  time: string;
  person: string;
  unit: string;
  method: string;
  door: string;
  result: string;
  flagged: boolean;
}

const agentInsights = [
  { text: "Key inventory reconciled - 3 unaccounted copies flagged", severity: "warning" as const },
  { text: "Unit 312: 3 failed access attempts at 2:30 AM", severity: "critical" as const },
  { text: "2 lockout requests pending resolution", severity: "warning" as const },
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

function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
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

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center" data-testid="error-state">
      <AlertTriangle className="w-8 h-8 text-destructive mb-2" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export default function AccessControl() {
  const [keyTypeFilter, setKeyTypeFilter] = useState("all");

  const { data: keysData = [], isLoading: keysLoading, isError: keysError } = useQuery<KeyRecord[]>({
    queryKey: ['/api/access-control/keys'],
  });

  const { data: cardsData = [], isLoading: cardsLoading, isError: cardsError } = useQuery<CardRecord[]>({
    queryKey: ['/api/access-control/cards'],
  });

  const { data: locksData = [], isLoading: locksLoading, isError: locksError } = useQuery<LockRecord[]>({
    queryKey: ['/api/access-control/locks'],
  });

  const { data: logsData = [], isLoading: logsLoading, isError: logsError } = useQuery<LogRecord[]>({
    queryKey: ['/api/access-control/logs'],
  });

  const isLoading = keysLoading || cardsLoading || locksLoading || logsLoading;

  const kpiCards = useMemo(() => {
    const activeKeys = keysData.reduce((sum, k) => sum + (k.copies || 0), 0);
    const activeCards = cardsData.filter((c) => c.status === "Active").length;
    const lockCount = locksData.length;
    const securityAlerts = logsData.filter((l) => l.flagged).length;

    return [
      { title: "Active Keys", value: String(activeKeys), change: "Across all types", trend: "neutral" as const, icon: Key },
      { title: "Active Cards", value: String(activeCards), change: `${cardsData.length} total`, trend: "positive" as const, icon: CreditCard },
      { title: "Smart Locks", value: String(lockCount), change: `${locksData.filter(l => l.status === "Online").length} online`, trend: "positive" as const, icon: Lock },
      { title: "Security Alerts", value: String(securityAlerts), change: `${logsData.length} total events`, trend: securityAlerts > 0 ? "warning" as const : "neutral" as const, icon: ShieldAlert },
    ];
  }, [keysData, cardsData, locksData, logsData]);

  const filteredKeys = useMemo(() => {
    return keysData.filter((k) => {
      if (keyTypeFilter !== "all" && k.keyType !== keyTypeFilter) return false;
      return true;
    });
  }, [keysData, keyTypeFilter]);

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
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} data-testid={`skeleton-kpi-${index}`}>
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-1 pt-3 px-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-4 rounded" />
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <Skeleton className="h-6 w-12 mb-1" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))
        ) : (
          kpiCards.map((card, index) => (
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
          ))
        )}
      </div>

      <Tabs defaultValue="keys" className="space-y-4">
        <TabsList data-testid="tabs-access-control">
          <TabsTrigger value="keys" data-testid="tab-keys">Key Inventory</TabsTrigger>
          <TabsTrigger value="fobs" data-testid="tab-fobs">Access Cards & Fobs</TabsTrigger>
          <TabsTrigger value="smart-locks" data-testid="tab-smart-locks">Smart Locks</TabsTrigger>
          <TabsTrigger value="log" data-testid="tab-access-log">Access Log</TabsTrigger>
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
              {keysLoading ? (
                <TableSkeleton rows={5} cols={7} />
              ) : keysError ? (
                <ErrorState message="Failed to load key inventory" />
              ) : (
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
                        <tr key={key.id} className="border-b last:border-0 hover-elevate" data-testid={`row-key-${idx}`}>
                          <td className="p-3 font-mono text-xs font-medium">{key.id}</td>
                          <td className="p-3">
                            <Badge variant={keyTypeVariant[key.keyType] || "default"} className="text-xs" data-testid={`badge-key-type-${idx}`}>
                              {key.keyType}
                            </Badge>
                          </td>
                          <td className="p-3">{key.assignedTo}</td>
                          <td className="p-3 font-medium">{key.unit}</td>
                          <td className="p-3 font-mono" data-testid={`text-copies-${idx}`}>{key.copies}</td>
                          <td className="p-3 font-mono">{key.deposit}</td>
                          <td className="p-3">
                            <Badge variant={statusVariant[key.status] || "default"} className="text-xs" data-testid={`badge-key-status-${idx}`}>
                              {key.status === "Active" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                              {key.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                      {filteredKeys.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-6 text-center text-muted-foreground text-sm" data-testid="text-no-keys">No keys found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fobs" className="space-y-4">
          <Card data-testid="card-access-cards">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <CreditCard className="w-5 h-5 text-primary" />
                <CardTitle>Access Cards & Fobs</CardTitle>
                <Badge variant="secondary" className="text-xs" data-testid="badge-cards-count">{cardsData.filter(c => c.status === "Active").length} active</Badge>
              </div>
              <CardDescription>Electronic access card and fob inventory with zone permissions</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {cardsLoading ? (
                <TableSkeleton rows={5} cols={7} />
              ) : cardsError ? (
                <ErrorState message="Failed to load access cards" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="p-3 font-medium text-muted-foreground">Card ID</th>
                        <th className="p-3 font-medium text-muted-foreground">Holder</th>
                        <th className="p-3 font-medium text-muted-foreground">Unit</th>
                        <th className="p-3 font-medium text-muted-foreground">Access Zones</th>
                        <th className="p-3 font-medium text-muted-foreground">Issued</th>
                        <th className="p-3 font-medium text-muted-foreground">Expires</th>
                        <th className="p-3 font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cardsData.map((card, idx) => (
                        <tr key={card.id} className="border-b last:border-0 hover-elevate" data-testid={`row-fob-${idx}`}>
                          <td className="p-3 font-mono text-xs font-medium">{card.cardId}</td>
                          <td className="p-3">{card.holder}</td>
                          <td className="p-3 font-medium">{card.unit}</td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {(card.zones || "").split(", ").filter(Boolean).map((zone) => (
                                <Badge key={zone} variant="outline" className="text-[10px]">
                                  {zone}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="p-3 text-muted-foreground text-xs">{card.issued}</td>
                          <td className="p-3 text-muted-foreground text-xs">{card.expires}</td>
                          <td className="p-3">
                            <Badge variant={statusVariant[card.status] || "default"} className="text-xs" data-testid={`badge-fob-status-${idx}`}>
                              {card.status === "Active" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                              {card.status === "Suspended" && <XCircle className="w-3 h-3 mr-1" />}
                              {card.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                      {cardsData.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-6 text-center text-muted-foreground text-sm" data-testid="text-no-cards">No access cards found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="smart-locks" className="space-y-4">
          <Card data-testid="card-smart-locks">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Smartphone className="w-5 h-5 text-primary" />
                <CardTitle>Smart Lock Devices</CardTitle>
                <Badge variant="secondary" className="text-xs" data-testid="badge-locks-count">{locksData.length} devices</Badge>
              </div>
              <CardDescription>Smart lock status, battery levels, and firmware management</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {locksLoading ? (
                <TableSkeleton rows={5} cols={7} />
              ) : locksError ? (
                <ErrorState message="Failed to load smart locks" />
              ) : (
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
                      {locksData.map((lock, idx) => {
                        const batteryVal = lock.battery || 0;
                        const BatteryIcon = batteryVal > 60 ? BatteryFull : batteryVal > 25 ? BatteryMedium : BatteryLow;
                        const batteryColor = batteryVal > 60 ? "text-emerald-600" : batteryVal > 25 ? "text-amber-600" : "text-red-600 dark:text-red-400";
                        const autoLockLabel = lock.autoLock ? "Enabled" : "Disabled";
                        return (
                          <tr key={lock.id} className="border-b last:border-0 hover-elevate" data-testid={`row-lock-${idx}`}>
                            <td className="p-3 font-medium">{lock.unit}</td>
                            <td className="p-3 text-muted-foreground text-xs">{lock.device}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-1.5">
                                <BatteryIcon className={`w-4 h-4 ${batteryColor}`} />
                                <span className={`text-xs font-medium ${batteryColor}`} data-testid={`text-battery-${idx}`}>{batteryVal}%</span>
                              </div>
                            </td>
                            <td className="p-3 font-mono text-xs text-muted-foreground">{lock.firmware}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-1.5">
                                {lock.status === "Online" ? (
                                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <WifiOff className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                                )}
                                <Badge variant={statusVariant[lock.status] || "default"} className="text-xs" data-testid={`badge-connectivity-${idx}`}>
                                  {lock.status}
                                </Badge>
                              </div>
                            </td>
                            <td className="p-3 text-muted-foreground text-xs">{lock.lastAccess}</td>
                            <td className="p-3">
                              <Badge variant={statusVariant[autoLockLabel]} className="text-xs" data-testid={`badge-autolock-${idx}`}>
                                {lock.autoLock ? <Lock className="w-3 h-3 mr-1" /> : <Unlock className="w-3 h-3 mr-1" />}
                                {autoLockLabel}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                      {locksData.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-6 text-center text-muted-foreground text-sm" data-testid="text-no-locks">No smart locks found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
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
              {logsLoading ? (
                <TableSkeleton rows={5} cols={6} />
              ) : logsError ? (
                <ErrorState message="Failed to load access logs" />
              ) : (
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
                      {logsData.map((event, idx) => (
                        <tr key={event.id} className={`border-b last:border-0 hover-elevate ${event.flagged ? "bg-red-50/30 dark:bg-red-950/10" : ""}`} data-testid={`row-access-${idx}`}>
                          <td className="p-3 text-muted-foreground text-xs">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              {event.time}
                            </div>
                          </td>
                          <td className="p-3 text-xs">
                            <div className="flex items-center gap-1.5">
                              <DoorOpen className="w-3.5 h-3.5 text-muted-foreground" />
                              {event.door}
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
                            <Badge variant={resultVariant[event.result] || "default"} className="text-xs" data-testid={`badge-result-${idx}`}>
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
                      {logsData.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-muted-foreground text-sm" data-testid="text-no-logs">No access logs found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
