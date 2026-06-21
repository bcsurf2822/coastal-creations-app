name: "Square Payments — Retry-stable Idempotency Keys (TypeScript/Next.js)"
description: |
  Make every Square CreatePayment call use an idempotency key that is STABLE across the
  retry window of a single payment attempt, instead of a fresh `randomUUID()` minted at
  charge time (which provides zero double-charge protection). The key is generated ONCE
  per payment-component instance on the client and threaded to the server charge.
  Small, surgical change to the money path.

## Purpose
One-pass implementation guide. The executing agent has only this PRP + codebase access.
Follow the dependency-ordered tasks and run the validation loop after each.

## Core Principles
1. **Idempotency keys only work if they're STABLE per logical request.** A new UUID per
   server invocation means a retried submit creates a SECOND payment.
2. **Generate once, reuse on retry**: one key per payment-component mount (one per
   cart/booking attempt), reused across re-tokenizations until the charge succeeds.
3. **Fail safe**: if the client omits a key, the server falls back to `randomUUID()` (today's
   behavior) — never throw on a missing key.
4. Follow `AGENTS.md`/`CLAUDE.md`: strict TS, explicit return types, log `[FILE-FUNC]`.

---

## Goal
Each of the app's `createPayment` charge paths consumes a client-supplied idempotency key
that is constant for the duration of one payment attempt, so a lost-response retry returns
the ORIGINAL payment rather than charging twice.

**Deliverable:**
- `submitPayment` server action accepts `idempotencyKey` and uses it for `createPayment`.
- `/api/store/checkout` accepts `idempotencyKey` in the body and uses it.
- Gift-card purchase (`/api/gift-cards` → `createAndActivateGiftCard`) uses a client key for
  its payment step.
- The 3 client charge surfaces generate ONE key per mount (`useState(() => crypto.randomUUID())`)
  and pass it through.
- A bounded-string validation helper; fallback to `randomUUID()` when absent.

**Success Definition:** Re-submitting the same payment attempt (same component instance,
e.g. a retried network call) reuses the same idempotency key, and Square returns the original
payment (no second charge) — verified in sandbox. Unit tests assert the server uses the
provided key. `pnpm test:run && pnpm lint && pnpm build` green; normal payments unchanged.

## Why
- Today every charge does `idempotencyKey: randomUUID()` AT THE POINT OF CHARGE
  (`app/actions/actions.ts:179`, `app/api/store/checkout/route.ts:118`,
  `lib/square/gift-cards.ts:136`). If Square captures the payment but the response is lost
  and the buyer retries, a new UUID is generated → **double charge**.
- Square's CreatePayment is idempotent ONLY when the SAME key is reused. This change makes
  the existing keys actually do their job.

## What
Thread a stable key from client → server charge. No user-visible change. Backend behavior:
identical success path, plus correct dedupe on retry.

### Success Criteria
- [ ] `submitPayment(sourceId, billingDetails, booking, idempotencyKey?)` uses the provided key.
- [ ] `/api/store/checkout` reads `idempotencyKey` from body and uses it for `createPayment`.
- [ ] Gift-card purchase passes a client key into the payment step of `createAndActivateGiftCard`.
- [ ] `components/store/CheckoutForm.tsx`, `components/payment/Payment.tsx` (+ `PaymentProcessor`),
      `components/reservations/PaymentForm.tsx`, `components/gift-cards/GiftCardPurchase.tsx`
      each generate ONE key per mount and pass it.
- [ ] Missing/blank key → server falls back to `randomUUID()` (no throw).
- [ ] Sandbox double-submit with the same key → ONE charge.
- [ ] `pnpm test:run && pnpm lint && pnpm build` pass; no behavior change on the happy path.

## All Needed Context

### Documentation & References
```yaml
# MUST READ
- url: https://developer.squareup.com/docs/build-basics/common-api-patterns/idempotency
  why: Official idempotency semantics.
  critical: Same idempotency key + same/compatible request → returns the ORIGINAL result, no
            re-charge. Keys are unique per LOGICAL operation, max 45 chars for payments-style
            calls (a UUID v4 string is 36 chars — fine). A new key = a new payment.
- url: https://developer.squareup.com/reference/square/payments-api/create-payment
  section: idempotency_key
  critical: Reusing a key replays the prior response; changing it creates a new payment.

# CODEBASE — exact charge sites to change (use these line refs)
- file: app/actions/actions.ts
  why: submitPayment (line ~179 `idempotencyKey: randomUUID()`). ADD an idempotencyKey param
       (after `booking`) and use it. Keep randomUUID() fallback. This action is called by
       components/payment/Payment.tsx AND components/reservations/PaymentForm.tsx.
- file: app/api/store/checkout/route.ts
  why: createPayment at line ~118. ADD `idempotencyKey` to CheckoutRequest, use it (fallback randomUUID).
- file: lib/square/gift-cards.ts
  why: createAndActivateGiftCard — payment step idempotencyKey at line ~136. Accept an optional
       paymentIdempotencyKey param; keep randomUUID() for the order/create/activate steps.
- file: app/api/gift-cards/route.ts
  why: POST handler that calls createAndActivateGiftCard — thread idempotencyKey from body.

# CODEBASE — client charge surfaces (generate ONE key per mount, pass through)
- file: components/store/CheckoutForm.tsx
  why: handlePayment posts to /api/store/checkout. Add idempotencyKey to the body. Generate via
       useState(() => crypto.randomUUID()). REGENERATE only after a SUCCESSFUL order (so a new
       cart attempt gets a new key) — clearCart already runs on success.
- file: components/payment/Payment.tsx
  why: handleSubmitPayment calls submitPayment(...). Generate one key per mount; pass as the new arg.
- file: components/payment/PaymentProcessor.tsx
  why: Calls props.submitPayment(token, paymentData). If the key is owned by Payment.tsx, no change
       needed here beyond confirming the wrapper forwards it. (Payment.tsx’s handleSubmitPayment is
       the function passed down; it can close over the key.)
- file: components/reservations/PaymentForm.tsx
  why: Calls submitPayment(...) directly. Generate one key per mount; pass it.
- file: components/gift-cards/GiftCardPurchase.tsx
  why: Posts to /api/gift-cards. Add idempotencyKey to the body.

# CODEBASE — patterns
- file: lib/checkout/storePricing.ts
  why: Example of a small server-side lib helper + PriceIntegrityError style (for the validator helper).
- file: __tests__/checkout/eventPricing.test.ts
  why: vitest pure-fn test pattern to mirror for the idempotency-key validator test.
```

### Current Codebase tree (relevant)
```bash
app/actions/actions.ts                 # submitPayment — ADD idempotencyKey param
app/api/store/checkout/route.ts        # ADD idempotencyKey to body + use it
app/api/gift-cards/route.ts            # thread idempotencyKey to service
lib/square/gift-cards.ts               # createAndActivateGiftCard — accept payment key
lib/checkout/                          # CREATE idempotency.ts helper (validate/normalize key)
components/
  store/CheckoutForm.tsx               # generate + send key
  payment/Payment.tsx                  # generate + pass key (owns handleSubmitPayment)
  reservations/PaymentForm.tsx         # generate + pass key
  gift-cards/GiftCardPurchase.tsx      # generate + send key
```

### Desired Codebase tree (new files + responsibility)
```bash
lib/checkout/idempotency.ts            # normalizeIdempotencyKey(input?: string): string
                                       #   - returns input if a sane string (<=45 chars), else randomUUID()
```

### Known Gotchas
```ts
// CRITICAL: The whole point is STABILITY. Generate the key with
//   const [idempotencyKey] = useState(() => crypto.randomUUID());
//   NOT inside the submit handler (that regenerates per click) and NOT on the server.
// CRITICAL: Card tokens (sourceId) are single-use — a retry RE-tokenizes (new sourceId). The
//   idempotency key must NOT be derived from the token; it must persist across re-tokenizations
//   within the same attempt. That's exactly why it lives in component state, tied to the ORDER
//   attempt, not the token.
// CRITICAL: After a SUCCESSFUL charge, the key must rotate before a NEW unrelated attempt, or a
//   second genuine purchase would be deduped to the first. For store: clearCart() + unmount on
//   redirect handles it. For bookings: the page navigates to success (unmount) → fresh mount → fresh key.
// GOTCHA: Square idempotency key max length is 45 chars for payment calls; UUID v4 = 36. OK.
//   The normalize helper must reject over-long/garbage client input and fall back to randomUUID().
// GOTCHA: crypto.randomUUID() is available in modern browsers over HTTPS (Secure Context) and in
//   Node 18+ (server fallback import { randomUUID } from "crypto"). Both are already used in repo.
// NOTE: Only the createPayment calls need the stable key for the double-charge fix. The order/
//   gift-card create/activate/customer calls can keep randomUUID() — they're not money-movement
//   double-charge risks (or are already guarded by Square order semantics).
```

## Implementation Blueprint

### Tasks (in order)
```yaml
Task 1 — CREATE lib/checkout/idempotency.ts:
  EXPORT normalizeIdempotencyKey(input?: string): string
    - if typeof input === "string" && input.trim().length > 0 && input.length <= 45 → return input
    - else → return randomUUID()  (import { randomUUID } from "crypto")
  Pure, server-safe.

Task 2 — MODIFY app/actions/actions.ts:
  ADD 4th param `idempotencyKey?: string` to submitPayment(sourceId, billingDetails, booking, idempotencyKey?).
  REPLACE `idempotencyKey: randomUUID()` in createPayment with
          `idempotencyKey: normalizeIdempotencyKey(idempotencyKey)`.
  (Leave logPaymentError untouched.)

Task 3 — MODIFY app/api/store/checkout/route.ts:
  ADD `idempotencyKey?: string` to CheckoutRequest. In createPayment use
      normalizeIdempotencyKey(body.idempotencyKey) instead of randomUUID().

Task 4 — MODIFY lib/square/gift-cards.ts + app/api/gift-cards/route.ts:
  createAndActivateGiftCard(amountCents, sourceId?, customerId?, paymentIdempotencyKey?):
    use normalizeIdempotencyKey(paymentIdempotencyKey) for the PAYMENT step (line ~136);
    keep randomUUID() for order/create/activate steps.
  Route POST: EXTEND the GiftCardPurchaseRequest interface (app/api/gift-cards/route.ts ~line 27)
    with `idempotencyKey?: string`, read body.idempotencyKey, and pass it through to the service.

Task 5 — MODIFY the 4 client surfaces to generate + pass ONE key per mount:
  components/store/CheckoutForm.tsx:
    const [idempotencyKey] = useState(() => crypto.randomUUID());
    include idempotencyKey in the /api/store/checkout body.
  components/payment/Payment.tsx:
    const [idempotencyKey] = useState(() => crypto.randomUUID());
    pass as the 4th arg of submitPayment inside handleSubmitPayment.
  components/reservations/PaymentForm.tsx:
    const [idempotencyKey] = useState(() => crypto.randomUUID());
    pass as the 4th arg of submitPayment.
  components/gift-cards/GiftCardPurchase.tsx:
    const [idempotencyKey] = useState(() => crypto.randomUUID());
    include in the /api/gift-cards body.

Task 6 — TEST:
  __tests__/checkout/idempotency.test.ts — unit-test normalizeIdempotencyKey:
    returns the input when valid; returns a UUID when undefined/empty/over-45-chars.
```

### Per-task pseudocode
```ts
// lib/checkout/idempotency.ts
import { randomUUID } from "crypto";
export function normalizeIdempotencyKey(input?: string): string {
  if (typeof input === "string") {
    const k = input.trim();
    if (k.length > 0 && k.length <= 45) return k;
  }
  return randomUUID();
}

// app/actions/actions.ts (signature + use)
export async function submitPayment(sourceId, billingDetails, booking?, idempotencyKey?: string) {
  // ...recompute charge (unchanged)...
  const result = await paymentsApi.createPayment({
    idempotencyKey: normalizeIdempotencyKey(idempotencyKey),  // was randomUUID()
    sourceId, /* ...unchanged... */
  });
}

// components/store/CheckoutForm.tsx
const [idempotencyKey] = useState(() => crypto.randomUUID());
// in handlePayment body: { paymentToken: token, /* ... */, idempotencyKey }
```

### Integration Points
```yaml
SERVER:
  - app/actions/actions.ts: submitPayment new optional 4th arg (back-compatible).
  - app/api/store/checkout/route.ts: CheckoutRequest.idempotencyKey (optional).
  - lib/square/gift-cards.ts + app/api/gift-cards/route.ts: optional payment key.
CLIENT:
  - 4 components generate one key per mount via useState initializer.
```

## Validation Loop

### Level 1: Types, lint, unit
```bash
npx tsc --noEmit 2>&1 | grep -vE "^__tests__" | grep -E "actions|checkout|gift-cards|idempotency"   # expect empty
pnpm test:run -- idempotency       # the new unit test passes
pnpm lint
```

### Level 2: Happy path unchanged
```bash
pnpm test:run                      # full suite still green (no regressions)
```

### Level 3: Integration — sandbox double-charge prevention
```bash
# SQUARE_ENVIRONMENT=sandbox. On /checkout (and a booking), complete a payment, then simulate a
# lost-response retry of the SAME attempt (e.g. resend the same request body incl. idempotencyKey
# via the network panel, or trigger a retry without re-mounting). Confirm in the Square sandbox
# dashboard that only ONE payment exists for that idempotency key.
```

## Final validation checklist
- [ ] `normalizeIdempotencyKey` unit test passes (valid passthrough + fallback).
- [ ] All 3 server charge paths use the normalized key; randomUUID() fallback retained.
- [ ] 4 client surfaces generate one key per mount and send it.
- [ ] Sandbox: same-key resubmit yields ONE payment.
- [ ] `pnpm test:run && pnpm lint && pnpm build` green; happy path unchanged.

## Anti-Patterns to Avoid
- ❌ Don't generate the key in the submit handler or on the server — it must be per-attempt stable.
- ❌ Don't derive the key from the card token (sourceId) — tokens are single-use; retries re-tokenize.
- ❌ Don't throw when the client omits a key — fall back to randomUUID().
- ❌ Don't reuse one key across genuinely different purchases — rotate on success (unmount/clearCart).
- ❌ Don't change the order/create/activate idempotency keys — only the createPayment charge matters here.

## Confidence: 9/10 for one-pass success
Small, well-bounded, mirrors existing patterns; the only nuance is "generate once per mount,"
which the gotchas call out explicitly. Sandbox double-submit is the definitive proof.
