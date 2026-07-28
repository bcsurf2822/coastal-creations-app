"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import { RiArrowDownSLine, RiTruckLine } from "react-icons/ri";
import { formatCents } from "@/lib/utils/moneyHelpers";
import { summarizeOrderItems } from "@/lib/account/display";
import OrderStatusBadge from "@/components/account/OrderStatusBadge";
import RefundRequestModal from "@/components/account/RefundRequestModal";
import { useRouter } from "next/navigation";
import type { IOrder } from "@/lib/models/Order";

export interface AccountOrderItem {
  squareVariationId: string;
  name: string;
  variationName?: string;
  quantity: number;
  unitPriceCents: number;
  refundedQuantity?: number;
}

export interface AccountOrderRefund {
  amountCents: number;
  reason?: string;
  createdAt: string;
  items: Array<{ name: string; quantity: number }>;
}

export interface AccountOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: IOrder["status"];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  giftCardCents: number;
  refundStatus: IOrder["refundStatus"];
  refundAmountCents: number;
  refunds: AccountOrderRefund[];
  items: AccountOrderItem[];
  shippingAddress: {
    name: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    stateProvince: string;
    postalCode: string;
  };
  tracking: {
    carrier?: string;
    trackingNumber?: string;
    trackingUrlProvider?: string;
  };
}

interface OrdersAccordionProps {
  orders: AccountOrder[];
  /** Order ids that already have a pending refund request. */
  pendingRefundIds: string[];
}

const OrdersAccordion = ({
  orders,
  pendingRefundIds,
}: OrdersAccordionProps): ReactElement => {
  const router = useRouter();
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [refundOrder, setRefundOrder] = useState<AccountOrder | null>(null);
  const pending = new Set(pendingRefundIds);

  const toggle = (orderNumber: string): void => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(orderNumber)) next.delete(orderNumber);
      else next.add(orderNumber);
      return next;
    });
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      {/* Column headers (desktop only) */}
      <div className="hidden sm:flex items-center gap-4 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
        <span className="w-5" />
        <span className="flex-1">Order #</span>
        <span className="w-28">Date</span>
        <span className="w-16 text-center">Items</span>
        <span className="w-24 text-right">Total</span>
        <span className="w-28">Status</span>
      </div>

      <div className="divide-y divide-gray-200">
        {orders.map((order) => {
          const isOpen = open.has(order.orderNumber);
          return (
            <div key={order.orderNumber}>
              <button
                type="button"
                onClick={() => toggle(order.orderNumber)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-gray-50"
              >
                <RiArrowDownSLine
                  className={`h-5 w-5 shrink-0 text-gray-400 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
                <span className="flex-1 min-w-0">
                  <span className="block truncate font-medium text-blue-600">
                    {order.orderNumber}
                  </span>
                  <span className="block truncate text-xs text-gray-500">
                    {summarizeOrderItems(order.items)}
                  </span>
                </span>
                <span className="hidden w-28 text-gray-600 sm:block">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
                <span className="hidden w-16 text-center text-gray-600 sm:block">
                  {order.items.length}
                </span>
                <span className="w-24 text-right text-gray-800">
                  {formatCents(order.totalCents)}
                </span>
                <span className="hidden w-28 sm:block">
                  <OrderStatusBadge status={order.status} />
                </span>
              </button>

              {isOpen ? (
                <OrderDetailPanel
                  order={order}
                  pending={pending.has(order.id)}
                  onRequest={() => setRefundOrder(order)}
                />
              ) : null}
            </div>
          );
        })}
      </div>

      {refundOrder ? (
        <RefundRequestModal
          mode="order"
          targetId={refundOrder.id}
          referenceLabel={`Order ${refundOrder.orderNumber}`}
          items={refundOrder.items.map((it) => ({
            squareVariationId: it.squareVariationId,
            name: it.name,
            variationName: it.variationName,
            quantity: it.quantity,
            unitPriceCents: it.unitPriceCents,
            refundedQuantity: it.refundedQuantity,
          }))}
          onClose={() => setRefundOrder(null)}
          onSubmitted={() => {
            setRefundOrder(null);
            router.refresh();
          }}
        />
      ) : null}
    </div>
  );
};

const OrderDetailPanel = ({
  order,
  pending,
  onRequest,
}: {
  order: AccountOrder;
  pending: boolean;
  onRequest: () => void;
}): ReactElement => {
  const { shippingAddress: address, tracking } = order;
  const fullyRefunded = order.refundStatus === "full";
  const refundedCents = order.refundAmountCents ?? 0;
  return (
    <div className="space-y-5 border-t border-gray-200 bg-gray-50/60 px-4 py-5 sm:px-6">
      {/* Status on mobile (hidden from the row header on small screens) */}
      <div className="sm:hidden">
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Items */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-2">Item</th>
              <th className="px-4 py-2 text-center">Qty</th>
              <th className="px-4 py-2 text-right">Unit price</th>
              <th className="px-4 py-2 text-right">Line total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {order.items.map((item, index) => (
              <tr key={`${item.name}-${index}`}>
                <td className="px-4 py-2">
                  <div className="font-medium text-gray-800">{item.name}</div>
                  {item.variationName ? (
                    <div className="text-xs text-gray-500">
                      {item.variationName}
                    </div>
                  ) : null}
                </td>
                <td className="px-4 py-2 text-center text-gray-600">
                  {item.quantity}
                </td>
                <td className="px-4 py-2 text-right text-gray-600">
                  {formatCents(item.unitPriceCents)}
                </td>
                <td className="px-4 py-2 text-right text-gray-800">
                  {formatCents(item.unitPriceCents * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals + address + tracking */}
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-4">
          <div className="ml-auto max-w-xs space-y-1 text-sm md:ml-0">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-800">
                {formatCents(order.subtotalCents)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Shipping</span>
              <span className="text-gray-800">
                {formatCents(order.shippingCents)}
              </span>
            </div>
            {order.giftCardCents > 0 ? (
              <div className="flex justify-between">
                <span className="text-gray-500">Gift card</span>
                <span className="text-gray-800">
                  −{formatCents(order.giftCardCents)}
                </span>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-gray-200 pt-1 font-semibold text-gray-900">
              <span>Total</span>
              <span>{formatCents(order.totalCents)}</span>
            </div>
            {refundedCents > 0 ? (
              <div className="flex justify-between text-green-700">
                <span>Refunded</span>
                <span>−{formatCents(refundedCents)}</span>
              </div>
            ) : null}
          </div>

          <div className="text-sm">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Shipping address
            </p>
            <p className="font-medium text-gray-800">{address.name}</p>
            <p className="text-gray-600">{address.addressLine1}</p>
            {address.addressLine2 ? (
              <p className="text-gray-600">{address.addressLine2}</p>
            ) : null}
            <p className="text-gray-600">
              {address.city}, {address.stateProvince} {address.postalCode}
            </p>
          </div>
        </div>

        <div className="text-sm">
          <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <RiTruckLine className="h-4 w-4" /> Tracking
          </p>
          {tracking.trackingNumber ? (
            <div className="space-y-1">
              {tracking.carrier ? (
                <p className="text-gray-500">
                  Carrier:{" "}
                  <span className="font-medium uppercase text-gray-800">
                    {tracking.carrier}
                  </span>
                </p>
              ) : null}
              <p className="text-gray-500">
                Tracking #:{" "}
                <span className="font-medium text-gray-800">
                  {tracking.trackingNumber}
                </span>
              </p>
              {tracking.trackingUrlProvider ? (
                <a
                  href={tracking.trackingUrlProvider}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block pt-1 text-blue-600 hover:underline"
                >
                  Track package
                </a>
              ) : null}
            </div>
          ) : (
            <p className="text-gray-500">No tracking information yet.</p>
          )}
        </div>
      </div>

      {/* Refund received */}
      {refundedCents > 0 ? (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm">
          <p className="font-medium text-green-800">
            {fullyRefunded
              ? `Refunded in full — ${formatCents(refundedCents)}`
              : `Partial refund issued — ${formatCents(refundedCents)}`}
          </p>
          {order.refunds.length > 0 ? (
            <ul className="mt-1 space-y-0.5 text-green-700">
              {order.refunds.map((r, i) => (
                <li key={i}>
                  {new Date(r.createdAt).toLocaleDateString()} —{" "}
                  {r.items.map((it) => `${it.quantity}× ${it.name}`).join(", ")}{" "}
                  ({formatCents(r.amountCents)})
                  {r.reason ? ` · ${r.reason}` : ""}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-0.5 text-green-700">
              Refunds take 5–10 business days to appear on your original payment
              method.
            </p>
          )}
        </div>
      ) : null}

      {/* Refund request */}
      <div className="flex items-center justify-between gap-3 border-t border-gray-200 pt-4">
        {fullyRefunded ? (
          <span className="text-sm text-gray-500">This order has been refunded.</span>
        ) : pending ? (
          <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
            Refund requested
          </span>
        ) : (
          <>
            <span className="text-sm text-gray-500">
              Something wrong with this order?
            </span>
            <button
              onClick={onRequest}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Request a refund
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default OrdersAccordion;
