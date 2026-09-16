'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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

export function Sidebar({ links, locale }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-20 start-4 z-40 p-2 bg-brand-900 text-white rounded-lg shadow-md min-h-[44px] min-w-[44px] flex items-center justify-center"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <aside className={`
        fixed md:static inset-y-0 start-0 z-30 w-64 bg-brand-900 text-white transform transition-transform duration-300 ease-in-out border-e border-brand-800
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 pt-20 md:pt-4 h-full overflow-y-auto">
          <nav className="space-y-1">
            {links.map((link) => {
              const fullHref = `/${locale}${link.href}`
              const isActive = pathname === fullHref || pathname.startsWith(fullHref + '/')
              
              return (
                <Link
                  key={link.href}
                  href={fullHref}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg transition-colors min-h-[44px]
                    ${isActive ? 'bg-brand-800 text-accent-400 font-medium' : 'text-neutral-300 hover:bg-brand-800 hover:text-white'}
                  `}
                  onClick={() => setIsOpen(false)}
                >
                  {link.icon && <span className="w-5 h-5">{link.icon}</span>}
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
