import React from 'react'

export interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
}

/**
 * Apple-style Metric / KPI Card with refined typography and subtle hover lift.
 */
export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-3xl border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 flex flex-col justify-between apple-card-hover">
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          {title}
        </span>
        {icon && (
          <div className="p-2 rounded-2xl bg-brand-500/10 text-brand-600">
            {icon}
          </div>
        )}
      </div>

      <div>
        <div className="text-3xl font-semibold tracking-tight text-neutral-900">
          {value}
        </div>

        {(subtitle || trend) && (
          <div className="mt-2.5 flex items-center gap-2 text-xs">
            {trend && (
              <span
                className={`inline-flex items-center font-medium px-1.5 py-0.5 rounded-full ${
                  trend.isPositive
                    ? 'bg-emerald-500/10 text-emerald-700'
                    : 'bg-rose-500/10 text-rose-700'
                }`}
              >
                <svg
                  className="w-3 h-3 me-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
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
              <span className="text-neutral-500">
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
