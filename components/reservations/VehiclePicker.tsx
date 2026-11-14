'use client'

import { useState, useEffect, useCallback } from 'react'
import { Car, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Combobox } from '@/components/ui/Combobox'
import { searchVehicles, getRecentVehicles } from '@/lib/actions/vehicle-search'
import type { Language } from '@/types'

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  plate_number: string
  daily_rate: number
  deposit_amount: number
  status: string
  branch_id: string
  available?: boolean
}

interface VehiclePickerProps {
  value: string
  onChange: (vehicleId: string) => void
  locale: Language
  branchId?: string
  startDate?: string
  endDate?: string
  userRole?: string
}

export function VehiclePicker({
  value,
  onChange,
  locale,
  branchId,
  startDate,
  endDate,
  userRole,
}: VehiclePickerProps) {
  const isArabic = locale === 'ar'
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadRecentVehicles = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Only filter by branch if user is not admin
      const result = await getRecentVehicles(
        userRole === 'admin' ? undefined : branchId, 
        20
      )

      if (result.success && result.vehicles) {
        // If we have dates, check availability
        if (startDate && endDate) {
          const searchResult = await searchVehicles({
            branchId: userRole === 'admin' ? undefined : branchId,
            startDate,
            endDate,
            limit: 50,
          })

          if (searchResult.success && searchResult.vehicles) {
            setVehicles(searchResult.vehicles)
          } else {
            setVehicles(result.vehicles)
          }
        } else {
          setVehicles(result.vehicles)
        }
      } else {
        setError(result.error || 'Failed to load vehicles')
      }
    } catch (err) {
      console.error('Error loading vehicles:', err)
      setError('Failed to load vehicles')
    } finally {
      setIsLoading(false)
    }
  }, [branchId, startDate, endDate, userRole])

  // Load recent vehicles on mount
  useEffect(() => {
    void loadRecentVehicles()
  }, [loadRecentVehicles])

  // Reload vehicles when dates change (to check availability)
  useEffect(() => {
    if (startDate && endDate && vehicles.length > 0) {
      void loadRecentVehicles()
    }
  }, [startDate, endDate, vehicles.length, loadRecentVehicles])

  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        await loadRecentVehicles()
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const result = await searchVehicles({
          query,
          branchId: userRole === 'admin' ? undefined : branchId,
          startDate,
          endDate,
          limit: 20,
        })

        if (result.success && result.vehicles) {
          setVehicles(result.vehicles)
        } else {
          setError(result.error || 'Search failed')
          setVehicles([])
        }
      } catch (err) {
        console.error('Error searching vehicles:', err)
        setError('Search failed')
        setVehicles([])
      } finally {
        setIsLoading(false)
      }
    },
    [branchId, startDate, endDate, userRole]
  )

  const formatVehicleLabel = (vehicle: Vehicle) => {
    const baseLabel = `${vehicle.make} ${vehicle.model} (${vehicle.year}) - ${vehicle.plate_number}`
    const rate = `${vehicle.daily_rate.toLocaleString()} DZD/jour`
    return `${baseLabel} - ${rate}`
  }

  const renderVehicleOption = (vehicle: Vehicle) => {
    const hasAvailabilityCheck = vehicle.available !== undefined
    const isAvailable = vehicle.available !== false

    return (
      <div className="flex items-center justify-between w-full gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-neutral-400 flex-shrink-0" />
            <span className="font-medium truncate">
              {vehicle.make} {vehicle.model} ({vehicle.year})
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-500">
            <bdi dir="ltr" className="font-mono">
              {vehicle.plate_number}
            </bdi>
            <span>•</span>
            <span>{vehicle.daily_rate.toLocaleString()} DZD/jour</span>
          </div>
        </div>
        
        {hasAvailabilityCheck && (
          <div className="flex-shrink-0">
            {isAvailable ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-xs font-medium">
                <CheckCircle2 className="w-3 h-3" />
                {isArabic ? 'متاح' : 'Dispo'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-100 text-red-700 text-xs font-medium">
                <AlertCircle className="w-3 h-3" />
                {isArabic ? 'محجوز' : 'Occupé'}
              </span>
            )}
          </div>
        )}
      </div>
    )
  }

  const selectedVehicle = vehicles.find((v) => v.id === value)

  return (
    <div className="space-y-2">
      <Combobox
        value={value}
        onChange={onChange}
        options={vehicles.map((vehicle) => ({
          id: vehicle.id,
          label: formatVehicleLabel(vehicle),
          renderOption: () => renderVehicleOption(vehicle),
          disabled: vehicle.available === false, // Disable unavailable vehicles
        }))}
        onSearch={handleSearch}
        placeholder={
          isArabic ? 'ابحث عن مركبة...' : 'Rechercher un véhicule...'
        }
        emptyMessage={
          isLoading
            ? isArabic
              ? 'جارٍ البحث...'
              : 'Recherche...'
            : isArabic
            ? 'لا توجد مركبات متاحة'
            : 'Aucun véhicule disponible'
        }
      />

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}

      {!startDate || !endDate ? (
        <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {isArabic
            ? 'حدد التواريخ لرؤية التوافر'
            : 'Sélectionnez les dates pour voir la disponibilité'}
        </p>
      ) : null}

      {selectedVehicle && (
        <div className="mt-4 p-4 bg-brand-50 dark:bg-brand-950/30 rounded-xl">
          <p className="text-sm font-semibold text-brand-900 dark:text-brand-100">
            {isArabic ? 'تفاصيل المركبة' : 'Détails du véhicule'}
          </p>
          <div className="mt-2 text-sm text-brand-700 dark:text-brand-300 space-y-1">
            <p>
              {isArabic ? 'التعريفة اليومية:' : 'Tarif journalier:'}{' '}
              {selectedVehicle.daily_rate.toLocaleString()} DZD
            </p>
            <p>
              {isArabic ? 'العربون المطلوب:' : 'Caution requise:'}{' '}
              {selectedVehicle.deposit_amount.toLocaleString()} DZD
            </p>
            {selectedVehicle.available !== undefined && (
              <p className="flex items-center gap-1 pt-1">
                {selectedVehicle.available ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                      {isArabic
                        ? 'متاح للفترة المحددة'
                        : 'Disponible pour cette période'}
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-red-700 dark:text-red-300 font-medium">
                      {isArabic
                        ? 'محجوز خلال هذه الفترة'
                        : 'Déjà réservé pour cette période'}
                    </span>
                  </>
                )}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
