'use client'

import React, { forwardRef, useId } from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, id, ...props }, ref) => {
    const defaultId = useId()
    const inputId = id || defaultId

    return (
      <div className="w-full flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-neutral-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            flex w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 
            min-h-[44px]
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
            disabled:cursor-not-allowed disabled:opacity-50
            ${error ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-sm text-danger-500 mt-1">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
