"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ReactElement } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import OrderRefundModal from "@/components/dashboard/store/OrderRefundModal";

// How often the page re-pulls the order so webhook-driven status changes
// (shipped / delivered) appear without a manual refresh.
const POLL_INTERVAL_MS = 15000;

// Once an order reaches one of these, nothing more will change — stop polling.
const TERMINAL_STATUSES: ReadonlySet<string> = new Set([
  "delivered",
  "cancelled",
  "refunded",
]);

type OrderStatus =
  | "pending" | "paid" | "label_created" | "shipped"
  | "delivered" | "cancelled" | "refunded";

type OrderRefundEntry = {
  squareRefundId?: string;
  amountCents: number;
  reason?: string;
  items: Array<{ name: string; quantity: number }>;
  createdAt: string;
};

type OrderDetail = {
  _id: string;
  orderNumber: string;
  status: OrderStatus;
  items: Array<{
    squareVariationId: string;
    name: string;
    variationName?: string;
    quantity: number;
    unitPriceCents: number;
    refundedQuantity?: number;
  }>;
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  customer: { firstName: string; lastName: string; email: string; phone?: string };
  shippingAddress: {
    name: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    stateProvince: string;
    postalCode: string;
    country: string;
  };
  square: { paymentId?: string };
  giftCard?: { giftCardId?: string; amountCents?: number };
  refundStatus?: "none" | "partial" | "full";
  refundAmountCents?: number;
  refunds?: OrderRefundEntry[];
  shippo: { trackingNumber?: string; carrier?: string; labelUrl?: string; trackingUrlProvider?: string };
  createdAt: string;
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  label_created: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
  refunded: "bg-red-100 text-red-800",
};

const ALL_STATUSES: OrderStatus[] = [
  "pending", "paid", "label_created", "shipped", "delivered", "cancelled", "refunded",
];

export default function OrderDetailPage(): ReactElement {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [creatingLabel, setCreatingLabel] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);

  // Track in-flight admin actions so a background poll can't clobber an
  // optimistic update mid-request.
  const busyRef = useRef(false);
  useEffect(() => {
    busyRef.current = updating || creatingLabel;
  }, [updating, creatingLabel]);

  // `silent` polls skip the loading spinner and swallow transient errors so a
  // single failed background refresh doesn't blank out the page.
  const fetchOrder = useCallback(
    async (silent = false): Promise<void> => {
      if (silent && busyRef.current) return;
      try {
        const res = await fetch(`/api/admin/store/orders/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load order");
        setOrder(data.order);
      } catch (err) {
        if (!silent) setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [id]
  );

  // Initial load (runs once per order id).
  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Background polling — only while the order is still in motion AND the tab is
  // visible. Switching back to the tab triggers an immediate refresh so you're
  // never looking at a stale status after coming back.
  const isTerminal = order ? TERMINAL_STATUSES.has(order.status) : false;
  useEffect(() => {
    if (isTerminal) return;
    const tick = (): void => {
      if (document.visibilityState === "visible") fetchOrder(true);
    };
    const interval = setInterval(tick, POLL_INTERVAL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [fetchOrder, isTerminal]);

  const updateStatus = async (status: OrderStatus) => {
    if (!order) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/store/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setOrder((prev) => prev ? { ...prev, status } : prev);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  const createLabel = async () => {
    if (!order) return;
    if (!confirm("Purchase a shipping label for this order via Shippo?")) return;
    setCreatingLabel(true);
    try {
      const res = await fetch("/api/store/shipping-label", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order._id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Label creation failed");
      setOrder((prev) =>
        prev
          ? {
              ...prev,
              status: "label_created",
              shippo: {
                ...prev.shippo,
                labelUrl: data.labelUrl,
                trackingNumber: data.trackingNumber,
                trackingUrlProvider: data.trackingUrlProvider,
              },
            }
          : prev
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Label creation failed");
    } finally {
      setCreatingLabel(false);
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-500">Loading order...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!order) return <div className="p-6 text-gray-500">Order not found.</div>;

  const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const giftCardUsed = !!order.giftCard?.giftCardId;
  const hasPayment = !!order.square.paymentId;
  const fullyRefunded = order.refundStatus === "full";
  const refundedCents = order.refundAmountCents ?? 0;

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => router.push("/admin/dashboard/store/orders")}
          className="text-sm text-primary hover:text-primary-dark"
        >
          ← Back to Orders
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-mono">{order.orderNumber}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(order.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${STATUS_COLORS[order.status]}`}>
            {order.status.replace("_", " ")}
          </span>
          <select
            value={order.status}
            onChange={(e) => updateStatus(e.target.value as OrderStatus)}
            disabled={updating}
            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-primary disabled:opacity-50"
          >
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace("_", " ")}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Customer */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Customer</h2>
          <p className="font-medium text-gray-900">{order.customer.firstName} {order.customer.lastName}</p>
          <p className="text-sm text-gray-600">{order.customer.email}</p>
          {order.customer.phone && <p className="text-sm text-gray-600">{order.customer.phone}</p>}
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Ship To</h2>
          <p className="font-medium text-gray-900">{order.shippingAddress.name}</p>
          <p className="text-sm text-gray-600">{order.shippingAddress.addressLine1}</p>
          {order.shippingAddress.addressLine2 && (
            <p className="text-sm text-gray-600">{order.shippingAddress.addressLine2}</p>
          )}
          <p className="text-sm text-gray-600">
            {order.shippingAddress.city}, {order.shippingAddress.stateProvince} {order.shippingAddress.postalCode}
          </p>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Items</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Product</th>
              <th className="px-4 py-2 text-center text-xs text-gray-500 uppercase">Qty</th>
              <th className="px-4 py-2 text-right text-xs text-gray-500 uppercase">Unit Price</th>
              <th className="px-4 py-2 text-right text-xs text-gray-500 uppercase">Line Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {order.items.map((item, i) => (
              <tr key={i}>
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  {item.variationName && <p className="text-xs text-gray-500">{item.variationName}</p>}
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-600">{item.quantity}</td>
                <td className="px-4 py-3 text-right text-sm text-gray-600">{fmt(item.unitPriceCents)}</td>
                <td className="px-4 py-3 text-right text-sm font-medium">{fmt(item.unitPriceCents * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-gray-200 space-y-1">
          <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span>{fmt(order.subtotalCents)}</span></div>
          <div className="flex justify-between text-sm text-gray-600"><span>Shipping</span><span>{fmt(order.shippingCents)}</span></div>
          {order.taxCents > 0 && <div className="flex justify-between text-sm text-gray-600"><span>Tax</span><span>{fmt(order.taxCents)}</span></div>}
          <div className="flex justify-between text-sm font-bold text-gray-900 pt-1 border-t border-gray-200"><span>Total</span><span>{fmt(order.totalCents)}</span></div>
        </div>
      </div>

      {/* Payment & Shipping */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Payment</h2>
          {order.square.paymentId ? (
            <p className="font-mono text-sm text-gray-700">{order.square.paymentId}</p>
          ) : (
            <p className="text-sm text-gray-400">No payment ID</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Tracking</h2>
          {order.shippo.trackingNumber ? (
            <div className="space-y-1">
              <p className="text-sm text-gray-700">
                <span className="font-medium">{order.shippo.carrier?.toUpperCase()}</span>{" "}
                {order.shippo.trackingNumber}
              </p>
              {order.shippo.trackingUrlProvider && (
                <Link href={order.shippo.trackingUrlProvider} target="_blank" className="text-sm text-primary hover:underline">
                  Track package →
                </Link>
              )}
              {order.shippo.labelUrl && (
                <Link href={order.shippo.labelUrl} target="_blank" className="block mt-2 text-sm font-medium text-primary hover:text-primary-dark">
                  Print Label (PDF) →
                </Link>
              )}
            </div>
          ) : order.status === "paid" ? (
            <button
              onClick={createLabel}
              disabled={creatingLabel}
              className="mt-1 px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded-md hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
            >
              {creatingLabel ? "Creating label..." : "Create Shipping Label"}
            </button>
          ) : (
            <p className="text-sm text-gray-400">No tracking info yet</p>
          )}
        </div>
      </div>

      {/* Refunds */}
      <div className="bg-white rounded-lg shadow p-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Refunds
          </h2>
          {hasPayment && !giftCardUsed && (
            <button
              onClick={() => setRefundModalOpen(true)}
              disabled={fullyRefunded}
              className="px-3 py-1.5 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {fullyRefunded ? "Fully refunded" : "Issue Refund"}
            </button>
          )}
        </div>

        {giftCardUsed ? (
          <p className="text-sm text-gray-500">
            This order used a gift card — refund it manually in Square. Automated
            gift-card refunds aren&apos;t supported here.
          </p>
        ) : !hasPayment ? (
          <p className="text-sm text-gray-400">
            No payment ID on this order — nothing to refund.
          </p>
        ) : refundedCents > 0 ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              <span className="font-medium capitalize">{order.refundStatus}</span>{" "}
              refund — {fmt(refundedCents)} of {fmt(order.totalCents)} refunded
            </p>
            <ul className="divide-y divide-gray-100 border-t border-gray-100">
              {(order.refunds ?? []).map((r, i) => (
                <li key={i} className="py-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                    <span className="font-medium text-gray-800">{fmt(r.amountCents)}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {r.items.map((it) => `${it.quantity}× ${it.name}`).join(", ")}
                    {r.reason ? ` — ${r.reason}` : ""}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-gray-400">No refunds issued.</p>
        )}
      </div>

      {refundModalOpen && (
        <OrderRefundModal
          orderId={order._id}
          items={order.items.map((it) => ({
            squareVariationId: it.squareVariationId,
            name: it.name,
            variationName: it.variationName,
            quantity: it.quantity,
            unitPriceCents: it.unitPriceCents,
            refundedQuantity: it.refundedQuantity,
          }))}
          onClose={() => setRefundModalOpen(false)}
          onRefunded={() => {
            setRefundModalOpen(false);
            fetchOrder();
          }}
        />
      )}
    </div>
  );
}
