import type { ReactElement } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Truck } from "lucide-react";
import { requireUserPage } from "@/lib/auth/guards";
import { getMyOrderByNumber } from "@/lib/account/queries";
import { formatCents } from "@/lib/utils/moneyHelpers";
import OrderStatusBadge from "@/components/account/OrderStatusBadge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/shadcn/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/shadcn/table";
import { Separator } from "@/components/ui/shadcn/separator";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}): Promise<ReactElement> {
  const user = await requireUserPage();
  const { orderNumber } = await params;
  const order = await getMyOrderByNumber(user.email, orderNumber);
  if (!order) notFound();

  const address = order.shippingAddress;
  const tracking = order.shippo;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to orders
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Order {order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">
            Placed {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead className="text-right">Unit price</TableHead>
                <TableHead className="text-right">Line total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item, index) => (
                <TableRow key={`${item.name}-${index}`}>
                  <TableCell>
                    <div className="font-medium">{item.name}</div>
                    {item.variationName ? (
                      <div className="text-sm text-muted-foreground">
                        {item.variationName}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    {formatCents(item.unitPriceCents)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCents(item.unitPriceCents * item.quantity)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Separator className="my-4" />

          <div className="ml-auto max-w-xs space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCents(order.subtotalCents)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{formatCents(order.shippingCents)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatCents(order.totalCents)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Shipping address</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{address.name}</p>
            <p>{address.addressLine1}</p>
            {address.addressLine2 ? <p>{address.addressLine2}</p> : null}
            <p>
              {address.city}, {address.stateProvince} {address.postalCode}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Truck className="size-4" /> Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {tracking?.trackingNumber ? (
              <div className="space-y-1">
                {tracking.carrier ? (
                  <p className="text-muted-foreground">
                    Carrier:{" "}
                    <span className="font-medium uppercase text-foreground">
                      {tracking.carrier}
                    </span>
                  </p>
                ) : null}
                <p className="text-muted-foreground">
                  Tracking #:{" "}
                  <span className="font-medium text-foreground">
                    {tracking.trackingNumber}
                  </span>
                </p>
                {tracking.trackingUrlProvider ? (
                  <a
                    href={tracking.trackingUrlProvider}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block pt-1 text-primary hover:underline"
                  >
                    Track package
                  </a>
                ) : null}
              </div>
            ) : (
              <p className="text-muted-foreground">
                No tracking information yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
