/**
 * @fileoverview Tests for pricing calculation functions
 * @module lib/pricing/__tests__/calculations.test
 */

import { describe, it, expect } from 'vitest';
import {
  calculateReservationPrice,
  findBestPriceTier,
  getSuggestedPricing,
  comparePricingOptions,
  formatPrice,
  validatePricingTiers,
} from '../calculations';
import { PricingError, DEFAULT_PRICING_CONFIG } from '../types';
import type { PricingTier } from '../../validations/reservationValidation';

/**
 * Test data - standard pricing tiers for testing.
 */
const standardPricingTiers: PricingTier[] = [
  { numberOfDays: 1, price: 75, label: 'Single Day' },
  { numberOfDays: 3, price: 200, label: 'Three Days' },
  { numberOfDays: 5, price: 300, label: 'Five Days' },
  { numberOfDays: 7, price: 400, label: 'Full Week' },
];

/**
 * Test suite for calculateReservationPrice function.
 *
 * Tests the core pricing calculation logic including edge cases,
 * error handling, and various pricing scenarios.
 */
describe('calculateReservationPrice', () => {
  
  /**
   * Test exact tier matching.
   */
  it('should calculate price for exact tier match', () => {
    const result = calculateReservationPrice(3, standardPricingTiers);

    expect(result.totalPrice).toBe(200);
    expect(result.basePrice).toBe(200);
    expect(result.dayCount).toBe(3);
    expect(result.pricePerDay).toBe(200 / 3);
    expect(result.appliedTier).toEqual(standardPricingTiers[1]);
    expect(result.formattedPrice).toBe('$200.00');
    expect(result.breakdown.tierDescription).toBe('Three Days');
  });

  /**
   * Test tier fallback to next higher tier.
   */
  it('should use next higher tier when exact match not found', () => {
    const result = calculateReservationPrice(4, standardPricingTiers);

    expect(result.totalPrice).toBe(300); // Uses 5-day tier
    expect(result.appliedTier?.numberOfDays).toBe(5);
    expect(result.dayCount).toBe(4);
    expect(result.pricePerDay).toBe(300 / 4);
  });

  /**
   * Test pricing with tax calculation.
   */
  it('should include tax when requested', () => {
    const result = calculateReservationPrice(3, standardPricingTiers, {
      includeTax: true,
      taxRate: 0.08,
    });

    expect(result.basePrice).toBe(200);
    expect(result.taxAmount).toBe(16); // 8% of 200
    expect(result.totalPrice).toBe(216);
    expect(result.breakdown.lineItems).toHaveLength(2);
    expect(result.breakdown.lineItems[1].type).toBe('tax');
    expect(result.breakdown.lineItems[1].totalPrice).toBe(16);
  });

  /**
   * Test price rounding functionality.
   */
  it('should round prices when requested', () => {
    const result = calculateReservationPrice(3, standardPricingTiers, {
      includeTax: true,
      taxRate: 0.075, // Creates 215.00 total
      roundPrices: true,
    });

    expect(result.totalPrice).toBe(215); // Rounded to nearest dollar
  });

  /**
   * Test savings calculation against single-day pricing.
   */
  it('should calculate savings compared to single-day pricing', () => {
    const result = calculateReservationPrice(3, standardPricingTiers);

    const expectedSingleDayTotal = 75 * 3; // 225
    const expectedSavings = expectedSingleDayTotal - 200; // 25

    expect(result.breakdown.savings).toBe(expectedSavings);
    expect(result.breakdown.explanation).toContain('Savings vs 3 individual days: $25.00');
  });

  /**
   * Test error handling for empty tiers array.
   */
  it('should throw error when no pricing tiers provided', () => {
    expect(() => {
      calculateReservationPrice(3, []);
    }).toThrow(PricingError);

    expect(() => {
      calculateReservationPrice(3, []);
    }).toThrow('No pricing tiers provided');
  });

  /**
   * Test error handling for invalid day count.
   */
  it('should throw error for invalid day count', () => {
    expect(() => {
      calculateReservationPrice(0, standardPricingTiers);
    }).toThrow(PricingError);

    expect(() => {
      calculateReservationPrice(-1, standardPricingTiers);
    }).toThrow('Invalid day count');

    expect(() => {
      calculateReservationPrice(1.5, standardPricingTiers);
    }).toThrow('Invalid day count');
  });

  /**
   * Test highest tier fallback for very long stays.
   */
  it('should use highest tier for day counts exceeding all tiers', () => {
    const result = calculateReservationPrice(10, standardPricingTiers);

    expect(result.appliedTier?.numberOfDays).toBe(7); // Highest tier
    expect(result.totalPrice).toBe(400);
    expect(result.dayCount).toBe(10);
    expect(result.pricePerDay).toBe(40); // 400 / 10
  });

  /**
   * Test custom pricing configuration.
   */
  it('should use custom pricing configuration', () => {
    const customConfig = {
      ...DEFAULT_PRICING_CONFIG,
      defaultCurrency: 'EUR',
      roundingStrategy: 'up' as const,
    };

    const result = calculateReservationPrice(
      3,
      standardPricingTiers,
      { includeTax: true, taxRate: 0.075 },
      customConfig
    );

    expect(result.totalPrice).toBe(216); // Rounded up from 215
    expect(result.formattedPrice).toContain('€'); // EUR currency
  });
});

/**
 * Test suite for findBestPriceTier function.
 *
 * Tests the tier selection logic for various scenarios.
 */
describe('findBestPriceTier', () => {

  /**
   * Test exact match selection.
   */
  it('should return exact match when available', () => {
    const tier = findBestPriceTier(3, standardPricingTiers);
    expect(tier?.numberOfDays).toBe(3);
    expect(tier?.price).toBe(200);
  });

  /**
   * Test next higher tier selection.
   */
  it('should return next higher tier when no exact match', () => {
    const tier = findBestPriceTier(4, standardPricingTiers);
    expect(tier?.numberOfDays).toBe(5);
    expect(tier?.price).toBe(300);
  });

  /**
   * Test highest tier fallback.
   */
  it('should return highest tier for very high day counts', () => {
    const tier = findBestPriceTier(15, standardPricingTiers);
    expect(tier?.numberOfDays).toBe(7);
    expect(tier?.price).toBe(400);
  });

  /**
   * Test null return for invalid inputs.
   */
  it('should return null for invalid inputs', () => {
    expect(findBestPriceTier(0, standardPricingTiers)).toBeNull();
    expect(findBestPriceTier(-1, standardPricingTiers)).toBeNull();
    expect(findBestPriceTier(3, [])).toBeNull();
  });

  /**
   * Test tier ordering independence.
   */
  it('should work with unsorted tiers', () => {
    const unsortedTiers = [
      { numberOfDays: 7, price: 400, label: 'Week' },
      { numberOfDays: 1, price: 75, label: 'Day' },
      { numberOfDays: 3, price: 200, label: 'Three Days' },
    ];

    const tier = findBestPriceTier(2, unsortedTiers);
    expect(tier?.numberOfDays).toBe(3); // Should find next higher (3 days)
  });
});

/**
 * Test suite for getSuggestedPricing function.
 *
 * Tests pricing optimization suggestions.
 */
describe('getSuggestedPricing', () => {

  /**
   * Test suggestion generation for adding days.
   */
  it('should suggest adding days for better value', () => {
    const suggestions = getSuggestedPricing(2, standardPricingTiers);

    expect(suggestions.length).toBeGreaterThan(0);
    
    const addDaysSuggestion = suggestions.find(s => s.type === 'add_days');
    expect(addDaysSuggestion).toBeDefined();
    expect(addDaysSuggestion?.suggestedDays).toBeGreaterThan(2);
    expect(addDaysSuggestion?.savings).toBeGreaterThan(0);
    expect(addDaysSuggestion?.message).toContain('Add');
  });

  /**
   * Test no suggestions when already optimal.
   */
  it('should return fewer suggestions for already optimal choices', () => {
    // 7-day tier is likely already optimal
    const suggestions = getSuggestedPricing(7, standardPricingTiers);
    
    // Should have fewer or no suggestions for removing days
    const removeDaysSuggestions = suggestions.filter(s => s.type === 'remove_days');
    expect(removeDaysSuggestions.length).toBeLessThanOrEqual(1);
  });

  /**
   * Test suggestion filtering by minimum savings.
   */
  it('should filter suggestions by minimum savings threshold', () => {
    const configWithHighThreshold = {
      ...DEFAULT_PRICING_CONFIG,
      minSuggestedSavings: 50.00,
    };

    const suggestions = getSuggestedPricing(2, standardPricingTiers, configWithHighThreshold);
    
    // All suggestions should meet the threshold
    suggestions.forEach(suggestion => {
      expect(suggestion.savings).toBeGreaterThanOrEqual(50);
    });
  });

  /**
   * Test suggestion limit enforcement.
   */
  it('should limit number of suggestions returned', () => {
    const configWithLimit = {
      ...DEFAULT_PRICING_CONFIG,
      maxSuggestions: 2,
    };

    const suggestions = getSuggestedPricing(2, standardPricingTiers, configWithLimit);
    expect(suggestions.length).toBeLessThanOrEqual(2);
  });

  /**
   * Test disabled suggestions.
   */
  it('should return empty array when suggestions disabled', () => {
    const configWithDisabledSuggestions = {
      ...DEFAULT_PRICING_CONFIG,
      enableSuggestions: false,
    };

    const suggestions = getSuggestedPricing(2, standardPricingTiers, configWithDisabledSuggestions);
    expect(suggestions).toEqual([]);
  });
});

/**
 * Test suite for comparePricingOptions function.
 *
 * Tests pricing comparison across multiple options.
 */
describe('comparePricingOptions', () => {

  /**
   * Test basic price comparison.
   */
  it('should compare pricing across multiple day counts', () => {
    const comparisons = comparePricingOptions([1, 3, 5, 7], standardPricingTiers);

    expect(comparisons).toHaveLength(4);
    expect(comparisons[0].option).toBe('1 day');
    expect(comparisons[0].price).toBe(75);
    expect(comparisons[1].option).toBe('3 days');
    expect(comparisons[1].price).toBe(200);
  });

  /**
   * Test best value recommendation.
   */
  it('should identify best value option', () => {
    const comparisons = comparePricingOptions([1, 3, 5, 7], standardPricingTiers);

    const recommendedOptions = comparisons.filter(c => c.isRecommended);
    expect(recommendedOptions).toHaveLength(1);

    // Should recommend the option with best price per day
    const recommended = recommendedOptions[0];
    const pricePerDay = recommended.price / parseInt(recommended.option);
    
    // Verify this is indeed the best value
    const allPricesPerDay = comparisons.map(c => c.price / parseInt(c.option));
    expect(pricePerDay).toBe(Math.min(...allPricesPerDay));
  });

  /**
   * Test savings calculation.
   */
  it('should calculate savings compared to most expensive option', () => {
    const comparisons = comparePricingOptions([1, 3, 5], standardPricingTiers);

    const maxPrice = Math.max(...comparisons.map(c => c.price));
    
    comparisons.forEach(comparison => {
      expect(comparison.savings).toBe(maxPrice - comparison.price);
    });
  });

  /**
   * Test empty input handling.
   */
  it('should handle empty inputs gracefully', () => {
    expect(comparePricingOptions([], standardPricingTiers)).toEqual([]);
    expect(comparePricingOptions([1, 3], [])).toEqual([]);
  });
});

/**
 * Test suite for formatPrice function.
 *
 * Tests price formatting with various options.
 */
describe('formatPrice', () => {

  /**
   * Test basic USD formatting.
   */
  it('should format USD prices correctly', () => {
    expect(formatPrice(123.45)).toBe('$123.45');
    expect(formatPrice(123)).toBe('$123.00');
    expect(formatPrice(0)).toBe('$0.00');
  });

  /**
   * Test different currency formatting.
   */
  it('should format different currencies', () => {
    const eurPrice = formatPrice(123.45, { currency: 'EUR', locale: 'en-US' });
    expect(eurPrice).toContain('123.45');
    expect(eurPrice).toContain('€');
  });

  /**
   * Test without currency symbol.
   */
  it('should format without currency symbol when requested', () => {
    const formatted = formatPrice(123.45, { currency: 'USD', showSymbol: false });
    expect(formatted).toBe('123.45');
    expect(formatted).not.toContain('$');
  });

  /**
   * Test custom decimal places.
   */
  it('should respect custom decimal places', () => {
    expect(formatPrice(123.456, { currency: 'USD', decimalPlaces: 0 })).toBe('$123');
    expect(formatPrice(123.456, { currency: 'USD', decimalPlaces: 3 })).toBe('$123.456');
  });

  /**
   * Test fallback formatting for errors.
   */
  it('should fallback gracefully when formatting fails', () => {
    // Force an error by using invalid locale
    const result = formatPrice(123.45, { 
      currency: 'USD', 
      locale: 'invalid-locale' as any 
    });
    
    // Should still return a formatted string (fallback)
    expect(typeof result).toBe('string');
    expect(result).toContain('123.45');
  });
});

/**
 * Test suite for validatePricingTiers function.
 *
 * Tests validation of pricing tier configurations.
 */
describe('validatePricingTiers', () => {

  /**
   * Test validation of valid tiers.
   */
  it('should validate correct pricing tiers', () => {
    const result = validatePricingTiers(standardPricingTiers);
    
    expect(result.isValid).toBe(true);
    expect(result.issues).toEqual([]);
  });

  /**
   * Test detection of duplicate day counts.
   */
  it('should detect duplicate day counts', () => {
    const duplicateTiers = [
      { numberOfDays: 1, price: 75 },
      { numberOfDays: 1, price: 80 }, // Duplicate
    ];

    const result = validatePricingTiers(duplicateTiers);
    
    expect(result.isValid).toBe(false);
    expect(result.issues).toContain('Duplicate day counts found in pricing tiers');
  });

  /**
   * Test detection of invalid values.
   */
  it('should detect invalid day counts and prices', () => {
    const invalidTiers = [
      { numberOfDays: 0, price: 75 }, // Invalid day count
      { numberOfDays: 3, price: -100 }, // Invalid price
    ];

    const result = validatePricingTiers(invalidTiers);
    
    expect(result.isValid).toBe(false);
    expect(result.issues).toContain('Tier 1: numberOfDays must be positive');
    expect(result.issues).toContain('Tier 2: price must be positive');
  });

  /**
   * Test warning for inconsistent pricing strategy.
   */
  it('should warn about inconsistent pricing strategies', () => {
    const inconsistentTiers = [
      { numberOfDays: 1, price: 75 },
      { numberOfDays: 3, price: 300 }, // Higher price per day than single day
    ];

    const result = validatePricingTiers(inconsistentTiers);
    
    // Should be valid but have warnings
    expect(result.isValid).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('higher price per day');
  });

  /**
   * Test empty array handling.
   */
  it('should handle empty pricing tiers', () => {
    const result = validatePricingTiers([]);
    
    expect(result.isValid).toBe(false);
    expect(result.issues).toContain('At least one pricing tier is required');
  });

  /**
   * Test non-array input handling.
   */
  it('should handle non-array input', () => {
    const result = validatePricingTiers(null as any);
    
    expect(result.isValid).toBe(false);
    expect(result.issues).toContain('Pricing tiers must be an array');
  });
});

/**
 * Test suite for edge cases and error scenarios.
 *
 * Tests various edge cases and error conditions.
 */
describe('Edge Cases and Error Handling', () => {

  /**
   * Test very large day counts.
   */
  it('should handle very large day counts', () => {
    const result = calculateReservationPrice(365, standardPricingTiers);
    
    expect(result.totalPrice).toBe(400); // Uses highest tier
    expect(result.dayCount).toBe(365);
    expect(result.pricePerDay).toBeCloseTo(400 / 365);
  });

  /**
   * Test single tier scenario.
   */
  it('should work with single pricing tier', () => {
    const singleTier = [{ numberOfDays: 1, price: 100 }];
    
    const result = calculateReservationPrice(5, singleTier);
    expect(result.totalPrice).toBe(100);
    expect(result.appliedTier).toEqual(singleTier[0]);
  });

  /**
   * Test extreme tax rates.
   */
  it('should handle extreme tax rates', () => {
    const highTaxResult = calculateReservationPrice(1, standardPricingTiers, {
      includeTax: true,
      taxRate: 0.5, // 50% tax
    });

    expect(highTaxResult.taxAmount).toBe(37.5);
    expect(highTaxResult.totalPrice).toBe(112.5);

    const zeroTaxResult = calculateReservationPrice(1, standardPricingTiers, {
      includeTax: true,
      taxRate: 0,
    });

    expect(zeroTaxResult.taxAmount).toBe(0);
    expect(zeroTaxResult.totalPrice).toBe(75);
  });

  /**
   * Test pricing with fractional cents.
   */
  it('should handle fractional pricing correctly', () => {
    const fractionalTiers = [
      { numberOfDays: 1, price: 33.33 },
      { numberOfDays: 3, price: 99.99 },
    ];

    const result = calculateReservationPrice(3, fractionalTiers, {
      includeTax: true,
      taxRate: 0.0825, // Creates fractional tax
    });

    expect(result.basePrice).toBe(99.99);
    expect(result.taxAmount).toBeCloseTo(8.25, 2);
    expect(result.totalPrice).toBeCloseTo(108.24, 2);
  });
});

/**
 * Performance test suite.
 *
 * Tests performance characteristics of pricing calculations.
 */
describe('Performance Tests', () => {

  /**
   * Test calculation speed with large tier arrays.
   */
  it('should calculate quickly with many tiers', () => {
    // Generate 100 pricing tiers
    const manyTiers = Array.from({ length: 100 }, (_, i) => ({
      numberOfDays: i + 1,
      price: (i + 1) * 50,
      label: `${i + 1} days`,
    }));

    const startTime = performance.now();
    const result = calculateReservationPrice(50, manyTiers);
    const endTime = performance.now();

    expect(result.totalPrice).toBe(2500);
    expect(endTime - startTime).toBeLessThan(10); // Should complete in under 10ms
  });

  /**
   * Test suggestion generation performance.
   */
  it('should generate suggestions quickly', () => {
    const manyTiers = Array.from({ length: 50 }, (_, i) => ({
      numberOfDays: i + 1,
      price: Math.round((i + 1) * 75 * (1 - i * 0.01)), // Progressive discount
    }));

    const startTime = performance.now();
    const suggestions = getSuggestedPricing(25, manyTiers);
    const endTime = performance.now();

    expect(suggestions.length).toBeGreaterThan(0);
    expect(endTime - startTime).toBeLessThan(50); // Should complete in under 50ms
  });
});