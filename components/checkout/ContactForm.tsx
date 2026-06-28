"use client";

import type { ReactElement } from "react";
import { Input, Label } from "@/components/ui";

export interface ContactFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

/** Format a US phone as the user types: (XXX) XXX-XXXX, capped at 10 digits. */
export function formatUsPhone(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length < 4) return `(${digits}`;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/** True when the phone contains exactly 10 digits. */
export function isValidUsPhone(phone: string): boolean {
  return phone.replace(/\D/g, "").length === 10;
}

interface ContactFormProps {
  values: ContactFormValues;
  onChange: (field: keyof ContactFormValues, value: string) => void;
  /** Optional per-field error flags (e.g. a bad email format). */
  errors?: Partial<Record<keyof ContactFormValues, boolean>>;
  disabled?: boolean;
}

/**
 * Minimal contact form for event + gift-card checkout: name, email, and phone —
 * all required. No billing/shipping address: Square does not need one to charge a
 * card (the card form collects the postal code itself for AVS); address is a
 * store-only (shipping) concern. See lib/checkout / the unified-checkout plan.
 */
export default function ContactForm({
  values,
  onChange,
  errors,
  disabled,
}: ContactFormProps): ReactElement {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contact-firstName" required>
            First name
          </Label>
          <Input
            id="contact-firstName"
            name="firstName"
            autoComplete="given-name"
            value={values.firstName}
            error={errors?.firstName}
            disabled={disabled}
            onChange={(e) => onChange("firstName", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="contact-lastName" required>
            Last name
          </Label>
          <Input
            id="contact-lastName"
            name="lastName"
            autoComplete="family-name"
            value={values.lastName}
            error={errors?.lastName}
            disabled={disabled}
            onChange={(e) => onChange("lastName", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contact-email" required>
            Email
          </Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={values.email}
            error={errors?.email}
            disabled={disabled}
            onChange={(e) => onChange("email", e.target.value)}
          />
          {errors?.email && (
            <p className="mt-1 text-sm text-[var(--color-error)]">
              Enter a valid email address.
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="contact-phone" required>
            Phone
          </Label>
          <Input
            id="contact-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(555) 555-5555"
            maxLength={14}
            value={values.phone}
            error={errors?.phone}
            disabled={disabled}
            onChange={(e) => onChange("phone", formatUsPhone(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
}
