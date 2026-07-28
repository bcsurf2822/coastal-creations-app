/**
 * Converts cents to dollars.
 * All Square amounts and Order model amounts are stored in cents.
 */
export function centsToDollars(cents: number): number {
  return cents / 100;
}

/**
 * Formats a cent amount as a dollar string (e.g. 2499 → "$24.99").
 * Use at the UI boundary — never store formatted strings.
 */
export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Converts a raw Square money amount to cents as a plain number.
 * Square returns priceMoney.amount as a BigInt — JSON.stringify crashes on BigInt.
 * Call this at the Square API boundary (lib/square/) before crossing any boundary.
 * Returns null when the input is null/undefined (variable-priced variations).
 */
export function moneyAmountToCents(
  amount: bigint | number | string | null | undefined
): number | null {
  if (amount == null) return null;
  return Number(amount);
}
