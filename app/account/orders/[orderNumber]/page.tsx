import type { ReactElement } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RiArrowLeftLine, RiTruckLine } from "react-icons/ri";
import { requireUserPage } from "@/lib/auth/guards";
import { getMyOrderByNumber } from "@/lib/account/queries";
import { formatCents } from "@/lib/utils/moneyHelpers";
import OrderStatusBadge from "@/components/account/OrderStatusBadge";

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
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
      >
        <RiArrowLeftLine className="w-4 h-4" /> Back to orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Order {order.orderNumber}
          </h1>
          <p className="text-sm text-gray-500">
            Placed {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-3">Item</th>
                <th className="px-5 py-3 text-center">Qty</th>
                <th className="px-5 py-3 text-right">Unit price</th>
                <th className="px-5 py-3 text-right">Line total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {order.items.map((item, index) => (
                <tr key={`${item.name}-${index}`}>
                  <td className="px-5 py-3">
                    <div className="font-medium text-gray-800">
                      {item.name}
                    </div>
                    {item.variationName ? (
                      <div className="text-sm text-gray-500">
                        {item.variationName}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-5 py-3 text-center text-gray-600">
                    {item.quantity}
                  </td>
                  <td className="px-5 py-3 text-right text-gray-600">
                    {formatCents(item.unitPriceCents)}
                  </td>
                  <td className="px-5 py-3 text-right text-gray-800">
                    {formatCents(item.unitPriceCents * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-200 px-5 py-4">
          <div className="ml-auto max-w-xs space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-800">
                {formatCents(order.subtotalCents)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Shipping</span>
              <span className="text-gray-800">
                {formatCents(order.shippingCents)}
              </span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-1 font-semibold text-gray-900">
              <span>Total</span>
              <span>{formatCents(order.totalCents)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-800">
              Shipping address
            </h2>
          </div>
          <div className="px-5 py-4 text-sm text-gray-600">
            <p className="font-medium text-gray-800">{address.name}</p>
            <p>{address.addressLine1}</p>
            {address.addressLine2 ? <p>{address.addressLine2}</p> : null}
            <p>
              {address.city}, {address.stateProvince} {address.postalCode}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="flex items-center gap-2 text-base font-semibold text-gray-800">
              <RiTruckLine className="w-4 h-4" /> Tracking
            </h2>
          </div>
          <div className="px-5 py-4 text-sm">
            {tracking?.trackingNumber ? (
              <div className="space-y-1">
                {tracking.carrier ? (
                  <p className="text-gray-500">
                    Carrier:{" "}
                    <span className="font-medium uppercase text-gray-800">
                      {tracking.carrier}
                    </span>
                  </p>
                ) : null}
                <p className="text-gray-500">
                  Tracking #:{" "}
                  <span className="font-medium text-gray-800">
                    {tracking.trackingNumber}
                  </span>
                </p>
                {tracking.trackingUrlProvider ? (
                  <a
                    href={tracking.trackingUrlProvider}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block pt-1 text-blue-600 hover:underline"
                  >
                    Track package
                  </a>
                ) : null}
              </div>
            ) : (
              <p className="text-gray-500">No tracking information yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
