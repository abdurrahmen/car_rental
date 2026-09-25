'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import type { Branch, Language } from '@/types'

export interface HubExplorerProps {
  locale: Language
  branches: Branch[]
}

export function HubExplorer({ locale, branches }: HubExplorerProps) {
  const isArabic = locale === 'ar'
  const isFrench = locale === 'fr'

  const [selectedHubId, setSelectedHubId] = useState<string>(
    branches[0]?.id || ''
  )

  const activeHub =
    branches.find((b) => b.id === selectedHubId) || branches[0]

  const activeHubName = activeHub
    ? isArabic
      ? activeHub.name_ar
      : isFrench
      ? activeHub.name_fr
      : activeHub.name_en
    : ''

  // Gateway categories and icons
  const getGatewayBadge = (b: Branch) => {
    const text = `${b.city} ${b.name_en} ${b.name_fr}`.toLowerCase()
    if (text.includes('airport') || text.includes('aéroport') || text.includes('مطار')) {
      return {
        type: isArabic ? 'مطار دولي' : 'International Airport',
        icon: '✈️',
        color: 'bg-blue-50 text-blue-700 border-blue-200/60',
      }
    }
    if (text.includes('port') || text.includes('maritime') || text.includes('بحرية') || text.includes('ميناء')) {
      return {
        type: isArabic ? 'محطة بحرية وميناء' : 'Maritime Port Gateway',
        icon: '🚢',
        color: 'bg-teal-50 text-teal-700 border-teal-200/60',
      }
    }
    if (text.includes('oil') || text.includes('pétrol') || text.includes('بترول') || text.includes('hassi')) {
      return {
        type: isArabic ? 'قاعدة بترولية وصحراوية' : 'Sahara Energy Hub',
        icon: '🛢️',
        color: 'bg-amber-50 text-amber-800 border-amber-200/60',
      }
    }
    return {
      type: isArabic ? 'قطب تجاري ووسط المدينة' : 'Commercial City Hub',
      icon: '🏢',
      color: 'bg-purple-50 text-purple-700 border-purple-200/60',
    }
  }

  // Cross-wilaya corridors for the active hub
  const getCorridors = (city: string) => {
    const c = (city || '').toLowerCase()
    if (c.includes('alger')) {
      return [
        { dest: isArabic ? 'تيزي وزو / بجاية' : 'Tizi Ouzou / Béjaïa', dist: '110 - 240 km', time: '2h - 3h30' },
        { dest: isArabic ? 'تيبازة / الشلف' : 'Tipaza / Chlef', dist: '70 - 200 km', time: '1h - 2h15' },
        { dest: isArabic ? 'سطيف / قسنطينة' : 'Sétif / Constantine', dist: '300 - 430 km', time: '3h30 - 4h45' },
      ]
    }
    if (c.includes('oran')) {
      return [
        { dest: isArabic ? 'تلمسان / مغنية' : 'Tlemcen / Maghnia', dist: '140 - 180 km', time: '1h45 - 2h15' },
        { dest: isArabic ? 'مستغانم / معسكر' : 'Mostaganem / Mascara', dist: '85 - 105 km', time: '1h - 1h30' },
        { dest: isArabic ? 'عين تموشنت' : 'Aïn Témouchent', dist: '75 km', time: '55 min' },
      ]
    }
    if (c.includes('hassi')) {
      return [
        { dest: isArabic ? 'ورقلة / تقرت' : 'Ouargla / Touggourt', dist: '85 - 170 km', time: '1h15 - 2h' },
        { dest: isArabic ? 'غرداية' : 'Ghardaïa', dist: '270 km', time: '3h15' },
        { dest: isArabic ? 'حقول النفط والغاز' : 'Oilfields & Drilling Sites', dist: 'Direct 4x4', time: 'All-Terrain' },
      ]
    }
    return [
      { dest: isArabic ? 'الولايات المجاورة' : 'Adjacent Wilayas', dist: 'Direct Highway', time: 'Express' },
      { dest: isArabic ? 'الموانئ والمطارات' : 'Airports & Terminals', dist: 'Direct Link', time: 'Fast Track' },
    ]
  }

  const activeBadge = activeHub ? getGatewayBadge(activeHub) : null
  const activeCorridors = activeHub ? getCorridors(activeHub.city) : []

  return (
    <section id="hubs" className="py-20 sm:py-28 bg-[#FBFBFD] border-t border-black/[0.05]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12 text-start">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block mb-2">
            {isArabic ? 'بوابات المطارات والموانئ' : isFrench ? 'Réseau National Stratégique' : 'National Transit Hubs'}
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-neutral-900 leading-tight">
            {isArabic
              ? 'شبكة وكالاتنا عبر النقاط الحيوية في الجزائر'
              : isFrench
              ? 'Présents dans les aéroports et pôles économiques majeurs'
              : 'Strategic Hubs Across Algerian Terminals & Hubs'}
          </h2>
          <p className="text-sm text-neutral-500 mt-2">
            {isArabic
              ? 'استلم مفاتيحك مباشرة عند بوابة الوصول في المطار أو الميناء، وانطلق بدون تأخير.'
              : isFrench
              ? 'Récupérez votre véhicule directement à la sortie du terminal ou du port pour un départ immédiat.'
              : 'Collect keys directly at the airport arrival terminal or port gate with dedicated fast-track pickup.'}
          </p>
        </div>

        {/* Asymmetric Split Layout: Gateway List (Left) + Dossier & Corridors (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Gateway Interactive List (Span 5 on lg) */}
          <div className="lg:col-span-5 space-y-3">
            {branches.map((b) => {
              const isSelected = b.id === selectedHubId
              const badge = getGatewayBadge(b)
              const name = isArabic ? b.name_ar : isFrench ? b.name_fr : b.name_en

              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedHubId(b.id)}
                  className={`apple-press w-full text-start p-4 sm:p-5 rounded-3xl border transition-all duration-200 flex items-start gap-4 ${
                    isSelected
                      ? 'bg-white border-brand-500 shadow-[0_8px_24px_-4px_rgba(0,113,227,0.12)] ring-1 ring-brand-500'
                      : 'bg-white/60 hover:bg-white border-black/[0.06] hover:shadow-sm'
                  }`}
                >
                  <span className="text-2xl mt-0.5">{badge.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-neutral-900 truncate">
                        {b.city}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.color}`}>
                        {badge.type}
                      </span>
                    </div>
                    <h3 className="text-xs text-neutral-600 font-medium line-clamp-1">
                      {name}
                    </h3>
                    <p className="text-[11px] text-neutral-400 truncate mt-1">
                      📍 {b.address}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Gateway Dossier & Corridor Matrix (Span 7 on lg) */}
          {activeHub && (
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.08] shadow-[0_8px_32px_-6px_rgba(0,0,0,0.05)] space-y-6">
              {/* Dossier Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/[0.06]">
                <div className="text-start">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{activeBadge?.icon}</span>
                    <span className="text-xs font-mono font-bold uppercase text-brand-600">
                      {activeHub.city} HUB DOSSIER
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
                    {activeHubName}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    📍 {activeHub.address}
                  </p>
                </div>

                <a
                  href={`tel:${activeHub.phone}`}
                  className="apple-press inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200/80 transition-all self-start sm:self-center"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{activeHub.phone}</span>
                </a>
              </div>

              {/* Corridor Transit Connections from this Hub */}
              <div className="text-start space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">
                  {isArabic ? 'المسارات والوجهات المباشرة من هذه الوكالة:' : isFrench ? 'Liaisons Interwilayas Directes :' : 'Direct Cross-Wilaya Corridors:'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {activeCorridors.map((c, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-neutral-50 border border-black/[0.04] space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px] text-neutral-400">
                        <span>{isArabic ? 'الوجهة' : 'Route'}</span>
                        <span className="font-mono">{c.time}</span>
                      </div>
                      <span className="font-bold text-xs text-neutral-900 block">
                        {c.dest}
                      </span>
                      <span className="text-[11px] text-brand-600 font-mono block">
                        {c.dist}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Operating Checklist */}
              <div className="pt-4 border-t border-black/[0.06] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-xs text-neutral-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{isArabic ? 'استلام بمطار / ميناء' : 'Terminal Delivery'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-brand-500" />
                    <span>{isArabic ? 'مكتب محضر الفحص الرقمي' : 'Digital Inspection Desk'}</span>
                  </div>
                </div>

                <Link
                  href={`/${locale}/vehicles?branch=${activeHub.id}`}
                  className="apple-press inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 transition-all shadow-sm"
                >
                  <span>{isArabic ? 'عرض سيارات هذا الفرع' : isFrench ? 'Véhicules de cette agence' : 'View Agency Fleet'}</span>
                  <span className="rtl:rotate-180">→</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
