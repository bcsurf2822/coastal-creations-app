/**
 * Generic TypeScript interfaces and types for reusable form patterns.
 * 
 * Provides a comprehensive type system for React Hook Form + Zod integration
 * with strong typing, consistent patterns, and reusable abstractions.
 * 
 * @module FormTypes
 * @example
 * ```tsx
 * // Using generic form field props
 * const MyForm: React.FC<FormProps<UserFormData>> = ({ schema, onSubmit }) => {
 *   const methods = useFormMethods(schema);
 *   
 *   return (
 *     <FormProvider {...methods}>
 *       <FormField name="email" label="Email" type="email" />
 *       <FormField name="age" label="Age" type="number" />
 *     </FormProvider>
 *   );
 * };
 * ```
 */

import { ReactElement, ReactNode } from 'react';
import { 
  Control, 
  FieldError, 
  FieldErrors, 
  FieldValues, 
  Path, 
  PathValue, 
  UseFormRegister,
  UseFormReturn,
  ArrayPath,
  FieldArray
} from 'react-hook-form';
import { z } from 'zod';

/**
 * Base form configuration interface for all form implementations.
 * 
 * @template T - Form data type inferred from Zod schema
 */
export interface BaseFormConfig<T extends FieldValues> {
  /** Zod schema for form validation */
  schema: z.ZodSchema<T>;
  
  /** Default values for form fields */
  defaultValues?: Partial<T>;
  
  /** Form submission mode */
  mode?: 'onChange' | 'onBlur' | 'onSubmit' | 'onTouched' | 'all';
  
  /** Disable form validation */
  shouldUseNativeValidation?: boolean;
  
  /** Criteria to trigger validation */
  criteriaMode?: 'firstError' | 'all';
  
  /** Delay validation (in milliseconds) */
  delayError?: number;
}

/**
 * Generic form props interface for consistent form implementations.
 * 
 * @template T - Form data type inferred from Zod schema
 */
export interface FormProps<T extends FieldValues> extends BaseFormConfig<T> {
  /** Form submission handler */
  onSubmit: (data: T) => Promise<void> | void;
  
  /** Optional form submission error handler */
  onError?: (errors: FieldErrors<T>) => void;
  
  /** Loading state during submission */
  isLoading?: boolean;
  
  /** Disable entire form */
  disabled?: boolean;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Form children components */
  children: ReactNode;
}

/**
 * Generic field props interface for consistent field implementations.
 * 
 * @template T - Form data type
 * @template K - Field name type
 */
export interface BaseFieldProps<T extends FieldValues, K extends Path<T>> {
  /** Field name matching schema property */
  name: K;
  
  /** Display label */
  label: string;
  
  /** Help text or description */
  helpText?: string;
  
  /** Required field indicator */
  required?: boolean;
  
  /** Placeholder text */
  placeholder?: string;
  
  /** Disable field */
  disabled?: boolean;
  
  /** Additional CSS classes */
  className?: string;
  
  /** React Hook Form register function */
  register: UseFormRegister<T>;
  
  /** Field error from validation */
  error?: FieldError;
}

/**
 * Select option interface for dropdown fields.
 */
export interface SelectOption<T = string | number> {
  /** Option value */
  value: T;
  
  /** Display text */
  label: string;
  
  /** Disable this option */
  disabled?: boolean;
  
  /** Group this option belongs to */
  group?: string;
}

/**
 * Enhanced field props with type-specific configurations.
 * 
 * @template T - Form data type
 * @template K - Field name type
 */
export interface FormFieldProps<T extends FieldValues, K extends Path<T>> 
  extends BaseFieldProps<T, K> {
  /** Input field type */
  type: FormFieldType;
  
  /** Select options (for select fields) */
  options?: SelectOption[];
  
  /** React Hook Form register options */
  registerOptions?: FormRegisterOptions;
  
  /** Custom validation function */
  validate?: (value: PathValue<T, K>) => string | boolean;
}

/**
 * Field array props for dynamic form arrays.
 * 
 * @template T - Form data type
 * @template K - Array field name type
 */
export interface FormFieldArrayProps<T extends FieldValues, K extends ArrayPath<T>> {
  /** Array field name */
  name: K;
  
  /** Display label */
  label: string;
  
  /** Description text */
  description?: string;
  
  /** React Hook Form control */
  control: Control<T>;
  
  /** Array field errors */
  errors?: FieldError[];
  
  /** Default value for new array items */
  defaultValue: Partial<FieldArray<T, K>>;
  
  /** Minimum required items */
  minItems?: number;
  
  /** Maximum allowed items */
  maxItems?: number;
  
  /** Custom add button text */
  addButtonText?: string;
  
  /** Custom remove button text */
  removeButtonText?: string;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Disable add/remove functionality */
  disabled?: boolean;
  
  /** Render function for each array item */
  renderField: (
    field: FieldArray<T, K>,
    index: number,
    register: UseFormRegister<T>,
    fieldErrors?: any
  ) => ReactNode;
}

/**
 * Form validation state interface.
 * 
 * @template T - Form data type
 */
export interface FormValidationState<T extends FieldValues> {
  /** Form is currently validating */
  isValidating: boolean;
  
  /** Form has validation errors */
  isValid: boolean;
  
  /** All validation errors */
  errors: FieldErrors<T>;
  
  /** Specific field errors mapped by path */
  fieldErrors: Record<string, string>;
  
  /** First validation error message */
  firstError?: string;
}

/**
 * Form submission state interface.
 */
export interface FormSubmissionState {
  /** Form is currently submitting */
  isSubmitting: boolean;
  
  /** Form submission was successful */
  isSubmitted: boolean;
  
  /** Form submission failed */
  isSubmitSuccessful: boolean;
  
  /** Number of submit attempts */
  submitCount: number;
}

/**
 * Complete form state combining validation and submission.
 * 
 * @template T - Form data type
 */
export interface FormState<T extends FieldValues> 
  extends FormValidationState<T>, FormSubmissionState {
  /** Current form data */
  data: T;
  
  /** Form has been modified from defaults */
  isDirty: boolean;
  
  /** Specific fields that have been modified */
  dirtyFields: Partial<Record<Path<T>, boolean>>;
  
  /** Fields that have been interacted with */
  touchedFields: Partial<Record<Path<T>, boolean>>;
}

/**
 * Form methods interface for external control.
 * 
 * @template T - Form data type
 */
export interface FormMethods<T extends FieldValues> extends UseFormReturn<T> {
  /** Set field value programmatically */
  setFieldValue: <K extends Path<T>>(name: K, value: PathValue<T, K>) => void;
  
  /** Get field value */
  getFieldValue: <K extends Path<T>>(name: K) => PathValue<T, K>;
  
  /** Set field error */
  setFieldError: <K extends Path<T>>(name: K, error: string) => void;
  
  /** Clear field error */
  clearFieldError: <K extends Path<T>>(name: K) => void;
  
  /** Reset entire form */
  resetForm: (values?: Partial<T>) => void;
  
  /** Submit form programmatically */
  submitForm: () => Promise<void>;
  
  /** Current form state */
  formState: FormState<T>;
}

/**
 * Supported form field types.
 */
export type FormFieldType = 
  | 'text' 
  | 'email' 
  | 'password' 
  | 'number' 
  | 'tel'
  | 'url'
  | 'date' 
  | 'time' 
  | 'datetime-local'
  | 'select' 
  | 'textarea'
  | 'checkbox'
  | 'radio'
  | 'file';

/**
 * React Hook Form register options with enhanced typing.
 */
export interface FormRegisterOptions {
  /** Treat value as number */
  valueAsNumber?: boolean;
  
  /** Treat value as Date */
  valueAsDate?: boolean;
  
  /** Transform value before setting */
  setValueAs?: (value: any) => any;
  
  /** Field is disabled */
  disabled?: boolean;
  
  /** Required validation */
  required?: string | boolean;
  
  /** Minimum length validation */
  minLength?: {
    value: number;
    message: string;
  };
  
  /** Maximum length validation */
  maxLength?: {
    value: number;
    message: string;
  };
  
  /** Minimum value validation (numbers/dates) */
  min?: {
    value: number | string;
    message: string;
  };
  
  /** Maximum value validation (numbers/dates) */
  max?: {
    value: number | string;
    message: string;
  };
  
  /** Pattern validation (regex) */
  pattern?: {
    value: RegExp;
    message: string;
  };
}

/**
 * Form field group configuration for organizing related fields.
 */
export interface FormFieldGroup {
  /** Group identifier */
  id: string;
  
  /** Group display title */
  title: string;
  
  /** Group description */
  description?: string;
  
  /** Fields in this group */
  fields: string[];
  
  /** Group is collapsible */
  collapsible?: boolean;
  
  /** Group is initially collapsed */
  defaultCollapsed?: boolean;
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * Form layout configuration for automatic form generation.
 * 
 * @template T - Form data type
 */
export interface FormLayout<T extends FieldValues> {
  /** Form title */
  title?: string;
  
  /** Form description */
  description?: string;
  
  /** Field groups organization */
  groups?: FormFieldGroup[];
  
  /** Fields order (if not grouped) */
  fieldOrder?: Array<Path<T>>;
  
  /** Form columns layout */
  columns?: 1 | 2 | 3 | 4;
  
  /** Responsive breakpoints */
  responsive?: {
    sm?: 1 | 2 | 3 | 4;
    md?: 1 | 2 | 3 | 4;
    lg?: 1 | 2 | 3 | 4;
    xl?: 1 | 2 | 3 | 4;
  };
}

/**
 * Form configuration for automatic form generation.
 * 
 * @template T - Form data type
 */
export interface AutoFormConfig<T extends FieldValues> 
  extends BaseFormConfig<T> {
  /** Form layout configuration */
  layout?: FormLayout<T>;
  
  /** Field-specific overrides */
  fieldConfig?: Partial<Record<Path<T>, Partial<FormFieldProps<T, Path<T>>>>>;
  
  /** Submit button configuration */
  submitButton?: {
    text?: string;
    variant?: 'primary' | 'secondary';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    loading?: boolean;
  };
  
  /** Cancel button configuration */
  cancelButton?: {
    text?: string;
    variant?: 'secondary' | 'ghost';
    size?: 'small' | 'medium' | 'large';
    onClick?: () => void;
  };
}

/**
 * Validation result interface for form validation helpers.
 * 
 * @template T - Data type being validated
 */
export interface ValidationResult<T> {
  /** Validation succeeded */
  success: boolean;
  
  /** Validated data (if successful) */
  data?: T;
  
  /** Validation errors (if failed) */
  errors?: Record<string, string>;
  
  /** First error message */
  firstError?: string;
}

/**
 * Form event handlers interface for consistent event handling.
 * 
 * @template T - Form data type
 */
export interface FormEventHandlers<T extends FieldValues> {
  /** Before form submission */
  onBeforeSubmit?: (data: T) => Promise<boolean> | boolean;
  
  /** After successful submission */
  onAfterSubmit?: (data: T, result: any) => Promise<void> | void;
  
  /** On submission error */
  onSubmitError?: (error: Error, data: T) => Promise<void> | void;
  
  /** On field value change */
  onFieldChange?: <K extends Path<T>>(
    name: K, 
    value: PathValue<T, K>, 
    previousValue: PathValue<T, K>
  ) => void;
  
  /** On field blur */
  onFieldBlur?: <K extends Path<T>>(name: K, value: PathValue<T, K>) => void;
  
  /** On field focus */
  onFieldFocus?: <K extends Path<T>>(name: K) => void;
  
  /** On form reset */
  onReset?: (data?: Partial<T>) => void;
  
  /** On validation error */
  onValidationError?: (errors: FieldErrors<T>) => void;
}

/**
 * Field array event handlers for dynamic array management.
 * 
 * @template T - Form data type
 * @template K - Array field name type
 */
export interface FieldArrayEventHandlers<T extends FieldValues, K extends ArrayPath<T>> {
  /** Before adding new item */
  onBeforeAdd?: () => Promise<boolean> | boolean;
  
  /** After adding new item */
  onAfterAdd?: (index: number, item: FieldArray<T, K>) => void;
  
  /** Before removing item */
  onBeforeRemove?: (index: number, item: FieldArray<T, K>) => Promise<boolean> | boolean;
  
  /** After removing item */
  onAfterRemove?: (index: number, item: FieldArray<T, K>) => void;
  
  /** On array reorder */
  onReorder?: (fromIndex: number, toIndex: number) => void;
  
  /** On item change */
  onItemChange?: (index: number, item: FieldArray<T, K>) => void;
}

/**
 * Type guard to check if a value is a valid form field type.
 * 
 * @param value - Value to check
 * @returns True if value is a FormFieldType
 */
export const isFormFieldType = (value: any): value is FormFieldType => {
  const validTypes: FormFieldType[] = [
    'text', 'email', 'password', 'number', 'tel', 'url',
    'date', 'time', 'datetime-local', 'select', 'textarea',
    'checkbox', 'radio', 'file'
  ];
  return validTypes.includes(value);
};

/**
 * Type helper to extract form field names from a schema.
 * 
 * @template T - Form data type
 */
export type FormFieldNames<T extends FieldValues> = Array<Path<T>>;

/**
 * Type helper to extract array field names from a schema.
 * 
 * @template T - Form data type
 */
export type FormArrayFieldNames<T extends FieldValues> = Array<ArrayPath<T>>;

/**
 * Utility type to make form configuration more readable.
 * 
 * @template T - Form data type
 */
export type TypedFormProps<T extends Record<string, any>> = FormProps<T> & {
  /** Inferred field names for type safety */
  fieldNames?: FormFieldNames<T>;
  
  /** Inferred array field names for type safety */
  arrayFieldNames?: FormArrayFieldNames<T>;
};

/**
 * Re-export commonly used React Hook Form types for convenience.
 */
export type {
  Control,
  FieldError,
  FieldErrors,
  FieldValues,
  Path,
  PathValue,
  UseFormRegister,
  UseFormReturn,
  ArrayPath,
  FieldArray
} from 'react-hook-form';

/**
 * Re-export Zod types for schema definition.
 */
export type {
  ZodSchema,
  ZodError,
  ZodIssue
} from 'zod';