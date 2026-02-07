# Naltos Platform - Project Documentation

## Overview
Naltos is a **cash-flow intelligence and payments optimization platform for multifamily real estate** that transforms rent from a passive inflow into a predictable, optimized, and behavior-driven financial asset. **Everything is in USD** — no stablecoins or crypto terminology visible to users.

**Core Mission:**
- Improve rent collection reliability and predictability
- Unlock NOI through behavioral incentives and automation
- Provide real-time cash-flow visibility to owners and PMs
- Reduce manual reconciliation and collections labor

**Current Value Proposition:**
- **For Property Owners**: Earn yield on idle rent and vendor payment float; use behavior-driven incentives to improve on-time payment rates
- **For Tenants**: Earn USD cashback through on-time payments and behavioral incentives
- **For Vendors**: Receive instant USD payments while keeping Net30-90 terms; earn yield-sharing cashback

**Technology Approach:**
- Internal ledger (not blockchain)
- Existing payment rails (ACH, cards)
- Modern payment infrastructure as invisible backend optimization
- Optional: future stablecoin treasury optimization

**Strategic Framework:**

The platform solves key multifamily pain points:
- **Rent payments are late & unpredictable** → Use ML payment probability models to forecast and intervene early
- **Cash sits idle and unforecasted** → Provide daily/weekly cash-flow visibility and stress scenarios
- **Manual reconciliation is labor-intensive** → Automate via internal ledger and audit trails
- **Tenants lack positive incentives** → Personalized behavioral incentives (cashback, rewards) increase on-time rates
- **Owners can't optimize cash** → Treasury yield on idle float while maintaining traditional payment terms

**Current Yield Sources (Phase 1: Payment Behavior + Float Optimization):**
1. **Rent Float** (10 days avg): $1,500 rent → instant payment → 10-day float → $1.23 yield
2. **Vendor Float** (Net30-90): $10K invoice → instant payment → 30-day float → $37.50 yield (3-9× rent float)
3. **Merchant Settlement** (1-3 days): $20 purchase → 2-day float → $0.006 yield

**NUSD** (internal accounting unit): Represents $1 held in treasury assets. Used for internal ledger, yield distribution, and automated payouts. Never exposed to users.

## User Preferences
I prefer iterative development with a focus on delivering core functionality first. Please ask before making major changes to the architecture or core logic. I appreciate detailed explanations, especially for complex financial concepts or technical implementations. Do not make changes to the `shared/schema.ts` file without explicit approval, as it defines the core data model.

**Recent Feature Additions (February 2026):**
- Rent Float Treasury: Enhanced page with 12-month performance chart, treasury deployment allocation (4 products: Treasury Bills/Money Market/Enhanced Credit/Liquidity Reserve), float velocity panel with real-time utilization metrics, tabbed detail sections (Yield Distribution/Model Comparison/Recent Payments), and neural float intelligence panel with 4 AI-driven insights. Backend `/api/rent-float/enhanced` endpoint with demo data fallback.
- **Cash Flow Forecasting** (Feb 7): New `/cash-flow-forecast` page with 30/60/90-day liquidity projections, daily/weekly chart toggle, 3 scenario cards (Baseline/Optimistic/Stress), model assumptions panel. Backend `/api/forecast` endpoint.
- **Enhanced Collections** (Feb 7): Rewritten `/collections` page with 4 KPI summary cards, aging bucket bar chart, collection trend line chart, risk-scored tenant table with filters (risk level, status), bulk actions (Send Paylinks, Schedule Nudges). Backend `/api/collections/enhanced` endpoint.
- **Tenant Payment Calendar** (Feb 7): New `/tenant/payment-calendar` page with upcoming payment timeline, autopay toggle with settings, payment streak counter, projected annual cashback. Backend `/api/tenant/payment-calendar` and `/api/tenant/autopay` endpoints.
- **Activity Feed & Notifications** (Feb 7): Cross-role notification bell component in all 4 portal headers (Business, Tenant, Vendor, Merchant). Role-specific activities with unread tracking. Backend `/api/activity` and `/api/activity/read` endpoints.
- **Vendor/Merchant Statements** (Feb 7): New 4th "Statements" tab in both Vendor and Merchant portals showing 6 months of downloadable monthly statements with invoice counts, amounts, and yield earned. Backend `/api/vendor/statements` and `/api/merchant/statements` endpoints.

**Recent Feature Additions (November 2025):**
- Collection Incentives: Feature to improve rent collection rates through strategic USD cashback incentives (frontend demo with stubbed data, backend schema defined)
- Vendor Payout System: Complete vendor redemption flow with three payout rails (ACH Net30-90, Push-to-Card instant, On-Chain instant) and comprehensive Net30-90 terms explainer showing yield calculations

**Phase 3 Major Platform Evolution (February 2026):**
- **Rent Stability Dashboard**: Portfolio risk heatmap, 5-tier ML delinquency forecasting (Green/Yellow/Orange/Red/Critical), refinance readiness package export, ownership cohort tracker (Tier 1-3), rent-to-own opportunity index with readiness scoring
- **Business Console Dashboard**: Operational risk alerts with live anomaly detection, collection variance analysis (expected vs actual ML model), enhanced 9-metric KPI cards with sparklines
- **Tenant Home**: Flexible payment options (full/split-2/weekly), P2P rent splitting with roommate invites, 4-tier streak-based cashback engine (Bronze $2/mo, Silver $3.50/mo, Gold $5/mo, Platinum $8/mo), yield flow visualization showing rent float mechanics
- **Tenant Ownership Readiness**: Complete 3-tier eligibility system (Stable/FHA/NACA), escrow wallet with vesting events and yield tracking, 7-document lender handoff package with 3 matched lenders (NACA/FHA/CRA), behavioral nudging engine
- **Treasury & Float Management**: 4-tab layout (Products/Float/Yield Routing/Sharing), float volume stacked area chart, yield routing configuration per bucket, programmable yield sharing across 4 stakeholders (Owners 85%, Tenants 5%, Vendors 3%, Platform 7%)
- **Tenant Wallet**: Multi-tab (Yield & Settings/Rewards/Escrow/Purchase Yield), reward history with categorized rewards, escrow progress visualization, merchant purchase yield breakdown showing 3-way split

**Important UI/UX Decisions (November 2025):**
- All user-facing interfaces must display USD ONLY — no crypto terminology (USDC, USDT, DAI, stablecoin, blockchain, crypto) visible to users
- Replacement terminology: "digital payment infrastructure", "treasury-backed", "modern payment infrastructure", "backend infrastructure"
- Tenant Portal APY: 3% (verified math: $1,500 × 3% × 10 days = $1.23 yield)
- Treasury Management page displays generic asset labels ("Treasury Asset A/B/C" or "Asset A/B/C") instead of crypto tickers

## System Architecture

### AI & ML Systems (Priority Roadmap)

**Phase 1 (Current): Behavioral Incentives & Float Optimization**
- ✅ Collection Incentive Programs: Early payment, on-time streak, recovery bonuses
- ✅ Vendor Payout Routing: Three rails (ACH/Push-to-Card/On-Chain) with yield preservation
- 🔄 Collection Incentive Analytics: ROI tracking per program

**Phase 2 (Next): Payment Intelligence**
- [ ] Rent Payment Probability Model: Predict payment timing, risk scores, probability distributions
- [ ] Incentive Optimization Model: Personalize incentive amount/timing/type per tenant
- [ ] Early Intervention Logic: Trigger outreach before delinquency

**Phase 3 (Future): Cash-Flow Intelligence**
- [ ] Cash-Flow Forecasting: Daily/weekly liquidity visibility with uncertainty bands
- [ ] Collections Routing: Automate vs escalate decisions based on payment probability
- [ ] Property Health Intelligence: Aggregate tenant behavior into NOI drivers

**Phase 4 (Optional): Treasury Optimization**
- [ ] Stablecoin bridge for treasury yield optimization
- [ ] Tokenized LP distributions
- [ ] Cross-border capital flows

### UI/UX Decisions
The platform features a dual-sided interface: Business Console (property managers/owners) and Tenant Portal. The Business Console includes behavioral analytics, financial dashboards, and incentive management. The Tenant Portal is mobile-first, offering rent payments, cashback tracking, and incentive status. Design: React, TypeScript, Tailwind CSS, Shadcn UI, primary blue (institutional trust), Inter typography, JetBrains Mono for figures. Full dark mode support. **All USD-based, no crypto terminology visible.**

### Technical Implementations
- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI, Recharts for data visualization.
- **Backend**: Express.js, TypeScript.
- **Database**: PostgreSQL (Neon) with Drizzle ORM — internal ledger (not blockchain).
- **AI/ML**: GPT-5 via Replit AI Integrations for business intelligence; Python/TensorFlow for payment probability models (future phase).
- **Core Features**:
    - Dual-sided platform with role-based routing (Admin, PropertyManager, CFO, Analyst, Tenant, Vendor).
    - Multi-tenancy with organization-based isolation and RBAC.
    - Treasury Products (NRF, NRK, NRC): tokenized T-Bills, money markets, delta-neutral credit.
    - Real-time KPI dashboard with sparklines and operational metrics.
    - Behavioral incentive management (programs, ROI tracking, per-tenant personalization).
    - Collection intelligence (automated routing, outreach timing, escalation logic).
- **NUSD**: Internal accounting unit (1 NUSD = $1 treasury value), redeemable, programmable for automated payouts and yield distribution. Never exposed to end users.
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
- **Ledger-Based, Not Blockchain**: Internal PostgreSQL ledger with audit trails for full auditability and compliance.
- **Existing Payment Rails**: ACH, cards, existing PMS integrations (AppFolio, Yardi, Buildium) as primary integration points.
- **Modular Architecture**: Clean separation of concerns to support future stablecoin and tokenization features without disrupting current cash-flow operations.
- **Multi-Tenancy First**: Organization-based isolation with per-org settings, compliance modes, and treasury configurations.
- **RBAC & Audit Logging**: Role-based access control for Admin, PropertyManager, CFO, Analyst, Tenant, Vendor. Comprehensive audit logging for regulatory compliance and forensic investigation.
- **API Structure**: Organized by domain: auth, tenant actions, dashboard KPIs, collections, incentives, treasury, reconciliation, vendor/merchant flows, administrative functions.

## External Dependencies
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **AI**: GPT-5 (via Replit AI Integrations)
- **Legacy PMS Systems Integration**: AppFolio, Yardi, Buildium (via Stablecoin Bridge)
- **Stablecoin Rails**: USDC, USDT, DAI
```