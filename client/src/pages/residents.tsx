import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AINudgeCard, AgentInsightStrip } from "@/components/ai-nudge-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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

const kpiCards = [
  { title: "Total Residents", value: "428", change: "+8 this month", icon: Users },
  { title: "Active Households", value: "342", change: "2.1 avg occupants", icon: Home },
  { title: "Pet Registrations", value: "89", change: "26% of units", icon: PawPrint },
  { title: "Vehicle Permits", value: "267", change: "12 expiring soon", icon: Car },
];

const residents = [
  { name: "Sarah Mitchell", unit: "3A", leaseStatus: "Active", moveIn: "Mar 1, 2025", email: "s.mitchell@email.com", phone: "(555) 234-5678", paymentHistory: "Excellent" },
  { name: "James Park", unit: "7B", leaseStatus: "Active", moveIn: "Jun 1, 2025", email: "j.park@email.com", phone: "(555) 345-6789", paymentHistory: "Good" },
  { name: "Lisa Chen", unit: "2D", leaseStatus: "Month-to-Month", moveIn: "Sep 1, 2024", email: "l.chen@email.com", phone: "(555) 456-7890", paymentHistory: "Excellent" },
  { name: "Marcus Johnson", unit: "4A", leaseStatus: "Active", moveIn: "Jan 15, 2025", email: "m.johnson@email.com", phone: "(555) 567-8901", paymentHistory: "Good" },
  { name: "Priya Patel", unit: "5C", leaseStatus: "Notice Given", moveIn: "Apr 1, 2025", email: "p.patel@email.com", phone: "(555) 678-9012", paymentHistory: "Fair" },
  { name: "David Kim", unit: "8A", leaseStatus: "Active", moveIn: "Jul 1, 2024", email: "d.kim@email.com", phone: "(555) 789-0123", paymentHistory: "Excellent" },
  { name: "Rachel Torres", unit: "1B", leaseStatus: "Active", moveIn: "Nov 1, 2025", email: "r.torres@email.com", phone: "(555) 890-1234", paymentHistory: "Good" },
  { name: "Kevin Williams", unit: "6C", leaseStatus: "Active", moveIn: "Aug 1, 2025", email: "k.williams@email.com", phone: "(555) 901-2345", paymentHistory: "Fair" },
];

const households = [
  { primary: "Sarah Mitchell", unit: "3A", occupants: [{ name: "Tom Mitchell", relationship: "Spouse" }], totalOccupants: 2 },
  { primary: "James Park", unit: "7B", occupants: [{ name: "Min Park", relationship: "Spouse" }, { name: "Soo Park", relationship: "Child" }], totalOccupants: 3 },
  { primary: "Lisa Chen", unit: "2D", occupants: [], totalOccupants: 1 },
  { primary: "Marcus Johnson", unit: "4A", occupants: [{ name: "Keisha Johnson", relationship: "Spouse" }, { name: "Elijah Johnson", relationship: "Child" }, { name: "Maya Johnson", relationship: "Child" }], totalOccupants: 4 },
  { primary: "Priya Patel", unit: "5C", occupants: [{ name: "Raj Patel", relationship: "Spouse" }], totalOccupants: 2 },
  { primary: "David Kim", unit: "8A", occupants: [{ name: "Grace Kim", relationship: "Roommate" }], totalOccupants: 2 },
  { primary: "Rachel Torres", unit: "1B", occupants: [], totalOccupants: 1 },
  { primary: "Kevin Williams", unit: "6C", occupants: [{ name: "Andre Williams", relationship: "Sibling" }], totalOccupants: 2 },
];

const pets = [
  { owner: "Sarah Mitchell", unit: "3A", type: "Dog", breed: "Golden Retriever", name: "Buddy", weight: "72 lbs", vaccination: "Current", deposit: 500 },
  { owner: "James Park", unit: "7B", type: "Cat", breed: "Persian", name: "Mochi", weight: "10 lbs", vaccination: "Current", deposit: 300 },
  { owner: "Marcus Johnson", unit: "4A", type: "Dog", breed: "French Bulldog", name: "Rex", weight: "28 lbs", vaccination: "Current", deposit: 500 },
  { owner: "David Kim", unit: "8A", type: "Cat", breed: "Siamese", name: "Luna", weight: "9 lbs", vaccination: "Expired", deposit: 300 },
  { owner: "Kevin Williams", unit: "6C", type: "Dog", breed: "Labrador", name: "Max", weight: "68 lbs", vaccination: "Current", deposit: 500 },
  { owner: "Rachel Torres", unit: "1B", type: "Cat", breed: "Maine Coon", name: "Whiskers", weight: "15 lbs", vaccination: "Current", deposit: 300 },
  { owner: "Lisa Chen", unit: "2D", type: "Dog", breed: "Corgi", name: "Coco", weight: "25 lbs", vaccination: "Current", deposit: 500 },
];

const vehicles = [
  { resident: "Sarah Mitchell", unit: "3A", make: "Toyota", model: "Camry", year: 2023, color: "Silver", plate: "ABC-1234", spot: "P-12", permitExpiry: "Mar 1, 2026" },
  { resident: "James Park", unit: "7B", make: "Honda", model: "CR-V", year: 2024, color: "White", plate: "DEF-5678", spot: "P-34", permitExpiry: "Jun 1, 2026" },
  { resident: "Lisa Chen", unit: "2D", make: "Tesla", model: "Model 3", year: 2024, color: "Black", plate: "GHI-9012", spot: "P-07", permitExpiry: "Feb 28, 2026" },
  { resident: "Marcus Johnson", unit: "4A", make: "Ford", model: "Explorer", year: 2022, color: "Blue", plate: "JKL-3456", spot: "P-21", permitExpiry: "Jan 15, 2026" },
  { resident: "Marcus Johnson", unit: "4A", make: "Hyundai", model: "Tucson", year: 2023, color: "Gray", plate: "MNO-7890", spot: "P-22", permitExpiry: "Jan 15, 2026" },
  { resident: "David Kim", unit: "8A", make: "BMW", model: "X3", year: 2023, color: "White", plate: "PQR-1234", spot: "P-45", permitExpiry: "Jul 1, 2026" },
  { resident: "Kevin Williams", unit: "6C", make: "Chevrolet", model: "Equinox", year: 2021, color: "Red", plate: "STU-5678", spot: "P-38", permitExpiry: "Aug 1, 2026" },
];

const emergencyContacts = [
  { resident: "Sarah Mitchell", unit: "3A", contactName: "Robert Mitchell", relationship: "Father", phone: "(555) 111-2222" },
  { resident: "James Park", unit: "7B", contactName: "Yuna Park", relationship: "Mother", phone: "(555) 222-3333" },
  { resident: "Lisa Chen", unit: "2D", contactName: "Wei Chen", relationship: "Brother", phone: "(555) 333-4444" },
  { resident: "Marcus Johnson", unit: "4A", contactName: "Patricia Johnson", relationship: "Mother", phone: "(555) 444-5555" },
  { resident: "Priya Patel", unit: "5C", contactName: "Amit Patel", relationship: "Father", phone: "(555) 555-6666" },
  { resident: "David Kim", unit: "8A", contactName: "Soyeon Kim", relationship: "Sister", phone: "(555) 666-7777" },
  { resident: "Rachel Torres", unit: "1B", contactName: "Maria Torres", relationship: "Mother", phone: "(555) 777-8888" },
  { resident: "Kevin Williams", unit: "6C", contactName: "Diane Williams", relationship: "Mother", phone: "(555) 888-9999" },
];

const leaseStatusVariant: Record<string, "destructive" | "outline" | "secondary" | "default"> = {
  Active: "default",
  "Month-to-Month": "outline",
  "Notice Given": "destructive",
  Expired: "secondary",
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

export default function Residents() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredResidents = residents.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return r.name.toLowerCase().includes(q) || r.unit.toLowerCase().includes(q);
  });

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
          <TabsTrigger value="emergency-contacts" data-testid="tab-emergency-contacts">Emergency Contacts</TabsTrigger>
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
                      <tr key={idx} className="border-b last:border-0 hover-elevate" data-testid={`row-resident-${idx}`}>
                        <td className="p-3 font-medium">{r.name}</td>
                        <td className="p-3 text-muted-foreground">{r.unit}</td>
                        <td className="p-3">
                          <Badge variant={leaseStatusVariant[r.leaseStatus]} className="text-xs" data-testid={`badge-lease-status-${idx}`}>
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
                          <Badge variant={paymentVariant[r.paymentHistory]} className="text-xs" data-testid={`badge-payment-${idx}`}>
                            {r.paymentHistory}
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
              {households.map((h, idx) => (
                <div key={idx} className="p-4 border rounded-lg space-y-2" data-testid={`card-household-${idx}`}>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{h.primary}</span>
                      <Badge variant="outline" className="text-xs">Unit {h.unit}</Badge>
                      <Badge variant="secondary" className="text-xs" data-testid={`badge-occupants-${idx}`}>
                        <Users className="w-3 h-3 mr-1" />
                        {h.totalOccupants} occupant{h.totalOccupants !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">Primary Leaseholder</span>
                  </div>
                  {h.occupants.length > 0 && (
                    <div className="pl-4 space-y-1">
                      {h.occupants.map((occ, oidx) => (
                        <div key={oidx} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{occ.name}</span>
                          <Badge variant="outline" className="text-[10px]">{occ.relationship}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
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
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Owner</th>
                      <th className="p-3 font-medium text-muted-foreground">Unit</th>
                      <th className="p-3 font-medium text-muted-foreground">Type</th>
                      <th className="p-3 font-medium text-muted-foreground">Breed</th>
                      <th className="p-3 font-medium text-muted-foreground">Name</th>
                      <th className="p-3 font-medium text-muted-foreground">Weight</th>
                      <th className="p-3 font-medium text-muted-foreground">Vaccination</th>
                      <th className="p-3 font-medium text-muted-foreground">Pet Deposit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pets.map((pet, idx) => (
                      <tr key={idx} className="border-b last:border-0 hover-elevate" data-testid={`row-pet-${idx}`}>
                        <td className="p-3 font-medium">{pet.owner}</td>
                        <td className="p-3 text-muted-foreground">{pet.unit}</td>
                        <td className="p-3 text-muted-foreground">{pet.type}</td>
                        <td className="p-3 text-muted-foreground">{pet.breed}</td>
                        <td className="p-3 font-medium">{pet.name}</td>
                        <td className="p-3 text-muted-foreground">{pet.weight}</td>
                        <td className="p-3">
                          <Badge variant={vaccinationVariant[pet.vaccination]} className="text-xs" data-testid={`badge-vaccination-${idx}`}>
                            {pet.vaccination === "Current" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {pet.vaccination === "Expired" && <AlertTriangle className="w-3 h-3 mr-1" />}
                            {pet.vaccination}
                          </Badge>
                        </td>
                        <td className="p-3 font-mono tabular-nums">${pet.deposit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Resident</th>
                      <th className="p-3 font-medium text-muted-foreground">Unit</th>
                      <th className="p-3 font-medium text-muted-foreground">Vehicle</th>
                      <th className="p-3 font-medium text-muted-foreground">Color</th>
                      <th className="p-3 font-medium text-muted-foreground">License Plate</th>
                      <th className="p-3 font-medium text-muted-foreground">Parking Spot</th>
                      <th className="p-3 font-medium text-muted-foreground">Permit Expiry</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map((v, idx) => (
                      <tr key={idx} className="border-b last:border-0 hover-elevate" data-testid={`row-vehicle-${idx}`}>
                        <td className="p-3 font-medium">{v.resident}</td>
                        <td className="p-3 text-muted-foreground">{v.unit}</td>
                        <td className="p-3 text-muted-foreground">{v.year} {v.make} {v.model}</td>
                        <td className="p-3 text-muted-foreground">{v.color}</td>
                        <td className="p-3 font-mono text-xs">{v.plate}</td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-xs">{v.spot}</Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <CalendarDays className="w-3.5 h-3.5" />
                            {v.permitExpiry}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergency-contacts" className="space-y-4">
          <Card data-testid="card-emergency-contacts">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Phone className="w-5 h-5 text-primary" />
                <CardTitle>Emergency Contacts</CardTitle>
                <Badge variant="secondary" className="text-xs">{emergencyContacts.length} contacts</Badge>
              </div>
              <CardDescription>Emergency contact information for all registered residents</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground">Resident</th>
                      <th className="p-3 font-medium text-muted-foreground">Unit</th>
                      <th className="p-3 font-medium text-muted-foreground">Contact Name</th>
                      <th className="p-3 font-medium text-muted-foreground">Relationship</th>
                      <th className="p-3 font-medium text-muted-foreground">Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emergencyContacts.map((ec, idx) => (
                      <tr key={idx} className="border-b last:border-0 hover-elevate" data-testid={`row-emergency-${idx}`}>
                        <td className="p-3 font-medium">{ec.resident}</td>
                        <td className="p-3 text-muted-foreground">{ec.unit}</td>
                        <td className="p-3 font-medium">{ec.contactName}</td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-xs">{ec.relationship}</Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {ec.phone}
                          </div>
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