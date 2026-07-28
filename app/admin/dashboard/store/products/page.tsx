import type { Metadata } from "next";
import type { ReactElement } from "react";
import StoreProductsTable from "@/components/dashboard/store/StoreProductsTable";

export const metadata: Metadata = {
  title: "Store Products | Admin Dashboard",
  description: "Manage which Square catalog items appear in the online shop.",
};

export default function AdminStoreProductsPage(): ReactElement {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Store Products</h1>
        <p className="text-gray-600 mt-1">
          Set the shipping box size for catalog items. Online-shop visibility is controlled in Square.
        </p>
      </div>

      <StoreProductsTable />
    </div>
  );
}
