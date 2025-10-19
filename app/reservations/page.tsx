"use client";

import { ReactElement } from "react";
import ReservationList from "@/components/reservations/ReservationList";

export default function ReservationsPage(): ReactElement {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#326C85] mb-4">
            Reservations
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Browse our available reservation programs and book your spot for
            multi-day creative experiences.
          </p>
        </div>

        <ReservationList baseUrl="/reservations" />
      </div>
    </div>
  );
}
