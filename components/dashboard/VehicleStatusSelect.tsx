'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateVehicleStatus } from '@/lib/actions/vehicles'
import { ChevronDown } from 'lucide-react'
import type { VehicleStatus } from '@/types'

export interface VehicleStatusSelectProps {
  vehicleId: string
  currentStatus: VehicleStatus
  labels?: Record<VehicleStatus, string>
}

/**
 * Restyled VehicleStatusSelect dropdown matching StatusBadge rounded-full pill styling:
 * - Available: bg-emerald-50 text-emerald-700
 * - Rented: bg-blue-50 text-blue-700
 * - Maintenance: bg-amber-50 text-amber-700
 * - Retired: bg-gray-100 text-gray-600
 * - Preserves async transition and router.refresh() behavior.
 */
export function VehicleStatusSelect({
  vehicleId,
  currentStatus,
  labels = {
    available: 'Available',
    rented: 'Rented',
    maintenance: 'Maintenance',
    retired: 'Retired',
  },
}: VehicleStatusSelectProps) {
  const [status, setStatus] = useState<VehicleStatus>(currentStatus)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as VehicleStatus
    setStatus(newStatus)

    startTransition(async () => {
      const formData = new FormData()
      formData.set('id', vehicleId)
      formData.set('status', newStatus)
      await updateVehicleStatus(null, formData)
      router.refresh()
    })
  }

  const getStatusStyle = (s: VehicleStatus) => {
    switch (s) {
      case 'available':
        return {
          pill: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100/70',
          chevron: 'text-emerald-700',
        }
      case 'rented':
        return {
          pill: 'bg-blue-50 text-blue-700 hover:bg-blue-100/70',
          chevron: 'text-blue-700',
        }
      case 'maintenance':
        return {
          pill: 'bg-amber-50 text-amber-700 hover:bg-amber-100/70',
          chevron: 'text-amber-700',
        }
      case 'retired':
      default:
        return {
          pill: 'bg-gray-100 text-gray-600 hover:bg-gray-200/70',
          chevron: 'text-gray-600',
        }
    }
  }

  const currentStyle = getStatusStyle(status)

  return (
    <div className="relative inline-flex items-center">
      <select
        value={status}
        disabled={isPending}
        onChange={handleChange}
        className={`appearance-none text-[11px] font-semibold px-3 py-1.5 pe-6.5 rounded-full transition-all cursor-pointer border-0 outline-none select-none focus:ring-2 focus:ring-offset-1 focus:ring-brand-500 ${
          currentStyle.pill
        } ${isPending ? 'opacity-60 cursor-wait' : ''}`}
      >
        <option value="available" className="bg-white text-neutral-900">
          {labels.available}
        </option>
        <option value="rented" className="bg-white text-neutral-900">
          {labels.rented}
        </option>
        <option value="maintenance" className="bg-white text-neutral-900">
          {labels.maintenance}
        </option>
        <option value="retired" className="bg-white text-neutral-900">
          {labels.retired}
        </option>
      </select>
      <span
        className={`pointer-events-none absolute end-2 text-[9px] flex items-center justify-center ${currentStyle.chevron}`}
      >
        {isPending ? (
          <svg className="animate-spin w-2.5 h-2.5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <ChevronDown className="w-3 h-3 stroke-[2.2]" />
        )}
      </span>
    </div>
  )
}
