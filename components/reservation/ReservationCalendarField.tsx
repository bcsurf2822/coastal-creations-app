/**
 * @fileoverview Calendar field component for reservations
 * @module components/reservation/ReservationCalendarField
 */

'use client';

import { ReactElement, useCallback } from 'react';
import { DaySelectionCalendar } from './DaySelectionCalendar';
import type { PricingTier } from '../../lib/pricing/types';

/**
 * Props for ReservationCalendarField component.
 */
interface ReservationCalendarFieldProps {
  /** Start date of the reservation period */
  eventStartDate: Date;
  /** End date of the reservation period */
  eventEndDate: Date;
  /** Currently selected dates */
  selectedDates: Date[];
  /** Callback when dates change */
  onDatesChange: (dates: Date[]) => void;
  /** Maximum number of days that can be selected */
  maxDays?: number;
  /** Whether selected days must be consecutive */
  requireConsecutive?: boolean;
  /** Minimum number of days that must be selected */
  minDays?: number;
  /** Available pricing tiers */
  pricingTiers?: PricingTier[];
  /** Array of disabled dates that cannot be selected */
  disabledDates?: Date[];
  /** Whether to allow selection of past dates */
  allowPastDates?: boolean;
  /** Label for the field */
  label?: string;
  /** Help text for the field */
  helpText?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Custom CSS classes */
  className?: string;
  /** Whether to show pricing information */
  showPricing?: boolean;
  /** Event ID for pricing integration */
  eventId?: string;
  /** Error message to display */
  error?: string;
}

/**
 * Calendar field component for date selection.
 *
 * Provides a clean interface for selecting multiple dates within a reservation period.
 *
 * @component
 * @example
 * ```tsx
 * <ReservationCalendarField
 *   eventStartDate={event.startDate}
 *   eventEndDate={event.endDate}
 *   selectedDates={selectedDates}
 *   onDatesChange={setSelectedDates}
 *   maxDays={7}
 *   pricingTiers={event.reservationSettings?.dayPricing}
 *   label="Select your camp days"
 *   required
 * />
 * ```
 */
export function ReservationCalendarField({
  eventStartDate,
  eventEndDate,
  selectedDates,
  onDatesChange,
  maxDays = 7,
  requireConsecutive = false,
  minDays = 1,
  pricingTiers = [],
  disabledDates = [],
  allowPastDates = false,
  label,
  helpText,
  required = false,
  className = '',
  showPricing = true,
  eventId,
  error,
}: ReservationCalendarFieldProps): ReactElement {

  // Handle date selection changes
  const handleDatesChange = useCallback((dates: Date[]) => {
    onDatesChange(dates);
  }, [onDatesChange]);

  // Generate field ID for accessibility
  const fieldId = `calendar-field-${eventId || 'default'}`;
  const helpTextId = helpText ? `${fieldId}-help` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;

  return (
    <div className={`space-y-2 ${className}`}>

      {/* Field label */}
      {label && (
        <label
          htmlFor={fieldId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Help text */}
      {helpText && (
        <p
          id={helpTextId}
          className="text-sm text-gray-600"
        >
          {helpText}
        </p>
      )}

      {/* Calendar component */}
      <div
        id={fieldId}
        aria-describedby={[helpTextId, errorId].filter(Boolean).join(' ')}
        aria-invalid={!!error}
        role="group"
        aria-labelledby={label ? `${fieldId}-label` : undefined}
      >
        <DaySelectionCalendar
          eventStartDate={eventStartDate}
          eventEndDate={eventEndDate}
          maxDays={maxDays}
          requireConsecutive={requireConsecutive}
          minDays={minDays}
          selectedDates={selectedDates}
          onDatesChange={handleDatesChange}
          pricingTiers={pricingTiers}
          disabledDates={disabledDates}
          allowPastDates={allowPastDates}
          eventId={eventId}
          error={error}
          config={{
            showPricing,
            highlightPricingTiers: true,
            showNavigation: true,
            showHeader: true,
            showSummary: true,
            showClearButton: true,
            className: error ? 'border-red-300 shadow-sm shadow-red-100' : '',
          }}
        />
      </div>

      {/* Error message */}
      {error && (
        <p
          id={errorId}
          className="text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}