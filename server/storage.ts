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
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, lt, gte, sql, sum, inArray } from "drizzle-orm";

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
      const newBalance = (parseFloat(existing.balance) + parseFloat(insertSub.balance)).toFixed(2);
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
}

export const storage = new DatabaseStorage();
