'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'

export interface DateRangePickerProps {
  startDate: string
  endDate: string
  onStartChange: (date: string) => void
  onEndChange: (date: string) => void
  locale: 'ar' | 'fr' | 'en'
  label?: string
  error?: string
  disabled?: boolean
  className?: string
}

/**
 * Simplified date range picker with presets
 * Uses native date inputs with custom styling
 */
export function DateRangePicker({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  locale,
  label,
  error,
  disabled,
  className = '',
}: DateRangePickerProps) {
  const isArabic = locale === 'ar'
  const [showPresets, setShowPresets] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString(locale === 'fr' ? 'fr-FR' : locale === 'ar' ? 'ar-DZ' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const getDays = () => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = end.getTime() - start.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(1, diffDays)
  }

  const days = getDays()

  const handlePreset = (daysToAdd: number) => {
    const today = new Date()
    const start = today.toISOString().split('T')[0]
    const endDate = new Date(today)
    endDate.setDate(endDate.getDate() + daysToAdd)
    const end = endDate.toISOString().split('T')[0]
    
    onStartChange(start)
    onEndChange(end)
    setShowPresets(false)
  }

  useEffect(() => {
    if (!showPresets) return

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowPresets(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showPresets])

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {label}
        </label>
      )}

      <div ref={containerRef} className="relative">
        {/* Display Field */}
        <div 
          className={`
            flex items-center justify-between w-full px-4 py-3 rounded-xl
            border ${error ? 'border-danger-500' : 'border-neutral-300 dark:border-neutral-700'}
            bg-white dark:bg-neutral-800
            transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-neutral-400'}
            min-h-[44px]
          `}
          onClick={() => !disabled && setShowPresets(!showPresets)}
        >
          <div className="flex items-center gap-2 flex-1">
            <CalendarIcon className="w-4 h-4 text-neutral-400" />
            {startDate && endDate ? (
              <span className="text-sm text-neutral-900 dark:text-white" dir="ltr">
                {formatDate(startDate)} → {formatDate(endDate)}
                {days > 0 && (
                  <span className="text-neutral-500 dark:text-neutral-400 ms-2">
                    · {days} {isArabic ? (days === 1 ? 'يوم' : 'أيام') : (days === 1 ? 'jour' : 'jours')}
                  </span>
                )}
              </span>
            ) : (
              <span className="text-sm text-neutral-400">
                {isArabic ? 'اختر الفترة' : 'Choisir la période'}
              </span>
            )}
          </div>
          <ChevronRight 
            className={`w-4 h-4 text-neutral-400 transition-transform ${showPresets ? 'rotate-90' : ''}`}
          />
        </div>

        {/* Presets & Date Inputs */}
        {showPresets && (
          <div className="absolute z-50 mt-2 w-full min-w-[320px] bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-lg p-4 space-y-4">
            {/* Presets */}
            <div>
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">
                {isArabic ? 'اختصارات' : 'Raccourcis'}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handlePreset(1)}
                  className="px-3 py-2 text-xs font-medium rounded-lg bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-900 dark:text-neutral-100 transition-colors"
                >
                  {isArabic ? 'يوم واحد' : '1 jour'}
                </button>
                <button
                  type="button"
                  onClick={() => handlePreset(3)}
                  className="px-3 py-2 text-xs font-medium rounded-lg bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-900 dark:text-neutral-100 transition-colors"
                >
                  {isArabic ? '3 أيام' : '3 jours'}
                </button>
                <button
                  type="button"
                  onClick={() => handlePreset(7)}
                  className="px-3 py-2 text-xs font-medium rounded-lg bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-900 dark:text-neutral-100 transition-colors"
                >
                  {isArabic ? 'أسبوع' : '1 semaine'}
                </button>
                <button
                  type="button"
                  onClick={() => handlePreset(14)}
                  className="px-3 py-2 text-xs font-medium rounded-lg bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-900 dark:text-neutral-100 transition-colors"
                >
                  {isArabic ? 'أسبوعان' : '2 semaines'}
                </button>
              </div>
            </div>

            {/* Date Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  {isArabic ? 'تاريخ الاستلام' : 'Date de début'}
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => onStartChange(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  {isArabic ? 'تاريخ الإرجاع' : 'Date de fin'}
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => onEndChange(e.target.value)}
                  min={startDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-danger-600 dark:text-danger-400 font-medium">
          {error}
        </p>
      )}
    </div>
  )
}
