# Naltos Platform - Project Documentation

## Project Overview

**Naltos transforms multifamily rent flows into a programmable financial asset** by orchestrating stablecoin rails and automating treasury yield on idle cash. By converting rent, vendor invoices, and merchant transactions into **NUSD** (a fully-backed programmatic dollar), Naltos deploys idle balances into short-duration, low-risk assets — generating yield for property owners, creating incentives for tenants, and operating a seamless payment layer for vendors and merchants.

### Core Innovation
Traditional multifamily finance leaves **$35B+ idle monthly** earning 0%. Naltos treats rent as **short-duration financial assets** capable of producing yield through:
- **Rent Float** (5-15 days): Tenant payment → Owner disbursement
- **Vendor Float** (Net30-Net90): Instant vendor payout → Extended treasury deployment
- **Merchant Settlement** (1-3 days): Transaction → Settlement float

### Platform Architecture
- **Business Console**: Property managers/owners with AI-powered reconciliation, financial analytics, and institutional-grade treasury automation
- **Tenant Portal**: Mobile-first resident interface with rent payments, NUSD wallet, and yield-earning capabilities
- **Treasury Engine**: Automated deployment into tokenized T-Bills (4.8-5.2%), money-market equivalents, and delta-neutral credit
- **Stablecoin Bridge**: Bidirectional conversion layer between crypto rails (USDC/USDT/DAI) and legacy PMS systems (AppFolio/Yardi/Buildium)

## Architecture

### Tech Stack
- **Frontend**: React + TypeScript + Tailwind CSS + Shadcn UI
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **AI**: GPT-5 via Replit AI Integrations
- **Charts**: Recharts for data visualization

### Key Features
1. **Dual-Sided Platform**: Separate UIs for business users and tenants with role-based routing
2. **Multi-tenancy**: Organization-based isolation with RBAC
3. **Treasury Products**: NRF, NRK, NRC products for business; yield wallet for tenants
4. **AI Agents**: Business intelligence assistant + tenant support assistant
5. **Real-time Analytics**: KPI dashboard with sparklines
6. **Role-Based Access**: Admin, PropertyManager, CFO, Analyst, Tenant roles

## Economic Model

### Yield Sources
1. **Rent Float (5-15 days)**: Tenant pays → Treasury deploys → Owner receives rent + yield
2. **Vendor Float (Net30-Net90)**: Vendor paid instantly in NUSD → Naltos holds USD 30-90 days → Yield multiplies 3-9×
3. **Merchant Settlement (1-3 days)**: Transaction → Settlement buffer → Treasury yield

### Yield Distribution
- **Property Owners**: 2.5-3.5% (increased NOI, reduced operating expenses)
- **Tenants**: 1-1.5% (rebates, rewards, reduced effective rent)
- **Naltos Platform**: 0.5-1% (operations, infrastructure, compliance)

### NUSD - The Programmable Dollar
NUSD is a **private, fully-backed, redeemable internal accounting unit** (not a public cryptocurrency):
- Represents $1 held in short-term treasury assets
- Instantly redeemable 1:1 for USD
- Programmable for treasury rules, automated payouts, and yield distribution
- Enables 24/7 settlement, instant vendor payments, and composable treasury operations

### Future: MeshPay Expansion
At scale, Naltos evolves into **MeshPay** — a global stablecoin payment and settlement network:
- Multi-currency support (USDC, EURC, XSGD, PYUSD, USDT, NUSD)
- Global FX routing and optimization
- Instant merchant/vendor liquidity
- Network effects: More transactions → More float → More yield

## Database Schema

### Core Tables
- `organizations` - Tenant organizations
- `users` - User accounts with roles
- `properties` - Real estate properties
- `units` - Individual rental units
- `tenants` - Tenant information
- `leases` - Lease agreements
- `invoices` - Billing records
- `payments` - Payment transactions
- `bank_ledger` - Bank/PMS ledger entries
- `treasury_products` - Treasury product definitions
- `treasury_subscriptions` - User subscriptions to treasury products
- `crypto_wallets` - Stablecoin wallet balances (USDC, USDT, DAI) + NUSD accounting
- `crypto_transactions` - Crypto transaction history (deposits, conversions, withdrawals, rent_payment)
- `organization_settings` - Org configuration (rent float + bridge settings: yield rates, split percentages, conversion strategy)
- `bridge_conversion_jobs` - Queue for bidirectional crypto↔fiat conversions with yield tracking
- `bridge_conversions` - Immutable execution records with fees and yield earned
- `bridge_sync_logs` - AppFolio/Buildium/Yardi sync audit trail with retry logic
- `bridge_payment_links` - Audit trail linking crypto→invoices→payments→conversions
- `audit_logs` - Compliance audit trail

### Relationships
- Organizations have many users, properties, and subscriptions
- Properties have many units
- Units have many leases
- Leases belong to units and tenants
- Invoices belong to leases
- Payments belong to invoices
- Full relations defined using Drizzle ORM

## API Routes

### Authentication (`/api/auth/*`)
- `POST /api/auth/signup` - Create org + user (Business only)
- `POST /api/auth/login` - Magic code login (both Business and Tenant)
- `POST /api/auth/send-code` - Send magic code
- `POST /api/auth/logout` - End session

### Tenant Routes (`/api/tenant/*`)
- `GET /api/tenant/rent-summary` - Get upcoming rent and payment history
- `POST /api/tenant/pay-rent` - Process rent payment (mocked)
- `GET /api/tenant/wallet` - Get wallet balance and yield info
- `POST /api/tenant/wallet/deposit` - Deposit funds to wallet
- `POST /api/tenant/wallet/withdraw` - Withdraw funds from wallet
- `POST /api/tenant/wallet/yield-opt-in` - Toggle yield earnings
- `GET /api/tenant/reports` - Get payment receipts and YTD summary
- `GET /api/tenant/settings` - Get tenant profile and preferences
- `POST /api/tenant/settings/profile` - Update contact information
- `POST /api/tenant/settings/payment-method` - Add payment method
- `POST /api/tenant/agent` - AI assistant for tenants (streaming)

### Dashboard (`/api/kpis`)
- `GET /api/kpis` - Fetch all KPI metrics
  - Returns: onTimePercent, dso, delinquentAmount, opexPerUnit, treasuryAUM, currentYield, sparklineData

### Collections (`/api/collections/*`)
- `GET /api/collections` - List delinquent/upcoming items
- `POST /api/collections/:id/paylink` - Send payment link (mocked)
- `POST /api/collections/:id/nudge` - Schedule reminder (mocked)

### Reconciliation (`/api/recon/*`)
- `GET /api/recon` - Get ledgers + suggestions
- `POST /api/recon/auto-match` - Run AI matching
- `POST /api/recon/approve` - Approve match

### Treasury (`/api/treasury/*`)
- `GET /api/treasury/products` - List all products with subscriptions
- `POST /api/treasury/subscribe` - Allocate funds to product
- `POST /api/treasury/redeem` - Withdraw funds
- `POST /api/treasury/autoroll` - Toggle auto-roll preference

### Crypto Treasury (`/api/crypto/*`)
- `GET /api/crypto/wallets` - Get stablecoin wallet balances (USDC, USDT, DAI)
- `POST /api/crypto/convert` - Convert between stablecoins (1:1 ratio, 0.1% fee)
- `POST /api/crypto/to-usd` - Convert crypto to USD (0.2% fee, 1-2 day settlement)
- `GET /api/crypto/transactions` - Get crypto transaction history

### Rent Float Treasury (`/api/rent-float`)
- `GET /api/rent-float` - Get rent float metrics and cash flow model
  - Returns: totalFloat, averageDuration, monthlyYield, ownerShare, tenantShare, naltosShare, recentPayments, config
  - Calculates yield on rent payment float between tenant payment and owner disbursement

### Tenant Crypto (`/api/tenant/crypto/*`)
- `GET /api/tenant/crypto/wallets` - Get tenant stablecoin balances
- `POST /api/tenant/crypto/convert` - Convert between stablecoins
- `GET /api/tenant/crypto/transactions` - Get tenant crypto transaction history

### Agent (`/api/agent`)
- `POST /api/agent` - Streaming AI responses using GPT-5

### Reports (`/api/reports`)
- `GET /api/reports` - Analytics data for charts

### Settings (`/api/settings/*`)
- `GET /api/settings` - Org settings
- `POST /api/settings/organization` - Update org profile
- `POST /api/settings/update` - Update settings
- `GET /api/settings/users` - List org users

### Admin (`/api/admin/*`)
- `POST /api/admin/reset` - Reset demo data to seed state
- `POST /api/pms/sync` - Mock PMS sync

## Frontend Components

### Layout Components
- `AppSidebar` - Business navigation sidebar with org switcher
- `TenantSidebar` - Tenant navigation sidebar (Home, Wallet, Assistant, Reports, Settings)
- `ThemeToggle` - Dark mode toggle

### Business Page Components
- `Login` - Auth with role selector, magic code, or signup
- `Dashboard` - KPI cards with sparklines
- `Collections` - Payment management table
- `Reconciliation` - Two-pane ledger matching
- `Treasury` - Product cards with subscribe/redeem
- `CryptoTreasury` - Stablecoin wallet management with conversions and transactions
- `RentFloat` - Rent float treasury dashboard with visual cash flow diagram and yield distribution
- `Reports` - Charts and analytics
- `Agent` - AI business intelligence chat
- `Settings` - Org/user/PMS/compliance config

### Tenant Page Components (all in `/pages/tenant/`)
- `TenantHome` - Rent due card, payment history, quick actions
- `TenantWallet` - Balance, yield toggle, deposit/withdraw
- `TenantAgent` - AI assistant with quick prompts
- `TenantReports` - Payment receipts, year-end summary
- `TenantSettings` - Profile, payment methods, notifications

### Shared Components
All using Shadcn UI: Button, Card, Table, Dialog, Select, Badge, Input, etc.

## Design System

### Colors
- Primary: Blue (#1D4ED8 family) - institutional trust
- Chart colors: Defined in index.css
- Dark mode: Full support with automatic color adaptation

### Typography
- **UI Font**: Inter (400, 500, 600, 700)
- **Monospace**: JetBrains Mono (500) for financial figures
- Financial numbers use `font-mono tabular-nums`

### Spacing
- Card padding: p-6 or p-8
- Page margins: px-8 py-6
- Component gaps: gap-4 or gap-6

### Responsive
- Mobile: Stack all cards, hamburger nav
- Tablet: 2-column grids
- Desktop: 3-column layouts, fixed sidebar

## Data Flow

### Authentication Flow
1. User enters email → sends magic code
2. User enters code → validates and creates session
3. Session stored in localStorage + auth context
4. Protected routes check auth before rendering

### KPI Calculation Logic
- On-Time %: `(paid invoices / total due in last 30 days) * 100`
- DSO: Weighted average of `(paid date - due date)` across invoices
- Delinquent $: Sum of overdue invoice amounts
- Opex/Unit: `Total monthly opex / total unit count`
- Treasury AUM: Sum of all subscription balances
- Current Yield: Weighted average of product yields by AUM

### Reconciliation Matching
- Compares bank ledger entries with payment records
- Matches on: amount (±$5 tolerance) + date proximity (±3 days)
- Assigns confidence score based on similarity
- Marks entries as matched when approved

## Seed Data Strategy

### Demo Accounts
**Business User:**
- Email: demo@naltos.com
- Org: Naltos Demo Properties
- Role: Admin
- Access: Full business console features

**Tenant User:**
- Email: tenant@demo.com
- Org: Naltos Demo Properties (linked as resident)
- Role: Tenant
- Access: Tenant portal only (rent, wallet, reports)

### Properties (3)
1. Sunset Gardens (80 units)
2. Harbor View (70 units)
3. Parkside Residences (50 units)

### Invoices Distribution
- 60% paid on time
- 25% pending (not yet due)
- 10% overdue
- 5% partially paid

### Treasury Initial State
- NRF: $1,200,000 AUM, 5.1% yield
- NRK: $800,000 AUM, 5.2% yield
- NRC: $300,000 AUM, 5.8% yield, 1.42x OC

## Compliance & Security

### Role Permissions
- **Admin**: Full access to all features
- **CFO**: Treasury + financial features
- **PropertyManager**: Collections + reconciliation
- **Analyst**: Read-only access

### Compliance Modes
- **Indirect Only**: Access to NRF/NRK only
- **Accredited Access**: Full NRC access (Admin/CFO only)

### Audit Logging
All critical actions logged:
- PMS sync runs
- Match approvals
- Treasury subscriptions/redemptions
- Role changes

## Development Workflow

### Adding New Features
1. Define schema in `shared/schema.ts`
2. Run `npm run db:push`
3. Add storage interface methods
4. Implement API routes
5. Build frontend components
6. Connect with React Query

### Testing Demo Flow
1. Login with demo org
2. View KPIs on dashboard
3. Send paylink from collections
4. Auto-match in reconciliation
5. Subscribe to NRC treasury product
6. Ask agent for insights
7. Reset demo data

## Known Mocked Features
- Email/SMS sending (toasts only)
- PMS API integration (fixtures)
- Payment processing (instant updates)
- Report exports (download toasts)
- Agent responses use GPT-5 but with demo context

## Future Enhancements (Beyond MVP)
- Real PMS integrations via OAuth
- Actual email/SMS via Twilio
- PDF report generation
- Advanced AI analytics
- Real treasury custody APIs
- Webhook support for events
- Mobile app companion
