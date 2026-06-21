/**
 * Shared error for server-side price integrity checks (store + bookings).
 * Thrown when a client-submitted amount/selection cannot be reconciled with
 * authoritative server prices, so the caller rejects BEFORE charging.
 */
export class PriceIntegrityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PriceIntegrityError";
  }
}
