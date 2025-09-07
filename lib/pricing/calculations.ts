/**
 * @fileoverview Core pricing calculation logic for multi-day reservation system
 * @module lib/pricing/calculations
 */

import type { PricingTier } from '../validations/reservationValidation';
import type {
  PricingOptions,
  PricingResult,
  PricingSuggestion,
  PriceBreakdown,
  PriceLineItem,
  PricingConfig,
  PriceFormatOptions,
  PriceComparison,
} from './types';
import { PricingError, DEFAULT_PRICING_CONFIG } from './types';

/**
 * Calculate the total price for a multi-day reservation.
 *
 * Finds the best matching pricing tier and calculates the total cost
 * including any applicable taxes, discounts, and fees.
 *
 * @param dayCount - Number of days to calculate pricing for
 * @param pricingTiers - Available pricing tiers to choose from
 * @param options - Additional pricing calculation options
 * @param config - Pricing engine configuration
 * @returns Complete pricing result with breakdown
 * 
 * @throws {PricingError} When calculation fails or invalid parameters provided
 * 
 * @example
 * ```typescript
 * const result = calculateReservationPrice(3, pricingTiers, {
 *   includeTax: true,
 *   taxRate: 0.08
 * });
 * console.log(result.totalPrice); // 240.00
 * console.log(result.formattedPrice); // "$240.00"
 * ```
 */
export function calculateReservationPrice(
  dayCount: number,
  pricingTiers: PricingTier[],
  options: PricingOptions = {},
  config: PricingConfig = DEFAULT_PRICING_CONFIG
): PricingResult {
  // Validate inputs
  if (!Array.isArray(pricingTiers) || pricingTiers.length === 0) {
    throw new PricingError('no_tiers_provided', 'No pricing tiers provided for calculation');
  }

  if (dayCount <= 0 || !Number.isInteger(dayCount)) {
    throw new PricingError('invalid_day_count', `Invalid day count: ${dayCount}`, { dayCount });
  }

  try {
    // Find the best pricing tier for the given day count
    const appliedTier = findBestPriceTier(dayCount, pricingTiers);
    
    if (!appliedTier) {
      throw new PricingError('no_matching_tier', `No pricing tier found for ${dayCount} days`, { dayCount, availableTiers: pricingTiers.map(t => t.numberOfDays) });
    }

    // Calculate base price
    const basePrice = appliedTier.price;
    let totalPrice = basePrice;

    // Create line items for breakdown
    const lineItems: PriceLineItem[] = [
      {
        description: appliedTier.label || `${appliedTier.numberOfDays} day${appliedTier.numberOfDays > 1 ? 's' : ''}`,
        quantity: 1,
        unitPrice: basePrice,
        totalPrice: basePrice,
        type: 'base',
      },
    ];

    // Apply tax if requested
    let taxAmount = 0;
    if (options.includeTax) {
      const taxRate = options.taxRate ?? config.defaultTaxRate;
      taxAmount = basePrice * taxRate;
      totalPrice += taxAmount;

      if (taxAmount > 0) {
        lineItems.push({
          description: `Tax (${(taxRate * 100).toFixed(1)}%)`,
          quantity: 1,
          unitPrice: taxAmount,
          totalPrice: taxAmount,
          type: 'tax',
        });
      }
    }

    // Apply rounding if requested
    if (options.roundPrices || config.roundingStrategy !== 'none') {
      totalPrice = roundPrice(totalPrice, config.roundingStrategy);
    }

    // Calculate price per day
    const pricePerDay = totalPrice / dayCount;

    // Create breakdown
    const breakdown: PriceBreakdown = {
      tierDescription: appliedTier.label || `${appliedTier.numberOfDays} day pricing`,
      lineItems,
      explanation: [
        `Using ${appliedTier.numberOfDays}-day pricing tier`,
        `Base price: ${formatPrice(basePrice, { currency: options.currency || config.defaultCurrency })}`,
        ...(taxAmount > 0 ? [`Tax: ${formatPrice(taxAmount, { currency: options.currency || config.defaultCurrency })}`] : []),
        `Total: ${formatPrice(totalPrice, { currency: options.currency || config.defaultCurrency })}`,
      ],
    };

    // Calculate savings compared to single-day pricing
    const singleDayTier = pricingTiers.find(t => t.numberOfDays === 1);
    if (singleDayTier && dayCount > 1) {
      const singleDayTotal = singleDayTier.price * dayCount;
      if (options.includeTax) {
        const taxRate = options.taxRate ?? config.defaultTaxRate;
        const singleDayTotalWithTax = singleDayTotal * (1 + taxRate);
        breakdown.savings = singleDayTotalWithTax - totalPrice;
      } else {
        breakdown.savings = singleDayTotal - totalPrice;
      }

      if (breakdown.savings > 0) {
        breakdown.explanation.push(`Savings vs ${dayCount} individual days: ${formatPrice(breakdown.savings, { currency: options.currency || config.defaultCurrency })}`);
      }
    }

    return {
      totalPrice,
      basePrice,
      appliedTier,
      taxAmount: taxAmount > 0 ? taxAmount : undefined,
      dayCount,
      pricePerDay,
      isConsecutive: options.requireConsecutiveDays ?? false,
      formattedPrice: formatPrice(totalPrice, {
        currency: options.currency || config.defaultCurrency,
      }),
      breakdown,
    };
  } catch (error) {
    if (error instanceof PricingError) {
      throw error;
    }
    throw new PricingError('calculation_error', `Price calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`, { originalError: error });
  }
}

/**
 * Find the best pricing tier for a given number of days.
 *
 * Uses a smart matching algorithm that prefers exact matches but falls back
 * to the next higher tier if no exact match is found.
 *
 * @param dayCount - Number of days to find pricing for
 * @param tiers - Available pricing tiers
 * @returns Best matching pricing tier or null if none suitable
 * 
 * @example
 * ```typescript
 * const tier = findBestPriceTier(3, [
 *   { numberOfDays: 1, price: 75 },
 *   { numberOfDays: 5, price: 300 },
 * ]);
 * // Returns 5-day tier since no 3-day tier exists
 * ```
 */
export function findBestPriceTier(dayCount: number, tiers: PricingTier[]): PricingTier | null {
  if (!Array.isArray(tiers) || tiers.length === 0) {
    return null;
  }

  if (dayCount <= 0) {
    return null;
  }

  // Sort tiers by number of days (ascending)
  const sortedTiers = [...tiers].sort((a, b) => a.numberOfDays - b.numberOfDays);

  // First, try to find an exact match
  const exactMatch = sortedTiers.find(tier => tier.numberOfDays === dayCount);
  if (exactMatch) {
    return exactMatch;
  }

  // If no exact match, find the next higher tier
  const higherTier = sortedTiers.find(tier => tier.numberOfDays > dayCount);
  if (higherTier) {
    return higherTier;
  }

  // If no higher tier exists, use the highest available tier
  // This allows customers to book more days than the highest tier covers
  return sortedTiers[sortedTiers.length - 1];
}

/**
 * Generate pricing optimization suggestions for better value.
 *
 * Analyzes pricing tiers to suggest alternative day counts that might
 * provide better value for money.
 *
 * @param currentDayCount - Current number of days selected
 * @param tiers - Available pricing tiers
 * @param config - Pricing configuration for suggestion thresholds
 * @returns Array of pricing suggestions sorted by potential savings
 * 
 * @example
 * ```typescript
 * const suggestions = getSuggestedPricing(3, pricingTiers);
 * // Returns suggestions like "Add 2 more days and save $50"
 * ```
 */
export function getSuggestedPricing(
  currentDayCount: number,
  tiers: PricingTier[],
  config: PricingConfig = DEFAULT_PRICING_CONFIG
): PricingSuggestion[] {
  if (!config.enableSuggestions || tiers.length === 0 || currentDayCount <= 0) {
    return [];
  }

  const suggestions: PricingSuggestion[] = [];
  
  try {
    // Calculate current pricing
    const currentResult = calculateReservationPrice(currentDayCount, tiers, {}, config);
    const currentPricePerDay = currentResult.pricePerDay;

    // Check each available tier for potential savings
    for (const tier of tiers) {
      if (tier.numberOfDays === currentDayCount) {
        continue; // Skip current selection
      }

      const tierResult = calculateReservationPrice(tier.numberOfDays, tiers, {}, config);
      const tierPricePerDay = tierResult.pricePerDay;

      // Calculate potential savings
      let savings = 0;
      let suggestedPrice = 0;
      let message = '';

      if (tier.numberOfDays > currentDayCount) {
        // Suggestion to add more days
        const additionalDays = tier.numberOfDays - currentDayCount;
        const projectedCurrentTotal = currentPricePerDay * tier.numberOfDays;
        savings = projectedCurrentTotal - tierResult.totalPrice;
        suggestedPrice = tierResult.totalPrice;

        if (savings >= config.minSuggestedSavings) {
          message = `Add ${additionalDays} more day${additionalDays > 1 ? 's' : ''} and save ${formatPrice(savings, { currency: config.defaultCurrency })}`;
          
          suggestions.push({
            type: 'add_days',
            suggestedDays: tier.numberOfDays,
            currentPrice: currentResult.totalPrice,
            suggestedPrice,
            savings,
            message,
            priority: savings > config.minSuggestedSavings * 2 ? 'high' : 'medium',
            details: `${tier.numberOfDays}-day package offers better value per day`,
          });
        }
      } else {
        // Suggestion to reduce days (if it saves money per day)
        if (tierPricePerDay < currentPricePerDay) {
          const fewerDays = currentDayCount - tier.numberOfDays;
          savings = currentResult.totalPrice - tierResult.totalPrice;
          suggestedPrice = tierResult.totalPrice;

          if (savings >= config.minSuggestedSavings) {
            message = `Consider ${tier.numberOfDays} day${tier.numberOfDays > 1 ? 's' : ''} instead and save ${formatPrice(savings, { currency: config.defaultCurrency })}`;
            
            suggestions.push({
              type: 'remove_days',
              suggestedDays: tier.numberOfDays,
              currentPrice: currentResult.totalPrice,
              suggestedPrice,
              savings,
              message,
              priority: 'low',
              details: `${tier.numberOfDays}-day option provides good value`,
            });
          }
        }
      }
    }

    // Sort by savings (descending) and limit to max suggestions
    return suggestions
      .sort((a, b) => b.savings - a.savings)
      .slice(0, config.maxSuggestions);

  } catch (error) {
    // If suggestion generation fails, return empty array rather than throwing
    console.warn('[PRICING] Failed to generate pricing suggestions:', error);
    return [];
  }
}

/**
 * Compare pricing across multiple day count options.
 *
 * Useful for displaying pricing tables or helping customers choose
 * the best option for their needs.
 *
 * @param dayCounts - Array of day counts to compare
 * @param tiers - Available pricing tiers
 * @param options - Pricing calculation options
 * @returns Array of price comparisons with recommendations
 * 
 * @example
 * ```typescript
 * const comparisons = comparePricingOptions([1, 3, 5, 7], pricingTiers);
 * // Returns pricing breakdown for each option with best value highlighted
 * ```
 */
export function comparePricingOptions(
  dayCounts: number[],
  tiers: PricingTier[],
  options: PricingOptions = {}
): PriceComparison[] {
  if (dayCounts.length === 0 || tiers.length === 0) {
    return [];
  }

  const comparisons: PriceComparison[] = [];

  for (const dayCount of dayCounts) {
    try {
      const result = calculateReservationPrice(dayCount, tiers, options);
      
      comparisons.push({
        option: `${dayCount} day${dayCount > 1 ? 's' : ''}`,
        price: result.totalPrice,
        savings: 0, // Will be calculated below
        isRecommended: false, // Will be determined below
        notes: [
          `${result.formattedPrice} total`,
          `${formatPrice(result.pricePerDay, { currency: options.currency || 'USD' })} per day`,
        ],
      });
    } catch (error) {
      // Skip options that can't be calculated
      console.warn(`[PRICING] Could not calculate pricing for ${dayCount} days:`, error);
    }
  }

  if (comparisons.length === 0) {
    return [];
  }

  // Find the best value (lowest price per day)
  const bestValuePerDay = Math.min(...comparisons.map(c => c.price / parseInt(c.option)));
  const bestOption = comparisons.find(c => c.price / parseInt(c.option) === bestValuePerDay);
  
  if (bestOption) {
    bestOption.isRecommended = true;
    bestOption.notes?.push('Best value per day');
  }

  // Calculate savings compared to the most expensive option
  const maxPrice = Math.max(...comparisons.map(c => c.price));
  comparisons.forEach(comparison => {
    comparison.savings = maxPrice - comparison.price;
  });

  return comparisons.sort((a, b) => parseInt(a.option) - parseInt(b.option));
}

/**
 * Round price according to specified strategy.
 *
 * @param price - Price to round
 * @param strategy - Rounding strategy to use
 * @returns Rounded price
 */
function roundPrice(price: number, strategy: string): number {
  switch (strategy) {
    case 'nearest_dollar':
      return Math.round(price);
    case 'nearest_quarter':
      return Math.round(price * 4) / 4;
    case 'up':
      return Math.ceil(price);
    case 'down':
      return Math.floor(price);
    case 'none':
    default:
      return price;
  }
}

/**
 * Format price for display with proper currency formatting.
 *
 * @param price - Price to format
 * @param options - Formatting options
 * @returns Formatted price string
 * 
 * @example
 * ```typescript
 * formatPrice(123.45, { currency: 'USD' }); // "$123.45"
 * formatPrice(123.45, { currency: 'EUR', locale: 'de-DE' }); // "123,45 €"
 * ```
 */
export function formatPrice(
  price: number,
  options: PriceFormatOptions = { currency: 'USD' }
): string {
  const {
    currency = 'USD',
    locale = 'en-US',
    showSymbol = true,
    decimalPlaces = 2,
  } = options;

  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: showSymbol ? 'currency' : 'decimal',
      currency: showSymbol ? currency : undefined,
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    });

    return formatter.format(price);
  } catch (error) {
    // Fallback to simple formatting if Intl fails
    console.warn('[PRICING] Price formatting failed, using fallback:', error);
    const symbol = showSymbol ? '$' : '';
    return `${symbol}${price.toFixed(decimalPlaces)}`;
  }
}

/**
 * Validate pricing tier configuration for consistency and completeness.
 *
 * Checks for common issues like duplicate day counts, gaps in pricing,
 * or inconsistent pricing strategies.
 *
 * @param tiers - Pricing tiers to validate
 * @returns Validation result with any issues found
 * 
 * @example
 * ```typescript
 * const validation = validatePricingTiers(tiers);
 * if (!validation.isValid) {
 *   console.log('Issues found:', validation.issues);
 * }
 * ```
 */
export function validatePricingTiers(tiers: PricingTier[]): {
  isValid: boolean;
  issues: string[];
  warnings: string[];
} {
  const issues: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(tiers)) {
    issues.push('Pricing tiers must be an array');
    return { isValid: false, issues, warnings };
  }

  if (tiers.length === 0) {
    issues.push('At least one pricing tier is required');
    return { isValid: false, issues, warnings };
  }

  // Check for duplicate day counts
  const dayCounts = tiers.map(t => t.numberOfDays);
  const uniqueDayCounts = new Set(dayCounts);
  if (dayCounts.length !== uniqueDayCounts.size) {
    issues.push('Duplicate day counts found in pricing tiers');
  }

  // Check for invalid prices or day counts
  for (let i = 0; i < tiers.length; i++) {
    const tier = tiers[i];
    if (tier.numberOfDays <= 0) {
      issues.push(`Tier ${i + 1}: numberOfDays must be positive`);
    }
    if (tier.price <= 0) {
      issues.push(`Tier ${i + 1}: price must be positive`);
    }
  }

  // Check pricing strategy consistency (price per day should generally decrease with more days)
  const sortedTiers = [...tiers].sort((a, b) => a.numberOfDays - b.numberOfDays);
  for (let i = 1; i < sortedTiers.length; i++) {
    const currentTier = sortedTiers[i];
    const previousTier = sortedTiers[i - 1];
    
    const currentPricePerDay = currentTier.price / currentTier.numberOfDays;
    const previousPricePerDay = previousTier.price / previousTier.numberOfDays;
    
    if (currentPricePerDay > previousPricePerDay) {
      warnings.push(`${currentTier.numberOfDays}-day tier has higher price per day than ${previousTier.numberOfDays}-day tier`);
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
  };
}