'use client'

import React from 'react'
import {
  Calendar,
  Clock,
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
 * T1 — Daily Briefing Hero (Slimmed):
 * - Time-aware personalized greeting with Algerian calendar
 * - Real data summary sentence
 * - Compact stats display (no progress bar)
 * - Hour-based dynamic atmosphere gradient (dawn, day, golden hour, night)
 * 50% of previous height, cleaner design
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
      className={`rounded-3xl p-5 sm:p-6 bg-gradient-to-br ${atmosphereGradients[timeOfDay]} text-white shadow-[0_8px_30px_rgba(0,113,227,0.18)] relative overflow-hidden transition-all duration-700`}
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

      <div className="relative z-10 flex items-center justify-between gap-4">
        {/* Left: Greeting & Summary */}
        <div className="space-y-1.5 max-w-xl">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-tight">
            {greetingText}، {firstName}
          </h1>
          <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed">
            {summarySentence}
          </p>
          
          {/* Date pill inline with greeting */}
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white font-medium text-[11px] mt-2">
            <Clock className="w-3 h-3 opacity-80" />
            <span>{currentDateStr || (isArabic ? 'السبت، بداية الأسبوع' : "Aujourd'hui")}</span>
          </div>
        </div>

        {/* Right: Compact Day Stats */}
        <div className="hidden md:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
            <Calendar className="w-4 h-4 text-emerald-300" />
            <div className="text-start">
              <div className="text-white/70 text-[10px] font-medium">
                {isArabic ? 'التسليمات' : 'Remises'}
              </div>
              <div className="text-white font-bold tabular-nums">
                <bdi>{handoversToday.completed}/{handoversToday.total}</bdi>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <div className="text-start">
              <div className="text-white/70 text-[10px] font-medium">
                {isArabic ? 'الإرجاعات' : 'Retours'}
              </div>
              <div className="text-white font-bold tabular-nums">
                <bdi>{returnsToday.completed}/{returnsToday.total}</bdi>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
