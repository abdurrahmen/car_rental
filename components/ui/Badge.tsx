import React from 'react'

export interface BadgeProps {
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info' | 'neutral'
  className?: string
  children: React.ReactNode
}

export function Badge({ variant = 'default', className = '', children }: BadgeProps) {
  const baseStyles = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold'
  
  const variants = {
    default: 'bg-brand-100 text-brand-800',
    success: 'bg-success-100 text-success-800',
    danger: 'bg-danger-100 text-danger-800',
    warning: 'bg-warning-100 text-warning-800',
    info: 'bg-info-100 text-info-800',
    neutral: 'bg-neutral-100 text-neutral-800',
  }
  
  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
