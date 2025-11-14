import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
const PgSession = connectPgSimple(session);

// Trust proxy for secure cookies behind TLS termination (e.g., Replit, AWS ELB)
app.set("trust proxy", 1);

// Session configuration
app.use(
  session({
    store: new PgSession({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "naltos-dev-secret-change-in-prod",
    resave: false,
    saveUninitialized: false,
    name: "naltos.sid", // Custom session cookie name
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax", // Important for modern browsers
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: "/", // Ensure cookie is sent for all paths
    },
  })
);

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

declare module 'express-session' {
  interface SessionData {
    userId: string;
    userRole: string;
    organizationId: string; // Nullable for vendor users
    tenantId?: string; // For tenant-role users
    // Note: Vendor links are NOT cached in session - they're revalidated on every request
    // via requireVendor middleware to ensure immediate revocation. Access via req.vendorIds.
  }
}
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Ensure demo credentials exist on startup
  try {
    const { db } = await import("./db");
    const { users, magicCodes, organizations } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    const bcrypt = await import("bcrypt");

    // Check if demo organization exists
    let [demoOrg] = await db.select().from(organizations).where(eq(organizations.name, "Naltos Demo Properties"));
    if (!demoOrg) {
      [demoOrg] = await db.insert(organizations).values({
        name: "Naltos Demo Properties",
      }).returning();
    }

    // Check if demo user exists
    let [demoUser] = await db.select().from(users).where(eq(users.email, "demo@naltos.com"));
    if (!demoUser) {
      const hashedPassword = await bcrypt.hash("demo123", 10);
      [demoUser] = await db.insert(users).values({
        email: "demo@naltos.com",
        password: hashedPassword,
        organizationId: demoOrg.id,
        role: "Admin",
      }).returning();
    } else if (demoUser.organizationId !== demoOrg.id) {
      [demoUser] = await db.update(users)
        .set({ organizationId: demoOrg.id })
        .where(eq(users.email, "demo@naltos.com"))
        .returning();
    }

    // Ensure demo magic code exists and is not marked as used
    const existingCodes = await db.select().from(magicCodes)
      .where(eq(magicCodes.email, "demo@naltos.com"));
    
    if (existingCodes.length === 0) {
      // Create new magic code
      await db.insert(magicCodes).values({
        email: "demo@naltos.com",
        code: "000000",
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        used: false,
      });
    } else {
      // Reset existing code to unused
      await db.update(magicCodes)
        .set({ 
          used: false,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // Extend expiry
        })
        .where(eq(magicCodes.email, "demo@naltos.com"));
    }

    log("Demo setup complete");
  } catch (error) {
    console.error("Failed to ensure demo setup:", error);
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
