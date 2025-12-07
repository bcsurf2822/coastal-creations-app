import { ReactElement } from "react";
import Link from "next/link";
import { CalendarSelection } from "@/components/reservations/CalendarSelection";
import { EB_Garamond } from "next/font/google";
import { connectMongo } from "@/lib/mongoose";
import Reservation from "@/lib/models/Reservations";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

interface ReservationDetailPageProps {
  params: Promise<{ reservationId: string }>;
}

// Helper to serialize a Date or return string as-is
function serializeDate(value: unknown): string | undefined {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "string") {
    return value;
  }
  return undefined;
}

// Serialize MongoDB document to plain object for Client Components
function serializeReservation(doc: Record<string, unknown>): Record<string, unknown> {
  const dates = doc.dates as { startDate?: Date | string; endDate?: Date | string; excludeDates?: (Date | string)[] } | undefined;
  const time = doc.time as { startTime?: string; endTime?: string } | undefined;
  const dailyAvailability = doc.dailyAvailability as Array<{
    date: Date | string;
    maxParticipants: number;
    currentBookings: number;
    isAvailable: boolean;
    startTime?: string;
    endTime?: string;
  }> | undefined;

  return {
    _id: String(doc._id),
    eventName: doc.eventName,
    eventType: doc.eventType,
    description: doc.description,
    pricePerDayPerParticipant: doc.pricePerDayPerParticipant,
    dates: {
      startDate: serializeDate(dates?.startDate),
      endDate: serializeDate(dates?.endDate),
      excludeDates: dates?.excludeDates?.map((d) => serializeDate(d)),
    },
    timeType: doc.timeType,
    time: {
      startTime: time?.startTime,
      endTime: time?.endTime,
    },
    dailyAvailability: dailyAvailability?.map((day) => ({
      date: serializeDate(day.date),
      maxParticipants: day.maxParticipants,
      currentBookings: day.currentBookings,
      isAvailable: day.isAvailable,
      startTime: day.startTime,
      endTime: day.endTime,
    })),
    options: doc.options,
    image: doc.image,
    isDiscountAvailable: doc.isDiscountAvailable,
    discount: doc.discount,
    createdAt: serializeDate(doc.createdAt),
    updatedAt: serializeDate(doc.updatedAt),
  };
}

export default async function ReservationDetailPage({
  params,
}: ReservationDetailPageProps): Promise<ReactElement> {
  const { reservationId } = await params;
  let reservation;

  try {
    await connectMongo();
    reservation = await Reservation.findById(reservationId).lean();

    if (!reservation) {
      console.error(
        "[ReservationDetailPage-page] Reservation not found:",
        reservationId
      );
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
            <h1
              className={`${ebGaramond.className} text-2xl font-bold text-red-600 mb-4`}
            >
              Reservation Not Found
            </h1>
            <p className={`${ebGaramond.className} text-gray-600 mb-6`}>
              The reservation you are looking for could not be found or has
              expired.
            </p>
            <Link
              href="/reservations"
              className={`${ebGaramond.className} inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-bold hover:bg-blue-700 transition-colors`}
            >
              Browse Reservations
            </Link>
          </div>
        </div>
      );
    }
  } catch (error) {
    console.error("[ReservationDetailPage-page] Error fetching reservation:", error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <h1
            className={`${ebGaramond.className} text-2xl font-bold text-red-600 mb-4`}
          >
            Error Loading Reservation
          </h1>
          <p className={`${ebGaramond.className} text-gray-600 mb-6`}>
            {error instanceof Error
              ? error.message
              : "An error occurred while loading the reservation."}
          </p>
          <Link
            href="/reservations"
            className={`${ebGaramond.className} inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-bold hover:bg-blue-700 transition-colors`}
          >
            Browse Reservations
          </Link>
        </div>
      </div>
    );
  }

  const serializedReservation = serializeReservation(reservation as unknown as Record<string, unknown>);

  return <CalendarSelection reservation={serializedReservation as unknown as import("@/lib/models/Reservations").IReservation} />;
}
