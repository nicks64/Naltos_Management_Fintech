import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Landmark, 
  BarChart3, 
  Bot, 
  Settings,
  Building2,
  TrendingUp,
  Zap,
  Award
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { useRBAC } from "@/lib/rbac";
import type { UserRole } from "@shared/schema";

import { Coins } from "lucide-react";

const menuItems = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: LayoutDashboard,
    roles: ["Admin", "PropertyManager", "CFO", "Analyst"] as UserRole[],
  },
  {
    title: "Collections",
    url: "/collections",
    icon: Users,
    roles: ["Admin", "PropertyManager", "CFO"] as UserRole[],
  },
  {
    title: "Collection Incentives",
    url: "/collection-incentives",
    icon: Award,
    roles: ["Admin", "PropertyManager", "CFO"] as UserRole[],
  },
  {
    title: "Reconciliation",
    url: "/reconciliation",
    icon: FileText,
    roles: ["Admin", "PropertyManager", "CFO"] as UserRole[],
  },
  {
    title: "Treasury",
    url: "/treasury",
    icon: Landmark,
    roles: ["Admin", "CFO"] as UserRole[],
  },
  {
    title: "Treasury Management",
    url: "/crypto-treasury",
    icon: Coins,
    roles: ["Admin", "CFO"] as UserRole[],
  },
  {
    title: "Rent Float Treasury",
    url: "/rent-float",
    icon: TrendingUp,
    roles: ["Admin", "CFO"] as UserRole[],
  },
  {
    title: "Vendor Payments",
    url: "/vendor-payments",
    icon: Zap,
    roles: ["Admin", "CFO"] as UserRole[],
  },
  {
    title: "Reports",
    url: "/reports",
    icon: BarChart3,
    roles: ["Admin", "PropertyManager", "CFO", "Analyst"] as UserRole[],
  },
  {
    title: "Agent",
    url: "/agent",
    icon: Bot,
    roles: ["Admin", "PropertyManager", "CFO", "Analyst"] as UserRole[],
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    roles: ["Admin"] as UserRole[],
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { organization } = useAuth();
  const { hasRole } = useRBAC();

  return (
    <Sidebar>
      <SidebarHeader className="p-6 border-b">
        <div className="flex items-center gap-3" data-testid="sidebar-org-info">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold truncate">
              {organization?.name || "Naltos Console"}
            </h2>
            <p className="text-xs text-muted-foreground">Business Console</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide px-3">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems
                .filter((item) => hasRole(...item.roles))
                .map((item) => {
                  const isActive = location === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={isActive ? "bg-sidebar-accent" : ""}
                        data-testid={`link-${item.title.toLowerCase()}`}
                      >
                        <Link href={item.url}>
                          <item.icon className="w-5 h-5" />
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
