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
  Car,
  ParkingSquare,
  SquareParking,
  Shield,
  AlertTriangle,
  Brain,
  Target,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  Truck,
  KeyRound,
  Camera,
  Ban,
  TrendingUp,
  Activity,
  type LucideIcon,
} from "lucide-react";

interface ParkingSpace {
  id: string;
  space: string;
  type: string;
  tenant: string;
  unit: string;
  vehicle: string;
  plate: string;
  monthly: string;
  expires: string;
}

interface ParkingPermit {
  id: string;
  permitId: string;
  type: string;
  vehicle: string;
  plate: string;
  unit: string;
  issued: string;
  expires: string;
  status: string;
}

interface ParkingViolation {
  id: string;
  violationId: string;
  date: string;
  space: string;
  plate: string;
  type: string;
  fine: string;
  status: string;
  notes: string;
}

interface ParkingTow {
  id: string;
  towId: string;
  date: string;
  plate: string;
  space: string;
  reason: string;
  company: string;
  status: string;
  cost: string;
}

interface GarageDevice {
  id: string;
  device: string;
  location: string;
  status: string;
  lastPing: string;
  battery: number;
  firmware: string;
}

const agentInsights = [
  { text: "Parking utilization at 84.8% across all zones", severity: "positive" as const },
  { text: "12 permits expiring within 7 days", severity: "warning" as const },
  { text: "5 active violations requiring resolution", severity: "critical" as const },
];

const typeVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  Covered: "default",
  Uncovered: "secondary",
  Garage: "outline",
  Reserved: "destructive",
};

const statusVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  Active: "secondary",
  "Past Due": "destructive",
  Expiring: "outline",
  Expired: "destructive",
  Pending: "outline",
  Open: "outline",
  Resolved: "secondary",
  "Warning Issued": "default",
  "Tow Scheduled": "destructive",
  Completed: "secondary",
  Disputed: "outline",
  Suspended: "destructive",
  Online: "secondary",
  Offline: "destructive",
};

const violationTypeVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  Unauthorized: "destructive",
  "Expired Permit": "outline",
  "Wrong Space": "default",
  Abandoned: "destructive",
};

function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="p-3 space-y-3" data-testid="skeleton-table">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <Card data-testid="card-error">
      <CardContent className="p-6 text-center">
        <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
        <p className="text-sm text-muted-foreground" data-testid="text-error-message">{message}</p>
      </CardContent>
    </Card>
  );
}

export default function Parking() {
  const [spaceFilter, setSpaceFilter] = useState("all");

  const {
    data: spaces = [],
    isLoading: spacesLoading,
    error: spacesError,
  } = useQuery<ParkingSpace[]>({ queryKey: ['/api/parking/spaces'] });

  const {
    data: permits = [],
    isLoading: permitsLoading,
    error: permitsError,
  } = useQuery<ParkingPermit[]>({ queryKey: ['/api/parking/permits'] });

  const {
    data: violations = [],
    isLoading: violationsLoading,
    error: violationsError,
  } = useQuery<ParkingViolation[]>({ queryKey: ['/api/parking/violations'] });

  const {
    data: towingLog = [],
    isLoading: towingLoading,
    error: towingError,
  } = useQuery<ParkingTow[]>({ queryKey: ['/api/parking/towing'] });

  const {
    data: garageDevices = [],
    isLoading: garageLoading,
    error: garageError,
  } = useQuery<GarageDevice[]>({ queryKey: ['/api/parking/garage'] });

  const kpiCards = useMemo(() => {
    const totalSpaces = spaces.length;
    const activePermits = permits.filter(p => p.status === "Active").length;
    const openViolations = violations.filter(v => v.status === "Open").length;
    const monthlyRevenue = spaces.reduce((sum, s) => {
      const val = parseFloat((s.monthly || "0").replace(/[^0-9.]/g, ""));
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    return [
      { title: "Total Spaces", value: String(totalSpaces), change: `Across all structures`, trend: "neutral" as const, icon: SquareParking },
      { title: "Active Permits", value: String(activePermits), change: `${permits.length} total permits`, trend: "positive" as const, icon: CreditCard },
      { title: "Open Violations", value: String(openViolations), change: `${violations.length} total records`, trend: openViolations > 0 ? "warning" as const : "positive" as const, icon: AlertTriangle },
      { title: "Monthly Revenue", value: `$${monthlyRevenue.toLocaleString()}`, change: "From space fees", trend: "positive" as const, icon: TrendingUp },
    ];
  }, [spaces, permits, violations]);

  const filteredSpaces = useMemo(() => {
    return spaces.filter((s) => {
      if (spaceFilter !== "all" && s.type !== spaceFilter) return false;
      return true;
    });
  }, [spaces, spaceFilter]);

  const isLoading = spacesLoading || permitsLoading || violationsLoading || towingLoading || garageLoading;

  return (
    <div className="space-y-6" data-testid="page-parking">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-page-title">Parking & Vehicle Management</h1>
          <p className="text-muted-foreground">Parking assignments, permits, violations, and garage access control</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs" data-testid="badge-agent-status">
            <Brain className="w-3 h-3 mr-1 text-primary" />
            Agent Active
          </Badge>
          <Button size="sm" data-testid="button-assign-space">
            <ParkingSquare className="w-3 h-3 mr-1" />
            Assign Space
          </Button>
        </div>
      </div>

      <AgentInsightStrip insights={agentInsights} />

      <AINudgeCard
        title="Parking Optimization Opportunity"
        insight="15% of assigned spaces are unused during business hours (9 AM - 5 PM). Converting 20 underutilized covered spaces to daytime visitor permits could generate $1,500/month in additional revenue."
        confidence={0.88}
        severity="opportunity"
        icon={Target}
        actionLabel="Review Proposal"
        onAction={() => {}}
        secondaryLabel="View Utilization Data"
        onSecondary={() => {}}
        metric="$1,500/mo"
        metricLabel="Potential Revenue"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} data-testid={`card-kpi-skeleton-${index}`}>
                <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-1 pt-3 px-3">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-4 rounded" />
                </CardHeader>
                <CardContent className="px-3 pb-3">
                  <Skeleton className="h-6 w-16 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            ))
          : kpiCards.map((card, index) => (
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

      <Tabs defaultValue="assignments" className="space-y-4">
        <TabsList data-testid="tabs-parking">
          <TabsTrigger value="assignments" data-testid="tab-assignments">Space Assignments</TabsTrigger>
          <TabsTrigger value="permits" data-testid="tab-permits">Permits</TabsTrigger>
          <TabsTrigger value="violations" data-testid="tab-violations">Violations</TabsTrigger>
          <TabsTrigger value="towing" data-testid="tab-towing">Towing Log</TabsTrigger>
          <TabsTrigger value="garage" data-testid="tab-garage">Garage Access</TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filter:</span>
            </div>
            <Select value={spaceFilter} onValueChange={setSpaceFilter}>
              <SelectTrigger className="w-[160px]" data-testid="select-space-filter">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Covered">Covered</SelectItem>
                <SelectItem value="Uncovered">Uncovered</SelectItem>
                <SelectItem value="Garage">Garage</SelectItem>
                <SelectItem value="Reserved">Reserved</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="secondary" className="text-xs" data-testid="badge-filtered-count">
              {filteredSpaces.length} spaces
            </Badge>
          </div>

          {spacesError ? (
            <ErrorCard message="Failed to load space assignments. Please try again." />
          ) : spacesLoading ? (
            <Card data-testid="card-space-assignments-loading"><CardContent className="p-0"><TableSkeleton cols={7} /></CardContent></Card>
          ) : (
            <Card data-testid="card-space-assignments">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="p-3 font-medium text-muted-foreground">Space #</th>
                        <th className="p-3 font-medium text-muted-foreground">Type</th>
                        <th className="p-3 font-medium text-muted-foreground">Tenant</th>
                        <th className="p-3 font-medium text-muted-foreground">Unit</th>
                        <th className="p-3 font-medium text-muted-foreground">Vehicle</th>
                        <th className="p-3 font-medium text-muted-foreground">Monthly Fee</th>
                        <th className="p-3 font-medium text-muted-foreground">Expires</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSpaces.map((space, idx) => (
                        <tr key={space.id} className="border-b last:border-0 hover-elevate" data-testid={`row-space-${idx}`}>
                          <td className="p-3 font-mono text-xs font-medium">{space.space}</td>
                          <td className="p-3">
                            <Badge variant={typeVariant[space.type] || "default"} className="text-xs" data-testid={`badge-type-${idx}`}>
                              {space.type}
                            </Badge>
                          </td>
                          <td className="p-3">{space.tenant}</td>
                          <td className="p-3 font-medium">{space.unit}</td>
                          <td className="p-3 text-muted-foreground text-xs">{space.vehicle}</td>
                          <td className="p-3 font-mono">{space.monthly}</td>
                          <td className="p-3 text-muted-foreground text-xs">{space.expires}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="permits" className="space-y-4">
          {permitsError ? (
            <ErrorCard message="Failed to load permits. Please try again." />
          ) : permitsLoading ? (
            <Card data-testid="card-permits-loading"><CardContent className="p-0"><TableSkeleton cols={7} /></CardContent></Card>
          ) : (
            <Card data-testid="card-permits">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <CardTitle>Active Permits</CardTitle>
                  <Badge variant="secondary" className="text-xs" data-testid="badge-permits-count">{permits.length} permits</Badge>
                </div>
                <CardDescription>Resident, visitor, contractor, and temporary parking permits</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="p-3 font-medium text-muted-foreground">Permit #</th>
                        <th className="p-3 font-medium text-muted-foreground">Type</th>
                        <th className="p-3 font-medium text-muted-foreground">Vehicle</th>
                        <th className="p-3 font-medium text-muted-foreground">Unit</th>
                        <th className="p-3 font-medium text-muted-foreground">Issued</th>
                        <th className="p-3 font-medium text-muted-foreground">Expires</th>
                        <th className="p-3 font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {permits.map((permit, idx) => (
                        <tr key={permit.id} className="border-b last:border-0 hover-elevate" data-testid={`row-permit-${idx}`}>
                          <td className="p-3 font-mono text-xs font-medium">{permit.permitId}</td>
                          <td className="p-3">
                            <Badge variant="outline" className="text-xs" data-testid={`badge-permit-type-${idx}`}>
                              {permit.type}
                            </Badge>
                          </td>
                          <td className="p-3 text-muted-foreground text-xs">{permit.vehicle}</td>
                          <td className="p-3 font-medium">{permit.unit}</td>
                          <td className="p-3 text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              {permit.issued}
                            </div>
                          </td>
                          <td className="p-3 text-muted-foreground">{permit.expires}</td>
                          <td className="p-3">
                            <Badge variant={statusVariant[permit.status] || "default"} className="text-xs" data-testid={`badge-permit-status-${idx}`}>
                              {permit.status === "Active" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                              {permit.status === "Expiring" && <Clock className="w-3 h-3 mr-1" />}
                              {permit.status === "Expired" && <XCircle className="w-3 h-3 mr-1" />}
                              {permit.status}
                            </Badge>
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

        <TabsContent value="violations" className="space-y-4">
          {violationsError ? (
            <ErrorCard message="Failed to load violations. Please try again." />
          ) : violationsLoading ? (
            <Card data-testid="card-violations-loading"><CardContent className="p-0"><TableSkeleton cols={6} /></CardContent></Card>
          ) : (
            <Card data-testid="card-violations">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Ban className="w-5 h-5 text-primary" />
                  <CardTitle>Violation Records</CardTitle>
                  <Badge variant="secondary" className="text-xs" data-testid="badge-violations-count">{violations.length} records</Badge>
                </div>
                <CardDescription>Parking violations, warnings, and resolution tracking</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="p-3 font-medium text-muted-foreground">ID</th>
                        <th className="p-3 font-medium text-muted-foreground">Date</th>
                        <th className="p-3 font-medium text-muted-foreground">Space</th>
                        <th className="p-3 font-medium text-muted-foreground">Violation Type</th>
                        <th className="p-3 font-medium text-muted-foreground">Plate</th>
                        <th className="p-3 font-medium text-muted-foreground">Fine</th>
                        <th className="p-3 font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {violations.map((v, idx) => (
                        <tr key={v.id} className="border-b last:border-0 hover-elevate" data-testid={`row-violation-${idx}`}>
                          <td className="p-3 font-mono text-xs font-medium">{v.violationId}</td>
                          <td className="p-3 text-muted-foreground">{v.date}</td>
                          <td className="p-3 font-mono text-xs font-medium">{v.space}</td>
                          <td className="p-3">
                            <Badge variant={violationTypeVariant[v.type] || "default"} className="text-xs" data-testid={`badge-violation-type-${idx}`}>
                              {v.type}
                            </Badge>
                          </td>
                          <td className="p-3 text-muted-foreground text-xs">{v.plate}</td>
                          <td className="p-3 font-mono">{v.fine}</td>
                          <td className="p-3">
                            <Badge variant={statusVariant[v.status] || "default"} className="text-xs" data-testid={`badge-violation-status-${idx}`}>
                              {v.status}
                            </Badge>
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

        <TabsContent value="towing" className="space-y-4">
          {towingError ? (
            <ErrorCard message="Failed to load towing log. Please try again." />
          ) : towingLoading ? (
            <Card data-testid="card-towing-loading"><CardContent className="p-0"><TableSkeleton cols={7} /></CardContent></Card>
          ) : (
            <Card data-testid="card-towing-log">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Truck className="w-5 h-5 text-primary" />
                  <CardTitle>Towing Log</CardTitle>
                  <Badge variant="secondary" className="text-xs" data-testid="badge-towing-count">{towingLog.length} records</Badge>
                </div>
                <CardDescription>Vehicle tow records, costs, and dispute tracking</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="p-3 font-medium text-muted-foreground">Tow ID</th>
                        <th className="p-3 font-medium text-muted-foreground">Date</th>
                        <th className="p-3 font-medium text-muted-foreground">Plate</th>
                        <th className="p-3 font-medium text-muted-foreground">Space</th>
                        <th className="p-3 font-medium text-muted-foreground">Reason</th>
                        <th className="p-3 font-medium text-muted-foreground">Company</th>
                        <th className="p-3 font-medium text-muted-foreground">Cost</th>
                        <th className="p-3 font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {towingLog.map((tow, idx) => (
                        <tr key={tow.id} className="border-b last:border-0 hover-elevate" data-testid={`row-tow-${idx}`}>
                          <td className="p-3 font-mono text-xs font-medium">{tow.towId}</td>
                          <td className="p-3 text-muted-foreground">{tow.date}</td>
                          <td className="p-3 text-xs">{tow.plate}</td>
                          <td className="p-3 font-mono text-xs">{tow.space}</td>
                          <td className="p-3 text-muted-foreground text-xs">{tow.reason}</td>
                          <td className="p-3 text-muted-foreground">{tow.company}</td>
                          <td className="p-3 font-mono">{tow.cost}</td>
                          <td className="p-3">
                            <Badge variant={statusVariant[tow.status] || "default"} className="text-xs" data-testid={`badge-tow-status-${idx}`}>
                              {tow.status}
                            </Badge>
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

        <TabsContent value="garage" className="space-y-4">
          {garageError ? (
            <ErrorCard message="Failed to load garage access devices. Please try again." />
          ) : garageLoading ? (
            <Card data-testid="card-garage-loading"><CardContent className="p-0"><TableSkeleton cols={6} /></CardContent></Card>
          ) : (
            <Card data-testid="card-garage-access">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <KeyRound className="w-5 h-5 text-primary" />
                  <CardTitle>Garage Access Devices</CardTitle>
                  <Badge variant="secondary" className="text-xs" data-testid="badge-garage-count">{garageDevices.length} devices</Badge>
                </div>
                <CardDescription>Access device monitoring for parking garage entry points</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="p-3 font-medium text-muted-foreground">Device ID</th>
                        <th className="p-3 font-medium text-muted-foreground">Location</th>
                        <th className="p-3 font-medium text-muted-foreground">Status</th>
                        <th className="p-3 font-medium text-muted-foreground">Last Ping</th>
                        <th className="p-3 font-medium text-muted-foreground">Battery</th>
                        <th className="p-3 font-medium text-muted-foreground">Firmware</th>
                      </tr>
                    </thead>
                    <tbody>
                      {garageDevices.map((device, idx) => (
                        <tr key={device.id} className="border-b last:border-0 hover-elevate" data-testid={`row-garage-${idx}`}>
                          <td className="p-3 font-mono text-xs font-medium">{device.device}</td>
                          <td className="p-3">{device.location}</td>
                          <td className="p-3">
                            <Badge variant={statusVariant[device.status] || "default"} className="text-xs" data-testid={`badge-garage-status-${idx}`}>
                              {device.status === "Online" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                              {device.status === "Offline" && <XCircle className="w-3 h-3 mr-1" />}
                              {device.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-muted-foreground text-xs">{device.lastPing}</td>
                          <td className="p-3">
                            <span className={`text-xs font-mono ${(device.battery ?? 0) < 30 ? "text-destructive" : (device.battery ?? 0) < 60 ? "text-amber-600" : "text-emerald-600"}`} data-testid={`text-battery-${idx}`}>
                              {device.battery ?? 0}%
                            </span>
                          </td>
                          <td className="p-3 text-muted-foreground text-xs font-mono">{device.firmware}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
