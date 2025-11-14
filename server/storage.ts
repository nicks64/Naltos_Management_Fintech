// Reference: blueprint:javascript_database
import {
  users,
  organizations,
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
  auditLogs,
  cryptoWallets,
  cryptoTransactions,
  vendors,
  vendorInvoices,
  type User,
  type InsertUser,
  type Organization,
  type InsertOrganization,
  type Property,
  type TreasuryProduct,
  type TreasurySubscription,
  type InsertTreasurySubscription,
  type OrganizationSettings,
  type InsertOrganizationSettings,
  type BankLedger,
  type Payment,
  type Invoice,
  type Lease,
  type Tenant,
  type Unit,
  type MagicCode,
  type InsertMagicCode,
  type CryptoWallet,
  type InsertCryptoWallet,
  type CryptoTransaction,
  type InsertCryptoTransaction,
  type Vendor,
  type VendorInvoice,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, lt, gte, sql, sum, inArray, isNotNull } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Organization methods
  getOrganization(id: string): Promise<Organization | undefined>;
  createOrganization(org: InsertOrganization): Promise<Organization>;

  // Magic code methods
  createMagicCode(code: InsertMagicCode): Promise<MagicCode>;
  getMagicCode(email: string, code: string): Promise<MagicCode | undefined>;
  markMagicCodeUsed(id: string): Promise<void>;

  // KPI methods
  getKPIs(organizationId: string): Promise<any>;

  // Collections methods
  getCollections(organizationId: string): Promise<any[]>;

  // Reconciliation methods
  getReconciliation(organizationId: string): Promise<any>;
  approveMatch(bankEntryId: string, paymentId: string): Promise<void>;

  // Treasury methods
  getTreasuryProducts(): Promise<TreasuryProduct[]>;
  getTreasurySubscriptions(organizationId: string): Promise<TreasurySubscription[]>;
  createOrUpdateSubscription(subscription: InsertTreasurySubscription): Promise<TreasurySubscription>;
  updateSubscriptionBalance(subscriptionId: string, newBalance: string): Promise<void>;
  toggleAutoRoll(subscriptionId: string, autoRoll: boolean): Promise<void>;

  // Settings methods
  getSettings(organizationId: string): Promise<OrganizationSettings | undefined>;
  updateSettings(organizationId: string, settings: Partial<InsertOrganizationSettings>): Promise<void>;
  getOrgUsers(organizationId: string): Promise<User[]>;
  updateOrganization(id: string, name: string): Promise<void>;

  // Reports methods
  getReports(organizationId: string): Promise<any>;

  // Crypto wallet methods
  getCryptoWallets(organizationId: string, tenantId?: string): Promise<CryptoWallet[]>;
  getCryptoWallet(organizationId: string, coin: CryptoWallet['coin'], tenantId?: string): Promise<CryptoWallet | undefined>;
  convertCrypto(params: {
    organizationId: string;
    tenantId?: string;
    fromCoin: CryptoWallet['coin'];
    toCoin: CryptoWallet['coin'];
    amount: string;
    exchangeRate: string;
  }): Promise<{
    fromWallet: CryptoWallet;
    toWallet: CryptoWallet;
    transaction: CryptoTransaction;
  }>;
  convertToUsd(params: {
    organizationId: string;
    tenantId?: string;
    coin: CryptoWallet['coin'];
    amount: string;
    exchangeRate: string;
    fee: string;
  }): Promise<{
    wallet: CryptoWallet;
    transaction: CryptoTransaction;
  }>;
  getCryptoTransactions(organizationId: string, tenantId?: string, limit?: number): Promise<CryptoTransaction[]>;

  // Rent Float Treasury methods
  getRentFloatData(organizationId: string): Promise<{
    config: OrganizationSettings;
    totalFloat: string;
    averageDuration: number;
    monthlyYield: string;
    ownerShare: string;
    tenantShare: string;
    naltosShare: string;
    recentPayments: Array<{
      id: string;
      amount: string;
      paidAt: string; // ISO string
      daysInFloat: number;
      yieldGenerated: string;
    }>;
  }>;

  // Vendor Instant Payment methods
  getVendors(organizationId: string): Promise<Vendor[]>;
  getVendorInvoices(organizationId: string, filters?: { status?: string }): Promise<(VendorInvoice & { vendorName: string })[]>;
  payVendorInstant(invoiceId: string): Promise<VendorInvoice>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getOrganization(id: string): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.id, id));
    return org || undefined;
  }

  async createOrganization(insertOrg: InsertOrganization): Promise<Organization> {
    const [org] = await db.insert(organizations).values(insertOrg).returning();
    return org;
  }

  async createMagicCode(insertCode: InsertMagicCode): Promise<MagicCode> {
    const [code] = await db.insert(magicCodes).values(insertCode).returning();
    return code;
  }

  async getMagicCode(email: string, code: string): Promise<MagicCode | undefined> {
    const [magicCode] = await db
      .select()
      .from(magicCodes)
      .where(and(eq(magicCodes.email, email), eq(magicCodes.code, code), eq(magicCodes.used, false)));
    return magicCode || undefined;
  }

  async markMagicCodeUsed(id: string): Promise<void> {
    await db.update(magicCodes).set({ used: true }).where(eq(magicCodes.id, id));
  }

  async getKPIs(organizationId: string): Promise<any> {
    // Calculate KPIs from real data
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get all invoices for the org
    const orgProps = await db.select().from(properties).where(eq(properties.organizationId, organizationId));
    const propIds = orgProps.map(p => p.id);

    // Get units for these properties
    const orgUnits = propIds.length > 0 
      ? await db.select().from(units).where(inArray(units.propertyId, propIds))
      : [];
    const unitIds = orgUnits.map(u => u.id);

    // Get leases for these units
    const orgLeases = unitIds.length > 0
      ? await db.select().from(leases).where(inArray(leases.unitId, unitIds))
      : [];
    const leaseIds = orgLeases.map(l => l.id);

    // Get invoices for these leases in the last 30 days
    const recentInvoices = leaseIds.length > 0
      ? await db
          .select()
          .from(invoices)
          .where(and(inArray(invoices.leaseId, leaseIds), gte(invoices.dueDate, thirtyDaysAgo)))
      : [];

    // Calculate On-Time %
    const paidOnTime = recentInvoices.filter(inv => inv.status === "paid" && inv.paidDate && inv.paidDate <= inv.dueDate).length;
    const totalDue = recentInvoices.length;
    const onTimePercent = totalDue > 0 ? (paidOnTime / totalDue) * 100 : 0;

    // Calculate DSO
    const paidInvoices = recentInvoices.filter(inv => inv.status === "paid" && inv.paidDate);
    let totalDays = 0;
    paidInvoices.forEach(inv => {
      if (inv.paidDate) {
        const days = Math.floor((inv.paidDate.getTime() - inv.dueDate.getTime()) / (24 * 60 * 60 * 1000));
        totalDays += Math.max(0, days);
      }
    });
    const dso = paidInvoices.length > 0 ? totalDays / paidInvoices.length : 0;

    // Calculate Delinquent Amount
    const overdueInvoices = leaseIds.length > 0
      ? await db
          .select()
          .from(invoices)
          .where(and(inArray(invoices.leaseId, leaseIds), eq(invoices.status, "overdue")))
      : [];
    const delinquentAmount = overdueInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);

    // Calculate Opex/Unit
    const totalOpex = orgProps.reduce((sum, prop) => sum + parseFloat(prop.monthlyOpex), 0);
    const totalUnits = orgProps.reduce((sum, prop) => sum + prop.unitCount, 0);
    const opexPerUnit = totalUnits > 0 ? totalOpex / totalUnits : 0;

    // Calculate Treasury AUM
    const subs = await db.select().from(treasurySubscriptions).where(eq(treasurySubscriptions.organizationId, organizationId));
    const treasuryAUM = subs.reduce((sum, sub) => sum + parseFloat(sub.balance), 0);

    // Calculate weighted current yield
    const products = await db.select().from(treasuryProducts);
    let weightedYield = 0;
    if (treasuryAUM > 0) {
      for (const sub of subs) {
        const product = products.find(p => p.id === sub.productId);
        if (product) {
          const weight = parseFloat(sub.balance) / treasuryAUM;
          weightedYield += parseFloat(product.currentYield) * weight;
        }
      }
    }

    // Calculate Vendor Float Metrics
    const allVendorInvoices = await db.select().from(vendorInvoices).where(eq(vendorInvoices.organizationId, organizationId));
    
    // Total vendor float AUM (all paid_instant invoices currently in float)
    const paidInstantInvoices = allVendorInvoices.filter(inv => inv.status === "paid_instant");
    const vendorFloatAUM = paidInstantInvoices.reduce((sum, inv) => {
      return sum + (inv.instantAdvanceAmount ? parseFloat(inv.instantAdvanceAmount) : 0);
    }, 0);
    
    // Total vendor yield generated (all-time)
    const vendorFloatYield = allVendorInvoices
      .filter(inv => inv.yieldGenerated)
      .reduce((sum, inv) => sum + parseFloat(inv.yieldGenerated!), 0);
    
    // Active vendor invoices count (currently in float period)
    const activeVendorInvoices = paidInstantInvoices.length;

    // Calculate Rent Float Yield (last 30 days)
    const config = await this.getSettings(organizationId);
    const rentFloatDuration = config?.rentFloatDefaultDuration || 10;
    const rentFloatYieldRate = parseFloat(config?.rentFloatYieldRate || "5.50") / 100;
    
    // Get recent payments (last 30 days) to calculate rent float yield
    const recentPayments = paidInvoices.filter(inv => {
      return inv.paidDate && inv.paidDate >= thirtyDaysAgo;
    });
    
    const rentFloatYield = recentPayments.reduce((sum, inv) => {
      const amount = parseFloat(inv.amount);
      const yieldForPayment = amount * (rentFloatDuration / 365) * rentFloatYieldRate;
      return sum + yieldForPayment;
    }, 0);
    
    // Combined total yield across all sources (monthly for rent + all-time for vendor + treasury AUM * yield rate)
    const combinedTotalYield = rentFloatYield + vendorFloatYield + (treasuryAUM * weightedYield / 100 / 12);

    // Generate sparkline data (mock for now)
    const sparklineData = Array.from({ length: 30 }, (_, i) => ({
      value: 85 + Math.random() * 10,
    }));

    return {
      onTimePercent,
      dso,
      delinquentAmount,
      opexPerUnit,
      treasuryAUM,
      currentYield: weightedYield,
      vendorFloatAUM,
      vendorFloatYield,
      activeVendorInvoices,
      rentFloatYield,
      combinedTotalYield,
      sparklineData,
    };
  }

  async getCollections(organizationId: string): Promise<any[]> {
    // Get properties for this org
    const orgProps = await db.select().from(properties).where(eq(properties.organizationId, organizationId));
    const propIds = orgProps.map(p => p.id);

    // Get units
    const orgUnits = propIds.length > 0
      ? await db.select().from(units).where(inArray(units.propertyId, propIds))
      : [];
    const unitIds = orgUnits.map(u => u.id);

    // Get leases
    const orgLeases = unitIds.length > 0
      ? await db.select().from(leases).where(inArray(leases.unitId, unitIds))
      : [];
    const leaseIds = orgLeases.map(l => l.id);

    // Get tenants
    const allTenants = await db.select().from(tenants).where(eq(tenants.organizationId, organizationId));

    // Get overdue and upcoming invoices
    const now = new Date();
    const collections = leaseIds.length > 0
      ? await db
          .select()
          .from(invoices)
          .where(and(inArray(invoices.leaseId, leaseIds), sql`${invoices.status} != 'paid'`))
          .orderBy(invoices.dueDate)
      : [];

    // Map to collection items
    const items = await Promise.all(collections.map(async (invoice) => {
      const lease = orgLeases.find(l => l.id === invoice.leaseId);
      if (!lease) return null;

      const unit = orgUnits.find(u => u.id === lease.unitId);
      const tenant = allTenants.find(t => t.id === lease.tenantId);

      const daysPastDue = Math.max(0, Math.floor((now.getTime() - invoice.dueDate.getTime()) / (24 * 60 * 60 * 1000)));

      return {
        id: invoice.id,
        tenantName: tenant?.name || "Unknown",
        unitNumber: unit?.unitNumber || "Unknown",
        amountDue: parseFloat(invoice.amount),
        dueDate: invoice.dueDate.toISOString(),
        status: invoice.status,
        daysPastDue: daysPastDue > 0 ? daysPastDue : undefined,
      };
    }));

    return items.filter(Boolean);
  }

  async getReconciliation(organizationId: string): Promise<any> {
    // Get bank ledger entries
    const bankEntries = await db
      .select()
      .from(bankLedger)
      .where(eq(bankLedger.organizationId, organizationId))
      .orderBy(desc(bankLedger.date));

    // Get payments for this org
    const orgProps = await db.select().from(properties).where(eq(properties.organizationId, organizationId));
    const propIds = orgProps.map(p => p.id);
    const orgUnits = propIds.length > 0
      ? await db.select().from(units).where(inArray(units.propertyId, propIds))
      : [];
    const unitIds = orgUnits.map(u => u.id);
    const orgLeases = unitIds.length > 0
      ? await db.select().from(leases).where(inArray(leases.unitId, unitIds))
      : [];
    const leaseIds = orgLeases.map(l => l.id);
    const orgInvoices = leaseIds.length > 0
      ? await db.select().from(invoices).where(inArray(invoices.leaseId, leaseIds))
      : [];
    const invoiceIds = orgInvoices.map(i => i.id);

    const paymentEntries = invoiceIds.length > 0
      ? await db
          .select()
          .from(payments)
          .where(inArray(payments.invoiceId, invoiceIds))
          .orderBy(desc(payments.paymentDate))
      : [];

    // Generate match suggestions (simple algorithm)
    const unmatchedBank = bankEntries.filter(b => !b.matched);
    const suggestions = [];

    for (const bankEntry of unmatchedBank.slice(0, 5)) {
      // Find payments with similar amounts
      const bankAmount = parseFloat(bankEntry.amount);
      for (const payment of paymentEntries) {
        const paymentAmount = parseFloat(payment.amount);
        const diff = Math.abs(bankAmount - paymentAmount);
        if (diff < 5) {
          // Within $5
          const confidence = 1 - (diff / 5);
          suggestions.push({
            bankEntryId: bankEntry.id,
            paymentId: payment.id,
            confidence,
            amount: bankAmount,
          });
          break;
        }
      }
    }

    // Calculate hours saved (mock)
    const matchedCount = bankEntries.filter(b => b.matched).length;
    const hoursSaved = matchedCount * 0.5; // 30 minutes per match

    return {
      bankLedger: bankEntries.map(b => ({
        id: b.id,
        date: b.date.toISOString(),
        description: b.description,
        amount: parseFloat(b.amount),
        matched: b.matched,
      })),
      paymentLedger: paymentEntries.map(p => ({
        id: p.id,
        date: p.paymentDate.toISOString(),
        description: `Payment - ${p.method}`,
        amount: parseFloat(p.amount),
        matched: false,
      })),
      suggestions,
      hoursSaved,
    };
  }

  async approveMatch(bankEntryId: string, paymentId: string): Promise<void> {
    await db.update(bankLedger).set({ matched: true, matchedPaymentId: paymentId }).where(eq(bankLedger.id, bankEntryId));
  }

  async getTreasuryProducts(): Promise<TreasuryProduct[]> {
    return await db.select().from(treasuryProducts);
  }

  async getTreasurySubscriptions(organizationId: string): Promise<TreasurySubscription[]> {
    return await db.select().from(treasurySubscriptions).where(eq(treasurySubscriptions.organizationId, organizationId));
  }

  async createOrUpdateSubscription(insertSub: InsertTreasurySubscription): Promise<TreasurySubscription> {
    // Check if subscription exists
    const [existing] = await db
      .select()
      .from(treasurySubscriptions)
      .where(and(eq(treasurySubscriptions.organizationId, insertSub.organizationId), eq(treasurySubscriptions.productId, insertSub.productId)));

    if (existing) {
      // Update balance
      const newBalance = (parseFloat(existing.balance) + parseFloat(insertSub.balance || "0")).toFixed(2);
      const [updated] = await db
        .update(treasurySubscriptions)
        .set({ balance: newBalance })
        .where(eq(treasurySubscriptions.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new
      const [sub] = await db.insert(treasurySubscriptions).values(insertSub).returning();
      return sub;
    }
  }

  async updateSubscriptionBalance(subscriptionId: string, newBalance: string): Promise<void> {
    await db.update(treasurySubscriptions).set({ balance: newBalance }).where(eq(treasurySubscriptions.id, subscriptionId));
  }

  async toggleAutoRoll(subscriptionId: string, autoRoll: boolean): Promise<void> {
    await db.update(treasurySubscriptions).set({ autoRoll }).where(eq(treasurySubscriptions.id, subscriptionId));
  }

  async getSettings(organizationId: string): Promise<OrganizationSettings | undefined> {
    const [settings] = await db.select().from(organizationSettings).where(eq(organizationSettings.organizationId, organizationId));
    return settings || undefined;
  }

  async updateSettings(organizationId: string, updates: Partial<InsertOrganizationSettings>): Promise<void> {
    const existing = await this.getSettings(organizationId);
    if (existing) {
      await db.update(organizationSettings).set(updates).where(eq(organizationSettings.organizationId, organizationId));
    } else {
      await db.insert(organizationSettings).values({ organizationId, ...updates });
    }
  }

  async getOrgUsers(organizationId: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.organizationId, organizationId));
  }

  async updateOrganization(id: string, name: string): Promise<void> {
    await db.update(organizations).set({ name }).where(eq(organizations.id, id));
  }

  async getReports(organizationId: string): Promise<any> {
    // Mock report data
    return {
      delinquencyAging: [
        { bucket: "0-30 days", count: 15, amount: 12000 },
        { bucket: "31-60 days", count: 8, amount: 6400 },
        { bucket: "61-90 days", count: 5, amount: 4000 },
        { bucket: "90+ days", count: 3, amount: 2400 },
      ],
      noiTrend: [
        { month: "Jan", noi: 125000 },
        { month: "Feb", noi: 128000 },
        { month: "Mar", noi: 132000 },
        { month: "Apr", noi: 135000 },
        { month: "May", noi: 138000 },
        { month: "Jun", noi: 142000 },
      ],
      opexPerUnit: [
        { property: "Sunset Gardens", opex: 600 },
        { property: "Harbor View", opex: 800 },
        { property: "Parkside Residences", opex: 700 },
      ],
      treasuryYield: [
        { month: "Jan", yield: 5.1, tbillRate: 4.9 },
        { month: "Feb", yield: 5.2, tbillRate: 5.0 },
        { month: "Mar", yield: 5.3, tbillRate: 5.1 },
        { month: "Apr", yield: 5.4, tbillRate: 5.2 },
        { month: "May", yield: 5.5, tbillRate: 5.3 },
        { month: "Jun", yield: 5.6, tbillRate: 5.4 },
      ],
    };
  }

  // Crypto wallet methods
  async getCryptoWallets(organizationId: string, tenantId?: string): Promise<CryptoWallet[]> {
    const conditions = tenantId
      ? and(eq(cryptoWallets.organizationId, organizationId), eq(cryptoWallets.tenantId, tenantId))
      : and(eq(cryptoWallets.organizationId, organizationId), sql`${cryptoWallets.tenantId} IS NULL`);
    
    return await db.select().from(cryptoWallets).where(conditions);
  }

  async getCryptoWallet(organizationId: string, coin: CryptoWallet['coin'], tenantId?: string): Promise<CryptoWallet | undefined> {
    let conditions;
    if (tenantId) {
      conditions = and(
        eq(cryptoWallets.organizationId, organizationId),
        eq(cryptoWallets.coin, coin),
        eq(cryptoWallets.tenantId, tenantId)
      );
    } else {
      conditions = and(
        eq(cryptoWallets.organizationId, organizationId),
        eq(cryptoWallets.coin, coin),
        sql`${cryptoWallets.tenantId} IS NULL`
      );
    }
    
    const [wallet] = await db.select().from(cryptoWallets).where(conditions);
    return wallet || undefined;
  }

  async convertCrypto(params: {
    organizationId: string;
    tenantId?: string;
    fromCoin: CryptoWallet['coin'];
    toCoin: CryptoWallet['coin'];
    amount: string;
    exchangeRate: string;
  }): Promise<{
    fromWallet: CryptoWallet;
    toWallet: CryptoWallet;
    transaction: CryptoTransaction;
  }> {
    return await db.transaction(async (tx) => {
      // Build conditions for from wallet
      let fromConditions;
      if (params.tenantId) {
        fromConditions = and(
          eq(cryptoWallets.organizationId, params.organizationId),
          eq(cryptoWallets.coin, params.fromCoin),
          eq(cryptoWallets.tenantId, params.tenantId)
        );
      } else {
        fromConditions = and(
          eq(cryptoWallets.organizationId, params.organizationId),
          eq(cryptoWallets.coin, params.fromCoin),
          sql`${cryptoWallets.tenantId} IS NULL`
        );
      }

      // Build conditions for to wallet
      let toConditions;
      if (params.tenantId) {
        toConditions = and(
          eq(cryptoWallets.organizationId, params.organizationId),
          eq(cryptoWallets.coin, params.toCoin),
          eq(cryptoWallets.tenantId, params.tenantId)
        );
      } else {
        toConditions = and(
          eq(cryptoWallets.organizationId, params.organizationId),
          eq(cryptoWallets.coin, params.toCoin),
          sql`${cryptoWallets.tenantId} IS NULL`
        );
      }

      // Get both wallets using transaction client
      const [fromWallet] = await tx.select().from(cryptoWallets).where(fromConditions);
      const [toWallet] = await tx.select().from(cryptoWallets).where(toConditions);

      if (!fromWallet || !toWallet) {
        throw new Error("One or both wallets not found");
      }

      // Validate sufficient balance
      const currentBalance = parseFloat(fromWallet.balance);
      const convertAmount = parseFloat(params.amount);
      
      if (currentBalance < convertAmount) {
        throw new Error("Insufficient balance");
      }

      // Calculate conversion
      const exchangeRate = parseFloat(params.exchangeRate);
      const convertedAmount = convertAmount * exchangeRate;
      const fee = convertAmount * 0.001; // 0.1% fee
      const finalToAmount = convertedAmount - fee;

      // Update balances
      const [updatedFromWallet] = await tx
        .update(cryptoWallets)
        .set({ balance: (currentBalance - convertAmount).toFixed(8) })
        .where(eq(cryptoWallets.id, fromWallet.id))
        .returning();

      const [updatedToWallet] = await tx
        .update(cryptoWallets)
        .set({ balance: (parseFloat(toWallet.balance) + finalToAmount).toFixed(8) })
        .where(eq(cryptoWallets.id, toWallet.id))
        .returning();

      // Create transaction record
      const [transaction] = await tx
        .insert(cryptoTransactions)
        .values({
          walletId: fromWallet.id,
          transactionType: "conversion",
          fromCoin: params.fromCoin,
          toCoin: params.toCoin,
          amount: params.amount,
          usdValue: convertAmount.toFixed(2),
          exchangeRate: params.exchangeRate,
          status: "completed",
          txHash: `0x${Math.random().toString(16).substring(2, 66)}`,
        })
        .returning();

      return {
        fromWallet: updatedFromWallet,
        toWallet: updatedToWallet,
        transaction,
      };
    });
  }

  async convertToUsd(params: {
    organizationId: string;
    tenantId?: string;
    coin: CryptoWallet['coin'];
    amount: string;
    exchangeRate: string;
    fee: string;
  }): Promise<{
    wallet: CryptoWallet;
    transaction: CryptoTransaction;
  }> {
    return await db.transaction(async (tx) => {
      // Build conditions for wallet
      let conditions;
      if (params.tenantId) {
        conditions = and(
          eq(cryptoWallets.organizationId, params.organizationId),
          eq(cryptoWallets.coin, params.coin),
          eq(cryptoWallets.tenantId, params.tenantId)
        );
      } else {
        conditions = and(
          eq(cryptoWallets.organizationId, params.organizationId),
          eq(cryptoWallets.coin, params.coin),
          sql`${cryptoWallets.tenantId} IS NULL`
        );
      }

      // Get wallet using transaction client
      const [wallet] = await tx.select().from(cryptoWallets).where(conditions);

      if (!wallet) {
        throw new Error("Wallet not found");
      }

      // Validate sufficient balance
      const currentBalance = parseFloat(wallet.balance);
      const withdrawAmount = parseFloat(params.amount);
      
      if (currentBalance < withdrawAmount) {
        throw new Error("Insufficient balance");
      }

      // Update balance
      const [updatedWallet] = await tx
        .update(cryptoWallets)
        .set({ balance: (currentBalance - withdrawAmount).toFixed(8) })
        .where(eq(cryptoWallets.id, wallet.id))
        .returning();

      // Calculate USD value after fee
      const exchangeRate = parseFloat(params.exchangeRate);
      const feeAmount = parseFloat(params.fee);
      const usdValue = (withdrawAmount * exchangeRate) - feeAmount;

      // Create transaction record
      const [transaction] = await tx
        .insert(cryptoTransactions)
        .values({
          walletId: wallet.id,
          transactionType: "withdrawal",
          fromCoin: params.coin,
          amount: params.amount,
          usdValue: usdValue.toFixed(2),
          exchangeRate: params.exchangeRate,
          status: "completed",
          txHash: `0x${Math.random().toString(16).substring(2, 66)}`,
        })
        .returning();

      return {
        wallet: updatedWallet,
        transaction,
      };
    });
  }

  async getCryptoTransactions(organizationId: string, tenantId?: string, limit: number = 50): Promise<CryptoTransaction[]> {
    // Get all wallets for this org/tenant
    const wallets = await this.getCryptoWallets(organizationId, tenantId);
    const walletIds = wallets.map(w => w.id);

    if (walletIds.length === 0) {
      return [];
    }

    return await db
      .select()
      .from(cryptoTransactions)
      .where(inArray(cryptoTransactions.walletId, walletIds))
      .orderBy(desc(cryptoTransactions.createdAt))
      .limit(limit);
  }

  async getRentFloatData(organizationId: string): Promise<{
    config: OrganizationSettings;
    totalFloat: string;
    averageDuration: number;
    monthlyYield: string;
    ownerShare: string;
    tenantShare: string;
    naltosShare: string;
    recentPayments: Array<{
      id: string;
      amount: string;
      paidAt: string; // ISO string
      daysInFloat: number;
      yieldGenerated: string;
    }>;
  }> {
    // Get rent float configuration
    const config = await this.getSettings(organizationId);
    if (!config) {
      throw new Error("Organization settings not found");
    }

    // Get recent payments (last 30 days) to simulate rent float
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Query all payments for this organization
    const allOrgPayments = await db
      .select()
      .from(payments)
      .innerJoin(invoices, eq(payments.invoiceId, invoices.id))
      .innerJoin(leases, eq(invoices.leaseId, leases.id))
      .innerJoin(units, eq(leases.unitId, units.id))
      .innerJoin(properties, eq(units.propertyId, properties.id))
      .where(eq(properties.organizationId, organizationId));

    // Filter for recent payments with valid paymentDate and sort
    const orgPayments = allOrgPayments
      .filter((row) => {
        const paymentDate = row.payments.paymentDate;
        return paymentDate && new Date(paymentDate) >= thirtyDaysAgo;
      })
      .sort((a, b) => {
        const dateA = a.payments.paymentDate ? new Date(a.payments.paymentDate).getTime() : 0;
        const dateB = b.payments.paymentDate ? new Date(b.payments.paymentDate).getTime() : 0;
        return dateB - dateA; // desc order
      });

    // Calculate metrics
    const defaultDuration = config.rentFloatDefaultDuration || 10;
    const yieldRate = parseFloat(config.rentFloatYieldRate || "5.50") / 100; // Convert to decimal
    
    let totalFloat = 0;
    let totalDays = 0;
    const processedPayments = orgPayments.map((row) => {
      const payment = row.payments;
      const amount = parseFloat(payment.amount);
      const daysInFloat = defaultDuration; // Use default duration for simplicity
      
      // Calculate yield for this payment: principal * (days/365) * annualRate
      const yieldGenerated = amount * (daysInFloat / 365) * yieldRate;
      
      totalFloat += amount;
      totalDays += daysInFloat;
      
      return {
        id: payment.id,
        amount: payment.amount,
        paidAt: payment.paymentDate!.toISOString(),
        daysInFloat,
        yieldGenerated: yieldGenerated.toFixed(2),
      };
    });

    const averageDuration = processedPayments.length > 0 
      ? Math.round(totalDays / processedPayments.length) 
      : defaultDuration;

    // Calculate total monthly yield
    const monthlyYield = processedPayments.reduce(
      (sum, p) => sum + parseFloat(p.yieldGenerated), 
      0
    );

    // Normalize yield shares (architect guidance: shares should sum to 100%)
    const ownerSharePct = parseFloat(config.rentFloatOwnerShare || "3.00");
    const tenantSharePct = parseFloat(config.rentFloatTenantShare || "1.25");
    const naltosSharePct = parseFloat(config.rentFloatNaltosShare || "0.75");
    const totalSharePct = ownerSharePct + tenantSharePct + naltosSharePct;

    // Distribute monthly yield proportionally - normalize each share by total
    const ownerShare = totalSharePct > 0 ? (monthlyYield * ownerSharePct / totalSharePct) : 0;
    const tenantShare = totalSharePct > 0 ? (monthlyYield * tenantSharePct / totalSharePct) : 0;
    const naltosShare = totalSharePct > 0 ? (monthlyYield * naltosSharePct / totalSharePct) : 0;

    return {
      config,
      totalFloat: totalFloat.toFixed(2),
      averageDuration,
      monthlyYield: monthlyYield.toFixed(2),
      ownerShare: ownerShare.toFixed(2),
      tenantShare: tenantShare.toFixed(2),
      naltosShare: naltosShare.toFixed(2),
      recentPayments: processedPayments,
    };
  }

  async getVendors(organizationId: string): Promise<Vendor[]> {
    return await db
      .select()
      .from(vendors)
      .where(eq(vendors.organizationId, organizationId))
      .orderBy(vendors.name);
  }

  async getVendorInvoices(
    organizationId: string, 
    filters?: { status?: string }
  ): Promise<(VendorInvoice & { vendorName: string })[]> {
    let query = db
      .select({
        id: vendorInvoices.id,
        vendorId: vendorInvoices.vendorId,
        organizationId: vendorInvoices.organizationId,
        invoiceNumber: vendorInvoices.invoiceNumber,
        amount: vendorInvoices.amount,
        invoiceDate: vendorInvoices.invoiceDate,
        dueDate: vendorInvoices.dueDate,
        scheduledPaymentDate: vendorInvoices.scheduledPaymentDate,
        paymentTerms: vendorInvoices.paymentTerms,
        status: vendorInvoices.status,
        paidDate: vendorInvoices.paidDate,
        advanceDate: vendorInvoices.advanceDate,
        paidViaInstant: vendorInvoices.paidViaInstant,
        instantAdvanceAmount: vendorInvoices.instantAdvanceAmount,
        floatDurationDays: vendorInvoices.floatDurationDays,
        floatYieldRate: vendorInvoices.floatYieldRate,
        yieldGenerated: vendorInvoices.yieldGenerated,
        description: vendorInvoices.description,
        vendorName: vendors.name,
      })
      .from(vendorInvoices)
      .innerJoin(vendors, eq(vendorInvoices.vendorId, vendors.id))
      .where(eq(vendorInvoices.organizationId, organizationId))
      .$dynamic();

    if (filters?.status) {
      query = query.where(eq(vendorInvoices.status, filters.status as any));
    }

    return await query.orderBy(desc(vendorInvoices.invoiceDate));
  }

  async payVendorInstant(invoiceId: string): Promise<VendorInvoice> {
    return await db.transaction(async (tx) => {
      // Get the invoice
      const [invoice] = await tx
        .select()
        .from(vendorInvoices)
        .where(eq(vendorInvoices.id, invoiceId));

      if (!invoice) {
        throw new Error("Invoice not found");
      }

      if (invoice.status !== "pending") {
        throw new Error("Invoice is not pending");
      }

      // Get org settings for yield rate
      const config = await this.getSettings(invoice.organizationId);
      if (!config) {
        throw new Error("Organization settings not found");
      }

      // Calculate instant payment details
      const advanceDate = new Date();
      const scheduledDate = new Date(invoice.scheduledPaymentDate);
      
      // Calculate float duration (days between instant payment and scheduled payment)
      // Use Math.max + Math.ceil to guarantee at least 1 day, preventing zero/negative durations
      const rawDuration = (scheduledDate.getTime() - advanceDate.getTime()) / (1000 * 60 * 60 * 24);
      const floatDurationDays = Math.max(Math.ceil(rawDuration), 1);

      // Yield rate from org settings (consistent 5.50% APY)
      // The 3-9× amplification comes naturally from DURATION:
      // Net30 = ~30 days (3× vs rent float's ~10 days)
      // Net60 = ~60 days (6× vs rent float)
      // Net90 = ~90 days (9× vs rent float)
      const yieldRate = parseFloat(config.rentFloatYieldRate || "5.50");

      // Calculate yield: amount * (days / 365) * annualRate
      // The extended duration creates the yield amplification!
      const amount = parseFloat(invoice.amount);
      const yieldGenerated = amount * (floatDurationDays / 365) * (yieldRate / 100);

      // Update invoice to paid_instant status with complete yield economics
      const [updatedInvoice] = await tx
        .update(vendorInvoices)
        .set({
          status: "paid_instant",
          paidDate: advanceDate,
          advanceDate: advanceDate,
          paidViaInstant: true,
          instantAdvanceAmount: invoice.amount,
          floatDurationDays,
          floatYieldRate: yieldRate.toFixed(2),
          yieldGenerated: yieldGenerated.toFixed(2),
        })
        .where(eq(vendorInvoices.id, invoiceId))
        .returning();

      // Calculate duration multiplier vs rent float baseline (~10 days) for audit trail
      const rentFloatBaseline = typeof config.rentFloatDefaultDuration === 'number' 
        ? config.rentFloatDefaultDuration 
        : parseFloat(config.rentFloatDefaultDuration || "10");
      const durationMultiplier = floatDurationDays / rentFloatBaseline;

      // Log audit trail for value creation (showcasing yield amplification!)
      await tx.insert(auditLogs).values({
        organizationId: invoice.organizationId,
        userId: null,
        action: "vendor_instant_payment",
        entity: "vendor_invoice",
        entityId: invoiceId,
        metadata: JSON.stringify({
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.amount,
          paymentTerms: invoice.paymentTerms,
          floatDurationDays,
          yieldGenerated: yieldGenerated.toFixed(2),
          yieldRate: yieldRate.toFixed(2),
          durationMultiplier: durationMultiplier.toFixed(1) + "×",
        }),
      });

      return updatedInvoice;
    });
  }
}

export const storage = new DatabaseStorage();
