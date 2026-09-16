import React from 'react'
import type { Reservation, Language } from '@/types'

export interface ReservationTimelineProps {
  reservation: Reservation
  locale: Language
}

export function ReservationTimeline({ reservation, locale }: ReservationTimelineProps) {
  const steps = [
    { id: 'pending', label: 'Pending' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'deposit_paid', label: 'Deposit Paid' },
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' }
  ]

  const currentStepIndex = steps.findIndex(s => s.id === reservation.status)
  const isCancelled = reservation.status === 'cancelled'

  if (isCancelled) {
    return (
      <div className="p-4 bg-danger-50 text-danger-700 rounded-lg text-center font-medium">
        Reservation Cancelled
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="absolute top-5 start-0 w-full h-1 bg-neutral-200" />
      
      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStepIndex >= index
          const isCurrent = currentStepIndex === index
          
          return (
            <div key={step.id} className="flex flex-col items-center">
              <div 
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center relative z-10 border-4 border-white
                  ${isCompleted ? 'bg-brand-500 text-white' : 'bg-neutral-300 text-neutral-500'}
                  ${isCurrent ? 'ring-4 ring-brand-100' : ''}
                `}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-sm font-bold">{index + 1}</span>
                )}
              </div>
              <span className={`mt-2 text-xs font-medium ${isCurrent ? 'text-brand-900' : 'text-neutral-500'}`}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
      
      <div 
        className="absolute top-5 start-0 h-1 bg-brand-500 transition-all duration-500"
        style={{ width: `${currentStepIndex >= 0 ? (currentStepIndex / (steps.length - 1)) * 100 : 0}%` }}
      />
    </div>
  )
}
