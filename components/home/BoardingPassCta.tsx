'use client'

import React from 'react'
import Link from 'next/link'
import type { Language, Dictionary } from '@/types'

export interface BoardingPassCtaProps {
  locale: Language
  dict: Dictionary
}

export function BoardingPassCta({ locale, dict }: BoardingPassCtaProps) {
  const isArabic = locale === 'ar'
  const isFrench = locale === 'fr'

  return (
    <section className="py-20 sm:py-28 bg-[#FBFBFD]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Boarding Pass Container with Perforated Edge Motif */}
        <div className="relative rounded-3xl sm:rounded-[36px] bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 text-white p-8 sm:p-12 lg:p-14 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-neutral-800">
          {/* Subtle decorative route lines & watermark */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -end-24 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -start-24 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl"
          />

          <div className="relative z-10 flex flex-col items-start text-start max-w-3xl">
            {/* Top Pass Marker */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="text-xs font-mono font-bold tracking-widest px-3 py-1 rounded-full bg-white/10 text-brand-300 border border-white/15">
                DZ-MOBILITY PASS • 2024-2025
              </span>
              <span className="text-xs font-mono text-neutral-400">
                58 WILAYAS • 6 HUBS
              </span>
            </div>

            {/* Main Headline */}
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight mb-4">
              {isArabic ? (
                <>
                  جاهز لرحلتك القادمة؟ <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-200">
                    احجز الآن واستلم سيارتك
                  </span>{' '}
                  في المطار أو وسط المدينة.
                </>
              ) : isFrench ? (
                <>
                  Prêt pour votre trajet en Algérie ? <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-200">
                    Réservez en 2 minutes
                  </span>{' '}
                  et prenez la route en toute confiance.
                </>
              ) : (
                <>
                  Ready For Your Algerian Journey? <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-200">
                    Reserve in 2 minutes
                  </span>{' '}
                  and pick up keys at your arrival terminal.
                </>
              )}
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base text-neutral-400 leading-relaxed mb-8 max-w-2xl">
              {isArabic
                ? 'اختر سيارتك، أرسل رخصة السياقة، وادفع عربون 5,000 دج بأمان عبر بريدي موب أو CIB. استلام سريع بمحضر فحص رقمي شفاف يضمن راحة بالك طوال رحلتك.'
                : isFrench
                ? 'Véhicules révisés, acompte de 5 000 DZD garanti, et état des lieux contradictoire sur tablette. Pas de surprise, pas de frais cachés.'
                : 'Maintained vehicles, 5,000 DZD refundable hold, and photographic digital inspection reports. Transparent mobility across Algeria.'}
            </p>

            {/* Route Corridors Tag Bar */}
            <div className="flex flex-wrap items-center gap-2 mb-10 text-xs font-mono text-neutral-300">
              <span className="bg-white/5 px-2.5 py-1 rounded-md border border-white/10">ALG (Alger)</span>
              <span>↔</span>
              <span className="bg-white/5 px-2.5 py-1 rounded-md border border-white/10">ORN (Oran)</span>
              <span>↔</span>
              <span className="bg-white/5 px-2.5 py-1 rounded-md border border-white/10">CZL (Constantine)</span>
              <span>↔</span>
              <span className="bg-white/5 px-2.5 py-1 rounded-md border border-white/10">AAE (Annaba)</span>
              <span>↔</span>
              <span className="bg-white/5 px-2.5 py-1 rounded-md border border-white/10">HME (Hassi Messaoud)</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link
                href={`/${locale}/vehicles`}
                className="apple-press w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold tracking-tight bg-brand-500 text-white hover:bg-brand-600 shadow-[0_4px_20px_rgba(0,113,227,0.4)] transition-all min-h-[48px]"
              >
                <span>{dict.vehicles.browse_vehicles || 'Browse Fleet'}</span>
                <span className="rtl:rotate-180">→</span>
              </Link>

              <Link
                href={`/${locale}/signup`}
                className="apple-press w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-full text-xs sm:text-sm font-semibold tracking-tight bg-white/10 text-white hover:bg-white/15 border border-white/20 transition-all min-h-[48px]"
              >
                {dict.auth.create_account || 'Create Account'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
