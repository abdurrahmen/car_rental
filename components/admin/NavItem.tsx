import React from 'react'
import Link from 'next/link'

export interface NavItemProps {
  href: string
  label: string
  icon?: React.ReactNode
  active?: boolean
  onClick?: () => void
  className?: string
}

/**
 * Sidebar navigation item adhering to the Donezo design system:
 * - Fixed height min-h-[44px]
 * - Active: light blue tint background (bg-blue-50) + 3px solid blue start bar + blue-700 text & icon
 * - Inactive: text-neutral-500 hover:bg-neutral-100/70 hover:text-neutral-900
 * - RTL compatible via border-s-[3px]
 */
export function NavItem({
  href,
  label,
  icon,
  active = false,
  onClick,
  className = '',
}: NavItemProps) {
  const content = (
    <>
      {icon && (
        <span
          className={`shrink-0 flex items-center justify-center w-5 h-5 [&>svg]:w-5 [&>svg]:h-5 [&>svg]:stroke-[1.75] transition-colors ${
            active ? 'text-brand-500' : 'text-neutral-400 group-hover:text-neutral-700'
          }`}
        >
          {icon}
        </span>
      )}
      <span className="truncate">{label}</span>
    </>
  )

  const activeStyles =
    'bg-blue-50 text-blue-700 font-semibold border-s-[3px] border-brand-500 shadow-2xs'
  const inactiveStyles =
    'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/70 font-medium border-s-[3px] border-transparent'

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
