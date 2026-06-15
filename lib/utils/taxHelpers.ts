/**
 * US state-level sales tax rates (base state rate only — does not include
 * county or city surcharges). AK, DE, MT, NH, OR have no state sales tax.
 *
 * These rates are used for ecommerce order tax calculation based on the
 * customer's shipping address state.
 */

const STATE_TAX_RATES: Readonly<Record<string, number>> = {
  AL: 0.04,
  AK: 0,
  AZ: 0.056,
  AR: 0.065,
  CA: 0.0725,
  CO: 0.029,
  CT: 0.0635,
  DE: 0,
  FL: 0.06,
  GA: 0.04,
  HI: 0.04,
  ID: 0.06,
  IL: 0.0625,
  IN: 0.07,
  IA: 0.06,
  KS: 0.065,
  KY: 0.06,
  LA: 0.0445,
  ME: 0.055,
  MD: 0.06,
  MA: 0.0625,
  MI: 0.06,
  MN: 0.06875,
  MS: 0.07,
  MO: 0.04225,
  MT: 0,
  NE: 0.055,
  NV: 0.0685,
  NH: 0,
  NJ: 0.06625,
  NM: 0.05,
  NY: 0.04,
  NC: 0.0475,
  ND: 0.05,
  OH: 0.0575,
  OK: 0.045,
  OR: 0,
  PA: 0.06,
  RI: 0.07,
  SC: 0.06,
  SD: 0.045,
  TN: 0.07,
  TX: 0.0625,
  UT: 0.0485,
  VT: 0.06,
  VA: 0.053,
  WA: 0.065,
  WV: 0.06,
  WI: 0.05,
  WY: 0.04,
  DC: 0.06,
};

/** Returns the state sales tax rate (0–1) for a given two-letter state code. */
export function getTaxRateForState(state: string): number {
  return STATE_TAX_RATES[state.toUpperCase()] ?? 0;
}

/**
 * Computes sales tax in cents for a given subtotal and destination state.
 * Returns 0 for states with no sales tax or unrecognised state codes.
 */
export function computeTaxCents(subtotalCents: number, state: string): number {
  const rate = getTaxRateForState(state);
  return Math.round(subtotalCents * rate);
}

/**
 * Formats a tax rate as a human-readable percentage string.
 * e.g. 0.06625 → "6.625%", 0.04 → "4%", 0 → "0%"
 */
export function formatTaxRate(rate: number): string {
  const pct = rate * 100;
  return `${parseFloat(pct.toFixed(3))}%`;
}

/**
 * Returns a display label for the tax line, e.g. "NJ 6.625%" or "OR 0%".
 * Used in the checkout summary and email templates.
 */
export function taxLabel(state: string): string {
  const upper = state.toUpperCase();
  const rate = getTaxRateForState(upper);
  return `${upper} ${formatTaxRate(rate)}`;
}
