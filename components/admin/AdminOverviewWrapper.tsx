'use client'

import React, { useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MapPin } from 'lucide-react'
import { FALLBACK_BRANCHES } from '@/lib/data/fallback'
import type { Language, Dictionary } from '@/types'

export interface AdminOverviewWrapperProps {
  locale: Language
  dictionary?: Dictionary
  selectedBranchId?: string | null
  userRole?: string
  children: React.ReactNode
}

/**
 * Admin Overview Wrapper:
 * Provides scope bar integration in the topbar's sticky section.
 * Manages branch filtering state.
 */
export function AdminOverviewWrapper({
  locale,
  dictionary,
  selectedBranchId,
  userRole = 'admin',
  children,
}: AdminOverviewWrapperProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const isArabic = locale === 'ar'
  const d = dictionary?.admin_dashboard

  const isSuperadmin = userRole === 'admin'

  const handleBranchChange = (branchId: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams?.toString() || '')
      if (branchId === 'all') {
        params.delete('branch')
      } else {
        params.set('branch', branchId)
      }
      router.push(`/${locale}/admin?${params.toString()}`)
    })
  }

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Scope Bar — Sticky below topbar */}
      <div className="sticky top-15 z-20 -mt-1">
        <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 sm:p-3 rounded-2xl bg-white/80 dark:bg-[#142032]/80 backdrop-blur-md border border-black/[0.05] dark:border-white/5 shadow-2xs">
          {/* Branch Scope Selector */}
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-500 shrink-0 ms-1" />
            <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
              {isArabic ? 'نطاق العرض:' : 'Périmètre :'}
            </span>

            {isSuperadmin ? (
              <div className="relative">
                <select
                  value={selectedBranchId || 'all'}
                  onChange={(e) => handleBranchChange(e.target.value)}
                  disabled={isPending}
                  className={`text-xs font-bold text-neutral-900 dark:text-white bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200/60 dark:hover:bg-white/15 px-3 py-1.5 rounded-xl border-0 outline-none transition-colors ${
                    isPending ? 'opacity-50 cursor-wait pe-8' : 'cursor-pointer'
                  }`}
                >
                  <option value="all">
                    {d?.scope_all || (isArabic ? 'كل الجزائر (جميع الفروع)' : "Toute l'Algérie (Toutes les agences)")}
                  </option>
                  {FALLBACK_BRANCHES.map((b) => (
                    <option key={b.id} value={b.id}>
                      {isArabic ? b.name_ar : b.name_fr}
                    </option>
                  ))}
                </select>
                {isPending && (
                  <div className="absolute inset-y-0 end-2 flex items-center pointer-events-none">
                    <div className="w-3 h-3 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            ) : (
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 px-2 py-1 rounded-lg bg-neutral-100 dark:bg-white/10">
                {isArabic ? 'فرعك المعيّن' : 'Votre agence'}
              </span>
            )}
          </div>

          {/* Availability Guarantee Badge */}
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-neutral-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {isArabic ? 'بيانات مؤكدة ومحمية من الحجز المزدوج' : 'Disponibilité garantie sans double-réservation'}
            </span>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      {children}
    </div>
  )
}
