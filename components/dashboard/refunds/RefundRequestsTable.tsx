"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactElement } from "react";
import OrderRefundModal, {
  type RefundableItem,
} from "@/components/dashboard/store/OrderRefundModal";
import BookingRefundModal from "@/components/dashboard/refunds/BookingRefundModal";

type RequestStatus = "pending" | "approved" | "declined";

interface RefundRequestRow {
  _id: string;
  type: "order" | "booking";
  targetId: string;
  orderNumber?: string;
  referenceLabel: string;
  customerName: string;
  customerEmail: string;
  requestedItems?: Array<{ squareVariationId: string; name: string; quantity: number }>;
  requestedAmountCents: number;
  reason: string;
  status: RequestStatus;
  adminNote?: string;
  createdAt: string;
}

const fmt = (cents: number): string => `$${(cents / 100).toFixed(2)}`;

const STATUS_STYLES: Record<RequestStatus, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  declined: "bg-gray-100 text-gray-700 border-gray-200",
};

export default function RefundRequestsTable(): ReactElement {
  const [requests, setRequests] = useState<RefundRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [busyId, setBusyId] = useState<string | null>(null);

  // Resolution modal state.
  const [active, setActive] = useState<RefundRequestRow | null>(null);
  const [orderItems, setOrderItems] = useState<RefundableItem[] | null>(null);

  const fetchRequests = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const params = statusFilter ? `?status=${statusFilter}` : "";
      const res = await fetch(`/api/admin/refund-requests${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load requests");
      setRequests(data.requests);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const markResolved = async (
    id: string,
    action: "approve" | "decline",
    adminNote?: string
  ): Promise<void> => {
    await fetch(`/api/admin/refund-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, adminNote }),
    });
  };

  const openResolve = async (req: RefundRequestRow): Promise<void> => {
    if (req.type === "booking") {
      setActive(req);
      return;
    }
    // Order: fetch full items so the refund modal can be pre-filled.
    setBusyId(req._id);
    try {
      const res = await fetch(`/api/admin/store/orders/${req.targetId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load order");
      setOrderItems(
        (data.order.items as RefundableItem[]).map((it) => ({
          squareVariationId: it.squareVariationId,
          name: it.name,
          variationName: it.variationName,
          quantity: it.quantity,
          unitPriceCents: it.unitPriceCents,
          refundedQuantity: it.refundedQuantity,
        }))
      );
      setActive(req);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to load order");
    } finally {
      setBusyId(null);
    }
  };

  const decline = async (req: RefundRequestRow): Promise<void> => {
    if (!confirm(`Decline the refund request for ${req.referenceLabel}?`)) return;
    setBusyId(req._id);
    try {
      await markResolved(req._id, "decline");
      await fetchRequests();
    } finally {
      setBusyId(null);
    }
  };

  const closeModal = (): void => {
    setActive(null);
    setOrderItems(null);
  };

  const onRefunded = async (): Promise<void> => {
    if (active) await markResolved(active._id, "approve");
    closeModal();
    await fetchRequests();
  };

  const initialQty: Record<string, number> = {};
  if (active?.requestedItems) {
    for (const it of active.requestedItems) initialQty[it.squareVariationId] = it.quantity;
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <label className="text-sm text-gray-600">Status</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-primary"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="declined">Declined</option>
          <option value="">All</option>
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading requests…</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-lg shadow border border-gray-200 py-10 text-center text-sm text-gray-500">
          No refund requests{statusFilter ? ` (${statusFilter})` : ""}.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3 text-right">Est.</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.map((req) => (
                  <tr key={req._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{req.customerName}</div>
                      <div className="text-xs text-gray-500">{req.customerEmail}</div>
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-600">{req.type}</td>
                    <td className="px-4 py-3 text-gray-800">{req.referenceLabel}</td>
                    <td className="px-4 py-3 max-w-xs text-gray-600">
                      <span className="line-clamp-2">{req.reason}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-800">
                      {fmt(req.requestedAmountCents)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[req.status]}`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {req.status === "pending" ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openResolve(req)}
                            disabled={busyId === req._id}
                            className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            Review
                          </button>
                          <button
                            onClick={() => decline(req)}
                            disabled={busyId === req._id}
                            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                          >
                            Decline
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {active && active.type === "order" && orderItems ? (
        <OrderRefundModal
          orderId={active.targetId}
          items={orderItems}
          initialQty={initialQty}
          onClose={closeModal}
          onRefunded={onRefunded}
        />
      ) : null}

      {active && active.type === "booking" ? (
        <BookingRefundModal
          customerId={active.targetId}
          referenceLabel={active.referenceLabel}
          defaultAmountDollars={active.requestedAmountCents / 100}
          defaultReason={active.reason}
          onClose={closeModal}
          onRefunded={onRefunded}
        />
      ) : null}
    </div>
  );
}
