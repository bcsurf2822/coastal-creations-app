/**
 * @fileoverview Tests for useReservationPricing hook
 * @module hooks/__tests__/useReservationPricing.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactElement } from 'react';
import { useReservationPricing, usePricingTiers } from '../useReservationPricing';
import type { PricingTier } from '../../lib/validations/reservationValidation';

/**
 * Test pricing tiers for consistent testing.
 */
const testPricingTiers: PricingTier[] = [
  { numberOfDays: 1, price: 75, label: 'Single Day' },
  { numberOfDays: 3, price: 200, label: 'Three Days' },
  { numberOfDays: 5, price: 300, label: 'Five Days' },
  { numberOfDays: 7, price: 400, label: 'Full Week' },
];

/**
 * Query client wrapper for hook testing.
 */
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }): ReactElement => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

/**
 * Mock fetch for API calls.
 */
const mockFetch = vi.fn();
global.fetch = mockFetch;

/**
 * Test suite for useReservationPricing hook.
 *
 * Tests core pricing calculations, real-time updates, suggestions,
 * and integration with React Hook Form patterns.
 */
describe('useReservationPricing', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /**
   * Test basic pricing calculation functionality.
   */
  it('should calculate price for given day count and tiers', async () => {
    const { result } = renderHook(
      () => useReservationPricing(3, testPricingTiers),
      { wrapper: createWrapper() }
    );

    expect(result.current.isCalculating).toBe(true);

    // Fast-forward past debounce delay
    act(() => {
      vi.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(result.current.isCalculating).toBe(false);
    });

    expect(result.current.price).not.toBeNull();
    expect(result.current.price?.totalPrice).toBe(200);
    expect(result.current.price?.dayCount).toBe(3);
    expect(result.current.price?.appliedTier?.numberOfDays).toBe(3);
    expect(result.current.error).toBeNull();
  });

  /**
   * Test pricing with tax calculations.
   */
  it('should calculate pricing with tax when options provided', async () => {
    const { result } = renderHook(
      () => useReservationPricing(3, testPricingTiers, {
        includeTax: true,
        taxRate: 0.08,
      }),
      { wrapper: createWrapper() }
    );

    act(() => {
      vi.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(result.current.price?.basePrice).toBe(200);
      expect(result.current.price?.taxAmount).toBe(16);
      expect(result.current.price?.totalPrice).toBe(216);
    });
  });

  /**
   * Test pricing suggestions generation.
   */
  it('should generate pricing optimization suggestions', async () => {
    const { result } = renderHook(
      () => useReservationPricing(2, testPricingTiers, {}, {
        enableSuggestions: true,
        minSuggestedSavings: 5,
      }),
      { wrapper: createWrapper() }
    );

    act(() => {
      vi.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(result.current.suggestions).toHaveLength(expect.any(Number));
      
      // Should suggest adding days for better value
      const addDaysSuggestion = result.current.suggestions.find(s => s.type === 'add_days');
      expect(addDaysSuggestion).toBeDefined();
      expect(addDaysSuggestion?.suggestedDays).toBeGreaterThan(2);
    });
  });

  /**
   * Test price comparisons generation.
   */
  it('should generate price comparisons for different day counts', async () => {
    const { result } = renderHook(
      () => useReservationPricing(3, testPricingTiers),
      { wrapper: createWrapper() }
    );

    act(() => {
      vi.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(result.current.comparisons).toHaveLength(expect.any(Number));
      expect(result.current.comparisons[0]).toHaveProperty('option');
      expect(result.current.comparisons[0]).toHaveProperty('price');
      expect(result.current.comparisons[0]).toHaveProperty('isRecommended');
    });
  });

  /**
   * Test real-time updates when selectedDays changes.
   */
  it('should update pricing when selectedDays changes', async () => {
    const { result, rerender } = renderHook(
      ({ days }: { days: number }) => useReservationPricing(days, testPricingTiers),
      { 
        initialProps: { days: 1 },
        wrapper: createWrapper() 
      }
    );

    // Initial calculation for 1 day
    act(() => {
      vi.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(result.current.price?.totalPrice).toBe(75);
    });

    // Change to 3 days
    rerender({ days: 3 });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(result.current.price?.totalPrice).toBe(200);
    });
  });

  /**
   * Test options updates through updateOptions function.
   */
  it('should update pricing when options are changed', async () => {
    const { result } = renderHook(
      () => useReservationPricing(3, testPricingTiers),
      { wrapper: createWrapper() }
    );

    // Initial calculation without tax
    act(() => {
      vi.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(result.current.price?.totalPrice).toBe(200);
    });

    // Update options to include tax
    act(() => {
      result.current.updateOptions({
        includeTax: true,
        taxRate: 0.1,
      });
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(result.current.price?.totalPrice).toBe(220);
      expect(result.current.price?.taxAmount).toBe(20);
    });
  });

  /**
   * Test error handling for invalid pricing tiers.
   */
  it('should handle errors gracefully', async () => {
    const { result } = renderHook(
      () => useReservationPricing(3, []),
      { wrapper: createWrapper() }
    );

    act(() => {
      vi.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(result.current.price).toBeNull();
      expect(result.current.error).toBeNull(); // Empty tiers should not cause error
    });

    // Test with negative days
    const { result: result2 } = renderHook(
      () => useReservationPricing(-1, testPricingTiers),
      { wrapper: createWrapper() }
    );

    act(() => {
      vi.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(result2.current.price).toBeNull();
    });
  });

  /**
   * Test utility functions.
   */
  it('should provide utility functions for pricing queries', async () => {
    const { result } = renderHook(
      () => useReservationPricing(3, testPricingTiers),
      { wrapper: createWrapper() }
    );

    act(() => {
      vi.advanceTimersByTime(500);
    });

    await waitFor(() => {
      // Test getPriceForDays
      const priceFor5Days = result.current.getPriceForDays(5);
      expect(priceFor5Days?.totalPrice).toBe(300);

      const priceFor0Days = result.current.getPriceForDays(0);
      expect(priceFor0Days).toBeNull();

      // Test canPriceDays
      expect(result.current.canPriceDays(5)).toBe(true);
      expect(result.current.canPriceDays(0)).toBe(false);
      expect(result.current.canPriceDays(100)).toBe(true); // Should use highest tier
    });
  });

  /**
   * Test manual recalculation trigger.
   */
  it('should recalculate when recalculate function is called', async () => {
    const { result } = renderHook(
      () => useReservationPricing(3, testPricingTiers),
      { wrapper: createWrapper() }
    );

    // Initial calculation
    act(() => {
      vi.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(result.current.price?.totalPrice).toBe(200);
    });

    // Trigger manual recalculation
    act(() => {
      result.current.recalculate();
    });

    expect(result.current.isCalculating).toBe(true);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(result.current.isCalculating).toBe(false);
      expect(result.current.price?.totalPrice).toBe(200);
    });
  });

  /**
   * Test auto-fetch pricing tiers functionality.
   */
  it('should fetch pricing tiers from API when autoFetchTiers is enabled', async () => {
    const mockEventId = 'test-event-id';
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ pricingTiers: testPricingTiers }),
    });

    const { result } = renderHook(
      () => useReservationPricing(3, null, {}, {
        autoFetchTiers: true,
        eventId: mockEventId,
      }),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoadingTiers).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoadingTiers).toBe(false);
      expect(result.current.pricingTiers).toEqual(testPricingTiers);
    });

    expect(mockFetch).toHaveBeenCalledWith(`/api/events/${mockEventId}/pricing`);
  });

  /**
   * Test disabled real-time updates.
   */
  it('should not auto-calculate when realTimeUpdates is disabled', async () => {
    const { result } = renderHook(
      () => useReservationPricing(3, testPricingTiers, {}, {
        realTimeUpdates: false,
      }),
      { wrapper: createWrapper() }
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Should not auto-calculate
    expect(result.current.price).toBeNull();
    expect(result.current.isCalculating).toBe(false);

    // Manual recalculation should still work
    act(() => {
      result.current.recalculate();
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(result.current.price?.totalPrice).toBe(200);
    });
  });

  /**
   * Test custom debounce delay.
   */
  it('should respect custom debounce delay', async () => {
    const customDelay = 1000;
    
    const { result } = renderHook(
      () => useReservationPricing(3, testPricingTiers, {}, {
        debounceDelay: customDelay,
      }),
      { wrapper: createWrapper() }
    );

    expect(result.current.isCalculating).toBe(true);

    // Should not complete before custom delay
    act(() => {
      vi.advanceTimersByTime(500);
    });
    
    expect(result.current.isCalculating).toBe(true);
    expect(result.current.price).toBeNull();

    // Should complete after custom delay
    act(() => {
      vi.advanceTimersByTime(600);
    });

    await waitFor(() => {
      expect(result.current.price?.totalPrice).toBe(200);
    });
  });
});

/**
 * Test suite for usePricingTiers hook.
 *
 * Tests CRUD operations for pricing tier management.
 */
describe('usePricingTiers', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test adding new pricing tiers.
   */
  it('should add new pricing tiers', () => {
    const { result } = renderHook(() => usePricingTiers(), { wrapper: createWrapper() });

    expect(result.current.tiers).toEqual([]);

    act(() => {
      result.current.addTier({
        numberOfDays: 1,
        price: 75,
        label: 'Single Day',
      });
    });

    expect(result.current.tiers).toHaveLength(1);
    expect(result.current.tiers[0]).toMatchObject({
      numberOfDays: 1,
      price: 75,
      label: 'Single Day',
    });
  });

  /**
   * Test updating existing pricing tiers.
   */
  it('should update existing pricing tiers', () => {
    const { result } = renderHook(() => usePricingTiers(), { wrapper: createWrapper() });

    // Add initial tier
    act(() => {
      result.current.addTier({
        numberOfDays: 1,
        price: 75,
        label: 'Single Day',
      });
    });

    // Update the tier
    act(() => {
      result.current.updateTier(0, {
        price: 80,
        label: 'Updated Single Day',
      });
    });

    expect(result.current.tiers[0]).toMatchObject({
      numberOfDays: 1,
      price: 80,
      label: 'Updated Single Day',
    });
  });

  /**
   * Test removing pricing tiers.
   */
  it('should remove pricing tiers', () => {
    const { result } = renderHook(() => usePricingTiers(), { wrapper: createWrapper() });

    // Add two tiers
    act(() => {
      result.current.addTier({ numberOfDays: 1, price: 75, label: 'Day 1' });
      result.current.addTier({ numberOfDays: 3, price: 200, label: 'Day 3' });
    });

    expect(result.current.tiers).toHaveLength(2);

    // Remove first tier
    act(() => {
      result.current.removeTier(0);
    });

    expect(result.current.tiers).toHaveLength(1);
    expect(result.current.tiers[0].numberOfDays).toBe(3);
  });

  /**
   * Test automatic sorting of tiers by numberOfDays.
   */
  it('should automatically sort tiers by numberOfDays', () => {
    const { result } = renderHook(() => usePricingTiers(), { wrapper: createWrapper() });

    // Add tiers in random order
    act(() => {
      result.current.addTier({ numberOfDays: 7, price: 400, label: 'Week' });
      result.current.addTier({ numberOfDays: 1, price: 75, label: 'Day' });
      result.current.addTier({ numberOfDays: 3, price: 200, label: 'Three Days' });
    });

    // Should be sorted by numberOfDays
    expect(result.current.tiers[0].numberOfDays).toBe(1);
    expect(result.current.tiers[1].numberOfDays).toBe(3);
    expect(result.current.tiers[2].numberOfDays).toBe(7);
  });

  /**
   * Test tier validation.
   */
  it('should validate pricing tiers', () => {
    const { result } = renderHook(() => usePricingTiers(), { wrapper: createWrapper() });

    // Add valid tiers
    act(() => {
      result.current.addTier({ numberOfDays: 1, price: 75, label: 'Day 1' });
      result.current.addTier({ numberOfDays: 3, price: 200, label: 'Day 3' });
    });

    expect(result.current.validationResult?.isValid).toBe(true);
    expect(result.current.validationResult?.issues).toEqual([]);

    // Add duplicate tier (should trigger validation error)
    act(() => {
      result.current.addTier({ numberOfDays: 1, price: 80, label: 'Duplicate Day' });
    });

    expect(result.current.validationResult?.isValid).toBe(false);
    expect(result.current.validationResult?.issues).toContain('Duplicate day counts found in pricing tiers');
  });

  /**
   * Test fetching existing tiers for an event.
   */
  it('should fetch existing tiers when eventId provided', async () => {
    const mockEventId = 'test-event-id';
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ pricingTiers: testPricingTiers }),
    });

    const { result } = renderHook(
      () => usePricingTiers(mockEventId),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.tiers).toEqual(testPricingTiers);
    });

    expect(mockFetch).toHaveBeenCalledWith(`/api/events/${mockEventId}/pricing`);
  });

  /**
   * Test saving tiers to API.
   */
  it('should save tiers to API when saveTiers is called', async () => {
    const mockEventId = 'test-event-id';
    
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ pricingTiers: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    const { result } = renderHook(
      () => usePricingTiers(mockEventId),
      { wrapper: createWrapper() }
    );

    // Wait for initial fetch
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Add a tier
    act(() => {
      result.current.addTier({ numberOfDays: 1, price: 75, label: 'Test' });
    });

    // Save tiers
    await act(async () => {
      await result.current.saveTiers();
    });

    expect(mockFetch).toHaveBeenCalledWith(
      `/api/events/${mockEventId}/pricing`,
      expect.objectContaining({
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('numberOfDays'),
      })
    );
  });

  /**
   * Test error handling for invalid tiers on save.
   */
  it('should throw error when saving invalid tiers', async () => {
    const mockEventId = 'test-event-id';
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ pricingTiers: [] }),
    });

    const { result } = renderHook(
      () => usePricingTiers(mockEventId),
      { wrapper: createWrapper() }
    );

    // Wait for initial fetch
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Add invalid tier (duplicate days)
    act(() => {
      result.current.addTier({ numberOfDays: 1, price: 75, label: 'First' });
      result.current.addTier({ numberOfDays: 1, price: 80, label: 'Duplicate' });
    });

    // Try to save - should throw error
    await expect(async () => {
      await act(async () => {
        await result.current.saveTiers();
      });
    }).rejects.toThrow('Invalid pricing tiers');
  });
});