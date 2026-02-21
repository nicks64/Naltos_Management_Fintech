# Naltos Platform - Project Documentation

## Overview
Naltos is an **AI-Native Operating Network for Multifamily Real Estate**, serving as a comprehensive CRM/PMS platform. It unifies operators, accounting teams, vendors, merchants, and tenants into an agentic-first infrastructure. The platform aims to replace traditional PMS/CRM tools with AI-native operational workflows, covering all aspects of multifamily operations including property management, maintenance, tenant communications, leasing, community engagement, vendor coordination, merchant ecosystems, and financial intelligence. Key ambitions include improving Net Operating Income (NOI), liquidity, and refinance readiness through deep AI integration and innovative financial engagement for tenants, vendors, and merchants.

## User Preferences
I prefer iterative development with a focus on delivering core functionality first. Please ask before making major changes to the architecture or core logic. I appreciate detailed explanations, especially for complex financial concepts or technical implementations. Do not make changes to the `shared/schema.ts` file without explicit approval, as it defines the core data model.

## System Architecture

Naltos is built with an agentic-first approach, where AI agents are the primary interface layer.

**UI/UX Decisions:**
- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI, Recharts.
- **Styling**: Full dark mode support with theme toggle, primary blue color scheme, Inter typography, JetBrains Mono for figures.
- **Routing**: Wouter is used for client-side routing.
- **Data Fetching**: TanStack Query manages data fetching, caching, and synchronization.
- **Agentic UI Components**:
    - `AgentCommandCenter`: Persistent AI chat panel accessible from the header across all portals with role-scoped context.
    - `AINudgeCard`: Inline AI insight cards with confidence scores, severity, metrics, and action buttons.
    - `AgentInsightStrip`: Compact multi-insight banners at the top of pages for real-time agent observations.
    - `Agent Digest`: Dashboard-level priority recommendations.
    - `AI-Prioritized Queues`: Task lists sorted by agent-scored urgency.

**Technical Implementations:**
- **Backend**: Express.js with TypeScript.
- **Database**: PostgreSQL (Neon) with Drizzle ORM.
- **AI Integration**: GPT-5 via Replit AI Integrations for business intelligence.
- **Core Patterns**:
    - **Dual-sided interface**: Business Console (grouped sidebar) and standalone portals (Tenant, Vendor, Merchant, Partner).
    - **Role-based routing**: Supports Admin, PropertyManager, CFO, Analyst, Tenant, Vendor, Merchant, Partner roles.
    - **Multi-tenancy**: Organization-based data isolation and settings.
    - **RBAC**: Comprehensive role-based access control defined in `client/src/lib/rbac.tsx`.
    - **Internal Accounting**: Uses NUSD as an internal accounting unit (1 NUSD = $1 treasury value), not exposed to users.
    - **Vendor Account System**: Multi-org vendor model with magic-link authentication.

**Feature Specifications & System Design:**
- **Comprehensive Workflow Coverage**: The platform covers extensive multifamily workflows, grouped into:
    - **AI Command Center**: Intelligence Hub, AI Analytics Agent, Dashboard.
    - **AI Workflows**: Collections AI, Fraud Detection, Renewal Prediction, Lease Orchestrator.
    - **Financial Ledger**: Transaction Ledger, Reconciliation, Treasury, Budgeting, AP/AR, Procurement.
    - **Property CRM**: Lease Management, Residents, Move-In/Move-Out, Units, Maintenance Hub, Communications, Applications, Marketing & Listings, Community & Events.
    - **Property Operations**: Inspections, Amenities, Parking, Packages, Access Control, Safety, Pest Control, Utility Management.
    - **Compliance & Legal**: Compliance & Legal, Dispute Center.
    - **Asset Performance**: Portfolio Overview, Capital Projects.
    - **Network Portals**: Vendor Network, Merchant Network, Tenant Layer (Deposit Alternatives).
- **Standalone Portals**:
    - **Vendor Portal**: Dashboard, Work Orders, Documents, Financials, Yield, Messages, Bids & Proposals.
    - **Merchant Portal**: Dashboard, Sales, Promotions, Events, Loyalty, Financials, Yield, Settings.
    - **Partner Portal**: Dashboard, Leads & Referrals, Compliance & Licensing, Data Access, Analytics & Reporting, Settings.
    - **Tenant Portal**: Home, wallet, payment calendar, merchants, credit builder, financial hub, privacy & consent.

## External Dependencies
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **AI**: GPT-5 (via Replit AI Integrations)
- **Legacy PMS Systems Integration**: AppFolio, Yardi, Buildium
- **Payment Rails**: ACH, cards, existing PMS integrations

## Recent Changes
- **Feb 2026**: Phase 5 — Multi-Persona Identity System
  - Schema: identities, identity_personas, tenant_persona_links tables; persona_id on vendor/merchant/partner link tables
  - 12+ storage methods for identity/persona CRUD operations
  - Middleware: requireAuth/requireRole/requireVendor/requireMerchant support dual-mode sessions (legacy user-role + identity-persona)
  - API: /api/identity/login, /api/identity/select-persona, /api/identity/switch-persona, /api/identity/personas
  - Frontend: auth-context with persona state, PersonaPicker page, PersonaSwitcher header dropdown
  - Demo: multi@demo.com (code: 000000) has 3 personas (tenant, vendor admin, property manager)
  - Architecture: one identity per email → many personas → domain-specific link tables; personaType+roleDetail → UserRole mapping
- **Feb 2026**: Phase 4 — Database-backed Property Operations pages (7 pages)
  - 7 pages rewired from mock data to real database: Inspections, Amenities, Parking, Packages, Access Control, Safety, Pest Control
  - 28 new database tables across 7 page groups
  - 28 new storage methods with org-scoped queries
  - 28 GET API endpoints with requireAuth middleware
  - Seed data for all 28 tables with realistic property operations data
  - Frontend pages use TanStack Query with loading skeletons, error states, and dynamic KPI computation
- **Feb 2026**: Phase 3 — Database-backed Property CRM pages (remaining 5)
  - 5 pages rewired: Move-In/Move-Out, Communications, Applications, Marketing, Community
  - 14 new database tables, 14 storage methods, 14 API endpoints
- **Feb 2026**: Phase 2 — Database-backed Property CRM pages (core 4)
  - 4 pages rewired: Lease Management, Units, Maintenance Hub, Residents
  - 7 new tables, 21 storage methods, extended units/leases tables
- **Feb 2026**: Phase 1 — Database-backed Partner Portal, Dispute Center, Tenant Privacy
- **Feb 2026**: Phase 0 — Platform architecture aligned with production-grade blueprint