# USD-First Migration Guide

## Overview
This guide documents the changes needed to transform all user-facing interfaces to emphasize USD-first experience with stablecoins as invisible backend infrastructure.

## Core Messaging Changes

### ✅ **From**: "NUSD Balance" 
### ✅ **To**: "USD Balance"

Users should never see "NUSD" in the main UI. It's an internal accounting unit only.

### ✅ **From**: "Stablecoin-backed balance"
### ✅ **To**: "USD balance (powered by stablecoin rails)"

Stablecoins are infrastructure, not the product.

---

## Component-by-Component Updates

### 1. Vendor Portal (`client/src/pages/vendor-portal.tsx`)

**Current State**: Shows NUSD balances prominently, displays stablecoin allocations as primary feature

**USD-First Changes Needed**:

```typescript
// BEFORE
<CardTitle className="text-2xl font-mono">${formatCurrency(totalBalance)}</CardTitle>
<CardDescription>NUSD Balance</CardDescription>

// AFTER
<CardTitle className="text-2xl font-mono">${formatCurrency(totalBalance)} USD</CardTitle>
<CardDescription>Available Balance</CardDescription>
<p className="text-xs text-muted-foreground mt-1">
  Powered by stablecoin rails for instant settlement
</p>
```

**NUSD Explainer Card Updates**:
- Title: "How Your USD Balance Works" (not "What is NUSD?")
- Content: "You receive instant USD payments. Behind the scenes, Naltos uses stablecoins as rails for speed."
- Remove crypto jargon from main text, move to expandable "Technical Details" section

**Stablecoin Allocation Display**:
- Move to "Backend Infrastructure" collapsible section
- Label: "How your USD is backed (technical details)"
- Show: "Your $10,000 USD is backed by: 40% USDC, 35% USDT, 25% DAI"
- Not: "NUSD backed by stablecoins"

**Treasury Allocations**:
- Title: "Your Yield Earnings" (not "Treasury Products")
- Show: "Earning $0.15/day from your $10K USD balance"
- Details: "Your idle USD is deployed into T-Bills (NRF) and money markets (NRK)"

---

### 2. Merchant Portal (`client/src/pages/merchant-portal.tsx`)

**Current State**: References NUSD in transactions

**USD-First Changes Needed**:

```typescript
// BEFORE
"Tenant paid in NUSD"

// AFTER  
"Received: $20.00 USD"
<p className="text-xs text-muted-foreground">
  Settled instantly via stablecoin rails
</p>
```

**Transaction Display**:
- Amount: "$20.00 USD"
- Status: "Settled" (not "NUSD received")
- Settlement info: "2-day float earning yield"

**Settlement Preferences**:
- "When do you want your USD?" (not "NUSD redemption schedule")
- Options: "Daily USD payout", "Weekly USD payout", "Monthly USD payout"

---

### 3. Tenant Portal (Future)

**USD-First Guidelines**:
- Balance: "$150.23 USD" (not "NUSD balance")
- Cashback: "$0.12 USD earned on last rent payment"
- Merchant purchases: "Spend USD at clubhouse merchants"

---

## Exact Messaging Templates

### Vendor Payment Confirmation
```
✅ Payment Received
$10,000.00 USD

Instant payment received. Traditional Net30 due date: March 15, 2025
No fees if settled on due date.

[View Payout Options]
```

### Yield Display
```
💰 Your Yield Earnings
$1.88 USD earned this month

Your idle balance generates yield while you wait for settlement.
Powered by treasury products (T-Bills + money markets).

[Learn How It Works]
```

### "How It Works" Modal (Technical Details)
```
How Your USD Balance Works

1. You receive instant USD payments from property managers
2. Your USD sits in your account until you're ready to cash out
3. While idle, it earns yield through treasury products
4. Behind the scenes: Stablecoins (USDC/USDT/DAI) enable instant settlement
5. You receive USD to your bank via ACH, card, or crypto

Everything is denominated in USD — stablecoins are just the infrastructure.
```

### Stablecoin Backing (Collapsible Details)
```
▼ Backend Infrastructure (Technical Details)

Your $10,000 USD balance is backed 1:1 by a diversified stablecoin basket:

• $4,000 in USDC (40%)
• $3,500 in USDT (35%)
• $2,500 in DAI (25%)

These stablecoins are deployed into yield-generating treasury products:
• 50% NRF (Tokenized T-Bills): 3.5% APY
• 30% NRK (Money Market): 4.5% APY
• 20% NRC (Credit): 5.0% APY

This generates your $1.88 USD cashback per month.

Instantly redeemable 1:1 for USD at any time.
```

---

## Key Terminology Changes

| ❌ **Avoid** | ✅ **Use Instead** |
|-------------|-------------------|
| NUSD balance | USD balance |
| Stablecoin-backed | Powered by stablecoin rails |
| NUSD wallet | USD account |
| Mint NUSD | Convert to internal ledger |
| Burn NUSD | Redeem for USD |
| Crypto payment | USD payment (settled via stablecoins) |
| Blockchain transaction | Instant settlement |

---

## UI Component Priorities

### High Priority (Main User Flow)
1. ✅ Balance displays → "USD Balance"
2. ✅ Payment confirmations → "USD received"
3. ✅ Cashback displays → "$X.XX USD earned"
4. ✅ Redemption options → "Receive USD via..."

### Medium Priority (Educational)
1. ✅ "How It Works" explanations → USD-first with stablecoins as infrastructure
2. ✅ Yield analytics → "USD earnings from idle balance"
3. ✅ Treasury product displays → "How your USD earns yield"

### Low Priority (Technical Details)
1. ✅ Stablecoin allocations → Collapsible "Backend Infrastructure" section
2. ✅ NUSD references → Remove entirely or label as "Internal Ledger Unit"
3. ✅ Blockchain terminology → Replace with "instant settlement" or "automated processing"

---

## Testing Checklist

After implementing USD-first changes, verify:

- [ ] No "NUSD" visible in main UI flow
- [ ] All balances show "USD" denomination
- [ ] Stablecoins mentioned only in "How It Works" / technical sections
- [ ] Payment confirmations say "USD received" not "NUSD received"
- [ ] Redemption options framed as "Receive USD via ACH/Card/Crypto"
- [ ] Yield displays show "USD earned" not "NUSD yield"
- [ ] Educational content emphasizes USD-first, crypto as rails

---

## Migration Steps

### Phase 1: Documentation ✅ COMPLETE
- [x] Update PROJECT_OVERVIEW.md
- [x] Update replit.md
- [x] Create USD_FIRST_MIGRATION_GUIDE.md

### Phase 2: Vendor Portal
- [ ] Update balance displays to "USD Balance"
- [ ] Rewrite NUSD explainer as "How Your USD Works"
- [ ] Move stablecoin details to collapsible section
- [ ] Update redemption calculator messaging
- [ ] Update treasury allocation displays

### Phase 3: Merchant Portal
- [ ] Update transaction displays to USD-first
- [ ] Update settlement preference messaging
- [ ] Rewrite educational content

### Phase 4: Tenant Portal (Future)
- [ ] USD balance display
- [ ] USD cashback messaging
- [ ] Merchant spend in USD

### Phase 5: Testing & Validation
- [ ] End-to-end user flow testing
- [ ] Architect review
- [ ] Verify no crypto jargon in main flows

---

## Code Examples

### Balance Card (Vendor Portal)
```tsx
<Card>
  <CardHeader>
    <CardTitle className="text-sm text-muted-foreground">Available Balance</CardTitle>
    <div className="flex items-baseline gap-2">
      <span className="text-3xl font-mono">${formatCurrency(balance)} USD</span>
      <Badge variant="secondary" className="text-xs">
        Instant access
      </Badge>
    </div>
    <CardDescription className="text-xs mt-1">
      Powered by stablecoin rails for instant settlement
    </CardDescription>
  </CardHeader>
  
  <CardContent>
    <Collapsible>
      <CollapsibleTrigger className="text-xs text-muted-foreground hover:text-foreground">
        <Info className="w-3 h-3 inline mr-1" />
        Backend infrastructure details
      </CollapsibleTrigger>
      <CollapsibleContent className="text-xs text-muted-foreground mt-2 space-y-1">
        <p>Your USD is backed 1:1 by:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>40% USDC</li>
          <li>35% USDT</li>
          <li>25% DAI</li>
        </ul>
        <p className="mt-2">Instantly redeemable for USD at any time.</p>
      </CollapsibleContent>
    </Collapsible>
  </CardContent>
</Card>
```

### Yield Display (Vendor Portal)
```tsx
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <TrendingUp className="w-4 h-4" />
      Your Yield Earnings
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-mono">${formatCurrency(yieldEarned)} USD</div>
    <p className="text-sm text-muted-foreground mt-1">
      Earned from idle balance this month
    </p>
    
    <div className="mt-4 text-xs text-muted-foreground space-y-1">
      <p>Your idle USD generates yield through:</p>
      <ul className="list-disc list-inside ml-2">
        <li>Treasury bills (T-Bills)</li>
        <li>Money market funds</li>
      </ul>
      <p className="mt-2">
        Paid out as USD cashback — no crypto required.
      </p>
    </div>
  </CardContent>
</Card>
```

---

**Last Updated**: 2025-11-15  
**Status**: Phase 1 Complete, Phase 2-5 Pending  
**Next Steps**: Implement vendor portal USD-first changes
