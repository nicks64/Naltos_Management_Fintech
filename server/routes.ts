import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { seedDatabase } from "./seed";
import bcrypt from "bcrypt";
import OpenAI from "openai";
import { requireRole, extractOrganizationId } from "./middleware";

// Reference: blueprint:javascript_openai_ai_integrations
// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply organization ID extraction middleware globally
  app.use("/api", extractOrganizationId);

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
      req.session.organizationId = user.organizationId;

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

      // Mark as used
      await storage.markMagicCodeUsed(magicCode.id);

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

      // Get organization
      const organization = await storage.getOrganization(user.organizationId);

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
      req.session.organizationId = user.organizationId;

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
