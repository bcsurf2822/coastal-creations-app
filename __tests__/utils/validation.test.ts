import { describe, it, expect } from "vitest";
import { isValidEmail } from "@/lib/utils/validation";

describe("isValidEmail", () => {
  it("accepts well-formed addresses", () => {
    for (const v of ["a@b.co", "first.last@example.com", "x+tag@sub.domain.org"]) {
      expect(isValidEmail(v)).toBe(true);
    }
  });

  it("trims surrounding whitespace before validating", () => {
    expect(isValidEmail("  a@b.co  ")).toBe(true);
  });

  it("rejects malformed addresses", () => {
    for (const v of ["", "  ", "noatsign", "no@domain", "@no-local.com", "a b@c.com", "a@b .com"]) {
      expect(isValidEmail(v)).toBe(false);
    }
  });

  it("rejects null/undefined", () => {
    expect(isValidEmail(null)).toBe(false);
    expect(isValidEmail(undefined)).toBe(false);
  });
});
