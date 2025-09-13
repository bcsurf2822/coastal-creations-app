"use client";

import { useState, useCallback, useMemo } from "react";
import {
  isSameDay,
  isWithinInterval,
  differenceInDays,
  startOfDay,
  isBefore,
} from "date-fns";

interface DaySelectionOptions {
  /** Maximum number of days that can be selected */
  maxDays?: number;
  /** Whether selected days must be consecutive */
  requireConsecutive?: boolean;
  /** Minimum number of days that must be selected */
  minDays?: number;
  /** Array of dates that are disabled and cannot be selected */
  disabledDates?: Date[];
  /** Whether to allow past date selection */
  allowPastDates?: boolean;
}

interface UseDaySelectionResult {
  /** Array of currently selected dates */
  selectedDates: Date[];
  /** Add a date to the selection */
  selectDate: (date: Date) => void;
  /** Remove a date from the selection */
  deselectDate: (date: Date) => void;
  /** Toggle a date's selection state */
  toggleDate: (date: Date) => void;
  /** Clear all selected dates */
  clearSelection: () => void;
  /** Set the entire selection to a new array of dates */
  setSelectedDates: (dates: Date[]) => void;
  /** Check if a date is currently selected */
  isDateSelected: (date: Date) => boolean;
  /** Check if a date is available for selection */
  isDateAvailable: (date: Date) => boolean;
  /** Check if a date can be selected given current constraints */
  canSelectDate: (date: Date) => boolean;
  /** Check if a date is disabled */
  isDateDisabled: (date: Date) => boolean;
  /** Check if a date is within the allowed event range */
  isDateInRange: (date: Date) => boolean;
  /** Number of currently selected dates */
  selectedCount: number;
  /** Whether the selection meets minimum requirements */
  isValidSelection: boolean;
  /** Whether maximum selection limit has been reached */
  isMaxReached: boolean;
  /** Get error message for current selection state */
  getSelectionError: () => string | null;
  /** Get consecutive date ranges from selection */
  getConsecutiveRanges: () => Array<{ start: Date; end: Date; length: number }>;
}

/**
 * React hook for managing calendar day selection state with validation.
 *
 * Provides comprehensive day selection functionality for multi-day reservation
 * calendars with support for consecutive day requirements, maximum limits,
 * and date range constraints.
 *
 * @param eventStartDate - Start date of the event period
 * @param eventEndDate - End date of the event period
 * @param options - Configuration options for selection behavior
 * @returns Object with selection state and manipulation functions
 *
 * @example
 * ```typescript
 * const {
 *   selectedDates,
 *   selectDate,
 *   isDateAvailable,
 *   isValidSelection,
 *   selectedCount,
 * } = useDaySelection(
 *   new Date('2024-07-15'),
 *   new Date('2024-07-21'),
 *   {
 *     maxDays: 7,
 *     requireConsecutive: false,
 *     minDays: 1,
 *   }
 * );
 * ```
 */
export function useDaySelection(
  eventStartDate: Date,
  eventEndDate: Date,
  options: DaySelectionOptions = {}
): UseDaySelectionResult {
  const {
    maxDays = 7,
    requireConsecutive = false,
    minDays = 1,
    disabledDates = [],
    allowPastDates = false,
  } = options;

  const [selectedDates, setSelectedDatesState] = useState<Date[]>([]);

  const normalizedEventStart = useMemo(
    () => startOfDay(eventStartDate),
    [eventStartDate]
  );
  const normalizedEventEnd = useMemo(
    () => startOfDay(eventEndDate),
    [eventEndDate]
  );
  const normalizedDisabledDates = useMemo(
    () => disabledDates.map((date) => startOfDay(date)),
    [disabledDates]
  );

  /**
   * Check if a date is within the event date range.
   */
  const isDateInRange = useCallback(
    (date: Date): boolean => {
      const normalizedDate = startOfDay(date);
      return isWithinInterval(normalizedDate, {
        start: normalizedEventStart,
        end: normalizedEventEnd,
      });
    },
    [normalizedEventStart, normalizedEventEnd]
  );

  /**
   * Check if a date is disabled.
   */
  const isDateDisabled = useCallback(
    (date: Date): boolean => {
      const normalizedDate = startOfDay(date);

      if (
        normalizedDisabledDates.some((disabledDate) =>
          isSameDay(normalizedDate, disabledDate)
        )
      ) {
        return true;
      }

      if (!allowPastDates && isBefore(normalizedDate, startOfDay(new Date()))) {
        return true;
      }

      return false;
    },
    [normalizedDisabledDates, allowPastDates]
  );

  /**
   * Check if a date is currently selected
   */
  const isDateSelected = useCallback(
    (date: Date): boolean => {
      const normalizedDate = startOfDay(date);
      return selectedDates.some((selectedDate) =>
        isSameDay(startOfDay(selectedDate), normalizedDate)
      );
    },
    [selectedDates]
  );

  /**
   * Check if a date is available for selection (in range and not disabled)
   */
  const isDateAvailable = useCallback(
    (date: Date): boolean => {
      return isDateInRange(date) && !isDateDisabled(date);
    },
    [isDateInRange, isDateDisabled]
  );

  /**
   * Get consecutive date ranges from current selection.
   */
  const getConsecutiveRanges = useCallback((): Array<{
    start: Date;
    end: Date;
    length: number;
  }> => {
    if (selectedDates.length === 0) {
      return [];
    }

    const sortedDates = [...selectedDates]
      .map((date) => startOfDay(date))
      .sort((a, b) => a.getTime() - b.getTime());

    const ranges: Array<{ start: Date; end: Date; length: number }> = [];
    let currentRangeStart = sortedDates[0];
    let currentRangeEnd = sortedDates[0];

    for (let i = 1; i < sortedDates.length; i++) {
      const currentDate = sortedDates[i];
      const previousDate = sortedDates[i - 1];

      if (differenceInDays(currentDate, previousDate) === 1) {
        currentRangeEnd = currentDate;
      } else {
        ranges.push({
          start: currentRangeStart,
          end: currentRangeEnd,
          length: differenceInDays(currentRangeEnd, currentRangeStart) + 1,
        });
        currentRangeStart = currentDate;
        currentRangeEnd = currentDate;
      }
    }

    ranges.push({
      start: currentRangeStart,
      end: currentRangeEnd,
      length: differenceInDays(currentRangeEnd, currentRangeStart) + 1,
    });

    return ranges;
  }, [selectedDates]);

  /**
   * Check if a date can be selected given current constraints
   */
  const canSelectDate = useCallback(
    (date: Date): boolean => {
      if (!isDateAvailable(date)) {
        return false;
      }

      if (isDateSelected(date)) {
        return true;
      }

      if (selectedDates.length >= maxDays) {
        return false;
      }

      if (requireConsecutive && selectedDates.length > 0) {
        const normalizedDate = startOfDay(date);
        const normalizedSelected = selectedDates.map((d) => startOfDay(d));

        const hasAdjacentDate = normalizedSelected.some((selectedDate) => {
          const diffDays = Math.abs(
            differenceInDays(normalizedDate, selectedDate)
          );
          return diffDays === 1;
        });

        if (!hasAdjacentDate) {
          return false;
        }
      }

      return true;
    },
    [
      isDateAvailable,
      isDateSelected,
      selectedDates,
      maxDays,
      requireConsecutive,
    ]
  );

  /**
   * Add a date to the selection
   */
  const selectDate = useCallback(
    (date: Date): void => {
      const normalizedDate = startOfDay(date);

      if (!canSelectDate(normalizedDate)) {
        return;
      }

      if (!isDateSelected(normalizedDate)) {
        setSelectedDatesState((prev) => [...prev, normalizedDate]);
      }
    },
    [canSelectDate, isDateSelected]
  );

  /**
   * Remove a date from the selection
   */
  const deselectDate = useCallback((date: Date): void => {
    const normalizedDate = startOfDay(date);

    setSelectedDatesState((prev) =>
      prev.filter(
        (selectedDate) => !isSameDay(startOfDay(selectedDate), normalizedDate)
      )
    );
  }, []);

  /**
   * Toggle a date's selection state
   */
  const toggleDate = useCallback(
    (date: Date): void => {
      if (isDateSelected(date)) {
        deselectDate(date);
      } else {
        selectDate(date);
      }
    },
    [isDateSelected, deselectDate, selectDate]
  );

  /**
   * Clear all selected dates
   */
  const clearSelection = useCallback((): void => {
    setSelectedDatesState([]);
  }, []);

  /**
   * Set the entire selection to a new array of dates
   */
  const setSelectedDates = useCallback(
    (dates: Date[]): void => {
      const validDates = dates
        .map((date) => startOfDay(date))
        .filter((date) => isDateAvailable(date))
        .slice(0, maxDays);

      setSelectedDatesState(validDates);
    },
    [isDateAvailable, maxDays]
  );

  // Computed properties
  const selectedCount = selectedDates.length;
  const isMaxReached = selectedCount >= maxDays;
  const isValidSelection = selectedCount >= minDays && selectedCount <= maxDays;

  /**
   * Get error message for current selection state
   */
  const getSelectionError = useCallback((): string | null => {
    if (selectedCount < minDays) {
      return `Please select at least ${minDays} day${minDays > 1 ? "s" : ""}`;
    }

    if (selectedCount > maxDays) {
      return `Cannot select more than ${maxDays} days`;
    }

    if (requireConsecutive && selectedCount > 1) {
      const ranges = getConsecutiveRanges();
      if (ranges.length > 1) {
        return "Selected days must be consecutive";
      }
    }

    return null;
  }, [
    selectedCount,
    minDays,
    maxDays,
    requireConsecutive,
    getConsecutiveRanges,
  ]);

  return {
    selectedDates,
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
    getConsecutiveRanges,
  };
}
