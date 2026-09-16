'use client'

import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { Language } from '@/types'

export interface LanguageSwitcherProps {
  locale: Language
}

export function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const pathname = usePathname()
  const router = useRouter()

  const switchLocale = (newLocale: string) => {
    if (newLocale === locale) return
    const segments = pathname.split('/')
    segments[1] = newLocale
    router.push(segments.join('/'))
  }

  return (
    <div className="relative inline-block text-left">
      <select
        value={locale}
        onChange={(e) => switchLocale(e.target.value)}
        className="appearance-none bg-brand-800 text-white rounded-lg px-3 py-2 pe-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent-500 min-h-[44px]"
      >
        <option value="en">EN</option>
        <option value="fr">FR</option>
        <option value="ar">AR</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center px-2 text-white">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}
