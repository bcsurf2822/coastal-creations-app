"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import { Input, Label } from "@/components/ui";
import { formatUsPhone, isValidUsPhone } from "@/components/checkout/ContactForm";

export interface AddressFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zip: string;
}

interface ShippingAddressStepProps {
  values: AddressFormValues;
  onChange: (field: keyof AddressFormValues, value: string) => void;
  isLoading: boolean;
  error: string | null;
}

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY",
];

const REQUIRED_FIELDS: (keyof AddressFormValues)[] = [
  "firstName","lastName","email","phone","addressLine1","city","state","zip",
];

function validateField(field: keyof AddressFormValues, value: string): string | null {
  if (REQUIRED_FIELDS.includes(field) && !value.trim()) return "Required";
  if (field === "email" && value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    return "Enter a valid email address";
  if (field === "zip" && value.trim() && !/^\d{5}(-\d{4})?$/.test(value))
    return "Enter a valid ZIP code";
  if (field === "phone" && value.trim() && !isValidUsPhone(value))
    return "Enter a 10-digit phone number";
  return null;
}

interface FieldWrapperProps {
  id: string;
  label: string;
  required?: boolean;
  touched: boolean;
  error: string | null;
  value?: string;
  children: ReactElement;
}

function FieldWrapper({ id, label, required, touched, error, value, children }: FieldWrapperProps): ReactElement {
  const isValid = !!value && !error;
  return (
    <div>
      <Label htmlFor={id} required={required}>{label}</Label>
      <div className="relative">
        {children}
        {isValid && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-sm pointer-events-none">
            ✓
          </span>
        )}
      </div>
      {touched && error && (
        <p className="text-[var(--color-error)] text-xs mt-1">{error}</p>
      )}
    </div>
  );
}

export default function ShippingAddressStep({
  values,
  onChange,
  isLoading,
  error,
}: ShippingAddressStepProps): ReactElement {
  const [touched, setTouched] = useState<Partial<Record<keyof AddressFormValues, boolean>>>({});

  const touch = (field: keyof AddressFormValues): void => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const fieldProps = (field: keyof AddressFormValues) => ({
    value: values[field],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(field, e.target.value),
    onBlur: () => touch(field),
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Email + Phone on top for a cleaner contact row */}
      <div className="grid grid-cols-2 gap-4">
        <FieldWrapper
          id="email"
          label="Email Address"
          required
          touched={!!touched.email}
          error={validateField("email", values.email)}
          value={values.email}
        >
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...fieldProps("email")}
          />
        </FieldWrapper>

        <FieldWrapper
          id="phone"
          label="Phone"
          required
          touched={!!touched.phone}
          error={validateField("phone", values.phone)}
          value={values.phone}
        >
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(555) 555-5555"
            maxLength={14}
            value={values.phone}
            onChange={(e) => onChange("phone", formatUsPhone(e.target.value))}
            onBlur={() => touch("phone")}
          />
        </FieldWrapper>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FieldWrapper
          id="firstName"
          label="First Name"
          required
          touched={!!touched.firstName}
          error={validateField("firstName", values.firstName)}
          value={values.firstName}
        >
          <Input
            id="firstName"
            autoComplete="given-name"
            {...fieldProps("firstName")}
          />
        </FieldWrapper>

        <FieldWrapper
          id="lastName"
          label="Last Name"
          required
          touched={!!touched.lastName}
          error={validateField("lastName", values.lastName)}
          value={values.lastName}
        >
          <Input
            id="lastName"
            autoComplete="family-name"
            {...fieldProps("lastName")}
          />
        </FieldWrapper>
      </div>

      <FieldWrapper
        id="addressLine1"
        label="Street Address"
        required
        touched={!!touched.addressLine1}
        error={validateField("addressLine1", values.addressLine1)}
        value={values.addressLine1}
      >
        <Input
          id="addressLine1"
          autoComplete="address-line1"
          {...fieldProps("addressLine1")}
        />
      </FieldWrapper>

      <div>
        <Label htmlFor="addressLine2">Apt / Suite (optional)</Label>
        <Input
          id="addressLine2"
          value={values.addressLine2}
          onChange={(e) => onChange("addressLine2", e.target.value)}
          autoComplete="address-line2"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <FieldWrapper
          id="city"
          label="City"
          required
          touched={!!touched.city}
          error={validateField("city", values.city)}
          value={values.city}
        >
          <Input
            id="city"
            autoComplete="address-level2"
            {...fieldProps("city")}
          />
        </FieldWrapper>

        <div>
          <Label htmlFor="state" required>State</Label>
          <div className="relative">
            <select
              id="state"
              value={values.state}
              onChange={(e) => {
                onChange("state", e.target.value);
                touch("state");
              }}
              onBlur={() => touch("state")}
              className="w-full h-[50px] px-4 bg-[var(--color-light)] border border-[var(--color-border)] rounded-[var(--radius-default)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:outline-none transition-colors text-sm appearance-none"
            >
              <option value="">State</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {values.state && (
              <span className="absolute right-7 top-1/2 -translate-y-1/2 text-green-500 text-sm pointer-events-none">
                ✓
              </span>
            )}
          </div>
          {touched.state && !values.state && (
            <p className="text-[var(--color-error)] text-xs mt-1">Required</p>
          )}
        </div>

        <FieldWrapper
          id="zip"
          label="ZIP"
          required
          touched={!!touched.zip}
          error={validateField("zip", values.zip)}
          value={values.zip}
        >
          <Input
            id="zip"
            autoComplete="postal-code"
            maxLength={10}
            {...fieldProps("zip")}
          />
        </FieldWrapper>
      </div>

      {error && (
        <p className="text-[var(--color-error)] text-sm bg-red-50 border border-red-200 rounded-[var(--radius-md)] px-3 py-2">
          {error}
        </p>
      )}

      {isLoading && (
        <p className="text-xs text-[var(--color-text-subtle)] flex items-center gap-1.5 animate-pulse">
          <span className="inline-block w-3 h-3 border-2 border-[var(--color-secondary)] border-t-transparent rounded-full animate-spin" />
          Finding the best rates for your address…
        </p>
      )}
    </div>
  );
}
