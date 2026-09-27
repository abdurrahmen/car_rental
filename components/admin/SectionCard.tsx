import React from 'react'

export interface SectionCardProps {
  children: React.ReactNode
  className?: string
  hoverable?: boolean
  id?: string
}

/**
  * Standard SectionCard component adhering to the Donezo design system:
  * - rounded-2xl (16px radius)
  * - Layered soft shadow: 0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)
  * - Zero visible 1px border
  * - Consistent internal padding: p-4 md:p-6
  */
export function SectionCard({
  children,
  className = '',
  hoverable = false,
  id,
}: SectionCardProps) {
  return (
    <div
      id={id}
      className={`admin-card p-4 md:p-6 ${
        hoverable ? 'admin-card-hover cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
