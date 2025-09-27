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

  // Options validation
  if (formData.hasOptions && formData.optionCategories.length > 0) {
    formData.optionCategories.forEach((category, categoryIndex) => {
      if (!category.categoryName.trim()) {
        errors[`optionCategories.${categoryIndex}.categoryName`] = "Category name is required";
      }

      if (category.choices.length === 0) {
        errors[`optionCategories.${categoryIndex}.choices`] = "At least one choice is required";
      } else {
        category.choices.forEach((choice, choiceIndex) => {
          if (!choice.name.trim()) {
            errors[`optionCategories.${categoryIndex}.choices.${choiceIndex}.name`] = "Choice name is required";
          }
          if (choice.price !== undefined && choice.price < 0) {
            errors[`optionCategories.${categoryIndex}.choices.${choiceIndex}.price`] = "Price cannot be negative";
          }
        });
      }
    });
  }

  // Deposit validation - COMMENTED OUT
  // if (formData.isDepositRequired) {
  //   if (!formData.depositAmount || formData.depositAmount <= 0) {
  //     errors.depositAmount = "Deposit amount must be greater than 0 when deposit is required";
  //   } else if (formData.depositAmount >= formData.price) {
  //     errors.depositAmount = "Deposit amount must be less than the total price";
  //   }
  // }

  return errors;
};

export const getInitialPrivateEventFormState = (): PrivateEventFormState => ({
  title: "",
  description: "",
  price: 0,
  hasOptions: false,
  optionCategories: [],
  isDepositRequired: false,
  depositAmount: undefined,
  image: null,
  imageUrl: "",
});
