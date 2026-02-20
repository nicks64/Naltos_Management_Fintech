import { 
  LayoutDashboard, 
  FileText, 
  Landmark, 
  BarChart3, 
  Settings,
  Building2,
  TrendingUp,
  Zap,
  Award,
  ShieldCheck,
  Shield,
  Brain,
  Activity,
  Sparkles,
  BookOpen,
  FileSearch,
  ShieldAlert,
  RefreshCw,
  Users,
  Target,
  PieChart,
  Briefcase,
  UserPlus,
  Star,
  ClipboardCheck,
  Store,
  Gift,
  Wallet,
  CreditCard,
  type LucideIcon,
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

interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
  roles: UserRole[];
}

interface MenuGroup {
  label: string;
  layerTag: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    label: "Core Financial Ledger",
    layerTag: "L1",
    items: [
      { title: "Transaction Ledger", url: "/transaction-ledger", icon: BookOpen, roles: ["Admin", "CFO"] },
      { title: "Reconciliation", url: "/reconciliation", icon: RefreshCw, roles: ["Admin", "PropertyManager", "CFO"] },
      { title: "Treasury", url: "/treasury", icon: Landmark, roles: ["Admin", "CFO"] },
      { title: "Audit Trail", url: "/audit-trail", icon: FileSearch, roles: ["Admin", "CFO"] },
    ],
  },
  {
    label: "AI Intelligence Engines",
    layerTag: "L2",
    items: [
      { title: "Intelligence Hub", url: "/intelligence", icon: Brain, roles: ["Admin", "PropertyManager", "CFO", "Analyst"] },
      { title: "Collections AI", url: "/collections", icon: Users, roles: ["Admin", "PropertyManager", "CFO"] },
      { title: "Collection Incentives", url: "/collection-incentives", icon: Award, roles: ["Admin", "PropertyManager", "CFO"] },
      { title: "Fraud Detection AI", url: "/fraud-detection", icon: ShieldAlert, roles: ["Admin", "CFO"] },
      { title: "Renewal Prediction", url: "/renewal-prediction", icon: Target, roles: ["Admin", "PropertyManager", "CFO", "Analyst"] },
      { title: "AI Analytics Agent", url: "/ai-analytics", icon: Sparkles, roles: ["Admin", "PropertyManager", "CFO", "Analyst"] },
    ],
  },
  {
    label: "Operator Module",
    layerTag: "L3",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, roles: ["Admin", "PropertyManager", "CFO", "Analyst"] },
      { title: "Rent Stability", url: "/rent-stability", icon: ShieldCheck, roles: ["Admin", "PropertyManager", "CFO", "Analyst"] },
      { title: "Cash Flow Forecast", url: "/cash-flow-forecast", icon: Activity, roles: ["Admin", "PropertyManager", "CFO", "Analyst"] },
      { title: "Rent Pricing", url: "/rent-pricing", icon: TrendingUp, roles: ["Admin", "PropertyManager", "CFO", "Analyst"] },
      { title: "Lease Agreements", url: "/lease-agreements", icon: FileText, roles: ["Admin", "PropertyManager"] },
      { title: "Investor Reporting", url: "/investor-reporting", icon: PieChart, roles: ["Admin", "CFO"] },
      { title: "Refi Readiness", url: "/refi-readiness", icon: Briefcase, roles: ["Admin", "CFO"] },
      { title: "Capital Access", url: "/capital-access", icon: Landmark, roles: ["Admin", "PropertyManager", "CFO", "Analyst"] },
      { title: "Staff Workload", url: "/staff-workload", icon: Users, roles: ["Admin", "PropertyManager"] },
      { title: "Reports", url: "/reports", icon: BarChart3, roles: ["Admin", "PropertyManager", "CFO", "Analyst"] },
    ],
  },
  {
    label: "Vendor Module",
    layerTag: "L4",
    items: [
      { title: "Vendor Payments", url: "/vendor-payments", icon: Zap, roles: ["Admin", "CFO"] },
      { title: "Vendor Onboarding", url: "/vendor-onboarding", icon: UserPlus, roles: ["Admin", "PropertyManager"] },
      { title: "Vendor Performance", url: "/vendor-performance", icon: Star, roles: ["Admin", "PropertyManager", "CFO"] },
      { title: "Vendor Compliance", url: "/vendor-compliance", icon: ClipboardCheck, roles: ["Admin", "PropertyManager", "CFO"] },
    ],
  },
  {
    label: "Merchant Module",
    layerTag: "L5",
    items: [
      { title: "Merchant Onboarding", url: "/merchant-onboarding", icon: Store, roles: ["Admin", "PropertyManager"] },
      { title: "Merchant Rewards", url: "/merchant-rewards", icon: Gift, roles: ["Admin", "PropertyManager", "CFO"] },
    ],
  },
  {
    label: "Tenant Financial Layer",
    layerTag: "L6",
    items: [
      { title: "Deposit Alternatives", url: "/deposit-alternatives", icon: Shield, roles: ["Admin", "PropertyManager", "CFO", "Analyst"] },
    ],
  },
];

const systemItems: MenuItem[] = [
  { title: "Settings", url: "/settings", icon: Settings, roles: ["Admin"] },
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
              {organization?.name || "Naltos"}
            </h2>
            <p className="text-xs text-muted-foreground">Financial Operating Network</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {menuGroups.map((group) => {
          const visibleItems = group.items.filter((item) => hasRole(...item.roles));
          if (visibleItems.length === 0) return null;
          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel className="text-xs uppercase tracking-wide px-3 flex items-center gap-2">
                <span className="text-[10px] font-bold text-muted-foreground/60">{group.layerTag}</span>
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map((item) => {
                    const isActive = location === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className={isActive ? "bg-sidebar-accent" : ""}
                          data-testid={`link-${item.url.replace(/\//g, "-").slice(1)}`}
                        >
                          <Link href={item.url}>
                            <item.icon className="w-4 h-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}

        {systemItems.filter((item) => hasRole(...item.roles)).length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs uppercase tracking-wide px-3">
              System
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {systemItems
                  .filter((item) => hasRole(...item.roles))
                  .map((item) => {
                    const isActive = location === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className={isActive ? "bg-sidebar-accent" : ""}
                          data-testid={`link-${item.url.replace(/\//g, "-").slice(1)}`}
                        >
                          <Link href={item.url}>
                            <item.icon className="w-4 h-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
