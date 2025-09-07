// "use client";

// import { ReactElement, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
// import { UseFormRegister, FieldError, FieldErrorsImpl, Merge, FieldValues, Path } from 'react-hook-form';

// /**
//  * Generic form field component with React Hook Form and Zod integration.
//  * 
//  * Provides a reusable form field that handles input rendering, error display,
//  * and proper TypeScript typing for all form types including text, number,
//  * select, and textarea fields.
//  * 
//  * @template T - The form data type inferred from Zod schema
//  * @component
//  * @example
//  * ```tsx
//  * // With text input
//  * <FormField
//  *   name="eventName"
//  *   label="Event Name"
//  *   type="text"
//  *   register={register}
//  *   error={errors.eventName}
//  *   placeholder="Enter event name"
//  * />
//  * 
//  * // With number input
//  * <FormField
//  *   name="price"
//  *   label="Price"
//  *   type="number"
//  *   register={register}
//  *   error={errors.price}
//  *   registerOptions={{ valueAsNumber: true }}
//  * />
//  * 
//  * // With select dropdown
//  * <FormField
//  *   name="eventType"
//  *   label="Event Type"
//  *   type="select"
//  *   register={register}
//  *   error={errors.eventType}
//  *   options={[
//  *     { value: 'class', label: 'Class' },
//  *     { value: 'reservation', label: 'Reservation' }
//  *   ]}
//  * />
//  * ```
//  */

// export type FormFieldType = 'text' | 'email' | 'password' | 'number' | 'date' | 'time' | 'select' | 'textarea';

// export interface SelectOption {
//   value: string | number;
//   label: string;
//   disabled?: boolean;
// }

// export interface BaseFormFieldProps<T extends FieldValues> {
//   /** Form field name - must match schema property name */
//   name: Path<T>;
  
//   /** Display label for the field */
//   label: string;
  
//   /** Field input type */
//   type: FormFieldType;
  
//   /** React Hook Form register function */
//   register: UseFormRegister<T>;
  
//   /** Field error from React Hook Form */
//   error?: FieldError | Merge<FieldError, FieldErrorsImpl<T>>;
  
//   /** Additional HTML attributes passed to the input */
//   htmlAttributes?: Partial<InputHTMLAttributes<HTMLInputElement> & 
//                           SelectHTMLAttributes<HTMLSelectElement> & 
//                           TextareaHTMLAttributes<HTMLTextAreaElement>>;
  
//   /** Register options for React Hook Form */
//   registerOptions?: {
//     valueAsNumber?: boolean;
//     valueAsDate?: boolean;
//     setValueAs?: (value: unknown) => unknown;
//     disabled?: boolean;
//   };
  
//   /** Select options (required for select type) */
//   options?: SelectOption[];
  
//   /** Additional CSS classes */
//   className?: string;
  
//   /** Help text displayed below the field */
//   helpText?: string;
  
//   /** Required field indicator */
//   required?: boolean;
// }

// /**
//  * Base form field component with comprehensive input type support.
//  * 
//  * Handles all common input types with proper error display and styling
//  * that matches the existing application design patterns.
//  */
// export function FormField<T extends FieldValues>({
//   name,
//   label,
//   type,
//   register,
//   error,
//   htmlAttributes = {},
//   registerOptions = {},
//   options = [],
//   className = '',
//   helpText,
//   required = false,
// }: BaseFormFieldProps<T>): ReactElement {
  
//   // Extract common props
//   const { placeholder, disabled, ...restHtmlAttributes } = htmlAttributes;
  
//   // Base CSS classes following existing app patterns
//   const baseInputClasses = `
//     w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
//     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
//     placeholder-gray-400 text-gray-900
//     disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
//   `.replace(/\s+/g, ' ').trim();
  
//   const errorInputClasses = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : '';
//   const finalInputClasses = `${baseInputClasses} ${errorInputClasses} ${className}`;
  
//   /**
//    * Renders the appropriate input element based on type.
//    */
//   const renderInput = (): ReactElement => {
//     const commonProps = {
//       id: name,
//       className: finalInputClasses,
//       placeholder,
//       disabled: disabled || registerOptions.disabled,
//       'aria-invalid': error ? 'true' : 'false',
//       'aria-describedby': error ? `${name}-error` : helpText ? `${name}-help` : undefined,
//       ...restHtmlAttributes,
//     };

//     switch (type) {
//       case 'select':
//         return (
//           <select
//             {...register(name, registerOptions)}
//             {...commonProps}
//             className={`${commonProps.className} cursor-pointer`}
//           >
//             <option value="" disabled>
//               {placeholder || `Select ${label.toLowerCase()}`}
//             </option>
//             {options.map((option) => (
//               <option 
//                 key={option.value} 
//                 value={option.value}
//                 disabled={option.disabled}
//               >
//                 {option.label}
//               </option>
//             ))}
//           </select>
//         );
      
//       case 'textarea':
//         return (
//           <textarea
//             {...register(name, registerOptions)}
//             {...commonProps}
//             rows={4}
//             className={`${commonProps.className} resize-vertical`}
//           />
//         );
      
//       case 'number':
//         return (
//           <input
//             {...register(name, { ...registerOptions, valueAsNumber: true })}
//             {...commonProps}
//             type="number"
//             step="any"
//           />
//         );
      
//       case 'date':
//         return (
//           <input
//             {...register(name, registerOptions)}
//             {...commonProps}
//             type="date"
//           />
//         );
      
//       case 'time':
//         return (
//           <input
//             {...register(name, registerOptions)}
//             {...commonProps}
//             type="time"
//           />
//         );
      
//       default:
//         return (
//           <input
//             {...register(name, registerOptions)}
//             {...commonProps}
//             type={type}
//           />
//         );
//     }
//   };

//   /**
//    * Gets user-friendly error message from React Hook Form error object.
//    */
//   const getErrorMessage = (): string | undefined => {
//     if (!error) return undefined;
    
//     // Handle different error object structures
//     if (typeof error === 'string') return error;
//     if (error.message) return error.message;
//     if ('type' in error && error.type === 'required') {
//       return `${label} is required`;
//     }
    
//     return 'Invalid value';
//   };

//   const errorMessage = getErrorMessage();

//   return (
//     <div className="mb-4">
//       {/* Label */}
//       <label 
//         htmlFor={name} 
//         className="block text-sm font-medium text-gray-700 mb-1"
//       >
//         {label}
//         {required && <span className="text-red-500 ml-1">*</span>}
//       </label>
      
//       {/* Input Element */}
//       {renderInput()}
      
//       {/* Error Message */}
//       {errorMessage && (
//         <p 
//           id={`${name}-error`}
//           className="mt-1 text-sm text-red-600"
//           role="alert"
//         >
//           {errorMessage}
//         </p>
//       )}
      
//       {/* Help Text */}
//       {helpText && !errorMessage && (
//         <p 
//           id={`${name}-help`}
//           className="mt-1 text-sm text-gray-500"
//         >
//           {helpText}
//         </p>
//       )}
//     </div>
//   );
// }

// /**
//  * Specialized form field for pricing inputs with currency formatting.
//  * 
//  * @example
//  * ```tsx
//  * <PriceFormField
//  *   name="price"
//  *   label="Event Price"
//  *   register={register}
//  *   error={errors.price}
//  *   currency="USD"
//  * />
//  * ```
//  */
// export interface PriceFormFieldProps<T extends FieldValues> extends Omit<BaseFormFieldProps<T>, 'type'> {
//   currency?: string;
// }

// export function PriceFormField<T extends FieldValues>({
//   currency = 'USD',
//   htmlAttributes = {},
//   ...props
// }: PriceFormFieldProps<T>): ReactElement {
//   const currencySymbol = currency === 'USD' ? '$' : currency;
  
//   return (
//     <div className="relative">
//       <FormField
//         {...props}
//         type="number"
//         registerOptions={{ valueAsNumber: true }}
//         htmlAttributes={{
//           min: 0,
//           step: 0.01,
//           className: 'pl-8',
//           ...htmlAttributes,
//         }}
//       />
//       <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
//         <span className="text-gray-500 text-sm">{currencySymbol}</span>
//       </div>
//     </div>
//   );
// }

// /**
//  * Form field group for organizing related fields.
//  * 
//  * @example
//  * ```tsx
//  * <FormFieldGroup title="Event Details" description="Basic information about the event">
//  *   <FormField name="eventName" ... />
//  *   <FormField name="description" ... />
//  * </FormFieldGroup>
//  * ```
//  */
// export interface FormFieldGroupProps {
//   title: string;
//   description?: string;
//   children: React.ReactNode;
//   className?: string;
// }

// export function FormFieldGroup({ 
//   title, 
//   description, 
//   children, 
//   className = '' 
// }: FormFieldGroupProps): ReactElement {
//   return (
//     <fieldset className={`border border-gray-200 rounded-lg p-4 mb-6 ${className}`}>
//       <legend className="text-lg font-medium text-gray-900 px-2">
//         {title}
//       </legend>
//       {description && (
//         <p className="text-sm text-gray-600 mb-4">
//           {description}
//         </p>
//       )}
//       <div className="space-y-4">
//         {children}
//       </div>
//     </fieldset>
//   );
// }