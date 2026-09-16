import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { getDictionaryByLocale } from '@/app/[lang]/dictionaries'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import type { Language, Branch } from '@/types'

interface StaffLayoutProps {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}

export default async function StaffLayout({
  children,
  params,
}: StaffLayoutProps) {
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
    .select('role, branch_id, branch:branches(*)')
    .eq('id', user.id)
    .single()

  if (
    !profile ||
    (profile.role !== 'staff' &&
      profile.role !== 'branch_manager' &&
      profile.role !== 'admin')
  ) {
    redirect(`/${lang}`)
  }

  const branch = profile.branch as unknown as Branch | null
  const branchName = branch
    ? locale === 'ar'
      ? branch.name_ar
      : locale === 'fr'
      ? branch.name_fr
      : branch.name_en
    : 'All Branches (Admin)'

  const isArabic = locale === 'ar'

  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-black text-neutral-900 flex flex-col">
      <Header locale={locale} dictionary={dict} />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col md:flex-row gap-8 w-full items-start">
        {/* Apple Staff Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-3">
          {/* Branch badge header */}
          <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-[0_4px_24px_-6px_rgba(0,0,0,0.04)]">
            <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold block">
              {dict.staff?.staff_dashboard || 'Staff Hub'}
            </span>
            <span className="text-sm font-bold text-neutral-900 dark:text-white block mt-1 tracking-tight">
              {branchName}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-2 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold capitalize">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
              {profile.role.replace('_', ' ')}
            </span>
          </div>

          {/* Navigation Links */}
          <div className="bg-white dark:bg-neutral-900 p-3 rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-[0_4px_24px_-6px_rgba(0,0,0,0.04)] space-y-1">
            <Link
              href={`/${lang}/staff`}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold hover:bg-neutral-100/80 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors min-h-[42px]"
            >
              <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{dict.staff?.pending_requests || 'Pending Bookings'}</span>
            </Link>

            <Link
              href={`/${lang}/staff/vehicles`}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold hover:bg-neutral-100/80 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors min-h-[42px]"
            >
              <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{dict.staff?.vehicle_management || 'Fleet Management'}</span>
            </Link>
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 w-full bg-white dark:bg-neutral-900 p-6 sm:p-8 rounded-3xl shadow-[0_4px_24px_-6px_rgba(0,0,0,0.04)] border border-black/[0.06] dark:border-white/[0.08]">
          {children}
        </main>
      </div>

      <Footer locale={locale} dictionary={dict} />
    </div>
  )
}
