import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { seedDatabase } from "./seed";
import bcrypt from "bcrypt";
import OpenAI from "openai";
import { requireAuth, requireRole, extractOrganizationId, requireVendor } from "./middleware";

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
      if (email !== "demo@naltos.com" && email !== "tenant@demo.com") {
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

      // Mark as used
      await storage.markMagicCodeUsed(magicCode.id);

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

  const httpServer = createServer(app);

  return httpServer;
}
