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
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export async function seedDatabase() {
  console.log("Seeding database...");

  // Clear existing data (in reverse dependency order)
  await db.delete(treasurySubscriptions);
  await db.delete(treasuryProducts);
  await db.delete(bankLedger);
  await db.delete(payments);
  await db.delete(invoices);
  await db.delete(leases);
  await db.delete(tenants);
  await db.delete(units);
  await db.delete(properties);
  await db.delete(organizationSettings);
  await db.delete(magicCodes);
  await db.delete(users);
  await db.delete(organizations);

  // Create demo organization
  const [demoOrg] = await db.insert(organizations).values({
    name: "Naltos Demo Properties",
  }).returning();

  // Create demo user
  const hashedPassword = await bcrypt.hash("demo123", 10);
  const [demoUser] = await db.insert(users).values({
    email: "demo@naltos.com",
    password: hashedPassword,
    organizationId: demoOrg.id,
    role: "Admin",
  }).returning();

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

  // Create treasury products
  const [nrfProduct] = await db.insert(treasuryProducts).values({
    productType: "NRF",
    name: "Naltos Reserve Fund",
    description: "Short-term government T-Bill fund with capital preservation focus",
    currentYield: "5.10",
    wam: 45,
    targetDuration: 30,
    managementFee: "0.15",
    platformFee: "0.10",
  }).returning();

  const [nrkProduct] = await db.insert(treasuryProducts).values({
    productType: "NRK",
    name: "Naltos Reserve T-Bill Token",
    description: "Tokenized T-Bills with 30-day rolling maturity",
    currentYield: "5.20",
    wam: 30,
    targetDuration: 30,
    managementFee: "0.20",
    platformFee: "0.10",
  }).returning();

  const [nrcProduct] = await db.insert(treasuryProducts).values({
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
