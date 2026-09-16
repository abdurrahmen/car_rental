'use client'

import React, { forwardRef } from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'accent'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

/**
 * Apple-style Button with tactile press micro-interaction (active:scale-[0.98])
 * and smooth deceleration curves.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      fullWidth = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-45 disabled:pointer-events-none active:scale-[0.98] transform-gpu cursor-pointer select-none'

    const variants = {
      // Apple Signature Blue pill
      primary:
        'bg-brand-500 text-white shadow-sm hover:bg-brand-600 hover:shadow active:bg-brand-700 focus:ring-brand-500/50 rounded-full',
      // Apple Neutral secondary surface
      secondary:
        'bg-neutral-100 text-neutral-900 border border-black/[0.04] hover:bg-neutral-200/80 active:bg-neutral-200 focus:ring-neutral-400 rounded-full',
      // Clean hairline outline
      outline:
        'border border-neutral-300/80 bg-white/80 backdrop-blur-sm text-neutral-900 hover:bg-neutral-50 hover:border-neutral-400 active:bg-neutral-100 focus:ring-brand-500 rounded-full',
      // Soft red danger
      danger:
        'bg-danger-500 text-white shadow-sm hover:bg-danger-600 active:bg-danger-700 focus:ring-danger-500 rounded-full',
      // Ghost / text
      ghost:
        'text-neutral-700 hover:bg-neutral-100/80 hover:text-neutral-900 active:bg-neutral-200/60 focus:ring-neutral-400 rounded-full',
      // Amber highlight (for currency / special CTA)
      accent:
        'bg-accent-500 text-neutral-950 font-semibold shadow-sm hover:bg-accent-600 hover:shadow active:bg-accent-700 focus:ring-accent-500/50 rounded-full',
    }

    const sizes = {
      sm: 'h-9 px-3.5 text-xs min-h-[44px] tracking-tight gap-1.5',
      md: 'h-10 px-5 text-sm min-h-[44px] tracking-tight gap-2',
      lg: 'h-12 px-7 text-base min-h-[48px] tracking-tight gap-2.5',
    }

    const widthStyles = fullWidth ? 'w-full' : ''
    const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyles} ${className}`

    return (
      <button
        ref={ref}
        className={combinedClassName}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ms-1 me-2 h-4 w-4 text-current shrink-0"
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
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
