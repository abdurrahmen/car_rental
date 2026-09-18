import React from 'react'

export interface BadgeProps {
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info' | 'neutral'
  className?: string
  children: React.ReactNode
  showDot?: boolean
}

/**
 * Apple-style Pill Badge with translucent backdrop and subtle dot indicator.
 */
export function Badge({
  variant = 'default',
  className = '',
  children,
  showDot = false,
}: BadgeProps) {
  const baseStyles =
    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium tracking-tight transition-colors duration-200 select-none'

  const variants = {
    default: 'bg-brand-500/10 text-brand-600 border border-brand-500/20',
    success: 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20',
    danger: 'bg-rose-500/10 text-rose-700 border border-rose-500/20',
    warning: 'bg-amber-500/10 text-amber-800 border border-amber-500/25',
    info: 'bg-blue-500/10 text-blue-700 border border-blue-500/20',
    neutral: 'bg-neutral-500/10 text-neutral-700 border border-neutral-500/15',
  }

  const dotVariants = {
    default: 'bg-brand-500',
    success: 'bg-emerald-500',
    danger: 'bg-rose-500',
    warning: 'bg-amber-500',
    info: 'bg-blue-500',
    neutral: 'bg-neutral-400',
  }

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {showDot && (
        <span
          className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotVariants[variant]}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
}
