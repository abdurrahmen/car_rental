'use client'

import React from 'react'
import { AlertCircle } from 'lucide-react'

export interface FieldProps {
  label?: string
  error?: string
  helper?: string
  optional?: boolean
  required?: boolean
  children: React.ReactNode
  className?: string
}

/**
 * Unified field wrapper for all form controls.
 * Provides consistent label, error, and helper text styling.
 */
export function Field({
  label,
  error,
  helper,
  optional = false,
  required = false,
  children,
  className = '',
}: FieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {label}
          {optional && (
            <span className="text-xs font-normal text-neutral-500 dark:text-neutral-400 ms-1.5">
              (optionnel)
            </span>
          )}
          {required && !optional && (
            <span className="text-red-500 ms-1" aria-label="requis">
              *
            </span>
          )}
        </label>
      )}
      
      {children}
      
      {error && (
        <div className="flex items-start gap-1.5 text-xs text-danger-600 dark:text-danger-400 font-medium animate-apple-fade-in">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      
      {!error && helper && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
          {helper}
        </p>
      )}
    </div>
  )
}
