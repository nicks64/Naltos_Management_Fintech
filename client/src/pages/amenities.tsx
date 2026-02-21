import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AINudgeCard, AgentInsightStrip } from "@/components/ai-nudge-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
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
  type LucideIcon,
} from "lucide-react";

const agentInsights = [
  { text: "Pool reservation 94% capacity this weekend", severity: "warning" as const, confidence: 0.91 },
  { text: "Gym equipment maintenance due in 5 days", severity: "warning" as const, confidence: 0.87 },
  { text: "Community room booked 23 times this month (+15%)", severity: "positive" as const },
];

const kpiCards = [
  { title: "Total Amenities", value: "8", change: "All operational", trend: "up", icon: Building, color: "text-blue-600" },
  { title: "Active Reservations", value: "47", change: "+12 this week", trend: "up", icon: Calendar, color: "text-emerald-600" },
  { title: "Utilization Rate", value: "73%", change: "+5% vs last month", trend: "up", icon: TrendingUp, color: "text-indigo-600" },
  { title: "Revenue (MTD)", value: "$4,820", change: "+18% vs Feb", trend: "up", icon: DollarSign, color: "text-green-600" },
  { title: "Maintenance Alerts", value: "3", change: "1 urgent", trend: "down", icon: Wrench, color: "text-amber-600" },
  { title: "Tenant Satisfaction", value: "4.6", change: "+0.2 pts", trend: "up", icon: Star, color: "text-violet-600" },
];

const amenities = [
  { name: "Pool", icon: Waves, status: "Open", capacity: "18/25", reservations: 6, hours: "6:00 AM - 10:00 PM", trend: "+12%", restriction: "No glass containers" },
  { name: "Fitness Center", icon: Dumbbell, status: "Open", capacity: "8/15", reservations: 0, hours: "24/7", trend: "+8%", restriction: null },
  { name: "Community Room", icon: Users, status: "Open", capacity: "0/40", reservations: 3, hours: "8:00 AM - 11:00 PM", trend: "+15%", restriction: "Reserve 48hrs ahead" },
  { name: "Rooftop Lounge", icon: Building, status: "Open", capacity: "12/30", reservations: 4, hours: "10:00 AM - 11:00 PM", trend: "+22%", restriction: "21+ after 8 PM" },
  { name: "Business Center", icon: Monitor, status: "Open", capacity: "3/8", reservations: 2, hours: "7:00 AM - 9:00 PM", trend: "-3%", restriction: null },
  { name: "Dog Park", icon: Dog, status: "Open", capacity: "5/10", reservations: 0, hours: "6:00 AM - 9:00 PM", trend: "+5%", restriction: "Leash required at entry" },
  { name: "BBQ Area", icon: Flame, status: "Maintenance", capacity: "0/4", reservations: 0, hours: "10:00 AM - 9:00 PM", trend: "-8%", restriction: "Closed for grill repair" },
  { name: "Package Room", icon: Package, status: "Open", capacity: "N/A", reservations: 0, hours: "24/7", trend: "+30%", restriction: null },
];

const reservations = [
  { id: 1, tenant: "Sarah Mitchell", unit: "4A", amenity: "Pool", date: "Feb 22, 2026", time: "2:00 PM", duration: "2 hrs", status: "Confirmed", request: null },
  { id: 2, tenant: "Marcus Johnson", unit: "2D", amenity: "Community Room", date: "Feb 22, 2026", time: "6:00 PM", duration: "3 hrs", status: "Confirmed", request: "Setup tables for 20 guests" },
  { id: 3, tenant: "Priya Patel", unit: "3B", amenity: "Rooftop Lounge", date: "Feb 23, 2026", time: "5:00 PM", duration: "4 hrs", status: "Pending", request: "Birthday celebration, 15 attendees" },
  { id: 4, tenant: "Kevin Moore", unit: "7C", amenity: "Pool", date: "Feb 23, 2026", time: "10:00 AM", duration: "2 hrs", status: "Confirmed", request: null },
  { id: 5, tenant: "Lisa Park", unit: "1A", amenity: "Community Room", date: "Feb 24, 2026", time: "9:00 AM", duration: "2 hrs", status: "Confirmed", request: "Book club meeting" },
  { id: 6, tenant: "James Torres", unit: "5B", amenity: "Rooftop Lounge", date: "Feb 24, 2026", time: "7:00 PM", duration: "3 hrs", status: "Pending", request: "Dinner party, catering delivery at 6:30 PM" },
  { id: 7, tenant: "Rachel Chen", unit: "8A", amenity: "BBQ Area", date: "Feb 25, 2026", time: "12:00 PM", duration: "3 hrs", status: "Cancelled", request: "Cancelled due to maintenance" },
  { id: 8, tenant: "David Kim", unit: "6B", amenity: "Pool", date: "Feb 25, 2026", time: "4:00 PM", duration: "2 hrs", status: "Confirmed", request: null },
  { id: 9, tenant: "Amanda Foster", unit: "9D", amenity: "Community Room", date: "Feb 26, 2026", time: "10:00 AM", duration: "2 hrs", status: "Confirmed", request: "Yoga class, need open space" },
  { id: 10, tenant: "Carlos Rivera", unit: "10C", amenity: "Rooftop Lounge", date: "Feb 27, 2026", time: "6:00 PM", duration: "2 hrs", status: "Pending", request: null },
  { id: 11, tenant: "Emily Watson", unit: "4F", amenity: "Business Center", date: "Feb 27, 2026", time: "1:00 PM", duration: "3 hrs", status: "Confirmed", request: "Need projector and whiteboard" },
  { id: 12, tenant: "Michael Brown", unit: "3A", amenity: "Pool", date: "Feb 28, 2026", time: "11:00 AM", duration: "2 hrs", status: "Confirmed", request: null },
];

const usageByDay = [
  { day: "Mon", usage: 42 },
  { day: "Tue", usage: 38 },
  { day: "Wed", usage: 45 },
  { day: "Thu", usage: 40 },
  { day: "Fri", usage: 55 },
  { day: "Sat", usage: 72 },
  { day: "Sun", usage: 65 },
];

const amenityUtilization = [
  { name: "Pool", utilization: 82, peakHours: "2-6 PM", monthlyTrend: "+12%" },
  { name: "Fitness Center", utilization: 68, peakHours: "6-8 AM, 5-7 PM", monthlyTrend: "+8%" },
  { name: "Community Room", utilization: 56, peakHours: "6-9 PM", monthlyTrend: "+15%" },
  { name: "Rooftop Lounge", utilization: 74, peakHours: "5-10 PM", monthlyTrend: "+22%" },
  { name: "Business Center", utilization: 41, peakHours: "9 AM-12 PM", monthlyTrend: "-3%" },
  { name: "Dog Park", utilization: 45, peakHours: "7-9 AM, 5-7 PM", monthlyTrend: "+5%" },
  { name: "BBQ Area", utilization: 0, peakHours: "N/A (Maintenance)", monthlyTrend: "-8%" },
  { name: "Package Room", utilization: 88, peakHours: "5-7 PM", monthlyTrend: "+30%" },
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

export default function Amenities() {
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpiCards.map((card, index) => (
          <Card key={card.title} className="hover-elevate" data-testid={`card-kpi-${index}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-1 pt-3 px-3">
              <CardTitle className="text-xs font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="text-xl font-mono tabular-nums font-semibold" data-testid={`text-kpi-value-${index}`}>{card.value}</div>
              <div className="flex items-center gap-1 text-xs mt-0.5">
                {card.trend === "up" ? (
                  <TrendingUp className="w-3 h-3 text-green-600" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-600" />
                )}
                <span className={card.trend === "up" ? "text-green-600" : "text-red-600"}>{card.change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList data-testid="tabs-amenities">
          <TabsTrigger value="overview" data-testid="tab-overview">Amenity Overview</TabsTrigger>
          <TabsTrigger value="reservations" data-testid="tab-reservations">Reservations</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">Usage Analytics</TabsTrigger>
          <TabsTrigger value="equipment" data-testid="tab-equipment">Equipment & Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {amenities.map((amenity, index) => {
              const statusCfg = getStatusConfig(amenity.status);
              const StatusIcon = statusCfg.icon;
              return (
                <Card key={amenity.name} className="hover-elevate" data-testid={`card-amenity-${index}`}>
                  <CardHeader className="pb-2 pt-3 px-3">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                          <amenity.icon className="w-4 h-4 text-muted-foreground" />
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
                        <span className="text-muted-foreground">Today</span>
                        <div className="font-medium">{amenity.reservations} bookings</div>
                      </div>
                    </div>
                    <div className="text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {amenity.hours}
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-1 text-xs">
                      <span className="text-muted-foreground">Monthly trend</span>
                      <span className={amenity.trend.startsWith("+") ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                        {amenity.trend}
                      </span>
                    </div>
                    {amenity.restriction && (
                      <div className="text-xs text-muted-foreground border-t pt-1">
                        <AlertTriangle className="w-3 h-3 inline mr-1" />
                        {amenity.restriction}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="reservations" className="space-y-4">
          <Card data-testid="card-reservations">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <Calendar className="w-5 h-5 text-primary" />
                  <CardTitle>Upcoming Reservations</CardTitle>
                  <Badge variant="secondary" className="text-xs">{reservations.filter(r => r.status !== "Cancelled").length} active</Badge>
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
                          <span className="text-sm font-medium" data-testid={`text-tenant-${res.id}`}>{res.tenant}</span>
                          <Badge variant="outline" className="text-xs">{res.amenity}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {res.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {res.time} ({res.duration})
                          </span>
                        </div>
                        {res.request && (
                          <div className="text-xs text-muted-foreground mt-0.5 italic">
                            {res.request}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {getReservationStatusBadge(res.status)}
                      <Button variant="ghost" size="icon" data-testid={`button-view-reservation-${res.id}`}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
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
              <div className="flex items-end gap-2 h-40">
                {usageByDay.map((d) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-medium">{d.usage}</span>
                    <div
                      className="w-full bg-primary/80 rounded-t-md"
                      style={{ height: `${(d.usage / 80) * 100}%` }}
                      data-testid={`bar-usage-${d.day.toLowerCase()}`}
                    />
                    <span className="text-xs text-muted-foreground">{d.day}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-utilization">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <TrendingUp className="w-5 h-5 text-primary" />
                <CardTitle>Amenity Utilization</CardTitle>
                <Badge variant="secondary" className="text-xs">Monthly</Badge>
              </div>
              <CardDescription>Utilization rate, peak hours, and monthly trends per amenity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {amenityUtilization.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-3 flex-wrap" data-testid={`row-utilization-${index}`}>
                    <span className="text-sm font-medium w-32 flex-shrink-0">{item.name}</span>
                    <div className="flex-1 flex items-center gap-2 min-w-[200px]">
                      <Progress value={item.utilization} className="flex-1 h-2" />
                      <span className="text-sm font-mono w-10 text-right" data-testid={`text-utilization-${index}`}>{item.utilization}%</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.peakHours}
                      </span>
                      <span className={item.monthlyTrend.startsWith("+") ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                        {item.monthlyTrend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
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
