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
import { Home, Wallet, Bot, FileText, Settings, Building2 } from "lucide-react";

const tenantNavItems = [
  {
    title: "Home",
    url: "/tenant/home",
    icon: Home,
  },
  {
    title: "Wallet",
    url: "/tenant/wallet",
    icon: Wallet,
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
      <SidebarHeader className="border-b px-6 py-6" style={{ borderColor: "hsl(var(--tenant-sidebar-border))" }}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl" style={{ background: "var(--tenant-gradient-primary)" }}>
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-lg" style={{ color: "hsl(var(--tenant-foreground))" }}>Naltos</h2>
            <p className="text-xs" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>Resident Portal</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {tenantNavItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className="rounded-xl py-3 px-4 hover-elevate active-elevate-2"
                      style={isActive ? {
                        background: "var(--tenant-gradient-primary)",
                        color: "white",
                      } : {
                        color: "hsl(var(--tenant-sidebar-foreground))"
                      }}
                    >
                      <Link href={item.url} data-testid={`nav-${item.title.toLowerCase()}`}>
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.title}</span>
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
