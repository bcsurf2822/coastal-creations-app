import type { ReactElement } from "react";
import RefundRequestsTable from "@/components/dashboard/refunds/RefundRequestsTable";

export default function AdminRefundsPage(): ReactElement {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Refund Requests</h1>
        <p className="text-gray-600 mt-1">
          Review customer-submitted refund requests and approve &amp; issue, or
          decline. To refund without a request, use the refund button on the order
          or customer.
        </p>
      </div>
      <RefundRequestsTable />
    </div>
  );
}
