'use client'

import { Check } from 'lucide-react'

export type StepStatus = 'todo' | 'active' | 'done'

export interface StepBadgeProps {
  number: number
  status: StepStatus
  className?: string
}

/**
 * Numbered step badge with todo/active/done states
 */
export function StepBadge({ number, status, className = '' }: StepBadgeProps) {
  return (
    <div
      className={`
        flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold
        transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${
          status === 'todo'
            ? 'border-2 border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400'
            : status === 'active'
            ? 'bg-brand-500 text-white shadow-sm'
            : 'bg-success-500 text-white shadow-sm'
        }
        ${className}
      `}
    >
      {status === 'done' ? (
        <Check className="w-3.5 h-3.5" strokeWidth={3} />
      ) : (
        <span>{number}</span>
      )}
    </div>
  )
}
