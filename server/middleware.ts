import type { Request, Response, NextFunction } from "express";
import type { UserRole, PersonaType } from "@shared/schema";
import type { IStorage } from "./storage";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      organizationId?: string;
      userRole?: UserRole;
      tenantId?: string;
      vendorUserId?: string;
      vendorIds?: string[];
      merchantUserId?: string;
      merchantIds?: string[];
      identityId?: string;
      personaId?: string;
      personaType?: PersonaType;
      roleDetail?: string;
    }
  }
}

const PERSONA_TO_ROLE_MAP: Record<string, Record<string, UserRole>> = {
  operator: { admin: "Admin", manager: "PropertyManager", cfo: "CFO", analyst: "Analyst" },
  tenant: { primary: "Tenant", co_tenant: "Tenant", guarantor: "Tenant" },
  vendor: { admin: "Vendor", tech: "Vendor" },
  merchant: { admin: "Merchant", staff: "Merchant" },
  partner: { admin: "Admin", agent: "Analyst" },
  support: { admin: "Admin", agent: "Analyst" },
};

export function personaToLegacyRole(personaType: string, roleDetail: string): UserRole {
  return PERSONA_TO_ROLE_MAP[personaType]?.[roleDetail] || "Analyst";
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId && !req.session.identityId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (req.session.personaId) {
    req.identityId = req.session.identityId;
    req.personaId = req.session.personaId;
    req.personaType = req.session.personaType as PersonaType;
    req.roleDetail = req.session.roleDetail;
    req.organizationId = req.session.organizationId;
    req.userRole = personaToLegacyRole(req.session.personaType || "", req.session.roleDetail || "");
    req.userId = req.session.userId;
  } else {
    req.userId = req.session.userId;
    req.userRole = req.session.userRole as UserRole;
    req.organizationId = req.session.organizationId;
  }

  next();
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId && !req.session.identityId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    let userRole: UserRole;
    if (req.session.personaId) {
      userRole = personaToLegacyRole(req.session.personaType || "", req.session.roleDetail || "");
      req.identityId = req.session.identityId;
      req.personaId = req.session.personaId;
      req.personaType = req.session.personaType as PersonaType;
      req.roleDetail = req.session.roleDetail;
    } else {
      userRole = req.session.userRole as UserRole;
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: "Access denied",
        message: `This endpoint requires one of: ${allowedRoles.join(", ")}. Your role: ${userRole}`
      });
    }

    req.userId = req.session.userId;
    req.userRole = userRole;
    req.organizationId = req.session.organizationId;
    req.tenantId = req.session.tenantId;

    next();
  };
}

export function extractOrganizationId(req: Request, res: Response, next: NextFunction) {
  if (req.path.includes("/auth/") ||
      req.path.startsWith("/api/vendor-auth") ||
      req.path.startsWith("/api/vendor/") ||
      req.path.startsWith("/api/merchant-auth") ||
      req.path.startsWith("/api/merchant/") ||
      req.path.startsWith("/api/identity")) {
    return next();
  }

  if (req.session.organizationId) {
    req.organizationId = req.session.organizationId;
    req.userId = req.session.userId;
    if (req.session.personaId) {
      req.userRole = personaToLegacyRole(req.session.personaType || "", req.session.roleDetail || "");
    } else {
      req.userRole = req.session.userRole as UserRole;
    }
  }

  next();
}

export function requireVendor(storage: IStorage) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId && !req.session.identityId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (req.session.personaType) {
      if (req.session.personaType !== "vendor") {
        return res.status(403).json({ error: "Vendor access required" });
      }
      const linkedVendorIds = req.session.personaId
        ? await storage.getVendorIdsByPersona(req.session.personaId)
        : [];
      if (linkedVendorIds.length === 0) {
        const fallbackIds = req.session.userId ? await storage.getVendorUserLinks(req.session.userId) : [];
        if (fallbackIds.length === 0) {
          return res.status(409).json({
            error: "No vendor access",
            message: "Your account has not been linked to any vendors yet."
          });
        }
        req.vendorIds = fallbackIds;
      } else {
        req.vendorIds = linkedVendorIds;
      }
    } else {
      if (req.session.userRole !== "Vendor") {
        return res.status(403).json({ error: "Vendor access required" });
      }
      const linkedVendorIds = await storage.getVendorUserLinks(req.session.userId!);
      if (linkedVendorIds.length === 0) {
        return res.status(409).json({
          error: "No vendor access",
          message: "Your account has not been linked to any vendors yet."
        });
      }
      req.vendorIds = linkedVendorIds;
    }

    req.vendorUserId = req.session.userId;
    req.userId = req.session.userId;
    req.userRole = "Vendor";

    next();
  };
}

export function requireMerchant(storage: IStorage) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId && !req.session.identityId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (req.session.personaType) {
      if (req.session.personaType !== "merchant") {
        return res.status(403).json({ error: "Merchant access required" });
      }
      const linkedMerchantIds = req.session.personaId
        ? await storage.getMerchantIdsByPersona(req.session.personaId)
        : [];
      if (linkedMerchantIds.length === 0) {
        const fallbackIds = req.session.userId ? await storage.getMerchantUserLinks(req.session.userId) : [];
        if (fallbackIds.length === 0) {
          return res.status(409).json({
            error: "No merchant access",
            message: "Your account has not been linked to any merchants yet."
          });
        }
        req.merchantIds = fallbackIds;
      } else {
        req.merchantIds = linkedMerchantIds;
      }
    } else {
      if (req.session.userRole !== "Merchant") {
        return res.status(403).json({ error: "Merchant access required" });
      }
      const linkedMerchantIds = await storage.getMerchantUserLinks(req.session.userId!);
      if (linkedMerchantIds.length === 0) {
        return res.status(409).json({
          error: "No merchant access",
          message: "Your account has not been linked to any merchants yet."
        });
      }
      req.merchantIds = linkedMerchantIds;
    }

    req.merchantUserId = req.session.userId;
    req.userId = req.session.userId;
    req.userRole = "Merchant";

    next();
  };
}
