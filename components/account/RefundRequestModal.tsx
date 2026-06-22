"use client";

import { useState } from "react";
import type { ReactElement } from "react";

export interface RequestableItem {
  squareVariationId: string;
  name: string;
  variationName?: string;
  quantity: number;
  unitPriceCents: number;
  refundedQuantity?: number;
}

interface RefundRequestModalProps {
  mode: "order" | "booking";
  targetId: string;
  /** Heading reference, e.g. "Order CC-1234" or the event name. */
  referenceLabel: string;
  /** Order line items (order mode only). */
  items?: RequestableItem[];
  onClose: () => void;
  onSubmitted: () => void;
}

const fmt = (cents: number): string => `$${(cents / 100).toFixed(2)}`;

export default function RefundRequestModal({
  mode,
  targetId,
  referenceLabel,
  items = [],
  onClose,
  onSubmitted,
}: RefundRequestModalProps): ReactElement {
  const [qty, setQty] = useState<Record<string, number>>({});
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remainingFor = (item: RequestableItem): number =>
    item.quantity - (item.refundedQuantity ?? 0);

  const estimateCents = items.reduce(
    (sum, item) => sum + (qty[item.squareVariationId] ?? 0) * item.unitPriceCents,
    0
  );

  const setItemQty = (item: RequestableItem, value: number): void => {
    const clamped = Math.max(0, Math.min(value, remainingFor(item)));
    setQty((prev) => ({ ...prev, [item.squareVariationId]: clamped }));
  };

  const submit = async (): Promise<void> => {
    if (!reason.trim()) {
      setError("Please tell us why you'd like a refund.");
      return;
    }
    const payloadItems = items
      .map((i) => ({
        squareVariationId: i.squareVariationId,
        quantity: qty[i.squareVariationId] ?? 0,
      }))
      .filter((i) => i.quantity > 0);

    if (mode === "order" && payloadItems.length === 0) {
      setError("Select at least one item.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/account/refund-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: mode,
          targetId,
          items: mode === "order" ? payloadItems : undefined,
          reason: reason.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit request");
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-bold text-gray-800">Request a refund</h2>
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
          <p className="text-sm text-gray-500">{referenceLabel}</p>

          {mode === "order" ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Choose which items you&apos;d like refunded.
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
                        {fullyRefunded ? "already refunded" : `${remaining} eligible`}
                      </p>
                    </div>
                    {fullyRefunded ? (
                      <span className="shrink-0 text-xs text-gray-400">—</span>
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
            </div>
          ) : null}

          <div>
            <label
              htmlFor="request-reason"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Reason
            </label>
            <textarea
              id="request-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={submitting}
              rows={3}
              placeholder="e.g. one mug arrived broken"
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
            {mode === "order" ? (
              <>
                Estimated:{" "}
                <strong className="text-gray-900">{fmt(estimateCents)}</strong>
              </>
            ) : (
              "We'll review and follow up."
            )}
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
              disabled={submitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Submit request"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
