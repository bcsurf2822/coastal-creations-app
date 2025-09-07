/**
 * @fileoverview Utility functions for pricing calculations and formatting
 * @module lib/pricing/utils
 */

import type { PricingTier } from "../validations/reservationValidation";
import type { PricingConfig } from "./types";
import { DEFAULT_PRICING_CONFIG } from "./types";
import { formatPrice } from "./calculations";

/**
 * Create a pricing tier with default values.
 *
 * @param numberOfDays - Number of days for this tier
 * @param price - Price for this tier
 * @param label - Optional label for display
 * @returns Complete pricing tier object
 *
 * @example
 * ```typescript
 * const tier = createPricingTier(5, 300, 'Weekly Rate');
 * ```
 */
export function createPricingTier(
  numberOfDays: number,
  price: number,
  label?: string
): PricingTier {
  return {
    numberOfDays,
    price,
    label: label || `${numberOfDays} Day${numberOfDays > 1 ? "s" : ""}`,
  };
}

/**
 * Generate a complete set of pricing tiers based on a base daily rate.
 *
 * Creates tiers with progressive discounts for longer stays.
 *
 * @param baseDailyRate - Base price per day
 * @param maxDays - Maximum number of days to generate tiers for
 * @param discountStrategy - How to calculate discounts for longer stays
 * @returns Array of pricing tiers
 *
 * @example
 * ```typescript
 * const tiers = generatePricingTiers(75, 7, 'progressive');
 * // Creates: 1 day ($75), 2 days ($140), 3 days ($200), etc.
 * ```
 */
export function generatePricingTiers(
  baseDailyRate: number,
  maxDays: number,
  discountStrategy: "none" | "linear" | "progressive" | "bulk" = "progressive"
): PricingTier[] {
  if (baseDailyRate <= 0 || maxDays <= 0) {
    throw new Error("Base daily rate and max days must be positive numbers");
  }

  const tiers: PricingTier[] = [];

  for (let days = 1; days <= maxDays; days++) {
    let price = baseDailyRate * days;

    // Apply discount strategy
    switch (discountStrategy) {
      case "none":
        // No discount, straight multiplication
        break;

      case "linear":
        // Linear discount: 5% off per additional day after first
        if (days > 1) {
          const discountPercent = (days - 1) * 0.05;
          price = price * (1 - Math.min(discountPercent, 0.5)); // Max 50% discount
        }
        break;

      case "progressive":
        // Progressive discount: increasing discount for longer stays
        if (days >= 2) {
          const discountPercent = Math.min(0.1 + (days - 2) * 0.03, 0.4); // 10% + 3% per day, max 40%
          price = price * (1 - discountPercent);
        }
        break;

      case "bulk":
        // Bulk discount: discount thresholds
        if (days >= 7) {
          price = price * 0.7; // 30% off for week+
        } else if (days >= 5) {
          price = price * 0.8; // 20% off for 5+ days
        } else if (days >= 3) {
          price = price * 0.9; // 10% off for 3+ days
        }
        break;
    }

    // Round to nearest dollar
    price = Math.round(price);

    tiers.push(createPricingTier(days, price));
  }

  return tiers;
}

/**
 * Calculate the best value pricing tier from a set of tiers.
 *
 * @param tiers - Pricing tiers to analyze
 * @param preferredDays - Optional preferred number of days for weighting
 * @returns Tier with the best price per day ratio
 *
 * @example
 * ```typescript
 * const bestValue = findBestValueTier(pricingTiers);
 * console.log(`Best value: ${bestValue.numberOfDays} days at ${bestValue.pricePerDay}/day`);
 * ```
 */
export function findBestValueTier(
  tiers: PricingTier[],
  preferredDays?: number
): (PricingTier & { pricePerDay: number }) | null {
  if (tiers.length === 0) return null;

  const tiersWithPricePerDay = tiers.map((tier) => ({
    ...tier,
    pricePerDay: tier.price / tier.numberOfDays,
  }));

  // If preferred days specified, weight towards that
  if (preferredDays) {
    return tiersWithPricePerDay.reduce((best, current) => {
      const bestScore =
        best.pricePerDay + Math.abs(best.numberOfDays - preferredDays) * 2;
      const currentScore =
        current.pricePerDay +
        Math.abs(current.numberOfDays - preferredDays) * 2;
      return currentScore < bestScore ? current : best;
    });
  }

  // Otherwise, just find lowest price per day
  return tiersWithPricePerDay.reduce((best, current) =>
    current.pricePerDay < best.pricePerDay ? current : best
  );
}

/**
 * Calculate discount percentage between two prices.
 *
 * @param originalPrice - Original price
 * @param discountedPrice - Discounted price
 * @returns Discount percentage (0-1)
 *
 * @example
 * ```typescript
 * const discount = calculateDiscountPercentage(100, 80); // 0.2 (20%)
 * ```
 */
export function calculateDiscountPercentage(
  originalPrice: number,
  discountedPrice: number
): number {
  if (originalPrice <= 0) return 0;
  return Math.max(0, (originalPrice - discountedPrice) / originalPrice);
}

/**
 * Format discount percentage for display.
 *
 * @param discountPercent - Discount as decimal (0.2 for 20%)
 * @param includePercent - Whether to include % symbol
 * @returns Formatted discount string
 *
 * @example
 * ```typescript
 * formatDiscountPercentage(0.15); // "15%"
 * formatDiscountPercentage(0.15, false); // "15"
 * ```
 */
export function formatDiscountPercentage(
  discountPercent: number,
  includePercent: boolean = true
): string {
  const percent = Math.round(discountPercent * 100);
  return `${percent}${includePercent ? "%" : ""}`;
}

/**
 * Create a pricing summary for display purposes.
 *
 * @param tiers - Pricing tiers to summarize
 * @param config - Pricing configuration
 * @returns Human-readable pricing summary
 *
 * @example
 * ```typescript
 * const summary = createPricingSummary(tiers);
 * // "1 day: $75, 3 days: $200 (save 11%), 7 days: $400 (save 23%)"
 * ```
 */
export function createPricingSummary(
  tiers: PricingTier[],
  config: PricingConfig = DEFAULT_PRICING_CONFIG
): string {
  if (tiers.length === 0) return "No pricing available";

  const sortedTiers = [...tiers].sort(
    (a, b) => a.numberOfDays - b.numberOfDays
  );
  const baseTier = sortedTiers[0];
  const basePricePerDay = baseTier.price / baseTier.numberOfDays;

  const summaryParts = sortedTiers.map((tier) => {
    const priceStr = formatPrice(tier.price, {
      currency: config.defaultCurrency,
    });
    const dayStr = `${tier.numberOfDays} day${tier.numberOfDays > 1 ? "s" : ""}`;

    // Calculate savings vs base daily rate
    const expectedPrice = basePricePerDay * tier.numberOfDays;
    const savings = expectedPrice - tier.price;

    if (savings > 5 && tier.numberOfDays > 1) {
      const savingsPercent = formatDiscountPercentage(savings / expectedPrice);
      return `${dayStr}: ${priceStr} (save ${savingsPercent})`;
    } else {
      return `${dayStr}: ${priceStr}`;
    }
  });

  return summaryParts.join(", ");
}

/**
 * Check if a day count qualifies for any pricing tiers.
 *
 * @param dayCount - Number of days to check
 * @param tiers - Available pricing tiers
 * @returns Whether pricing is available for this day count
 *
 * @example
 * ```typescript
 * const canPrice = canPriceDayCount(3, pricingTiers); // true/false
 * ```
 */
export function canPriceDayCount(
  dayCount: number,
  tiers: PricingTier[]
): boolean {
  if (dayCount <= 0 || tiers.length === 0) return false;

  // Can price if there's an exact match or a higher tier available
  const sortedTiers = [...tiers].sort(
    (a, b) => a.numberOfDays - b.numberOfDays
  );
  return sortedTiers.some((tier) => tier.numberOfDays >= dayCount);
}

/**
 * Get pricing tier coverage - which day counts can be priced.
 *
 * @param tiers - Available pricing tiers
 * @param maxDays - Maximum days to check coverage for
 * @returns Object with coverage information
 *
 * @example
 * ```typescript
 * const coverage = getPricingCoverage(tiers, 10);
 * // { coveredDays: [1,2,3,4,5,6,7], gaps: [8,9,10], coveragePercent: 70 }
 * ```
 */
export function getPricingCoverage(
  tiers: PricingTier[],
  maxDays: number = 30
): {
  coveredDays: number[];
  gaps: number[];
  coveragePercent: number;
  highestTier: number;
} {
  const coveredDays: number[] = [];
  const gaps: number[] = [];

  if (tiers.length === 0) {
    return {
      coveredDays: [],
      gaps: Array.from({ length: maxDays }, (_, i) => i + 1),
      coveragePercent: 0,
      highestTier: 0,
    };
  }

  const highestTier = Math.max(...tiers.map((t) => t.numberOfDays));

  for (let day = 1; day <= maxDays; day++) {
    if (canPriceDayCount(day, tiers)) {
      coveredDays.push(day);
    } else {
      gaps.push(day);
    }
  }

  const coveragePercent = Math.round((coveredDays.length / maxDays) * 100);

  return {
    coveredDays,
    gaps,
    coveragePercent,
    highestTier,
  };
}

/**
 * Merge multiple pricing tier arrays, removing duplicates and conflicts.
 *
 * @param tierArrays - Arrays of pricing tiers to merge
 * @param conflictResolution - How to resolve conflicts ('higher_price' | 'lower_price' | 'error')
 * @returns Merged pricing tiers
 *
 * @example
 * ```typescript
 * const merged = mergePricingTiers([baseTiers, seasonalTiers], 'higher_price');
 * ```
 */
export function mergePricingTiers(
  tierArrays: PricingTier[][],
  conflictResolution: "higher_price" | "lower_price" | "error" = "error"
): PricingTier[] {
  const tierMap = new Map<number, PricingTier>();

  for (const tiers of tierArrays) {
    for (const tier of tiers) {
      const existing = tierMap.get(tier.numberOfDays);

      if (existing) {
        if (conflictResolution === "error") {
          throw new Error(
            `Conflicting pricing tiers for ${tier.numberOfDays} days`
          );
        } else if (
          conflictResolution === "higher_price" &&
          tier.price > existing.price
        ) {
          tierMap.set(tier.numberOfDays, tier);
        } else if (
          conflictResolution === "lower_price" &&
          tier.price < existing.price
        ) {
          tierMap.set(tier.numberOfDays, tier);
        }
      } else {
        tierMap.set(tier.numberOfDays, tier);
      }
    }
  }

  return Array.from(tierMap.values()).sort(
    (a, b) => a.numberOfDays - b.numberOfDays
  );
}

/**
 * Convert pricing tiers to a lookup table for fast access.
 *
 * @param tiers - Pricing tiers to convert
 * @returns Map from day count to pricing tier
 *
 * @example
 * ```typescript
 * const lookup = createPricingLookup(tiers);
 * const price = lookup.get(3)?.price; // Quick price lookup
 * ```
 */
export function createPricingLookup(
  tiers: PricingTier[]
): Map<number, PricingTier> {
  const lookup = new Map<number, PricingTier>();

  for (const tier of tiers) {
    lookup.set(tier.numberOfDays, tier);
  }

  return lookup;
}

/**
 * Validate pricing tier price consistency and suggest improvements.
 *
 * @param tiers - Pricing tiers to analyze
 * @returns Analysis with suggestions for improvement
 *
 * @example
 * ```typescript
 * const analysis = analyzePricingStrategy(tiers);
 * console.log(analysis.suggestions); // Array of improvement suggestions
 * ```
 */
export function analyzePricingStrategy(tiers: PricingTier[]): {
  isOptimal: boolean;
  issues: string[];
  suggestions: string[];
  metrics: {
    averageDiscountPercent: number;
    maxDiscountPercent: number;
    priceRangeRatio: number;
    valueConsistency: number;
  };
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  if (tiers.length === 0) {
    return {
      isOptimal: false,
      issues: ["No pricing tiers provided"],
      suggestions: ["Add at least one pricing tier"],
      metrics: {
        averageDiscountPercent: 0,
        maxDiscountPercent: 0,
        priceRangeRatio: 0,
        valueConsistency: 0,
      },
    };
  }

  const sortedTiers = [...tiers].sort(
    (a, b) => a.numberOfDays - b.numberOfDays
  );
  const baseTier = sortedTiers[0];
  const basePricePerDay = baseTier.price / baseTier.numberOfDays;

  let totalDiscount = 0;
  let maxDiscount = 0;
  let valueInconsistencies = 0;

  // Analyze each tier
  for (let i = 0; i < sortedTiers.length; i++) {
    const tier = sortedTiers[i];
    const pricePerDay = tier.price / tier.numberOfDays;
    const expectedPrice = basePricePerDay * tier.numberOfDays;
    const discount = (expectedPrice - tier.price) / expectedPrice;

    totalDiscount += discount;
    maxDiscount = Math.max(maxDiscount, discount);

    // Check for value inconsistencies
    if (i > 0) {
      const prevTier = sortedTiers[i - 1];
      const prevPricePerDay = prevTier.price / prevTier.numberOfDays;

      if (pricePerDay > prevPricePerDay) {
        valueInconsistencies++;
        issues.push(
          `${tier.numberOfDays}-day tier has higher price per day than ${prevTier.numberOfDays}-day tier`
        );
      }
    }

    // Check for reasonable discount progression
    if (i > 0 && discount < 0.02 && tier.numberOfDays > 2) {
      suggestions.push(
        `Consider increasing discount for ${tier.numberOfDays}-day tier to provide better value`
      );
    }
  }

  const averageDiscountPercent = totalDiscount / sortedTiers.length;
  const priceRangeRatio =
    sortedTiers[sortedTiers.length - 1].price / baseTier.price;
  const valueConsistency =
    1 - valueInconsistencies / Math.max(1, sortedTiers.length - 1);

  // Generate overall suggestions
  if (averageDiscountPercent < 0.05) {
    suggestions.push(
      "Consider offering higher discounts for longer stays to encourage larger bookings"
    );
  }

  if (maxDiscount > 0.5) {
    suggestions.push(
      "Very high discount tiers may devalue your service - consider reducing maximum discount"
    );
  }

  if (valueConsistency < 0.8) {
    suggestions.push(
      "Pricing structure has inconsistencies - longer stays should generally offer better per-day value"
    );
  }

  return {
    isOptimal: issues.length === 0 && valueConsistency > 0.8,
    issues,
    suggestions,
    metrics: {
      averageDiscountPercent,
      maxDiscountPercent: maxDiscount,
      priceRangeRatio,
      valueConsistency,
    },
  };
}
