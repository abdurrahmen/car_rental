'use client'

import React from 'react'
import Link from 'next/link'
import {
  Plus,
  Calendar,
  Wrench,
  Clock,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react'
import { getTimeOfDay, formatDate, TimeOfDay } from '@/lib/utils/constants'
import type { Language, Dictionary } from '@/types'

export interface DailyBriefingHeroProps {
  locale: Language
  dictionary?: Dictionary
  userName?: string
  handoversToday: { completed: number; total: number }
  returnsToday: { completed: number; total: number }
  pendingCount: number
  timeOfDay?: TimeOfDay
  dateStr?: string
}

/**
 * T1 — Daily Briefing Hero:
 * - Time-aware personalized greeting with Algerian calendar
 * - Real data summary sentence
 * - Day operational progress bar (handovers & returns done vs scheduled)
 * - 4 direct quick action buttons
 * - Hour-based dynamic atmosphere gradient (dawn, day, golden hour, night)
 */
export function DailyBriefingHero({
  locale,
  dictionary,
  userName = 'Admin',
  handoversToday,
  returnsToday,
  pendingCount,
  timeOfDay: explicitTimeOfDay,
  dateStr,
}: DailyBriefingHeroProps) {
  const isArabic = locale === 'ar'
  const d = dictionary?.admin_dashboard

  const timeOfDay = explicitTimeOfDay || getTimeOfDay()
  const currentDateStr = dateStr || formatDate(new Date().toISOString(), locale)


  // Extract first name
  const firstName = userName ? userName.trim().split(' ')[0] : (isArabic ? 'مدير الوكالة' : 'Manager')

  // Pick greeting based on time of day
  const greetingText =
    timeOfDay === 'dawn' || timeOfDay === 'day'
      ? d?.greeting_morning || (isArabic ? 'صباح الخير' : 'Bonjour')
      : timeOfDay === 'golden'
      ? d?.greeting_afternoon || (isArabic ? 'مساء الخير' : 'Bon après-midi')
      : d?.greeting_evening || (isArabic ? 'مساء الخير' : 'Bonsoir')

  // Calculate day operational progress
  const totalOperations = handoversToday.total + returnsToday.total
  const completedOperations = handoversToday.completed + returnsToday.completed
  const progressPercent = totalOperations > 0
    ? Math.round((completedOperations / totalOperations) * 100)
    : 0

  // Build real data briefing sentence
  const summaryPart1 = isArabic
    ? `اليوم: ${handoversToday.total} تسليمات و${returnsToday.total} إرجاعات`
    : `Aujourd'hui : ${handoversToday.total} remises et ${returnsToday.total} retours`

  const pendingSuffix =
    pendingCount > 1
      ? (isArabic ? `، و${pendingCount} طلبات حجز تنتظر ردّك.` : `, et ${pendingCount} demandes attendent votre réponse.`)
      : pendingCount === 1
      ? (isArabic ? '، وطلب واحد ينتظر ردّك.' : ', et 1 demande attend votre réponse.')
      : (isArabic ? '، وكل الطلبات معالجة.' : ' — tout est à jour.')

  const summarySentence = `${summaryPart1}${pendingSuffix}`

  // Hour-based atmosphere gradient styling
  const atmosphereGradients: Record<TimeOfDay, string> = {
    dawn: 'from-[#0052A3] via-[#0066CC] to-[#E58A1F]',
    day: 'from-[#0060C4] via-[#0071E3] to-[#1288E8]',
    golden: 'from-[#004C99] via-[#0066CC] to-[#E07A10]',
    night: 'from-[#0B1B33] via-[#00478F] to-[#003366]',
  }

  return (
    <div
      className={`rounded-3xl p-6 sm:p-8 bg-gradient-to-br ${atmosphereGradients[timeOfDay]} text-white shadow-[0_8px_30px_rgba(0,113,227,0.18)] relative overflow-hidden transition-all duration-700`}
    >
      {/* Subtle Algerian geometric pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, white 2%, transparent 0%), radial-gradient(circle at 75px 75px, white 2%, transparent 0%)`,
          backgroundSize: '100px 100px',
        }}
      />

      {/* Decorative car silhouette outline watermark */}
      <div className="absolute end-4 -bottom-6 pointer-events-none opacity-[0.12] w-72 h-44 hidden md:block">
        <svg viewBox="0 0 240 140" fill="currentColor" className="w-full h-full">
          <path d="M20,100 C40,70 70,60 110,60 L145,60 C175,60 195,75 220,100 L230,105 C235,108 235,115 228,118 L215,118 C215,108 205,100 192,100 C180,100 170,108 170,118 L80,118 C80,108 70,100 58,100 C45,100 35,108 35,118 L15,118 C8,118 5,110 10,105 Z M60,90 L95,90 L95,70 L72,70 Z M110,90 L155,90 L148,70 L110,70 Z" />
        </svg>
      </div>

      <div className="relative z-10 space-y-6">
        {/* Top: Date Pill & Time of Day badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white font-medium">
            <Clock className="w-3.5 h-3.5 opacity-80" />
            <span>{currentDateStr || (isArabic ? 'السبت، بداية الأسبوع' : 'Aujourd’hui')}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/25 border border-emerald-400/30 text-emerald-100 font-semibold text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
            <span>{isArabic ? 'الأسطول متصل ومباشر' : 'Flotte synchronisée'}</span>
          </div>
        </div>

        {/* Hero Greeting & Real Data Story */}
        <div className="space-y-2 max-w-2xl">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            {greetingText}، {firstName}
          </h1>
          <p className="text-sm sm:text-base text-white/90 font-medium leading-relaxed">
            {summarySentence}
          </p>
        </div>

        {/* Day Operational Progress Strip */}
        <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/10 max-w-2xl space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-white/90 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{d?.day_progress || (isArabic ? 'تقدم عمليات اليوم' : 'Progression des opérations')}</span>
            </div>
            <div className="text-white/80 font-mono font-medium text-[11px] tabular-nums">
              <bdi>{completedOperations} / {totalOperations}</bdi>{' '}
              ({progressPercent}%)
            </div>
          </div>

          {/* Progress track */}
          <div className="w-full h-2.5 rounded-full bg-white/20 overflow-hidden flex">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-white/70 pt-0.5">
            <span>
              {isArabic ? `${handoversToday.completed} من ${handoversToday.total} تسليم تم` : `${handoversToday.completed}/${handoversToday.total} remises effectuées`}
            </span>
            <span>
              {isArabic ? `${returnsToday.completed} من ${returnsToday.total} إرجاع تم` : `${returnsToday.completed}/${returnsToday.total} retours effectués`}
            </span>
          </div>
        </div>

        {/* Quick Actions Row */}
        <div className="pt-1 flex flex-wrap items-center gap-2.5">
          {/* 1. Walk-in / New Booking */}
          <Link
            href={`/${locale}/admin/reservations`}
            className="apple-press inline-flex items-center gap-2 px-4.5 py-2.5 rounded-full text-xs font-bold bg-white text-brand-700 hover:bg-neutral-50 shadow-md transition-all min-h-[40px]"
          >
            <Calendar className="w-4 h-4 text-brand-600" />
            <span>{d?.new_booking || (isArabic ? 'حجز جديد' : 'Nouvelle réservation')}</span>
          </Link>

          {/* 2. Add Car */}
          <Link
            href={`/${locale}/admin/vehicles/new`}
            className="apple-press inline-flex items-center gap-2 px-4.5 py-2.5 rounded-full text-xs font-semibold bg-white/15 hover:bg-white/25 border border-white/25 text-white backdrop-blur-md shadow-2xs transition-all min-h-[40px]"
          >
            <Plus className="w-4 h-4" />
            <span>{d?.add_car || (isArabic ? 'إضافة مركبة' : 'Ajouter véhicule')}</span>
          </Link>

          {/* 3. Send to Maintenance */}
          <Link
            href={`/${locale}/admin/vehicles`}
            className="apple-press inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium bg-white/10 hover:bg-white/20 border border-white/15 text-white/95 backdrop-blur-md transition-all min-h-[40px]"
          >
            <Wrench className="w-3.5 h-3.5 text-amber-300" />
            <span>{d?.send_maintenance || (isArabic ? 'حجز صيانة' : 'Maintenance')}</span>
          </Link>

          {/* 4. All Bookings */}
          <Link
            href={`/${locale}/admin/reservations`}
            className="apple-press inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors ms-auto"
          >
            <span>{d?.all_bookings || (isArabic ? 'كل الحجوزات' : 'Toutes les réservations')}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
