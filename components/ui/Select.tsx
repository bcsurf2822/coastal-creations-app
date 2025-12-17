import { forwardRef, type SelectHTMLAttributes } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, className = '', children, ...props }, ref) => {
    const baseClasses = 'w-full h-[50px] px-4 bg-white border rounded-[var(--radius-default)] text-[var(--color-text-primary)] transition-colors appearance-none cursor-pointer';
    const focusClasses = 'focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:outline-none';
    const borderClass = error
      ? 'border-[var(--color-error)]'
      : 'border-[var(--color-border)]';
    const disabledClasses = 'disabled:bg-[var(--color-border-lighter)] disabled:cursor-not-allowed';

    return (
      <div className="relative">
        <select
          ref={ref}
          className={`${baseClasses} ${borderClass} ${focusClasses} ${disabledClasses} ${className}`}
          {...props}
        >
          {children}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';
