import type { UserRole } from "@shared/schema";
import { useAuth } from "./auth-context";

const pageAccessRules: Record<string, UserRole[]> = {
  "/dashboard": ["Admin", "PropertyManager", "CFO", "Analyst"],
  "/collections": ["Admin", "PropertyManager", "CFO"],
  "/reconciliation": ["Admin", "PropertyManager", "CFO"],
  "/treasury": ["Admin", "CFO"],
  "/cash-flow-forecast": ["Admin", "PropertyManager", "CFO", "Analyst"],
  "/rent-pricing": ["Admin", "PropertyManager", "CFO", "Analyst"],
  "/capital-access": ["Admin", "PropertyManager", "CFO", "Analyst"],
  "/deposit-alternatives": ["Admin", "PropertyManager", "CFO", "Analyst"],
  "/reports": ["Admin", "PropertyManager", "CFO", "Analyst"],
  "/agent": ["Admin", "PropertyManager", "CFO", "Analyst"],
  "/ai-analytics": ["Admin", "PropertyManager", "CFO", "Analyst"],
  "/intelligence": ["Admin", "PropertyManager", "CFO", "Analyst"],
  "/rent-stability": ["Admin", "PropertyManager", "CFO", "Analyst"],
  "/collection-incentives": ["Admin", "PropertyManager", "CFO"],
  "/lease-agreements": ["Admin", "PropertyManager"],
  "/settings": ["Admin"],

  "/transaction-ledger": ["Admin", "CFO"],
  "/audit-trail": ["Admin", "CFO"],
  "/fraud-detection": ["Admin", "CFO"],
  "/renewal-prediction": ["Admin", "PropertyManager", "CFO", "Analyst"],
  "/investor-reporting": ["Admin", "CFO"],
  "/refi-readiness": ["Admin", "CFO"],
  "/staff-workload": ["Admin", "PropertyManager"],
  "/vendor-payments": ["Admin", "CFO"],
  "/vendor-onboarding": ["Admin", "PropertyManager"],
  "/vendor-performance": ["Admin", "PropertyManager", "CFO"],
  "/vendor-compliance": ["Admin", "PropertyManager", "CFO"],
  "/merchant-onboarding": ["Admin", "PropertyManager"],
  "/merchant-rewards": ["Admin", "PropertyManager", "CFO"],

  "/maintenance": ["Admin", "PropertyManager"],
  "/communications": ["Admin", "PropertyManager"],
  "/inspections": ["Admin", "PropertyManager"],
  "/marketing": ["Admin", "PropertyManager"],
  "/applications": ["Admin", "PropertyManager"],
  "/amenities": ["Admin", "PropertyManager"],
  "/community": ["Admin", "PropertyManager"],
  "/lease-management": ["Admin", "PropertyManager"],
  "/residents": ["Admin", "PropertyManager"],
  "/move-in-out": ["Admin", "PropertyManager"],
  "/units": ["Admin", "PropertyManager"],

  "/budgeting": ["Admin", "PropertyManager", "CFO", "Analyst"],
  "/accounts": ["Admin", "CFO"],
  "/compliance": ["Admin", "PropertyManager", "CFO"],
  "/utilities": ["Admin", "PropertyManager", "CFO"],
  "/parking": ["Admin", "PropertyManager"],
  "/packages": ["Admin", "PropertyManager"],
  "/access-control": ["Admin", "PropertyManager"],
  "/safety": ["Admin", "PropertyManager"],
  "/pest-control": ["Admin", "PropertyManager"],
  "/portfolio": ["Admin", "PropertyManager", "CFO", "Analyst"],
  "/capital-projects": ["Admin", "PropertyManager", "CFO"],
  "/procurement": ["Admin", "PropertyManager", "CFO"],
  "/disputes": ["Admin", "PropertyManager", "CFO"],

  "/tenant/home": ["Tenant"],
  "/tenant/payment-calendar": ["Tenant"],
  "/tenant/wallet": ["Tenant"],
  "/tenant/agent": ["Tenant"],
  "/tenant/reports": ["Tenant"],
  "/tenant/credit-builder": ["Tenant"],
  "/tenant/financial-hub": ["Tenant"],
  "/tenant/settings": ["Tenant"],
  "/tenant/p2p": ["Tenant"],
  "/tenant/rental-insurance": ["Tenant"],
  "/tenant/lease": ["Tenant"],
  "/tenant/privacy": ["Tenant"],
};

export function useRBAC() {
  const { user } = useAuth();

  const canAccessPage = (path: string): boolean => {
    if (!user) return false;
    
    const allowedRoles = pageAccessRules[path];
    if (!allowedRoles) return true;
    
    return allowedRoles.includes(user.role as UserRole);
  };

  const hasRole = (...roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role as UserRole);
  };

  return { canAccessPage, hasRole, currentRole: user?.role as UserRole | null };
}
