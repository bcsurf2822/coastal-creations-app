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
