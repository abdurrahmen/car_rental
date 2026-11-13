'use client'

import React, { useState } from 'react'
import { Building2, MapPin } from 'lucide-react'
import type { Language, Dictionary } from '@/types'


export interface BranchMapProps {
  locale: Language
  dictionary?: Dictionary
}

interface HubPin {
  id: string
  nameAr: string
  nameFr: string
  city: string
  type: 'airport' | 'hub' | 'port' | 'south'
  x: number // SVG percentage
  y: number // SVG percentage
  activeFleet: number
  handoversToday: number
  returnsToday: number
  utilization: number
}

const HUBS: HubPin[] = [
  {
    id: 'b-alger',
    nameAr: 'الجزائر العاصمة - ديدوش مراد والمطار',
    nameFr: 'Alger Centre & Aéroport Houari Boumediene',
    city: 'Alger',
    type: 'hub',
    x: 52,
    y: 18,
    activeFleet: 18,
    handoversToday: 6,
    returnsToday: 4,
    utilization: 84,
  },
  {
    id: 'b-oran',
    nameAr: 'وهران - مطار أحمد بن بلة الدولي',
    nameFr: 'Oran - Aéroport Ahmed Ben Bella',
    city: 'Oran',
    type: 'airport',
    x: 32,
    y: 22,
    activeFleet: 12,
    handoversToday: 4,
    returnsToday: 3,
    utilization: 75,
  },
  {
    id: 'b-constantine',
    nameAr: 'قسنطينة - مطار محمد بوضياف',
    nameFr: 'Constantine - Aéroport Mohamed Boudiaf',
    city: 'Constantine',
    type: 'airport',
    x: 68,
    y: 20,
    activeFleet: 8,
    handoversToday: 3,
    returnsToday: 2,
    utilization: 70,
  },
  {
    id: 'b-annaba',
    nameAr: 'عنابة - المحطة البحرية والميناء',
    nameFr: 'Annaba - Gare Maritime & Port',
    city: 'Annaba',
    type: 'port',
    x: 76,
    y: 16,
    activeFleet: 6,
    handoversToday: 2,
    returnsToday: 1,
    utilization: 65,
  },
  {
    id: 'b-setif',
    nameAr: 'سطيف - القطب التجاري العلمي',
    nameFr: 'Sétif - Pôle Commercial',
    city: 'Sétif',
    type: 'hub',
    x: 60,
    y: 21,
    activeFleet: 5,
    handoversToday: 1,
    returnsToday: 1,
    utilization: 60,
  },
  {
    id: 'b-hassi',
    nameAr: 'حاسي مسعود - قاعدة الحياة البترولية',
    nameFr: 'Hassi Messaoud - Base Pétrolière',
    city: 'Hassi Messaoud',
    type: 'south',
    x: 64,
    y: 52,
    activeFleet: 7,
    handoversToday: 2,
    returnsToday: 2,
    utilization: 88,
  },
]

/**
 * T7 — Branch Map:
 * Lightweight SVG Map of Algeria displaying branch locations,
 * interactive activity on hover, and mobile list fallback.
 */
export function BranchMap({
  locale,
  dictionary,
}: BranchMapProps) {
  const isArabic = locale === 'ar'
  const d = dictionary?.admin_dashboard

  const [activePin, setActivePin] = useState<HubPin | null>(HUBS[0])

  return (
    <div className="admin-card p-5 sm:p-6 flex flex-col justify-between space-y-4 h-full">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-white/5">
        <div className="flex items-center gap-2">
          <Building2 className="w-4.5 h-4.5 text-brand-500" />
          <h2 className="text-base font-bold text-neutral-900 dark:text-white tracking-tight">
            {d?.branch_map || (isArabic ? 'خريطة الفروع ومحطات الأسطول' : 'Réseau national des agences')}
          </h2>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-brand-600 dark:text-brand-300">
          6 {isArabic ? 'فروع نشطة' : 'agences'}
        </span>
      </div>

      {/* SVG Map Container (Desktop & Tablet) */}
      <div className="relative aspect-[4/3] w-full rounded-2xl bg-neutral-50/70 dark:bg-white/5 border border-black/[0.04] dark:border-white/5 p-3 overflow-hidden flex items-center justify-center">
        {/* Simplified Stylized Algeria Border SVG */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full max-h-64 object-contain text-neutral-200 dark:text-neutral-800 transition-colors"
          fill="none"
        >
          {/* Stylized Silhouette Contour of Algeria */}
          <path
            d="M 22,23 L 34,20 L 52,16 L 78,14 L 80,24 L 74,38 L 70,55 L 60,82 L 48,92 L 40,84 L 32,70 L 25,50 L 18,34 Z"
            fill="currentColor"
            fillOpacity="0.4"
            stroke="currentColor"
            strokeWidth="0.75"
            strokeLinejoin="round"
          />

          {/* North Coastline curve highlight */}
          <path
            d="M 22,23 L 34,20 L 52,16 L 78,14"
            stroke="#0071E3"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>

        {/* Branch Interactive Pins */}
        {HUBS.map((hub) => {
          const isSelected = activePin?.id === hub.id

          return (
            <button
              key={hub.id}
              type="button"
              onClick={() => setActivePin(hub)}
              onMouseEnter={() => setActivePin(hub)}
              style={{ left: `${hub.x}%`, top: `${hub.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer focus:outline-none"
              title={isArabic ? hub.nameAr : hub.nameFr}
            >
              <div className="relative flex items-center justify-center">
                {isSelected && (
                  <span className="absolute w-6 h-6 rounded-full bg-brand-500/30 animate-ping" />
                )}
                <span
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border-2 border-white dark:border-neutral-900 shadow-md transition-all ${
                    isSelected
                      ? 'bg-brand-500 scale-125'
                      : 'bg-emerald-500 group-hover:bg-brand-500'
                  }`}
                >
                  <span className="w-1 h-1 rounded-full bg-white" />
                </span>
              </div>
            </button>
          )
        })}

        {/* Floating Detail Card for Selected Hub */}
        {activePin && (
          <div className="absolute bottom-2 inset-x-2 sm:inset-x-4 p-3 rounded-xl bg-white/95 dark:bg-[#121E30]/95 backdrop-blur-md shadow-lg border border-black/[0.08] dark:border-white/10 text-xs animate-apple-fade-in space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span 
                dir="auto"
                className="font-bold text-neutral-900 dark:text-white truncate"
                title={isArabic ? activePin.nameAr : activePin.nameFr}
              >
                {isArabic ? activePin.nameAr : activePin.nameFr}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 shrink-0">
                {activePin.utilization}% {isArabic ? 'تشغيل' : 'actif'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[11px] pt-1 border-t border-neutral-100 dark:border-white/5">
              <div>
                <span className="text-neutral-400 block text-[9px] uppercase font-medium">
                  {isArabic ? 'الأسطول' : 'Flotte'}
                </span>
                <span className="font-extrabold text-neutral-800 dark:text-neutral-200 tabular-nums">
                  {activePin.activeFleet}
                </span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[9px] uppercase font-medium">
                  {isArabic ? 'تسليم اليوم' : 'Remises'}
                </span>
                <span className="font-extrabold text-brand-600 dark:text-brand-400 tabular-nums">
                  {activePin.handoversToday}
                </span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[9px] uppercase font-medium">
                  {isArabic ? 'إرجاع اليوم' : 'Retours'}
                </span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {activePin.returnsToday}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Accessible List Fallback */}
      <div className="space-y-1.5 md:hidden">
        {HUBS.slice(0, 3).map((hub) => (
          <div
            key={hub.id}
            className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-white/5 text-xs"
          >
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="w-3.5 h-3.5 text-brand-500 shrink-0" />
              <span 
                dir="auto"
                className="font-semibold text-neutral-800 dark:text-neutral-200 truncate"
                title={hub.city}
              >
                {hub.city}
              </span>
            </div>
            <span className="text-neutral-500 font-mono text-[11px] shrink-0">
              {hub.activeFleet} {isArabic ? 'سيارات' : 'véhicules'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
