'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/ui/Logo'
import type { Language } from '@/types'

export interface SidebarLink {
  href: string
  label: string
  icon?: React.ReactNode
}

export interface SidebarProps {
  links: SidebarLink[]
  locale: Language
}

/**
 * Apple-style Sidebar with frosted backdrop, rounded-xl links,
 * and clean active indicators.
 */
export function Sidebar({ links, locale }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed bottom-6 end-6 z-40 p-3 bg-brand-500 text-white rounded-full shadow-lg min-h-[48px] min-w-[48px] flex items-center justify-center cursor-pointer apple-press"
        aria-label="Toggle Navigation"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 z-30 bg-black/20 backdrop-blur-sm"
        />
      )}

      <aside
        className={`
          fixed md:static inset-y-0 start-0 z-30 w-64
          bg-white/85 backdrop-blur-xl
          border-e border-black/[0.06]
          transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-4 pt-20 md:pt-6 h-full overflow-y-auto">
          <div className="px-3 mb-6 hidden md:block">
            <Logo href={`/${locale}`} locale={locale} size="sm" />
          </div>
          <div className="px-3 mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Workspace
            </span>
          </div>

          <nav className="space-y-1">
            {links.map((link) => {
              const fullHref = `/${locale}${link.href}`
              const isActive =
                pathname === fullHref || pathname.startsWith(fullHref + '/')

              return (
                <Link
                  key={link.href}
                  href={fullHref}
                  className={`
                    flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm min-h-[44px]
                    ${
                      isActive
                        ? 'bg-brand-500/10 text-brand-600 font-semibold shadow-xs'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70 font-medium'
                    }
                  `}
                  onClick={() => setIsOpen(false)}
                >
                  {link.icon && <span className="w-5 h-5 shrink-0">{link.icon}</span>}
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}
