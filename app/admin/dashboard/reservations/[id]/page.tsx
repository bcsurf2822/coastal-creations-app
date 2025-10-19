"use client";

import { ReactElement, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  RiArrowLeftLine,
  RiCalendarEventLine,
  RiTimeLine,
  RiUserLine,
  RiMailLine,
  RiPhoneLine,
  RiMapPinLine,
  RiEdit2Line,
} from "react-icons/ri";
import Link from "next/link";

interface Reservation {
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
  dailyAvailability?: Array<{
    date: Date;
    maxParticipants: number;
    currentBookings: number;
    isAvailable: boolean;
  }>;
}

interface Customer {
  _id: string;
  quantity: number;
  total: number;
  isSigningUpForSelf: boolean;
  selectedDates?: Array<{
    date: Date;
    numberOfParticipants: number;
  }>;
  participants: Array<{
    firstName: string;
    lastName: string;
    selectedOptions?: Array<{
      categoryName: string;
      choiceName: string;
    }>;
  }>;
  selectedOptions?: Array<{
    categoryName: string;
    choiceName: string;
  }>;
  billingInfo: {
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    stateProvince: string;
    postalCode: string;
    country: string;
    emailAddress?: string;
    phoneNumber?: string;
  };
  createdAt: string;
}

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

  useEffect(() => {
    const fetchReservationAndCustomers = async (): Promise<void> => {
      if (!reservationId) return;

      try {
        setIsLoading(true);

        console.log(`[RESERVATION-CUSTOMERS-PAGE] Fetching reservation ${reservationId}`);

        // Fetch reservation details
        const reservationResponse = await fetch(`/api/reservations/${reservationId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!reservationResponse.ok) {
          throw new Error("Failed to fetch reservation");
        }

        const reservationResult = await reservationResponse.json();
        console.log("[RESERVATION-CUSTOMERS-PAGE] Reservation fetched successfully");

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
        console.log(`[RESERVATION-CUSTOMERS-PAGE] Fetched ${customersResult.data?.length || 0} customers`);

        setData({
          reservation: reservationResult.data || reservationResult,
          customers: customersResult.data || [],
        });
      } catch (error) {
        console.error("[RESERVATION-CUSTOMERS-PAGE] Error fetching data:", error);
        setError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservationAndCustomers();
  }, [reservationId]);

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
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

  const getTotalParticipants = (): number => {
    if (!data?.customers) return 0;
    return data.customers.reduce(
      (total, customer) => total + customer.quantity,
      0
    );
  };

  const getTotalRevenue = (): number => {
    if (!data?.customers) return 0;
    return data.customers.reduce(
      (total, customer) => total + customer.total,
      0
    );
  };

  const getMaxParticipants = (): number => {
    if (!data?.reservation.dailyAvailability) return 0;
    if (data.reservation.dailyAvailability.length === 0) return data.reservation.maxParticipantsPerDay || 0;
    return data.reservation.dailyAvailability[0].maxParticipants;
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

      {/* Reservation Summary Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
              {reservation.eventName}
            </h3>
            {reservation.description && (
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {reservation.description}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Schedule
            </p>
            <div className="flex items-center text-gray-900 dark:text-white">
              <RiCalendarEventLine className="w-4 h-4 mr-2" />
              <span>
                {formatDate(reservation.dates?.startDate)} -{" "}
                {formatDate(reservation.dates?.endDate)}
              </span>
            </div>
            {reservation.time?.startTime && (
              <div className="flex items-center text-gray-600 dark:text-gray-400 mt-1">
                <RiTimeLine className="w-4 h-4 mr-2" />
                <span>{formatTime(reservation.time.startTime)}</span>
              </div>
            )}
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Participants
            </p>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {getTotalParticipants()}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              of {getMaxParticipants()} max per day
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Revenue
            </p>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${getTotalRevenue().toFixed(2)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {customers.length} booking{customers.length !== 1 ? "s" : ""}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              ${reservation.pricePerDayPerParticipant}/day/participant
            </p>
          </div>
        </div>
      </div>

      {/* Customers List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Bookings ({customers.length})
          </h3>
        </div>

        <div className="p-5">
          {customers.length === 0 ? (
            <div className="text-center py-12">
              <RiUserLine className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No bookings yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {customers.map((customer) => (
                <div
                  key={customer._id}
                  className="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Contact Info */}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Contact Information
                      </h4>
                      <div className="space-y-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {customer.billingInfo.firstName}{" "}
                          {customer.billingInfo.lastName}
                        </p>
                        {customer.billingInfo.emailAddress && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <RiMailLine className="w-4 h-4 mr-2" />
                            <span>{customer.billingInfo.emailAddress}</span>
                          </div>
                        )}
                        {customer.billingInfo.phoneNumber && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <RiPhoneLine className="w-4 h-4 mr-2" />
                            <span>{customer.billingInfo.phoneNumber}</span>
                          </div>
                        )}
                        <div className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                          <RiMapPinLine className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                          <span>
                            {customer.billingInfo.addressLine1}
                            <br />
                            {customer.billingInfo.city},{" "}
                            {customer.billingInfo.stateProvince}{" "}
                            {customer.billingInfo.postalCode}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Booking Details
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="text-gray-500 dark:text-gray-400">
                            Total Participants:
                          </span>{" "}
                          <span className="font-medium text-gray-900 dark:text-white">
                            {customer.quantity}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-500 dark:text-gray-400">
                            Total Paid:
                          </span>{" "}
                          <span className="font-medium text-green-600 dark:text-green-400">
                            ${customer.total.toFixed(2)}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-500 dark:text-gray-400">
                            Booked On:
                          </span>{" "}
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatDate(customer.createdAt)}
                          </span>
                        </p>
                        {customer.selectedDates && customer.selectedDates.length > 0 && (
                          <div className="mt-2">
                            <p className="text-gray-500 dark:text-gray-400 mb-1">
                              Selected Dates:
                            </p>
                            <div className="space-y-1">
                              {customer.selectedDates.map((dateInfo, index) => (
                                <div
                                  key={index}
                                  className="flex items-center text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded"
                                >
                                  <RiCalendarEventLine className="w-3 h-3 mr-1" />
                                  <span>
                                    {formatDate(dateInfo.date)} -{" "}
                                    {dateInfo.numberOfParticipants}{" "}
                                    participant{dateInfo.numberOfParticipants !== 1 ? "s" : ""}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Participants */}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Participants
                      </h4>
                      <div className="space-y-1 text-sm">
                        {customer.participants?.map((participant, pIndex) => (
                          <p
                            key={pIndex}
                            className="text-gray-900 dark:text-white"
                          >
                            {participant.firstName} {participant.lastName}
                          </p>
                        ))}
                      </div>

                      {/* Selected Options */}
                      {((customer.selectedOptions?.length &&
                        customer.selectedOptions.length > 0) ||
                        customer.participants?.some(
                          (p) =>
                            p.selectedOptions?.length &&
                            p.selectedOptions.length > 0
                        )) && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Options:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {customer.selectedOptions?.map((option, oIndex) => (
                              <span
                                key={oIndex}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                              >
                                {option.choiceName}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
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
