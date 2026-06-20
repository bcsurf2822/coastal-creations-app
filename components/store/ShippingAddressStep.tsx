"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import { Input, Label } from "@/components/ui";

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
  "firstName","lastName","email","addressLine1","city","state","zip",
];

function validateField(field: keyof AddressFormValues, value: string): string | null {
  if (REQUIRED_FIELDS.includes(field) && !value.trim()) return "Required";
  if (field === "email" && value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    return "Enter a valid email address";
  if (field === "zip" && value.trim() && !/^\d{5}(-\d{4})?$/.test(value))
    return "Enter a valid ZIP code";
  return null;
}

interface FieldWrapperProps {
  id: string;
  label: string;
  required?: boolean;
  touched: boolean;
  error: string | null;
  children: ReactElement;
}

function FieldWrapper({ id, label, required, touched, error, children }: FieldWrapperProps): ReactElement {
  const isValid = touched && !error;
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
      <div className="grid grid-cols-2 gap-4">
        <FieldWrapper
          id="firstName"
          label="First Name"
          required
          touched={!!touched.firstName}
          error={validateField("firstName", values.firstName)}
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
        >
          <Input
            id="lastName"
            autoComplete="family-name"
            {...fieldProps("lastName")}
          />
        </FieldWrapper>
      </div>

      <FieldWrapper
        id="email"
        label="Email Address"
        required
        touched={!!touched.email}
        error={validateField("email", values.email)}
      >
        <Input
          id="email"
          type="email"
          autoComplete="email"
          {...fieldProps("email")}
        />
      </FieldWrapper>

      <div>
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input
          id="phone"
          type="tel"
          value={values.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          autoComplete="tel"
        />
      </div>

      <FieldWrapper
        id="addressLine1"
        label="Street Address"
        required
        touched={!!touched.addressLine1}
        error={validateField("addressLine1", values.addressLine1)}
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
              className="w-full px-3 py-2 border border-[var(--color-border-lighter)] rounded-[var(--radius-md)] text-[var(--color-text-primary)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm"
            >
              <option value="">State</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {touched.state && values.state && (
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
