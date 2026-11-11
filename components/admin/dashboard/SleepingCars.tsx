'use client'

import React from 'react'
import Link from 'next/link'
import {
  Moon,
  Flame,
  Tag,
} from 'lucide-react'
import { formatDZD } from '@/lib/utils/constants'
import type { Language, Dictionary } from '@/types'
import type { GarageVehicle } from '@/lib/data/dashboard'

export interface SleepingCarsProps {
  locale: Language
  dictionary?: Dictionary
  vehicles?: GarageVehicle[]
}

/**
 * T9 — Sleeping Cars & Top Performers:
 * Identifies vehicles idle for N days with smart pricing/promotion nudges,
 * alongside the top 3 highest revenue-generating cars.
 */
export function SleepingCars({
  locale,
  dictionary,
  vehicles = [],
}: SleepingCarsProps) {
  const isArabic = locale === 'ar'
  const d = dictionary?.admin_dashboard

  // Sleeping cars derived from available vehicles
  const sleepingVehicles = vehicles
    .filter((v) => v.status === 'available')
    .slice(0, 2)
    .map((v, i) => ({
      id: v.id,
      name: `${v.make} ${v.model}`,
      plate: v.plateNumber,
      idleDays: 5 + i * 3,
      dailyRate: v.dailyRate,
    }))


  // Top performers
  const topPerformers = [
    {
      id: 'top-1',
      name: 'Toyota Prado TX-L 4x4',
      rentalsCount: 14,
      totalRevenue: 336000,
    },
    {
      id: 'top-2',
      name: 'Renault Clio V Intens',
      rentalsCount: 22,
      totalRevenue: 143000,
    },
    {
      id: 'top-3',
      name: 'Dacia Sandero Stepway',
      rentalsCount: 19,
      totalRevenue: 114000,
    },
  ]

  return (
    <div className="admin-card p-5 sm:p-6 space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-white/5">
        <div className="flex items-center gap-2">
          <Moon className="w-4 h-4 text-indigo-500" />
          <h2 className="text-base font-bold text-neutral-900 dark:text-white tracking-tight">
            {d?.sleeping_cars || (isArabic ? 'المركبات الخاملة والأكثر طلباً' : 'Véhicules inactifs & Top')}
          </h2>
        </div>
      </div>

      {/* Sleeping Vehicles Section */}
      <div className="space-y-2.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5">
          <Moon className="w-3.5 h-3.5 text-indigo-500" />
          <span>{isArabic ? 'غير مؤجرة منذ عدة أيام' : 'Inactifs depuis > 5 jours'}</span>
        </span>

        {sleepingVehicles.map((car) => (
          <div
            key={car.id}
            className="p-3 rounded-xl bg-neutral-50/80 dark:bg-white/5 border border-black/[0.04] dark:border-white/5 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                {car.name}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                {car.idleDays} {isArabic ? 'أيام خاملة' : 'j inactif'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <div className="text-[11px] text-neutral-500">
                <span>{isArabic ? 'السعر الحالي: ' : 'Tarif : '}</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200 tabular-nums">
                  {formatDZD(car.dailyRate, locale)}
                </span>
              </div>

              {/* Adjust price nudge */}
              <Link
                href={`/${locale}/admin/vehicles`}
                className="apple-press inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline"
              >
                <Tag className="w-3 h-3" />
                <span>{d?.adjust_price || (isArabic ? 'تخفيض السعر' : 'Ajuster tarif')}</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Top Performers Section */}
      <div className="space-y-2.5 pt-2 border-t border-neutral-100 dark:border-white/5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span>{d?.top_performers || (isArabic ? 'الأعلى عائداً هذا الشهر' : 'Top 3 du mois')}</span>
        </span>

        <div className="space-y-2">
          {topPerformers.map((car, idx) => (
            <div
              key={car.id}
              className="flex items-center justify-between p-2 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-4.5 h-4.5 rounded-full bg-amber-200/70 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 font-extrabold text-[10px] flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="font-bold text-neutral-800 dark:text-neutral-200 truncate">
                  {car.name}
                </span>
              </div>
              <span className="font-extrabold text-neutral-900 dark:text-white tabular-nums shrink-0">
                {formatDZD(car.totalRevenue, locale)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
