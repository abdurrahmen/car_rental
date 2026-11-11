import React from 'react'
import Link from 'next/link'

export interface NavItemProps {
  href: string
  label: string
  icon?: React.ReactNode
  active?: boolean
  onClick?: () => void
  badge?: number | string
  badgeColor?: 'brand' | 'coral' | 'neutral'
  disabled?: boolean
  comingSoon?: boolean
  comingSoonLabel?: string
  className?: string
}

/**
 * DZRent Sidebar navigation item with badge, coming-soon indicators,
 * RTL logical borders, and dark mode support.
 */
export function NavItem({
  href,
  label,
  icon,
  active = false,
  onClick,
  badge,
  badgeColor = 'brand',
  disabled = false,
  comingSoon = false,
  comingSoonLabel = 'قريباً',
  className = '',
}: NavItemProps) {
  const content = (
    <>
      {icon && (
        <span
          className={`shrink-0 flex items-center justify-center w-5 h-5 [&>svg]:w-4.5 [&>svg]:h-4.5 [&>svg]:stroke-[1.75] transition-colors ${
            active
              ? 'text-brand-500 dark:text-brand-400'
              : 'text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-200'
          }`}
        >
          {icon}
        </span>
      )}
      <span className="truncate flex-1 text-start">{label}</span>

      {badge !== undefined && (
        <span
          className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold tabular-nums ${
            badgeColor === 'coral'
              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
              : badgeColor === 'brand'
              ? 'bg-brand-500 text-white'
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
          }`}
        >
          {badge}
        </span>
      )}

      {comingSoon && (
        <span className="shrink-0 px-1.5 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-wider bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500">
          {comingSoonLabel}
        </span>
      )}
    </>
  )

  if (disabled || comingSoon) {
    return (
      <div
        className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs min-h-[42px] select-none opacity-50 cursor-not-allowed text-neutral-400 dark:text-neutral-500 border-s-[3px] border-transparent ${className}`}
      >
        {content}
      </div>
    )
  }

  const activeStyles =
    'bg-brand-50/80 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300 font-semibold border-s-[3px] border-brand-500 shadow-2xs'
  const inactiveStyles =
    'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/70 dark:hover:bg-white/5 font-medium border-s-[3px] border-transparent'

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs min-h-[44px] transition-all select-none ${
        active ? activeStyles : inactiveStyles
      } ${className}`}
    >
      {content}
    </Link>
  )
}

