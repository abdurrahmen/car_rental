'use client'

import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Language } from '@/types'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export interface TrustBarProps {
  locale: Language
}

export function TrustBar({ locale }: TrustBarProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isArabic = locale === 'ar'
  const isFrench = locale === 'fr'

  const stat1Ref = useRef<HTMLSpanElement>(null)
  const stat2Ref = useRef<HTMLSpanElement>(null)
  const stat3Ref = useRef<HTMLSpanElement>(null)
  const stat4Ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (prefersReducedMotion) {
      if (stat1Ref.current) stat1Ref.current.textContent = '6'
      if (stat2Ref.current) stat2Ref.current.textContent = '58'
      if (stat3Ref.current) stat3Ref.current.textContent = '5,000'
      if (stat4Ref.current) stat4Ref.current.textContent = '100%'
      return
    }

    const ctx = gsap.context(() => {
      const counters = [
        { ref: stat1Ref, endVal: 6, format: (v: number) => Math.round(v).toString() },
        { ref: stat2Ref, endVal: 58, format: (v: number) => Math.round(v).toString() },
        { ref: stat3Ref, endVal: 5000, format: (v: number) => Math.round(v).toLocaleString() },
        { ref: stat4Ref, endVal: 100, format: (v: number) => `${Math.round(v)}%` },
      ]

      counters.forEach((item) => {
        if (!item.ref.current) return
        const obj = { val: 0 }

        gsap.to(obj, {
          val: item.endVal,
          duration: 1.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          onUpdate: () => {
            if (item.ref.current) {
              item.ref.current.textContent = item.format(obj.val)
            }
          },
        })
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={containerRef}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10"
    >
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-black/[0.06] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.03)] grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 divide-y lg:divide-y-0 lg:divide-x rtl:lg:divide-x-reverse divide-black/[0.05]">
        {/* Stat 1: Strategic Hubs */}
        <div className="flex flex-col items-center text-center pt-3 lg:pt-0">
          <div className="flex items-baseline gap-1">
            <span
              ref={stat1Ref}
              className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 font-mono"
            >
              6
            </span>
          </div>
          <span className="text-xs sm:text-sm font-semibold text-neutral-800 mt-1">
            {isArabic ? 'وكالات ومطارات استراتيجية' : isFrench ? 'Pôles Aéroports & Ports' : 'Strategic Gateways'}
          </span>
          <span className="text-[11px] text-neutral-500 mt-0.5">
            {isArabic ? 'الجزائر، وهران، قسنطينة، عنابة، سطيف، حاسي مسعود' : 'Alger, Oran, Constantine, Annaba, Sétif...'}
          </span>
        </div>

        {/* Stat 2: National Coverage */}
        <div className="flex flex-col items-center text-center pt-3 lg:pt-0">
          <div className="flex items-baseline gap-1">
            <span
              ref={stat2Ref}
              className="text-3xl sm:text-4xl font-bold tracking-tight text-brand-500 font-mono"
            >
              58
            </span>
          </div>
          <span className="text-xs sm:text-sm font-semibold text-neutral-800 mt-1">
            {isArabic ? 'ولاية مغطاة بالمساعدة' : isFrench ? 'Wilayas Couvertes' : 'Wilayas Covered'}
          </span>
          <span className="text-[11px] text-neutral-500 mt-0.5">
            {isArabic ? 'مساعدة طرقية وتغطية شاملة' : isFrench ? 'Assistance routière nationale 24/7' : '24/7 National Roadside Support'}
          </span>
        </div>

        {/* Stat 3: Deposit */}
        <div className="flex flex-col items-center text-center pt-3 lg:pt-0">
          <div className="flex items-baseline gap-1">
            <span
              ref={stat3Ref}
              className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 font-mono"
            >
              5,000
            </span>
            <span className="text-xs font-semibold text-neutral-500">DZD</span>
          </div>
          <span className="text-xs sm:text-sm font-semibold text-neutral-800 mt-1">
            {isArabic ? 'عربون رمزي محمي ومسترجع' : isFrench ? 'Caution Fixe & Restituée' : 'Protected Refundable Deposit'}
          </span>
          <span className="text-[11px] text-neutral-500 mt-0.5">
            {isArabic ? 'عبر الذهبية / بريدي موب / CIB' : isFrench ? 'Via BaridiMob, Edahabia ou CIB' : 'Via Edahabia or CIB Cards'}
          </span>
        </div>

        {/* Stat 4: Digital Inspection PV */}
        <div className="flex flex-col items-center text-center pt-3 lg:pt-0">
          <div className="flex items-baseline gap-1">
            <span
              ref={stat4Ref}
              className="text-3xl sm:text-4xl font-bold tracking-tight text-emerald-600 font-mono"
            >
              100%
            </span>
          </div>
          <span className="text-xs sm:text-sm font-semibold text-neutral-800 mt-1">
            {isArabic ? 'محضر فحص رقمي (PV)' : isFrench ? 'État des Lieux Numérique' : 'Digital Inspection Report'}
          </span>
          <span className="text-[11px] text-neutral-500 mt-0.5">
            {isArabic ? 'توثيق بالصور عند الاستلام والتسليم' : isFrench ? 'Photographique & contradictoire' : 'Photos & odometer signed on pickup'}
          </span>
        </div>
      </div>
    </div>
  )
}
