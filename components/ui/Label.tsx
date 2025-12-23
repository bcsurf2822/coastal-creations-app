import { forwardRef, type LabelHTMLAttributes } from 'react';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ required, className = '', children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={`block text-sm font-medium text-[var(--color-text-secondary)] mb-2 ${className}`}
        {...props}
      >
        {children}
        {required && <span className="text-[var(--color-error)] ml-1">*</span>}
      </label>
    );
  }
);

Label.displayName = 'Label';
