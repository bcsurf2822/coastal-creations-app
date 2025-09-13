import { Dayjs } from "dayjs";

export interface EventOptionCategory {
  categoryName: string;
  categoryDescription?: string;
  choices: Array<{ name: string; price?: number }>;
}

export interface EventDiscount {
  type: "percentage" | "fixed";
  value: number;
  minParticipants: number;
  name: string;
  description?: string;
}

export interface EventReservationSettings {
  dayPricing: Array<{
    numberOfDays: number;
    price: number;
    label?: string;
  }>;
  dailyCapacity?: number;
}

export interface EventFormState {
  eventName: string;
  eventType: "class" | "camp" | "workshop" | "artist" | "reservation";
  description: string;
  price?: number;
  numberOfParticipants?: number;
  startDate: string;
  endDate?: string;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  isRecurring: boolean;
  recurringPattern?: "daily" | "weekly" | "monthly" | "yearly";
  recurringEndDate: string;
  hasOptions: boolean;
  optionCategories: EventOptionCategory[];
  isDiscountAvailable: boolean;
  discount?: EventDiscount;
  image?: File;
  imageUrl?: string;
  reservationSettings?: EventReservationSettings;
}

export interface EventFormProps {
  mode: "add" | "edit";
  eventId?: string;
  initialData?: EventFormState;
  onSuccess?: (eventId?: string) => void;
  onCancel?: () => void;
}

export interface EventFormErrors {
  [key: string]: string;
}

export interface EventFormActions {
  handleInputChange: (field: keyof EventFormState, value: unknown) => void;
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
}

export interface UseEventFormReturn {
  formData: EventFormState;
  errors: EventFormErrors;
  actions: EventFormActions;
  isSubmitting: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  validateForm: () => boolean;
  getFieldError: (fieldPath: string) => string | null;
}