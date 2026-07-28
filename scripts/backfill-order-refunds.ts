/**
 * One-off reconciliation: backfill per-item `refundedQuantity` and the `refunds[]`
 * log on store orders whose refund was issued BEFORE the Order schema gained those
 * fields (the amount persisted via `refundAmountCents`, but the new tracking fields
 * were silently dropped by the cached old schema).
 *
 * Reconstructs the per-item data from the matching APPROVED order refund request.
 * Idempotent: only touches orders that have `refundAmountCents > 0` AND an empty
 * `refunds[]` log, so re-running is a no-op once fixed.
 *
 * Usage:
 *   pnpm tsx scripts/backfill-order-refunds.ts          # dry run (prints, no writes)
 *   pnpm tsx scripts/backfill-order-refunds.ts --apply  # write the fixes
 */
import { MongoClient, ObjectId } from "mongodb";

interface OrderItem {
  squareVariationId: string;
  name: string;
  variationName?: string;
  quantity: number;
  unitPriceCents: number;
  refundedQuantity?: number;
}

interface RefundLineItem {
  squareVariationId: string;
  name: string;
  quantity: number;
}

interface RefundEntry {
  squareRefundId?: string;
  amountCents: number;
  reason?: string;
  items: RefundLineItem[];
  createdAt: Date;
}

// Typed collection shapes — the native driver's update typing (PushOperator) needs
// the document type so `$push: { refunds: ... }` is checked against RefundEntry[].
interface OrderDoc {
  _id: ObjectId;
  orderNumber?: string;
  items: OrderItem[];
  refunds?: RefundEntry[];
  refundStatus?: string;
  status?: string;
  refundAmountCents?: number;
  refundedAt?: Date;
}

interface RefundRequestDoc {
  _id: ObjectId;
  type: string;
  targetId: ObjectId;
  status: string;
  requestedItems?: RefundLineItem[];
  requestedAmountCents: number;
  reason?: string;
  resolvedAt?: Date;
  updatedAt?: Date;
}

async function main(): Promise<void> {
  const apply = process.argv.includes("--apply");
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error(
      "[backfill-order-refunds] MONGODB_URI not set. Run: pnpm tsx scripts/backfill-order-refunds.ts [--apply]"
    );
    process.exit(1);
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const orders = db.collection<OrderDoc>("orders");
    const requests = db.collection<RefundRequestDoc>("refundrequests");

    // Orders that received a refund but never got the refunds[] log written.
    const broken = await orders
      .find({
        refundAmountCents: { $gt: 0 },
        $or: [{ refunds: { $exists: false } }, { refunds: { $size: 0 } }],
      })
      .toArray();

    console.log(
      `[backfill] ${broken.length} order(s) with a refund amount but no refunds[] log${apply ? "" : " (DRY RUN)"}`
    );

    for (const order of broken) {
      // Most-recent approved order request for this order gives the item breakdown.
      const req = await requests.findOne(
        { type: "order", targetId: order._id, status: "approved" },
        { sort: { resolvedAt: -1 } }
      );

      if (!req) {
        console.warn(
          `[backfill] ${order.orderNumber}: refundAmountCents=${order.refundAmountCents} but no approved request found — skipping (cannot reconstruct items).`
        );
        continue;
      }

      const items: OrderItem[] = order.items.map((it) => ({ ...it }));
      const reqItems: RefundLineItem[] = req.requestedItems ?? [];

      for (const ri of reqItems) {
        const item = items.find((i) => i.squareVariationId === ri.squareVariationId);
        if (item) {
          item.refundedQuantity = Math.min(
            item.quantity,
            (item.refundedQuantity ?? 0) + ri.quantity
          );
        }
      }

      const fullyRefunded = items.every(
        (i) => (i.refundedQuantity ?? 0) >= i.quantity
      );
      const refundEntry: RefundEntry = {
        squareRefundId: undefined, // not captured at the time
        amountCents: req.requestedAmountCents,
        reason: req.reason,
        items: reqItems,
        createdAt: req.resolvedAt ?? req.updatedAt ?? order.refundedAt ?? new Date(),
      };

      console.log(
        `[backfill] ${order.orderNumber}: +refunds[${refundEntry.amountCents}c "${refundEntry.reason}"], items ${reqItems
          .map((r) => `${r.quantity}× ${r.name}`)
          .join(", ")}, refundStatus -> ${fullyRefunded ? "full" : "partial"}`
      );

      if (apply) {
        await orders.updateOne(
          { _id: order._id },
          {
            $set: {
              items,
              refundStatus: fullyRefunded ? "full" : "partial",
              ...(fullyRefunded ? { status: "refunded" } : {}),
            },
            $push: { refunds: refundEntry },
          }
        );
      }
    }

    console.log(apply ? "[backfill] Done (applied)." : "[backfill] Dry run complete — re-run with --apply to write.");
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
