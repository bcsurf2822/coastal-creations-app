"use client";

import { Suspense } from "react";
import EventCheckout from "@/components/checkout/EventCheckout";

export default function Payments() {
  return (
    <main className="min-h-screen py-8">
      <Suspense fallback={<div className="text-center py-20">Loading…</div>}>
        <EventCheckout />
      </Suspense>
    </main>
  );
}
