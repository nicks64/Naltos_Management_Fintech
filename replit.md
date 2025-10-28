# Naltos Platform - Project Documentation

## Project Overview
Naltos is a sophisticated dual-sided property management platform with integrated treasury solutions. Built as a production-quality demo showcasing enterprise SaaS capabilities including:
- **Business Console**: For property managers/owners with AI-powered reconciliation, financial analytics, and institutional-grade treasury products
- **Tenant Portal**: Consumer-facing mobile-first interface for residents with rent payments, yield wallet, and AI assistant

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
- `organization_settings` - Org configuration
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
