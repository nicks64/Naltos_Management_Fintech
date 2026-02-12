import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User, CreditCard, Bell, Shield, Building2, MapPin, BedDouble, Check, ChevronDown, ChevronUp } from "lucide-react";
import type { TenantPaymentMethod } from "@shared/schema";

interface TenantSettings {
  email: string;
  phone: string;
  unit: string;
  leaseEndDate: string;
  paymentMethods: TenantPaymentMethod[];
}

interface UnitInfo {
  id: string;
  label: string;
  floor: number;
  bedrooms: number;
  rent: number;
  available: boolean;
}

interface Property {
  id: string;
  name: string;
  address: string;
  units: UnitInfo[];
}

interface CurrentUnit {
  propertyId: string;
  propertyName: string;
  unitId: string;
  unitLabel: string;
  rent: number;
}

export default function TenantSettings() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [showUnitSelector, setShowUnitSelector] = useState(false);
  const [expandedProperty, setExpandedProperty] = useState<string | null>(null);

  const { data: settings } = useQuery<TenantSettings>({
    queryKey: ["/api/tenant/settings"],
  });

  const { data: currentUnit } = useQuery<CurrentUnit>({
    queryKey: ["/api/tenant/current-unit"],
  });

  const { data: properties } = useQuery<Property[]>({
    queryKey: ["/api/tenant/properties"],
    enabled: showUnitSelector,
  });

  const selectUnitMutation = useMutation({
    mutationFn: (data: { propertyId: string; propertyName: string; unitId: string; unitLabel: string; rent: number }) =>
      apiRequest("POST", "/api/tenant/select-unit", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenant/current-unit"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tenant/rent-summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tenant/settings"] });
      setShowUnitSelector(false);
      setExpandedProperty(null);
      toast({ title: "Apartment Updated", description: "Your apartment selection has been saved." });
    },
  });

  useEffect(() => {
    if (settings) {
      setEmail(settings.email || "");
      setPhone(settings.phone || "");
    }
  }, [settings]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: { email: string; phone: string }) =>
      apiRequest("POST", "/api/tenant/settings/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenant/settings"] });
      toast({
        title: "Profile Updated",
        description: "Your contact information has been saved",
      });
    },
  });

  const addPaymentMethodMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/tenant/settings/payment-method", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenant/settings"] });
      toast({
        title: "Payment Method Added",
        description: "Your new payment method is ready to use",
      });
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({ email, phone });
  };

  const handleSelectUnit = (property: Property, unit: UnitInfo) => {
    selectUnitMutation.mutate({
      propertyId: property.id,
      propertyName: property.name,
      unitId: unit.id,
      unitLabel: unit.label,
      rent: unit.rent,
    });
  };

  return (
    <div className="space-y-6" data-testid="page-tenant-settings">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ color: "hsl(var(--tenant-foreground))" }}>Settings</h1>
        <p className="text-base" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
          Manage your account, apartment, and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-muted-foreground" />
              <CardTitle>My Apartment</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUnitSelector(!showUnitSelector)}
              data-testid="button-change-apartment"
            >
              {showUnitSelector ? "Cancel" : "Change Apartment"}
            </Button>
          </div>
          <CardDescription>
            Your current residence selection. Change it when you move in or out.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentUnit && (
            <div
              className="flex items-center gap-4 p-4 rounded-lg border flex-wrap"
              data-testid="card-current-apartment"
            >
              <div className="p-3 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-primary) / 0.1)" }}>
                <MapPin className="w-5 h-5" style={{ color: "hsl(var(--tenant-primary))" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>{currentUnit.unitLabel}</p>
                <p className="text-sm" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>{currentUnit.propertyName}</p>
              </div>
              <div className="text-right">
                <p className="font-bold font-mono" style={{ color: "hsl(var(--tenant-foreground))" }}>${currentUnit.rent?.toLocaleString()}/mo</p>
                <Badge variant="secondary" className="text-xs mt-1" style={{ backgroundColor: "hsl(var(--tenant-primary) / 0.1)", color: "hsl(var(--tenant-primary))" }}>
                  Active Lease
                </Badge>
              </div>
            </div>
          )}

          {showUnitSelector && (
            <div className="space-y-3" data-testid="panel-settings-unit-selector">
              <p className="text-sm font-medium" style={{ color: "hsl(var(--tenant-foreground))" }}>
                Select a new apartment:
              </p>
              {properties?.map((property) => {
                const isExpanded = expandedProperty === property.id;
                return (
                  <div key={property.id} className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedProperty(isExpanded ? null : property.id)}
                      className="w-full flex items-center gap-3 p-3 text-left hover-elevate"
                      data-testid={`settings-property-${property.id}`}
                    >
                      <Building2 className="w-4 h-4 flex-shrink-0" style={{ color: "hsl(var(--tenant-primary))" }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm" style={{ color: "hsl(var(--tenant-foreground))" }}>{property.name}</p>
                        <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>{property.address}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {property.units.filter(u => u.available).length} available
                      </Badge>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: "hsl(var(--tenant-muted-foreground))" }} />
                      ) : (
                        <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: "hsl(var(--tenant-muted-foreground))" }} />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="border-t">
                        {property.units.map((unit) => {
                          const isSelected = currentUnit?.unitId === unit.id && currentUnit?.propertyId === property.id;
                          const isOccupied = !unit.available && !isSelected;
                          return (
                            <button
                              key={unit.id}
                              onClick={() => !isOccupied && handleSelectUnit(property, unit)}
                              disabled={isOccupied || selectUnitMutation.isPending}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left border-b last:border-b-0 transition-colors"
                              style={{
                                opacity: isOccupied ? 0.5 : 1,
                                cursor: isOccupied ? "not-allowed" : "pointer",
                                backgroundColor: isSelected ? "hsl(var(--tenant-primary) / 0.05)" : undefined,
                              }}
                              data-testid={`settings-unit-${unit.id}`}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-medium text-sm" style={{ color: isSelected ? "hsl(var(--tenant-primary))" : "hsl(var(--tenant-foreground))" }}>
                                    {unit.label}
                                  </p>
                                  {isSelected && <Check className="w-4 h-4" style={{ color: "hsl(var(--tenant-primary))" }} />}
                                </div>
                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                  <span className="flex items-center gap-1 text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                                    <BedDouble className="w-3 h-3" /> {unit.bedrooms} Bedroom{unit.bedrooms > 1 ? "s" : ""}
                                  </span>
                                  <span className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                                    Floor {unit.floor}
                                  </span>
                                  <span className="text-xs font-mono font-medium" style={{ color: "hsl(var(--tenant-foreground))" }}>
                                    ${unit.rent.toLocaleString()}/mo
                                  </span>
                                </div>
                              </div>
                              {isOccupied && (
                                <Badge variant="secondary" className="text-xs">Occupied</Badge>
                              )}
                              {unit.available && !isSelected && (
                                <Badge variant="secondary" className="text-xs" style={{ backgroundColor: "hsl(var(--tenant-primary) / 0.1)", color: "hsl(var(--tenant-primary))" }}>
                                  Available
                                </Badge>
                              )}
                              {isSelected && (
                                <Badge variant="secondary" className="text-xs" style={{ backgroundColor: "hsl(var(--tenant-primary) / 0.1)", color: "hsl(var(--tenant-primary))" }}>
                                  Current
                                </Badge>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-muted-foreground" />
            <CardTitle>Account Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="input-email"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                data-testid="input-phone"
              />
            </div>
          </div>

          <Button
            onClick={handleSaveProfile}
            disabled={updateProfileMutation.isPending}
            data-testid="button-save-profile"
          >
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              <CardTitle>Payment Methods</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addPaymentMethodMutation.mutate()}
              data-testid="button-add-payment-method"
            >
              Add Method
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {settings?.paymentMethods && settings.paymentMethods.length > 0 ? (
            <div className="space-y-3">
              {settings.paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-4 rounded-lg border flex-wrap gap-2"
                  data-testid={`payment-method-${method.id}`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {method.method} {method.lastFourDigits ? `****${method.lastFourDigits}` : ""}
                      </p>
                      {method.isDefault && (
                        <Badge variant="secondary" className="mt-1">Default</Badge>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Remove</Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No payment methods on file</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => addPaymentMethodMutation.mutate()}
              >
                Add Your First Method
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>
            Manage how you receive updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="font-medium">Rent Reminders</p>
                <p className="text-sm text-muted-foreground">Get notified 3 days before rent is due</p>
              </div>
              <Button variant="outline" size="sm">Enable</Button>
            </div>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="font-medium">Payment Confirmations</p>
                <p className="text-sm text-muted-foreground">Receive email when payments are processed</p>
              </div>
              <Button variant="outline" size="sm">Enabled</Button>
            </div>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="font-medium">Maintenance Updates</p>
                <p className="text-sm text-muted-foreground">Get updates on your requests</p>
              </div>
              <Button variant="outline" size="sm">Enable</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-muted-foreground" />
            <CardTitle>Security</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Button variant="outline" data-testid="button-change-password">
            Change Password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
