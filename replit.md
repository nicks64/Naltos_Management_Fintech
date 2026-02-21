# Naltos Platform - Project Documentation

## Overview
Naltos is an **AI-Native Operating Network for Multifamily Real Estate**. It is a comprehensive CRM/PMS platform that unifies operators, accounting teams, vendors, merchants, and tenants into one agentic-first infrastructure. The platform covers all aspects of multifamily operations — property management, maintenance, tenant communications, leasing, community engagement, vendor coordination, merchant ecosystems, and financial intelligence.

**Platform Identity:** Agentic-first CRM/PMS with financial intelligence deeply embedded — AI agents are the primary interface layer across all portals.

**Core Mission:**
- Replace traditional PMS/CRM tools with AI-native operational workflows
- Cover all aspects of multifamily operations: maintenance, communications, leasing, inspections, amenities, marketing, community, financials
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
- Transaction Ledger, Reconciliation, Treasury, Cash Flow Forecast, Audit Trail

### Property CRM (tag: CRM)
- Maintenance Hub (`/maintenance`) — AI-prioritized work orders, preventive scheduling, unit turns, predictive maintenance
- Communications (`/communications`) — Tenant messaging, announcements, notices, AI-triaged complaint tracking
- Inspections (`/inspections`) — Property inspections, unit conditions, checklists, AI condition scoring
- Marketing & Listings (`/marketing`) — Vacancy marketing, lead pipeline, showings, AI market insights
- Applications (`/applications`) — Tenant screening pipeline, AI-scored risk assessment, waitlist management
- Amenities (`/amenities`) — Amenity reservations, usage analytics, equipment maintenance
- Community & Events (`/community`) — Events calendar, programs & clubs, engagement analytics

### Asset Performance (tag: OPS)
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
- **Tenant Portal** (`/tenant/*`) — Home, wallet, payment calendar, merchants, credit builder, P2P transfers, rental insurance, lease review, financial hub, reports, settings

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
- **Role-based routing**: Admin, PropertyManager, CFO, Analyst, Tenant, Vendor, Merchant
- **Multi-tenancy**: Organization-based isolation with per-org settings
- **RBAC**: Comprehensive role-based access control per page (defined in `client/src/lib/rbac.tsx`)
- **NUSD**: Internal accounting unit (1 NUSD = $1 treasury value), never exposed to users
- **Vendor Account System**: Multi-org vendor model with magic-link authentication

### Key Files
- `client/src/components/app-sidebar.tsx` — Grouped sidebar navigation (AI, CRM, OPS, VN, MN, TN)
- `client/src/components/agent-command-center.tsx` — Persistent AI chat panel
- `client/src/components/ai-nudge-card.tsx` — AINudgeCard and AgentInsightStrip components
- `client/src/App.tsx` — Route definitions and layout structure
- `client/src/lib/rbac.tsx` — Role-based access control rules
- `client/src/lib/auth-context.tsx` — Authentication context
- `server/routes.ts` — API endpoints
- `shared/schema.ts` — Database schema (do not modify without approval)

### CRM/PMS Pages (Property CRM Group)
- `client/src/pages/maintenance.tsx` — Maintenance Hub with work orders, preventive scheduling, unit turns, AI predictions
- `client/src/pages/communications.tsx` — Communications center with messaging, announcements, notices, complaint tracker
- `client/src/pages/inspections.tsx` — Inspections management with scheduling, results, unit conditions, checklists
- `client/src/pages/amenities.tsx` — Amenity management with reservations, usage analytics, equipment tracking
- `client/src/pages/marketing.tsx` — Marketing & listings with vacancy management, lead pipeline, showings, market insights
- `client/src/pages/applications.tsx` — Applications & screening with pipeline, screening results, approved tenants, waitlist
- `client/src/pages/community.tsx` — Community & events with event management, programs, engagement analytics

## External Dependencies
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **AI**: GPT-5 (via Replit AI Integrations)
- **Legacy PMS Systems Integration**: AppFolio, Yardi, Buildium
- **Payment Rails**: ACH, cards, existing PMS integrations (stablecoin rails as future backend infrastructure)

## Recent Changes
- **Feb 2026**: Major CRM/PMS expansion — platform now covers all aspects of multifamily operations
  - 7 new Property CRM pages: Maintenance Hub, Communications, Inspections, Marketing & Listings, Applications & Screening, Amenities, Community & Events
  - Sidebar restructured: new "Property CRM" group for operational modules, "Asset Performance" group for financial ops
  - Vendor Portal expanded: Bids & Proposals tab with RFQ management and AI bid intelligence
  - Merchant Portal expanded: Community Events tab (event sponsorship, booth reservations) and Loyalty tab (member segments, campaign management, program analytics)
  - All new modules embed agentic components (AINudgeCard, AgentInsightStrip) with contextual AI insights
  - RBAC rules updated for all new pages (Admin, PropertyManager access)
- **Feb 2025**: Agentic-first transformation
  - AgentCommandCenter with GPT-5 streaming chat across all portals
  - AINudgeCard and AgentInsightStrip components for inline AI insights
  - Dashboard redesigned as agent-driven command center
  - Sidebar reorganized with AI groups at top
- **Feb 2025**: Full platform restructure to modular architecture
  - 12 feature pages added: Audit Trail, Transaction Ledger, Fraud Detection AI, Renewal Prediction AI, Investor Reporting, Refi Readiness, Staff Workload, Vendor Onboarding, Vendor Performance, Vendor Compliance, Merchant Onboarding, Merchant Rewards
  - AI Lease Orchestrator with wizard flow
  - Treasury consolidated into unified 4-tab page
