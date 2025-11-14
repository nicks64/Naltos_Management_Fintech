# Naltos Platform - Project Documentation

## Overview
Naltos is a **stablecoin orchestration platform** that generates yield for customers by transforming idle cash flows into programmable financial assets. Built on top of stablecoin rails (USDC, USDT, DAI), Naltos automatically deploys idle balances from rent, vendor payments, and merchant transactions into short-duration, yield-generating treasury products.

**Core Value Proposition:**
- **For Property Owners**: Earn 2.5-3.5% APY on idle rent and vendor payment float without changing operations
- **For Tenants**: Earn 1-1.5% cashback on rent payments and merchant purchases through yield sharing
- **For Vendors**: Receive instant NUSD payments (stablecoin-backed, instantly redeemable 1:1 for USD) while property owners benefit from payment float yield

The platform orchestrates over $35B+ in idle multifamily finance through three yield sources:
1. **Rent Float** (5-15 days): Time between rent collection and deployment
2. **Vendor Float** (Net30-Net90): Time between instant vendor payment and traditional due date
3. **Merchant Settlement** (1-3 days): Time between tenant purchase and merchant settlement

Naltos uses NUSD, a private, fully-backed internal accounting unit representing $1 held in short-term treasury assets, programmable for automated payouts and yield distribution.

The project's ambition is to evolve into MeshPay, a global stablecoin orchestration and settlement network, supporting multi-currency transactions and optimizing global FX routing.

## User Preferences
I prefer iterative development with a focus on delivering core functionality first. Please ask before making major changes to the architecture or core logic. I appreciate detailed explanations, especially for complex financial concepts or technical implementations. Do not make changes to the `shared/schema.ts` file without explicit approval, as it defines the core data model.

## System Architecture

### UI/UX Decisions
The platform features a dual-sided interface: a Business Console for property managers/owners and a Tenant Portal. The Business Console includes AI-powered reconciliation, financial analytics, and institutional-grade treasury automation. The Tenant Portal is mobile-first, offering rent payments, an NUSD wallet, and yield-earning capabilities. The design uses React, TypeScript, Tailwind CSS, and Shadcn UI, with a primary blue color scheme for institutional trust and Inter for UI typography, with JetBrains Mono for financial figures. Dark mode is fully supported.

### Technical Implementations
- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI, Recharts for data visualization.
- **Backend**: Express.js, TypeScript.
- **Database**: PostgreSQL (Neon) with Drizzle ORM.
- **AI**: GPT-5 via Replit AI Integrations for business intelligence and tenant support assistants.
- **Core Features**:
    - Dual-sided platform with role-based routing.
    - Multi-tenancy with organization-based isolation and RBAC.
    - Treasury Products (NRF, NRK, NRC) for businesses and a yield wallet for tenants.
    - Real-time KPI dashboard with sparklines.
    - Role-Based Access for Admin, PropertyManager, CFO, Analyst, Tenant, and Vendor.
- **NUSD**: A private, fully-backed, redeemable internal accounting unit representing $1 held in short-term treasury assets, instantly redeemable 1:1 for USD, and programmable for automated payouts and yield distribution.
- **Vendor Account System**: Full vendor portal with professional authentication enabling vendors to log in once and access invoices/balances across all property management companies they work with. Uses `vendor_user_links` junction table for explicit multi-org access, eliminating reliance on email heuristics. Vendors have nullable `users.organizationId` to support cross-org visibility while maintaining organizational boundaries for property managers.
- **Vendor Authentication**: Secure magic-link authentication system with dedicated `/api/vendor-auth/*` endpoints. The `requireVendor` middleware revalidates `vendor_user_links` on every request (no session caching) for immediate permission revocation. Vendor sessions store only `{ userId, userRole: "Vendor" }` with `organizationId=undefined`. Regular login rejects vendor users to prevent cross-role session reuse. Session regeneration prevents fixation attacks.

### Feature Specifications
- **Dashboard KPIs**: Displays operational (On-Time %, DSO, Delinquent), financial (Opex/Unit, Treasury AUM, Current Yield), and float yield metrics (Vendor Float AUM, Vendor Yield, Rent Float Yield) in a 3x3 grid.
- **Treasury Orchestration Engine**: Automatically deploys stablecoins (USDC/USDT/DAI) into yield-generating products including tokenized T-Bills (NRF), money-market equivalents (NRK), and delta-neutral credit (NRC).
- **Stablecoin Bridge**: Bidirectional orchestration layer between crypto rails (USDC/USDT/DAI) and legacy PMS systems (AppFolio/Yardi/Buildium), converting traditional payment flows into programmable stablecoin assets.
- **Vendor Payment Flow**: Property managers pay vendors instantly via NUSD → Vendors receive stablecoin-backed payments (redeemable 1:1 for USD) → Float between instant payment and traditional due date (Net30-Net90) generates yield → Yield distributed to property owners, with platform taking small fee.
- **Vendor Redemption System**: Three payout rails with different speed/cost tradeoffs: (1) ACH next-day (default, scheduled for Net30/60/90 due date, no fee), (2) Push-to-Card instant (opt-in early redemption, 1-2% fee), (3) On-Chain Stablecoin (instant crypto withdrawal, minimal gas fee). All implemented as stubs for demo purposes.
- **Multi-Org Vendor Model**: Vendors table is org-specific (each vendor record = "Vendor X working with Property Manager Y"). Single vendor login aggregates data across all property managers via `vendor_user_links` junction table. Example: "ABC Plumbing" working with 3 property managers has 3 vendor records, 1 user account, 3 junction table entries.
- **Economic Model**: Yield is generated from Rent Float (5-15 days), Vendor Float (Net30-Net90), and Merchant Settlement (1-3 days), with distribution to Property Owners (2.5-3.5%), Tenants (1-1.5%), and Naltos Platform (0.5-1%).

### System Design Choices
The system is designed for scalability and security with multi-tenancy, role-based access control (RBAC), and comprehensive audit logging for critical actions. The API routes are structured logically for authentication, tenant-specific actions, dashboard KPIs, collections, reconciliation, treasury, crypto treasury, rent float treasury, and administrative functions.

## External Dependencies
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **AI**: GPT-5 (via Replit AI Integrations)
- **Legacy PMS Systems Integration**: AppFolio, Yardi, Buildium (via Stablecoin Bridge)
- **Stablecoin Rails**: USDC, USDT, DAI
```