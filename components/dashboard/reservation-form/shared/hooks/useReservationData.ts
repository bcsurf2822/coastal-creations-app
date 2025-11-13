import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { ReservationFormState } from "../types/reservationForm.types";
import { Reservation } from "@/lib/types/reservationTypes";

interface UseReservationDataReturn {
  reservationData: ReservationFormState | null;
  isLoading: boolean;
  error: string | null;
  existingImageUrl: string | null;
}

const transformReservationToFormState = (reservation: Reservation): ReservationFormState => {
  // Build custom times from dailyAvailability if timeType is custom
  const customTimes = reservation.timeType === "custom"
    ? reservation.dailyAvailability
        .filter(day => day.startTime || day.endTime)
        .map(day => ({
          date: dayjs(day.date).format("YYYY-MM-DD"),
          startTime: day.startTime ? dayjs(day.startTime, "HH:mm") : null,
          endTime: day.endTime ? dayjs(day.endTime, "HH:mm") : null,
        }))
    : [];

  return {
    eventName: reservation.eventName,
    eventType: "reservation",
    description: reservation.description,
    pricePerDayPerParticipant: reservation.pricePerDayPerParticipant,
    maxParticipantsPerDay: reservation.dailyAvailability.length > 0
      ? reservation.dailyAvailability[0].maxParticipants
      : 0,
    startDate: dayjs(reservation.dates.startDate).format("YYYY-MM-DD"),
    endDate: reservation.dates.endDate
      ? dayjs(reservation.dates.endDate).format("YYYY-MM-DD")
      : undefined,
    timeType: reservation.timeType || "same",
    startTime: dayjs(reservation.time.startTime, "HH:mm"),
    endTime: reservation.time.endTime ? dayjs(reservation.time.endTime, "HH:mm") : null,
    customTimes,
    excludeDates: reservation.dates.excludeDates
      ? reservation.dates.excludeDates.map(date => dayjs(date).format("YYYY-MM-DD"))
      : [],
    hasOptions: Boolean(reservation.options && reservation.options.length > 0),
    optionCategories: reservation.options || [],
    isDiscountAvailable: Boolean(reservation.isDiscountAvailable),
    discount: reservation.discount,
    image: undefined,
    imageUrl: reservation.image || undefined,
  };
};

export const useReservationData = (reservationId: string | null): UseReservationDataReturn => {
  const [reservationData, setReservationData] = useState<ReservationFormState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!reservationId) {
      setReservationData(null);
      setExistingImageUrl(null);
      return;
    }

    const fetchReservation = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/reservations/${reservationId}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Reservation not found");
          }
          throw new Error("Failed to fetch reservation data");
        }

        const result = await response.json();

        if (!result.success || !result.data) {
          throw new Error(result.error || "Invalid response format");
        }

        const formData = transformReservationToFormState(result.data);
        setReservationData(formData);
        setExistingImageUrl(result.data.image || null);

      } catch (err) {
        console.error("[RESERVATION-DATA] Error fetching reservation:", err);
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        setReservationData(null);
        setExistingImageUrl(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservation();
  }, [reservationId]);

  return {
    reservationData,
    isLoading,
    error,
    existingImageUrl,
  };
};