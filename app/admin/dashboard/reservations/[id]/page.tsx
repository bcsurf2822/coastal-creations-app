"use client";

import { ReactElement, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { RiArrowLeftLine, RiEdit2Line } from "react-icons/ri";
import Link from "next/link";
import {
  ReservationSummaryCard,
  DateSelector,
  BookingsList,
  Reservation,
  Customer,
  ParticipantForDate,
} from "@/components/dashboard/reservations";

interface ReservationWithCustomers {
  reservation: Reservation;
  customers: Customer[];
}

export default function ReservationCustomersPage(): ReactElement {
  const params = useParams();
  const router = useRouter();
  const reservationId = params.id as string;

  const [data, setData] = useState<ReservationWithCustomers | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservationAndCustomers = async (): Promise<void> => {
      if (!reservationId) return;

      try {
        setIsLoading(true);
        // Fetch reservation details
        const reservationResponse = await fetch(
          `/api/reservations/${reservationId}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!reservationResponse.ok) {
          throw new Error("Failed to fetch reservation");
        }

        const reservationResult = await reservationResponse.json();

        // Fetch customers for this reservation
        const customersResponse = await fetch(
          `/api/customer?eventId=${reservationId}&eventType=Reservation`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!customersResponse.ok) {
          throw new Error("Failed to fetch customers");
        }

        const customersResult = await customersResponse.json();

        setData({
          reservation: reservationResult.data || reservationResult,
          customers: customersResult.data || [],
        });
      } catch (error) {
        console.error(
          "[RESERVATION-CUSTOMERS-PAGE] Error fetching data:",
          error
        );
        setError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservationAndCustomers();
  }, [reservationId]);

  // Get participants for a specific date
  const getParticipantsForDate = (dateStr: string): ParticipantForDate[] => {
    if (!data?.customers) return [];

    const results: ParticipantForDate[] = [];

    data.customers.forEach((customer) => {
      const dateInfo = customer.selectedDates?.find((d) => {
        const dStr = new Date(d.date).toISOString().split("T")[0];
        return dStr === dateStr;
      });

      if (dateInfo) {
        const participantNames = customer.participants
          .slice(0, dateInfo.numberOfParticipants)
          .map((p) => `${p.firstName} ${p.lastName}`);

        results.push({
          customer,
          participantNames,
          numberOfParticipants: dateInfo.numberOfParticipants,
        });
      }
    });

    return results;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 dark:text-red-400 font-medium mb-4">
          {error || "Reservation not found"}
        </p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const { reservation, customers } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
          >
            <RiArrowLeftLine className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Reservation Bookings
            </h1>
          </div>
        </div>
        <Link
          href={`/admin/dashboard/edit-reservation?id=${reservationId}`}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
        >
          <RiEdit2Line className="w-4 h-4" />
          <span>Edit Reservation</span>
        </Link>
      </div>

      {/* Reservation Summary */}
      <ReservationSummaryCard
        reservation={reservation}
        customers={customers}
      />

      {/* Date Selector */}
      <DateSelector
        customers={customers}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        getParticipantsForDate={getParticipantsForDate}
      />

      {/* Bookings List */}
      <BookingsList
        customers={customers}
        selectedDate={selectedDate}
        getParticipantsForDate={getParticipantsForDate}
      />
    </div>
  );
}
