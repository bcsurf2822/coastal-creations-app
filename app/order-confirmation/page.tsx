import type { Metadata } from "next";
import type { ReactElement } from "react";
import Link from "next/link";
import { FaCheck, FaRegEnvelope } from "react-icons/fa";

export const metadata: Metadata = {
  title: "Order Confirmed | Coastal Creations Studio",
  description: "Your order has been placed.",
};

interface OrderConfirmationPageProps {
  searchParams: Promise<{
    orderNumber?: string;
    receiptUrl?: string;
    total?: string;
    firstName?: string;
    email?: string;
  }>;
}

export default async function OrderConfirmationPage({
  searchParams,
}: OrderConfirmationPageProps): Promise<ReactElement> {
  const { orderNumber, receiptUrl, total, firstName, email } =
    await searchParams;

  return (
    <div className="min-h-[70vh] bg-gradient-to-b from-[#e0f2fe] via-[#f0f9ff] to-white py-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* Success header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 ring-8 ring-green-50 mb-5">
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-500 shadow-lg shadow-green-500/30">
              <FaCheck className="text-white text-2xl" />
            </span>
          </div>
          <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-2">
            {firstName ? `Thank you, ${firstName}!` : "Order Confirmed!"}
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Your order is confirmed and will be packed and shipped soon.
            {email ? (
              <>
                {" "}
                A confirmation email is on its way to{" "}
                <span className="font-medium text-gray-800">{email}</span>.
              </>
            ) : null}
          </p>
        </div>

        {/* Summary card */}
        <div className="bg-white rounded-2xl shadow-[var(--shadow-card)] border border-sky-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] px-6 py-5">
            <p className="text-sky-100 text-xs font-semibold uppercase tracking-wider mb-1">
              Order Confirmed
            </p>
            <h2 className="text-white text-xl font-bold leading-tight">
              {orderNumber ?? "Your order"}
            </h2>
          </div>

          <div className="px-6 py-5">
            <dl className="divide-y divide-gray-100">
              {total && (
                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-sm text-gray-500">Amount paid</dt>
                  <dd className="text-base font-bold text-gray-900">${total}</dd>
                </div>
              )}
              {orderNumber && (
                <div className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-sm text-gray-500">Order number</dt>
                  <dd className="text-sm font-mono text-gray-700 truncate">
                    {orderNumber}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {receiptUrl && (
            <div className="px-6 pb-5">
              <a
                href={receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center px-5 py-2.5 border border-sky-200 text-[var(--color-secondary)] font-semibold rounded-lg hover:bg-sky-50 transition-colors"
              >
                View Square Receipt
              </a>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Link
            href="/shop"
            className="flex-1 text-center px-6 py-3 bg-[var(--color-primary)] text-white font-semibold rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            Continue Shopping
          </Link>
          <Link
            href="/account/orders"
            className="flex-1 text-center px-6 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            View My Orders
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
          <FaRegEnvelope className="text-gray-300" />
          Questions? Reply to your confirmation email and we&apos;ll help.
        </p>
      </div>
    </div>
  );
}
