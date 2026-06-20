import { describe, it, expect } from "vitest";
import { parseAdminSeed, resolveRole } from "@/lib/auth/roles";

describe("parseAdminSeed", () => {
  it("splits, trims, lowercases, and drops blanks", () => {
    expect(parseAdminSeed("A@x.com, b@Y.com ,, ")).toEqual([
      "a@x.com",
      "b@y.com",
    ]);
  });

  it("returns [] for empty/undefined", () => {
    expect(parseAdminSeed(undefined)).toEqual([]);
    expect(parseAdminSeed("")).toEqual([]);
  });
});

describe("resolveRole", () => {
  const seed = ["admin@x.com"];

  it("promotes a seeded email to admin (case-insensitive)", () => {
    expect(resolveRole("Admin@X.com", seed)).toBe("admin");
  });

  it("defaults a non-seeded user to customer", () => {
    expect(resolveRole("joe@x.com", seed)).toBe("customer");
  });

  it("keeps an existing admin even if not in the seed (no silent demotion)", () => {
    expect(resolveRole("joe@x.com", seed, "admin")).toBe("admin");
  });

  it("handles missing email", () => {
    expect(resolveRole(null, seed)).toBe("customer");
    expect(resolveRole(undefined, seed, "customer")).toBe("customer");
  });
});
