import React from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LanguageSwitcher } from './LanguageSwitcher'
import { Logo } from '@/components/ui/Logo'
import type { Language, Dictionary } from '@/types'

export interface HeaderProps {
  locale?: Language
  lang?: Language
  dictionary?: Dictionary
  dict?: Dictionary
}

/**
 * Apple-style frosted glass navigation bar with subpixel border
 * and refined pill action buttons.
 */
export async function Header({ locale, lang, dictionary, dict }: HeaderProps) {
  const effectiveLocale = (locale || lang || 'ar') as Language
  const effectiveDict = dictionary || dict

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const appName = effectiveDict?.common?.app_name || 'DZ Rent'
  const browseVehicles =
    effectiveDict?.vehicles?.browse_vehicles || 'Vehicles'
  const loginText = effectiveDict?.auth?.login || 'Sign In'
  const dashboardText = effectiveDict?.nav?.dashboard || 'Dashboard'

  let userRole = 'customer'
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role) {
      userRole = profile.role
    }
  }

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

  return (
    <header className="glass-nav sticky top-0 z-50 w-full transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Logo
            href={`/${effectiveLocale}`}
            locale={effectiveLocale}
            size="md"
          />

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href={`/${effectiveLocale}/vehicles`}
              className="px-3 py-1.5 rounded-full text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 hover:bg-neutral-100/80 dark:hover:bg-neutral-800 transition-colors"
            >
              {browseVehicles}
            </Link>
          </nav>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher locale={effectiveLocale} />

          <div className="flex items-center">
            {user ? (
              <Link
                href={dashboardHref}
                className={`apple-press inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-full text-xs font-semibold tracking-tight transition-all shadow-sm min-h-[38px] ${
                  userRole === 'admin'
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : userRole === 'staff' || userRole === 'branch_manager'
                    ? 'bg-amber-600 text-white hover:bg-amber-700'
                    : 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90'
                }`}
              >
                {userRole === 'admin' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                )}
                <span>{dashboardLabel}</span>
              </Link>
            ) : (
              <Link
                href={`/${effectiveLocale}/login`}
                className="apple-press inline-flex items-center justify-center h-9 px-4 rounded-full text-xs font-semibold tracking-tight bg-brand-500 text-white hover:bg-brand-600 transition-all shadow-sm min-h-[38px]"
              >
                {loginText}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
