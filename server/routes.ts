import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { seedDatabase } from "./seed";
import bcrypt from "bcrypt";
import OpenAI from "openai";
import { requireAuth, requireRole, extractOrganizationId, requireVendor, requireMerchant } from "./middleware";

// Reference: blueprint:javascript_openai_ai_integrations
// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply organization ID extraction middleware globally
  app.use("/api", extractOrganizationId);

  // ============ Seed Route (Demo Only - Admin Access Required) ============
  app.post("/api/seed", requireAuth, requireRole("Admin"), async (req, res) => {
    try {
      // Only allow seeding for demo organization
      const orgId = req.organizationId!;
      const org = await storage.getOrganization(orgId);
      
      if (!org || org.name !== "Naltos Demo Properties") {
        return res.status(403).json({ error: "Seeding is only available for demo organization" });
      }
      
      await seedDatabase();
      res.json({ success: true, message: "Database seeded successfully" });
    } catch (error: any) {
      console.error("Seed error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Auth Routes ============
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, organizationName } = req.body;

      // Check if user exists
      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Create organization
      const organization = await storage.createOrganization({
        name: organizationName,
      });

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        organizationId: organization.id,
        role: "Admin",
      });

      // Regenerate session to prevent fixation attacks
      await new Promise<void>((resolve, reject) => {
        req.session.regenerate((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Store user info in session for secure authentication
      req.session.userId = user.id;
      req.session.userRole = user.role;
      req.session.organizationId = user.organizationId!; // Safe because signup always creates an organization

      res.json({ user, organization });
    } catch (error: any) {
      console.error("Signup error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/send-code", async (req, res) => {
    try {
      const { email } = req.body;

      // Delete old magic codes for this email to prevent confusion
      await storage.deleteOldMagicCodes(email);

      // Create magic code - always "000000" for demo
      const code = "000000";
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await storage.createMagicCode({
        email,
        code,
        expiresAt,
        used: false,
      });

      // In production, would send email here
      res.json({ success: true });
    } catch (error: any) {
      console.error("Send code error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, code } = req.body;

      // Find magic code
      const magicCode = await storage.getMagicCode(email, code);
      if (!magicCode) {
        return res.status(401).json({ error: "Invalid magic code" });
      }

      // Check expiration
      if (new Date() > magicCode.expiresAt) {
        return res.status(401).json({ error: "Magic code expired" });
      }

      // Mark as used (except for demo accounts to allow reuse)
      const demoEmails = ["demo@naltos.com", "tenant@demo.com"];
      if (!demoEmails.includes(email)) {
        await storage.markMagicCodeUsed(magicCode.id);
      }

      // Get or create user
      let user = await storage.getUserByEmail(email);
      if (!user) {
        // For demo, create user if doesn't exist
        const hashedPassword = await bcrypt.hash("demo123", 10);
        const existingOrgs = await storage.getOrganization("demo-org-id"); // Won't exist for new users
        let organization;
        if (!existingOrgs) {
          organization = await storage.createOrganization({
            name: "Demo Organization",
          });
        } else {
          organization = existingOrgs;
        }

        user = await storage.createUser({
          email,
          password: hashedPassword,
          organizationId: organization.id,
          role: "Admin",
        });
      }

      // Vendor users should use /api/vendor-auth/login instead
      if (user.role === "Vendor") {
        return res.status(400).json({ 
          error: "Invalid login endpoint",
          message: "Vendor users should login at /api/vendor-auth/login"
        });
      }

      // Merchant users should use /api/merchant-auth/login instead
      if (user.role === "Merchant") {
        return res.status(400).json({ 
          error: "Invalid login endpoint",
          message: "Merchant users should login at /api/merchant-auth/login"
        });
      }

      // Get organization (safe because we verified user is not a vendor)
      const organization = await storage.getOrganization(user.organizationId!);

      // Regenerate session to prevent fixation attacks
      await new Promise<void>((resolve, reject) => {
        req.session.regenerate((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Store user info in session for secure authentication
      req.session.userId = user.id;
      req.session.userRole = user.role;
      req.session.organizationId = user.organizationId!; // Safe because non-vendor users always have organizationId

      res.json({ user, organization });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  // ============ Vendor Auth Routes ============
  // Vendor-specific authentication (no organization signup, vendors are invited by property managers)
  
  app.post("/api/vendor-auth/send-code", async (req, res) => {
    try {
      const { email } = req.body;

      // Verify vendor user exists (vendors must be invited, they can't self-signup)
      const user = await storage.getUserByEmail(email);
      if (!user || user.role !== "Vendor") {
        return res.status(404).json({ 
          error: "Vendor not found",
          message: "No vendor account found with this email. Please contact your property manager to get invited."
        });
      }

      // Delete old magic codes for this email to prevent confusion
      await storage.deleteOldMagicCodes(email);

      // Create magic code - always "111111" for demo
      const code = "111111";
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await storage.createMagicCode({
        email,
        code,
        expiresAt,
        used: false,
      });

      // In production, would send email here
      res.json({ success: true });
    } catch (error: any) {
      console.error("Vendor send code error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/vendor-auth/login", async (req, res) => {
    try {
      const { email, code } = req.body;

      // Find magic code
      const magicCode = await storage.getMagicCode(email, code);
      if (!magicCode) {
        return res.status(401).json({ 
          error: "Invalid magic code",
          message: "Invalid magic code"
        });
      }

      // Check expiration
      if (new Date() > magicCode.expiresAt) {
        return res.status(401).json({ 
          error: "Magic code expired",
          message: "Magic code expired"
        });
      }

      // Mark as used (except for demo accounts to allow reuse)
      if (email !== "vendor@demo.com") {
        await storage.markMagicCodeUsed(magicCode.id);
      }

      // Get vendor user (must exist, vendors are invited not self-signup)
      const user = await storage.getUserByEmail(email);
      if (!user || user.role !== "Vendor") {
        return res.status(401).json({ 
          error: "Invalid vendor account",
          message: "This account is not registered as a vendor."
        });
      }

      // Get vendor user links to ensure they have access to at least one vendor
      const linkedVendorIds = await storage.getVendorUserLinks(user.id);
      if (linkedVendorIds.length === 0) {
        return res.status(409).json({ 
          error: "No vendor access",
          message: "Your account has not been linked to any vendors yet. Please contact your property manager."
        });
      }

      // Regenerate session to prevent fixation attacks
      await new Promise<void>((resolve, reject) => {
        req.session.regenerate((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Store user info in session for secure authentication
      // NOTE: organizationId is null for vendor users (they span multiple orgs)
      req.session.userId = user.id;
      req.session.userRole = "Vendor";
      req.session.organizationId = null as any; // Vendor users have no single organization (use null, not undefined)

      // Return user with vendor metadata (linked vendor count)
      res.json({ 
        user: {
          ...user,
          vendorCount: linkedVendorIds.length, // Number of property managers this vendor works with
        },
        organization: null, // Vendors don't have a single organization
      });
    } catch (error: any) {
      console.error("Vendor login error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Merchant Authentication Routes ============
  // Merchant-specific authentication (similar to vendor auth pattern)
  
  app.post("/api/merchant-auth/send-code", async (req, res) => {
    try {
      const { email } = req.body;

      // Verify merchant user exists (merchants must be invited, they can't self-signup)
      const user = await storage.getUserByEmail(email);
      if (!user || user.role !== "Merchant") {
        return res.status(404).json({ 
          error: "Merchant not found",
          message: "No merchant account found with this email. Please contact your property manager to get invited."
        });
      }

      // Delete old magic codes for this email to prevent confusion
      await storage.deleteOldMagicCodes(email);

      // Create magic code - always "222222" for demo
      const code = "222222";
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await storage.createMagicCode({
        email,
        code,
        expiresAt,
        used: false,
      });

      // In production, would send email here
      res.json({ success: true });
    } catch (error: any) {
      console.error("Merchant send code error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/merchant-auth/login", async (req, res) => {
    try {
      const { email, code } = req.body;

      // Find magic code
      const magicCode = await storage.getMagicCode(email, code);
      if (!magicCode) {
        return res.status(401).json({ 
          error: "Invalid magic code",
          message: "Invalid magic code"
        });
      }

      // Check expiration
      if (new Date() > magicCode.expiresAt) {
        return res.status(401).json({ 
          error: "Magic code expired",
          message: "Magic code expired"
        });
      }

      // Mark as used (except for demo accounts to allow reuse)
      if (email !== "merchant@demo.com") {
        await storage.markMagicCodeUsed(magicCode.id);
      }

      // Get merchant user (must exist, merchants are invited not self-signup)
      const user = await storage.getUserByEmail(email);
      if (!user || user.role !== "Merchant") {
        return res.status(401).json({ 
          error: "Invalid merchant account",
          message: "This account is not registered as a merchant."
        });
      }

      // Get merchant user links to ensure they have access to at least one merchant
      const linkedMerchantIds = await storage.getMerchantUserLinks(user.id);
      if (linkedMerchantIds.length === 0) {
        return res.status(409).json({ 
          error: "No merchant access",
          message: "Your account has not been linked to any merchants yet. Please contact your property manager."
        });
      }

      // Regenerate session to prevent fixation attacks
      await new Promise<void>((resolve, reject) => {
        req.session.regenerate((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Store user info in session for secure authentication
      // NOTE: organizationId is null for merchant users (they span multiple orgs)
      req.session.userId = user.id;
      req.session.userRole = "Merchant";
      req.session.organizationId = null as any; // Merchant users have no single organization (use null, not undefined)

      // Return user with merchant metadata (linked merchant count)
      res.json({ 
        user: {
          ...user,
          merchantCount: linkedMerchantIds.length, // Number of property managers this merchant works with
        },
        organization: null, // Merchants don't have a single organization
      });
    } catch (error: any) {
      console.error("Merchant login error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Vendor Portal Routes ============
  app.get("/api/vendor/balances", requireVendor(storage), async (req, res) => {
    try {
      const vendorIds = req.vendorIds!;
      
      // Get vendor overview with balances and organization info
      const overview = await storage.getVendorOverview(vendorIds);
      
      // Use the same helper as createRedemption to ensure consistency
      // This deducts pending/processing redemptions from available balance
      const balanceState = await storage.computeVendorBalanceState(vendorIds);
      
      const balances = overview.map(({ vendor, balance, organization }) => {
        const key = `${vendor.id}-${organization.id}`;
        const state = balanceState.get(key);
        
        // If no balance state found, use zeros
        if (!state) {
          return {
            vendorId: vendor.id,
            organizationName: organization.name,
            totalBalance: 0,
            availableBalance: 0,
            pendingBalance: 0,
          };
        }
        
        return {
          vendorId: vendor.id,
          organizationName: organization.name,
          totalBalance: state.totalBalance,
          availableBalance: state.availableBalance, // Correctly deducts pending redemptions
          pendingBalance: state.pendingBalance,     // Sum of pending/processing redemptions
        };
      });
      
      res.json({ balances });
    } catch (error: any) {
      console.error("Vendor balances error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/vendor/invoices", requireVendor(storage), async (req, res) => {
    try {
      const vendorIds = req.vendorIds!;
      
      // Get invoices filtered by vendor IDs with organization names
      const invoicesData = await storage.getInvoicesForVendorIds(vendorIds);
      
      const invoices = invoicesData.map(inv => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        amount: parseFloat(inv.amount),
        status: inv.status,
        dueDate: inv.dueDate.toISOString(),
        organizationName: inv.organizationName,
      }));
      
      res.json({ invoices });
    } catch (error: any) {
      console.error("Vendor invoices error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/vendor/redemptions", requireVendor(storage), async (req, res) => {
    try {
      const vendorIds = req.vendorIds!;
      
      // Get real redemption data from database
      const redemptions = await storage.getRedemptionsByVendorIds(vendorIds);
      
      res.json({ redemptions });
    } catch (error: any) {
      console.error("Vendor redemptions error:", error);
      res.status(500).json({ error: error.message, message: error.message });
    }
  });

  app.post("/api/vendor/redemptions", requireVendor(storage), async (req, res) => {
    try {
      // SECURITY: vendorIds from req.vendorIds (set by requireVendor middleware)
      // This is derived from vendor_user_links table, NOT from client request
      const vendorIds = req.vendorIds!;
      const { rail, nusdAmount, payoutMethodId } = req.body;
      
      // Validate input
      if (!rail || !nusdAmount) {
        return res.status(400).json({ 
          error: "Missing required fields", 
          message: "Rail type and amount are required" 
        });
      }
      
      // Validate rail type
      const validRails = ["ACH", "PushToCard", "OnChainStablecoin"];
      if (!validRails.includes(rail)) {
        return res.status(400).json({ 
          error: "Invalid rail type", 
          message: `Rail must be one of: ${validRails.join(", ")}` 
        });
      }
      
      // Validate amount
      const amount = parseFloat(nusdAmount);
      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ 
          error: "Invalid amount", 
          message: "Amount must be a positive number" 
        });
      }
      
      // Create redemption(s) - proportionally deducted across vendor balances
      const redemptions = await storage.createRedemption({
        vendorIds,
        rail,
        nusdAmount: amount.toFixed(2),
        payoutMethodId,
      });
      
      res.json({ 
        success: true,
        message: "Redemption request created successfully",
        redemptions 
      });
    } catch (error: any) {
      console.error("Vendor redemption creation error:", error);
      
      // Return appropriate status code based on error message
      const statusCode = error.message.includes("Insufficient balance") ? 400 : 500;
      
      res.status(statusCode).json({ 
        error: error.message, 
        message: error.message 
      });
    }
  });

  app.get("/api/vendor/stablecoin-allocations/:vendorId", requireVendor(storage), async (req, res) => {
    try {
      const vendorIds = req.vendorIds!;
      const { vendorId } = req.params;
      const userId = req.userId!;
      
      // Verify vendor access
      if (!vendorIds.includes(vendorId)) {
        return res.status(403).json({ 
          error: "Access denied",
          message: "You don't have access to this vendor"
        });
      }
      
      const allocations = await storage.getVendorStablecoinAllocations(userId, vendorId);
      
      res.json({ allocations });
    } catch (error: any) {
      console.error("Vendor stablecoin allocations error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/vendor/treasury-allocations/:vendorId", requireVendor(storage), async (req, res) => {
    try {
      const vendorIds = req.vendorIds!;
      const { vendorId } = req.params;
      const userId = req.userId!;
      
      // Verify vendor access
      if (!vendorIds.includes(vendorId)) {
        return res.status(403).json({ 
          error: "Access denied",
          message: "You don't have access to this vendor"
        });
      }
      
      const allocations = await storage.getVendorTreasuryAllocations(userId, vendorId);
      
      res.json({ allocations });
    } catch (error: any) {
      console.error("Vendor treasury allocations error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Merchant Portal Routes ============
  app.get("/api/merchant/balances", requireMerchant(storage), async (req, res) => {
    try {
      const merchantIds = req.merchantIds!;
      
      // Get merchant overview with balances and organization info
      const overview = await storage.getMerchantOverview(merchantIds);
      
      const balances = overview.map(({ merchant, balance, organization }) => {
        return {
          merchantId: merchant.id,
          organizationName: organization.name,
          nusdBalance: balance?.nusdBalance || 0,
          pendingSettlement: balance?.pendingSettlement || 0,
          totalReceived: balance?.totalReceived || 0,
          totalSettled: balance?.totalSettled || 0,
          totalYieldGenerated: balance?.totalYieldGenerated || 0,
        };
      });
      
      res.json({ balances });
    } catch (error: any) {
      console.error("Merchant balances error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/merchant/transactions/:merchantId", requireMerchant(storage), async (req, res) => {
    try {
      const merchantIds = req.merchantIds!;
      const { merchantId } = req.params;
      const { status } = req.query;
      const userId = req.userId!;
      
      // Verify merchantId is in the user's accessible merchants
      if (!merchantIds.includes(merchantId)) {
        return res.status(403).json({ 
          error: "Access denied",
          message: "You don't have access to this merchant"
        });
      }
      
      // Get transactions for the specific merchant
      const transactions = await storage.getMerchantTransactionsByMerchantId(
        userId,
        merchantId,
        status ? { status: status as string } : undefined
      );
      
      res.json({ transactions });
    } catch (error: any) {
      console.error("Merchant transactions error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/merchant/stablecoin-allocations/:merchantId", requireMerchant(storage), async (req, res) => {
    try {
      const merchantIds = req.merchantIds!;
      const { merchantId } = req.params;
      const userId = req.userId!;
      
      // Verify merchant access
      if (!merchantIds.includes(merchantId)) {
        return res.status(403).json({ 
          error: "Access denied",
          message: "You don't have access to this merchant"
        });
      }
      
      const allocations = await storage.getMerchantStablecoinAllocations(userId, merchantId);
      
      res.json({ allocations });
    } catch (error: any) {
      console.error("Merchant stablecoin allocations error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/merchant/treasury-allocations/:merchantId", requireMerchant(storage), async (req, res) => {
    try {
      const merchantIds = req.merchantIds!;
      const { merchantId } = req.params;
      const userId = req.userId!;
      
      // Verify merchant access
      if (!merchantIds.includes(merchantId)) {
        return res.status(403).json({ 
          error: "Access denied",
          message: "You don't have access to this merchant"
        });
      }
      
      const allocations = await storage.getMerchantTreasuryAllocations(userId, merchantId);
      
      res.json({ allocations });
    } catch (error: any) {
      console.error("Merchant treasury allocations error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Merchant instant settlement (demo - simulates immediate settlement to bank)
  app.post("/api/merchant/settlements", requireMerchant(storage), async (req, res) => {
    try {
      const merchantIds = req.merchantIds!;
      const { amount, merchantId, paymentMethod } = req.body;
      
      // Verify merchant access
      if (!merchantIds.includes(merchantId)) {
        return res.status(403).json({ 
          error: "Access denied",
          message: "You don't have access to this merchant"
        });
      }
      
      // For demo purposes, just return success with simulated data
      // In production, this would create actual settlement records
      const settlement = {
        id: Math.random().toString(36).substring(7),
        merchantId,
        amount: parseFloat(amount),
        paymentMethod: paymentMethod || 'ach',
        status: 'processing',
        requestedAt: new Date().toISOString(),
        estimatedCompletion: paymentMethod === 'wire' 
          ? new Date().toISOString() 
          : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Next day for ACH
      };
      
      res.json({ 
        settlement,
        message: `Settlement of $${amount} initiated via ${paymentMethod.toUpperCase()}. Funds will arrive in your bank account ${paymentMethod === 'wire' ? 'today' : '1-2 business days'}.`
      });
    } catch (error: any) {
      console.error("Merchant settlement error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ KPI Routes ============
  // All roles can access KPIs
  app.get("/api/kpis", requireRole("Admin", "PropertyManager", "CFO", "Analyst"), async (req, res) => {
    try {
      // Get org ID from session (set by requireRole middleware)
      const orgId = req.organizationId!;

      const kpis = await storage.getKPIs(orgId);
      res.json(kpis);
    } catch (error: any) {
      console.error("KPI error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Collections Routes ============
  // Admin, PropertyManager, CFO can access collections
  app.get("/api/collections", requireRole("Admin", "PropertyManager", "CFO"), async (req, res) => {
    try {
      const orgId = req.organizationId!;

      const collections = await storage.getCollections(orgId);
      res.json(collections);
    } catch (error: any) {
      console.error("Collections error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/collections/:id/paylink", requireRole("Admin", "PropertyManager", "CFO"), async (req, res) => {
    try {
      // Mock: In production, would send SMS/email
      res.json({ success: true });
    } catch (error: any) {
      console.error("Paylink error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/collections/:id/nudge", requireRole("Admin", "PropertyManager", "CFO"), async (req, res) => {
    try {
      // Mock: In production, would schedule reminder
      res.json({ success: true });
    } catch (error: any) {
      console.error("Nudge error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Reconciliation Routes ============
  // Admin, PropertyManager, CFO can access reconciliation
  app.get("/api/recon", requireRole("Admin", "PropertyManager", "CFO"), async (req, res) => {
    try {
      const orgId = req.organizationId!;

      const recon = await storage.getReconciliation(orgId);
      res.json(recon);
    } catch (error: any) {
      console.error("Recon error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/recon/auto-match", requireRole("Admin", "PropertyManager", "CFO"), async (req, res) => {
    try {
      // Mock: In production, would run AI matching algorithm
      res.json({ success: true });
    } catch (error: any) {
      console.error("Auto-match error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/recon/approve", requireRole("Admin", "PropertyManager", "CFO"), async (req, res) => {
    try {
      const { bankEntryId, paymentId } = req.body;
      await storage.approveMatch(bankEntryId, paymentId);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Approve match error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Treasury Routes ============
  // Only Admin and CFO can access treasury
  app.get("/api/treasury/products", requireRole("Admin", "CFO"), async (req, res) => {
    try {
      const orgId = req.organizationId!;

      const products = await storage.getTreasuryProducts();
      const subscriptions = await storage.getTreasurySubscriptions(orgId);

      // Merge products with subscriptions
      const productsWithSubs = products.map(product => {
        const subscription = subscriptions.find(sub => sub.productId === product.id);
        return {
          ...product,
          subscription: subscription || undefined,
        };
      });

      res.json(productsWithSubs);
    } catch (error: any) {
      console.error("Treasury products error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/treasury/subscribe", requireRole("Admin", "CFO"), async (req, res) => {
    try {
      const { productId, amount } = req.body;
      const orgId = req.organizationId!;

      const subscription = await storage.createOrUpdateSubscription({
        organizationId: orgId,
        productId,
        balance: amount.toFixed(2),
        autoRoll: false,
      });

      res.json(subscription);
    } catch (error: any) {
      console.error("Subscribe error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/treasury/redeem", requireRole("Admin", "CFO"), async (req, res) => {
    try {
      const { subscriptionId, amount } = req.body;
      const orgId = req.organizationId!;

      // Get current subscription
      const subs = await storage.getTreasurySubscriptions(orgId);
      const subscription = subs.find(s => s.id === subscriptionId);
      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" });
      }

      const currentBalance = parseFloat(subscription.balance);
      const newBalance = Math.max(0, currentBalance - amount).toFixed(2);

      await storage.updateSubscriptionBalance(subscriptionId, newBalance);

      res.json({ success: true, newBalance });
    } catch (error: any) {
      console.error("Redeem error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/treasury/autoroll", requireRole("Admin", "CFO"), async (req, res) => {
    try {
      const { subscriptionId, autoRoll } = req.body;

      await storage.toggleAutoRoll(subscriptionId, autoRoll);

      res.json({ success: true });
    } catch (error: any) {
      console.error("Auto-roll error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Rent Float Treasury Routes ============
  app.get("/api/rent-float", requireRole("Admin", "CFO"), async (req, res) => {
    try {
      const orgId = req.organizationId!;

      const data = await storage.getRentFloatData(orgId);

      res.json(data);
    } catch (error: any) {
      console.error("Rent float error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/rent-float/enhanced", requireRole("Admin", "CFO"), async (req, res) => {
    try {
      let baseData: any;
      try {
        baseData = await storage.getRentFloatData(req.organizationId!);
      } catch {
        baseData = {
          config: { rentFloatEnabled: true, rentFloatYieldRate: "5.25", rentFloatOwnerShare: "3.00", rentFloatTenantShare: "1.25", rentFloatNaltosShare: "0.75", rentFloatDefaultDuration: 10 },
          totalFloat: "245000.00", averageDuration: 10, monthlyYield: "340.00",
          ownerShare: "204.00", tenantShare: "85.00", naltosShare: "51.00", recentPayments: [],
        };
      }
      const totalFloat = parseFloat(baseData.totalFloat) || 0;
      const monthlyYield = parseFloat(baseData.monthlyYield) || 0;
      const yieldRate = parseFloat(baseData.config.rentFloatYieldRate || "5.25");

      const now = new Date();
      const monthlyTrend = Array.from({ length: 12 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
        const month = d.toLocaleString("default", { month: "short" });
        const seasonFactor = 1 + 0.08 * Math.sin((d.getMonth() - 3) * Math.PI / 6);
        const growthFactor = 0.85 + (i / 11) * 0.15;
        const baseFloat = totalFloat > 0 ? totalFloat : 245000;
        const floatBal = Math.round(baseFloat * seasonFactor * growthFactor);
        const yieldGen = Math.round(floatBal * (yieldRate / 100) * (10 / 365));
        const utilization = Math.min(98, 82 + i * 1.2 + Math.random() * 3);
        return { month, floatBalance: floatBal, yieldGenerated: yieldGen, utilization: Math.round(utilization) };
      });

      const deploymentAllocation = [
        { product: "Treasury Bills", allocation: 45, apy: 5.25, balance: Math.round((totalFloat || 245000) * 0.45) },
        { product: "Money Market", allocation: 30, apy: 4.80, balance: Math.round((totalFloat || 245000) * 0.30) },
        { product: "Enhanced Credit", allocation: 15, apy: 6.10, balance: Math.round((totalFloat || 245000) * 0.15) },
        { product: "Liquidity Reserve", allocation: 10, apy: 3.50, balance: Math.round((totalFloat || 245000) * 0.10) },
      ];

      const currentFloat = totalFloat || 245000;
      const avgCycleTime = baseData.averageDuration || 10;
      const floatVelocity = {
        currentBalance: currentFloat,
        deployedBalance: Math.round(currentFloat * 0.92),
        utilization: 92,
        avgCycleTime,
        turnoverRate: +(30 / avgCycleTime).toFixed(1),
        dailyYield: +((monthlyYield || 340) / 30).toFixed(2),
        projectedAnnualYield: Math.round((monthlyYield || 340) * 12),
        weightedAPY: +(deploymentAllocation.reduce((s, d) => s + d.apy * d.allocation / 100, 0)).toFixed(2),
      };

      const floatIntelligence = {
        optimalDeploymentMix: "Current allocation is 3.2% below neural-optimized target. Shifting 5% from Liquidity Reserve to Enhanced Credit would add ~$420/yr.",
        paymentTimingInsight: "67% of rent payments cluster between the 1st-5th. Pre-positioning treasury deployments 48hrs before peak inflow increases yield capture by 0.8%.",
        seasonalForecast: "Q2 historically shows 12% higher float balances due to lease renewals. Recommend increasing Enhanced Credit allocation to 20% during Apr-Jun.",
        riskAssessment: "Float concentration risk: low. 94% of float is in investment-grade instruments with same-day liquidity. Max drawdown scenario: 2.1% over 30 days.",
        confidenceScore: 87,
      };

      res.json({
        ...baseData,
        monthlyTrend,
        deploymentAllocation,
        floatVelocity,
        floatIntelligence,
      });
    } catch (error: any) {
      console.error("Rent float enhanced error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Agent Routes ============
  // All roles can access agent
  app.post("/api/agent", requireRole("Admin", "PropertyManager", "CFO", "Analyst"), async (req, res) => {
    try {
      const { prompt } = req.body;

      // Set headers for streaming
      res.setHeader("Content-Type", "text/plain");
      res.setHeader("Transfer-Encoding", "chunked");

      // Create streaming completion
      const stream = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are Naltos Agent, an AI assistant for property management and treasury operations. Provide helpful, professional insights based on the user's question. Keep responses concise and actionable. For demo purposes, reference realistic but fictional data."
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        stream: true,
        max_completion_tokens: 500,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          res.write(content);
        }
      }

      res.end();
    } catch (error: any) {
      console.error("Agent error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Reports Routes ============
  // All roles can access reports
  app.get("/api/reports", requireRole("Admin", "PropertyManager", "CFO", "Analyst"), async (req, res) => {
    try {
      const orgId = req.organizationId!;

      const reports = await storage.getReports(orgId);
      res.json(reports);
    } catch (error: any) {
      console.error("Reports error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Settings Routes ============
  // Only Admin can access settings
  app.get("/api/settings", requireRole("Admin"), async (req, res) => {
    try {
      const orgId = req.organizationId!;

      const settings = await storage.getSettings(orgId);
      res.json(settings);
    } catch (error: any) {
      console.error("Settings error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/settings/organization", requireRole("Admin"), async (req, res) => {
    try {
      const { name } = req.body;
      const orgId = req.organizationId!;

      await storage.updateOrganization(orgId, name);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Update org error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/settings/update", requireRole("Admin"), async (req, res) => {
    try {
      const updates = req.body;
      const orgId = req.organizationId!;

      await storage.updateSettings(orgId, updates);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Update settings error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/settings/users", requireRole("Admin"), async (req, res) => {
    try {
      const orgId = req.organizationId!;

      const users = await storage.getOrgUsers(orgId);
      res.json(users);
    } catch (error: any) {
      console.error("Get users error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Tenant Routes ============
  app.get("/api/tenant/rent-summary", requireRole("Tenant"), async (req, res) => {
    try {
      // Mock data for tenant rent summary
      const summary = {
        upcomingRent: {
          amount: 2500,
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          unit: "Unit 402",
        },
        pastDueRent: null,
        recentPayments: [
          {
            id: "pmt-1",
            amount: 2500,
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: "Paid",
          },
          {
            id: "pmt-2",
            amount: 2500,
            date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            status: "Paid",
          },
        ],
      };
      res.json(summary);
    } catch (error: any) {
      console.error("Rent summary error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tenant/pay-rent", requireRole("Tenant"), async (req, res) => {
    try {
      // Mock rent payment
      res.json({ success: true, confirmationNumber: `PAY-${Date.now()}` });
    } catch (error: any) {
      console.error("Pay rent error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tenant/wallet", requireRole("Tenant"), async (req, res) => {
    try {
      const walletData = {
        balance: 5000,
        yieldOptIn: true,
        yieldBalance: 5000,
        currentYield: 5.1,
      };
      res.json(walletData);
    } catch (error: any) {
      console.error("Wallet error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tenant/wallet/deposit", requireRole("Tenant"), async (req, res) => {
    try {
      const { amount } = req.body;
      res.json({ success: true, amount });
    } catch (error: any) {
      console.error("Deposit error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tenant/wallet/withdraw", requireRole("Tenant"), async (req, res) => {
    try {
      const { amount } = req.body;
      res.json({ success: true, amount });
    } catch (error: any) {
      console.error("Withdraw error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tenant/wallet/yield-opt-in", requireRole("Tenant"), async (req, res) => {
    try {
      const { optIn } = req.body;
      res.json({ success: true, optIn });
    } catch (error: any) {
      console.error("Yield opt-in error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tenant/reports", requireRole("Tenant"), async (req, res) => {
    try {
      const reports = {
        receipts: [
          {
            id: "rec-1",
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            amount: 2500,
            unit: "Unit 402",
            paymentMethod: "ACH",
            confirmationNumber: "CONF-12345",
          },
          {
            id: "rec-2",
            date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            amount: 2500,
            unit: "Unit 402",
            paymentMethod: "Debit Card",
            confirmationNumber: "CONF-12346",
          },
        ],
        yearToDateTotal: 30000,
        yearToDatePayments: 12,
      };
      res.json(reports);
    } catch (error: any) {
      console.error("Reports error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tenant/settings", requireRole("Tenant"), async (req, res) => {
    try {
      const userId = req.session.userId!;
      const user = await storage.getUser(userId);
      
      const settings = {
        email: user?.email || "",
        phone: "",
        unit: "Unit 402",
        leaseEndDate: "December 31, 2025",
        paymentMethods: [
          {
            id: "pm-1",
            method: "Bank Account",
            lastFourDigits: "4242",
            isDefault: true,
          },
        ],
      };
      res.json(settings);
    } catch (error: any) {
      console.error("Settings error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tenant/settings/profile", requireRole("Tenant"), async (req, res) => {
    try {
      const { email, phone } = req.body;
      res.json({ success: true });
    } catch (error: any) {
      console.error("Update profile error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tenant/settings/payment-method", requireRole("Tenant"), async (req, res) => {
    try {
      res.json({ success: true });
    } catch (error: any) {
      console.error("Add payment method error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tenant/agent", requireRole("Tenant"), async (req, res) => {
    try {
      const { prompt } = req.body;

      const stream = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are a helpful AI assistant for a property management tenant portal. Help users with questions about rent payments, account settings, and general inquiries. Be concise and friendly."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        stream: true,
      });

      res.setHeader("Content-Type", "text/plain");
      res.setHeader("Transfer-Encoding", "chunked");

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          res.write(content);
        }
      }

      res.end();
    } catch (error: any) {
      console.error("Tenant agent error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Crypto Wallet Routes (Business) ============
  app.get("/api/crypto/wallets", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId!;
      
      // Get wallets from database
      const wallets = await storage.getCryptoWallets(orgId);
      
      // Format for frontend
      const formattedWallets = wallets.map(w => ({
        coin: w.coin,
        balance: parseFloat(w.balance),
        usdValue: parseFloat(w.balance), // 1:1 for stablecoins
        depositAddress: w.depositAddress || "",
        price: 1.00,
      }));
      
      const totalUsdValue = formattedWallets.reduce((sum, w) => sum + w.usdValue, 0);
      
      res.json({ wallets: formattedWallets, totalUsdValue });
    } catch (error: any) {
      console.error("Crypto wallets error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/crypto/convert", requireAuth, async (req, res) => {
    try {
      const { fromCoin, toCoin, amount } = req.body;
      const orgId = req.organizationId!;
      
      // Perform real conversion using storage
      const result = await storage.convertCrypto({
        organizationId: orgId,
        fromCoin,
        toCoin,
        amount: amount.toString(),
        exchangeRate: "1.0", // 1:1 for stablecoins
      });
      
      // Return the gross converted amount (before fees) to match frontend contract
      const convertedAmount = amount * 1.0; // 1:1 exchange rate for stablecoins
      const fee = amount * 0.001; // 0.1% fee
      
      res.json({
        success: true,
        fromCoin,
        toCoin,
        fromAmount: amount,
        toAmount: convertedAmount, // Gross amount before fees
        exchangeRate: 1.0,
        fee,
        txHash: result.transaction.txHash,
      });
    } catch (error: any) {
      console.error("Crypto convert error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/crypto/to-usd", requireAuth, async (req, res) => {
    try {
      const { coin, amount } = req.body;
      const orgId = req.organizationId!;
      
      const fee = amount * 0.002; // 0.2% fee
      
      // Perform real USD conversion using storage
      const result = await storage.convertToUsd({
        organizationId: orgId,
        coin,
        amount: amount.toString(),
        exchangeRate: "1.0",
        fee: fee.toString(),
      });
      
      res.json({
        success: true,
        coin,
        cryptoAmount: amount,
        usdAmount: amount - fee,
        exchangeRate: 1.0,
        fee,
      });
    } catch (error: any) {
      console.error("Crypto to USD error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/crypto/transactions", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId!;
      
      // Get real transaction history from database
      const transactions = await storage.getCryptoTransactions(orgId);
      
      // Format for frontend
      const formattedTransactions = transactions.map(tx => ({
        id: tx.id,
        type: tx.transactionType,
        coin: tx.fromCoin,
        fromCoin: tx.fromCoin,
        toCoin: tx.toCoin,
        amount: parseFloat(tx.amount),
        usdValue: parseFloat(tx.usdValue || "0"),
        status: tx.status,
        txHash: tx.txHash || "",
        createdAt: tx.createdAt.toISOString(),
      }));
      
      res.json({ transactions: formattedTransactions });
    } catch (error: any) {
      console.error("Crypto transactions error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Crypto Treasury Routes - Automated stablecoin orchestration
  app.get("/api/crypto-treasury/positions", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId!;
      const positions = await storage.getCryptoTreasuryPositions(orgId);
      res.json({ positions });
    } catch (error: any) {
      console.error("Get crypto treasury positions error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/crypto-treasury/deployments", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId!;
      const status = req.query.status as string | undefined;
      const coin = req.query.coin as string | undefined;
      
      const deployments = await storage.getCryptoTreasuryDeployments(orgId, { status, coin });
      res.json({ deployments });
    } catch (error: any) {
      console.error("Get crypto treasury deployments error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/crypto-treasury/flows", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId!;
      const flowType = req.query.flowType as string | undefined;
      const coin = req.query.coin as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      
      const flows = await storage.getCryptoTreasuryFlows(orgId, { flowType, coin, limit });
      res.json({ flows });
    } catch (error: any) {
      console.error("Get crypto treasury flows error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Crypto Wallet Routes (Tenant) ============
  app.get("/api/tenant/crypto/wallets", requireRole("Tenant"), async (req, res) => {
    try {
      const orgId = req.organizationId!;
      // Get tenant ID from user record
      const user = await storage.getUser(req.userId!);
      const tenantId = user!.tenantId!;
      
      // Get tenant wallets from database
      const wallets = await storage.getCryptoWallets(orgId, tenantId);
      
      // Format for frontend
      const formattedWallets = wallets.map(w => ({
        coin: w.coin,
        balance: parseFloat(w.balance),
        usdValue: parseFloat(w.balance), // 1:1 for stablecoins
        depositAddress: w.depositAddress || "",
        price: 1.00,
      }));
      
      const totalUsdValue = formattedWallets.reduce((sum, w) => sum + w.usdValue, 0);
      
      res.json({ wallets: formattedWallets, totalUsdValue });
    } catch (error: any) {
      console.error("Tenant crypto wallets error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tenant/crypto/convert", requireRole("Tenant"), async (req, res) => {
    try {
      const { fromCoin, toCoin, amount } = req.body;
      const orgId = req.organizationId!;
      // Get tenant ID from user record
      const user = await storage.getUser(req.userId!);
      const tenantId = user!.tenantId!;
      
      // Perform real conversion using storage
      const result = await storage.convertCrypto({
        organizationId: orgId,
        tenantId,
        fromCoin,
        toCoin,
        amount: amount.toString(),
        exchangeRate: "1.0",
      });
      
      // Return the gross converted amount (before fees) to match frontend contract
      const convertedAmount = amount * 1.0; // 1:1 exchange rate for stablecoins
      const fee = amount * 0.001; // 0.1% fee
      
      res.json({
        success: true,
        fromCoin,
        toCoin,
        fromAmount: amount,
        toAmount: convertedAmount, // Gross amount before fees
        exchangeRate: 1.0,
        fee,
        txHash: result.transaction.txHash,
      });
    } catch (error: any) {
      console.error("Tenant crypto convert error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tenant/crypto/transactions", requireRole("Tenant"), async (req, res) => {
    try {
      const orgId = req.organizationId!;
      // Get tenant ID from user record
      const user = await storage.getUser(req.userId!);
      const tenantId = user!.tenantId!;
      
      // Get real transaction history from database
      const transactions = await storage.getCryptoTransactions(orgId, tenantId);
      
      // Format for frontend
      const formattedTransactions = transactions.map(tx => ({
        id: tx.id,
        type: tx.transactionType,
        coin: tx.fromCoin,
        fromCoin: tx.fromCoin,
        toCoin: tx.toCoin,
        amount: parseFloat(tx.amount),
        usdValue: parseFloat(tx.usdValue || "0"),
        status: tx.status,
        txHash: tx.txHash || "",
        createdAt: tx.createdAt.toISOString(),
      }));
      
      res.json({ transactions: formattedTransactions });
    } catch (error: any) {
      console.error("Tenant crypto transactions error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Tenant Merchant Transaction Routes ============
  // Get all merchants for tenant's organization
  app.get("/api/tenant/merchants", requireRole("Tenant"), async (req, res) => {
    try {
      const orgId = req.organizationId!;
      const merchants = await storage.getMerchants(orgId);
      
      // Format for frontend
      const formattedMerchants = merchants.map(m => ({
        id: m.id,
        name: m.name,
        category: m.category,
        description: m.description,
        settlementDays: m.settlementDays,
        yieldRate: parseFloat(m.yieldRate),
        active: m.active,
      }));
      
      res.json({ merchants: formattedMerchants });
    } catch (error: any) {
      console.error("Get merchants error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get merchant transaction history for tenant
  app.get("/api/tenant/merchant-transactions", requireRole("Tenant"), async (req, res) => {
    try {
      const userId = req.userId!;
      const status = req.query.status as string | undefined;
      
      // Find user to get email
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Find tenant by email
      const tenant = await storage.getTenantByEmail(user.email);
      if (!tenant) {
        return res.status(404).json({ error: "Tenant profile not found" });
      }
      
      const transactions = await storage.getMerchantTransactions(
        tenant.id,
        status ? { status } : undefined
      );
      
      // Storage layer already converted decimals to numbers - pass through directly
      const formattedTransactions = transactions.map(tx => ({
        id: tx.id,
        merchantId: tx.merchantId,
        merchantName: tx.merchantName,
        amount: tx.amount,
        transactionDate: tx.transactionDate.toISOString(),
        settlementDate: tx.settlementDate.toISOString(),
        status: tx.status,
        settledAt: tx.settledAt?.toISOString() || null,
        settlementDays: tx.settlementDays,
        yieldRate: tx.yieldRate,
        yieldGenerated: tx.yieldGenerated,
        propertyYieldShare: tx.propertyYieldShare,
        tenantYieldShare: tx.tenantYieldShare,
        platformYieldShare: tx.platformYieldShare,
        description: tx.description,
      }));
      
      res.json({ transactions: formattedTransactions });
    } catch (error: any) {
      console.error("Get merchant transactions error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create new merchant transaction (tenant makes purchase)
  app.post("/api/tenant/merchant-transactions", requireRole("Tenant"), async (req, res) => {
    try {
      const orgId = req.organizationId!;
      const userId = req.userId!;
      const { merchantId, amount, description } = req.body;
      
      // Find user to get email
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Find tenant by email
      const tenant = await storage.getTenantByEmail(user.email);
      if (!tenant) {
        return res.status(404).json({ error: "Tenant profile not found" });
      }
      
      // Validate input
      if (!merchantId || !amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid merchant transaction data" });
      }
      
      // Create transaction with yield splits (demo values: 90% property / 10% platform)
      const propertyYieldShare = (amount * 0.009).toFixed(2); // 0.9% to property owner
      const platformYieldShare = (amount * 0.001).toFixed(2); // 0.1% to platform
      
      const transaction = await storage.createMerchantTransaction({
        merchantId,
        tenantId: tenant.id,
        organizationId: orgId,
        amount: amount.toString(),
        description: description || null,
        propertyYieldShare,
        platformYieldShare,
      }, userId);
      
      res.json({ 
        transaction: {
          id: transaction.id,
          merchantId: transaction.merchantId,
          amount: parseFloat(transaction.amount),
          transactionDate: transaction.transactionDate.toISOString(),
          settlementDate: transaction.settlementDate.toISOString(),
          status: transaction.status,
          settlementDays: transaction.settlementDays,
          yieldGenerated: parseFloat(transaction.yieldGenerated),
          tenantYieldShare: transaction.tenantYieldShare ? parseFloat(transaction.tenantYieldShare) : 0,
        },
        message: "Merchant transaction created - yield generation in progress!",
      });
    } catch (error: any) {
      console.error("Create merchant transaction error:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // ============ Vendor Instant Payment Routes ============
  // Get all vendors for organization
  app.get("/api/vendors", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId!;
      const vendors = await storage.getVendors(orgId);
      res.json({ vendors });
    } catch (error: any) {
      console.error("Get vendors error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get vendor invoices (with optional status filter)
  app.get("/api/vendor-invoices", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId!;
      const status = req.query.status as string | undefined;
      
      const invoices = await storage.getVendorInvoices(orgId, status ? { status } : undefined);
      
      res.json({ invoices });
    } catch (error: any) {
      console.error("Get vendor invoices error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Pay vendor invoice instantly (showcases yield amplification!)
  app.post("/api/vendor-invoices/:id/pay-instant", requireAuth, async (req, res) => {
    try {
      const invoiceId = req.params.id;
      
      // Process instant payment (calculates yield based on float duration)
      const updatedInvoice = await storage.payVendorInstant(invoiceId);
      
      res.json({ 
        invoice: updatedInvoice,
        message: "Vendor paid instantly - yield generation locked in!",
      });
    } catch (error: any) {
      console.error("Pay vendor instant error:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // ============ Admin Routes ============
  // Only Admin can reset demo
  app.post("/api/admin/reset", requireRole("Admin"), async (req, res) => {
    try {
      await seedDatabase();
      res.json({ success: true });
    } catch (error: any) {
      console.error("Reset error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/pms/sync", requireRole("Admin", "PropertyManager"), async (req, res) => {
    try {
      // Mock: In production, would sync with PMS API
      res.json({ success: true });
    } catch (error: any) {
      console.error("PMS sync error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Rent Stability & Ownership Routes ============
  app.get("/api/rent-stability", requireAuth, requireRole("PropertyManager", "Admin", "CFO", "Analyst"), async (req, res) => {
    try {
      // Mocked for demo; in production, this would query prediction models
      res.json({
        volatility: 1.8,
        delinquencyReduction: 14.2,
        ownershipReadyUnits: 38,
        paymentProbability: 0.94
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tenant/readiness", requireAuth, requireRole("Tenant"), async (req, res) => {
    try {
      const user = req.user as any;
      const tenantId = user?.tenantId;
      if (!tenantId) return res.status(404).json({ error: "Tenant record not found" });
      
      const tenant = await storage.getTenant(tenantId);
      res.json(tenant);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Neuromorphic Intelligence Layer ============

  app.get("/api/intelligence/portfolio", requireAuth, requireRole("Admin", "PropertyManager", "CFO", "Analyst"), async (req, res) => {
    try {
      res.json({
        neuralActivityLevel: 0.78,
        spikeFrequency: 142,
        temporalMemoryDepth: 90,
        portfolioStabilityScore: 82.4,
        portfolioStabilityTrend: "improving",
        activeInflectionPoints: 3,
        modelConfidence: 0.91,
        lastModelUpdate: new Date().toISOString(),
        spikeTrainData: [
          { time: "00:00", rentSpikes: 12, vendorSpikes: 4, p2pSpikes: 2, volatility: 0.15 },
          { time: "04:00", rentSpikes: 3, vendorSpikes: 1, p2pSpikes: 0, volatility: 0.08 },
          { time: "08:00", rentSpikes: 28, vendorSpikes: 8, p2pSpikes: 5, volatility: 0.32 },
          { time: "12:00", rentSpikes: 45, vendorSpikes: 15, p2pSpikes: 8, volatility: 0.52 },
          { time: "16:00", rentSpikes: 38, vendorSpikes: 12, p2pSpikes: 6, volatility: 0.41 },
          { time: "20:00", rentSpikes: 22, vendorSpikes: 6, p2pSpikes: 3, volatility: 0.25 },
        ],
        temporalMemoryDecay: [
          { daysAgo: 0, memoryStrength: 1.0, signalWeight: 0.95 },
          { daysAgo: 7, memoryStrength: 0.92, signalWeight: 0.88 },
          { daysAgo: 14, memoryStrength: 0.78, signalWeight: 0.72 },
          { daysAgo: 30, memoryStrength: 0.55, signalWeight: 0.48 },
          { daysAgo: 60, memoryStrength: 0.30, signalWeight: 0.22 },
          { daysAgo: 90, memoryStrength: 0.12, signalWeight: 0.08 },
        ],
        propertyScores: [
          { property: "Sunset Towers", stabilityScore: 94, refinanceIndex: 88, spikeRate: 0.12, trend: "stable", units: 120, riskLevel: "low" },
          { property: "Maple Gardens", stabilityScore: 76, refinanceIndex: 62, spikeRate: 0.28, trend: "declining", units: 85, riskLevel: "medium" },
          { property: "Riverdale Apts", stabilityScore: 58, refinanceIndex: 45, spikeRate: 0.45, trend: "volatile", units: 64, riskLevel: "high" },
          { property: "Oak Ridge", stabilityScore: 96, refinanceIndex: 91, spikeRate: 0.09, trend: "stable", units: 200, riskLevel: "low" },
          { property: "Pine Valley", stabilityScore: 42, refinanceIndex: 28, spikeRate: 0.62, trend: "critical", units: 42, riskLevel: "critical" },
          { property: "Harbor View", stabilityScore: 88, refinanceIndex: 82, spikeRate: 0.15, trend: "improving", units: 156, riskLevel: "low" },
        ],
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/intelligence/tenant-scores", requireAuth, requireRole("Admin", "PropertyManager", "CFO", "Analyst"), async (req, res) => {
    try {
      res.json({
        tenantScores: [
          { id: "t1", name: "Maria G.", unit: "Sunset #412", stabilityScore: 95, paymentPattern: "consistent", spikeEvents: 1, streakMonths: 24, tierMigration: "2→3", drivers: [{ factor: "Payment Consistency", weight: 0.40, score: 98 }, { factor: "Engagement Level", weight: 0.25, score: 92 }, { factor: "P2P Contributions", weight: 0.20, score: 88 }, { factor: "Tenure Duration", weight: 0.15, score: 96 }] },
          { id: "t2", name: "James W.", unit: "Oak #108", stabilityScore: 82, paymentPattern: "mostly_consistent", spikeEvents: 3, streakMonths: 18, tierMigration: "1→2", drivers: [{ factor: "Payment Consistency", weight: 0.40, score: 85 }, { factor: "Engagement Level", weight: 0.25, score: 78 }, { factor: "P2P Contributions", weight: 0.20, score: 72 }, { factor: "Tenure Duration", weight: 0.15, score: 88 }] },
          { id: "t3", name: "Sarah C.", unit: "Harbor #203", stabilityScore: 71, paymentPattern: "improving", spikeEvents: 5, streakMonths: 14, tierMigration: "1→2", drivers: [{ factor: "Payment Consistency", weight: 0.40, score: 74 }, { factor: "Engagement Level", weight: 0.25, score: 68 }, { factor: "P2P Contributions", weight: 0.20, score: 65 }, { factor: "Tenure Duration", weight: 0.15, score: 72 }] },
          { id: "t4", name: "David L.", unit: "Maple #305", stabilityScore: 54, paymentPattern: "irregular", spikeEvents: 12, streakMonths: 6, tierMigration: "0→1", drivers: [{ factor: "Payment Consistency", weight: 0.40, score: 48 }, { factor: "Engagement Level", weight: 0.25, score: 55 }, { factor: "P2P Contributions", weight: 0.20, score: 42 }, { factor: "Tenure Duration", weight: 0.15, score: 68 }] },
          { id: "t5", name: "Lisa R.", unit: "Sunset #201", stabilityScore: 38, paymentPattern: "declining", spikeEvents: 18, streakMonths: 2, tierMigration: "1→0", drivers: [{ factor: "Payment Consistency", weight: 0.40, score: 32 }, { factor: "Engagement Level", weight: 0.25, score: 40 }, { factor: "P2P Contributions", weight: 0.20, score: 28 }, { factor: "Tenure Duration", weight: 0.15, score: 55 }] },
          { id: "t6", name: "Kevin M.", unit: "Riverdale #102", stabilityScore: 22, paymentPattern: "critical", spikeEvents: 25, streakMonths: 0, tierMigration: "1→0", drivers: [{ factor: "Payment Consistency", weight: 0.40, score: 15 }, { factor: "Engagement Level", weight: 0.25, score: 22 }, { factor: "P2P Contributions", weight: 0.20, score: 18 }, { factor: "Tenure Duration", weight: 0.15, score: 35 }] },
        ],
        scoringModel: {
          version: "SNN-v2.4",
          lastTrained: "2026-02-04T08:00:00Z",
          accuracy: 0.934,
          factors: ["Payment Consistency (40%)", "Engagement Level (25%)", "P2P Contributions (20%)", "Tenure Duration (15%)"],
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/intelligence/cohort-insights", requireAuth, requireRole("Admin", "PropertyManager", "CFO", "Analyst"), async (req, res) => {
    try {
      res.json({
        insights: [
          { id: "ci1", type: "ownership_surge", severity: "high", title: "30% of Tier 2 tenants will qualify for FHA in 60 days", description: "19 tenants in Tier 2 are on trajectory to meet FHA eligibility criteria based on payment consistency, credit trajectory, and escrow accumulation patterns.", affectedCount: 19, totalCohort: 63, confidence: 0.87, timeframe: "60 days", actionable: true, suggestedAction: "Initiate pre-qualification outreach and schedule lender matching for high-readiness tenants" },
          { id: "ci2", type: "delinquency_risk", severity: "critical", title: "Pine Valley cluster: 8 tenants showing pre-delinquency spike pattern", description: "Temporal memory analysis detected a correlated behavioral shift in 8 tenants at Pine Valley. Pattern matches historical pre-delinquency signatures with 91% confidence.", affectedCount: 8, totalCohort: 42, confidence: 0.91, timeframe: "14 days", actionable: true, suggestedAction: "Deploy targeted incentive campaign ($15 early-pay bonus) and schedule proactive outreach" },
          { id: "ci3", type: "cashflow_shock", severity: "warning", title: "Vendor payout cluster may create $85K liquidity gap on March 15", description: "3 vendor Net60 invoices totaling $85K mature on the same date. Combined with rent cycle timing, this creates a predicted 2.1-day liquidity shortfall.", affectedCount: 3, totalCohort: 12, confidence: 0.82, timeframe: "37 days", actionable: true, suggestedAction: "Pre-position $90K in immediate reserve bucket or stagger vendor payouts by 5 days" },
          { id: "ci4", type: "incentive_roi", severity: "info", title: "Early Bird incentive showing 340% ROI in Sunset Towers cohort", description: "Tenants enrolled in the Early Bird Bonus program at Sunset Towers show 94.2% on-time rate vs 82.1% for non-enrolled. $4,250 in rewards generating $14,450 in improved collection timing.", affectedCount: 48, totalCohort: 120, confidence: 0.94, timeframe: "ongoing", actionable: false, suggestedAction: "Consider expanding program to Maple Gardens and Harbor View properties" },
          { id: "ci5", type: "stability_improvement", severity: "success", title: "Portfolio-wide stability score improved 6.2 points in 30 days", description: "Neural spike frequency has decreased 18% across the portfolio, indicating more predictable payment patterns. Primary driver: streak-based cashback program adoption up 22%.", affectedCount: 500, totalCohort: 500, confidence: 0.96, timeframe: "30 days", actionable: false, suggestedAction: "Maintain current incentive levels; monitor for regression in Q2" },
        ],
        cohortMigration: [
          { period: "Sep", tier0: 320, tier1: 120, tier2: 45, tier3: 15 },
          { period: "Oct", tier0: 305, tier1: 125, tier2: 50, tier3: 20 },
          { period: "Nov", tier0: 288, tier1: 130, tier2: 55, tier3: 27 },
          { period: "Dec", tier0: 275, tier1: 132, tier2: 60, tier3: 33 },
          { period: "Jan", tier0: 260, tier1: 135, tier2: 63, tier3: 42 },
          { period: "Feb", tier0: 248, tier1: 132, tier2: 68, tier3: 52 },
        ],
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/intelligence/inflection-points", requireAuth, requireRole("Admin", "PropertyManager", "CFO", "Analyst"), async (req, res) => {
    try {
      res.json({
        inflectionPoints: [
          { id: "ip1", type: "delinquency", direction: "negative", probability: 0.91, tenant: "Kevin M.", unit: "Riverdale #102", property: "Riverdale Apts", detectedAt: "2026-02-05T14:30:00Z", predictedDate: "2026-02-20T00:00:00Z", signalStrength: 0.94, spikeHistory: [0.1, 0.15, 0.22, 0.35, 0.48, 0.62, 0.78, 0.91], neuralDrivers: ["3 consecutive late payments (>10d)", "Engagement drop-off: no portal login in 21 days", "P2P contribution stopped 45 days ago"] },
          { id: "ip2", type: "delinquency", direction: "negative", probability: 0.78, tenant: "Lisa R.", unit: "Sunset #201", property: "Sunset Towers", detectedAt: "2026-02-04T09:15:00Z", predictedDate: "2026-02-25T00:00:00Z", signalStrength: 0.82, spikeHistory: [0.05, 0.08, 0.12, 0.18, 0.28, 0.42, 0.58, 0.78], neuralDrivers: ["Payment amount decreasing (partial payments last 2 months)", "Tier migration regressing: 1→0", "Response to nudges declining"] },
          { id: "ip3", type: "ownership_ready", direction: "positive", probability: 0.92, tenant: "Maria G.", unit: "Sunset #412", property: "Sunset Towers", detectedAt: "2026-02-03T11:00:00Z", predictedDate: "2026-03-15T00:00:00Z", signalStrength: 0.96, spikeHistory: [0.45, 0.52, 0.58, 0.65, 0.72, 0.80, 0.88, 0.92], neuralDrivers: ["24-month perfect payment streak", "Credit score trajectory: 680→710 in 6 months", "Escrow accumulation rate accelerating (+12% MoM)"] },
          { id: "ip4", type: "cashflow_shock", direction: "negative", probability: 0.82, tenant: null, unit: null, property: "Portfolio-wide", detectedAt: "2026-02-04T16:00:00Z", predictedDate: "2026-03-15T00:00:00Z", signalStrength: 0.85, spikeHistory: [0.10, 0.12, 0.18, 0.25, 0.38, 0.52, 0.68, 0.82], neuralDrivers: ["3 vendor invoices ($85K total) maturing same date", "Rent cycle trough coincides with vendor payout peak", "Reserve bucket at 72% of recommended level"] },
          { id: "ip5", type: "stability_shift", direction: "positive", probability: 0.88, tenant: "James W.", unit: "Oak #108", property: "Oak Ridge", detectedAt: "2026-02-05T08:45:00Z", predictedDate: "2026-04-01T00:00:00Z", signalStrength: 0.90, spikeHistory: [0.30, 0.38, 0.45, 0.52, 0.60, 0.72, 0.82, 0.88], neuralDrivers: ["Payment timing improving: avg 8d early → 12d early", "Active P2P contributor (3 roommate splits/mo)", "Tier migration trajectory: approaching Tier 3 threshold"] },
        ],
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/intelligence/noi-forecast", requireAuth, requireRole("Admin", "PropertyManager", "CFO", "Analyst"), async (req, res) => {
    try {
      res.json({
        forecast: [
          { month: "Mar", baseline: 245000, optimistic: 258000, pessimistic: 228000, neural: 252000 },
          { month: "Apr", baseline: 248000, optimistic: 265000, pessimistic: 230000, neural: 256000 },
          { month: "May", baseline: 250000, optimistic: 270000, pessimistic: 225000, neural: 261000 },
          { month: "Jun", baseline: 252000, optimistic: 275000, pessimistic: 222000, neural: 264000 },
          { month: "Jul", baseline: 255000, optimistic: 280000, pessimistic: 220000, neural: 268000 },
          { month: "Aug", baseline: 258000, optimistic: 285000, pessimistic: 218000, neural: 272000 },
        ],
        currentNOI: 242000,
        projectedNOI: 268000,
        noiForecastChange: 10.7,
        incentiveImpact: {
          currentSpend: 8500,
          projectedReturn: 34200,
          roi: 302,
          optimalSpend: 11200,
          optimalReturn: 48500,
          optimalRoi: 333,
        },
        refinanceTiming: {
          optimalWindow: "Q3 2026",
          currentDSCR: 1.42,
          projectedDSCR: 1.58,
          currentLTV: 0.68,
          projectedLTV: 0.64,
          readyProperties: 3,
          totalProperties: 6,
          recommendation: "3 of 6 properties meet refinance criteria. Neural model projects optimal window in Q3 2026 when DSCR reaches 1.58 and portfolio stability exceeds 85.",
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Cash Flow Forecasting ============
  app.get("/api/forecast", requireAuth, requireRole("Admin", "PropertyManager", "CFO", "Analyst"), async (req, res) => {
    try {
      const today = new Date();
      const generateDailyForecast = (days: number) => {
        const data = [];
        let cumulativeInflow = 0;
        let cumulativeOutflow = 0;
        for (let i = 0; i < days; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() + i);
          const dayOfMonth = date.getDate();
          const isRentDay = dayOfMonth <= 5;
          const isPayrollDay = dayOfMonth === 15 || dayOfMonth === 30;
          const isVendorDay = dayOfMonth === 10 || dayOfMonth === 20;
          const baseRent = isRentDay ? 85000 + Math.sin(i * 0.3) * 12000 : 2000 + Math.sin(i * 0.5) * 1500;
          const vendorPayout = isVendorDay ? 28000 + Math.sin(i * 0.4) * 8000 : 3500 + Math.sin(i * 0.2) * 1200;
          const payroll = isPayrollDay ? 42000 : 0;
          const maintenance = 1200 + Math.sin(i * 0.7) * 800;
          const insurance = dayOfMonth === 1 ? 8500 : 0;
          const inflow = Math.round(baseRent + Math.random() * 3000);
          const outflow = Math.round(vendorPayout + payroll + maintenance + insurance);
          cumulativeInflow += inflow;
          cumulativeOutflow += outflow;
          data.push({
            date: date.toISOString().split("T")[0],
            dayLabel: `${date.getMonth() + 1}/${date.getDate()}`,
            inflow,
            outflow,
            netCashFlow: inflow - outflow,
            cumulativeNet: cumulativeInflow - cumulativeOutflow,
            rentCollected: isRentDay ? inflow * 0.85 : inflow * 0.3,
            vendorPayments: vendorPayout,
            confidence: Math.max(0.6, 1 - i * 0.004),
          });
        }
        return data;
      };
      const daily = generateDailyForecast(90);
      const weekly = [];
      for (let w = 0; w < 13; w++) {
        const weekSlice = daily.slice(w * 7, (w + 1) * 7);
        if (weekSlice.length === 0) break;
        weekly.push({
          week: `W${w + 1}`,
          startDate: weekSlice[0].date,
          inflow: weekSlice.reduce((s, d) => s + d.inflow, 0),
          outflow: weekSlice.reduce((s, d) => s + d.outflow, 0),
          netCashFlow: weekSlice.reduce((s, d) => s + d.netCashFlow, 0),
          avgConfidence: weekSlice.reduce((s, d) => s + d.confidence, 0) / weekSlice.length,
        });
      }
      res.json({
        daily,
        weekly,
        summary: {
          totalProjectedInflow: daily.reduce((s, d) => s + d.inflow, 0),
          totalProjectedOutflow: daily.reduce((s, d) => s + d.outflow, 0),
          netCashPosition: daily.reduce((s, d) => s + d.netCashFlow, 0),
          avgDailyInflow: Math.round(daily.reduce((s, d) => s + d.inflow, 0) / 90),
          avgDailyOutflow: Math.round(daily.reduce((s, d) => s + d.outflow, 0) / 90),
          liquidityRiskDays: daily.filter(d => d.netCashFlow < -20000).length,
          peakInflowDay: daily.reduce((max, d) => d.inflow > max.inflow ? d : max, daily[0]).date,
          lowestCashDay: daily.reduce((min, d) => d.cumulativeNet < min.cumulativeNet ? d : min, daily[0]).date,
        },
        scenarios: [
          { name: "Baseline", description: "Current collection rates and vendor terms maintained", probability: 0.65, noi90Day: 742000, cashReserve: 185000, delinquencyRate: 4.2 },
          { name: "Optimistic", description: "Incentive programs improve on-time rate by 8%", probability: 0.20, noi90Day: 812000, cashReserve: 225000, delinquencyRate: 2.8 },
          { name: "Stress", description: "Economic downturn increases delinquency by 40%", probability: 0.15, noi90Day: 628000, cashReserve: 95000, delinquencyRate: 7.1 },
        ],
        assumptions: {
          occupancyRate: 94.5,
          avgRent: 1525,
          onTimeRate: 87.3,
          vendorTerms: "Net45 avg",
          maintenanceReserve: 2.5,
          yieldOnFloat: 4.2,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Enhanced Collections ============
  app.get("/api/collections/enhanced", requireAuth, requireRole("Admin", "PropertyManager", "CFO"), async (req, res) => {
    try {
      res.json({
        summary: {
          totalOutstanding: 187450,
          totalTenants: 42,
          atRiskCount: 8,
          avgDaysPastDue: 12.4,
          collectionRate: 87.3,
          collectionRateChange: 2.1,
          totalCollectedMTD: 425000,
          projectedCollection: 485000,
        },
        aging: [
          { bucket: "Current", count: 285, amount: 425000, percentage: 68.2 },
          { bucket: "1-30 Days", count: 45, amount: 67500, percentage: 10.8 },
          { bucket: "31-60 Days", count: 22, amount: 44000, percentage: 7.1 },
          { bucket: "61-90 Days", count: 12, amount: 30000, percentage: 4.8 },
          { bucket: "90+ Days", count: 8, amount: 45950, percentage: 7.4 },
          { bucket: "Collections", count: 3, amount: 10500, percentage: 1.7 },
        ],
        tenants: [
          { id: "c1", name: "Kevin M.", unit: "Riverdale #102", property: "Riverdale Apts", amountDue: 3200, dueDate: "2026-01-01", daysPastDue: 37, status: "overdue", riskScore: 92, riskLevel: "critical", lastPayment: "2025-12-15", paymentHistory: "irregular", contactAttempts: 4, lastContacted: "2026-02-03", nudgeSent: true, paylinkSent: true, hasPlan: false },
          { id: "c2", name: "Lisa R.", unit: "Sunset #201", property: "Sunset Towers", amountDue: 1500, dueDate: "2026-01-15", daysPastDue: 23, status: "overdue", riskScore: 78, riskLevel: "high", lastPayment: "2025-12-28", paymentHistory: "declining", contactAttempts: 2, lastContacted: "2026-02-01", nudgeSent: true, paylinkSent: false, hasPlan: false },
          { id: "c3", name: "David L.", unit: "Maple #305", property: "Maple Gardens", amountDue: 800, dueDate: "2026-02-01", daysPastDue: 6, status: "overdue", riskScore: 54, riskLevel: "medium", lastPayment: "2026-01-02", paymentHistory: "irregular", contactAttempts: 1, lastContacted: "2026-02-05", nudgeSent: false, paylinkSent: false, hasPlan: false },
          { id: "c4", name: "Tom H.", unit: "Oak #215", property: "Oak Ridge", amountDue: 1525, dueDate: "2026-02-01", daysPastDue: 6, status: "overdue", riskScore: 45, riskLevel: "medium", lastPayment: "2026-01-04", paymentHistory: "mostly_consistent", contactAttempts: 0, lastContacted: null, nudgeSent: false, paylinkSent: false, hasPlan: false },
          { id: "c5", name: "Anna P.", unit: "Pine #108", property: "Pine Valley", amountDue: 4800, dueDate: "2025-12-01", daysPastDue: 68, status: "overdue", riskScore: 95, riskLevel: "critical", lastPayment: "2025-11-01", paymentHistory: "critical", contactAttempts: 6, lastContacted: "2026-02-06", nudgeSent: true, paylinkSent: true, hasPlan: true },
          { id: "c6", name: "Mike B.", unit: "Harbor #410", property: "Harbor View", amountDue: 750, dueDate: "2026-02-01", daysPastDue: 6, status: "partial", riskScore: 32, riskLevel: "low", lastPayment: "2026-02-01", paymentHistory: "consistent", contactAttempts: 0, lastContacted: null, nudgeSent: false, paylinkSent: false, hasPlan: false },
          { id: "c7", name: "Rachel K.", unit: "Sunset #505", property: "Sunset Towers", amountDue: 1525, dueDate: "2026-02-05", daysPastDue: 2, status: "pending", riskScore: 18, riskLevel: "low", lastPayment: "2026-01-03", paymentHistory: "consistent", contactAttempts: 0, lastContacted: null, nudgeSent: false, paylinkSent: false, hasPlan: false },
          { id: "c8", name: "Chris D.", unit: "Maple #112", property: "Maple Gardens", amountDue: 2400, dueDate: "2025-12-15", daysPastDue: 53, status: "overdue", riskScore: 88, riskLevel: "high", lastPayment: "2025-11-20", paymentHistory: "declining", contactAttempts: 3, lastContacted: "2026-01-28", nudgeSent: true, paylinkSent: true, hasPlan: false },
        ],
        trendData: [
          { month: "Sep", collected: 392000, outstanding: 108000, rate: 78.4 },
          { month: "Oct", collected: 405000, outstanding: 95000, rate: 81.0 },
          { month: "Nov", collected: 418000, outstanding: 82000, rate: 83.6 },
          { month: "Dec", collected: 412000, outstanding: 88000, rate: 82.4 },
          { month: "Jan", collected: 425000, outstanding: 75000, rate: 85.0 },
          { month: "Feb", collected: 436000, outstanding: 64000, rate: 87.2 },
        ],
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Tenant Financial Hub ============
  app.get("/api/tenant/financial-hub", requireAuth, requireRole("Tenant"), async (req, res) => {
    try {
      res.json({ status: "ok" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Tenant Payment Calendar ============
  app.get("/api/tenant/payment-calendar", requireAuth, requireRole("Tenant"), async (req, res) => {
    try {
      const today = new Date();
      const events = [];
      for (let m = -1; m <= 3; m++) {
        const rentDate = new Date(today.getFullYear(), today.getMonth() + m, 1);
        const isPast = rentDate < today;
        events.push({
          id: `rent-${m}`,
          type: "rent",
          title: "Monthly Rent",
          amount: 1525,
          date: rentDate.toISOString().split("T")[0],
          status: isPast ? "paid" : m === 0 ? "due_soon" : "upcoming",
          autopay: true,
          paymentMethod: "ACH - Chase ****4521",
        });
        if (m >= 0) {
          events.push({
            id: `cashback-${m}`,
            type: "cashback",
            title: "On-Time Cashback",
            amount: 3.50,
            date: new Date(today.getFullYear(), today.getMonth() + m, 5).toISOString().split("T")[0],
            status: isPast ? "credited" : "projected",
            autopay: false,
            paymentMethod: null,
          });
        }
      }
      events.push({
        id: "split-1",
        type: "split",
        title: "Rent Split - Alex M.",
        amount: 762.50,
        date: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0],
        status: "received",
        autopay: false,
        paymentMethod: "P2P Transfer",
      });
      res.json({
        events,
        autopaySettings: {
          enabled: true,
          paymentMethod: "ACH - Chase ****4521",
          scheduledDay: 1,
          amount: 1525,
          nextPayment: new Date(today.getFullYear(), today.getMonth() + 1, 1).toISOString().split("T")[0],
        },
        upcomingTotal: 1525,
        streakMonths: 8,
        projectedCashback: 42.00,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Toggle Autopay ============
  app.post("/api/tenant/autopay", requireAuth, requireRole("Tenant"), async (req, res) => {
    try {
      const { enabled } = req.body;
      res.json({ success: true, autopayEnabled: enabled, message: enabled ? "Autopay enabled successfully" : "Autopay disabled" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ P2P Transfers ============
  app.get("/api/tenant/p2p", requireRole("Tenant"), async (req, res) => {
    try {
      const now = new Date();
      const p2pData = {
        balance: 5000,
        monthlyVolume: 1240,
        totalSent: 3850,
        totalReceived: 2610,
        activeRequests: 2,
        contacts: [
          { id: "c1", name: "Sarah Chen", unit: "Unit 403", avatar: "SC", isFavorite: true },
          { id: "c2", name: "Marcus Johnson", unit: "Unit 410", avatar: "MJ", isFavorite: true },
          { id: "c3", name: "Emily Rivera", unit: "Unit 318", avatar: "ER", isFavorite: false },
          { id: "c4", name: "David Kim", unit: "Unit 502", avatar: "DK", isFavorite: false },
          { id: "c5", name: "Lisa Patel", unit: "Unit 215", avatar: "LP", isFavorite: false },
          { id: "c6", name: "James Wu", unit: "Unit 607", avatar: "JW", isFavorite: false },
        ],
        recentTransactions: [
          { id: "tx1", type: "sent", counterparty: "Sarah Chen", counterpartyUnit: "Unit 403", amount: 45.00, description: "Groceries split", status: "completed", date: new Date(now.getTime() - 2 * 3600000).toISOString(), fee: 0, yieldGenerated: 0.005 },
          { id: "tx2", type: "received", counterparty: "Marcus Johnson", counterpartyUnit: "Unit 410", amount: 120.00, description: "Utilities share", status: "completed", date: new Date(now.getTime() - 24 * 3600000).toISOString(), fee: 0, yieldGenerated: 0.012 },
          { id: "tx3", type: "split", counterparty: "Emily Rivera", counterpartyUnit: "Unit 318", amount: 32.50, description: "Takeout order", status: "completed", date: new Date(now.getTime() - 3 * 24 * 3600000).toISOString(), fee: 0, yieldGenerated: 0.003 },
          { id: "tx4", type: "requested", counterparty: "David Kim", counterpartyUnit: "Unit 502", amount: 75.00, description: "Parking fee split", status: "pending", date: new Date(now.getTime() - 4 * 24 * 3600000).toISOString(), fee: 0, yieldGenerated: 0 },
          { id: "tx5", type: "sent", counterparty: "Lisa Patel", counterpartyUnit: "Unit 215", amount: 200.00, description: "Furniture purchase share", status: "completed", date: new Date(now.getTime() - 7 * 24 * 3600000).toISOString(), fee: 0, yieldGenerated: 0.021 },
          { id: "tx6", type: "received", counterparty: "James Wu", counterpartyUnit: "Unit 607", amount: 55.00, description: "Game night supplies", status: "completed", date: new Date(now.getTime() - 10 * 24 * 3600000).toISOString(), fee: 0, yieldGenerated: 0.006 },
        ],
        splitExpenses: [
          {
            id: "sp1",
            title: "Monthly Utilities (February)",
            totalAmount: 240.00,
            myShare: 80.00,
            participants: [
              { name: "You", share: 80.00, paid: true },
              { name: "Sarah Chen", share: 80.00, paid: true },
              { name: "Marcus Johnson", share: 80.00, paid: false },
            ],
            status: "active",
            createdAt: new Date(now.getTime() - 5 * 24 * 3600000).toISOString(),
          },
          {
            id: "sp2",
            title: "Pizza Night",
            totalAmount: 65.00,
            myShare: 16.25,
            participants: [
              { name: "You", share: 16.25, paid: true },
              { name: "Emily Rivera", share: 16.25, paid: true },
              { name: "David Kim", share: 16.25, paid: true },
              { name: "Lisa Patel", share: 16.25, paid: true },
            ],
            status: "settled",
            createdAt: new Date(now.getTime() - 14 * 24 * 3600000).toISOString(),
          },
        ],
      };
      res.json(p2pData);
    } catch (error: any) {
      console.error("P2P data error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tenant/p2p/send", requireRole("Tenant"), async (req, res) => {
    try {
      const { contactId, amount, description } = req.body;
      res.json({ success: true, transactionId: `p2p-${Date.now()}`, amount, description });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tenant/p2p/request", requireRole("Tenant"), async (req, res) => {
    try {
      const { contactId, amount, description } = req.body;
      res.json({ success: true, requestId: `req-${Date.now()}`, amount, description });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Rental Insurance ============
  app.get("/api/tenant/rental-insurance", requireRole("Tenant"), async (req, res) => {
    try {
      const insuranceData = {
        activePlan: {
          id: "plan-standard",
          name: "Standard Coverage",
          monthlyPremium: 18,
          coverageAmount: 25000,
          deductible: 250,
          features: ["Personal Property", "Liability Protection", "Water Damage", "Theft Coverage", "Temporary Housing", "Legal Defense", "Pet Damage", "Lock Replacement"],
          popular: true,
          enrolled: true,
        },
        availablePlans: [
          {
            id: "plan-basic",
            name: "Basic Coverage",
            monthlyPremium: 9,
            coverageAmount: 10000,
            deductible: 500,
            features: ["Personal Property", "Liability Protection", "Water Damage", "Lock Replacement"],
            popular: false,
            enrolled: false,
          },
          {
            id: "plan-standard",
            name: "Standard Coverage",
            monthlyPremium: 18,
            coverageAmount: 25000,
            deductible: 250,
            features: ["Personal Property", "Liability Protection", "Water Damage", "Theft Coverage", "Temporary Housing", "Legal Defense", "Pet Damage", "Lock Replacement"],
            popular: true,
            enrolled: true,
          },
          {
            id: "plan-premium",
            name: "Premium Coverage",
            monthlyPremium: 29,
            coverageAmount: 50000,
            deductible: 100,
            features: ["Personal Property", "Liability Protection", "Water Damage", "Theft Coverage", "Temporary Housing", "Legal Defense", "Pet Damage", "Lock Replacement", "Electronics Coverage", "Identity Theft", "Earthquake", "Flood"],
            popular: false,
            enrolled: false,
          },
        ],
        claims: [
          { id: "clm-1", type: "Water Damage", description: "Pipe leak under kitchen sink caused water damage to flooring and cabinet", amount: 1850, status: "paid", submittedDate: "Dec 15, 2025", resolvedDate: "Dec 22, 2025", paidAmount: 1600 },
          { id: "clm-2", type: "Theft", description: "Package stolen from hallway — electronics valued at $420", amount: 420, status: "under_review", submittedDate: "Jan 28, 2026", resolvedDate: null, paidAmount: null },
        ],
        coveragePool: {
          totalPoolSize: 2450000,
          stablecoinBacking: [
            { coin: "USDC", amount: 1470000, pct: 60 },
            { coin: "USDT", amount: 612500, pct: 25 },
            { coin: "DAI", amount: 367500, pct: 15 },
          ],
          reserveRatio: 142,
          poolYield: 4.8,
          yourContribution: 324.00,
          yourYieldEarned: 12.85,
        },
        monthlyHistory: [
          { month: "Sep", premium: 18, poolValue: 2180000 },
          { month: "Oct", premium: 18, poolValue: 2240000 },
          { month: "Nov", premium: 18, poolValue: 2310000 },
          { month: "Dec", premium: 18, poolValue: 2360000 },
          { month: "Jan", premium: 18, poolValue: 2410000 },
          { month: "Feb", premium: 18, poolValue: 2450000 },
        ],
        stats: {
          totalPremiumsPaid: 324.00,
          totalClaimsPaid: 1600,
          coverageMonths: 18,
          yieldEarnedOnPremiums: 12.85,
        },
      };
      res.json(insuranceData);
    } catch (error: any) {
      console.error("Rental insurance data error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tenant/rental-insurance/enroll", requireRole("Tenant"), async (req, res) => {
    try {
      const { planId } = req.body;
      res.json({ success: true, planId, message: "Enrolled successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tenant/rental-insurance/claim", requireRole("Tenant"), async (req, res) => {
    try {
      const { type, amount, description } = req.body;
      res.json({ success: true, claimId: `clm-${Date.now()}`, type, amount });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Activity Feed ============
  app.get("/api/activity", requireAuth, async (req, res) => {
    try {
      const userRole = req.session.userRole;
      const activities: any[] = [];
      const now = new Date();
      if (userRole === "Admin" || userRole === "PropertyManager" || userRole === "CFO" || userRole === "Analyst") {
        activities.push(
          { id: "a1", type: "payment", icon: "dollar", title: "Rent payment received", description: "Maria G. paid $1,525 for Sunset #412", timestamp: new Date(now.getTime() - 15 * 60000).toISOString(), read: false, severity: "success" },
          { id: "a2", type: "alert", icon: "alert", title: "Delinquency risk detected", description: "Kevin M. (Riverdale #102) flagged by neural model - 91% probability", timestamp: new Date(now.getTime() - 45 * 60000).toISOString(), read: false, severity: "critical" },
          { id: "a3", type: "incentive", icon: "award", title: "Incentive milestone reached", description: "Early Bird program hit 340% ROI at Sunset Towers", timestamp: new Date(now.getTime() - 2 * 3600000).toISOString(), read: false, severity: "info" },
          { id: "a4", type: "vendor", icon: "truck", title: "Vendor payment processed", description: "ABC Plumbing - $4,200 instant payment via ACH", timestamp: new Date(now.getTime() - 3 * 3600000).toISOString(), read: true, severity: "success" },
          { id: "a5", type: "system", icon: "sync", title: "PMS sync completed", description: "AppFolio data synchronized - 12 new transactions imported", timestamp: new Date(now.getTime() - 5 * 3600000).toISOString(), read: true, severity: "info" },
          { id: "a6", type: "collection", icon: "mail", title: "Nudge sent automatically", description: "Automated reminder sent to David L. (Maple #305)", timestamp: new Date(now.getTime() - 8 * 3600000).toISOString(), read: true, severity: "info" },
          { id: "a7", type: "treasury", icon: "trending", title: "Float yield distributed", description: "$1,847.52 yield accrued from rent float - deposited to treasury", timestamp: new Date(now.getTime() - 12 * 3600000).toISOString(), read: true, severity: "success" },
          { id: "a8", type: "ownership", icon: "home", title: "Tenant ownership milestone", description: "Maria G. reached FHA eligibility threshold - lender matching available", timestamp: new Date(now.getTime() - 24 * 3600000).toISOString(), read: true, severity: "info" },
          { id: "a9", type: "alert", icon: "alert", title: "Liquidity gap predicted", description: "$85K vendor payout cluster on March 15 may create 2.1-day shortfall", timestamp: new Date(now.getTime() - 36 * 3600000).toISOString(), read: true, severity: "warning" },
          { id: "a10", type: "payment", icon: "dollar", title: "Bulk rent collection", description: "142 payments received totaling $216,550 - 94.5% on-time rate", timestamp: new Date(now.getTime() - 48 * 3600000).toISOString(), read: true, severity: "success" }
        );
      } else if (userRole === "Tenant") {
        activities.push(
          { id: "t1", type: "payment", icon: "dollar", title: "Rent payment confirmed", description: "February rent of $1,525 processed successfully via ACH", timestamp: new Date(now.getTime() - 2 * 3600000).toISOString(), read: false, severity: "success" },
          { id: "t2", type: "cashback", icon: "award", title: "Cashback earned", description: "$3.50 on-time payment cashback credited to your wallet", timestamp: new Date(now.getTime() - 3 * 3600000).toISOString(), read: false, severity: "success" },
          { id: "t3", type: "streak", icon: "fire", title: "Payment streak milestone", description: "8-month on-time streak! Silver tier cashback unlocked ($3.50/mo)", timestamp: new Date(now.getTime() - 24 * 3600000).toISOString(), read: true, severity: "info" },
          { id: "t4", type: "split", icon: "users", title: "Rent split received", description: "Alex M. sent $762.50 for their share of February rent", timestamp: new Date(now.getTime() - 48 * 3600000).toISOString(), read: true, severity: "success" },
          { id: "t5", type: "ownership", icon: "home", title: "Ownership readiness update", description: "Your credit trajectory looks great! Review your FHA eligibility status", timestamp: new Date(now.getTime() - 72 * 3600000).toISOString(), read: true, severity: "info" },
          { id: "t6", type: "merchant", icon: "store", title: "Purchase cashback earned", description: "$0.45 yield earned from Local Grocery purchase ($22.50)", timestamp: new Date(now.getTime() - 96 * 3600000).toISOString(), read: true, severity: "success" }
        );
      } else if (userRole === "Vendor") {
        activities.push(
          { id: "v1", type: "payment", icon: "dollar", title: "Payment received", description: "$4,200 from Naltos Demo Properties - Invoice #INV-2024-047", timestamp: new Date(now.getTime() - 1 * 3600000).toISOString(), read: false, severity: "success" },
          { id: "v2", type: "yield", icon: "trending", title: "Float yield accrued", description: "$12.85 yield earned on Net45 float balance", timestamp: new Date(now.getTime() - 6 * 3600000).toISOString(), read: false, severity: "info" },
          { id: "v3", type: "payout", icon: "bank", title: "ACH payout scheduled", description: "$8,500 scheduled for February 15 via ACH (Net30)", timestamp: new Date(now.getTime() - 24 * 3600000).toISOString(), read: true, severity: "info" },
          { id: "v4", type: "invoice", icon: "file", title: "New invoice received", description: "Invoice #INV-2024-052 for $3,150 from Naltos Demo Properties", timestamp: new Date(now.getTime() - 48 * 3600000).toISOString(), read: true, severity: "info" }
        );
      } else if (userRole === "Merchant") {
        activities.push(
          { id: "m1", type: "transaction", icon: "store", title: "Transaction processed", description: "$45.00 purchase from Tenant Maria G. - settlement in 2 days", timestamp: new Date(now.getTime() - 30 * 60000).toISOString(), read: false, severity: "success" },
          { id: "m2", type: "settlement", icon: "dollar", title: "Settlement completed", description: "$1,250.00 batch settlement deposited to your account", timestamp: new Date(now.getTime() - 5 * 3600000).toISOString(), read: false, severity: "success" },
          { id: "m3", type: "yield", icon: "trending", title: "Settlement yield earned", description: "$2.15 yield from 2-day settlement float", timestamp: new Date(now.getTime() - 12 * 3600000).toISOString(), read: true, severity: "info" },
          { id: "m4", type: "promotion", icon: "megaphone", title: "Promotion opportunity", description: "Offer 5% cashback to Naltos tenants and increase foot traffic", timestamp: new Date(now.getTime() - 36 * 3600000).toISOString(), read: true, severity: "info" }
        );
      }
      const unreadCount = activities.filter(a => !a.read).length;
      res.json({ activities, unreadCount });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Mark Activity Read ============
  app.post("/api/activity/read", requireAuth, async (req, res) => {
    try {
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Vendor Statements ============
  app.get("/api/vendor/statements", requireVendor(storage), async (req, res) => {
    try {
      const statements = [];
      const today = new Date();
      for (let m = 0; m < 6; m++) {
        const date = new Date(today.getFullYear(), today.getMonth() - m, 1);
        const monthName = date.toLocaleString("default", { month: "long", year: "numeric" });
        statements.push({
          id: `stmt-${m}`,
          period: monthName,
          date: date.toISOString().split("T")[0],
          invoiceCount: 3 + Math.floor(Math.random() * 4),
          totalAmount: 8500 + Math.floor(Math.random() * 6000),
          totalYield: 25 + Math.floor(Math.random() * 40),
          status: m === 0 ? "current" : "available",
        });
      }
      res.json({ statements });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Merchant Statements ============
  app.get("/api/merchant/statements", requireMerchant(storage), async (req, res) => {
    try {
      const statements = [];
      const today = new Date();
      for (let m = 0; m < 6; m++) {
        const date = new Date(today.getFullYear(), today.getMonth() - m, 1);
        const monthName = date.toLocaleString("default", { month: "long", year: "numeric" });
        statements.push({
          id: `mstmt-${m}`,
          period: monthName,
          date: date.toISOString().split("T")[0],
          transactionCount: 25 + Math.floor(Math.random() * 30),
          totalVolume: 3200 + Math.floor(Math.random() * 2000),
          totalYield: 8 + Math.floor(Math.random() * 12),
          avgSettlementDays: 1.5 + Math.random() * 0.8,
          status: m === 0 ? "current" : "available",
        });
      }
      res.json({ statements });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/deposit-alternatives", requireAuth, requireRole("Admin", "PropertyManager", "CFO", "Analyst"), async (req, res) => {
    try {
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/rent-pricing", requireAuth, requireRole("Admin", "PropertyManager", "CFO", "Analyst"), async (req, res) => {
    try {
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/capital-access", requireAuth, requireRole("Admin", "PropertyManager", "CFO", "Analyst"), async (req, res) => {
    try {
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tenant/credit-builder", requireAuth, requireRole("Tenant"), async (req, res) => {
    try {
      res.json({
        currentScore: 712,
        scoreChange: 28,
        enrolledSince: "2025-03-15",
        bureaus: [
          { name: "Experian", status: "active", lastReported: "2026-02-01", scoreImpact: 28 },
          { name: "TransUnion", status: "active", lastReported: "2026-01-28", scoreImpact: 24 },
          { name: "Equifax", status: "pending", expectedStart: "2026-03-01", scoreImpact: null },
        ],
        scoreHistory: [
          { month: "May", score: 684 }, { month: "Jun", score: 688 }, { month: "Jul", score: 691 },
          { month: "Aug", score: 695 }, { month: "Sep", score: 698 }, { month: "Oct", score: 702 },
          { month: "Nov", score: 705 }, { month: "Dec", score: 708 }, { month: "Jan", score: 710 },
          { month: "Feb", score: 712 },
        ],
        paymentHistory: [
          { month: "February 2026", amount: 1500, status: "On Time", reported: true, impact: 2 },
          { month: "January 2026", amount: 1500, status: "On Time", reported: true, impact: 3 },
          { month: "December 2025", amount: 1500, status: "On Time", reported: true, impact: 2 },
          { month: "November 2025", amount: 1500, status: "On Time", reported: true, impact: 3 },
          { month: "October 2025", amount: 1500, status: "On Time", reported: true, impact: 2 },
          { month: "September 2025", amount: 1500, status: "On Time", reported: true, impact: 3 },
        ],
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
