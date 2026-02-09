import type { UserRole } from "@shared/schema";
import { useAuth } from "./auth-context";

// Define page access rules by role
const pageAccessRules: Record<string, UserRole[]> = {
  // Business Side (Property Managers / Owners)
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
  "/settings": ["Admin"],
  
  // Consumer Side (Tenants / Residents)
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
};

export function useRBAC() {
  const { user } = useAuth();

  const canAccessPage = (path: string): boolean => {
    if (!user) return false;
    
    const allowedRoles = pageAccessRules[path];
    if (!allowedRoles) return true; // No restrictions if not in rules
    
    return allowedRoles.includes(user.role as UserRole);
  };

  const hasRole = (...roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role as UserRole);
  };

  return { canAccessPage, hasRole, currentRole: user?.role as UserRole | null };
}
