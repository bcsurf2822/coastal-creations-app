"use client";

import type { ReactElement } from "react";
import { Input, Label, Button } from "@/components/ui";

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
  onNext: () => void;
  isLoading: boolean;
  error: string | null;
  hasRates?: boolean;
}

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY",
];

export default function ShippingAddressStep({
  values,
  onChange,
  onNext,
  isLoading,
  error,
  hasRates = false,
}: ShippingAddressStepProps): ReactElement {
  const isValid =
    values.firstName.trim() &&
    values.lastName.trim() &&
    values.email.trim() &&
    values.addressLine1.trim() &&
    values.city.trim() &&
    values.state.trim() &&
    values.zip.trim();

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName" required>First Name</Label>
          <Input
            id="firstName"
            value={values.firstName}
            onChange={(e) => onChange("firstName", e.target.value)}
            autoComplete="given-name"
          />
        </div>
        <div>
          <Label htmlFor="lastName" required>Last Name</Label>
          <Input
            id="lastName"
            value={values.lastName}
            onChange={(e) => onChange("lastName", e.target.value)}
            autoComplete="family-name"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email" required>Email Address</Label>
        <Input
          id="email"
          type="email"
          value={values.email}
          onChange={(e) => onChange("email", e.target.value)}
          autoComplete="email"
        />
      </div>

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

      <div>
        <Label htmlFor="addressLine1" required>Street Address</Label>
        <Input
          id="addressLine1"
          value={values.addressLine1}
          onChange={(e) => onChange("addressLine1", e.target.value)}
          autoComplete="address-line1"
        />
      </div>

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
        <div className="col-span-1">
          <Label htmlFor="city" required>City</Label>
          <Input
            id="city"
            value={values.city}
            onChange={(e) => onChange("city", e.target.value)}
            autoComplete="address-level2"
          />
        </div>
        <div>
          <Label htmlFor="state" required>State</Label>
          <select
            id="state"
            value={values.state}
            onChange={(e) => onChange("state", e.target.value)}
            className="w-full px-3 py-2 border border-[var(--color-border-lighter)] rounded-[var(--radius-md)] text-[var(--color-text-primary)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm"
          >
            <option value="">State</option>
            {US_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="zip" required>ZIP</Label>
          <Input
            id="zip"
            value={values.zip}
            onChange={(e) => onChange("zip", e.target.value)}
            autoComplete="postal-code"
            maxLength={10}
          />
        </div>
      </div>

      {error && (
        <p className="text-[var(--color-error)] text-sm">{error}</p>
      )}

      <Button
        variant="primary"
        className="w-full"
        disabled={!isValid || isLoading}
        onClick={onNext}
      >
        {isLoading ? "Getting shipping rates…" : hasRates ? "Update Rates" : "Get Shipping Rates"}
      </Button>
    </div>
  );
}
