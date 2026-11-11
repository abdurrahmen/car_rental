'use client'

import React from 'react'

export interface Segment {
  key: string
  label: string
  count: number
  color: string // Tailwind bg class or hex
  textColor?: string
}

export interface SegmentedBarProps {
  segments: Segment[]
  total?: number
  height?: number
  showLegend?: boolean
  className?: string
}

/**
 * Segmented status bar displaying categorical distribution with rounded ends
 * and accessible breakdown legend.
 */
export function SegmentedBar({
  segments,
  total: explicitTotal,
  height = 8,
  showLegend = true,
  className = '',
}: SegmentedBarProps) {
  const sum = segments.reduce((acc, s) => acc + s.count, 0)
  const total = explicitTotal ?? (sum > 0 ? sum : 1)

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Visual Bar */}
      <div
        className="w-full rounded-full overflow-hidden flex bg-neutral-100 dark:bg-white/10 p-0.5 gap-0.5 shadow-inner"
        style={{ height: height + 4 }}
      >
        {segments.map((seg) => {
          const pct = sum > 0 ? (seg.count / total) * 100 : 0
          if (pct <= 0) return null

          return (
            <div
              key={seg.key}
              style={{
                width: `${pct}%`,
                backgroundColor: seg.color.startsWith('#') ? seg.color : undefined,
              }}
              className={`h-full rounded-full transition-all duration-500 first:rounded-s-full last:rounded-e-full ${
                !seg.color.startsWith('#') ? seg.color : ''
              }`}
              title={`${seg.label}: ${seg.count} (${Math.round(pct)}%)`}
            />
          )
        })}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
          {segments.map((seg) => (
            <div key={seg.key} className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: seg.color.startsWith('#') ? seg.color : undefined }}
              />
              <span className="text-neutral-500 dark:text-neutral-400 font-medium text-[11px]">
                {seg.label}:
              </span>
              <span className="font-bold text-neutral-800 dark:text-neutral-200 text-[11px] tabular-nums">
                {seg.count}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
