import { describe, it, expect, vi, beforeEach } from "vitest";
import { PriceIntegrityError } from "@/lib/checkout/errors";

// --- Mock every dependency the store checkout route orchestrates ---
const priceCartFromCatalog = vi.fn();
const resolveShippingRate = vi.fn();
vi.mock("@/lib/checkout/storePricing", () => ({
  priceCartFromCatalog: (...a: unknown[]) => priceCartFromCatalog(...a),
  resolveShippingRate: (...a: unknown[]) => resolveShippingRate(...a),
  PriceIntegrityError,
}));

const paymentsCreate = vi.fn();
vi.mock("@/lib/square/client", () => ({
  getSquareClient: () => ({ payments: { create: (...a: unknown[]) => paymentsCreate(...a) } }),
}));

const findOrCreateCustomer = vi.fn();
vi.mock("@/lib/square/customers", () => ({
  squareCustomerService: { findOrCreateCustomer: (...a: unknown[]) => findOrCreateCustomer(...a) },
}));

const giftCardGetById = vi.fn();
const giftCardRedeem = vi.fn();
vi.mock("@/lib/square/gift-cards", () => ({
  giftCardService: {
    getById: (...a: unknown[]) => giftCardGetById(...a),
    redeem: (...a: unknown[]) => giftCardRedeem(...a),
  },
}));

const purchaseLabelForOrder = vi.fn();
vi.mock("@/lib/shippo/labels", () => ({
  purchaseLabelForOrder: (...a: unknown[]) => purchaseLabelForOrder(...a),
}));

const orderCreate = vi.fn();
const orderFindByIdAndUpdate = vi.fn();
vi.mock("@/lib/models/Order", () => ({
  default: {
    create: (...a: unknown[]) => orderCreate(...a),
    findByIdAndUpdate: (...a: unknown[]) => orderFindByIdAndUpdate(...a),
  },
}));

vi.mock("@/lib/mongoose", () => ({ connectMongo: vi.fn() }));
vi.mock("@react-email/render", () => ({ render: vi.fn().mockResolvedValue("<html></html>") }));

const emailSend = vi.fn();
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: (...a: unknown[]) => emailSend(...a) };
  },
}));

// Authenticated-user identity (null = guest). Drives the durable userId stamp.
const getSessionUser = vi.fn();
vi.mock("@/lib/auth/guards", () => ({
  getSessionUser: (...a: unknown[]) => getSessionUser(...a),
}));

// The route uses mongoose.Types.ObjectId + a direct driver update on `users`.
const usersUpdateOne = vi.fn();
vi.mock("mongoose", () => {
  class ObjectId {
    constructor(public value: string) {}
    toString(): string {
      return this.value;
    }
  }
  return {
    default: {
      Types: { ObjectId },
      connection: {
        collection: () => ({ updateOne: (...a: unknown[]) => usersUpdateOne(...a) }),
      },
    },
  };
});

import { POST } from "@/app/api/store/checkout/route";

const BUYER = { firstName: "Pat", lastName: "Buyer", email: "buyer@example.com", phone: "(609) 555-1234" };
const SELF_ADDRESS = {
  name: "Pat Buyer",
  addressLine1: "1 Main St",
  city: "Ocean City",
  stateProvince: "NJ",
  postalCode: "08226",
  country: "US",
};
const GIFT_ADDRESS = {
  name: "Riley Recipient",
  addressLine1: "20 W 34th St",
  city: "New York",
  stateProvince: "NY",
  postalCode: "10001",
  country: "US",
};
const RATE = { rateId: "rate_1", carrier: "USPS", service: "usps_ground_advantage", serviceName: "USPS Ground Advantage", rateCents: 570 };
const ITEMS = [{ squareCatalogItemId: "item_1", squareVariationId: "var_1", quantity: 1 }];

function req(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/store/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function baseBody(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    paymentToken: "cnon:card-nonce-ok",
    customer: BUYER,
    shippingAddress: SELF_ADDRESS,
    selectedRate: RATE,
    items: ITEMS,
    subtotalCents: 8800,
    idempotencyKey: "idem-1",
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  priceCartFromCatalog.mockResolvedValue({
    items: [
      { squareCatalogItemId: "item_1", squareVariationId: "var_1", name: "Garden Art Kit", variationName: "Regular", quantity: 1, unitPriceCents: 8800 },
    ],
    subtotalCents: 8800,
  });
  resolveShippingRate.mockResolvedValue(RATE);
  paymentsCreate.mockResolvedValue({ payment: { id: "pay_1", status: "COMPLETED" } });
  findOrCreateCustomer.mockResolvedValue({ customerId: "sqcust_1" });
  purchaseLabelForOrder.mockResolvedValue({ labelUrl: "https://label", trackingNumber: "TRK1" });
  orderCreate.mockResolvedValue({ _id: { toString: () => "order_1" }, orderNumber: "CC-TEST-1" });
  orderFindByIdAndUpdate.mockResolvedValue({});
  emailSend.mockResolvedValue({});
  getSessionUser.mockResolvedValue(null); // default: guest checkout
  usersUpdateOne.mockResolvedValue({});
});

describe("POST /api/store/checkout", () => {
  it("charges the server total, creates the order, buys a label, returns the order number", async () => {
    const res = await POST(req(baseBody()));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.orderNumber).toBe("CC-TEST-1");

    // Charged subtotal + shipping (8800 + 570) as BigInt cents.
    expect(paymentsCreate).toHaveBeenCalledTimes(1);
    expect(paymentsCreate.mock.calls[0][0].amountMoney.amount).toBe(BigInt(9370));

    expect(orderCreate).toHaveBeenCalledTimes(1);
    const order = orderCreate.mock.calls[0][0];
    expect(order.totalCents).toBe(9370);
    expect(order.subtotalCents).toBe(8800);
    expect(order.shippingCents).toBe(570);
    expect(order.status).toBe("paid");
    expect(purchaseLabelForOrder).toHaveBeenCalledWith("order_1");
  });

  it("ships to the RECIPIENT on a gift order while charging the BUYER (A1)", async () => {
    const res = await POST(req(baseBody({ shippingAddress: GIFT_ADDRESS })));
    expect(res.status).toBe(200);

    // Square payment: payer is the buyer, ship-to name is the recipient (split).
    const charge = paymentsCreate.mock.calls[0][0];
    expect(charge.buyerEmailAddress).toBe("buyer@example.com");
    expect(charge.shippingAddress.firstName).toBe("Riley");
    expect(charge.shippingAddress.lastName).toBe("Recipient");
    expect(charge.shippingAddress.postalCode).toBe("10001");

    // Order: customer is the buyer; shippingAddress carries the recipient name.
    const order = orderCreate.mock.calls[0][0];
    expect(order.customer.email).toBe("buyer@example.com");
    expect(order.shippingAddress.name).toBe("Riley Recipient");
    expect(order.shippingAddress.postalCode).toBe("10001");
  });

  it("applies a gift card to the SUBTOTAL ONLY — shipping is always charged to the card", async () => {
    // Card balance far exceeds the order; must still clamp to subtotal (8800).
    giftCardGetById.mockResolvedValue({ state: "ACTIVE", balanceMoney: { amount: 100000 } });
    giftCardRedeem.mockResolvedValue({});

    const res = await POST(
      req(baseBody({ giftCard: { giftCardId: "gc_1", amountCents: 100000 } }))
    );
    expect(res.status).toBe(200);

    // Card charged only the shipping remainder (570), never $0.
    expect(paymentsCreate).toHaveBeenCalledTimes(1);
    expect(paymentsCreate.mock.calls[0][0].amountMoney.amount).toBe(BigInt(570));
    // Redeemed exactly the subtotal.
    expect(giftCardRedeem).toHaveBeenCalledWith("gc_1", 8800, "buyer@example.com");
    const order = orderCreate.mock.calls[0][0];
    expect(order.giftCard).toEqual({ giftCardId: "gc_1", amountCents: 8800 });
  });

  it("rejects (400) and never charges when the cart fails price integrity", async () => {
    priceCartFromCatalog.mockRejectedValue(new PriceIntegrityError("Item unavailable"));
    const res = await POST(req(baseBody()));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Item unavailable");
    expect(paymentsCreate).not.toHaveBeenCalled();
    expect(orderCreate).not.toHaveBeenCalled();
  });

  it("rejects (400) when the chosen shipping rate can no longer be quoted", async () => {
    resolveShippingRate.mockRejectedValue(new PriceIntegrityError("Shipping rate unavailable"));
    const res = await POST(req(baseBody()));
    expect(res.status).toBe(400);
    expect(paymentsCreate).not.toHaveBeenCalled();
    expect(orderCreate).not.toHaveBeenCalled();
  });

  it("keeps the order as paid when the Shippo label fails (non-fatal)", async () => {
    purchaseLabelForOrder.mockRejectedValue(new Error("Shippo down"));
    const res = await POST(req(baseBody()));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(orderCreate.mock.calls[0][0].status).toBe("paid");
  });

  it("returns 400 on missing required fields and never charges", async () => {
    const res = await POST(req({ customer: BUYER, items: [] }));
    expect(res.status).toBe(400);
    expect(paymentsCreate).not.toHaveBeenCalled();
    expect(orderCreate).not.toHaveBeenCalled();
  });

  it("returns 400 and creates no order when Square reports payment not COMPLETED", async () => {
    paymentsCreate.mockResolvedValue({ payment: { id: "pay_x", status: "FAILED" } });
    const res = await POST(req(baseBody()));
    expect(res.status).toBe(400);
    expect(orderCreate).not.toHaveBeenCalled();
  });

  it("stamps userId and links the Square customer to the user when signed in", async () => {
    getSessionUser.mockResolvedValue({
      id: "6650f0000000000000000abc",
      email: "account@example.com",
    });
    const res = await POST(req(baseBody()));
    expect(res.status).toBe(200);

    // Durable user link stamped on the order.
    const order = orderCreate.mock.calls[0][0];
    expect(order.userId.toString()).toBe("6650f0000000000000000abc");

    // Square customer associated to the user record exactly once, only when unset.
    expect(usersUpdateOne).toHaveBeenCalledTimes(1);
    const [filter, update] = usersUpdateOne.mock.calls[0];
    expect(filter.squareCustomerId).toEqual({ $exists: false });
    expect(update.$set.squareCustomerId).toBe("sqcust_1");
  });

  it("leaves userId unset and writes no user link for a guest checkout", async () => {
    // getSessionUser default is null (guest)
    const res = await POST(req(baseBody()));
    expect(res.status).toBe(200);

    const order = orderCreate.mock.calls[0][0];
    expect(order.userId).toBeUndefined();
    expect(usersUpdateOne).not.toHaveBeenCalled();
  });

  it("charges the BUYER's submitted email, never the signed-in account email", async () => {
    getSessionUser.mockResolvedValue({
      id: "6650f0000000000000000abc",
      email: "account@example.com",
    });
    const res = await POST(req(baseBody()));
    expect(res.status).toBe(200);

    // Identity link uses the session; the charge + receipt stay with the typed buyer.
    expect(paymentsCreate.mock.calls[0][0].buyerEmailAddress).toBe("buyer@example.com");
    expect(orderCreate.mock.calls[0][0].customer.email).toBe("buyer@example.com");
  });
});
