import type { Request, Response, NextFunction } from "express";
import type { UserRole } from "@shared/schema";

// Extend Express Request to include user info
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      organizationId?: string;
      userRole?: UserRole;
    }
  }
}

// Middleware to ensure user is authenticated (checks session)
export function requireAuth(req: Request, res: Response, next: NextFunction) {
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
