import React from 'react';
import { twMerge } from 'tailwind-merge';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm',
  secondary: 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm',
  outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-2.5 py-1.5 text-xs rounded',
  md: 'px-3.5 py-2 text-sm rounded-md',
  lg: 'px-4 py-2.5 text-base rounded-md',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  disabled,
  icon,
  ...props
}) => {
  return (
    <button
      className={twMerge(
        'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500 disabled:opacity-50 disabled:pointer-events-none',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? 'w-full' : '',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {icon && !isLoading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};