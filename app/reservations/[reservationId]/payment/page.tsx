import { ReactElement } from "react";
import Link from "next/link";
import PaymentForm from "@/components/reservations/PaymentForm";
import { SelectedDate } from "@/components/reservations/types";

interface Reservation {
  _id: string;
  eventName: string;
  description?: string;
  pricePerDayPerParticipant: number;
  options?: Array<{
    categoryName: string;
    categoryDescription?: string;
    choices: Array<{
      name: string;
      price?: number;
    }>;
  }>;
}

interface PageProps {
  params: Promise<{ reservationId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ReservationPaymentPage({
  params,
  searchParams,
}: PageProps): Promise<ReactElement> {
  const { reservationId } = await params;
  const search = await searchParams;

  const selectedDatesParam = search.selectedDates;
  if (!selectedDatesParam || typeof selectedDatesParam !== "string") {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-700">
          No dates selected. Please return to the calendar and select your
          dates.
        </p>
        <Link
          href={`/reservations/${reservationId}`}
          className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Calendar
        </Link>
      </div>
    );
  }

  let selectedDates: SelectedDate[];
  try {
    selectedDates = JSON.parse(decodeURIComponent(selectedDatesParam));
    selectedDates = selectedDates.map((sd) => ({
      ...sd,
      date: new Date(sd.date),
    }));
  } catch (error) {
    console.error(
      "[ReservationPaymentPage] Error parsing selectedDates:",
      error
    );
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-700">Invalid date selection data.</p>
        <Link
          href={`/reservations/${reservationId}`}
          className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Calendar
        </Link>
      </div>
    );
  }

  let reservation: Reservation;
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const response = await fetch(
      `${apiUrl}/api/reservations/${reservationId}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error(
        `[ReservationPaymentPage] Failed to fetch reservation: ${response.status}`
      );
      return (
        <div className="max-w-4xl mx-auto py-16 px-4 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700">Reservation not found.</p>
          <Link
            href="/reservations"
            className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            View All Reservations
          </Link>
        </div>
      );
    }

    const result = await response.json();
    if (!result.success || !result.data) {
      throw new Error("Invalid reservation data");
    }
    reservation = result.data;
  } catch (error) {
    console.error(
      "[ReservationPaymentPage] Error fetching reservation:",
      error
    );
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-700">Failed to load reservation details.</p>
        <Link
          href="/reservations"
          className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          View All Reservations
        </Link>
      </div>
    );
  }

  return (
    <PaymentForm reservation={reservation} selectedDates={selectedDates} />
  );
}
