import { Dayjs } from "dayjs";

export interface ReservationOptionCategory {
  categoryName: string;
  categoryDescription?: string;
  choices: Array<{ name: string; price?: number }>;
}

export interface ReservationDiscount {
  type: "percentage" | "fixed";
  value: number;
  minDays: number;
  name: string;
  description?: string;
}

export interface ReservationFormState {
  eventName: string;
  eventType: "reservation";
  description: string;
  pricePerDayPerParticipant: number;
  maxParticipantsPerDay: number;
  startDate: string;
  endDate?: string;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  excludeDates: string[];
  hasOptions: boolean;
  optionCategories: ReservationOptionCategory[];
  isDiscountAvailable: boolean;
  discount?: ReservationDiscount;
  image?: File;
  imageUrl?: string;
}

export interface ReservationFormProps {
  mode: "add" | "edit";
  reservationId?: string;
  initialData?: ReservationFormState;
  onSuccess?: (reservationId?: string) => void;
  onCancel?: () => void;
}

export interface ReservationFormErrors {
  [key: string]: string;
}

export interface ReservationFormActions {
  handleInputChange: (field: keyof ReservationFormState, value: unknown) => void;
  handleNestedChange: (field: string, value: string | number) => void;
  handleTimeChange: (
    event: React.ChangeEvent<HTMLSelectElement>,
    field: "startTime" | "endTime"
  ) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
  addExcludeDate: (date: string) => void;
  removeExcludeDate: (index: number) => void;
}

export interface UseReservationFormReturn {
  formData: ReservationFormState;
  errors: ReservationFormErrors;
  actions: ReservationFormActions;
  isSubmitting: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  validateForm: () => boolean;
  getFieldError: (fieldPath: string) => string | null;
}