import { describe, it, expect } from "vitest";
import { normalizeIdempotencyKey, refundIdempotencyKey } from "@/lib/checkout/idempotency";

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe("normalizeIdempotencyKey", () => {
  it("returns a valid client key unchanged (passthrough)", () => {
    const key = "550e8400-e29b-41d4-a716-446655440000"; // 36-char UUID
    expect(normalizeIdempotencyKey(key)).toBe(key);
  });

  it("passes through a short non-UUID string within the length limit", () => {
    expect(normalizeIdempotencyKey("attempt-123")).toBe("attempt-123");
  });

  it("accepts a key exactly 45 characters long", () => {
    const key = "a".repeat(45);
    expect(normalizeIdempotencyKey(key)).toBe(key);
  });

  it("falls back to a UUID when the key is undefined", () => {
    const result = normalizeIdempotencyKey(undefined);
    expect(result).toMatch(UUID_V4);
  });

  it("falls back to a UUID when the key is an empty string", () => {
    expect(normalizeIdempotencyKey("")).toMatch(UUID_V4);
  });

  it("falls back to a UUID when the key is only whitespace", () => {
    expect(normalizeIdempotencyKey("   ")).toMatch(UUID_V4);
  });

  it("falls back to a UUID when the key exceeds 45 characters", () => {
    const result = normalizeIdempotencyKey("a".repeat(46));
    expect(result).toMatch(UUID_V4);
  });

  it("generates a distinct fallback key per call when none is provided", () => {
    expect(normalizeIdempotencyKey()).not.toBe(normalizeIdempotencyKey());
  });
});

describe("refundIdempotencyKey", () => {
  const parts = { paymentId: "pay_1", amountCents: 3000, alreadyRefundedCents: 0 };

  it("is deterministic — identical inputs (e.g. a double-click) hash to the same key", () => {
    expect(refundIdempotencyKey(parts)).toBe(refundIdempotencyKey({ ...parts }));
  });

  it("changes when the amount differs", () => {
    expect(refundIdempotencyKey(parts)).not.toBe(
      refundIdempotencyKey({ ...parts, amountCents: 3001 })
    );
  });

  it("changes once alreadyRefundedCents has moved (a genuine follow-up refund)", () => {
    expect(refundIdempotencyKey(parts)).not.toBe(
      refundIdempotencyKey({ ...parts, alreadyRefundedCents: 3000 })
    );
  });

  it("changes for a different payment", () => {
    expect(refundIdempotencyKey(parts)).not.toBe(
      refundIdempotencyKey({ ...parts, paymentId: "pay_2" })
    );
  });

  it("stays within Square's 45-character idempotency key limit", () => {
    expect(refundIdempotencyKey(parts).length).toBeLessThanOrEqual(45);
  });
});
