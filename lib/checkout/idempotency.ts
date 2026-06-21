/**
 * Idempotency-key normalization for Square CreatePayment calls.
 *
 * The double-charge fix relies on a STABLE key per logical payment attempt: the
 * client generates one key per payment-component mount and threads it to the
 * server charge. This helper validates that client-supplied key and falls back
 * to a fresh `randomUUID()` when it is missing or malformed — never throwing, so
 * a payment can always proceed (Square's max idempotency key length is 45 chars;
 * a UUID v4 is 36).
 */
import { randomUUID } from "crypto";

export function normalizeIdempotencyKey(input?: string): string {
  if (typeof input === "string") {
    const key = input.trim();
    if (key.length > 0 && key.length <= 45) {
      return key;
    }
  }
  return randomUUID();
}
