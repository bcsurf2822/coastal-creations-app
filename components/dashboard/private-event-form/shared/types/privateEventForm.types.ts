export interface PrivateEventOptionCategory {
  categoryName: string;
  categoryDescription?: string;
  choices: Array<{ name: string; price?: number }>;
}

export interface PrivateEventFormState {
  title: string;
  description: string;
  price: number;
  hasOptions: boolean;
  optionCategories: PrivateEventOptionCategory[];
  isDepositRequired: boolean;
  depositAmount?: number;
  image?: File | null;
  imageUrl?: string;
  instagramEmbedCode?: string;
}

export interface PrivateEventFormErrors {
  [key: string]: string;
}

export interface PrivateEventFormActions {
  handleInputChange: (field: keyof PrivateEventFormState, value: string | number | boolean | File | null | undefined) => void;
  handleImageChange: (file: File | null) => void;
  addOptionCategory: () => void;
  removeOptionCategory: (index: number) => void;
  addChoiceToCategory: (categoryIndex: number) => void;
  removeChoiceFromCategory: (categoryIndex: number, choiceIndex: number) => void;
  updateOptionCategory: (categoryIndex: number, field: string, value: string) => void;
  updateChoice: (
    categoryIndex: number,
    choiceIndex: number,
    field: string,
    value: string | number | undefined
  ) => void;
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
  onImageUploadStatusChange?: (isUploading: boolean) => void;
}

export interface PrivateEventApiResponse {
  success: boolean;
  privateEvent?: {
    _id: string;
    title: string;
    description: string;
    price: number;
    options?: PrivateEventOptionCategory[];
    isDepositRequired?: boolean;
    depositAmount?: number;
    image?: string;
    instagramEmbedCode?: string;
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
  isImageUploading: boolean;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  setIsImageUploading: (isUploading: boolean) => void;
}