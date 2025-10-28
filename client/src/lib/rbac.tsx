import type { UserRole } from "@shared/schema";
import { useAuth } from "./auth-context";

// Define page access rules by role
const pageAccessRules: Record<string, UserRole[]> = {
  "/dashboard": ["Admin", "PropertyManager", "CFO", "Analyst"],
  "/collections": ["Admin", "PropertyManager", "CFO"],
  "/reconciliation": ["Admin", "PropertyManager", "CFO"],
  "/treasury": ["Admin", "CFO"],
  "/reports": ["Admin", "PropertyManager", "CFO", "Analyst"],
  "/agent": ["Admin", "PropertyManager", "CFO", "Analyst"],
  "/settings": ["Admin"],
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
