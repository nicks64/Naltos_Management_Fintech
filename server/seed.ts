import { db } from "./db";
import {
  organizations,
  users,
  properties,
  units,
  tenants,
  leases,
  invoices,
  payments,
  bankLedger,
  treasuryProducts,
  treasurySubscriptions,
  organizationSettings,
  magicCodes,
} from "@shared/schema";
import { eq, inArray } from "drizzle-orm";
import bcrypt from "bcrypt";

export async function seedDatabase() {
  console.log("Seeding database...");

  // Get or create demo organization FIRST before deleting anything
  let demoOrg = (await db.select().from(organizations).where(eq(organizations.name, "Naltos Demo Properties")))[0];
  if (!demoOrg) {
    [demoOrg] = await db.insert(organizations).values({
      name: "Naltos Demo Properties",
    }).returning();
  }

  // Get or create demo user and ensure it's linked to demo org
  const hashedPassword = await bcrypt.hash("demo123", 10);
  let existingUser = (await db.select().from(users).where(eq(users.email, "demo@naltos.com")))[0];
  let demoUser;
  if (existingUser) {
    // Update existing user to point to demo org
    [demoUser] = await db.update(users)
      .set({ organizationId: demoOrg.id })
      .where(eq(users.email, "demo@naltos.com"))
      .returning();
  } else {
    [demoUser] = await db.insert(users).values({
      email: "demo@naltos.com",
      password: hashedPassword,
      organizationId: demoOrg.id,
      role: "Admin",
    }).returning();
  }

  // NOW delete existing data ONLY for this organization (in correct dependency order)
  // This preserves other organizations and their data
  
  // Delete bank ledger FIRST (it references payments via matchedPaymentId)
  await db.delete(bankLedger).where(eq(bankLedger.organizationId, demoOrg.id));
  
  // Delete treasury data (subscriptions only - products are global shared catalog)
  await db.delete(treasurySubscriptions).where(eq(treasurySubscriptions.organizationId, demoOrg.id));
  await db.delete(organizationSettings).where(eq(organizationSettings.organizationId, demoOrg.id));
  
  // Treasury products are global catalog - NEVER delete them
  // Just check if they exist and create if needed
  const existingProducts = await db.select().from(treasuryProducts);
  let productsExist = existingProducts.length > 0;
  
  // Delete property-related data in correct order
  const orgProps = await db.select().from(properties).where(eq(properties.organizationId, demoOrg.id));
  const propIds = orgProps.map(p => p.id);
  
  if (propIds.length > 0) {
    const orgUnits = await db.select().from(units).where(inArray(units.propertyId, propIds));
    const unitIds = orgUnits.map(u => u.id);
    
    if (unitIds.length > 0) {
      const orgLeases = await db.select().from(leases).where(inArray(leases.unitId, unitIds));
      const leaseIds = orgLeases.map(l => l.id);
      
      if (leaseIds.length > 0) {
        const orgInvoices = await db.select().from(invoices).where(inArray(invoices.leaseId, leaseIds));
        const invoiceIds = orgInvoices.map(i => i.id);
        
        if (invoiceIds.length > 0) {
          await db.delete(payments).where(inArray(payments.invoiceId, invoiceIds));
        }
        await db.delete(invoices).where(inArray(invoices.leaseId, leaseIds));
      }
      await db.delete(leases).where(inArray(leases.unitId, unitIds));
      
      // Get tenants from leases to delete them
      const tenantIds = [...new Set(orgLeases.map(l => l.tenantId))];
      if (tenantIds.length > 0) {
        await db.delete(tenants).where(inArray(tenants.id, tenantIds));
      }
    }
    await db.delete(units).where(inArray(units.propertyId, propIds));
  }
  await db.delete(properties).where(eq(properties.organizationId, demoOrg.id));
  
  // Delete magic codes for demo user only
  await db.delete(magicCodes).where(eq(magicCodes.email, "demo@naltos.com"));

  // Create magic code for demo
  await db.insert(magicCodes).values({
    email: "demo@naltos.com",
    code: "000000",
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    used: false,
  });

  // Create organization settings
  await db.insert(organizationSettings).values({
    organizationId: demoOrg.id,
    complianceMode: "accredited_access",
    pmsProvider: "AppFolio",
  });

  // Create properties
  const [prop1] = await db.insert(properties).values({
    organizationId: demoOrg.id,
    name: "Sunset Gardens",
    address: "123 Sunset Blvd, San Diego, CA 92101",
    unitCount: 80,
    monthlyOpex: "48000.00",
  }).returning();

  const [prop2] = await db.insert(properties).values({
    organizationId: demoOrg.id,
    name: "Harbor View",
    address: "456 Harbor Dr, San Francisco, CA 94102",
    unitCount: 70,
    monthlyOpex: "56000.00",
  }).returning();

  const [prop3] = await db.insert(properties).values({
    organizationId: demoOrg.id,
    name: "Parkside Residences",
    address: "789 Park Ave, Los Angeles, CA 90012",
    unitCount: 50,
    monthlyOpex: "35000.00",
  }).returning();

  // Create units (200 total)
  const unitPromises = [];
  for (let i = 1; i <= 80; i++) {
    unitPromises.push(db.insert(units).values({
      propertyId: prop1.id,
      unitNumber: `SG-${i.toString().padStart(3, '0')}`,
    }));
  }
  for (let i = 1; i <= 70; i++) {
    unitPromises.push(db.insert(units).values({
      propertyId: prop2.id,
      unitNumber: `HV-${i.toString().padStart(3, '0')}`,
    }));
  }
  for (let i = 1; i <= 50; i++) {
    unitPromises.push(db.insert(units).values({
      propertyId: prop3.id,
      unitNumber: `PR-${i.toString().padStart(3, '0')}`,
    }));
  }
  await Promise.all(unitPromises);

  // Get all units
  const allUnits = await db.select().from(units);

  // Create tenants (120 for active leases)
  const tenantNames = [
    "John Smith", "Emma Johnson", "Michael Brown", "Sarah Davis", "James Wilson",
    "Emily Martinez", "Robert Anderson", "Jessica Taylor", "William Thomas", "Ashley Garcia",
    "David Rodriguez", "Jennifer Martinez", "Richard Hernandez", "Lisa Lopez", "Charles Gonzalez",
    "Maria Perez", "Joseph Sanchez", "Susan Ramirez", "Thomas Torres", "Karen Flores",
    "Christopher Rivera", "Nancy Gomez", "Daniel Diaz", "Betty Cruz", "Matthew Reyes",
    "Helen Morales", "Anthony Ortiz", "Sandra Gutierrez", "Mark Chavez", "Donna Ramos",
  ];

  const createdTenants = [];
  for (let i = 0; i < 120; i++) {
    const [tenant] = await db.insert(tenants).values({
      organizationId: demoOrg.id,
      name: tenantNames[i % tenantNames.length] + ` ${i + 1}`,
      email: `tenant${i + 1}@example.com`,
      phone: `(555) ${String(i + 100).padStart(3, '0')}-${String(i).padStart(4, '0')}`,
    }).returning();
    createdTenants.push(tenant);
  }

  // Create leases (120 active)
  const createdLeases = [];
  for (let i = 0; i < 120; i++) {
    const unit = allUnits[i];
    const tenant = createdTenants[i];
    const [lease] = await db.insert(leases).values({
      unitId: unit.id,
      tenantId: tenant.id,
      monthlyRent: (1200 + Math.random() * 800).toFixed(2),
      startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      active: true,
    }).returning();
    createdLeases.push(lease);
  }

  // Create invoices (300 total)
  const createdInvoices = [];
  for (let i = 0; i < 300; i++) {
    const lease = createdLeases[i % 120];
    const daysOffset = Math.floor(Math.random() * 90) - 45; // -45 to +45 days
    const dueDate = new Date(Date.now() + daysOffset * 24 * 60 * 60 * 1000);
    
    let status: "pending" | "paid" | "overdue" | "partial";
    let paidDate: Date | null = null;
    
    if (daysOffset < -10) {
      // Overdue
      status = Math.random() > 0.7 ? "overdue" : "paid";
      if (status === "paid") {
        paidDate = new Date(dueDate.getTime() + Math.random() * 15 * 24 * 60 * 60 * 1000);
      }
    } else if (daysOffset < 0) {
      // Recently due
      status = Math.random() > 0.4 ? "paid" : "pending";
      if (status === "paid") {
        paidDate = new Date(dueDate.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000);
      }
    } else {
      // Future
      status = "pending";
    }

    const [invoice] = await db.insert(invoices).values({
      leaseId: lease.id,
      amount: lease.monthlyRent,
      dueDate,
      status,
      paidDate,
    }).returning();
    createdInvoices.push(invoice);
  }

  // Create payments (220 total)
  const paidInvoices = createdInvoices.filter(inv => inv.status === "paid");
  for (let i = 0; i < Math.min(220, paidInvoices.length); i++) {
    const invoice = paidInvoices[i];
    const paymentMethods: Array<"ACH" | "Card" | "Check" | "Wire"> = ["ACH", "Card", "Check", "Wire"];
    await db.insert(payments).values({
      invoiceId: invoice.id,
      amount: invoice.amount,
      paymentDate: invoice.paidDate || new Date(),
      method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
    });
  }

  // Get all payments for bank ledger
  const allPayments = await db.select().from(payments);

  // Create bank ledger entries (30 total, some unmatched)
  for (let i = 0; i < 30; i++) {
    const shouldMatch = i < 20; // First 20 are matched
    const payment = shouldMatch ? allPayments[i] : null;
    
    await db.insert(bankLedger).values({
      organizationId: demoOrg.id,
      amount: payment ? payment.amount : (1000 + Math.random() * 500).toFixed(2),
      date: payment ? payment.paymentDate : new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      description: payment ? `Rent Payment - ${payment.id.substring(0, 8)}` : `Bank Transfer ${i + 1}`,
      matched: shouldMatch,
      matchedPaymentId: payment?.id || null,
    });
  }

  // Create or retrieve treasury products (global catalog)
  let nrfProduct, nrkProduct, nrcProduct;
  
  if (!productsExist) {
    // Products don't exist, create them
    [nrfProduct] = await db.insert(treasuryProducts).values({
      productType: "NRF",
      name: "Naltos Reserve Fund",
      description: "Short-term government T-Bill fund with capital preservation focus",
      currentYield: "5.10",
      wam: 45,
      targetDuration: 30,
      managementFee: "0.15",
      platformFee: "0.10",
    }).returning();

    [nrkProduct] = await db.insert(treasuryProducts).values({
      productType: "NRK",
      name: "Naltos Reserve T-Bill Token",
      description: "Tokenized T-Bills with 30-day rolling maturity",
      currentYield: "5.20",
      wam: 30,
      targetDuration: 30,
      managementFee: "0.20",
      platformFee: "0.10",
    }).returning();

    [nrcProduct] = await db.insert(treasuryProducts).values({
      productType: "NRC",
      name: "Naltos Reserve Cash+",
      description: "Dual-collateral enhanced yield product with delta-hedged BTC exposure",
      currentYield: "5.80",
      wam: 35,
      targetDuration: 30,
      managementFee: "0.50",
      platformFee: "0.15",
      ocRatio: "1.42",
    }).returning();
  } else {
    // Products exist, use them
    nrfProduct = existingProducts.find(p => p.productType === "NRF")!;
    nrkProduct = existingProducts.find(p => p.productType === "NRK")!;
    nrcProduct = existingProducts.find(p => p.productType === "NRC")!;
  }

  // Create treasury subscriptions for demo org
  await db.insert(treasurySubscriptions).values({
    organizationId: demoOrg.id,
    productId: nrfProduct.id,
    balance: "1200000.00",
    autoRoll: true,
  });

  await db.insert(treasurySubscriptions).values({
    organizationId: demoOrg.id,
    productId: nrkProduct.id,
    balance: "800000.00",
    autoRoll: false,
  });

  await db.insert(treasurySubscriptions).values({
    organizationId: demoOrg.id,
    productId: nrcProduct.id,
    balance: "300000.00",
    autoRoll: true,
  });

  console.log("Database seeded successfully!");
  console.log(`- Organization: ${demoOrg.name}`);
  console.log(`- Demo user: demo@naltos.com (code: 000000)`);
  console.log(`- Properties: 3`);
  console.log(`- Units: 200`);
  console.log(`- Leases: 120`);
  console.log(`- Invoices: 300`);
  console.log(`- Payments: 220`);
  console.log(`- Bank ledger: 30`);
  console.log(`- Treasury products: 3`);
}
