"use client";

import { useState, useEffect, ReactElement } from "react";
import Link from "next/link";
import Image from "next/image";

interface Event {
  _id: string;
  eventName: string;
  description: string;
  price?: number;
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

interface ReservationsListProps {
  className?: string;
}

export default function ReservationsList({ className = "" }: ReservationsListProps): ReactElement {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReservationEvents();
  }, []);

  const fetchReservationEvents = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch("/api/events?type=reservation");
      
      if (!response.ok) {
        throw new Error("Failed to fetch reservation events");
      }
      
      const data = await response.json();
      setEvents(data.events || []);
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

  const formatPriceRange = (dayPricing: Event['reservationSettings']['dayPricing']): string => {
    if (!dayPricing || dayPricing.length === 0) return "";
    
    const prices = dayPricing.map(tier => tier.price).sort((a, b) => a - b);
    const minPrice = prices[0];
    const maxPrice = prices[prices.length - 1];
    
    if (minPrice === maxPrice) {
      return `$${minPrice}`;
    }
    
    return `$${minPrice} - $${maxPrice}`;
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600">Error loading reservations: {error}</p>
          <button
            onClick={fetchReservationEvents}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Reservations Available</h3>
          <p className="text-gray-600">There are currently no reservation events available for booking.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <div
            key={event._id}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
          >
            {/* Event Image */}
            <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-500">
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
                    <div className="text-4xl mb-2">🏕️</div>
                    <p className="text-sm">Multi-Day Experience</p>
                  </div>
                </div>
              )}
            </div>

            {/* Event Details */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                {event.eventName}
              </h3>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {event.description}
              </p>

              {/* Date and Time Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium mr-2">📅</span>
                  <span>
                    {formatDate(event.dates.startDate)}
                    {event.dates.endDate && ` - ${formatDate(event.dates.endDate)}`}
                  </span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium mr-2">⏰</span>
                  <span>
                    {formatTime(event.time.startTime)}
                    {event.time.endTime && ` - ${formatTime(event.time.endTime)}`}
                  </span>
                </div>

                {event.reservationSettings?.dailyCapacity && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium mr-2">👥</span>
                    <span>Max {event.reservationSettings.dailyCapacity} participants per day</span>
                  </div>
                )}
              </div>

              {/* Pricing Info */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-bold text-green-600">
                  {event.reservationSettings?.dayPricing 
                    ? formatPriceRange(event.reservationSettings.dayPricing)
                    : event.price 
                      ? `$${event.price}` 
                      : "Price TBD"
                  }
                  <span className="text-sm text-gray-500 ml-1">per day</span>
                </div>
              </div>

              {/* Day Pricing Tiers */}
              {event.reservationSettings?.dayPricing && event.reservationSettings.dayPricing.length > 1 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Pricing Options:</p>
                  <div className="flex flex-wrap gap-1">
                    {event.reservationSettings.dayPricing.map((tier, index) => (
                      <span
                        key={index}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                      >
                        {tier.numberOfDays} day{tier.numberOfDays > 1 ? 's' : ''}: ${tier.price}
                        {tier.label && ` (${tier.label})`}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Book Now Button */}
              <Link
                href={`/reservations/book/${event._id}`}
                className="block w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition-all duration-200 transform hover:scale-105"
              >
                Book Reservation
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}