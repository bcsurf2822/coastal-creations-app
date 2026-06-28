import type { ReactElement } from "react";
import type { IOrder } from "@/lib/models/Order";

interface OrderStatusBadgeProps {
  status: IOrder["status"];
}

const STATUS_STYLES: Record<IOrder["status"], string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  paid: "bg-sky-100 text-sky-800 border-sky-200",
  label_created: "bg-sky-100 text-sky-800 border-sky-200",
  shipped: "bg-indigo-100 text-indigo-800 border-indigo-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-gray-100 text-gray-700 border-gray-200",
  refunded: "bg-red-100 text-red-800 border-red-200",
};

function humanize(status: IOrder["status"]): string {
  return status.replace(/_/g, " ");
}

const OrderStatusBadge = ({ status }: OrderStatusBadgeProps): ReactElement => {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[status]}`}
    >
      {humanize(status)}
    </span>
  );
};

export default OrderStatusBadge;
