import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Building2, MapPin, BedDouble, Check, ChevronRight, Sparkles, ArrowRight, Layers,
} from "lucide-react";

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

export default function TenantWelcome() {
  const { toast } = useToast();
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<{ property: Property; unit: UnitInfo } | null>(null);

  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ["/api/tenant/properties"],
  });

  const selectUnitMutation = useMutation({
    mutationFn: (data: { propertyId: string; propertyName: string; unitId: string; unitLabel: string; rent: number }) =>
      apiRequest("POST", "/api/tenant/select-unit", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenant/current-unit"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tenant/rent-summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tenant/settings"] });
      toast({ title: "Welcome Home", description: "You're all set. Your apartment has been registered." });
    },
  });

  const handleConfirm = () => {
    if (!confirming) return;
    selectUnitMutation.mutate({
      propertyId: confirming.property.id,
      propertyName: confirming.property.name,
      unitId: confirming.unit.id,
      unitLabel: confirming.unit.label,
      rent: confirming.unit.rent,
    });
  };

  return (
    <div className="min-h-full flex items-center justify-center p-6" data-testid="page-tenant-welcome">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
            style={{ backgroundColor: "hsl(var(--tenant-primary) / 0.1)" }}
          >
            <Building2 className="w-8 h-8" style={{ color: "hsl(var(--tenant-primary))" }} />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: "hsl(var(--tenant-foreground))" }}>
            {confirming ? "Confirm Your Home" : "Welcome to Naltos"}
          </h1>
          <p className="text-base max-w-md mx-auto" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
            {confirming
              ? "Almost there. Confirm the details below to get started."
              : "Let's get you set up. Select the property and unit you're moving into."}
          </p>
        </div>

        {confirming ? (
          <div className="space-y-4">
            <Card
              className="border-2 overflow-hidden"
              style={{ borderColor: "hsl(var(--tenant-primary) / 0.3)", backgroundColor: "hsl(var(--tenant-card))" }}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4 flex-wrap">
                  <div
                    className="p-3 rounded-xl flex-shrink-0"
                    style={{ backgroundColor: "hsl(var(--tenant-primary) / 0.1)" }}
                  >
                    <MapPin className="w-6 h-6" style={{ color: "hsl(var(--tenant-primary))" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold mb-1" style={{ color: "hsl(var(--tenant-foreground))" }}>
                      {confirming.unit.label}
                    </h3>
                    <p className="text-sm mb-3" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                      {confirming.property.name} &middot; {confirming.property.address}
                    </p>
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1.5 text-sm" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                        <BedDouble className="w-4 h-4" />
                        {confirming.unit.bedrooms} Bedroom{confirming.unit.bedrooms > 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1.5 text-sm" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                        <Layers className="w-4 h-4" />
                        Floor {confirming.unit.floor}
                      </span>
                      <span className="text-lg font-bold font-mono" style={{ color: "hsl(var(--tenant-foreground))" }}>
                        ${confirming.unit.rent.toLocaleString()}/mo
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className="mt-5 p-4 rounded-lg flex items-start gap-3"
                  style={{ backgroundColor: "hsl(var(--tenant-primary) / 0.05)" }}
                >
                  <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "hsl(var(--tenant-primary))" }} />
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: "hsl(var(--tenant-foreground))" }}>
                      What you'll unlock
                    </p>
                    <ul className="space-y-1">
                      <li className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                        Cashback rewards on every on-time rent payment
                      </li>
                      <li className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                        Flexible payment options and roommate splitting
                      </li>
                      <li className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                        Credit building and ownership readiness tracking
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirming(null)}
                className="flex-1 py-3 px-4 rounded-lg font-medium text-sm border transition-colors"
                style={{
                  borderColor: "hsl(var(--tenant-sidebar-border))",
                  color: "hsl(var(--tenant-foreground))",
                }}
                data-testid="button-back-to-properties"
              >
                Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={selectUnitMutation.isPending}
                className="flex-1 py-3 px-4 rounded-lg font-semibold text-sm text-white flex items-center justify-center gap-2 transition-opacity"
                style={{
                  backgroundColor: "hsl(var(--tenant-primary))",
                  opacity: selectUnitMutation.isPending ? 0.7 : 1,
                }}
                data-testid="button-confirm-move-in"
              >
                {selectUnitMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    Confirm &amp; Move In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {isLoading && (
              <div className="text-center py-12">
                <div
                  className="w-8 h-8 border-3 rounded-full animate-spin mx-auto mb-3"
                  style={{ borderColor: "hsl(var(--tenant-primary) / 0.2)", borderTopColor: "hsl(var(--tenant-primary))", borderWidth: "3px" }}
                />
                <p className="text-sm" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Loading available properties...</p>
              </div>
            )}

            {properties?.map((property) => {
              const isExpanded = selectedProperty === property.id;
              const availableCount = property.units.filter(u => u.available).length;

              return (
                <Card
                  key={property.id}
                  className="border overflow-hidden transition-all"
                  style={{
                    backgroundColor: "hsl(var(--tenant-card))",
                    borderColor: isExpanded ? "hsl(var(--tenant-primary) / 0.4)" : "hsl(var(--tenant-card-border))",
                  }}
                >
                  <button
                    onClick={() => setSelectedProperty(isExpanded ? null : property.id)}
                    className="w-full flex items-center gap-4 p-4 text-left hover-elevate"
                    data-testid={`welcome-property-${property.id}`}
                  >
                    <div
                      className="p-2.5 rounded-xl flex-shrink-0"
                      style={{ backgroundColor: "hsl(var(--tenant-primary) / 0.1)" }}
                    >
                      <Building2 className="w-5 h-5" style={{ color: "hsl(var(--tenant-primary))" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm" style={{ color: "hsl(var(--tenant-foreground))" }}>
                        {property.name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                        {property.address}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs flex-shrink-0" style={{ backgroundColor: "hsl(var(--tenant-primary) / 0.1)", color: "hsl(var(--tenant-primary))" }}>
                      {availableCount} available
                    </Badge>
                    <ChevronRight
                      className="w-4 h-4 flex-shrink-0 transition-transform"
                      style={{
                        color: "hsl(var(--tenant-muted-foreground))",
                        transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                      }}
                    />
                  </button>

                  {isExpanded && (
                    <div
                      className="border-t"
                      style={{ borderColor: "hsl(var(--tenant-card-border))" }}
                    >
                      {property.units.map((unit) => {
                        const isOccupied = !unit.available;
                        return (
                          <button
                            key={unit.id}
                            onClick={() => !isOccupied && setConfirming({ property, unit })}
                            disabled={isOccupied}
                            className="w-full flex items-center gap-3 px-5 py-3 text-left transition-colors border-b last:border-b-0"
                            style={{
                              opacity: isOccupied ? 0.45 : 1,
                              cursor: isOccupied ? "not-allowed" : "pointer",
                              borderColor: "hsl(var(--tenant-card-border) / 0.5)",
                            }}
                            data-testid={`welcome-unit-${unit.id}`}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm" style={{ color: "hsl(var(--tenant-foreground))" }}>
                                {unit.label}
                              </p>
                              <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                                <span className="flex items-center gap-1 text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                                  <BedDouble className="w-3 h-3" /> {unit.bedrooms}BR
                                </span>
                                <span className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                                  Floor {unit.floor}
                                </span>
                                <span className="text-xs font-mono font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>
                                  ${unit.rent.toLocaleString()}/mo
                                </span>
                              </div>
                            </div>
                            {isOccupied ? (
                              <Badge variant="secondary" className="text-xs flex-shrink-0">Occupied</Badge>
                            ) : (
                              <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: "hsl(var(--tenant-primary))" }} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
