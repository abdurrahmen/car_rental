'use client'

import React, { useState } from 'react'
import { formatDZD } from '@/lib/utils/constants'
import type { Language } from '@/types'
import type { RevenueDataPoint } from '@/lib/utils/revenue-series'

export interface AreaChartProps {
  data: RevenueDataPoint[]
  locale?: Language
  height?: number
  className?: string
}

/**
 * Custom Lightweight SVG Area Chart:
 * - Current period & Previous comparison curve
 * - Smooth cubic bezier interpolation
 * - Interactive hover tooltips
 * - Accessible value axis & date labels
 * - Zero external charting dependencies
 */
export function AreaChart({
  data,
  locale = 'ar',
  height = 220,
  className = '',
}: AreaChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const isArabic = locale === 'ar'

  if (!data || data.length < 2) return null

  // Calculate max value with headroom
  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.current, d.previous || 0)),
    50000
  )
  const ceiling = Math.ceil(maxVal * 1.15 / 10000) * 10000

  // SVG coordinate system
  const svgWidth = 600
  const svgHeight = height
  const padLeft = 60
  const padRight = 20
  const padTop = 20
  const padBottom = 35

  const chartWidth = svgWidth - padLeft - padRight
  const chartHeight = svgHeight - padTop - padBottom

  // Points computation - Reverse X-axis for RTL languages
  const getX = (index: number) => {
    const position = padLeft + (index / (data.length - 1)) * chartWidth
    return isArabic ? (svgWidth - padRight - position + padLeft) : position
  }
  const getY = (val: number) => padTop + chartHeight - (val / ceiling) * chartHeight

  const currentPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.current) }))
  const previousPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.previous || 0) }))

  // Build smooth bezier path
  const createSmoothPath = (pts: { x: number; y: number }[]) => {
    let path = `M ${pts[0].x} ${pts[0].y}`
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i]
      const p1 = pts[i + 1]
      const cx = (p0.x + p1.x) / 2
      path += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`
    }
    return path
  }

  const currentLineD = createSmoothPath(currentPoints)
  const currentAreaD = `${currentLineD} L ${currentPoints[currentPoints.length - 1].x} ${padTop + chartHeight} L ${currentPoints[0].x} ${padTop + chartHeight} Z`
  const previousLineD = createSmoothPath(previousPoints)

  // 4 horizontal grid ticks
  const yTicks = [0, ceiling * 0.33, ceiling * 0.66, ceiling]

  // Pick up to 6 date labels for x-axis
  const labelStep = Math.max(1, Math.floor(data.length / 5))
  const xLabels = data.filter((_, idx) => idx % labelStep === 0 || idx === data.length - 1)

  const activePoint = hoverIndex !== null ? data[hoverIndex] : null
  const activeCoord = hoverIndex !== null ? currentPoints[hoverIndex] : null

  return (
    <div className={`relative w-full ${className}`}>
      {/* Interactive Tooltip Card */}
      {activePoint && activeCoord && (
        <div
          className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full -top-2 px-3 py-2 rounded-xl bg-neutral-900/95 dark:bg-white/95 text-white dark:text-neutral-900 text-xs shadow-xl backdrop-blur-md space-y-1"
          style={{
            left: `${(activeCoord.x / svgWidth) * 100}%`,
            top: `${(activeCoord.y / svgHeight) * 100}%`,
          }}
        >
          <div className="font-semibold text-[11px] opacity-80 border-b border-white/10 dark:border-black/10 pb-1">
            {activePoint.label}
          </div>
          <div className="flex items-center justify-between gap-3 text-xs font-bold text-brand-400 dark:text-brand-600">
            <span>{locale === 'ar' ? 'الحالي' : 'Actuel'}:</span>
            <span dir="ltr">{formatDZD(activePoint.current, locale)}</span>
          </div>
          {activePoint.previous !== undefined && (
            <div className="flex items-center justify-between gap-3 text-[10px] opacity-75">
              <span>{locale === 'ar' ? 'السابق' : 'Précédent'}:</span>
              <span dir="ltr">{formatDZD(activePoint.previous, locale)}</span>
            </div>
          )}
        </div>
      )}

      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto overflow-visible select-none"
      >
        <defs>
          <linearGradient id="revenue-area-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0071E3" stopOpacity="0.22" />
            <stop offset="90%" stopColor="#0071E3" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines & Y labels */}
        {yTicks.map((val, idx) => {
          const y = getY(val)
          return (
            <g key={idx}>
              <line
                x1={padLeft}
                y1={y}
                x2={svgWidth - padRight}
                y2={y}
                stroke="currentColor"
                className="text-neutral-200/60 dark:text-white/5"
                strokeDasharray={idx > 0 ? '3 3' : 'none'}
              />
              <text
                x={padLeft - 8}
                y={y + 3.5}
                textAnchor="end"
                className="text-[9px] fill-neutral-400 font-mono font-medium"
              >
                {Math.round(val / 1000)}k
              </text>
            </g>
          )
        })}

        {/* Previous period line (subtle dashed) */}
        <path
          d={previousLineD}
          fill="none"
          stroke="#94A3B8"
          strokeWidth="1.75"
          strokeDasharray="4 4"
          className="opacity-60"
        />

        {/* Current period area gradient */}
        <path d={currentAreaD} fill="url(#revenue-area-gradient)" />

        {/* Current period line */}
        <path
          d={currentLineD}
          fill="none"
          stroke="#0071E3"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Interactive Hover Guides & Hover Spots */}
        {data.map((_, idx) => {
          const pt = currentPoints[idx]
          const isHovered = hoverIndex === idx

          return (
            <g
              key={idx}
              onMouseEnter={() => setHoverIndex(idx)}
              onMouseLeave={() => setHoverIndex(null)}
              className="cursor-pointer"
            >
              {/* Invisible wide hit area */}
              <rect
                x={pt.x - chartWidth / (data.length * 2)}
                y={padTop}
                width={chartWidth / data.length}
                height={chartHeight}
                fill="transparent"
              />

              {isHovered && (
                <>
                  <line
                    x1={pt.x}
                    y1={padTop}
                    x2={pt.x}
                    y2={padTop + chartHeight}
                    stroke="#0071E3"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={5}
                    fill="#0071E3"
                    stroke="white"
                    strokeWidth="2.5"
                  />
                </>
              )}
            </g>
          )
        })}

        {/* X-axis date labels */}
        {xLabels.map((pt, idx) => {
          const originalIdx = data.findIndex((d) => d.date === pt.date)
          const x = getX(originalIdx)

          return (
            <text
              key={idx}
              x={x}
              y={svgHeight - 8}
              textAnchor="middle"
              className="text-[9px] fill-neutral-400 font-medium"
            >
              {pt.label}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
