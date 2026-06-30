import type { ReactElement } from "react";
import Link from "next/link";
import { requireUserPage } from "@/lib/auth/guards";
import { getMyBookings, getMyRefundRequests } from "@/lib/account/queries";
import type { ICustomer } from "@/lib/models/Customer";
import {
  bookingEventName,
  bookingTypeLabel,
  bookingDates,
  isBookingPast,
} from "@/lib/account/display";
import BookingRefundRequestButton from "@/components/account/BookingRefundRequestButton";

function bookingId(booking: ICustomer): string {
  return String((booking as unknown as { _id: unknown })._id);
}

export default async function MyBookingsPage(): Promise<ReactElement> {
  const user = await requireUserPage();
  const [bookings, refundRequests] = await Promise.all([
    getMyBookings(user.email),
    getMyRefundRequests(user.email),
  ]);
  const pendingBookingIds = new Set(
    refundRequests
      .filter((r) => r.status === "pending" && r.type === "booking")
      .map((r) => String(r.targetId))
  );

  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 py-10 text-center text-sm text-gray-500">
        No bookings yet.{" "}
        <Link
          href="/events/classes-workshops"
          className="text-blue-600 hover:underline"
        >
          Explore classes &amp; workshops
        </Link>
        .
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">My Bookings</h1>
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Date(s)</th>
                <th className="px-4 py-3 text-center">Participants</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Refund</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.map((booking) => {
                const showRefund =
                  booking.refundStatus && booking.refundStatus !== "none";
                const past = isBookingPast(booking);
                return (
                  <tr key={bookingId(booking)} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">
                        {bookingEventName(booking)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {bookingTypeLabel(booking.eventType)} · booked{" "}
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {bookingDates(booking)}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {booking.quantity}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-800">
                      {`$${booking.total.toFixed(2)}`}
                    </td>
                    <td className="px-4 py-3">
                      {showRefund ? (
                        <span className="inline-flex items-center rounded-full border border-red-200 bg-red-100 px-2.5 py-0.5 text-xs font-medium capitalize text-red-800">
                          {booking.refundStatus} refund
                        </span>
                      ) : past ? (
                        <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-green-200 bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          Confirmed
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <BookingRefundRequestButton
                        bookingId={bookingId(booking)}
                        referenceLabel={bookingEventName(booking)}
                        pending={pendingBookingIds.has(bookingId(booking))}
                        refunded={booking.refundStatus === "full"}
                        eventPassed={past}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
