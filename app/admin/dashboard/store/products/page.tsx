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
          Toggle which Square catalog items appear in the online shop and set their shipping box size.
        </p>
      </div>

      <StoreProductsTable />

      <div className="mt-8 bg-blue-50 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">How it works</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>Products are pulled from your Square catalog — manage names, prices, photos, and inventory in Square.</li>
          <li>Toggle <strong>Online Shop</strong> to make a product visible at <code className="bg-blue-100 px-1 rounded">/store</code>.</li>
          <li><strong>Parcel Size</strong> determines the box used to calculate shipping rates at checkout (Small, Medium, or Large).</li>
        </ul>
      </div>
    </div>
  );
}
