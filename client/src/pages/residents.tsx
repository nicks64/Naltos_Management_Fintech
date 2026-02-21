import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AINudgeCard, AgentInsightStrip } from "@/components/ai-nudge-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Home,
  PawPrint,
  Car,
  Phone,
  Brain,
  Search,
  Filter,
  Target,
  UserPlus,
  Mail,
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Heart,
  type LucideIcon,
} from "lucide-react";

const agentInsights = [
  { text: "Resident satisfaction score trending up 4.2% this quarter", severity: "positive" as const },
  { text: "12 residents with 3+ maintenance requests in 30 days", severity: "warning" as const, confidence: 0.85 },
  { text: "98.4% on-time payment rate across all residents", severity: "positive" as const },
];

const leaseStatusVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  Active: "default",
  "Month-to-Month": "outline",
  "Notice Given": "destructive",
  Expired: "secondary",
  active: "default",
  expired: "secondary",
};

const paymentVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  Excellent: "secondary",
  Good: "default",
  Fair: "outline",
  Poor: "destructive",
};

const vaccinationVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  Current: "secondary",
  Expired: "destructive",
};

function derivePaymentHistory(paymentProbability: number | undefined | null): string {
  if (paymentProbability == null) return "Fair";
  if (paymentProbability > 0.9) return "Excellent";
  if (paymentProbability > 0.7) return "Good";
  return "Fair";
}

function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[0, 1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-1 pt-3 px-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-4 rounded" />
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

function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="p-3 space-y-3">
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

export default function Residents() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: residentsData, isLoading: residentsLoading, error: residentsError } = useQuery<any[]>({
    queryKey: ['/api/residents'],
  });

  const { data: householdsData, isLoading: householdsLoading, error: householdsError } = useQuery<any[]>({
    queryKey: ['/api/residents/households'],
  });

  const { data: petsData, isLoading: petsLoading, error: petsError } = useQuery<any[]>({
    queryKey: ['/api/residents/pets'],
  });

  const { data: vehiclesData, isLoading: vehiclesLoading, error: vehiclesError } = useQuery<any[]>({
    queryKey: ['/api/residents/vehicles'],
  });

  const { data: leasesData, isLoading: leasesLoading } = useQuery<any[]>({
    queryKey: ['/api/leases'],
  });

  const residents = residentsData ?? [];
  const households = householdsData ?? [];
  const pets = petsData ?? [];
  const vehicles = vehiclesData ?? [];
  const leases = leasesData ?? [];

  const isMainLoading = residentsLoading || leasesLoading;

  const leaseByTenantId = new Map<string, any>();
  leases.forEach((l: any) => {
    if (l.tenantId) leaseByTenantId.set(l.tenantId, l);
  });

  const mappedResidents = residents.map((r: any) => {
    const lease = leaseByTenantId.get(r.id);
    return {
      id: r.id,
      name: r.name ?? "Unknown",
      unit: lease?.unitNumber ?? "N/A",
      leaseStatus: lease?.status ? (lease.status.charAt(0).toUpperCase() + lease.status.slice(1)) : "N/A",
      moveIn: formatDate(lease?.startDate),
      email: r.email ?? "",
      phone: r.phone ?? "",
      paymentHistory: derivePaymentHistory(r.paymentProbability),
    };
  });

  const filteredResidents = mappedResidents.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return r.name.toLowerCase().includes(q) || r.unit.toLowerCase().includes(q);
  });

  const kpiCards = [
    { title: "Total Residents", value: String(residents.length), change: `${residents.length} registered`, icon: Users },
    { title: "Active Households", value: String(households.length), change: `${households.length > 0 ? (households.reduce((sum: number, h: any) => sum + (h.totalOccupants || 0), 0) / households.length).toFixed(1) : "0"} avg occupants`, icon: Home },
    { title: "Pet Registrations", value: String(pets.length), change: `${residents.length > 0 ? Math.round((pets.length / residents.length) * 100) : 0}% of residents`, icon: PawPrint },
    { title: "Vehicle Permits", value: String(vehicles.length), change: `${vehicles.length} registered`, icon: Car },
  ];

  return (
    <div className="space-y-6" data-testid="page-residents">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-page-title">Resident Management</h1>
          <p className="text-muted-foreground">Tenant profiles, households, pets, vehicles, and emergency contacts</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs" data-testid="badge-agent-status">
            <Brain className="w-3 h-3 mr-1 text-primary" />
            Agent Active
          </Badge>
          <Button size="sm" data-testid="button-add-resident">
            <UserPlus className="w-3 h-3 mr-1" />
            Add Resident
          </Button>
        </div>
      </div>

      <AgentInsightStrip insights={agentInsights} />

      <AINudgeCard
        title="Resident Satisfaction Opportunity"
        insight="Agent analysis shows residents in Building B have 18% lower satisfaction scores, primarily driven by elevator wait times and package delivery delays. Targeted improvement plan could increase retention by 12%."
        confidence={0.84}
        severity="opportunity"
        icon={Target}
        actionLabel="View Improvement Plan"
        onAction={() => {}}
        secondaryLabel="See Analysis"
        onSecondary={() => {}}
        metric="12% retention lift"
        metricLabel="Est. Impact"
      />

      {isMainLoading ? (
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
                <div className="flex items-center gap-1 text-xs mt-0.5 text-muted-foreground">
                  {card.change}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Search:</span>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or unit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-2 text-sm border rounded-md bg-background w-[250px]"
            data-testid="input-search-residents"
          />
        </div>
        <Badge variant="secondary" className="text-xs" data-testid="badge-resident-count">
          {filteredResidents.length} residents
        </Badge>
      </div>

      <Tabs defaultValue="all-residents" className="space-y-4">
        <TabsList data-testid="tabs-residents">
          <TabsTrigger value="all-residents" data-testid="tab-all-residents">All Residents</TabsTrigger>
          <TabsTrigger value="households" data-testid="tab-households">Households</TabsTrigger>
          <TabsTrigger value="pet-registry" data-testid="tab-pet-registry">Pet Registry</TabsTrigger>
          <TabsTrigger value="vehicle-registry" data-testid="tab-vehicle-registry">Vehicle Registry</TabsTrigger>
        </TabsList>

        <TabsContent value="all-residents" className="space-y-4">
          <Card data-testid="card-residents">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Users className="w-5 h-5 text-primary" />
                <CardTitle>Resident Directory</CardTitle>
                <Badge variant="secondary" className="text-xs">{filteredResidents.length} residents</Badge>
              </div>
              <CardDescription>Complete resident listing with lease and payment status</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {residentsError ? (
                <div className="p-6 text-center text-destructive" data-testid="error-residents">
                  <AlertTriangle className="w-5 h-5 mx-auto mb-2" />
                  <p className="text-sm">Failed to load residents. Please try again.</p>
                </div>
              ) : residentsLoading || leasesLoading ? (
                <TableSkeleton rows={6} cols={6} />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="p-3 font-medium text-muted-foreground">Name</th>
                        <th className="p-3 font-medium text-muted-foreground">Unit</th>
                        <th className="p-3 font-medium text-muted-foreground">Lease Status</th>
                        <th className="p-3 font-medium text-muted-foreground">Move-In</th>
                        <th className="p-3 font-medium text-muted-foreground">Contact</th>
                        <th className="p-3 font-medium text-muted-foreground">Payment History</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredResidents.map((r, idx) => (
                        <tr key={r.id || idx} className="border-b last:border-0 hover-elevate" data-testid={`row-resident-${idx}`}>
                          <td className="p-3 font-medium">{r.name}</td>
                          <td className="p-3 text-muted-foreground">{r.unit}</td>
                          <td className="p-3">
                            <Badge variant={leaseStatusVariant[r.leaseStatus] ?? "outline"} className="text-xs" data-testid={`badge-lease-status-${idx}`}>
                              {r.leaseStatus}
                            </Badge>
                          </td>
                          <td className="p-3 text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <CalendarDays className="w-3.5 h-3.5" />
                              {r.moveIn}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Mail className="w-3 h-3" />
                                {r.email}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                {r.phone}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge variant={paymentVariant[r.paymentHistory] ?? "outline"} className="text-xs" data-testid={`badge-payment-${idx}`}>
                              {r.paymentHistory}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                      {filteredResidents.length === 0 && !residentsLoading && (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-muted-foreground">
                            No residents found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="households" className="space-y-4">
          <Card data-testid="card-households">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Home className="w-5 h-5 text-primary" />
                <CardTitle>Household Directory</CardTitle>
                <Badge variant="secondary" className="text-xs">{households.length} households</Badge>
              </div>
              <CardDescription>Household groupings with all registered occupants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {householdsError ? (
                <div className="p-6 text-center text-destructive" data-testid="error-households">
                  <AlertTriangle className="w-5 h-5 mx-auto mb-2" />
                  <p className="text-sm">Failed to load households. Please try again.</p>
                </div>
              ) : householdsLoading ? (
                <TableSkeleton rows={4} cols={3} />
              ) : households.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">No households found</div>
              ) : (
                households.map((h: any, idx: number) => (
                  <div key={h.tenantId || idx} className="p-4 border rounded-lg space-y-2" data-testid={`card-household-${idx}`}>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{h.primary}</span>
                        <Badge variant="secondary" className="text-xs" data-testid={`badge-occupants-${idx}`}>
                          <Users className="w-3 h-3 mr-1" />
                          {h.totalOccupants} occupant{h.totalOccupants !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">Primary Leaseholder</span>
                    </div>
                    {h.members && h.members.length > 0 && (
                      <div className="pl-4 space-y-1">
                        {h.members.map((occ: any, oidx: number) => (
                          <div key={oidx} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{occ.name}</span>
                            <Badge variant="outline" className="text-[10px]">{occ.relationship}</Badge>
                            {occ.isMinor && <Badge variant="outline" className="text-[10px]">Minor</Badge>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pet-registry" className="space-y-4">
          <Card data-testid="card-pet-registry">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <PawPrint className="w-5 h-5 text-primary" />
                <CardTitle>Pet Registry</CardTitle>
                <Badge variant="secondary" className="text-xs">{pets.length} registered pets</Badge>
              </div>
              <CardDescription>Registered pets with vaccination status and deposit tracking</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {petsError ? (
                <div className="p-6 text-center text-destructive" data-testid="error-pets">
                  <AlertTriangle className="w-5 h-5 mx-auto mb-2" />
                  <p className="text-sm">Failed to load pet registrations. Please try again.</p>
                </div>
              ) : petsLoading ? (
                <TableSkeleton rows={5} cols={8} />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="p-3 font-medium text-muted-foreground">Owner</th>
                        <th className="p-3 font-medium text-muted-foreground">Type</th>
                        <th className="p-3 font-medium text-muted-foreground">Breed</th>
                        <th className="p-3 font-medium text-muted-foreground">Name</th>
                        <th className="p-3 font-medium text-muted-foreground">Weight</th>
                        <th className="p-3 font-medium text-muted-foreground">Vaccination</th>
                        <th className="p-3 font-medium text-muted-foreground">Deposit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pets.map((pet: any, idx: number) => {
                        const vaccStatus = pet.vaccinated ? "Current" : "Expired";
                        return (
                          <tr key={pet.id || idx} className="border-b last:border-0 hover-elevate" data-testid={`row-pet-${idx}`}>
                            <td className="p-3 font-medium">{pet.ownerName ?? "Unknown"}</td>
                            <td className="p-3 text-muted-foreground">{pet.species ?? "N/A"}</td>
                            <td className="p-3 text-muted-foreground">{pet.breed ?? "N/A"}</td>
                            <td className="p-3 font-medium">{pet.name}</td>
                            <td className="p-3 text-muted-foreground">{pet.weight ? `${pet.weight} lbs` : "N/A"}</td>
                            <td className="p-3">
                              <Badge variant={vaccinationVariant[vaccStatus]} className="text-xs" data-testid={`badge-vaccination-${idx}`}>
                                {vaccStatus === "Current" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                {vaccStatus === "Expired" && <AlertTriangle className="w-3 h-3 mr-1" />}
                                {vaccStatus}
                              </Badge>
                            </td>
                            <td className="p-3 font-mono tabular-nums">{pet.depositPaid ? "Paid" : "Unpaid"}</td>
                          </tr>
                        );
                      })}
                      {pets.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-6 text-center text-muted-foreground">No pets registered</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicle-registry" className="space-y-4">
          <Card data-testid="card-vehicle-registry">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Car className="w-5 h-5 text-primary" />
                <CardTitle>Vehicle Registry</CardTitle>
                <Badge variant="secondary" className="text-xs">{vehicles.length} registered</Badge>
              </div>
              <CardDescription>Registered vehicles with parking assignments and permit status</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {vehiclesError ? (
                <div className="p-6 text-center text-destructive" data-testid="error-vehicles">
                  <AlertTriangle className="w-5 h-5 mx-auto mb-2" />
                  <p className="text-sm">Failed to load vehicle permits. Please try again.</p>
                </div>
              ) : vehiclesLoading ? (
                <TableSkeleton rows={5} cols={7} />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="p-3 font-medium text-muted-foreground">Resident</th>
                        <th className="p-3 font-medium text-muted-foreground">Vehicle</th>
                        <th className="p-3 font-medium text-muted-foreground">Color</th>
                        <th className="p-3 font-medium text-muted-foreground">License Plate</th>
                        <th className="p-3 font-medium text-muted-foreground">Parking Spot</th>
                        <th className="p-3 font-medium text-muted-foreground">Permit Status</th>
                        <th className="p-3 font-medium text-muted-foreground">Permit Expiry</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicles.map((v: any, idx: number) => (
                        <tr key={v.id || idx} className="border-b last:border-0 hover-elevate" data-testid={`row-vehicle-${idx}`}>
                          <td className="p-3 font-medium">{v.ownerName ?? "Unknown"}</td>
                          <td className="p-3 text-muted-foreground">{v.year} {v.make} {v.model}</td>
                          <td className="p-3 text-muted-foreground">{v.color}</td>
                          <td className="p-3 font-mono text-xs">{v.licensePlate}</td>
                          <td className="p-3">
                            <Badge variant="outline" className="text-xs">{v.parkingSpace ?? "N/A"}</Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant={v.permitStatus === "active" ? "default" : "outline"} className="text-xs" data-testid={`badge-permit-status-${idx}`}>
                              {v.permitStatus ? (v.permitStatus.charAt(0).toUpperCase() + v.permitStatus.slice(1)) : "N/A"}
                            </Badge>
                          </td>
                          <td className="p-3 text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <CalendarDays className="w-3.5 h-3.5" />
                              {formatDate(v.permitExpiry)}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {vehicles.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-6 text-center text-muted-foreground">No vehicles registered</td>
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
