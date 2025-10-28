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

// RBAC middleware to check if user has required role
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.userRole;

    if (!userRole) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: "Access denied",
        message: `This endpoint requires one of: ${allowedRoles.join(", ")}. Your role: ${userRole}`
      });
    }

    next();
  };
}

// Middleware to extract organization ID from header
export function extractOrganizationId(req: Request, res: Response, next: NextFunction) {
  const orgId = req.headers["x-organization-id"] as string;
  if (orgId) {
    req.organizationId = orgId;
  }
  next();
}
