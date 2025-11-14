# Naltos Platform - Project Documentation

## Overview
Naltos transforms multifamily rent flows into a programmable financial asset by orchestrating stablecoin rails and automating treasury yield on idle cash. It converts rent, vendor invoices, and merchant transactions into NUSD, a fully-backed programmatic dollar, to deploy idle balances into short-duration, low-risk assets. This generates yield for property owners, creates incentives for tenants, and provides a seamless payment layer for vendors and merchants. The platform addresses the issue of over $35B+ idle monthly in traditional multifamily finance by treating rent as short-duration financial assets capable of producing yield through Rent Float, Vendor Float, and Merchant Settlement.

The project's ambition is to evolve into MeshPay, a global stablecoin payment and settlement network, supporting multi-currency transactions and optimizing global FX routing.

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
    - Role-Based Access for Admin, PropertyManager, CFO, Analyst, and Tenant.
- **NUSD**: A private, fully-backed, redeemable internal accounting unit representing $1 held in short-term treasury assets, instantly redeemable 1:1 for USD, and programmable for automated payouts and yield distribution.

### Feature Specifications
- **Dashboard KPIs**: Displays operational (On-Time %, DSO, Delinquent), financial (Opex/Unit, Treasury AUM, Current Yield), and float yield metrics (Vendor Float AUM, Vendor Yield, Rent Float Yield) in a 3x3 grid.
- **Treasury Engine**: Automated deployment into tokenized T-Bills, money-market equivalents, and delta-neutral credit.
- **Stablecoin Bridge**: Bidirectional conversion layer between crypto rails (USDC/USDT/DAI) and legacy PMS systems (AppFolio/Yardi/Buildium).
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