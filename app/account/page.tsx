import type { ReactElement } from "react";
import Link from "next/link";
import { CalendarDays, Package } from "lucide-react";
import { requireUserPage } from "@/lib/auth/guards";
import { getMyOrders, getMyBookings } from "@/lib/account/queries";
import { formatCents } from "@/lib/utils/moneyHelpers";
import OrderStatusBadge from "@/components/account/OrderStatusBadge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/shadcn/card";

export default async function AccountOverviewPage(): Promise<ReactElement> {
  const user = await requireUserPage();
  const [orders, bookings] = await Promise.all([
    getMyOrders(user.email),
    getMyBookings(user.email),
  ]);

  const recentOrders = orders.slice(0, 3);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <Package className="size-4" /> Orders
            </CardDescription>
            <CardTitle className="text-3xl">{orders.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href="/account/orders"
              className="text-sm text-primary hover:underline"
            >
              View all orders
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <CalendarDays className="size-4" /> Bookings
            </CardDescription>
            <CardTitle className="text-3xl">{bookings.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href="/account/bookings"
              className="text-sm text-primary hover:underline"
            >
              View all bookings
            </Link>
          </CardContent>
        </Card>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Recent orders</h2>
        {recentOrders.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              You haven&apos;t placed any orders yet.{" "}
              <Link href="/store" className="text-primary hover:underline">
                Browse the store
              </Link>
              .
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <Link
                key={order.orderNumber}
                href={`/account/orders/${order.orderNumber}`}
                className="block"
              >
                <Card className="transition-colors hover:bg-accent/40">
                  <CardContent className="flex items-center justify-between gap-4 py-4">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()} ·{" "}
                        {formatCents(order.totalCents)}
                      </p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
