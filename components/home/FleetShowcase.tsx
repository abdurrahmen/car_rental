'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin } from 'lucide-react'
import { formatDZD } from '@/lib/utils/constants'
import type { Language, Vehicle, VehiclePhoto } from '@/types'

export interface FleetShowcaseProps {
  locale: Language
  vehicles: (Vehicle & {
    photos: VehiclePhoto[]
    category?: { name_ar: string; name_fr: string; name_en: string; id?: string }
    branch?: { name_ar: string; name_fr: string; name_en: string; city?: string }
  })[]
}

export function FleetShowcase({ locale, vehicles }: FleetShowcaseProps) {
  const isArabic = locale === 'ar'
  const isFrench = locale === 'fr'

  const [activeCategory, setActiveCategory] = useState<string>('all')

  const filterTabs = [
    {
      id: 'all',
      label: isArabic ? 'جميع المركبات' : isFrench ? 'Tous les véhicules' : 'All Fleet',
    },
    {
      id: 'economy',
      label: isArabic ? 'اقتصادية ومدنية' : isFrench ? 'Citadines & Éco' : 'City & Economy',
    },
    {
      id: 'sedan',
      label: isArabic ? 'سياحية وبرلين' : isFrench ? 'Berlines Routières' : 'Highway Sedans',
    },
    {
      id: 'suv',
      label: isArabic ? 'دفع رباعي 4x4 وصحراء' : isFrench ? 'SUVs & 4x4 Sahara' : 'SUVs & 4x4',
    },
    {
      id: 'utility',
      label: isArabic ? 'نفعية ونقل بضائع' : isFrench ? 'Utilitaires Fourgons' : 'Cargo & Vans',
    },
  ]

  const filteredVehicles = vehicles.filter((v) => {
    if (activeCategory === 'all') return true
    const modelLower = `${v.make} ${v.model}`.toLowerCase()
    const catNameLower = (v.category?.name_en || '').toLowerCase()

    if (activeCategory === 'economy') {
      return (
        catNameLower.includes('economy') ||
        catNameLower.includes('compact') ||
        modelLower.includes('clio') ||
        modelLower.includes('sandero') ||
        modelLower.includes('i10') ||
        modelLower.includes('symbol') ||
        modelLower.includes('logan')
      )
    }
    if (activeCategory === 'sedan') {
      return (
        catNameLower.includes('sedan') ||
        catNameLower.includes('executive') ||
        catNameLower.includes('berline') ||
        modelLower.includes('octavia') ||
        modelLower.includes('corolla') ||
        modelLower.includes('508')
      )
    }
    if (activeCategory === 'suv') {
      return (
        catNameLower.includes('suv') ||
        catNameLower.includes('4x4') ||
        modelLower.includes('prado') ||
        modelLower.includes('tucson') ||
        modelLower.includes('duster') ||
        modelLower.includes('cruiser')
      )
    }
    if (activeCategory === 'utility') {
      return (
        catNameLower.includes('utility') ||
        catNameLower.includes('cargo') ||
        catNameLower.includes('fourgon') ||
        catNameLower.includes('pick') ||
        modelLower.includes('master') ||
        modelLower.includes('boxer') ||
        modelLower.includes('hilux') ||
        modelLower.includes('d-max') ||
        modelLower.includes('h-100') ||
        modelLower.includes('jcb')
      )
    }
    return true
  })

  return (
    <section id="fleet" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      {/* Header with Asymmetric Accent */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="text-start max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block mb-2">
            {isArabic ? 'جاهزة للانطلاق فوراً' : isFrench ? 'Flotte Certifiée 2024-2025' : 'Verified Fleet 2024-2025'}
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-neutral-900 leading-tight">
            {isArabic ? 'أسطول يلائم جميع طرق الجزائر' : isFrench ? 'Des véhicules pour chaque itinéraire' : 'Tailored For Every Algerian Journey'}
          </h2>
          <p className="text-sm text-neutral-500 mt-2">
            {isArabic
              ? 'صيانة دورية معتمدة، تأمين شامل، وتوثيق فوري لحالة السيارة عند كل استلام وتسليم.'
              : isFrench
              ? 'Entretiens certifiés, assurance multirisque et état des lieux contradictoire avec photos.'
              : 'Certified regular maintenance, comprehensive insurance, and digital condition handover.'}
          </p>
        </div>

        <Link
          href={`/${locale}/vehicles`}
          className="apple-press inline-flex items-center gap-2 self-start md:self-end px-5 py-2.5 rounded-full text-xs font-bold tracking-tight bg-neutral-900 text-white hover:bg-neutral-800 transition-all shadow-sm"
        >
          <span>{isArabic ? 'تصفح كامل الأسطول' : isFrench ? 'Voir toute la flotte' : 'Explore All Vehicles'}</span>
          <span className="rtl:rotate-180">→</span>
        </Link>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
        {filterTabs.map((tab) => {
          const isActive = tab.id === activeCategory
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id)}
              className={`apple-press whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition-all min-h-[40px] ${
                isActive
                  ? 'bg-brand-500 text-white shadow-[0_2px_10px_rgba(0,113,227,0.3)]'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100/80 border border-black/[0.06]'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Vehicle Grid with Varied Elevation & Polish */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => {
          const photoUrl =
            vehicle.photos?.[0]?.storage_path ||
            'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80'

          const branchName = vehicle.branch
            ? isArabic
              ? vehicle.branch.name_ar
              : isFrench
              ? vehicle.branch.name_fr
              : vehicle.branch.name_en
            : ''

          return (
            <div
              key={vehicle.id}
              className="bg-white rounded-3xl border border-black/[0.06] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_-6px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group"
            >
              {/* Photo Area */}
              <div className="relative aspect-[16/10] bg-neutral-100 overflow-hidden">
                <Image
                  src={photoUrl}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                {/* Year Pill */}
                <span className="absolute top-3.5 start-3.5 text-[10px] font-mono font-bold bg-black/60 text-white backdrop-blur-md px-2.5 py-1 rounded-full">
                  {vehicle.year}
                </span>
                {/* Deposit Badge */}
                <span className="absolute top-3.5 end-3.5 text-[10px] font-semibold bg-white/90 text-neutral-900 backdrop-blur-md px-2.5 py-1 rounded-full border border-black/[0.06]">
                  {isArabic ? 'عربون 5000 دج' : '5,000 DZD Hold'}
                </span>
              </div>

              {/* Body */}
              <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-brand-600 bg-brand-500/10 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span>{vehicle.branch?.city || 'Alger'}</span>
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">
                      {vehicle.plate_number}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight text-start">
                    {vehicle.make} {vehicle.model}
                  </h3>
                  <p className="text-xs text-neutral-500 text-start line-clamp-1 mt-0.5">
                    {branchName}
                  </p>

                  {/* Specs Matrix */}
                  <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-black/[0.04] text-[11px] text-neutral-600">
                    <span className="bg-neutral-100 px-2 py-0.5 rounded-md font-medium">
                      {vehicle.transmission === 'automatic'
                        ? isArabic ? 'أوتوماتيك' : 'Auto'
                        : isArabic ? 'يدوي' : 'Manual'}
                    </span>
                    <span className="bg-neutral-100 px-2 py-0.5 rounded-md font-medium">
                      {vehicle.seats} {isArabic ? 'مقاعد' : 'Seats'}
                    </span>
                    <span className="bg-neutral-100 px-2 py-0.5 rounded-md font-medium capitalize">
                      {vehicle.fuel_type}
                    </span>
                  </div>
                </div>

                {/* Pricing & Direct CTA */}
                <div className="flex items-center justify-between pt-3 border-t border-black/[0.05]">
                  <div>
                    <span className="text-[11px] text-neutral-400 block">
                      {isArabic ? 'السعر اليومي' : 'Prix par jour'}
                    </span>
                    <span className="text-base font-extrabold text-neutral-900 tracking-tight">
                      {formatDZD(vehicle.daily_rate, locale)}
                    </span>
                  </div>

                  <Link
                    href={`/${locale}/vehicles/${vehicle.id}`}
                    className="apple-press inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 transition-all shadow-sm"
                  >
                    <span>{isArabic ? 'حجز' : isFrench ? 'Réserver' : 'Reserve'}</span>
                    <span className="rtl:rotate-180">→</span>
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
