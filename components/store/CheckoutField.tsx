import type { ReactElement } from "react";
import { Label } from "@/components/ui";

interface FieldWrapperProps {
  id: string;
  label: string;
  required?: boolean;
  touched: boolean;
  error: string | null;
  value?: string;
  children: ReactElement;
}

/** Label + input shell with a valid ✓ and a touched-only error message. */
export function FieldWrapper({
  id,
  label,
  required,
  touched,
  error,
  value,
  children,
}: FieldWrapperProps): ReactElement {
  const isValid = !!value && !error;
  return (
    <div>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
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
