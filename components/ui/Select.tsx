'use client'

import React, { forwardRef, useId } from 'react'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
}

/**
 * Apple-style Select component with rounded-xl border and custom dropdown chevron.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, id, options, placeholder, ...props }, ref) => {
    const defaultId = useId()
    const selectId = id || defaultId

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-medium text-neutral-600 dark:text-neutral-300 ps-0.5"
          >
            {label}
          </label>
        )}
        <div className="relative w-full">
          <select
            ref={ref}
            id={selectId}
            className={`
              flex w-full appearance-none rounded-xl border border-neutral-300/80 bg-white dark:bg-neutral-900 
              px-3.5 pe-10 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 min-h-[44px]
              transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
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
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {/* Subtle dropdown arrow */}
          <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-3 text-neutral-400">
            <svg
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        {error && (
          <p className="text-xs text-danger-600 font-medium ps-1 animate-apple-fade-in">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
