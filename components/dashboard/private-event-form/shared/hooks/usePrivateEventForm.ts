import { useState, useEffect, useCallback } from "react";
import {
  PrivateEventFormState,
  PrivateEventFormErrors,
  PrivateEventFormActions,
  UsePrivateEventFormProps,
  UsePrivateEventFormReturn,
  PrivateEventApiResponse
} from "../types/privateEventForm.types";
import { validatePrivateEventForm, getInitialPrivateEventFormState } from "../utils/validationHelpers";

export const usePrivateEventForm = ({
  mode,
  privateEventId,
  initialData,
  onSuccess
}: UsePrivateEventFormProps): UsePrivateEventFormReturn => {
  const [formData, setFormData] = useState<PrivateEventFormState>(
    initialData || getInitialPrivateEventFormState()
  );
  const [errors, setErrors] = useState<PrivateEventFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch existing private event data for edit mode
  useEffect(() => {
    if (mode === "edit" && privateEventId && !initialData) {
      const fetchPrivateEvent = async () => {
        try {
          const response = await fetch(`/api/private-events?id=${privateEventId}`);
          const result: PrivateEventApiResponse = await response.json();

          if (result.success && result.privateEvent) {
            const privateEvent = result.privateEvent;
            setFormData({
              title: privateEvent.title || "",
              description: privateEvent.description || "",
              notes: privateEvent.notes || "",
              price: privateEvent.price || 0,
              minimum: privateEvent.minimum || 1,
              unit: privateEvent.unit || "participants",
              image: null,
            });
          }
        } catch (error) {
          console.error("[PRIVATE-EVENT-FORM-HOOK] Error fetching private event:", error);
        }
      };

      fetchPrivateEvent();
    }
  }, [mode, privateEventId, initialData]);

  const handleInputChange = useCallback((field: keyof PrivateEventFormState, value: string | number | File | null | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const handleImageChange = useCallback((file: File | null) => {
    setFormData(prev => ({
      ...prev,
      image: file
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(getInitialPrivateEventFormState());
    setErrors({});
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form
    const validationErrors = validatePrivateEventForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare form data for submission
      const submitData = {
        title: formData.title,
        description: formData.description,
        notes: formData.notes,
        price: formData.price,
        minimum: formData.minimum,
        unit: formData.unit,
      };

      const url = mode === "edit" && privateEventId
        ? `/api/private-events?id=${privateEventId}`
        : "/api/private-events";

      const method = mode === "edit" ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const result: PrivateEventApiResponse = await response.json();

      if (result.success) {
        console.log(`[PRIVATE-EVENT-FORM-HOOK] Private event ${mode === "edit" ? "updated" : "created"} successfully`);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error(result.error || `Failed to ${mode} private event`);
      }
    } catch (error) {
      console.error(`[PRIVATE-EVENT-FORM-HOOK] Error ${mode === "edit" ? "updating" : "creating"} private event:`, error);
      setErrors({
        submit: error instanceof Error ? error.message : `Failed to ${mode} private event`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const actions: PrivateEventFormActions = {
    handleInputChange,
    handleImageChange,
    resetForm,
  };

  return {
    formData,
    errors,
    actions,
    isSubmitting,
    handleSubmit,
  };
};