import { Metadata } from "next";
import { ReactElement } from "react";
import GiftCardBalance from "@/components/gift-cards/GiftCardBalance";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Check Gift Card Balance | Coastal Creations Studio",
  description: "Check the balance on your Coastal Creations Studio gift card.",
};

export default function GiftCardBalancePage(): ReactElement {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Check Gift Card Balance</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enter your gift card number below to see your remaining balance.
          </p>
        </div>

        {/* Balance Checker Component */}
        <GiftCardBalance />

        {/* Buy a gift card CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-2">Want to purchase a gift card?</p>
          <Link
            href="/gift-cards"
            className="text-primary hover:underline font-medium"
          >
            Buy a Gift Card
          </Link>
        </div>

        {/* Help Section */}
        <div className="mt-16 max-w-xl mx-auto bg-white rounded-xl p-6 shadow-md">
          <h2 className="font-semibold text-gray-800 mb-4">Need Help?</h2>
          <p className="text-gray-600 text-sm mb-4">
            If you&apos;re having trouble with your gift card or have questions about using it,
            please contact us.
          </p>
          <a
            href={`mailto:${process.env.NEXT_PUBLIC_STUDIO_EMAIL || "info@coastalcreationsstudio.com"}`}
            className="text-primary hover:underline text-sm"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
