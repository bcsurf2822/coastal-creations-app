"use client";

import { ReactElement, useMemo } from "react";
import { motion } from "motion/react";
import ReservationCard from "./ReservationCard";
import { Reservation } from "@/lib/types/reservationTypes";
import { useReservations } from "@/hooks/queries";

interface ReservationListProps {
  baseUrl?: string;
}

export default function ReservationList({
  baseUrl = "/reservations",
}: ReservationListProps): ReactElement {
  const {
    data: reservationsData = [],
    isLoading: loading,
    error,
  } = useReservations();

  // Filter to active reservations only
  const reservations = useMemo(() => {
    const now = new Date();
    return (reservationsData as Reservation[]).filter(
      (reservation: Reservation) => {
        const endDate = reservation.dates.endDate
          ? new Date(reservation.dates.endDate)
          : new Date(reservation.dates.startDate);
        return endDate >= now;
      }
    );
  }, [reservationsData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{
            width: 40,
            height: 40,
            border: "3px solid rgba(50,108,133,0.15)",
            borderTopColor: "#326C85",
            borderRadius: "50%",
          }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
          <h3 className="text-red-700 font-bold text-xl mb-2">
            Error Loading Reservations
          </h3>
          <p className="text-red-600">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center bg-blue-50 border border-blue-200 rounded-lg p-8 max-w-md">
          <h3 className="text-[#326C85] font-bold text-xl mb-2">
            No Reservations Available
          </h3>
          <p className="text-gray-600">
            There are currently no active reservations to book. Please check
            back later or contact us for more information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reservations.map((reservation, index) => (
          <div
            key={reservation._id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <ReservationCard
              reservation={reservation}
              baseUrl={baseUrl}
              index={index}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
