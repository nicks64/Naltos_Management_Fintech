/*
  # Create Naltos Platform Schema

  1. Enums
    - All enumerated types for users, invoices, treasury, vendors, merchants, crypto
  
  2. Core Tables
    - organizations: Multitenancy container
    - users: System users with roles
    - identities & identity_personas: Multi-persona identity system
    - properties, units, leases, tenants, invoices, payments: Core rental operations
    - bank_ledger: Bank transaction tracking
  
  3. Treasury
    - treasury_products, treasury_subscriptions: NRF, NRK, NRC products
  
  4. Vendor & Merchant Systems
    - vendors, vendor_invoices, vendor_balances: Net30-90 payment system
    - merchants, merchant_transactions: Settlement float yield
  
  5. Advanced Features
    - crypto_treasury_flows, crypto_deployments: Stablecoin orchestration
    - incentive_programs: Collection incentives
    - audit_logs: Compliance tracking
*/

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE user_role AS ENUM ('Admin', 'PropertyManager', 'CFO', 'Analyst', 'Tenant', 'Vendor', 'Merchant');
CREATE TYPE persona_type AS ENUM ('operator', 'tenant', 'vendor', 'merchant', 'partner', 'support');
CREATE TYPE persona_status AS ENUM ('active', 'suspended', 'invited');
CREATE TYPE invoice_status AS ENUM ('pending', 'paid', 'overdue', 'partial');
CREATE TYPE payment_method AS ENUM ('ACH', 'Card', 'Check', 'Wire');
CREATE TYPE pms_provider AS ENUM ('AppFolio', 'Yardi', 'Buildium');
CREATE TYPE treasury_product_type AS ENUM ('NRF', 'NRK', 'NRC');
CREATE TYPE compliance_mode AS ENUM ('indirect_only', 'accredited_access');
CREATE TYPE crypto_coin AS ENUM ('USDC', 'USDT', 'DAI', 'NUSD');
CREATE TYPE crypto_transaction_type AS ENUM ('deposit', 'withdrawal', 'conversion', 'rent_payment');
CREATE TYPE payout_rail AS ENUM ('ACH', 'PushToCard', 'OnChainStablecoin');
CREATE TYPE redemption_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');
CREATE TYPE compliance_status AS ENUM ('not_verified', 'pending_review', 'verified', 'rejected');
CREATE TYPE bridge_direction AS ENUM ('inbound', 'outbound');
CREATE TYPE bridge_status AS ENUM ('pending', 'converting', 'awaiting_sync', 'settled', 'failed');
CREATE TYPE bridge_conversion_strategy AS ENUM ('immediate', 'daily', 'optimal_yield');
CREATE TYPE vendor_category AS ENUM ('Maintenance', 'Utilities', 'Insurance', 'Legal', 'Marketing', 'Property_Management', 'Landscaping', 'Cleaning', 'Security', 'Other');
CREATE TYPE payment_terms AS ENUM ('Net15', 'Net30', 'Net45', 'Net60', 'Net90', 'Immediate');
CREATE TYPE vendor_invoice_status AS ENUM ('pending', 'paid_instant', 'paid_traditional', 'overdue');
CREATE TYPE merchant_category AS ENUM ('Grocery', 'Restaurants', 'Transportation', 'Entertainment', 'Shopping', 'Services', 'Utilities', 'Health', 'Other');
CREATE TYPE merchant_transaction_status AS ENUM ('pending', 'settled', 'refunded');
CREATE TYPE crypto_treasury_flow_type AS ENUM ('bridge_inbound', 'bridge_outbound', 'wallet_transfer', 'deployment_in', 'deployment_out', 'yield_accrual');
CREATE TYPE crypto_deployment_status AS ENUM ('pending', 'active', 'matured', 'withdrawn');
CREATE TYPE incentive_program_type AS ENUM ('early_payment', 'on_time_streak', 'first_time_bonus');

-- Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  organization_id VARCHAR(36) REFERENCES organizations(id) ON DELETE CASCADE,
  role user_role DEFAULT 'Analyst' NOT NULL,
  tenant_id VARCHAR(36),
  vendor_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Magic Codes
CREATE TABLE IF NOT EXISTS magic_codes (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE NOT NULL
);

-- Identities
CREATE TABLE IF NOT EXISTS identities (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  email_verified BOOLEAN DEFAULT FALSE NOT NULL,
  phone_verified BOOLEAN DEFAULT FALSE NOT NULL,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Identity Personas
CREATE TABLE IF NOT EXISTS identity_personas (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  identity_id VARCHAR(36) NOT NULL REFERENCES identities(id) ON DELETE CASCADE,
  persona_type persona_type NOT NULL,
  org_id VARCHAR(36) REFERENCES organizations(id) ON DELETE CASCADE,
  role_detail TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE NOT NULL,
  status persona_status DEFAULT 'active' NOT NULL,
  invited_by_persona_id VARCHAR(36),
  label TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(identity_id, persona_type, org_id)
);

-- Properties
CREATE TABLE IF NOT EXISTS properties (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id VARCHAR(36) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  total_units INTEGER NOT NULL DEFAULT 0,
  occupied_units INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Units
CREATE TABLE IF NOT EXISTS units (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  property_id VARCHAR(36) NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  unit_number TEXT NOT NULL,
  bedrooms INTEGER,
  bathrooms DECIMAL(3,1),
  square_feet INTEGER,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Tenants
CREATE TABLE IF NOT EXISTS tenants (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id VARCHAR(36) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  unit_id VARCHAR(36) REFERENCES units(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  move_in_date DATE,
  move_out_date DATE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Leases
CREATE TABLE IF NOT EXISTS leases (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id VARCHAR(36) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  unit_id VARCHAR(36) NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  monthly_rent DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id VARCHAR(36) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  lease_id VARCHAR(36) NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  status invoice_status DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  invoice_id VARCHAR(36) NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  method payment_method NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Bank Ledger
CREATE TABLE IF NOT EXISTS bank_ledger (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id VARCHAR(36) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  transaction_date DATE NOT NULL,
  description TEXT,
  matched BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Treasury Products
CREATE TABLE IF NOT EXISTS treasury_products (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id VARCHAR(36) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  product_type treasury_product_type NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  apy DECIMAL(5,2) NOT NULL,
  min_investment DECIMAL(10,2),
  active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Treasury Subscriptions
CREATE TABLE IF NOT EXISTS treasury_subscriptions (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id VARCHAR(36) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  product_id VARCHAR(36) NOT NULL REFERENCES treasury_products(id) ON DELETE CASCADE,
  balance DECIMAL(12,2) DEFAULT 0 NOT NULL,
  subscribed_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Vendors
CREATE TABLE IF NOT EXISTS vendors (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id VARCHAR(36) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category vendor_category NOT NULL,
  email TEXT,
  phone TEXT,
  terms payment_terms DEFAULT 'Net30' NOT NULL,
  active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Vendor Invoices
CREATE TABLE IF NOT EXISTS vendor_invoices (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  vendor_id VARCHAR(36) NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  settlement_date DATE,
  status vendor_invoice_status DEFAULT 'pending' NOT NULL,
  yield_amount DECIMAL(8,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Vendor Balances
CREATE TABLE IF NOT EXISTS vendor_balances (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  vendor_id VARCHAR(36) NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  available_balance DECIMAL(10,2) DEFAULT 0,
  total_redemptions DECIMAL(12,2) DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Merchants
CREATE TABLE IF NOT EXISTS merchants (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id VARCHAR(36) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category merchant_category NOT NULL,
  settlement_days INTEGER DEFAULT 1 NOT NULL,
  yield_rate DECIMAL(5,2) DEFAULT 0,
  description TEXT,
  active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Merchant Transactions
CREATE TABLE IF NOT EXISTS merchant_transactions (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  merchant_id VARCHAR(36) NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  tenant_id VARCHAR(36),
  amount DECIMAL(10,2) NOT NULL,
  transaction_date DATE NOT NULL,
  settlement_date DATE,
  status merchant_transaction_status DEFAULT 'pending' NOT NULL,
  yield_earned DECIMAL(8,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Crypto Treasury Flows
CREATE TABLE IF NOT EXISTS crypto_treasury_flows (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id VARCHAR(36) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  flow_type crypto_treasury_flow_type NOT NULL,
  coin_type crypto_coin NOT NULL,
  amount DECIMAL(18,6) NOT NULL,
  status bridge_status DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Crypto Deployments
CREATE TABLE IF NOT EXISTS crypto_deployments (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id VARCHAR(36) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  coin_type crypto_coin NOT NULL,
  deployment_amount DECIMAL(18,6) NOT NULL,
  apy DECIMAL(5,2),
  status crypto_deployment_status DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Incentive Programs
CREATE TABLE IF NOT EXISTS incentive_programs (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id VARCHAR(36) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  program_type incentive_program_type NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  cashback_amount DECIMAL(8,2),
  active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Organization Settings
CREATE TABLE IF NOT EXISTS organization_settings (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id VARCHAR(36) NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  compliance_mode compliance_mode DEFAULT 'indirect_only' NOT NULL,
  pms_provider pms_provider,
  rent_float_enabled BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id VARCHAR(36) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id VARCHAR(36),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id VARCHAR(36),
  changes JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- PMS Import Jobs
CREATE TABLE IF NOT EXISTS pms_import_jobs (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id VARCHAR(36) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  last_run TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Tenant Persona Links
CREATE TABLE IF NOT EXISTS tenant_persona_links (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  persona_id VARCHAR(36) NOT NULL REFERENCES identity_personas(id) ON DELETE CASCADE,
  tenant_id VARCHAR(36) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Vendor Redemptions
CREATE TABLE IF NOT EXISTS vendor_redemptions (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  vendor_id VARCHAR(36) NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  redemption_date DATE NOT NULL,
  status redemption_status DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE magic_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasury_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasury_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_treasury_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE incentive_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pms_import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_persona_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_redemptions ENABLE ROW LEVEL SECURITY;