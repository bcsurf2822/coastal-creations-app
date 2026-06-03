"use client";

import Link from "next/link";
import EventContainer from "@/components/dashboard/home/EventContainer";
import AddButton from "@/components/dashboard/shared/AddButton";

export default function Dashboard() {
  return (
    <div className="space-y-8">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Event Management
        </h2>
        <AddButton href="/admin/dashboard/add-event" label="Add Event" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"></div>

      <div className="mt-8">
        <EventContainer />
      </div>

      {/* Store */}
      <div className="border-t border-gray-200 pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Store</h2>
          <div className="flex gap-3">
            <Link
              href="/admin/dashboard/products"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              View All Products
            </Link>
            <AddButton href="/admin/dashboard/add-product" label="Add Product" />
          </div>
        </div>
      </div>
    </div>
  );
}
