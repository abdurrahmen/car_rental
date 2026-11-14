'use client'

import { AlertCircle } from 'lucide-react'
import type { Language } from '@/types'

interface ValidationIssue {
  field: string
  message: string
}

interface ValidationSummaryProps {
  issues: ValidationIssue[]
  locale: Language
  className?: string
}

export function ValidationSummary({
  issues,
  locale,
  className = '',
}: ValidationSummaryProps) {
  if (issues.length === 0) return null

  const isArabic = locale === 'ar'

  return (
    <div
      className={`rounded-xl border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4 ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
            {isArabic
              ? 'يرجى إكمال الحقول المطلوبة:'
              : 'Veuillez compléter les champs requis:'}
          </p>
          <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
            {issues.map((issue, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400 flex-shrink-0" />
                <span>{issue.message}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
