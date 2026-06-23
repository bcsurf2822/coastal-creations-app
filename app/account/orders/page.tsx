import type { ReactElement } from "react";
import Link from "next/link";
import { requireUserPage } from "@/lib/auth/guards";
import { getMyOrders, getMyRefundRequests } from "@/lib/account/queries";
import OrdersAccordion, {
  type AccountOrder,
} from "@/components/account/OrdersAccordion";

export default async function MyOrdersPage(): Promise<ReactElement> {
  const user = await requireUserPage();
  const [orders, refundRequests] = await Promise.all([
    getMyOrders(user.email),
    getMyRefundRequests(user.email),
  ]);
  const pendingRefundIds = refundRequests
    .filter((r) => r.status === "pending" && r.type === "order")
    .map((r) => String(r.targetId));

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 py-10 text-center text-sm text-gray-500">
        You haven&apos;t placed any orders yet.{" "}
        <Link href="/store" className="text-blue-600 hover:underline">
          Browse the store
        </Link>
        .
      </div>
    );
  }

  // Map to a plain, serializable shape for the client accordion (no ObjectIds/Dates).
  const accountOrders: AccountOrder[] = orders.map((order) => ({
    id: String((order as unknown as { _id: unknown })._id),
    orderNumber: order.orderNumber,
    createdAt: new Date(order.createdAt).toISOString(),
    status: order.status,
    subtotalCents: order.subtotalCents,
    shippingCents: order.shippingCents,
    totalCents: order.totalCents,
    giftCardCents: order.giftCard?.amountCents ?? 0,
    refundStatus: order.refundStatus,
    refundAmountCents: order.refundAmountCents ?? 0,
    refunds: (order.refunds ?? []).map((r) => ({
      amountCents: r.amountCents,
      reason: r.reason,
      createdAt: new Date(r.createdAt).toISOString(),
      items: r.items.map((it) => ({ name: it.name, quantity: it.quantity })),
    })),
    items: order.items.map((item) => ({
      squareVariationId: item.squareVariationId,
      name: item.name,
      variationName: item.variationName,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      refundedQuantity: item.refundedQuantity,
    })),
    shippingAddress: {
      name: order.shippingAddress.name,
      addressLine1: order.shippingAddress.addressLine1,
      addressLine2: order.shippingAddress.addressLine2,
      city: order.shippingAddress.city,
      stateProvince: order.shippingAddress.stateProvince,
      postalCode: order.shippingAddress.postalCode,
    },
    tracking: {
      carrier: order.shippo?.carrier,
      trackingNumber: order.shippo?.trackingNumber,
      trackingUrlProvider: order.shippo?.trackingUrlProvider,
    },
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">My Orders</h1>
      <OrdersAccordion orders={accountOrders} pendingRefundIds={pendingRefundIds} />
    </div>
  );
}
