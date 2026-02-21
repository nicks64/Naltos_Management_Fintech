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
  cryptoWallets,
  cryptoTransactions,
  cryptoTreasuryDeployments,
  vendors,
  vendorInvoices,
  merchants,
  merchantTransactions,
  parkingSpaceAssignments,
  parkingPermits,
  parkingViolations,
  parkingTowingLog,
  parkingGarageAccess,
  incidentReports,
  patrolLogs,
  cameraSystems,
  fireSafety,
  identities,
  identityPersonas,
  tenantPersonaLinks,
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

  // ====== IDENTITY/PERSONA BACKFILL ======
  // Clean up existing identity data for demo users ONLY (scoped, not global)
  const demoEmails = ["demo@naltos.com", "tenant@demo.com", "vendor@demo.com", "merchant@demo.com", "partner@demo.com", "multi@demo.com"];
  const demoIdentities = await db.select({ id: identities.id }).from(identities).where(inArray(identities.email, demoEmails));
  const demoIdentityIds = demoIdentities.map(i => i.id);
  if (demoIdentityIds.length > 0) {
    await db.delete(tenantPersonaLinks).where(inArray(tenantPersonaLinks.personaId,
      db.select({ id: identityPersonas.id }).from(identityPersonas).where(inArray(identityPersonas.identityId, demoIdentityIds))
    ));
    await db.delete(identityPersonas).where(inArray(identityPersonas.identityId, demoIdentityIds));
    await db.delete(identities).where(inArray(identities.id, demoIdentityIds));
  }

  // Create identity for admin user
  const [adminIdentity] = await db.insert(identities).values({
    email: "demo@naltos.com",
    passwordHash: hashedPassword,
    displayName: "Demo Admin",
    emailVerified: true,
  }).returning();

  const [adminPersona] = await db.insert(identityPersonas).values({
    identityId: adminIdentity.id,
    personaType: "operator",
    orgId: demoOrg.id,
    roleDetail: "admin",
    isDefault: true,
    status: "active",
    label: "Naltos Demo Properties",
  }).returning();

  // NOW delete existing data ONLY for this organization (in correct dependency order)
  // This preserves other organizations and their data
  
  // Delete vendor invoices and vendors
  const orgVendors = await db.select({ id: vendors.id }).from(vendors).where(eq(vendors.organizationId, demoOrg.id));
  const vendorIds = orgVendors.map(v => v.id);
  if (vendorIds.length > 0) {
    await db.delete(vendorInvoices).where(inArray(vendorInvoices.vendorId, vendorIds));
    await db.delete(vendors).where(inArray(vendors.id, vendorIds));
  }
  
  // Delete merchant transactions and merchants
  const orgMerchants = await db.select({ id: merchants.id }).from(merchants).where(eq(merchants.organizationId, demoOrg.id));
  const merchantIds = orgMerchants.map(m => m.id);
  if (merchantIds.length > 0) {
    await db.delete(merchantTransactions).where(inArray(merchantTransactions.merchantId, merchantIds));
    await db.delete(merchants).where(inArray(merchants.id, merchantIds));
  }
  
  // Delete bank ledger FIRST (it references payments via matchedPaymentId)
  await db.delete(bankLedger).where(eq(bankLedger.organizationId, demoOrg.id));
  
  // Delete crypto data (deployments first, then transactions, then wallets)
  await db.delete(cryptoTreasuryDeployments).where(eq(cryptoTreasuryDeployments.organizationId, demoOrg.id));
  const orgWallets = await db.select().from(cryptoWallets).where(eq(cryptoWallets.organizationId, demoOrg.id));
  const walletIds = orgWallets.map(w => w.id);
  if (walletIds.length > 0) {
    await db.delete(cryptoTransactions).where(inArray(cryptoTransactions.walletId, walletIds));
  }
  await db.delete(cryptoWallets).where(eq(cryptoWallets.organizationId, demoOrg.id));
  
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
      const tenantIds = Array.from(new Set(orgLeases.map(l => l.tenantId)));
      if (tenantIds.length > 0) {
        await db.delete(tenants).where(inArray(tenants.id, tenantIds));
      }
    }
    await db.delete(units).where(inArray(units.propertyId, propIds));
  }
  await db.delete(properties).where(eq(properties.organizationId, demoOrg.id));
  
  // Delete magic codes for demo user only
  await db.delete(magicCodes).where(eq(magicCodes.email, "demo@naltos.com"));

  // Create magic code for demo business user
  await db.insert(magicCodes).values({
    email: "demo@naltos.com",
    code: "000000",
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    used: false,
  });

  // Create tenant demo user
  let tenantUser = (await db.select().from(users).where(eq(users.email, "tenant@demo.com")))[0];
  if (tenantUser) {
    [tenantUser] = await db.update(users)
      .set({ organizationId: demoOrg.id, role: "Tenant" })
      .where(eq(users.email, "tenant@demo.com"))
      .returning();
  } else {
    [tenantUser] = await db.insert(users).values({
      email: "tenant@demo.com",
      password: hashedPassword,
      organizationId: demoOrg.id,
      role: "Tenant",
    }).returning();
  }

  // Delete magic codes for tenant user
  await db.delete(magicCodes).where(eq(magicCodes.email, "tenant@demo.com"));

  // Create magic code for tenant demo user
  await db.insert(magicCodes).values({
    email: "tenant@demo.com",
    code: "000000",
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    used: false,
  });

  // Create identity for tenant user
  const [tenantIdentity] = await db.insert(identities).values({
    email: "tenant@demo.com",
    passwordHash: hashedPassword,
    displayName: "Sarah Davis",
    emailVerified: true,
  }).returning();

  const [tenantPersona] = await db.insert(identityPersonas).values({
    identityId: tenantIdentity.id,
    personaType: "tenant",
    orgId: demoOrg.id,
    roleDetail: "primary",
    isDefault: true,
    status: "active",
    label: "Sunset Gardens",
  }).returning();

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

  const [prop4] = await db.insert(properties).values({
    organizationId: demoOrg.id,
    name: "The Metropolitan",
    address: "1200 Market St, San Francisco, CA 94103",
    unitCount: 24,
    monthlyOpex: "22000.00",
  }).returning();

  const [prop5] = await db.insert(properties).values({
    organizationId: demoOrg.id,
    name: "Willow Creek Apartments",
    address: "3400 Willow Creek Rd, Sacramento, CA 95833",
    unitCount: 36,
    monthlyOpex: "28000.00",
  }).returning();

  const [prop6] = await db.insert(properties).values({
    organizationId: demoOrg.id,
    name: "Oceanfront Towers",
    address: "900 Pacific Coast Hwy, Long Beach, CA 90802",
    unitCount: 18,
    monthlyOpex: "19500.00",
  }).returning();

  const [prop7] = await db.insert(properties).values({
    organizationId: demoOrg.id,
    name: "Cedar Ridge Villas",
    address: "5600 Cedar Ridge Dr, Irvine, CA 92620",
    unitCount: 12,
    monthlyOpex: "12000.00",
  }).returning();

  // Create units
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
  for (let i = 1; i <= 24; i++) {
    unitPromises.push(db.insert(units).values({
      propertyId: prop4.id,
      unitNumber: `MT-${i.toString().padStart(3, '0')}`,
    }));
  }
  for (let i = 1; i <= 36; i++) {
    unitPromises.push(db.insert(units).values({
      propertyId: prop5.id,
      unitNumber: `WC-${i.toString().padStart(3, '0')}`,
    }));
  }
  for (let i = 1; i <= 18; i++) {
    unitPromises.push(db.insert(units).values({
      propertyId: prop6.id,
      unitNumber: `OF-${i.toString().padStart(3, '0')}`,
    }));
  }
  for (let i = 1; i <= 12; i++) {
    unitPromises.push(db.insert(units).values({
      propertyId: prop7.id,
      unitNumber: `CR-${i.toString().padStart(3, '0')}`,
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

  // Create crypto wallets for business (demo org)
  const [usdcWallet] = await db.insert(cryptoWallets).values({
    organizationId: demoOrg.id,
    coin: "USDC",
    balance: "125000.50",
    depositAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7",
  }).returning();

  const [usdtWallet] = await db.insert(cryptoWallets).values({
    organizationId: demoOrg.id,
    coin: "USDT",
    balance: "85000.25",
    depositAddress: "0xE3a5B4d7f79d64088C8d4ef153A7DDe2D2e0c08f",
  }).returning();

  const [daiWallet] = await db.insert(cryptoWallets).values({
    organizationId: demoOrg.id,
    coin: "DAI",
    balance: "42500.75",
    depositAddress: "0x9C8EB2F46a2F4dCf4D0b6aE50fE3b5c8D7e4A9c2",
  }).returning();

  // Add sample crypto transactions for business
  await db.insert(cryptoTransactions).values({
    walletId: usdcWallet.id,
    transactionType: "deposit",
    fromCoin: "USDC",
    amount: "50000",
    usdValue: "50000.00",
    status: "completed",
    txHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  });

  await db.insert(cryptoTransactions).values({
    walletId: usdtWallet.id,
    transactionType: "conversion",
    fromCoin: "USDT",
    toCoin: "USDC",
    amount: "25000",
    usdValue: "25000.00",
    exchangeRate: "1.0",
    status: "completed",
    txHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  });

  await db.insert(cryptoTransactions).values({
    walletId: daiWallet.id,
    transactionType: "deposit",
    fromCoin: "DAI",
    amount: "30000",
    usdValue: "30000.00",
    status: "completed",
    txHash: "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  });

  // Create crypto wallets for tenant user (linked to tenant)
  if (createdTenants.length > 0) {
    const firstTenant = createdTenants[0];
    
    const [tenantUsdcWallet] = await db.insert(cryptoWallets).values({
      organizationId: demoOrg.id,
      tenantId: firstTenant.id,
      coin: "USDC",
      balance: "1250.50",
      depositAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7",
    }).returning();

    const [tenantUsdtWallet] = await db.insert(cryptoWallets).values({
      organizationId: demoOrg.id,
      tenantId: firstTenant.id,
      coin: "USDT",
      balance: "850.25",
      depositAddress: "0xE3a5B4d7f79d64088C8d4ef153A7DDe2D2e0c08f",
    }).returning();

    const [tenantDaiWallet] = await db.insert(cryptoWallets).values({
      organizationId: demoOrg.id,
      tenantId: firstTenant.id,
      coin: "DAI",
      balance: "425.75",
      depositAddress: "0x9C8EB2F46a2F4dCf4D0b6aE50fE3b5c8D7e4A9c2",
    }).returning();

    // Add sample tenant crypto transactions
    await db.insert(cryptoTransactions).values({
      walletId: tenantUsdcWallet.id,
      transactionType: "deposit",
      fromCoin: "USDC",
      amount: "500",
      usdValue: "500.00",
      status: "completed",
      txHash: "0x1234abcd5678ef901234abcd5678ef901234abcd5678ef901234abcd5678ef90",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    });

    await db.insert(cryptoTransactions).values({
      walletId: tenantUsdtWallet.id,
      transactionType: "rent_payment",
      fromCoin: "USDT",
      amount: "2500",
      usdValue: "2500.00",
      status: "completed",
      txHash: "0xabcd12345678ef90abcd12345678ef90abcd12345678ef90abcd12345678ef90",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    });
  }

  // Seed vendors for instant payment demo (Net30-90 yield amplification)
  console.log("Seeding vendors...");
  const vendorData = [
    { name: "ABC Maintenance Co.", category: "Maintenance" as const, defaultPaymentTerms: "Net60" as const },
    { name: "City Power & Light", category: "Utilities" as const, defaultPaymentTerms: "Net30" as const },
    { name: "Premier Insurance Group", category: "Insurance" as const, defaultPaymentTerms: "Net45" as const },
    { name: "Green Lawn Services", category: "Landscaping" as const, defaultPaymentTerms: "Net30" as const },
    { name: "SecureGuard Security", category: "Security" as const, defaultPaymentTerms: "Net90" as const },
    { name: "CleanPro Janitorial", category: "Cleaning" as const, defaultPaymentTerms: "Net30" as const },
  ];

  const seededVendors = await db.insert(vendors).values(
    vendorData.map(v => ({
      organizationId: demoOrg.id,
      name: v.name,
      category: v.category,
      defaultPaymentTerms: v.defaultPaymentTerms,
      email: `contact@${v.name.toLowerCase().replace(/[^a-z]/g, '')}.com`,
      phone: "(555) " + Math.floor(Math.random() * 900 + 100) + "-" + Math.floor(Math.random() * 9000 + 1000),
    }))
  ).returning();

  console.log(`${seededVendors.length} vendors created!`);

  // Seed vendor invoices showing instant vs traditional payment (showcases 3-9× yield multiplier)
  console.log("Seeding vendor invoices...");
  const now2 = new Date();
  const vendorInvoiceData: any[] = [];

  // Create mix of instant-paid and pending invoices for each vendor
  seededVendors.forEach((vendor, idx) => {
    const termDays = vendor.defaultPaymentTerms === "Net30" ? 30 : 
                     vendor.defaultPaymentTerms === "Net45" ? 45 :
                     vendor.defaultPaymentTerms === "Net60" ? 60 : 90;

    // Invoice 1: Paid via instant (showcases yield generation - 3-9× rent float!)
    const invoice1Date = new Date(now2);
    invoice1Date.setDate(now2.getDate() - 20);
    const invoice1Due = new Date(invoice1Date);
    invoice1Due.setDate(invoice1Date.getDate() + termDays);
    const invoice1Scheduled = new Date(invoice1Due);

    const amount1 = (idx === 0 ? 12500 : idx === 1 ? 8900 : idx === 2 ? 15600 : idx === 3 ? 4200 : idx === 4 ? 22000 : 3500);
    const advanceDate1 = new Date(invoice1Date);
    advanceDate1.setDate(invoice1Date.getDate() + 1); // Paid next day via instant
    const floatDays1 = Math.floor((invoice1Scheduled.getTime() - advanceDate1.getTime()) / (1000 * 60 * 60 * 24));
    const yieldRate1 = 5.50; // 5.50% APY
    const yield1 = amount1 * (floatDays1 / 365) * (yieldRate1 / 100);

    vendorInvoiceData.push({
      vendorId: vendor.id,
      organizationId: demoOrg.id,
      invoiceNumber: `INV-${vendor.name.substring(0, 3).toUpperCase()}-${1000 + idx}`,
      amount: amount1.toFixed(2),
      invoiceDate: invoice1Date,
      dueDate: invoice1Due,
      scheduledPaymentDate: invoice1Scheduled,
      paymentTerms: vendor.defaultPaymentTerms,
      status: "paid_instant" as const,
      paidDate: advanceDate1,
      advanceDate: advanceDate1,
      paidViaInstant: true,
      instantAdvanceAmount: amount1.toFixed(2),
      floatDurationDays: floatDays1,
      floatYieldRate: yieldRate1.toFixed(2),
      yieldGenerated: yield1.toFixed(2),
      description: `${vendor.category} services - ${invoice1Date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`,
    });

    // Invoice 2: Pending (awaiting instant payment decision)
    const invoice2Date = new Date(now2);
    invoice2Date.setDate(now2.getDate() - 5);
    const invoice2Due = new Date(invoice2Date);
    invoice2Due.setDate(invoice2Date.getDate() + termDays);
    const invoice2Scheduled = new Date(invoice2Due);

    const amount2 = (idx === 0 ? 9800 : idx === 1 ? 7200 : idx === 2 ? 18400 : idx === 3 ? 5100 : idx === 4 ? 19500 : 4800);

    vendorInvoiceData.push({
      vendorId: vendor.id,
      organizationId: demoOrg.id,
      invoiceNumber: `INV-${vendor.name.substring(0, 3).toUpperCase()}-${2000 + idx}`,
      amount: amount2.toFixed(2),
      invoiceDate: invoice2Date,
      dueDate: invoice2Due,
      scheduledPaymentDate: invoice2Scheduled,
      paymentTerms: vendor.defaultPaymentTerms,
      status: "pending" as const,
      paidDate: null,
      advanceDate: null,
      paidViaInstant: false,
      instantAdvanceAmount: null,
      floatDurationDays: null,
      floatYieldRate: null,
      yieldGenerated: null,
      description: `${vendor.category} services - ${invoice2Date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`,
    });
  });

  const seededInvoices = await db.insert(vendorInvoices).values(vendorInvoiceData).returning();
  console.log(`${seededInvoices.length} vendor invoices created (showcasing 3-9× yield multiplier vs rent float)!`);

  // Seed merchants for tenant transaction demo (1-3 day settlement float - 3rd yield source)
  console.log("Seeding merchants...");
  const merchantData = [
    { name: "Whole Foods Market", category: "Grocery" as const, settlementDays: 2, yieldRate: "5.50" },
    { name: "Target", category: "Retail" as const, settlementDays: 3, yieldRate: "5.50" },
    { name: "Chipotle Mexican Grill", category: "Dining" as const, settlementDays: 1, yieldRate: "5.50" },
    { name: "AMC Theatres", category: "Entertainment" as const, settlementDays: 2, yieldRate: "5.50" },
    { name: "Shell Gas Station", category: "Services" as const, settlementDays: 1, yieldRate: "5.50" },
    { name: "Starbucks", category: "Coffee" as const, settlementDays: 1, yieldRate: "5.50" },
    { name: "Amazon", category: "Retail" as const, settlementDays: 3, yieldRate: "5.50" },
    { name: "Uber", category: "Services" as const, settlementDays: 2, yieldRate: "5.50" },
  ];

  const seededMerchants = await db.insert(merchants).values(
    merchantData.map(m => ({
      organizationId: demoOrg.id,
      name: m.name,
      category: m.category,
      settlementDays: m.settlementDays,
      yieldRate: m.yieldRate,
      description: `${m.category} merchant accepting NUSD payments`,
      active: true,
    }))
  ).returning();

  console.log(`${seededMerchants.length} merchants created!`);

  // Seed merchant transactions for demo tenant (showcasing 1-3 day settlement float - shortest yield window)
  console.log("Seeding merchant transactions...");
  const demoTenant = createdTenants[0]; // Use first tenant for demo
  const now3 = new Date();
  const merchantTxData: any[] = [];

  seededMerchants.forEach((merchant, idx) => {
    // Transaction 1: Recent purchase (pending settlement)
    const tx1Date = new Date(now3);
    tx1Date.setDate(now3.getDate() - 2);
    const tx1Settlement = new Date(tx1Date);
    tx1Settlement.setDate(tx1Date.getDate() + merchant.settlementDays);
    const amount1 = idx === 0 ? 125.50 : idx === 1 ? 89.99 : idx === 2 ? 45.20 : idx === 3 ? 78.00 : idx === 4 ? 52.30 : idx === 5 ? 12.75 : idx === 6 ? 156.40 : 35.00;
    const yieldRate = parseFloat(merchant.yieldRate);
    const yield1 = amount1 * (merchant.settlementDays / 365) * (yieldRate / 100);
    const propertyShare1 = yield1 * 0.80; // 80% to property owner
    const tenantShare1 = yield1 * 0.125; // 12.5% to tenant
    const platformShare1 = yield1 * 0.075; // 7.5% to platform

    merchantTxData.push({
      merchantId: merchant.id,
      tenantId: demoTenant.id,
      organizationId: demoOrg.id,
      amount: amount1.toFixed(2),
      transactionDate: tx1Date,
      settlementDate: tx1Settlement,
      status: "pending" as const,
      settlementDays: merchant.settlementDays,
      yieldRate: merchant.yieldRate,
      yieldGenerated: yield1.toFixed(2),
      propertyYieldShare: propertyShare1.toFixed(2),
      tenantYieldShare: tenantShare1.toFixed(2),
      platformYieldShare: platformShare1.toFixed(2),
      description: `Purchase at ${merchant.name}`,
    });

    // Transaction 2: Older settled transaction
    if (idx < 5) { // Only create settled transactions for first 5 merchants
      const tx2Date = new Date(now3);
      tx2Date.setDate(now3.getDate() - 10);
      const tx2Settlement = new Date(tx2Date);
      tx2Settlement.setDate(tx2Date.getDate() + merchant.settlementDays);
      const tx2Settled = new Date(tx2Settlement);
      const amount2 = idx === 0 ? 215.80 : idx === 1 ? 142.30 : idx === 2 ? 68.50 : idx === 3 ? 95.00 : 28.40;
      const yield2 = amount2 * (merchant.settlementDays / 365) * (yieldRate / 100);
      const propertyShare2 = yield2 * 0.80; // 80% to property owner
      const tenantShare2 = yield2 * 0.125; // 12.5% to tenant
      const platformShare2 = yield2 * 0.075; // 7.5% to platform

      merchantTxData.push({
        merchantId: merchant.id,
        tenantId: demoTenant.id,
        organizationId: demoOrg.id,
        amount: amount2.toFixed(2),
        transactionDate: tx2Date,
        settlementDate: tx2Settlement,
        settledAt: tx2Settled,
        status: "settled" as const,
        settlementDays: merchant.settlementDays,
        yieldRate: merchant.yieldRate,
        yieldGenerated: yield2.toFixed(2),
        propertyYieldShare: propertyShare2.toFixed(2),
        tenantYieldShare: tenantShare2.toFixed(2),
        platformYieldShare: platformShare2.toFixed(2),
        description: `Purchase at ${merchant.name}`,
      });
    }
  });

  const seededMerchantTxs = await db.insert(merchantTransactions).values(merchantTxData).returning();
  console.log(`${seededMerchantTxs.length} merchant transactions created (showcasing 1-3 day settlement float)!`);

  // ============ Merchant Portal Demo User ============
  console.log("Seeding demo merchant user...");

  let merchantDemoUser = (await db.select().from(users).where(eq(users.email, "merchant@demo.com")))[0];
  if (!merchantDemoUser) {
    const hashedMerchantPassword = await bcrypt.hash("merchant123", 10);
    [merchantDemoUser] = await db.insert(users).values({
      email: "merchant@demo.com",
      password: hashedMerchantPassword,
      organizationId: null,
      role: "Merchant",
    }).returning();
  }

  const { merchantUserLinks } = await import("@shared/schema");
  const existingMerchantLinks = await db.select().from(merchantUserLinks).where(eq(merchantUserLinks.userId, merchantDemoUser.id));
  
  if (existingMerchantLinks.length === 0) {
    for (const m of seededMerchants.slice(0, 3)) {
      await db.insert(merchantUserLinks).values({
        userId: merchantDemoUser.id,
        merchantId: m.id,
      });
    }
    console.log("Created merchant_user_links for demo merchant");
  }

  const existingMerchantCode = await db.select().from(magicCodes)
    .where(eq(magicCodes.email, "merchant@demo.com"));
  
  if (existingMerchantCode.length === 0) {
    await db.insert(magicCodes).values({
      email: "merchant@demo.com",
      code: "222222",
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      used: false,
    });
    console.log("Created magic code for merchant demo user");
  }

  // Create identity for merchant demo user
  const [merchantIdentity] = await db.insert(identities).values({
    email: "merchant@demo.com",
    passwordHash: hashedPassword,
    displayName: "Local Brew Co",
    emailVerified: true,
  }).returning();

  const [merchantPersona] = await db.insert(identityPersonas).values({
    identityId: merchantIdentity.id,
    personaType: "merchant",
    orgId: null,
    roleDetail: "admin",
    isDefault: true,
    status: "active",
    label: "Merchant Portal",
  }).returning();

  // ============ Vendor Portal Demo User ============
  console.log("Seeding demo vendor user...");
  
  // Create vendor demo user (organizationId=null for cross-org access)
  let vendorDemoUser = (await db.select().from(users).where(eq(users.email, "vendor@demo.com")))[0];
  if (!vendorDemoUser) {
    const hashedVendorPassword = await bcrypt.hash("vendor123", 10);
    [vendorDemoUser] = await db.insert(users).values({
      email: "vendor@demo.com",
      password: hashedVendorPassword,
      organizationId: null, // Vendors can access multiple orgs via vendor_user_links
      role: "Vendor",
    }).returning();
  }

  // Create vendor_user_links to associate demo vendor user with seeded vendor records
  // Link to first 2 vendors (ABC Maintenance and City Power & Light)
  const { vendorUserLinks } = await import("@shared/schema");
  const existingLinks = await db.select().from(vendorUserLinks).where(eq(vendorUserLinks.userId, vendorDemoUser.id));
  
  if (existingLinks.length === 0) {
    // Insert vendor links one at a time to avoid type issues
    await db.insert(vendorUserLinks).values({
      userId: vendorDemoUser.id,
      vendorId: seededVendors[0].id, // ABC Maintenance Co.
    });
    await db.insert(vendorUserLinks).values({
      userId: vendorDemoUser.id,
      vendorId: seededVendors[1].id, // City Power & Light
    });
    console.log("Created vendor_user_links for demo vendor");
  }

  // Create vendor balances with NUSD (from instant payments received)
  const { vendorBalances } = await import("@shared/schema");
  const existingVendorBalances = await db.select().from(vendorBalances)
    .where(eq(vendorBalances.vendorId, seededVendors[0].id));
  
  if (existingVendorBalances.length === 0) {
    await db.insert(vendorBalances).values([
      {
        vendorId: seededVendors[0].id, // ABC Maintenance Co.
        organizationId: demoOrg.id,
        nusdBalance: "12500.00", // From instant payment received
        totalReceived: "25000.00",
        totalRedeemed: "12500.00",
      },
      {
        vendorId: seededVendors[1].id, // City Power & Light
        organizationId: demoOrg.id,
        nusdBalance: "8900.00",
        totalReceived: "17800.00",
        totalRedeemed: "8900.00",
      },
    ]);
    console.log("Created vendor balances with NUSD");
  }

  // Create magic code for vendor demo login
  const existingVendorCode = await db.select().from(magicCodes)
    .where(eq(magicCodes.email, "vendor@demo.com"));
  
  if (existingVendorCode.length === 0) {
    await db.insert(magicCodes).values({
      email: "vendor@demo.com",
      code: "111111",
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      used: false,
    });
    console.log("Created magic code for vendor demo user");
  }

  // Create identity for vendor demo user
  const [vendorIdentity] = await db.insert(identities).values({
    email: "vendor@demo.com",
    passwordHash: hashedPassword,
    displayName: "Mike's Plumbing",
    emailVerified: true,
  }).returning();

  const [vendorPersona] = await db.insert(identityPersonas).values({
    identityId: vendorIdentity.id,
    personaType: "vendor",
    orgId: null,
    roleDetail: "admin",
    isDefault: true,
    status: "active",
    label: "Vendor Portal",
  }).returning();

  // ====== MULTI-PERSONA DEMO USER ======
  // This user demonstrates the persona picker: same email is both a tenant AND vendor admin
  let multiUser = (await db.select().from(users).where(eq(users.email, "multi@demo.com")))[0];
  if (!multiUser) {
    [multiUser] = await db.insert(users).values({
      email: "multi@demo.com",
      password: hashedPassword,
      organizationId: demoOrg.id,
      role: "Tenant",
    }).returning();
  }

  await db.delete(magicCodes).where(eq(magicCodes.email, "multi@demo.com"));
  await db.insert(magicCodes).values({
    email: "multi@demo.com",
    code: "000000",
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    used: false,
  });

  const [multiIdentity] = await db.insert(identities).values({
    email: "multi@demo.com",
    passwordHash: hashedPassword,
    displayName: "Jane Smith",
    emailVerified: true,
  }).returning();

  // Jane as a tenant at Sunset Gardens
  const [multiTenantPersona] = await db.insert(identityPersonas).values({
    identityId: multiIdentity.id,
    personaType: "tenant",
    orgId: demoOrg.id,
    roleDetail: "primary",
    isDefault: true,
    status: "active",
    label: "Sunset Gardens · Unit SG-001",
  }).returning();

  // Jane also as a vendor admin
  await db.insert(identityPersonas).values({
    identityId: multiIdentity.id,
    personaType: "vendor",
    orgId: null,
    roleDetail: "admin",
    isDefault: false,
    status: "active",
    label: "Smith Maintenance LLC",
  });

  // Jane also as a Property Manager at a different org context
  await db.insert(identityPersonas).values({
    identityId: multiIdentity.id,
    personaType: "operator",
    orgId: demoOrg.id,
    roleDetail: "manager",
    isDefault: false,
    status: "active",
    label: "Naltos Demo Properties",
  });

  // ============ PHASE 3: SEED DATA ============
  console.log("Seeding Phase 3 data...");

  const {
    moveIns, moveOuts, moveChecklists,
    tenantMessages, announcements, tenantNotices, complaints,
    leasingApplications, applicantWaitlist,
    marketingListings, marketingLeads, marketingShowings,
    communityEvents, communityPrograms,
  } = await import("@shared/schema");

  const orgId = demoOrg.id;

  // Delete existing Phase 3 data for this org
  await db.delete(moveIns).where(eq(moveIns.organizationId, orgId));
  await db.delete(moveOuts).where(eq(moveOuts.organizationId, orgId));
  await db.delete(moveChecklists).where(eq(moveChecklists.organizationId, orgId));
  await db.delete(tenantMessages).where(eq(tenantMessages.organizationId, orgId));
  await db.delete(announcements).where(eq(announcements.organizationId, orgId));
  await db.delete(tenantNotices).where(eq(tenantNotices.organizationId, orgId));
  await db.delete(complaints).where(eq(complaints.organizationId, orgId));
  await db.delete(leasingApplications).where(eq(leasingApplications.organizationId, orgId));
  await db.delete(applicantWaitlist).where(eq(applicantWaitlist.organizationId, orgId));
  await db.delete(marketingListings).where(eq(marketingListings.organizationId, orgId));
  await db.delete(marketingLeads).where(eq(marketingLeads.organizationId, orgId));
  await db.delete(marketingShowings).where(eq(marketingShowings.organizationId, orgId));
  await db.delete(communityEvents).where(eq(communityEvents.organizationId, orgId));
  await db.delete(communityPrograms).where(eq(communityPrograms.organizationId, orgId));

  // === Move-Ins (8) ===
  await db.insert(moveIns).values([
    { organizationId: orgId, tenantName: "Alice Chen", unitNumber: "SG-015", moveInDate: new Date("2026-03-01"), checklistPercent: 100, keyStatus: "Issued", utilityStatus: "Connected", welcomePacket: true },
    { organizationId: orgId, tenantName: "Brian Foster", unitNumber: "HV-022", moveInDate: new Date("2026-03-05"), checklistPercent: 85, keyStatus: "Issued", utilityStatus: "Pending", welcomePacket: true },
    { organizationId: orgId, tenantName: "Carmen Rivera", unitNumber: "PR-008", moveInDate: new Date("2026-03-10"), checklistPercent: 60, keyStatus: "Pending", utilityStatus: "Pending", welcomePacket: false },
    { organizationId: orgId, tenantName: "Derek Wang", unitNumber: "MT-003", moveInDate: new Date("2026-03-12"), checklistPercent: 45, keyStatus: "Pending", utilityStatus: "Pending", welcomePacket: false },
    { organizationId: orgId, tenantName: "Elena Popov", unitNumber: "WC-018", moveInDate: new Date("2026-03-15"), checklistPercent: 30, keyStatus: "Pending", utilityStatus: "Not Started", welcomePacket: false },
    { organizationId: orgId, tenantName: "Frank Nguyen", unitNumber: "OF-005", moveInDate: new Date("2026-03-18"), checklistPercent: 20, keyStatus: "Pending", utilityStatus: "Not Started", welcomePacket: false },
    { organizationId: orgId, tenantName: "Grace Kim", unitNumber: "CR-002", moveInDate: new Date("2026-03-22"), checklistPercent: 10, keyStatus: "Pending", utilityStatus: "Not Started", welcomePacket: false },
    { organizationId: orgId, tenantName: "Henry Patel", unitNumber: "SG-042", moveInDate: new Date("2026-03-25"), checklistPercent: 0, keyStatus: "Pending", utilityStatus: "Not Started", welcomePacket: false },
  ]);
  console.log("8 move-ins seeded");

  // === Move-Outs (6) ===
  await db.insert(moveOuts).values([
    { organizationId: orgId, tenantName: "Irene Cooper", unitNumber: "SG-030", moveOutDate: new Date("2026-03-01"), inspectionStatus: "Completed", depositStatus: "Returned", forwardingAddress: true },
    { organizationId: orgId, tenantName: "Jake Morrison", unitNumber: "HV-011", moveOutDate: new Date("2026-03-08"), inspectionStatus: "Scheduled", depositStatus: "Processing", forwardingAddress: true },
    { organizationId: orgId, tenantName: "Karen Lee", unitNumber: "PR-019", moveOutDate: new Date("2026-03-15"), inspectionStatus: "Scheduled", depositStatus: "Pending", forwardingAddress: false },
    { organizationId: orgId, tenantName: "Leo Santos", unitNumber: "MT-010", moveOutDate: new Date("2026-03-20"), inspectionStatus: "Not Scheduled", depositStatus: "Pending", forwardingAddress: false },
    { organizationId: orgId, tenantName: "Mia Thompson", unitNumber: "WC-025", moveOutDate: new Date("2026-03-28"), inspectionStatus: "Not Scheduled", depositStatus: "Pending", forwardingAddress: false },
    { organizationId: orgId, tenantName: "Nolan Wright", unitNumber: "OF-012", moveOutDate: new Date("2026-04-01"), inspectionStatus: "Not Scheduled", depositStatus: "Pending", forwardingAddress: false },
  ]);
  console.log("6 move-outs seeded");

  // === Move Checklists (7) ===
  await db.insert(moveChecklists).values([
    { organizationId: orgId, name: "Standard Move-In Checklist", type: "Move-In", items: 24, completedUses: 142, compliance: 98 },
    { organizationId: orgId, name: "Standard Move-Out Checklist", type: "Move-Out", items: 18, completedUses: 128, compliance: 95 },
    { organizationId: orgId, name: "Pet-Friendly Move-In", type: "Move-In", items: 28, completedUses: 34, compliance: 100 },
    { organizationId: orgId, name: "Furnished Unit Move-In", type: "Move-In", items: 32, completedUses: 21, compliance: 97 },
    { organizationId: orgId, name: "Express Move-Out", type: "Move-Out", items: 12, completedUses: 56, compliance: 92 },
    { organizationId: orgId, name: "ADA Accessible Move-In", type: "Move-In", items: 30, completedUses: 8, compliance: 100 },
    { organizationId: orgId, name: "Corporate Relocation", type: "Move-In", items: 35, completedUses: 15, compliance: 96 },
  ]);
  console.log("7 move checklists seeded");

  // === Tenant Messages (10) ===
  await db.insert(tenantMessages).values([
    { organizationId: orgId, senderName: "John Smith 1", unitNumber: "SG-001", subject: "Parking spot question", preview: "Hi, I wanted to ask about the availability of covered parking...", sentAt: new Date("2026-02-20T09:15:00Z"), read: true, priority: false, category: "General" },
    { organizationId: orgId, senderName: "Emma Johnson 2", unitNumber: "HV-002", subject: "Lease renewal inquiry", preview: "My lease is coming up for renewal and I wanted to discuss...", sentAt: new Date("2026-02-20T10:30:00Z"), read: false, priority: true, category: "Lease" },
    { organizationId: orgId, senderName: "Michael Brown 3", unitNumber: "PR-003", subject: "Noise complaint follow-up", preview: "Following up on my previous noise complaint about unit PR-004...", sentAt: new Date("2026-02-19T14:00:00Z"), read: true, priority: false, category: "Complaint" },
    { organizationId: orgId, senderName: "Sarah Davis 4", unitNumber: "SG-004", subject: "Package delivery issue", preview: "I have been having trouble receiving packages at the front desk...", sentAt: new Date("2026-02-19T16:45:00Z"), read: false, priority: false, category: "General" },
    { organizationId: orgId, senderName: "James Wilson 5", unitNumber: "HV-005", subject: "Maintenance request update", preview: "Just wanted to check on the status of my kitchen faucet repair...", sentAt: new Date("2026-02-18T11:20:00Z"), read: true, priority: false, category: "Maintenance" },
    { organizationId: orgId, senderName: "Emily Martinez 6", unitNumber: "PR-006", subject: "Guest parking passes", preview: "I have family visiting this weekend and need additional parking...", sentAt: new Date("2026-02-18T08:00:00Z"), read: true, priority: false, category: "General" },
    { organizationId: orgId, senderName: "Robert Anderson 7", unitNumber: "MT-001", subject: "Water leak in bathroom", preview: "There is a leak under my bathroom sink that started this morning...", sentAt: new Date("2026-02-17T22:30:00Z"), read: false, priority: true, category: "Maintenance" },
    { organizationId: orgId, senderName: "Jessica Taylor 8", unitNumber: "WC-010", subject: "Community garden access", preview: "I would like to request a plot in the community garden...", sentAt: new Date("2026-02-17T13:15:00Z"), read: true, priority: false, category: "Community" },
    { organizationId: orgId, senderName: "William Thomas 9", unitNumber: "OF-003", subject: "AC not working properly", preview: "My air conditioning unit is making strange noises and not cooling...", sentAt: new Date("2026-02-16T15:45:00Z"), read: false, priority: true, category: "Maintenance" },
    { organizationId: orgId, senderName: "Ashley Garcia 10", unitNumber: "CR-001", subject: "Move-out date confirmation", preview: "I want to confirm my move-out date of March 31st as discussed...", sentAt: new Date("2026-02-16T10:00:00Z"), read: true, priority: false, category: "Lease" },
  ]);
  console.log("10 tenant messages seeded");

  // === Announcements (5) ===
  await db.insert(announcements).values([
    { organizationId: orgId, title: "Spring Maintenance Schedule", date: new Date("2026-02-15"), audience: "All Residents", sent: 290, read: 245, clicked: 180, status: "Delivered" },
    { organizationId: orgId, title: "Pool Opening Day - March 15th", date: new Date("2026-02-18"), audience: "All Residents", sent: 290, read: 210, clicked: 155, status: "Delivered" },
    { organizationId: orgId, title: "Parking Lot Resurfacing Notice", date: new Date("2026-02-20"), audience: "Sunset Gardens", sent: 80, read: 62, clicked: 45, status: "Delivered" },
    { organizationId: orgId, title: "Rent Payment Portal Upgrade", date: new Date("2026-02-21"), audience: "All Residents", sent: 290, read: 178, clicked: 120, status: "Delivered" },
    { organizationId: orgId, title: "Community BBQ Event - March 8th", date: new Date("2026-02-22"), audience: "All Residents", sent: 290, read: 195, clicked: 88, status: "Scheduled" },
  ]);
  console.log("5 announcements seeded");

  // === Tenant Notices (8) ===
  await db.insert(tenantNotices).values([
    { organizationId: orgId, tenantName: "John Smith 1", unitNumber: "SG-001", type: "Lease Renewal", sentDate: new Date("2026-02-01"), response: "Accepted", daysUntil: 0 },
    { organizationId: orgId, tenantName: "Emma Johnson 2", unitNumber: "HV-002", type: "Lease Renewal", sentDate: new Date("2026-02-05"), response: "Pending", daysUntil: 45 },
    { organizationId: orgId, tenantName: "Michael Brown 3", unitNumber: "PR-003", type: "Rent Increase", sentDate: new Date("2026-02-10"), response: "Acknowledged", daysUntil: 30 },
    { organizationId: orgId, tenantName: "Sarah Davis 4", unitNumber: "SG-004", type: "Violation Warning", sentDate: new Date("2026-02-12"), response: "Pending", daysUntil: 14 },
    { organizationId: orgId, tenantName: "James Wilson 5", unitNumber: "HV-005", type: "Lease Termination", sentDate: new Date("2026-01-15"), response: "Acknowledged", daysUntil: 0 },
    { organizationId: orgId, tenantName: "Emily Martinez 6", unitNumber: "PR-006", type: "Inspection Notice", sentDate: new Date("2026-02-18"), response: "Pending", daysUntil: 7 },
    { organizationId: orgId, tenantName: "Robert Anderson 7", unitNumber: "MT-001", type: "Late Payment", sentDate: new Date("2026-02-19"), response: "Pending", daysUntil: 5 },
    { organizationId: orgId, tenantName: "Jessica Taylor 8", unitNumber: "WC-010", type: "Lease Renewal", sentDate: new Date("2026-02-20"), response: "Pending", daysUntil: 60 },
  ]);
  console.log("8 tenant notices seeded");

  // === Complaints (7) ===
  await db.insert(complaints).values([
    { organizationId: orgId, complaintId: "CMP-001", tenantName: "Michael Brown 3", unitNumber: "PR-003", category: "Noise", severity: "Medium", status: "Open", openedAt: new Date("2026-02-18"), slaStatus: "Within SLA", aiResolution: "Noise monitoring scheduled for affected floor" },
    { organizationId: orgId, complaintId: "CMP-002", tenantName: "Robert Anderson 7", unitNumber: "MT-001", category: "Plumbing", severity: "High", status: "In Progress", openedAt: new Date("2026-02-17"), slaStatus: "Within SLA", aiResolution: "Plumber dispatched, ETA 2 hours" },
    { organizationId: orgId, complaintId: "CMP-003", tenantName: "Sarah Davis 4", unitNumber: "SG-004", category: "Pest Control", severity: "Medium", status: "Open", openedAt: new Date("2026-02-16"), slaStatus: "Approaching SLA", aiResolution: "Pest inspection scheduled for Feb 22" },
    { organizationId: orgId, complaintId: "CMP-004", tenantName: "William Thomas 9", unitNumber: "OF-003", category: "HVAC", severity: "High", status: "In Progress", openedAt: new Date("2026-02-15"), slaStatus: "Within SLA", aiResolution: "HVAC technician assigned, parts ordered" },
    { organizationId: orgId, complaintId: "CMP-005", tenantName: "Emma Johnson 2", unitNumber: "HV-002", category: "Parking", severity: "Low", status: "Resolved", openedAt: new Date("2026-02-10"), slaStatus: "Met", aiResolution: "Assigned new parking space HV-P22" },
    { organizationId: orgId, complaintId: "CMP-006", tenantName: "Ashley Garcia 10", unitNumber: "CR-001", category: "Security", severity: "High", status: "Open", openedAt: new Date("2026-02-19"), slaStatus: "Within SLA", aiResolution: "Security patrol increased, camera review in progress" },
    { organizationId: orgId, complaintId: "CMP-007", tenantName: "Jessica Taylor 8", unitNumber: "WC-010", category: "Common Areas", severity: "Low", status: "Resolved", openedAt: new Date("2026-02-08"), slaStatus: "Met", aiResolution: "Laundry room equipment serviced and repaired" },
  ]);
  console.log("7 complaints seeded");

  // === Leasing Applications (10 across pipeline stages) ===
  await db.insert(leasingApplications).values([
    { organizationId: orgId, applicantName: "Olivia Turner", unitNumber: "SG-050", submittedAt: new Date("2026-02-20"), incomeRatio: "3.20", risk: "Low", missingDocs: 0, stage: "Decision", creditScore: 780, criminal: "Clear", eviction: "None", incomeVerified: "Verified", referencesStatus: "Positive", recommendation: "Approve", confidence: "0.95", approved: true, leaseStart: new Date("2026-03-01"), depositStatus: "Paid", welcomePacket: true, keyPickup: "Scheduled", moveInInspection: "Scheduled" },
    { organizationId: orgId, applicantName: "Patrick Hayes", unitNumber: "HV-035", submittedAt: new Date("2026-02-19"), incomeRatio: "2.80", risk: "Medium", missingDocs: 0, stage: "Decision", creditScore: 720, criminal: "Clear", eviction: "None", incomeVerified: "Verified", referencesStatus: "Positive", recommendation: "Approve", confidence: "0.88", approved: true, leaseStart: new Date("2026-03-15"), depositStatus: "Pending", welcomePacket: false, keyPickup: "Not Scheduled", moveInInspection: "Not Scheduled" },
    { organizationId: orgId, applicantName: "Quinn Adams", unitNumber: "PR-025", submittedAt: new Date("2026-02-18"), incomeRatio: "2.50", risk: "Medium", missingDocs: 0, stage: "Under Review", creditScore: 680, criminal: "Clear", eviction: "None", incomeVerified: "Verified", referencesStatus: "Pending" },
    { organizationId: orgId, applicantName: "Rachel Brooks", unitNumber: "MT-015", submittedAt: new Date("2026-02-17"), incomeRatio: "3.50", risk: "Low", missingDocs: 0, stage: "Under Review", creditScore: 750, criminal: "Clear", eviction: "None", incomeVerified: "Verified", referencesStatus: "In Progress" },
    { organizationId: orgId, applicantName: "Samuel Chen", unitNumber: "WC-020", submittedAt: new Date("2026-02-16"), incomeRatio: "2.90", risk: "Low", missingDocs: 0, stage: "Screening", creditScore: 740 },
    { organizationId: orgId, applicantName: "Tanya Romero", unitNumber: "OF-008", submittedAt: new Date("2026-02-15"), incomeRatio: "2.60", risk: "Medium", missingDocs: 0, stage: "Screening" },
    { organizationId: orgId, applicantName: "Umar Farouk", unitNumber: "CR-006", submittedAt: new Date("2026-02-14"), incomeRatio: "3.10", risk: "Low", missingDocs: 1, stage: "Documents Pending" },
    { organizationId: orgId, applicantName: "Violet Park", unitNumber: "SG-060", submittedAt: new Date("2026-02-13"), incomeRatio: "2.40", risk: "High", missingDocs: 2, stage: "Documents Pending" },
    { organizationId: orgId, applicantName: "Wesley Grant", unitNumber: "HV-045", submittedAt: new Date("2026-02-21"), stage: "Submitted", missingDocs: 0 },
    { organizationId: orgId, applicantName: "Xena Liu", unitNumber: "PR-030", submittedAt: new Date("2026-02-21"), stage: "Submitted", missingDocs: 0 },
  ]);
  console.log("10 leasing applications seeded");

  // === Applicant Waitlist (6) ===
  await db.insert(applicantWaitlist).values([
    { organizationId: orgId, applicantName: "Yolanda Martinez", unitType: "2BR/2BA", dateAdded: new Date("2026-01-15"), position: 1, contact: "Email", notes: "Prefers Sunset Gardens property" },
    { organizationId: orgId, applicantName: "Zachary Thompson", unitType: "1BR/1BA", dateAdded: new Date("2026-01-20"), position: 2, contact: "Phone", notes: "Needs ground floor for accessibility" },
    { organizationId: orgId, applicantName: "Abigail Moore", unitType: "Studio", dateAdded: new Date("2026-01-25"), position: 3, contact: "Email", notes: "Student, flexible on location" },
    { organizationId: orgId, applicantName: "Benjamin Clark", unitType: "3BR/2BA", dateAdded: new Date("2026-02-01"), position: 4, contact: "Phone", notes: "Family of four, pet-friendly required" },
    { organizationId: orgId, applicantName: "Charlotte Hill", unitType: "2BR/1BA", dateAdded: new Date("2026-02-08"), position: 5, contact: "Email", notes: "Corporate relocation, urgent timeline" },
    { organizationId: orgId, applicantName: "Daniel Ross", unitType: "1BR/1BA", dateAdded: new Date("2026-02-15"), position: 6, contact: "Text", notes: "Prefers Harbor View location" },
  ]);
  console.log("6 waitlist entries seeded");

  // === Marketing Listings (6) ===
  await db.insert(marketingListings).values([
    { organizationId: orgId, unitNumber: "SG-055", beds: "2BR/2BA", baths: 2, sqft: 1050, rent: "2450.00", daysOnMarket: 5, views: 342, inquiries: 18, status: "Active", channels: ["Zillow", "Apartments.com", "Website"], aiScore: 85 },
    { organizationId: orgId, unitNumber: "HV-040", beds: "1BR/1BA", baths: 1, sqft: 720, rent: "1850.00", daysOnMarket: 12, views: 567, inquiries: 24, status: "Active", channels: ["Zillow", "Apartments.com", "Craigslist", "Website"], aiScore: 78 },
    { organizationId: orgId, unitNumber: "PR-035", beds: "Studio", baths: 1, sqft: 480, rent: "1350.00", daysOnMarket: 3, views: 189, inquiries: 8, status: "Active", channels: ["Apartments.com", "Website"], aiScore: 92 },
    { organizationId: orgId, unitNumber: "MT-020", beds: "3BR/2BA", baths: 2, sqft: 1400, rent: "3200.00", daysOnMarket: 21, views: 423, inquiries: 12, status: "Active", channels: ["Zillow", "Realtor.com", "Website"], aiScore: 65 },
    { organizationId: orgId, unitNumber: "WC-030", beds: "2BR/1BA", baths: 1, sqft: 900, rent: "1950.00", daysOnMarket: 8, views: 298, inquiries: 15, status: "Active", channels: ["Zillow", "Apartments.com", "Website"], aiScore: 80 },
    { organizationId: orgId, unitNumber: "OF-015", beds: "1BR/1BA", baths: 1, sqft: 650, rent: "2100.00", daysOnMarket: 15, views: 156, inquiries: 6, status: "Pending", channels: ["Website"], aiScore: 55 },
  ]);
  console.log("6 marketing listings seeded");

  // === Marketing Leads (12) ===
  await db.insert(marketingLeads).values([
    { organizationId: orgId, name: "Amanda Foster", source: "Zillow", unitNumber: "SG-055", status: "Tour Scheduled", score: 90, lastContact: "Today", followUp: "Tomorrow 2pm showing", priority: true },
    { organizationId: orgId, name: "Brandon Lee", source: "Apartments.com", unitNumber: "HV-040", status: "Application Sent", score: 85, lastContact: "Yesterday", followUp: "Follow up on application", priority: true },
    { organizationId: orgId, name: "Christina Yang", source: "Website", unitNumber: "PR-035", status: "New", score: 75, lastContact: "Today", followUp: "Initial contact call", priority: false },
    { organizationId: orgId, name: "David Kim", source: "Referral", unitNumber: "MT-020", status: "Tour Completed", score: 80, lastContact: "2 days ago", followUp: "Send application link", priority: true },
    { organizationId: orgId, name: "Elena Vasquez", source: "Craigslist", unitNumber: "HV-040", status: "New", score: 65, lastContact: "Today", followUp: "Schedule showing", priority: false },
    { organizationId: orgId, name: "Felix Okafor", source: "Zillow", unitNumber: "WC-030", status: "Tour Scheduled", score: 88, lastContact: "Yesterday", followUp: "Friday 10am showing", priority: true },
    { organizationId: orgId, name: "Georgia Patel", source: "Website", unitNumber: "SG-055", status: "Contacted", score: 70, lastContact: "3 days ago", followUp: "Second follow-up call", priority: false },
    { organizationId: orgId, name: "Hassan Ali", source: "Apartments.com", unitNumber: "MT-020", status: "New", score: 60, lastContact: "Today", followUp: "Email property details", priority: false },
    { organizationId: orgId, name: "Isabelle Roux", source: "Realtor.com", unitNumber: "OF-015", status: "Contacted", score: 55, lastContact: "4 days ago", followUp: "Check interest level", priority: false },
    { organizationId: orgId, name: "Jordan Blake", source: "Referral", unitNumber: "PR-035", status: "Tour Completed", score: 92, lastContact: "Yesterday", followUp: "Application follow-up", priority: true },
    { organizationId: orgId, name: "Kyra Simmons", source: "Website", unitNumber: "WC-030", status: "Contacted", score: 72, lastContact: "2 days ago", followUp: "Schedule virtual tour", priority: false },
    { organizationId: orgId, name: "Liam Chen", source: "Zillow", unitNumber: "SG-055", status: "New", score: 68, lastContact: "Today", followUp: "Initial response email", priority: false },
  ]);
  console.log("12 marketing leads seeded");

  // === Marketing Showings (8) ===
  await db.insert(marketingShowings).values([
    { organizationId: orgId, showingDate: "2026-02-22 10:00 AM", unitNumber: "SG-055", leadName: "Amanda Foster", agent: "Lisa Park", status: "Confirmed", notes: "Very interested in 2BR units" },
    { organizationId: orgId, showingDate: "2026-02-22 2:00 PM", unitNumber: "WC-030", leadName: "Felix Okafor", agent: "Lisa Park", status: "Confirmed", notes: "Relocating from out of state" },
    { organizationId: orgId, showingDate: "2026-02-23 11:00 AM", unitNumber: "HV-040", leadName: "Elena Vasquez", agent: "Mark Torres", status: "Scheduled", notes: "First-time renter" },
    { organizationId: orgId, showingDate: "2026-02-23 3:00 PM", unitNumber: "MT-020", leadName: "Hassan Ali", agent: "Mark Torres", status: "Scheduled" },
    { organizationId: orgId, showingDate: "2026-02-20 10:00 AM", unitNumber: "PR-035", leadName: "Jordan Blake", agent: "Lisa Park", status: "Completed", feedback: "Loved the studio layout, ready to apply" },
    { organizationId: orgId, showingDate: "2026-02-19 2:00 PM", unitNumber: "MT-020", leadName: "David Kim", agent: "Mark Torres", status: "Completed", feedback: "Wants to discuss parking options" },
    { organizationId: orgId, showingDate: "2026-02-18 11:00 AM", unitNumber: "SG-055", leadName: "Georgia Patel", agent: "Lisa Park", status: "Completed", feedback: "Comparing with other properties" },
    { organizationId: orgId, showingDate: "2026-02-24 10:00 AM", unitNumber: "OF-015", leadName: "Isabelle Roux", agent: "Mark Torres", status: "Scheduled", notes: "Requested virtual option" },
  ]);
  console.log("8 marketing showings seeded");

  // === Community Events (16: 8 upcoming + 8 past) ===
  await db.insert(communityEvents).values([
    // 8 upcoming events
    { organizationId: orgId, name: "Community BBQ & Welcome Party", eventDate: "2026-03-08", location: "Main Courtyard", category: "Social", rsvps: 65, capacity: 100, organizer: "Community Team", budget: "$800", status: "Confirmed", isPast: false },
    { organizationId: orgId, name: "Spring Yoga in the Park", eventDate: "2026-03-12", location: "Garden Area", category: "Wellness", rsvps: 28, capacity: 40, organizer: "Wellness Committee", budget: "$200", status: "Confirmed", isPast: false },
    { organizationId: orgId, name: "Financial Literacy Workshop", eventDate: "2026-03-15", location: "Community Room A", category: "Education", rsvps: 18, capacity: 30, organizer: "Naltos Team", budget: "$150", status: "Planning", isPast: false },
    { organizationId: orgId, name: "Kids Movie Night", eventDate: "2026-03-20", location: "Clubhouse", category: "Family", rsvps: 42, capacity: 60, organizer: "Family Events Team", budget: "$300", status: "Confirmed", isPast: false },
    { organizationId: orgId, name: "Pet Adoption Fair", eventDate: "2026-03-25", location: "Parking Lot B", category: "Community", rsvps: 35, capacity: 80, organizer: "Local Shelter Partnership", budget: "$500", status: "Planning", isPast: false },
    { organizationId: orgId, name: "Maintenance Q&A Town Hall", eventDate: "2026-03-28", location: "Community Room B", category: "Information", rsvps: 22, capacity: 50, organizer: "Property Management", budget: "$100", status: "Confirmed", isPast: false },
    { organizationId: orgId, name: "Spring Cleaning Supply Drive", eventDate: "2026-04-01", location: "Lobby", category: "Community", rsvps: 15, capacity: 200, organizer: "Volunteer Committee", budget: "$250", status: "Planning", isPast: false },
    { organizationId: orgId, name: "Outdoor Movie Night", eventDate: "2026-04-05", location: "Pool Deck", category: "Social", rsvps: 55, capacity: 80, organizer: "Social Committee", budget: "$450", status: "Planning", isPast: false },
    // 8 past events
    { organizationId: orgId, name: "New Year's Celebration", eventDate: "2026-01-01", location: "Main Courtyard", category: "Social", rsvps: 120, capacity: 150, organizer: "Community Team", budget: "$1,200", status: "Completed", isPast: true, attendance: 98, satisfaction: "4.8", photos: 45, feedback: "Excellent turnout and great atmosphere" },
    { organizationId: orgId, name: "Winter Wellness Workshop", eventDate: "2026-01-15", location: "Community Room A", category: "Wellness", rsvps: 25, capacity: 30, organizer: "Wellness Committee", budget: "$180", status: "Completed", isPast: true, attendance: 22, satisfaction: "4.5", photos: 12, feedback: "Residents appreciated the meditation session" },
    { organizationId: orgId, name: "Super Bowl Watch Party", eventDate: "2026-02-08", location: "Clubhouse", category: "Social", rsvps: 80, capacity: 100, organizer: "Social Committee", budget: "$600", status: "Completed", isPast: true, attendance: 72, satisfaction: "4.7", photos: 30, feedback: "Great food and big screen setup" },
    { organizationId: orgId, name: "Valentine's Day Mixer", eventDate: "2026-02-14", location: "Pool Deck", category: "Social", rsvps: 45, capacity: 60, organizer: "Social Committee", budget: "$400", status: "Completed", isPast: true, attendance: 38, satisfaction: "4.3", photos: 22, feedback: "Nice decorations, could use more seating" },
    { organizationId: orgId, name: "Tax Prep Seminar", eventDate: "2026-02-01", location: "Community Room B", category: "Education", rsvps: 35, capacity: 40, organizer: "Naltos Team", budget: "$200", status: "Completed", isPast: true, attendance: 30, satisfaction: "4.6", photos: 8, feedback: "Very helpful, residents requested follow-up session" },
    { organizationId: orgId, name: "Resident Appreciation Lunch", eventDate: "2026-01-25", location: "Main Courtyard", category: "Social", rsvps: 90, capacity: 120, organizer: "Property Management", budget: "$900", status: "Completed", isPast: true, attendance: 85, satisfaction: "4.9", photos: 38, feedback: "Huge success, best attended event this quarter" },
    { organizationId: orgId, name: "Safety & Emergency Prep", eventDate: "2026-01-10", location: "Community Room A", category: "Information", rsvps: 40, capacity: 50, organizer: "Safety Officer", budget: "$100", status: "Completed", isPast: true, attendance: 35, satisfaction: "4.4", photos: 5, feedback: "Important info shared about fire safety and earthquake prep" },
    { organizationId: orgId, name: "Holiday Cookie Exchange", eventDate: "2025-12-20", location: "Clubhouse", category: "Social", rsvps: 55, capacity: 70, organizer: "Community Team", budget: "$250", status: "Completed", isPast: true, attendance: 48, satisfaction: "4.7", photos: 28, feedback: "Wonderful community bonding event" },
  ]);
  console.log("16 community events seeded (8 upcoming + 8 past)");

  // === Community Programs (7) ===
  await db.insert(communityPrograms).values([
    { organizationId: orgId, name: "Book Club", iconKey: "BookOpen", members: 18, frequency: "Bi-weekly", nextMeeting: "2026-03-05", organizer: "Maria Lopez", active: true },
    { organizationId: orgId, name: "Garden Committee", iconKey: "Flower2", members: 12, frequency: "Weekly", nextMeeting: "2026-02-28", organizer: "Tom Green", active: true },
    { organizationId: orgId, name: "Walking Group", iconKey: "Footprints", members: 24, frequency: "Daily", nextMeeting: "Tomorrow 7am", organizer: "Sarah Kim", active: true },
    { organizationId: orgId, name: "Game Night", iconKey: "Gamepad2", members: 32, frequency: "Weekly", nextMeeting: "2026-02-27", organizer: "Alex Rivera", active: true },
    { organizationId: orgId, name: "Cooking Class", iconKey: "ChefHat", members: 15, frequency: "Monthly", nextMeeting: "2026-03-10", organizer: "Chef Paolo", active: true },
    { organizationId: orgId, name: "Tech Help Desk", iconKey: "Monitor", members: 8, frequency: "Weekly", nextMeeting: "2026-02-26", organizer: "James Wu", active: true },
    { organizationId: orgId, name: "Sustainability Club", iconKey: "Leaf", members: 20, frequency: "Monthly", nextMeeting: "2026-03-15", organizer: "Eco Team", active: true },
  ]);
  console.log("7 community programs seeded");

  // === Phase 4: Parking Seed Data ===
  await db.delete(parkingSpaceAssignments).where(eq(parkingSpaceAssignments.organizationId, orgId));
  await db.delete(parkingPermits).where(eq(parkingPermits.organizationId, orgId));
  await db.delete(parkingViolations).where(eq(parkingViolations.organizationId, orgId));
  await db.delete(parkingTowingLog).where(eq(parkingTowingLog.organizationId, orgId));
  await db.delete(parkingGarageAccess).where(eq(parkingGarageAccess.organizationId, orgId));

  await db.insert(parkingSpaceAssignments).values([
    { organizationId: orgId, space: "A-101", type: "Covered", tenant: "Sarah Chen", unit: "4B", vehicle: "2023 Tesla Model 3 (Silver)", plate: "7ABC123", monthly: "$150", expires: "Dec 31, 2026" },
    { organizationId: orgId, space: "A-102", type: "Covered", tenant: "James Wilson", unit: "2A", vehicle: "2022 Honda Accord (Black)", plate: "8DEF456", monthly: "$150", expires: "Dec 31, 2026" },
    { organizationId: orgId, space: "B-205", type: "Uncovered", tenant: "Maria Santos", unit: "6C", vehicle: "2021 Toyota RAV4 (White)", plate: "3GHI789", monthly: "$75", expires: "Jun 30, 2026" },
    { organizationId: orgId, space: "G-012", type: "Garage", tenant: "Robert Kim", unit: "8A", vehicle: "2024 BMW X5 (Blue)", plate: "9JKL012", monthly: "$225", expires: "Dec 31, 2026" },
    { organizationId: orgId, space: "R-001", type: "Reserved", tenant: "Property Manager", unit: "Office", vehicle: "2023 Ford Explorer (Gray)", plate: "MGMT01", monthly: "$0", expires: "N/A" },
    { organizationId: orgId, space: "B-310", type: "Uncovered", tenant: "Emily Davis", unit: "5D", vehicle: "2020 Subaru Outback (Green)", plate: "4MNO345", monthly: "$75", expires: "Mar 31, 2026" },
    { organizationId: orgId, space: "G-015", type: "Garage", tenant: "Michael Brown", unit: "3C", vehicle: "2022 Audi Q7 (Black)", plate: "5PQR678", monthly: "$225", expires: "Dec 31, 2026" },
  ]);
  console.log("7 parking space assignments seeded");

  await db.insert(parkingPermits).values([
    { organizationId: orgId, permitId: "PRK-2401", type: "Resident", vehicle: "2023 Tesla Model 3", plate: "7ABC123", unit: "4B", issued: "Jan 1, 2026", expires: "Dec 31, 2026", status: "Active" },
    { organizationId: orgId, permitId: "PRK-2402", type: "Visitor", vehicle: "2019 Honda Civic (Red)", plate: "VIS-001", unit: "4B", issued: "Feb 18, 2026", expires: "Feb 21, 2026", status: "Expiring" },
    { organizationId: orgId, permitId: "PRK-2403", type: "Contractor", vehicle: "2022 Ford Transit (White)", plate: "CTR-100", unit: "N/A", issued: "Feb 15, 2026", expires: "Feb 28, 2026", status: "Active" },
    { organizationId: orgId, permitId: "PRK-2404", type: "Temporary", vehicle: "2024 U-Haul Truck", plate: "UHL-999", unit: "7A", issued: "Feb 20, 2026", expires: "Feb 22, 2026", status: "Active" },
    { organizationId: orgId, permitId: "PRK-2405", type: "Resident", vehicle: "2021 Hyundai Sonata", plate: "6STU901", unit: "9B", issued: "Jan 1, 2026", expires: "Dec 31, 2026", status: "Active" },
    { organizationId: orgId, permitId: "PRK-2406", type: "Visitor", vehicle: "2020 Chevy Malibu (Gray)", plate: "VIS-002", unit: "2A", issued: "Feb 10, 2026", expires: "Feb 13, 2026", status: "Expired" },
  ]);
  console.log("6 parking permits seeded");

  await db.insert(parkingViolations).values([
    { organizationId: orgId, violationId: "VIO-001", date: "Feb 20, 2026", space: "B-220", plate: "ABC-1234", type: "Unauthorized", fine: "$75", status: "Open", notes: "Red sedan parked without permit" },
    { organizationId: orgId, violationId: "VIO-002", date: "Feb 19, 2026", space: "A-105", plate: "XYZ-5678", type: "Expired Permit", fine: "$50", status: "Warning Issued", notes: "Blue SUV with expired permit" },
    { organizationId: orgId, violationId: "VIO-003", date: "Feb 18, 2026", space: "G-008", plate: "DEF-9012", type: "Wrong Space", fine: "$50", status: "Resolved", notes: "White truck in wrong assigned space" },
    { organizationId: orgId, violationId: "VIO-004", date: "Feb 17, 2026", space: "B-301", plate: "Unknown", type: "Abandoned", fine: "$100", status: "Tow Scheduled", notes: "Gray sedan abandoned 7+ days" },
    { organizationId: orgId, violationId: "VIO-005", date: "Feb 16, 2026", space: "R-003", plate: "GHI-3456", type: "Unauthorized", fine: "$75", status: "Open", notes: "Black coupe in reserved space" },
  ]);
  console.log("5 parking violations seeded");

  await db.insert(parkingTowingLog).values([
    { organizationId: orgId, towId: "TOW-001", date: "Feb 17, 2026", plate: "Unknown", space: "B-301", reason: "Abandoned 7+ days", company: "Metro Towing", status: "Completed", cost: "$185" },
    { organizationId: orgId, towId: "TOW-002", date: "Feb 14, 2026", plate: "JKL-7890", space: "A-110", reason: "Unauthorized parking", company: "Metro Towing", status: "Completed", cost: "$185" },
    { organizationId: orgId, towId: "TOW-003", date: "Feb 10, 2026", plate: "MNO-1234", space: "Fire Lane", reason: "Fire lane violation", company: "Quick Tow LLC", status: "Completed", cost: "$225" },
    { organizationId: orgId, towId: "TOW-004", date: "Feb 8, 2026", plate: "PQR-5678", space: "B-215", reason: "Expired permit (30+ days)", company: "Metro Towing", status: "Disputed", cost: "$185" },
    { organizationId: orgId, towId: "TOW-005", date: "Feb 5, 2026", plate: "STU-9012", space: "HC-002", reason: "Handicap violation", company: "Quick Tow LLC", status: "Completed", cost: "$350" },
  ]);
  console.log("5 parking towing log entries seeded");

  await db.insert(parkingGarageAccess).values([
    { organizationId: orgId, device: "GAR-001", location: "Main Gate - Entry", status: "Online", lastPing: "Feb 21, 10:32 AM", battery: 95, firmware: "v3.2.1" },
    { organizationId: orgId, device: "GAR-002", location: "Main Gate - Exit", status: "Online", lastPing: "Feb 21, 10:30 AM", battery: 88, firmware: "v3.2.1" },
    { organizationId: orgId, device: "GAR-003", location: "Level 2 Entry", status: "Online", lastPing: "Feb 21, 10:28 AM", battery: 72, firmware: "v3.1.0" },
    { organizationId: orgId, device: "GAR-004", location: "Level 3 Entry", status: "Offline", lastPing: "Feb 19, 5:30 PM", battery: 15, firmware: "v3.0.2" },
    { organizationId: orgId, device: "GAR-005", location: "Visitor Lot Gate", status: "Online", lastPing: "Feb 21, 9:45 AM", battery: 60, firmware: "v3.2.1" },
    { organizationId: orgId, device: "GAR-006", location: "Emergency Exit", status: "Online", lastPing: "Feb 21, 7:00 AM", battery: 82, firmware: "v3.2.1" },
  ]);
  console.log("6 parking garage access devices seeded");

  console.log("Phase 3 seeding complete!");

  // ====== PHASE 4: SAFETY SEED DATA ======
  await db.delete(incidentReports).where(eq(incidentReports.organizationId, orgId));
  await db.delete(patrolLogs).where(eq(patrolLogs.organizationId, orgId));
  await db.delete(cameraSystems).where(eq(cameraSystems.organizationId, orgId));
  await db.delete(fireSafety).where(eq(fireSafety.organizationId, orgId));

  await db.insert(incidentReports).values([
    { organizationId: orgId, incidentId: "INC-301", date: "Feb 19, 2026", type: "Theft", location: "Parking Garage B2", severity: "High", reportedBy: "R. Martinez", status: "Open", description: "Catalytic converter theft reported on Level B2. Vehicle owner discovered the damage at approximately 7:30 PM." },
    { organizationId: orgId, incidentId: "INC-300", date: "Feb 18, 2026", type: "Vandalism", location: "Building A Lobby", severity: "Medium", reportedBy: "Front Desk", status: "Investigating", description: "Graffiti found on lobby wall near mailboxes. Appears to have occurred overnight." },
    { organizationId: orgId, incidentId: "INC-299", date: "Feb 17, 2026", type: "Noise", location: "Unit 5C", severity: "Low", reportedBy: "T. Johnson", status: "Resolved", description: "Noise complaint from multiple neighbors regarding loud music after quiet hours." },
    { organizationId: orgId, incidentId: "INC-298", date: "Feb 16, 2026", type: "Trespass", location: "Pool Area", severity: "High", reportedBy: "Camera Alert", status: "Investigating", description: "Unauthorized access to pool area after hours detected via security camera." },
    { organizationId: orgId, incidentId: "INC-297", date: "Feb 15, 2026", type: "Medical", location: "Unit 8A", severity: "Critical", reportedBy: "K. Williams", status: "Closed", description: "Resident experienced chest pains. EMS dispatched and transported to hospital." },
    { organizationId: orgId, incidentId: "INC-296", date: "Feb 14, 2026", type: "Fire Alarm", location: "Building B Floor 3", severity: "High", reportedBy: "System Alert", status: "Resolved", description: "Fire alarm triggered by cooking smoke. Fire department responded, false alarm confirmed." },
    { organizationId: orgId, incidentId: "INC-295", date: "Feb 13, 2026", type: "Suspicious Activity", location: "Parking Garage B1", severity: "Medium", reportedBy: "M. Garcia", status: "Closed", description: "Suspicious individual observed loitering near vehicles. Identified as delivery driver." },
  ]);
  console.log("7 incident reports seeded");

  await db.insert(patrolLogs).values([
    { organizationId: orgId, patrolId: "PAT-101", date: "Feb 21, 2026", officer: "Officer Chen", route: "Perimeter Loop", startTime: "10:00 PM", endTime: "10:45 PM", findings: "All clear", status: "Completed" },
    { organizationId: orgId, patrolId: "PAT-100", date: "Feb 21, 2026", officer: "Officer Patel", route: "Interior Sweep", startTime: "6:00 PM", endTime: "6:55 PM", findings: "Broken light in B stairwell", status: "Completed" },
    { organizationId: orgId, patrolId: "PAT-099", date: "Feb 21, 2026", officer: "Officer Davis", route: "Night Watch", startTime: "2:00 AM", endTime: "3:00 AM", findings: "All clear", status: "Completed" },
    { organizationId: orgId, patrolId: "PAT-098", date: "Feb 20, 2026", officer: "Officer Chen", route: "Perimeter Loop", startTime: "10:00 PM", endTime: "10:50 PM", findings: "Unlocked gate at pool", status: "Completed" },
    { organizationId: orgId, patrolId: "PAT-097", date: "Feb 20, 2026", officer: "Officer Patel", route: "Interior Sweep", startTime: "6:00 PM", endTime: "6:48 PM", findings: "All clear", status: "Completed" },
    { organizationId: orgId, patrolId: "PAT-096", date: "Feb 20, 2026", officer: "Officer Davis", route: "Night Watch", startTime: "2:00 AM", endTime: "3:05 AM", findings: "Suspicious vehicle reported, verified resident guest", status: "Completed" },
  ]);
  console.log("6 patrol logs seeded");

  await db.insert(cameraSystems).values([
    { organizationId: orgId, cameraId: "CAM-001", location: "Main Entrance", type: "PTZ", status: "Online", resolution: "4K", storage: "30 days", lastMaintenance: "Jan 15, 2026", coverage: 95 },
    { organizationId: orgId, cameraId: "CAM-002", location: "Parking Garage B1", type: "Fixed", status: "Online", resolution: "1080p", storage: "30 days", lastMaintenance: "Jan 15, 2026", coverage: 85 },
    { organizationId: orgId, cameraId: "CAM-003", location: "Parking Garage B2", type: "Fixed", status: "Offline", resolution: "1080p", storage: "0 days", lastMaintenance: "Dec 20, 2025", coverage: 0 },
    { organizationId: orgId, cameraId: "CAM-004", location: "Pool Area", type: "Dome", status: "Online", resolution: "1080p", storage: "30 days", lastMaintenance: "Jan 20, 2026", coverage: 90 },
    { organizationId: orgId, cameraId: "CAM-005", location: "Building A Lobby", type: "PTZ", status: "Online", resolution: "4K", storage: "30 days", lastMaintenance: "Jan 15, 2026", coverage: 98 },
    { organizationId: orgId, cameraId: "CAM-006", location: "Building B Lobby", type: "PTZ", status: "Maintenance", resolution: "4K", storage: "15 days", lastMaintenance: "Feb 10, 2026", coverage: 0 },
    { organizationId: orgId, cameraId: "CAM-007", location: "Rear Exit", type: "Fixed", status: "Online", resolution: "1080p", storage: "30 days", lastMaintenance: "Jan 18, 2026", coverage: 80 },
  ]);
  console.log("7 camera systems seeded");

  await db.insert(fireSafety).values([
    { organizationId: orgId, system: "Extinguisher", location: "Building A Floor 1", lastInspection: "Nov 10, 2025", nextInspection: "May 10, 2026", status: "Active", compliance: "Compliant", notes: "All extinguishers fully charged and accessible" },
    { organizationId: orgId, system: "Sprinkler", location: "Building A", lastInspection: "Sep 15, 2025", nextInspection: "Mar 15, 2026", status: "Active", compliance: "Compliant", notes: "Annual flow test passed" },
    { organizationId: orgId, system: "Alarm", location: "Building B", lastInspection: "Oct 1, 2025", nextInspection: "Apr 1, 2026", status: "Active", compliance: "Compliant", notes: "All detectors operational" },
    { organizationId: orgId, system: "Exit Sign", location: "Building A Floor 3", lastInspection: "Jan 5, 2026", nextInspection: "Jul 5, 2026", status: "Active", compliance: "Compliant", notes: "Battery backup tested" },
    { organizationId: orgId, system: "Standpipe", location: "Building B", lastInspection: "Aug 20, 2025", nextInspection: "Feb 20, 2026", status: "Needs Repair", compliance: "Non-Compliant", notes: "Pressure test failed, repair scheduled" },
    { organizationId: orgId, system: "Extinguisher", location: "Parking Garage", lastInspection: "Dec 1, 2025", nextInspection: "Jun 1, 2026", status: "Active", compliance: "Compliant", notes: "All units inspected and tagged" },
    { organizationId: orgId, system: "Sprinkler", location: "Building B", lastInspection: "Jul 10, 2025", nextInspection: "Jan 10, 2026", status: "Overdue", compliance: "Non-Compliant", notes: "Inspection overdue, scheduling in progress" },
  ]);
  console.log("7 fire safety records seeded");

  console.log("Phase 4 safety seeding complete!");

  console.log("Database seeded successfully!");
  console.log(`- Organization: ${demoOrg.name}`);
  console.log(`- Demo business user: demo@naltos.com (code: 000000)`);
  console.log(`- Demo tenant user: tenant@demo.com (code: 000000)`);
  console.log(`- Demo vendor user: vendor@demo.com (code: 111111)`);
  console.log(`- Demo merchant user: merchant@demo.com (code: 222222)`);
  console.log(`- Properties: 3`);
  console.log(`- Units: 200`);
  console.log(`- Leases: 120`);
  console.log(`- Invoices: 300`);
  console.log(`- Payments: 220`);
  console.log(`- Vendors: ${seededVendors.length}`);
  console.log(`- Vendor invoices: ${seededInvoices.length}`);
  console.log(`- Multi-persona demo: multi@demo.com (code: 000000) - has 3 personas`);
}
