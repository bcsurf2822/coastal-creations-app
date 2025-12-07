import { ReactElement } from "react";
import Link from "next/link";
import PaymentForm from "@/components/reservations/PaymentForm";
import { SelectedDate } from "@/components/reservations/types";
import { connectMongo } from "@/lib/mongoose";
import ReservationModel from "@/lib/models/Reservations";

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

// Serialize MongoDB reservation to plain object for Client Components
function serializeReservation(doc: Record<string, unknown>): Reservation {
  const options = doc.options as Array<{
    categoryName: string;
    categoryDescription?: string;
    choices: Array<{ name: string; price?: number }>;
  }> | undefined;

  return {
    _id: String(doc._id),
    eventName: String(doc.eventName),
    description: doc.description ? String(doc.description) : undefined,
    pricePerDayPerParticipant: Number(doc.pricePerDayPerParticipant),
    options: options?.map((opt) => ({
      categoryName: opt.categoryName,
      categoryDescription: opt.categoryDescription,
      choices: opt.choices.map((c) => ({
        name: c.name,
        price: c.price,
      })),
    })),
  };
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
    const parsedDates = JSON.parse(decodeURIComponent(selectedDatesParam));
    // Parse dates - the PaymentForm client component will receive these
    selectedDates = parsedDates.map((sd: { date: string; participants: number }) => ({
      // Create Date and immediately serialize via JSON to get plain object
      date: new Date(sd.date),
      participants: sd.participants,
    }));
    // Serialize and deserialize to ensure plain objects (removes Date prototype)
    selectedDates = JSON.parse(JSON.stringify(selectedDates));
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

  let reservation: Reservation | null;
  try {
    await connectMongo();
    reservation = await ReservationModel.findById(reservationId).lean();

    if (!reservation) {
      console.error(
        "[ReservationPaymentPage-page] Reservation not found:",
        reservationId
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
  } catch (error) {
    console.error(
      "[ReservationPaymentPage-page] Error fetching reservation:",
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

  // Serialize reservation to plain object for Client Component
  const serializedReservation = serializeReservation(reservation as unknown as Record<string, unknown>);

  return (
    <PaymentForm reservation={serializedReservation} selectedDates={selectedDates} />
  );
}
