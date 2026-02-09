# Naltos Platform — Complete Feature & Business Value Documentation

## Platform Overview

**Naltos** is a cash-flow intelligence and payments optimization platform purpose-built for multifamily real estate. It transforms rent collection from a manual, unpredictable process into a predictable, optimized, and behavior-driven financial asset.

**Core Problem:** Property managers lose thousands annually to late payments, idle cash, manual reconciliation, and lack of tenant incentives. There is no positive-sum relationship between landlords and renters today.

**Naltos Solution:** A dual-sided platform that aligns property owner and tenant incentives — owners earn yield on idle rent and vendor float while tenants earn cashback, build credit, and progress toward homeownership.

**Key Differentiator:** All user-facing interactions are in USD. Digital payment rails operate as invisible backend infrastructure — no crypto terminology is ever exposed to users.

---

## Portal Architecture

Naltos operates as a **4-portal platform** with role-based access:

| Portal | Target Users | Access |
|--------|-------------|--------|
| **Business Console** | Property Managers, Owners, CFOs, Analysts | Full operational & financial dashboards |
| **Tenant Portal** | Renters / Residents | Payments, rewards, credit building, financial planning |
| **Vendor Portal** | Maintenance companies, contractors, service providers | Invoices, balances, redemptions across multiple property managers |
| **Merchant Portal** | Local businesses partnered with properties | Transaction settlements, yield sharing, treasury |

---

## BUSINESS CONSOLE (Property Manager / Owner Side)

---

### 1. Overview Dashboard (`/dashboard`)

**What It Is:**
The command center for property operations. A single screen showing 9 real-time KPI cards with sparkline trends, operational risk alerts with live anomaly detection, and a collection variance analysis chart (expected vs. actual ML model).

**Key Sections:**
- **9 KPI Cards:** On-Time Payment %, DSO (Days Sales Outstanding), Delinquent Amount, Opex/Unit, Treasury AUM, Current Yield, Vendor Float, Vendor Yield, Rent Float Yield — each with trend indicators and sparkline micro-charts
- **Operational Risk Alerts:** Live anomaly warnings (e.g., "Elevated Delinquency — Pine Valley: 5.6% volatility spike detected, 8 tenants flagged for early outreach")
- **Collection Variance Chart:** 6-month expected vs. actual collection rate, showing the gap between ML model predictions and real performance

**Business Value Proposition:**
> "See your entire portfolio's financial health in one glance. Instead of logging into multiple PMS systems and spreadsheets, Naltos gives you a real-time command center that flags problems before they become costly — like a delinquency spike at one property — so you can intervene days earlier than your current workflow allows."

**Target Stakeholders:** Property Managers, Asset Managers, CFOs, Regional Directors

---

### 2. Intelligence Hub (`/intelligence`)

**What It Is:**
A neuromorphic AI-powered analytics engine that goes beyond traditional reporting. It uses behavioral pattern recognition to score properties and tenants, detect inflection points in payment behavior, and provide predictive portfolio intelligence.

**Key Sections:**
- **Neural Activity Monitor:** Real-time spike train visualization tracking rent payment spikes, vendor payment spikes, and P2P transaction spikes across the portfolio
- **Portfolio Intelligence Panel:** Overall stability score, spike frequency metrics, temporal memory depth, model confidence level, and active inflection points detected
- **Temporal Memory Decay Chart:** Shows how recent data points are weighted vs. historical data in the AI model's predictions
- **Property Stability Scores Table:** Per-property breakdown with stability score, refinance readiness index, spike rate, risk level, and trend direction
- **Tenant Behavioral Scoring:** Individual tenant stability scores with payment pattern classification (e.g., "Early payer," "Consistent"), streak tracking, tier migration direction, and weighted score drivers (payment consistency, streak length, early payment frequency, payment amount stability, delinquency history)
- **Radar Chart:** Visual breakdown of what factors drive each tenant's behavioral score

**Business Value Proposition:**
> "Traditional property management is reactive — you find out about problems after they've already cost you money. Naltos Intelligence uses behavioral AI to detect subtle changes in payment patterns weeks before a tenant goes delinquent. It's like having a data science team built into your property management stack, giving you a predictive edge that translates directly to higher NOI and lower collection costs."

**Target Stakeholders:** Asset Managers, Portfolio Analysts, Regional Directors, Institutional Investors

---

### 3. Rent Stability Dashboard (`/rent-stability`)

**What It Is:**
A comprehensive risk and opportunity analysis tool for the entire rental portfolio. It visualizes delinquency risk across properties, tracks ownership-readiness cohorts, and surfaces rent-to-own opportunities.

**Key Sections:**
- **Portfolio Volatility Trend:** 6-month chart showing payment volatility declining as Naltos incentive programs take effect, alongside on-time payment rate climbing
- **Risk Heatmap Table:** Every property ranked by risk score, units, volatility, and on-time %. Color-coded from green (low risk) to red (high risk)
- **ML Delinquency Forecasting (5-Tier):** Pie chart breaking down all tenants into Green (0-5 days), Yellow (6-15 days), Orange (16-30 days), Red (31-60 days), Critical (60+ days)
- **Ownership Cohort Tracker:** Stacked area chart tracking how many tenants are progressing through Tier 1 (Early), Tier 2 (Developing), and Tier 3 (Ready) homeownership readiness stages over time
- **Rent-to-Own Opportunity Index:** Table of top tenants ranked by ownership readiness score, showing streak length, credit score, current tier, readiness percentage, and monthly rent
- **Refinance Readiness Package Export:** Button to generate a comprehensive data package for lenders showing portfolio stability metrics

**Business Value Proposition:**
> "Rent Stability transforms your portfolio data into actionable intelligence. Instead of guessing which properties are at risk, you see a heatmap that prioritizes your attention. The rent-to-own tracker creates a pipeline of qualified homebuyers from your best tenants — turning tenant turnover from a cost center into a revenue opportunity. And the refinance readiness package gives lenders exactly the data they need to offer you better terms, because you can prove your portfolio's payment reliability with ML-backed evidence."

**Target Stakeholders:** Property Owners, Asset Managers, Lenders, Institutional Investors

---

### 4. Collections (`/collections`)

**What It Is:**
An enhanced collections management interface with AI-powered risk scoring, aging analysis, and bulk action capabilities to reduce manual collections labor.

**Key Sections:**
- **4 Summary KPI Cards:** Total Outstanding, Total Tenants, At-Risk Count, Average Days Past Due, with Collection Rate and MTD Collection amounts
- **Aging Bucket Bar Chart:** Visual breakdown of outstanding balances by aging bucket (Current, 1-30 days, 31-60 days, 61-90 days, 90+ days) with count and dollar amount per bucket
- **Collection Trend Line Chart:** 6-month trend showing collected vs. outstanding amounts and collection rate over time
- **Risk-Scored Tenant Table:** Every delinquent tenant listed with name, unit, property, amount due, days past due, AI risk score (0-100), risk level badge (Low/Medium/High/Critical), payment history, and contact attempt log
- **Filters:** Filter by risk level (All, Low, Medium, High, Critical) and payment status
- **Sorting:** Sort by name, amount, days past due, or risk score
- **Bulk Actions:** "Send Paylinks" and "Schedule Nudges" buttons to trigger automated outreach to selected tenants
- **Individual Actions:** Per-tenant "Send Nudge" and "Send Paylink" buttons with real-time feedback

**Business Value Proposition:**
> "Collections is where most property managers waste the most staff hours. Naltos replaces spreadsheet-based tracking with an AI-scored priority queue — your team knows exactly who to call first, what to say, and when to escalate. Bulk paylink and nudge capabilities mean one person can handle what used to take a full-time collections coordinator. The result: faster cash recovery, lower labor costs, and fewer awkward phone calls."

**Target Stakeholders:** Property Managers, Collections Staff, Regional Operations Directors

---

### 5. Collection Incentives (`/collection-incentives`)

**What It Is:**
A behavioral incentive management system that uses USD cashback rewards to drive on-time rent payments. Property managers can create, configure, and monitor incentive programs.

**Key Sections:**
- **Collection Metrics Overview:** Current on-time rate (87.3%), previous on-time rate (74.8%), early payment rate (24.5%), average days early (6.2), delinquency rate (4.2%), total units enrolled, monthly rewards budget, projected annual rewards spend, and estimated collection improvement (+12.5%)
- **Impact Analysis Tab:** Side-by-side before/after comparison showing how incentive programs improved collection rates, reduced delinquency, and shifted payment timing
- **Program Management Tab:** Three configurable programs:
  - *Early Bird Bonus:* $25 cashback for paying 5+ days early (340 enrolled, $4,250 total paid, +12.5% collection impact)
  - *Perfect Payment Streak:* $50 cashback after 6 consecutive on-time payments (285 enrolled, $2,850 total paid, +8.3% impact)
  - *Fresh Start Bonus:* $15 cashback for first on-time payment after delinquency (42 enrolled, $630 total paid, +3.2% impact)
- **Program Toggles:** Activate/deactivate programs with one click
- **ROI Calculator:** Shows cost of rewards vs. revenue recovered from improved collection rates

**Business Value Proposition:**
> "Every 1% improvement in on-time payment rates across a 500-unit portfolio saves approximately $90,000/year in lost revenue, late fee administration, and collection labor. Naltos Incentives cost a fraction of that — our demo shows $105,000/year in rewards generating a 12.5% improvement in on-time rates. That's a 5-10x ROI on the incentive budget. It's the only tool in multifamily that makes tenants *want* to pay on time, turning an adversarial relationship into a collaborative one."

**Target Stakeholders:** Property Managers, Owner/Operators, Asset Managers

---

### 6. Reconciliation (`/reconciliation`)

**What It Is:**
AI-powered ledger matching that automatically reconciles bank statements with payment records, dramatically reducing manual accounting labor.

**Key Sections:**
- **Hours Saved Counter:** Real-time display of cumulative hours saved through AI-powered auto-matching
- **AI Auto-Match Button:** One-click to run the AI reconciliation engine across all unmatched entries
- **Bank Ledger Table:** Bank statement entries with date, description, amount, and match status
- **Payment Ledger Table:** Internal payment records with matching fields
- **Match Suggestions Panel:** AI-generated match suggestions with confidence scores — approve or reject each suggestion individually

**Business Value Proposition:**
> "Manual reconciliation is the #1 time sink in property accounting. Staff spend 15-20 hours per month matching bank entries to payment records. Naltos AI reconciliation cuts that to under 2 hours by auto-matching entries with 95%+ confidence. That's not just a time savings — it's fewer errors, faster month-end closes, and the ability to spot discrepancies that human reviewers miss. For a portfolio with 10 properties, that's 180+ staff hours per year returned to higher-value work."

**Target Stakeholders:** Property Accountants, CFOs, Back-Office Operations

---

### 7. Treasury & Float Management (`/treasury`)

**What It Is:**
A 4-tab treasury orchestration engine that manages how idle rent, vendor, and merchant payment float is deployed into yield-generating instruments.

**Key Sections:**
- **Products Tab:** Treasury product catalog (T-Bills, Money Market Funds, Delta-Neutral Credit) with current APY, AUM, risk ratings, lock periods, subscription and redemption dialogs
- **Float Volume Tab:** Stacked area chart showing daily float volumes across rent, vendor, and merchant buckets — visualizing the cash sitting in transit that can earn yield
- **Yield Routing Tab:** Table showing how each float bucket is deployed: Rent Float (5-15 day duration, 5.0% APY, $892K deployed), Vendor Float (30-90 days, 5.2% APY, $1.4M deployed), Merchant Float (1-3 days, 4.8% APY, $210K deployed), Immediate Reserve (0-3 days, 4.5% APY, $350K deployed)
- **Yield Sharing Tab:** Distribution breakdown — Property Owners (85%, $6,386/mo), Tenants via Cashback (5%, $376/mo), Vendors via Yield Share (3%, $225/mo), Naltos Platform (7%, $526/mo)

**Business Value Proposition:**
> "Every dollar of rent sits idle for an average of 10 days between collection and disbursement. Vendor payments create 30-90 days of float. This is dead money in a traditional setup. Naltos Treasury deploys this idle cash into short-duration, low-risk instruments — generating $7,500+/month in yield for a mid-size portfolio. Property owners keep 85% of that yield as new NOI they never had before. It's like finding money under the couch cushions, except it's $90,000/year."

**Target Stakeholders:** CFOs, Property Owners, Institutional Investors, Asset Managers

---

### 8. Treasury Management (`/crypto-treasury`)

**What It Is:**
A backend treasury infrastructure view showing stablecoin positions, deployment strategies, and capital flows — the operational layer that powers the yield engine. (Note: This is an administrative/operations view; users see only USD.)

**Key Sections:**
- **Positions Tab:** Current stablecoin positions (USDC, USDT, DAI) with available, deployed, and reserved balances plus yield accrued per coin
- **Deployments Tab:** Active treasury deployments showing product name, type, amount, cumulative yield, maturity dates, reinvestment policy, and status
- **Capital Flows Tab:** Transaction log of all deposits, withdrawals, conversions, and rent payment flows through the treasury system

**Business Value Proposition:**
> "This is the engine room of Naltos yield generation. While property managers and tenants see only USD, the backend optimizes across multiple low-risk instruments to maximize yield while maintaining instant liquidity. It's fully automated — no manual intervention required — and provides complete audit trails for compliance and reporting."

**Target Stakeholders:** Platform Operations, Compliance Officers, Institutional Partners

---

### 9. Rent Float Treasury (`/rent-float`)

**What It Is:**
A deep-dive into how rent payment float is captured, deployed, and distributed. Shows the exact mechanics of how the time between tenant payment and owner disbursement generates yield.

**Key Sections:**
- **Float Configuration Panel:** Rent float enabled/disabled toggle, yield rate, owner/tenant/Naltos share percentages, default float duration
- **Float Summary KPIs:** Total float balance, average duration, monthly yield generated, and per-stakeholder yield distribution
- **Float Velocity Dashboard:** Current balance vs. deployed balance, utilization rate, average cycle time, turnover rate, daily yield, projected annual yield, and weighted APY
- **Deployment Allocation Pie Chart:** How float is distributed across T-Bills, Money Market, and other instruments
- **Monthly Trend Chart:** 6-month view of float balance, yield generated, and utilization rate
- **Recent Payments Table:** Individual rent payments showing amount, payment date, days in float, and yield generated from each payment
- **AI Float Intelligence Panel:** Optimal deployment mix recommendation, payment timing insight, seasonal forecast, risk assessment, and model confidence score

**Business Value Proposition:**
> "Rent Float Treasury reveals the hidden revenue stream in every rent payment. The average 10-day float across a 500-unit portfolio at $1,500/month average rent means roughly $250,000 in constant transit. At 5% APY, that's $12,500/year in yield that property owners never captured before — and it requires zero additional work. The AI intelligence layer continuously optimizes deployment timing and product mix to maximize returns while maintaining liquidity for scheduled disbursements."

**Target Stakeholders:** CFOs, Property Owners, Financial Analysts

---

### 10. Vendor Payments (`/vendor-payments`)

**What It Is:**
A vendor payment management system that enables instant vendor payments while preserving Net30-90 payment terms — generating yield from the float between instant payment and the original due date.

**Key Sections:**
- **Net30-90 Terms Explainer:** Visual breakdown of how paying vendors instantly while keeping the original due date creates a 30-90 day yield window
- **Pending Invoices Tab:** All outstanding vendor invoices with vendor name, invoice number, amount, terms, due date, and "Pay Instant" action button
- **Instant Payments Tab:** History of invoices paid via instant payment, showing advance date, float duration, yield rate, and yield generated per invoice
- **All Invoices Tab:** Complete invoice history with status tracking
- **Yield Summary:** Total yield generated from vendor payment float across all invoices

**Business Value Proposition:**
> "Vendors hate waiting 30-90 days for payment. Property managers hate the administrative burden of managing payment schedules. Naltos solves both: vendors get paid instantly, property managers eliminate payment scheduling headaches, and the 30-90 day float between instant payment and the original due date generates yield for property owners. It's a true win-win-win — vendors are happier, operations are simpler, and owners earn new revenue. In a portfolio spending $500K/year on vendors with Net60 terms, that's approximately $13,000/year in new yield."

**Target Stakeholders:** Property Managers, Accounts Payable, Vendor Relations, Property Owners

---

### 11. Cash Flow Forecast (`/cash-flow-forecast`)

**What It Is:**
A 30/60/90-day forward-looking cash flow projection engine with daily and weekly views, scenario modeling, and model assumption transparency.

**Key Sections:**
- **Forecast Summary KPIs:** Total projected inflow, total projected outflow, net cash position, average daily inflow/outflow, liquidity risk days, peak inflow day, and lowest cash day
- **Daily/Weekly Toggle Chart:** Area chart showing projected inflows and outflows over the forecast period with cumulative net cash position overlay
- **3 Scenario Cards:**
  - *Baseline:* Expected case with current assumptions (probability, 90-day NOI, cash reserve, delinquency rate)
  - *Optimistic:* Best case with improved collection rates
  - *Stress:* Worst case with elevated delinquency and reduced occupancy
- **Model Assumptions Panel:** Occupancy rate, average rent, on-time payment rate, vendor terms, maintenance reserve, and yield on float — showing exactly what inputs drive the forecast

**Business Value Proposition:**
> "Cash flow surprises kill real estate businesses. Naltos Forecast gives you a 90-day crystal ball — showing not just what's expected, but what happens under stress scenarios. When you can see that a spike in vendor payments on March 15th will temporarily drop your cash reserve below the comfort zone, you can plan ahead instead of scrambling. For CFOs presenting to investors, the scenario modeling provides the kind of rigorous financial planning that institutional capital demands."

**Target Stakeholders:** CFOs, Asset Managers, Institutional Investors, Lenders

---

### 12. Deposit Alternatives (`/deposit-alternatives`)

**What It Is:**
A deposit replacement program management tool offering LeaseLock/Rhino-style insurance alternatives to traditional security deposits, increasing lease conversion rates and unlocking tenant liquidity.

**Key Sections:**
- **3 Program Options:**
  - *Zero-Deposit Program:* Eliminates deposits entirely; tenants pay $12/month; 6x coverage multiplier; 94% adoption rate
  - *Deposit Insurance:* Replaces cash with insurance; $8/month; 4x coverage; 78% adoption
  - *Flexible Deposit:* Reduced upfront deposit with supplemental coverage; one-time fee; 45% adoption
- **Portfolio KPI Cards:** Total coverage amount, average claim rate, tenant adoption rate, liquidity unlocked for tenants
- **Liquidity Freed Chart:** Bar chart showing monthly liquidity freed by eliminating traditional deposits
- **Property Coverage Table:** Per-property breakdown showing units, active program, enrolled percentage, coverage amount, and claims filed
- **Risk & Claims Panel:** Claims rate analysis, coverage adequacy metrics, and program performance comparison

**Business Value Proposition:**
> "Traditional security deposits are a barrier to leasing — prospective tenants need $1,500-3,000 upfront just to move in. Deposit alternatives remove that barrier, increasing lease conversion rates by 15-20%. Properties maintain full damage coverage (often 4-6x the monthly rent) through insurance rather than cash. For a 200-unit property, this means faster lease-up, lower vacancy costs, and happier tenants who don't start their tenancy financially stressed. The tenant pays a small monthly fee that's cheaper than the opportunity cost of a locked-up deposit."

**Target Stakeholders:** Leasing Directors, Property Managers, Owner/Operators

---

### 13. AI Rent Pricing (`/rent-pricing`)

**What It Is:**
A dynamic pricing engine that uses market data and AI analysis to recommend optimal rent prices for each unit, with lease expiration smoothing to prevent revenue cliffs.

**Key Sections:**
- **Market vs. Current Rent Chart:** 12-month line chart comparing portfolio average rent to market rates, showing revenue gap and trend
- **Portfolio Summary KPIs:** Average rent, market rate, revenue gap, total units, AI confidence level
- **Lease Expiration Distribution Chart:** Bar chart showing how many leases expire each month — identifying dangerous concentration months where too many leases renew simultaneously
- **Unit-Level Recommendations Table:** Per-unit pricing recommendations showing current rent, market rate, AI recommended price, confidence level (High/Medium/Low), and dollar delta
- **Optimization Insights Panel:** AI-generated actionable insights including:
  - Lease expiration smoothing recommendations (e.g., "August has 22 expirations — offer early renewal incentives to spread risk")
  - Market positioning analysis (e.g., "Portfolio is 3.2% below market — gradual increases recommended")
  - Revenue capture opportunities (e.g., "Implementing all High-confidence recommendations would add $38,400/year in revenue")

**Business Value Proposition:**
> "Most property managers set rents based on gut feel and annual comps. Naltos AI Pricing analyzes real-time market data to find the optimal price for every unit — not too high (vacancy risk) and not too low (leaving money on the table). The lease expiration calendar prevents the #1 pricing mistake in multifamily: having too many leases expire in the same month, which creates a negotiating disadvantage and revenue cliff risk. For a 120-unit property, closing even a 2% gap to market rate means $43,000+ in additional annual revenue."

**Target Stakeholders:** Revenue Managers, Property Managers, Asset Managers, Owner/Operators

---

### 14. Capital Access Hub (`/capital-access`)

**What It Is:**
A financing and capital marketplace that helps property owners assess refinancing readiness, discover funding opportunities, and present portfolio performance to lenders and investors.

**Key Sections:**
- **DSCR (Debt Service Coverage Ratio) Trend Chart:** 12-month area chart tracking DSCR trajectory with 1.25x threshold reference line — the key metric lenders use to evaluate loan eligibility
- **DSCR Score Card:** Current DSCR (1.42x), trend direction, and lender threshold comparison
- **Readiness Factors Panel:** 4 key readiness indicators — NOI Trend (Strong, up 8.2% YoY), Occupancy (Excellent, 96.3%), Debt Maturity (12 months), Documentation Completeness (85%)
- **Funding Opportunities Marketplace Table:** Pre-qualified and available funding options:
  - StackSource Marketplace — $5M Commercial Mortgage at 6.2% / 30yr
  - CrowdStreet — $2M Syndication at 8% preferred return
  - Naltos Capital — $1.5M Bridge Loan at 7.8% / 24mo
  - Federal Programs — $8M HUD 223(f) at 5.1% / 35yr
  - Private Equity — $3M Equity Partnership targeting 12% IRR
- **Portfolio Metrics for Lenders:** NOI ($1.86M/yr, +6.2%), Cap Rate (5.8%), LTV (68%), Vacancy Loss (3.7%), Opex Ratio (42%), Revenue Growth (+4.1%) — everything a lender or investor needs in one view

**Business Value Proposition:**
> "Access to capital is the growth engine of real estate — but most operators spend weeks assembling data packages for lenders and have no visibility into what financing options exist. Naltos Capital Access centralizes your portfolio's financial performance into a lender-ready presentation, tracks your DSCR in real-time so you know exactly when refinancing makes sense, and surfaces pre-qualified funding opportunities you might never discover otherwise. The difference between a 6.2% and 6.8% rate on a $5M loan is $30,000/year — the data quality Naltos provides can directly impact the terms you receive."

**Target Stakeholders:** Property Owners, CFOs, Real Estate Investors, Syndicators

---

### 15. Reports (`/reports`)

**What It Is:**
A financial reporting and export center with multiple report types and download capabilities for compliance, investor reporting, and operational analysis.

**Key Sections:**
- **Report Type Selector:** Delinquency Aging, NOI Trend, Opex/Unit, Treasury Yield
- **Delinquency Aging Report:** Bar chart showing count and dollar amount by aging bucket
- **NOI Trend Report:** Line chart tracking Net Operating Income month-over-month
- **Opex/Unit Report:** Bar chart comparing operating expenses per unit across properties
- **Treasury Yield Report:** Line chart comparing portfolio yield against T-Bill benchmark rates
- **Export Options:** CSV and PDF download buttons for any active report

**Business Value Proposition:**
> "Investor reporting, lender compliance, and board presentations require clean, accurate data. Naltos Reports generates presentation-ready financial analytics with one click — no more assembling data from 5 different systems. CSV exports feed directly into your existing financial models, and PDF exports are ready for investor packages."

**Target Stakeholders:** CFOs, Asset Managers, Investor Relations, Compliance Officers

---

### 16. AI Agent (`/agent`)

**What It Is:**
A GPT-5 powered conversational AI assistant specialized for property management operations. It can analyze data, draft communications, generate reports, and provide strategic recommendations.

**Key Sections:**
- **Chat Interface:** Full conversational AI with streaming responses
- **Preset Prompt Categories:**
  - *Collections:* "Rank tenants by likelihood to pay this week," "Draft SMS and email for top 10 delinquent accounts," "Show payment trends and predict next month's collections"
  - *Reconciliation:* "Explain today's unmatched items and generate variance report," "Identify patterns in reconciliation discrepancies"
  - *Treasury:* "Target 550 bps over SOFR with OC ≥ 1.35; show expected yield," "Stress test: -20% BTC movement; show OC% impact path"

**Business Value Proposition:**
> "Naltos Agent is like having a financial analyst who knows your entire portfolio, never sleeps, and responds in seconds. Instead of spending 30 minutes building a collections priority list, ask the Agent to rank tenants by payment likelihood and draft personalized outreach messages — all in one prompt. It's the difference between operating reactively with historical data and proactively with AI-powered intelligence."

**Target Stakeholders:** Property Managers, Operations Staff, Financial Analysts

---

### 17. Settings (`/settings`)

**What It Is:**
Organization and platform configuration center for managing team members, PMS integrations, tenant settings, and system preferences.

**Key Sections:**
- **Organization Tab:** Company name, demo data reset capability
- **Team Management Tab:** User list with roles, ability to manage access
- **Integrations Tab:** PMS system connections (AppFolio, Yardi, Buildium) with sync status
- **Tenant Settings Tab:** Rent float configuration, yield sharing percentages, incentive program defaults
- **Compliance Tab:** Compliance mode settings (indirect only vs. accredited access)

**Business Value Proposition:**
> "One place to manage your entire Naltos configuration — team roles, PMS connections, yield sharing rules, and compliance settings. No need to contact support for basic configuration changes."

**Target Stakeholders:** Administrators, IT Directors, Property Managers

---

## TENANT PORTAL (Renter / Resident Side)

---

### 18. Tenant Home (`/tenant/home`)

**What It Is:**
The tenant's main dashboard showing upcoming rent, flexible payment options, streak-based cashback rewards, and P2P rent splitting.

**Key Sections:**
- **Rent Due Card:** Large, prominent display of upcoming rent amount, unit, and due date with "Pay Now" action button
- **Flexible Payment Options:**
  - *Full Payment:* Pay entire rent at once (marked "Best Value")
  - *Split in 2:* Half now, half on the 15th (marked "Popular")
  - *Weekly Split:* 4 equal weekly payments
- **P2P Rent Splitting:** Invite roommates to split rent, with each person paying their share directly
- **Streak-Based Cashback Engine:** 4-tier reward system:
  - Bronze: $2/month (1-6 month streak)
  - Silver: $3.50/month (7-12 month streak)
  - Gold: $5/month (13-24 month streak)
  - Platinum: $8/month (24+ month streak)
  - Current streak display (e.g., "18 months"), total cashback earned, next milestone and reward
- **Yield Flow Visualization:** Shows how the tenant's rent payment generates float that creates yield distributed back to them as cashback
- **Recent Payment History:** Last few payments with dates and status

**Business Value Proposition:**
> "Tenant Home removes every friction point from rent payment. Flexible payment options reduce delinquency by 15-25% because tenants who can't pay $1,500 on the 1st *can* pay $375 weekly. The streak cashback system turns on-time payment from a chore into a game — tenants actively want to maintain their streak because they're earning real money. P2P splitting eliminates the 'my roommate didn't Venmo me' excuse. For property managers, this means higher collection rates, lower delinquency, and tenants who view their rent payment as a positive experience rather than a burden."

**Target Stakeholders:** Tenants/Residents, Leasing Teams (for marketing the resident experience)

---

### 19. Ownership Readiness (`/tenant/ownership`)

**What It Is:**
A comprehensive homeownership preparation program that tracks tenant progress from renting toward buying, with escrow savings, lender matching, and behavioral nudging.

**Key Sections:**
- **3-Tier Eligibility System:**
  - *Tier 1 — Stable:* Basic qualification requirements (on-time payments, stable income)
  - *Tier 2 — FHA Ready:* Mid-level qualification (credit score 620+, 3.5% down payment)
  - *Tier 3 — NACA Qualified:* Advanced qualification (no down payment needed, below-market rates)
- **Escrow Wallet:** Savings progress toward down payment target ($4,200 saved of $10,500 target), monthly auto-contribution ($350), yield earned on escrow balance ($126.50), projected completion date, and upcoming vesting events
- **7-Document Lender Handoff Package:**
  - 24-Month Payment History (complete)
  - Credit Report 680+ (complete)
  - Income Verification (complete)
  - Rent-to-Credit Bureau Data (complete)
  - Behavioral Payment Profile (complete)
  - Employment Letter (pending)
  - Bank Statements 3 months (pending)
- **3 Matched Lenders:**
  - NACA National — $0 down, $0 closing, below-market rate
  - FHA Direct — 3.5% down, 6.25% rate
  - Local CRA Lender — 3% down, 5.95% rate, reduced closing
- **Behavioral Nudging Engine:** Smart notifications like "Your credit score rose +12 points — 3 more months to qualify for FHA rates" and "Down payment milestone: 40% reached — on track for Q3 readiness"

**Business Value Proposition:**
> "Ownership Readiness is Naltos's most transformative feature for the tenant experience. It turns every rent payment into a step toward homeownership — something no other property management platform offers. For property managers, it dramatically improves tenant retention during the readiness period (tenants won't move if they're building toward ownership), creates a positive brand story for marketing, and provides a natural off-ramp when tenants are ready to buy (reducing involuntary turnover). For tenants, it's a life-changing financial planning tool that makes the dream of homeownership tangible and achievable."

**Target Stakeholders:** Tenants/Residents, Community Development Organizations, Housing Nonprofits, Property Marketing Teams

---

### 20. Wallet (`/tenant/wallet`)

**What It Is:**
A tenant financial hub for managing cashback balances, yield earnings, merchant transactions, and escrow savings — all in USD.

**Key Sections:**
- **Balance Tab:** Current wallet balance, yield opt-in toggle, yield balance, current yield rate, deposit/withdraw actions
- **Rewards Tab:** Complete history of all cashback and yield earnings:
  - Streak bonuses (e.g., "18-Month Streak Bonus: $5.00")
  - Rent float yield (e.g., "January Rent Float Yield: $0.12")
  - Early payment bonuses (e.g., "Early Payment Bonus: $10.00")
  - Merchant cashback (e.g., "Merchant Cashback (3 txns): $0.45")
  - Streak milestones (e.g., "12-Month Streak Milestone: $15.00")
- **Escrow Summary Card:** Quick view of ownership escrow savings, target, yield earned, and next contribution date
- **Merchant Transactions:** Recent transactions with local merchants showing yield generated per transaction and tenant/property/platform yield split

**Business Value Proposition:**
> "The Tenant Wallet makes every financial benefit tangible. Tenants can see exactly how much they've earned from being a good resident — streak bonuses, early payment rewards, yield on their balance, and merchant cashback. This transparency drives behavioral change: when tenants see their reward balance growing with every on-time payment, they're incentivized to continue. For property managers, the wallet is the proof point that the incentive programs work — happy tenants with growing balances are tenants who renew their leases."

**Target Stakeholders:** Tenants/Residents, Leasing Teams, Tenant Retention Managers

---

### 21. Payments Calendar (`/tenant/payment-calendar`)

**What It Is:**
A visual timeline of upcoming payments, autopay management, payment streaks, and projected annual cashback — giving tenants complete visibility into their payment schedule.

**Key Sections:**
- **Upcoming Payment Timeline:** List of all scheduled events — rent payments, cashback credits, split payments — with dates, amounts, status, and payment method
- **Autopay Settings Panel:** Enable/disable autopay, view scheduled payment method, payment day, amount, and next payment date
- **Payment Streak Counter:** Visual display of current consecutive on-time payment months
- **Projected Annual Cashback:** Estimated total cashback for the year based on current streak and program enrollment

**Business Value Proposition:**
> "Payment Calendar removes 'I forgot' as an excuse for late payment. With autopay management, streak tracking, and projected cashback, tenants have every reason to stay on track. For property managers, higher autopay enrollment means more predictable cash flow — properties with 80%+ autopay enrollment see 40% fewer late payments than properties at 30% enrollment."

**Target Stakeholders:** Tenants/Residents, Property Managers (autopay enrollment metrics)

---

### 22. Credit Builder (`/tenant/credit-builder`)

**What It Is:**
A rent-to-credit reporting service that reports on-time rent payments to major credit bureaus (Experian, TransUnion, Equifax), helping tenants build credit history through payments they're already making.

**Key Sections:**
- **FICO Score Display:** Current score (712) with large visual gauge showing score range (Poor/Fair/Good/Very Good/Excellent) and position indicator
- **Score Change Tracker:** Total improvement since enrollment (+28 points)
- **3-Bureau Reporting Status Cards:**
  - Experian: Active, last reported Feb 1, 2026, +28 point impact
  - TransUnion: Active, last reported Jan 28, 2026, +24 point impact
  - Equifax: Pending activation, expected start Mar 2026
- **Score History Chart:** 10-month area chart showing score progression from 684 to 712
- **Rent Payment Impact Table:** Month-by-month breakdown showing each payment amount, on-time status, whether it was reported to bureaus, and the estimated credit score impact (e.g., "+2 to +3 points per payment")
- **Credit Improvement Tips:** Personalized actionable advice:
  - "Keep paying rent on time — each payment builds your history"
  - "Your utilization ratio is 32% — try to get below 30%"
  - "Average account age: 3.2 years — don't close old accounts"
  - "You have 0 derogatory marks — keep it that way!"

**Business Value Proposition:**
> "Credit Builder is the feature that makes Naltos a life-changing platform for tenants, not just a payment tool. 45 million Americans have no credit score, and millions more have thin files. By reporting rent payments to all three bureaus, Naltos turns the largest monthly expense most Americans have into a credit-building tool. The demo shows a 28-point improvement in 10 months — that's the difference between a 'Fair' and 'Good' credit rating, which translates to $15,000+ in lifetime savings on auto loans, mortgages, and insurance premiums. For property managers, it's a powerful leasing differentiator — prospective tenants will choose a Naltos-connected property over a competitor because their rent is building their financial future."

**Target Stakeholders:** Tenants/Residents, Leasing Teams, Community Development Organizations, Housing Nonprofits, Consumer Financial Advocates

---

### 23. Financial Hub (`/tenant/financial-hub`)

**What It Is:**
A comprehensive personal financial planning center that gives tenants budgeting tools, savings goal tracking, spending trend analysis, and a portable Renter Financial ID.

**Key Sections:**
- **Monthly Budget Overview (Pie Chart):** Visual breakdown of monthly spending — Rent ($1,500, 43%), Utilities ($180, 5%), Transportation ($320, 9%), Food ($480, 14%), Insurance ($120, 3%), Savings ($750, 22%), Other ($150, 4%) — with total income and remaining balance
- **Savings Goals Tracker:** Multiple savings goals with progress bars:
  - Emergency Fund: $2,400 / $5,000 (48%) — 14 months to goal
  - Down Payment: $8,200 / $35,000 (23%) — tracked through Naltos escrow
  - Vacation Fund: $680 / $1,200 (57%) — 4 months to goal
- **Portable Renter Financial ID Card:** A comprehensive tenant financial score (845/1000, "Excellent") that combines:
  - On-time payment rate (100%)
  - Consecutive payment months (24)
  - Average income ($4,200)
  - Rent-to-income ratio (35.7%)
  - Credit trend (+28 pts last 12 months)
  - Account standing (Excellent)
  - "Share with Landlord" button to share this financial profile when applying to new properties
- **Spending Trends Chart:** 6-month stacked bar chart showing rent, utilities, and other spending categories over time
- **Financial Tools Quick Actions:** Calculator, savings goal creation, budget alerts, and financial reports

**Business Value Proposition:**
> "Financial Hub transforms the tenant portal from a payment utility into a financial wellness platform. The Portable Renter Financial ID is a game-changer — tenants build a verified financial reputation that travels with them to any future rental application. For property managers, this means attracting tenants who are financially engaged and responsible. For tenants, it means their good behavior is documented and portable — no more starting from scratch at every new property. The budgeting and savings tools drive financial literacy that directly correlates with lower delinquency rates."

**Target Stakeholders:** Tenants/Residents, Leasing Teams, Housing Nonprofits, Financial Literacy Organizations

---

### 24. Merchants (`/tenant/merchants`)

**What It Is:**
A local merchant marketplace where tenants can make purchases at partner businesses, with yield generated from merchant settlement float distributed back to tenants as cashback.

**Key Sections:**
- **Merchant Directory:** List of partner merchants with name, category, description, settlement period, yield rate, and active status
- **Purchase Flow:** Select merchant, enter amount and description, submit transaction
- **Transaction History Table:** All merchant transactions with date, amount, settlement date, status, and yield breakdown (property share, tenant share, platform share)

**Business Value Proposition:**
> "Merchant Marketplace creates a local economic ecosystem around each property. Partner merchants get access to a captive customer base. Tenants earn cashback on everyday purchases. Property managers earn yield from merchant settlement float. It's a network effect — the more merchants participate, the more value tenants receive, the more attractive the property becomes. For the Naltos business model, merchant settlement float (1-3 day settlement) adds another yield layer to the treasury."

**Target Stakeholders:** Tenants/Residents, Local Business Owners, Property Marketing Teams

---

### 25. Tenant AI Assistant (`/tenant/agent`)

**What It Is:**
A GPT-5 powered conversational assistant specialized for tenant needs — payments, account management, and maintenance requests.

**Key Sections:**
- **Chat Interface:** Full conversational AI with streaming responses
- **Preset Prompt Categories:**
  - *Payments:* "Set up autopay for my rent," "Show my payment history," "Help me split rent with my roommate"
  - *Account:* "When is my lease renewal date?", "Send me a payment reminder 3 days before rent is due," "What payment methods do I have on file?"
  - *Maintenance:* "Submit a maintenance request," "Check status of my recent request," "Emergency contact information"

**Business Value Proposition:**
> "Tenant Assistant reduces support ticket volume by handling the most common tenant questions instantly — no waiting for office hours or email responses. For property managers, every question the AI handles is one fewer phone call for staff. For tenants, it's 24/7 access to account information and actions. The maintenance request integration is particularly valuable — tenants can submit and track requests without calling the office."

**Target Stakeholders:** Tenants/Residents, Property Management Staff, Maintenance Teams

---

### 26. Tenant Reports (`/tenant/reports`)

**What It Is:**
A personal financial reporting center for tenants to view their payment history and track financial progress with export capabilities.

**Business Value Proposition:**
> "Tenants can download verified payment history reports for tax preparation, rental applications, and personal financial records. This transparency builds trust and gives tenants agency over their financial data."

**Target Stakeholders:** Tenants/Residents

---

### 27. Tenant Settings (`/tenant/settings`)

**What It Is:**
Personal account settings for tenants to manage payment methods, notification preferences, and profile information.

**Target Stakeholders:** Tenants/Residents

### 28. P2P Transfers (`/tenant/p2p`)

**What It Is:**
Neighbor-to-neighbor payment system enabling residents to send money, request payments, and split shared expenses — all within the Naltos ecosystem. Every P2P transfer settles through the Naltos smart treasury, where the 1-2 day settlement float generates yield distributed back to users as cashback.

**Key Sections:**
- **KPI Dashboard:**
  - Available balance, monthly transaction volume, total sent/received, active payment requests
- **Activity Tab:**
  - Complete transaction history showing sent, received, requested, and split transactions
  - Per-transaction yield generated from settlement float displayed alongside each entry
  - Status tracking: completed, pending, declined
- **Contacts Tab:**
  - Searchable neighbor directory by name or unit number
  - Quick-action buttons to send or request from each contact
  - Favorite contacts for frequent transactions
- **Split Expenses Tab:**
  - Create and track shared expenses (utilities, groceries, takeout) with multiple participants
  - Per-person share tracking with paid/pending status
  - Active and settled split history
- **Send Money Dialog:**
  - Select contact, enter USD amount and description
  - Real-time yield estimate from settlement float
- **Request Money Dialog:**
  - Request payment from a neighbor with amount and reason
- **Split Expense Dialog:**
  - Name the expense, set total amount, and invite participants

**Target Stakeholders:** Tenants/Residents

**Business Value:**
- Increases platform stickiness by making Naltos the central financial hub for community life
- Settlement float (1-2 days) on every P2P transaction generates incremental yield for the treasury
- Yield sharing incentivizes higher transaction volumes — more transfers = more cashback
- Reduces friction for shared living arrangements (roommates, neighbors splitting costs)

---

### 29. Rental Insurance (`/tenant/rental-insurance`)

**What It Is:**
Monthly rental insurance coverage backed by a stablecoin reserve pool (USDC, USDT, DAI). Unlike traditional insurance where premiums are a sunk cost, Naltos insurance deploys premiums into yield-generating stablecoin strategies — so tenants earn yield on their insurance contributions while maintaining full coverage. All user-facing interactions display USD only; stablecoin backing is backend infrastructure.

**Key Sections:**
- **KPI Dashboard:**
  - Monthly premium, coverage amount, total premiums paid, yield earned on premiums
- **Active Plan Banner:**
  - Current plan details with coverage limit, deductible, and feature list
  - Quick-access "File a Claim" button
- **Coverage Plans Tab:**
  - Three-tier pricing: Basic ($9/mo, $10K coverage), Standard ($18/mo, $25K coverage, most popular), Premium ($29/mo, $50K coverage)
  - Feature comparison across plans with enrollment workflow
  - Plan enrollment confirmation dialog with yield projection
- **Claims Tab:**
  - Submit new claims with type, amount, and description
  - Track claim status: submitted, under review, approved, paid, denied
  - Claim history with payout amounts
- **Coverage Pool Tab:**
  - Total pool size with stablecoin composition breakdown (USDC 60%, USDT 25%, DAI 15%)
  - Reserve ratio (142%) and pool APY (4.8%)
  - Personal contribution and yield earned visualization
  - Pool value trend chart over time (Recharts AreaChart)
  - Step-by-step explainer: Pay Premium → Pooled in Stablecoins → Pool Earns Yield → Instant Claims

**Target Stakeholders:** Tenants/Residents

**Business Value:**
- Creates a new revenue stream from insurance premiums deployed into yield-generating stablecoin strategies
- 142% reserve ratio ensures instant claim payouts from highly liquid stablecoin reserves
- Premiums earn 4.8% APY — transforming insurance from a pure cost into a yield-generating asset for tenants
- Stablecoin-backed liquidity pool enables near-instant claim settlement vs. traditional insurance processing times
- Increases platform AUM as insurance pool grows with enrollment
- Differentiates Naltos from traditional renters insurance by offering premium yield sharing

---

## VENDOR PORTAL

---

### 30. Vendor Portal (`/vendor-portal`)

**What It Is:**
A complete vendor financial management portal with 4 tabs — Dashboard, Invoices, Redemptions, and Statements — providing vendors access to their invoices, balances, and payout options across multiple property management companies.

**Key Sections:**
- **Dashboard Tab:**
  - Multi-org balance summary — vendors see balances from each property management company they work with
  - Total balance, available balance, pending balance aggregated across all organizations
  - Yield chart showing cumulative yield earned on payment float over 30 days
  - Yield rate and total yield earned display
- **Invoices Tab:**
  - Complete invoice list across all property managers with filtering (status, organization, date range) and sorting
  - Invoice details: number, amount, status, due date, organization name
  - Bulk selection and management capabilities
- **Redemptions Tab:**
  - 3 Payout Rails:
    - *ACH (Net30-90):* Standard bank transfer, no fee, processed within normal terms
    - *Push-to-Card (Instant):* Instant payment to debit card with small fee for early redemption
    - *On-Chain Stablecoin:* Instant crypto withdrawal with minimal gas fee
  - Redemption history with status tracking (pending, processing, completed)
  - Balance available for redemption
- **Statements Tab:**
  - 6 months of downloadable monthly statements
  - Each statement shows invoice count, total amount, yield earned, and download button

**Business Value Proposition:**
> "Vendor Portal solves the #1 vendor pain point: waiting 30-90 days for payment. Vendors can now choose their payout speed — wait for standard terms, get instant payment via card, or withdraw via stablecoin. They earn yield on their float balance while they wait. The multi-org view is critical for vendors who serve multiple property managers — no more logging into separate portals for each client. For property managers, happy vendors mean better service response times, preferential pricing, and stronger business relationships. The yield-sharing model means vendors actually benefit from longer payment terms rather than being penalized by them."

**Target Stakeholders:** Vendors/Contractors, Accounts Receivable Staff, Property Manager Procurement Teams

---

## MERCHANT PORTAL

---

### 31. Merchant Portal (`/merchant-portal`)

**What It Is:**
A merchant-facing portal for local businesses partnered with Naltos properties, showing settlement balances, transaction history, yield earned from settlement float, and payout options.

**Key Sections:**
- **Dashboard Tab:**
  - Balance summary across property management organizations
  - Pending settlement, total received, total settled, total yield generated
  - Yield chart showing daily yield accumulation over 30 days
- **Transactions Tab:**
  - Complete transaction history with tenant details, amount, dates, settlement status
  - Filtering by status (pending/settled), organization, and date range
  - Individual transaction yield breakdown (property share, tenant share, merchant share, platform share)
- **Treasury Tab:**
  - Stablecoin allocation view (USDC, USDT, DAI)
  - Treasury product deployments with yield tracking
  - Merchant-specific yield intelligence
- **Statements Tab:**
  - 6 months of monthly statements
  - Invoice count, total amount, yield earned per month
  - Download capability for accounting and tax purposes

**Business Value Proposition:**
> "Merchant Portal turns local businesses into ecosystem partners. Merchants gain access to a guaranteed customer base (the property's residents), earn yield on settlement float (something they'd never receive from a traditional payment processor), and get a professional financial dashboard for their property-connected business. For the Naltos ecosystem, merchant transactions add yield-generating settlement float and increase tenant engagement through local cashback — creating a flywheel effect where more participating merchants make the property more attractive to residents."

**Target Stakeholders:** Local Business Owners, Merchant Partners, Property Community Managers

---

## CROSS-PLATFORM FEATURES

---

### 32. Activity Feed & Notifications

**What It Is:**
A universal notification bell component that appears in all 4 portal headers (Business, Tenant, Vendor, Merchant) showing role-specific activity updates with unread tracking and mark-all-read functionality.

**Key Sections:**
- **Notification Bell:** Icon button with unread count badge (shows count up to 99+)
- **Activity Panel (Popover):** Scrollable list of recent activities with severity-coded indicators (success/green, info/blue, warning/yellow, critical/red)
- **Per-Activity Details:** Title, description, relative timestamp (e.g., "2 hours ago"), severity indicator
- **Mark All Read:** One-click button to clear unread status
- **Role-Specific Content:** Each portal sees different activity types relevant to their role (e.g., business users see delinquency alerts; tenants see payment confirmations and reward credits)

**Business Value Proposition:**
> "Real-time notifications keep every stakeholder informed without email overload. Property managers see delinquency alerts and reconciliation updates. Tenants see payment confirmations and cashback credits. Vendors see payment and settlement notifications. This reduces the 'I didn't know' gap that leads to missed deadlines, forgotten follow-ups, and support tickets."

**Target Stakeholders:** All portal users

---

### 33. Dark Mode Support

**What It Is:**
Complete light/dark theme toggle available across all portals and pages, with theme-aware color system ensuring readability and aesthetic consistency in both modes.

**Business Value Proposition:**
> "Professional dark mode isn't just a nice-to-have — it signals platform maturity and user-centric design. Property managers working evening shifts or doing late-night accounting appreciate reduced eye strain. It's a small detail that communicates 'we built this for professionals who use it every day.'"

**Target Stakeholders:** All users

---

### 34. Role-Based Access Control (RBAC)

**What It Is:**
Granular permission system with 7 user roles controlling access to every page, action, and data point in the platform.

**Roles:**
- **Admin:** Full access to everything
- **PropertyManager:** Business console with full operational capabilities
- **CFO:** Financial dashboards, treasury, reports, and forecasting
- **Analyst:** Read-only access to dashboards and reports
- **Tenant:** Tenant portal only
- **Vendor:** Vendor portal only
- **Merchant:** Merchant portal only

**Business Value Proposition:**
> "Enterprise-grade access control means you can safely give your leasing team access to collections without exposing treasury operations, or let your CFO see financial reports without touching tenant communications. It's the kind of permission granularity that institutional investors and property management companies require before adopting new technology."

**Target Stakeholders:** IT Directors, Compliance Officers, Enterprise Property Management Companies

---

### 35. Multi-Tenancy & Organization Isolation

**What It Is:**
Complete data isolation between property management organizations, with per-org settings, configurations, and user management.

**Business Value Proposition:**
> "Each property management company's data is completely isolated — no risk of cross-contamination. This is a non-negotiable requirement for enterprise clients managing portfolios for different ownership groups. Naltos is built multi-tenant from day one, not bolted on as an afterthought."

**Target Stakeholders:** Enterprise Property Management Companies, Institutional Investors

---

### 36. PMS System Integrations

**What It Is:**
Integration connectors for the three dominant Property Management System platforms in multifamily: AppFolio, Yardi, and Buildium.

**Business Value Proposition:**
> "Naltos doesn't replace your PMS — it enhances it. By connecting to AppFolio, Yardi, or Buildium, Naltos pulls in your existing tenant, lease, and payment data automatically. No manual data entry. No duplicate systems. Your team keeps using the tools they know while Naltos layers on intelligence, yield optimization, and behavioral incentives that your PMS can't provide."

**Target Stakeholders:** Property Managers, IT Directors, Operations Teams

---

## KEY ECONOMIC MODEL SUMMARY

| Revenue Source | Mechanism | Yield Range | Example (500-unit portfolio) |
|---------------|-----------|-------------|------------------------------|
| **Rent Float** | Yield on 5-15 day rent payment transit time | 4.5-5.0% APY | ~$12,500/year |
| **Vendor Float** | Yield on Net30-90 vendor payment terms | 5.0-5.2% APY | ~$13,000/year |
| **Merchant Settlement** | Yield on 1-3 day merchant settlement window | 4.8% APY | ~$1,000/year |
| **Total Yield Generated** | Combined float optimization | — | ~$26,500/year |

**Yield Distribution:**
- Property Owners: 85% (~$22,500/year)
- Tenants (Cashback): 5% (~$1,325/year)
- Vendors (Yield Share): 3% (~$795/year)
- Naltos Platform: 7% (~$1,855/year)

---

## DEMO ACCESS CREDENTIALS

| Portal | Email | Password |
|--------|-------|----------|
| Business Console | demo@naltos.com | 000000 |
| Tenant Portal | tenant@demo.com | 000000 |
| Vendor Portal | vendor@demo.com | 111111 |
| Merchant Portal | merchant@demo.com | 222222 |

---

## TECHNOLOGY STACK

- **Frontend:** React, TypeScript, Tailwind CSS, Shadcn UI, Recharts
- **Backend:** Express.js, TypeScript
- **Database:** PostgreSQL (Neon) with Drizzle ORM
- **AI/ML:** GPT-5 via Replit AI Integrations
- **Authentication:** Session-based with RBAC and magic-link vendor auth
- **PMS Integrations:** AppFolio, Yardi, Buildium connectors
