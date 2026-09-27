'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { LanguageSwitcher } from './LanguageSwitcher'
import { SignOutButton } from './SignOutButton'
import { MobileNav } from './MobileNav'
import { QuickReservationNav } from './QuickReservationNav'
import type { Branch, Language } from '@/types'

export interface HeaderNavClientProps {
  locale: Language
  branches: Branch[]
  navLinks: { href: string; label: string }[]
  isAuthenticated: boolean
  userRole: string
  dashboardHref: string
  dashboardLabel: string
  loginText: string
}

export function HeaderNavClient({
  locale,
  branches,
  navLinks,
  isAuthenticated,
  userRole,
  dashboardHref,
  dashboardLabel,
  loginText,
}: HeaderNavClientProps) {
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Switch when scrolled past the hero top search area (~280px)
      const scrolled = window.scrollY > 280
      setIsScrolledPastHero(scrolled)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="flex-1 flex items-center justify-between gap-4 ms-4 sm:ms-8">
      {/* State 1: Quick Reservation Form (Shown when scrolled) */}
      <div
        className={`transition-all duration-300 flex-1 flex items-center justify-end ${
          isScrolledPastHero
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-2 pointer-events-none hidden'
        }`}
      >
        <QuickReservationNav locale={locale} branches={branches} />
      </div>

      {/* State 2: Default Navigation Bar (Shown at top) */}
      <div
        className={`transition-all duration-300 flex-1 flex items-center justify-between gap-4 ${
          !isScrolledPastHero
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-2 pointer-events-none hidden'
        }`}
      >
        {/* Desktop Navigation links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 rounded-full text-xs lg:text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/80 transition-colors whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions: Language switcher, auth button, mobile drawer */}
        <div className="flex items-center gap-2 sm:gap-3 ms-auto">
          <LanguageSwitcher locale={locale} />

          {/* Desktop Auth Button */}
          <div className="hidden sm:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  href={dashboardHref}
                  className={`apple-press inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-full text-xs font-semibold tracking-tight transition-all shadow-sm min-h-[38px] ${
                    userRole === 'admin'
                      ? 'bg-brand-500 text-white hover:bg-brand-600'
                      : userRole === 'staff' || userRole === 'branch_manager'
                      ? 'bg-amber-600 text-white hover:bg-amber-700'
                      : 'bg-neutral-900 text-white hover:opacity-90'
                  }`}
                >
                  {userRole === 'admin' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
                  <span>{dashboardLabel}</span>
                </Link>
                <SignOutButton locale={locale} />
              </>
            ) : (
              <Link
                href={`/${locale}/login`}
                className="apple-press inline-flex items-center justify-center h-9 px-4 rounded-full text-xs font-semibold tracking-tight bg-brand-500 text-white hover:bg-brand-600 transition-all shadow-sm min-h-[38px]"
              >
                {loginText}
              </Link>
            )}
          </div>

          {/* Mobile Navigation Drawer Toggle */}
          <MobileNav
            locale={locale}
            links={navLinks}
            isAuthenticated={isAuthenticated}
            userRole={userRole}
            dashboardHref={dashboardHref}
            dashboardLabel={dashboardLabel}
            loginText={loginText}
          />
        </div>
      </div>
    </div>
  )
}
