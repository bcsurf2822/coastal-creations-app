import type { Metadata } from "next";
import type { ReactElement } from "react";
import CheckoutForm from "@/components/store/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout | Coastal Creations Studio",
  description: "Complete your purchase.",
};

export default function CheckoutPage(): ReactElement {
  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 pt-12 pb-10 max-w-5xl">
        <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-8">
          Checkout
        </h1>
        <CheckoutForm />
      </div>
    </div>
  );
}
