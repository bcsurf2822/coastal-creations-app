import { Metadata } from "next";
import { ReactElement } from "react";
import GiftCardPurchase from "@/components/gift-cards/GiftCardPurchase";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Purchase Gift Card | Coastal Creations Studio",
  description:
    "Give the gift of creativity! Purchase a digital gift card for Coastal Creations Studio.",
};

export default function GiftCardsPage(): ReactElement {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Gift Cards</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Our gift cards can be used for classes,
            camps, workshops, and private events at Coastal Creations Studio.
          </p>
        </div>

        {/* Gift Card Purchase Component */}
        <GiftCardPurchase />

        {/* Already have a gift card? */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-2">Already have a gift card?</p>
          <Link
            href="/gift-cards/balance"
            className="text-primary hover:underline font-medium"
          >
            Check Your Balance
          </Link>
        </div>

        {/* Info Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            How Gift Cards Work
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Purchase</h3>
              <p className="text-gray-600 text-sm">
                Choose an amount and enter the recipient&apos;s details. Pay
                securely with any card.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Deliver</h3>
              <p className="text-gray-600 text-sm">
                The gift card is instantly emailed to the recipient with a
                unique code.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Redeem</h3>
              <p className="text-gray-600 text-sm">
                Use the gift card code at checkout for any class, camp, or
                event.
              </p>
            </div>
          </div>
          <p className="mt-8 text-center text-sm text-gray-500">
            Gift cards never expire and can be used across multiple purchases
            until the balance is exhausted.
          </p>
        </div>
      </div>
    </div>
  );
}
