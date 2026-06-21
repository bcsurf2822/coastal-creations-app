import type { ReactElement } from "react";
import Link from "next/link";
import { requireUserPage } from "@/lib/auth/guards";
import { getMyOrders } from "@/lib/account/queries";
import { formatCents } from "@/lib/utils/moneyHelpers";
import OrderStatusBadge from "@/components/account/OrderStatusBadge";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/shadcn/table";

export default async function MyOrdersPage(): Promise<ReactElement> {
  const user = await requireUserPage();
  const orders = await getMyOrders(user.email);

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          You haven&apos;t placed any orders yet.{" "}
          <Link href="/store" className="text-primary hover:underline">
            Browse the store
          </Link>
          .
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">My Orders</h1>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-center">Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.orderNumber}>
                <TableCell className="font-medium">
                  <Link
                    href={`/account/orders/${order.orderNumber}`}
                    className="text-primary hover:underline"
                  >
                    {order.orderNumber}
                  </Link>
                </TableCell>
                <TableCell>
                  {new Date(order.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-center">
                  {order.items.length}
                </TableCell>
                <TableCell className="text-right">
                  {formatCents(order.totalCents)}
                </TableCell>
                <TableCell>
                  <OrderStatusBadge status={order.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
