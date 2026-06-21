name: "Square Node SDK — migrate server code off `square/legacy` to v44 native (TypeScript/Next.js)"
description: |
  Replace the legacy Square client (`import { Client, Environment } from "square/legacy"` +
  `squareClient.paymentsApi.createPayment`, etc.) with the modern v44 client
  (`import { SquareClient, SquareEnvironment } from "square"` + `client.payments.create`)
  across the 8 server files that touch Square. Server-only: the client Web Payments SDK
  (`react-square-web-payments-sdk`) is untouched. Standalone PR; verify every flow in
  Square SANDBOX before prod. This is modernization, NOT a deadline — `square/legacy` is
  supported indefinitely.

## Purpose
One-pass implementation guide. The executing agent has only this PRP + codebase access +
the verified method-mapping doc. Migrate file-by-file, lowest-risk first, run the
validation loop after EACH file.

## Core Principles
1. **The method-mapping doc is authoritative**: `PRPs/ai_docs/square-v44-migration.md` has the
   VERIFIED legacy→v44 name table (checked against installed `square@44.1.0`). Use it.
2. **`.result.` is the trap**: v44 returns payloads directly. Every `response.result.X` must
   become `response.X`. Grep each migrated file for residual `.result.` (Square ones).
3. **Charge paths last**: migrate read-only services (catalog/customers) first to prove the
   pattern, then gift cards, then money movement (payments/refunds) with sandbox verification.
4. **Preserve the `submitPayment` external contract** so client components don't change
   (see Gotchas). Keep the migration server-contained.
5. Follow `AGENTS.md`/`CLAUDE.md`: strict TS (no `any`), explicit return types, log `[FILE-FUNC]`.

---

## Goal
All server Square calls use the v44 native client; `square/legacy` and `ApiError` no longer
appear in app code; every payment/refund/gift-card/catalog/customer flow works identically,
proven in sandbox.

**Deliverable:**
- Each of the 8 files constructs `new SquareClient({ token, environment: SquareEnvironment.* })`.
- Every legacy method call swapped per the mapping doc; every `.result.` access fixed.
- `ApiError` → `SquareError` in `lib/square/catalog.ts` and `lib/square/gift-cards.ts`.
- `submitPayment` keeps returning a `{ result: { payment } }`-shaped object (adapter) so
  `Payment.tsx`/`PaymentForm.tsx` reading `result.result?.payment?.status` are unchanged.
- Dead/duplicate files resolved: `app/api/payments/route.ts` (no live caller) and
  `lib/square/products.ts` (duplicate of catalog.ts) — migrate OR delete with a note.

**Success Definition:** In SANDBOX, all of these succeed unchanged: event booking charge,
reservation charge, store checkout charge, refund, gift-card purchase, gift-card
balance/redeem, store catalog listing + product detail + inventory. `grep -rn "square/legacy"
app components lib` returns nothing. `pnpm test:run && pnpm lint && pnpm build` green.

## Why
- One client shape + native types + auto-pagination; removes the legacy compat layer and the
  stray transitive `square@39.1.1` pulled via the legacy alias.
- Aligns with Square's current SDK direction (legacy is frozen at the old surface).
- NOT urgent: do it when convenient, isolated from other work, because it rewrites money code.

## What
Pure server-side refactor. No user-visible change, no API contract change, no client change.

### Success Criteria
- [ ] `grep -rn "square/legacy" app components lib scripts` → empty.
- [ ] `grep -rn "ApiError" app lib` → empty (replaced by SquareError).
- [ ] No residual Square `.result.` access in migrated files.
- [ ] `submitPayment` return shape unchanged (clients untouched); `Payment.tsx`/`PaymentForm.tsx`
      still read `result.result?.payment?.status` successfully.
- [ ] Sandbox: booking charge, reservation charge, store checkout, refund, gift-card
      purchase+redeem, catalog list + detail + inventory ALL work.
- [ ] `pnpm test:run && pnpm lint && pnpm build` pass.

## All Needed Context

### Documentation & References
```yaml
# MUST READ — the verified mapping (most important doc)
- docfile: PRPs/ai_docs/square-v44-migration.md
  why: VERIFIED legacy→v44 method table (checked vs installed square@44.1.0), client
       construction, response/.result change, ApiError→SquareError, pagination, BigInt note,
       and the NON-OBVIOUS reshapes (giftCards.activities nested; catalog.object.get;
       inventory.batchGetCounts; getFromGan). READ THIS FIRST.

- url: https://developer.squareup.com/docs/sdks/nodejs/migration
  why: Official migration guide (client construction, named params, dual-import legacy+new).
- url: https://github.com/square/square-nodejs-sdk/blob/master/README.md
  why: Canonical v44 usage — SquareClient, resource methods, SquareError, pagination, .withRawResponse().
- docfile: PRPs/ai_docs/square-catalog-legacy-sdk.md
  why: The CURRENT (legacy) catalog/inventory behavior + object shapes + gotchas (BigInt money,
       VARIABLE_PRICING, trackInventory, location overrides, related-objects-one-level). The v44
       calls return the SAME object shapes — only the wrapper (.result) and method names change.

# CODEBASE — files to migrate (read each fully before editing). Use the mapping doc per call.
- file: lib/square/customers.ts
  why: customersApi.{searchCustomers,createCustomer,retrieveCustomer,updateCustomer,deleteCustomer}
       → client.customers.{search,create,get,update,delete}. Lowest-risk; migrate FIRST to prove pattern.
- file: lib/square/catalog.ts
  why: catalogApi.{searchCatalogObjects,batchRetrieveCatalogObjects,retrieveCatalogObject,listCatalog}
       + inventoryApi.batchRetrieveInventoryCounts + ApiError. Note: retrieveCatalogObject →
       client.catalog.object.get; batchRetrieve → client.catalog.batchGet; inventory →
       client.inventory.batchGetCounts. Keep the do/while cursor loops, drop .result.
- file: lib/square/products.ts
  why: Duplicate/older catalog reader. CONFIRM if still imported anywhere
       (grep "from \"@/lib/square/products\"") — if dead, DELETE instead of migrating; if used, migrate.
- file: lib/square/gift-cards.ts
  why: giftCardsApi.* + giftCardActivitiesApi.* + ordersApi.createOrder + paymentsApi.createPayment.
       CRITICAL: giftCardActivities is NESTED → client.giftCards.activities.create/.list.
       retrieveGiftCardFromGAN → client.giftCards.getFromGan; retrieveGiftCard → client.giftCards.get.
- file: app/api/refunds/route.ts
  why: refundsApi.refundPayment → client.refunds.refundPayment. Charge-adjacent — migrate after reads.
- file: app/actions/actions.ts
  why: paymentsApi.createPayment → client.payments.create. Imports legacy types ApiResponse +
       CreatePaymentResponse — replace. ADAPTER REQUIRED: this action returns to client components
       that read `.result.payment` — wrap the v44 `{ payment }` back into `{ result: { payment } }`
       (or change the return type AND update Payment.tsx/PaymentForm.tsx). Prefer the adapter.
- file: app/api/store/checkout/route.ts
  why: paymentsApi.createPayment → client.payments.create; reads payment via .result.payment → .payment.
- file: app/api/payments/route.ts
  why: paymentsApi.createPayment. DEAD route (no live client caller — confirm via grep). Migrate or delete.

# CODEBASE — contract consumers to NOT break
- file: components/payment/Payment.tsx
  why: handleSubmitPayment reads result.result?.payment?.status/.id/.receiptUrl/.amountMoney. If you
       keep the submitPayment adapter shape, NO change here. If you change the shape, update here + below.
- file: components/payment/PaymentProcessor.tsx
  why: Reads result.result.payment.* extensively. Same contract concern.
- file: components/reservations/PaymentForm.tsx
  why: Reads paymentResult.result?.payment?.status/.id. Same contract concern.
- file: lib/square/payment-config.ts (if present) / app/api/payment-config/route.ts
  why: Only reads env vars — NO Square client; do not touch.

# CODEBASE — patterns
- file: lib/utils/moneyHelpers.ts
  why: moneyAmountToCents(bigint) — BigInt handling UNCHANGED in v44 (amounts still bigint).
- file: __tests__/checkout/storePricing.test.ts
  why: Shows how Square modules are MOCKED in tests (vi.mock("@/lib/square/catalog")). After migration,
       internal implementation changes but the EXPORTED function signatures must stay identical so
       these mocks/tests keep working.
```

### Current Codebase tree (Square server surface)
```bash
app/actions/actions.ts                 # payments.create (returns to client — adapter!)
app/api/store/checkout/route.ts        # payments.create
app/api/payments/route.ts              # payments.create (DEAD — confirm, migrate or delete)
app/api/refunds/route.ts               # refunds.refundPayment
lib/square/customers.ts                # customers.*
lib/square/catalog.ts                  # catalog.* + inventory.* + ApiError→SquareError
lib/square/products.ts                 # catalog.* (duplicate — confirm dead → delete)
lib/square/gift-cards.ts               # giftCards.* + giftCards.activities.* + orders.* + payments.*
```

### Desired Codebase tree
```bash
# No NEW files. Optionally CREATE lib/square/client.ts:
lib/square/client.ts                   # OPTIONAL: export a single configured SquareClient factory
                                       # (getSquareClient()) to stop each file re-constructing it.
                                       # Reduces the 8 duplicated `new SquareClient(...)` blocks to one.
```

### Known Gotchas
```ts
// CRITICAL (the adapter): submitPayment is a Next server action whose RESULT is consumed by
//   client components reading result.result?.payment. v44 returns { payment } (no .result). To
//   keep the migration server-contained, wrap before returning:
//     const res = await client.payments.create({...});
//     return { result: { payment: res.payment } } as ...;  // preserve legacy-shaped contract
//   (Type it explicitly; do NOT import the legacy ApiResponse type. A small local interface or
//    the existing PaymentResult shape the components already use is enough.)
// CRITICAL: giftCardActivities is client.giftCards.activities (NESTED). There is no
//   client.giftCardActivities. lib/square/gift-cards.ts uses BOTH today.
// CRITICAL: catalog single-object retrieve is client.catalog.object.get({ objectId, includeRelatedObjects }),
//   NOT client.catalog.get. Batch is client.catalog.batchGet. Inventory is client.inventory.batchGetCounts.
// CRITICAL: drop EVERY Square `.result.` — payment = res.payment; objects = res.objects;
//   cursor = res.cursor; counts = res.counts; giftCard = res.giftCard; customer = res.customer; etc.
// CRITICAL: ID-by-path methods take an OBJECT now: client.customers.get({ customerId }),
//   client.giftCards.get({ giftCardId }), client.catalog.object.get({ objectId }).
// GOTCHA: ApiError → SquareError (import from "square"). Error body differs — use e.statusCode +
//   e.message (+ e.body) instead of e.result?.errors?.[0]?.detail. Update both catch sites.
// GOTCHA: list-style methods (catalog.list, giftCards.list, giftCards.activities.list) return a
//   PAGER (async iterable). searchCatalogObjects/batchGet/batchGetCounts return a single response
//   with .cursor — keep the existing do/while(cursor) loops (just drop .result).
// GOTCHA: BigInt money UNCHANGED — keep BigInt(totalCents) on writes and Number()/moneyHelpers on reads.
// GOTCHA: Keep EXPORTED function signatures identical (e.g. squareCustomerService methods,
//   listCatalogItems, getInventoryCounts, giftCardService methods) so callers + test mocks don't change.
// GOTCHA: SQUARE_ENVIRONMENT switch stays the same string ("sandbox"); only Environment →
//   SquareEnvironment and the enum member names (Production/Sandbox) carry over.
```

## Implementation Blueprint

### Tasks (lowest-risk first; validate after EACH)
```yaml
Task 0 — PREP:
  - Read PRPs/ai_docs/square-v44-migration.md end to end.
  - grep -rn "from \"@/lib/square/products\"" → decide products.ts migrate-vs-delete.
  - grep -rn "/api/payments" app components → confirm app/api/payments/route.ts is dead.
  - OPTIONAL: create lib/square/client.ts (getSquareClient factory) to centralize construction.

Task 1 — lib/square/customers.ts (read/write, no charge):
  - new SquareClient(...) ; customersApi.* → client.customers.{search,create,get,update,delete}
  - get/update/delete take { customerId }. Drop .result. Keep findOrCreateCustomer signature.

Task 2 — lib/square/catalog.ts (read-only storefront):
  - catalogApi.searchCatalogObjects → client.catalog.search (keep cursor loop, drop .result)
  - catalogApi.batchRetrieveCatalogObjects → client.catalog.batchGet
  - catalogApi.retrieveCatalogObject(id, true) → client.catalog.object.get({ objectId: id, includeRelatedObjects: true })
  - catalogApi.listCatalog(cursor,"CATEGORY") → client.catalog.list({ types: "CATEGORY" }) (pager OR keep manual)
  - inventoryApi.batchRetrieveInventoryCounts → client.inventory.batchGetCounts
  - ApiError → SquareError. Keep listCatalogItems/retrieveCatalogItem/getInventoryCounts signatures.

Task 3 — lib/square/products.ts:
  - If dead: DELETE (note in PR). Else mirror Task 2 changes.

Task 4 — lib/square/gift-cards.ts:
  - giftCardsApi.{createGiftCard,retrieveGiftCardFromGAN,retrieveGiftCard,listGiftCards}
      → client.giftCards.{create,getFromGan,get,list}
  - giftCardActivitiesApi.{createGiftCardActivity,listGiftCardActivities}
      → client.giftCards.activities.{create,list}
  - ordersApi.createOrder → client.orders.create ; paymentsApi.createPayment → client.payments.create
  - ApiError → SquareError. Drop .result everywhere. Keep all giftCardService method signatures.

Task 5 — app/api/refunds/route.ts:
  - refundsApi.refundPayment → client.refunds.refundPayment ; drop .result.

Task 6 — app/api/store/checkout/route.ts:
  - paymentsApi.createPayment → client.payments.create ; payment = res.payment (drop .result).

Task 7 — app/actions/actions.ts (charge + ADAPTER):
  - Replace legacy import + types. client.payments.create.
  - Return { result: { payment: res.payment } } to preserve the client contract (see Gotchas).
  - Verify Payment.tsx / PaymentForm.tsx still read result.result?.payment unchanged.

Task 8 — app/api/payments/route.ts:
  - Confirmed dead → DELETE (preferred) or migrate identically. Note decision in PR.

Task 9 — CLEANUP:
  - grep -rn "square/legacy" app components lib scripts → empty.
  - grep -rn "ApiError" app lib → empty.
  - grep -rn "\.result\." in each migrated file → only non-Square hits remain.
  - Optionally remove the stray square-legacy alias if it’s no longer referenced.
```

### Per-task pseudocode (representative)
```ts
// lib/square/customers.ts
import { SquareClient, SquareEnvironment } from "square";
const client = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.SQUARE_ENVIRONMENT === "sandbox" ? SquareEnvironment.Sandbox : SquareEnvironment.Production,
});
const res = await client.customers.search({ query: {...}, limit: 1 });
const customers = res.customers ?? [];                 // was res.result.customers
const got = await client.customers.get({ customerId }); // was retrieveCustomer(id) → got.customer

// app/actions/actions.ts (adapter)
const res = await client.payments.create({ idempotencyKey, sourceId, amountMoney: { amount: BigInt(chargeCents), currency: "USD" }, /*...*/ });
return { result: { payment: res.payment } };           // keep legacy-shaped contract for components
```

### Integration Points
```yaml
ENV: unchanged (SQUARE_ACCESS_TOKEN, SQUARE_ENVIRONMENT, SQUARE_LOCATION_ID).
CONTRACTS: submitPayment return shape preserved via adapter; all exported lib/square/* function
           signatures preserved so callers + __tests__ mocks are untouched.
DEPS: after migration, the transitive square@39.1.1 (legacy alias) may drop — re-run pnpm install.
```

## Validation Loop

### Level 1: Per-file static checks (after each task)
```bash
npx tsc --noEmit 2>&1 | grep -vE "^__tests__" | grep -i "square\|<file you just edited>"   # expect empty
pnpm lint
```

### Level 2: Unit/mocked tests
```bash
pnpm test:run                      # storePricing.test mocks @/lib/square/catalog — must stay green.
# If a mocked module's exported signature changed, you changed too much — keep signatures identical.
```

### Level 3: SANDBOX end-to-end (REQUIRED before prod)
```bash
# SQUARE_ENVIRONMENT=sandbox, pnpm dev. Exercise and confirm each works + Square sandbox dashboard shows it:
#  1. Event booking charge (/payments?eventId=..&price=..) → payment COMPLETED, Customer saved.
#  2. Reservation charge (/reservations/<id>/payment) → payment COMPLETED.
#  3. Store checkout (/checkout) → payment COMPLETED, Order created, label attempt.
#  4. Refund (admin refund flow) → refund created.
#  5. Gift card purchase (/gift-cards) → card created/activated; balance check; redeem.
#  6. Store catalog (/store) list + product detail + inventory render correctly.
```

## Final validation checklist
- [ ] `grep -rn "square/legacy"` and `grep -rn "ApiError"` in app/lib → empty.
- [ ] No residual Square `.result.` in migrated files.
- [ ] All exported lib/square/* signatures unchanged; tests + mocks green.
- [ ] submitPayment contract preserved (client components unedited and working).
- [ ] All 6 sandbox flows pass.
- [ ] `pnpm test:run && pnpm lint && pnpm build` green.

## Anti-Patterns to Avoid
- ❌ Don't blind find/replace — giftCardActivities (nested), catalog.object.get, inventory.batchGetCounts,
     getFromGan are reshapes a naive swap gets wrong.
- ❌ Don't forget to drop `.result.` — it’s the most common missed change.
- ❌ Don't change exported function signatures — it breaks callers and the test mocks.
- ❌ Don't change submitPayment's return shape without updating ALL three client readers — prefer the adapter.
- ❌ Don't ship without the full SANDBOX pass — this is money code.
- ❌ Don't bundle this with the CSP or idempotency PRPs — keep it an isolated PR.

## Confidence: 7.5/10 for one-pass success
Mechanical and well-mapped (verified names + per-file plan), but it rewrites every money path,
so the score reflects the breadth (8 files) and the `.result`/reshape traps. The verified mapping
doc + per-file validation + mandatory sandbox pass are what make one-pass realistic.
