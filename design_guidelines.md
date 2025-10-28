# Naltos Business Console - Design Guidelines

## Design Approach
**Selected System**: Carbon Design + Modern Fintech Hybrid  
Drawing inspiration from Stripe Dashboard, Linear's precision, and Carbon Design's enterprise-grade data visualization capabilities. This combines clean, professional aesthetics with the sophisticated data handling required for financial B2B SaaS.

**Core Principles**:
- Data clarity above all - information hierarchy is critical
- Professional confidence through restraint and precision
- Immediate comprehension of complex financial metrics
- Trustworthy, institutional-grade visual language

---

## Typography System

**Font Families**:
- **Primary (UI/Data)**: Inter (Google Fonts) - weights 400, 500, 600, 700
- **Monospace (Numbers/Code)**: JetBrains Mono - weight 500 for financial figures, account IDs

**Hierarchy**:
- **Page Headers**: text-3xl/text-4xl, font-semibold (600), tracking-tight
- **Section Headers**: text-xl/text-2xl, font-semibold (600)
- **Card Titles**: text-lg, font-medium (500)
- **Body Text**: text-base, font-normal (400), leading-relaxed
- **Labels/Metadata**: text-sm, font-medium (500), tracking-wide uppercase for categories
- **Financial Figures**: text-2xl/text-3xl, font-mono (JetBrains Mono), tabular-nums for alignment
- **Small Data**: text-xs/text-sm, font-mono for precision metrics

---

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16  
- Component padding: p-6 or p-8
- Card gaps: gap-4 or gap-6
- Section spacing: space-y-8 or space-y-12
- Page margins: mx-8 or mx-12

**Grid Architecture**:
- **Main Layout**: Fixed sidebar (280px) + fluid content area
- **Dashboard Grid**: 12-column responsive grid
  - KPI Cards: 3 cards per row (4 columns each) on desktop, stack on mobile
  - Data Tables: Full width with horizontal scroll if needed
  - Charts: 2-column layout for comparative views (6 columns each)

**Container Strategy**:
- Sidebar: Fixed width, full height, no max-width
- Main content: max-w-[1600px] with px-8 py-6
- Card content: p-6 for standard, p-8 for featured cards
- Forms: max-w-2xl for optimal input width

---

## Component Library

### Navigation
**Sidebar**:
- Fixed left position, full height
- Logo/org switcher at top (h-16)
- Navigation groups with text-xs uppercase labels
- Nav items: flex with icon (w-5 h-5) + label, px-3 py-2, rounded-lg
- Active state: distinct treatment with indicator
- Collapse button at bottom

**Top Bar**:
- Fixed top, full width, h-14
- Breadcrumbs left, user menu + notifications right
- Search bar center (max-w-md)

### KPI Cards
**Structure**:
- Glassmorphic cards: backdrop-blur-sm with rounded-xl borders
- Layout: Icon (top-left, w-10 h-10) + metric (large mono) + label + sparkline
- Padding: p-6
- Trend indicator: Small badge with arrow + percentage change
- Sparkline: h-12, subtle stroke

**Card Grid**: 
- 3 columns on desktop (grid-cols-3 gap-6)
- 2 columns on tablet (md:grid-cols-2)
- 1 column on mobile

### Data Tables
**Table Design**:
- Minimal borders: border-b on rows only
- Header: sticky, text-xs uppercase tracking-wide, font-medium, pb-3
- Rows: px-6 py-4, hover state for interactivity
- Cell alignment: Numbers right-aligned with tabular-nums
- Action buttons: Ghost style, appear on row hover
- Pagination: Bottom right, simple prev/next with page numbers

**Collections Table Specifics**:
- Columns: Tenant Name, Unit, Amount Due, Due Date, Status Badge, Actions
- Status badges: Pill-shaped, px-3 py-1, rounded-full, text-xs font-medium
- Action buttons: "Send Paylink" + "Schedule Nudge" as ghost buttons

### Treasury Product Cards
**Card Structure**:
- Large cards with clear hierarchy: p-8, rounded-2xl
- Header: Product name (text-2xl font-semibold) + risk badges
- Metrics section: Grid of 2x3 metrics (AUM, Yield, WAM, OC%, Duration, Fees)
- Each metric: Label (text-xs uppercase) + Value (text-xl font-mono)
- Pill badges: For WAM, Yield%, Fees - inline-flex px-3 py-1 rounded-full text-sm
- Action buttons: Primary CTA (Subscribe/Redeem) + ghost "Auto-Roll" toggle
- Fact sheet link: text-sm underline at bottom

**Treasury Grid**: 3 products in single row on desktop, stack on mobile

### Reconciliation Interface
**Two-Pane Layout**:
- Split view: 50/50 on desktop, stack on mobile
- Left pane: Bank/PMS ledger table
- Right pane: Tenant ledger table
- Match suggestions: Connecting lines or badges with "AI Suggested" tag
- Match cards: rounded-lg border-2 border-dashed, p-4, with approve/reject buttons

**Auto-Match UI**:
- Floating button: fixed bottom-right, large, with "Auto-Match" + count badge
- Hours saved counter: Prominent display, text-3xl font-mono with label

### Forms & Inputs
**Input Fields**:
- Height: h-10 for standard inputs
- Padding: px-4
- Border: rounded-lg with focus ring
- Labels: text-sm font-medium, mb-2
- Helper text: text-xs, mt-1

**Button System**:
- Primary: px-6 py-2.5, rounded-lg, font-medium, focus ring
- Ghost: px-4 py-2, rounded-lg, transparent background
- Icon buttons: w-10 h-10, rounded-lg, centered icon
- Button groups: flex gap-2 for related actions

### Agent Chat Panel
**Layout**:
- Right sidebar or modal: w-96 (sidebar) or max-w-2xl (modal)
- Header: "Naltos Agent" with close button
- Preset prompts: Grid of rounded-lg buttons, p-4, text-left, border, gap-3
- Chat area: flex-1 overflow-auto, space-y-4
- Messages: User (right-aligned) vs Agent (left-aligned), p-4 rounded-2xl
- Input: Fixed bottom, h-12 with send button

### Charts & Visualizations
**Chart Containers**:
- Padding: p-6
- Title: text-lg font-semibold mb-4
- Chart: min-h-64 for clarity
- Legend: Below chart, flex gap-4, text-sm
- Recharts configuration: Minimal gridlines, smooth curves, subtle fills

**Sparklines**: 
- Inline in KPI cards: h-12 w-full
- Simple line, no axes, subtle stroke

### Modals & Overlays
**Modal Structure**:
- Overlay: backdrop-blur-sm
- Container: max-w-2xl (standard), max-w-4xl (large), rounded-2xl, p-8
- Header: flex justify-between items-start, mb-6
- Footer: flex justify-end gap-3, mt-8, pt-6 border-t

**Toast Notifications**:
- Fixed top-right, space-y-3
- Toast: px-6 py-4, rounded-xl, flex items-center gap-3
- Icon (w-5 h-5) + message + close button
- Auto-dismiss: 5 seconds with progress bar

---

## Responsive Strategy

**Breakpoints**:
- Mobile: < 768px - Stack all columns, full-width cards
- Tablet: 768px - 1024px - 2-column grids, compressed sidebar
- Desktop: > 1024px - Full 3-column layouts, fixed sidebar

**Mobile Adaptations**:
- Sidebar becomes bottom nav or hamburger menu
- KPI cards stack vertically
- Tables: Horizontal scroll or card view transformation
- Two-pane reconciliation: Tabs instead of side-by-side

---

## Micro-interactions (Minimal)

**Hover States**: Subtle scale (scale-[1.02]) or opacity changes only
**Loading States**: Skeleton screens for tables, spinner for async actions
**Transitions**: transition-all duration-200 for smooth state changes
**Focus**: Clear focus rings (ring-2) for accessibility

**Avoid**: Excessive animations, distracting motion, auto-playing elements

---

## Accessibility Standards

- Semantic HTML throughout
- ARIA labels for icon-only buttons
- Keyboard navigation for all interactive elements
- Focus indicators meet WCAG AA standards
- Form validation with clear error messages
- Screen reader announcements for async updates

---

## Icon System

**Library**: Heroicons (outline for navigation, solid for states)  
**Sizes**: w-4 h-4 (inline), w-5 h-5 (standard), w-6 h-6 (headers), w-10 h-10 (feature icons)  
**Usage**: Navigation icons, status indicators, action buttons, KPI card headers

---

## Page-Specific Layouts

**Login/Signup**: Centered card (max-w-md), split-screen with brand visual on desktop  
**Overview Dashboard**: 6 KPI cards in 3-column grid + 2 chart rows below  
**Collections**: Table with filters/search above, bulk action bar when rows selected  
**Treasury**: 3 product cards in row + subscribed products section below  
**Reports**: Filter panel (left) + main report area (right), export buttons top-right  
**Settings**: Left nav tabs + content area, forms in max-w-2xl containers