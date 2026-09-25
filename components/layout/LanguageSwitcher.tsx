'use client'

import React, { useState, useRef, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { Language } from '@/types'

export interface LanguageSwitcherProps {
  locale: Language
  className?: string
}

const LANGUAGES = [
  { code: 'ar', label: 'العربية', short: 'AR' },
  { code: 'fr', label: 'Français', short: 'FR' },
  { code: 'en', label: 'English', short: 'EN' },
] as const

function setLocaleCookie(newLocale: string) {
  if (typeof document !== 'undefined') {
    document.cookie = `preferred_locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`
  }
}

/**
 * Apple-style Language Switcher pill with custom frosted glass popover menu,
 * rotating chevron, active checkmark, and cookie persistence.
 */
export function LanguageSwitcher({
  locale,
  className = '',
}: LanguageSwitcherProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const currentLang =
    LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0]

  const switchLocale = (newLocale: string) => {
    setIsOpen(false)
    if (newLocale === locale) return

    setLocaleCookie(newLocale)

    const segments = pathname.split('/')
    const nextPath = segments.map((seg, i) => (i === 1 ? newLocale : seg)).join('/')
    router.push(nextPath)
  }

  // Click outside and escape key handling
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div
      ref={menuRef}
      className={`relative inline-flex items-center ${className}`}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select language"
        className={`
          apple-press inline-flex items-center gap-1.5 bg-neutral-100/90 hover:bg-neutral-200/70 text-neutral-800
          rounded-full px-3.5 pe-2.5 py-1.5 text-xs font-semibold tracking-tight border border-black/[0.06]
          transition-all duration-200 min-h-[38px] cursor-pointer
          ${isOpen ? 'ring-2 ring-brand-500/20 bg-neutral-200/80 border-brand-500/30' : ''}
        `}
      >
        <span>
          {currentLang.label} ({currentLang.short})
        </span>
        <svg
          className={`w-3.5 h-3.5 text-neutral-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-brand-600' : ''
          }`}
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
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Select language"
          className="absolute top-full end-0 mt-1.5 w-44 overflow-hidden rounded-2xl bg-white/95 backdrop-blur-xl border border-black/[0.08] p-1.5 shadow-[0_16px_36px_-6px_rgba(0,0,0,0.14),0_0_0_1px_rgba(0,0,0,0.04)] z-50 animate-apple-fade-in"
        >
          {LANGUAGES.map((lang) => {
            const isSelected = lang.code === locale
            return (
              <button
                key={lang.code}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => switchLocale(lang.code)}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-start transition-colors cursor-pointer
                  ${
                    isSelected
                      ? 'bg-brand-500/10 text-brand-600 font-bold'
                      : 'text-neutral-700 hover:bg-neutral-100/80 hover:text-neutral-900'
                  }
                `}
              >
                <span>
                  {lang.label} ({lang.short})
                </span>
                {isSelected && (
                  <svg
                    className="w-3.5 h-3.5 text-brand-600 ms-2 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
