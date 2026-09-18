import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { getDictionaryByLocale } from '@/app/[lang]/dictionaries'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import type { Language } from '@/types'

interface DashboardLayoutProps {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}

import { getAuthUser } from '@/lib/auth'

export default async function DashboardLayout({
  children,
  params,
}: DashboardLayoutProps) {
  const { lang } = await params
  const locale = lang as Language
  const dict = await getDictionaryByLocale(lang)

  const user = await getAuthUser()

  if (!user) {
    redirect(`/${lang}/login`)
  }

  const role = user.role

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-neutral-900 flex flex-col">
      <Header locale={locale} dictionary={dict} />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col md:flex-row gap-8 w-full items-start">
        {/* Apple Dashboard Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-2">
          {role === 'admin' && (
            <div className="p-4 rounded-3xl bg-purple-500/10 border border-purple-500/20 text-xs space-y-2">
              <span className="font-bold text-purple-700 block">
                🛡️ Platform Administrator
              </span>
              <p className="text-[11px] text-neutral-500 leading-snug">
                You have superadmin rights to manage vehicles, branches, and bookings.
              </p>
              <Link
                href={`/${lang}/admin`}
                className="apple-press inline-flex items-center gap-1 font-bold text-purple-600 hover:underline pt-1"
              >
                Go to Admin Console &rarr;
              </Link>
            </div>
          )}

          <div className="bg-white p-4 rounded-3xl border border-black/[0.06] shadow-[0_4px_24px_-6px_rgba(0,0,0,0.04)] space-y-1">
            <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              {locale === 'ar' ? 'حسابي' : 'Customer Account'}
            </div>

            <Link
              href={`/${lang}/dashboard`}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold hover:bg-neutral-100/80 text-neutral-800 transition-colors min-h-[42px]"
            >
              <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>{dict.dashboard?.overview || 'Overview'}</span>
            </Link>

            <Link
              href={`/${lang}/dashboard/reservations`}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold hover:bg-neutral-100/80 text-neutral-800 transition-colors min-h-[42px]"
            >
              <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{dict.dashboard?.my_reservations || 'My Bookings'}</span>
            </Link>

            <Link
              href={`/${lang}/dashboard/profile`}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold hover:bg-neutral-100/80 text-neutral-800 transition-colors min-h-[42px]"
            >
              <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{dict.dashboard?.profile || 'Profile & License'}</span>
            </Link>
          </div>
        </aside>

        {/* Main Dashboard Canvas */}
        <main className="flex-1 w-full bg-white p-6 sm:p-8 rounded-3xl shadow-[0_4px_24px_-6px_rgba(0,0,0,0.04)] border border-black/[0.06]">
          {children}
        </main>
      </div>

      <Footer locale={locale} dictionary={dict} />
    </div>
  )
}
