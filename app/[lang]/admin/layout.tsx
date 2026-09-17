import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { getDictionaryByLocale } from '@/app/[lang]/dictionaries'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import type { Language } from '@/types'

interface AdminLayoutProps {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}

export default async function AdminLayout({
  children,
  params,
}: AdminLayoutProps) {
  const { lang } = await params
  const locale = lang as Language
  const dict = await getDictionaryByLocale(lang)
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/${lang}/login`)

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect(`/${lang}/dashboard`)
  }

  const isArabic = locale === 'ar'

  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-black text-neutral-900 flex flex-col">
      <Header locale={locale} dictionary={dict} />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col md:flex-row gap-8 w-full items-start">
        {/* Apple Admin Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-3">
          <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-[0_4px_24px_-6px_rgba(0,0,0,0.04)]">
            <span className="text-[11px] uppercase tracking-wider text-purple-600 dark:text-purple-400 font-semibold block">
              {isArabic ? 'الإدارة المركزية' : 'Platform Control'}
            </span>
            <span className="text-base font-bold text-neutral-900 dark:text-white block mt-1 tracking-tight">
              {dict.admin?.admin_dashboard || 'Admin Console'}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-2 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
              Superadmin
            </span>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-3 rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-[0_4px_24px_-6px_rgba(0,0,0,0.04)] space-y-1">
            <Link
              href={`/${lang}/admin`}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold hover:bg-neutral-100/80 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors min-h-[42px]"
            >
              <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>{dict.dashboard?.overview || 'System Overview'}</span>
            </Link>

            <Link
              href={`/${lang}/admin/vehicles`}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold hover:bg-neutral-100/80 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors min-h-[42px]"
            >
              <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span>{dict.admin?.manage_fleet || 'National Fleet'}</span>
            </Link>

            <Link
              href={`/${lang}/admin/branches`}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold hover:bg-neutral-100/80 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors min-h-[42px]"
            >
              <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>{dict.admin?.manage_branches || 'Branches'}</span>
            </Link>

            <Link
              href={`/${lang}/admin/staff`}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold hover:bg-neutral-100/80 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors min-h-[42px]"
            >
              <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>{dict.admin?.manage_staff || 'Staff & Managers'}</span>
            </Link>

            <Link
              href={`/${lang}/admin/reservations`}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold hover:bg-neutral-100/80 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors min-h-[42px]"
            >
              <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>{dict.admin?.all_reservations || 'National Bookings'}</span>
            </Link>
          </div>
        </aside>

        {/* Main Admin Workspace */}
        <main className="flex-1 w-full bg-white dark:bg-neutral-900 p-6 sm:p-8 rounded-3xl shadow-[0_4px_24px_-6px_rgba(0,0,0,0.04)] border border-black/[0.06] dark:border-white/[0.08]">
          {children}
        </main>
      </div>

      <Footer locale={locale} dictionary={dict} />
    </div>
  )
}
