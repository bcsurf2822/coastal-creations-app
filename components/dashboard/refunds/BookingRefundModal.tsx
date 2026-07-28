"use client";

import { useState } from "react";
import type { ReactElement } from "react";

interface BookingRefundModalProps {
  customerId: string;
  referenceLabel: string;
  /** Default refund amount in dollars (remaining refundable). */
  defaultAmountDollars: number;
  defaultReason?: string;
  onClose: () => void;
  onRefunded: () => void;
}

export default function BookingRefundModal({
  customerId,
  referenceLabel,
  defaultAmountDollars,
  defaultReason,
  onClose,
  onRefunded,
}: BookingRefundModalProps): ReactElement {
  const [amount, setAmount] = useState(defaultAmountDollars.toFixed(2));
  const [reason, setReason] = useState(defaultReason ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (): Promise<void> => {
    const value = parseFloat(amount);
    if (!value || value <= 0) {
      setError("Enter a refund amount greater than zero.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          refundAmount: value,
          reason: reason.trim() || undefined,
        }),
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
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-bold text-gray-800">Refund booking</h2>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 px-5 py-4">
          <p className="text-sm text-gray-500">{referenceLabel}</p>

          <div>
            <label
              htmlFor="booking-refund-amount"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Refund amount ($)
            </label>
            <input
              id="booking-refund-amount"
              type="number"
              min={0}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={submitting}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
          </div>

          <div>
            <label
              htmlFor="booking-refund-reason"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Reason (optional)
            </label>
            <textarea
              id="booking-refund-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={submitting}
              rows={2}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
          </div>

          {error ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
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
            className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
          >
            {submitting ? "Processing…" : "Approve & Refund"}
          </button>
        </div>
      </div>
    </div>
  );
}
