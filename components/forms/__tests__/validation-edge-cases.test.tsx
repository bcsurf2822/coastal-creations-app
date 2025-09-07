/**
 * @fileoverview Edge case tests for form validation error handling
 * @module components/forms/__tests__/validation-edge-cases.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ReactElement } from 'react';

import { FormField } from '../FormField';
import { FormFieldArray } from '../FormFieldArray';
import { 
  getValidationErrors, 
  validateWithSchema,
  pricingTierSchema,
  reservationSettingsSchema,
  eventFormSchema 
} from '../../../lib/validations/reservationValidation';

/**
 * Test wrapper component for FormField edge case testing.
 */
const TestFormFieldWrapper = ({ 
  schema, 
  onSubmit = vi.fn(),
  ...fieldProps 
}: {
  schema: z.ZodSchema<any>;
  onSubmit?: (data: any) => void;
  [key: string]: any;
}): ReactElement => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur'
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormField
        register={register}
        error={errors[fieldProps.name]}
        {...fieldProps}
      />
      <button type="submit">Submit</button>
    </form>
  );
};

/**
 * Test wrapper component for FormFieldArray edge case testing.
 */
const TestFormFieldArrayWrapper = ({ 
  schema, 
  onSubmit = vi.fn(),
  ...arrayProps 
}: {
  schema: z.ZodSchema<any>;
  onSubmit?: (data: any) => void;
  [key: string]: any;
}): ReactElement => {
  const { control, register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { [arrayProps.name]: [] },
    mode: 'onBlur'
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormFieldArray
        control={control}
        errors={errors[arrayProps.name] as any}
        renderField={(field, index, register, fieldErrors) => (
          <div key={field.id}>
            <input {...register(`${arrayProps.name}.${index}.test`)} />
          </div>
        )}
        {...arrayProps}
      />
      <button type="submit">Submit</button>
    </form>
  );
};

/**
 * Test suite for form validation edge cases.
 * 
 * Covers error handling, malformed data, boundary conditions, and
 * complex validation scenarios to ensure robust form behavior.
 */
describe('Form Validation Edge Cases', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Tests for FormField component edge cases.
   */
  describe('FormField Edge Cases', () => {
    
    it('should handle empty string validation for required fields', async () => {
      const user = userEvent.setup();
      const schema = z.object({
        name: z.string().min(1, 'Name is required')
      });

      render(
        <TestFormFieldWrapper
          schema={schema}
          name="name"
          label="Name"
          type="text"
        />
      );

      const input = screen.getByLabelText('Name');
      
      // Type and clear to trigger validation
      await user.type(input, 'test');
      await user.clear(input);
      await user.tab(); // Trigger blur

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });
    });

    it('should handle whitespace-only input validation', async () => {
      const user = userEvent.setup();
      const schema = z.object({
        description: z.string().trim().min(1, 'Description cannot be empty')
      });

      render(
        <TestFormFieldWrapper
          schema={schema}
          name="description"
          label="Description"
          type="text"
        />
      );

      const input = screen.getByLabelText('Description');
      
      await user.type(input, '   ');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('Description cannot be empty')).toBeInTheDocument();
      });
    });

    it('should handle number field with non-numeric input', async () => {
      const user = userEvent.setup();
      const schema = z.object({
        price: z.number().min(0, 'Price must be positive')
      });

      render(
        <TestFormFieldWrapper
          schema={schema}
          name="price"
          label="Price"
          type="number"
          registerOptions={{ valueAsNumber: true }}
        />
      );

      const input = screen.getByLabelText('Price');
      
      // Simulate typing non-numeric characters (browser behavior varies)
      fireEvent.change(input, { target: { value: 'abc' } });
      await user.tab();

      // Should show validation error for invalid number
      await waitFor(() => {
        expect(screen.getByText(/Invalid value|Price must be positive/)).toBeInTheDocument();
      });
    });

    it('should handle date field with invalid date format', async () => {
      const user = userEvent.setup();
      const schema = z.object({
        eventDate: z.date()
      });

      render(
        <TestFormFieldWrapper
          schema={schema}
          name="eventDate"
          label="Event Date"
          type="date"
          registerOptions={{ valueAsDate: true }}
        />
      );

      const input = screen.getByLabelText('Event Date');
      
      // Invalid date format
      fireEvent.change(input, { target: { value: '2024-13-40' } });
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/Invalid value/)).toBeInTheDocument();
      });
    });

    it('should handle email field with malformed email', async () => {
      const user = userEvent.setup();
      const schema = z.object({
        email: z.string().email('Invalid email format')
      });

      render(
        <TestFormFieldWrapper
          schema={schema}
          name="email"
          label="Email"
          type="email"
        />
      );

      const input = screen.getByLabelText('Email');
      
      await user.type(input, 'invalid-email');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
      });
    });

    it('should handle select field with invalid option', async () => {
      const user = userEvent.setup();
      const schema = z.object({
        category: z.enum(['option1', 'option2'], { 
          errorMap: () => ({ message: 'Please select a valid option' })
        })
      });

      render(
        <TestFormFieldWrapper
          schema={schema}
          name="category"
          label="Category"
          type="select"
          options={[
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' }
          ]}
        />
      );

      const select = screen.getByLabelText('Category');
      
      // Simulate programmatic invalid value (shouldn't happen in UI but test robustness)
      fireEvent.change(select, { target: { value: 'invalid-option' } });
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('Please select a valid option')).toBeInTheDocument();
      });
    });
  });

  /**
   * Tests for FormFieldArray component edge cases.
   */
  describe('FormFieldArray Edge Cases', () => {
    
    it('should handle minimum items constraint violation', async () => {
      const user = userEvent.setup();
      const schema = z.object({
        items: z.array(z.object({ test: z.string() })).min(2, 'At least 2 items required')
      });

      const onSubmit = vi.fn();
      
      render(
        <TestFormFieldArrayWrapper
          schema={schema}
          onSubmit={onSubmit}
          name="items"
          label="Items"
          defaultValue={{ test: '' }}
          minItems={2}
        />
      );

      // Try to submit with empty array
      await user.click(screen.getByText('Submit'));

      await waitFor(() => {
        expect(screen.getByText('At least 2 items required')).toBeInTheDocument();
      });
      
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('should handle maximum items constraint', async () => {
      const user = userEvent.setup();
      const schema = z.object({
        items: z.array(z.object({ test: z.string() })).max(2, 'Maximum 2 items allowed')
      });

      render(
        <TestFormFieldArrayWrapper
          schema={schema}
          name="items"
          label="Items"
          defaultValue={{ test: '' }}
          maxItems={2}
        />
      );

      // Add two items to reach maximum
      const addButton = screen.getByText('Add Item');
      await user.click(addButton);
      await user.click(addButton);

      // Button should be disabled when at max
      expect(addButton).toBeDisabled();
    });

    it('should prevent removal below minimum items', async () => {
      const user = userEvent.setup();
      const schema = z.object({
        items: z.array(z.object({ test: z.string() })).min(1)
      });

      render(
        <TestFormFieldArrayWrapper
          schema={schema}
          name="items"
          label="Items"
          defaultValue={{ test: 'initial' }}
          minItems={1}
        />
      );

      // Add one item first
      await user.click(screen.getByText('Add Item'));

      // Try to remove when at minimum - remove buttons should be disabled
      const removeButtons = screen.getAllByText('Remove');
      expect(removeButtons[0]).toBeDisabled();
    });
  });

  /**
   * Tests for validation utility functions.
   */
  describe('Validation Utilities Edge Cases', () => {
    
    it('should handle getValidationErrors with nested errors', () => {
      const mockError = {
        issues: [
          { path: ['user', 'name'], message: 'Name required' },
          { path: ['user', 'email'], message: 'Invalid email' },
          { path: ['settings', 'theme'], message: 'Invalid theme' }
        ]
      } as z.ZodError;

      const errors = getValidationErrors(mockError);

      expect(errors).toEqual({
        'user.name': 'Name required',
        'user.email': 'Invalid email',
        'settings.theme': 'Invalid theme'
      });
    });

    it('should handle getValidationErrors with array indices', () => {
      const mockError = {
        issues: [
          { path: ['items', 0, 'name'], message: 'First item name required' },
          { path: ['items', 1, 'price'], message: 'Second item price invalid' }
        ]
      } as z.ZodError;

      const errors = getValidationErrors(mockError);

      expect(errors).toEqual({
        'items.0.name': 'First item name required',
        'items.1.price': 'Second item price invalid'
      });
    });

    it('should handle validateWithSchema with valid data', () => {
      const schema = z.object({
        name: z.string().min(1),
        age: z.number().min(0)
      });

      const validData = { name: 'John', age: 25 };
      const result = validateWithSchema(schema, validData);

      expect(result).toEqual({
        success: true,
        data: validData
      });
    });

    it('should handle validateWithSchema with invalid data', () => {
      const schema = z.object({
        name: z.string().min(1),
        age: z.number().min(0)
      });

      const invalidData = { name: '', age: -5 };
      const result = validateWithSchema(schema, invalidData);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.name).toContain('String must contain at least 1 character(s)');
      expect(result.errors?.age).toContain('Number must be greater than or equal to 0');
    });

    it('should handle validateWithSchema with completely malformed data', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number()
      });

      const malformedData = null;
      const result = validateWithSchema(schema, malformedData);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  /**
   * Tests for reservation-specific validation edge cases.
   */
  describe('Reservation Validation Edge Cases', () => {
    
    it('should handle pricing tier with duplicate day counts', () => {
      const invalidPricingTiers = [
        { numberOfDays: 1, price: 75 },
        { numberOfDays: 1, price: 80 }, // Duplicate!
        { numberOfDays: 7, price: 400 }
      ];

      const result = validateWithSchema(
        z.object({ dayPricing: z.array(pricingTierSchema) }),
        { dayPricing: invalidPricingTiers }
      );

      expect(result.success).toBe(true); // Individual tiers are valid
      
      // But reservation settings should catch duplicates
      const reservationResult = validateWithSchema(
        reservationSettingsSchema,
        {
          dayPricing: invalidPricingTiers,
          maxDays: 7
        }
      );

      expect(reservationResult.success).toBe(false);
      expect(reservationResult.errors?.dayPricing).toContain('Duplicate day counts not allowed');
    });

    it('should handle maxDays smaller than highest pricing tier', () => {
      const result = validateWithSchema(
        reservationSettingsSchema,
        {
          dayPricing: [
            { numberOfDays: 1, price: 75 },
            { numberOfDays: 7, price: 400 } // Higher than maxDays
          ],
          maxDays: 5 // Too small!
        }
      );

      expect(result.success).toBe(false);
      expect(result.errors?.maxDays).toContain('Maximum days must be at least as large as highest pricing tier');
    });

    it('should handle reservation event without end date', () => {
      const result = validateWithSchema(
        eventFormSchema,
        {
          eventName: 'Test Camp',
          eventType: 'reservation',
          description: 'Test description that is long enough',
          startDate: new Date('2024-07-15'),
          // Missing endDate!
          startTime: '09:00',
          reservationSettings: {
            dayPricing: [{ numberOfDays: 1, price: 75 }],
            maxDays: 7
          }
        }
      );

      expect(result.success).toBe(false);
      expect(result.errors?.reservationSettings).toContain('Reservation events must have reservation settings and end date');
    });

    it('should handle reservation event without reservation settings', () => {
      const result = validateWithSchema(
        eventFormSchema,
        {
          eventName: 'Test Camp',
          eventType: 'reservation',
          description: 'Test description that is long enough',
          startDate: new Date('2024-07-15'),
          endDate: new Date('2024-07-21'),
          startTime: '09:00'
          // Missing reservationSettings!
        }
      );

      expect(result.success).toBe(false);
      expect(result.errors?.reservationSettings).toContain('Reservation events must have reservation settings and end date');
    });

    it('should handle end date before start date', () => {
      const result = validateWithSchema(
        eventFormSchema,
        {
          eventName: 'Test Camp',
          eventType: 'reservation',
          description: 'Test description that is long enough',
          startDate: new Date('2024-07-21'),
          endDate: new Date('2024-07-15'), // Before start date!
          startTime: '09:00',
          reservationSettings: {
            dayPricing: [{ numberOfDays: 1, price: 75 }],
            maxDays: 7
          }
        }
      );

      expect(result.success).toBe(false);
      expect(result.errors?.endDate).toContain('End date must be after start date');
    });

    it('should handle end time before start time for same-day events', () => {
      const result = validateWithSchema(
        eventFormSchema,
        {
          eventName: 'Test Class',
          eventType: 'class',
          description: 'Test description that is long enough',
          startDate: new Date('2024-07-15'),
          startTime: '14:00',
          endTime: '09:00' // Before start time!
        }
      );

      expect(result.success).toBe(false);
      expect(result.errors?.endTime).toContain('End time must be after start time');
    });
  });

  /**
   * Tests for boundary conditions and extreme values.
   */
  describe('Boundary Conditions', () => {
    
    it('should handle maximum string lengths', () => {
      const longString = 'a'.repeat(1001); // Over 1000 character limit
      
      const result = validateWithSchema(
        eventFormSchema,
        {
          eventName: 'Test',
          eventType: 'class',
          description: longString, // Too long!
          startDate: new Date('2024-07-15'),
          startTime: '09:00'
        }
      );

      expect(result.success).toBe(false);
      expect(result.errors?.description).toContain('String must contain at most 1000 character(s)');
    });

    it('should handle minimum string lengths', () => {
      const result = validateWithSchema(
        eventFormSchema,
        {
          eventName: 'Test',
          eventType: 'class',
          description: 'Short', // Under 10 characters
          startDate: new Date('2024-07-15'),
          startTime: '09:00'
        }
      );

      expect(result.success).toBe(false);
      expect(result.errors?.description).toContain('String must contain at least 10 character(s)');
    });

    it('should handle negative pricing values', () => {
      const result = validateWithSchema(
        pricingTierSchema,
        {
          numberOfDays: 1,
          price: -50 // Negative price!
        }
      );

      expect(result.success).toBe(false);
      expect(result.errors?.price).toContain('Number must be greater than or equal to 0');
    });

    it('should handle zero and boundary day values', () => {
      // Test 0 days (invalid)
      let result = validateWithSchema(
        pricingTierSchema,
        {
          numberOfDays: 0, // Invalid
          price: 75
        }
      );
      expect(result.success).toBe(false);
      expect(result.errors?.numberOfDays).toContain('Number must be greater than or equal to 1');

      // Test 31 days (over limit)
      result = validateWithSchema(
        pricingTierSchema,
        {
          numberOfDays: 31, // Over 30 day limit
          price: 75
        }
      );
      expect(result.success).toBe(false);
      expect(result.errors?.numberOfDays).toContain('Number must be less than or equal to 30');

      // Test boundary values (1 and 30 should be valid)
      result = validateWithSchema(
        pricingTierSchema,
        {
          numberOfDays: 1,
          price: 75
        }
      );
      expect(result.success).toBe(true);

      result = validateWithSchema(
        pricingTierSchema,
        {
          numberOfDays: 30,
          price: 75
        }
      );
      expect(result.success).toBe(true);
    });
  });
});