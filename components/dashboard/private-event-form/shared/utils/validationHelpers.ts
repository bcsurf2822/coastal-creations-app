import {
  PrivateEventFormState,
  PrivateEventFormErrors,
} from "../types/privateEventForm.types";

export const validatePrivateEventForm = (
  formData: PrivateEventFormState
): PrivateEventFormErrors => {
  const errors: PrivateEventFormErrors = {};

  // Basic fields validation
  if (!formData.title.trim()) {
    errors.title = "Title is required";
  } else if (formData.title.length > 100) {
    errors.title = "Title must be 100 characters or less";
  }

  if (!formData.description.trim()) {
    errors.description = "Description is required";
  } else if (formData.description.length > 500) {
    errors.description = "Description must be 500 characters or less";
  }

  // Pricing validation
  if (!formData.price || formData.price <= 0) {
    errors.price = "Price must be greater than 0";
  }

  if (!formData.minimum || formData.minimum < 1) {
    errors.minimum = "Minimum participants must be at least 1";
  }

  if (!formData.unit.trim()) {
    errors.unit = "Unit is required (e.g., 'participants', 'hours', 'people')";
  }

  return errors;
};

export const getInitialPrivateEventFormState = (): PrivateEventFormState => ({
  title: "",
  description: "",
  notes: "",
  price: 0,
  minimum: 1,
  unit: "participants",
  image: null,
});
