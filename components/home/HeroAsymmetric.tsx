'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import type { Branch, Language, Dictionary } from '@/types'

export interface HeroAsymmetricProps {
  locale: Language
  branches: Branch[]
  dict: Dictionary
}

export function HeroAsymmetric({ locale, branches, dict }: HeroAsymmetricProps) {
  const router = useRouter()
  const isArabic = locale === 'ar'
  const isFrench = locale === 'fr'

  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    branches[0]?.id || ''
  )
  const [activeHubIndex, setActiveHubIndex] = useState<number>(0)

  const heroRef = useRef<HTMLDivElement>(null)
  const leadColRef = useRef<HTMLDivElement>(null)
  const visualColRef = useRef<HTMLDivElement>(null)
  const terminalCardRef = useRef<HTMLDivElement>(null)

  // GSAP Entrance & Parallax (respects prefers-reduced-motion)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      // Staggered reveal of text and widget in lead column
      gsap.from('.hero-stagger', {
        y: 28,
        opacity: 0,
        duration: 0.85,
        stagger: 0.12,
        ease: 'power3.out',
      })

      // Smooth subtle entrance for terminal card
      gsap.from(terminalCardRef.current, {
        scale: 0.96,
        opacity: 0,
        y: 20,
        duration: 1,
        ease: 'power3.out',
        delay: 0.2,
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  // Quick-finder submission handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const targetUrl = selectedBranchId
      ? `/${locale}/vehicles?branch=${selectedBranchId}`
      : `/${locale}/vehicles`
    router.push(targetUrl)
  }

  // Active hub data
  const currentBranch = branches[activeHubIndex] || branches[0]
  const currentBranchName = currentBranch
    ? isArabic
      ? currentBranch.name_ar
      : isFrench
      ? currentBranch.name_fr
      : currentBranch.name_en
    : ''

  return (
    <section
      ref={heroRef}
      className="relative pt-8 pb-16 sm:pt-14 sm:pb-24 overflow-hidden border-b border-black/[0.05]"
    >
      {/* Ambient background glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-48 start-1/4 w-[650px] h-[500px] bg-gradient-to-br from-brand-500/12 via-accent-500/6 to-transparent blur-3xl opacity-75"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 end-[-100px] w-[500px] h-[400px] bg-brand-500/5 blur-3xl opacity-60"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Asymmetric 12-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* =========================================================
              LEAD COLUMN: Editorial Display, Value Proposition & Search
              (Span 7 on lg)
              ========================================================= */}
          <div ref={leadColRef} className="lg:col-span-7 flex flex-col items-start">
            {/* National Network Eyebrow Badge */}
            <div className="hero-stagger inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white border border-black/[0.08] text-xs font-semibold text-neutral-800 tracking-tight mb-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>
                {isArabic
                  ? 'شبكة التنقل الوطنية المعتمدة • 58 ولاية جزائرية'
                  : isFrench
                  ? 'Réseau national certifié de mobilité • 58 Wilayas'
                  : 'Certified National Mobility Network • 58 Wilayas'}
              </span>
            </div>

            {/* Main Editorial Headline with Scale Jump */}
            <h1 className="hero-stagger text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 leading-[1.12] mb-5 text-start">
              {isArabic ? (
                <>
                  أسطول معتمد <br className="hidden sm:inline" />
                  <span className="text-brand-500 font-extrabold">
                    لكل طرق الجزائر
                  </span>
                  ، بدون مفاجآت.
                </>
              ) : isFrench ? (
                <>
                  La mobilité nationale <br className="hidden sm:inline" />
                  <span className="text-brand-500 font-extrabold">
                    certifiée & sans friction
                  </span>{' '}
                  en Algérie.
                </>
              ) : (
                <>
                  Algeria’s Verified Fleet, <br className="hidden sm:inline" />
                  <span className="text-brand-500 font-extrabold">
                    Across 58 Wilayas
                  </span>
                  . Zero Friction.
                </>
              )}
            </h1>

            {/* Informative Value Proposition */}
            <p className="hero-stagger text-sm sm:text-base text-neutral-600 leading-relaxed mb-8 max-w-xl text-start">
              {isArabic
                ? 'تنقل بسلاسة بين الولايات والمطارات. حجز رقمي فوري، عربون رمزي 5000 دج مسترجع ومحمي، واستلام بالوكالة مع محضر فحص رقمي (PV) مصوّر يضمن حقك.'
                : isFrench
                ? 'Voyagez librement entre aéroports et wilayas. Réservation directe, caution de 5 000 DZD garantie et restituée, avec état des lieux numérique (PV) contradictoire par photo.'
                : 'Direct cross-wilaya and airport rentals. Immediate reservation, protected 5,000 DZD refundable hold, and photographic digital inspection (PV) for total peace of mind.'}
            </p>

            {/* Quick-Finder Booking Widget (Hero-integrated) */}
            <div className="hero-stagger w-full max-w-xl bg-white p-4 sm:p-5 rounded-3xl border border-black/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.04)] mb-8">
              <form onSubmit={handleSearch} className="space-y-3">
                <div className="flex items-center justify-between pb-2.5 border-b border-black/[0.05]">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    {isArabic ? 'البحث السريع في الأسطول' : isFrench ? 'Recherche Rapide' : 'Quick Fleet Finder'}
                  </span>
                  <span className="text-[11px] font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                    {isArabic ? 'استلام فوري' : isFrench ? 'Prise en charge directe' : 'Instant Pickup'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  {/* Agency Selector */}
                  <div className="sm:col-span-8 flex flex-col gap-1">
                    <label
                      htmlFor="hero_branch_select"
                      className="text-xs font-semibold text-neutral-700 ps-0.5 text-start"
                    >
                      {dict.reservations.pickup_branch || 'Pickup Gateway'}
                    </label>
                    <div className="relative">
                      <select
                        id="hero_branch_select"
                        value={selectedBranchId}
                        onChange={(e) => setSelectedBranchId(e.target.value)}
                        className="w-full appearance-none rounded-xl border border-neutral-300/80 bg-neutral-50/60 px-3.5 pe-9 py-2.5 text-xs sm:text-sm font-medium text-neutral-900 focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 transition-all min-h-[44px]"
                      >
                        {branches.map((b) => {
                          const name =
                            isArabic ? b.name_ar : isFrench ? b.name_fr : b.name_en
                          return (
                            <option key={b.id} value={b.id}>
                              📍 {b.city} — {name}
                            </option>
                          )
                        })}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-neutral-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="sm:col-span-4 flex items-end">
                    <button
                      type="submit"
                      className="apple-press w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 shadow-[0_2px_8px_rgba(0,113,227,0.3)] transition-all min-h-[44px]"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span>{isArabic ? 'استعراض' : isFrench ? 'Explorer' : 'Search'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Trust Assurance Markers */}
            <div className="hero-stagger flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-neutral-600">
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>{isArabic ? 'محضر استلام رقمي (PV)' : 'Digital Condition PV'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-brand-500 font-bold">✓</span>
                <span>{isArabic ? 'عربون 5000 دج مسترجع' : '5,000 DZD Safe Deposit'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-amber-500 font-bold">✓</span>
                <span>{isArabic ? 'دفع المتبقي نقدًا بالوكالة' : 'Pay Remainder at Branch'}</span>
              </div>
            </div>
          </div>

          {/* =========================================================
              VISUAL COLUMN: Live Departure & Wilaya Route Terminal Card
              (Span 5 on lg)
              ========================================================= */}
          <div ref={visualColRef} className="lg:col-span-5 flex flex-col items-center">
            <div
              ref={terminalCardRef}
              className="w-full bg-white rounded-3xl p-6 sm:p-7 border border-black/[0.08] shadow-[0_12px_40px_-8px_rgba(0,0,0,0.06)] relative overflow-hidden"
            >
              {/* Terminal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-black/[0.06] mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-600 font-mono font-bold text-sm">
                    DZ
                  </div>
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 text-start">
                      {isArabic ? 'محطة الانطلاق الوطنية' : isFrench ? 'Terminal de Départ National' : 'National Mobility Terminal'}
                    </h2>
                    <p className="text-[11px] text-neutral-400 text-start font-mono">
                      LIVE DISPATCH • 2024-2025 FLEET
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/60">
                  READY
                </span>
              </div>

              {/* Hub Quick-Pill Switcher */}
              <div className="mb-5">
                <span className="text-[11px] font-semibold text-neutral-400 block mb-2 text-start">
                  {isArabic ? 'اختر نقطة الانطلاق السريعة:' : isFrench ? 'Sélectionnez votre pôle :' : 'Select active corridor:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {branches.slice(0, 5).map((b, idx) => {
                    const isSelected = idx === activeHubIndex
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          setActiveHubIndex(idx)
                          setSelectedBranchId(b.id)
                        }}
                        className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                          isSelected
                            ? 'bg-neutral-900 text-white shadow-sm'
                            : 'bg-black/[0.03] text-neutral-600 hover:bg-black/[0.06]'
                        }`}
                      >
                        {b.city}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Active Hub Detail Card */}
              <div className="bg-neutral-50/90 rounded-2xl p-4 border border-black/[0.05] mb-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-900">
                    {currentBranchName}
                  </span>
                  <span className="text-[11px] font-semibold text-brand-600">
                    {currentBranch?.city}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed text-start">
                  📍 {currentBranch?.address}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-black/[0.04] text-[11px]">
                  <span className="text-neutral-500 font-mono">📞 {currentBranch?.phone}</span>
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {isArabic ? 'وكالة مفتوحة' : 'Open 08:00 - 19:00'}
                  </span>
                </div>
              </div>

              {/* Active Verified Vehicle Showcase Snapshot */}
              <div className="bg-white rounded-2xl p-3.5 border border-brand-500/20 shadow-sm flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-xl bg-neutral-100 overflow-hidden flex-shrink-0 relative">
                  <Image
                    src="https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=200&q=80"
                    alt="Verified Vehicle"
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 text-start">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-neutral-900 truncate">
                      Dacia Sandero / Renault Clio V
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-emerald-50 text-emerald-700 font-semibold rounded">
                      PV ✓
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                    {isArabic ? 'محضر فحص رقمي جاهز • تأمين شامل' : 'Digital Handover Check Ready'}
                  </p>
                  <div className="flex items-center justify-between mt-1 text-xs">
                    <span className="font-bold text-neutral-900">
                      6,000 <span className="text-[10px] text-neutral-400 font-normal">DZD/jour</span>
                    </span>
                    <Link
                      href={`/${locale}/vehicles`}
                      className="text-[11px] font-semibold text-brand-600 hover:text-brand-700"
                    >
                      {isArabic ? 'احجز الآن ←' : 'Reserve →'}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
