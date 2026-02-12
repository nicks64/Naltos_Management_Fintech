import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Home, Wallet, Store, Bot, FileText, Settings, Building2, CalendarDays,
  DollarSign, TrendingUp, ArrowLeftRight, Shield, ChevronDown, ChevronUp,
  MapPin, BedDouble, Check,
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

interface CurrentUnit {
  propertyId: string;
  propertyName: string;
  unitId: string;
  unitLabel: string;
  rent: number;
}

const tenantNavItems = [
  { title: "Home", url: "/tenant/home", icon: Home },
  { title: "Ownership", url: "/tenant/ownership", icon: Building2 },
  { title: "Wallet", url: "/tenant/wallet", icon: Wallet },
  { title: "Payments", url: "/tenant/payment-calendar", icon: CalendarDays },
  { title: "Credit Builder", url: "/tenant/credit-builder", icon: TrendingUp },
  { title: "Financial Hub", url: "/tenant/financial-hub", icon: DollarSign },
  { title: "Merchants", url: "/tenant/merchants", icon: Store },
  { title: "Assistant", url: "/tenant/agent", icon: Bot },
  { title: "Reports", url: "/tenant/reports", icon: FileText },
  { title: "P2P Transfers", url: "/tenant/p2p", icon: ArrowLeftRight },
  { title: "Rental Insurance", url: "/tenant/rental-insurance", icon: Shield },
  { title: "Settings", url: "/tenant/settings", icon: Settings },
];

export function TenantSidebar() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [expandedProperty, setExpandedProperty] = useState<string | null>(null);

  const { data: currentUnit, isLoading: unitLoading } = useQuery<CurrentUnit>({
    queryKey: ["/api/tenant/current-unit"],
  });

  const { data: properties, isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: ["/api/tenant/properties"],
    enabled: selectorOpen,
  });

  const selectUnitMutation = useMutation({
    mutationFn: (data: { propertyId: string; propertyName: string; unitId: string; unitLabel: string; rent: number }) =>
      apiRequest("POST", "/api/tenant/select-unit", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenant/current-unit"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tenant/rent-summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tenant/settings"] });
      setSelectorOpen(false);
      setExpandedProperty(null);
      toast({ title: "Apartment Updated", description: "Your apartment selection has been saved." });
    },
  });

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
    <Sidebar className="border-r" style={{ backgroundColor: "hsl(var(--tenant-sidebar))", borderColor: "hsl(var(--tenant-sidebar-border))" }}>
      <SidebarHeader className="border-b px-4 py-4" style={{ borderColor: "hsl(var(--tenant-sidebar-border))" }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-primary))" }}>
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-base" style={{ color: "hsl(var(--tenant-foreground))" }}>Naltos</h2>
            <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Resident Portal</p>
          </div>
        </div>

        <button
          onClick={() => setSelectorOpen(!selectorOpen)}
          className="w-full flex items-center gap-2 p-2.5 rounded-lg text-left transition-colors"
          style={{
            backgroundColor: selectorOpen ? "hsl(var(--tenant-sidebar-accent))" : "hsl(var(--tenant-sidebar-accent) / 0.5)",
            border: "1px solid hsl(var(--tenant-sidebar-border))",
          }}
          data-testid="button-apartment-selector"
        >
          <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: "hsl(var(--tenant-primary))" }} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: "hsl(var(--tenant-foreground))" }}>
              {currentUnit?.unitLabel || "Select Apartment"}
            </p>
            <p className="text-xs truncate" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
              {currentUnit?.propertyName || "Choose your property"}
            </p>
          </div>
          {selectorOpen ? (
            <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: "hsl(var(--tenant-muted-foreground))" }} />
          ) : (
            <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: "hsl(var(--tenant-muted-foreground))" }} />
          )}
        </button>

        {selectorOpen && (
          <div
            className="mt-2 rounded-lg overflow-hidden"
            style={{
              border: "1px solid hsl(var(--tenant-sidebar-border))",
              backgroundColor: "hsl(var(--tenant-sidebar))",
              maxHeight: "280px",
              overflowY: "auto",
            }}
            data-testid="panel-apartment-list"
          >
            {propertiesLoading && (
              <div className="p-4 text-center">
                <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-2" style={{ borderColor: "hsl(var(--tenant-primary))", borderTopColor: "transparent" }} />
                <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Loading properties...</p>
              </div>
            )}
            {!propertiesLoading && properties?.length === 0 && (
              <div className="p-4 text-center">
                <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>No properties available</p>
              </div>
            )}
            {properties?.map((property) => {
              const isExpanded = expandedProperty === property.id;
              return (
                <div key={property.id}>
                  <button
                    onClick={() => setExpandedProperty(isExpanded ? null : property.id)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover-elevate"
                    style={{ borderBottom: "1px solid hsl(var(--tenant-sidebar-border) / 0.5)" }}
                    data-testid={`property-${property.id}`}
                  >
                    <Building2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "hsl(var(--tenant-primary))" }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: "hsl(var(--tenant-foreground))" }}>{property.name}</p>
                      <p className="text-xs truncate" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>{property.address}</p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "hsl(var(--tenant-muted-foreground))" }} />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "hsl(var(--tenant-muted-foreground))" }} />
                    )}
                  </button>

                  {isExpanded && (
                    <div style={{ backgroundColor: "hsl(var(--tenant-sidebar-accent) / 0.3)" }}>
                      {property.units.map((unit) => {
                        const isSelected = currentUnit?.unitId === unit.id && currentUnit?.propertyId === property.id;
                        const isOccupied = !unit.available && !isSelected;
                        return (
                          <button
                            key={unit.id}
                            onClick={() => !isOccupied && handleSelectUnit(property, unit)}
                            disabled={isOccupied || selectUnitMutation.isPending}
                            className="w-full flex items-center gap-2 px-4 py-2 text-left transition-colors"
                            style={{
                              opacity: isOccupied ? 0.5 : 1,
                              cursor: isOccupied ? "not-allowed" : "pointer",
                              backgroundColor: isSelected ? "hsl(var(--tenant-primary) / 0.1)" : undefined,
                              borderLeft: isSelected ? "3px solid hsl(var(--tenant-primary))" : "3px solid transparent",
                            }}
                            data-testid={`unit-${unit.id}`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-medium" style={{ color: isSelected ? "hsl(var(--tenant-primary))" : "hsl(var(--tenant-foreground))" }}>
                                  {unit.label}
                                </p>
                                {isSelected && <Check className="w-3 h-3" style={{ color: "hsl(var(--tenant-primary))" }} />}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="flex items-center gap-0.5 text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                                  <BedDouble className="w-3 h-3" /> {unit.bedrooms}BR
                                </span>
                                <span className="text-xs font-mono" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
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
      </SidebarHeader>
      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {tenantNavItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className="rounded-lg py-2.5 px-3"
                      style={isActive ? {
                        backgroundColor: "hsl(var(--tenant-sidebar-accent))",
                        color: "hsl(var(--tenant-sidebar-accent-foreground))",
                      } : {
                        color: "hsl(var(--tenant-sidebar-foreground))"
                      }}
                    >
                      <Link href={item.url} data-testid={`nav-${item.title.toLowerCase()}`}>
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium text-sm">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
