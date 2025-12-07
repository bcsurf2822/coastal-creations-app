import { Metadata } from "next";
import { ReactElement } from "react";
import GiftCardsTable from "@/components/dashboard/gift-cards/GiftCardsTable";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gift Cards | Admin Dashboard",
  description: "Manage gift cards - view balances, activity history, and outstanding liabilities.",
};

export default function AdminGiftCardsPage(): ReactElement {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gift Cards</h1>
            <p className="text-gray-600 mt-1">
              View and manage all gift cards. Track balances and redemption history.
            </p>
          </div>
          <Link
            href="/gift-cards"
            target="_blank"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
          >
            View Purchase Page
          </Link>
        </div>
      </div>

      {/* Gift Cards Table */}
      <GiftCardsTable />

      {/* Help Section */}
      <div className="mt-8 bg-blue-50 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">About Gift Cards</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>Gift cards are managed entirely by Square - balances are stored in their system.</li>
          <li>Customers can purchase gift cards at <code className="bg-blue-100 px-1 rounded">/gift-cards</code></li>
          <li>Customers can check balances at <code className="bg-blue-100 px-1 rounded">/gift-cards/balance</code></li>
          <li>Gift cards can be redeemed at checkout when the feature is enabled.</li>
          <li>For detailed reports and exports, visit the Square Dashboard.</li>
        </ul>
      </div>
    </div>
  );
}
