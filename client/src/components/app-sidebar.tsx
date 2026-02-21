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
  MessageSquare,
  Radio,
  Cpu,
  Wrench,
  Mail,
  ClipboardList,
  Gem,
  Megaphone,
  FileCheck,
  Heart,
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
import { Badge } from "@/components/ui/badge";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { useRBAC } from "@/lib/rbac";
import type { UserRole } from "@shared/schema";

interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
  roles: UserRole[];
  badge?: string;
}

interface MenuGroup {
  label: string;
  layerTag: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    label: "AI Command Center",
    layerTag: "AI",
    items: [
      { title: "Intelligence Hub", url: "/intelligence", icon: Brain, roles: ["Admin", "PropertyManager", "CFO", "Analyst"] },
      { title: "AI Analytics Agent", url: "/ai-analytics", icon: MessageSquare, roles: ["Admin", "PropertyManager", "CFO", "Analyst"] },
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, roles: ["Admin", "PropertyManager", "CFO", "Analyst"] },
    ],
  },
  {
    label: "AI Workflows",
    layerTag: "WF",
    items: [
      { title: "Collections AI", url: "/collections", icon: Users, roles: ["Admin", "PropertyManager", "CFO"], badge: "3" },
      { title: "Collection Incentives", url: "/collection-incentives", icon: Award, roles: ["Admin", "PropertyManager", "CFO"] },
      { title: "Fraud Detection", url: "/fraud-detection", icon: ShieldAlert, roles: ["Admin", "CFO"] },
      { title: "Renewal Prediction", url: "/renewal-prediction", icon: Target, roles: ["Admin", "PropertyManager", "CFO", "Analyst"] },
      { title: "Lease Orchestrator", url: "/lease-agreements", icon: FileText, roles: ["Admin", "PropertyManager"] },
    ],
  },
  {
    label: "Financial Ledger",
    layerTag: "FIN",
    items: [
      { title: "Transaction Ledger", url: "/transaction-ledger", icon: BookOpen, roles: ["Admin", "CFO"] },
      { title: "Reconciliation", url: "/reconciliation", icon: RefreshCw, roles: ["Admin", "PropertyManager", "CFO"] },
      { title: "Treasury", url: "/treasury", icon: Landmark, roles: ["Admin", "CFO"] },
      { title: "Cash Flow Forecast", url: "/cash-flow-forecast", icon: Activity, roles: ["Admin", "PropertyManager", "CFO", "Analyst"] },
      { title: "Audit Trail", url: "/audit-trail", icon: FileSearch, roles: ["Admin", "CFO"] },
    ],
  },
  {
    label: "Property CRM",
    layerTag: "CRM",
    items: [
      { title: "Maintenance Hub", url: "/maintenance", icon: Wrench, roles: ["Admin", "PropertyManager"] },
      { title: "Communications", url: "/communications", icon: Mail, roles: ["Admin", "PropertyManager"] },
      { title: "Inspections", url: "/inspections", icon: ClipboardList, roles: ["Admin", "PropertyManager"] },
      { title: "Marketing & Listings", url: "/marketing", icon: Megaphone, roles: ["Admin", "PropertyManager"] },
      { title: "Applications", url: "/applications", icon: FileCheck, roles: ["Admin", "PropertyManager"] },
      { title: "Amenities", url: "/amenities", icon: Gem, roles: ["Admin", "PropertyManager"] },
      { title: "Community & Events", url: "/community", icon: Heart, roles: ["Admin", "PropertyManager"] },
    ],
  },
  {
    label: "Asset Performance",
    layerTag: "OPS",
    items: [
      { title: "Rent Stability", url: "/rent-stability", icon: ShieldCheck, roles: ["Admin", "PropertyManager", "CFO", "Analyst"] },
      { title: "Rent Pricing", url: "/rent-pricing", icon: TrendingUp, roles: ["Admin", "PropertyManager", "CFO", "Analyst"] },
      { title: "Investor Reporting", url: "/investor-reporting", icon: PieChart, roles: ["Admin", "CFO"] },
      { title: "Refi Readiness", url: "/refi-readiness", icon: Briefcase, roles: ["Admin", "CFO"] },
      { title: "Capital Access", url: "/capital-access", icon: Landmark, roles: ["Admin", "PropertyManager", "CFO", "Analyst"] },
      { title: "Staff Workload", url: "/staff-workload", icon: Users, roles: ["Admin", "PropertyManager"] },
      { title: "Reports", url: "/reports", icon: BarChart3, roles: ["Admin", "PropertyManager", "CFO", "Analyst"] },
    ],
  },
  {
    label: "Vendor Network",
    layerTag: "VN",
    items: [
      { title: "Vendor Payments", url: "/vendor-payments", icon: Zap, roles: ["Admin", "CFO"] },
      { title: "Vendor Onboarding", url: "/vendor-onboarding", icon: UserPlus, roles: ["Admin", "PropertyManager"] },
      { title: "Vendor Performance", url: "/vendor-performance", icon: Star, roles: ["Admin", "PropertyManager", "CFO"] },
      { title: "Vendor Compliance", url: "/vendor-compliance", icon: ClipboardCheck, roles: ["Admin", "PropertyManager", "CFO"] },
    ],
  },
  {
    label: "Merchant Network",
    layerTag: "MN",
    items: [
      { title: "Merchant Onboarding", url: "/merchant-onboarding", icon: Store, roles: ["Admin", "PropertyManager"] },
      { title: "Merchant Rewards", url: "/merchant-rewards", icon: Gift, roles: ["Admin", "PropertyManager", "CFO"] },
    ],
  },
  {
    label: "Tenant Layer",
    layerTag: "TN",
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
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-3" data-testid="sidebar-org-info">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold truncate">
              {organization?.name || "Naltos"}
            </h2>
            <div className="flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-500" />
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Agentic Network Active</p>
            </div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {menuGroups.map((group) => {
          const visibleItems = group.items.filter((item) => hasRole(...item.roles));
          if (visibleItems.length === 0) return null;
          const isAIGroup = group.layerTag === "AI" || group.layerTag === "WF";
          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel className="text-xs uppercase tracking-wide px-3 flex items-center gap-2">
                {isAIGroup && <Sparkles className="w-3 h-3 text-primary" />}
                <span className={`text-[10px] font-bold ${isAIGroup ? "text-primary/70" : "text-muted-foreground/60"}`}>{group.layerTag}</span>
                <span className={isAIGroup ? "text-primary/90 font-semibold" : ""}>{group.label}</span>
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
                            <span className="flex-1">{item.title}</span>
                            {item.badge && (
                              <Badge variant="destructive" className="text-[10px] ml-auto">
                                {item.badge}
                              </Badge>
                            )}
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
