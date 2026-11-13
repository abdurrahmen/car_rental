import React from 'react'
import { SEMANTIC_COLORS } from '@/lib/utils/design-tokens'

export type StatusBadgeColor = 'success' | 'rented' | 'warning' | 'danger' | 'neutral' | 'green' | 'blue' | 'amber' | 'gray'

export interface StatusBadgeProps {
  color?: StatusBadgeColor
  status?: string
  children?: React.ReactNode
  showDot?: boolean
  className?: string
}

export function resolveStatusColor(status?: string): StatusBadgeColor {
  if (!status) return 'neutral'
  const normalized = status.toLowerCase().trim()

  switch (normalized) {
    case 'available':
    case 'completed':
      return 'success'
    case 'confirmed':
    case 'deposit_paid':
      return 'neutral'
    case 'rented':
    case 'on road':
    case 'on_road':
    case 'in progress':
    case 'in_progress':
    case 'active':
      return 'rented' // Violet, not blue
    case 'maintenance':
    case 'pending':
      return 'warning'
    case 'no_show':
      return 'danger'
    case 'retired':
    case 'cancelled':
    default:
      return 'neutral'
  }
}

// Map legacy color names to semantic tokens
function mapLegacyColor(color: StatusBadgeColor): keyof typeof SEMANTIC_COLORS.status {
  switch (color) {
    case 'green': return 'success'
    case 'blue': return 'rented'
    case 'amber': return 'warning'
    case 'gray': return 'neutral'
    default: return color as keyof typeof SEMANTIC_COLORS.status
  }
}

/**
 * StatusBadge with semantic design tokens
 * - success (green): Available, Completed
 * - rented (violet): Rented, On Road, Active  
 * - warning (amber): Maintenance, Pending
 * - danger (red): No Show
 * - neutral (gray): Retired, Cancelled, Confirmed
 */
export function StatusBadge({
  color,
  status,
  children,
  showDot = false,
  className = '',
}: StatusBadgeProps) {
  const effectiveColor = color || resolveStatusColor(status)
  const semanticColor = mapLegacyColor(effectiveColor)
  const colors = SEMANTIC_COLORS.status[semanticColor]

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold select-none leading-none ${className}`}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
      }}
    >
      {showDot && (
        <span 
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: colors.DEFAULT }}
        />
      )}
      <span>{children || status}</span>
    </span>
  )
}
