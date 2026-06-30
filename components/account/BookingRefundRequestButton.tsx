"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import RefundRequestModal from "@/components/account/RefundRequestModal";

interface BookingRefundRequestButtonProps {
  bookingId: string;
  referenceLabel: string;
  pending: boolean;
  refunded: boolean;
  /** Only upcoming bookings can be cancelled; false hides the request control. */
  eligible?: boolean;
}

export default function BookingRefundRequestButton({
  bookingId,
  referenceLabel,
  pending,
  refunded,
  eligible = true,
}: BookingRefundRequestButtonProps): ReactElement {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (refunded) {
    return <span className="text-xs text-gray-500">Refunded</span>;
  }
  if (pending) {
    return (
      <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
        Requested
      </span>
    );
  }
  // A refund request cancels an UPCOMING booking; past/undated bookings are not
  // eligible for self-service cancellation.
  if (!eligible) {
    return <span className="text-xs text-gray-400">—</span>;
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
      >
        Request refund
      </button>
      {open ? (
        <RefundRequestModal
          mode="booking"
          targetId={bookingId}
          referenceLabel={referenceLabel}
          onClose={() => setOpen(false)}
          onSubmitted={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      ) : null}
    </>
  );
}
