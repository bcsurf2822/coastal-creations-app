"use client";

import type { ReactElement } from "react";
import { Input, Label } from "@/components/ui";

export interface ContactFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
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
          value={values.phone}
          error={errors?.phone}
          disabled={disabled}
          onChange={(e) => onChange("phone", e.target.value)}
        />
      </div>
    </div>
  );
}
