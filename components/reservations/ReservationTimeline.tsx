import React from 'react'
import type { Reservation, Language } from '@/types'
import { RESERVATION_STATUSES } from '@/lib/utils/constants'

export interface ReservationTimelineProps {
  reservation: Reservation
  locale: Language
}

/**
 * Apple-style Progress Timeline with smooth indicators, localized labels,
 * and elegant status styling.
 */
export function ReservationTimeline({
  reservation,
  locale,
}: ReservationTimelineProps) {
  const steps: { id: Reservation['status']; defaultLabel: string }[] = [
    { id: 'pending', defaultLabel: 'Pending' },
    { id: 'confirmed', defaultLabel: 'Confirmed' },
    { id: 'deposit_paid', defaultLabel: 'Deposit Paid' },
    { id: 'active', defaultLabel: 'Active Rental' },
    { id: 'completed', defaultLabel: 'Completed' },
  ]

  const currentStepIndex = steps.findIndex((s) => s.id === reservation.status)
  const isCancelled = reservation.status === 'cancelled'
  const isNoShow = reservation.status === 'no_show'

  if (isCancelled || isNoShow) {
    return (
      <div
        className={`p-4 rounded-2xl text-center text-xs font-semibold tracking-tight border ${
          isNoShow
            ? 'bg-rose-500/10 text-rose-700 border-rose-500/20'
            : 'bg-neutral-500/10 text-neutral-700 border-neutral-500/20'
        }`}
      >
        {isNoShow
          ? locale === 'ar'
            ? 'تم تسجيل غياب المستأجر وتطبيق غرامة الإلغاء'
            : locale === 'fr'
            ? 'Non-présentation constatée (No-show)'
            : 'Marked as No-Show'
          : locale === 'ar'
          ? 'تم إلغاء هذا الحجز'
          : locale === 'fr'
          ? 'Cette réservation a été annulée'
          : 'Reservation Cancelled'}
      </div>
    )
  }

  return (
    <div className="relative py-2">
      {/* Background track */}
      <div className="absolute top-7 inset-x-8 h-0.5 bg-neutral-200 dark:bg-neutral-800 -z-0" />

      <div className="relative z-10 flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStepIndex >= index
          const isCurrent = currentStepIndex === index
          const label =
            RESERVATION_STATUSES[step.id]?.label[locale] || step.defaultLabel

          return (
            <div key={step.id} className="flex flex-col items-center max-w-[80px]">
              <div
                className={`
                  w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300
                  ${
                    isCompleted
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-700 text-neutral-400'
                  }
                  ${isCurrent ? 'ring-4 ring-brand-500/20 scale-110' : ''}
                `}
              >
                {isCompleted ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <span className="text-xs font-semibold">{index + 1}</span>
                )}
              </div>
              <span
                className={`mt-2.5 text-[11px] text-center font-medium leading-tight ${
                  isCurrent
                    ? 'text-brand-600 dark:text-brand-400 font-semibold'
                    : isCompleted
                    ? 'text-neutral-800 dark:text-neutral-200'
                    : 'text-neutral-400'
                }`}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
