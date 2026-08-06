import { describe, it, expect } from "vitest";
import { validateEventCapacity } from "@/lib/checkout/eventAvailability";

describe("validateEventCapacity", () => {
  it("returns null when there's enough room", () => {
    expect(validateEventCapacity(9, 1, 10)).toBeNull();
  });

  it("allows a booking that exactly fills the last spot(s)", () => {
    expect(validateEventCapacity(8, 2, 10)).toBeNull();
  });

  it("rejects when the requested quantity exceeds remaining spots", () => {
    // 10 - 9 = 1 spot left; asking for 2.
    expect(validateEventCapacity(9, 2, 10)).toMatch(/Only 1 spot left/);
  });

  it("reports sold out (not '0 spots left') when there's no room at all", () => {
    expect(validateEventCapacity(10, 1, 10)).toMatch(/sold out/i);
  });

  it("rejects the exact bug that was reported: 11th signup against a 10 cap", () => {
    expect(validateEventCapacity(10, 1, 10)).not.toBeNull();
  });

  it("falls back to a cap of 20 when numberOfParticipants is unset (matches EventCard's display fallback)", () => {
    expect(validateEventCapacity(19, 1, undefined)).toBeNull();
    expect(validateEventCapacity(20, 1, undefined)).toMatch(/sold out/i);
  });

  it("pluralizes the spots-left message correctly", () => {
    expect(validateEventCapacity(8, 3, 10)).toMatch(/Only 2 spots left/);
    expect(validateEventCapacity(9, 2, 10)).toMatch(/Only 1 spot left\./);
  });
});
