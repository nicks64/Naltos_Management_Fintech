# Naltos Platform - Project Documentation

## Overview
Naltos is a cash-flow intelligence and payments optimization platform for multifamily real estate. It aims to transform rent into a predictable, optimized, and behavior-driven financial asset, operating entirely in USD without exposing users to cryptocurrency terminology.

**Core Mission:**
- Improve rent collection reliability and predictability.
- Unlock Net Operating Income (NOI) through behavioral incentives and automation.
- Provide real-time cash-flow visibility to owners and property managers.
- Reduce manual reconciliation and collections labor.

**Current Value Proposition:**
- **For Property Owners**: Earn yield on idle rent and vendor payment float; use behavior-driven incentives to improve on-time payment rates.
- **For Tenants**: Earn USD cashback through on-time payments and behavioral incentives.
- **For Vendors**: Receive instant USD payments while keeping Net30-90 terms; earn yield-sharing cashback.

The platform addresses key multifamily pain points such as late and unpredictable rent payments, idle and unforecasted cash, labor-intensive manual reconciliation, lack of positive tenant incentives, and inability to optimize cash. It utilizes an internal ledger and existing payment rails (ACH, cards) with modern payment infrastructure as an invisible backend optimization, with future consideration for stablecoin treasury optimization.

Yield is generated from Rent Float (average 10 days), Vendor Float (Net30-90 terms), and Merchant Settlement (1-3 days). An internal accounting unit, NUSD, represents $1 held in treasury assets for internal ledger, yield distribution, and automated payouts, never exposed to users.

## User Preferences
I prefer iterative development with a focus on delivering core functionality first. Please ask before making major changes to the architecture or core logic. I appreciate detailed explanations, especially for complex financial concepts or technical implementations. Do not make changes to the `shared/schema.ts` file without explicit approval, as it defines the core data model.

## System Architecture

### AI & ML Systems
The platform incorporates AI and ML for behavioral incentives, float optimization, payment intelligence, and lease agreement orchestration. Current focus includes collection incentive programs, vendor payout routing, and AI-generated lease agreements. Future phases will introduce rent payment probability models, incentive optimization, early intervention logic for delinquencies, cash-flow forecasting, and automated collection routing. Optional future phases include stablecoin bridge for treasury yield optimization and tokenized LP distributions.

### UI/UX Decisions
The platform features a dual-sided interface: Business Console (property managers/owners) and Tenant Portal. The Business Console offers behavioral analytics, financial dashboards, and incentive management. The Tenant Portal is mobile-first, supporting rent payments, cashback tracking, and incentive status. The design uses React, TypeScript, Tailwind CSS, Shadcn UI, with a primary blue color scheme, Inter typography, and JetBrains Mono for figures, including full dark mode support. All user-facing interfaces display only USD and avoid crypto terminology.

### Technical Implementations
-   **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI, Recharts for data visualization.
-   **Backend**: Express.js, TypeScript.
-   **Database**: PostgreSQL (Neon) with Drizzle ORM, serving as an internal ledger.
-   **AI/ML**: GPT-5 via Replit AI Integrations for business intelligence; Python/TensorFlow for future payment probability models.
-   **Core Features**: Dual-sided platform with role-based routing (Admin, PropertyManager, CFO, Analyst, Tenant, Vendor), multi-tenancy with organization-based isolation and RBAC, Treasury Products (NRF, NRK, NRC for tokenized T-Bills, money markets, delta-neutral credit), real-time KPI dashboards, behavioral incentive management, and collection intelligence.
-   **NUSD**: An internal accounting unit (1 NUSD = $1 treasury value) for automated payouts and yield distribution, not exposed to end users.
-   **Vendor Account System**: A full vendor portal with professional authentication, allowing vendors to access invoices/balances across multiple property management companies via `vendor_user_links`. Vendor authentication uses secure magic-link system with dedicated API endpoints and strict revalidation for immediate permission revocation.

### Feature Specifications
-   **Dashboard KPIs**: Displays operational (On-Time %, DSO, Delinquent), financial (Opex/Unit, Treasury AUM, Current Yield), and float yield metrics.
-   **Treasury Orchestration Engine**: Automatically deploys stablecoins into yield-generating products.
-   **Stablecoin Bridge**: Bidirectional orchestration layer between crypto rails (USDC/USDT/DAI) and legacy PMS systems (AppFolio/Yardi/Buildium).
-   **Vendor Payment Flow**: Property managers pay vendors instantly via NUSD; vendors receive stablecoin-backed payments redeemable 1:1 for USD. Yield is generated from the float between instant payment and traditional due dates, distributed to owners, tenants, and the platform.
-   **Vendor Redemption System**: Three payout rails: ACH next-day, Push-to-Card instant (with fee for early redemption), and On-Chain Stablecoin (instant crypto withdrawal, minimal gas fee).
-   **Multi-Org Vendor Model**: Vendor data is aggregated across multiple property managers for a single vendor user account.
-   **Economic Model**: Yield is generated from Rent Float, Vendor Float, and Merchant Settlement, with distribution to Property Owners, Tenants, and Naltos Platform.

### System Design Choices
-   **Ledger-Based, Not Blockchain**: Internal PostgreSQL ledger with audit trails.
-   **Existing Payment Rails**: ACH, cards, and existing PMS integrations (AppFolio, Yardi, Buildium).
-   **Modular Architecture**: Supports future stablecoin and tokenization features without disrupting current cash-flow operations.
-   **Multi-Tenancy First**: Organization-based isolation with per-org settings and configurations.
-   **RBAC & Audit Logging**: Role-based access control and comprehensive audit logging for compliance.
-   **API Structure**: Organized by domain for clear separation of functionalities.

## External Dependencies
-   **Database**: PostgreSQL (Neon)
-   **ORM**: Drizzle ORM
-   **AI**: GPT-5 (via Replit AI Integrations)
-   **Legacy PMS Systems Integration**: AppFolio, Yardi, Buildium
-   **Stablecoin Rails**: USDC, USDT, DAI