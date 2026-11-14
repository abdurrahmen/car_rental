'use client'

import React, { forwardRef, useId } from 'react'
import { Check } from 'lucide-react'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
}

/**
 * Unified checkbox with 44px touch target, brand-fill checked state,
 * and smooth transitions.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = '', label, description, id, checked, ...props }, ref) => {
    const defaultId = useId()
    const checkboxId = id || defaultId

    return (
      <div className="flex items-start gap-3">
        <div className="relative flex items-center justify-center">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            checked={checked}
            className={`
              peer appearance-none w-5 h-5 rounded-md border-2 border-neutral-300 dark:border-neutral-600
              bg-white dark:bg-neutral-800
              transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
              cursor-pointer
              hover:border-neutral-400 dark:hover:border-neutral-500
              focus:outline-none focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500
              checked:bg-brand-500 checked:border-brand-500
              checked:hover:bg-brand-600 checked:hover:border-brand-600
              disabled:cursor-not-allowed disabled:opacity-50
              ${className}
            `}
            {...props}
          />
          <Check 
            className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity duration-150"
            strokeWidth={3}
          />
        </div>
        
        {(label || description) && (
          <label
            htmlFor={checkboxId}
            className="flex-1 cursor-pointer select-none -mt-0.5"
            style={{ minHeight: '44px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          >
            {label && (
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100 block">
                {label}
              </span>
            )}
            {description && (
              <span className="text-xs text-neutral-500 dark:text-neutral-400 block mt-0.5 leading-relaxed">
                {description}
              </span>
            )}
          </label>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'
