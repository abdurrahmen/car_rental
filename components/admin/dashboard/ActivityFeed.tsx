'use client'

import React from 'react'
import {
  Activity,
  Car,
  FileCheck2,
  CreditCard,
  RotateCcw,
} from 'lucide-react'

import type { Language, Dictionary } from '@/types'

export interface ActivityFeedProps {
  locale: Language
  dictionary?: Dictionary
}

interface ActivityEvent {
  id: string
  titleAr: string
  titleFr: string
  timeAgoAr: string
  timeAgoFr: string
  type: 'return' | 'handover' | 'payment' | 'booking'
}

const ACTIVITIES: ActivityEvent[] = [
  {
    id: 'act-1',
    titleAr: 'تم إرجاع وفحص Peugeot 208 — إفراج عن الكفالة',
    titleFr: 'Peugeot 208 retournée et inspectée · Caution libérée',
    timeAgoAr: 'منذ 14 دقيقة',
    timeAgoFr: 'il y a 14 min',
    type: 'return',
  },
  {
    id: 'act-2',
    titleAr: 'تسليم Renault Clio V بمطار وهران الدولي',
    titleFr: 'Remise Renault Clio V effectuée à l’Aéroport d’Oran',
    timeAgoAr: 'منذ 48 دقيقة',
    timeAgoFr: 'il y a 48 min',
    type: 'handover',
  },
  {
    id: 'act-3',
    titleAr: 'استلام دفعة عربون 25,000 دج عبر BaridiMob',
    titleFr: 'Acompte de 25 000 DZD encaissé via BaridiMob',
    timeAgoAr: 'منذ ساعتين',
    timeAgoFr: 'il y a 2 h',
    type: 'payment',
  },
  {
    id: 'act-4',
    titleAr: 'طلب حجز جديد لسيارة Toyota Prado (مهمة صحراوية)',
    titleFr: 'Nouvelle demande de réservation pour Toyota Prado',
    timeAgoAr: 'منذ 3 ساعات',
    timeAgoFr: 'il y a 3 h',
    type: 'booking',
  },
]

/**
 * T11 — Activity Feed:
 * Live human-language operational events with relative timestamps.
 */
export function ActivityFeed({
  locale,
  dictionary,
}: ActivityFeedProps) {
  const isArabic = locale === 'ar'
  const d = dictionary?.admin_dashboard

  const getIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'return':
        return <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
      case 'handover':
        return <Car className="w-3.5 h-3.5 text-brand-600" />
      case 'payment':
        return <CreditCard className="w-3.5 h-3.5 text-amber-600" />
      case 'booking':
      default:
        return <FileCheck2 className="w-3.5 h-3.5 text-purple-600" />
    }
  }

  return (
    <div className="admin-card p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-white/5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand-500" />
          <h2 className="text-base font-bold text-neutral-900 dark:text-white tracking-tight">
            {d?.activity_feed || (isArabic ? 'آخر النشاطات الحية' : 'Activité récente')}
          </h2>
        </div>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
      </div>

      <div className="space-y-3">
        {ACTIVITIES.map((act) => (
          <div
            key={act.id}
            className="flex items-start gap-3 p-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
              {getIcon(act.type)}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 leading-snug">
                {isArabic ? act.titleAr : act.titleFr}
              </p>
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5 block">
                {isArabic ? act.timeAgoAr : act.timeAgoFr}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
