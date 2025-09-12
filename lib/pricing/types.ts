/**
 * @fileoverview Core pricing types and interfaces for multi-day reservation system
 * @module lib/pricing/types
 */

/**
 * Pricing tier interface for reservation events.
 */
export interface PricingTier {
  numberOfDays: number;
  price: number;
  label?: string;
}

/**
 * Options for pricing calculations with various configuration flags.
 */
export interface PricingOptions {
  /** Whether to require consecutive days for pricing calculations */
  requireConsecutiveDays?: boolean;
  /** Include taxes in pricing calculations */
  includeTax?: boolean;
  /** Tax rate to apply (percentage as decimal, e.g., 0.08 for 8%) */
  taxRate?: number;
  /** Maximum allowed discount percentage */
  maxDiscount?: number;
  /** Whether to round prices to nearest dollar */
  roundPrices?: boolean;
  /** Currency code for formatting */
  currency?: string;
}

/**
 * Result of pricing calculation with detailed breakdown.
 */
export interface PricingResult {
  /** Final calculated price */
  totalPrice: number;
  /** Base price before any adjustments */
  basePrice: number;
  /** Applied pricing tier that was used */
  appliedTier: PricingTier | null;
  /** Tax amount if applicable */
  taxAmount?: number;
  /** Discount amount if applicable */
  discountAmount?: number;
  /** Number of days this pricing covers */
  dayCount: number;
  /** Price per day calculation */
  pricePerDay: number;
  /** Whether this pricing required consecutive days */
  isConsecutive: boolean;
  /** Formatted price string for display */
  formattedPrice: string;
  /** Breakdown of how the price was calculated */
  breakdown: PriceBreakdown;
}

/**
 * Detailed breakdown of price calculation components.
 */
export interface PriceBreakdown {
  /** Description of the pricing tier used */
  tierDescription: string;
  /** Individual line items in the price calculation */
  lineItems: PriceLineItem[];
  /** Any savings compared to alternative pricing */
  savings?: number;
  /** Explanation of how the price was calculated */
  explanation: string[];
}

/**
 * Individual line item in price breakdown.
 */
export interface PriceLineItem {
  /** Description of this line item */
  description: string;
  /** Quantity for this line item */
  quantity: number;
  /** Unit price for this line item */
  unitPrice: number;
  /** Total price for this line item */
  totalPrice: number;
  /** Type of line item for categorization */
  type: 'base' | 'discount' | 'tax' | 'fee';
}

/**
 * Pricing optimization suggestion for better value.
 */
export interface PricingSuggestion {
  /** Type of suggestion */
  type: 'add_days' | 'remove_days' | 'different_tier' | 'consecutive_discount';
  /** Suggested number of days */
  suggestedDays: number;
  /** Current price for comparison */
  currentPrice: number;
  /** Suggested price */
  suggestedPrice: number;
  /** Amount that would be saved */
  savings: number;
  /** Human-readable message explaining the suggestion */
  message: string;
  /** Priority level of this suggestion */
  priority: 'high' | 'medium' | 'low';
  /** Additional details about the suggestion */
  details?: string;
}

/**
 * Configuration for pricing calculation engine.
 */
export interface PricingConfig {
  /** Default currency for price formatting */
  defaultCurrency: string;
  /** Default tax rate if not specified */
  defaultTaxRate: number;
  /** Whether to enable optimization suggestions */
  enableSuggestions: boolean;
  /** Maximum number of suggestions to return */
  maxSuggestions: number;
  /** Minimum savings required to show a suggestion */
  minSuggestedSavings: number;
  /** Price rounding strategy */
  roundingStrategy: 'none' | 'nearest_dollar' | 'nearest_quarter' | 'up' | 'down';
}

/**
 * Error types that can occur during pricing calculations.
 */
export type PricingErrorType = 
  | 'no_tiers_provided'
  | 'invalid_day_count'
  | 'no_matching_tier'
  | 'calculation_error'
  | 'invalid_configuration';

/**
 * Pricing calculation error with detailed information.
 */
export class PricingError extends Error {
  public readonly type: PricingErrorType;
  public readonly details?: Record<string, unknown>;

  constructor(type: PricingErrorType, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'PricingError';
    this.type = type;
    this.details = details;
  }
}

/**
 * Additional types for reservation settings.
 */
export interface ReservationSettings {
  dayPricing: PricingTier[];
  maxDays?: number;
  requireConsecutiveDays?: boolean;
  dailyCapacity?: number;
}

/**
 * Reservation details for customer bookings.
 */
export interface ReservationDetails {
  selectedDates: Date[];
  numberOfDays: number;
  appliedPriceTier: PricingTier;
  isConsecutive: boolean;
  checkInDate: Date;
  checkOutDate?: Date;
}

/**
 * Default pricing configuration.
 */
export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  defaultCurrency: 'USD',
  defaultTaxRate: 0,
  enableSuggestions: true,
  maxSuggestions: 3,
  minSuggestedSavings: 5.00,
  roundingStrategy: 'nearest_dollar',
};

/**
 * Price formatting options for display.
 */
export interface PriceFormatOptions {
  /** Currency code */
  currency: string;
  /** Locale for formatting */
  locale?: string;
  /** Whether to show currency symbol */
  showSymbol?: boolean;
  /** Number of decimal places to show */
  decimalPlaces?: number;
}

/**
 * Result of price comparison between options.
 */
export interface PriceComparison {
  /** Option being compared */
  option: string;
  /** Price for this option */
  price: number;
  /** Savings compared to base option */
  savings: number;
  /** Whether this is the recommended option */
  isRecommended: boolean;
  /** Additional notes about this option */
  notes?: string[];
}