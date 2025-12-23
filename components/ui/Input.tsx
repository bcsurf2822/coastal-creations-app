import { forwardRef, type InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = '', ...props }, ref) => {
    const baseClasses = 'w-full h-[50px] px-4 bg-white border rounded-[var(--radius-default)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-subtle)] transition-colors';
    const focusClasses = 'focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:outline-none';
    const borderClass = error
      ? 'border-[var(--color-error)]'
      : 'border-[var(--color-border)]';
    const disabledClasses = 'disabled:bg-[var(--color-border-lighter)] disabled:cursor-not-allowed';

    return (
      <input
        ref={ref}
        className={`${baseClasses} ${borderClass} ${focusClasses} ${disabledClasses} ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
