import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, boolean, pgEnum, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["Admin", "PropertyManager", "CFO", "Analyst", "Tenant", "Vendor", "Merchant"]);
export const invoiceStatusEnum = pgEnum("invoice_status", ["pending", "paid", "overdue", "partial"]);
export const paymentMethodEnum = pgEnum("payment_method", ["ACH", "Card", "Check", "Wire"]);
export const pmsProviderEnum = pgEnum("pms_provider", ["AppFolio", "Yardi", "Buildium"]);
export const treasuryProductTypeEnum = pgEnum("treasury_product_type", ["NRF", "NRK", "NRC"]);
export const complianceModeEnum = pgEnum("compliance_mode", ["indirect_only", "accredited_access"]);
export const cryptoCoinEnum = pgEnum("crypto_coin", ["USDC", "USDT", "DAI", "NUSD"]);
export const cryptoTransactionTypeEnum = pgEnum("crypto_transaction_type", ["deposit", "withdrawal", "conversion", "rent_payment"]);
// Vendor Payout System Enums
export const payoutRailEnum = pgEnum("payout_rail", ["ACH", "PushToCard", "OnChainStablecoin"]);
export const redemptionStatusEnum = pgEnum("redemption_status", ["pending", "processing", "completed", "failed", "cancelled"]);
export const complianceStatusEnum = pgEnum("compliance_status", ["not_verified", "pending_review", "verified", "rejected"]);
// TODO: Bridge System Enums - Schema ready, implementation deferred
// These support future vendor/merchant payment flows when bridgeEnabled=true
export const bridgeDirectionEnum = pgEnum("bridge_direction", ["inbound", "outbound"]);
export const bridgeStatusEnum = pgEnum("bridge_status", ["pending", "converting", "awaiting_sync", "settled", "failed"]);
export const bridgeConversionStrategyEnum = pgEnum("bridge_conversion_strategy", ["immediate", "daily", "optimal_yield"]);
// Vendor Payment System Enums - For Net30-90 yield amplification
export const vendorCategoryEnum = pgEnum("vendor_category", ["Maintenance", "Utilities", "Insurance", "Legal", "Marketing", "Property_Management", "Landscaping", "Cleaning", "Security", "Other"]);
export const paymentTermsEnum = pgEnum("payment_terms", ["Net15", "Net30", "Net45", "Net60", "Net90", "Immediate"]);
export const vendorInvoiceStatusEnum = pgEnum("vendor_invoice_status", ["pending", "paid_instant", "paid_traditional", "overdue"]);
// Merchant Transaction System Enums - For 1-3 day settlement float
export const merchantCategoryEnum = pgEnum("merchant_category", ["Grocery", "Restaurants", "Transportation", "Entertainment", "Shopping", "Services", "Utilities", "Health", "Other"]);
export const merchantTransactionStatusEnum = pgEnum("merchant_transaction_status", ["pending", "settled", "refunded"]);
// Crypto Treasury Enums - For automated stablecoin yield orchestration
export const cryptoTreasuryFlowTypeEnum = pgEnum("crypto_treasury_flow_type", ["bridge_inbound", "bridge_outbound", "wallet_transfer", "deployment_in", "deployment_out", "yield_accrual"]);
export const cryptoDeploymentStatusEnum = pgEnum("crypto_deployment_status", ["pending", "active", "matured", "withdrawn"]);

// Organizations table
export const organizations = pgTable("organizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Users table with roles and multitenancy
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  organizationId: varchar("organization_id").references(() => organizations.id, { onDelete: "cascade" }), // Nullable for vendor users who span multiple orgs
  role: userRoleEnum("role").notNull().default("Analyst"),
  tenantId: varchar("tenant_id").references(() => tenants.id, { onDelete: "set null" }), // Link tenant-role users to tenant records
  vendorId: varchar("vendor_id").references(() => vendors.id, { onDelete: "set null" }), // Link vendor-role users to primary vendor record
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Magic codes for demo login
export const magicCodes = pgTable("magic_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false).notNull(),
});

// Properties
export const properties = pgTable("properties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  address: text("address").notNull(),
  unitCount: integer("unit_count").notNull(),
  monthlyOpex: decimal("monthly_opex", { precision: 10, scale: 2 }).notNull(),
});

// Units
export const units = pgTable("units", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
  unitNumber: text("unit_number").notNull(),
});

// Tenants
export const tenants = pgTable("tenants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
});

// Leases
export const leases = pgTable("leases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  unitId: varchar("unit_id").notNull().references(() => units.id, { onDelete: "cascade" }),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  monthlyRent: decimal("monthly_rent", { precision: 10, scale: 2 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  active: boolean("active").default(true).notNull(),
});

// Invoices
export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leaseId: varchar("lease_id").notNull().references(() => leases.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp("due_date").notNull(),
  status: invoiceStatusEnum("status").notNull().default("pending"),
  paidDate: timestamp("paid_date"),
});

// Payments
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: timestamp("payment_date").notNull(),
  method: paymentMethodEnum("method").notNull(),
});

// Bank Ledger entries
export const bankLedger = pgTable("bank_ledger", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  description: text("description").notNull(),
  matched: boolean("matched").default(false).notNull(),
  matchedPaymentId: varchar("matched_payment_id").references(() => payments.id),
});

// PMS Import Jobs
export const pmsImportJobs = pgTable("pms_import_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  provider: pmsProviderEnum("provider").notNull(),
  status: text("status").notNull(),
  recordsImported: integer("records_imported").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Treasury Products (static definitions)
export const treasuryProducts = pgTable("treasury_products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productType: treasuryProductTypeEnum("product_type").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  currentYield: decimal("current_yield", { precision: 5, scale: 2 }).notNull(),
  wam: integer("wam").notNull(), // Weighted Average Maturity in days
  targetDuration: integer("target_duration").notNull(),
  managementFee: decimal("management_fee", { precision: 4, scale: 2 }).notNull(),
  platformFee: decimal("platform_fee", { precision: 4, scale: 2 }).notNull(),
  ocRatio: decimal("oc_ratio", { precision: 4, scale: 2 }), // Only for NRC
});

// Treasury Subscriptions
export const treasurySubscriptions = pgTable("treasury_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  productId: varchar("product_id").notNull().references(() => treasuryProducts.id, { onDelete: "cascade" }),
  balance: decimal("balance", { precision: 12, scale: 2 }).notNull().default("0"),
  autoRoll: boolean("auto_roll").default(false).notNull(),
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
});

// Audit Logs
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: text("entity_id"),
  metadata: text("metadata"), // JSON string
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Settings
export const organizationSettings = pgTable("organization_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().unique().references(() => organizations.id, { onDelete: "cascade" }),
  complianceMode: complianceModeEnum("compliance_mode").notNull().default("indirect_only"),
  pmsProvider: pmsProviderEnum("pms_provider"),
  pmsApiKey: text("pms_api_key"),
  // Rent Float Treasury Configuration
  rentFloatEnabled: boolean("rent_float_enabled").default(true).notNull(),
  rentFloatYieldRate: decimal("rent_float_yield_rate", { precision: 5, scale: 2 }).default("5.50").notNull(), // Annual yield rate %
  rentFloatOwnerShare: decimal("rent_float_owner_share", { precision: 4, scale: 2 }).default("3.00").notNull(), // Owner share %
  rentFloatTenantShare: decimal("rent_float_tenant_share", { precision: 4, scale: 2 }).default("1.25").notNull(), // Tenant share %
  rentFloatNaltosShare: decimal("rent_float_naltos_share", { precision: 4, scale: 2 }).default("0.75").notNull(), // Naltos share %
  rentFloatDefaultDuration: integer("rent_float_default_duration").default(10).notNull(), // Days between payment and disbursement
  // Stablecoin Bridge Configuration
  bridgeEnabled: boolean("bridge_enabled").default(false).notNull(),
  bridgeAutoConvert: boolean("bridge_auto_convert").default(true).notNull(), // Auto-convert on receipt vs manual
  bridgeConversionStrategy: bridgeConversionStrategyEnum("bridge_conversion_strategy").default("immediate").notNull(),
  bridgeYieldRate: decimal("bridge_yield_rate", { precision: 5, scale: 2 }).default("4.75").notNull(), // Yield earned on float
  bridgeConversionFeeRate: decimal("bridge_conversion_fee_rate", { precision: 4, scale: 2 }).default("0.30").notNull(), // Conversion fee %
  // AppFolio credentials: Store as env vars (APPFOLIO_API_KEY_{org_id}) or use secrets service
  // DO NOT store sensitive API keys in this table - reference only
  appfolioAccountId: text("appfolio_account_id"),
});

// Vendors - For Net30-90 yield amplification
export const vendors = pgTable("vendors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: vendorCategoryEnum("category").notNull(),
  email: text("email"),
  phone: text("phone"),
  defaultPaymentTerms: paymentTermsEnum("default_payment_terms").notNull().default("Net30"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Vendor Balances - Tracks NUSD balance for each vendor across all orgs they work with
// Note: vendors table has organizationId, so each vendor record is specific to one property management company
// If "ABC Plumbing" works with 3 property managers, there are 3 vendor records
// vendor_balances tracks NUSD balance for each vendor record (which is already org-specific)
export const vendorBalances = pgTable("vendor_balances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  nusdBalance: decimal("nusd_balance", { precision: 12, scale: 2 }).notNull().default("0"), // Current NUSD balance
  totalReceived: decimal("total_received", { precision: 12, scale: 2 }).notNull().default("0"), // Lifetime NUSD received
  totalRedeemed: decimal("total_redeemed", { precision: 12, scale: 2 }).notNull().default("0"), // Lifetime USD redeemed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  vendorOrgIdx: uniqueIndex("vendor_balances_vendor_org_idx").on(table.vendorId, table.organizationId),
}));

// Vendor Redemptions - Tracks all payout requests from vendors
export const vendorRedemptions = pgTable("vendor_redemptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  payoutMethodId: varchar("payout_method_id").references(() => vendorPayoutMethods.id, { onDelete: "set null" }),
  rail: payoutRailEnum("rail").notNull(), // ACH, PushToCard, OnChainStablecoin
  nusdAmount: decimal("nusd_amount", { precision: 12, scale: 2 }).notNull(), // Amount being redeemed
  usdAmount: decimal("usd_amount", { precision: 12, scale: 2 }).notNull(), // USD equivalent (1:1 for NUSD)
  feeAmount: decimal("fee_amount", { precision: 12, scale: 2 }).notNull().default("0"), // Early redemption or processing fee
  status: redemptionStatusEnum("status").notNull().default("pending"),
  scheduledFor: timestamp("scheduled_for"), // When redemption will be processed (Net30 default)
  processedAt: timestamp("processed_at"), // When actually processed
  completedAt: timestamp("completed_at"), // When funds settled
  failureReason: text("failure_reason"), // If failed, why
  metadata: text("metadata"), // JSON: transaction hashes, confirmation numbers, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Vendor Payout Methods - Stores vendor payout preferences (demo/placeholder data only)
export const vendorPayoutMethods = pgTable("vendor_payout_methods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  rail: payoutRailEnum("rail").notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  // Demo/placeholder fields - NOT storing real sensitive data
  bankName: text("bank_name"), // For ACH: "Chase Bank"
  accountLastFour: text("account_last_four"), // For ACH: "1234"
  cardLastFour: text("card_last_four"), // For PushToCard: "5678"
  walletAddress: text("wallet_address"), // For OnChainStablecoin: "0x123...abc"
  walletType: text("wallet_type"), // For OnChainStablecoin: "USDC", "USDT", "DAI"
  // Status tracking
  verified: boolean("verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Vendor Compliance Status - Tracks KYC/verification status (NOT storing actual PII)
export const vendorComplianceStatus = pgTable("vendor_compliance_status", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().unique().references(() => vendors.id, { onDelete: "cascade" }),
  kycStatus: complianceStatusEnum("kyc_status").notNull().default("not_verified"),
  kycSubmittedAt: timestamp("kyc_submitted_at"),
  kycVerifiedAt: timestamp("kyc_verified_at"),
  kycRejectionReason: text("kyc_rejection_reason"),
  // Demo flag - indicates this is stub data for demo purposes
  isDemo: boolean("is_demo").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Vendor User Links - Maps vendor users to ALL vendor records they can access (multi-org support)
// This enables a single vendor login to see invoices/balances across all property managers they work with
export const vendorUserLinks = pgTable("vendor_user_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userVendorIdx: uniqueIndex("vendor_user_links_user_vendor_idx").on(table.userId, table.vendorId),
}));

// Vendor Invoices - Showcases Net30-90 yield generation
export const vendorInvoices = pgTable("vendor_invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  invoiceNumber: text("invoice_number").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  invoiceDate: timestamp("invoice_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  scheduledPaymentDate: timestamp("scheduled_payment_date").notNull(), // When vendor would be paid traditionally (Net30/60/90)
  paymentTerms: paymentTermsEnum("payment_terms").notNull(),
  status: vendorInvoiceStatusEnum("status").notNull().default("pending"),
  paidDate: timestamp("paid_date"),
  advanceDate: timestamp("advance_date"), // When instant payment was triggered
  paidViaInstant: boolean("paid_via_instant").default(false).notNull(), // True if paid instantly via Naltos
  instantAdvanceAmount: decimal("instant_advance_amount", { precision: 10, scale: 2 }), // Amount advanced instantly (may be partial)
  floatDurationDays: integer("float_duration_days"), // Computed: scheduledPaymentDate - advanceDate
  floatYieldRate: decimal("float_yield_rate", { precision: 5, scale: 2 }), // Snapshot of yield rate at payment time
  yieldGenerated: decimal("yield_generated", { precision: 10, scale: 2 }), // Server-calculated yield
  description: text("description"),
}, (table) => ({
  uniqueInvoiceNumber: sql`UNIQUE (organization_id, invoice_number)`,
}));

// Merchants - Consumer merchants where tenants spend NUSD
export const merchants = pgTable("merchants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: merchantCategoryEnum("category").notNull(),
  description: text("description"),
  logoUrl: text("logo_url"),
  settlementDays: integer("settlement_days").notNull().default(2), // 1-3 days settlement float
  yieldRate: decimal("yield_rate", { precision: 5, scale: 2 }).notNull().default("5.50"), // APY for settlement float
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Merchant Transactions - Tenant purchases at merchants generating 1-3 day settlement float
export const merchantTransactions = pgTable("merchant_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  merchantId: varchar("merchant_id").notNull().references(() => merchants.id, { onDelete: "cascade" }),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  transactionDate: timestamp("transaction_date").defaultNow().notNull(),
  settlementDate: timestamp("settlement_date").notNull(), // When merchant receives funds (1-3 days later)
  status: merchantTransactionStatusEnum("status").notNull().default("pending"),
  settledAt: timestamp("settled_at"),
  settlementDays: integer("settlement_days").notNull(), // Actual settlement float duration
  yieldRate: decimal("yield_rate", { precision: 5, scale: 2 }).notNull(), // Snapshot of yield rate at transaction time
  yieldGenerated: decimal("yield_generated", { precision: 10, scale: 2 }).notNull(), // Calculated: amount * (settlementDays/365) * (yieldRate/100)
  propertyYieldShare: decimal("property_yield_share", { precision: 10, scale: 2 }).notNull(), // Property owner share (80% of yield)
  tenantYieldShare: decimal("tenant_yield_share", { precision: 10, scale: 2 }).notNull(), // Tenant share (12.5% of yield)
  platformYieldShare: decimal("platform_yield_share", { precision: 10, scale: 2 }).notNull(), // Platform share (7.5% of yield)
  description: text("description"),
});

// Merchant Balances - Tracks NUSD balance and settlement amounts for each merchant
// IMPORTANT: organizationId MUST match merchants.organizationId (enforced in application layer)
export const merchantBalances = pgTable("merchant_balances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  merchantId: varchar("merchant_id").notNull().unique().references(() => merchants.id, { onDelete: "cascade" }),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  nusdBalance: decimal("nusd_balance", { precision: 12, scale: 2 }).notNull().default("0"), // Current NUSD balance available
  pendingSettlement: decimal("pending_settlement", { precision: 12, scale: 2 }).notNull().default("0"), // Amount in 1-3 day settlement window
  totalReceived: decimal("total_received", { precision: 12, scale: 2 }).notNull().default("0"), // Lifetime transaction volume
  totalSettled: decimal("total_settled", { precision: 12, scale: 2 }).notNull().default("0"), // Lifetime settled to USD
  totalYieldGenerated: decimal("total_yield_generated", { precision: 12, scale: 2 }).notNull().default("0"), // Lifetime yield from float
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Merchant User Links - Maps merchant users to merchant records they can access
export const merchantUserLinks = pgTable("merchant_user_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  merchantId: varchar("merchant_id").notNull().references(() => merchants.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userMerchantIdx: uniqueIndex("merchant_user_links_user_merchant_idx").on(table.userId, table.merchantId),
}));

// Vendor Stablecoin Allocations - Shows how vendor NUSD balances are backed by real stablecoins (USDC/USDT/DAI)
export const vendorStablecoinAllocations = pgTable("vendor_stablecoin_allocations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorBalanceId: varchar("vendor_balance_id").notNull().references(() => vendorBalances.id, { onDelete: "cascade" }),
  coin: cryptoCoinEnum("coin").notNull(), // USDC, USDT, DAI (not NUSD)
  allocatedAmount: decimal("allocated_amount", { precision: 18, scale: 8 }).notNull(), // Amount of this stablecoin backing NUSD
  nusdEquivalent: decimal("nusd_equivalent", { precision: 12, scale: 2 }).notNull(), // NUSD amount backed (1:1 ratio)
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
}, (table) => ({
  balanceCoinIdx: uniqueIndex("vendor_stablecoin_allocations_balance_coin_idx").on(table.vendorBalanceId, table.coin),
}));

// Merchant Stablecoin Allocations - Shows how merchant NUSD balances are backed by real stablecoins (USDC/USDT/DAI)
export const merchantStablecoinAllocations = pgTable("merchant_stablecoin_allocations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  merchantBalanceId: varchar("merchant_balance_id").notNull().references(() => merchantBalances.id, { onDelete: "cascade" }),
  coin: cryptoCoinEnum("coin").notNull(), // USDC, USDT, DAI (not NUSD)
  allocatedAmount: decimal("allocated_amount", { precision: 18, scale: 8 }).notNull(), // Amount of this stablecoin backing NUSD
  nusdEquivalent: decimal("nusd_equivalent", { precision: 12, scale: 2 }).notNull(), // NUSD amount backed (1:1 ratio)
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
}, (table) => ({
  balanceCoinIdx: uniqueIndex("merchant_stablecoin_allocations_balance_coin_idx").on(table.merchantBalanceId, table.coin),
}));

// Vendor Treasury Allocations - Shows which treasury products (NRF/NRK/NRC) hold vendor stablecoins generating yield
export const vendorTreasuryAllocations = pgTable("vendor_treasury_allocations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorBalanceId: varchar("vendor_balance_id").notNull().references(() => vendorBalances.id, { onDelete: "cascade" }),
  treasuryProductId: varchar("treasury_product_id").notNull().references(() => treasuryProducts.id, { onDelete: "cascade" }),
  coin: cryptoCoinEnum("coin").notNull(), // USDC, USDT, DAI
  allocatedAmount: decimal("allocated_amount", { precision: 18, scale: 8 }).notNull(), // Amount deployed in this product
  currentYield: decimal("current_yield", { precision: 5, scale: 2 }).notNull(), // Current APY of product
  yieldAccrued: decimal("yield_accrued", { precision: 18, scale: 8 }).notNull().default("0"), // Yield earned so far
  deployedAt: timestamp("deployed_at").defaultNow().notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
}, (table) => ({
  balanceProductCoinIdx: uniqueIndex("vendor_treasury_allocations_balance_product_coin_idx").on(table.vendorBalanceId, table.treasuryProductId, table.coin),
}));

// Merchant Treasury Allocations - Shows which treasury products (NRF/NRK/NRC) hold merchant stablecoins generating yield
export const merchantTreasuryAllocations = pgTable("merchant_treasury_allocations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  merchantBalanceId: varchar("merchant_balance_id").notNull().references(() => merchantBalances.id, { onDelete: "cascade" }),
  treasuryProductId: varchar("treasury_product_id").notNull().references(() => treasuryProducts.id, { onDelete: "cascade" }),
  coin: cryptoCoinEnum("coin").notNull(), // USDC, USDT, DAI
  allocatedAmount: decimal("allocated_amount", { precision: 18, scale: 8 }).notNull(), // Amount deployed in this product
  currentYield: decimal("current_yield", { precision: 5, scale: 2 }).notNull(), // Current APY of product
  yieldAccrued: decimal("yield_accrued", { precision: 18, scale: 8 }).notNull().default("0"), // Yield earned so far
  deployedAt: timestamp("deployed_at").defaultNow().notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
}, (table) => ({
  balanceProductCoinIdx: uniqueIndex("merchant_treasury_allocations_balance_product_coin_idx").on(table.merchantBalanceId, table.treasuryProductId, table.coin),
}));

// Tenant Wallets - for consumer-side balance and yield accounts
export const tenantWallets = pgTable("tenant_wallets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().unique().references(() => tenants.id, { onDelete: "cascade" }),
  balance: decimal("balance", { precision: 12, scale: 2 }).notNull().default("0"),
  yieldOptIn: boolean("yield_opt_in").default(false).notNull(),
  yieldBalance: decimal("yield_balance", { precision: 12, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tenant Payment Methods
export const tenantPaymentMethods = pgTable("tenant_payment_methods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  method: paymentMethodEnum("method").notNull(),
  lastFourDigits: text("last_four_digits"),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Crypto Wallets - for both business and tenant stablecoin management
export const cryptoWallets = pgTable("crypto_wallets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
  tenantId: varchar("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  coin: cryptoCoinEnum("coin").notNull(),
  balance: decimal("balance", { precision: 18, scale: 8 }).notNull().default("0"),
  depositAddress: text("deposit_address"), // Mock address for demo
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Crypto Transactions - transaction history for crypto operations
export const cryptoTransactions = pgTable("crypto_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletId: varchar("wallet_id").notNull().references(() => cryptoWallets.id, { onDelete: "cascade" }),
  transactionType: cryptoTransactionTypeEnum("transaction_type").notNull(),
  fromCoin: cryptoCoinEnum("from_coin"),
  toCoin: cryptoCoinEnum("to_coin"),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  usdValue: decimal("usd_value", { precision: 12, scale: 2 }),
  exchangeRate: decimal("exchange_rate", { precision: 12, scale: 6 }),
  status: text("status").notNull().default("completed"), // completed, pending, failed
  txHash: text("tx_hash"), // Mock transaction hash
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// TODO: Bridge Conversion Jobs - Schema complete, backend/UI deferred
// Future: Enables crypto→fiat rent payments and fiat→crypto vendor payouts
// Gate behind organization_settings.bridgeEnabled flag
export const bridgeConversionJobs = pgTable("bridge_conversion_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  direction: bridgeDirectionEnum("direction").notNull(), // inbound (crypto→fiat) or outbound (fiat→crypto)
  status: bridgeStatusEnum("status").notNull().default("pending"),
  conversionStrategy: bridgeConversionStrategyEnum("conversion_strategy").notNull().default("immediate"),
  invoiceId: varchar("invoice_id").references(() => invoices.id), // For inbound rent payments (optional)
  cryptoTransactionId: varchar("crypto_transaction_id").references(() => cryptoTransactions.id),
  // Inbound (crypto→fiat): fromCoin + cryptoAmount → fiatAmount
  // Outbound (fiat→crypto): fiatAmount → toCoin + cryptoAmount
  fromCoin: cryptoCoinEnum("from_coin"), // For inbound conversions
  toCoin: cryptoCoinEnum("to_coin"), // For outbound conversions
  cryptoAmount: decimal("crypto_amount", { precision: 18, scale: 8 }),
  fiatAmount: decimal("fiat_amount", { precision: 12, scale: 2 }), // USD amount (source for outbound, target for inbound)
  slippageTolerance: decimal("slippage_tolerance", { precision: 5, scale: 2 }).default("0.5"), // 0.5% default
  scheduledFor: timestamp("scheduled_for"), // For delayed conversions
  floatStartedAt: timestamp("float_started_at"), // When funds were received
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// TODO: Bridge Conversions - Execution records (deferred implementation)
export const bridgeConversions = pgTable("bridge_conversions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull().references(() => bridgeConversionJobs.id, { onDelete: "cascade" }),
  cryptoAmount: decimal("crypto_amount", { precision: 18, scale: 8 }).notNull(),
  usdAmount: decimal("usd_amount", { precision: 12, scale: 2 }).notNull(),
  exchangeRate: decimal("exchange_rate", { precision: 12, scale: 6 }).notNull(),
  conversionFee: decimal("conversion_fee", { precision: 12, scale: 2 }).notNull(),
  yieldEarned: decimal("yield_earned", { precision: 12, scale: 2 }).default("0"), // Yield from holding float
  floatDuration: integer("float_duration"), // Days between receipt and conversion
  executedAt: timestamp("executed_at").defaultNow().notNull(),
});

// TODO: Bridge Sync Logs - PMS integration audit trail (deferred)
export const bridgeSyncLogs = pgTable("bridge_sync_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  conversionId: varchar("conversion_id").references(() => bridgeConversions.id),
  direction: bridgeDirectionEnum("direction").notNull(),
  provider: pmsProviderEnum("provider").notNull(), // AppFolio, Yardi, Buildium
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, success, failed
  pmsTransactionId: text("pms_transaction_id"), // External system ID
  retryCount: integer("retry_count").default(0).notNull(),
  lastError: text("last_error"),
  syncedAt: timestamp("synced_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// TODO: Bridge Payment Links - Audit trail for crypto→invoice linking (deferred)
export const bridgePaymentLinks = pgTable("bridge_payment_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
  cryptoTransactionId: varchar("crypto_transaction_id").references(() => cryptoTransactions.id),
  paymentId: varchar("payment_id").references(() => payments.id),
  conversionJobId: varchar("conversion_job_id").references(() => bridgeConversionJobs.id),
  allocationAmount: decimal("allocation_amount", { precision: 12, scale: 2 }).notNull(), // For partial payments
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ====== CRYPTO TREASURY ORCHESTRATION ======
// Automated stablecoin deployment into yield-generating treasury products

// Crypto Treasury Positions - Materialized snapshot of organization's stablecoin balances
export const cryptoTreasuryPositions = pgTable("crypto_treasury_positions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  coin: cryptoCoinEnum("coin").notNull(), // USDC, USDT, DAI, NUSD
  asOf: timestamp("as_of").defaultNow().notNull(), // Snapshot timestamp
  availableBalance: decimal("available_balance", { precision: 18, scale: 8 }).notNull().default("0"), // Idle balance ready for deployment
  deployedBalance: decimal("deployed_balance", { precision: 18, scale: 8 }).notNull().default("0"), // Currently deployed in treasury products
  reservedBalance: decimal("reserved_balance", { precision: 18, scale: 8 }).notNull().default("0"), // Reserved for pending operations
  totalYieldAccrued: decimal("total_yield_accrued", { precision: 18, scale: 8 }).notNull().default("0"), // Lifetime yield from deployments
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  // Unique constraint to prevent duplicate snapshots for same org/coin/timestamp
  orgCoinAsOfUnique: sql`UNIQUE (organization_id, coin, as_of)`,
}));

// Crypto Treasury Deployments - Tracks stablecoin deployments into treasury products
export const cryptoTreasuryDeployments = pgTable("crypto_treasury_deployments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  treasuryProductId: varchar("treasury_product_id").notNull().references(() => treasuryProducts.id, { onDelete: "restrict" }),
  sourceWalletId: varchar("source_wallet_id").notNull().references(() => cryptoWallets.id, { onDelete: "restrict" }), // Required: must track source wallet
  coin: cryptoCoinEnum("coin").notNull(), // Stablecoin used for deployment
  deploymentAmount: decimal("deployment_amount", { precision: 18, scale: 8 }).notNull(), // Amount deployed
  status: cryptoDeploymentStatusEnum("status").notNull().default("pending"),
  deployedAt: timestamp("deployed_at").defaultNow().notNull(),
  maturityDate: timestamp("maturity_date"), // Expected maturity/redemption date
  withdrawnAt: timestamp("withdrawn_at"), // Actual withdrawal timestamp
  cumulativeYield: decimal("cumulative_yield", { precision: 18, scale: 8 }).notNull().default("0"), // Total yield earned
  reinvestPolicy: boolean("reinvest_policy").default(true).notNull(), // Auto-reinvest yield
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Crypto Treasury Flows - Event stream tracking all crypto treasury movements
export const cryptoTreasuryFlows = pgTable("crypto_treasury_flows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  flowType: cryptoTreasuryFlowTypeEnum("flow_type").notNull(), // bridge_inbound, deployment_in, yield_accrual, etc.
  coin: cryptoCoinEnum("coin").notNull(),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  // Foreign key references for audit trail
  bridgeConversionJobId: varchar("bridge_conversion_job_id").references(() => bridgeConversionJobs.id, { onDelete: "set null" }),
  bridgeConversionId: varchar("bridge_conversion_id").references(() => bridgeConversions.id, { onDelete: "set null" }),
  cryptoTransactionId: varchar("crypto_transaction_id").references(() => cryptoTransactions.id, { onDelete: "set null" }),
  deploymentId: varchar("deployment_id").references(() => cryptoTreasuryDeployments.id, { onDelete: "set null" }),
  description: text("description"), // Human-readable description of the flow
  metadata: text("metadata"), // JSON metadata for additional context
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  properties: many(properties),
  tenants: many(tenants),
  vendors: many(vendors),
  vendorInvoices: many(vendorInvoices),
  merchants: many(merchants),
  merchantTransactions: many(merchantTransactions),
  bankLedger: many(bankLedger),
  pmsImportJobs: many(pmsImportJobs),
  treasurySubscriptions: many(treasurySubscriptions),
  auditLogs: many(auditLogs),
  settings: many(organizationSettings),
  cryptoWallets: many(cryptoWallets),
}));

export const usersRelations = relations(users, ({ one }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
  vendor: one(vendors, {
    fields: [users.vendorId],
    references: [vendors.id],
  }),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [properties.organizationId],
    references: [organizations.id],
  }),
  units: many(units),
}));

export const unitsRelations = relations(units, ({ one, many }) => ({
  property: one(properties, {
    fields: [units.propertyId],
    references: [properties.id],
  }),
  leases: many(leases),
}));

export const tenantsRelations = relations(tenants, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [tenants.organizationId],
    references: [organizations.id],
  }),
  leases: many(leases),
  wallet: one(tenantWallets),
  paymentMethods: many(tenantPaymentMethods),
  cryptoWallets: many(cryptoWallets),
  merchantTransactions: many(merchantTransactions),
}));

export const leasesRelations = relations(leases, ({ one, many }) => ({
  unit: one(units, {
    fields: [leases.unitId],
    references: [units.id],
  }),
  tenant: one(tenants, {
    fields: [leases.tenantId],
    references: [tenants.id],
  }),
  invoices: many(invoices),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  lease: one(leases, {
    fields: [invoices.leaseId],
    references: [leases.id],
  }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id],
  }),
}));

export const bankLedgerRelations = relations(bankLedger, ({ one }) => ({
  organization: one(organizations, {
    fields: [bankLedger.organizationId],
    references: [organizations.id],
  }),
  matchedPayment: one(payments, {
    fields: [bankLedger.matchedPaymentId],
    references: [payments.id],
  }),
}));

export const treasuryProductsRelations = relations(treasuryProducts, ({ many }) => ({
  subscriptions: many(treasurySubscriptions),
}));

export const treasurySubscriptionsRelations = relations(treasurySubscriptions, ({ one }) => ({
  organization: one(organizations, {
    fields: [treasurySubscriptions.organizationId],
    references: [organizations.id],
  }),
  product: one(treasuryProducts, {
    fields: [treasurySubscriptions.productId],
    references: [treasuryProducts.id],
  }),
}));

export const tenantWalletsRelations = relations(tenantWallets, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantWallets.tenantId],
    references: [tenants.id],
  }),
}));

export const tenantPaymentMethodsRelations = relations(tenantPaymentMethods, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantPaymentMethods.tenantId],
    references: [tenants.id],
  }),
}));

export const cryptoWalletsRelations = relations(cryptoWallets, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [cryptoWallets.organizationId],
    references: [organizations.id],
  }),
  tenant: one(tenants, {
    fields: [cryptoWallets.tenantId],
    references: [tenants.id],
  }),
  transactions: many(cryptoTransactions),
}));

export const cryptoTransactionsRelations = relations(cryptoTransactions, ({ one }) => ({
  wallet: one(cryptoWallets, {
    fields: [cryptoTransactions.walletId],
    references: [cryptoWallets.id],
  }),
}));

export const bridgeConversionJobsRelations = relations(bridgeConversionJobs, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [bridgeConversionJobs.organizationId],
    references: [organizations.id],
  }),
  invoice: one(invoices, {
    fields: [bridgeConversionJobs.invoiceId],
    references: [invoices.id],
  }),
  cryptoTransaction: one(cryptoTransactions, {
    fields: [bridgeConversionJobs.cryptoTransactionId],
    references: [cryptoTransactions.id],
  }),
  conversions: many(bridgeConversions),
}));

export const bridgeConversionsRelations = relations(bridgeConversions, ({ one, many }) => ({
  job: one(bridgeConversionJobs, {
    fields: [bridgeConversions.jobId],
    references: [bridgeConversionJobs.id],
  }),
  syncLogs: many(bridgeSyncLogs),
}));

export const bridgeSyncLogsRelations = relations(bridgeSyncLogs, ({ one }) => ({
  organization: one(organizations, {
    fields: [bridgeSyncLogs.organizationId],
    references: [organizations.id],
  }),
  conversion: one(bridgeConversions, {
    fields: [bridgeSyncLogs.conversionId],
    references: [bridgeConversions.id],
  }),
}));

export const bridgePaymentLinksRelations = relations(bridgePaymentLinks, ({ one }) => ({
  invoice: one(invoices, {
    fields: [bridgePaymentLinks.invoiceId],
    references: [invoices.id],
  }),
  cryptoTransaction: one(cryptoTransactions, {
    fields: [bridgePaymentLinks.cryptoTransactionId],
    references: [cryptoTransactions.id],
  }),
  payment: one(payments, {
    fields: [bridgePaymentLinks.paymentId],
    references: [payments.id],
  }),
  conversionJob: one(bridgeConversionJobs, {
    fields: [bridgePaymentLinks.conversionJobId],
    references: [bridgeConversionJobs.id],
  }),
}));

export const vendorsRelations = relations(vendors, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [vendors.organizationId],
    references: [organizations.id],
  }),
  invoices: many(vendorInvoices),
}));

export const vendorInvoicesRelations = relations(vendorInvoices, ({ one }) => ({
  vendor: one(vendors, {
    fields: [vendorInvoices.vendorId],
    references: [vendors.id],
  }),
  organization: one(organizations, {
    fields: [vendorInvoices.organizationId],
    references: [organizations.id],
  }),
}));

export const vendorBalancesRelations = relations(vendorBalances, ({ one, many }) => ({
  vendor: one(vendors, {
    fields: [vendorBalances.vendorId],
    references: [vendors.id],
  }),
  organization: one(organizations, {
    fields: [vendorBalances.organizationId],
    references: [organizations.id],
  }),
  stablecoinAllocations: many(vendorStablecoinAllocations),
  treasuryAllocations: many(vendorTreasuryAllocations),
}));

export const vendorRedemptionsRelations = relations(vendorRedemptions, ({ one }) => ({
  vendor: one(vendors, {
    fields: [vendorRedemptions.vendorId],
    references: [vendors.id],
  }),
  organization: one(organizations, {
    fields: [vendorRedemptions.organizationId],
    references: [organizations.id],
  }),
  payoutMethod: one(vendorPayoutMethods, {
    fields: [vendorRedemptions.payoutMethodId],
    references: [vendorPayoutMethods.id],
  }),
}));

export const vendorPayoutMethodsRelations = relations(vendorPayoutMethods, ({ one, many }) => ({
  vendor: one(vendors, {
    fields: [vendorPayoutMethods.vendorId],
    references: [vendors.id],
  }),
  redemptions: many(vendorRedemptions),
}));

export const vendorComplianceStatusRelations = relations(vendorComplianceStatus, ({ one }) => ({
  vendor: one(vendors, {
    fields: [vendorComplianceStatus.vendorId],
    references: [vendors.id],
  }),
}));

export const vendorUserLinksRelations = relations(vendorUserLinks, ({ one }) => ({
  user: one(users, {
    fields: [vendorUserLinks.userId],
    references: [users.id],
  }),
  vendor: one(vendors, {
    fields: [vendorUserLinks.vendorId],
    references: [vendors.id],
  }),
}));

export const merchantsRelations = relations(merchants, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [merchants.organizationId],
    references: [organizations.id],
  }),
  transactions: many(merchantTransactions),
}));

export const merchantTransactionsRelations = relations(merchantTransactions, ({ one }) => ({
  merchant: one(merchants, {
    fields: [merchantTransactions.merchantId],
    references: [merchants.id],
  }),
  tenant: one(tenants, {
    fields: [merchantTransactions.tenantId],
    references: [tenants.id],
  }),
  organization: one(organizations, {
    fields: [merchantTransactions.organizationId],
    references: [organizations.id],
  }),
}));

export const merchantBalancesRelations = relations(merchantBalances, ({ one, many }) => ({
  merchant: one(merchants, {
    fields: [merchantBalances.merchantId],
    references: [merchants.id],
  }),
  organization: one(organizations, {
    fields: [merchantBalances.organizationId],
    references: [organizations.id],
  }),
  stablecoinAllocations: many(merchantStablecoinAllocations),
  treasuryAllocations: many(merchantTreasuryAllocations),
}));

export const merchantUserLinksRelations = relations(merchantUserLinks, ({ one }) => ({
  user: one(users, {
    fields: [merchantUserLinks.userId],
    references: [users.id],
  }),
  merchant: one(merchants, {
    fields: [merchantUserLinks.merchantId],
    references: [merchants.id],
  }),
}));

export const vendorStablecoinAllocationsRelations = relations(vendorStablecoinAllocations, ({ one }) => ({
  vendorBalance: one(vendorBalances, {
    fields: [vendorStablecoinAllocations.vendorBalanceId],
    references: [vendorBalances.id],
  }),
}));

export const merchantStablecoinAllocationsRelations = relations(merchantStablecoinAllocations, ({ one }) => ({
  merchantBalance: one(merchantBalances, {
    fields: [merchantStablecoinAllocations.merchantBalanceId],
    references: [merchantBalances.id],
  }),
}));

export const vendorTreasuryAllocationsRelations = relations(vendorTreasuryAllocations, ({ one }) => ({
  vendorBalance: one(vendorBalances, {
    fields: [vendorTreasuryAllocations.vendorBalanceId],
    references: [vendorBalances.id],
  }),
  treasuryProduct: one(treasuryProducts, {
    fields: [vendorTreasuryAllocations.treasuryProductId],
    references: [treasuryProducts.id],
  }),
}));

export const merchantTreasuryAllocationsRelations = relations(merchantTreasuryAllocations, ({ one }) => ({
  merchantBalance: one(merchantBalances, {
    fields: [merchantTreasuryAllocations.merchantBalanceId],
    references: [merchantBalances.id],
  }),
  treasuryProduct: one(treasuryProducts, {
    fields: [merchantTreasuryAllocations.treasuryProductId],
    references: [treasuryProducts.id],
  }),
}));

export const cryptoTreasuryPositionsRelations = relations(cryptoTreasuryPositions, ({ one }) => ({
  organization: one(organizations, {
    fields: [cryptoTreasuryPositions.organizationId],
    references: [organizations.id],
  }),
}));

export const cryptoTreasuryDeploymentsRelations = relations(cryptoTreasuryDeployments, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [cryptoTreasuryDeployments.organizationId],
    references: [organizations.id],
  }),
  treasuryProduct: one(treasuryProducts, {
    fields: [cryptoTreasuryDeployments.treasuryProductId],
    references: [treasuryProducts.id],
  }),
  sourceWallet: one(cryptoWallets, {
    fields: [cryptoTreasuryDeployments.sourceWalletId],
    references: [cryptoWallets.id],
  }),
  flows: many(cryptoTreasuryFlows),
}));

export const cryptoTreasuryFlowsRelations = relations(cryptoTreasuryFlows, ({ one }) => ({
  organization: one(organizations, {
    fields: [cryptoTreasuryFlows.organizationId],
    references: [organizations.id],
  }),
  bridgeConversionJob: one(bridgeConversionJobs, {
    fields: [cryptoTreasuryFlows.bridgeConversionJobId],
    references: [bridgeConversionJobs.id],
  }),
  bridgeConversion: one(bridgeConversions, {
    fields: [cryptoTreasuryFlows.bridgeConversionId],
    references: [bridgeConversions.id],
  }),
  cryptoTransaction: one(cryptoTransactions, {
    fields: [cryptoTreasuryFlows.cryptoTransactionId],
    references: [cryptoTransactions.id],
  }),
  deployment: one(cryptoTreasuryDeployments, {
    fields: [cryptoTreasuryFlows.deploymentId],
    references: [cryptoTreasuryDeployments.id],
  }),
}));

// Insert schemas
export const insertOrganizationSchema = createInsertSchema(organizations).omit({ id: true, createdAt: true });
export const insertVendorSchema = createInsertSchema(vendors).omit({ id: true, createdAt: true });
export const insertVendorInvoiceSchema = createInsertSchema(vendorInvoices).omit({ id: true, floatDurationDays: true, yieldGenerated: true });
export const insertMerchantSchema = createInsertSchema(merchants).omit({ id: true, createdAt: true });
export const insertMerchantTransactionSchema = createInsertSchema(merchantTransactions).omit({ 
  id: true,
  transactionDate: true,
  settlementDate: true,
  settlementDays: true,
  yieldRate: true,
  yieldGenerated: true,
  tenantYieldShare: true,
  status: true,
  settledAt: true,
});
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertMagicCodeSchema = createInsertSchema(magicCodes).omit({ id: true });
export const insertPropertySchema = createInsertSchema(properties).omit({ id: true });
export const insertUnitSchema = createInsertSchema(units).omit({ id: true });
export const insertTenantSchema = createInsertSchema(tenants).omit({ id: true });
export const insertLeaseSchema = createInsertSchema(leases).omit({ id: true });
export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true });
export const insertBankLedgerSchema = createInsertSchema(bankLedger).omit({ id: true });
export const insertPmsImportJobSchema = createInsertSchema(pmsImportJobs).omit({ id: true, createdAt: true });
export const insertTreasuryProductSchema = createInsertSchema(treasuryProducts).omit({ id: true });
export const insertTreasurySubscriptionSchema = createInsertSchema(treasurySubscriptions).omit({ id: true, subscribedAt: true });
export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true, createdAt: true });
export const insertOrganizationSettingsSchema = createInsertSchema(organizationSettings).omit({ id: true });
export const insertTenantWalletSchema = createInsertSchema(tenantWallets).omit({ id: true, createdAt: true });
export const insertTenantPaymentMethodSchema = createInsertSchema(tenantPaymentMethods).omit({ id: true, createdAt: true });
export const insertCryptoWalletSchema = createInsertSchema(cryptoWallets).omit({ id: true, createdAt: true });
export const insertCryptoTransactionSchema = createInsertSchema(cryptoTransactions).omit({ id: true, createdAt: true });
export const insertBridgeConversionJobSchema = createInsertSchema(bridgeConversionJobs).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBridgeConversionSchema = createInsertSchema(bridgeConversions).omit({ id: true, executedAt: true });
export const insertBridgeSyncLogSchema = createInsertSchema(bridgeSyncLogs).omit({ id: true, createdAt: true });
export const insertBridgePaymentLinkSchema = createInsertSchema(bridgePaymentLinks).omit({ id: true, createdAt: true });
export const insertCryptoTreasuryPositionSchema = createInsertSchema(cryptoTreasuryPositions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCryptoTreasuryDeploymentSchema = createInsertSchema(cryptoTreasuryDeployments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCryptoTreasuryFlowSchema = createInsertSchema(cryptoTreasuryFlows).omit({ id: true, createdAt: true });
export const insertVendorBalanceSchema = createInsertSchema(vendorBalances).omit({ id: true, createdAt: true, updatedAt: true });
export const insertVendorRedemptionSchema = createInsertSchema(vendorRedemptions).omit({ id: true, createdAt: true });
export const insertVendorPayoutMethodSchema = createInsertSchema(vendorPayoutMethods).omit({ id: true, createdAt: true, updatedAt: true });
export const insertVendorComplianceStatusSchema = createInsertSchema(vendorComplianceStatus).omit({ id: true, createdAt: true, updatedAt: true });
export const insertVendorUserLinkSchema = createInsertSchema(vendorUserLinks).omit({ id: true, createdAt: true });
export const insertMerchantBalanceSchema = createInsertSchema(merchantBalances).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMerchantUserLinkSchema = createInsertSchema(merchantUserLinks).omit({ id: true, createdAt: true });
export const insertVendorStablecoinAllocationSchema = createInsertSchema(vendorStablecoinAllocations).omit({ id: true, lastUpdated: true });
export const insertMerchantStablecoinAllocationSchema = createInsertSchema(merchantStablecoinAllocations).omit({ id: true, lastUpdated: true });
export const insertVendorTreasuryAllocationSchema = createInsertSchema(vendorTreasuryAllocations).omit({ id: true, deployedAt: true, lastUpdated: true });
export const insertMerchantTreasuryAllocationSchema = createInsertSchema(merchantTreasuryAllocations).omit({ id: true, deployedAt: true, lastUpdated: true });

// Types
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type MagicCode = typeof magicCodes.$inferSelect;
export type InsertMagicCode = z.infer<typeof insertMagicCodeSchema>;
export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Unit = typeof units.$inferSelect;
export type InsertUnit = z.infer<typeof insertUnitSchema>;
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type Lease = typeof leases.$inferSelect;
export type InsertLease = z.infer<typeof insertLeaseSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type BankLedger = typeof bankLedger.$inferSelect;
export type InsertBankLedger = z.infer<typeof insertBankLedgerSchema>;
export type PmsImportJob = typeof pmsImportJobs.$inferSelect;
export type InsertPmsImportJob = z.infer<typeof insertPmsImportJobSchema>;
export type TreasuryProduct = typeof treasuryProducts.$inferSelect;
export type InsertTreasuryProduct = z.infer<typeof insertTreasuryProductSchema>;
export type TreasurySubscription = typeof treasurySubscriptions.$inferSelect;
export type InsertTreasurySubscription = z.infer<typeof insertTreasurySubscriptionSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type OrganizationSettings = typeof organizationSettings.$inferSelect;
export type InsertOrganizationSettings = z.infer<typeof insertOrganizationSettingsSchema>;
export type TenantWallet = typeof tenantWallets.$inferSelect;
export type InsertTenantWallet = z.infer<typeof insertTenantWalletSchema>;
export type TenantPaymentMethod = typeof tenantPaymentMethods.$inferSelect;
export type InsertTenantPaymentMethod = z.infer<typeof insertTenantPaymentMethodSchema>;
export type CryptoWallet = typeof cryptoWallets.$inferSelect;
export type InsertCryptoWallet = z.infer<typeof insertCryptoWalletSchema>;
export type CryptoTransaction = typeof cryptoTransactions.$inferSelect;
export type InsertCryptoTransaction = z.infer<typeof insertCryptoTransactionSchema>;

// Additional types for frontend
export type UserRole = "Admin" | "PropertyManager" | "CFO" | "Analyst" | "Tenant" | "Vendor" | "Merchant";
export type InvoiceStatus = "pending" | "paid" | "overdue" | "partial";
export type PaymentMethod = "ACH" | "Card" | "Check" | "Wire";
export type PMSProvider = "AppFolio" | "Yardi" | "Buildium";
export type TreasuryProductType = "NRF" | "NRK" | "NRC";
export type ComplianceMode = "indirect_only" | "accredited_access";
export type CryptoCoin = "USDC" | "USDT" | "DAI" | "NUSD";
export type CryptoTransactionType = "deposit" | "withdrawal" | "conversion" | "rent_payment";
export type BridgeDirection = "inbound" | "outbound";
export type BridgeStatus = "pending" | "converting" | "awaiting_sync" | "settled" | "failed";
export type BridgeConversionStrategy = "immediate" | "daily" | "optimal_yield";
export type CryptoTreasuryFlowType = "bridge_inbound" | "bridge_outbound" | "wallet_transfer" | "deployment_in" | "deployment_out" | "yield_accrual";
export type CryptoDeploymentStatus = "pending" | "active" | "matured" | "withdrawn";
export type PayoutRail = "ACH" | "PushToCard" | "OnChainStablecoin";
export type RedemptionStatus = "pending" | "processing" | "completed" | "failed" | "cancelled";
export type ComplianceStatus = "not_verified" | "pending_review" | "verified" | "rejected";

export type BridgeConversionJob = typeof bridgeConversionJobs.$inferSelect;
export type InsertBridgeConversionJob = z.infer<typeof insertBridgeConversionJobSchema>;
export type BridgeConversion = typeof bridgeConversions.$inferSelect;
export type InsertBridgeConversion = z.infer<typeof insertBridgeConversionSchema>;
export type BridgeSyncLog = typeof bridgeSyncLogs.$inferSelect;
export type InsertBridgeSyncLog = z.infer<typeof insertBridgeSyncLogSchema>;
export type BridgePaymentLink = typeof bridgePaymentLinks.$inferSelect;
export type InsertBridgePaymentLink = z.infer<typeof insertBridgePaymentLinkSchema>;
export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type VendorInvoice = typeof vendorInvoices.$inferSelect;
export type InsertVendorInvoice = z.infer<typeof insertVendorInvoiceSchema>;
export type Merchant = typeof merchants.$inferSelect;
export type InsertMerchant = z.infer<typeof insertMerchantSchema>;
export type MerchantTransaction = typeof merchantTransactions.$inferSelect;
export type InsertMerchantTransaction = z.infer<typeof insertMerchantTransactionSchema>;
export type CryptoTreasuryPosition = typeof cryptoTreasuryPositions.$inferSelect;
export type InsertCryptoTreasuryPosition = z.infer<typeof insertCryptoTreasuryPositionSchema>;
export type CryptoTreasuryDeployment = typeof cryptoTreasuryDeployments.$inferSelect;
export type InsertCryptoTreasuryDeployment = z.infer<typeof insertCryptoTreasuryDeploymentSchema>;
export type CryptoTreasuryFlow = typeof cryptoTreasuryFlows.$inferSelect;
export type InsertCryptoTreasuryFlow = z.infer<typeof insertCryptoTreasuryFlowSchema>;
export type VendorBalance = typeof vendorBalances.$inferSelect;
export type InsertVendorBalance = z.infer<typeof insertVendorBalanceSchema>;
export type VendorRedemption = typeof vendorRedemptions.$inferSelect;
export type InsertVendorRedemption = z.infer<typeof insertVendorRedemptionSchema>;
export type VendorPayoutMethod = typeof vendorPayoutMethods.$inferSelect;
export type InsertVendorPayoutMethod = z.infer<typeof insertVendorPayoutMethodSchema>;
export type VendorComplianceStatus = typeof vendorComplianceStatus.$inferSelect;
export type InsertVendorComplianceStatus = z.infer<typeof insertVendorComplianceStatusSchema>;
export type VendorUserLink = typeof vendorUserLinks.$inferSelect;
export type InsertVendorUserLink = z.infer<typeof insertVendorUserLinkSchema>;
export type VendorStablecoinAllocation = typeof vendorStablecoinAllocations.$inferSelect;
export type VendorTreasuryAllocation = typeof vendorTreasuryAllocations.$inferSelect;
export type MerchantBalance = typeof merchantBalances.$inferSelect;
export type MerchantStablecoinAllocation = typeof merchantStablecoinAllocations.$inferSelect;
export type MerchantTreasuryAllocation = typeof merchantTreasuryAllocations.$inferSelect;
export type MerchantUserLink = typeof merchantUserLinks.$inferSelect;

export interface CryptoTreasurySummary {
  totalAUM: number;
  totalDeployed: number;
  totalAvailable: number;
  totalYield: number;
  weightedAPY: number;
}
