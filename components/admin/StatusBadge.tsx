import React from 'react'

export type StatusBadgeColor = 'green' | 'blue' | 'amber' | 'gray'

export interface StatusBadgeProps {
  color?: StatusBadgeColor
  status?: string
  children?: React.ReactNode
  showDot?: boolean
  className?: string
}

export function resolveStatusColor(status?: string): StatusBadgeColor {
  if (!status) return 'gray'
  const normalized = status.toLowerCase().trim()

  switch (normalized) {
    case 'available':
    case 'completed':
    case 'confirmed':
      return 'green'
    case 'rented':
    case 'on road':
    case 'on_road':
    case 'in progress':
    case 'in_progress':
    case 'active':
    case 'deposit_paid':
      return 'blue'
    case 'maintenance':
    case 'pending':
      return 'amber'
    case 'retired':
    case 'cancelled':
    case 'no_show':
    default:
      return 'gray'
  }
}

/**
 * Standard StatusBadge rounded-full pill component:
 * - green: bg-green-50 text-green-700 (Available, Completed)
 * - blue: bg-blue-50 text-blue-700 (Rented, On Road, In Progress, Active)
 * - amber: bg-amber-50 text-amber-700 (Maintenance, Pending)
 * - gray: bg-gray-100 text-gray-600 (Retired, Cancelled)
 */
export function StatusBadge({
  color,
  status,
  children,
  showDot = false,
  className = '',
}: StatusBadgeProps) {
  const effectiveColor = color || resolveStatusColor(status)

  const colorStyles: Record<StatusBadgeColor, { pill: string; dot: string }> = {
    green: {
      pill: 'bg-green-50 text-green-700',
      dot: 'bg-green-600',
    },
    blue: {
      pill: 'bg-blue-50 text-blue-700',
      dot: 'bg-blue-600',
    },
    amber: {
      pill: 'bg-amber-50 text-amber-700',
      dot: 'bg-amber-600',
    },
    gray: {
      pill: 'bg-gray-100 text-gray-600',
      dot: 'bg-gray-500',
    },
  }

  const { pill, dot } = colorStyles[effectiveColor]

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold select-none leading-none ${pill} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dot} shrink-0`} />}
      <span>{children || status}</span>
    </span>
  )
}
