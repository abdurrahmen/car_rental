import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { getDictionaryByLocale } from '@/app/[lang]/dictionaries'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import type { Language, Branch } from '@/types'

import { getAuthUser } from '@/lib/auth'

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

  const user = await getAuthUser()
  const isAuthorized = user && ['staff', 'branch_manager', 'admin'].includes(user.role)

  if (!isAuthorized) {
    redirect(`/${lang}/login`)
  }

  let branch: Branch | null = null

  if (user.branch_id) {
    const { data: dbBranch } = await supabase
      .from('branches')
      .select('*')
      .eq('id', user.branch_id)
      .single()
    branch = dbBranch
  }

  if (!branch) {
    // Fallback branch
    branch = {
      id: '10000000-0000-0000-0000-000000000001',
      name_ar: 'وكالة الجزائر وسط - ديدوش مراد',
      name_fr: 'Agence Alger Centre - Didouche Mourad',
      name_en: 'Algiers Central Agency - Didouche Mourad',
      address: '142 Rue Didouche Mourad, Alger-Centre',
      city: 'Alger',
      phone: '+213 21 74 12 30',
      lat: 36.7683,
      lng: 3.0543,
      is_active: true,
      created_at: '',
      updated_at: '',
    }
  }
  const branchName = branch
    ? locale === 'ar'
      ? branch.name_ar
      : locale === 'fr'
      ? branch.name_fr
      : branch.name_en
    : 'All Branches (Admin)'

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-neutral-900 flex flex-col">
      <Header locale={locale} dictionary={dict} />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col md:flex-row gap-8 w-full items-start">
        {/* Apple Staff Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-3">
          {/* Branch badge header */}
          <div className="bg-white p-6 rounded-3xl border border-black/[0.06] shadow-[0_4px_24px_-6px_rgba(0,0,0,0.04)]">
            <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold block">
              {dict.staff?.staff_dashboard || 'Staff Hub'}
            </span>
            <span className="text-sm font-bold text-neutral-900 block mt-1 tracking-tight">
              {branchName}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-2 rounded-full bg-brand-500/10 text-brand-600 text-xs font-semibold capitalize">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
              {user.role.replace('_', ' ')}
            </span>
          </div>

          {/* Navigation Links */}
          <div className="bg-white p-3 rounded-3xl border border-black/[0.06] shadow-[0_4px_24px_-6px_rgba(0,0,0,0.04)] space-y-1">
            <Link
              href={`/${lang}/staff`}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold hover:bg-neutral-100/80 text-neutral-800 transition-colors min-h-[42px]"
            >
              <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{dict.staff?.pending_requests || 'Pending Bookings'}</span>
            </Link>

            <Link
              href={`/${lang}/staff/vehicles`}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold hover:bg-neutral-100/80 text-neutral-800 transition-colors min-h-[42px]"
            >
              <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{dict.staff?.vehicle_management || 'Fleet Management'}</span>
            </Link>
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 w-full bg-white p-6 sm:p-8 rounded-3xl shadow-[0_4px_24px_-6px_rgba(0,0,0,0.04)] border border-black/[0.06]">
          {children}
        </main>
      </div>

      <Footer locale={locale} dictionary={dict} />
    </div>
  )
}
