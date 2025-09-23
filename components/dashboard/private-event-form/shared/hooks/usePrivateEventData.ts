import { useState, useEffect } from "react";
import { PrivateEventFormState } from "../types/privateEventForm.types";

interface UsePrivateEventDataReturn {
  privateEventData: PrivateEventFormState | null;
  isLoading: boolean;
  error: string | null;
  existingImageUrl: string | null;
}

export const usePrivateEventData = (privateEventId: string | null): UsePrivateEventDataReturn => {
  const [privateEventData, setPrivateEventData] = useState<PrivateEventFormState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrivateEvent = async () => {
      if (!privateEventId) {
        setError("No private event ID provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/private-events/${privateEventId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch private event");
        }

        const data = await response.json();

        if (!data.success || !data.privateEvent) {
          throw new Error(data.error || "Private event not found");
        }

        const privateEvent = data.privateEvent;

        // Transform the API data to match our form state structure
        const formState: PrivateEventFormState = {
          title: privateEvent.title || "",
          description: privateEvent.description || "",
          price: privateEvent.price || 0,
          hasOptions: Boolean(privateEvent.options && privateEvent.options.length > 0),
          optionCategories: privateEvent.options || [],
          isDepositRequired: privateEvent.isDepositRequired || false,
          depositAmount: privateEvent.depositAmount,
          image: null, // File object is not stored in database
        };

        setPrivateEventData(formState);

        if (privateEvent.image) {
          setExistingImageUrl(privateEvent.image);
        }
      } catch (err) {
        console.error("[usePrivateEventData-fetchPrivateEvent] Error fetching private event:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrivateEvent();
  }, [privateEventId]);

  return {
    privateEventData,
    isLoading,
    error,
    existingImageUrl,
  };
};