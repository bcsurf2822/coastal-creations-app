import { forwardRef, type TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className = '', ...props }, ref) => {
    const baseClasses = 'w-full min-h-[100px] p-4 bg-white border rounded-[var(--radius-default)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-subtle)] transition-colors resize-y';
    const focusClasses = 'focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:outline-none';
    const borderClass = error
      ? 'border-[var(--color-error)]'
      : 'border-[var(--color-border)]';
    const disabledClasses = 'disabled:bg-[var(--color-border-lighter)] disabled:cursor-not-allowed';

    return (
      <textarea
        ref={ref}
        className={`${baseClasses} ${borderClass} ${focusClasses} ${disabledClasses} ${className}`}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
