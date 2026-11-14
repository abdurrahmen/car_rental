'use client'

import { Calendar, Car, User, MapPin, DollarSign } from 'lucide-react'
import type { Language } from '@/types'

interface ReservationSummaryProps {
  locale: Language
  clientName?: string
  vehicleLabel?: string
  startDate?: string
  endDate?: string
  pickupBranchName?: string
  dropoffBranchName?: string
  days: number
  dailyRate: number
  totalPrice: number
  depositAmount: number
  className?: string
}

export function ReservationSummary({
  locale,
  clientName,
  vehicleLabel,
  startDate,
  endDate,
  pickupBranchName,
  dropoffBranchName,
  days,
  dailyRate,
  totalPrice,
  depositAmount,
  className = '',
}: ReservationSummaryProps) {
  const isArabic = locale === 'ar'

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'ar-DZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const hasContent = clientName || vehicleLabel || (startDate && endDate)

  // Always render to maintain layout, show placeholders when empty
  return (
    <div
      className={`rounded-2xl border-2 border-brand-200 dark:border-brand-800 bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-950/30 dark:to-brand-900/20 p-6 ${className}`}
    >
      <h3 className="text-lg font-bold text-brand-900 dark:text-brand-100 mb-4">
        {isArabic ? 'ملخص الحجز' : 'Résumé de la réservation'}
      </h3>

      <div className="space-y-3">
        {clientName ? (
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-brand-700 dark:text-brand-300">
                {isArabic ? 'الزبون' : 'Client'}
              </p>
              <p className="text-sm font-semibold text-brand-900 dark:text-brand-100">
                {clientName}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-neutral-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {isArabic ? 'الزبون' : 'Client'}
              </p>
              <p className="text-sm text-neutral-400 italic">
                {isArabic ? 'لم يتم اختياره' : 'Aucun client sélectionné'}
              </p>
            </div>
          </div>
        )}

        {vehicleLabel ? (
          <div className="flex items-center gap-3">
            <Car className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-brand-700 dark:text-brand-300">
                {isArabic ? 'المركبة' : 'Véhicule'}
              </p>
              <p className="text-sm font-semibold text-brand-900 dark:text-brand-100">
                {vehicleLabel}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Car className="w-4 h-4 text-neutral-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {isArabic ? 'المركبة' : 'Véhicule'}
              </p>
              <p className="text-sm text-neutral-400 italic">
                {isArabic ? 'لم يتم اختيارها' : 'Aucun véhicule sélectionné'}
              </p>
            </div>
          </div>
        )}

        {startDate && endDate && (
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-brand-700 dark:text-brand-300">
                {isArabic ? 'الفترة' : 'Période'}
              </p>
              <p className="text-sm font-semibold text-brand-900 dark:text-brand-100" dir="ltr">
                {formatDate(startDate)} → {formatDate(endDate)}
              </p>
              {days > 0 && (
                <p className="text-xs text-brand-600 dark:text-brand-400 mt-0.5">
                  {days} {isArabic ? (days === 1 ? 'يوم' : 'أيام') : (days === 1 ? 'jour' : 'jours')}
                </p>
              )}
            </div>
          </div>
        )}

        {(pickupBranchName || dropoffBranchName) && (
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-brand-700 dark:text-brand-300">
                {isArabic ? 'المكان' : 'Lieux'}
              </p>
              {pickupBranchName === dropoffBranchName ? (
                <p className="text-sm font-semibold text-brand-900 dark:text-brand-100">
                  {pickupBranchName}
                </p>
              ) : (
                <p className="text-sm font-semibold text-brand-900 dark:text-brand-100">
                  {pickupBranchName} → {dropoffBranchName}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {days > 0 && dailyRate > 0 && (
        <div className="mt-4 pt-4 border-t border-brand-200 dark:border-brand-800">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-brand-700 dark:text-brand-300">
                  {isArabic ? 'التعريفة اليومية' : 'Tarif journalier'}
                </span>
                <span className="font-semibold text-brand-900 dark:text-brand-100">
                  {dailyRate.toLocaleString()} DZD
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-brand-700 dark:text-brand-300">
                  {isArabic ? 'عدد الأيام' : 'Nombre de jours'}
                </span>
                <span className="font-semibold text-brand-900 dark:text-brand-100">
                  × {days}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-brand-200 dark:border-brand-800">
            <span className="font-bold text-brand-900 dark:text-brand-100">
              {isArabic ? 'المبلغ الإجمالي' : 'Total'}
            </span>
            <span className="text-2xl font-bold text-brand-600 dark:text-brand-400">
              {totalPrice.toLocaleString()} DZD
            </span>
          </div>

          {depositAmount > 0 && (
            <div className="flex items-center justify-between mt-2 text-sm">
              <span className="text-brand-700 dark:text-brand-300">
                {isArabic ? 'العربون المطلوب' : 'Caution requise'}
              </span>
              <span className="font-semibold text-brand-900 dark:text-brand-100">
                {depositAmount.toLocaleString()} DZD
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
