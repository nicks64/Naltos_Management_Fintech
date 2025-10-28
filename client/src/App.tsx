import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { useRBAC } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { LogOut, ShieldAlert } from "lucide-react";

import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Collections from "@/pages/collections";
import Reconciliation from "@/pages/reconciliation";
import Treasury from "@/pages/treasury";
import Reports from "@/pages/reports";
import Agent from "@/pages/agent";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

// Tenant pages
import TenantHome from "@/pages/tenant/home";
import TenantWallet from "@/pages/tenant/wallet";
import TenantAgent from "@/pages/tenant/agent";
import TenantReports from "@/pages/tenant/reports";
import TenantSettings from "@/pages/tenant/settings";
import { TenantSidebar } from "@/components/tenant-sidebar";

function ProtectedRoute({ component: Component, path }: { component: () => JSX.Element; path: string }) {
  const { user } = useAuth();
  const { canAccessPage } = useRBAC();
  const [, setLocation] = useLocation();
  
  if (!user) {
    setLocation("/");
    return null;
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

function AppContent() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  // Redirect based on user role
  if (user && location === "/") {
    const redirectPath = user.role === "Tenant" ? "/tenant/home" : "/dashboard";
    return <Redirect to={redirectPath} />;
  }

  // Show login page if not authenticated
  if (!user) {
    return <Login />;
  }

  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  const isTenant = user.role === "Tenant";

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        {isTenant ? <TenantSidebar /> : <AppSidebar />}
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between px-8 py-4 border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={handleLogout} data-testid="button-logout">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <div className={isTenant ? "px-8 py-6" : "max-w-[1600px] mx-auto px-8 py-6"}>
              <Switch>
                {/* Business routes */}
                <Route path="/dashboard">
                  {() => <ProtectedRoute component={Dashboard} path="/dashboard" />}
                </Route>
                <Route path="/collections">
                  {() => <ProtectedRoute component={Collections} path="/collections" />}
                </Route>
                <Route path="/reconciliation">
                  {() => <ProtectedRoute component={Reconciliation} path="/reconciliation" />}
                </Route>
                <Route path="/treasury">
                  {() => <ProtectedRoute component={Treasury} path="/treasury" />}
                </Route>
                <Route path="/reports">
                  {() => <ProtectedRoute component={Reports} path="/reports" />}
                </Route>
                <Route path="/agent">
                  {() => <ProtectedRoute component={Agent} path="/agent" />}
                </Route>
                <Route path="/settings">
                  {() => <ProtectedRoute component={Settings} path="/settings" />}
                </Route>
                
                {/* Tenant routes */}
                <Route path="/tenant/home">
                  {() => <ProtectedRoute component={TenantHome} path="/tenant/home" />}
                </Route>
                <Route path="/tenant/wallet">
                  {() => <ProtectedRoute component={TenantWallet} path="/tenant/wallet" />}
                </Route>
                <Route path="/tenant/agent">
                  {() => <ProtectedRoute component={TenantAgent} path="/tenant/agent" />}
                </Route>
                <Route path="/tenant/reports">
                  {() => <ProtectedRoute component={TenantReports} path="/tenant/reports" />}
                </Route>
                <Route path="/tenant/settings">
                  {() => <ProtectedRoute component={TenantSettings} path="/tenant/settings" />}
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
