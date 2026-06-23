import type { ReactElement } from "react";
import Link from "next/link";
import { RiShoppingBag3Line, RiCalendarEventLine } from "react-icons/ri";
import { requireUserPage } from "@/lib/auth/guards";
import { getMyOrders, getMyBookings } from "@/lib/account/queries";
import { formatCents } from "@/lib/utils/moneyHelpers";
import OrderStatusBadge from "@/components/account/OrderStatusBadge";

export default async function AccountOverviewPage(): Promise<ReactElement> {
  const user = await requireUserPage();
  const [orders, bookings] = await Promise.all([
    getMyOrders(user.email),
    getMyBookings(user.email),
  ]);

  const recentOrders = orders.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <RiShoppingBag3Line className="w-4 h-4" /> Orders
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-800">
            {orders.length}
          </p>
          <Link
            href="/account/orders"
            className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline"
          >
            View all orders
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <RiCalendarEventLine className="w-4 h-4" /> Bookings
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-800">
            {bookings.length}
          </p>
          <Link
            href="/account/bookings"
            className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline"
          >
            View all bookings
          </Link>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-base font-semibold text-gray-800">
          Recent orders
        </h2>
        {recentOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow border border-gray-200 py-8 text-center text-sm text-gray-500">
            You haven&apos;t placed any orders yet.{" "}
            <Link href="/store" className="text-blue-600 hover:underline">
              Browse the store
            </Link>
            .
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <Link
                key={order.orderNumber}
                href={`/account/orders/${order.orderNumber}`}
                className="flex items-center justify-between gap-4 bg-white rounded-lg shadow border border-gray-200 px-5 py-4 transition-colors hover:bg-gray-50"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-800">
                    {order.orderNumber}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()} ·{" "}
                    {formatCents(order.totalCents)}
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
