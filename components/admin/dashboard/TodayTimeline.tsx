'use client'

import React from 'react'
import Link from 'next/link'
import {
  Calendar,
  Clock,
  Car,
  CheckCircle2,
  ChevronRight,
  Play,
} from 'lucide-react'

import { Plate } from '@/components/ui/Plate'
import type { Language, Dictionary } from '@/types'
import type { TimelineEvent } from '@/lib/data/dashboard'

export interface TodayTimelineProps {
  locale: Language
  dictionary?: Dictionary
  events: TimelineEvent[]
}

/**
 * T4 — Today's Timeline:
 * Vertical day timeline replacing the old PM tasks/reminders.
 * Built from structured data + i18n templates, never free-text English.
 * One-tap primary action per row ("Start inspection", "Process return").
 */
export function TodayTimeline({
  locale,
  dictionary,
  events,
}: TodayTimelineProps) {
  const isArabic = locale === 'ar'
  const d = dictionary?.admin_dashboard

  const getStatusChip = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3" />
            <span>{d?.completed || (isArabic ? 'مكتمل' : 'Terminé')}</span>
          </span>
        )
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
            <span>{d?.in_progress || (isArabic ? 'قيد الإجراء' : 'En cours')}</span>
          </span>
        )
      case 'scheduled':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-white/10 text-neutral-600 dark:text-neutral-400">
            <Clock className="w-3 h-3" />
            <span>{d?.scheduled || (isArabic ? 'مجدول' : 'Prévu')}</span>
          </span>
        )
    }
  }

  const getActionLabel = (actionKey: TimelineEvent['actionLabelKey']) => {
    switch (actionKey) {
      case 'start_handover':
        return d?.start_handover || (isArabic ? 'بدء التسليم والفحص' : 'Démarrer la remise')
      case 'process_return':
        return d?.process_return || (isArabic ? 'معالجة الإرجاع' : 'Traiter le retour')
      case 'start_inspection':
      default:
        return d?.start_inspection || (isArabic ? 'فحص الحالة والعداد' : 'Inspecter véhicule')
    }
  }

  return (
    <div className="admin-card p-5 sm:p-6 flex flex-col justify-between h-full space-y-4">
      {/* Title Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-white/5">
        <div className="flex items-center gap-2">
          <Calendar className="w-4.5 h-4.5 text-brand-500" />
          <h2 className="text-base font-bold text-neutral-900 dark:text-white tracking-tight">
            {d?.today_timeline || (isArabic ? 'جدول تسليمات وإرجاعات اليوم' : 'Planning des mouvements du jour')}
          </h2>
        </div>
        <span className="text-xs text-neutral-400 font-medium tabular-nums">
          {events.length} {isArabic ? 'حركات' : 'mouvements'}
        </span>
      </div>

      {/* Vertical Timeline Track */}
      {events.length > 0 ? (
        <div className="relative ps-6 space-y-5 flex-1 before:absolute before:inset-y-2 before:start-2.5 before:w-0.5 before:bg-neutral-200 dark:before:bg-white/10">
          {events.map((evt) => (
            <div key={evt.id} className="relative group">
              {/* Timeline Node Dot */}
              <div
                className={`absolute -start-6 top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-[#142032] ${
                  evt.status === 'completed'
                    ? 'bg-emerald-500'
                    : evt.status === 'in_progress'
                    ? 'bg-brand-500 ring-2 ring-brand-200 dark:ring-brand-900'
                    : 'bg-neutral-300 dark:bg-neutral-600'
                }`}
              />

              {/* Event Content Card */}
              <div className="p-3.5 rounded-2xl bg-neutral-50/70 dark:bg-white/5 hover:bg-neutral-100/80 dark:hover:bg-white/10 transition-colors border border-black/[0.04] dark:border-white/[0.05] space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-neutral-900 dark:text-white tabular-nums">
                      {evt.time}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-white/10 text-neutral-700 dark:text-neutral-300 shadow-2xs">
                      {evt.type === 'handover'
                        ? (isArabic ? 'تسليم' : 'Remise')
                        : evt.type === 'return'
                        ? (isArabic ? 'إرجاع' : 'Retour')
                        : (isArabic ? 'فحص تقني' : 'Inspection')}
                    </span>
                  </div>

                  {getStatusChip(evt.status)}
                </div>

                {/* Car & Customer Details */}
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Car className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                      {evt.vehicleName}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-200/70 dark:bg-white/10 text-neutral-700 dark:text-neutral-300">
                      <Plate number={evt.vehiclePlate} />
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 ps-5.5 truncate">
                    <span dir="auto">{evt.customerName}</span> • <span dir="auto">{evt.branchName}</span>
                  </p>
                </div>

                {/* Direct Action Button */}
                {evt.status !== 'completed' && (
                  <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.05]">
                    <Link
                      href={`/${locale}/admin/reservations`}
                      className="apple-press inline-flex items-center justify-between w-full px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-white/10 hover:bg-brand-500 hover:text-white text-neutral-800 dark:text-neutral-200 shadow-2xs border border-black/[0.06] dark:border-white/10 transition-all group/btn"
                    >
                      <span className="flex items-center gap-1.5">
                        <Play className="w-3 h-3 fill-current" />
                        <span>{getActionLabel(evt.actionLabelKey)}</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 text-neutral-400 group-hover/btn:text-white" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-10 text-center flex flex-col items-center justify-center flex-1">
          <Clock className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mb-2" />
          <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
            {d?.empty_timeline || (isArabic ? 'لا توجد تسليمات مجدولة اليوم' : 'Aucun mouvement prévu aujourd’hui')}
          </p>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            {d?.empty_timeline_subtitle || (isArabic ? 'يوم تشغيلي هادئ.' : 'Journée calme.')}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="pt-2 border-t border-neutral-100 dark:border-white/5">
        <Link
          href={`/${locale}/admin/reservations`}
          className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center justify-between"
        >
          <span>{d?.all_bookings || (isArabic ? 'عرض الجدول الزمني الكامل' : 'Voir tout le planning')}</span>
          <ChevronRight className="w-4 h-4 rtl:rotate-180" />
        </Link>
      </div>
    </div>
  )
}
