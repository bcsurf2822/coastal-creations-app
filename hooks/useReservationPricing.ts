/**
 * @fileoverview React hook for multi-day reservation pricing calculations
 * @module hooks/useReservationPricing
 */

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { 
  PricingResult, 
  PricingSuggestion, 
  PricingOptions,
  PricingConfig,
  PriceComparison,
} from '../lib/pricing/types';
import type { PricingTier, EventId } from '../lib/validations/reservationValidation';
import { 
  calculateReservationPrice, 
  getSuggestedPricing,
  comparePricingOptions,
} from '../lib/pricing/calculations';
import { PricingError, DEFAULT_PRICING_CONFIG } from '../lib/pricing/types';

/**
 * Configuration for the useReservationPricing hook.
 */
interface UseReservationPricingConfig extends Partial<PricingConfig> {
  /** Whether to fetch pricing tiers from API or use provided tiers */
  autoFetchTiers?: boolean;
  /** Whether to enable real-time pricing updates */
  realTimeUpdates?: boolean;
  /** Debounce delay for pricing calculations (ms) */
  debounceDelay?: number;
  /** Whether to cache pricing results */
  enableCaching?: boolean;
  /** Event ID for fetching pricing tiers */
  eventId?: EventId;
}

/**
 * Result of the useReservationPricing hook.
 */
interface UseReservationPricingResult {
  /** Current calculated price result */
  price: PricingResult | null;
  /** Pricing optimization suggestions */
  suggestions: PricingSuggestion[];
  /** Price comparisons for different day counts */
  comparisons: PriceComparison[];
  /** Whether pricing calculation is in progress */
  isCalculating: boolean;
  /** Any error that occurred during calculation */
  error: string | null;
  /** Available pricing tiers */
  pricingTiers: PricingTier[] | null;
  /** Whether pricing tiers are being fetched */
  isLoadingTiers: boolean;
  /** Recalculate pricing with current parameters */
  recalculate: () => void;
  /** Update pricing options */
  updateOptions: (newOptions: Partial<PricingOptions>) => void;
  /** Get price for specific day count */
  getPriceForDays: (days: number) => PricingResult | null;
  /** Check if pricing is available for given day count */
  canPriceDays: (days: number) => boolean;
}

/**
 * React hook for handling multi-day reservation pricing calculations.
 *
 * Provides comprehensive pricing functionality including calculations,
 * suggestions, comparisons, and real-time updates integrated with React Hook Form.
 *
 * @param selectedDays - Number of days currently selected
 * @param pricingTiers - Pricing tiers to use (optional if autoFetchTiers is true)
 * @param initialOptions - Initial pricing options
 * @param config - Hook configuration options
 * @returns Pricing calculation result and utilities
 * 
 * @example
 * ```typescript
 * const {
 *   price,
 *   suggestions,
 *   isCalculating,
 *   error,
 *   updateOptions,
 * } = useReservationPricing(3, pricingTiers, {
 *   includeTax: true,
 *   taxRate: 0.08
 * });
 * 
 * if (price) {
 *   console.log(`Total: ${price.formattedPrice}`);
 * }
 * ```
 */
export function useReservationPricing(
  selectedDays: number,
  pricingTiers?: PricingTier[] | null,
  initialOptions: PricingOptions = {},
  config: UseReservationPricingConfig = {}
): UseReservationPricingResult {
  
  const {
    autoFetchTiers = false,
    realTimeUpdates = true,
    debounceDelay = 300,
    enableCaching = true,
    eventId,
    ...pricingConfig
  } = config;

  const finalConfig: PricingConfig = {
    ...DEFAULT_PRICING_CONFIG,
    ...pricingConfig,
  };

  // State management
  const [options, setOptions] = useState<PricingOptions>(initialOptions);
  const [price, setPrice] = useState<PricingResult | null>(null);
  const [suggestions, setSuggestions] = useState<PricingSuggestion[]>([]);
  const [comparisons, setComparisons] = useState<PriceComparison[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calculationVersion, setCalculationVersion] = useState(0);

  // State for fetched pricing tiers
  const [fetchedPricingTiers, setFetchedPricingTiers] = useState<PricingTier[] | null>(null);
  const [isLoadingTiers, setIsLoadingTiers] = useState(false);
  const [tiersError, setTiersError] = useState<Error | null>(null);

  // Fetch pricing tiers from API if needed
  useEffect(() => {
    if (!autoFetchTiers || !eventId) return;

    const fetchTiers = async (): Promise<void> => {
      setIsLoadingTiers(true);
      setTiersError(null);

      try {
        const response = await fetch(`/api/events/${eventId}/pricing`);
        if (!response.ok) {
          throw new Error(`Failed to fetch pricing tiers: ${response.statusText}`);
        }

        const data = await response.json();
        setFetchedPricingTiers(data.pricingTiers || []);
      } catch (err) {
        setTiersError(err instanceof Error ? err : new Error('Unknown error'));
        setFetchedPricingTiers(null);
      } finally {
        setIsLoadingTiers(false);
      }
    };

    fetchTiers();
  }, [autoFetchTiers, eventId]);

  // Determine which pricing tiers to use
  const activePricingTiers = useMemo(() => {
    if (autoFetchTiers) {
      return fetchedPricingTiers || null;
    }
    return pricingTiers || null;
  }, [autoFetchTiers, fetchedPricingTiers, pricingTiers]);

  // Memoize commonly requested day counts for comparisons
  const comparisonDayCounts = useMemo(() => {
    if (!activePricingTiers || activePricingTiers.length === 0) {
      return [];
    }

    const tierDays = activePricingTiers.map(t => t.numberOfDays).sort((a, b) => a - b);
    const maxDays = Math.max(...tierDays);
    
    // Include all tier days plus some common intermediate values
    const commonDays = [1, 2, 3, 4, 5, 6, 7, 14, 21, 30];
    const allDays = [...new Set([...tierDays, ...commonDays.filter(d => d <= maxDays)])];
    
    return allDays.sort((a, b) => a - b).slice(0, 10); // Limit to 10 comparisons
  }, [activePricingTiers]);

  // Core pricing calculation function
  const calculatePricing = useCallback(async (
    days: number,
    tiers: PricingTier[] | null,
    pricingOptions: PricingOptions
  ) => {
    if (!tiers || tiers.length === 0 || days <= 0) {
      return null;
    }

    try {
      return calculateReservationPrice(days, tiers, pricingOptions, finalConfig);
    } catch (err) {
      if (err instanceof PricingError) {
        throw new Error(err.message);
      }
      throw new Error('Pricing calculation failed');
    }
  }, [finalConfig]);

  // Debounced calculation effect
  useEffect(() => {
    if (!realTimeUpdates) return;

    const timeoutId = setTimeout(async () => {
      setIsCalculating(true);
      setError(null);

      try {
        // Calculate main price
        const newPrice = await calculatePricing(selectedDays, activePricingTiers, options);
        setPrice(newPrice);

        // Generate suggestions if enabled
        if (finalConfig.enableSuggestions && activePricingTiers) {
          const newSuggestions = getSuggestedPricing(selectedDays, activePricingTiers, finalConfig);
          setSuggestions(newSuggestions);
        } else {
          setSuggestions([]);
        }

        // Generate price comparisons
        if (activePricingTiers && comparisonDayCounts.length > 0) {
          const newComparisons = comparePricingOptions(comparisonDayCounts, activePricingTiers, options);
          setComparisons(newComparisons);
        } else {
          setComparisons([]);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown pricing error');
        setPrice(null);
        setSuggestions([]);
        setComparisons([]);
      } finally {
        setIsCalculating(false);
      }
    }, debounceDelay);

    return () => clearTimeout(timeoutId);
  }, [
    selectedDays,
    activePricingTiers,
    options,
    realTimeUpdates,
    debounceDelay,
    calculatePricing,
    finalConfig,
    comparisonDayCounts,
    calculationVersion,
  ]);

  // Handle API fetch errors
  useEffect(() => {
    if (tiersError) {
      setError(`Failed to load pricing: ${tiersError.message}`);
    }
  }, [tiersError]);

  // Utility functions
  const recalculate = useCallback(() => {
    setCalculationVersion(prev => prev + 1);
  }, []);

  const updateOptions = useCallback((newOptions: Partial<PricingOptions>) => {
    setOptions(prev => ({ ...prev, ...newOptions }));
  }, []);

  const getPriceForDays = useCallback((days: number): PricingResult | null => {
    if (!activePricingTiers || days <= 0) {
      return null;
    }

    try {
      return calculateReservationPrice(days, activePricingTiers, options, finalConfig);
    } catch {
      return null;
    }
  }, [activePricingTiers, options, finalConfig]);

  const canPriceDays = useCallback((days: number): boolean => {
    if (!activePricingTiers || days <= 0) {
      return false;
    }

    return activePricingTiers.some(tier => tier.numberOfDays >= days);
  }, [activePricingTiers]);

  return {
    price,
    suggestions,
    comparisons,
    isCalculating: isCalculating || isLoadingTiers,
    error,
    pricingTiers: activePricingTiers,
    isLoadingTiers,
    recalculate,
    updateOptions,
    getPriceForDays,
    canPriceDays,
  };
}

/**
 * Hook for managing pricing tiers with CRUD operations.
 *
 * Provides functions for creating, updating, and validating pricing tiers.
 *
 * @param eventId - Event ID for the pricing tiers
 * @returns Pricing tier management utilities
 * 
 * @example
 * ```typescript
 * const {
 *   tiers,
 *   addTier,
 *   updateTier,
 *   removeTier,
 *   validateTiers,
 * } = usePricingTiers(eventId);
 * ```
 */
export function usePricingTiers(eventId?: EventId) {
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    issues: string[];
    warnings: string[];
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  // Fetch existing tiers
  useEffect(() => {
    if (!eventId) return;

    const fetchTiers = async (): Promise<void> => {
      setIsLoading(true);

      try {
        const response = await fetch(`/api/events/${eventId}/pricing`);
        if (!response.ok) {
          throw new Error('Failed to fetch pricing tiers');
        }

        const data = await response.json();
        setTiers(data.pricingTiers || []);
      } catch (error) {
        console.warn('Failed to fetch pricing tiers:', error);
        setTiers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTiers();
  }, [eventId]);

  const addTier = useCallback((tier: Omit<PricingTier, 'id'>) => {
    const newTier: PricingTier = {
      ...tier,
    };
    
    setTiers(prev => [...prev, newTier].sort((a, b) => a.numberOfDays - b.numberOfDays));
  }, []);

  const updateTier = useCallback((index: number, updates: Partial<PricingTier>) => {
    setTiers(prev => prev.map((tier, i) => 
      i === index ? { ...tier, ...updates } : tier
    ).sort((a, b) => a.numberOfDays - b.numberOfDays));
  }, []);

  const removeTier = useCallback((index: number) => {
    setTiers(prev => prev.filter((_, i) => i !== index));
  }, []);

  const validateTiers = useCallback(() => {
    import('../lib/pricing/calculations').then(({ validatePricingTiers }) => {
      const result = validatePricingTiers(tiers);
      setValidationResult(result);
      return result;
    });
  }, [tiers]);

  // Auto-validate when tiers change
  useEffect(() => {
    if (tiers.length > 0) {
      validateTiers();
    }
  }, [tiers, validateTiers]);

  const saveTiers = useCallback(async () => {
    if (!eventId) {
      throw new Error('Event ID required to save pricing tiers');
    }

    const validation = validateTiers();
    if (!validation.isValid) {
      throw new Error(`Invalid pricing tiers: ${validation.issues.join(', ')}`);
    }

    const response = await fetch(`/api/events/${eventId}/pricing`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pricingTiers: tiers }),
    });

    if (!response.ok) {
      throw new Error('Failed to save pricing tiers');
    }

    return await response.json();
  }, [eventId, tiers, validateTiers]);

  return {
    tiers,
    isLoading,
    validationResult,
    addTier,
    updateTier,
    removeTier,
    validateTiers,
    saveTiers,
  };
}

/**
 * Hook for price optimization analysis and suggestions.
 *
 * Provides advanced pricing analysis for administrators.
 *
 * @param tiers - Pricing tiers to analyze
 * @param historicalData - Optional historical booking data for analysis
 * @returns Price optimization insights
 * 
 * @example
 * ```typescript
 * const { 
 *   optimization,
 *   suggestions,
 *   profitability 
 * } = usePriceOptimization(pricingTiers, historicalBookings);
 * ```
 */
export function usePriceOptimization(
  tiers: PricingTier[],
  historicalData?: Array<{
    daysBooked: number;
    pricepaid: number;
    bookingDate: Date;
    participants: number;
  }>
) {
  const optimization = useMemo(() => {
    if (tiers.length === 0) {
      return null;
    }

    // For now, return a simplified analysis
    // TODO: Import analyzePricingStrategy dynamically when needed
    return {
      isOptimal: true,
      issues: [],
      suggestions: [],
      metrics: {
        averageDiscountPercent: 0,
        maxDiscountPercent: 0,
        priceRangeRatio: 1,
        valueConsistency: 1,
      },
    };
  }, [tiers]);

  const demandAnalysis = useMemo(() => {
    if (!historicalData || historicalData.length === 0) {
      return null;
    }

    // Analyze booking patterns
    const demandByDays = historicalData.reduce((acc, booking) => {
      acc[booking.daysBooked] = (acc[booking.daysBooked] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const totalBookings = historicalData.length;
    const avgBookingSize = historicalData.reduce((sum, b) => sum + b.daysBooked, 0) / totalBookings;
    const avgRevenue = historicalData.reduce((sum, b) => sum + b.pricepaid, 0) / totalBookings;

    return {
      demandByDays,
      totalBookings,
      avgBookingSize,
      avgRevenue,
      popularDurations: Object.entries(demandByDays)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([days, count]) => ({ days: parseInt(days), bookings: count })),
    };
  }, [historicalData]);

  const recommendations = useMemo(() => {
    const recs: string[] = [];

    if (optimization && !optimization.isOptimal) {
      recs.push(...optimization.suggestions);
    }

    if (demandAnalysis) {
      // Suggest pricing adjustments based on demand
      for (const { days, bookings } of demandAnalysis.popularDurations) {
        const tier = tiers.find(t => t.numberOfDays === days);
        if (tier && bookings > demandAnalysis.totalBookings * 0.3) {
          recs.push(`Consider premium pricing for ${days}-day bookings due to high demand`);
        }
      }
    }

    return recs;
  }, [optimization, demandAnalysis, tiers]);

  return {
    optimization,
    demandAnalysis,
    recommendations,
    isOptimal: optimization?.isOptimal ?? false,
  };
}