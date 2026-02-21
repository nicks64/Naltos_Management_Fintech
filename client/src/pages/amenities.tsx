import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AINudgeCard, AgentInsightStrip } from "@/components/ai-nudge-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Waves,
  Dumbbell,
  Users,
  Building,
  Monitor,
  Dog,
  Flame,
  Package,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Wrench,
  Star,
  Brain,
  Sparkles,
  Plus,
  Eye,
  BarChart3,
  CheckCircle2,
  XCircle,
  Sun,
  TreePine,
  type LucideIcon,
} from "lucide-react";
import type { AmenityListItem, AmenityReservation, AmenityUsageByDay } from "@shared/schema";

const iconMap: Record<string, LucideIcon> = {
  Dumbbell,
  Waves,
  Monitor,
  Users,
  Sun,
  Dog,
  TreePine,
  Package,
  Building,
  Flame,
  Wrench,
  Star,
  Calendar,
};

function getIconForKey(iconKey: string | null | undefined): LucideIcon {
  if (iconKey && iconMap[iconKey]) return iconMap[iconKey];
  return Building;
}

const agentInsights = [
  { text: "Pool reservation 94% capacity this weekend", severity: "warning" as const, confidence: 0.91 },
  { text: "Gym equipment maintenance due in 5 days", severity: "warning" as const, confidence: 0.87 },
  { text: "Community room booked 23 times this month (+15%)", severity: "positive" as const },
];

const equipment = [
  { id: 1, name: "Treadmill - Life Fitness T5", location: "Fitness Center", lastServiced: "Jan 10, 2026", condition: "Good", nextService: "Apr 10, 2026", cost: "$4,500" },
  { id: 2, name: "Elliptical - Precor EFX 835", location: "Fitness Center", lastServiced: "Dec 15, 2025", condition: "Fair", nextService: "Mar 15, 2026", cost: "$3,800" },
  { id: 3, name: "Weight Rack - Rogue R-3", location: "Fitness Center", lastServiced: "Feb 01, 2026", condition: "Good", nextService: "Aug 01, 2026", cost: "$1,200" },
  { id: 4, name: "Spin Bike - Peloton Commercial", location: "Fitness Center", lastServiced: "Nov 20, 2025", condition: "Fair", nextService: "Feb 26, 2026", cost: "$2,500" },
  { id: 5, name: "Pool Pump - Hayward VS", location: "Pool", lastServiced: "Jan 25, 2026", condition: "Good", nextService: "Jul 25, 2026", cost: "$1,800" },
  { id: 6, name: "Pool Heater - Raypak 406A", location: "Pool", lastServiced: "Feb 05, 2026", condition: "Good", nextService: "Aug 05, 2026", cost: "$3,200" },
  { id: 7, name: "Grill Station - Weber Summit", location: "BBQ Area", lastServiced: "Oct 10, 2025", condition: "Poor", nextService: "Overdue", cost: "$2,100" },
  { id: 8, name: "Projector - Epson EB-L200F", location: "Business Center", lastServiced: "Jan 18, 2026", condition: "Good", nextService: "Jul 18, 2026", cost: "$1,500" },
  { id: 9, name: "Sauna Heater - Harvia Virta", location: "Fitness Center", lastServiced: "Dec 01, 2025", condition: "Fair", nextService: "Mar 01, 2026", cost: "$2,800" },
  { id: 10, name: "Access Control Panel - Kisi", location: "Package Room", lastServiced: "Feb 10, 2026", condition: "Good", nextService: "Aug 10, 2026", cost: "$950" },
];

function getConditionBadge(condition: string) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    "Good": "outline",
    "Fair": "secondary",
    "Poor": "destructive",
  };
  return <Badge variant={variants[condition] || "outline"} className="text-xs">{condition}</Badge>;
}

function getStatusConfig(status: string) {
  const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: LucideIcon }> = {
    "Open": { variant: "outline", icon: CheckCircle2 },
    "Closed": { variant: "secondary", icon: XCircle },
    "Maintenance": { variant: "destructive", icon: Wrench },
  };
  return config[status] || { variant: "outline" as const, icon: CheckCircle2 };
}

function getReservationStatusBadge(status: string) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    "Confirmed": "default",
    "Pending": "secondary",
    "Cancelled": "destructive",
  };
  return <Badge variant={variants[status] || "outline"} className="text-xs">{status}</Badge>;
}

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-1 pt-3 px-3">
            <Skeleton className="h-3 w-24" />
          </CardHeader>
          <CardContent className="px-3 pb-3 space-y-2">
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-3 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AmenitiesSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2 pt-3 px-3">
            <div className="flex items-center gap-2">
              <Skeleton className="w-8 h-8 rounded-md" />
              <Skeleton className="h-4 w-24" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3 space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ReservationsSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
          <Skeleton className="w-10 h-10 rounded-md flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <Card data-testid="error-state">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <AlertTriangle className="w-10 h-10 text-destructive mb-3" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}

export default function Amenities() {
  const {
    data: amenities = [],
    isLoading: amenitiesLoading,
    error: amenitiesError,
  } = useQuery<AmenityListItem[]>({ queryKey: ['/api/amenities/list'] });

  const {
    data: reservations = [],
    isLoading: reservationsLoading,
    error: reservationsError,
  } = useQuery<AmenityReservation[]>({ queryKey: ['/api/amenities/reservations'] });

  const {
    data: usageByDay = [],
    isLoading: usageLoading,
    error: usageError,
  } = useQuery<AmenityUsageByDay[]>({ queryKey: ['/api/amenities/usage'] });

  const kpiCards = useMemo(() => {
    const totalAmenities = amenities.length;
    const activeReservations = reservations.filter(r => r.status === 'Confirmed').length;
    const avgUtilization = totalAmenities > 0
      ? Math.round(amenities.reduce((sum, a) => sum + (a.utilization ?? 0), 0) / totalAmenities)
      : 0;
    const underMaintenance = amenities.filter(a => a.status === 'Maintenance').length;

    return [
      { title: "Total Amenities", value: String(totalAmenities), icon: Building, color: "text-blue-600" },
      { title: "Active Reservations", value: String(activeReservations), icon: Calendar, color: "text-emerald-600" },
      { title: "Avg Utilization", value: `${avgUtilization}%`, icon: TrendingUp, color: "text-indigo-600" },
      { title: "Under Maintenance", value: String(underMaintenance), icon: Wrench, color: "text-amber-600" },
    ];
  }, [amenities, reservations]);

  const isLoading = amenitiesLoading || reservationsLoading || usageLoading;

  return (
    <div className="space-y-6" data-testid="page-amenities">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-page-title">Amenity Management</h1>
          <p className="text-muted-foreground">AI-powered amenity tracking, reservations, and usage analytics</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs" data-testid="badge-agent-status">
            <Brain className="w-3 h-3 mr-1 text-primary" />
            Agent Active
          </Badge>
          <Button size="sm" data-testid="button-create-reservation">
            <Plus className="w-4 h-4 mr-1" />
            Create Reservation
          </Button>
        </div>
      </div>

      <AgentInsightStrip insights={agentInsights} />

      <AINudgeCard
        title="Cleaning Schedule Optimization"
        insight="Agent detected that the fitness center has 3x more usage during 6-8 AM and 5-7 PM. Current cleaning schedule doesn't align with peak usage. Recommend shifting cleaning to 8-9 AM and 4-5 PM windows for better tenant experience."
        confidence={0.90}
        severity="opportunity"
        icon={Sparkles}
        actionLabel="Update Schedule"
        onAction={() => {}}
        metric="3x peak variance"
        metricLabel="Usage Disparity"
        agentSource="Naltos Agent"
      />

      {isLoading ? (
        <KpiSkeleton />
      ) : amenitiesError ? (
        <ErrorState message="Failed to load amenity data" />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3" data-testid="grid-kpi-cards">
          {kpiCards.map((card, index) => (
            <Card key={card.title} className="hover-elevate" data-testid={`card-kpi-${index}`}>
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-1 pt-3 px-3">
                <CardTitle className="text-xs font-medium text-muted-foreground">{card.title}</CardTitle>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="text-xl font-mono tabular-nums font-semibold" data-testid={`text-kpi-value-${index}`}>{card.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList data-testid="tabs-amenities">
          <TabsTrigger value="overview" data-testid="tab-overview">Amenity Overview</TabsTrigger>
          <TabsTrigger value="reservations" data-testid="tab-reservations">Reservations</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">Usage Analytics</TabsTrigger>
          <TabsTrigger value="equipment" data-testid="tab-equipment">Equipment & Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {amenitiesLoading ? (
            <AmenitiesSkeleton />
          ) : amenitiesError ? (
            <ErrorState message="Failed to load amenities" />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
              {amenities.map((amenity, index) => {
                const statusCfg = getStatusConfig(amenity.status || "Open");
                const StatusIcon = statusCfg.icon;
                const AmenityIcon = getIconForKey(amenity.iconKey);
                return (
                  <Card key={amenity.id} className="hover-elevate" data-testid={`card-amenity-${index}`}>
                    <CardHeader className="pb-2 pt-3 px-3">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                            <AmenityIcon className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <CardTitle className="text-sm">{amenity.name}</CardTitle>
                        </div>
                        <Badge variant={statusCfg.variant} className="text-xs">
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {amenity.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="px-3 pb-3 space-y-2">
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <div>
                          <span className="text-muted-foreground">Capacity</span>
                          <div className="font-medium" data-testid={`text-capacity-${index}`}>{amenity.capacity}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Utilization</span>
                          <div className="font-medium">{amenity.utilization ?? 0}%</div>
                        </div>
                      </div>
                      <div className="text-xs">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {amenity.hours}
                        </div>
                      </div>
                      {amenity.revenue && (
                        <div className="flex items-center justify-between gap-1 text-xs">
                          <span className="text-muted-foreground">Revenue</span>
                          <span className="font-medium">{amenity.revenue}</span>
                        </div>
                      )}
                      {amenity.rules && (
                        <div className="text-xs text-muted-foreground border-t pt-1">
                          <AlertTriangle className="w-3 h-3 inline mr-1" />
                          {amenity.rules}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reservations" className="space-y-4">
          <Card data-testid="card-reservations">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <Calendar className="w-5 h-5 text-primary" />
                  <CardTitle>Upcoming Reservations</CardTitle>
                  {!reservationsLoading && (
                    <Badge variant="secondary" className="text-xs" data-testid="badge-active-count">
                      {reservations.filter(r => r.status !== "Cancelled").length} active
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[150px]" data-testid="select-amenity-filter">
                      <SelectValue placeholder="Filter amenity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Amenities</SelectItem>
                      <SelectItem value="pool">Pool</SelectItem>
                      <SelectItem value="community">Community Room</SelectItem>
                      <SelectItem value="rooftop">Rooftop Lounge</SelectItem>
                      <SelectItem value="bbq">BBQ Area</SelectItem>
                      <SelectItem value="business">Business Center</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" data-testid="button-new-reservation">
                    <Plus className="w-4 h-4 mr-1" />
                    New Booking
                  </Button>
                </div>
              </div>
              <CardDescription>Manage tenant reservations across all amenities</CardDescription>
            </CardHeader>
            <CardContent>
              {reservationsLoading ? (
                <ReservationsSkeleton />
              ) : reservationsError ? (
                <div className="text-sm text-muted-foreground text-center py-8" data-testid="error-reservations">
                  Failed to load reservations
                </div>
              ) : (
                <div className="space-y-2">
                  {reservations.map((res) => (
                    <div
                      key={res.id}
                      className="flex items-center justify-between gap-3 p-3 border rounded-lg flex-wrap"
                      data-testid={`row-reservation-${res.id}`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-wrap">
                        <div className="flex-shrink-0 w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                          <span className="text-xs font-semibold">{res.unit}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium" data-testid={`text-resident-${res.id}`}>{res.resident}</span>
                            <Badge variant="outline" className="text-xs">{res.amenity}</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {res.reservationDate}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {res.time}
                            </span>
                            {res.guests != null && res.guests > 0 && (
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {res.guests} guests
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {getReservationStatusBadge(res.status || "")}
                        <Button variant="ghost" size="icon" data-testid={`button-view-reservation-${res.id}`}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AINudgeCard
            title="Pool Hours Extension Recommendation"
            insight="Agent recommends extending pool hours on weekends -- demand data shows 35% of denied requests are for Saturday 8-10 PM slot."
            confidence={0.86}
            severity="opportunity"
            icon={Sparkles}
            actionLabel="Review Proposal"
            onAction={() => {}}
            metric="35% denied"
            metricLabel="Saturday 8-10 PM"
            agentSource="Naltos Agent"
          />

          <Card data-testid="card-usage-by-day">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <BarChart3 className="w-5 h-5 text-primary" />
                <CardTitle>Usage by Day of Week</CardTitle>
              </div>
              <CardDescription>Average daily bookings across all amenities</CardDescription>
            </CardHeader>
            <CardContent>
              {usageLoading ? (
                <div className="flex items-end gap-2 h-40">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <Skeleton className="h-3 w-6" />
                      <Skeleton className="w-full rounded-t-md" style={{ height: `${30 + Math.random() * 50}%` }} />
                      <Skeleton className="h-3 w-6" />
                    </div>
                  ))}
                </div>
              ) : usageError ? (
                <div className="text-sm text-muted-foreground text-center py-8" data-testid="error-usage">
                  Failed to load usage data
                </div>
              ) : (
                <div className="flex items-end gap-2 h-40">
                  {usageByDay.map((d) => {
                    const total = (d.gym ?? 0) + (d.pool ?? 0) + (d.lounge ?? 0) + (d.courtyard ?? 0);
                    return (
                      <div key={d.id} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs font-medium" data-testid={`text-usage-total-${d.day}`}>{total}</span>
                        <div
                          className="w-full bg-primary/80 rounded-t-md"
                          style={{ height: `${(total / 200) * 100}%` }}
                          data-testid={`bar-usage-${(d.day || '').toLowerCase()}`}
                        />
                        <span className="text-xs text-muted-foreground">{d.day}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-utilization">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <TrendingUp className="w-5 h-5 text-primary" />
                <CardTitle>Amenity Utilization</CardTitle>
                <Badge variant="secondary" className="text-xs">Monthly</Badge>
              </div>
              <CardDescription>Utilization rate per amenity</CardDescription>
            </CardHeader>
            <CardContent>
              {amenitiesLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="flex-1 h-2" />
                      <Skeleton className="h-4 w-10" />
                    </div>
                  ))}
                </div>
              ) : amenitiesError ? (
                <div className="text-sm text-muted-foreground text-center py-8">
                  Failed to load utilization data
                </div>
              ) : (
                <div className="space-y-3">
                  {amenities.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-3 flex-wrap" data-testid={`row-utilization-${index}`}>
                      <span className="text-sm font-medium w-32 flex-shrink-0">{item.name}</span>
                      <div className="flex-1 flex items-center gap-2 min-w-[200px]">
                        <Progress value={item.utilization ?? 0} className="flex-1 h-2" />
                        <span className="text-sm font-mono w-10 text-right" data-testid={`text-utilization-${index}`}>{item.utilization ?? 0}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipment" className="space-y-4">
          <Card data-testid="card-equipment">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Wrench className="w-5 h-5 text-primary" />
                <CardTitle>Equipment Inventory & Maintenance</CardTitle>
                <Badge variant="secondary" className="text-xs">{equipment.length} items</Badge>
              </div>
              <CardDescription>Track equipment condition, service schedule, and replacement costs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {equipment.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 p-3 border rounded-lg flex-wrap"
                    data-testid={`row-equipment-${item.id}`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-wrap">
                      <div className="flex-shrink-0 w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                        <Wrench className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium" data-testid={`text-equipment-name-${item.id}`}>{item.name}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                          <span>{item.location}</span>
                          <span className="text-muted-foreground/50">|</span>
                          <span>Serviced: {item.lastServiced}</span>
                          <span className="text-muted-foreground/50">|</span>
                          <span className={item.nextService === "Overdue" ? "text-red-600 font-medium" : ""}>
                            Next: {item.nextService}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {getConditionBadge(item.condition)}
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Replace cost</div>
                        <div className="text-sm font-medium" data-testid={`text-cost-${item.id}`}>{item.cost}</div>
                      </div>
                      <Button variant="ghost" size="icon" data-testid={`button-view-equipment-${item.id}`}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
