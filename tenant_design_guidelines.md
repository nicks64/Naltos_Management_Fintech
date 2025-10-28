# Naltos Tenant Portal - Design Guidelines

## Design Approach
**Selected System**: Apple Card-Inspired Consumer Experience  
Drawing inspiration from Apple Card, Robinhood, and modern consumer fintech apps. This creates a friendly, approachable interface that makes financial management feel simple and accessible.

**Core Principles**:
- Simplicity above all - clear, uncluttered interface
- Consumer-friendly warmth through gradients and soft colors
- Premium feel through thoughtful shadows and spacing
- Mobile-first design that scales beautifully
- Confidence-building through clear typography and visual hierarchy

---

## Color System

### Gradient Palette (Signature Feature)
**Primary Gradient** (Purple): `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **Usage**: Primary actions, hero rent card, active nav states
- **Feel**: Trustworthy, premium, institutional

**Wallet Gradient** (Pink): `linear-gradient(135deg, #f093fb 0%, #f5576c 100%)`
- **Usage**: Wallet balance card, financial features
- **Feel**: Friendly, approachable, consumer-focused

**Success Gradient** (Cyan-Blue): `linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)`
- **Usage**: Success states, completed payments, positive indicators
- **Feel**: Confident, secure, accomplished

**Premium Gradient** (Light Blue): `linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)`
- **Usage**: Special features, yield earnings, premium indicators
- **Feel**: Fresh, modern, valuable

### Base Colors
- **Background**: Pure white (light) / Deep navy (dark)
- **Foreground**: Soft black (#1a1a1a) for readability
- **Muted**: Gentle grays for secondary information
- **Borders**: Subtle, barely-there dividers

---

## Typography System

**Font Families**:
- **Primary**: Inter (weights 400, 500, 600, 700)
- **Monospace**: Default system mono for financial figures

**Hierarchy** (Noticeably larger than business UI):
- **Page Headers**: text-5xl (3rem/48px), font-bold, tracking-tight
  - Example: "Home", "Wallet", "Settings"
- **Subheadings**: text-lg (1.125rem/18px), regular weight
  - More conversational tone than business
- **Hero Numbers**: text-6xl (3.75rem/60px), font-bold, tabular-nums
  - Example: Balance displays, rent amounts
- **Card Titles**: text-2xl (1.5rem/24px), font-semibold
  - Larger than business to feel more approachable
- **Body Text**: text-base (1rem/16px)
- **Metadata**: text-sm (0.875rem/14px)

**Key Difference from Business UI**: Typography is 20-30% larger across the board, creating a more relaxed, consumer-friendly feeling.

---

## Layout System

**Spacing**: More generous than business UI
- Page margins: px-8 py-6
- Card padding: p-8 (vs p-6 in business)
- Section spacing: space-y-8 (vs space-y-6)
- Element gaps: gap-4 to gap-6

**Container Strategy**:
- Max width: max-w-[1400px] (slightly narrower than business)
- Centered content for better mobile-to-desktop scaling
- Full-width hero cards for impact

**Grid Architecture**:
- Primarily single-column for simplicity
- 2-column for stats/metrics
- Mobile-first, stacks gracefully

---

## Component Library

### Hero Cards (Signature Component)
**Structure**:
- Full gradient backgrounds (no borders)
- Large padding (p-8)
- White text for contrast
- Prominent numbers in 6xl size
- Rounded corners (1.5rem)
- Soft, large shadows for depth

**Example**: Rent due card, wallet balance card

### Standard Cards
**Design**:
- White backgrounds with subtle borders
- Larger border radius (1rem vs 0.5rem business)
- Softer shadows (--tenant-shadow vs business shadows)
- More breathing room (p-6 to p-8)

### Navigation (Sidebar)
**Style**:
- Gradient header icon
- Active states use gradient backgrounds (not just blue highlight)
- Larger nav items with more padding
- Rounded corners on nav items (rounded-xl)
- Consumer-friendly spacing

### Buttons
**Primary Actions**:
- Often use gradient backgrounds for major CTAs
- White text when on gradients
- Larger sizes (h-14 for hero actions vs h-10 standard)
- More rounded (rounded-xl vs rounded-lg)

**Secondary Actions**:
- Outline style with subtle borders
- Hover states feel responsive
- Icons paired with text for clarity

### Input Fields
**Design**:
- Larger height (h-14 for important inputs)
- Bigger text (text-xl for amounts)
- Clear labels with helpful hints
- Rounded corners (rounded-xl)

### Dialogs/Modals
**Style**:
- Rounded corners (rounded-2xl)
- Larger text throughout
- Gradient primary buttons
- More padding and breathing room

---

## Shadows & Elevation

**Philosophy**: Softer, more pronounced shadows than business UI to create a premium, touchable feel.

**Shadow Levels**:
- **Standard**: `0px 4px 24px rgba(149, 157, 165, 0.12)`
- **Large**: `0px 8px 32px rgba(149, 157, 165, 0.18)`
- **Extra Large**: `0px 16px 48px rgba(149, 157, 165, 0.24)`

**Usage**:
- Hero cards: Large shadows
- Standard cards: Standard shadows  
- Floating elements: Extra large shadows

---

## Border Radius

**Key Differentiator**: Much more rounded than business UI

- **Cards**: 1.5rem (24px) for hero cards, 1rem (16px) for standard
- **Buttons**: rounded-xl (0.75rem/12px)
- **Inputs**: rounded-xl (0.75rem/12px)
- **Nav Items**: rounded-xl (0.75rem/12px)
- **Dialogs**: rounded-2xl (1rem/16px)

**Comparison**: Business uses 0.5rem (8px) standard radius

---

## Page-Specific Layouts

### Home
- Hero rent card with gradient background
- Recent payments list with subtle cards
- Quick action grid (2 columns)
- Emphasis on clarity and next actions

### Wallet
- Hero balance card with pink gradient
- Yield earnings stats (if opted in)
- Deposit/withdraw buttons prominent
- Clean, simple settings toggle

### Assistant
- Preset prompts in organized categories
- Clean chat interface
- Message bubbles with gradients for user messages
- Friendly, approachable tone

### Reports
- Simple summary stats
- Clean list of receipts
- Easy download buttons
- No complex tables or charts

### Settings
- Form-based layout
- Clear sections with icons
- Inline editing
- Helpful descriptions

---

## Responsive Strategy

**Breakpoints**:
- Mobile: < 768px - Single column, full-width cards
- Tablet: 768px - 1024px - Some 2-column grids
- Desktop: > 1024px - Max width container, preserve mobile feel

**Mobile-First Adaptations**:
- Hero cards stack beautifully
- Large touch targets (minimum 44px)
- Readable text sizes on small screens
- Bottom navigation option for mobile (future)

---

## Micro-interactions

**Philosophy**: Smooth, delightful, but subtle

- **Hover States**: Gentle elevation with hover-elevate utility
- **Active States**: Clear feedback with active-elevate-2
- **Loading**: Skeleton screens with pulsing animation
- **Transitions**: Fast and smooth (200ms)
- **Success**: Toasts with friendly messages

---

## Accessibility

- Semantic HTML throughout
- ARIA labels for all interactive elements
- Keyboard navigation fully supported
- Color contrast meets WCAG AA
- Focus indicators clear and visible
- Touch targets minimum 44px on mobile

---

## Key Differences from Business UI

| Aspect | Tenant Portal | Business Console |
|--------|--------------|------------------|
| **Typography** | 5xl headers, larger overall | 3xl/4xl headers, professional |
| **Colors** | Gradients, soft palette | Solid blue, institutional |
| **Border Radius** | 1rem-1.5rem, very rounded | 0.5rem, subtle rounding |
| **Shadows** | Soft, pronounced | Minimal, subtle |
| **Spacing** | Generous, breathing room | Efficient, compact |
| **Cards** | Hero gradient cards | Standard bordered cards |
| **Feel** | Approachable, friendly | Professional, precise |
| **Target** | Consumer residents | Business property managers |

---

## Implementation Notes

### CSS Variables
All tenant-specific variables are prefixed with `--tenant-` and scoped under `.tenant-portal` class.

### Component Usage
- Use standard Shadcn components as base
- Apply inline styles for tenant-specific colors when needed
- Leverage CSS variables for theming
- Maintain consistency across all pages

### Testing
- Compare side-by-side with business UI
- Verify gradients render correctly
- Check typography hierarchy on different screens
- Validate dark mode support

---

## Future Enhancements

- Custom illustrations for empty states
- Animated payment success celebrations
- Progressive web app features
- Biometric authentication (Face ID, Touch ID)
- Apple Pay integration UI
- Rent-splitting UI flows
- Roommate management interface
