import { describe, it, expect, vi, beforeEach } from "vitest";

const { getServerSessionMock } = vi.hoisted(() => ({ getServerSessionMock: vi.fn() }));
vi.mock("next-auth", () => ({ getServerSession: getServerSessionMock }));
vi.mock("@/auth", () => ({ authOptions: {} }));

vi.mock("@/lib/mongoose", () => ({ connectMongo: vi.fn() }));
// Side-effect model registrations the route imports.
vi.mock("@/lib/models/Event", () => ({ default: {} }));
vi.mock("@/lib/models/PrivateEvent", () => ({ default: {} }));
vi.mock("@/lib/models/Reservations", () => ({ default: {} }));

const customerFindById = vi.fn();
vi.mock("@/lib/models/Customer", () => ({ default: { findById: (...a: unknown[]) => customerFindById(...a) } }));

const refundPayment = vi.fn();
vi.mock("@/lib/square/client", () => ({
  getSquareClient: () => ({ refunds: { refundPayment: (...a: unknown[]) => refundPayment(...a) } }),
}));

const sendRefundConfirmation = vi.fn();
vi.mock("@/lib/email/sendRefundConfirmation", () => ({
  sendRefundConfirmation: (...a: unknown[]) => sendRefundConfirmation(...a),
}));

import { POST } from "@/app/api/refunds/route";

function req(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/refunds", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function customerDoc(overrides: Record<string, unknown> = {}) {
  return {
    squarePaymentId: "pay_real_1",
    refundStatus: "none",
    total: 100,
    refundAmount: 0,
    billingInfo: { emailAddress: "buyer@example.com", firstName: "Pat" },
    event: { eventName: "Workshop" },
    save: vi.fn().mockResolvedValue({}),
    ...overrides,
  };
}

/** Customer.findById(id).populate("event") -> doc */
function mockCustomer(doc: ReturnType<typeof customerDoc> | null) {
  customerFindById.mockReturnValue({ populate: vi.fn().mockResolvedValue(doc) });
}

beforeEach(() => {
  vi.clearAllMocks();
  getServerSessionMock.mockResolvedValue({ user: { isAdmin: true } });
  refundPayment.mockResolvedValue({ refund: { id: "rf_1", status: "COMPLETED" } });
});

describe("POST /api/refunds — auth", () => {
  it("401s when unauthenticated", async () => {
    getServerSessionMock.mockResolvedValue(null);
    const res = await POST(req({ customerId: "c1" }) as never);
    expect(res.status).toBe(401);
    expect(refundPayment).not.toHaveBeenCalled();
  });

  it("401s a signed-in non-admin", async () => {
    getServerSessionMock.mockResolvedValue({ user: { isAdmin: false } });
    const res = await POST(req({ customerId: "c1" }) as never);
    expect(res.status).toBe(401);
  });
});

describe("POST /api/refunds — guards", () => {
  it("400s without a customerId", async () => {
    const res = await POST(req({}) as never);
    expect(res.status).toBe(400);
  });

  it("404s when the customer is not found", async () => {
    mockCustomer(null);
    const res = await POST(req({ customerId: "missing" }) as never);
    expect(res.status).toBe(404);
  });

  it("400s and never calls Square for a FREE-EVENT booking (synthetic id)", async () => {
    mockCustomer(customerDoc({ squarePaymentId: "FREE-EVENT" }));
    const res = await POST(req({ customerId: "c1" }) as never);
    expect(res.status).toBe(400);
    expect(refundPayment).not.toHaveBeenCalled();
  });

  it("400s and never calls Square for a gift-card-only booking (GIFTCARD- id)", async () => {
    mockCustomer(customerDoc({ squarePaymentId: "GIFTCARD-gc_1" }));
    const res = await POST(req({ customerId: "c1" }) as never);
    expect(res.status).toBe(400);
    expect(refundPayment).not.toHaveBeenCalled();
  });

  it("400s when there is no payment id at all", async () => {
    mockCustomer(customerDoc({ squarePaymentId: undefined }));
    const res = await POST(req({ customerId: "c1" }) as never);
    expect(res.status).toBe(400);
    expect(refundPayment).not.toHaveBeenCalled();
  });

  it("400s when already fully refunded", async () => {
    mockCustomer(customerDoc({ refundStatus: "full" }));
    const res = await POST(req({ customerId: "c1" }) as never);
    expect(res.status).toBe(400);
    expect(refundPayment).not.toHaveBeenCalled();
  });
});

describe("POST /api/refunds — refund processing", () => {
  it("issues a full refund as BigInt cents and marks the booking fully refunded", async () => {
    const doc = customerDoc();
    mockCustomer(doc);
    const res = await POST(req({ customerId: "c1" }) as never);
    expect(res.status).toBe(200);

    expect(refundPayment).toHaveBeenCalledTimes(1);
    const call = refundPayment.mock.calls[0][0];
    expect(call.paymentId).toBe("pay_real_1");
    expect(call.amountMoney.amount).toBe(BigInt(10000)); // $100 -> 10000 cents
    expect(doc.refundStatus).toBe("full");
    expect(doc.save).toHaveBeenCalled();
  });

  it("issues a partial refund and marks the booking partially refunded", async () => {
    const doc = customerDoc();
    mockCustomer(doc);
    const res = await POST(req({ customerId: "c1", refundAmount: 30 }) as never);
    expect(res.status).toBe(200);

    expect(refundPayment.mock.calls[0][0].amountMoney.amount).toBe(BigInt(3000)); // $30
    expect(doc.refundStatus).toBe("partial");
    expect(doc.refundAmount).toBe(30);
  });
});
