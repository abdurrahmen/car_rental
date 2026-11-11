import type { Language } from '@/types'

export interface RevenueDataPoint {
  date: string
  label: string
  current: number
  previous?: number
}

/**
 * Generate revenue time series data for the area chart based on time range
 */
export function getRevenueTimeSeries(
  range: '7d' | '30d' | '90d' = '30d',
  locale: Language = 'ar'
): RevenueDataPoint[] {
  const points: RevenueDataPoint[] = []
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
  const now = new Date()
  const step = range === '90d' ? 3 : 1

  for (let i = days; i >= 0; i -= step) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)

    const label = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ', {
      day: 'numeric',
      month: 'short',
    }).format(d)

    const dayOfWeek = d.getDay() // 5 = Friday, 6 = Saturday in Algeria
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6
    const baseAmount = 28000 + Math.sin(i / 3) * 12000
    const weekendBoost = isWeekend ? 18000 : 0
    const randomVariation = (i % 5) * 2000

    const current = Math.round(baseAmount + weekendBoost + randomVariation)
    const previous = Math.round(current * 0.88)

    points.push({
      date: d.toISOString().split('T')[0],
      label,
      current,
      previous,
    })
  }

  return points
}
