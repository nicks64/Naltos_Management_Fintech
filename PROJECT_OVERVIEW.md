# Naltos Platform - Project Overview

## Executive Summary

**Naltos** is a stablecoin orchestration platform that transforms idle cash flows in the multifamily property management industry into programmable, yield-generating financial assets. The platform operates on top of stablecoin rails (USDC, USDT, DAI) to capture and monetize payment float periods that traditionally sit idle in bank accounts.

**Future Vision**: The project's ambition is to evolve into **MeshPay**, a global stablecoin orchestration and settlement network supporting multi-currency transactions and optimizing global FX routing. The current Naltos Platform serves as the foundation for this larger vision, proving the orchestration model in the multifamily real estate vertical before expanding globally.

**Market Opportunity**: $35B+ in idle multifamily finance across three distinct float periods:
- Rent Float (5-15 days)
- Vendor Payment Float (Net30-Net90)
- Merchant Settlement Float (1-3 days)

**Core Innovation**: NUSD, a private, fully-backed internal accounting unit representing $1 held in short-term treasury products, instantly redeemable 1:1 for USD, programmable for automated yield distribution.

---

## Capital Flow Architecture

### The Three Revenue Streams

#### 1. Rent Float Revenue (5-15 days)
```
Property Owner → Collects Rent → Held 5-15 days before deployment
                                ↓
                    Deployed to Treasury Products (NRF/NRK/NRC)
                                ↓
                         Generates 2.5-3.5% APY
                                ↓
              Distributed: Owner (90%), Platform (10%)
```

**Example**: 
- Property collects $100K rent on 1st of month
- Deploys to operations/expenses on 15th
- 15-day float @ 3% APY = ~$123 yield
- Owner earns $111, Platform earns $12

#### 2. Vendor Payment Float (Net30-Net90) - **Primary Value Driver**
```
Property Manager → Vendor Invoice ($10K, Net30 due date)
        ↓
Instant NUSD Payment to Vendor (Day 0)
        ↓
Vendor receives $10K NUSD immediately (vs. waiting 30 days)
        ↓
$10K deployed to Treasury Products for 30 days
        ↓
Generates yield @ 4.5% APY = $37 per invoice
        ↓
Distributed: Property Owner ($33), Vendor ($2 cashback), Platform ($2)
        ↓
Day 30: Traditional payment due date, vendor can redeem via:
  - ACH (free, scheduled for Net30/60/90)
  - Push-to-Card (1-2% fee, instant)
  - On-Chain Stablecoin (minimal gas, instant)
```

**Key Benefit**: Vendors get instant liquidity, property owners earn yield on float, zero cost to operations.

#### 3. Merchant Settlement Float (1-3 days)
```
Tenant → Purchases at Merchant ($500)
           ↓
    Payment in NUSD
           ↓
Merchant holds $500 NUSD for 1-3 days settlement period
           ↓
Deployed to Treasury Products
           ↓
Generates yield @ 4.5% APY = ~$0.18 per transaction
           ↓
Distributed: Property Owner (50%), Tenant (40%), Platform (10%)
           ↓
Merchant settles on schedule (daily/weekly/monthly)
```

**Example Monthly Flow** (100-unit property):
- Tenant spend: $50K/month
- Average 2-day settlement float
- Monthly yield: ~$12
- Tenant earns $4.80 cashback, Owner earns $6

---

## System Architecture

### Four-Portal Structure

#### 1. **Business Console** (Property Managers/CFOs)
**Users**: Property Management Companies, Real Estate Operators
**Functions**:
- Treasury orchestration controls
- Stablecoin allocation (USDC/USDT/DAI → NRF/NRK/NRC)
- Yield distribution management
- Vendor instant payment processing
- Analytics and KPI dashboards
- Multi-property portfolio management

**Key Metrics Displayed**:
- Total AUM (Assets Under Management)
- Current Yield Rate
- Vendor Float Yield
- Rent Float Yield
- Payment Processing Status

#### 2. **Vendor Portal** (Plumbers, Contractors, Service Providers)
**Users**: Vendors servicing multiple property management companies
**Functions**:
- Multi-org invoice aggregation (single login, all PMCs)
- NUSD balance tracking with stablecoin backing visualization
- Redemption calculator (compare ACH/Card/On-Chain options)
- Yield analytics showing earnings from payment float
- Payout method management

**Key Features**:
- See invoices across ALL property management companies
- Track yield earned while holding NUSD
- Flexible redemption: wait for Net30 (free) or redeem early (fee)

#### 3. **Merchant Portal** (Grocery Stores, Restaurants, Services)
**Users**: Merchants accepting NUSD from tenants
**Functions**:
- Transaction history and settlement tracking
- NUSD balance with stablecoin/treasury backing display
- Settlement preferences (daily/weekly/monthly)
- Yield analytics from settlement float
- Payment method configuration

**Revenue Model**: Merchants earn from float while providing tenant cashback incentive.

#### 4. **Tenant Portal** (Apartment Residents)
**Users**: Tenants living in participating properties
**Functions**:
- Rent payments in crypto/NUSD
- NUSD wallet for merchant purchases
- Yield earnings dashboard (1-1.5% cashback)
- Transaction history
- Crypto wallet management

**Benefit**: Earn passive yield on rent payments + cashback on purchases.

---

## Technical Stack

### Frontend
- **Framework**: React + TypeScript
- **Styling**: Tailwind CSS + Shadcn UI components
- **State Management**: TanStack Query (React Query v5)
- **Routing**: Wouter
- **Charts**: Recharts
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js + Express
- **Language**: TypeScript
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL (Neon-hosted)
- **AI**: GPT-5 (via Replit AI Integrations)

### Data Model Highlights
- **Multi-tenancy**: Organization-scoped data isolation
- **RBAC**: Admin, PropertyManager, CFO, Analyst, Tenant, Vendor, Merchant roles
- **Vendor Multi-Org Access**: Junction table (`vendor_user_links`) for cross-PMC visibility
- **Treasury Tracking**: Separate tables for stablecoin allocations and treasury product deployments

---

## NUSD: The Orchestration Layer

### What is NUSD?

**NUSD** is NOT a cryptocurrency or public stablecoin. It's a **private, internal accounting unit** that represents:
- **$1 USD equivalent** held in short-term treasury products
- **Fully backed 1:1** by a basket of stablecoins (USDC/USDT/DAI)
- **Instantly redeemable** for USD via multiple payout rails
- **Programmable** for automated yield distribution

### NUSD Backing Structure
```
1 NUSD = $1 USD equivalent
         ↓
Backed by: USDC (40%) + USDT (35%) + DAI (25%)
         ↓
Deployed to: NRF (50%) + NRK (30%) + NRC (20%)
         ↓
Generates: 3-5% APY yield
```

**Treasury Products**:
- **NRF** (Naltos Rent Float): Tokenized T-Bills, 3.5% APY, ultra-safe
- **NRK** (Naltos Reserve Kit): Money-market equivalent, 4.5% APY, liquid
- **NRC** (Naltos Rent Credit): Delta-neutral credit, 5% APY, higher yield

### Why NUSD vs. Direct Stablecoins?

1. **Yield Generation**: NUSD earns yield automatically while USDC/USDT in wallets don't
2. **Programmability**: Automatic yield splits, scheduled settlements, cashback distribution
3. **Simplified UX**: Users see "dollars" not crypto addresses
4. **Regulatory Flexibility**: Private accounting unit vs. public stablecoin regulations

---

## Economic Model: Who Gets What?

### Vendor Payment Float Distribution
| Stakeholder | Share | Example ($10K, Net30) |
|-------------|-------|----------------------|
| Property Owner | 90% | $33.30 |
| Vendor (Cashback) | 5% | $1.85 |
| Platform (Naltos) | 5% | $1.85 |
| **Total Yield** | 100% | **$37.00** |

### Merchant Settlement Float Distribution  
| Stakeholder | Share | Example ($500, 2-day) |
|-------------|-------|----------------------|
| Property Owner | 50% | $0.09 |
| Tenant (Cashback) | 40% | $0.07 |
| Platform (Naltos) | 10% | $0.02 |
| **Total Yield** | 100% | **$0.18** |

### Rent Float Distribution
| Stakeholder | Share | Example ($100K, 15-day) |
|-------------|-------|------------------------|
| Property Owner | 90% | $111 |
| Platform (Naltos) | 10% | $12 |
| **Total Yield** | 100% | **$123** |

---

## Stablecoin Bridge: Legacy ↔ Crypto

### The Integration Challenge
Traditional property management systems (AppFolio, Yardi, Buildium) use legacy banking rails. MeshPay bridges this gap:

```
Legacy PMS (Yardi) ← → Stablecoin Bridge ← → USDC/USDT/DAI ← → Treasury Products
         ↓                      ↓                     ↓                    ↓
    ACH/Wire           Bidirectional           Blockchain          Yield Generation
                       Conversion
```

**Inbound Flow** (Fiat → Crypto):
1. Tenant pays rent via ACH to property
2. Bridge converts USD → USDC
3. NUSD minted 1:1 against USDC
4. Deployed to treasury products

**Outbound Flow** (Crypto → Fiat):
1. Vendor requests redemption
2. NUSD burned, USDC released
3. Bridge converts USDC → USD
4. ACH payout to vendor bank account

---

## Current Implementation Status

### ✅ Completed Features
1. **Dual-Portal Architecture**: Business Console + Vendor Portal + Merchant Portal + Tenant Portal
2. **NUSD Explainer Cards**: Interactive education on stablecoin backing and yield
3. **Yield Analytics**: Cumulative yield charts showing float earnings over time
4. **Redemption Calculator**: Compare payout options (ACH/Card/On-Chain) with fees
5. **Settlement Preferences**: Merchants configure payout schedules
6. **Multi-Org Vendor Access**: Single vendor login across multiple PMCs
7. **Treasury Allocations Display**: Real-time stablecoin and product breakdowns

### 🚧 In Progress (Orchestration Layer)
1. **Schema Defined**: Orchestration events, merchant preferences, vendor redemptions
2. **Storage Layer**: Demo-scoped implementation with basic security
3. **Security Documentation**: `ORCHESTRATION_SECURITY.md` details limitations
4. **Next Steps**: API routes, frontend integration, end-to-end testing

### 📋 Roadmap
1. **Business Console Orchestrator**: Treasury control panel with event timeline
2. **Automated Yield Accrual**: Background jobs for daily yield calculations
3. **Multi-Currency Support**: International property management (EUR, GBP, CAD)
4. **Enhanced Analytics**: Cashflow forecasting, yield optimization recommendations
5. **Production Security**: Full RBAC, user-entity authorization, audit logging

---

## Key Differentiators

### vs. Traditional Banking
- **Yield on Float**: Banks keep float interest, MeshPay shares it
- **Instant Liquidity**: Vendors get paid Day 0 vs. Net30-90
- **Programmable Money**: Automated splits, cashback, settlements

### vs. Crypto-Only Solutions
- **Fiat Integration**: Seamless legacy PMS connectivity
- **Regulatory Clarity**: Private accounting unit vs. public token
- **User Experience**: "Dollars" not "blockchain transactions"

### vs. Fintech Solutions (Stripe, Square)
- **Float Monetization**: Capture settlement float yield
- **Stakeholder Alignment**: Everyone earns (owners, vendors, tenants)
- **Multi-Party Orchestration**: Not just merchant processing

---

## Evolution to MeshPay

### Current: Naltos (Vertical Focus)
- **Market**: U.S. Multifamily Real Estate
- **Geography**: Domestic operations
- **Currency**: USD + Stablecoins (USDC/USDT/DAI)
- **Proof Point**: Demonstrating orchestration model viability

### Future: MeshPay (Global Expansion)
- **Market**: Cross-border payments, global commerce
- **Geography**: International, multi-region
- **Currency**: Multi-currency support (EUR, GBP, CAD, etc.)
- **Vision**: Global stablecoin settlement network with optimized FX routing

The Naltos Platform validates the core orchestration technology, proving that idle payment float can be systematically monetized and distributed to all stakeholders. Once proven in multifamily finance, this model scales to global payments orchestration as MeshPay.

---

## Risk Mitigation

### Financial Risks
- **Treasury Product Diversification**: NRF/NRK/NRC basket approach
- **Stablecoin Diversification**: USDC/USDT/DAI spread
- **Instant Redemption Reserve**: 10-15% liquid buffer

### Operational Risks
- **PMS Integration Fallback**: Manual reconciliation if sync fails
- **Redundant Payout Rails**: ACH primary, Wire backup, Card tertiary
- **Audit Logging**: Complete transaction history for compliance

### Regulatory Risks
- **Private vs. Public**: NUSD is internal accounting, not money transmission
- **State-by-State Compliance**: Money transmitter licenses where required
- **KYC/AML**: Vendor/merchant onboarding verification

---

## Success Metrics

### Platform KPIs
- **Total AUM**: Assets under management across all portfolios
- **Float Capture Rate**: % of eligible float being monetized
- **Average Yield**: Blended rate across all treasury products
- **Vendor Adoption**: % of vendors using instant payment

### Stakeholder Outcomes
- **Property Owners**: Additional revenue per unit per year
- **Vendors**: Days saved on payment cycles
- **Tenants**: Cashback earned on rent and purchases
- **Platform**: Revenue from float yield share

---

## Contact & Resources

- **Technical Documentation**: See `replit.md` for system architecture details
- **Security Documentation**: See `ORCHESTRATION_SECURITY.md` for demo limitations
- **Demo Credentials**: See login page for test accounts

---

**Last Updated**: November 15, 2025  
**Version**: MVP Demo  
**Status**: Prototype/Demonstration
