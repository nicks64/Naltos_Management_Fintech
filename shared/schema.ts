import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, boolean, pgEnum, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["Admin", "PropertyManager", "CFO", "Analyst", "Tenant", "Vendor", "Merchant"]);
export const personaTypeEnum = pgEnum("persona_type", ["operator", "tenant", "vendor", "merchant", "partner", "support"]);
export const personaStatusEnum = pgEnum("persona_status", ["active", "suspended", "invited"]);
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
// Collection Incentive Enums - For rent collection improvement programs
export const incentiveProgramTypeEnum = pgEnum("incentive_program_type", ["early_payment", "on_time_streak", "first_time_bonus"]);

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

// ====== MULTI-PERSONA IDENTITY SYSTEM ======

export const identities = pgTable("identities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url"),
  emailVerified: boolean("email_verified").default(false).notNull(),
  phoneVerified: boolean("phone_verified").default(false).notNull(),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const identityPersonas = pgTable("identity_personas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  identityId: varchar("identity_id").notNull().references(() => identities.id, { onDelete: "cascade" }),
  personaType: personaTypeEnum("persona_type").notNull(),
  orgId: varchar("org_id").references(() => organizations.id, { onDelete: "cascade" }),
  roleDetail: text("role_detail").notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  status: personaStatusEnum("status").notNull().default("active"),
  invitedByPersonaId: varchar("invited_by_persona_id"),
  label: text("label"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  identityPersonaTypeOrgIdx: uniqueIndex("identity_personas_identity_type_org_idx").on(table.identityId, table.personaType, table.orgId),
}));

export const tenantPersonaLinks = pgTable("tenant_persona_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  personaId: varchar("persona_id").notNull().references(() => identityPersonas.id, { onDelete: "cascade" }),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  propertyId: varchar("property_id").references(() => properties.id, { onDelete: "set null" }),
  unitId: varchar("unit_id").references(() => units.id, { onDelete: "set null" }),
  leaseId: varchar("lease_id"),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  personaTenantIdx: uniqueIndex("tenant_persona_links_persona_tenant_idx").on(table.personaId, table.tenantId),
}));

export const insertIdentitySchema = createInsertSchema(identities).omit({ id: true, createdAt: true });
export const insertIdentityPersonaSchema = createInsertSchema(identityPersonas).omit({ id: true, createdAt: true });
export const insertTenantPersonaLinkSchema = createInsertSchema(tenantPersonaLinks).omit({ id: true, createdAt: true });

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
  building: text("building"),
  floor: integer("floor"),
  unitType: text("unit_type"),
  sqft: integer("sqft"),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  marketRent: decimal("market_rent", { precision: 10, scale: 2 }),
  status: text("status").default("occupied"),
});

// Tenants
export const tenants = pgTable("tenants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  riskScore: integer("risk_score").default(0).notNull(), // 0-100 score
  paymentProbability: decimal("payment_probability", { precision: 3, scale: 2 }).default("1.00").notNull(), // 0.00-1.00
  ownershipReadyTier: integer("ownership_ready_tier").default(0).notNull(), // 0 (None), 1 (FHA Eligible), 2 (NACA Eligible)
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
  status: text("status").default("active"),
  renewalProbability: decimal("renewal_probability", { precision: 3, scale: 2 }),
  renewalOfferStatus: text("renewal_offer_status"),
  renewalAdjustment: decimal("renewal_adjustment", { precision: 10, scale: 2 }),
  proposedRent: decimal("proposed_rent", { precision: 10, scale: 2 }),
  rentIncreaseDate: timestamp("rent_increase_date"),
  rentIncreaseAmount: decimal("rent_increase_amount", { precision: 10, scale: 2 }),
  rentIncreaseStatus: text("rent_increase_status"),
  noticeDate: timestamp("notice_date"),
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

// Collection Incentive Programs - Boost rent collection rates through strategic cashback
export const incentivePrograms = pgTable("incentive_programs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: incentiveProgramTypeEnum("type").notNull(),
  active: boolean("active").default(true).notNull(),
  cashbackAmount: decimal("cashback_amount", { precision: 10, scale: 2 }).notNull(),
  requirement: text("requirement").notNull(),
  description: text("description").notNull(),
  enrolledTenants: integer("enrolled_tenants").default(0).notNull(),
  totalRewardsPaid: decimal("total_rewards_paid", { precision: 12, scale: 2 }).default("0").notNull(),
  impactOnCollectionRate: decimal("impact_on_collection_rate", { precision: 5, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
  personaId: varchar("persona_id").references(() => identityPersonas.id, { onDelete: "set null" }),
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
  personaId: varchar("persona_id").references(() => identityPersonas.id, { onDelete: "set null" }),
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

// ====== PHASE 1: PARTNERS, DISPUTES, CONSENT & ACTIVITY ======

// Partner Type Enum
export const partnerTypeEnum = pgEnum("partner_type", ["insurance", "mortgage", "investment"]);
export const partnerStatusEnum = pgEnum("partner_status", ["active", "pending", "suspended", "inactive"]);

// Partner Organizations - External partners (insurance, mortgage, investment firms)
export const partnerOrganizations = pgTable("partner_organizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: partnerTypeEnum("type").notNull(),
  status: partnerStatusEnum("status").notNull().default("active"),
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  companyUrl: text("company_url"),
  partnerScore: integer("partner_score").default(0), // 0-100
  revenueShare: decimal("revenue_share", { precision: 5, scale: 2 }).default("0"),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Partner User Links - Maps partner portal users to partner organizations
export const partnerUserLinks = pgTable("partner_user_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  partnerOrgId: varchar("partner_org_id").notNull().references(() => partnerOrganizations.id, { onDelete: "cascade" }),
  personaId: varchar("persona_id").references(() => identityPersonas.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userPartnerIdx: uniqueIndex("partner_user_links_user_partner_idx").on(table.userId, table.partnerOrgId),
}));

// Partner Leads - Leads shared with partners
export const partnerLeadStatusEnum = pgEnum("partner_lead_status", ["new", "contacted", "qualified", "proposal_sent", "converted", "declined"]);

export const partnerLeads = pgTable("partner_leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnerOrgId: varchar("partner_org_id").notNull().references(() => partnerOrganizations.id, { onDelete: "cascade" }),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  tenantId: varchar("tenant_id").references(() => tenants.id, { onDelete: "set null" }),
  tenantName: text("tenant_name").notNull(),
  propertyName: text("property_name"),
  unitNumber: text("unit_number"),
  leadType: partnerTypeEnum("lead_type").notNull(),
  subtype: text("subtype"),
  status: partnerLeadStatusEnum("status").notNull().default("new"),
  estimatedValue: decimal("estimated_value", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Partner Compliance Items - Licenses, certifications, agreements
export const partnerComplianceStatusEnum = pgEnum("partner_compliance_status", ["valid", "expiring", "expired", "pending"]);

export const partnerComplianceItems = pgTable("partner_compliance_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnerOrgId: varchar("partner_org_id").notNull().references(() => partnerOrganizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: text("category").notNull(), // License, Certification, Agreement, Insurance, Registration
  status: partnerComplianceStatusEnum("status").notNull().default("pending"),
  expiryDate: timestamp("expiry_date"),
  lastVerified: timestamp("last_verified"),
  required: boolean("required").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Dispute Enums
export const disputeTypeEnum = pgEnum("dispute_type", ["rent", "vendor", "merchant"]);
export const disputeStatusEnum = pgEnum("dispute_status", ["open", "under_review", "escalated", "mediation", "resolved", "closed"]);
export const disputePriorityEnum = pgEnum("dispute_priority", ["critical", "high", "medium", "low"]);

// Disputes table
export const disputes = pgTable("disputes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  disputeNumber: text("dispute_number").notNull(),
  type: disputeTypeEnum("type").notNull(),
  status: disputeStatusEnum("status").notNull().default("open"),
  priority: disputePriorityEnum("priority").notNull().default("medium"),
  filedBy: text("filed_by").notNull(),
  against: text("against").notNull(),
  propertyName: text("property_name"),
  unitNumber: text("unit_number"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  mediator: text("mediator"),
  slaDeadline: timestamp("sla_deadline"),
  resolvedAt: timestamp("resolved_at"),
  resolutionType: text("resolution_type"),
  resolutionNotes: text("resolution_notes"),
  satisfactionScore: integer("satisfaction_score"),
  evidenceCount: integer("evidence_count").default(0).notNull(),
  // Vendor-specific
  workOrderRef: text("work_order_ref"),
  originalAmount: decimal("original_amount", { precision: 10, scale: 2 }),
  vendorResponse: text("vendor_response"),
  // Merchant-specific
  transactionRef: text("transaction_ref"),
  merchantName: text("merchant_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Dispute Timeline - Events/actions in a dispute's lifecycle
export const disputeTimeline = pgTable("dispute_timeline", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  disputeId: varchar("dispute_id").notNull().references(() => disputes.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Consent Records - Tracks tenant data sharing consents
export const consentActionEnum = pgEnum("consent_action", ["granted", "revoked", "updated"]);
export const consentStatusEnum = pgEnum("consent_status", ["active", "revoked", "expired"]);

export const consentRecords = pgTable("consent_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  description: text("description"),
  sharedWith: text("shared_with").notNull(),
  action: consentActionEnum("action").notNull(),
  status: consentStatusEnum("status").notNull().default("active"),
  method: text("method").default("app"),
  enabled: boolean("enabled").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Partner Access Logs - Tracks which partners accessed tenant data
export const partnerAccessLogs = pgTable("partner_access_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  partnerName: text("partner_name").notNull(),
  partnerType: text("partner_type").notNull(),
  dataAccessed: text("data_accessed").notNull(),
  purpose: text("purpose").notNull(),
  consentRef: text("consent_ref"),
  active: boolean("active").default(true).notNull(),
  accessDate: timestamp("access_date").defaultNow().notNull(),
});

// Activity Events - Unified activity feed across all portals
export const activityEventTypeEnum = pgEnum("activity_event_type", [
  "dispute_filed", "dispute_updated", "dispute_resolved", "dispute_escalated",
  "lead_assigned", "lead_converted", "lead_declined",
  "consent_granted", "consent_revoked",
  "partner_data_accessed",
  "compliance_renewed", "compliance_expiring",
  "payment_received", "payment_overdue",
  "general"
]);

export const activityEvents = pgTable("activity_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  eventType: activityEventTypeEnum("event_type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations for Phase 1 tables
export const partnerOrganizationsRelations = relations(partnerOrganizations, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [partnerOrganizations.organizationId],
    references: [organizations.id],
  }),
  leads: many(partnerLeads),
  complianceItems: many(partnerComplianceItems),
  userLinks: many(partnerUserLinks),
}));

export const partnerUserLinksRelations = relations(partnerUserLinks, ({ one }) => ({
  user: one(users, {
    fields: [partnerUserLinks.userId],
    references: [users.id],
  }),
  partnerOrg: one(partnerOrganizations, {
    fields: [partnerUserLinks.partnerOrgId],
    references: [partnerOrganizations.id],
  }),
}));

export const partnerLeadsRelations = relations(partnerLeads, ({ one }) => ({
  partnerOrg: one(partnerOrganizations, {
    fields: [partnerLeads.partnerOrgId],
    references: [partnerOrganizations.id],
  }),
  organization: one(organizations, {
    fields: [partnerLeads.organizationId],
    references: [organizations.id],
  }),
  tenant: one(tenants, {
    fields: [partnerLeads.tenantId],
    references: [tenants.id],
  }),
}));

export const partnerComplianceItemsRelations = relations(partnerComplianceItems, ({ one }) => ({
  partnerOrg: one(partnerOrganizations, {
    fields: [partnerComplianceItems.partnerOrgId],
    references: [partnerOrganizations.id],
  }),
}));

export const disputesRelations = relations(disputes, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [disputes.organizationId],
    references: [organizations.id],
  }),
  timeline: many(disputeTimeline),
}));

export const disputeTimelineRelations = relations(disputeTimeline, ({ one }) => ({
  dispute: one(disputes, {
    fields: [disputeTimeline.disputeId],
    references: [disputes.id],
  }),
}));

export const consentRecordsRelations = relations(consentRecords, ({ one }) => ({
  tenant: one(tenants, {
    fields: [consentRecords.tenantId],
    references: [tenants.id],
  }),
  organization: one(organizations, {
    fields: [consentRecords.organizationId],
    references: [organizations.id],
  }),
}));

export const partnerAccessLogsRelations = relations(partnerAccessLogs, ({ one }) => ({
  tenant: one(tenants, {
    fields: [partnerAccessLogs.tenantId],
    references: [tenants.id],
  }),
  organization: one(organizations, {
    fields: [partnerAccessLogs.organizationId],
    references: [organizations.id],
  }),
}));

export const activityEventsRelations = relations(activityEvents, ({ one }) => ({
  organization: one(organizations, {
    fields: [activityEvents.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [activityEvents.userId],
    references: [users.id],
  }),
}));

// ====== ORCHESTRATION EVENT TIMELINE ======
// Tracks key workflow activities across business/vendor/merchant portals for unified orchestration view

export const orchestrationEventTypeEnum = pgEnum("orchestration_event_type", [
  // Treasury & Allocation Events
  "treasury_allocated",
  "treasury_rebalanced",
  "stablecoin_deployed",
  "stablecoin_withdrawn",
  "yield_accrued",
  "yield_distributed",
  // Vendor Payment Events
  "vendor_payment_instant",
  "vendor_redemption_requested",
  "vendor_redemption_completed",
  "vendor_payout_settled",
  // Merchant Settlement Events
  "merchant_transaction_created",
  "merchant_settlement_pending",
  "merchant_settlement_completed",
  "merchant_payout_processed",
  // System Events
  "orchestration_started",
  "orchestration_completed"
]);

export const orchestrationEvents = pgTable("orchestration_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  eventType: orchestrationEventTypeEnum("event_type").notNull(),
  eventTitle: text("event_title").notNull(), // Human-readable title
  eventDescription: text("event_description"), // Optional detailed description
  
  // Associated entities (nullable, depending on event type)
  vendorId: varchar("vendor_id").references(() => vendors.id, { onDelete: "set null" }),
  merchantId: varchar("merchant_id").references(() => merchants.id, { onDelete: "set null" }),
  treasuryProductId: varchar("treasury_product_id").references(() => treasuryProducts.id, { onDelete: "set null" }),
  deploymentId: varchar("deployment_id").references(() => cryptoTreasuryDeployments.id, { onDelete: "set null" }),
  vendorRedemptionId: varchar("vendor_redemption_id").references(() => vendorRedemptions.id, { onDelete: "set null" }),
  merchantTransactionId: varchar("merchant_transaction_id").references(() => merchantTransactions.id, { onDelete: "set null" }),
  
  // Financial amounts
  amount: decimal("amount", { precision: 18, scale: 8 }), // Amount in USD or NUSD
  coin: cryptoCoinEnum("coin"), // Stablecoin type if applicable
  
  // Metadata for additional context
  metadata: text("metadata"), // JSON string for flexible additional data
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Merchant Settlement Preferences - Persisted backend for Payment Method Manager
export const merchantSettlementPreferences = pgTable("merchant_settlement_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  merchantId: varchar("merchant_id").notNull().unique().references(() => merchants.id, { onDelete: "cascade" }),
  
  // Settlement schedule: daily, weekly, monthly
  settlementSchedule: text("settlement_schedule").notNull().default("weekly"),
  
  // Payment method: ach, wire
  paymentMethod: text("payment_method").notNull().default("ach"),
  
  // Auto-settlement toggle
  autoSettle: boolean("auto_settle").notNull().default(true),
  
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Vendor Redemption Requests - Enhanced tracking for redemption calculator
export const vendorRedemptionRequests = pgTable("vendor_redemption_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  vendorBalanceId: varchar("vendor_balance_id").notNull().references(() => vendorBalances.id, { onDelete: "cascade" }),
  
  // Redemption details
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  requestedRail: payoutRailEnum("requested_rail").notNull(), // ACH, PushToCard, OnChainStablecoin
  feeAmount: decimal("fee_amount", { precision: 18, scale: 8 }).notNull(),
  netAmount: decimal("net_amount", { precision: 18, scale: 8 }).notNull(),
  
  status: redemptionStatusEnum("status").notNull().default("pending"),
  
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
});

// Relations
export const orchestrationEventsRelations = relations(orchestrationEvents, ({ one }) => ({
  organization: one(organizations, {
    fields: [orchestrationEvents.organizationId],
    references: [organizations.id],
  }),
  vendor: one(vendors, {
    fields: [orchestrationEvents.vendorId],
    references: [vendors.id],
  }),
  merchant: one(merchants, {
    fields: [orchestrationEvents.merchantId],
    references: [merchants.id],
  }),
  treasuryProduct: one(treasuryProducts, {
    fields: [orchestrationEvents.treasuryProductId],
    references: [treasuryProducts.id],
  }),
  deployment: one(cryptoTreasuryDeployments, {
    fields: [orchestrationEvents.deploymentId],
    references: [cryptoTreasuryDeployments.id],
  }),
}));

export const merchantSettlementPreferencesRelations = relations(merchantSettlementPreferences, ({ one }) => ({
  merchant: one(merchants, {
    fields: [merchantSettlementPreferences.merchantId],
    references: [merchants.id],
  }),
}));

export const vendorRedemptionRequestsRelations = relations(vendorRedemptionRequests, ({ one }) => ({
  vendor: one(vendors, {
    fields: [vendorRedemptionRequests.vendorId],
    references: [vendors.id],
  }),
  vendorBalance: one(vendorBalances, {
    fields: [vendorRedemptionRequests.vendorBalanceId],
    references: [vendorBalances.id],
  }),
}));

// Insert schemas
export const insertOrchestrationEventSchema = createInsertSchema(orchestrationEvents).omit({ id: true, createdAt: true });
export const insertMerchantSettlementPreferencesSchema = createInsertSchema(merchantSettlementPreferences).omit({ id: true, updatedAt: true });
export const insertVendorRedemptionRequestSchema = createInsertSchema(vendorRedemptionRequests).omit({ id: true, requestedAt: true, processedAt: true });

// Types
export type OrchestrationEvent = typeof orchestrationEvents.$inferSelect;
export type InsertOrchestrationEvent = z.infer<typeof insertOrchestrationEventSchema>;
export type OrchestrationEventType = "treasury_allocated" | "treasury_rebalanced" | "stablecoin_deployed" | "stablecoin_withdrawn" | "yield_accrued" | "yield_distributed" | "vendor_payment_instant" | "vendor_redemption_requested" | "vendor_redemption_completed" | "vendor_payout_settled" | "merchant_transaction_created" | "merchant_settlement_pending" | "merchant_settlement_completed" | "merchant_payout_processed" | "orchestration_started" | "orchestration_completed";
export type MerchantSettlementPreferences = typeof merchantSettlementPreferences.$inferSelect;
export type InsertMerchantSettlementPreferences = z.infer<typeof insertMerchantSettlementPreferencesSchema>;
export type VendorRedemptionRequest = typeof vendorRedemptionRequests.$inferSelect;
export type InsertVendorRedemptionRequest = z.infer<typeof insertVendorRedemptionRequestSchema>;

export interface CryptoTreasurySummary {
  totalAUM: number;
  totalDeployed: number;
  totalAvailable: number;
  totalYield: number;
  weightedAPY: number;
}

// Incentive program insert schema
export const insertIncentiveProgramSchema = createInsertSchema(incentivePrograms).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertIncentiveProgram = z.infer<typeof insertIncentiveProgramSchema>;
export type IncentiveProgram = typeof incentivePrograms.$inferSelect;

// Phase 1 Insert Schemas
export const insertPartnerOrganizationSchema = createInsertSchema(partnerOrganizations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPartnerUserLinkSchema = createInsertSchema(partnerUserLinks).omit({ id: true, createdAt: true });
export const insertPartnerLeadSchema = createInsertSchema(partnerLeads).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPartnerComplianceItemSchema = createInsertSchema(partnerComplianceItems).omit({ id: true, createdAt: true });
export const insertDisputeSchema = createInsertSchema(disputes).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDisputeTimelineSchema = createInsertSchema(disputeTimeline).omit({ id: true, createdAt: true });
export const insertConsentRecordSchema = createInsertSchema(consentRecords).omit({ id: true, createdAt: true });
export const insertPartnerAccessLogSchema = createInsertSchema(partnerAccessLogs).omit({ id: true, accessDate: true });
export const insertActivityEventSchema = createInsertSchema(activityEvents).omit({ id: true, createdAt: true });

// Phase 1 Types
export type PartnerOrganization = typeof partnerOrganizations.$inferSelect;
export type InsertPartnerOrganization = z.infer<typeof insertPartnerOrganizationSchema>;
export type PartnerUserLink = typeof partnerUserLinks.$inferSelect;
export type InsertPartnerUserLink = z.infer<typeof insertPartnerUserLinkSchema>;
export type PartnerLead = typeof partnerLeads.$inferSelect;
export type InsertPartnerLead = z.infer<typeof insertPartnerLeadSchema>;
export type PartnerComplianceItem = typeof partnerComplianceItems.$inferSelect;
export type InsertPartnerComplianceItem = z.infer<typeof insertPartnerComplianceItemSchema>;
export type Dispute = typeof disputes.$inferSelect;
export type InsertDispute = z.infer<typeof insertDisputeSchema>;
export type DisputeTimeline = typeof disputeTimeline.$inferSelect;
export type InsertDisputeTimeline = z.infer<typeof insertDisputeTimelineSchema>;
export type ConsentRecord = typeof consentRecords.$inferSelect;
export type InsertConsentRecord = z.infer<typeof insertConsentRecordSchema>;
export type PartnerAccessLog = typeof partnerAccessLogs.$inferSelect;
export type InsertPartnerAccessLog = z.infer<typeof insertPartnerAccessLogSchema>;
export type ActivityEvent = typeof activityEvents.$inferSelect;
export type InsertActivityEvent = z.infer<typeof insertActivityEventSchema>;

// Phase 1 Enum Types
export type PartnerType = "insurance" | "mortgage" | "investment";
export type PartnerStatus = "active" | "pending" | "suspended" | "inactive";
export type PartnerLeadStatus = "new" | "contacted" | "qualified" | "proposal_sent" | "converted" | "declined";
export type PartnerComplianceStatusType = "valid" | "expiring" | "expired" | "pending";
export type DisputeType = "rent" | "vendor" | "merchant";
export type DisputeStatus = "open" | "under_review" | "escalated" | "mediation" | "resolved" | "closed";
export type DisputePriority = "critical" | "high" | "medium" | "low";
export type ConsentAction = "granted" | "revoked" | "updated";
export type ConsentStatus = "active" | "revoked" | "expired";
export type ActivityEventType = "dispute_filed" | "dispute_updated" | "dispute_resolved" | "dispute_escalated" | "lead_assigned" | "lead_converted" | "lead_declined" | "consent_granted" | "consent_revoked" | "partner_data_accessed" | "compliance_renewed" | "compliance_expiring" | "payment_received" | "payment_overdue" | "general";

// ====== PHASE 2: PROPERTY CRM — MAINTENANCE, UNITS, LEASES, RESIDENTS ======

export const maintenanceWorkOrders = pgTable("maintenance_work_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  unitId: varchar("unit_id").references(() => units.id, { onDelete: "set null" }),
  propertyId: varchar("property_id").references(() => properties.id, { onDelete: "set null" }),
  vendorId: varchar("vendor_id").references(() => vendors.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  priority: text("priority").notNull().default("medium"),
  status: text("status").notNull().default("open"),
  assignedTo: text("assigned_to"),
  tenantName: text("tenant_name"),
  unitNumber: text("unit_number"),
  vendorName: text("vendor_name"),
  slaDueAt: timestamp("sla_due_at"),
  completedAt: timestamp("completed_at"),
  aiFlag: text("ai_flag"),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  actualCost: decimal("actual_cost", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const maintenancePreventiveTasks = pgTable("maintenance_preventive_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  propertyId: varchar("property_id").references(() => properties.id, { onDelete: "set null" }),
  task: text("task").notNull(),
  category: text("category").notNull(),
  frequency: text("frequency").notNull(),
  nextDueDate: timestamp("next_due_date"),
  lastCompletedDate: timestamp("last_completed_date"),
  complianceRate: integer("compliance_rate").default(100),
  vendorName: text("vendor_name"),
  status: text("status").default("on_schedule"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const unitTurns = pgTable("unit_turns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  unitId: varchar("unit_id").references(() => units.id, { onDelete: "set null" }),
  unitNumber: text("unit_number").notNull(),
  moveOutDate: timestamp("move_out_date"),
  stage: text("stage").notNull().default("inspection"),
  status: text("status").notNull().default("in_progress"),
  daysInProcess: integer("days_in_process").default(0),
  targetDays: integer("target_days").default(14),
  progress: integer("progress").default(0),
  targetDate: timestamp("target_date"),
  assignedVendor: text("assigned_vendor"),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const leaseViolations = pgTable("lease_violations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leaseId: varchar("lease_id").notNull().references(() => leases.id, { onDelete: "cascade" }),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  tenantName: text("tenant_name").notNull(),
  unitNumber: text("unit_number").notNull(),
  type: text("type").notNull(),
  description: text("description"),
  severity: text("severity").notNull().default("minor"),
  status: text("status").notNull().default("open"),
  noticeSent: boolean("notice_sent").default(false),
  noticeDate: timestamp("notice_date"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tenantHouseholdMembers = pgTable("tenant_household_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  relationship: text("relationship").notNull(),
  isMinor: boolean("is_minor").default(false),
});

export const tenantPets = pgTable("tenant_pets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  species: text("species").notNull(),
  breed: text("breed"),
  weight: integer("weight"),
  vaccinated: boolean("vaccinated").default(false),
  depositPaid: decimal("deposit_paid", { precision: 10, scale: 2 }),
  registeredAt: timestamp("registered_at").defaultNow(),
});

export const tenantVehicles = pgTable("tenant_vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year"),
  color: text("color"),
  licensePlate: text("license_plate").notNull(),
  parkingSpace: text("parking_space"),
  permitStatus: text("permit_status").default("active"),
  permitExpiry: timestamp("permit_expiry"),
});

// Phase 2 Insert Schemas
export const insertMaintenanceWorkOrderSchema = createInsertSchema(maintenanceWorkOrders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMaintenancePreventiveTaskSchema = createInsertSchema(maintenancePreventiveTasks).omit({ id: true, createdAt: true });
export const insertUnitTurnSchema = createInsertSchema(unitTurns).omit({ id: true, createdAt: true, updatedAt: true });
export const insertLeaseViolationSchema = createInsertSchema(leaseViolations).omit({ id: true, createdAt: true });
export const insertTenantHouseholdMemberSchema = createInsertSchema(tenantHouseholdMembers).omit({ id: true });
export const insertTenantPetSchema = createInsertSchema(tenantPets).omit({ id: true, registeredAt: true });
export const insertTenantVehicleSchema = createInsertSchema(tenantVehicles).omit({ id: true });

// ========== Phase 3: Move-In/Move-Out, Communications, Applications, Marketing, Community ==========

export const moveIns = pgTable("move_ins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  tenantId: varchar("tenant_id").references(() => tenants.id, { onDelete: "set null" }),
  unitId: varchar("unit_id").references(() => units.id, { onDelete: "set null" }),
  tenantName: text("tenant_name").notNull(),
  unitNumber: text("unit_number").notNull(),
  moveInDate: timestamp("move_in_date").notNull(),
  checklistPercent: integer("checklist_percent").default(0),
  keyStatus: text("key_status").default("Pending"),
  utilityStatus: text("utility_status").default("Pending"),
  welcomePacket: boolean("welcome_packet").default(false),
});

export const moveOuts = pgTable("move_outs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  tenantId: varchar("tenant_id").references(() => tenants.id, { onDelete: "set null" }),
  unitId: varchar("unit_id").references(() => units.id, { onDelete: "set null" }),
  tenantName: text("tenant_name").notNull(),
  unitNumber: text("unit_number").notNull(),
  moveOutDate: timestamp("move_out_date").notNull(),
  inspectionStatus: text("inspection_status").default("Not Scheduled"),
  depositStatus: text("deposit_status").default("Pending"),
  forwardingAddress: boolean("forwarding_address").default(false),
});

export const moveChecklists = pgTable("move_checklists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  items: integer("items").notNull(),
  completedUses: integer("completed_uses").default(0),
  lastUpdated: timestamp("last_updated").defaultNow(),
  compliance: integer("compliance").default(0),
});

export const tenantMessages = pgTable("tenant_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  tenantId: varchar("tenant_id").references(() => tenants.id, { onDelete: "set null" }),
  senderName: text("sender_name").notNull(),
  unitNumber: text("unit_number").notNull(),
  subject: text("subject").notNull(),
  preview: text("preview"),
  sentAt: timestamp("sent_at").defaultNow(),
  read: boolean("read").default(false),
  priority: boolean("priority").default(false),
  category: text("category"),
});

export const announcements = pgTable("announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  date: timestamp("date").notNull(),
  audience: text("audience").notNull(),
  sent: integer("sent").default(0),
  read: integer("read").default(0),
  clicked: integer("clicked").default(0),
  status: text("status").default("Delivered"),
});

export const tenantNotices = pgTable("tenant_notices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  tenantId: varchar("tenant_id").references(() => tenants.id, { onDelete: "set null" }),
  tenantName: text("tenant_name").notNull(),
  unitNumber: text("unit_number").notNull(),
  type: text("type").notNull(),
  sentDate: timestamp("sent_date").notNull(),
  response: text("response").default("Pending"),
  daysUntil: integer("days_until").default(0),
});

export const complaints = pgTable("complaints", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  complaintId: text("complaint_id").notNull(),
  tenantId: varchar("tenant_id").references(() => tenants.id, { onDelete: "set null" }),
  tenantName: text("tenant_name").notNull(),
  unitNumber: text("unit_number").notNull(),
  category: text("category").notNull(),
  severity: text("severity").default("Medium"),
  status: text("status").default("Open"),
  openedAt: timestamp("opened_at").defaultNow(),
  slaStatus: text("sla_status"),
  aiResolution: text("ai_resolution"),
});

export const leasingApplications = pgTable("leasing_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  applicantName: text("applicant_name").notNull(),
  unitId: varchar("unit_id").references(() => units.id, { onDelete: "set null" }),
  unitNumber: text("unit_number").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow(),
  incomeRatio: decimal("income_ratio", { precision: 4, scale: 2 }),
  risk: text("risk").default("Medium"),
  missingDocs: integer("missing_docs").default(0),
  stage: text("stage").default("Submitted"),
  creditScore: integer("credit_score"),
  criminal: text("criminal"),
  eviction: text("eviction"),
  incomeVerified: text("income_verified"),
  referencesStatus: text("references_status"),
  recommendation: text("recommendation"),
  confidence: decimal("confidence", { precision: 3, scale: 2 }),
  approved: boolean("approved").default(false),
  leaseStart: timestamp("lease_start"),
  depositStatus: text("deposit_status"),
  welcomePacket: boolean("welcome_packet").default(false),
  keyPickup: text("key_pickup"),
  moveInInspection: text("move_in_inspection"),
});

export const applicantWaitlist = pgTable("applicant_waitlist", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  applicantName: text("applicant_name").notNull(),
  unitType: text("unit_type").notNull(),
  dateAdded: timestamp("date_added").defaultNow(),
  position: integer("position").notNull(),
  contact: text("contact").default("Email"),
  notes: text("notes"),
});

export const marketingListings = pgTable("marketing_listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  unitId: varchar("unit_id").references(() => units.id, { onDelete: "set null" }),
  unitNumber: text("unit_number").notNull(),
  beds: text("beds").notNull(),
  baths: integer("baths").default(1),
  sqft: integer("sqft"),
  rent: decimal("rent", { precision: 10, scale: 2 }),
  daysOnMarket: integer("days_on_market").default(0),
  views: integer("views").default(0),
  inquiries: integer("inquiries").default(0),
  status: text("status").default("Active"),
  channels: text("channels").array(),
  updatedAt: timestamp("updated_at").defaultNow(),
  aiScore: integer("ai_score").default(50),
});

export const marketingLeads = pgTable("marketing_leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  source: text("source").notNull(),
  unitId: varchar("unit_id").references(() => units.id, { onDelete: "set null" }),
  unitNumber: text("unit_number").notNull(),
  status: text("status").default("New"),
  score: integer("score").default(50),
  lastContact: text("last_contact"),
  followUp: text("follow_up"),
  priority: boolean("priority").default(false),
});

export const marketingShowings = pgTable("marketing_showings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  showingDate: text("showing_date").notNull(),
  unitId: varchar("unit_id").references(() => units.id, { onDelete: "set null" }),
  unitNumber: text("unit_number").notNull(),
  leadName: text("lead_name").notNull(),
  agent: text("agent").notNull(),
  status: text("status").default("Scheduled"),
  notes: text("notes"),
  feedback: text("feedback"),
});

export const communityEvents = pgTable("community_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  eventDate: text("event_date").notNull(),
  location: text("location").notNull(),
  category: text("category").notNull(),
  rsvps: integer("rsvps").default(0),
  capacity: integer("capacity").default(0),
  organizer: text("organizer").notNull(),
  budget: text("budget"),
  status: text("status").default("Planning"),
  isPast: boolean("is_past").default(false),
  attendance: integer("attendance"),
  satisfaction: decimal("satisfaction", { precision: 3, scale: 1 }),
  photos: integer("photos"),
  feedback: text("feedback"),
});

export const communityPrograms = pgTable("community_programs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  iconKey: text("icon_key").notNull(),
  members: integer("members").default(0),
  frequency: text("frequency").notNull(),
  nextMeeting: text("next_meeting"),
  organizer: text("organizer").notNull(),
  active: boolean("active").default(true),
});

// Phase 3 Insert Schemas
export const insertMoveInSchema = createInsertSchema(moveIns).omit({ id: true });
export const insertMoveOutSchema = createInsertSchema(moveOuts).omit({ id: true });
export const insertMoveChecklistSchema = createInsertSchema(moveChecklists).omit({ id: true });
export const insertTenantMessageSchema = createInsertSchema(tenantMessages).omit({ id: true });
export const insertAnnouncementSchema = createInsertSchema(announcements).omit({ id: true });
export const insertTenantNoticeSchema = createInsertSchema(tenantNotices).omit({ id: true });
export const insertComplaintSchema = createInsertSchema(complaints).omit({ id: true });
export const insertLeasingApplicationSchema = createInsertSchema(leasingApplications).omit({ id: true });
export const insertApplicantWaitlistSchema = createInsertSchema(applicantWaitlist).omit({ id: true });
export const insertMarketingListingSchema = createInsertSchema(marketingListings).omit({ id: true });
export const insertMarketingLeadSchema = createInsertSchema(marketingLeads).omit({ id: true });
export const insertMarketingShowingSchema = createInsertSchema(marketingShowings).omit({ id: true });
export const insertCommunityEventSchema = createInsertSchema(communityEvents).omit({ id: true });
export const insertCommunityProgramSchema = createInsertSchema(communityPrograms).omit({ id: true });

// Phase 3 Types
export type MoveIn = typeof moveIns.$inferSelect;
export type InsertMoveIn = z.infer<typeof insertMoveInSchema>;
export type MoveOut = typeof moveOuts.$inferSelect;
export type InsertMoveOut = z.infer<typeof insertMoveOutSchema>;
export type MoveChecklist = typeof moveChecklists.$inferSelect;
export type InsertMoveChecklist = z.infer<typeof insertMoveChecklistSchema>;
export type TenantMessage = typeof tenantMessages.$inferSelect;
export type InsertTenantMessage = z.infer<typeof insertTenantMessageSchema>;
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type TenantNotice = typeof tenantNotices.$inferSelect;
export type InsertTenantNotice = z.infer<typeof insertTenantNoticeSchema>;
export type Complaint = typeof complaints.$inferSelect;
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;
export type LeasingApplication = typeof leasingApplications.$inferSelect;
export type InsertLeasingApplication = z.infer<typeof insertLeasingApplicationSchema>;
export type ApplicantWaitlistEntry = typeof applicantWaitlist.$inferSelect;
export type InsertApplicantWaitlistEntry = z.infer<typeof insertApplicantWaitlistSchema>;
export type MarketingListing = typeof marketingListings.$inferSelect;
export type InsertMarketingListing = z.infer<typeof insertMarketingListingSchema>;
export type MarketingLead = typeof marketingLeads.$inferSelect;
export type InsertMarketingLead = z.infer<typeof insertMarketingLeadSchema>;
export type MarketingShowing = typeof marketingShowings.$inferSelect;
export type InsertMarketingShowing = z.infer<typeof insertMarketingShowingSchema>;
export type CommunityEvent = typeof communityEvents.$inferSelect;
export type InsertCommunityEvent = z.infer<typeof insertCommunityEventSchema>;
export type CommunityProgram = typeof communityPrograms.$inferSelect;
export type InsertCommunityProgram = z.infer<typeof insertCommunityProgramSchema>;

// Phase 2 Types
export type MaintenanceWorkOrder = typeof maintenanceWorkOrders.$inferSelect;
export type InsertMaintenanceWorkOrder = z.infer<typeof insertMaintenanceWorkOrderSchema>;
export type MaintenancePreventiveTask = typeof maintenancePreventiveTasks.$inferSelect;
export type InsertMaintenancePreventiveTask = z.infer<typeof insertMaintenancePreventiveTaskSchema>;
export type UnitTurn = typeof unitTurns.$inferSelect;
export type InsertUnitTurn = z.infer<typeof insertUnitTurnSchema>;
export type LeaseViolation = typeof leaseViolations.$inferSelect;
export type InsertLeaseViolation = z.infer<typeof insertLeaseViolationSchema>;
export type TenantHouseholdMember = typeof tenantHouseholdMembers.$inferSelect;
export type InsertTenantHouseholdMember = z.infer<typeof insertTenantHouseholdMemberSchema>;
export type TenantPet = typeof tenantPets.$inferSelect;
export type InsertTenantPet = z.infer<typeof insertTenantPetSchema>;
export type TenantVehicle = typeof tenantVehicles.$inferSelect;
export type InsertTenantVehicle = z.infer<typeof insertTenantVehicleSchema>;

// ========== Phase 4: Property Operations (Inspections, Amenities, Parking, Packages, Access Control, Safety, Pest Control) ==========

// --- INSPECTIONS ---

export const inspectionsScheduled = pgTable("inspections_scheduled", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  unit: text("unit"),
  type: text("type"),
  inspector: text("inspector"),
  inspectionDate: text("inspection_date"),
  status: text("status"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const inspectionResults = pgTable("inspection_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  unit: text("unit"),
  type: text("type"),
  inspector: text("inspector"),
  inspectionDate: text("inspection_date"),
  score: integer("score"),
  issues: integer("issues"),
  photos: integer("photos"),
  followUp: boolean("follow_up"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const inspectionUnitConditions = pgTable("inspection_unit_conditions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  unit: text("unit"),
  lastInspection: text("last_inspection"),
  score: integer("score"),
  trend: text("trend"),
  kitchen: integer("kitchen"),
  bath: integer("bath"),
  floors: integer("floors"),
  walls: integer("walls"),
  fixtures: integer("fixtures"),
  nextDue: text("next_due"),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- AMENITIES ---

export const amenityList = pgTable("amenity_list", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name"),
  iconKey: text("icon_key"),
  category: text("category"),
  status: text("status"),
  capacity: text("capacity"),
  utilization: integer("utilization"),
  revenue: text("revenue"),
  maintenance: text("maintenance"),
  nextMaintenance: text("next_maintenance"),
  hours: text("hours"),
  rules: text("rules"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const amenityReservations = pgTable("amenity_reservations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  amenity: text("amenity"),
  resident: text("resident"),
  unit: text("unit"),
  reservationDate: text("reservation_date"),
  time: text("time"),
  status: text("status"),
  guests: integer("guests"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const amenityUsageByDay = pgTable("amenity_usage_by_day", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  day: text("day"),
  gym: integer("gym"),
  pool: integer("pool"),
  lounge: integer("lounge"),
  courtyard: integer("courtyard"),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- PARKING ---

export const parkingSpaceAssignments = pgTable("parking_space_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  space: text("space"),
  type: text("type"),
  tenant: text("tenant"),
  unit: text("unit"),
  vehicle: text("vehicle"),
  plate: text("plate"),
  monthly: text("monthly"),
  expires: text("expires"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const parkingPermits = pgTable("parking_permits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  permitId: text("permit_id"),
  type: text("type"),
  vehicle: text("vehicle"),
  plate: text("plate"),
  unit: text("unit"),
  issued: text("issued"),
  expires: text("expires"),
  status: text("status"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const parkingViolations = pgTable("parking_violations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  violationId: text("violation_id"),
  date: text("date"),
  space: text("space"),
  plate: text("plate"),
  type: text("type"),
  fine: text("fine"),
  status: text("status"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const parkingTowingLog = pgTable("parking_towing_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  towId: text("tow_id"),
  date: text("date"),
  plate: text("plate"),
  space: text("space"),
  reason: text("reason"),
  company: text("company"),
  status: text("status"),
  cost: text("cost"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const parkingGarageAccess = pgTable("parking_garage_access", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  device: text("device"),
  location: text("location"),
  status: text("status"),
  lastPing: text("last_ping"),
  battery: integer("battery"),
  firmware: text("firmware"),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- PACKAGES ---

export const packageLog = pgTable("package_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  tracking: text("tracking"),
  carrier: text("carrier"),
  resident: text("resident"),
  unit: text("unit"),
  received: text("received"),
  status: text("status"),
  location: text("location"),
  signature: boolean("signature"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const packageAwaitingPickup = pgTable("package_awaiting_pickup", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  tracking: text("tracking"),
  carrier: text("carrier"),
  resident: text("resident"),
  unit: text("unit"),
  received: text("received"),
  daysHeld: integer("days_held"),
  location: text("location"),
  notified: integer("notified"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const packageLockerStatus = pgTable("package_locker_status", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  locker: text("locker"),
  size: text("size"),
  status: text("status"),
  resident: text("resident"),
  unit: text("unit"),
  loaded: text("loaded"),
  code: text("code"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const packageCarrierSummary = pgTable("package_carrier_summary", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  carrier: text("carrier"),
  deliveries: integer("deliveries"),
  avgPerDay: text("avg_per_day"),
  issues: integer("issues"),
  rating: text("rating"),
  lastDelivery: text("last_delivery"),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- ACCESS CONTROL ---

export const keyInventory = pgTable("key_inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  unit: text("unit"),
  keyType: text("key_type"),
  copies: integer("copies"),
  assignedTo: text("assigned_to"),
  lastIssued: text("last_issued"),
  status: text("status"),
  deposit: text("deposit"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const accessCards = pgTable("access_cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  cardId: text("card_id"),
  type: text("type"),
  holder: text("holder"),
  unit: text("unit"),
  zones: text("zones"),
  issued: text("issued"),
  expires: text("expires"),
  status: text("status"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const smartLocks = pgTable("smart_locks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  device: text("device"),
  unit: text("unit"),
  battery: integer("battery"),
  firmware: text("firmware"),
  status: text("status"),
  lastAccess: text("last_access"),
  autoLock: boolean("auto_lock"),
  logs: integer("logs"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const accessLogs = pgTable("access_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  time: text("time"),
  person: text("person"),
  unit: text("unit"),
  method: text("method"),
  door: text("door"),
  result: text("result"),
  flagged: boolean("flagged"),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- SAFETY ---

export const incidentReports = pgTable("incident_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  incidentId: text("incident_id"),
  date: text("date"),
  type: text("type"),
  location: text("location"),
  severity: text("severity"),
  reportedBy: text("reported_by"),
  status: text("status"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const patrolLogs = pgTable("patrol_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  patrolId: text("patrol_id"),
  date: text("date"),
  officer: text("officer"),
  route: text("route"),
  startTime: text("start_time"),
  endTime: text("end_time"),
  findings: text("findings"),
  status: text("status"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cameraSystems = pgTable("camera_systems", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  cameraId: text("camera_id"),
  location: text("location"),
  type: text("type"),
  status: text("status"),
  resolution: text("resolution"),
  storage: text("storage"),
  lastMaintenance: text("last_maintenance"),
  coverage: integer("coverage"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const fireSafety = pgTable("fire_safety", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  system: text("system"),
  location: text("location"),
  lastInspection: text("last_inspection"),
  nextInspection: text("next_inspection"),
  status: text("status"),
  compliance: text("compliance"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- PEST CONTROL ---

export const pestTreatmentSchedule = pgTable("pest_treatment_schedule", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  unit: text("unit"),
  date: text("date"),
  type: text("type"),
  pestType: text("pest_type"),
  vendor: text("vendor"),
  status: text("status"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pestActiveReports = pgTable("pest_active_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  unit: text("unit"),
  tenant: text("tenant"),
  pestType: text("pest_type"),
  severity: text("severity"),
  reportedDate: text("reported_date"),
  treatmentScheduled: text("treatment_scheduled"),
  followUpNeeded: boolean("follow_up_needed"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pestUnitHistory = pgTable("pest_unit_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  unit: text("unit"),
  date: text("date"),
  type: text("type"),
  pestType: text("pest_type"),
  result: text("result"),
  notes: text("notes"),
  recurring: boolean("recurring"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pestVendors = pgTable("pest_vendors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  company: text("company"),
  contractType: text("contract_type"),
  serviceArea: text("service_area"),
  responseTimeSla: text("response_time_sla"),
  satisfactionRating: text("satisfaction_rating"),
  contractExpiry: text("contract_expiry"),
  monthlyCost: text("monthly_cost"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pestPreventionPrograms = pgTable("pest_prevention_programs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  programName: text("program_name"),
  type: text("type"),
  frequency: text("frequency"),
  lastService: text("last_service"),
  nextService: text("next_service"),
  coverage: integer("coverage"),
  effectiveness: text("effectiveness"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Phase 4 Insert Schemas
export const insertInspectionsScheduledSchema = createInsertSchema(inspectionsScheduled).omit({ id: true, createdAt: true });
export const insertInspectionResultsSchema = createInsertSchema(inspectionResults).omit({ id: true, createdAt: true });
export const insertInspectionUnitConditionsSchema = createInsertSchema(inspectionUnitConditions).omit({ id: true, createdAt: true });
export const insertAmenityListSchema = createInsertSchema(amenityList).omit({ id: true, createdAt: true });
export const insertAmenityReservationsSchema = createInsertSchema(amenityReservations).omit({ id: true, createdAt: true });
export const insertAmenityUsageByDaySchema = createInsertSchema(amenityUsageByDay).omit({ id: true, createdAt: true });
export const insertParkingSpaceAssignmentsSchema = createInsertSchema(parkingSpaceAssignments).omit({ id: true, createdAt: true });
export const insertParkingPermitsSchema = createInsertSchema(parkingPermits).omit({ id: true, createdAt: true });
export const insertParkingViolationsSchema = createInsertSchema(parkingViolations).omit({ id: true, createdAt: true });
export const insertParkingTowingLogSchema = createInsertSchema(parkingTowingLog).omit({ id: true, createdAt: true });
export const insertParkingGarageAccessSchema = createInsertSchema(parkingGarageAccess).omit({ id: true, createdAt: true });
export const insertPackageLogSchema = createInsertSchema(packageLog).omit({ id: true, createdAt: true });
export const insertPackageAwaitingPickupSchema = createInsertSchema(packageAwaitingPickup).omit({ id: true, createdAt: true });
export const insertPackageLockerStatusSchema = createInsertSchema(packageLockerStatus).omit({ id: true, createdAt: true });
export const insertPackageCarrierSummarySchema = createInsertSchema(packageCarrierSummary).omit({ id: true, createdAt: true });
export const insertKeyInventorySchema = createInsertSchema(keyInventory).omit({ id: true, createdAt: true });
export const insertAccessCardsSchema = createInsertSchema(accessCards).omit({ id: true, createdAt: true });
export const insertSmartLocksSchema = createInsertSchema(smartLocks).omit({ id: true, createdAt: true });
export const insertAccessLogsSchema = createInsertSchema(accessLogs).omit({ id: true, createdAt: true });
export const insertIncidentReportsSchema = createInsertSchema(incidentReports).omit({ id: true, createdAt: true });
export const insertPatrolLogsSchema = createInsertSchema(patrolLogs).omit({ id: true, createdAt: true });
export const insertCameraSystemsSchema = createInsertSchema(cameraSystems).omit({ id: true, createdAt: true });
export const insertFireSafetySchema = createInsertSchema(fireSafety).omit({ id: true, createdAt: true });
export const insertPestTreatmentScheduleSchema = createInsertSchema(pestTreatmentSchedule).omit({ id: true, createdAt: true });
export const insertPestActiveReportsSchema = createInsertSchema(pestActiveReports).omit({ id: true, createdAt: true });
export const insertPestUnitHistorySchema = createInsertSchema(pestUnitHistory).omit({ id: true, createdAt: true });
export const insertPestVendorsSchema = createInsertSchema(pestVendors).omit({ id: true, createdAt: true });
export const insertPestPreventionProgramsSchema = createInsertSchema(pestPreventionPrograms).omit({ id: true, createdAt: true });

// Phase 4 Types
export type InspectionsScheduled = typeof inspectionsScheduled.$inferSelect;
export type InsertInspectionsScheduled = z.infer<typeof insertInspectionsScheduledSchema>;
export type InspectionResult = typeof inspectionResults.$inferSelect;
export type InsertInspectionResult = z.infer<typeof insertInspectionResultsSchema>;
export type InspectionUnitCondition = typeof inspectionUnitConditions.$inferSelect;
export type InsertInspectionUnitCondition = z.infer<typeof insertInspectionUnitConditionsSchema>;
export type AmenityListItem = typeof amenityList.$inferSelect;
export type InsertAmenityListItem = z.infer<typeof insertAmenityListSchema>;
export type AmenityReservation = typeof amenityReservations.$inferSelect;
export type InsertAmenityReservation = z.infer<typeof insertAmenityReservationsSchema>;
export type AmenityUsageByDay = typeof amenityUsageByDay.$inferSelect;
export type InsertAmenityUsageByDay = z.infer<typeof insertAmenityUsageByDaySchema>;
export type ParkingSpaceAssignment = typeof parkingSpaceAssignments.$inferSelect;
export type InsertParkingSpaceAssignment = z.infer<typeof insertParkingSpaceAssignmentsSchema>;
export type ParkingPermit = typeof parkingPermits.$inferSelect;
export type InsertParkingPermit = z.infer<typeof insertParkingPermitsSchema>;
export type ParkingViolation = typeof parkingViolations.$inferSelect;
export type InsertParkingViolation = z.infer<typeof insertParkingViolationsSchema>;
export type ParkingTowingLogEntry = typeof parkingTowingLog.$inferSelect;
export type InsertParkingTowingLogEntry = z.infer<typeof insertParkingTowingLogSchema>;
export type ParkingGarageAccessDevice = typeof parkingGarageAccess.$inferSelect;
export type InsertParkingGarageAccessDevice = z.infer<typeof insertParkingGarageAccessSchema>;
export type PackageLogEntry = typeof packageLog.$inferSelect;
export type InsertPackageLogEntry = z.infer<typeof insertPackageLogSchema>;
export type PackageAwaitingPickupEntry = typeof packageAwaitingPickup.$inferSelect;
export type InsertPackageAwaitingPickupEntry = z.infer<typeof insertPackageAwaitingPickupSchema>;
export type PackageLockerStatusEntry = typeof packageLockerStatus.$inferSelect;
export type InsertPackageLockerStatusEntry = z.infer<typeof insertPackageLockerStatusSchema>;
export type PackageCarrierSummaryEntry = typeof packageCarrierSummary.$inferSelect;
export type InsertPackageCarrierSummaryEntry = z.infer<typeof insertPackageCarrierSummarySchema>;
export type KeyInventoryItem = typeof keyInventory.$inferSelect;
export type InsertKeyInventoryItem = z.infer<typeof insertKeyInventorySchema>;
export type AccessCard = typeof accessCards.$inferSelect;
export type InsertAccessCard = z.infer<typeof insertAccessCardsSchema>;
export type SmartLock = typeof smartLocks.$inferSelect;
export type InsertSmartLock = z.infer<typeof insertSmartLocksSchema>;
export type AccessLogEntry = typeof accessLogs.$inferSelect;
export type InsertAccessLogEntry = z.infer<typeof insertAccessLogsSchema>;
export type IncidentReport = typeof incidentReports.$inferSelect;
export type InsertIncidentReport = z.infer<typeof insertIncidentReportsSchema>;
export type PatrolLogEntry = typeof patrolLogs.$inferSelect;
export type InsertPatrolLogEntry = z.infer<typeof insertPatrolLogsSchema>;
export type CameraSystem = typeof cameraSystems.$inferSelect;
export type InsertCameraSystem = z.infer<typeof insertCameraSystemsSchema>;
export type FireSafetyItem = typeof fireSafety.$inferSelect;
export type InsertFireSafetyItem = z.infer<typeof insertFireSafetySchema>;
export type PestTreatmentScheduleEntry = typeof pestTreatmentSchedule.$inferSelect;
export type InsertPestTreatmentScheduleEntry = z.infer<typeof insertPestTreatmentScheduleSchema>;
export type PestActiveReport = typeof pestActiveReports.$inferSelect;
export type InsertPestActiveReport = z.infer<typeof insertPestActiveReportsSchema>;
export type PestUnitHistoryEntry = typeof pestUnitHistory.$inferSelect;
export type InsertPestUnitHistoryEntry = z.infer<typeof insertPestUnitHistorySchema>;
export type PestVendorEntry = typeof pestVendors.$inferSelect;
export type InsertPestVendorEntry = z.infer<typeof insertPestVendorsSchema>;
export type PestPreventionProgram = typeof pestPreventionPrograms.$inferSelect;
export type InsertPestPreventionProgram = z.infer<typeof insertPestPreventionProgramsSchema>;

// Identity & Persona types
export type Identity = typeof identities.$inferSelect;
export type InsertIdentity = z.infer<typeof insertIdentitySchema>;
export type IdentityPersona = typeof identityPersonas.$inferSelect;
export type InsertIdentityPersona = z.infer<typeof insertIdentityPersonaSchema>;
export type TenantPersonaLink = typeof tenantPersonaLinks.$inferSelect;
export type InsertTenantPersonaLink = z.infer<typeof insertTenantPersonaLinkSchema>;
export type PersonaType = "operator" | "tenant" | "vendor" | "merchant" | "partner" | "support";
export type PersonaStatus = "active" | "suspended" | "invited";
