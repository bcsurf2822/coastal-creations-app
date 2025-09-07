/**
 * @fileoverview Main calendar component for multi-day reservation selection
 * @module components/reservation/DaySelectionCalendar
 */

'use client';

import { ReactElement, useState, useCallback, useMemo, useEffect } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameMonth,
  isValid,
} from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { CalendarDay, CalendarDayWithPricing } from './CalendarDay';
import { useDaySelection } from '../../hooks/useDaySelection';
import { useReservationPricing } from '../../hooks/useReservationPricing';
import type { PricingTier } from '../../lib/validations/reservationValidation';

/**
 * Configuration for calendar display and behavior.
 */
interface CalendarConfig {
  /** Whether to show pricing information on days */
  showPricing?: boolean;
  /** Whether to highlight days that match pricing tiers */
  highlightPricingTiers?: boolean;
  /** Whether to show month navigation */
  showNavigation?: boolean;
  /** Whether to show the calendar header */
  showHeader?: boolean;
  /** Whether to show selection summary */
  showSummary?: boolean;
  /** Whether to show clear selection button */
  showClearButton?: boolean;
  /** Custom CSS classes for the calendar container */
  className?: string;
  /** Week starts on Sunday (0) or Monday (1) */
  weekStartsOn?: 0 | 1;
}

/**
 * Props for DaySelectionCalendar component.
 */
interface DaySelectionCalendarProps {
  /** Start date of the reservation period */
  eventStartDate: Date;
  /** End date of the reservation period */
  eventEndDate: Date;
  /** Maximum number of days that can be selected */
  maxDays?: number;
  /** Whether selected days must be consecutive */
  requireConsecutive?: boolean;
  /** Minimum number of days that must be selected */
  minDays?: number;
  /** Currently selected dates */
  selectedDates: Date[];
  /** Callback when selected dates change */
  onDatesChange: (dates: Date[]) => void;
  /** Available pricing tiers */
  pricingTiers?: PricingTier[];
  /** Array of disabled dates that cannot be selected */
  disabledDates?: Date[];
  /** Whether to allow selection of past dates */
  allowPastDates?: boolean;
  /** Calendar configuration options */
  config?: CalendarConfig;
  /** Error message to display */
  error?: string | null;
  /** Loading state */
  isLoading?: boolean;
  /** Event ID for pricing integration */
  eventId?: string;
}

/**
 * Multi-day reservation calendar component with selection and pricing integration.
 *
 * Provides an interactive calendar interface for selecting multiple days within
 * a reservation period, with real-time pricing calculations and visual feedback.
 *
 * @component
 * @example
 * ```tsx
 * <DaySelectionCalendar
 *   eventStartDate={new Date('2024-07-15')}
 *   eventEndDate={new Date('2024-07-21')}
 *   maxDays={7}
 *   selectedDates={selectedDates}
 *   onDatesChange={setSelectedDates}
 *   pricingTiers={pricingTiers}
 *   config={{
 *     showPricing: true,
 *     highlightPricingTiers: true,
 *     showSummary: true,
 *   }}
 * />
 * ```
 */
export function DaySelectionCalendar({
  eventStartDate,
  eventEndDate,
  maxDays = 7,
  requireConsecutive = false,
  minDays = 1,
  selectedDates = [],
  onDatesChange,
  pricingTiers = [],
  disabledDates = [],
  allowPastDates = false,
  config = {},
  error,
  isLoading = false,
  eventId,
}: DaySelectionCalendarProps): ReactElement {

  const {
    showPricing = true,
    highlightPricingTiers = true,
    showNavigation = true,
    showHeader = true,
    showSummary = true,
    showClearButton = true,
    className = '',
    weekStartsOn = 0,
  } = config;

  // Validate date props
  if (!isValid(eventStartDate) || !isValid(eventEndDate)) {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
        <p className="text-red-700">Invalid event dates provided</p>
      </div>
    );
  }

  // Initialize current month to show (start with event start month)
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(eventStartDate));

  // Day selection hook
  const {
    selectedDates: internalSelectedDates,
    selectDate,
    deselectDate,
    toggleDate,
    clearSelection,
    setSelectedDates,
    isDateSelected,
    isDateAvailable,
    canSelectDate,
    isDateDisabled,
    isDateInRange,
    selectedCount,
    isValidSelection,
    isMaxReached,
    getSelectionError,
  } = useDaySelection(eventStartDate, eventEndDate, {
    maxDays,
    requireConsecutive,
    minDays,
    disabledDates,
    allowPastDates,
  });

  // Pricing hook for real-time calculations
  const {
    price: currentPrice,
    suggestions,
    isCalculating,
  } = useReservationPricing(selectedCount, pricingTiers, {}, {
    realTimeUpdates: true,
    debounceDelay: 200,
  });

  // Sync internal selection with prop changes
  useEffect(() => {
    if (JSON.stringify(selectedDates) !== JSON.stringify(internalSelectedDates)) {
      setSelectedDates(selectedDates);
    }
  }, [selectedDates, internalSelectedDates, setSelectedDates]);

  // Notify parent of selection changes
  useEffect(() => {
    if (JSON.stringify(selectedDates) !== JSON.stringify(internalSelectedDates)) {
      onDatesChange(internalSelectedDates);
    }
  }, [internalSelectedDates, selectedDates, onDatesChange]);

  // Calendar navigation
  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentMonth(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  }, []);

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn });

    return eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd,
    });
  }, [currentMonth, weekStartsOn]);

  // Handle day click
  const handleDayClick = useCallback((date: Date) => {
    toggleDate(date);
  }, [toggleDate]);

  // Handle clear selection
  const handleClearSelection = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  // Generate weekday headers
  const weekdayHeaders = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn });
    return eachDayOfInterval({
      start,
      end: endOfWeek(start, { weekStartsOn }),
    }).map(date => format(date, 'EEE'));
  }, [weekStartsOn]);

  // Current error message
  const currentError = error || getSelectionError();

  // Loading overlay
  if (isLoading) {
    return (
      <div className={`relative ${className}`}>
        <div className="animate-pulse bg-gray-200 rounded-lg h-96" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5 text-blue-500 animate-spin" />
            <span className="text-sm text-gray-600">Loading calendar...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-md mx-auto bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      
      {/* Calendar Header */}
      {showHeader && (
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Select Days
              </h3>
            </div>
            
            {showClearButton && selectedCount > 0 && (
              <button
                type="button"
                onClick={handleClearSelection}
                className="flex items-center space-x-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                aria-label="Clear selection"
              >
                <XMarkIcon className="w-4 h-4" />
                <span>Clear</span>
              </button>
            )}
          </div>
          
          {/* Selection summary */}
          {showSummary && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">
                {selectedCount === 0 && `Select up to ${maxDays} days`}
                {selectedCount === 1 && '1 day selected'}
                {selectedCount > 1 && `${selectedCount} days selected`}
                {isMaxReached && ' (maximum reached)'}
              </p>
              
              {/* Pricing information */}
              {showPricing && currentPrice && selectedCount > 0 && (
                <div className="mt-1 text-sm">
                  <span className="font-medium text-green-700">
                    Total: {currentPrice.formattedPrice}
                  </span>
                  {currentPrice.breakdown.savings && currentPrice.breakdown.savings > 0 && (
                    <span className="text-green-600 ml-2">
                      (Save ${currentPrice.breakdown.savings.toFixed(0)})
                    </span>
                  )}
                  {isCalculating && (
                    <span className="text-gray-500 ml-2">Calculating...</span>
                  )}
                </div>
              )}

              {/* Pricing suggestions */}
              {suggestions.length > 0 && (
                <div className="mt-1">
                  <p className="text-xs text-blue-600">
                    💡 {suggestions[0].message}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Error message */}
          {currentError && (
            <div className="mt-2 text-sm text-red-600">
              {currentError}
            </div>
          )}
        </div>
      )}

      {/* Month Navigation */}
      {showNavigation && (
        <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
          <button
            type="button"
            onClick={() => navigateMonth('prev')}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          
          <h4 className="text-sm font-medium text-gray-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h4>
          
          <button
            type="button"
            onClick={() => navigateMonth('next')}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Next month"
          >
            <ChevronRightIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekdayHeaders.map((day) => (
            <div
              key={day}
              className="h-8 flex items-center justify-center text-xs font-medium text-gray-500 uppercase"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date) => {
            const dayProps = {
              date,
              currentMonth,
              isSelected: isDateSelected(date),
              isAvailable: isDateAvailable(date),
              isDisabled: isDateDisabled(date),
              isInRange: isDateInRange(date),
              canSelect: canSelectDate(date),
              onDayClick: handleDayClick,
              pricingTiers,
            };

            return showPricing && highlightPricingTiers ? (
              <CalendarDayWithPricing
                key={date.toISOString()}
                {...dayProps}
                selectedCount={selectedCount}
                highlightMatchingTier={true}
              />
            ) : (
              <CalendarDay
                key={date.toISOString()}
                {...dayProps}
                showPricing={showPricing}
              />
            );
          })}
        </div>

        {/* Legend */}
        {showPricing && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex flex-wrap gap-4 text-xs text-gray-600">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-600 rounded"></div>
                <span>Selected</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-white border border-gray-200 rounded"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-gray-100 rounded"></div>
                <span>Disabled</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}