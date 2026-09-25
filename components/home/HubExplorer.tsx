'use client'

import React, { useState } from 'react'
import { Plane, Ship, Fuel, Building2, MapPin } from 'lucide-react'
import { AlgeriaMap } from './AlgeriaMap'
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

  // Gateway categories and icons
  const getGatewayBadge = (b: Branch) => {
    const text = `${b.city} ${b.name_en} ${b.name_fr}`.toLowerCase()
    if (text.includes('airport') || text.includes('aéroport') || text.includes('مطار')) {
      return {
        type: isArabic ? 'مطار دولي' : 'International Airport',
        Icon: Plane,
        color: 'bg-blue-50 text-blue-700 border-blue-200/60',
        iconBg: 'bg-blue-500/10 text-blue-600',
      }
    }
    if (text.includes('port') || text.includes('maritime') || text.includes('بحرية') || text.includes('ميناء')) {
      return {
        type: isArabic ? 'محطة بحرية وميناء' : 'Maritime Port Gateway',
        Icon: Ship,
        color: 'bg-teal-50 text-teal-700 border-teal-200/60',
        iconBg: 'bg-teal-500/10 text-teal-600',
      }
    }
    if (text.includes('oil') || text.includes('pétrol') || text.includes('بترول') || text.includes('hassi')) {
      return {
        type: isArabic ? 'قاعدة بترولية وصحراوية' : 'Sahara Energy Hub',
        Icon: Fuel,
        color: 'bg-amber-50 text-amber-800 border-amber-200/60',
        iconBg: 'bg-amber-500/10 text-amber-600',
      }
    }
    return {
      type: isArabic ? 'قطب تجاري ووسط المدينة' : 'Commercial City Hub',
      Icon: Building2,
      color: 'bg-purple-50 text-purple-700 border-purple-200/60',
      iconBg: 'bg-purple-500/10 text-purple-600',
    }
  }

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
                  <span className={`p-2.5 rounded-2xl ${badge.iconBg} shrink-0 mt-0.5`}>
                    <badge.Icon className="w-5 h-5" />
                  </span>
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
                    <p className="text-[11px] text-neutral-400 truncate mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span>{b.address}</span>
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Creative Interactive Algeria Map (Span 7 on lg) */}
          <div className="lg:col-span-7 w-full">
            <AlgeriaMap
              locale={locale}
              branches={branches}
              selectedHubId={selectedHubId}
              onSelectHub={(id) => setSelectedHubId(id)}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
