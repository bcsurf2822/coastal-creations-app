export interface PrivateEventFormState {
  title: string;
  description: string;
  notes?: string;
  price: number;
  minimum: number;
  unit: string;
  image?: File | null;
}

export interface PrivateEventFormErrors {
  [key: string]: string;
}

export interface PrivateEventFormActions {
  handleInputChange: (field: keyof PrivateEventFormState, value: string | number | File | null | undefined) => void;
  handleImageChange: (file: File | null) => void;
  resetForm: () => void;
}

export interface PrivateEventFormProps {
  mode: "add" | "edit";
  privateEventId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export interface PrivateEventFieldsProps {
  formData: PrivateEventFormState;
  actions: PrivateEventFormActions;
  errors: PrivateEventFormErrors;
}

export interface PrivateEventApiResponse {
  success: boolean;
  privateEvent?: {
    _id: string;
    title: string;
    description: string;
    notes?: string;
    price: number;
    minimum: number;
    unit: string;
    image?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  error?: string;
}

export interface UsePrivateEventFormProps {
  mode: "add" | "edit";
  privateEventId?: string;
  initialData?: PrivateEventFormState;
  onSuccess?: () => void;
}

export interface UsePrivateEventFormReturn {
  formData: PrivateEventFormState;
  errors: PrivateEventFormErrors;
  actions: PrivateEventFormActions;
  isSubmitting: boolean;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}