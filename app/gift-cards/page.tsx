import { Metadata } from "next";
import { ReactElement } from "react";
import Link from "next/link";
import { RiWallet3Line } from "react-icons/ri";
import GiftCardPurchase from "@/components/gift-cards/GiftCardPurchase";

export const metadata: Metadata = {
  title: "Purchase Gift Card",
  description:
    "Give the gift of creativity! Purchase a digital gift card for Coastal Creations Studio.",
};

const STEPS = [
  {
    n: 1,
    title: "Purchase",
    body: "Choose an amount and enter the recipient's details. Pay securely with any card.",
  },
  {
    n: 2,
    title: "Deliver",
    body: "The gift card is instantly emailed to the recipient with a unique code.",
  },
  {
    n: 3,
    title: "Redeem",
    body: "Use the gift card code at checkout for any class, camp, or event.",
  },
];

export default function GiftCardsPage(): ReactElement {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <header className="max-w-5xl mx-auto mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gift Cards</h1>
            <p className="mt-1 max-w-xl text-gray-600">
              Give the gift of creativity — redeemable for classes, camps,
              workshops, and private events at Coastal Creations Studio.
            </p>
          </div>
          <Link
            href="/gift-cards/balance"
            className="inline-flex items-center gap-2 self-start rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 sm:self-auto"
          >
            <RiWallet3Line className="h-4 w-4" />
            Check your balance
          </Link>
        </header>

        {/* Purchase */}
        <GiftCardPurchase />

        {/* How it works */}
        <section className="mx-auto mt-14 max-w-5xl">
          <h2 className="mb-6 text-center text-xl font-bold text-gray-800">
            How gift cards work
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map((step) => (
              <div
                key={step.n}
                className="rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-2xl font-bold text-primary">
                    {step.n}
                  </span>
                </div>
                <h3 className="mb-2 font-semibold text-gray-800">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600">{step.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-gray-500">
            Gift cards never expire and can be used across multiple purchases
            until the balance is exhausted.
          </p>
        </section>
      </div>
    </div>
  );
}
