"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import { Input } from "@/components/ui";
import { FieldWrapper } from "./CheckoutField";
import { formatUsPhone, isValidUsPhone } from "@/components/checkout/ContactForm";
import { isValidEmail } from "@/lib/utils/validation";

export interface ContactValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface ContactFieldsProps {
  values: ContactValues;
  onChange: (field: keyof ContactValues, value: string) => void;
}

function contactError(field: keyof ContactValues, value: string): string | null {
  if (!value.trim()) return "Required";
  if (field === "email" && !isValidEmail(value)) return "Enter a valid email address";
  if (field === "phone" && !isValidUsPhone(value)) return "Enter a 10-digit phone number";
  return null;
}

/** Buyer contact details — the person paying and receiving the receipt. */
export default function ContactFields({
  values,
  onChange,
}: ContactFieldsProps): ReactElement {
  const [touched, setTouched] = useState<
    Partial<Record<keyof ContactValues, boolean>>
  >({});

  const touch = (field: keyof ContactValues): void =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <FieldWrapper
          id="contact-email"
          label="Email Address"
          required
          touched={!!touched.email}
          error={contactError("email", values.email)}
          value={values.email}
        >
          <Input
            id="contact-email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => onChange("email", e.target.value)}
            onBlur={() => touch("email")}
          />
        </FieldWrapper>

        <FieldWrapper
          id="contact-phone"
          label="Phone"
          required
          touched={!!touched.phone}
          error={contactError("phone", values.phone)}
          value={values.phone}
        >
          <Input
            id="contact-phone"
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
          id="contact-firstName"
          label="First Name"
          required
          touched={!!touched.firstName}
          error={contactError("firstName", values.firstName)}
          value={values.firstName}
        >
          <Input
            id="contact-firstName"
            autoComplete="given-name"
            value={values.firstName}
            onChange={(e) => onChange("firstName", e.target.value)}
            onBlur={() => touch("firstName")}
          />
        </FieldWrapper>

        <FieldWrapper
          id="contact-lastName"
          label="Last Name"
          required
          touched={!!touched.lastName}
          error={contactError("lastName", values.lastName)}
          value={values.lastName}
        >
          <Input
            id="contact-lastName"
            autoComplete="family-name"
            value={values.lastName}
            onChange={(e) => onChange("lastName", e.target.value)}
            onBlur={() => touch("lastName")}
          />
        </FieldWrapper>
      </div>
    </div>
  );
}
