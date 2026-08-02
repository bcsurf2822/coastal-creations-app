import { describe, it, expect } from "vitest";
import { computeSalesTaxCents, NJ_SALES_TAX_RATE } from "@/lib/utils/salesTax";

describe("computeSalesTaxCents", () => {
  it("charges 6.625% for NJ ship-to addresses", () => {
    expect(computeSalesTaxCents("NJ", 10000)).toBe(663); // $100.00 -> $6.63 (rounds up from 662.5)
  });

  it("matches the documented NJ rate constant", () => {
    expect(NJ_SALES_TAX_RATE).toBe(0.06625);
  });

  it("charges nothing for out-of-state addresses", () => {
    expect(computeSalesTaxCents("NY", 10000)).toBe(0);
    expect(computeSalesTaxCents("CA", 10000)).toBe(0);
  });

  it("charges nothing when state is missing", () => {
    expect(computeSalesTaxCents(undefined, 10000)).toBe(0);
    expect(computeSalesTaxCents(null, 10000)).toBe(0);
    expect(computeSalesTaxCents("", 10000)).toBe(0);
  });

  it("matches case-insensitively and trims whitespace", () => {
    expect(computeSalesTaxCents("nj", 10000)).toBe(663);
    expect(computeSalesTaxCents(" NJ ", 10000)).toBe(663);
  });

  it("returns 0 tax on a $0 taxable base", () => {
    expect(computeSalesTaxCents("NJ", 0)).toBe(0);
  });

  it("taxes the combined items + shipping base, not just items", () => {
    // $50.00 items + $6.48 shipping = $56.48 taxable
    expect(computeSalesTaxCents("NJ", 5648)).toBe(374); // 5648 * 0.06625 = 374.18 -> 374
  });
});
