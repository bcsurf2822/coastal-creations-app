import { EventFormState, EventFormErrors } from "../types/eventForm.types";

export const validateEventForm = (formData: EventFormState): EventFormErrors => {
  const newErrors: EventFormErrors = {};

  // Basic validations
  if (!formData.eventName.trim()) {
    newErrors.eventName = "Event name is required";
  }

  if (!formData.description.trim()) {
    newErrors.description = "Description is required";
  } else if (formData.description.length < 10) {
    newErrors.description = "Description must be at least 10 characters";
  }

  if (!formData.startDate) {
    newErrors.startDate = "Start date is required";
  } else {
    const startDate = new Date(formData.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (startDate < today) {
      newErrors.startDate = "Start date must be in the future";
    }
  }

  if (!formData.startTime) {
    newErrors.startTime = "Start time is required";
  }

  if (!formData.endTime) {
    newErrors.endTime = "End time is required";
  } else if (
    formData.startTime &&
    formData.endTime.isBefore(formData.startTime)
  ) {
    newErrors.endTime = "End time must be after start time";
  }

  // Event type specific validations
  if (
    formData.eventType !== "artist" &&
    formData.eventType !== "reservation"
  ) {
    if (!formData.price || formData.price <= 0) {
      newErrors.price = "Price is required and must be greater than 0";
    }

    if (
      !formData.numberOfParticipants ||
      formData.numberOfParticipants < 1 ||
      formData.numberOfParticipants > 20
    ) {
      newErrors.numberOfParticipants =
        "Number of participants must be between 1 and 20";
    }
  }

  // Reservation specific validations
  if (formData.eventType === "reservation") {
    if (!formData.endDate) {
      newErrors.endDate = "End date is required for reservation events";
    } else {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (endDate <= startDate) {
        newErrors.endDate = "End date must be after start date";
      }
    }
  }

  // Recurring event validations
  if (
    formData.eventType !== "artist" &&
    formData.eventType !== "reservation" &&
    formData.isRecurring
  ) {
    if (!formData.recurringEndDate) {
      newErrors.recurringEndDate = "Recurring end date is required";
    } else {
      const startDate = new Date(formData.startDate);
      const recurringEndDate = new Date(formData.recurringEndDate);
      if (recurringEndDate <= startDate) {
        newErrors.recurringEndDate =
          "Recurring end date must be after start date";
      }
    }
  }

  // Options validations
  if (
    formData.eventType !== "artist" &&
    formData.eventType !== "reservation" &&
    formData.hasOptions
  ) {
    if (formData.optionCategories.length === 0) {
      newErrors.optionCategories =
        "At least one option category is required when options are enabled";
    } else {
      formData.optionCategories.forEach((category, categoryIndex) => {
        if (!category.categoryName.trim()) {
          newErrors[`optionCategories.${categoryIndex}.categoryName`] =
            "Category name is required";
        }
        category.choices.forEach((choice, choiceIndex) => {
          if (!choice.name.trim()) {
            newErrors[
              `optionCategories.${categoryIndex}.choices.${choiceIndex}.name`
            ] = "Choice name is required";
          }
          if (choice.price !== undefined && choice.price < 0) {
            newErrors[
              `optionCategories.${categoryIndex}.choices.${choiceIndex}.price`
            ] = "Choice price must be 0 or greater";
          }
        });
      });
    }
  }

  // Discount validations
  if (
    formData.eventType !== "artist" &&
    formData.isDiscountAvailable &&
    formData.discount
  ) {
    if (!formData.discount.name.trim()) {
      newErrors["discount.name"] = "Discount name is required";
    }

    if (!formData.discount.value || formData.discount.value <= 0) {
      newErrors["discount.value"] =
        "Discount value is required and must be greater than 0";
    } else {
      if (
        formData.discount.type === "percentage" &&
        formData.discount.value > 100
      ) {
        newErrors["discount.value"] =
          "Percentage discount cannot exceed 100%";
      }
      if (
        formData.discount.type === "fixed" &&
        formData.price &&
        formData.discount.value >= formData.price
      ) {
        newErrors["discount.value"] =
          "Fixed discount cannot be greater than or equal to the price";
      }
    }

    if (
      !formData.discount.minParticipants ||
      formData.discount.minParticipants < 2 ||
      formData.discount.minParticipants > 20
    ) {
      newErrors["discount.minParticipants"] =
        "Minimum participants must be between 2 and 20";
    }
  }

  return newErrors;
};