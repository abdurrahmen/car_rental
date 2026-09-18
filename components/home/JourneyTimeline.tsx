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

    const ctx = gsap.context(() => {
      // Scroll-linked progress line animation
      if (progressLineRef.current && sectionRef.current) {
        gsap.fromTo(
          progressLineRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
              end: 'bottom 85%',
              scrub: 0.5,
            },
          }
        )
      }

      // Staggered appearance of milestone cards
      gsap.from('.journey-card', {
        y: 35,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: stepsContainerRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

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
      className="py-20 sm:py-28 bg-[#F6F6F9] border-y border-black/[0.06] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Typographic Hierarchy */}
        <div className="max-w-3xl mb-14 sm:mb-20 text-start">
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

        {/* Connected Horizontal Progress Line Track (Desktop) */}
        <div className="hidden lg:block relative mb-6">
          <div className="h-1 w-full bg-black/[0.06] rounded-full overflow-hidden">
            <div
              ref={progressLineRef}
              className="h-full bg-gradient-to-r from-brand-500 via-brand-600 to-emerald-500 origin-start"
            />
          </div>
        </div>

        {/* Milestone Steps Container */}
        <div
          ref={stepsContainerRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {steps.map((step) => (
            <div
              key={step.num}
              className="journey-card bg-white rounded-3xl p-6 sm:p-7 border border-black/[0.06] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_-6px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full group"
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
