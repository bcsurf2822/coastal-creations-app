import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { PricedItem } from "@/lib/checkout/storePricing";

const ordersCreate = vi.fn();
const ordersUpdate = vi.fn();
const ordersPay = vi.fn();
vi.mock("@/lib/square/client", () => ({
  getSquareClient: () => ({
    orders: {
      create: (...a: unknown[]) => ordersCreate(...a),
      update: (...a: unknown[]) => ordersUpdate(...a),
      pay: (...a: unknown[]) => ordersPay(...a),
    },
  }),
}));

import {
  buildStoreOrderLineItems,
  createSquareOrderForCart,
  cancelSquareOrderBestEffort,
  completeZeroChargeOrder,
} from "@/lib/square/storeOrders";

const ITEM: PricedItem = {
  squareCatalogItemId: "item_1",
  squareVariationId: "var_1",
  name: "Garden Art Kit",
  variationName: "Regular",
  quantity: 2,
  unitPriceCents: 8800,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("SQUARE_LOCATION_ID", "loc_test_1");
  ordersCreate.mockResolvedValue({ order: { id: "sqorder_1", version: 1 } });
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("buildStoreOrderLineItems", () => {
  it("maps a priced item to a catalog-linked line item with a string quantity", () => {
    const lineItems = buildStoreOrderLineItems([ITEM], 0);
    expect(lineItems).toEqual([
      {
        catalogObjectId: "var_1",
        quantity: "2",
        basePriceMoney: { amount: BigInt(8800), currency: "USD" },
      },
    ]);
  });

  it("appends a plain shipping+tax line only when non-zero", () => {
    expect(buildStoreOrderLineItems([ITEM], 0)).toHaveLength(1);

    const withShipping = buildStoreOrderLineItems([ITEM], 1191);
    expect(withShipping).toHaveLength(2);
    expect(withShipping[1]).toEqual({
      name: "Shipping & Tax",
      quantity: "1",
      basePriceMoney: { amount: BigInt(1191), currency: "USD" },
    });
    expect(withShipping[1].catalogObjectId).toBeUndefined();
  });

  it("maps multiple items 1:1, preserving order", () => {
    const second: PricedItem = { ...ITEM, squareCatalogItemId: "item_2", squareVariationId: "var_2", quantity: 1, unitPriceCents: 1500 };
    const lineItems = buildStoreOrderLineItems([ITEM, second], 0);
    expect(lineItems).toHaveLength(2);
    expect(lineItems[0].catalogObjectId).toBe("var_1");
    expect(lineItems[1].catalogObjectId).toBe("var_2");
  });
});

describe("createSquareOrderForCart", () => {
  it("creates an order with the location id, line items, and no discount by default", async () => {
    const result = await createSquareOrderForCart({
      pricedItems: [ITEM],
      shippingAndTaxCents: 1191,
      giftCardAppliedCents: 0,
      idempotencyKey: "idem-1",
    });

    expect(result).toEqual({ orderId: "sqorder_1", version: 1, locationId: "loc_test_1" });
    const request = ordersCreate.mock.calls[0][0];
    expect(request.idempotencyKey).toBe("idem-1");
    expect(request.order.locationId).toBe("loc_test_1");
    expect(request.order.lineItems).toHaveLength(2);
    expect(request.order.discounts).toBeUndefined();
  });

  it("adds an ORDER-scoped FIXED_AMOUNT discount when a gift card was applied", async () => {
    await createSquareOrderForCart({
      pricedItems: [ITEM],
      shippingAndTaxCents: 0,
      giftCardAppliedCents: 8800,
      idempotencyKey: "idem-1",
    });

    const request = ordersCreate.mock.calls[0][0];
    expect(request.order.discounts).toEqual([
      {
        name: "Gift Card Applied",
        type: "FIXED_AMOUNT",
        scope: "ORDER",
        amountMoney: { amount: BigInt(8800), currency: "USD" },
      },
    ]);
  });

  it("throws (fail closed) when SQUARE_LOCATION_ID is not configured", async () => {
    vi.stubEnv("SQUARE_LOCATION_ID", "");
    await expect(
      createSquareOrderForCart({
        pricedItems: [ITEM],
        shippingAndTaxCents: 0,
        giftCardAppliedCents: 0,
        idempotencyKey: "idem-1",
      })
    ).rejects.toThrow("Square location ID is not configured");
    expect(ordersCreate).not.toHaveBeenCalled();
  });

  it("throws (fail closed) when Square returns an order with no id or version", async () => {
    ordersCreate.mockResolvedValue({ order: {} });
    await expect(
      createSquareOrderForCart({
        pricedItems: [ITEM],
        shippingAndTaxCents: 0,
        giftCardAppliedCents: 0,
        idempotencyKey: "idem-1",
      })
    ).rejects.toThrow("Failed to create Square order for cart");
  });
});

describe("cancelSquareOrderBestEffort", () => {
  it("cancels the order with its current version and CANCELED state", async () => {
    ordersUpdate.mockResolvedValue({ order: { id: "sqorder_1", state: "CANCELED" } });
    await cancelSquareOrderBestEffort("sqorder_1", 1);

    expect(ordersUpdate).toHaveBeenCalledWith({
      orderId: "sqorder_1",
      order: { locationId: "loc_test_1", version: 1, state: "CANCELED" },
    });
  });

  it("swallows a thrown error and never rejects", async () => {
    ordersUpdate.mockRejectedValue(new Error("Square is down"));
    await expect(cancelSquareOrderBestEffort("sqorder_1", 1)).resolves.toBeUndefined();
  });
});

describe("completeZeroChargeOrder", () => {
  it("pays the order with no linked payment ids", async () => {
    await completeZeroChargeOrder("sqorder_1", "idem-1");
    expect(ordersPay).toHaveBeenCalledWith({
      orderId: "sqorder_1",
      idempotencyKey: "idem-1",
      paymentIds: [],
    });
  });

  it("swallows a thrown error and never rejects", async () => {
    ordersPay.mockRejectedValue(new Error("Square is down"));
    await expect(completeZeroChargeOrder("sqorder_1", "idem-1")).resolves.toBeUndefined();
  });
});
