"use client";

import { useState, useEffect } from "react";
import type { ReactElement } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type OrderStatus =
  | "pending" | "paid" | "label_created" | "shipped"
  | "delivered" | "cancelled" | "refunded";

type OrderDetail = {
  _id: string;
  orderNumber: string;
  status: OrderStatus;
  items: Array<{
    name: string;
    variationName?: string;
    quantity: number;
    unitPriceCents: number;
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

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/admin/store/orders/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load order");
        setOrder(data.order);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

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

  if (loading) return <div className="p-6 text-center text-gray-500">Loading order...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!order) return <div className="p-6 text-gray-500">Order not found.</div>;

  const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;

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
          ) : (
            <p className="text-sm text-gray-400">No tracking info yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
