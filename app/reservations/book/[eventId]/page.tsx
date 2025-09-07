"use client";

import { useState, useEffect, ReactElement } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import ReservationBookingForm from "@/components/reservations/ReservationBookingForm";

interface Event {
  _id: string;
  eventName: string;
  description: string;
  dates: {
    startDate: string;
    endDate?: string;
  };
  time: {
    startTime: string;
    endTime?: string;
  };
  image?: string;
  reservationSettings?: {
    dayPricing: Array<{
      numberOfDays: number;
      price: number;
      label?: string;
    }>;
    dailyCapacity?: number;
  };
}

export default function BookReservationPage(): ReactElement {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;

  useEffect(() => {
    if (eventId) {
      fetchEvent(eventId);
    }
  }, [eventId]);

  const fetchEvent = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch(`/api/events/${id}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch event details");
      }
      
      const data = await response.json();
      if (data.success && data.event) {
        // Validate this is a reservation event
        if (data.event.eventType !== "reservation") {
          throw new Error("This event is not available for reservation booking");
        }
        setEvent(data.event);
      } else {
        throw new Error("Event not found");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
          <p className="text-red-600 mb-4">{error || "Event not found"}</p>
          <button
            onClick={() => router.push("/reservations")}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Back to Reservations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.push("/reservations")}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors"
          >
            <span className="mr-2">←</span>
            Back to Reservations
          </button>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Event Image */}
            <div className="lg:w-1/3">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500">
                {event.image ? (
                  <Image
                    src={event.image}
                    alt={event.eventName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-6xl mb-4">🏕️</div>
                      <p className="text-xl">Multi-Day Experience</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Event Details */}
            <div className="lg:w-2/3">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {event.eventName}
              </h1>
              
              <p className="text-gray-600 text-lg mb-6">
                {event.description}
              </p>

              {/* Event Info Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">📅</span>
                    <div>
                      <p className="font-semibold text-gray-800">Available Dates</p>
                      <p className="text-gray-600">
                        {formatDate(event.dates.startDate)}
                        {event.dates.endDate && ` - ${formatDate(event.dates.endDate)}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">⏰</span>
                    <div>
                      <p className="font-semibold text-gray-800">Daily Schedule</p>
                      <p className="text-gray-600">
                        {formatTime(event.time.startTime)}
                        {event.time.endTime && ` - ${formatTime(event.time.endTime)}`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {event.reservationSettings?.dailyCapacity && (
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">👥</span>
                      <div>
                        <p className="font-semibold text-gray-800">Daily Capacity</p>
                        <p className="text-gray-600">
                          Maximum {event.reservationSettings.dailyCapacity} participants per day
                        </p>
                      </div>
                    </div>
                  )}

                  {event.reservationSettings?.dayPricing && (
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">💰</span>
                      <div>
                        <p className="font-semibold text-gray-800">Pricing Options</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {event.reservationSettings.dayPricing.map((tier, index) => (
                            <span
                              key={index}
                              className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                            >
                              {tier.numberOfDays} day{tier.numberOfDays > 1 ? 's' : ''}: ${tier.price}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Customize Your Reservation
          </h2>
          
          <ReservationBookingForm event={event} />
        </div>
      </div>
    </div>
  );
}