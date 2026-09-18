'use client'

import React, { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import type { Branch, Vehicle, Language, Dictionary } from '@/types'
import { formatDZD } from '@/lib/utils/constants'
import { createReservation } from '@/lib/actions/reservations'

export interface ReservationFormProps {
  vehicleId?: string
  vehicle?: Vehicle
  dailyRate?: number
  branches?: Branch[]
  dictionary?: Dictionary
  lang?: Language
  action?: (
    state: unknown,
    payload: FormData
  ) => Promise<{ error?: string; success?: boolean; reservationId?: string }>
}

/**
 * Apple-style Reservation Request Form with live calculation,
 * smooth inputs, and clear pricing summary.
 */
export function ReservationForm({
  vehicleId,
  vehicle,
  dailyRate: propDailyRate,
  branches = [],
  dictionary,
  lang = 'ar',
  action = createReservation,
}: ReservationFormProps) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(action, null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [days, setDays] = useState(0)

  const effectiveVehicleId = vehicleId || vehicle?.id || ''
  const effectiveDailyRate = propDailyRate ?? vehicle?.daily_rate ?? 0
  const initialBranch = vehicle?.branch_id || branches[0]?.id || ''
  const [pickupBranch, setPickupBranch] = useState(initialBranch)

  useEffect(() => {
    if (state?.success) {
      router.push(`/${lang}/dashboard/reservations`)
    }
  }, [state, router, lang])

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffTime = end.getTime() - start.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      setDays(diffDays > 0 ? diffDays : 0)
    } else {
      setDays(0)
    }
  }, [startDate, endDate])

  const branchOptions = branches.map((b) => {
    const label =
      lang === 'ar' ? b.name_ar : lang === 'fr' ? b.name_fr : b.name_en
    return { value: b.id, label }
  })

  const totalPrice = days * effectiveDailyRate

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="vehicle_id" value={effectiveVehicleId} />

      {state?.error && (
        <div className="p-3.5 bg-rose-500/10 text-rose-700 border border-rose-500/20 rounded-2xl text-xs font-medium animate-apple-fade-in">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="p-3.5 bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 rounded-2xl text-xs font-medium animate-apple-fade-in">
          {dictionary?.reservations?.reservation_submitted ||
            'Reservation request submitted successfully! Redirecting...'}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          type="date"
          name="start_date"
          label={dictionary?.reservations?.pickup_date || 'Pickup Date'}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
          min={new Date().toISOString().split('T')[0]}
        />
        <Input
          type="date"
          name="end_date"
          label={dictionary?.reservations?.return_date || 'Return Date'}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
          min={startDate || new Date().toISOString().split('T')[0]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          name="pickup_branch_id"
          label={dictionary?.reservations?.pickup_branch || 'Pickup Branch'}
          options={branchOptions}
          value={pickupBranch}
          onChange={(e) => setPickupBranch(e.target.value)}
          required
        />
        <Select
          name="dropoff_branch_id"
          label={dictionary?.reservations?.dropoff_branch || 'Drop-off Branch'}
          options={branchOptions}
          defaultValue={pickupBranch}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="notes"
          className="text-xs font-medium text-neutral-600 ps-0.5"
        >
          {dictionary?.reservations?.notes || 'Additional Requests (Optional)'}
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="w-full rounded-xl border border-neutral-300/80 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 transition-all duration-200"
          placeholder={
            lang === 'ar'
              ? 'أي متطلبات خاصة بالرحلة أو مقعد أطفال...'
              : 'Any special requirements or child seat requests...'
          }
        />
      </div>

      {/* Live Apple Price Summary Card */}
      <div className="bg-neutral-100/70 p-5 rounded-2xl border border-black/[0.04] flex justify-between items-center mt-6">
        <div>
          <span className="block text-xs text-neutral-500">
            {days > 0
              ? `${days} ${
                  dictionary?.vehicles?.per_day || 'days'
                } × ${formatDZD(effectiveDailyRate, lang)}`
              : lang === 'ar'
              ? 'اختر تواريخ الكراء'
              : 'Select dates'}
          </span>
          <span className="text-base font-semibold text-neutral-900 tracking-tight">
            {dictionary?.reservations?.total_price || 'Estimated Total'}
          </span>
        </div>
        <div className="text-2xl font-bold text-neutral-900 tracking-tight">
          {formatDZD(totalPrice, lang)}
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        fullWidth
        size="lg"
        loading={isPending}
        disabled={days <= 0 || !pickupBranch || isPending}
        className="mt-2 text-sm font-semibold"
      >
        {dictionary?.reservations?.reserve || 'Request Reservation'}
      </Button>
    </form>
  )
}
