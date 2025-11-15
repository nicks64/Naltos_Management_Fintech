# Naltos Platform - Project Overview

## Executive Summary

**Naltos** is a stablecoin orchestration platform that transforms idle cash flows in the multifamily property management industry into programmable, yield-generating financial assets. The platform operates on top of stablecoin rails (USDC, USDT, DAI) to capture and monetize payment float periods that traditionally sit idle in bank accounts.

**Market Opportunity**: $35B+ in idle multifamily finance across three distinct float periods:
- Rent Float (5-15 days)
- Vendor Payment Float (Net30-Net90)
- Merchant Settlement Float (1-3 days)

**Core Innovation**: NUSD, a private, fully-backed internal accounting unit representing $1 held in short-term treasury products, instantly redeemable 1:1 for USD, programmable for automated yield distribution.

---

## Capital Flow Architecture

### Tenant Rent Flow: The Foundation

**The Core Transaction Loop**:
```
Tenant → Pays Rent ($1,500/month) → AppFolio/Buildium PMS
                                           ↓
                              Stablecoin Bridge Converts
                                           ↓
                              USDC/USDT/DAI Stablecoins
                                           ↓
                              NUSD Minted (1:1 backing)
                                           ↓
                      Deployed to Treasury Products (NRF/NRK/NRC)
                                           ↓
                      Held 5-15 days (Rent Float Period)
                                           ↓
                      Generates Yield @ 3% APY = ~$6/month
                                           ↓
              Distributed: Owner ($5.40), Tenant ($0.60 cashback)
                                           ↓
              Property deploys funds to operations (day 15)
```

**Key Integration Points**:
1. **Legacy PMS Systems** (AppFolio, Buildium, Yardi):
   - Tenant submits rent payment via existing PMS portal
   - Property receives notification of payment
   - Naltos Bridge intercepts payment metadata

2. **Stablecoin Conversion**:
   - Bidirectional bridge converts USD → USDC/USDT/DAI
   - NUSD minted against stablecoin backing
   - 1:1 redemption guarantee maintained

3. **Float Period Management**:
   - Property sets deployment schedule (e.g., deploy on 15th)
   - Rent collected 1st-5th held in treasury products
   - Automatic yield accrual during hold period
   - Funds released on schedule for operations

### Collection Rate Incentives

**Problem**: Traditional multifamily averages 92-95% on-time rent collection, with 5-8% delinquency rates costing properties $50-200K annually per 100 units.

**Naltos Solution**: Yield-sharing creates financial incentive for on-time payment.

**Incentive Structure**:
| Payment Timing | Tenant Cashback | Property Yield | Total APY |
|----------------|-----------------|----------------|-----------|
| **Days 1-5** (On-time) | 0.4% cashback | 2.6% | 3.0% |
| **Days 6-10** (Late) | 0.2% cashback | 2.8% | 3.0% |
| **Days 11+** (Delinquent) | 0% cashback | 3.0% | 3.0% |

**Example** (100-unit property, $1,500/month avg rent):
- **Before Naltos**: 
  - 92% on-time rate
  - 8% delinquent (12 days avg)
  - Lost rent: $14,400/year
  - Collection costs: $8,000/year
  
- **After Naltos**:
  - 97% on-time rate (5% improvement from cashback incentive)
  - 3% delinquent (8 days avg)
  - Tenant cashback earned: $8,640/year
  - Property yield earned: $46,800/year
  - **Net gain**: $55K+ in combined stakeholder value

**DSO (Days Sales Outstanding) Improvement**:
- Traditional: 12-15 days average collection time
- With Naltos: 6-8 days (cashback incentive drives early payment)
- **Result**: Improved cashflow, reduced delinquency costs

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

## Stablecoin Bridge: Legacy PMS Integration

### The Integration Challenge
Traditional property management systems (AppFolio, Yardi, Buildium) use legacy banking rails and proprietary APIs. Naltos bridges this gap with a bidirectional orchestration layer that preserves existing workflows while adding yield generation.

**Supported PMS Systems**:
- **AppFolio**: API integration for rent collection, vendor payments, reporting
- **Buildium**: Webhook-based sync for transactions and tenant data
- **Yardi**: XML/SOAP integration for enterprise portfolios

### Integration Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Legacy PMS Layer                              │
│  (AppFolio/Buildium/Yardi - Existing tenant/vendor workflows)       │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │   Naltos Bridge Layer      │
                    │  - Transaction Monitoring  │
                    │  - Metadata Extraction     │
                    │  - Reconciliation Engine   │
                    └─────────────┬──────────────┘
                                  │
            ┌─────────────────────┼─────────────────────┐
            │                     │                     │
     ┌──────▼──────┐      ┌──────▼──────┐      ┌──────▼──────┐
     │  USD → USDC │      │  USD → USDT │      │  USD → DAI  │
     │  Conversion │      │  Conversion │      │  Conversion │
     └──────┬──────┘      └──────┬──────┘      └──────┬──────┘
            │                     │                     │
            └─────────────────────┼─────────────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │      NUSD Minting          │
                    │   (1:1 Stablecoin Backed)  │
                    └─────────────┬──────────────┘
                                  │
            ┌─────────────────────┼─────────────────────┐
            │                     │                     │
     ┌──────▼──────┐      ┌──────▼──────┐      ┌──────▼──────┐
     │  NRF (T-Bill)│     │ NRK (Money   │     │  NRC (Credit)│
     │  3.5% APY   │      │  Market) 4.5%│     │   5% APY    │
     └─────────────┘      └──────────────┘     └─────────────┘
```

### Rent Collection Flow (AppFolio Example)

**Step 1: Tenant Payment Initiation**
- Tenant logs into AppFolio portal
- Selects "Pay Rent" ($1,500 due on 1st)
- Chooses payment method (ACH, Card, Crypto)
- AppFolio processes payment normally

**Step 2: Bridge Intercept & Enrichment**
- Naltos monitors AppFolio webhook for payment event
- Extracts metadata: `tenantId`, `propertyId`, `amount`, `paymentDate`
- Checks tenant opt-in status for yield program
- Calculates cashback eligibility based on payment timing

**Step 3: Stablecoin Conversion**
- USD payment received by property's bank account
- Bridge initiates parallel stablecoin purchase:
  - 40% → USDC (Circle)
  - 35% → USDT (Tether)
  - 25% → DAI (MakerDAO)
- Total: $1,500 in stablecoins acquired

**Step 4: NUSD Minting & Treasury Deployment**
- 1,500 NUSD minted against stablecoin backing
- Deployed to treasury products:
  - 50% → NRF (Tokenized T-Bills)
  - 30% → NRK (Money Market)
  - 20% → NRC (Delta-Neutral Credit)
- Float period begins (5-15 days until property needs funds)

**Step 5: Yield Accrual & Distribution**
- Daily yield accrues across treasury products
- Example: 10-day float @ 3% APY = $1.23 total yield
- Distribution:
  - Property Owner: $1.11 (90%)
  - Tenant Cashback: $0.12 (10%, if paid on-time)

**Step 6: Fund Release to Operations**
- Day 15: Property needs funds for expenses
- NUSD redeemed → Stablecoins → USD conversion
- $1,500 + property's $1.11 yield = $1,501.11 available
- Funds deployed to property operations via AppFolio

**Step 7: Tenant Cashback**
- Tenant's $0.12 cashback posted to Naltos wallet
- Can be used for next rent payment or merchant purchases
- Incentivizes on-time payment next month

### Vendor Payment Flow (Buildium Example)

**Traditional Flow** (without Naltos):
```
Vendor invoices property → Net30 payment terms → Vendor waits 30 days
→ Property pays on day 30 → Vendor receives funds
```

**Naltos-Enhanced Flow**:
```
Step 1: Vendor submits invoice in Buildium ($10,000, Net30)
Step 2: Property approves invoice in Buildium
Step 3: Naltos Bridge detects approval event
Step 4: Instant NUSD payment to vendor ($10,000)
         - Vendor receives notification
         - Funds available immediately in Vendor Portal
Step 5: Property's $10K deployed to treasury for 30 days
         - Generates $37 yield @ 4.5% APY
Step 6: Yield distributed:
         - Property: $33.30 (90%)
         - Vendor cashback: $1.85 (5%)
         - Platform: $1.85 (5%)
Step 7: Day 30 (Net30 due date)
         - Vendor's default ACH redemption processes (free)
         - OR vendor redeemed early via Card/Crypto (with fee)
Step 8: Buildium reconciliation
         - Payment marked as completed
         - Vendor balance zeroed
```

**Bridge Reconciliation**:
- Nightly sync between Naltos and Buildium
- Ensures invoice statuses match
- Flags discrepancies for manual review
- Maintains audit trail for accounting

### Key Integration Benefits

**For Properties Using AppFolio**:
- Zero workflow changes for staff
- Automatic yield on rent float
- Improved collection rates via tenant incentives
- Real-time reconciliation dashboard

**For Properties Using Buildium**:
- Instant vendor payments improve relationships
- Float yield offsets vendor payment acceleration
- Webhook-based sync requires no manual data entry
- Vendor cashback reduces future invoice amounts

**For Properties Using Yardi** (Enterprise):
- XML/SOAP integration for large portfolios
- Batch processing for 1,000+ unit properties
- Multi-property consolidated reporting
- GL code mapping for accounting teams

### Implementation Approach

**Phase 1: Read-Only Integration** (Weeks 1-2)
- Connect to PMS API for transaction monitoring
- Build reconciliation engine
- Test metadata extraction accuracy

**Phase 2: Write-Back Integration** (Weeks 3-4)
- Post yield earnings back to PMS as credit memos
- Update tenant/vendor balances
- Generate accounting reports

**Phase 3: Workflow Automation** (Weeks 5-6)
- Auto-approve vendor payments under threshold
- Scheduled treasury rebalancing
- Automated cashback distribution

**Phase 4: Advanced Features** (Ongoing)
- Predictive cashflow forecasting
- Yield optimization recommendations
- Custom reporting for CFOs

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
