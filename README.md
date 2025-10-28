# Naltos Business Console

A production-looking multitenant property management platform with integrated treasury solutions, AI-powered reconciliation, and real-time financial insights.

## Quick Start

```bash
npm install
npm run db:push
npm run dev
```

Visit `http://localhost:5000` to access the application.

## Demo Credentials

### Quick Demo Access
Click "Use Demo Organization" on the login screen for instant access.

### Magic Code Login
- Email: `demo@naltos.com`
- Magic Code: `000000`

### Create New Organization
Sign up with any email/password to create your own organization.

## Features

### 1. Authentication & Multitenancy
- Magic code login (demo code: 000000)
- Organization-based multitenancy
- Role-based access control: Admin, PropertyManager, CFO, Analyst
- Demo organization quick access

### 2. Overview Dashboard
- **6 KPI Cards** with 30-day sparklines:
  - On-Time Payment %
  - Days Sales Outstanding (DSO)
  - Delinquent Amount
  - Opex per Unit
  - Treasury AUM
  - Current Yield

### 3. Collections Management
- Tenant payment tracking table
- Send Paylink (SMS/Email) - mocked
- Schedule Nudge reminders - mocked
- Status badges (Pending, Overdue, Partial)
- Days past due calculations

### 4. Reconciliation
- Two-pane ledger view (Bank/PMS vs Tenant)
- AI-powered auto-match suggestions
- One-click approve matches
- Hours saved counter
- Confidence scoring for matches

### 5. Treasury Products
Three Naltos Reserve products inspired by STRF/STRK/STRC:

#### NRF (Naltos Reserve Fund)
- Short-term government/T-Bill fund
- 100% T-Bills/Repos
- Stable yield ~5.1%

#### NRK (Naltos Reserve T-Bill Token)
- Tokenized T-Bills
- 30-day rolling maturity
- Yield ~5.2%

#### NRC (Naltos Reserve Cash+)
- Dual-collateral (70-80% T-Bills, 20-30% BTC hedged)
- Enhanced yield targeting T-Bill + 200-500 bps
- OC Ratio tracking
- Accredited only (gated by compliance mode)

**Features:**
- Subscribe/Redeem with instant balance updates
- Auto-Roll toggle
- Metrics: AUM, Yield, WAM, OC%, Duration, Fees
- Risk badges per product

### 6. Reports
- Delinquency aging analysis
- NOI trend charts
- Opex per unit by property
- Treasury yield contribution
- Export to CSV/PDF (mocked)

### 7. AI Agent
- Chat interface with streaming responses
- Preset prompts by category:
  - **Collections**: Rank tenants, draft outreach
  - **Reconciliation**: Explain variances, identify patterns
  - **Treasury**: Yield optimization, stress testing
- Powered by GPT-5 via Replit AI Integrations

### 8. Settings
- Organization profile management
- User/role administration
- PMS connector config (AppFolio/Yardi/Buildium)
- Compliance mode toggle:
  - Indirect exposure only
  - Accredited access (Reg D)
- Demo reset button

## What's Mocked vs Real

### Real (Fully Functional)
- ✅ PostgreSQL database with full schema
- ✅ Authentication and authorization
- ✅ Multitenancy with organization isolation
- ✅ All data models and relationships
- ✅ KPI calculations from real data
- ✅ Treasury subscriptions/redemptions
- ✅ Settings persistence
- ✅ Dark mode support

### Mocked (Demo Only)
- 📧 Email/SMS sending (shows toasts)
- 🔗 PMS API integration (uses fixtures)
- 💳 Payment processing (instant demo updates)
- 🤖 AI Agent responses (will use GPT-5 with pre-canned context)
- 📊 Report exports (triggers download toast)

## Seed Data

The application includes comprehensive seed data:
- 3 properties (200 total units)
- 120 active leases
- 300 invoices (mix of pending/paid/overdue)
- 220 payments (ACH/Card mix)
- 40 delinquent accounts
- 30 bank ledger entries (some unmatched)
- Treasury products with initial balances:
  - NRF: $1.2M AUM
  - NRK: $0.8M AUM
  - NRC: $0.3M AUM

## 5-Minute Demo Script

1. **Login** (0:30)
   - Click "Use Demo Organization"
   - Explore Overview dashboard KPIs

2. **Collections** (1:00)
   - View delinquent accounts
   - Click "Send Paylink" on an overdue item
   - Click "Schedule Nudge" to queue reminder

3. **Reconciliation** (1:30)
   - Review unmatched ledger entries
   - Click "Auto-Match" to see AI suggestions
   - Approve a suggested match

4. **Treasury** (1:30)
   - Review NRF/NRK/NRC products
   - Click "Subscribe" on NRC
   - Enter amount (e.g., $100,000)
   - Toggle Auto-Roll switch

5. **Agent** (1:00)
   - Click preset prompt: "Rank tenants by likelihood to pay"
   - Watch streaming AI response
   - Try custom question in input field

6. **Settings** (0:30)
   - Switch Compliance Mode
   - View team members
   - Try "Reset Demo Data"

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Auth**: Custom magic code + JWT sessions
- **AI**: GPT-5 via Replit AI Integrations
- **Charts**: Recharts
- **Routing**: Wouter
- **Forms**: React Hook Form + Zod

## Environment Variables

All environment variables are automatically configured:
- `DATABASE_URL` - PostgreSQL connection
- `AI_INTEGRATIONS_OPENAI_BASE_URL` - OpenAI API endpoint
- `AI_INTEGRATIONS_OPENAI_API_KEY` - OpenAI API key
- `SESSION_SECRET` - Session encryption key

## Architecture

### Database Schema
- Multi-tenant with organization isolation
- Comprehensive relations using Drizzle ORM
- Audit logging for compliance
- Treasury products and subscriptions

### API Routes
- `/api/auth/*` - Authentication endpoints
- `/api/kpis` - Dashboard metrics
- `/api/collections/*` - Payment management
- `/api/recon/*` - Reconciliation
- `/api/treasury/*` - Treasury operations
- `/api/agent` - AI chat (streaming)
- `/api/reports` - Analytics
- `/api/settings/*` - Configuration
- `/api/admin/reset` - Demo reset

### Frontend Architecture
- Component-based with Shadcn UI
- React Query for data fetching
- Context API for auth state
- Responsive design (mobile/tablet/desktop)
- Dark mode support

## Compliance & Disclaimers

- Demo application only
- No real custody of funds
- Not investment advice
- Mocked integrations for demonstration
- All financial calculations are illustrative

## Development

```bash
# Install dependencies
npm install

# Set up database
npm run db:push

# Run development server
npm run dev

# Reset database (force)
npm run db:push --force
```

## License

Demo application for Naltos Business Console.
