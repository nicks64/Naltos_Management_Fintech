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
  cryptoTreasuryPositions,
  cryptoTreasuryDeployments,
  cryptoTreasuryFlows,
  vendors,
  vendorInvoices,
  vendorBalances,
  vendorRedemptions,
  vendorUserLinks,
  vendorStablecoinAllocations,
  vendorTreasuryAllocations,
  merchants,
  merchantTransactions,
  merchantBalances,
  merchantUserLinks,
  merchantStablecoinAllocations,
  merchantTreasuryAllocations,
  orchestrationEvents,
  merchantSettlementPreferences,
  vendorRedemptionRequests,
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
  type CryptoTreasuryPosition,
  type CryptoTreasuryDeployment,
  type CryptoTreasuryFlow,
  type Vendor,
  type VendorInvoice,
  type VendorBalance,
  type VendorRedemption,
  type VendorStablecoinAllocation,
  type VendorTreasuryAllocation,
  type Merchant,
  type MerchantTransaction,
  type InsertMerchantTransaction,
  type MerchantBalance,
  type MerchantStablecoinAllocation,
  type MerchantTreasuryAllocation,
  type OrchestrationEvent,
  type InsertOrchestrationEvent,
  type MerchantSettlementPreferences,
  type InsertMerchantSettlementPreferences,
  type VendorRedemptionRequest,
  type InsertVendorRedemptionRequest,
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
  
  // Vendor User Links methods (for multi-org vendor access)
  getVendorUserLinks(userId: string): Promise<string[]>; // Returns array of vendorIds accessible by this user
  createVendorUserLink(userId: string, vendorId: string): Promise<void>;
  
  // Vendor Orchestration methods (for enhanced vendor portal)
  // Note: organizationId is derived from vendor record, not passed as parameter
  getVendorStablecoinAllocations(userId: string, vendorId: string): Promise<VendorStablecoinAllocation[]>;
  getVendorTreasuryAllocations(userId: string, vendorId: string): Promise<(VendorTreasuryAllocation & { productName: string; productSymbol: string })[]>;
  
  // Vendor Redemption methods
  getRedemptionsByVendorIds(vendorIds: string[]): Promise<VendorRedemption[]>;
  createRedemption(data: {
    vendorIds: string[];
    rail: string;
    nusdAmount: string;
    payoutMethodId?: string;
  }): Promise<VendorRedemption[]>;
  updateRedemptionStatus(redemptionId: string, status: string, metadata?: string): Promise<VendorRedemption>;
  
  // Tenant methods
  getTenantByEmail(email: string): Promise<Tenant | undefined>;
  getTenant(id: string): Promise<Tenant | undefined>;
  updateTenant(id: string, updates: Partial<Tenant>): Promise<Tenant>;
  
  // Merchant methods for tenant-side transactions
  getMerchants(organizationId: string): Promise<Merchant[]>;
  getMerchantTransactions(tenantId: string, filters?: { status?: string }): Promise<(MerchantTransaction & { merchantName: string })[]>;
  createMerchantTransaction(data: InsertMerchantTransaction, userId: string): Promise<MerchantTransaction>;
  
  // Merchant Balance & Orchestration methods (merchant portal side)
  getMerchantUserLinks(userId: string): Promise<string[]>; // Returns array of merchantIds accessible by this user
  createMerchantUserLink(userId: string, merchantId: string): Promise<void>;
  getMerchantOverview(merchantIds: string[]): Promise<Array<{
    merchant: Merchant;
    balance: MerchantBalance | null;
    organization: Organization;
  }>>;
  // Note: organizationId is derived from merchant record, not passed as parameter
  getMerchantBalance(userId: string, merchantId: string): Promise<MerchantBalance | undefined>;
  getMerchantStablecoinAllocations(userId: string, merchantId: string): Promise<MerchantStablecoinAllocation[]>;
  getMerchantTreasuryAllocations(userId: string, merchantId: string): Promise<(MerchantTreasuryAllocation & { productName: string; productSymbol: string })[]>;
  getMerchantTransactionsByMerchantId(userId: string, merchantId: string, filters?: { status?: string }): Promise<(MerchantTransaction & { merchantName: string })[]>;
  
  // Orchestration Event Timeline methods
  listOrchestrationEvents(organizationId: string, filters?: {
    eventType?: string;
    vendorId?: string;
    merchantId?: string;
    limit?: number;
  }): Promise<OrchestrationEvent[]>;
  createOrchestrationEvent(event: InsertOrchestrationEvent): Promise<OrchestrationEvent>;
  
  // Merchant Settlement Preferences methods (organization-scoped for security)
  getMerchantSettlementPreferences(merchantId: string, organizationId: string): Promise<MerchantSettlementPreferences>;
  updateMerchantSettlementPreferences(merchantId: string, organizationId: string, preferences: {
    settlementSchedule?: string;
    paymentMethod?: string;
    autoSettle?: boolean;
  }): Promise<MerchantSettlementPreferences>;
  
  // Vendor Redemption Request methods
  createVendorRedemptionRequest(request: {
    vendorId: string;
    vendorBalanceId: string;
    amount: string;
    requestedRail: string;
    feeAmount: string;
    netAmount: string;
  }): Promise<VendorRedemptionRequest>;
  listVendorRedemptionRequests(vendorId: string): Promise<VendorRedemptionRequest[]>;
  // Security: vendorId and organizationId are REQUIRED for authorization
  updateRedemptionRequestStatus(requestId: string, status: string, vendorId: string, organizationId: string): Promise<VendorRedemptionRequest>;
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
      .where(and(eq(magicCodes.email, email), eq(magicCodes.code, code), eq(magicCodes.used, false)))
      .orderBy(desc(magicCodes.expiresAt)); // Get the most recent (longest expiry) code
    return magicCode || undefined;
  }

  async deleteOldMagicCodes(email: string): Promise<void> {
    await db.delete(magicCodes).where(eq(magicCodes.email, email));
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

    // Calculate Crypto Treasury Metrics
    // Get latest position for each coin (using MAX asOf per coin)
    const allCryptoPositions = await db
      .select()
      .from(cryptoTreasuryPositions)
      .where(eq(cryptoTreasuryPositions.organizationId, organizationId));
    
    // Group by coin and keep only the latest position for each
    const latestPositionsByCoin = new Map<string, typeof cryptoTreasuryPositions.$inferSelect>();
    allCryptoPositions.forEach(pos => {
      const existing = latestPositionsByCoin.get(pos.coin);
      if (!existing || new Date(pos.asOf) > new Date(existing.asOf)) {
        latestPositionsByCoin.set(pos.coin, pos);
      }
    });
    const cryptoPositions = Array.from(latestPositionsByCoin.values());
    
    const cryptoTreasuryAUM = cryptoPositions.reduce((sum, pos) => {
      const available = this.safeDecimalToNumber(pos.availableBalance);
      const deployed = this.safeDecimalToNumber(pos.deployedBalance);
      const reserved = this.safeDecimalToNumber(pos.reservedBalance);
      return sum + available + deployed + reserved;
    }, 0);
    
    const cryptoDeployedBalance = cryptoPositions.reduce((sum, pos) => {
      return sum + this.safeDecimalToNumber(pos.deployedBalance);
    }, 0);
    
    const cryptoTotalYield = cryptoPositions.reduce((sum, pos) => {
      return sum + this.safeDecimalToNumber(pos.totalYieldAccrued);
    }, 0);
    
    // Get active deployments to calculate proper APY
    const activeDeployments = await db
      .select()
      .from(cryptoTreasuryDeployments)
      .where(
        and(
          eq(cryptoTreasuryDeployments.organizationId, organizationId),
          eq(cryptoTreasuryDeployments.status, 'active')
        )
      );
    
    // Calculate APY based on actual deployment duration
    // For each deployment: (yield / principal / days) * 365 * 100
    let totalWeightedAPY = 0;
    let totalDeploymentAmount = 0;
    activeDeployments.forEach(deployment => {
      const principal = this.safeDecimalToNumber(deployment.deploymentAmount);
      const yield_ = this.safeDecimalToNumber(deployment.cumulativeYield);
      const deployedAt = new Date(deployment.deployedAt);
      const daysDeployed = Math.max(1, Math.floor((now.getTime() - deployedAt.getTime()) / (24 * 60 * 60 * 1000)));
      
      if (principal > 0 && daysDeployed > 0) {
        const deploymentAPY = (yield_ / principal / daysDeployed) * 365 * 100;
        totalWeightedAPY += deploymentAPY * principal;
        totalDeploymentAmount += principal;
      }
    });
    
    const cryptoYieldAPY = totalDeploymentAmount > 0 
      ? totalWeightedAPY / totalDeploymentAmount 
      : 0;

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
      rentFloatYield,
      cryptoTreasuryAUM,
      cryptoDeployedBalance,
      cryptoYieldAPY,
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

  async getVendorBalance(vendorId: string): Promise<VendorBalance | undefined> {
    const [balance] = await db
      .select()
      .from(vendorBalances)
      .where(eq(vendorBalances.vendorId, vendorId));
    return balance;
  }

  async getVendorOverview(vendorIds: string[]): Promise<Array<{
    vendor: Vendor;
    balance: VendorBalance | null;
    organization: Organization;
  }>> {
    if (vendorIds.length === 0) return [];
    
    const results = await db
      .select({
        vendor: vendors,
        balance: vendorBalances,
        organization: organizations,
      })
      .from(vendors)
      .leftJoin(vendorBalances, eq(vendors.id, vendorBalances.vendorId))
      .innerJoin(organizations, eq(vendors.organizationId, organizations.id))
      .where(inArray(vendors.id, vendorIds));
    
    return results.map(r => ({
      vendor: r.vendor,
      balance: r.balance,
      organization: r.organization,
    }));
  }

  async getInvoicesForVendorIds(vendorIds: string[]): Promise<Array<VendorInvoice & { vendorName: string; organizationName: string }>> {
    if (vendorIds.length === 0) return [];
    
    const results = await db
      .select({
        invoice: vendorInvoices,
        vendorName: vendors.name,
        organizationName: organizations.name,
      })
      .from(vendorInvoices)
      .innerJoin(vendors, eq(vendorInvoices.vendorId, vendors.id))
      .innerJoin(organizations, eq(vendorInvoices.organizationId, organizations.id))
      .where(inArray(vendorInvoices.vendorId, vendorIds))
      .orderBy(desc(vendorInvoices.invoiceDate));
    
    return results.map(r => ({
      ...r.invoice,
      vendorName: r.vendorName,
      organizationName: r.organizationName,
    }));
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

  // Helper to safely convert decimal to number with data integrity checks
  private safeDecimalToNumber(value: any): number {
    if (value === null || value === undefined) return 0;
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(num)) {
      console.error(`Invalid decimal value encountered: ${value}`);
      throw new Error(`Failed to convert decimal value to number: ${value}`);
    }
    return num;
  }

  // Tenant Methods
  async getTenantByEmail(email: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.email, email));
    return tenant || undefined;
  }

  async getTenant(id: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant || undefined;
  }

  async updateTenant(id: string, updates: Partial<Tenant>): Promise<Tenant> {
    const [tenant] = await db.update(tenants).set(updates).where(eq(tenants.id, id)).returning();
    return tenant;
  }

  // Vendor User Links Methods (for multi-org vendor access)
  async getVendorUserLinks(userId: string): Promise<string[]> {
    const links = await db
      .select({ vendorId: vendorUserLinks.vendorId })
      .from(vendorUserLinks)
      .where(eq(vendorUserLinks.userId, userId));
    return links.map(link => link.vendorId);
  }

  async createVendorUserLink(userId: string, vendorId: string): Promise<void> {
    await db.insert(vendorUserLinks).values({ userId, vendorId });
  }
  
  // Vendor Orchestration Methods
  async getVendorStablecoinAllocations(userId: string, vendorId: string): Promise<VendorStablecoinAllocation[]> {
    // Verify user has access to this vendor via vendorUserLinks, derive organizationId from vendor record
    const results = await db
      .select({
        id: vendorStablecoinAllocations.id,
        vendorBalanceId: vendorStablecoinAllocations.vendorBalanceId,
        coin: vendorStablecoinAllocations.coin,
        allocatedAmount: vendorStablecoinAllocations.allocatedAmount,
        nusdEquivalent: vendorStablecoinAllocations.nusdEquivalent,
        lastUpdated: vendorStablecoinAllocations.lastUpdated,
      })
      .from(vendorStablecoinAllocations)
      .innerJoin(vendorBalances, eq(vendorStablecoinAllocations.vendorBalanceId, vendorBalances.id))
      .innerJoin(vendors, eq(vendorBalances.vendorId, vendors.id))
      .innerJoin(vendorUserLinks, and(eq(vendors.id, vendorUserLinks.vendorId), eq(vendorBalances.vendorId, vendorUserLinks.vendorId)))
      .where(and(
        eq(vendorUserLinks.userId, userId),
        eq(vendors.id, vendorId)
      ))
      .orderBy(vendorStablecoinAllocations.coin);
    
    return results;
  }
  
  async getVendorTreasuryAllocations(userId: string, vendorId: string): Promise<(VendorTreasuryAllocation & { productName: string; productSymbol: string })[]> {
    // Verify user has access to this vendor via vendorUserLinks, derive organizationId from vendor record
    const results = await db
      .select({
        id: vendorTreasuryAllocations.id,
        vendorBalanceId: vendorTreasuryAllocations.vendorBalanceId,
        treasuryProductId: vendorTreasuryAllocations.treasuryProductId,
        coin: vendorTreasuryAllocations.coin,
        allocatedAmount: vendorTreasuryAllocations.allocatedAmount,
        currentYield: vendorTreasuryAllocations.currentYield,
        yieldAccrued: vendorTreasuryAllocations.yieldAccrued,
        deployedAt: vendorTreasuryAllocations.deployedAt,
        lastUpdated: vendorTreasuryAllocations.lastUpdated,
        productName: treasuryProducts.name,
        productSymbol: treasuryProducts.productType,
      })
      .from(vendorTreasuryAllocations)
      .innerJoin(vendorBalances, eq(vendorTreasuryAllocations.vendorBalanceId, vendorBalances.id))
      .innerJoin(vendors, eq(vendorBalances.vendorId, vendors.id))
      .innerJoin(vendorUserLinks, and(eq(vendors.id, vendorUserLinks.vendorId), eq(vendorBalances.vendorId, vendorUserLinks.vendorId)))
      .innerJoin(treasuryProducts, eq(vendorTreasuryAllocations.treasuryProductId, treasuryProducts.id))
      .where(and(
        eq(vendorUserLinks.userId, userId),
        eq(vendors.id, vendorId)
      ))
      .orderBy(vendorTreasuryAllocations.treasuryProductId, vendorTreasuryAllocations.coin);
    
    return results;
  }

  // Vendor Redemption Methods
  
  // Helper function to compute vendor balance state (total, available, pending)
  // Used by both createRedemption validation and API responses for consistency
  async computeVendorBalanceState(vendorIds: string[], tx?: any): Promise<Map<string, {
    vendorId: string;
    organizationId: string;
    totalBalance: number;
    availableBalance: number;
    pendingBalance: number;
  }>> {
    const dbClient = tx || db;
    
    if (vendorIds.length === 0) {
      return new Map();
    }
    
    // Use SQL aggregation to calculate pending amounts per (vendorId, organizationId) pair
    // This ensures we're summing pending redemptions correctly for each balance
    const results = await dbClient
      .select({
        vendorId: vendorBalances.vendorId,
        organizationId: vendorBalances.organizationId,
        nusdBalance: vendorBalances.nusdBalance,
        pendingSum: sql<string>`COALESCE(SUM(CASE WHEN ${vendorRedemptions.status} IN ('pending', 'processing') THEN ${vendorRedemptions.nusdAmount} ELSE 0 END), 0)`.as('pending_sum'),
      })
      .from(vendorBalances)
      .leftJoin(
        vendorRedemptions,
        and(
          eq(vendorBalances.vendorId, vendorRedemptions.vendorId),
          eq(vendorBalances.organizationId, vendorRedemptions.organizationId)
        )
      )
      .where(inArray(vendorBalances.vendorId, vendorIds))
      .groupBy(vendorBalances.vendorId, vendorBalances.organizationId, vendorBalances.nusdBalance);
    
    // Build state map from SQL results
    const stateMap = new Map<string, {
      vendorId: string;
      organizationId: string;
      totalBalance: number;
      availableBalance: number;
      pendingBalance: number;
    }>();
    
    for (const row of results) {
      const totalBalance = parseFloat(row.nusdBalance || "0");
      const pendingBalance = parseFloat(row.pendingSum || "0");
      const availableBalance = totalBalance - pendingBalance;
      
      const key = `${row.vendorId}-${row.organizationId}`;
      stateMap.set(key, {
        vendorId: row.vendorId,
        organizationId: row.organizationId,
        totalBalance,
        availableBalance,
        pendingBalance,
      });
    }
    
    return stateMap;
  }
  
  async getRedemptionsByVendorIds(vendorIds: string[]): Promise<VendorRedemption[]> {
    if (vendorIds.length === 0) return [];
    
    const results = await db
      .select()
      .from(vendorRedemptions)
      .where(inArray(vendorRedemptions.vendorId, vendorIds))
      .orderBy(desc(vendorRedemptions.createdAt));
    
    return results;
  }

  // SECURITY: vendorIds MUST be validated by caller (via requireVendor middleware)
  // to ensure they belong to the authenticated user. DO NOT trust client-supplied IDs!
  // This method assumes vendorIds have already been verified against vendor_user_links.
  async createRedemption(data: {
    vendorIds: string[];
    rail: string;
    nusdAmount: string;
    payoutMethodId?: string;
  }): Promise<VendorRedemption[]> {
    const { vendorIds, rail, nusdAmount, payoutMethodId } = data;
    
    const requestedAmount = parseFloat(nusdAmount);
    
    // Calculate fee based on rail type
    let feePercentage = 0;
    let scheduledFor: Date | null = null;
    
    switch (rail) {
      case "ACH":
        feePercentage = 0; // No fee for ACH
        // Schedule for Net30 from today (default)
        scheduledFor = new Date();
        scheduledFor.setDate(scheduledFor.getDate() + 30);
        break;
      case "PushToCard":
        feePercentage = 0.015; // 1.5% fee for instant card payout
        break;
      case "OnChainStablecoin":
        feePercentage = 0.001; // 0.1% gas fee for crypto
        break;
    }
    
    const feeAmount = requestedAmount * feePercentage;
    const usdAmount = requestedAmount - feeAmount;
    
    // Execute all operations inside a transaction to prevent race conditions
    const createdRedemptions = await db.transaction(async (tx) => {
      // Lock vendor balance rows to prevent concurrent modifications
      await tx
        .select()
        .from(vendorBalances)
        .where(inArray(vendorBalances.vendorId, vendorIds))
        .for("update");
      
      // Compute available balance state INSIDE transaction after locking
      // This includes deducting pending/processing redemptions
      const balanceState = await this.computeVendorBalanceState(vendorIds, tx);
      
      if (balanceState.size === 0) {
        throw new Error("No vendor balances found. Please contact support to set up your account.");
      }
      
      // Filter to only balances with positive available amounts
      const availableBalances = Array.from(balanceState.values())
        .filter(state => state.availableBalance > 0);
      
      if (availableBalances.length === 0) {
        throw new Error("Insufficient balance. Your current available balance is $0.00");
      }
      
      // Calculate total available balance (excludes pending redemptions)
      const totalAvailable = availableBalances.reduce(
        (sum, state) => sum + state.availableBalance,
        0
      );
      
      if (requestedAmount > totalAvailable) {
        throw new Error(`Insufficient available balance. Available: $${totalAvailable.toFixed(2)}, Requested: $${requestedAmount.toFixed(2)}`);
      }
      
      // Calculate proportional allocations based on AVAILABLE balance (not total)
      // Cap each deduction to available balance to prevent rounding errors
      const allocations = availableBalances.map(state => {
        const proportion = state.availableBalance / totalAvailable;
        const rawDeduction = requestedAmount * proportion;
        // Cap deduction to available balance (prevents rounding issues)
        const deductionAmount = Math.min(rawDeduction, state.availableBalance);
        
        const orgFeeAmount = feeAmount * proportion;
        const orgUsdAmount = usdAmount * proportion;
        
        return {
          vendorId: state.vendorId,
          organizationId: state.organizationId,
          availableBalance: state.availableBalance,
          proportion,
          deductionAmount,
          orgFeeAmount,
          orgUsdAmount,
        };
      });
      
      // Execute all redemptions and balance updates atomically
      const redemptions: VendorRedemption[] = [];
      
      for (const allocation of allocations) {
        const { vendorId, organizationId, deductionAmount, orgFeeAmount, orgUsdAmount, proportion } = allocation;
        
        // Create redemption record for this organization
        const [redemption] = await tx.insert(vendorRedemptions).values({
          vendorId,
          organizationId,
          payoutMethodId: payoutMethodId || null,
          rail: rail as "ACH" | "PushToCard" | "OnChainStablecoin",
          nusdAmount: deductionAmount.toFixed(2),
          usdAmount: orgUsdAmount.toFixed(2),
          feeAmount: orgFeeAmount.toFixed(2),
          status: "pending",
          scheduledFor,
          metadata: JSON.stringify({
            proportion: proportion.toFixed(4),
            totalRedemptionAmount: nusdAmount,
            totalFeeAmount: feeAmount.toFixed(2),
            totalUsdAmount: usdAmount.toFixed(2),
          }),
        }).returning();
        
        // NOTE: We do NOT deduct from nusdBalance here!
        // The pending redemption will reduce availableBalance in computeVendorBalanceState()
        // nusdBalance is only deducted when redemption status changes to "completed"
        redemptions.push(redemption);
      }
      
      return redemptions;
    });
    
    return createdRedemptions;
  }

  async updateRedemptionStatus(redemptionId: string, status: string, metadata?: string): Promise<VendorRedemption> {
    return await db.transaction(async (tx) => {
      // First, get the current redemption to check its status
      const [currentRedemption] = await tx
        .select()
        .from(vendorRedemptions)
        .where(eq(vendorRedemptions.id, redemptionId))
        .for("update"); // Lock the row
      
      if (!currentRedemption) {
        throw new Error("Redemption not found");
      }
      
      const previousStatus = currentRedemption.status;
      
      const updates: any = { status };
      
      if (metadata) {
        updates.metadata = metadata;
      }
      
      // Update timestamps based on status
      if (status === "processing") {
        updates.processedAt = new Date();
      } else if (status === "completed") {
        updates.completedAt = new Date();
      }
      
      const [redemption] = await tx.update(vendorRedemptions)
        .set(updates)
        .where(eq(vendorRedemptions.id, redemptionId))
        .returning();
      
      if (!redemption) {
        throw new Error("Redemption not found");
      }
      
      // Only deduct from nusdBalance if transitioning TO "completed" (not if already completed)
      // This prevents double-deduction if updateRedemptionStatus is called multiple times
      if (status === "completed" && previousStatus !== "completed") {
        const deductionAmount = parseFloat(redemption.nusdAmount || "0");
        const usdAmount = parseFloat(redemption.usdAmount || "0");
        
        await tx.update(vendorBalances)
          .set({
            nusdBalance: sql`${vendorBalances.nusdBalance} - ${deductionAmount.toFixed(2)}`,
            totalRedeemed: sql`${vendorBalances.totalRedeemed} + ${usdAmount.toFixed(2)}`,
          })
          .where(
            and(
              eq(vendorBalances.vendorId, redemption.vendorId),
              eq(vendorBalances.organizationId, redemption.organizationId)
            )
          );
      }
      
      return redemption;
    });
  }

  // Crypto Treasury Methods
  async getCryptoTreasuryPositions(organizationId: string) {
    const results = await db
      .select()
      .from(cryptoTreasuryPositions)
      .where(eq(cryptoTreasuryPositions.organizationId, organizationId))
      .orderBy(desc(cryptoTreasuryPositions.asOf));

    return results.map(pos => ({
      ...pos,
      availableBalance: this.safeDecimalToNumber(pos.availableBalance),
      deployedBalance: this.safeDecimalToNumber(pos.deployedBalance),
      reservedBalance: this.safeDecimalToNumber(pos.reservedBalance),
      totalYieldAccrued: this.safeDecimalToNumber(pos.totalYieldAccrued),
    }));
  }

  async getCryptoTreasuryDeployments(organizationId: string, filters?: { status?: string; coin?: string }) {
    let query = db
      .select({
        id: cryptoTreasuryDeployments.id,
        organizationId: cryptoTreasuryDeployments.organizationId,
        treasuryProductId: cryptoTreasuryDeployments.treasuryProductId,
        sourceWalletId: cryptoTreasuryDeployments.sourceWalletId,
        coin: cryptoTreasuryDeployments.coin,
        deploymentAmount: cryptoTreasuryDeployments.deploymentAmount,
        status: cryptoTreasuryDeployments.status,
        deployedAt: cryptoTreasuryDeployments.deployedAt,
        maturityDate: cryptoTreasuryDeployments.maturityDate,
        withdrawnAt: cryptoTreasuryDeployments.withdrawnAt,
        cumulativeYield: cryptoTreasuryDeployments.cumulativeYield,
        reinvestPolicy: cryptoTreasuryDeployments.reinvestPolicy,
        productName: treasuryProducts.name,
        productType: treasuryProducts.productType,
      })
      .from(cryptoTreasuryDeployments)
      .innerJoin(
        treasuryProducts,
        eq(cryptoTreasuryDeployments.treasuryProductId, treasuryProducts.id)
      )
      .where(eq(cryptoTreasuryDeployments.organizationId, organizationId))
      .$dynamic();

    if (filters?.status) {
      query = query.where(eq(cryptoTreasuryDeployments.status, filters.status as any));
    }

    if (filters?.coin) {
      query = query.where(eq(cryptoTreasuryDeployments.coin, filters.coin as any));
    }

    const results = await query.orderBy(desc(cryptoTreasuryDeployments.deployedAt));

    return results.map(dep => ({
      ...dep,
      deploymentAmount: this.safeDecimalToNumber(dep.deploymentAmount),
      cumulativeYield: this.safeDecimalToNumber(dep.cumulativeYield),
    }));
  }

  async getCryptoTreasuryFlows(organizationId: string, filters?: { flowType?: string; coin?: string; limit?: number }) {
    let query = db
      .select()
      .from(cryptoTreasuryFlows)
      .where(eq(cryptoTreasuryFlows.organizationId, organizationId))
      .$dynamic();

    if (filters?.flowType) {
      query = query.where(eq(cryptoTreasuryFlows.flowType, filters.flowType as any));
    }

    if (filters?.coin) {
      query = query.where(eq(cryptoTreasuryFlows.coin, filters.coin as any));
    }

    const results = await query
      .orderBy(desc(cryptoTreasuryFlows.createdAt))
      .limit(filters?.limit || 100);

    return results.map(flow => ({
      ...flow,
      amount: this.safeDecimalToNumber(flow.amount),
    }));
  }

  // Merchant Transaction Methods
  async getMerchants(organizationId: string): Promise<Merchant[]> {
    const results = await db
      .select()
      .from(merchants)
      .where(and(eq(merchants.organizationId, organizationId), eq(merchants.active, true)))
      .orderBy(merchants.category, merchants.name);
    
    // Return merchants with yieldRate as string (matches schema)
    return results;
  }

  async getMerchantTransactions(
    tenantId: string,
    filters?: { status?: string }
  ): Promise<(MerchantTransaction & { merchantName: string })[]> {
    let query = db
      .select({
        id: merchantTransactions.id,
        merchantId: merchantTransactions.merchantId,
        tenantId: merchantTransactions.tenantId,
        organizationId: merchantTransactions.organizationId,
        amount: merchantTransactions.amount,
        transactionDate: merchantTransactions.transactionDate,
        settlementDate: merchantTransactions.settlementDate,
        status: merchantTransactions.status,
        settledAt: merchantTransactions.settledAt,
        settlementDays: merchantTransactions.settlementDays,
        yieldRate: merchantTransactions.yieldRate,
        yieldGenerated: merchantTransactions.yieldGenerated,
        propertyYieldShare: merchantTransactions.propertyYieldShare,
        tenantYieldShare: merchantTransactions.tenantYieldShare,
        platformYieldShare: merchantTransactions.platformYieldShare,
        description: merchantTransactions.description,
        merchantName: merchants.name,
      })
      .from(merchantTransactions)
      .innerJoin(merchants, eq(merchantTransactions.merchantId, merchants.id))
      .where(eq(merchantTransactions.tenantId, tenantId))
      .$dynamic();

    if (filters?.status) {
      query = query.where(eq(merchantTransactions.status, filters.status as any));
    }

    const results = await query.orderBy(desc(merchantTransactions.transactionDate));
    
    // Return transactions with decimal fields as strings (matches schema)
    return results;
  }

  async createMerchantTransaction(data: InsertMerchantTransaction, userId: string): Promise<MerchantTransaction> {
    return await db.transaction(async (tx) => {
      // Get merchant details for settlement days and yield rate
      const [merchant] = await tx
        .select()
        .from(merchants)
        .where(eq(merchants.id, data.merchantId));

      if (!merchant) {
        throw new Error("Merchant not found");
      }

      // Calculate settlement details
      const transactionDate = new Date();
      const settlementDate = new Date(transactionDate);
      settlementDate.setDate(transactionDate.getDate() + merchant.settlementDays);

      const amount = typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount;
      const yieldRate = parseFloat(merchant.yieldRate);
      
      // Calculate yield: amount * (settlementDays / 365) * (yieldRate / 100)
      const yieldGenerated = amount * (merchant.settlementDays / 365) * (yieldRate / 100);

      // Distribute yield: Property 80%, Tenant 12.5%, Platform 7.5%
      const propertyYieldShare = yieldGenerated * 0.80;
      const tenantYieldShare = yieldGenerated * 0.125;
      const platformYieldShare = yieldGenerated * 0.075;

      // Create transaction
      const [transaction] = await tx
        .insert(merchantTransactions)
        .values({
          ...data,
          amount: amount.toFixed(2),
          transactionDate,
          settlementDate,
          status: "pending",
          settlementDays: merchant.settlementDays,
          yieldRate: yieldRate.toFixed(2),
          yieldGenerated: yieldGenerated.toFixed(2),
          propertyYieldShare: propertyYieldShare.toFixed(2),
          tenantYieldShare: tenantYieldShare.toFixed(2),
          platformYieldShare: platformYieldShare.toFixed(2),
        })
        .returning();

      // Log audit trail
      await tx.insert(auditLogs).values({
        organizationId: data.organizationId,
        userId: userId,
        action: "merchant_transaction_created",
        entity: "merchant_transaction",
        entityId: transaction.id,
        metadata: JSON.stringify({
          merchantName: merchant.name,
          amount: amount.toFixed(2),
          settlementDays: merchant.settlementDays,
          yieldGenerated: yieldGenerated.toFixed(2),
          propertyYieldShare: propertyYieldShare.toFixed(2),
          tenantYieldShare: tenantYieldShare.toFixed(2),
          platformYieldShare: platformYieldShare.toFixed(2),
        }),
      });

      return transaction;
    });
  }
  
  // Merchant User Links Methods (for multi-org merchant access)
  async getMerchantUserLinks(userId: string): Promise<string[]> {
    const links = await db
      .select({ merchantId: merchantUserLinks.merchantId })
      .from(merchantUserLinks)
      .where(eq(merchantUserLinks.userId, userId));
    return links.map(link => link.merchantId);
  }

  async createMerchantUserLink(userId: string, merchantId: string): Promise<void> {
    await db.insert(merchantUserLinks).values({ userId, merchantId });
  }
  
  // Merchant Balance & Orchestration Methods
  async getMerchantOverview(merchantIds: string[]): Promise<Array<{
    merchant: Merchant;
    balance: MerchantBalance | null;
    organization: Organization;
  }>> {
    if (merchantIds.length === 0) return [];
    
    const results = await db
      .select({
        merchant: merchants,
        balance: merchantBalances,
        organization: organizations,
      })
      .from(merchants)
      .leftJoin(merchantBalances, eq(merchants.id, merchantBalances.merchantId))
      .innerJoin(organizations, eq(merchants.organizationId, organizations.id))
      .where(inArray(merchants.id, merchantIds));
    
    return results.map(r => ({
      merchant: r.merchant,
      balance: r.balance,
      organization: r.organization,
    }));
  }

  async getMerchantBalance(userId: string, merchantId: string): Promise<MerchantBalance | undefined> {
    // Verify user has access to this merchant via merchantUserLinks, derive organizationId from merchant record
    const [balance] = await db
      .select({
        id: merchantBalances.id,
        merchantId: merchantBalances.merchantId,
        organizationId: merchantBalances.organizationId,
        nusdBalance: merchantBalances.nusdBalance,
        pendingSettlement: merchantBalances.pendingSettlement,
        totalReceived: merchantBalances.totalReceived,
        totalSettled: merchantBalances.totalSettled,
        totalYieldGenerated: merchantBalances.totalYieldGenerated,
        createdAt: merchantBalances.createdAt,
        updatedAt: merchantBalances.updatedAt,
      })
      .from(merchantBalances)
      .innerJoin(merchants, eq(merchantBalances.merchantId, merchants.id))
      .innerJoin(merchantUserLinks, and(eq(merchants.id, merchantUserLinks.merchantId), eq(merchantBalances.merchantId, merchantUserLinks.merchantId)))
      .where(and(
        eq(merchantUserLinks.userId, userId),
        eq(merchants.id, merchantId)
      ));
    return balance || undefined;
  }
  
  async getMerchantStablecoinAllocations(userId: string, merchantId: string): Promise<MerchantStablecoinAllocation[]> {
    // Verify user has access to this merchant via merchantUserLinks, derive organizationId from merchant record
    const results = await db
      .select({
        id: merchantStablecoinAllocations.id,
        merchantBalanceId: merchantStablecoinAllocations.merchantBalanceId,
        coin: merchantStablecoinAllocations.coin,
        allocatedAmount: merchantStablecoinAllocations.allocatedAmount,
        nusdEquivalent: merchantStablecoinAllocations.nusdEquivalent,
        lastUpdated: merchantStablecoinAllocations.lastUpdated,
      })
      .from(merchantStablecoinAllocations)
      .innerJoin(merchantBalances, eq(merchantStablecoinAllocations.merchantBalanceId, merchantBalances.id))
      .innerJoin(merchants, eq(merchantBalances.merchantId, merchants.id))
      .innerJoin(merchantUserLinks, and(eq(merchants.id, merchantUserLinks.merchantId), eq(merchantBalances.merchantId, merchantUserLinks.merchantId)))
      .where(and(
        eq(merchantUserLinks.userId, userId),
        eq(merchants.id, merchantId)
      ))
      .orderBy(merchantStablecoinAllocations.coin);
    
    return results;
  }
  
  async getMerchantTreasuryAllocations(userId: string, merchantId: string): Promise<(MerchantTreasuryAllocation & { productName: string; productSymbol: string })[]> {
    // Verify user has access to this merchant via merchantUserLinks, derive organizationId from merchant record
    const results = await db
      .select({
        id: merchantTreasuryAllocations.id,
        merchantBalanceId: merchantTreasuryAllocations.merchantBalanceId,
        treasuryProductId: merchantTreasuryAllocations.treasuryProductId,
        coin: merchantTreasuryAllocations.coin,
        allocatedAmount: merchantTreasuryAllocations.allocatedAmount,
        currentYield: merchantTreasuryAllocations.currentYield,
        yieldAccrued: merchantTreasuryAllocations.yieldAccrued,
        deployedAt: merchantTreasuryAllocations.deployedAt,
        lastUpdated: merchantTreasuryAllocations.lastUpdated,
        productName: treasuryProducts.name,
        productSymbol: treasuryProducts.productType,
      })
      .from(merchantTreasuryAllocations)
      .innerJoin(merchantBalances, eq(merchantTreasuryAllocations.merchantBalanceId, merchantBalances.id))
      .innerJoin(merchants, eq(merchantBalances.merchantId, merchants.id))
      .innerJoin(merchantUserLinks, and(eq(merchants.id, merchantUserLinks.merchantId), eq(merchantBalances.merchantId, merchantUserLinks.merchantId)))
      .innerJoin(treasuryProducts, eq(merchantTreasuryAllocations.treasuryProductId, treasuryProducts.id))
      .where(and(
        eq(merchantUserLinks.userId, userId),
        eq(merchants.id, merchantId)
      ))
      .orderBy(merchantTreasuryAllocations.treasuryProductId, merchantTreasuryAllocations.coin);
    
    return results;
  }
  
  async getMerchantTransactionsByMerchantId(
    userId: string,
    merchantId: string,
    filters?: { status?: string }
  ): Promise<(MerchantTransaction & { merchantName: string })[]> {
    // Verify user has access to this merchant via merchantUserLinks, derive organizationId from merchant record
    let query = db
      .select({
        id: merchantTransactions.id,
        merchantId: merchantTransactions.merchantId,
        tenantId: merchantTransactions.tenantId,
        organizationId: merchantTransactions.organizationId,
        amount: merchantTransactions.amount,
        transactionDate: merchantTransactions.transactionDate,
        settlementDate: merchantTransactions.settlementDate,
        status: merchantTransactions.status,
        settledAt: merchantTransactions.settledAt,
        settlementDays: merchantTransactions.settlementDays,
        yieldRate: merchantTransactions.yieldRate,
        yieldGenerated: merchantTransactions.yieldGenerated,
        propertyYieldShare: merchantTransactions.propertyYieldShare,
        tenantYieldShare: merchantTransactions.tenantYieldShare,
        platformYieldShare: merchantTransactions.platformYieldShare,
        description: merchantTransactions.description,
        merchantName: merchants.name,
      })
      .from(merchantTransactions)
      .innerJoin(merchants, eq(merchantTransactions.merchantId, merchants.id))
      .innerJoin(merchantUserLinks, and(eq(merchants.id, merchantUserLinks.merchantId), eq(merchantTransactions.merchantId, merchantUserLinks.merchantId)))
      .where(and(
        eq(merchantUserLinks.userId, userId),
        eq(merchants.id, merchantId)
      ))
      .$dynamic();

    if (filters?.status) {
      query = query.where(and(
        eq(merchantUserLinks.userId, userId),
        eq(merchants.id, merchantId),
        eq(merchantTransactions.status, filters.status as any)
      ));
    }

    const results = await query.orderBy(desc(merchantTransactions.transactionDate));
    
    return results;
  }
  
  // ====== ORCHESTRATION EVENT TIMELINE METHODS ======
  // NOTE: Demo-scoped implementation - not production-ready
  // Security limitations documented in replit.md
  
  async listOrchestrationEvents(
    organizationId: string,
    filters?: {
      eventType?: string;
      vendorId?: string;
      merchantId?: string;
      limit?: number;
    }
  ): Promise<OrchestrationEvent[]> {
    const predicates = [eq(orchestrationEvents.organizationId, organizationId)];
    
    if (filters?.eventType) {
      predicates.push(eq(orchestrationEvents.eventType, filters.eventType as any));
    }
    
    if (filters?.vendorId) {
      predicates.push(eq(orchestrationEvents.vendorId, filters.vendorId));
    }
    
    if (filters?.merchantId) {
      predicates.push(eq(orchestrationEvents.merchantId, filters.merchantId));
    }
    
    const limit = filters?.limit || 100;
    const whereClause = predicates.length > 0 ? and(...predicates) : undefined;
    
    const results = await db
      .select()
      .from(orchestrationEvents)
      .where(whereClause)
      .orderBy(desc(orchestrationEvents.createdAt))
      .limit(limit);
    
    return results;
  }
  
  async createOrchestrationEvent(event: InsertOrchestrationEvent): Promise<OrchestrationEvent> {
    const [created] = await db.insert(orchestrationEvents).values(event).returning();
    return created;
  }
  
  // ====== MERCHANT SETTLEMENT PREFERENCES METHODS ======
  // NOTE: Demo-scoped implementation with basic organization scoping
  
  async getMerchantSettlementPreferences(merchantId: string, organizationId: string): Promise<MerchantSettlementPreferences> {
    const [merchant] = await db
      .select()
      .from(merchants)
      .where(and(eq(merchants.id, merchantId), eq(merchants.organizationId, organizationId)));
    
    if (!merchant) {
      throw new Error("Merchant not found or access denied");
    }
    
    const [existing] = await db
      .select()
      .from(merchantSettlementPreferences)
      .where(eq(merchantSettlementPreferences.merchantId, merchantId));
    
    if (existing) {
      return existing;
    }
    
    const [created] = await db
      .insert(merchantSettlementPreferences)
      .values({
        merchantId,
        settlementSchedule: 'weekly',
        paymentMethod: 'ach',
        autoSettle: true,
      })
      .returning();
    
    return created;
  }
  
  async updateMerchantSettlementPreferences(
    merchantId: string,
    organizationId: string,
    preferences: {
      settlementSchedule?: string;
      paymentMethod?: string;
      autoSettle?: boolean;
    }
  ): Promise<MerchantSettlementPreferences> {
    const [merchant] = await db
      .select()
      .from(merchants)
      .where(and(eq(merchants.id, merchantId), eq(merchants.organizationId, organizationId)));
    
    if (!merchant) {
      throw new Error("Merchant not found or access denied");
    }
    
    const [updated] = await db
      .update(merchantSettlementPreferences)
      .set({
        ...preferences,
        updatedAt: new Date(),
      })
      .where(eq(merchantSettlementPreferences.merchantId, merchantId))
      .returning();
    
    return updated;
  }
  
  // ====== VENDOR REDEMPTION REQUEST METHODS ======
  // NOTE: Demo-scoped implementation with basic vendor/org verification
  
  async createVendorRedemptionRequest(request: {
    vendorId: string;
    vendorBalanceId: string;
    amount: string;
    requestedRail: string;
    feeAmount: string;
    netAmount: string;
  }): Promise<VendorRedemptionRequest> {
    const [created] = await db
      .insert(vendorRedemptionRequests)
      .values({
        vendorId: request.vendorId,
        vendorBalanceId: request.vendorBalanceId,
        amount: request.amount,
        requestedRail: request.requestedRail as any,
        feeAmount: request.feeAmount,
        netAmount: request.netAmount,
        status: 'pending',
      })
      .returning();
    
    return created;
  }
  
  async listVendorRedemptionRequests(vendorId: string): Promise<VendorRedemptionRequest[]> {
    const results = await db
      .select()
      .from(vendorRedemptionRequests)
      .where(eq(vendorRedemptionRequests.vendorId, vendorId))
      .orderBy(desc(vendorRedemptionRequests.requestedAt));
    
    return results;
  }
  
  async updateRedemptionRequestStatus(
    requestId: string,
    status: string,
    vendorId: string,
    organizationId: string
  ): Promise<VendorRedemptionRequest> {
    // Basic demo-scoped authorization
    const [existingRequest] = await db
      .select({
        id: vendorRedemptionRequests.id,
        actualVendorId: vendorRedemptionRequests.vendorId,
        vendorOrganizationId: vendors.organizationId,
      })
      .from(vendorRedemptionRequests)
      .innerJoin(vendors, eq(vendorRedemptionRequests.vendorId, vendors.id))
      .where(eq(vendorRedemptionRequests.id, requestId));
    
    if (!existingRequest) {
      throw new Error("Redemption request not found");
    }
    
    if (existingRequest.actualVendorId !== vendorId || existingRequest.vendorOrganizationId !== organizationId) {
      throw new Error("Access denied: vendor/organization mismatch");
    }
    
    const [updated] = await db
      .update(vendorRedemptionRequests)
      .set({
        status: status as any,
        processedAt: status === 'completed' ? new Date() : null,
      })
      .where(eq(vendorRedemptionRequests.id, requestId))
      .returning();
    
    return updated;
  }
}

export const storage = new DatabaseStorage();
