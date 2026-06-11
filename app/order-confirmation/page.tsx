import type { Metadata } from "next";
import type { ReactElement } from "react";
import Link from "next/link";
import { FaCheckCircle } from "react-icons/fa";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "Order Confirmed | Coastal Creations Studio",
  description: "Your order has been placed.",
};

interface OrderConfirmationPageProps {
  searchParams: Promise<{ orderNumber?: string }>;
}

export default async function OrderConfirmationPage({
  searchParams,
}: OrderConfirmationPageProps): Promise<ReactElement> {
  const { orderNumber } = await searchParams;

  return (
    <div className="container mx-auto px-4 py-20 max-w-lg text-center flex flex-col items-center gap-6">
      <FaCheckCircle
        size={64}
        className="text-[var(--color-success)]"
      />

      <h1 className="text-3xl font-bold text-[var(--color-primary)]">
        Order Confirmed!
      </h1>

      {orderNumber && (
        <p className="text-[var(--color-text-subtle)] text-sm">
          Order number: <strong className="text-[var(--color-text-primary)]">{orderNumber}</strong>
        </p>
      )}

      <p className="text-[var(--color-text-secondary)] max-w-sm leading-relaxed">
        Thank you for your purchase! We&apos;ll send a confirmation email shortly. Your order will
        be packed and shipped as soon as possible.
      </p>

      <div className="flex gap-3">
        <Link href="/store">
          <Button variant="primary">Continue Shopping</Button>
        </Link>
        <Link href="/">
          <Button variant="ghost">Home</Button>
        </Link>
      </div>
    </div>
  );
}
