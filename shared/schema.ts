import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["Admin", "PropertyManager", "CFO", "Analyst", "Tenant"]);
export const invoiceStatusEnum = pgEnum("invoice_status", ["pending", "paid", "overdue", "partial"]);
export const paymentMethodEnum = pgEnum("payment_method", ["ACH", "Card", "Check", "Wire"]);
export const pmsProviderEnum = pgEnum("pms_provider", ["AppFolio", "Yardi", "Buildium"]);
export const treasuryProductTypeEnum = pgEnum("treasury_product_type", ["NRF", "NRK", "NRC"]);
export const complianceModeEnum = pgEnum("compliance_mode", ["indirect_only", "accredited_access"]);
export const cryptoCoinEnum = pgEnum("crypto_coin", ["USDC", "USDT", "DAI", "NUSD"]);
export const cryptoTransactionTypeEnum = pgEnum("crypto_transaction_type", ["deposit", "withdrawal", "conversion", "rent_payment"]);
// TODO: Bridge System Enums - Schema ready, implementation deferred
// These support future vendor/merchant payment flows when bridgeEnabled=true
export const bridgeDirectionEnum = pgEnum("bridge_direction", ["inbound", "outbound"]);
export const bridgeStatusEnum = pgEnum("bridge_status", ["pending", "converting", "awaiting_sync", "settled", "failed"]);
export const bridgeConversionStrategyEnum = pgEnum("bridge_conversion_strategy", ["immediate", "daily", "optimal_yield"]);

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
  organizationId: varchar("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  role: userRoleEnum("role").notNull().default("Analyst"),
  tenantId: varchar("tenant_id").references(() => tenants.id, { onDelete: "set null" }), // Link tenant-role users to tenant records
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

// Relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  properties: many(properties),
  tenants: many(tenants),
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

// Insert schemas
export const insertOrganizationSchema = createInsertSchema(organizations).omit({ id: true, createdAt: true });
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
export type UserRole = "Admin" | "PropertyManager" | "CFO" | "Analyst" | "Tenant";
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

export type BridgeConversionJob = typeof bridgeConversionJobs.$inferSelect;
export type InsertBridgeConversionJob = z.infer<typeof insertBridgeConversionJobSchema>;
export type BridgeConversion = typeof bridgeConversions.$inferSelect;
export type InsertBridgeConversion = z.infer<typeof insertBridgeConversionSchema>;
export type BridgeSyncLog = typeof bridgeSyncLogs.$inferSelect;
export type InsertBridgeSyncLog = z.infer<typeof insertBridgeSyncLogSchema>;
export type BridgePaymentLink = typeof bridgePaymentLinks.$inferSelect;
export type InsertBridgePaymentLink = z.infer<typeof insertBridgePaymentLinkSchema>;
