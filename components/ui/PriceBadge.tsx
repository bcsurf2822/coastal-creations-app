import { forwardRef, type HTMLAttributes } from 'react';

export interface PriceBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  price: number | string;
}

export const PriceBadge = forwardRef<HTMLSpanElement, PriceBadgeProps>(
  ({ price, className = '', ...props }, ref) => {
    const formattedPrice = typeof price === 'number'
      ? `$${price}`
      : price.startsWith('$') ? price : `$${price}`;

    return (
      <span
        ref={ref}
        className={`inline-block bg-gradient-to-r from-[var(--color-blue-medium)] to-[#4A90A4] text-white rounded-[var(--radius-lg)] shadow-[var(--shadow-price-badge)] px-3 py-1.5 text-sm font-medium ${className}`}
        {...props}
      >
        {formattedPrice}
      </span>
    );
  }
);

PriceBadge.displayName = 'PriceBadge';
