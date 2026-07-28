"use client";

import { useState } from "react";
import type { ReactElement } from "react";

export interface RefundableItem {
  squareVariationId: string;
  name: string;
  variationName?: string;
  quantity: number;
  unitPriceCents: number;
  refundedQuantity?: number;
}

interface OrderRefundModalProps {
  orderId: string;
  items: RefundableItem[];
  /** Pre-seed the per-item quantities (e.g. from a customer refund request). */
  initialQty?: Record<string, number>;
  onClose: () => void;
  onRefunded: () => void;
}

const fmt = (cents: number): string => `$${(cents / 100).toFixed(2)}`;

export default function OrderRefundModal({
  orderId,
  items,
  initialQty,
  onClose,
  onRefunded,
}: OrderRefundModalProps): ReactElement {
  // Map of squareVariationId -> quantity to refund.
  const [qty, setQty] = useState<Record<string, number>>(initialQty ?? {});
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remainingFor = (item: RefundableItem): number =>
    item.quantity - (item.refundedQuantity ?? 0);

  const refundTotalCents = items.reduce((sum, item) => {
    const q = qty[item.squareVariationId] ?? 0;
    return sum + q * item.unitPriceCents;
  }, 0);

  const setItemQty = (item: RefundableItem, value: number): void => {
    const clamped = Math.max(0, Math.min(value, remainingFor(item)));
    setQty((prev) => ({ ...prev, [item.squareVariationId]: clamped }));
  };

  const submit = async (): Promise<void> => {
    const payloadItems = items
      .map((item) => ({
        squareVariationId: item.squareVariationId,
        quantity: qty[item.squareVariationId] ?? 0,
      }))
      .filter((i) => i.quantity > 0);

    if (payloadItems.length === 0) {
      setError("Select at least one item and quantity to refund.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/store/orders/${orderId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: payloadItems, reason: reason.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Refund failed");
      onRefunded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refund failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-bold text-gray-800">Issue Refund</h2>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[55vh] space-y-3 overflow-y-auto px-5 py-4">
          <p className="text-sm text-gray-500">
            Choose how many of each item to refund. Shipping is not refunded.
          </p>

          {items.map((item) => {
            const remaining = remainingFor(item);
            const fullyRefunded = remaining <= 0;
            return (
              <div
                key={item.squareVariationId}
                className="flex items-center justify-between gap-3 rounded-md border border-gray-200 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-800">
                    {item.name}
                    {item.variationName ? (
                      <span className="text-gray-500"> — {item.variationName}</span>
                    ) : null}
                  </p>
                  <p className="text-xs text-gray-500">
                    {fmt(item.unitPriceCents)} ea ·{" "}
                    {fullyRefunded
                      ? "fully refunded"
                      : `${remaining} of ${item.quantity} refundable`}
                  </p>
                </div>
                {fullyRefunded ? (
                  <span className="shrink-0 rounded-full border border-red-200 bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                    Refunded
                  </span>
                ) : (
                  <input
                    type="number"
                    min={0}
                    max={remaining}
                    value={qty[item.squareVariationId] ?? 0}
                    onChange={(e) =>
                      setItemQty(item, parseInt(e.target.value, 10) || 0)
                    }
                    disabled={submitting}
                    className="w-16 shrink-0 rounded-md border border-gray-300 px-2 py-1 text-right text-sm focus:ring-2 focus:ring-primary disabled:opacity-50"
                  />
                )}
              </div>
            );
          })}

          <div>
            <label
              htmlFor="refund-reason"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Reason (optional)
            </label>
            <textarea
              id="refund-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={submitting}
              rows={2}
              placeholder="e.g. item arrived broken"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
          </div>

          {error ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-gray-200 px-5 py-4">
          <span className="text-sm text-gray-600">
            Refund total:{" "}
            <strong className="text-gray-900">{fmt(refundTotalCents)}</strong>
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={submitting}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={submitting || refundTotalCents <= 0}
              className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
            >
              {submitting ? "Processing…" : `Refund ${fmt(refundTotalCents)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
