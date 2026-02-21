import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const agentInsights = [
  { text: "Parking utilization at 84.8% across all zones", severity: "positive" as const },
  { text: "12 permits expiring within 7 days", severity: "warning" as const },
  { text: "5 active violations requiring resolution", severity: "critical" as const },
];

const kpiCards = [
  { title: "Total Spaces", value: "420", change: "Across 3 structures", trend: "neutral", icon: SquareParking },
  { title: "Assigned", value: "356", change: "84.8% occupied", trend: "positive", icon: Car },
  { title: "Available", value: "64", change: "15.2% open", trend: "positive", icon: ParkingSquare },
  { title: "Active Violations", value: "5", change: "+2 this week", trend: "warning", icon: AlertTriangle },
];

const spaceAssignments = [
  { space: "A-101", type: "Covered", tenant: "Sarah Chen", unit: "4B", vehicle: "2023 Tesla Model 3 (Silver)", fee: "$150", status: "Active" },
  { space: "A-102", type: "Covered", tenant: "James Wilson", unit: "2A", vehicle: "2022 Honda Accord (Black)", fee: "$150", status: "Active" },
  { space: "B-205", type: "Uncovered", tenant: "Maria Santos", unit: "6C", vehicle: "2021 Toyota RAV4 (White)", fee: "$75", status: "Active" },
  { space: "G-012", type: "Garage", tenant: "Robert Kim", unit: "8A", vehicle: "2024 BMW X5 (Blue)", fee: "$225", status: "Active" },
  { space: "R-001", type: "Reserved", tenant: "Property Manager", unit: "Office", vehicle: "2023 Ford Explorer (Gray)", fee: "$0", status: "Active" },
  { space: "B-310", type: "Uncovered", tenant: "Emily Davis", unit: "5D", vehicle: "2020 Subaru Outback (Green)", fee: "$75", status: "Past Due" },
  { space: "G-015", type: "Garage", tenant: "Michael Brown", unit: "3C", vehicle: "2022 Audi Q7 (Black)", fee: "$225", status: "Active" },
];

const permits = [
  { permit: "PRK-2401", type: "Resident", holder: "Sarah Chen", vehicle: "2023 Tesla Model 3", issued: "Jan 1, 2026", expiry: "Dec 31, 2026", status: "Active" },
  { permit: "PRK-2402", type: "Visitor", holder: "Guest of Unit 4B", vehicle: "2019 Honda Civic (Red)", issued: "Feb 18, 2026", expiry: "Feb 21, 2026", status: "Expiring" },
  { permit: "PRK-2403", type: "Contractor", holder: "AquaFix Plumbing", vehicle: "2022 Ford Transit (White)", issued: "Feb 15, 2026", expiry: "Feb 28, 2026", status: "Active" },
  { permit: "PRK-2404", type: "Temporary", holder: "Unit 7A Move-in", vehicle: "2024 U-Haul Truck", issued: "Feb 20, 2026", expiry: "Feb 22, 2026", status: "Active" },
  { permit: "PRK-2405", type: "Resident", holder: "David Park", vehicle: "2021 Hyundai Sonata", issued: "Jan 1, 2026", expiry: "Dec 31, 2026", status: "Active" },
  { permit: "PRK-2406", type: "Visitor", holder: "Guest of Unit 2A", vehicle: "2020 Chevy Malibu (Gray)", issued: "Feb 10, 2026", expiry: "Feb 13, 2026", status: "Expired" },
];

const violations = [
  { date: "Feb 20, 2026", space: "B-220", type: "Unauthorized", vehicle: "Red Sedan, Plate: ABC-1234", photo: "Captured", resolution: "Pending" },
  { date: "Feb 19, 2026", space: "A-105", type: "Expired Permit", vehicle: "Blue SUV, Plate: XYZ-5678", photo: "Captured", resolution: "Warning Issued" },
  { date: "Feb 18, 2026", space: "G-008", type: "Wrong Space", vehicle: "White Truck, Plate: DEF-9012", photo: "Captured", resolution: "Resolved" },
  { date: "Feb 17, 2026", space: "B-301", type: "Abandoned", vehicle: "Gray Sedan, Plate: Unknown", photo: "Captured", resolution: "Tow Scheduled" },
  { date: "Feb 16, 2026", space: "R-003", type: "Unauthorized", vehicle: "Black Coupe, Plate: GHI-3456", photo: "Not Available", resolution: "Pending" },
];

const towingLog = [
  { date: "Feb 17, 2026", vehicle: "Gray Sedan (Unknown Plate)", reason: "Abandoned 7+ days", company: "Metro Towing", cost: "$185", notified: "N/A", status: "Completed" },
  { date: "Feb 14, 2026", vehicle: "Blue Pickup (JKL-7890)", reason: "Unauthorized parking", company: "Metro Towing", cost: "$185", notified: "Yes", status: "Completed" },
  { date: "Feb 10, 2026", vehicle: "White Van (MNO-1234)", reason: "Fire lane violation", company: "Quick Tow LLC", cost: "$225", notified: "Yes", status: "Completed" },
  { date: "Feb 8, 2026", vehicle: "Red Sedan (PQR-5678)", reason: "Expired permit (30+ days)", company: "Metro Towing", cost: "$185", notified: "Yes", status: "Disputed" },
  { date: "Feb 5, 2026", vehicle: "Black SUV (STU-9012)", reason: "Handicap violation", company: "Quick Tow LLC", cost: "$350", notified: "No", status: "Completed" },
];

const garageAccess = [
  { card: "GAR-001", tenant: "Sarah Chen", unit: "4B", level: "Full Access", lastUsed: "Feb 21, 10:32 AM", status: "Active" },
  { card: "GAR-002", tenant: "Robert Kim", unit: "8A", level: "Full Access", lastUsed: "Feb 21, 8:15 AM", status: "Active" },
  { card: "GAR-003", tenant: "Michael Brown", unit: "3C", level: "Full Access", lastUsed: "Feb 20, 6:45 PM", status: "Active" },
  { card: "GAR-004", tenant: "Lisa Wang", unit: "5A", level: "Daytime Only", lastUsed: "Feb 19, 5:30 PM", status: "Active" },
  { card: "GAR-005", tenant: "Tom Harris", unit: "7B", level: "Full Access", lastUsed: "Jan 15, 2:00 PM", status: "Suspended" },
  { card: "GAR-006", tenant: "Amanda Lopez", unit: "1D", level: "Full Access", lastUsed: "Feb 21, 7:00 AM", status: "Active" },
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
  Resolved: "secondary",
  "Warning Issued": "default",
  "Tow Scheduled": "destructive",
  Completed: "secondary",
  Disputed: "outline",
  Suspended: "destructive",
};

const violationTypeVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  Unauthorized: "destructive",
  "Expired Permit": "outline",
  "Wrong Space": "default",
  Abandoned: "destructive",
};

export default function Parking() {
  const [spaceFilter, setSpaceFilter] = useState("all");

  const filteredSpaces = spaceAssignments.filter((s) => {
    if (spaceFilter !== "all" && s.type !== spaceFilter) return false;
    return true;
  });

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
                      <th className="p-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSpaces.map((space, idx) => (
                      <tr key={space.space} className="border-b last:border-0 hover-elevate" data-testid={`row-space-${idx}`}>
                        <td className="p-3 font-mono text-xs font-medium">{space.space}</td>
                        <td className="p-3">
                          <Badge variant={typeVariant[space.type]} className="text-xs" data-testid={`badge-type-${idx}`}>
                            {space.type}
                          </Badge>
                        </td>
                        <td className="p-3">{space.tenant}</td>
                        <td className="p-3 font-medium">{space.unit}</td>
                        <td className="p-3 text-muted-foreground text-xs">{space.vehicle}</td>
                        <td className="p-3 font-mono">{space.fee}</td>
                        <td className="p-3">
                          <Badge variant={statusVariant[space.status]} className="text-xs" data-testid={`badge-status-${idx}`}>
                            {space.status}
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

        <TabsContent value="permits" className="space-y-4">
          <Card data-testid="card-permits">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <CreditCard className="w-5 h-5 text-primary" />
                <CardTitle>Active Permits</CardTitle>
                <Badge variant="secondary" className="text-xs">{permits.length} permits</Badge>
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
                      <th className="p-3 font-medium text-muted-foreground">Holder</th>
                      <th className="p-3 font-medium text-muted-foreground">Vehicle</th>
                      <th className="p-3 font-medium text-muted-foreground">Issued</th>
                      <th className="p-3 font-medium text-muted-foreground">Expiry</th>
                      <th className="p-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permits.map((permit, idx) => (
                      <tr key={permit.permit} className="border-b last:border-0 hover-elevate" data-testid={`row-permit-${idx}`}>
                        <td className="p-3 font-mono text-xs font-medium">{permit.permit}</td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-xs" data-testid={`badge-permit-type-${idx}`}>
                            {permit.type}
                          </Badge>
                        </td>
                        <td className="p-3">{permit.holder}</td>
                        <td className="p-3 text-muted-foreground text-xs">{permit.vehicle}</td>
                        <td className="p-3 text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {permit.issued}
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground">{permit.expiry}</td>
                        <td className="p-3">
                          <Badge variant={statusVariant[permit.status]} className="text-xs" data-testid={`badge-permit-status-${idx}`}>
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
        </TabsContent>

        <TabsContent value="violations" className="space-y-4">
          <Card data-testid="card-violations">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Ban className="w-5 h-5 text-primary" />
                <CardTitle>Violation Records</CardTitle>
                <Badge variant="secondary" className="text-xs">{violations.length} records</Badge>
              </div>
              <CardDescription>Parking violations, warnings, and resolution tracking</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Date</th>
                      <th className="p-3 font-medium text-muted-foreground">Space</th>
                      <th className="p-3 font-medium text-muted-foreground">Violation Type</th>
                      <th className="p-3 font-medium text-muted-foreground">Vehicle Description</th>
                      <th className="p-3 font-medium text-muted-foreground">Photo</th>
                      <th className="p-3 font-medium text-muted-foreground">Resolution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {violations.map((v, idx) => (
                      <tr key={idx} className="border-b last:border-0 hover-elevate" data-testid={`row-violation-${idx}`}>
                        <td className="p-3 text-muted-foreground">{v.date}</td>
                        <td className="p-3 font-mono text-xs font-medium">{v.space}</td>
                        <td className="p-3">
                          <Badge variant={violationTypeVariant[v.type]} className="text-xs" data-testid={`badge-violation-type-${idx}`}>
                            {v.type}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground text-xs">{v.vehicle}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5 text-xs">
                            <Camera className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className={v.photo === "Captured" ? "text-emerald-600" : "text-muted-foreground"}>{v.photo}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant={statusVariant[v.resolution]} className="text-xs" data-testid={`badge-resolution-${idx}`}>
                            {v.resolution}
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

        <TabsContent value="towing" className="space-y-4">
          <Card data-testid="card-towing-log">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Truck className="w-5 h-5 text-primary" />
                <CardTitle>Towing Log</CardTitle>
                <Badge variant="secondary" className="text-xs">{towingLog.length} records</Badge>
              </div>
              <CardDescription>Vehicle tow records, costs, and dispute tracking</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Date</th>
                      <th className="p-3 font-medium text-muted-foreground">Vehicle</th>
                      <th className="p-3 font-medium text-muted-foreground">Reason</th>
                      <th className="p-3 font-medium text-muted-foreground">Tow Company</th>
                      <th className="p-3 font-medium text-muted-foreground">Cost</th>
                      <th className="p-3 font-medium text-muted-foreground">Tenant Notified</th>
                      <th className="p-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {towingLog.map((tow, idx) => (
                      <tr key={idx} className="border-b last:border-0 hover-elevate" data-testid={`row-tow-${idx}`}>
                        <td className="p-3 text-muted-foreground">{tow.date}</td>
                        <td className="p-3 text-xs">{tow.vehicle}</td>
                        <td className="p-3 text-muted-foreground text-xs">{tow.reason}</td>
                        <td className="p-3 text-muted-foreground">{tow.company}</td>
                        <td className="p-3 font-mono">{tow.cost}</td>
                        <td className="p-3 text-muted-foreground">{tow.notified}</td>
                        <td className="p-3">
                          <Badge variant={statusVariant[tow.status]} className="text-xs" data-testid={`badge-tow-status-${idx}`}>
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
        </TabsContent>

        <TabsContent value="garage" className="space-y-4">
          <Card data-testid="card-garage-access">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <KeyRound className="w-5 h-5 text-primary" />
                <CardTitle>Garage Access Cards</CardTitle>
                <Badge variant="secondary" className="text-xs">{garageAccess.length} cards</Badge>
              </div>
              <CardDescription>Access card and fob management for parking garage entry</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Card #</th>
                      <th className="p-3 font-medium text-muted-foreground">Tenant</th>
                      <th className="p-3 font-medium text-muted-foreground">Unit</th>
                      <th className="p-3 font-medium text-muted-foreground">Access Level</th>
                      <th className="p-3 font-medium text-muted-foreground">Last Used</th>
                      <th className="p-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {garageAccess.map((card, idx) => (
                      <tr key={card.card} className="border-b last:border-0 hover-elevate" data-testid={`row-garage-${idx}`}>
                        <td className="p-3 font-mono text-xs font-medium">{card.card}</td>
                        <td className="p-3">{card.tenant}</td>
                        <td className="p-3 font-medium">{card.unit}</td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-xs" data-testid={`badge-access-level-${idx}`}>
                            {card.level}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground text-xs">{card.lastUsed}</td>
                        <td className="p-3">
                          <Badge variant={statusVariant[card.status]} className="text-xs" data-testid={`badge-garage-status-${idx}`}>
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
      </Tabs>
    </div>
  );
}
