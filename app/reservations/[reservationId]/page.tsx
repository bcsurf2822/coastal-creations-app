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

  return <CalendarSelection reservation={reservation} />;
}
