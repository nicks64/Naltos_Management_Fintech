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
  vendors,
  vendorInvoices,
  merchants,
  merchantTransactions,
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
  
  // Delete crypto data (transactions first, then wallets)
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
    { name: "Target", category: "Shopping" as const, settlementDays: 3, yieldRate: "5.50" },
    { name: "Chipotle Mexican Grill", category: "Restaurants" as const, settlementDays: 1, yieldRate: "5.50" },
    { name: "AMC Theatres", category: "Entertainment" as const, settlementDays: 2, yieldRate: "5.50" },
    { name: "Shell Gas Station", category: "Services" as const, settlementDays: 1, yieldRate: "5.50" },
    { name: "Starbucks", category: "Restaurants" as const, settlementDays: 1, yieldRate: "5.50" },
    { name: "Amazon", category: "Shopping" as const, settlementDays: 3, yieldRate: "5.50" },
    { name: "Uber", category: "Transportation" as const, settlementDays: 2, yieldRate: "5.50" },
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
}
