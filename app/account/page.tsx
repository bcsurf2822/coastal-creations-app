import type { ReactElement } from "react";
import Link from "next/link";
import { RiShoppingBag3Line, RiCalendarEventLine } from "react-icons/ri";
import { requireUserPage } from "@/lib/auth/guards";
import { getMyOrders, getMyBookings } from "@/lib/account/queries";
import { formatCents } from "@/lib/utils/moneyHelpers";
import {
  summarizeOrderItems,
  bookingEventName,
  bookingDates,
  bookingTypeLabel,
} from "@/lib/account/display";
import OrderStatusBadge from "@/components/account/OrderStatusBadge";

export default async function AccountOverviewPage(): Promise<ReactElement> {
  const user = await requireUserPage();
  const [orders, bookings] = await Promise.all([
    getMyOrders(user.email, user.id),
    getMyBookings(user.email),
  ]);

  const firstName = (user.name ?? "").trim().split(/\s+/)[0];
  const recentOrders = orders.slice(0, 4);
  const recentBookings = bookings.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          {firstName ? `Welcome back, ${firstName}.` : "Welcome back."}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          You have {orders.length} order{orders.length !== 1 ? "s" : ""} and{" "}
          {bookings.length} booking{bookings.length !== 1 ? "s" : ""}.
        </p>
      </div>

      {/* Recent orders + recent bookings, side by side */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Orders */}
        <section className="flex flex-col rounded-lg border border-gray-200 bg-white shadow">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-800">
              <RiShoppingBag3Line className="h-4 w-4 text-gray-500" /> Recent
              orders
            </h2>
            {orders.length > 0 ? (
              <Link
                href="/account/orders"
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                View all ({orders.length})
              </Link>
            ) : null}
          </div>

          {recentOrders.length === 0 ? (
            <div className="flex-1 px-5 py-8 text-center text-sm text-gray-500">
              No orders yet.{" "}
              <Link href="/shop" className="text-blue-600 hover:underline">
                Browse the store
              </Link>
              .
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentOrders.map((order) => (
                <li key={order.orderNumber}>
                  <Link
                    href={`/account/orders/${order.orderNumber}`}
                    className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-gray-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-800">
                        {summarizeOrderItems(order.items) || order.orderNumber}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {order.orderNumber} ·{" "}
                        {new Date(order.createdAt).toLocaleDateString()} ·{" "}
                        {formatCents(order.totalCents)}
                      </p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Bookings */}
        <section className="flex flex-col rounded-lg border border-gray-200 bg-white shadow">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-800">
              <RiCalendarEventLine className="h-4 w-4 text-gray-500" /> Recent
              bookings
            </h2>
            {bookings.length > 0 ? (
              <Link
                href="/account/bookings"
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                View all ({bookings.length})
              </Link>
            ) : null}
          </div>

          {recentBookings.length === 0 ? (
            <div className="flex-1 px-5 py-8 text-center text-sm text-gray-500">
              No bookings yet.{" "}
              <Link
                href="/events/classes-workshops"
                className="text-blue-600 hover:underline"
              >
                Explore classes
              </Link>
              .
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentBookings.map((booking) => (
                <li
                  key={String(
                    (booking as unknown as { _id: unknown })._id
                  )}
                  className="flex items-center justify-between gap-3 px-5 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-800">
                      {bookingEventName(booking)}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {bookingTypeLabel(booking.eventType)} ·{" "}
                      {bookingDates(booking)}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-medium text-gray-800">
                    {`$${booking.total.toFixed(2)}`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
