# Naltos Platform - Project Documentation

## Overview
Naltos is an **AI-Native Financial Operating Network for Multifamily Real Estate**. It unifies operators, accounting teams, vendors, merchants, and tenants into one programmable financial infrastructure. It operates entirely in USD without exposing users to cryptocurrency terminology; digital payment rails are invisible backend infrastructure.

**Platform Identity:** Financial intelligence platform with operational extensions — not a generic PMS/CRM clone.

**Core Mission:**
- Replace traditional PMS/CRM tools over time with AI-native financial workflows
- Integrate financial intelligence deeply into operational workflows
- Automate collections, reconciliation, treasury, and renewals
- Support vendors and merchants natively within the platform
- Embed tenant financial engagement (wallet, incentives, split rent)
- Improve NOI, liquidity, and refinance readiness

**Current Value Proposition:**
- **For Property Owners**: Earn yield on idle rent and vendor payment float; use behavior-driven incentives to improve on-time payment rates.
- **For Tenants**: Earn USD cashback through on-time payments and behavioral incentives.
- **For Vendors**: Receive instant USD payments while keeping Net30-90 terms; earn yield-sharing cashback.
- **For Merchants**: In-building payment ecosystem with rent-linked rewards and revenue sharing.

## User Preferences
I prefer iterative development with a focus on delivering core functionality first. Please ask before making major changes to the architecture or core logic. I appreciate detailed explanations, especially for complex financial concepts or technical implementations. Do not make changes to the `shared/schema.ts` file without explicit approval, as it defines the core data model.

## 6-Layer Modular Architecture

The platform is organized into 6 modular but unified layers, reflected in the sidebar navigation:

### Layer 1 — Core Financial Ledger
Unified transaction engine with audit trails and multi-entity accounting.
- **Transaction Ledger** (`/transaction-ledger`) — Real-time ledger with inflow/outflow tracking
- **Reconciliation** (`/reconciliation`) — AI-assisted transaction matching
- **Treasury** (`/treasury`) — Treasury products, float management, positions
- **Audit Trail** (`/audit-trail`) — Compliance and activity logging

### Layer 2 — AI Intelligence Engines
AI embedded across decision workflows with feedback loops.
- **Intelligence Hub** (`/intelligence`) — Centralized AI insights dashboard
- **Collections AI** (`/collections`) — AI-driven collection management
- **Collection Incentives** (`/collection-incentives`) — Behavioral incentive programs
- **Fraud Detection AI** (`/fraud-detection`) — Real-time fraud monitoring
- **Renewal Prediction** (`/renewal-prediction`) — Churn prediction and renewal scoring
- **AI Analytics Agent** (`/ai-analytics`) — Conversational AI analytics

### Layer 3 — Operator Module
Asset management, NOI stabilization, and operational intelligence.
- **Dashboard** (`/dashboard`) — Operational KPIs and overview
- **Rent Stability** (`/rent-stability`) — Collection reliability tracking
- **Cash Flow Forecast** (`/cash-flow-forecast`) — Predictive cash flow modeling
- **Rent Pricing** (`/rent-pricing`) — Market-aligned pricing tools
- **Lease Agreements** (`/lease-agreements`) — AI Lease Orchestrator with wizard flow
- **Investor Reporting** (`/investor-reporting`) — Automated investor communications
- **Refi Readiness** (`/refi-readiness`) — Property refinancing scoring
- **Capital Access** (`/capital-access`) — Capital market tools
- **Staff Workload** (`/staff-workload`) — Team utilization and automation tracking
- **Reports** (`/reports`) — Comprehensive reporting

### Layer 4 — Vendor Module
Vendor lifecycle management with compliance and performance tracking.
- **Vendor Payments** (`/vendor-payments`) — Payment processing and float optimization
- **Vendor Onboarding** (`/vendor-onboarding`) — Streamlined vendor intake
- **Vendor Performance** (`/vendor-performance`) — AI-scored vendor scorecards
- **Vendor Compliance** (`/vendor-compliance`) — Insurance, licensing, document tracking

### Layer 5 — Merchant Module
In-building merchant network with rewards ecosystem.
- **Merchant Onboarding** (`/merchant-onboarding`) — Merchant network management
- **Merchant Rewards** (`/merchant-rewards`) — Rent-linked rewards and cashback programs

### Layer 6 — Tenant Financial Layer
Tenant financial engagement including payments, wallet, and rewards.
- **Deposit Alternatives** (`/deposit-alternatives`) — Alternative deposit options
- Tenant Portal pages at `/tenant/*`: home, wallet, payment calendar, merchants, credit builder, P2P transfers, rental insurance, lease review, financial hub, reports, settings

### Standalone Portals
- **Vendor Portal** (`/vendor-portal`) — Self-service vendor access with magic-link auth
- **Merchant Portal** (`/merchant-portal`) — Merchant self-service dashboard

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
- **Dual-sided interface**: Business Console (6-layer sidebar) and Tenant Portal
- **Role-based routing**: Admin, PropertyManager, CFO, Analyst, Tenant, Vendor, Merchant
- **Multi-tenancy**: Organization-based isolation with per-org settings
- **RBAC**: Comprehensive role-based access control per page
- **NUSD**: Internal accounting unit (1 NUSD = $1 treasury value), never exposed to users
- **Vendor Account System**: Multi-org vendor model with magic-link authentication

### Key Files
- `client/src/components/app-sidebar.tsx` — 6-layer grouped sidebar navigation
- `client/src/App.tsx` — Route definitions and layout structure
- `client/src/lib/rbac.tsx` — Role-based access control rules
- `client/src/lib/auth-context.tsx` — Authentication context
- `server/routes.ts` — API endpoints
- `shared/schema.ts` — Database schema (do not modify without approval)

## External Dependencies
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **AI**: GPT-5 (via Replit AI Integrations)
- **Legacy PMS Systems Integration**: AppFolio, Yardi, Buildium
- **Payment Rails**: ACH, cards, existing PMS integrations (stablecoin rails as future backend infrastructure)

## Recent Changes
- **Feb 2025**: Full platform restructure to 6-layer modular architecture
  - Sidebar reorganized into grouped sections: Core Financial Ledger, AI Intelligence Engines, Operator Module, Vendor Module, Merchant Module, Tenant Financial Layer
  - 12 new feature pages added: Audit Trail, Transaction Ledger, Fraud Detection AI, Renewal Prediction AI, Investor Reporting, Refi Readiness, Staff Workload, Vendor Onboarding, Vendor Performance, Vendor Compliance, Merchant Onboarding, Merchant Rewards
  - Branding updated to "AI-Native Financial Operating Network"
  - RBAC rules updated for all new pages
- **Feb 2025**: 4 new properties and 5 new lease agreements added for AI orchestration demo
- **Feb 2025**: AI Lease Orchestrator implemented with wizard flow and progress animations
- **Feb 2025**: Treasury consolidated into unified 4-tab page
