import type { Request, Response, NextFunction } from "express";
import type { UserRole } from "@shared/schema";
import type { IStorage } from "./storage";

// Extend Express Request to include user info and vendor context
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      organizationId?: string;
      userRole?: UserRole;
      tenantId?: string; // For tenant-role users: their tenant ID
      vendorUserId?: string; // For vendor users: their user ID
      vendorIds?: string[]; // For vendor users: all accessible vendor record IDs via vendor_user_links
    }
  }
}

// Middleware to ensure user is authenticated (checks session)
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  // Store session data in request for easy access
  req.userId = req.session.userId;
  req.userRole = req.session.userRole as UserRole;
  req.organizationId = req.session.organizationId;
  
  next();
}

// RBAC middleware to check if user has required role (uses session, not headers)
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // First ensure authenticated
    if (!req.session.userId || !req.session.userRole) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const userRole = req.session.userRole as UserRole;
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: "Access denied",
        message: `This endpoint requires one of: ${allowedRoles.join(", ")}. Your role: ${userRole}`
      });
    }
    
    // Store session data in request for easy access
    req.userId = req.session.userId;
    req.userRole = userRole;
    req.organizationId = req.session.organizationId;
    req.tenantId = req.session.tenantId; // For tenant users
    
    next();
  };
}

// Middleware to extract organization ID (uses session, not headers)
export function extractOrganizationId(req: Request, res: Response, next: NextFunction) {
  // Skip for auth routes
  if (req.path.includes("/auth/")) {
    return next();
  }
  
  // Use session data if available
  if (req.session.organizationId) {
    req.organizationId = req.session.organizationId;
    req.userId = req.session.userId;
    req.userRole = req.session.userRole as UserRole;
  }
  
  next();
}

// Middleware for vendor-specific routes - validates vendor session and loads vendor links
// SECURITY: Revalidates vendor links on EVERY request to ensure immediate revocation when links are removed
export function requireVendor(storage: IStorage) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // 1. Check authenticated session
    if (!req.session.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // 2. Verify role is Vendor
    if (req.session.userRole !== "Vendor") {
      return res.status(403).json({ error: "Vendor access required" });
    }

    // 3. ALWAYS query vendor_user_links to get current linked vendors (no caching)
    // This ensures vendor access is revoked immediately when links are removed
    const linkedVendorIds = await storage.getVendorUserLinks(req.session.userId);
    
    // 4. Check if vendor has any linked vendors
    if (linkedVendorIds.length === 0) {
      return res.status(409).json({ 
        error: "No vendor access",
        message: "Your account has not been linked to any vendors yet. Please contact your property manager."
      });
    }

    // 5. Attach vendor data to request for easy access in route handlers
    req.vendorUserId = req.session.userId;
    req.vendorIds = linkedVendorIds;
    req.userId = req.session.userId;
    req.userRole = "Vendor";

    next();
  };
}
