'use client'

import React, { forwardRef, useId } from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

/**
 * Apple-style Input field with rounded-xl corners, smooth focus transitions,
 * and clear label hierarchy.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, helperText, id, ...props }, ref) => {
    const defaultId = useId()
    const inputId = id || defaultId

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-neutral-600 dark:text-neutral-300 ps-0.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            flex w-full rounded-xl border border-neutral-300/80 bg-white px-3.5 py-2.5 
            text-sm text-neutral-900 placeholder:text-neutral-400
            min-h-[44px] transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
            shadow-[0_1px_2px_rgba(0,0,0,0.02)]
            focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15
            disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-100/50
            ${
              error
                ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/15'
                : ''
            }
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-xs text-danger-600 font-medium ps-1 animate-apple-fade-in">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p className="text-xs text-neutral-500 ps-1">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
