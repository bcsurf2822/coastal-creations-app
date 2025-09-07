// "use client";

// import { ReactElement, ReactNode } from 'react';
// import {
//   useFieldArray,
//   Control,
//   FieldValues,
//   FieldError,
//   FieldErrorsImpl,
//   Merge,
//   ArrayPath,
//   FieldArray,
//   UseFormRegister
// } from 'react-hook-form';

// /**
//  * Dynamic field array component for React Hook Form with Zod validation.
//  *
//  * Provides functionality for managing arrays of form fields with add/remove
//  * capabilities, proper error handling, and TypeScript type safety.
//  * Commonly used for pricing tiers, participant lists, and option categories.
//  *
//  * @template T - The form data type inferred from Zod schema
//  * @template K - The array field name type
//  * @component
//  * @example
//  * ```tsx
//  * // Pricing tiers for reservation events
//  * <FormFieldArray
//  *   name="dayPricing"
//  *   label="Pricing Tiers"
//  *   control={control}
//  *   errors={errors.dayPricing}
//  *   defaultValue={{ numberOfDays: 1, price: 0, label: '' }}
//  *   minItems={1}
//  *   maxItems={10}
//  *   renderField={(field, index, register, fieldErrors) => (
//  *     <div key={field.id} className="grid grid-cols-3 gap-4">
//  *       <FormField
//  *         name={`dayPricing.${index}.numberOfDays`}
//  *         label="Days"
//  *         type="number"
//  *         register={register}
//  *         error={fieldErrors?.numberOfDays}
//  *       />
//  *       <FormField
//  *         name={`dayPricing.${index}.price`}
//  *         label="Price"
//  *         type="number"
//  *         register={register}
//  *         error={fieldErrors?.price}
//  *       />
//  *       <FormField
//  *         name={`dayPricing.${index}.label`}
//  *         label="Label (Optional)"
//  *         type="text"
//  *         register={register}
//  *         error={fieldErrors?.label}
//  *       />
//  *     </div>
//  *   )}
//  * />
//  * ```
//  */

// export interface FormFieldArrayProps<
//   T extends FieldValues,
//   K extends ArrayPath<T>
// > {
//   /** Array field name - must match schema array property */
//   name: K;

//   /** Display label for the field array */
//   label: string;

//   /** React Hook Form control object */
//   control: Control<T>;

//   /** Field array errors from React Hook Form */
//   errors?: FieldError[] | Merge<FieldError, FieldErrorsImpl<FieldValues>>[];

//   /** Function to render each field in the array */
//   renderField: (
//     field: FieldArray<T, K>,
//     index: number,
//     register: UseFormRegister<T>,
//     fieldErrors?: Record<string, FieldError>
//   ) => ReactNode;

//   /** Default value for new array items */
//   defaultValue: Record<string, unknown>;

//   /** Minimum number of items (default: 0) */
//   minItems?: number;

//   /** Maximum number of items (default: 20) */
//   maxItems?: number;

//   /** Description text displayed below the label */
//   description?: string;

//   /** Custom add button text */
//   addButtonText?: string;

//   /** Custom remove button text */
//   removeButtonText?: string;

//   /** Additional CSS classes */
//   className?: string;

//   /** Disable add/remove functionality */
//   disabled?: boolean;
// }

// /**
//  * Dynamic field array component with add/remove functionality.
//  */
// export function FormFieldArray<
//   T extends FieldValues,
//   K extends ArrayPath<T>
// >({
//   name,
//   label,
//   control,
//   errors = [],
//   renderField,
//   defaultValue,
//   minItems = 0,
//   maxItems = 20,
//   description,
//   addButtonText = 'Add Item',
//   removeButtonText = 'Remove',
//   className = '',
//   disabled = false,
// }: FormFieldArrayProps<T, K>): ReactElement {

//   const { fields, append, remove } = useFieldArray({
//     control,
//     name,
//   });

//   /**
//    * Adds a new item to the field array.
//    */
//   const handleAdd = (): void => {
//     if (fields.length < maxItems) {
//       append(defaultValue as FieldArray<T, K>);
//     }
//   };

//   /**
//    * Removes an item from the field array.
//    */
//   const handleRemove = (index: number): void => {
//     if (fields.length > minItems) {
//       remove(index);
//     }
//   };

//   /**
//    * Gets error for a specific field index.
//    */
//   const getFieldError = (index: number): Record<string, FieldError> | undefined => {
//     if (Array.isArray(errors) && errors[index]) {
//       return errors[index] as Record<string, FieldError>;
//     }
//     return undefined;
//   };

//   return (
//     <div className={`mb-6 ${className}`}>
//       {/* Header */}
//       <div className="flex justify-between items-start mb-4">
//         <div>
//           <label className="block text-lg font-medium text-gray-900 mb-1">
//             {label}
//           </label>
//           {description && (
//             <p className="text-sm text-gray-600">
//               {description}
//             </p>
//           )}
//         </div>

//         {/* Add Button */}
//         <button
//           type="button"
//           onClick={handleAdd}
//           disabled={disabled || fields.length >= maxItems}
//           className={`
//             px-4 py-2 text-sm font-medium rounded-md border
//             ${disabled || fields.length >= maxItems
//               ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
//               : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
//             }
//           `}
//           aria-label={`Add new ${label.toLowerCase()} item`}
//         >
//           <span className="mr-2">+</span>
//           {addButtonText}
//         </button>
//       </div>

//       {/* Field Array Items */}
//       <div className="space-y-4">
//         {fields.map((field, index) => (
//           <div
//             key={field.id}
//             className="border border-gray-200 rounded-lg p-4 bg-gray-50"
//           >
//             {/* Item Header */}
//             <div className="flex justify-between items-center mb-3">
//               <h4 className="text-sm font-medium text-gray-700">
//                 {label} {index + 1}
//               </h4>

//               {/* Remove Button */}
//               <button
//                 type="button"
//                 onClick={() => handleRemove(index)}
//                 disabled={disabled || fields.length <= minItems}
//                 className={`
//                   px-3 py-1 text-xs font-medium rounded border
//                   ${disabled || fields.length <= minItems
//                     ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
//                     : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500'
//                   }
//                 `}
//                 aria-label={`Remove ${label.toLowerCase()} item ${index + 1}`}
//               >
//                 {removeButtonText}
//               </button>
//             </div>

//             {/* Field Content */}
//             <div className="bg-white rounded p-3">
//               {renderField(field, index, control.register, getFieldError(index))}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Empty State */}
//       {fields.length === 0 && (
//         <div className="text-center py-8 bg-gray-50 border border-gray-200 rounded-lg">
//           <p className="text-gray-500 text-sm mb-3">
//             No {label.toLowerCase()} items added yet
//           </p>
//           <button
//             type="button"
//             onClick={handleAdd}
//             disabled={disabled}
//             className={`
//               px-4 py-2 text-sm font-medium rounded-md
//               ${disabled
//                 ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                 : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
//               }
//             `}
//           >
//             Add First {label.slice(0, -1)} {/* Remove 's' from plural */}
//           </button>
//         </div>
//       )}

//       {/* Constraints Info */}
//       <div className="mt-2 flex justify-between text-xs text-gray-500">
//         <span>
//           {minItems > 0 && `Minimum: ${minItems} item${minItems > 1 ? 's' : ''}`}
//         </span>
//         <span>
//           {fields.length}/{maxItems} items
//         </span>
//       </div>
//     </div>
//   );
// }

// /**
//  * Specialized field array for pricing tiers with preset field structure.
//  *
//  * @example
//  * ```tsx
//  * <PricingTierArray
//  *   control={control}
//  *   errors={errors.dayPricing}
//  * />
//  * ```
//  */
// export interface PricingTierArrayProps<T extends FieldValues> {
//   control: Control<T>;
//   errors?: FieldError[] | Merge<FieldError, FieldErrorsImpl<FieldValues>>[];
//   disabled?: boolean;
// }

// export function PricingTierArray<T extends FieldValues>({
//   control,
//   errors,
//   disabled = false
// }: PricingTierArrayProps<T>): ReactElement {
//   return (
//     <FormFieldArray
//       name={'dayPricing' as ArrayPath<T>}
//       label="Pricing Tiers"
//       control={control}
//       errors={errors}
//       defaultValue={{ numberOfDays: 1, price: 0, label: '' }}
//       minItems={1}
//       maxItems={10}
//       description="Set pricing for different day counts. Customers will get the best available rate."
//       addButtonText="Add Pricing Tier"
//       disabled={disabled}
//       renderField={(field, index, register, fieldErrors) => (
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Number of Days *
//             </label>
//             <input
//               {...register(`dayPricing.${index}.numberOfDays` as keyof T, { valueAsNumber: true })}
//               type="number"
//               min={1}
//               max={30}
//               className={`
//                 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
//                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
//                 ${fieldErrors?.numberOfDays ? 'border-red-500' : ''}
//               `}
//               placeholder="1"
//             />
//             {fieldErrors?.numberOfDays && (
//               <p className="mt-1 text-sm text-red-600">
//                 {fieldErrors.numberOfDays.message}
//               </p>
//             )}
//           </div>

//           <div className="relative">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Price *
//             </label>
//             <div className="relative">
//               <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
//                 $
//               </span>
//               <input
//                 {...register(`dayPricing.${index}.price` as keyof T, { valueAsNumber: true })}
//                 type="number"
//                 min={0}
//                 step={0.01}
//                 className={`
//                   w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm
//                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
//                   ${fieldErrors?.price ? 'border-red-500' : ''}
//                 `}
//                 placeholder="0.00"
//               />
//             </div>
//             {fieldErrors?.price && (
//               <p className="mt-1 text-sm text-red-600">
//                 {fieldErrors.price.message}
//               </p>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Label (Optional)
//             </label>
//             <input
//               {...register(`dayPricing.${index}.label` as keyof T)}
//               type="text"
//               maxLength={50}
//               className={`
//                 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
//                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
//                 ${fieldErrors?.label ? 'border-red-500' : ''}
//               `}
//               placeholder="e.g., Full Week Special"
//             />
//             {fieldErrors?.label && (
//               <p className="mt-1 text-sm text-red-600">
//                 {fieldErrors.label.message}
//               </p>
//             )}
//           </div>
//         </div>
//       )}
//     />
//   );
// }

// /**
//  * Field array for participant management.
//  *
//  * @example
//  * ```tsx
//  * <ParticipantArray
//  *   control={control}
//  *   errors={errors.participants}
//  * />
//  * ```
//  */
// export function ParticipantArray<T extends FieldValues>({
//   control,
//   errors,
//   disabled = false
// }: PricingTierArrayProps<T>): ReactElement {
//   return (
//     <FormFieldArray
//       name={'participants' as ArrayPath<T>}
//       label="Participants"
//       control={control}
//       errors={errors}
//       defaultValue={{ firstName: '', lastName: '' }}
//       minItems={1}
//       maxItems={10}
//       description="Add participant information for this booking."
//       addButtonText="Add Participant"
//       disabled={disabled}
//       renderField={(field, index, register, fieldErrors) => (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               First Name *
//             </label>
//             <input
//               {...register(`participants.${index}.firstName` as keyof T)}
//               type="text"
//               className={`
//                 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
//                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
//                 ${fieldErrors?.firstName ? 'border-red-500' : ''}
//               `}
//               placeholder="First name"
//             />
//             {fieldErrors?.firstName && (
//               <p className="mt-1 text-sm text-red-600">
//                 {fieldErrors.firstName.message}
//               </p>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Last Name *
//             </label>
//             <input
//               {...register(`participants.${index}.lastName`)}
//               type="text"
//               className={`
//                 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
//                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
//                 ${fieldErrors?.lastName ? 'border-red-500' : ''}
//               `}
//               placeholder="Last name"
//             />
//             {fieldErrors?.lastName && (
//               <p className="mt-1 text-sm text-red-600">
//                 {fieldErrors.lastName.message}
//               </p>
//             )}
//           </div>
//         </div>
//       )}
//     />
//   );
// }
