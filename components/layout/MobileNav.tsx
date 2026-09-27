'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Language } from '@/types'

export interface MobileNavLink {
  href: string
  label: string
}

export interface MobileNavProps {
  locale: Language
  links: MobileNavLink[]
  isAuthenticated: boolean
  userRole?: string
  dashboardHref: string
  dashboardLabel: string
  loginText: string
}

/**
 * Apple-style responsive mobile navigation drawer with backdrop blur,
 * animated slide-out, smooth navigation, and direct action triggers.
 */
export function MobileNav({
  locale,
  links,
  isAuthenticated,
  userRole,
  dashboardHref,
  dashboardLabel,
  loginText,
}: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Auto-close drawer on route change
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(false)
    }, 0)
    return () => clearTimeout(timer)
  }, [pathname])

  // Prevent background scrolling while drawer is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  return (
    <div className="md:hidden flex items-center">
      {/* Mobile Hamburger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open navigation menu"
        className="apple-press p-2 rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/80 transition-colors cursor-pointer"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>

      {/* Drawer Overlay & Content */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-apple-fade-in"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-out Sheet */}
          <div
            className={`
              relative z-50 w-72 max-w-[85vw] bg-white h-full shadow-2xl p-6 flex flex-col justify-between
              ${locale === 'ar' ? 'ms-auto' : 'me-auto'}
              animate-apple-fade-in
            `}
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-5 border-b border-black/[0.06]">
                <span className="font-heading font-bold text-base text-neutral-900 tracking-tight">
                  DZ<span className="text-brand-500">RENT</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="mt-6 flex flex-col gap-1.5">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-semibold text-neutral-800 hover:text-neutral-950 hover:bg-neutral-100/80 transition-colors"
                  >
                    <span>{link.label}</span>
                    <span className="text-neutral-400 text-xs rtl:rotate-180">
                      →
                    </span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-black/[0.06] flex flex-col gap-3">
              {isAuthenticated ? (
                <Link
                  href={dashboardHref}
                  onClick={() => setIsOpen(false)}
                  className={`apple-press flex items-center justify-center gap-2 h-11 px-4 rounded-xl text-xs font-semibold tracking-tight text-white transition-all shadow-sm ${
                    userRole === 'admin'
                      ? 'bg-brand-500 hover:bg-brand-600'
                      : userRole === 'staff' || userRole === 'branch_manager'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-neutral-900 hover:opacity-90'
                  }`}
                >
                  {userRole === 'admin' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
                  <span>{dashboardLabel}</span>
                </Link>
              ) : (
                <Link
                  href={`/${locale}/login`}
                  onClick={() => setIsOpen(false)}
                  className="apple-press flex items-center justify-center h-11 px-4 rounded-xl text-xs font-semibold tracking-tight bg-brand-500 text-white hover:bg-brand-600 transition-all shadow-sm"
                >
                  {loginText}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
