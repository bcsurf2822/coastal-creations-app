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
import { randomUUID, createHash } from "crypto";

export function normalizeIdempotencyKey(input?: string): string {
  if (typeof input === "string") {
    const key = input.trim();
    if (key.length > 0 && key.length <= 45) {
      return key;
    }
  }
  return randomUUID();
}

/**
 * Deterministic idempotency key for a Square refund, derived from stable
 * inputs instead of a fresh randomUUID() per call. A double-click or a
 * lost-response retry of the SAME refund (same payment, same amount, same
 * already-refunded balance) hashes to the SAME key, so Square dedupes it
 * into a single refund instead of two — closing the double-refund race that
 * a per-call random key leaves open. A genuinely new follow-up refund gets a
 * different key once `alreadyRefundedCents` has moved.
 */
export function refundIdempotencyKey(parts: {
  paymentId: string;
  amountCents: number;
  alreadyRefundedCents: number;
}): string {
  const raw = `refund:${parts.paymentId}:${parts.amountCents}:${parts.alreadyRefundedCents}`;
  return createHash("sha256").update(raw).digest("hex").slice(0, 40);
}
