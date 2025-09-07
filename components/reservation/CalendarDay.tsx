/**
 * @fileoverview Individual calendar day component for reservation selection
 * @module components/reservation/CalendarDay
 */

'use client';

import { ReactElement, memo, useCallback } from 'react';
import { format, isSameMonth, isToday } from 'date-fns';
import type { PricingTier } from '../../lib/validations/reservationValidation';

/**
 * Visual state of a calendar day.
 */
type DayState = 'available' | 'selected' | 'disabled' | 'out-of-range' | 'today';

/**
 * Props for CalendarDay component.
 */
interface CalendarDayProps {
  /** The date this day represents */
  date: Date;
  /** The current month being displayed */
  currentMonth: Date;
  /** Whether this day is selected */
  isSelected: boolean;
  /** Whether this day is available for selection */
  isAvailable: boolean;
  /** Whether this day is disabled */
  isDisabled: boolean;
  /** Whether this day is within the event date range */
  isInRange: boolean;
  /** Whether selecting this day is currently allowed */
  canSelect: boolean;
  /** Pricing tiers for showing tier information */
  pricingTiers?: PricingTier[];
  /** Callback when day is clicked */
  onDayClick: (date: Date) => void;
  /** Optional tooltip content */
  tooltip?: string;
  /** Whether to show pricing information on hover */
  showPricing?: boolean;
  /** Custom CSS classes */
  className?: string;
  /** Accessibility label override */
  ariaLabel?: string;
}

/**
 * Individual calendar day component with selection state and visual feedback.
 *
 * Displays a single day in the calendar with appropriate styling based on its
 * state (selected, available, disabled, etc.) and handles user interactions.
 *
 * @component
 * @example
 * ```tsx
 * <CalendarDay
 *   date={new Date('2024-07-15')}
 *   currentMonth={new Date('2024-07-01')}
 *   isSelected={false}
 *   isAvailable={true}
 *   isDisabled={false}
 *   isInRange={true}
 *   canSelect={true}
 *   onDayClick={handleDayClick}
 *   pricingTiers={pricingTiers}
 *   showPricing={true}
 * />
 * ```
 */
export const CalendarDay = memo<CalendarDayProps>(({
  date,
  currentMonth,
  isSelected,
  isAvailable,
  isDisabled,
  isInRange,
  canSelect,
  pricingTiers = [],
  onDayClick,
  tooltip,
  showPricing = false,
  className = '',
  ariaLabel,
}) => {
  // Determine day state for styling
  const getDayState = (): DayState => {
    if (!isInRange) return 'out-of-range';
    if (isDisabled) return 'disabled';
    if (isSelected) return 'selected';
    if (isToday(date)) return 'today';
    return 'available';
  };

  const dayState = getDayState();
  const isCurrentMonth = isSameMonth(date, currentMonth);
  const dayNumber = format(date, 'd');

  // Handle day click
  const handleClick = useCallback(() => {
    if (canSelect && !isDisabled) {
      onDayClick(date);
    }
  }, [canSelect, isDisabled, onDayClick, date]);

  // Handle keyboard interaction
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  // Get styling classes based on day state
  const getStateClasses = (): string => {
    const baseClasses = 'relative w-full h-10 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1';
    
    switch (dayState) {
      case 'selected':
        return `${baseClasses} bg-blue-600 text-white border-blue-600 font-semibold shadow-md hover:bg-blue-700`;
      case 'today':
        return `${baseClasses} bg-blue-50 text-blue-700 border-blue-300 font-medium hover:bg-blue-100`;
      case 'available':
        return canSelect
          ? `${baseClasses} bg-white text-gray-900 border-gray-200 hover:bg-gray-50 hover:border-gray-300 cursor-pointer`
          : `${baseClasses} bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed`;
      case 'disabled':
        return `${baseClasses} bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed`;
      case 'out-of-range':
        return `${baseClasses} bg-transparent text-gray-300 border-transparent cursor-default`;
      default:
        return baseClasses;
    }
  };

  // Get opacity for out-of-month dates
  const getOpacityClass = (): string => {
    return isCurrentMonth ? 'opacity-100' : 'opacity-30';
  };

  // Generate accessibility label
  const getAriaLabel = (): string => {
    if (ariaLabel) return ariaLabel;

    const formattedDate = format(date, 'EEEE, MMMM d, yyyy');
    const stateDescription = isSelected ? 'selected' : 
                           isDisabled ? 'disabled' : 
                           !isAvailable ? 'not available' : 
                           'available';
    
    return `${formattedDate}, ${stateDescription}`;
  };

  // Get pricing information for tooltip
  const getPricingInfo = (): string | null => {
    if (!showPricing || pricingTiers.length === 0) return null;

    // Find single day pricing
    const singleDayTier = pricingTiers.find(tier => tier.numberOfDays === 1);
    if (singleDayTier) {
      return `$${singleDayTier.price}`;
    }

    return null;
  };

  const combinedTooltip = tooltip || getPricingInfo();

  return (
    <button
      type="button"
      className={`${getStateClasses()} ${getOpacityClass()} ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={isDisabled || !canSelect}
      aria-label={getAriaLabel()}
      aria-selected={isSelected}
      aria-disabled={isDisabled || !canSelect}
      title={combinedTooltip || undefined}
      tabIndex={isAvailable && canSelect ? 0 : -1}
    >
      <span className="flex items-center justify-center w-full h-full">
        {dayNumber}
      </span>

      {/* Visual indicators */}
      {isSelected && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white">
          <span className="sr-only">Selected</span>
        </div>
      )}

      {isToday(date) && dayState !== 'selected' && (
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full">
          <span className="sr-only">Today</span>
        </div>
      )}

      {/* Pricing indicator */}
      {showPricing && getPricingInfo() && !isSelected && isAvailable && (
        <div className="absolute bottom-0 left-0 right-0 text-xs text-gray-500 leading-none pb-1">
          {getPricingInfo()}
        </div>
      )}
    </button>
  );
});

CalendarDay.displayName = 'CalendarDay';

/**
 * Calendar day component with price overlay for reservation selection.
 *
 * Enhanced version that displays pricing information and tier indicators
 * for better user decision making during day selection.
 *
 * @component
 * @example
 * ```tsx
 * <CalendarDayWithPricing
 *   date={date}
 *   currentMonth={currentMonth}
 *   isSelected={isSelected}
 *   isAvailable={isAvailable}
 *   selectedCount={selectedCount}
 *   pricingTiers={pricingTiers}
 *   onDayClick={handleDayClick}
 * />
 * ```
 */
interface CalendarDayWithPricingProps extends Omit<CalendarDayProps, 'showPricing'> {
  /** Current number of selected days */
  selectedCount: number;
  /** Whether to highlight pricing tiers that match selection */
  highlightMatchingTier?: boolean;
}

export const CalendarDayWithPricing = memo<CalendarDayWithPricingProps>(({
  selectedCount,
  pricingTiers = [],
  highlightMatchingTier = true,
  ...dayProps
}) => {
  // Find applicable pricing tier for current selection
  const getApplicableTier = (): PricingTier | null => {
    if (!highlightMatchingTier || selectedCount === 0) return null;

    const potentialDays = selectedCount + (dayProps.isSelected ? 0 : 1);
    
    // Find exact match first
    const exactMatch = pricingTiers.find(tier => tier.numberOfDays === potentialDays);
    if (exactMatch) return exactMatch;

    // Find next higher tier
    const higherTiers = pricingTiers
      .filter(tier => tier.numberOfDays > potentialDays)
      .sort((a, b) => a.numberOfDays - b.numberOfDays);
    
    return higherTiers[0] || null;
  };

  const applicableTier = getApplicableTier();
  
  // Enhanced tooltip with tier information
  const enhancedTooltip = dayProps.tooltip || (() => {
    if (applicableTier && selectedCount > 0) {
      const potentialDays = selectedCount + (dayProps.isSelected ? 0 : 1);
      const pricePerDay = applicableTier.price / applicableTier.numberOfDays;
      return `${potentialDays} days: $${applicableTier.price} total (~$${pricePerDay.toFixed(0)}/day)`;
    }
    return null;
  })();

  // Enhanced styling for tier matching
  const tierMatchClass = applicableTier && selectedCount > 0 ? 
    'ring-2 ring-green-400 ring-opacity-50' : '';

  return (
    <CalendarDay
      {...dayProps}
      tooltip={enhancedTooltip}
      showPricing={true}
      className={`${dayProps.className} ${tierMatchClass}`}
    />
  );
});