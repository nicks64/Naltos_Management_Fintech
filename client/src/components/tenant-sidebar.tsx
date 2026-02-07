import { Link, useLocation } from "wouter";
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
import { Home, Wallet, Store, Bot, FileText, Settings, Building2, CalendarDays } from "lucide-react";

const tenantNavItems = [
  {
    title: "Home",
    url: "/tenant/home",
    icon: Home,
  },
  {
    title: "Ownership",
    url: "/tenant/ownership",
    icon: Building2,
  },
  {
    title: "Wallet",
    url: "/tenant/wallet",
    icon: Wallet,
  },
  {
    title: "Payments",
    url: "/tenant/payment-calendar",
    icon: CalendarDays,
  },
  {
    title: "Merchants",
    url: "/tenant/merchants",
    icon: Store,
  },
  {
    title: "Assistant",
    url: "/tenant/agent",
    icon: Bot,
  },
  {
    title: "Reports",
    url: "/tenant/reports",
    icon: FileText,
  },
  {
    title: "Settings",
    url: "/tenant/settings",
    icon: Settings,
  },
];

export function TenantSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar className="border-r" style={{ backgroundColor: "hsl(var(--tenant-sidebar))", borderColor: "hsl(var(--tenant-sidebar-border))" }}>
      <SidebarHeader className="border-b px-6 py-5" style={{ borderColor: "hsl(var(--tenant-sidebar-border))" }}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: "hsl(var(--tenant-primary))" }}>
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-base" style={{ color: "hsl(var(--tenant-foreground))" }}>Naltos</h2>
            <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Resident Portal</p>
          </div>
        </div>
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
