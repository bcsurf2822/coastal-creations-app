/**
 * Sales tax for the online store. Pure — no I/O, safe to import from both server
 * routes and client components (the client uses it only for a checkout preview;
 * the server call in app/api/store/checkout/route.ts is the authoritative one).
 *
 * NJ is the only state currently taxed — Coastal Creations Studio has physical
 * nexus there (home state), so NJ collection is owed from day one. Every other
 * state stays $0 until sales into that state cross its own economic nexus
 * threshold (commonly $100k/year) — not a year-one concern. Owner-confirmed
 * 2026-08-02 (Ashley). Full research + rationale: ecommerce/nj-sales-tax-research.md.
 */

// Flat statewide rate — NJ has no local/city/county sales taxes, so no rate
// table or geocoding is needed, unlike most states.
export const NJ_SALES_TAX_RATE = 0.06625;

const TAXED_STATE = "NJ";

/**
 * Computes sales tax owed, in cents, for an order shipping to `state` (a 2-letter
 * USPS code). `taxableCents` should be items + shipping combined — NJ taxes
 * delivery charges on taxable goods (N.J.A.C. 18:24-27.2), and every product this
 * store sells (art kits, craft supplies) is taxable tangible personal property.
 */
export function computeSalesTaxCents(
  state: string | undefined | null,
  taxableCents: number
): number {
  if ((state ?? "").trim().toUpperCase() !== TAXED_STATE) return 0;
  return Math.round(taxableCents * NJ_SALES_TAX_RATE);
}
