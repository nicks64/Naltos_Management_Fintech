# Naltos Platform - Project Documentation

## Overview
Naltos is an **AI-Native Operating Network for Multifamily Real Estate**. It is a comprehensive CRM/PMS platform that unifies operators, accounting teams, vendors, merchants, and tenants into one agentic-first infrastructure. The platform covers all aspects of multifamily operations — property management, maintenance, tenant communications, leasing, community engagement, vendor coordination, merchant ecosystems, and financial intelligence.

**Platform Identity:** Agentic-first CRM/PMS with financial intelligence deeply embedded — AI agents are the primary interface layer across all portals.

**Core Mission:**
- Replace traditional PMS/CRM tools with AI-native operational workflows
- Cover ALL multifamily workflows: leasing, residents, move-in/out, units, maintenance, communications, inspections, amenities, marketing, applications, community, parking, packages, access control, safety, pest control, utilities, compliance, budgeting, AP/AR, procurement, capital projects, portfolio management
- Integrate AI agents deeply into every workflow with proactive insights and autonomous actions
- Support vendors and merchants natively within the platform
- Embed tenant financial engagement (wallet, incentives, split rent)
- Improve NOI, liquidity, and refinance readiness

**Current Value Proposition:**
- **For Property Owners**: Comprehensive property management with AI-driven insights; earn yield on idle rent and vendor payment float; use behavior-driven incentives to improve on-time payment rates.
- **For Tenants**: Full-service portal with payment management, credit building, community events, and USD cashback through on-time payments.
- **For Vendors**: Work order management, bid/proposal tracking, compliance management, instant USD payments with yield-sharing cashback.
- **For Merchants**: In-building commerce ecosystem with event sponsorship, customer loyalty programs, rent-linked rewards, and revenue sharing.

## User Preferences
I prefer iterative development with a focus on delivering core functionality first. Please ask before making major changes to the architecture or core logic. I appreciate detailed explanations, especially for complex financial concepts or technical implementations. Do not make changes to the `shared/schema.ts` file without explicit approval, as it defines the core data model.

## Agentic Architecture

The platform is agentic-first — AI agents are the primary interface layer:
- **AgentCommandCenter**: Persistent AI chat panel accessible from header across all portals (business, vendor, merchant) with role-scoped context and suggested prompts
- **AINudgeCard**: Inline AI insight cards with confidence scores, severity levels, metrics, and action buttons embedded throughout all pages
- **AgentInsightStrip**: Compact multi-insight banners at top of pages showing real-time agent observations
- **Agent Digest**: Dashboard-level priority recommendations from AI agents
- **AI-Prioritized Queues**: Task lists sorted by agent-scored urgency across maintenance, applications, complaints

## Sidebar Navigation Structure

The business console sidebar is organized into these groups:

### AI Command Center (tag: AI)
- Intelligence Hub, AI Analytics Agent, Dashboard

### AI Workflows (tag: WF)
- Collections AI, Collection Incentives, Fraud Detection, Renewal Prediction, Lease Orchestrator

### Financial Ledger (tag: FIN)
- Transaction Ledger, Reconciliation, Treasury, Cash Flow Forecast, Budgeting & Forecasting, Accounts Payable/Receivable, Procurement & Inventory, Audit Trail

### Property CRM (tag: CRM)
- Lease Management (`/lease-management`) — Active lease tracking, renewals, rent increases, violations, deposit dispositions
- Residents (`/residents`) — Tenant profiles, households, pets, vehicles, emergency contacts, guarantors
- Move-In / Move-Out (`/move-in-out`) — Move-in checklists, key handoff, utility transfers, move-out inspections, unit turns
- Units (`/units`) — Unit inventory, status tracking, make-ready board, rent roll, floorplans, occupancy matrix
- Maintenance Hub (`/maintenance`) — AI-prioritized work orders, preventive scheduling, unit turns, predictive maintenance
- Communications (`/communications`) — Tenant messaging, announcements, notices, AI-triaged complaint tracking
- Applications (`/applications`) — Tenant screening pipeline, AI-scored risk assessment, waitlist management
- Marketing & Listings (`/marketing`) — Vacancy marketing, lead pipeline, showings, AI market insights
- Community & Events (`/community`) — Events calendar, programs & clubs, engagement analytics

### Property Operations (tag: PROP)
- Inspections (`/inspections`) — Property inspections, unit conditions, checklists, AI condition scoring
- Amenities (`/amenities`) — Amenity reservations, usage analytics, equipment maintenance
- Parking & Vehicles (`/parking`) — Space assignments, permits, violations, towing, garage access
- Packages & Delivery (`/packages`) — Package logging, locker management, carrier tracking, unclaimed handling
- Key & Access Control (`/access-control`) — Key inventory, fobs, smart locks, access logs, lockout requests
- Safety & Security (`/safety`) — Incident reports, patrol logs, cameras, fire safety, emergency plans, after-hours calls
- Pest Control (`/pest-control`) — Treatment scheduling, unit history, vendor coordination, prevention programs
- Utility Management (`/utilities`) — RUBS billing, submeter readings, transfers, consumption analytics

### Compliance & Legal (tag: LEGAL)
- Compliance & Legal (`/compliance`) — Fair housing, evictions, legal notices, regulatory inspections, ADA compliance
- Dispute Center (`/disputes`) — Rent disputes, vendor invoice disputes, merchant transaction disputes, resolution workflows

### Asset Performance (tag: OPS)
- Portfolio Overview (`/portfolio`) — Multi-property dashboard, NOI benchmarking, property comparison, watchlist
- Capital Projects (`/capital-projects`) — Project tracking, contractor bids, budget/timeline management, warranties
- Rent Stability, Rent Pricing, Investor Reporting, Refi Readiness, Capital Access, Staff Workload, Reports

### Vendor Network (tag: VN)
- Vendor Payments, Vendor Onboarding, Vendor Performance, Vendor Compliance

### Merchant Network (tag: MN)
- Merchant Onboarding, Merchant Rewards

### Tenant Layer (tag: TN)
- Deposit Alternatives

### Standalone Portals
- **Vendor Portal** (`/vendor-portal`) — Tabs: Dashboard, Work Orders, Documents, Financials, Yield, Messages, Bids & Proposals
- **Merchant Portal** (`/merchant-portal`) — Tabs: Dashboard, Sales, Promotions, Events, Loyalty, Financials, Yield, Settings
- **Partner Portal** (`/partner-portal`) — Tabs: Dashboard, Leads & Referrals, Compliance & Licensing, Data Access, Analytics & Reporting, Settings
- **Tenant Portal** (`/tenant/*`) — Home, wallet, payment calendar, merchants, credit builder, P2P transfers, rental insurance, lease review, financial hub, reports, privacy & consent, settings

## Technical Architecture

### Frontend
- React, TypeScript, Tailwind CSS, Shadcn UI, Recharts
- Wouter for routing, TanStack Query for data fetching
- Full dark mode support with theme toggle
- Primary blue color scheme, Inter typography, JetBrains Mono for figures

### Backend
- Express.js, TypeScript
- PostgreSQL (Neon) with Drizzle ORM as internal ledger
- GPT-5 via Replit AI Integrations for business intelligence

### Core Patterns
- **Agentic-first UI**: AgentCommandCenter, AINudgeCard, AgentInsightStrip embedded across all portals
- **Dual-sided interface**: Business Console (grouped sidebar) and standalone portals (Tenant, Vendor, Merchant)
- **Role-based routing**: Admin, PropertyManager, CFO, Analyst, Tenant, Vendor, Merchant, Partner
- **Multi-tenancy**: Organization-based isolation with per-org settings
- **RBAC**: Comprehensive role-based access control per page (defined in `client/src/lib/rbac.tsx`)
- **NUSD**: Internal accounting unit (1 NUSD = $1 treasury value), never exposed to users
- **Vendor Account System**: Multi-org vendor model with magic-link authentication

### Key Files
- `client/src/components/app-sidebar.tsx` — Grouped sidebar navigation (AI, FIN, CRM, PROP, LEGAL, OPS, VN, MN, TN)
- `client/src/components/agent-command-center.tsx` — Persistent AI chat panel
- `client/src/components/ai-nudge-card.tsx` — AINudgeCard and AgentInsightStrip components
- `client/src/App.tsx` — Route definitions and layout structure
- `client/src/lib/rbac.tsx` — Role-based access control rules
- `client/src/lib/auth-context.tsx` — Authentication context
- `server/routes.ts` — API endpoints
- `shared/schema.ts` — Database schema (do not modify without approval)

### All Page Files
- **Property CRM**: lease-management.tsx, residents.tsx, move-in-out.tsx, units.tsx, maintenance.tsx, communications.tsx, applications.tsx, marketing.tsx, community.tsx
- **Property Operations**: inspections.tsx, amenities.tsx, parking.tsx, packages.tsx, access-control.tsx, safety.tsx, pest-control.tsx, utilities.tsx
- **Compliance & Legal**: compliance.tsx, disputes.tsx
- **Financial**: budgeting.tsx, accounts.tsx, procurement.tsx
- **Asset Performance**: portfolio.tsx, capital-projects.tsx
- **Partner Portal**: partner-portal.tsx, partner-login.tsx
- **Tenant Privacy**: tenant/privacy.tsx

## Supported Vendor Types
HVAC, plumbing, electrical, general contractors, landscaping/grounds, pest control, elevator maintenance, fire/life safety, roofing, painting, flooring, cleaning/janitorial, security companies, pool/spa, appliance repair, locksmith, snow removal, trash/waste, IT/technology (smart locks, WiFi), legal services, towing, EV charger maintenance, solar/energy, telecom

## External Dependencies
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **AI**: GPT-5 (via Replit AI Integrations)
- **Legacy PMS Systems Integration**: AppFolio, Yardi, Buildium
- **Payment Rails**: ACH, cards, existing PMS integrations (stablecoin rails as future backend infrastructure)

## Recent Changes
- **Feb 2026**: Phase 0 Blueprint Implementation — Platform architecture aligned with production-grade blueprint
  - Partner Portal: New standalone portal for insurance, mortgage, and investment partners with 6 tabs (Dashboard, Leads, Compliance, Data Access, Analytics, Settings)
  - Partner Login: Magic-link authentication flow for partner users at /partner-login
  - Dispute Center: Comprehensive dispute management page covering rent disputes, vendor invoice disputes, and merchant transaction disputes with resolution workflows
  - Tenant Privacy & Consent: New tenant portal page for managing data sharing preferences, consent history, privacy controls, and partner access oversight
  - Login page updated with Partner user type selector (5 user types: Business, Tenant, Vendor, Merchant, Partner)
  - RBAC expanded with dispute and privacy routes
  - Sidebar expanded with Dispute Center in Compliance & Legal group
- **Feb 2026**: Complete multifamily workflow coverage — 16 new operational modules added
  - Tier 1 (Core Daily Ops): Lease Management, Resident Management, Move-In/Move-Out, Unit Inventory & Status
  - Tier 2 (Financial & Compliance): Budgeting & Forecasting, Accounts Payable/Receivable, Compliance & Legal, Utility Management
  - Tier 3 (Operational Support): Parking & Vehicles, Packages & Delivery, Key & Access Control, Safety & Security, Pest Control
  - Tier 4 (Portfolio & Advanced): Portfolio Overview, Capital Projects, Procurement & Inventory
  - New sidebar groups: "Property Operations" (PROP) and "Compliance & Legal" (LEGAL)
  - Financial Ledger expanded with Budgeting, AP/AR, Procurement
  - Asset Performance expanded with Portfolio Overview and Capital Projects
  - All 16 new pages embed agentic components (AINudgeCard, AgentInsightStrip)
  - RBAC rules updated for all new pages
- **Feb 2026**: CRM/PMS expansion
  - 7 Property CRM pages: Maintenance Hub, Communications, Inspections, Marketing, Applications, Amenities, Community
  - Vendor Portal: Bids & Proposals tab with RFQ management and AI bid intelligence
  - Merchant Portal: Events tab (sponsorship, booths) and Loyalty tab (segments, campaigns, analytics)
- **Feb 2025**: Agentic-first transformation
  - AgentCommandCenter with GPT-5 streaming chat across all portals
  - AINudgeCard and AgentInsightStrip components for inline AI insights
  - Dashboard redesigned as agent-driven command center
- **Feb 2025**: Full platform restructure to modular architecture
  - 12 feature pages added: financial, AI, vendor, merchant modules
  - AI Lease Orchestrator with wizard flow
  - Treasury consolidated into unified 4-tab page
