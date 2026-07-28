import { describe, it, expect } from "vitest";
import {
  validateReservationAvailability,
  buildReservationDecrementOps,
  type ReservationDoc,
} from "@/lib/checkout/reservationAvailability";

// Noon UTC keeps the America/New_York calendar day stable regardless of runner TZ.
const day = (d: string) => new Date(`${d}T12:00:00Z`);

const dayReservation: ReservationDoc = {
  _id: "res_1",
  enableTimeSlots: false,
  dailyAvailability: [
    { date: day("2026-07-01"), maxParticipants: 10, currentBookings: 8 },
    { date: day("2026-07-02"), maxParticipants: 10, currentBookings: 0 },
  ],
};

const slotReservation: ReservationDoc = {
  _id: "res_2",
  enableTimeSlots: true,
  dailyAvailability: [
    {
      date: day("2026-07-01"),
      maxParticipants: 10,
      currentBookings: 0,
      timeSlots: [
        { startTime: "10:00", endTime: "11:00", maxParticipants: 4, currentBookings: 3, isAvailable: true },
      ],
    },
  ],
};

describe("validateReservationAvailability", () => {
  it("returns null when every selected date has enough spots", () => {
    expect(
      validateReservationAvailability(dayReservation, [
        { date: "2026-07-02", numberOfParticipants: 2 },
      ])
    ).toBeNull();
  });

  it("rejects a date that isn't in the availability calendar", () => {
    expect(
      validateReservationAvailability(dayReservation, [
        { date: "2026-08-15", numberOfParticipants: 1 },
      ])
    ).toMatch(/not available/);
  });

  it("rejects when the day is over capacity", () => {
    // 10 - 8 = 2 spots left; asking for 3.
    expect(
      validateReservationAvailability(dayReservation, [
        { date: "2026-07-01", numberOfParticipants: 3 },
      ])
    ).toMatch(/Only 2 spots left/);
  });

  it("rejects a missing time slot when slots are enabled", () => {
    expect(
      validateReservationAvailability(slotReservation, [
        { date: "2026-07-01", numberOfParticipants: 1, timeSlot: { startTime: "14:00", endTime: "15:00" } },
      ])
    ).toMatch(/Time slot .* is not available/);
  });

  it("rejects when the time slot is over capacity", () => {
    // slot: 4 - 3 = 1 left; asking for 2.
    expect(
      validateReservationAvailability(slotReservation, [
        { date: "2026-07-01", numberOfParticipants: 2, timeSlot: { startTime: "10:00", endTime: "11:00" } },
      ])
    ).toMatch(/Only 1 spots left/);
  });
});

describe("buildReservationDecrementOps", () => {
  it("emits a positional $inc op per day for a non-slot reservation", () => {
    const ops = buildReservationDecrementOps(dayReservation, "res_1", [
      { date: "2026-07-02", numberOfParticipants: 2 },
    ]);
    expect(ops).toHaveLength(1);
    expect(ops[0].updateOne.update.$inc).toEqual({
      "dailyAvailability.$.currentBookings": 2,
    });
    expect(ops[0].updateOne.filter._id).toBe("res_1");
  });

  it("emits an indexed time-slot $inc op when slots are enabled", () => {
    const ops = buildReservationDecrementOps(slotReservation, "res_2", [
      { date: "2026-07-01", numberOfParticipants: 1, timeSlot: { startTime: "10:00", endTime: "11:00" } },
    ]);
    expect(ops).toHaveLength(1);
    expect(ops[0].updateOne.update.$inc).toEqual({
      "dailyAvailability.0.timeSlots.0.currentBookings": 1,
    });
  });

  it("skips dates that aren't in the calendar", () => {
    const ops = buildReservationDecrementOps(dayReservation, "res_1", [
      { date: "2026-12-25", numberOfParticipants: 1 },
    ]);
    expect(ops).toHaveLength(0);
  });
});
