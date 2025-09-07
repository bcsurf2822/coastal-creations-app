/**
 * @fileoverview Integration tests for form components working together
 * @module components/forms/__tests__/integration.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ReactElement } from 'react';

import { FormField } from '../FormField';
import { FormFieldArray, PricingTierArray } from '../FormFieldArray';
import { eventFormSchema, reservationSettingsSchema } from '../../../lib/validations/reservationValidation';

/**
 * Simplified event form for integration testing.
 */
const TestEventForm = ({ onSubmit = vi.fn() }: { onSubmit?: (data: any) => void }): ReactElement => {
  const methods = useForm({
    resolver: zodResolver(eventFormSchema),
    mode: 'onBlur',
    defaultValues: {
      eventType: 'class',
      reservationSettings: {
        dayPricing: [],
        maxDays: 7
      }
    }
  });

  const { register, handleSubmit, control, watch, formState: { errors } } = methods;
  const eventType = watch('eventType');

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} data-testid="event-form">
        <FormField
          name="eventName"
          label="Event Name"
          type="text"
          register={register}
          error={errors.eventName}
          required
        />
        
        <FormField
          name="eventType"
          label="Event Type"
          type="select"
          register={register}
          error={errors.eventType}
          options={[
            { value: 'class', label: 'Class' },
            { value: 'camp', label: 'Camp' },
            { value: 'reservation', label: 'Reservation' }
          ]}
          required
        />

        <FormField
          name="description"
          label="Description"
          type="textarea"
          register={register}
          error={errors.description}
          required
        />

        <FormField
          name="startDate"
          label="Start Date"
          type="date"
          register={register}
          error={errors.startDate}
          registerOptions={{ valueAsDate: true }}
          required
        />

        {eventType === 'reservation' && (
          <>
            <FormField
              name="endDate"
              label="End Date"
              type="date"
              register={register}
              error={errors.endDate}
              registerOptions={{ valueAsDate: true }}
              required
            />
            
            <PricingTierArray
              control={control}
              errors={errors.reservationSettings?.dayPricing}
            />
            
            <FormField
              name="reservationSettings.maxDays"
              label="Maximum Days"
              type="number"
              register={register}
              error={errors.reservationSettings?.maxDays}
              registerOptions={{ valueAsNumber: true }}
              required
            />
          </>
        )}

        <FormField
          name="startTime"
          label="Start Time"
          type="time"
          register={register}
          error={errors.startTime}
          required
        />

        <button type="submit">Create Event</button>
      </form>
    </FormProvider>
  );
};

/**
 * Integration tests for form components working together.
 * 
 * Tests complete form workflows, component interactions, and
 * real-world usage scenarios to ensure robust integration.
 */
describe('Form Components Integration', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test regular event form submission.
   */
  it('should handle complete regular event form submission', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    
    render(<TestEventForm onSubmit={onSubmit} />);

    // Fill out the form
    await user.type(screen.getByLabelText('Event Name'), 'Pottery Class');
    
    await user.selectOptions(screen.getByLabelText('Event Type'), 'class');
    
    await user.type(
      screen.getByLabelText('Description'), 
      'Learn basic pottery techniques in this hands-on workshop'
    );
    
    await user.type(screen.getByLabelText('Start Date'), '2024-07-15');
    
    await user.type(screen.getByLabelText('Start Time'), '10:00');

    // Submit the form
    await user.click(screen.getByText('Create Event'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          eventName: 'Pottery Class',
          eventType: 'class',
          description: 'Learn basic pottery techniques in this hands-on workshop',
          startDate: expect.any(Date),
          startTime: '10:00'
        })
      );
    });
  });

  /**
   * Test reservation event form with pricing tiers.
   */
  it('should handle reservation event with pricing tiers', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    
    render(<TestEventForm onSubmit={onSubmit} />);

    // Fill basic event details
    await user.type(screen.getByLabelText('Event Name'), 'Summer Art Camp');
    
    await user.selectOptions(screen.getByLabelText('Event Type'), 'reservation');
    
    await user.type(
      screen.getByLabelText('Description'), 
      'Week-long art camp with flexible daily attendance options'
    );
    
    await user.type(screen.getByLabelText('Start Date'), '2024-07-15');
    await user.type(screen.getByLabelText('End Date'), '2024-07-21');
    await user.type(screen.getByLabelText('Start Time'), '09:00');
    
    // Wait for reservation fields to appear
    await waitFor(() => {
      expect(screen.getByText('Pricing Tiers')).toBeInTheDocument();
    });

    // Add pricing tier
    const addTierButton = screen.getByText('Add Pricing Tier');
    await user.click(addTierButton);

    // Wait for pricing tier fields to appear
    await waitFor(() => {
      expect(screen.getByLabelText('Number of Days *')).toBeInTheDocument();
    });

    // Fill pricing tier
    await user.type(screen.getByLabelText('Number of Days *'), '1');
    await user.type(screen.getByLabelText('Price *'), '75');
    await user.type(screen.getByLabelText('Label (Optional)'), 'Single Day');

    // Add second pricing tier
    await user.click(addTierButton);
    
    // Fill second tier
    const dayInputs = screen.getAllByLabelText('Number of Days *');
    const priceInputs = screen.getAllByLabelText('Price *');
    const labelInputs = screen.getAllByLabelText('Label (Optional)');
    
    await user.type(dayInputs[1], '7');
    await user.type(priceInputs[1], '400');
    await user.type(labelInputs[1], 'Full Week');

    // Submit the form
    await user.click(screen.getByText('Create Event'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          eventName: 'Summer Art Camp',
          eventType: 'reservation',
          description: 'Week-long art camp with flexible daily attendance options',
          startDate: expect.any(Date),
          endDate: expect.any(Date),
          startTime: '09:00',
          reservationSettings: expect.objectContaining({
            dayPricing: [
              {
                numberOfDays: 1,
                price: 75,
                label: 'Single Day'
              },
              {
                numberOfDays: 7,
                price: 400,
                label: 'Full Week'
              }
            ],
            maxDays: 7
          })
        })
      );
    });
  });

  /**
   * Test form validation errors across multiple components.
   */
  it('should show validation errors across multiple form components', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    
    render(<TestEventForm onSubmit={onSubmit} />);

    // Try to submit empty form
    await user.click(screen.getByText('Create Event'));

    // Should show multiple validation errors
    await waitFor(() => {
      expect(screen.getByText('Event name is required')).toBeInTheDocument();
      expect(screen.getByText(/Description must be at least 10 characters/)).toBeInTheDocument();
      expect(screen.getByText(/Invalid value/)).toBeInTheDocument(); // Date validation
    });

    // Form should not have been submitted
    expect(onSubmit).not.toHaveBeenCalled();
  });

  /**
   * Test switching between event types and conditional fields.
   */
  it('should handle event type switching and conditional field display', async () => {
    const user = userEvent.setup();
    
    render(<TestEventForm />);

    // Initially should not show reservation fields
    expect(screen.queryByText('Pricing Tiers')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('End Date')).not.toBeInTheDocument();

    // Switch to reservation type
    await user.selectOptions(screen.getByLabelText('Event Type'), 'reservation');

    // Should now show reservation-specific fields
    await waitFor(() => {
      expect(screen.getByText('Pricing Tiers')).toBeInTheDocument();
      expect(screen.getByLabelText('End Date')).toBeInTheDocument();
      expect(screen.getByLabelText('Maximum Days')).toBeInTheDocument();
    });

    // Switch back to class
    await user.selectOptions(screen.getByLabelText('Event Type'), 'class');

    // Reservation fields should be hidden again
    await waitFor(() => {
      expect(screen.queryByText('Pricing Tiers')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('End Date')).not.toBeInTheDocument();
    });
  });

  /**
   * Test pricing tier array operations.
   */
  it('should handle pricing tier array add/remove operations', async () => {
    const user = userEvent.setup();
    
    render(<TestEventForm />);

    // Switch to reservation type to show pricing tiers
    await user.selectOptions(screen.getByLabelText('Event Type'), 'reservation');
    
    await waitFor(() => {
      expect(screen.getByText('Pricing Tiers')).toBeInTheDocument();
    });

    // Should show empty state initially
    expect(screen.getByText('No pricing tiers items added yet')).toBeInTheDocument();

    // Add first tier
    await user.click(screen.getByText('Add First Pricing Tier'));

    await waitFor(() => {
      expect(screen.getByText('Pricing Tiers 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Number of Days *')).toBeInTheDocument();
    });

    // Add second tier
    await user.click(screen.getByText('Add Pricing Tier'));

    await waitFor(() => {
      expect(screen.getByText('Pricing Tiers 2')).toBeInTheDocument();
      expect(screen.getAllByLabelText('Number of Days *')).toHaveLength(2);
    });

    // Remove first tier
    const removeButtons = screen.getAllByText('Remove');
    await user.click(removeButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('Pricing Tiers 2')).not.toBeInTheDocument();
      expect(screen.getAllByLabelText('Number of Days *')).toHaveLength(1);
    });
  });

  /**
   * Test field array minimum items constraint.
   */
  it('should enforce minimum pricing tiers for reservation events', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    
    render(<TestEventForm onSubmit={onSubmit} />);

    // Fill basic required fields
    await user.type(screen.getByLabelText('Event Name'), 'Test Camp');
    await user.selectOptions(screen.getByLabelText('Event Type'), 'reservation');
    await user.type(
      screen.getByLabelText('Description'), 
      'Test description that is long enough'
    );
    await user.type(screen.getByLabelText('Start Date'), '2024-07-15');
    await user.type(screen.getByLabelText('End Date'), '2024-07-21');
    await user.type(screen.getByLabelText('Start Time'), '09:00');

    // Try to submit without any pricing tiers
    await user.click(screen.getByText('Create Event'));

    // Should show error for missing pricing tiers
    await waitFor(() => {
      expect(screen.getByText(/At least one pricing tier required/)).toBeInTheDocument();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  /**
   * Test complex validation with multiple interdependent fields.
   */
  it('should handle complex validation with interdependent fields', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    
    render(<TestEventForm onSubmit={onSubmit} />);

    // Set up reservation event
    await user.type(screen.getByLabelText('Event Name'), 'Test Camp');
    await user.selectOptions(screen.getByLabelText('Event Type'), 'reservation');
    await user.type(
      screen.getByLabelText('Description'), 
      'Test description that is long enough'
    );
    await user.type(screen.getByLabelText('Start Date'), '2024-07-15');
    await user.type(screen.getByLabelText('End Date'), '2024-07-10'); // Invalid: before start date
    await user.type(screen.getByLabelText('Start Time'), '09:00');
    
    // Set maxDays too low
    await user.clear(screen.getByLabelText('Maximum Days'));
    await user.type(screen.getByLabelText('Maximum Days'), '2');

    // Add pricing tier with more days than maxDays allows
    await user.click(screen.getByText('Add First Pricing Tier'));
    
    await waitFor(() => {
      expect(screen.getByLabelText('Number of Days *')).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText('Number of Days *'), '7'); // More than maxDays (2)
    await user.type(screen.getByLabelText('Price *'), '400');

    // Submit and check for validation errors
    await user.click(screen.getByText('Create Event'));

    await waitFor(() => {
      // Should show end date error
      expect(screen.getByText('End date must be after start date')).toBeInTheDocument();
      
      // Should show maxDays constraint error
      expect(screen.getByText('Maximum days must be at least as large as highest pricing tier')).toBeInTheDocument();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });
});