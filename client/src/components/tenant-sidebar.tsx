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
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary">
            <Building2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Naltos</h2>
            <p className="text-xs text-muted-foreground">Resident Portal</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {tenantNavItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url} data-testid={`nav-${item.title.toLowerCase()}`}>
                        <item.icon />
                        <span>{item.title}</span>
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
