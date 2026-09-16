import React from 'react'

export interface CardProps {
  children: React.ReactNode
  className?: string
  header?: React.ReactNode
  footer?: React.ReactNode
}

export function Card({ children, className = '', header, footer }: CardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden ${className}`}>
      {header && (
        <div className="px-4 py-3 border-b border-neutral-200">
          {header}
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
      {footer && (
        <div className="px-4 py-3 border-t border-neutral-200 bg-neutral-50">
          {footer}
        </div>
      )}
    </div>
  )
}
