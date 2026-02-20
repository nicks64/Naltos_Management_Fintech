import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Store, UserPlus, MapPin, Clock, CheckCircle2, TrendingUp, DollarSign, Star } from "lucide-react";

const merchants = [
  { name: "Building Cafe", category: "Food & Beverage", location: "Sunset Heights - Lobby", status: "active" as const, tenantReach: 48, revenueShare: 3.5, monthlyVolume: 8400, rating: 4.7 },
  { name: "FreshMart Express", category: "Grocery", location: "Parkview Towers - Ground Floor", status: "active" as const, tenantReach: 32, revenueShare: 2.8, monthlyVolume: 12200, rating: 4.3 },
  { name: "CleanPress Laundry", category: "Services", location: "Multi-property", status: "active" as const, tenantReach: 120, revenueShare: 4.0, monthlyVolume: 6800, rating: 4.5 },
  { name: "PetCare Plus", category: "Pet Services", location: "Cedar Ridge Villas", status: "pending" as const, tenantReach: 0, revenueShare: 3.0, monthlyVolume: 0, rating: 0 },
  { name: "QuickFit Gym", category: "Fitness", location: "The Metropolitan - B1", status: "onboarding" as const, tenantReach: 0, revenueShare: 5.0, monthlyVolume: 0, rating: 0 },
  { name: "Bloom Florist", category: "Retail", location: "Oceanfront Towers", status: "pending" as const, tenantReach: 0, revenueShare: 2.5, monthlyVolume: 0, rating: 0 },
];

const statusConfig = {
  active: { label: "Active", variant: "secondary" as const },
  pending: { label: "Pending", variant: "outline" as const },
  onboarding: { label: "Onboarding", variant: "default" as const },
};

export default function MerchantOnboarding() {
  const activeMerchants = merchants.filter(m => m.status === "active");
  const totalVolume = activeMerchants.reduce((s, m) => s + m.monthlyVolume, 0);

  return (
    <div className="space-y-6" data-testid="page-merchant-onboarding">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Merchant Onboarding</h1>
          <p className="text-muted-foreground">In-building merchant network management and onboarding pipeline</p>
        </div>
        <Button data-testid="button-add-merchant">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Merchant
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Merchants</CardTitle>
            <Store className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-merchants">{merchants.length}</div>
            <p className="text-xs text-muted-foreground">{activeMerchants.length} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Volume</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono" data-testid="text-monthly-volume">${totalVolume.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Active merchants</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tenant Reach</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-tenant-reach">200</div>
            <p className="text-xs text-muted-foreground">Tenants with merchant access</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline</CardTitle>
            <Clock className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-pipeline">{merchants.filter(m => m.status !== "active").length}</div>
            <p className="text-xs text-muted-foreground">Pending or onboarding</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Merchant Network</h2>
        {merchants.map((merchant, i) => (
          <Card key={i} data-testid={`merchant-card-${i}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Store className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{merchant.name}</span>
                      <Badge variant="secondary" className="text-xs">{merchant.category}</Badge>
                      <Badge variant={statusConfig[merchant.status].variant}>
                        {statusConfig[merchant.status].label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {merchant.location}
                    </div>
                    {merchant.status === "active" && (
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-500" /> {merchant.rating}</span>
                        <span>{merchant.tenantReach} tenants</span>
                        <span>Rev share: {merchant.revenueShare}%</span>
                        <span className="font-mono">${merchant.monthlyVolume.toLocaleString()}/mo</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm" data-testid={`button-merchant-manage-${i}`}>
                  {merchant.status === "active" ? "Manage" : "Review"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
