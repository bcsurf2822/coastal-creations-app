import { describe, it, expect, vi, beforeEach } from "vitest";
import { PriceIntegrityError } from "@/lib/checkout/errors";

// --- Mock every dependency the route orchestrates ---
const resolveBookingCharge = vi.fn();
vi.mock("@/lib/checkout/resolveBookingCharge", () => ({
  resolveBookingCharge: (...a: unknown[]) => resolveBookingCharge(...a),
}));

const paymentsCreate = vi.fn();
vi.mock("@/lib/square/client", () => ({
  getSquareClient: () => ({ payments: { create: (...a: unknown[]) => paymentsCreate(...a) } }),
}));

const findOrCreateCustomer = vi.fn();
vi.mock("@/lib/square/customers", () => ({
  squareCustomerService: { findOrCreateCustomer: (...a: unknown[]) => findOrCreateCustomer(...a) },
}));

const giftCardRedeem = vi.fn();
vi.mock("@/lib/square/gift-cards", () => ({
  giftCardService: { redeem: (...a: unknown[]) => giftCardRedeem(...a) },
}));

const customerCreate = vi.fn();
vi.mock("@/lib/models/Customer", () => ({ default: { create: (...a: unknown[]) => customerCreate(...a) } }));

const reservationFindById = vi.fn();
const reservationBulkWrite = vi.fn();
vi.mock("@/lib/models/Reservations", () => ({
  default: {
    findById: (...a: unknown[]) => reservationFindById(...a),
    bulkWrite: (...a: unknown[]) => reservationBulkWrite(...a),
  },
}));

vi.mock("@/lib/mongoose", () => ({ connectMongo: vi.fn() }));
const sendBookingConfirmationEmails = vi.fn();
vi.mock("@/lib/email/sendBookingConfirmation", () => ({
  sendBookingConfirmationEmails: (...a: unknown[]) => sendBookingConfirmationEmails(...a),
}));

import { POST } from "@/app/api/checkout/booking/route";

const CONTACT = { firstName: "Ada", lastName: "Lovelace", email: "Ada@Example.com", phone: "+16095551234" };
const BOOKING = { eventId: "ev1", eventType: "Event" as const, quantity: 1 };

function req(body: unknown): Request {
  return new Request("http://localhost/api/checkout/booking", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  resolveBookingCharge.mockResolvedValue({ totalCents: 5000, giftCardAppliedCents: 0, chargeCents: 5000 });
  paymentsCreate.mockResolvedValue({ payment: { id: "pay_123", status: "COMPLETED" } });
  findOrCreateCustomer.mockResolvedValue({ customerId: "sqcust_1", isNew: true });
  customerCreate.mockResolvedValue({ _id: { toString: () => "cust_123" } });
});

describe("POST /api/checkout/booking", () => {
  it("rejects when contact fields are missing (no charge)", async () => {
    const res = await POST(req({ booking: BOOKING, contact: { firstName: "Ada" } }));
    expect(res.status).toBe(400);
    expect(paymentsCreate).not.toHaveBeenCalled();
    expect(customerCreate).not.toHaveBeenCalled();
  });

  it("charges the recomputed amount and creates the booking for a paid event", async () => {
    const res = await POST(req({ paymentToken: "cnon:tok", booking: BOOKING, contact: CONTACT }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.customerId).toBe("cust_123");

    // Charged the SERVER-resolved amount as BigInt cents — never a client price.
    expect(paymentsCreate).toHaveBeenCalledTimes(1);
    const charge = paymentsCreate.mock.calls[0][0];
    expect(charge.amountMoney.amount).toBe(BigInt(5000));
    expect(charge.sourceId).toBe("cnon:tok");

    // Booking saved with the full total and Square ids; email fired.
    expect(customerCreate).toHaveBeenCalledTimes(1);
    const saved = customerCreate.mock.calls[0][0];
    expect(saved.total).toBe(50);
    expect(saved.squarePaymentId).toBe("pay_123");
    expect(saved.squareCustomerId).toBe("sqcust_1");
    expect(sendBookingConfirmationEmails).toHaveBeenCalledWith("cust_123", "ev1");
  });

  it("returns 400 on a price-integrity rejection without charging", async () => {
    resolveBookingCharge.mockRejectedValue(new PriceIntegrityError("Event not found"));
    const res = await POST(req({ paymentToken: "cnon:tok", booking: BOOKING, contact: CONTACT }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Event not found");
    expect(paymentsCreate).not.toHaveBeenCalled();
    expect(customerCreate).not.toHaveBeenCalled();
  });

  it("skips Square charge for a free booking but still records it", async () => {
    resolveBookingCharge.mockResolvedValue({ totalCents: 0, giftCardAppliedCents: 0, chargeCents: 0 });
    const res = await POST(req({ booking: BOOKING, contact: CONTACT }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(paymentsCreate).not.toHaveBeenCalled();
    expect(customerCreate.mock.calls[0][0].squarePaymentId).toBe("FREE-EVENT");
  });

  it("rejects a gift-card-only booking when redemption fails (no record)", async () => {
    resolveBookingCharge.mockResolvedValue({ totalCents: 5000, giftCardAppliedCents: 5000, chargeCents: 0 });
    giftCardRedeem.mockRejectedValue(new Error("Square down"));
    const res = await POST(
      req({ booking: { ...BOOKING, giftCard: { giftCardId: "gc1", amountCents: 5000 } }, contact: CONTACT })
    );

    expect(res.status).toBe(400);
    expect(customerCreate).not.toHaveBeenCalled();
  });

  it("returns 400 when Square reports the payment was not COMPLETED", async () => {
    paymentsCreate.mockResolvedValue({ payment: { id: "pay_x", status: "FAILED" } });
    const res = await POST(req({ paymentToken: "cnon:tok", booking: BOOKING, contact: CONTACT }));

    expect(res.status).toBe(400);
    expect(customerCreate).not.toHaveBeenCalled();
  });

  it("requires a payment token when there is a card amount to charge", async () => {
    const res = await POST(req({ booking: BOOKING, contact: CONTACT }));
    expect(res.status).toBe(400);
    expect(paymentsCreate).not.toHaveBeenCalled();
  });
});
