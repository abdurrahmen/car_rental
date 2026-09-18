import React from 'react'

export interface CardProps {
  children: React.ReactNode
  className?: string
  header?: React.ReactNode
  footer?: React.ReactNode
  hoverable?: boolean
  frosted?: boolean
}

/**
 * Apple-style Card component with rounded-2xl corners, sub-pixel border,
 * optional subtle lift hover state, and frosted glass support.
 */
export function Card({
  children,
  className = '',
  header,
  footer,
  hoverable = false,
  frosted = false,
}: CardProps) {
  const bgStyles = frosted
    ? 'glass-card shadow-sm'
    : 'bg-white border border-black/[0.06] shadow-[0_4px_24px_-6px_rgba(0,0,0,0.04)]'

  const hoverStyles = hoverable ? 'apple-card-hover cursor-pointer' : ''

  return (
    <div
      className={`rounded-3xl overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${bgStyles} ${hoverStyles} ${className}`}
    >
      {header && (
        <div className="px-5 py-4 border-b border-black/[0.05] flex items-center justify-between">
          {header}
        </div>
      )}
      <div className="p-5 sm:p-6">{children}</div>
      {footer && (
        <div className="px-5 py-3.5 border-t border-black/[0.05] bg-neutral-50/60">
          {footer}
        </div>
      )}
    </div>
  )
}
