import { describe, it, expect } from "vitest";
import {
  centsToDollars,
  formatCents,
  moneyAmountToCents,
} from "@/lib/utils/moneyHelpers";

describe("centsToDollars", () => {
  it("converts integer cents to dollars", () => {
    expect(centsToDollars(2499)).toBe(24.99);
  });

  it("handles zero", () => {
    expect(centsToDollars(0)).toBe(0);
  });

  it("handles round dollars", () => {
    expect(centsToDollars(1000)).toBe(10);
  });
});

describe("formatCents", () => {
  it("formats cents as a dollar string", () => {
    expect(formatCents(2499)).toBe("$24.99");
  });

  it("formats zero as $0.00", () => {
    expect(formatCents(0)).toBe("$0.00");
  });

  it("formats round dollars correctly", () => {
    expect(formatCents(500)).toBe("$5.00");
  });

  it("formats amounts under $1", () => {
    expect(formatCents(99)).toBe("$0.99");
  });
});

describe("moneyAmountToCents", () => {
  it("converts a bigint to number", () => {
    expect(moneyAmountToCents(BigInt(2499))).toBe(2499);
  });

  it("converts a number passthrough", () => {
    expect(moneyAmountToCents(500)).toBe(500);
  });

  it("converts a numeric string", () => {
    expect(moneyAmountToCents("1000")).toBe(1000);
  });

  it("returns null for null", () => {
    expect(moneyAmountToCents(null)).toBeNull();
  });

  it("returns null for undefined", () => {
    expect(moneyAmountToCents(undefined)).toBeNull();
  });

  it("handles zero", () => {
    expect(moneyAmountToCents(0)).toBe(0);
  });

  it("handles zero bigint", () => {
    expect(moneyAmountToCents(BigInt(0))).toBe(0);
  });
});
