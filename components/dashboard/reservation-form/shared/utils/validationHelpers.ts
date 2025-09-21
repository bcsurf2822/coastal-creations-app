import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { ReservationFormState, ReservationFormErrors } from "../types/reservationForm.types";

dayjs.extend(isSameOrBefore);

export const validateReservationForm = (formData: ReservationFormState): ReservationFormErrors => {
  const errors: ReservationFormErrors = {};

  // Basic fields validation
  if (!formData.eventName.trim()) {
    errors.eventName = "Reservation name is required";
  }

  if (!formData.description.trim()) {
    errors.description = "Description is required";
  }

  // Pricing validation
  if (!formData.pricePerDayPerParticipant || formData.pricePerDayPerParticipant <= 0) {
    errors.pricePerDayPerParticipant = "Price per day per participant must be greater than 0";
  }

  if (!formData.maxParticipantsPerDay || formData.maxParticipantsPerDay <= 0) {
    errors.maxParticipantsPerDay = "Max participants per day must be greater than 0";
  }

  // Date validation
  if (!formData.startDate) {
    errors.startDate = "Start date is required";
  }

  if (!formData.endDate) {
    errors.endDate = "End date is required";
  }

  if (formData.startDate && formData.endDate) {
    const startDate = dayjs(formData.startDate);
    const endDate = dayjs(formData.endDate);

    if (endDate.isBefore(startDate)) {
      errors.endDate = "End date must be after start date";
    }

    // Check that reservation period is at least 1 day
    if (startDate.isSame(endDate, 'day')) {
      // Single day reservations are allowed
    } else if (endDate.diff(startDate, 'day') < 1) {
      errors.endDate = "Reservation period must be at least 1 day";
    }

    // Validate exclude dates are within range
    formData.excludeDates.forEach((excludeDate, index) => {
      const exclude = dayjs(excludeDate);
      if (exclude.isBefore(startDate, 'day') || exclude.isAfter(endDate, 'day')) {
        errors[`excludeDates.${index}`] = "Exclude date must be within the reservation period";
      }
    });
  }

  // Time validation
  if (!formData.startTime) {
    errors.startTime = "Start time is required";
  }

  if (!formData.endTime) {
    errors.endTime = "End time is required";
  }

  if (formData.startTime && formData.endTime) {
    if (formData.endTime.isSameOrBefore(formData.startTime)) {
      errors.endTime = "End time must be after start time";
    }
  }

  // Options validation
  if (formData.hasOptions) {
    formData.optionCategories.forEach((category, categoryIndex) => {
      if (!category.categoryName.trim()) {
        errors[`optionCategories.${categoryIndex}.categoryName`] = "Category name is required";
      }

      if (category.choices.length === 0) {
        errors[`optionCategories.${categoryIndex}.choices`] = "At least one choice is required";
      }

      category.choices.forEach((choice, choiceIndex) => {
        if (!choice.name.trim()) {
          errors[`optionCategories.${categoryIndex}.choices.${choiceIndex}.name`] = "Choice name is required";
        }

        if (choice.price !== undefined && choice.price < 0) {
          errors[`optionCategories.${categoryIndex}.choices.${choiceIndex}.price`] = "Price cannot be negative";
        }
      });
    });
  }

  // Discount validation
  if (formData.isDiscountAvailable && formData.discount) {
    if (!formData.discount.name.trim()) {
      errors["discount.name"] = "Discount name is required";
    }

    if (!formData.discount.value || formData.discount.value <= 0) {
      errors["discount.value"] = "Discount value must be greater than 0";
    }

    if (formData.discount.type === "percentage" && formData.discount.value > 100) {
      errors["discount.value"] = "Percentage discount cannot exceed 100%";
    }

    if (!formData.discount.minDays || formData.discount.minDays < 2) {
      errors["discount.minDays"] = "Minimum days must be at least 2";
    }

    // Validate that minDays doesn't exceed the total reservation period
    if (formData.startDate && formData.endDate && formData.discount.minDays) {
      const totalDays = dayjs(formData.endDate).diff(dayjs(formData.startDate), 'day') + 1;
      const availableDays = totalDays - formData.excludeDates.length;

      if (formData.discount.minDays > availableDays) {
        errors["discount.minDays"] = `Minimum days cannot exceed available days (${availableDays})`;
      }
    }
  }

  return errors;
};