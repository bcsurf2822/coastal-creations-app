import type { Metadata } from "next";
import type { ReactElement } from "react";
import OrdersTable from "@/components/dashboard/store/OrdersTable";

export const metadata: Metadata = {
  title: "Store Orders | Admin Dashboard",
  description: "View and manage customer store orders.",
};

export default function AdminStoreOrdersPage(): ReactElement {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Store Orders</h1>
        <p className="text-gray-600 mt-1">
          View all customer orders, track status, and manage fulfillment.
        </p>
      </div>

      <OrdersTable />
    </div>
  );
}
