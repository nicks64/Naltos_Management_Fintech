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

function ProtectedRoute({ component: Component, path }: { component: () => JSX.Element; path: string }) {
  const { user } = useAuth();
  const { canAccessPage } = useRBAC();
  
  if (!user) {
    return <Redirect to="/" />;
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

function Router() {
  const { user } = useAuth();
  const [location] = useLocation();

  if (!user && location !== "/") {
    return <Redirect to="/" />;
  }

  if (user && location === "/") {
    return <Redirect to="/dashboard" />;
  }

  return (
    <Switch>
      <Route path="/" component={Login} />
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
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  if (!user) {
    return <Router />;
  }

  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
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
            <div className="max-w-[1600px] mx-auto px-8 py-6">
              <Router />
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
