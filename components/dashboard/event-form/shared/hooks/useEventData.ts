import { useState, useEffect } from "react";
import { EventFormState } from "../types/eventForm.types";
import { formatDateForInput } from "../utils/dateHelpers";
import dayjs from "dayjs";

interface UseEventDataReturn {
  eventData: EventFormState | null;
  isLoading: boolean;
  error: string | null;
  existingImageUrl: string | null;
}

export const useEventData = (eventId: string | null): UseEventDataReturn => {
  const [eventData, setEventData] = useState<EventFormState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) {
        setError("No event ID provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/event/${eventId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch event");
        }

        const data = await response.json();

        if (!data.success || !data.event) {
          throw new Error(data.error || "Event not found");
        }

        const event = data.event;

        // Transform the API data to match our form state structure
        const formState: EventFormState = {
          eventName: event.eventName || "",
          eventType: event.eventType || "class",
          description: event.description || "",
          price: event.price,
          numberOfParticipants: event.numberOfParticipants,
          startDate: event.dates?.startDate ? formatDateForInput(event.dates.startDate) : "",
          endDate: event.dates?.endDate ? formatDateForInput(event.dates.endDate) : undefined,
          startTime: null,
          endTime: null,
          isRecurring: event.dates?.isRecurring || false,
          recurringPattern: event.dates?.recurringPattern || "weekly",
          recurringEndDate: event.dates?.recurringEndDate
            ? formatDateForInput(event.dates.recurringEndDate)
            : "",
          hasOptions: Boolean(event.options && event.options.length > 0),
          optionCategories: event.options || [],
          isDiscountAvailable: event.isDiscountAvailable || false,
          discount: event.discount,
          image: undefined,
          imageUrl: event.image,
          reservationSettings: event.reservationSettings ? {
            dayPricing: event.reservationSettings.dayPricing || [{ numberOfDays: 1, price: 75 }],
            dailyCapacity: event.reservationSettings.dailyCapacity,
          } : undefined,
        };

        // Format time objects
        if (event.time?.startTime) {
          const [hours, minutes] = event.time.startTime.split(":").map(Number);
          formState.startTime = dayjs().hour(hours).minute(minutes).second(0);
        }

        if (event.time?.endTime) {
          const [hours, minutes] = event.time.endTime.split(":").map(Number);
          formState.endTime = dayjs().hour(hours).minute(minutes).second(0);
        }

        setEventData(formState);

        if (event.image) {
          setExistingImageUrl(event.image);
        }
      } catch (err) {
        console.error("[useEventData-fetchEvent] Error fetching event:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  return {
    eventData,
    isLoading,
    error,
    existingImageUrl,
  };
};