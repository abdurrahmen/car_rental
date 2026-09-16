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
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, id, options, ...props }, ref) => {
    const defaultId = useId()
    const selectId = id || defaultId

    return (
      <div className="w-full flex flex-col gap-1">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-neutral-700">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`
            flex w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 
            min-h-[44px]
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
            disabled:cursor-not-allowed disabled:opacity-50
            ${error ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500' : ''}
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-sm text-danger-500 mt-1">{error}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
