# Archive — completed & superseded planning docs

Planning/spec docs for work that is **done, merged, or superseded** are parked here so the
live planning folders (`PRPs/`, `spec/`, `ecommerce/`) show only what's **pending** or is
**active reference**. Nothing here is needed to run or build the app; it's history + record
of what was built. Safe to delete wholesale if you don't want the paper trail.

_Reorganized: 2026-06-21._

## What's where

| Folder | Contents | Status |
|--------|----------|--------|
| `ecommerce/` | The full e-commerce build plan (`00-STATUS` … `09-checkout-price-integrity`, `INITIAL.md`, order-flow diagrams). | ✅ Built + merged (store, cart, checkout, Shippo, Square catalog, price integrity). |
| `prps/` | Completed PRPs: authentication, react-query migration (x2 + the `tasks/` phase tracker), reservation time-slots, page transitions, fluid-tailwind, customer-shop-page, design-system, square CSP + idempotency. | ✅ All implemented + merged. |
| `spec/` | Historical project logs, progress reports, UI overhauls, the example app, instagram notes, and the done feature specs (auth, customer-directory, gift-cards, catalog/bookings API migrations). | ✅ Historical / done. |

## Still live (NOT archived)

- **Root:** `HANDOFF-auth-and-square-v44.md` — the current handoff (auth go-live config, the
  Square v44 migration plan, and remaining cross-cutting items).
- **`PRPs/`:** `square-v44-sdk-migration.md` (pending), `INITIAL.md`, `templates/`,
  `ai_docs/` (reference: nextauth, square-catalog-legacy-sdk, square-v44-migration,
  frontend_patterns, fluid-tailwind-guide).
- **`ecommerce/`:** `ecommerce-sales-tax-guide.md` (future tax decision — not yet implemented).
- **`spec/`:** `features/02-enhanced-payments-apple-google-pay.md` (pending),
  `features/IMPLEMENTATION-STATUS.md`, plus reference dirs (`square_resources/`, `mcp/`,
  `claude_code/`).
