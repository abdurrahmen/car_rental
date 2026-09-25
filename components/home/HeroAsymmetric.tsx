'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import type { Branch, Language, Dictionary } from '@/types'
import { Select } from '@/components/ui/Select'
import { HeroVideoPlaceholder } from './HeroVideoPlaceholder'
import { MapPin, Check, X, Search } from 'lucide-react'

export interface HeroAsymmetricProps {
  locale: Language
  branches: Branch[]
  dict: Dictionary
}

type LocationMode = 'agency' | 'custom'

// Helper: Haversine distance in kilometers
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10
}

export function HeroAsymmetric({ locale, branches, dict }: HeroAsymmetricProps) {
  const router = useRouter()
  const isArabic = locale === 'ar'
  const isFrench = locale === 'fr'

  const [mode, setMode] = useState<LocationMode>('agency')
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    branches[0]?.id || ''
  )
  const [customLocation, setCustomLocation] = useState<string>('')
  const [isLocating, setIsLocating] = useState<boolean>(false)
  const [gpsFeedback, setGpsFeedback] = useState<string | null>(null)

  const heroRef = useRef<HTMLElement>(null)
  const leadColRef = useRef<HTMLDivElement>(null)
  const visualColRef = useRef<HTMLDivElement>(null)

  // GSAP Entrance (respects prefers-reduced-motion)
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

      // Smooth subtle entrance for visual column
      if (visualColRef.current) {
        gsap.from(visualColRef.current, {
          y: 20,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
          delay: 0.15,
        })
      }
    }, heroRef)

    return () => ctx.revert()
  }, [])

  // Geolocation detection handler
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert(
        isArabic
          ? 'المتصفح لا يدعم تحديد الموقع الجغرافي تلقائياً. يمكنك كتابة موقعك يدوياً.'
          : isFrench
          ? 'La géolocalisation n est pas supportée par votre navigateur.'
          : 'Geolocation is not supported by your browser.'
      )
      return
    }

    setIsLocating(true)
    setGpsFeedback(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false)
        const userLat = pos.coords.latitude
        const userLng = pos.coords.longitude

        // Find nearest branch using Haversine calculation
        let closestBranch = branches[0]
        let minDistance = Infinity

        branches.forEach((b) => {
          if (b.lat && b.lng) {
            const dist = getDistanceKm(userLat, userLng, b.lat, b.lng)
            if (dist < minDistance) {
              minDistance = dist
              closestBranch = b
            }
          }
        })

        if (closestBranch) {
          setSelectedBranchId(closestBranch.id)
          setMode('agency')
          const branchName = isArabic
            ? closestBranch.name_ar
            : isFrench
            ? closestBranch.name_fr
            : closestBranch.name_en

          setGpsFeedback(
            isArabic
              ? `تم رصد موقعك: أقرب نقطة استلام "${branchName}" (${minDistance} كم)`
              : isFrench
              ? `Position détectée: Agence la plus proche "${branchName}" (${minDistance} km)`
              : `Located! Nearest agency: "${branchName}" (${minDistance} km)`
          )
        }
      },
      () => {
        setIsLocating(false)
        setGpsFeedback(
          isArabic
            ? 'تعذر الوصول إلى نظام GPS. يرجى تفعيل الموقع أو اختيار الوكالة يدوياً.'
            : isFrench
            ? 'Impossible d accéder au GPS. Veuillez activer la localisation ou choisir manuellement.'
            : 'Could not access GPS. Please enable location permissions or choose manually.'
        )
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  // Quick-finder submission handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    const params = new URLSearchParams()
    if (mode === 'agency' && selectedBranchId) {
      params.set('branch', selectedBranchId)
    } else if (mode === 'custom' && customLocation) {
      params.set('location', customLocation)
      if (selectedBranchId) {
        params.set('branch', selectedBranchId)
      }
    }

    const queryString = params.toString()
    const targetUrl = queryString
      ? `/${locale}/vehicles?${queryString}`
      : `/${locale}/vehicles`

    router.push(targetUrl)
  }

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
              (Span 7 on lg, elevated z-index)
              ========================================================= */}
          <div
            ref={leadColRef}
            className="lg:col-span-7 flex flex-col items-start relative z-20"
          >
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

            {/* =========================================================
                QUICK-FINDER BOOKING WIDGET (Elevated z-30 stacking context)
                ========================================================= */}
            <div className="hero-stagger relative z-30 w-full max-w-xl bg-white p-4 sm:p-5 rounded-3xl border border-black/[0.08] shadow-[0_12px_36px_rgba(0,0,0,0.06)] mb-8">
              <form onSubmit={handleSearch} className="space-y-3.5">
                {/* Header row & Location Options */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-black/[0.05] gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                      {isArabic ? 'البحث السريع في الأسطول' : isFrench ? 'Recherche Rapide' : 'Quick Fleet Finder'}
                    </span>
                    <span className="text-[11px] font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                      {isArabic ? 'استلام فوري' : isFrench ? 'Prise directe' : 'Instant Pickup'}
                    </span>
                  </div>

                  {/* Mode Tabs: Official Branch vs Custom Any Location */}
                  <div className="inline-flex items-center p-0.5 rounded-xl bg-neutral-100 text-xs font-medium self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setMode('agency')}
                      className={`px-2.5 py-1 rounded-lg transition-all text-[11px] font-semibold cursor-pointer ${
                        mode === 'agency'
                          ? 'bg-white text-neutral-900 shadow-2xs'
                          : 'text-neutral-500 hover:text-neutral-900'
                      }`}
                    >
                      {isArabic ? 'الوكالات والمطارات' : isFrench ? 'Agences & Aéroports' : 'Agencies & Hubs'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('custom')}
                      className={`px-2.5 py-1 rounded-lg transition-all text-[11px] font-semibold cursor-pointer ${
                        mode === 'custom'
                          ? 'bg-white text-neutral-900 shadow-2xs'
                          : 'text-neutral-500 hover:text-neutral-900'
                      }`}
                    >
                      {isArabic ? 'أي عنوان أو توصيل' : isFrench ? 'Tout lieu / Livraison' : 'Any Address'}
                    </button>
                  </div>
                </div>

                {/* Location Selection Area */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-8 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor={mode === 'agency' ? 'hero_branch_select' : 'hero_custom_location'}
                        className="text-xs font-semibold text-neutral-700 ps-0.5 text-start"
                      >
                        {mode === 'agency'
                          ? dict.reservations.pickup_branch || 'Pickup Gateway'
                          : isArabic
                          ? 'مكان الاستلام أو التوصيل'
                          : isFrench
                          ? 'Lieu de prise en charge ou livraison'
                          : 'Pickup or Delivery Location'}
                      </label>

                      {/* GPS Current Location One-Click Button */}
                      <button
                        type="button"
                        onClick={handleDetectLocation}
                        disabled={isLocating}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100/70 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                        title={
                          isArabic
                            ? 'تحديد أقرب نقطة استلام عبر موقعك الحالي'
                            : 'Detect closest branch using your current GPS location'
                        }
                      >
                        {isLocating ? (
                          <>
                            <span className="w-2.5 h-2.5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                            <span>{isArabic ? 'جاري التحديد...' : 'Locating...'}</span>
                          </>
                        ) : (
                          <>
                            <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                            <span>{isArabic ? 'موقعي الحالي' : isFrench ? 'Ma position' : 'Current Location'}</span>
                          </>
                        )}
                      </button>
                    </div>

                    {mode === 'agency' ? (
                      /* Mode A: Select from Verified Branches */
                      <Select
                        id="hero_branch_select"
                        name="branch"
                        value={selectedBranchId}
                        onChange={(e) => setSelectedBranchId(e.target.value)}
                        options={branches.map((b) => {
                          const name =
                            isArabic ? b.name_ar : isFrench ? b.name_fr : b.name_en
                          return {
                            value: b.id,
                            label: `${b.city} — ${name}`,
                          }
                        })}
                      />
                    ) : (
                      /* Mode B: Any Custom Location / Doorstep Address */
                      <div className="relative w-full">
                        <input
                          id="hero_custom_location"
                          type="text"
                          value={customLocation}
                          onChange={(e) => setCustomLocation(e.target.value)}
                          placeholder={
                            isArabic
                              ? 'اكتب أي عنوان، فندق، أو مطار (مثال: فندق الأوراسي، الجزائر)...'
                              : isFrench
                              ? 'Ex: Hôtel Sheraton Club des Pins, Alger ou Aéroport...'
                              : 'e.g. Sheraton Hotel Club des Pins, Algiers or Airport...'
                          }
                          className="w-full appearance-none rounded-xl border border-neutral-300/80 bg-white px-3.5 pe-9 py-2.5 text-xs sm:text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 transition-all min-h-[44px]"
                        />
                        <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-neutral-400">
                          <MapPin className="w-4 h-4" />
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="sm:col-span-4 flex items-end">
                    <button
                      type="submit"
                      className="apple-press w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 shadow-[0_2px_8px_rgba(0,113,227,0.3)] transition-all min-h-[44px] cursor-pointer"
                    >
                      <Search className="w-4 h-4" />
                      <span>{isArabic ? 'استعراض' : isFrench ? 'Explorer' : 'Search'}</span>
                    </button>
                  </div>
                </div>

                {/* GPS Feedback Pill */}
                {gpsFeedback && (
                  <div className="p-2.5 rounded-xl bg-brand-50/90 border border-brand-200/60 text-xs text-brand-900 flex items-center justify-between gap-2 animate-apple-fade-in">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      <span className="font-medium text-[11px] sm:text-xs truncate">{gpsFeedback}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setGpsFeedback(null)}
                      className="text-brand-400 hover:text-brand-700 p-0.5 rounded hover:bg-brand-100/50 transition-colors shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Trust Assurance Markers */}
            <div className="hero-stagger flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-neutral-600">
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                <span>{isArabic ? 'محضر استلام رقمي (PV)' : 'Digital Condition PV'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-brand-500 stroke-[2.5]" />
                <span>{isArabic ? 'عربون 5000 دج مسترجع' : '5,000 DZD Safe Deposit'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-amber-500 stroke-[2.5]" />
                <span>{isArabic ? 'دفع المتبقي نقدًا بالوكالة' : 'Pay Remainder at Branch'}</span>
              </div>
            </div>
          </div>

          {/* =========================================================
              VISUAL COLUMN: Cinematic Promotion Video Placeholder
              (Span 5 on lg, relative z-10)
              ========================================================= */}
          <div
            ref={visualColRef}
            className="lg:col-span-5 w-full flex flex-col items-center relative z-10"
          >
            <HeroVideoPlaceholder locale={locale} />
          </div>
        </div>
      </div>
    </section>
  )
}
