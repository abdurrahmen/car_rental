'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateVehicleStatus } from '@/lib/actions/vehicles'
import type { VehicleStatus } from '@/types'

export interface VehicleStatusSelectProps {
  vehicleId: string
  currentStatus: VehicleStatus
  labels?: Record<VehicleStatus, string>
}

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

  const getStatusColor = (s: VehicleStatus) => {
    switch (s) {
      case 'available':
        return 'bg-emerald-500 text-white'
      case 'rented':
        return 'bg-blue-500 text-white'
      case 'maintenance':
        return 'bg-amber-500 text-white'
      case 'retired':
        return 'bg-neutral-400 text-white'
    }
  }

  return (
    <div className="relative inline-flex items-center">
      <select
        value={status}
        disabled={isPending}
        onChange={handleChange}
        className={`appearance-none text-[11px] font-bold px-3 py-1.5 pe-7 rounded-full transition-all cursor-pointer shadow-2xs border-0 outline-none focus:ring-2 focus:ring-offset-1 focus:ring-brand-500 ${getStatusColor(
          status
        )} ${isPending ? 'opacity-60 cursor-wait' : ''}`}
      >
        <option value="available" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">
          {labels.available}
        </option>
        <option value="rented" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">
          {labels.rented}
        </option>
        <option value="maintenance" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">
          {labels.maintenance}
        </option>
        <option value="retired" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">
          {labels.retired}
        </option>
      </select>
      <span className="pointer-events-none absolute end-2 text-white/80 text-[9px]">
        ▼
      </span>
    </div>
  )
}
