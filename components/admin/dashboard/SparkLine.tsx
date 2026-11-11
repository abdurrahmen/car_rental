'use client'

import React from 'react'

export interface SparkLineProps {
  data: number[]
  color?: string
  height?: number
  strokeWidth?: number
  className?: string
}

/**
 * Lightweight SVG Sparkline with smooth curve and area gradient.
 * Zero external charting dependencies.
 */
export function SparkLine({
  data,
  color = '#0071E3',
  height = 36,
  strokeWidth = 2,
  className = '',
}: SparkLineProps) {

  if (!data || data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const width = 100
  const paddingY = 4
  const usableHeight = height - paddingY * 2

  // Map data to coordinates (0 to 100 x, padding to usableHeight y)
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width
    const y = height - paddingY - ((val - min) / range) * usableHeight
    return { x, y }
  })

  // Build SVG path with cubic bezier approximation
  let pathD = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i]
    const p1 = points[i + 1]
    const cx = (p0.x + p1.x) / 2
    pathD += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`
  }

  // Area fill path closing down to bottom
  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ height }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="w-full h-full overflow-visible"
      >
        <defs>
          <linearGradient id={`sparkline-grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Gradient fill */}
        <path
          d={areaD}
          fill={`url(#sparkline-grad-${color.replace('#', '')})`}
        />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Last point dot */}
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r={2.5}
          fill={color}
          className="animate-pulse"
        />
      </svg>
    </div>
  )
}
