# Ticket 07 — Shippo Account Setup (dev now → prod cutover)

> Operational checklist for standing up Shippo. Split into **what the developer does now** (dev,
> test mode) and **what's needed before go-live** (prod, real postage). Pairs with `06-hardening.md`.
> Docs: https://docs.goshippo.com/

## Shippo App vs Shippo API

- **Shippo App** (Starter / Pro plans) = the goshippo.com **web dashboard** for making labels by
  hand. Not how this app works.
- **Shippo API** (API plan) = **programmatic** access used by our code (`lib/shippo/`, the `shippo`
  Node SDK). **Choose the API plan.** Free tier caps at ~30 labels/month — fine to start; revisit
  if volume grows.
- Choosing API still includes the dashboard (to view shipments, connect carriers, set webhooks).

## One account, two tokens

A single Shippo account exposes **both** tokens (Settings → API):

| Token | Mode | Behavior | Used in |
|---|---|---|---|
| `shippo_test_...` | Test | Fake labels, **no charge**, test carriers auto-enabled | local dev / preview |
| `shippo_live_...` | Live | Real labels, **real postage charged**, needs carrier accounts + billing | production |

Switching modes is purely a matter of which token is in `SHIPPO_API_KEY`. **Two accounts are NOT needed.**

## Env vars (code reads these)

| Var | Value | Needed when |
|---|---|---|
| `SHIPPO_API_KEY` | test token now, live token in prod | **now** (dev) |
| `SHIPPO_WEBHOOK_SECRET` | matches secret set in Shippo dashboard webhook | later (delivery webhook) |

> Code standardizes on `SHIPPO_API_KEY` (the original `INITIAL.md` wrote `SHIPPO_API_TOKEN` —
> ignore that name). Set in `.env` for dev; in Vercel prod env for production.

## ✅ Do now (developer, dev / test mode)

1. Sign up at goshippo.com → choose the **API** plan.
2. Settings → API → copy the **Test Token** (`shippo_test_...`).
3. Add to `.env`:
   ```
   SHIPPO_API_KEY=shippo_test_xxxxxxxxxxxxxxxxxxxx
   ```
4. `pnpm dev` → run a test checkout → confirm live **test** rates return and a label PDF +
   test tracking number are minted. ✅ **Verified working** (USPS Ground Advantage test label).
5. **No carrier accounts or billing needed in test mode** — Shippo auto-provides a test **USPS**
   account. Also set `MERCHANT_SHIP_FROM_*` env incl. **phone + email** (USPS rejects labels
   without both).

That is the entire dev setup. Everything in tickets 03–05 can be built and tested against this.

> ⚠️ **Carrier caveat (test and prod):** Shippo can **return** UPS/FedEx rates even when their
> labels can't be **purchased** (account not activated). In test mode only USPS labels buy
> successfully. Until UPS/FedEx are connected, the rates endpoint should filter to **purchasable
> carriers only** (USPS), or a customer can select a rate whose label later fails. Tracked as an
> open item in `00-STATUS.md` and `03`.

## 🚀 Before go-live (production cutover)

The production account must hold the **merchant's** billing + carriers, because postage is charged
to it and live UPS/FedEx rates require the merchant's carrier accounts. Steps:

1. **Account ownership** — production Shippo account belongs to the merchant, with a **payment
   method** added for postage.
2. **Connect carriers** — add the merchant's **UPS** and **FedEx** accounts in the Shippo dashboard
   (Settings → Carriers). Live UPS/FedEx rates won't return without this. (Spec: UPS + FedEx only.)
3. **Generate the live token** (`shippo_live_...`) from that account.
4. **Set prod env** in Vercel: `SHIPPO_API_KEY=shippo_live_...`.
5. **Webhook** — register `https://<prod-domain>/api/webhooks/shippo` in the Shippo dashboard
   (Settings → Webhooks) for tracking events, and set `SHIPPO_WEBHOOK_SECRET` in both Shippo and
   Vercel to match (see `06-hardening.md` #3).
6. **Smoke test** one real order end-to-end before announcing the store.

## Division of labor

| Task | Owner |
|---|---|
| Sign up, API plan, test token, integration code, webhook wiring | Developer (now) |
| Prod account billing + UPS/FedEx carrier accounts | Merchant (before launch) |
| Live token → Vercel env, prod smoke test | Developer (with the merchant's account) |
