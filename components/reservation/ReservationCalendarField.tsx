// /**
//  * @fileoverview React Hook Form integrated calendar field for reservations
//  * @module components/reservation/ReservationCalendarField
//  */

// 'use client';

// import { ReactElement, useEffect, useCallback } from 'react';
// import { useController, useFormContext, FieldPath, FieldValues } from 'react-hook-form';
// import { DaySelectionCalendar } from './DaySelectionCalendar';
// import type { PricingTier } from '../../lib/validations/reservationValidation';

// /**
//  * Props for ReservationCalendarField component.
//  */
// interface ReservationCalendarFieldProps<T extends FieldValues> {
//   /** Name of the field in the form */
//   name: FieldPath<T>;
//   /** Start date of the reservation period */
//   eventStartDate: Date;
//   /** End date of the reservation period */
//   eventEndDate: Date;
//   /** Maximum number of days that can be selected */
//   maxDays?: number;
//   /** Whether selected days must be consecutive */
//   requireConsecutive?: boolean;
//   /** Minimum number of days that must be selected */
//   minDays?: number;
//   /** Available pricing tiers */
//   pricingTiers?: PricingTier[];
//   /** Array of disabled dates that cannot be selected */
//   disabledDates?: Date[];
//   /** Whether to allow selection of past dates */
//   allowPastDates?: boolean;
//   /** Label for the field */
//   label?: string;
//   /** Help text for the field */
//   helpText?: string;
//   /** Whether the field is required */
//   required?: boolean;
//   /** Custom CSS classes */
//   className?: string;
//   /** Whether to show pricing information */
//   showPricing?: boolean;
//   /** Event ID for pricing integration */
//   eventId?: string;
// }

// /**
//  * Calendar field component integrated with React Hook Form.
//  *
//  * Provides seamless integration between the DaySelectionCalendar component
//  * and React Hook Form, handling form state management, validation, and
//  * error display automatically.
//  *
//  * @component
//  * @example
//  * ```tsx
//  * // In a React Hook Form component
//  * <ReservationCalendarField
//  *   name="selectedDates"
//  *   eventStartDate={event.startDate}
//  *   eventEndDate={event.endDate}
//  *   maxDays={7}
//  *   pricingTiers={event.reservationSettings?.dayPricing}
//  *   label="Select your camp days"
//  *   required
//  * />
//  * ```
//  */
// export function ReservationCalendarField<T extends FieldValues>({
//   name,
//   eventStartDate,
//   eventEndDate,
//   maxDays = 7,
//   requireConsecutive = false,
//   minDays = 1,
//   pricingTiers = [],
//   disabledDates = [],
//   allowPastDates = false,
//   label,
//   helpText,
//   required = false,
//   className = '',
//   showPricing = true,
//   eventId,
// }: ReservationCalendarFieldProps<T>): ReactElement {

//   // Get form context
//   const { setValue, trigger } = useFormContext<T>();

//   // Use controller for field management
//   const {
//     field: { value, onChange },
//     fieldState: { error, invalid },
//   } = useController({
//     name,
//     rules: {
//       required: required ? 'Please select at least one day' : false,
//       validate: (dates: Date[]) => {
//         if (!Array.isArray(dates)) {
//           return 'Invalid date selection';
//         }

//         if (required && dates.length === 0) {
//           return 'Please select at least one day';
//         }

//         if (dates.length < minDays) {
//           return `Please select at least ${minDays} day${minDays > 1 ? 's' : ''}`;
//         }

//         if (dates.length > maxDays) {
//           return `Cannot select more than ${maxDays} days`;
//         }

//         if (requireConsecutive && dates.length > 1) {
//           // Sort dates and check if they're consecutive
//           const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());
//           for (let i = 1; i < sortedDates.length; i++) {
//             const diffDays = Math.abs(sortedDates[i].getTime() - sortedDates[i - 1].getTime()) / (1000 * 60 * 60 * 24);
//             if (diffDays !== 1) {
//               return 'Selected days must be consecutive';
//             }
//           }
//         }

//         return true;
//       },
//     },
//   });

//   // Handle date selection changes
//   const handleDatesChange = useCallback((dates: Date[]) => {
//     onChange(dates);
//     // Trigger validation after change
//     setTimeout(() => trigger(name), 0);
//   }, [onChange, trigger, name]);

//   // Ensure value is always an array
//   const selectedDates = Array.isArray(value) ? value : [];

//   // Generate field ID for accessibility
//   const fieldId = `calendar-field-${name}`;
//   const helpTextId = helpText ? `${fieldId}-help` : undefined;
//   const errorId = error ? `${fieldId}-error` : undefined;

//   return (
//     <div className={`space-y-2 ${className}`}>

//       {/* Field label */}
//       {label && (
//         <label
//           htmlFor={fieldId}
//           className="block text-sm font-medium text-gray-700"
//         >
//           {label}
//           {required && <span className="text-red-500 ml-1">*</span>}
//         </label>
//       )}

//       {/* Help text */}
//       {helpText && (
//         <p
//           id={helpTextId}
//           className="text-sm text-gray-600"
//         >
//           {helpText}
//         </p>
//       )}

//       {/* Calendar component */}
//       <div
//         id={fieldId}
//         aria-describedby={[helpTextId, errorId].filter(Boolean).join(' ')}
//         aria-invalid={invalid}
//         role="group"
//         aria-labelledby={label ? `${fieldId}-label` : undefined}
//       >
//         <DaySelectionCalendar
//           eventStartDate={eventStartDate}
//           eventEndDate={eventEndDate}
//           maxDays={maxDays}
//           requireConsecutive={requireConsecutive}
//           minDays={minDays}
//           selectedDates={selectedDates}
//           onDatesChange={handleDatesChange}
//           pricingTiers={pricingTiers}
//           disabledDates={disabledDates}
//           allowPastDates={allowPastDates}
//           eventId={eventId}
//           error={error?.message}
//           config={{
//             showPricing,
//             highlightPricingTiers: true,
//             showNavigation: true,
//             showHeader: true,
//             showSummary: true,
//             showClearButton: true,
//             className: invalid ? 'border-red-300 shadow-sm shadow-red-100' : '',
//           }}
//         />
//       </div>

//       {/* Error message */}
//       {error && (
//         <p
//           id={errorId}
//           className="text-sm text-red-600"
//           role="alert"
//         >
//           {error.message}
//         </p>
//       )}
//     </div>
//   );
// }

// /**
//  * Hook for managing calendar field state within a React Hook Form.
//  *
//  * Provides utilities for working with calendar field data, including
//  * date manipulation, validation helpers, and pricing calculations.
//  *
//  * @param name - Field name in the form
//  * @param pricingTiers - Available pricing tiers
//  * @returns Calendar field utilities and state
//  *
//  * @example
//  * ```typescript
//  * const {
//  *   selectedDates,
//  *   selectedCount,
//  *   totalPrice,
//  *   clearDates,
//  *   isValidSelection,
//  * } = useCalendarField('selectedDates', pricingTiers);
//  * ```
//  */
// export function useCalendarField<T extends FieldValues>(
//   name: FieldPath<T>,
//   pricingTiers: PricingTier[] = []
// ) {
//   const { watch, setValue, trigger } = useFormContext<T>();

//   // Watch the field value
//   const selectedDates: Date[] = watch(name) || [];
//   const selectedCount = selectedDates.length;

//   // Clear all selected dates
//   const clearDates = useCallback(() => {
//     setValue(name, [] as any);
//     trigger(name);
//   }, [setValue, trigger, name]);

//   // Add a date to selection
//   const addDate = useCallback((date: Date) => {
//     const currentDates = watch(name) || [];
//     const updatedDates = [...currentDates, date];
//     setValue(name, updatedDates as any);
//     trigger(name);
//   }, [watch, setValue, trigger, name]);

//   // Remove a date from selection
//   const removeDate = useCallback((dateToRemove: Date) => {
//     const currentDates: Date[] = watch(name) || [];
//     const updatedDates = currentDates.filter(date =>
//       date.getTime() !== dateToRemove.getTime()
//     );
//     setValue(name, updatedDates as any);
//     trigger(name);
//   }, [watch, setValue, trigger, name]);

//   // Calculate total price based on selection
//   const totalPrice = useMemo(() => {
//     if (selectedCount === 0 || pricingTiers.length === 0) {
//       return null;
//     }

//     // Find applicable pricing tier
//     const exactMatch = pricingTiers.find(tier => tier.numberOfDays === selectedCount);
//     if (exactMatch) {
//       return {
//         price: exactMatch.price,
//         tier: exactMatch,
//         formattedPrice: `$${exactMatch.price.toFixed(2)}`,
//       };
//     }

//     // Find next higher tier
//     const higherTiers = pricingTiers
//       .filter(tier => tier.numberOfDays > selectedCount)
//       .sort((a, b) => a.numberOfDays - b.numberOfDays);

//     if (higherTiers.length > 0) {
//       const tier = higherTiers[0];
//       return {
//         price: tier.price,
//         tier,
//         formattedPrice: `$${tier.price.toFixed(2)}`,
//       };
//     }

//     // Use highest available tier
//     const highestTier = pricingTiers
//       .sort((a, b) => b.numberOfDays - a.numberOfDays)[0];

//     if (highestTier) {
//       return {
//         price: highestTier.price,
//         tier: highestTier,
//         formattedPrice: `$${highestTier.price.toFixed(2)}`,
//       };
//     }

//     return null;
//   }, [selectedCount, pricingTiers]);

//   // Check if selection is valid (basic validation)
//   const isValidSelection = selectedCount > 0;

//   return {
//     selectedDates,
//     selectedCount,
//     totalPrice,
//     clearDates,
//     addDate,
//     removeDate,
//     isValidSelection,
//   };
// }
