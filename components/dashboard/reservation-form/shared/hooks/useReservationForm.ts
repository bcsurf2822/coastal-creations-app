import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import {
  ReservationFormState,
  ReservationFormErrors,
  UseReservationFormReturn,
  ReservationFormProps,
} from "../types/reservationForm.types";
import { validateReservationForm } from "../utils/validationHelpers";
import { prepareDateForSubmit } from "../../../event-form/shared/utils/dateHelpers";

const getInitialFormState = (): ReservationFormState => ({
  eventName: "",
  eventType: "reservation",
  description: "",
  pricePerDayPerParticipant: 0,
  maxParticipantsPerDay: 0,
  startDate: "",
  endDate: undefined,
  timeType: "same",
  startTime: null,
  endTime: null,
  customTimes: [],
  excludeDates: [],
  // Time slot configuration defaults - always enabled for reservations
  enableTimeSlots: true,
  slotDurationMinutes: 60, // Default to 1 hour
  maxParticipantsPerSlot: 1,
  hasOptions: false,
  optionCategories: [],
  isDiscountAvailable: false,
  discount: undefined,
  image: undefined,
  imageUrl: undefined,
});

export const useReservationForm = ({
  mode,
  reservationId,
  initialData,
  onSuccess,
}: ReservationFormProps): UseReservationFormReturn => {
  const router = useRouter();
  const isSubmittingRef = useRef(false);

  const [formData, setFormData] = useState<ReservationFormState>(
    initialData || getInitialFormState()
  );
  const [errors, setErrors] = useState<ReservationFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const validateForm = useCallback((): boolean => {
    const validationErrors = validateReservationForm(formData);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [formData]);

  const getFieldError = useCallback(
    (fieldPath: string): string | null => {
      return errors[fieldPath] || null;
    },
    [errors]
  );

  const handleInputChange = useCallback(
    (field: keyof ReservationFormState, value: unknown) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const handleNestedChange = useCallback(
    (field: string, value: string | number) => {
      const [parentKey, childKey] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parentKey]: {
          ...(prev[
            parentKey as keyof ReservationFormState
          ] as unknown as Record<string, unknown>),
          [childKey]: value,
        },
      }));

      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const handleTimeChange = useCallback(
    (
      event: React.ChangeEvent<HTMLSelectElement>,
      field: "startTime" | "endTime"
    ) => {
      const value = event.target.value;
      if (value) {
        const [hours, minutes] = value.split(":");
        const timeObj = dayjs().hour(parseInt(hours)).minute(parseInt(minutes));
        handleInputChange(field, timeObj);
      } else {
        handleInputChange(field, null);
      }
    },
    [handleInputChange]
  );

  const handleCustomTimeChange = useCallback(
    (
      dayIndex: number,
      field: "startTime" | "endTime",
      event: React.ChangeEvent<HTMLSelectElement>
    ) => {
      const value = event.target.value;
      const newCustomTimes = [...formData.customTimes];

      if (value) {
        const [hours, minutes] = value.split(":");
        const timeObj = dayjs().hour(parseInt(hours)).minute(parseInt(minutes));
        newCustomTimes[dayIndex] = {
          ...newCustomTimes[dayIndex],
          [field]: timeObj,
        };
      } else {
        newCustomTimes[dayIndex] = {
          ...newCustomTimes[dayIndex],
          [field]: null,
        };
      }

      handleInputChange("customTimes", newCustomTimes);

      // Clear the specific error for this field
      const errorKey = `customTimes.${dayIndex}.${field}`;
      if (errors[errorKey]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[errorKey];
          return newErrors;
        });
      }
    },
    [formData.customTimes, handleInputChange, errors]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleInputChange("image", file);
        const imageUrl = URL.createObjectURL(file);
        handleInputChange("imageUrl", imageUrl);
      }
    },
    [handleInputChange]
  );

  const addOptionCategory = useCallback(() => {
    const newCategory = {
      categoryName: "",
      categoryDescription: "",
      choices: [{ name: "", price: 0 }],
    };
    handleInputChange("optionCategories", [
      ...formData.optionCategories,
      newCategory,
    ]);
  }, [formData.optionCategories, handleInputChange]);

  const removeOptionCategory = useCallback(
    (index: number) => {
      const newCategories = formData.optionCategories.filter(
        (_, i) => i !== index
      );
      handleInputChange("optionCategories", newCategories);
    },
    [formData.optionCategories, handleInputChange]
  );

  const addChoiceToCategory = useCallback(
    (categoryIndex: number) => {
      const newCategories = [...formData.optionCategories];
      newCategories[categoryIndex].choices.push({ name: "", price: 0 });
      handleInputChange("optionCategories", newCategories);
    },
    [formData.optionCategories, handleInputChange]
  );

  const removeChoiceFromCategory = useCallback(
    (categoryIndex: number, choiceIndex: number) => {
      const newCategories = [...formData.optionCategories];
      newCategories[categoryIndex].choices = newCategories[
        categoryIndex
      ].choices.filter((_, i) => i !== choiceIndex);
      handleInputChange("optionCategories", newCategories);
    },
    [formData.optionCategories, handleInputChange]
  );

  const updateOptionCategory = useCallback(
    (categoryIndex: number, field: string, value: string) => {
      const newCategories = [...formData.optionCategories];
      (newCategories[categoryIndex] as unknown as Record<string, unknown>)[
        field
      ] = value;
      handleInputChange("optionCategories", newCategories);
    },
    [formData.optionCategories, handleInputChange]
  );

  const updateChoice = useCallback(
    (
      categoryIndex: number,
      choiceIndex: number,
      field: string,
      value: string | number | undefined
    ) => {
      const newCategories = [...formData.optionCategories];
      (
        newCategories[categoryIndex].choices[choiceIndex] as unknown as Record<
          string,
          unknown
        >
      )[field] = value;
      handleInputChange("optionCategories", newCategories);
    },
    [formData.optionCategories, handleInputChange]
  );

  const addExcludeDate = useCallback(
    (date: string) => {
      if (date && !formData.excludeDates.includes(date)) {
        handleInputChange("excludeDates", [...formData.excludeDates, date]);
      }
    },
    [formData.excludeDates, handleInputChange]
  );

  const removeExcludeDate = useCallback(
    (index: number) => {
      const newExcludeDates = formData.excludeDates.filter(
        (_, i) => i !== index
      );
      handleInputChange("excludeDates", newExcludeDates);
    },
    [formData.excludeDates, handleInputChange]
  );

  const prepareFormDataForSubmit = useCallback(() => {
    const submitData = {
      eventName: formData.eventName,
      eventType: formData.eventType,
      description: formData.description,
      pricePerDayPerParticipant: formData.pricePerDayPerParticipant,
      maxParticipantsPerDay: formData.maxParticipantsPerDay,
      dates: {
        startDate: prepareDateForSubmit(formData.startDate),
        endDate: formData.endDate
          ? prepareDateForSubmit(formData.endDate)
          : undefined,
        excludeDates:
          formData.excludeDates.length > 0
            ? formData.excludeDates.map(prepareDateForSubmit)
            : undefined,
      },
      timeType: formData.timeType,
      time: {
        startTime: formData.startTime?.format("HH:mm") || undefined,
        endTime: formData.endTime?.format("HH:mm") || undefined,
      },
      customTimes:
        formData.timeType === "custom"
          ? formData.customTimes.map((ct) => ({
              date: ct.date,
              startTime: ct.startTime?.format("HH:mm") || undefined,
              endTime: ct.endTime?.format("HH:mm") || undefined,
            }))
          : undefined,
      // Time slot configuration - always enabled for reservations when timeType is "same"
      enableTimeSlots: formData.timeType === "same",
      slotDurationMinutes:
        formData.timeType === "same" ? formData.slotDurationMinutes : undefined,
      maxParticipantsPerSlot:
        formData.timeType === "same" ? formData.maxParticipantsPerSlot : undefined,
      options:
        formData.hasOptions && formData.optionCategories.length > 0
          ? formData.optionCategories
          : undefined,
      isDiscountAvailable: formData.isDiscountAvailable,
      discount: formData.isDiscountAvailable ? formData.discount : undefined,
    };

    return submitData;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (isSubmittingRef.current) return;

      if (!validateForm()) {
        toast.error("Please fix the form errors before submitting");
        return;
      }

      isSubmittingRef.current = true;
      setIsSubmitting(true);

      try {
        const submitData = prepareFormDataForSubmit();

        const endpoint =
          mode === "add"
            ? "/api/reservations"
            : `/api/reservations/${reservationId}`;

        const method = mode === "add" ? "POST" : "PUT";
        const response = await fetch(endpoint, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submitData),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to save reservation");
        }

        toast.success(
          mode === "add"
            ? "Reservation created successfully!"
            : "Reservation updated successfully!"
        );

        if (onSuccess) {
          onSuccess(result.data?._id);
        } else {
          router.push("/admin/dashboard/reservations");
        }
      } catch (error) {
        console.error(
          `[RESERVATION-FORM-ERROR] Error saving reservation:`,
          error
        );
        toast.error(
          error instanceof Error ? error.message : "Failed to save reservation"
        );
      } finally {
        isSubmittingRef.current = false;
        setIsSubmitting(false);
      }
    },
    [
      validateForm,
      prepareFormDataForSubmit,
      mode,
      reservationId,
      onSuccess,
      router,
    ]
  );

  const actions = {
    handleInputChange,
    handleNestedChange,
    handleTimeChange,
    handleCustomTimeChange,
    handleFileChange,
    addOptionCategory,
    removeOptionCategory,
    addChoiceToCategory,
    removeChoiceFromCategory,
    updateOptionCategory,
    updateChoice,
    addExcludeDate,
    removeExcludeDate,
  };

  return {
    formData,
    errors,
    actions,
    isSubmitting,
    handleSubmit,
    validateForm,
    getFieldError,
  };
};
