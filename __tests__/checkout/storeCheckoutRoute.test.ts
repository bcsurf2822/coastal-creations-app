import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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
const ordersCreate = vi.fn();
const ordersUpdate = vi.fn();
const ordersPay = vi.fn();
vi.mock("@/lib/square/client", () => ({
  getSquareClient: () => ({
    payments: { create: (...a: unknown[]) => paymentsCreate(...a) },
    orders: {
      create: (...a: unknown[]) => ordersCreate(...a),
      update: (...a: unknown[]) => ordersUpdate(...a),
      pay: (...a: unknown[]) => ordersPay(...a),
    },
  }),
}));

const findOrCreateCustomer = vi.fn();
vi.mock("@/lib/square/customers", () => ({
  squareCustomerService: { findOrCreateCustomer: (...a: unknown[]) => findOrCreateCustomer(...a) },
}));

const cardGetCard = vi.fn();
const cardCreateCard = vi.fn();
vi.mock("@/lib/square/cards", () => ({
  squareCardService: {
    getCard: (...a: unknown[]) => cardGetCard(...a),
    createCard: (...a: unknown[]) => cardCreateCard(...a),
  },
}));

const resolveUserSquareCustomerId = vi.fn();
vi.mock("@/lib/square/userCustomer", () => ({
  resolveUserSquareCustomerId: (...a: unknown[]) =>
    resolveUserSquareCustomerId(...a),
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
  // Launch gate: the route 503s unless the shop is enabled (lib/constants/
  // featureFlags.ts). Every test here exercises the route past that gate.
  vi.stubEnv("NEXT_PUBLIC_SHOP_ENABLED", "true");
  vi.stubEnv("SQUARE_LOCATION_ID", "loc_test_1");
  priceCartFromCatalog.mockResolvedValue({
    items: [
      { squareCatalogItemId: "item_1", squareVariationId: "var_1", name: "Garden Art Kit", variationName: "Regular", quantity: 1, unitPriceCents: 8800 },
    ],
    subtotalCents: 8800,
  });
  resolveShippingRate.mockResolvedValue(RATE);
  ordersCreate.mockResolvedValue({ order: { id: "sqorder_1", version: 1 } });
  ordersUpdate.mockResolvedValue({ order: { id: "sqorder_1", version: 2, state: "CANCELED" } });
  ordersPay.mockResolvedValue({ order: { id: "sqorder_1", state: "COMPLETED" } });
  paymentsCreate.mockResolvedValue({
    payment: { id: "pay_1", status: "COMPLETED", receiptUrl: "https://squareup.com/receipt/pay_1" },
  });
  findOrCreateCustomer.mockResolvedValue({ customerId: "sqcust_1" });
  purchaseLabelForOrder.mockResolvedValue({ labelUrl: "https://label", trackingNumber: "TRK1" });
  orderCreate.mockResolvedValue({ _id: { toString: () => "order_1" }, orderNumber: "CC-TEST-1" });
  orderFindByIdAndUpdate.mockResolvedValue({});
  emailSend.mockResolvedValue({});
  getSessionUser.mockResolvedValue(null); // default: guest checkout
  usersUpdateOne.mockResolvedValue({});
  resolveUserSquareCustomerId.mockResolvedValue("acct_cust_1");
  cardGetCard.mockResolvedValue({ id: "ccof:1", customerId: "acct_cust_1" });
  cardCreateCard.mockResolvedValue({ id: "ccof:new" });
});

afterEach(() => {
  vi.unstubAllEnvs();
});

const SIGNED_IN = { id: "user_1", email: "u@example.com", isAdmin: false, role: "customer" };

describe("POST /api/store/checkout", () => {
  it("charges the server total, creates the order, buys a label, returns the order number", async () => {
    const res = await POST(req(baseBody()));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.orderNumber).toBe("CC-TEST-1");

    // Charged subtotal + shipping + NJ tax (8800 + 570 + 621 = 9991) as BigInt cents.
    // SELF_ADDRESS ships to NJ; 6.625% on the taxable base of 9370 rounds to 621.
    expect(paymentsCreate).toHaveBeenCalledTimes(1);
    expect(paymentsCreate.mock.calls[0][0].amountMoney.amount).toBe(BigInt(9991));

    // A real Square Order is created BEFORE the charge, with catalog-linked line
    // items — this is the inventory-decrement fix. One line per cart item, plus a
    // plain shipping+tax line, no gift-card discount on this order.
    expect(ordersCreate).toHaveBeenCalledTimes(1);
    const orderRequest = ordersCreate.mock.calls[0][0];
    expect(orderRequest.order.locationId).toBe("loc_test_1");
    expect(orderRequest.order.lineItems).toEqual([
      {
        catalogObjectId: "var_1",
        quantity: "1",
        basePriceMoney: { amount: BigInt(8800), currency: "USD" },
      },
      {
        name: "Shipping & Tax",
        quantity: "1",
        basePriceMoney: { amount: BigInt(1191), currency: "USD" },
      },
    ]);
    expect(orderRequest.order.discounts).toBeUndefined();

    // The payment is linked to that order.
    expect(paymentsCreate.mock.calls[0][0].orderId).toBe("sqorder_1");
    expect(paymentsCreate.mock.calls[0][0].locationId).toBe("loc_test_1");

    expect(orderCreate).toHaveBeenCalledTimes(1);
    const order = orderCreate.mock.calls[0][0];
    expect(order.totalCents).toBe(9991);
    expect(order.subtotalCents).toBe(8800);
    expect(order.shippingCents).toBe(570);
    expect(order.taxCents).toBe(621);
    expect(order.status).toBe("paid");
    expect(purchaseLabelForOrder).toHaveBeenCalledWith("order_1");

    // Square receipt + order id captured on the order + receipt returned for the
    // confirmation page.
    expect(order.square.receiptUrl).toBe("https://squareup.com/receipt/pay_1");
    expect(order.square.orderId).toBe("sqorder_1");
    expect(data.receiptUrl).toBe("https://squareup.com/receipt/pay_1");
  });

  it("reuses the same idempotency key for the Square order and the payment", async () => {
    await POST(req(baseBody({ idempotencyKey: "idem-shared" })));
    expect(ordersCreate.mock.calls[0][0].idempotencyKey).toBe("idem-shared");
    expect(paymentsCreate.mock.calls[0][0].idempotencyKey).toBe("idem-shared");
  });

  it("maps a multi-item cart to one Square order line item per line", async () => {
    priceCartFromCatalog.mockResolvedValue({
      items: [
        { squareCatalogItemId: "item_1", squareVariationId: "var_1", name: "Garden Art Kit", variationName: "Regular", quantity: 2, unitPriceCents: 8800 },
        { squareCatalogItemId: "item_2", squareVariationId: "var_2", name: "Mushroom Kit", variationName: "Regular", quantity: 1, unitPriceCents: 1500 },
      ],
      subtotalCents: 19100,
    });
    const res = await POST(req(baseBody()));
    expect(res.status).toBe(200);

    const lineItems = ordersCreate.mock.calls[0][0].order.lineItems;
    expect(lineItems[0]).toEqual({
      catalogObjectId: "var_1",
      quantity: "2",
      basePriceMoney: { amount: BigInt(8800), currency: "USD" },
    });
    expect(lineItems[1]).toEqual({
      catalogObjectId: "var_2",
      quantity: "1",
      basePriceMoney: { amount: BigInt(1500), currency: "USD" },
    });
  });

  it("fails closed (no charge, no order saved) when Square order creation fails", async () => {
    ordersCreate.mockRejectedValue(new Error("Square Orders API down"));
    const res = await POST(req(baseBody()));

    expect(res.status).toBe(500);
    expect(paymentsCreate).not.toHaveBeenCalled();
    expect(orderCreate).not.toHaveBeenCalled();
  });

  it("best-effort cancels the Square order when the payment is not COMPLETED (non-fatal on cancel failure)", async () => {
    paymentsCreate.mockResolvedValue({ payment: { id: "pay_x", status: "FAILED" } });
    ordersUpdate.mockRejectedValue(new Error("cancel also failed"));

    const res = await POST(req(baseBody()));

    expect(res.status).toBe(400);
    expect(orderCreate).not.toHaveBeenCalled();
    expect(ordersUpdate).toHaveBeenCalledTimes(1);
    expect(ordersUpdate.mock.calls[0][0].orderId).toBe("sqorder_1");
    expect(ordersUpdate.mock.calls[0][0].order.state).toBe("CANCELED");
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

    // Gift card offsets the subtotal only — never shipping or tax. Card charged
    // the shipping + NJ tax remainder (570 + 621 = 1191), never $0.
    expect(paymentsCreate).toHaveBeenCalledTimes(1);
    expect(paymentsCreate.mock.calls[0][0].amountMoney.amount).toBe(BigInt(1191));
    // Redeemed exactly the subtotal.
    expect(giftCardRedeem).toHaveBeenCalledWith("gc_1", 8800, "buyer@example.com");
    const order = orderCreate.mock.calls[0][0];
    expect(order.giftCard).toEqual({ giftCardId: "gc_1", amountCents: 8800 });

    // The Square order carries an ORDER-scoped FIXED_AMOUNT discount for the
    // applied gift card, so numbers (never Square's own tax/discount engine)
    // stay the single source of truth for what's charged.
    const orderRequest = ordersCreate.mock.calls[0][0];
    expect(orderRequest.order.discounts).toEqual([
      {
        name: "Gift Card Applied",
        type: "FIXED_AMOUNT",
        scope: "ORDER",
        amountMoney: { amount: BigInt(8800), currency: "USD" },
      },
    ]);
  });

  it("completes the Square order with no linked payment when a gift card covers the entire total ($0 charge)", async () => {
    // Free shipping + $0 tax + a gift card covering the full subtotal exactly.
    resolveShippingRate.mockResolvedValue({ ...RATE, rateCents: 0 });
    priceCartFromCatalog.mockResolvedValue({
      items: [
        { squareCatalogItemId: "item_1", squareVariationId: "var_1", name: "Garden Art Kit", variationName: "Regular", quantity: 1, unitPriceCents: 8800 },
      ],
      subtotalCents: 8800,
    });
    giftCardGetById.mockResolvedValue({ state: "ACTIVE", balanceMoney: { amount: 8800 } });
    giftCardRedeem.mockResolvedValue({});

    const res = await POST(
      req({
        ...baseBody({ giftCard: { giftCardId: "gc_1", amountCents: 8800 } }),
        shippingAddress: { ...SELF_ADDRESS, stateProvince: "NY" }, // no NJ tax
      })
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(paymentsCreate).not.toHaveBeenCalled();
    expect(ordersPay).toHaveBeenCalledTimes(1);
    expect(ordersPay.mock.calls[0][0]).toEqual({
      orderId: "sqorder_1",
      idempotencyKey: "idem-1",
      paymentIds: [],
    });

    const order = orderCreate.mock.calls[0][0];
    expect(order.status).toBe("paid");
    expect(order.square.orderId).toBe("sqorder_1");
    expect(order.square.paymentId).toBeUndefined();
  });

  it("cancels the Square order and never saves it when gift card redemption fails on a $0-charge order", async () => {
    resolveShippingRate.mockResolvedValue({ ...RATE, rateCents: 0 });
    priceCartFromCatalog.mockResolvedValue({
      items: [
        { squareCatalogItemId: "item_1", squareVariationId: "var_1", name: "Garden Art Kit", variationName: "Regular", quantity: 1, unitPriceCents: 8800 },
      ],
      subtotalCents: 8800,
    });
    giftCardGetById.mockResolvedValue({ state: "ACTIVE", balanceMoney: { amount: 8800 } });
    giftCardRedeem.mockRejectedValue(new Error("redemption failed"));

    const res = await POST(
      req({
        ...baseBody({ giftCard: { giftCardId: "gc_1", amountCents: 8800 } }),
        shippingAddress: { ...SELF_ADDRESS, stateProvince: "NY" },
      })
    );

    expect(res.status).toBe(400);
    expect(ordersPay).not.toHaveBeenCalled();
    expect(ordersUpdate).toHaveBeenCalledTimes(1);
    expect(ordersUpdate.mock.calls[0][0].order.state).toBe("CANCELED");
    expect(orderCreate).not.toHaveBeenCalled();
  });

  it("rejects (400) and never charges when the cart fails price integrity", async () => {
    priceCartFromCatalog.mockRejectedValue(new PriceIntegrityError("Item unavailable"));
    const res = await POST(req(baseBody()));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Item unavailable");
    expect(ordersCreate).not.toHaveBeenCalled();
    expect(paymentsCreate).not.toHaveBeenCalled();
    expect(orderCreate).not.toHaveBeenCalled();
  });

  it("rejects (400) when the chosen shipping rate can no longer be quoted", async () => {
    resolveShippingRate.mockRejectedValue(new PriceIntegrityError("Shipping rate unavailable"));
    const res = await POST(req(baseBody()));
    expect(res.status).toBe(400);
    expect(ordersCreate).not.toHaveBeenCalled();
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

  it("returns 400 and never charges when a required nested field is blank (e.g. shippingAddress.city)", async () => {
    const res = await POST(
      req(baseBody({ shippingAddress: { ...SELF_ADDRESS, city: "" } }))
    );
    expect(res.status).toBe(400);
    expect(paymentsCreate).not.toHaveBeenCalled();
    expect(orderCreate).not.toHaveBeenCalled();
  });

  it("returns 400 and never charges when a required customer field is missing", async () => {
    const res = await POST(
      req(baseBody({ customer: { ...BUYER, lastName: undefined } }))
    );
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

  it("charges a saved card by id under the signed-in user's customer", async () => {
    getSessionUser.mockResolvedValue(SIGNED_IN);
    const res = await POST(
      req(baseBody({ paymentToken: undefined, savedCardId: "ccof:1" }))
    );
    expect(res.status).toBe(200);

    const charge = paymentsCreate.mock.calls[0][0];
    expect(charge.sourceId).toBe("ccof:1");
    expect(charge.customerId).toBe("acct_cust_1");
    // Ownership was verified against the user's customer.
    expect(cardGetCard).toHaveBeenCalledWith("ccof:1");
  });

  it("rejects (404) and never charges a saved card the user does not own", async () => {
    getSessionUser.mockResolvedValue(SIGNED_IN);
    cardGetCard.mockResolvedValue({ id: "ccof:1", customerId: "someone_else" });
    const res = await POST(
      req(baseBody({ paymentToken: undefined, savedCardId: "ccof:1" }))
    );
    expect(res.status).toBe(404);
    expect(paymentsCreate).not.toHaveBeenCalled();
  });

  it("requires sign-in to use a saved card (401)", async () => {
    getSessionUser.mockResolvedValue(null);
    const res = await POST(
      req(baseBody({ paymentToken: undefined, savedCardId: "ccof:1" }))
    );
    expect(res.status).toBe(401);
    expect(paymentsCreate).not.toHaveBeenCalled();
  });

  it("saves the new card on file after charge when saveCard is set and signed in", async () => {
    getSessionUser.mockResolvedValue(SIGNED_IN);
    const res = await POST(req(baseBody({ saveCard: true })));
    expect(res.status).toBe(200);

    expect(resolveUserSquareCustomerId).toHaveBeenCalledWith(SIGNED_IN, {
      createIfMissing: true,
    });
    // Card filed from the PAYMENT id (the one-time nonce is already spent).
    const arg = cardCreateCard.mock.calls[0][0];
    expect(arg.sourceId).toBe("pay_1");
    expect(arg.customerId).toBe("acct_cust_1");
  });

  it("forwards the SCA verificationToken to the charge", async () => {
    const res = await POST(req(baseBody({ verificationToken: "verif_1" })));
    expect(res.status).toBe(200);
    expect(paymentsCreate.mock.calls[0][0].verificationToken).toBe("verif_1");
  });
});
