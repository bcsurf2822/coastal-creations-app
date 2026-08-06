import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// --- Mock every dependency the route orchestrates ---
vi.mock("@/lib/mongoose", () => ({ connectMongo: vi.fn() }));

const getSessionUser = vi.fn();
vi.mock("@/lib/auth/guards", () => ({
  getSessionUser: (...a: unknown[]) => getSessionUser(...a),
}));

const findOrCreateCustomer = vi.fn();
vi.mock("@/lib/square/customers", () => ({
  squareCustomerService: { findOrCreateCustomer: (...a: unknown[]) => findOrCreateCustomer(...a) },
}));

const customerSave = vi.fn();
const customerFind = vi.fn();
vi.mock("@/lib/models/Customer", () => {
  class CustomerMock {
    constructor(doc: Record<string, unknown>) {
      Object.assign(this, doc);
    }
    save = () => customerSave(this);
    static find = (...a: unknown[]) => customerFind(...a);
  }
  return { default: CustomerMock };
});

// Existing bookings summed by getEventParticipantCount — default to none so
// tests that don't care about capacity aren't affected by it.
function mockExistingBookings(quantities: number[]) {
  customerFind.mockReturnValue({
    select: () => ({
      lean: () => Promise.resolve(quantities.map((quantity) => ({ quantity }))),
    }),
  });
}

const eventFindById = vi.fn();
vi.mock("@/lib/models/Event", () => ({
  default: { findById: (...a: unknown[]) => eventFindById(...a) },
}));

vi.mock("@/lib/models/PrivateEvent", () => ({
  default: { findById: vi.fn() },
}));

vi.mock("@/lib/models/Reservations", () => ({
  default: { findById: vi.fn(), bulkWrite: vi.fn() },
}));

import { POST } from "@/app/api/customer/route";

const BILLING_INFO = {
  firstName: "Ada",
  lastName: "Lovelace",
  emailAddress: "ada@example.com",
  phoneNumber: "+16095551234",
};

function req(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/customer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  getSessionUser.mockResolvedValue(null);
  findOrCreateCustomer.mockResolvedValue({ customerId: "sqcust_1", isNew: true });
  customerSave.mockImplementation((doc: unknown) => Promise.resolve(doc));
  eventFindById.mockResolvedValue({ price: 50, numberOfParticipants: 10 });
  mockExistingBookings([]);
});

describe("POST /api/customer — event capacity", () => {
  it("rejects (400, sold out) and never saves when the event is full, even with quantity omitted from the request", async () => {
    // Regression test for the High finding on PR #204: `quantity` reached
    // validateEventCapacity() unguarded, and `undefined > availableSpots` is
    // `false` in JS — so an omitted quantity silently passed the capacity
    // check on a fully-booked event. Without the `quantity ?? 1` fix, this
    // request would still 400 (a downstream pricing throw catches it) but
    // with "Invalid quantity", not "sold out" — asserting the message proves
    // the capacity check itself is what's rejecting it.
    mockExistingBookings(Array(10).fill(1)); // 10/10 already booked
    const res = await POST(req({ event: "ev1", eventType: "Event", billingInfo: BILLING_INFO }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toMatch(/sold out/i);
    expect(customerSave).not.toHaveBeenCalled();
  });

  it("still books normally with a valid quantity when there's room (fix didn't break the happy path)", async () => {
    mockExistingBookings(Array(9).fill(1)); // 9/10 booked, this is #10
    const res = await POST(
      req({ event: "ev1", eventType: "Event", quantity: 1, billingInfo: BILLING_INFO })
    );
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.success).toBe(true);
    expect(customerSave).toHaveBeenCalledTimes(1);
  });

  it("omitting quantity entirely is still rejected (400, invalid quantity) — the fix only corrects the capacity check's own reasoning, it doesn't make omitted quantity a valid request", async () => {
    mockExistingBookings(Array(9).fill(1)); // room available — capacity check passes either way
    const res = await POST(req({ event: "ev1", eventType: "Event", billingInfo: BILLING_INFO }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toMatch(/invalid quantity/i);
    expect(customerSave).not.toHaveBeenCalled();
  });
});
