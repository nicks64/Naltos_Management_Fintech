import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { useRBAC } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { ActivityFeed } from "@/components/activity-feed";
import { LogOut, ShieldAlert, Building2 } from "lucide-react";

import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import RentStability from "@/pages/rent-stability";
import Collections from "@/pages/collections";
import CollectionIncentives from "@/pages/collection-incentives";
import Reconciliation from "@/pages/reconciliation";
import Treasury from "@/pages/treasury";

import VendorPayments from "@/pages/vendor-payments";
import Reports from "@/pages/reports";
import AIAnalytics from "@/pages/ai-analytics";
import Intelligence from "@/pages/intelligence";
import Settings from "@/pages/settings";
import CashFlowForecast from "@/pages/cash-flow-forecast";
import DepositAlternatives from "@/pages/deposit-alternatives";
import RentPricing from "@/pages/rent-pricing";
import CapitalAccess from "@/pages/capital-access";
import LeaseAgreements from "@/pages/lease-agreements";
import NotFound from "@/pages/not-found";

import AuditTrail from "@/pages/audit-trail";
import TransactionLedger from "@/pages/transaction-ledger";
import FraudDetection from "@/pages/fraud-detection";
import RenewalPrediction from "@/pages/renewal-prediction";
import InvestorReporting from "@/pages/investor-reporting";
import RefiReadiness from "@/pages/refi-readiness";
import StaffWorkload from "@/pages/staff-workload";
import VendorOnboarding from "@/pages/vendor-onboarding";
import VendorPerformance from "@/pages/vendor-performance";
import VendorCompliance from "@/pages/vendor-compliance";
import MerchantOnboarding from "@/pages/merchant-onboarding";
import MerchantRewards from "@/pages/merchant-rewards";

// Tenant pages
import TenantPaymentCalendar from "@/pages/tenant/payment-calendar";
import TenantHome from "@/pages/tenant/home";
import OwnershipReadiness from "@/pages/tenant/ownership-readiness";
import TenantWallet from "@/pages/tenant/wallet";
import TenantMerchants from "@/pages/tenant/merchants";
import TenantAgent from "@/pages/tenant/agent";
import TenantReports from "@/pages/tenant/reports";
import TenantSettings from "@/pages/tenant/settings";
import FinancialHub from "@/pages/tenant/financial-hub";
import CreditBuilder from "@/pages/tenant/credit-builder";
import P2PTransfers from "@/pages/tenant/p2p-transfers";
import RentalInsurance from "@/pages/tenant/rental-insurance";
import TenantLeaseReview from "@/pages/tenant/lease-review";
import TenantWelcome from "@/pages/tenant/welcome";
import { TenantSidebar } from "@/components/tenant-sidebar";

// Vendor pages
import VendorLogin from "@/pages/vendor-login";
import VendorPortal from "@/pages/vendor-portal";

// Merchant pages
import MerchantLogin from "@/pages/merchant-login";
import MerchantPortal from "@/pages/merchant-portal";

function ProtectedRoute({ component: Component, path }: { component: React.ComponentType; path: string }): React.ReactElement {
  const { user } = useAuth();
  const { canAccessPage } = useRBAC();
  const [, setLocation] = useLocation();
  
  if (!user) {
    setLocation("/");
    return <></>;
  }

  if (!canAccessPage(path)) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <ShieldAlert className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-4">
          Your role ({user.role}) does not have permission to access this page.
        </p>
        <p className="text-sm text-muted-foreground">
          Contact an administrator if you believe this is incorrect.
        </p>
      </div>
    );
  }
  
  return <Component />;
}

const ProtectedRouteRenderer = (Component: React.ComponentType, path: string) => () => (
  <ProtectedRoute component={Component} path={path} />
) as React.ReactElement;

function AppContent() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();

  const isTenant = user?.role === "Tenant";
  const { data: currentUnit, isLoading: unitLoading } = useQuery<any>({
    queryKey: ["/api/tenant/current-unit"],
    enabled: isTenant,
  });

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  // Redirect based on user role
  if (user && location === "/") {
    const redirectPath = user.role === "Vendor" ? "/vendor-portal" :
                        user.role === "Merchant" ? "/merchant-portal" :
                        user.role === "Tenant" ? "/tenant/home" : "/dashboard";
    return <Redirect to={redirectPath} />;
  }

  // Redirect authenticated vendors away from login page
  if (user && user.role === "Vendor" && location === "/vendor-login") {
    return <Redirect to="/vendor-portal" />;
  }

  // Redirect authenticated merchants away from login page
  if (user && user.role === "Merchant" && location === "/merchant-login") {
    return <Redirect to="/merchant-portal" />;
  }

  // Show vendor login page for /vendor-login route (only if not authenticated)
  if (location === "/vendor-login") {
    return <VendorLogin />;
  }

  // Show merchant login page for /merchant-login route (only if not authenticated)
  if (location === "/merchant-login") {
    return <MerchantLogin />;
  }

  // Show login page if not authenticated
  if (!user) {
    return <Login />;
  }

  // Vendor users have different UI - no sidebar
  if (user.role === "Vendor") {
    return (
      <div className="flex flex-col h-screen">
        <header className="flex items-center justify-between px-8 py-4 border-b">
          <div className="text-xl font-semibold">Vendor Portal</div>
          <div className="flex items-center gap-2">
            <ActivityFeed />
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleLogout} data-testid="button-logout">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <Switch>
            <Route path="/vendor-portal">
              {ProtectedRouteRenderer(VendorPortal, "/vendor-portal")}
            </Route>
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    );
  }

  // Merchant users have different UI - no sidebar
  if (user.role === "Merchant") {
    return (
      <div className="flex flex-col h-screen">
        <header className="flex items-center justify-between px-8 py-4 border-b">
          <div className="text-xl font-semibold">Merchant Portal</div>
          <div className="flex items-center gap-2">
            <ActivityFeed />
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleLogout} data-testid="button-logout">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <Switch>
            <Route path="/merchant-portal">
              {ProtectedRouteRenderer(MerchantPortal, "/merchant-portal")}
            </Route>
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    );
  }

  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  const hasNoUnit = isTenant && !unitLoading && currentUnit === null;

  if (isTenant && hasNoUnit) {
    return (
      <div className="flex h-screen w-full tenant-portal" style={{ backgroundColor: "hsl(var(--tenant-background))" }}>
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between px-8 py-4 border-b">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5" style={{ color: "hsl(var(--tenant-primary))" }} />
              <span className="font-semibold" style={{ color: "hsl(var(--tenant-foreground))" }}>Naltos</span>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={handleLogout} data-testid="button-logout">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <TenantWelcome />
          </main>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className={`flex h-screen w-full ${isTenant ? "tenant-portal" : ""}`}>
        {isTenant ? <TenantSidebar /> : <AppSidebar />}
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between px-8 py-4 border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-2">
              <ActivityFeed />
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={handleLogout} data-testid="button-logout">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <div className={isTenant ? "px-8 py-6 max-w-[1400px] mx-auto" : "max-w-[1600px] mx-auto px-8 py-6"}>
              <Switch>
                {/* Business routes */}
                <Route path="/dashboard">
                  {ProtectedRouteRenderer(Dashboard, "/dashboard")}
                </Route>
                <Route path="/intelligence">
                  {ProtectedRouteRenderer(Intelligence, "/intelligence")}
                </Route>
                <Route path="/rent-stability">
                  {ProtectedRouteRenderer(RentStability, "/rent-stability")}
                </Route>
                <Route path="/collections">
                  {ProtectedRouteRenderer(Collections, "/collections")}
                </Route>
                <Route path="/collection-incentives">
                  {ProtectedRouteRenderer(CollectionIncentives, "/collection-incentives")}
                </Route>
                <Route path="/reconciliation">
                  {ProtectedRouteRenderer(Reconciliation, "/reconciliation")}
                </Route>
                <Route path="/treasury">
                  {ProtectedRouteRenderer(Treasury, "/treasury")}
                </Route>
                <Route path="/vendor-payments">
                  {ProtectedRouteRenderer(VendorPayments, "/vendor-payments")}
                </Route>
                <Route path="/reports">
                  {ProtectedRouteRenderer(Reports, "/reports")}
                </Route>
                <Route path="/ai-analytics">
                  {ProtectedRouteRenderer(AIAnalytics, "/ai-analytics")}
                </Route>
                <Route path="/cash-flow-forecast">
                  {ProtectedRouteRenderer(CashFlowForecast, "/cash-flow-forecast")}
                </Route>
                <Route path="/deposit-alternatives">
                  {ProtectedRouteRenderer(DepositAlternatives, "/deposit-alternatives")}
                </Route>
                <Route path="/rent-pricing">
                  {ProtectedRouteRenderer(RentPricing, "/rent-pricing")}
                </Route>
                <Route path="/capital-access">
                  {ProtectedRouteRenderer(CapitalAccess, "/capital-access")}
                </Route>
                <Route path="/lease-agreements">
                  {ProtectedRouteRenderer(LeaseAgreements, "/lease-agreements")}
                </Route>
                <Route path="/audit-trail">
                  {ProtectedRouteRenderer(AuditTrail, "/audit-trail")}
                </Route>
                <Route path="/transaction-ledger">
                  {ProtectedRouteRenderer(TransactionLedger, "/transaction-ledger")}
                </Route>
                <Route path="/fraud-detection">
                  {ProtectedRouteRenderer(FraudDetection, "/fraud-detection")}
                </Route>
                <Route path="/renewal-prediction">
                  {ProtectedRouteRenderer(RenewalPrediction, "/renewal-prediction")}
                </Route>
                <Route path="/investor-reporting">
                  {ProtectedRouteRenderer(InvestorReporting, "/investor-reporting")}
                </Route>
                <Route path="/refi-readiness">
                  {ProtectedRouteRenderer(RefiReadiness, "/refi-readiness")}
                </Route>
                <Route path="/staff-workload">
                  {ProtectedRouteRenderer(StaffWorkload, "/staff-workload")}
                </Route>
                <Route path="/vendor-onboarding">
                  {ProtectedRouteRenderer(VendorOnboarding, "/vendor-onboarding")}
                </Route>
                <Route path="/vendor-performance">
                  {ProtectedRouteRenderer(VendorPerformance, "/vendor-performance")}
                </Route>
                <Route path="/vendor-compliance">
                  {ProtectedRouteRenderer(VendorCompliance, "/vendor-compliance")}
                </Route>
                <Route path="/merchant-onboarding">
                  {ProtectedRouteRenderer(MerchantOnboarding, "/merchant-onboarding")}
                </Route>
                <Route path="/merchant-rewards">
                  {ProtectedRouteRenderer(MerchantRewards, "/merchant-rewards")}
                </Route>
                <Route path="/settings">
                  {ProtectedRouteRenderer(Settings, "/settings")}
                </Route>
                
                {/* Tenant routes */}
                <Route path="/tenant/home">
                  {ProtectedRouteRenderer(TenantHome, "/tenant/home")}
                </Route>
                <Route path="/tenant/ownership">
                  {ProtectedRouteRenderer(OwnershipReadiness, "/tenant/ownership")}
                </Route>
                <Route path="/tenant/wallet">
                  {ProtectedRouteRenderer(TenantWallet, "/tenant/wallet")}
                </Route>
                <Route path="/tenant/merchants">
                  {ProtectedRouteRenderer(TenantMerchants, "/tenant/merchants")}
                </Route>
                <Route path="/tenant/agent">
                  {ProtectedRouteRenderer(TenantAgent, "/tenant/agent")}
                </Route>
                <Route path="/tenant/reports">
                  {ProtectedRouteRenderer(TenantReports, "/tenant/reports")}
                </Route>
                <Route path="/tenant/payment-calendar">
                  {ProtectedRouteRenderer(TenantPaymentCalendar, "/tenant/payment-calendar")}
                </Route>
                <Route path="/tenant/financial-hub">
                  {ProtectedRouteRenderer(FinancialHub, "/tenant/financial-hub")}
                </Route>
                <Route path="/tenant/credit-builder">
                  {ProtectedRouteRenderer(CreditBuilder, "/tenant/credit-builder")}
                </Route>
                <Route path="/tenant/p2p">
                  {ProtectedRouteRenderer(P2PTransfers, "/tenant/p2p")}
                </Route>
                <Route path="/tenant/rental-insurance">
                  {ProtectedRouteRenderer(RentalInsurance, "/tenant/rental-insurance")}
                </Route>
                <Route path="/tenant/lease">
                  {ProtectedRouteRenderer(TenantLeaseReview, "/tenant/lease")}
                </Route>
                <Route path="/tenant/settings">
                  {ProtectedRouteRenderer(TenantSettings, "/tenant/settings")}
                </Route>
                
                <Route component={NotFound} />
              </Switch>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
