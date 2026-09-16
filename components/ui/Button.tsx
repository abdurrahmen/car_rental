'use client'

import React, { forwardRef } from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

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
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'
    
    const variants = {
      primary: 'bg-accent-500 text-brand-900 hover:bg-accent-600 focus:ring-accent-500',
      secondary: 'bg-brand-800 text-white hover:bg-brand-700 focus:ring-brand-800',
      outline: 'border border-brand-300 text-brand-900 hover:bg-neutral-50 focus:ring-brand-500',
      danger: 'bg-danger-500 text-white hover:bg-danger-600 focus:ring-danger-500',
      ghost: 'hover:bg-neutral-100 text-brand-900 focus:ring-brand-500',
    }
    
    const sizes = {
      sm: 'h-9 px-3 text-sm min-h-[44px]',
      md: 'h-10 px-4 py-2 min-h-[44px]',
      lg: 'h-11 px-8 text-lg min-h-[44px]',
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
          <svg className="animate-spin -ms-1 me-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
