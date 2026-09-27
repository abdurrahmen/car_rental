import React from 'react'

export interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  variant?: 'default' | 'highlight'
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

/**
 * StatCard component adhering to the Donezo design system:
 * - variant="default": white card, soft layered shadow, dark typography
 * - variant="highlight": solid primary-blue (brand-500) background, white typography.
 *   Strictly used for exactly ONE hero metric per page (e.g. Gross Revenue).
 * - Strict internal spacing rhythm: icon row -> mt-3 -> big number -> mt-1 -> caption/trend
 */
export function StatCard({
  title,
  value,
  subtitle,
  icon,
  variant = 'default',
  trend,
  className = '',
}: StatCardProps) {
  const isHighlight = variant === 'highlight'

  return (
    <div
      className={`rounded-2xl p-4 md:p-6 flex flex-col justify-between admin-card-hover ${
        isHighlight
          ? 'bg-brand-500 text-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] border-0'
          : 'admin-card'
      } ${className}`}
    >
      {/* Header: Title and Icon */}
      <div className="flex justify-between items-start">
        <span
          className={`text-xs font-semibold uppercase tracking-wider ${
            isHighlight ? 'text-white/80' : 'text-neutral-500'
          }`}
        >
          {title}
        </span>
        {icon && (
          <div
            className={`p-2.5 rounded-xl flex items-center justify-center shrink-0 ${
              isHighlight
                ? 'bg-white/20 text-white'
                : 'bg-brand-50 text-brand-600'
            }`}
          >
            {/* Normalize icon dimensions */}
            <span className="w-5 h-5 flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5 [&>svg]:stroke-[1.75]">
              {icon}
            </span>
          </div>
        )}
      </div>

      {/* Value & Caption (Rhythm: mt-3, mt-1) */}
      <div className="mt-3">
        <div
          className={`text-3xl md:text-4xl font-bold tracking-tight ${
            isHighlight ? 'text-white' : 'text-neutral-900'
          }`}
        >
          {value}
        </div>

        {(subtitle || trend) && (
          <div className="mt-1 flex items-center gap-2 text-xs flex-wrap">
            {trend && (
              <span
                className={`inline-flex items-center font-medium px-2 py-0.5 rounded-full ${
                  isHighlight
                    ? 'bg-white/20 text-white'
                    : trend.isPositive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-rose-50 text-rose-700'
                }`}
              >
                <svg
                  className="w-3 h-3 me-1 stroke-[2]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={
                      trend.isPositive
                        ? 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
                        : 'M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6'
                    }
                  />
                </svg>
                {trend.value}%
              </span>
            )}
            {subtitle && (
              <span
                className={`line-clamp-1 ${
                  isHighlight ? 'text-white/85' : 'text-neutral-500'
                }`}
              >
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
