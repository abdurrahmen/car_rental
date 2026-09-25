import React from 'react'
import Link from 'next/link'
import { LanguageSwitcher } from './LanguageSwitcher'
import { SignOutButton } from './SignOutButton'
import { MobileNav } from './MobileNav'
import { Logo } from '@/components/ui/Logo'
import { HeaderNavClient } from './HeaderNavClient'
import { getAuthUser } from '@/lib/auth'
import { FALLBACK_BRANCHES } from '@/lib/data/fallback'
import type { Language, Dictionary, Branch } from '@/types'

export interface HeaderProps {
  locale?: Language
  lang?: Language
  dictionary?: Dictionary
  dict?: Dictionary
  branches?: Branch[]
}

/**
 * Apple-style frosted glass navigation bar with trilingual navigation links,
 * subpixel border, refined pill action buttons, and responsive mobile drawer.
 */
export async function Header({ locale, lang, dictionary, dict, branches }: HeaderProps) {
  const effectiveLocale = (locale || lang || 'ar') as Language
  const effectiveDict = dictionary || dict
  const effectiveBranches = branches && branches.length > 0 ? branches : FALLBACK_BRANCHES

  const authUser = await getAuthUser()

  const loginText = effectiveDict?.auth?.login || 'Sign In'
  const dashboardText = effectiveDict?.nav?.dashboard || 'Dashboard'

  const userRole = authUser?.role || 'customer'
  const isAuthenticated = Boolean(authUser)

  const dashboardHref =
    userRole === 'admin'
      ? `/${effectiveLocale}/admin`
      : userRole === 'staff' || userRole === 'branch_manager'
      ? `/${effectiveLocale}/staff`
      : `/${effectiveLocale}/dashboard`

  const dashboardLabel =
    userRole === 'admin'
      ? effectiveDict?.admin?.admin_dashboard || 'Admin Console'
      : userRole === 'staff' || userRole === 'branch_manager'
      ? effectiveDict?.staff?.staff_dashboard || 'Staff Portal'
      : dashboardText

  // Navigation Links
  const navLinks = [
    {
      href: `/${effectiveLocale}/vehicles`,
      label:
        effectiveDict?.vehicles?.browse_vehicles ||
        effectiveDict?.nav?.vehicles ||
        (effectiveLocale === 'ar'
          ? 'الأسطول'
          : effectiveLocale === 'fr'
          ? 'Véhicules'
          : 'Fleet'),
    },
    {
      href: `/${effectiveLocale}#how-it-works`,
      label:
        effectiveLocale === 'ar'
          ? 'مسار الحجز'
          : effectiveLocale === 'fr'
          ? 'Comment ça marche'
          : 'How It Works',
    },
    {
      href: `/${effectiveLocale}#hubs`,
      label:
        effectiveDict?.nav?.branches ||
        (effectiveLocale === 'ar'
          ? 'المطارات والفروع'
          : effectiveLocale === 'fr'
          ? 'Agences & Hubs'
          : 'Hubs & Agencies'),
    },
    {
      href: `/${effectiveLocale}#guarantee`,
      label:
        effectiveLocale === 'ar'
          ? 'الضمان الرقمي'
          : effectiveLocale === 'fr'
          ? 'Garantie PV'
          : 'Digital Guarantee',
    },
  ]

  return (
    <header className="glass-nav sticky top-0 z-50 w-full transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo - Always retained on the start */}
        <div className="shrink-0">
          <Logo
            href={`/${effectiveLocale}`}
            locale={effectiveLocale}
            size="md"
          />
        </div>

        {/* Dynamic Navigation: standard links at top, quick reservation bar on scroll */}
        <HeaderNavClient
          locale={effectiveLocale}
          branches={effectiveBranches}
          navLinks={navLinks}
          isAuthenticated={isAuthenticated}
          userRole={userRole}
          dashboardHref={dashboardHref}
          dashboardLabel={dashboardLabel}
          loginText={loginText}
        />
      </div>
    </header>
  )
}
