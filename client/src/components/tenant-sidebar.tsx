import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
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
import {
  Home, Wallet, Store, Bot, FileText, Settings, Building2, CalendarDays,
  DollarSign, TrendingUp, ArrowLeftRight, Shield, ShieldCheck, MapPin,
} from "lucide-react";

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
  { title: "My Lease", url: "/tenant/lease", icon: FileText },
  { title: "Assistant", url: "/tenant/agent", icon: Bot },
  { title: "Reports", url: "/tenant/reports", icon: FileText },
  { title: "P2P Transfers", url: "/tenant/p2p", icon: ArrowLeftRight },
  { title: "Rental Insurance", url: "/tenant/rental-insurance", icon: Shield },
  { title: "Privacy", url: "/tenant/privacy", icon: ShieldCheck },
  { title: "Settings", url: "/tenant/settings", icon: Settings },
];

export function TenantSidebar() {
  const [location] = useLocation();

  const { data: currentUnit } = useQuery<CurrentUnit | null>({
    queryKey: ["/api/tenant/current-unit"],
  });

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

        {currentUnit && (
          <Link
            href="/tenant/settings"
            className="w-full flex items-center gap-2 p-2.5 rounded-lg text-left transition-colors"
            style={{
              backgroundColor: "hsl(var(--tenant-sidebar-accent) / 0.5)",
              border: "1px solid hsl(var(--tenant-sidebar-border))",
            }}
            data-testid="link-current-apartment"
          >
            <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: "hsl(var(--tenant-primary))" }} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: "hsl(var(--tenant-foreground))" }}>
                {currentUnit.unitLabel}
              </p>
              <p className="text-xs truncate" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
                {currentUnit.propertyName}
              </p>
            </div>
            <span className="text-xs font-mono" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
              ${currentUnit.rent?.toLocaleString()}
            </span>
          </Link>
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
