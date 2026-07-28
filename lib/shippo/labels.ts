import { Shippo } from "shippo";
import { connectMongo } from "@/lib/mongoose";
import Order from "@/lib/models/Order";

/**
 * Shippo label purchase — the single source of truth for buying a shipping label
 * for an Order. Used by BOTH the auto-create-at-checkout path
 * (app/api/store/checkout) and the manual admin fallback
 * (app/api/store/shipping-label).
 *
 * Idempotent: if the order already has a Shippo transaction, the existing label is
 * returned and no second label is purchased (so retried webhooks / double clicks
 * never buy twice). See spec/ecommerce/03-shipping-notification-flow.md.
 *
 * IMPORTANT: this function NEVER emails the customer. The customer "your order has
 * shipped" email is sent only when the merchant taps "Mark Shipped" (the
 * mark_shipped action in app/api/admin/store/orders/[id]). Buying a label is not
 * the same as shipping a package.
 */

const shippoClient = new Shippo({
  apiKeyHeader: process.env.SHIPPO_API_KEY ?? "",
});

export interface LabelResult {
  transactionId: string;
  labelUrl?: string;
  trackingNumber?: string;
  trackingUrlProvider?: string;
  /** true when an existing label was returned instead of buying a new one. */
  alreadyExisted: boolean;
}

/**
 * Purchase (or return the existing) Shippo label for an order and advance it to
 * `label_created`. Throws on missing order / missing rate / Shippo failure so the
 * caller can decide whether to surface or swallow the error.
 */
export async function purchaseLabelForOrder(orderId: string): Promise<LabelResult> {
  await connectMongo();

  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error(`purchaseLabelForOrder: order not found: ${orderId}`);
  }

  // Idempotency guard — already have a label, return it untouched.
  if (order.shippo?.transactionId) {
    console.log(
      "[SHIPPO-LABELS] Label already exists for",
      order.orderNumber,
      "— skipping purchase"
    );
    return {
      transactionId: order.shippo.transactionId,
      labelUrl: order.shippo.labelUrl,
      trackingNumber: order.shippo.trackingNumber,
      trackingUrlProvider: order.shippo.trackingUrlProvider,
      alreadyExisted: true,
    };
  }

  if (!order.shippo?.rateId) {
    throw new Error(
      `purchaseLabelForOrder: order ${order.orderNumber} has no Shippo rateId`
    );
  }

  console.log("[SHIPPO-LABELS] Purchasing label for order:", order.orderNumber);

  const transaction = await shippoClient.transactions.create({
    rate: order.shippo.rateId,
    async: false,
  });

  if (transaction.status !== "SUCCESS" || !transaction.objectId) {
    throw new Error(
      `purchaseLabelForOrder: Shippo transaction failed (${transaction.status}): ${JSON.stringify(
        transaction.messages
      )}`
    );
  }

  await Order.findByIdAndUpdate(orderId, {
    "shippo.transactionId": transaction.objectId,
    "shippo.labelUrl": transaction.labelUrl,
    "shippo.trackingNumber": transaction.trackingNumber,
    "shippo.trackingUrlProvider": transaction.trackingUrlProvider,
    status: "label_created",
  });

  console.log(
    "[SHIPPO-LABELS] Label created for",
    order.orderNumber,
    "tracking:",
    transaction.trackingNumber
  );

  return {
    transactionId: transaction.objectId,
    labelUrl: transaction.labelUrl ?? undefined,
    trackingNumber: transaction.trackingNumber ?? undefined,
    trackingUrlProvider: transaction.trackingUrlProvider ?? undefined,
    alreadyExisted: false,
  };
}
