import type { ReactElement } from "react";
import { Label } from "@/components/ui";

interface FieldWrapperProps {
  id: string;
  label: string;
  required?: boolean;
  touched: boolean;
  error: string | null;
  children: ReactElement;
}

/** Label + input shell with a touched-only error message. */
export function FieldWrapper({
  id,
  label,
  required,
  touched,
  error,
  children,
}: FieldWrapperProps): ReactElement {
  return (
    <div>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      {children}
      {touched && error && (
        <p className="text-[var(--color-error)] text-xs mt-1">{error}</p>
      )}
    </div>
  );
}
