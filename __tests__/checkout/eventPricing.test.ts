import { describe, it, expect } from "vitest";
import {
  computeEventChargeCents,
  computePrivateEventChargeCents,
  computeReservationChargeCents,
} from "@/lib/checkout/eventPricing";
import { PriceIntegrityError } from "@/lib/checkout/errors";

describe("computeEventChargeCents", () => {
  it("charges base price x quantity from the doc (ignores any client price)", () => {
    const event = { price: 50 };
    expect(computeEventChargeCents(event, { quantity: 1 })).toBe(5000);
    expect(computeEventChargeCents(event, { quantity: 3 })).toBe(15000);
  });

  it("applies a percentage discount only when quantity meets minParticipants", () => {
    const event = {
      price: 100,
      isDiscountAvailable: true,
      discount: { type: "percentage" as const, value: 10, minParticipants: 2 },
    };
    // Below threshold → no discount.
    expect(computeEventChargeCents(event, { quantity: 1 })).toBe(10000);
    // At threshold → 10% off each unit: 90 * 2 = 180.
    expect(computeEventChargeCents(event, { quantity: 2 })).toBe(18000);
  });

  it("applies a fixed discount per unit when eligible", () => {
    const event = {
      price: 40,
      isDiscountAvailable: true,
      discount: { type: "fixed" as const, value: 5, minParticipants: 2 },
    };
    // (40 - 5) * 3 = 105.
    expect(computeEventChargeCents(event, { quantity: 3 })).toBe(10500);
  });

  it("ignores the discount when isDiscountAvailable is false", () => {
    const event = {
      price: 100,
      isDiscountAvailable: false,
      discount: { type: "percentage" as const, value: 50, minParticipants: 1 },
    };
    expect(computeEventChargeCents(event, { quantity: 2 })).toBe(20000);
  });

  it("adds the primary registrant's option cost only when signing up for self", () => {
    const event = {
      price: 30,
      options: [
        {
          categoryName: "Add-on",
          choices: [
            { name: "None", price: 0 },
            { name: "Frame", price: 15 },
          ],
        },
      ],
    };
    const selectedOptions = [{ categoryName: "Add-on", choiceName: "Frame" }];
    // Self counted: 30 + 15 = 45.
    expect(
      computeEventChargeCents(event, {
        quantity: 1,
        isSigningUpForSelf: true,
        selectedOptions,
      })
    ).toBe(4500);
    // Not signing up for self: primary options NOT counted → just 30.
    expect(
      computeEventChargeCents(event, {
        quantity: 1,
        isSigningUpForSelf: false,
        selectedOptions,
      })
    ).toBe(3000);
  });

  it("adds each additional participant's option cost", () => {
    const event = {
      price: 20,
      options: [
        {
          categoryName: "Add-on",
          choices: [
            { name: "None", price: 0 },
            { name: "Kit", price: 10 },
          ],
        },
      ],
    };
    // quantity 3, self + 2 participants each with a $10 kit.
    const charge = computeEventChargeCents(event, {
      quantity: 3,
      isSigningUpForSelf: true,
      selectedOptions: [{ categoryName: "Add-on", choiceName: "Kit" }],
      participants: [
        { selectedOptions: [{ categoryName: "Add-on", choiceName: "Kit" }] },
        { selectedOptions: [{ categoryName: "Add-on", choiceName: "Kit" }] },
      ],
    });
    // base 20*3 = 60, options 10*3 = 30 → 90.
    expect(charge).toBe(9000);
  });

  it("treats an unknown option choice as $0 (cannot inflate or be exploited)", () => {
    const event = {
      price: 25,
      options: [{ categoryName: "Add-on", choices: [{ name: "Frame", price: 15 }] }],
    };
    const charge = computeEventChargeCents(event, {
      quantity: 1,
      isSigningUpForSelf: true,
      selectedOptions: [{ categoryName: "Add-on", choiceName: "DoesNotExist" }],
    });
    expect(charge).toBe(2500);
  });

  it("rejects a tampered/invalid quantity", () => {
    const event = { price: 50 };
    expect(() => computeEventChargeCents(event, { quantity: 0 })).toThrow(
      PriceIntegrityError
    );
    expect(() => computeEventChargeCents(event, { quantity: -1 })).toThrow(
      PriceIntegrityError
    );
    expect(() =>
      computeEventChargeCents(event, { quantity: 1.5 })
    ).toThrow(PriceIntegrityError);
  });
});

describe("computePrivateEventChargeCents", () => {
  it("charges the DEPOSIT x quantity, not the full event price", () => {
    const priv = { depositAmount: 75, price: 500 } as {
      depositAmount: number;
      options?: never;
    };
    expect(computePrivateEventChargeCents(priv, { quantity: 1 })).toBe(7500);
    expect(computePrivateEventChargeCents(priv, { quantity: 2 })).toBe(15000);
  });

  it("adds option costs to the deposit", () => {
    const priv = {
      depositAmount: 100,
      options: [
        { categoryName: "Theme", choices: [{ name: "Deluxe", price: 50 }] },
      ],
    };
    expect(
      computePrivateEventChargeCents(priv, {
        quantity: 1,
        isSigningUpForSelf: true,
        selectedOptions: [{ categoryName: "Theme", choiceName: "Deluxe" }],
      })
    ).toBe(15000);
  });
});

describe("computeReservationChargeCents", () => {
  const reservation = { pricePerDayPerParticipant: 35 };

  it("charges pricePerDayPerParticipant x participants summed across dates", () => {
    const charge = computeReservationChargeCents(reservation, {
      selectedDates: [
        { numberOfParticipants: 2 },
        { numberOfParticipants: 3 },
      ],
    });
    // (2 + 3) * 35 = 175.
    expect(charge).toBe(17500);
  });

  it("accepts the alternate `participants` per-date field", () => {
    const charge = computeReservationChargeCents(reservation, {
      selectedDates: [{ participants: 4 }],
    });
    expect(charge).toBe(14000);
  });

  it("adds per-participant option costs", () => {
    const res = {
      pricePerDayPerParticipant: 20,
      options: [{ categoryName: "Kit", choices: [{ name: "Premium", price: 12 }] }],
    };
    const charge = computeReservationChargeCents(res, {
      selectedDates: [{ numberOfParticipants: 2 }],
      participants: [
        { selectedOptions: [{ categoryName: "Kit", choiceName: "Premium" }] },
        { selectedOptions: [{ categoryName: "Kit", choiceName: "Premium" }] },
      ],
    });
    // base 2*20 = 40, options 12*2 = 24 → 64.
    expect(charge).toBe(6400);
  });

  it("rejects when no dates are selected", () => {
    expect(() =>
      computeReservationChargeCents(reservation, { selectedDates: [] })
    ).toThrow(PriceIntegrityError);
  });

  it("rejects a tampered participant count", () => {
    expect(() =>
      computeReservationChargeCents(reservation, {
        selectedDates: [{ numberOfParticipants: 0 }],
      })
    ).toThrow(PriceIntegrityError);
  });
});
