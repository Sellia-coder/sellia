# Cartevo Integration — Sellia

## Overview

Sellia uses Cartevo (cartevo.co) as its payment processor for:

- **Collect**: Customer payments via Mobile Money (MTN, Orange, Wave, Moov…)
- **Payout**: Merchant withdrawals from their Sellia balance

## Architecture

```
Customer pays MoMo → Cartevo → Sellia wallet (Cartevo)
                                       ↓
                              Sellia BDD records:
                              - CartevoTransaction (COLLECT)
                              - Order.status = "paid"
                              - Shop balance += netAmount

Merchant requests payout:
                              Sellia BDD records:
                              - Payout (PENDING)
                              - Shop balance -= amount
                                       ↓
                              Sellia → Cartevo payout API
                                       ↓
                              MoMo marchand
```

## Files

- `auth.ts` — JWT token cache (1h validity)
- `client.ts` — HTTP wrapper for Cartevo API
- `types.ts` — TypeScript types
- `webhook.ts` — Webhook signature verification
- `commission.ts` — Sellia commission calculation (6% Free / 4% Pro)
- `index.ts` — Public exports

## Environment variables

```env
CARTEVO_BASE_URL=https://api.cartevo.co/api/v1
CARTEVO_CLIENT_ID=...
CARTEVO_CLIENT_KEY=...
CARTEVO_WEBHOOK_SECRET=...
CARTEVO_NOTIFY_URL=https://getsellia.com/api/webhooks/cartevo
```

## Usage examples

### Initiate a collect (customer payment)

```typescript
import { cartevoCollect } from "@/lib/cartevo";

const result = await cartevoCollect({
  operator: "mtn",
  country: "CM",
  phone_number: "237670000000",
  amount: 5000,
  currency: "XAF",
  notify_url: process.env.CARTEVO_NOTIFY_URL,
});

// result.data.transaction_id → store in CartevoTransaction
// result.data.status → INITIATED or PENDING
```

### Initiate a payout (merchant withdrawal)

```typescript
import { cartevoPayout } from "@/lib/cartevo";

const result = await cartevoPayout({
  operator: "orange",
  country: "SN",
  phone_number: "221770000000",
  amount: 25000,
  currency: "XOF",
});
```

### Check transaction status

```typescript
import { cartevoGetTransactionStatus } from "@/lib/cartevo";

const result = await cartevoGetTransactionStatus("550e8400-...");
// result.data.status → SUCCESS | FAILED | PENDING
```

### Get wallet balance (Sellia company wallet)

```typescript
import { cartevoGetBalance } from "@/lib/cartevo";

const result = await cartevoGetBalance();
// result.data.balance → solde Sellia chez Cartevo
```

## Phases

- [x] **G1 Foundation** (current): lib + types + auth cache + Prisma schema
- [ ] **G2 Collect**: UI checkout + API init + webhook receiver
- [ ] **G3 Payout**: dashboard /paiements + payout API + history

## Webhook handling

Cartevo will POST to `${CARTEVO_NOTIFY_URL}` for events like `payment.collect`.

Headers:

- `X-Webhook-Signature: sha256=<hmac>` (verify with CARTEVO_WEBHOOK_SECRET)
- `X-Webhook-Id` (use for idempotency)
- `X-Webhook-Timestamp`

Retry: 3x on 10s (must respond 2xx within 10s).

## Token caching

JWT expires every 1h. The auth module caches and auto-refreshes 5 min before expiry.
Concurrent requests are serialized (single fetch).

## Known limitations / TODO

- [ ] Wallet model: Cartevo has ONE company wallet, no sub-account per shop yet.
      Sellia tracks shop balances in its own DB.
- [ ] Payout webhook event not confirmed in docs (only payment.collect documented).
      We may need polling as fallback.
- [ ] Multi-currency: currently only XAF/XOF tested. CDF/GNF/USD TBD.
