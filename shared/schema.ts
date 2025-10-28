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
export const cryptoCoinEnum = pgEnum("crypto_coin", ["USDC", "USDT", "DAI"]);
export const cryptoTransactionTypeEnum = pgEnum("crypto_transaction_type", ["deposit", "withdrawal", "conversion", "rent_payment"]);

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
export type CryptoCoin = "USDC" | "USDT" | "DAI";
export type CryptoTransactionType = "deposit" | "withdrawal" | "conversion" | "rent_payment";
