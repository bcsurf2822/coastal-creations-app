"use client";

import Payment from "@/components/payment/Payment";
import { Suspense } from "react";

export default function Payments() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full max-w-3xl">
        <Suspense fallback={<div>Loading...</div>}>
          <Payment />
        </Suspense>
      </main>
    </div>
  );
}
