# Ticket 06 — Hardening (config, idempotency, webhook security)

> Production-readiness cleanups for the e-commerce flow. None are user-visible but all are
> required before go-live with real money + real postage.
> Reference: `INITIAL.md` Phase 0 ("webhook security", "idempotency"), Environment Variables.

## Status

- **State**: 🟡 Partial — ship-from env done; idempotency partly done; webhook signatures remain.
- **Scope**: Config, exactly-once guarantees, webhook verification

## 1. Env-driven ship-from address ✅ DONE

- `lib/shippo/rates.ts` reads `MERCHANT_SHIP_FROM_NAME/STREET/CITY/STATE/ZIP/COUNTRY/PHONE/EMAIL`
  from env (no merchant PII hardcoded). Values live in `.env`, `.env.stage`, `.env.prod`. A
  startup `console.warn` fires if street/phone/email are missing.
- ⚠️ USPS requires **both** sender email and phone, or labels fail (`sender_info_missing`).
- TODO: add a `.env.example` documenting the full required set.

## 2. Idempotency (exactly-once under retries) 🟡 Partial

- ✅ **Label purchase** — `purchaseLabelForOrder` no-ops if `order.shippo.transactionId` is set.
- ✅ **Shipping email** — `mark_shipped` guards on `shippedAt` (no duplicate send).
- ✅ **Delivery email** — webhook guards on `deliveredAt` / status `delivered`.
- 🔴 **Order creation** — still NOT guarded against duplicate orders for the same Square payment
  (`square.paymentId` is indexed; add an upsert/lookup before create). This is the main remaining
  idempotency gap, relevant if checkout is ever retried or driven from a Square webhook.

## 3. Webhook signature verification

- **Shippo** (`app/api/webhooks/shippo/route.ts`): currently compares a `Shippo-Webhook-Secret`
  header and **skips verification entirely if the env var is unset** (logs a warning). Require the
  secret in production; reject if missing.
- **Square**: if/when auto-label moves to a Square payment webhook (ticket 03 open question), add
  `SQUARE_WEBHOOK_SIGNATURE_KEY` HMAC verification on that endpoint.

## 4. Env var audit

Confirm present and documented in `.env.example`:
```
SHIPPO_API_KEY            # note: code uses SHIPPO_API_KEY, spec wrote SHIPPO_API_TOKEN — reconcile
SHIPPO_WEBHOOK_SECRET
SQUARE_WEBHOOK_SIGNATURE_KEY   # only if Square webhook is added
MERCHANT_SHIP_FROM_*           # ship-from (see #1)
STUDIO_EMAIL / DEV_EMAIL       # already used by checkout for recipient routing
```

## 5. Test mode

- Ensure Shippo **test token** + Square **sandbox** are used in non-production; gate live keys
  behind `VERCEL_ENV === "production"` (checkout already branches recipients on this).

## Acceptance criteria

- [ ] Ship-from comes from env; `.env.example` updated.
- [ ] Replaying a Shippo webhook does not double-send delivery emails.
- [ ] Duplicate payment notifications do not create duplicate orders.
- [ ] Shippo webhook rejects unsigned/mismatched requests in production.
- [ ] `pnpm lint` + `pnpm build` pass; TS strict respected.
