import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { IEvent } from "@/lib/models/Event";
import {
  EventFormState,
  EventFormErrors,
  UseEventFormReturn,
  EventFormProps,
} from "../types/eventForm.types";
import { validateEventForm } from "../utils/validationHelpers";
import { prepareDateForSubmit } from "../utils/dateHelpers";

const getInitialFormState = (
  eventType: EventFormState["eventType"] = "class"
): EventFormState => ({
  eventName: "",
  eventType,
  description: "",
  price: undefined,
  numberOfParticipants: undefined,
  startDate: "",
  endDate: eventType === "reservation" ? "" : undefined,
  startTime: null,
  endTime: null,
  isRecurring: false,
  recurringPattern: "weekly",
  recurringEndDate: "",
  hasOptions: false,
  optionCategories: [],
  isDiscountAvailable: false,
  discount: undefined,
  image: undefined,
  imageUrl: undefined,
  reservationSettings:
    eventType === "reservation"
      ? {
          dayPricing: [{ numberOfDays: 1, price: 75 }],
          dailyCapacity: undefined,
        }
      : undefined,
});

export const useEventForm = ({
  mode,
  eventId,
  initialData,
  onSuccess,
}: EventFormProps): UseEventFormReturn => {
  const router = useRouter();
  const isSubmittingRef = useRef(false);

  const [formData, setFormData] = useState<EventFormState>(
    initialData || getInitialFormState()
  );
  const [errors, setErrors] = useState<EventFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleInputChange = useCallback(
    (field: keyof EventFormState, value: unknown) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      if (errors[field as string]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field as string];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const handleNestedChange = useCallback(
    (field: string, value: string | number) => {
      const fieldParts = field.split(".");
      setFormData((prev) => {
        const newData = { ...prev };
        let current: Record<string, unknown> = newData;

        for (let i = 0; i < fieldParts.length - 1; i++) {
          if (!current[fieldParts[i]]) {
            current[fieldParts[i]] = {};
          }
          current = current[fieldParts[i]] as Record<string, unknown>;
        }

        current[fieldParts[fieldParts.length - 1]] = value;
        return newData;
      });

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
      const timeValue = event.target.value;
      if (timeValue) {
        const [hours, minutes] = timeValue.split(":").map(Number);
        const timeObj = dayjs().hour(hours).minute(minutes).second(0);
        handleInputChange(field, timeObj);
      } else {
        handleInputChange(field, null);
      }
    },
    [handleInputChange]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setFormData((prev) => ({ ...prev, image: file }));
      }
    },
    []
  );

  // Option category management
  const addOptionCategory = useCallback(() => {
    const newCategory = {
      categoryName: "",
      categoryDescription: "",
      choices: [{ name: "", price: undefined as number | undefined }],
    };

    setFormData((prev) => ({
      ...prev,
      optionCategories: [...prev.optionCategories, newCategory],
    }));
  }, []);

  const removeOptionCategory = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      optionCategories: prev.optionCategories.filter((_, i) => i !== index),
    }));
  }, []);

  const addChoiceToCategory = useCallback((categoryIndex: number) => {
    setFormData((prev) => {
      const newCategories = [...prev.optionCategories];
      newCategories[categoryIndex] = {
        ...newCategories[categoryIndex],
        choices: [
          ...newCategories[categoryIndex].choices,
          { name: "", price: undefined },
        ],
      };
      return { ...prev, optionCategories: newCategories };
    });
  }, []);

  const removeChoiceFromCategory = useCallback(
    (categoryIndex: number, choiceIndex: number) => {
      setFormData((prev) => {
        const newCategories = [...prev.optionCategories];
        newCategories[categoryIndex] = {
          ...newCategories[categoryIndex],
          choices: newCategories[categoryIndex].choices.filter(
            (_, i) => i !== choiceIndex
          ),
        };
        return { ...prev, optionCategories: newCategories };
      });
    },
    []
  );

  const updateOptionCategory = useCallback(
    (categoryIndex: number, field: string, value: string) => {
      setFormData((prev) => {
        const newCategories = [...prev.optionCategories];
        newCategories[categoryIndex] = {
          ...newCategories[categoryIndex],
          [field]: value,
        };
        return { ...prev, optionCategories: newCategories };
      });
    },
    []
  );

  const updateChoice = useCallback(
    (
      categoryIndex: number,
      choiceIndex: number,
      field: string,
      value: string | number | undefined
    ) => {
      setFormData((prev) => {
        const newCategories = [...prev.optionCategories];
        newCategories[categoryIndex] = {
          ...newCategories[categoryIndex],
          choices: newCategories[categoryIndex].choices.map((choice, i) =>
            i === choiceIndex
              ? {
                  ...choice,
                  [field]:
                    field === "price"
                      ? value
                        ? Number(value)
                        : undefined
                      : value,
                }
              : choice
          ),
        };
        return { ...prev, optionCategories: newCategories };
      });
    },
    []
  );

  const validateForm = useCallback((): boolean => {
    const newErrors = validateEventForm(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const getFieldError = useCallback(
    (fieldPath: string): string | null => {
      return errors[fieldPath] || null;
    },
    [errors]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (isSubmittingRef.current) return;

      if (!validateForm()) {
        const firstError = Object.values(errors)[0];
        if (firstError) {
          toast.error(`Validation error: ${firstError}`);
        }
        return;
      }

      isSubmittingRef.current = true;
      setIsSubmitting(true);

      try {
        const eventData: Partial<IEvent> = {
          eventName: formData.eventName,
          eventType: formData.eventType,
          description: formData.description,
          price: formData.price,
          numberOfParticipants: formData.numberOfParticipants,
          image: formData.imageUrl || undefined,
          dates: {
            startDate: prepareDateForSubmit(formData.startDate)!,
            isRecurring:
              formData.eventType !== "reservation"
                ? formData.isRecurring
                : false,
            ...(formData.eventType === "reservation" &&
              formData.endDate && {
                endDate: prepareDateForSubmit(formData.endDate)!,
              }),
            ...(formData.eventType !== "reservation" &&
              formData.isRecurring && {
                recurringPattern: formData.recurringPattern,
                recurringEndDate: prepareDateForSubmit(
                  formData.recurringEndDate
                )!,
              }),
          },
          time: {
            startTime: formData.startTime?.format("HH:mm") || "",
            endTime: formData.endTime?.format("HH:mm") || "",
          },
          ...(formData.hasOptions &&
            formData.optionCategories.length > 0 && {
              options: formData.optionCategories.map((category) => ({
                categoryName: category.categoryName,
                categoryDescription: category.categoryDescription,
                choices: category.choices.map((choice) => ({
                  name: choice.name,
                  price: choice.price || 0,
                })),
              })),
            }),
          ...(formData.isDiscountAvailable &&
            formData.discount && {
              isDiscountAvailable: true,
              discount: formData.discount,
            }),
          ...(formData.eventType === "reservation" &&
            formData.reservationSettings && {
              reservationSettings: {
                dayPricing: formData.reservationSettings.dayPricing || [
                  { numberOfDays: 1, price: 75 }
                ],
                dailyCapacity: formData.reservationSettings.dailyCapacity,
              },
            }),
        };

        const apiEndpoint =
          mode === "add" ? "/api/events" : `/api/event/${eventId}`;

        const method = mode === "add" ? "POST" : "PATCH";

        const response = await fetch(apiEndpoint, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventData),
        });

        if (!response.ok) {
          throw new Error(`Failed to ${mode} event`);
        }

        const successMessage =
          mode === "add"
            ? "Event created successfully!"
            : "Event updated successfully!";

        toast.success(successMessage);

        if (onSuccess) {
          onSuccess(eventId);
        } else {
          router.push("/admin/dashboard");
        }
      } catch (error) {
        console.error(
          `[useEventForm-handleSubmit] Error ${mode}ing event:`,
          error
        );
        toast.error(`Failed to ${mode} event. Please try again.`);
      } finally {
        isSubmittingRef.current = false;
        setIsSubmitting(false);
      }
    },
    [formData, errors, mode, eventId, validateForm, onSuccess, router]
  );

  const actions = {
    handleInputChange,
    handleNestedChange,
    handleTimeChange,
    handleFileChange,
    addOptionCategory,
    removeOptionCategory,
    addChoiceToCategory,
    removeChoiceFromCategory,
    updateOptionCategory,
    updateChoice,
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
