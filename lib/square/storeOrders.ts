/**
 * Square Order building for the store checkout.
 *
 * Wires cart line items to real Square catalog objects (via catalogObjectId)
 * so a store sale decrements Square's own per-item inventory count — mirroring
 * the order-then-payment pattern already proven in lib/square/gift-cards.ts.
 * Every dollar amount here comes from numbers this app already computed and
 * trusts (lib/checkout/storePricing.ts, lib/utils/salesTax.ts) — never
 * recomputed by Square's own tax/discount engine, so the order total always
 * equals the amount actually charged.
 */
import { getSquareClient } from "@/lib/square/client";
import type { PricedItem } from "@/lib/checkout/storePricing";

const client = getSquareClient();

function getSquareLocationId(): string {
  return (
    process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID ||
    process.env.SQUARE_LOCATION_ID ||
    ""
  );
}

interface StoreOrderLineItem {
  catalogObjectId?: string;
  name?: string;
  quantity: string;
  basePriceMoney: { amount: bigint; currency: "USD" };
}

/**
 * Pure mapping: priced cart items -> Square Order line items, plus one plain
 * (non-catalog) line for shipping+tax combined when non-zero. No I/O.
 */
export function buildStoreOrderLineItems(
  pricedItems: PricedItem[],
  shippingAndTaxCents: number
): StoreOrderLineItem[] {
  const lineItems: StoreOrderLineItem[] = pricedItems.map((item) => ({
    catalogObjectId: item.squareVariationId,
    quantity: String(item.quantity),
    basePriceMoney: { amount: BigInt(item.unitPriceCents), currency: "USD" },
  }));

  if (shippingAndTaxCents > 0) {
    lineItems.push({
      name: "Shipping & Tax",
      quantity: "1",
      basePriceMoney: { amount: BigInt(shippingAndTaxCents), currency: "USD" },
    });
  }

  return lineItems;
}

/**
 * Creates the real Square Order for a cart, BEFORE any charge is attempted.
 * Callers must fail closed if this throws — never fall back to a bare
 * payments.create() call, which would silently reintroduce the catalog-less
 * charge this module exists to fix.
 */
export async function createSquareOrderForCart(input: {
  pricedItems: PricedItem[];
  shippingAndTaxCents: number;
  giftCardAppliedCents: number;
  idempotencyKey: string;
}): Promise<{ orderId: string; version: number; locationId: string }> {
  const locationId = getSquareLocationId();
  if (!locationId) {
    throw new Error("Square location ID is not configured");
  }

  const orderResponse = await client.orders.create({
    idempotencyKey: input.idempotencyKey,
    order: {
      locationId,
      lineItems: buildStoreOrderLineItems(
        input.pricedItems,
        input.shippingAndTaxCents
      ),
      ...(input.giftCardAppliedCents > 0
        ? {
            discounts: [
              {
                name: "Gift Card Applied",
                type: "FIXED_AMOUNT",
                scope: "ORDER",
                amountMoney: {
                  amount: BigInt(input.giftCardAppliedCents),
                  currency: "USD",
                },
              },
            ],
          }
        : {}),
    },
  });

  const order = orderResponse.order;
  if (!order?.id || order.version == null) {
    console.error(
      "[SQUARE-STORE-ORDERS-createSquareOrderForCart] Unexpected order response shape"
    );
    throw new Error("Failed to create Square order for cart");
  }

  console.log(
    "[SQUARE-STORE-ORDERS-createSquareOrderForCart] Order created:",
    order.id
  );
  return { orderId: order.id, version: order.version, locationId };
}

/**
 * Best-effort cancel of an unpaid Square order (e.g. the payment meant to
 * complete it failed, or a validation error surfaced after the order was
 * created). Never throws — an unpaid OPEN order is harmless (Square never
 * decrements inventory for it), so a failed cancel must not change the
 * customer-facing response. Merchant-visible cleanliness only.
 */
export async function cancelSquareOrderBestEffort(
  orderId: string,
  version: number
): Promise<void> {
  try {
    const locationId = getSquareLocationId();
    await client.orders.update({
      orderId,
      order: { locationId, version, state: "CANCELED" },
    });
    console.log(
      "[SQUARE-STORE-ORDERS-cancelSquareOrderBestEffort] Canceled unpaid order:",
      orderId
    );
  } catch (error) {
    console.error(
      "[SQUARE-STORE-ORDERS-cancelSquareOrderBestEffort] Best-effort cancel failed (non-fatal):",
      orderId,
      error
    );
  }
}

/**
 * Completes a Square order that a gift card covered in full (chargeCents ===
 * 0, so there's no payment to link it to) — the order still needs to reach
 * COMPLETED for Square's inventory decrement to fire. Non-fatal on failure:
 * this path is rare enough that a Square hiccup here shouldn't block an
 * otherwise-legitimate free order that already succeeded on the app's side
 * (card charge skipped, gift card already redeemed).
 */
export async function completeZeroChargeOrder(
  orderId: string,
  idempotencyKey: string
): Promise<void> {
  try {
    await client.orders.pay({
      orderId,
      idempotencyKey,
      paymentIds: [],
    });
    console.log(
      "[SQUARE-STORE-ORDERS-completeZeroChargeOrder] Order completed with no linked payment:",
      orderId
    );
  } catch (error) {
    console.error(
      "[SQUARE-STORE-ORDERS-completeZeroChargeOrder] Failed (non-fatal):",
      orderId,
      error
    );
  }
}
