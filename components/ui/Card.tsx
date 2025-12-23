import { forwardRef, type HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'standard' | 'featured' | 'event';
}

const variantClasses = {
  standard: 'bg-white rounded-[var(--radius-md)] p-6',
  featured: 'bg-white border border-[var(--color-border-lighter)] rounded-[var(--radius-lg)] p-6',
  event: 'bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-event-card)] p-6',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'standard', className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${variantClasses[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
