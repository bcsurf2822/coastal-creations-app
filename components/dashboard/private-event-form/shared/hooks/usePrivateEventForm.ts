
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
  const [isImageUploading, setIsImageUploading] = useState(false);

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleInputChange = useCallback((field: keyof PrivateEventFormState, value: string | number | boolean | File | null | undefined) => {
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
        price: formData.price,
        options: formData.hasOptions ? formData.optionCategories : undefined,
        isDepositRequired: formData.isDepositRequired,
        depositAmount: formData.isDepositRequired ? formData.depositAmount : undefined,
        image: formData.imageUrl, // Store the Sanity image URL in MongoDB
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
    addOptionCategory,
    removeOptionCategory,
    addChoiceToCategory,
    removeChoiceFromCategory,
    updateOptionCategory,
    updateChoice,
    resetForm,
  };

  return {
    formData,
    errors,
    actions,
    isSubmitting,
    isImageUploading,
    handleSubmit,
    setIsImageUploading,
  };
};