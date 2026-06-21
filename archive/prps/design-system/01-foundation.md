# Phase 1: Foundation

> Create design token system and shared UI component library

---

## Overview

This phase establishes the foundation that all other phases depend on:
1. Update `globals.css` with complete design token set
2. Create reusable UI primitives in `components/ui/`

## Prerequisites

- Read `spec/design/FIGMA_DESIGN_SPEC.md` for complete token reference
- Understand current `app/globals.css` structure

---

## Tasks

### Task 1.1: UPDATE app/globals.css

Update CSS custom properties with full design token set.

**Action**: MODIFY `app/globals.css`
- **FIND**: Current `:root` block (lines 3-12)
- **REPLACE**: With complete token set below
- **PRESERVE**: `@import "tailwindcss"`, `@theme inline` block, footer animations
- **VALIDATE**: `npm run build`

```css
:root {
  /* Core Colors */
  --color-primary: #0c4a6e;
  --color-primary-dark: #073a58;
  --color-secondary: #0369a1;
  --color-accent: #fb923c;
  --color-light: #f0f9ff;

  /* Sand Tones */
  --color-sand-light: #ffd7b5;
  --color-sand-medium: #f5cca6;

  /* Text Colors */
  --color-text-primary: #111827;
  --color-text-secondary: #374151;
  --color-text-muted: #4b5563;
  --color-text-subtle: #6b7280;

  /* Border Colors */
  --color-border: #d1d5db;
  --color-border-light: #e5e7eb;
  --color-border-lighter: #f3f4f6;

  /* Semantic - Success */
  --color-success: #22c55e;
  --color-success-light: #dcfce7;
  --color-success-text: #166534;

  /* Semantic - Error */
  --color-error: #ef4444;
  --color-error-dark: #dc2626;
  --color-error-light: #fee2e2;
  --color-error-text: #991b1b;

  /* Semantic - Warning */
  --color-warning: #eab308;
  --color-warning-light: #fef9c3;
  --color-warning-text: #854d0e;

  /* Semantic - Info */
  --color-info: #3b82f6;
  --color-info-light: #dbeafe;
  --color-info-text: #1e40af;

  /* Supporting Blues (Gradients) */
  --color-blue-soft: #42A5F5;
  --color-blue-medium: #326C85;
  --color-blue-pale: #64B5F6;

  /* Gradients */
  --gradient-primary: linear-gradient(135deg, #326C85, #42A5F5, #64B5F6);
  --gradient-button: linear-gradient(135deg, #326C85, #4A90A4);
  --gradient-footer: linear-gradient(to right, #f5cca6, #ffd7b5);

  /* Shadows */
  --shadow-card: 0px 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-event-card: 0px 8px 24px 0px #42a5f5;
  --shadow-price-badge: 0px 4px 15px 0px #326c85;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-default: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  /* Base (keep existing) */
  --background: #ffffff;
  --foreground: #171717;
  --footer-height: 500px;
}
```

Also update the `@theme inline` block to include new tokens for Tailwind access.

---

### Task 1.2: CREATE components/ui/Button.tsx

Create the core Button component with all variants and sizes.

**Action**: CREATE `components/ui/Button.tsx`
- **PATTERN**: forwardRef, extend ButtonHTMLAttributes
- **IMPORTS**: React, clsx (or cn utility)
- **VALIDATE**: `npx tsc --noEmit`

```tsx
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'pill';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantClasses = {
  primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] border-transparent',
  secondary: 'bg-white text-[var(--color-primary)] border-2 border-[var(--color-primary)] hover:bg-[var(--color-light)]',
  ghost: 'bg-transparent text-[var(--color-primary)] border-transparent hover:bg-[var(--color-light)]',
  destructive: 'bg-[var(--color-error-dark)] text-white border-transparent hover:bg-[#b91c1c]',
  pill: 'bg-white text-[var(--color-primary)] border-2 border-[var(--color-primary)]/40 rounded-full hover:bg-[var(--color-light)]',
};

const sizeClasses = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-base',
  lg: 'h-12 px-6 text-base',
  xl: 'h-[60px] px-8 text-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    isLoading,
    leftIcon,
    rightIcon,
    className = '',
    disabled,
    children,
    ...props
  }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:opacity-50 disabled:cursor-not-allowed';
    const radiusClass = variant === 'pill' ? '' : 'rounded-[var(--radius-default)]';

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseClasses} ${radiusClass} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
        ) : leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

---

### Task 1.3: CREATE components/ui/Input.tsx

Create Input component with proper states.

**Action**: CREATE `components/ui/Input.tsx`
- **PATTERN**: forwardRef for react-hook-form compatibility
- **STATES**: default, focus, error, disabled
- **VALIDATE**: `npx tsc --noEmit`

```tsx
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
```

---

### Task 1.4: CREATE components/ui/Textarea.tsx

Create Textarea component.

**Action**: CREATE `components/ui/Textarea.tsx`
- **PATTERN**: Same as Input but for textarea
- **VALIDATE**: `npx tsc --noEmit`

```tsx
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
```

---

### Task 1.5: CREATE components/ui/Select.tsx

Create Select dropdown component.

**Action**: CREATE `components/ui/Select.tsx`
- **PATTERN**: Same styling as Input
- **VALIDATE**: `npx tsc --noEmit`

```tsx
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
```

---

### Task 1.6: CREATE components/ui/Label.tsx

Create form label component.

**Action**: CREATE `components/ui/Label.tsx`
- **VALIDATE**: `npx tsc --noEmit`

```tsx
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
```

---

### Task 1.7: CREATE components/ui/Card.tsx

Create Card component with variants.

**Action**: CREATE `components/ui/Card.tsx`
- **VARIANTS**: standard, featured, event
- **VALIDATE**: `npx tsc --noEmit`

```tsx
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
```

---

### Task 1.8: CREATE components/ui/Badge.tsx

Create status Badge component.

**Action**: CREATE `components/ui/Badge.tsx`
- **VARIANTS**: available, fewSpots, soldOut, newClass, upcoming
- **VALIDATE**: `npx tsc --noEmit`

```tsx
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
```

---

### Task 1.9: CREATE components/ui/PriceBadge.tsx

Create gradient price display component.

**Action**: CREATE `components/ui/PriceBadge.tsx`
- **VALIDATE**: `npx tsc --noEmit`

```tsx
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
```

---

### Task 1.10: CREATE components/ui/index.ts

Create barrel export for all UI components.

**Action**: CREATE `components/ui/index.ts`
- **VALIDATE**: `npx tsc --noEmit`

```tsx
export { Button, type ButtonProps } from './Button';
export { Input, type InputProps } from './Input';
export { Textarea, type TextareaProps } from './Textarea';
export { Select, type SelectProps } from './Select';
export { Label, type LabelProps } from './Label';
export { Card, type CardProps } from './Card';
export { Badge, type BadgeProps } from './Badge';
export { PriceBadge, type PriceBadgeProps } from './PriceBadge';
```

---

## Phase 1 Validation Checklist

```bash
# After all tasks complete:
npx tsc --noEmit              # No TypeScript errors
npm run lint                   # No lint errors
npm run build                  # Build succeeds
```

- [ ] `globals.css` updated with all design tokens
- [ ] `components/ui/Button.tsx` created and compiles
- [ ] `components/ui/Input.tsx` created and compiles
- [ ] `components/ui/Textarea.tsx` created and compiles
- [ ] `components/ui/Select.tsx` created and compiles
- [ ] `components/ui/Label.tsx` created and compiles
- [ ] `components/ui/Card.tsx` created and compiles
- [ ] `components/ui/Badge.tsx` created and compiles
- [ ] `components/ui/PriceBadge.tsx` created and compiles
- [ ] `components/ui/index.ts` exports all components
- [ ] Build passes with no errors

---

## Next Phase

Once Phase 1 is complete, proceed to `02-public-facing.md` to update customer-facing components.
