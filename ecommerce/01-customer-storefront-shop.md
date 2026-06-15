# Ticket: Customer Storefront — Store page + nav item

> First step of the E-Commerce Order Flow. Corresponds to **Step 1: "Browse the shop"** in `spec/ecommerce/ecommerce-order-flow.drawio.png`.

## Status

- **State**: ✅ Completed — `/store` page + nav link shipped (nav later renamed "Shop", commit `cc32ab6`). Storefront, product grid, cart, and checkout all built beyond this ticket's original scope. See `00-STATUS.md` for the full build status.
- **Scope**: Customer-facing storefront landing page + public nav entry
- **Related (separate ticket)**: Admin Sales page — see `spec/ecommerce/02-admin-sales-page.md`

## Goal

Introduce the public entry point for the e-commerce flow: a new top-level **Store** page where customers will browse products, and a **Store** link in the main site nav that points to it. This ticket stands up the page shell and navigation only — product listing, cart, and checkout are later steps in the flow.

## Why

- The order-flow diagram begins with the customer browsing the shop. Nothing in the app exposes a storefront today (no `shop`/`store`/`product`/`cart` route exists).
- Landing the route + nav first unblocks subsequent tickets (product grid, cart, Square checkout, Shippo rates) to build against a stable surface.

## What

### In scope

1. **New route**: `app/store/page.tsx` — customer-facing storefront page.
   - Follow the existing simple-page pattern (see `app/walk-in/page.tsx`): `min-h-screen` wrapper + `PageHeader`.
   - Use `PageHeader` (`components/classes/PageHeader.tsx`) with an appropriate title/subtitle and shop-themed left/right icons (`react-icons`).
   - Below the header, render a placeholder section component (e.g. `components/store/Store.tsx`) that clearly indicates the product grid is coming next. Keep it a Server Component unless interactivity is required.
2. **Nav item**: add a top-level **Store** link in `components/layout/nav/NavBar.tsx`.
   - Desktop nav: add alongside Home / What We Offer / About / Gallery / Contact, matching the existing `<motion.div variants={itemVariants}>` + `<Link>` + `NavRippleText` pattern and link styling exactly.
   - Mobile menu: add a matching entry in the mobile `<motion.nav>` block, following the existing per-link `border-b border-gray-100 pb-2` pattern and calling `setIsMenuOpen(false)` on click.
   - `href="/store"`, label text `Store`.

### Out of scope (future tickets in this flow)

- Product catalog / product cards / product detail pages
- Cart and cart state/provider
- Square checkout & payment (Step 2)
- Shippo live shipping rates (Step 2)
- Order recording, confirmation emails, shipping/label flow (Steps 3–8)
- Admin Sales page (separate ticket `02-admin-sales-page.md`)

## Implementation Notes

- **Page pattern reference**: `app/walk-in/page.tsx` is the closest analog (PageHeader + feature component).
- **Component location**: create `components/store/` for storefront components, mirroring `components/walk-in/`.
- **Nav reference**: top-level links live around `components/layout/nav/NavBar.tsx:226-300` (desktop) and `:437-471` (mobile). The `OFFER_DROPDOWN_ITEMS` array (`:14-19`) is the dropdown — do NOT add Store there; this is a top-level link.
- **Design system**: use UI tokens/components per `AGENTS.md` (PageHeader, CSS variables). No raw ad-hoc styling for buttons/inputs if any are added.

## Acceptance Criteria

- [ ] Visiting `/store` renders a storefront page with a `PageHeader` and a clear "products coming soon" placeholder section.
- [ ] A **Store** link appears in the desktop nav and routes to `/store`, styled identically to the other top-level links (including the underline hover + `NavRippleText`).
- [ ] A **Store** link appears in the mobile menu, routes to `/store`, and closes the mobile menu on click.
- [ ] No regressions to existing nav links or the "What We Offer" dropdown (desktop + mobile).
- [ ] `pnpm run lint` and `pnpm run build` pass.
- [ ] TypeScript strict rules respected (explicit return types, no `any`, `ReactElement` over `JSX.Element`).

## Files Touched (expected)

- `app/store/page.tsx` (new)
- `components/store/Store.tsx` (new)
- `components/layout/nav/NavBar.tsx` (edit — desktop + mobile nav)
