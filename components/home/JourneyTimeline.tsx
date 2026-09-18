'use client'

import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Language } from '@/types'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export interface JourneyTimelineProps {
  locale: Language
}

export function JourneyTimeline({ locale }: JourneyTimelineProps) {
  const isArabic = locale === 'ar'
  const isFrench = locale === 'fr'

  const sectionRef = useRef<HTMLElement>(null)
  const progressLineRef = useRef<HTMLDivElement>(null)
  const stepsContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (prefersReducedMotion) return

    const mm = gsap.matchMedia()

    // Desktop (1024px+): Pinned scroll-driven sequence where cards reveal one after another while scrolling
    mm.add('(min-width: 1024px)', () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 10%',
          end: '+=750',
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
        },
      })

      // Progress bar fill: 0 to 100% across the timeline
      if (progressLineRef.current) {
        tl.fromTo(
          progressLineRef.current,
          { scaleX: 0.12 },
          { scaleX: 1, ease: 'none', duration: 3.5 },
          0
        )
      }

      // Step 01: Active by default, dot 0 highlighted
      tl.to(
        '#station-dot-0',
        { borderColor: '#0071E3', scale: 1.25, duration: 0.3 },
        0
      )
      tl.to(
        '#station-dot-0 .station-inner',
        { backgroundColor: '#0071E3', duration: 0.3 },
        0
      )

      // Step 02: Reveals as user turns the scroll wheel (time 0.8 -> 1.8)
      tl.fromTo(
        '#journey-card-1',
        { opacity: 0, y: 30, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power2.out' },
        0.8
      )
      tl.to(
        '#station-dot-1',
        { borderColor: '#0071E3', scale: 1.25, duration: 0.4 },
        1.1
      )
      tl.to(
        '#station-dot-1 .station-inner',
        { backgroundColor: '#0071E3', duration: 0.4 },
        1.1
      )

      // Step 03: Reveals as scroll advances further (time 1.8 -> 2.8)
      tl.fromTo(
        '#journey-card-2',
        { opacity: 0, y: 30, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power2.out' },
        1.8
      )
      tl.to(
        '#station-dot-2',
        { borderColor: '#0071E3', scale: 1.25, duration: 0.4 },
        2.1
      )
      tl.to(
        '#station-dot-2 .station-inner',
        { backgroundColor: '#0071E3', duration: 0.4 },
        2.1
      )

      // Step 04: Reveals as journey completes (time 2.8 -> 3.5)
      tl.fromTo(
        '#journey-card-3',
        { opacity: 0, y: 30, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power2.out' },
        2.8
      )
      tl.to(
        '#station-dot-3',
        { borderColor: '#10B981', scale: 1.25, duration: 0.4 },
        3.1
      )
      tl.to(
        '#station-dot-3 .station-inner',
        { backgroundColor: '#10B981', duration: 0.4 },
        3.1
      )
    })

    // Mobile / Tablet (<1024px): Cards reveal sequentially as each scrolls into viewport
    mm.add('(max-width: 1023px)', () => {
      [0, 1, 2, 3].forEach((idx) => {
        gsap.fromTo(
          `#journey-card-${idx}`,
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: `#journey-card-${idx}`,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      })
    })

    return () => mm.revert()
  }, [isArabic])

  const steps = [
    {
      num: '01',
      tag: isArabic ? 'المركبة والتضاريس' : isFrench ? 'Véhicule & Trajet' : 'Fleet Selection',
      title: isArabic ? 'اختر مركبتك المناسبة' : isFrench ? 'Sélectionnez votre véhicule' : 'Select Your Vehicle',
      desc: isArabic
        ? 'سيارات مدنية اقتصادية، رباعيات دفع 4x4 للطرق الوعرة والصحراء، أو شاحنات نفعية بأسعار شفافة.'
        : isFrench
        ? 'Citadines économiques, SUV 4x4 tout-terrain pour le Sud ou utilitaires spacieux avec tarifs clairs.'
        : 'Fuel-efficient compacts, rugged 4x4 SUVs for Saharan routes, or commercial vans with transparent rates.',
      visual: (
        <div className="mt-3.5 p-3 rounded-xl bg-brand-500/[0.04] border border-brand-500/15 flex items-center justify-between text-xs">
          <span className="font-semibold text-neutral-800">Renault Clio / Duster 4x4</span>
          <span className="font-mono font-bold text-brand-600 bg-white px-2 py-0.5 rounded-md border border-brand-500/20">
            DZD / jour
          </span>
        </div>
      ),
    },
    {
      num: '02',
      tag: isArabic ? 'ملف رقمي سريع' : isFrench ? 'Dossier 100% Numérique' : '2-Min Mobile Request',
      title: isArabic ? 'أرسل طلبك في دقيقتين' : isFrench ? 'Soumettez en 2 minutes' : 'Submit In 2 Minutes',
      desc: isArabic
        ? 'حدد تواريخ الانطلاق والعودة، مع رفع صورة واضحة لرخصة السياقة عبر الهاتف بدون تنقل ولا ملف ورقي.'
        : isFrench
        ? 'Choisissez dates et agences, téléversez votre permis de conduire depuis votre smartphone sans attente.'
        : 'Pick dates and branch, upload your driver license directly from mobile with zero paperwork queues.',
      visual: (
        <div className="mt-3.5 p-3 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/20 flex items-center justify-between text-xs">
          <span className="text-emerald-800 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {isArabic ? 'رخصة سياقة معتمدة' : 'Permis vérifié ✓'}
          </span>
          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded font-bold">
            ZERO PAPIER
          </span>
        </div>
      ),
    },
    {
      num: '03',
      tag: isArabic ? 'عربون محمي 48 ساعة' : isFrench ? 'Acompte Sécurisé 48h' : 'Protected 48h Hold',
      title: isArabic ? 'تأكيد الحجز وضمان العربون' : isFrench ? 'Confirmation & Acompte CIB' : 'Confirm & Deposit Hold',
      desc: isArabic
        ? 'بعد الموافقة، يُحجز مقعد السيارة حصرياً لك مع دفع 5,000 دج عبر البطاقة الذهبية أو CIB خلال 48 ساعة.'
        : isFrench
        ? 'Après validation, versez 5 000 DZD d acompte garanti via Edahabia ou CIB. Véhicule bloqué pour vous.'
        : 'Once confirmed by the branch, lock the car with 5,000 DZD hold via Edahabia or CIB within 48h.',
      visual: (
        <div className="mt-3.5 p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/20 flex items-center justify-between text-xs">
          <span className="text-amber-900 font-semibold flex items-center gap-1">
            <span>🛡️</span> 5,000 DZD
          </span>
          <span className="text-[10px] font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full">
            {isArabic ? 'ضمان عدم تكرار الحجز' : 'GiST Excluded'}
          </span>
        </div>
      ),
    },
    {
      num: '04',
      tag: isArabic ? 'محضر استلام رقمي' : isFrench ? 'PV Contradictoire' : 'Digital PV Handover',
      title: isArabic ? 'استلام المفاتيح والانطلاق' : isFrench ? 'Prise en main & Départ' : 'Pickup & Hit The Road',
      desc: isArabic
        ? 'فحص مشترك لحالة السيارة وعدّاد الكيلومترات وتوثيقه بمحضر رقمي (PV) مصوّر، دفع المتبقي نقدًا، وانطلق.'
        : isFrench
        ? 'État des lieux contradictoire sur tablette avec photos horodatées, paiement du solde en agence, et bonne route.'
        : 'Joint digital inspection report on tablet with timestamped photos, settle balance at counter, and drive.',
      visual: (
        <div className="mt-3.5 p-3 rounded-xl bg-brand-500/[0.05] border border-brand-500/20 flex items-center justify-between text-xs">
          <span className="text-neutral-900 font-medium">
            {isArabic ? 'محضر استلام (PV) موثق' : 'Procès-Verbal Signé'}
          </span>
          <span className="text-[10px] font-mono text-brand-700 bg-brand-100/60 px-1.5 py-0.5 rounded font-bold">
            CHECKLIST ✓
          </span>
        </div>
      ),
    },
  ]

  return (
    <section
      ref={sectionRef}
      className="py-12 sm:py-16 bg-[#F6F6F9] border-y border-black/[0.06] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Typographic Hierarchy */}
        <div className="max-w-3xl mb-8 sm:mb-10 text-start">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 text-xs font-bold uppercase tracking-wider mb-3">
            <span>01 → 04</span>
            <span>•</span>
            <span>{isArabic ? 'مسار التنقل الشفاف' : isFrench ? 'Cycle de Location Transparent' : 'The Mobility Journey'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 leading-tight">
            {isArabic ? (
              <>
                كيف يعمل كراء السيارات معنا؟ <br className="hidden sm:inline" />
                <span className="text-neutral-500 font-normal">
                  4 محطات واضحة تضمن أمان رحلتك وعربونك.
                </span>
              </>
            ) : isFrench ? (
              <>
                Comment fonctionne DZ Rent ? <br className="hidden sm:inline" />
                <span className="text-neutral-500 font-normal">
                  4 étapes fluides de la demande au volant.
                </span>
              </>
            ) : (
              <>
                How DZ Rent Works <br className="hidden sm:inline" />
                <span className="text-neutral-500 font-normal">
                  4 transparent milestones from request to ignition.
                </span>
              </>
            )}
          </h2>
        </div>

        {/* Connected Horizontal Progress Line Track with Station Markers (Desktop) */}
        <div className="hidden lg:block relative mb-7">
          <div className="h-1.5 w-full bg-black/[0.06] rounded-full overflow-hidden">
            <div
              ref={progressLineRef}
              style={{ transformOrigin: isArabic ? 'right center' : 'left center' }}
              className="h-full bg-gradient-to-r from-brand-500 via-brand-600 to-emerald-500 ltr:origin-left rtl:origin-right"
            />
          </div>
          {/* Station Milestone Anchor Dots */}
          <div className="absolute top-1/2 -translate-y-1/2 w-full grid grid-cols-4 gap-6 pointer-events-none">
            {steps.map((step, idx) => (
              <div key={step.num} className="flex justify-center">
                <div
                  id={`station-dot-${idx}`}
                  className="station-dot w-5 h-5 rounded-full bg-white border-2 border-neutral-300 shadow-sm flex items-center justify-center transition-all duration-300"
                >
                  <div className="station-inner w-2 h-2 rounded-full bg-neutral-300 transition-colors duration-300" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Milestone Steps Container */}
        <div
          ref={stepsContainerRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {steps.map((step, idx) => (
            <div
              key={step.num}
              id={`journey-card-${idx}`}
              className="journey-card bg-white rounded-3xl p-5 sm:p-6 border border-black/[0.06] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_-6px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full group will-change-transform"
            >
              <div>
                {/* Header: Giant decorative numeral + Tag */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-3xl sm:text-4xl font-black text-neutral-300 group-hover:text-brand-500 transition-colors">
                    {step.num}
                  </span>
                  <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider bg-neutral-100 px-2.5 py-1 rounded-full">
                    {step.tag}
                  </span>
                </div>

                {/* Step Headline */}
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight mb-2 text-start">
                  {step.title}
                </h3>

                {/* Step Description */}
                <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed text-start">
                  {step.desc}
                </p>
              </div>

              {/* Step Contextual Visual Widget */}
              <div>{step.visual}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
