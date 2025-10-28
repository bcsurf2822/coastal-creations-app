"use client";

import { ReactElement, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import {
  RiCalendarEventLine,
  RiTimeLine,
  RiEdit2Line,
  RiDeleteBinLine,
  RiSearchLine,
} from "react-icons/ri";
import AddButton from "@/components/dashboard/shared/AddButton";

interface ReservationApiData {
  _id: string;
  eventName: string;
  description?: string;
  pricePerDayPerParticipant: number;
  maxParticipantsPerDay?: number;
  dates?: {
    startDate: string;
    endDate: string;
  };
  time?: {
    startTime: string;
    endTime: string;
  };
  image?: string;
  options?: Array<{
    categoryName: string;
    categoryDescription?: string;
    choices: Array<{ name: string }>;
  }>;
  isDiscountAvailable?: boolean;
  discount?: {
    type?: string;
    value?: number;
    description?: string;
  };
  dailyAvailability?: Array<{
    date: Date;
    maxParticipants: number;
    currentBookings: number;
    isAvailable: boolean;
  }>;
}

interface DashboardReservation {
  id: string;
  name: string;
  description?: string;
  pricePerDayPerParticipant: number;
  maxParticipantsPerDay: number;
  startDate?: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  image?: string;
  options?: Array<{
    categoryName: string;
    categoryDescription?: string;
    choices: Array<{ name: string }>;
  }>;
  isDiscountAvailable?: boolean;
  discount?: {
    type?: string;
    value?: number;
    description?: string;
  };
  dailyAvailability: Array<{
    date: Date;
    maxParticipants: number;
    currentBookings: number;
    isAvailable: boolean;
  }>;
}

const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

export default function ReservationsPage(): ReactElement {
  const [reservations, setReservations] = useState<DashboardReservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [participantCounts, setParticipantCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchReservations = async (): Promise<void> => {
      try {
        setIsLoading(true);

        console.log("[RESERVATIONS-PAGE] Fetching reservations");

        const response = await fetch("/api/reservations", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          const text = await response.text();
          const result = text ? JSON.parse(text) : {};
          const data = result.data || result.reservations || result;

          if (Array.isArray(data)) {
            const transformed: DashboardReservation[] = data.map(
              (reservation: ReservationApiData) => ({
                id: reservation._id,
                name: reservation.eventName,
                description: reservation.description,
                pricePerDayPerParticipant: reservation.pricePerDayPerParticipant,
                maxParticipantsPerDay:
                  reservation.maxParticipantsPerDay ||
                  (reservation.dailyAvailability &&
                  reservation.dailyAvailability.length > 0
                    ? reservation.dailyAvailability[0].maxParticipants
                    : 10),
                startDate: reservation.dates?.startDate
                  ? new Date(reservation.dates.startDate)
                  : undefined,
                endDate: reservation.dates?.endDate
                  ? new Date(reservation.dates.endDate)
                  : undefined,
                startTime: reservation.time?.startTime,
                endTime: reservation.time?.endTime,
                image: reservation.image,
                options: reservation.options,
                isDiscountAvailable: reservation.isDiscountAvailable,
                discount: reservation.discount,
                dailyAvailability: reservation.dailyAvailability || [],
              })
            );

            // Sort by start date
            const sorted = transformed.sort((a, b) => {
              const dateA = new Date(a.startDate || 0);
              const dateB = new Date(b.startDate || 0);
              return dateA.getTime() - dateB.getTime();
            });

            console.log(`[RESERVATIONS-PAGE] Loaded ${sorted.length} reservations`);
            setReservations(sorted);
          }
        }
      } catch (error) {
        console.error("[RESERVATIONS-PAGE] Error fetching reservations:", error);
        setError(
          typeof error === "string" ? error : (error as Error).message
        );
      } finally {
        setIsLoading(false);
      }
    };

    const fetchCustomers = async (): Promise<void> => {
      try {
        const response = await fetch("/api/customer", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const responseText = await response.text();
        const result = responseText ? JSON.parse(responseText) : {};

        if (!response.ok) {
          console.error("[RESERVATIONS-PAGE] Failed to fetch customers");
          return;
        }

        const counts: Record<string, number> = {};

        if (result.data && Array.isArray(result.data)) {
          result.data.forEach(
            (customer: { event?: { _id: string }; quantity: number }) => {
              const eventId = customer.event?._id;
              if (eventId) {
                counts[eventId] = (counts[eventId] || 0) + customer.quantity;
              }
            }
          );
        }
        setParticipantCounts(counts);
      } catch (error) {
        console.error("[RESERVATIONS-PAGE] Error fetching customers:", error);
      }
    };

    fetchReservations();
    fetchCustomers();
  }, []);

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm("Are you sure you want to delete this reservation?")) {
      return;
    }

    setDeletingIds((prev) => new Set(prev).add(id));

    try {
      console.log(`[RESERVATIONS-PAGE] Deleting reservation ${id}`);

      const response = await fetch(`/api/reservations?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete reservation");
      }

      console.log(`[RESERVATIONS-PAGE] Reservation ${id} deleted successfully`);
      setReservations((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      console.error("[RESERVATIONS-PAGE] Error deleting reservation:", error);
      alert("Failed to delete reservation. Please try again.");
    } finally {
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const formatDate = (date: Date | undefined): string => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  const formatTime = (timeString: string | undefined): string => {
    if (!timeString) return "N/A";

    const timeParts = timeString.split(":");
    let hours = parseInt(timeParts[0], 10);
    const minutes = timeParts[1];
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12;

    return `${hours}:${minutes} ${ampm}`;
  };

  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch =
      reservation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false;

    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reservations
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage all reservation offerings
          </p>
        </div>
        <AddButton
          href="/admin/dashboard/add-reservation"
          label="Add Reservation"
        />
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
        <div className="relative">
          <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search reservations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
          />
        </div>
      </div>

      {/* Reservations List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-5">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-500 dark:text-red-400 font-medium">
                {error}
              </p>
              <button
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          ) : filteredReservations.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? "No reservations found matching your search."
                  : "No reservations found. Create your first reservation!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className={`bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-all hover:shadow-md ${
                    deletingIds.has(reservation.id)
                      ? "opacity-50 pointer-events-none relative"
                      : ""
                  }`}
                >
                  {deletingIds.has(reservation.id) && (
                    <div className="absolute inset-0 bg-white/75 dark:bg-gray-800/75 rounded-lg flex items-center justify-center z-10">
                      <div className="flex items-center space-x-2 text-red-600">
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin"></div>
                        <span className="text-sm font-medium">Deleting...</span>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3 flex-1">
                      {reservation.image && (
                        <div className="flex-shrink-0">
                          <Image
                            src={urlFor(reservation.image)?.width(80).height(60).url() || ""}
                            alt={reservation.name}
                            width={80}
                            height={60}
                            className="rounded-lg object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                          {reservation.name}
                        </h4>
                        {reservation.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {reservation.description}
                          </p>
                        )}
                        <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                          <RiCalendarEventLine className="mr-1" />
                          <span>{formatDate(reservation.startDate)}</span>
                          {reservation.startTime && (
                            <>
                              <RiTimeLine className="ml-3 mr-1" />
                              <span>{formatTime(reservation.startTime)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                        reservation
                      </span>
                      {reservation.isDiscountAvailable && (
                        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 font-medium">
                          Discount
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      ${reservation.pricePerDayPerParticipant}/day/participant
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {participantCounts[reservation.id] || 0} /{" "}
                      {reservation.maxParticipantsPerDay} participants
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/admin/dashboard/reservations/${reservation.id}`}
                        className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm"
                      >
                        <span>View Bookings</span>
                      </Link>
                      <Link
                        href={`/admin/dashboard/edit-reservation?id=${reservation.id}`}
                        className="flex items-center space-x-1 p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        <RiEdit2Line className="w-4 h-4" />
                        <span className="text-sm">Edit</span>
                      </Link>
                    </div>

                    <button
                      className={`p-2 rounded-lg transition-colors ${
                        deletingIds.has(reservation.id)
                          ? "opacity-50 cursor-not-allowed text-gray-400"
                          : "text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 cursor-pointer"
                      }`}
                      onClick={() => handleDelete(reservation.id)}
                      disabled={deletingIds.has(reservation.id)}
                      title="Delete reservation"
                    >
                      {deletingIds.has(reservation.id) ? (
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin"></div>
                      ) : (
                        <RiDeleteBinLine className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
