import { forwardRef, type HTMLAttributes } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant: 'available' | 'fewSpots' | 'soldOut' | 'newClass' | 'upcoming';
  showDot?: boolean;
}

const variantClasses = {
  available: {
    bg: 'bg-[var(--color-success-light)]',
    text: 'text-[var(--color-success-text)]',
    dot: 'bg-[var(--color-success)]',
  },
  fewSpots: {
    bg: 'bg-[var(--color-warning-light)]',
    text: 'text-[var(--color-warning-text)]',
    dot: 'bg-[var(--color-warning)]',
  },
  soldOut: {
    bg: 'bg-[var(--color-error-light)]',
    text: 'text-[var(--color-error-text)]',
    dot: 'bg-[var(--color-error)]',
  },
  newClass: {
    bg: 'bg-[var(--color-info-light)]',
    text: 'text-[var(--color-info-text)]',
    dot: 'bg-[var(--color-info)]',
  },
  upcoming: {
    bg: 'bg-[var(--color-border-lighter)]',
    text: 'text-[var(--color-text-primary)]',
    dot: 'bg-[var(--color-text-subtle)]',
  },
};

const labels = {
  available: 'Available',
  fewSpots: 'Few Spots Left',
  soldOut: 'Sold Out',
  newClass: 'New Class',
  upcoming: 'Upcoming',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant, showDot = true, className = '', children, ...props }, ref) => {
    const classes = variantClasses[variant];

    return (
      <span
        ref={ref}
        className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm rounded-full ${classes.bg} ${classes.text} ${className}`}
        {...props}
      >
        {showDot && (
          <span className={`w-2 h-2 rounded-full ${classes.dot}`} />
        )}
        {children || labels[variant]}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
