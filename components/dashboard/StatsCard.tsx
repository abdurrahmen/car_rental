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

export function StatsCard({ title, value, subtitle, icon, trend }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-neutral-500">{title}</h3>
        {icon && (
          <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
            {icon}
          </div>
        )}
      </div>
      
      <div className="mt-auto">
        <div className="text-3xl font-bold text-neutral-900">{value}</div>
        
        {(subtitle || trend) && (
          <div className="mt-2 flex items-center text-sm">
            {trend && (
              <span className={`flex items-center me-2 font-medium ${trend.isPositive ? 'text-success-600' : 'text-danger-600'}`}>
                <svg className="w-4 h-4 me-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={trend.isPositive ? 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' : 'M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6'} />
                </svg>
                {trend.value}%
              </span>
            )}
            {subtitle && <span className="text-neutral-500">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  )
}
