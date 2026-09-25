'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Plane, Ship, Fuel, Building2, MapPin, Phone, ArrowUpRight, Compass } from 'lucide-react'
import type { Branch, Language } from '@/types'

export interface AlgeriaMapProps {
  locale: Language
  branches: Branch[]
  selectedHubId: string
  onSelectHub: (id: string) => void
}

// Coordinate projection helper (lat/lng -> SVG viewBox 700x750)
const minLng = -8.7, maxLng = 12.0
const minLat = 19.0, maxLat = 37.2
const padX = 45, padY = 45
const innerW = 700 - 2 * padX
const innerH = 750 - 2 * padY

function projectCoord(lat: number, lng: number): { x: number; y: number } {
  const x = padX + ((lng - minLng) / (maxLng - minLng)) * innerW
  const y = padY + ((maxLat - lat) / (maxLat - minLat)) * innerH
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 }
}

// Fallback coordinates for standard Algerian transit hubs
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  alger: { lat: 36.7538, lng: 3.0588 },
  oran: { lat: 35.6987, lng: -0.6349 },
  constantine: { lat: 36.3650, lng: 6.6147 },
  annaba: { lat: 36.9000, lng: 7.7667 },
  bejaia: { lat: 36.7509, lng: 5.0567 },
  tlemcen: { lat: 34.8783, lng: -1.3150 },
  ghardaia: { lat: 32.4909, lng: 3.6736 },
  'hassi messaoud': { lat: 31.6804, lng: 6.0728 },
  tamanrasset: { lat: 22.7850, lng: 5.5228 },
  ouargla: { lat: 31.9539, lng: 5.3303 },
  bechar: { lat: 31.6167, lng: -2.2167 },
  biskra: { lat: 34.8500, lng: 5.7333 },
}

// Algeria outline polygon SVG path
const ALGERIA_OUTLINE_PATH =
  'M 234.1,118.0 L 259.2,109.9 L 281.7,95.2 L 303.3,86.8 L 339.5,65.8 L 391.9,56.6 L 417.4,51.0 L 451.8,56.6 L 473.4,54.0 L 507.2,51.8 L 533.0,51.0 L 553.4,51.0 L 546.2,73.9 L 543.8,106.3 L 541.7,130.2 L 558.2,176.2 L 585.1,168.8 L 585.1,297.7 L 582.1,323.5 L 594.1,393.4 L 609.1,507.5 L 615.1,551.7 L 657.0,544.3 L 555.2,618.0 L 471.3,689.0 L 387.4,675.0 L 345.5,658.5 L 327.5,625.3 L 156.8,489.1 L 126.9,470.7 L 40.9,433.9 L 40.9,390.8 L 105.9,360.3 L 165.8,312.4 L 234.7,246.2 L 263.1,229.6 L 243.7,227.7 L 270.6,176.2 L 234.7,128.4 Z'

// Key Interwilaya Highways & Strategic Transit Corridors
const TRANSIT_CORRIDORS = [
  // Autoroute Est-Ouest (Tlemcen -> Oran -> Alger -> Bejaia -> Constantine -> Annaba)
  { from: 'tlemcen', to: 'oran', name: 'A1 Ouest' },
  { from: 'oran', to: 'alger', name: 'A1 Centre-Ouest' },
  { from: 'alger', to: 'bejaia', name: 'Pénétrante Béjaïa' },
  { from: 'alger', to: 'constantine', name: 'A1 Centre-Est' },
  { from: 'constantine', to: 'annaba', name: 'A1 Est' },
  // Route Trans-Saharienne RN1 (Alger -> Ghardaïa -> Hassi Messaoud -> Tamanrasset)
  { from: 'alger', to: 'ghardaia', name: 'RN1 Trans-Saharienne' },
  { from: 'ghardaia', to: 'hassi messaoud', name: 'RN49 Pétrole' },
  { from: 'ghardaia', to: 'tamanrasset', name: 'RN1 Grand Sud' },
  // Eastern Link (Constantine -> Hassi Messaoud)
  { from: 'constantine', to: 'hassi messaoud', name: 'RN3 Corridor Énergie' },
  // Western Link (Oran -> Ghardaïa)
  { from: 'oran', to: 'ghardaia', name: 'RN23 Liaison Ouest-Sud' },
]

export function AlgeriaMap({
  locale,
  branches,
  selectedHubId,
  onSelectHub,
}: AlgeriaMapProps) {
  const isArabic = locale === 'ar'
  const isFrench = locale === 'fr'
  const [hoveredHubId, setHoveredHubId] = useState<string | null>(null)

  const activeHub = branches.find((b) => b.id === selectedHubId) || branches[0]

  const activeHubName = activeHub
    ? isArabic
      ? activeHub.name_ar
      : isFrench
      ? activeHub.name_fr
      : activeHub.name_en
    : ''

  // Gateway styling details
  const getBadge = (b: Branch) => {
    const text = `${b.city} ${b.name_en} ${b.name_fr}`.toLowerCase()
    if (text.includes('airport') || text.includes('aéroport') || text.includes('مطار')) {
      return {
        type: isArabic ? 'مطار دولي' : 'Aéroport International',
        Icon: Plane,
        color: 'text-blue-400 bg-blue-500/20 border-blue-400/40',
        glow: 'rgba(59, 130, 246, 0.6)',
      }
    }
    if (text.includes('port') || text.includes('maritime') || text.includes('بحرية') || text.includes('ميناء')) {
      return {
        type: isArabic ? 'ميناء بحري' : 'Port Maritime',
        Icon: Ship,
        color: 'text-teal-400 bg-teal-500/20 border-teal-400/40',
        glow: 'rgba(20, 184, 166, 0.6)',
      }
    }
    if (text.includes('oil') || text.includes('pétrol') || text.includes('بترول') || text.includes('hassi')) {
      return {
        type: isArabic ? 'قاعدة بترولية' : 'Pôle Saharien',
        Icon: Fuel,
        color: 'text-amber-400 bg-amber-500/20 border-amber-400/40',
        glow: 'rgba(245, 158, 11, 0.6)',
      }
    }
    return {
      type: isArabic ? 'قطب تجاري' : 'Pôle Urbain',
      Icon: Building2,
      color: 'text-purple-400 bg-purple-500/20 border-purple-400/40',
      glow: 'rgba(168, 85, 247, 0.6)',
    }
  }

  // Get SVG coordinates for a branch
  const getBranchCoords = (b: Branch): { x: number; y: number } => {
    if (b.lat && b.lng) {
      return projectCoord(b.lat, b.lng)
    }
    const cleanCity = (b.city || '').toLowerCase().trim()
    const found = CITY_COORDS[cleanCity]
    if (found) {
      return projectCoord(found.lat, found.lng)
    }
    return projectCoord(36.75, 3.05) // fallback to Algiers
  }

  // Find corridors related to active hub
  const activeCity = (activeHub?.city || '').toLowerCase().trim()
  const activeCorridors = TRANSIT_CORRIDORS.filter(
    (c) => c.from === activeCity || c.to === activeCity
  )

  const activeBadge = activeHub ? getBadge(activeHub) : null

  return (
    <div className="relative bg-[#0A0F1D] text-white rounded-3xl p-6 sm:p-8 border border-white/10 shadow-[0_16px_50px_-10px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col justify-between min-h-[640px]">
      {/* Background Cartography Grid & Radar Overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute top-0 end-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
              {isArabic ? 'خريطة الجزائر الحية للمسارات' : 'Réseau National Interactif'}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-1">
            {isArabic ? 'بوابات المطارات والموانئ والمدن' : 'Algérie Mobility & Terminal Radar'}
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-neutral-400 font-mono">
            <Compass className="w-3.5 h-3.5 text-brand-400" />
            <span>N 36.75° E 3.05°</span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-300 font-semibold border border-brand-500/30">
            {branches.length} {isArabic ? 'وكالات' : 'Hubs'}
          </span>
        </div>
      </div>

      {/* Main Interactive SVG Map Canvas */}
      <div className="relative z-10 my-4 flex-1 flex items-center justify-center min-h-[380px] sm:min-h-[440px]">
        <svg
          viewBox="0 0 700 750"
          className="w-full h-auto max-h-[460px] filter drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
        >
          <defs>
            {/* National Territory Gradient */}
            <linearGradient id="dzGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#0F172A" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#090D1A" stopOpacity="0.95" />
            </linearGradient>

            {/* Glowing Shoreline Filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Mediterranean Sea Shoreline Accent */}
          <path
            d="M 230,115 Q 380,40 550,48"
            fill="none"
            stroke="#0284C7"
            strokeWidth="3"
            strokeOpacity="0.4"
            strokeDasharray="4 4"
          />

          {/* Algeria National Boundary Vector */}
          <path
            d={ALGERIA_OUTLINE_PATH}
            fill="url(#dzGrad)"
            stroke="#38BDF8"
            strokeWidth="1.8"
            strokeOpacity="0.75"
            className="transition-all duration-300"
          />

          {/* Regional Geo Contours (Tell Atlas & Sahara Dividing Horizon) */}
          <path
            d="M 240,165 Q 400,120 545,150"
            fill="none"
            stroke="#ffffff"
            strokeWidth="0.8"
            strokeOpacity="0.12"
            strokeDasharray="6 6"
          />
          <path
            d="M 230,240 Q 400,210 580,260"
            fill="none"
            stroke="#ffffff"
            strokeWidth="0.8"
            strokeOpacity="0.1"
            strokeDasharray="6 6"
          />

          {/* Highway & Transit Corridors Network */}
          {TRANSIT_CORRIDORS.map((corridor, idx) => {
            const fromCoord = CITY_COORDS[corridor.from]
            const toCoord = CITY_COORDS[corridor.to]
            if (!fromCoord || !toCoord) return null

            const p1 = projectCoord(fromCoord.lat, fromCoord.lng)
            const p2 = projectCoord(toCoord.lat, toCoord.lng)
            const isCorridorActive =
              corridor.from === activeCity || corridor.to === activeCity

            // Subtle curved arc
            const dx = p2.x - p1.x
            const dy = p2.y - p1.y
            const cx = (p1.x + p2.x) / 2 - dy * 0.12
            const cy = (p1.y + p2.y) / 2 + dx * 0.12
            const pathData = `M ${p1.x},${p1.y} Q ${cx},${cy} ${p2.x},${p2.y}`

            return (
              <g key={idx}>
                {/* Background static highway */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={isCorridorActive ? '#38BDF8' : '#ffffff'}
                  strokeWidth={isCorridorActive ? '2.5' : '1'}
                  strokeOpacity={isCorridorActive ? '0.85' : '0.12'}
                  className="transition-all duration-500"
                />

                {/* Animated Flow Pulse on Active Corridors */}
                {isCorridorActive && (
                  <path
                    d={pathData}
                    fill="none"
                    stroke="#F97316"
                    strokeWidth="2.5"
                    strokeDasharray="6 12"
                    className="animate-[dash_2s_linear_infinite]"
                  />
                )}
              </g>
            )
          })}

          {/* Interactive Branch Markers */}
          {branches.map((b) => {
            const { x, y } = getBranchCoords(b)
            const isSelected = b.id === selectedHubId
            const isHovered = b.id === hoveredHubId
            const badge = getBadge(b)
            const name = isArabic ? b.name_ar : isFrench ? b.name_fr : b.name_en

            return (
              <g
                key={b.id}
                className="cursor-pointer group"
                onClick={() => onSelectHub(b.id)}
                onMouseEnter={() => setHoveredHubId(b.id)}
                onMouseLeave={() => setHoveredHubId(null)}
              >
                {/* Concentric Radar Ring on Selected Hub */}
                {isSelected && (
                  <>
                    <circle
                      cx={x}
                      cy={y}
                      r="22"
                      fill="none"
                      stroke="#F97316"
                      strokeWidth="1.5"
                      strokeOpacity="0.7"
                      className="animate-ping"
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r="16"
                      fill="rgba(249, 115, 22, 0.18)"
                      stroke="#F97316"
                      strokeWidth="1.5"
                    />
                  </>
                )}

                {/* Node Outer Ring */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? '10' : isHovered ? '9' : '7'}
                  fill={isSelected ? '#F97316' : '#0F172A'}
                  stroke={isSelected ? '#FFFFFF' : '#38BDF8'}
                  strokeWidth="2"
                  className="transition-all duration-200"
                />

                {/* Center Core */}
                <circle
                  cx={x}
                  cy={y}
                  r="3.5"
                  fill={isSelected ? '#FFFFFF' : '#38BDF8'}
                />

                {/* City Tag Label */}
                <g transform={`translate(${x + 12}, ${y + 4})`}>
                  <rect
                    x="-4"
                    y="-12"
                    width={b.city.length * 8 + 14}
                    height="18"
                    rx="4"
                    fill={isSelected ? '#F97316' : 'rgba(15, 23, 42, 0.85)'}
                    stroke={isSelected ? '#FFAA55' : 'rgba(255, 255, 255, 0.2)'}
                    strokeWidth="0.8"
                    className="backdrop-blur-sm transition-colors duration-200"
                  />
                  <text
                    x="3"
                    y="1"
                    fontSize="9.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                    fill="#FFFFFF"
                    className="select-none uppercase"
                  >
                    {b.city}
                  </text>
                </g>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Floating Glass Dossier Bar (Directly below the interactive map) */}
      {activeHub && (
        <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <div className="flex items-start sm:items-center gap-3.5">
            {activeBadge && (
              <span className={`p-3 rounded-xl border ${activeBadge.color} shrink-0`}>
                <activeBadge.Icon className="w-5 h-5" />
              </span>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase text-brand-400">
                  {activeHub.city}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 font-medium text-neutral-300">
                  {activeBadge?.type}
                </span>
              </div>
              <h4 className="text-base font-bold text-white tracking-tight mt-0.5">
                {activeHubName}
              </h4>
              <p className="text-xs text-neutral-300 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span>{activeHub.address}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <a
              href={`tel:${activeHub.phone}`}
              className="apple-press inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{activeHub.phone}</span>
            </a>

            <Link
              href={`/${locale}/vehicles?branch=${activeHub.id}`}
              className="apple-press inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-500 to-blue-600 hover:from-brand-600 hover:to-blue-700 shadow-[0_2px_12px_rgba(0,113,227,0.4)] transition-all"
            >
              <span>{isArabic ? 'سيارات هذا الفرع' : 'Véhicules de ce hub'}</span>
              <ArrowUpRight className="w-3.5 h-3.5 rtl:rotate-90" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
