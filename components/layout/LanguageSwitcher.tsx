'use client'

import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { Language } from '@/types'

export interface LanguageSwitcherProps {
  locale: Language
  className?: string
}

/**
 * Apple-style Language Switcher pill with smooth transitions.
 */
export function LanguageSwitcher({ locale, className = '' }: LanguageSwitcherProps) {
  const pathname = usePathname()
  const router = useRouter()

  const switchLocale = (newLocale: string) => {
    if (newLocale === locale) return
    const segments = pathname.split('/')
    segments[1] = newLocale
    router.push(segments.join('/'))
  }

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <select
        value={locale}
        onChange={(e) => switchLocale(e.target.value)}
        className="appearance-none bg-neutral-100/90 hover:bg-neutral-200/70 text-neutral-800 rounded-full px-3.5 pe-8 py-1.5 text-xs font-semibold tracking-tight border border-black/[0.06] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer min-h-[38px]"
        aria-label="Select language"
      >
        <option value="ar">العربية (AR)</option>
        <option value="fr">Français (FR)</option>
        <option value="en">English (EN)</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-2.5 text-neutral-500">
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  )
}
