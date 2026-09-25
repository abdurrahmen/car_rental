'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Car, Calendar, Search, ChevronDown, Check } from 'lucide-react'
import { Select } from '@/components/ui/Select'
import type { Branch, Language } from '@/types'

export interface QuickReservationNavProps {
  locale: Language
  branches: Branch[]
}

export function QuickReservationNav({ locale, branches }: QuickReservationNavProps) {
  const router = useRouter()
  const isArabic = locale === 'ar'
  const isFrench = locale === 'fr'

  // Initialize default dates (pickup: tomorrow, return: +3 days)
  const today = new Date()
  const defaultPickup = new Date(today)
  defaultPickup.setDate(today.getDate() + 1)
  const defaultReturn = new Date(today)
  defaultReturn.setDate(today.getDate() + 4)

  const formatIsoDate = (d: Date) => d.toISOString().split('T')[0]
  const todayStr = formatIsoDate(today)

  const [selectedBranchId, setSelectedBranchId] = useState<string>('')
  const [pickupDate, setPickupDate] = useState<string>(formatIsoDate(defaultPickup))
  const [pickupTime, setPickupTime] = useState<string>('12:00')
  const [returnDate, setReturnDate] = useState<string>(formatIsoDate(defaultReturn))
  const [returnTime, setReturnTime] = useState<string>('12:00')

  // Popover state for dates
  const [isPickupOpen, setIsPickupOpen] = useState(false)
  const [isReturnOpen, setIsReturnOpen] = useState(false)

  const pickupRef = useRef<HTMLDivElement>(null)
  const returnRef = useRef<HTMLDivElement>(null)

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickupRef.current && !pickupRef.current.contains(e.target as Node)) {
        setIsPickupOpen(false)
      }
      if (returnRef.current && !returnRef.current.contains(e.target as Node)) {
        setIsReturnOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const formatDisplayDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr + 'T00:00:00')
      return d.toLocaleDateString(locale === 'ar' ? 'ar-DZ' : locale === 'fr' ? 'fr-FR' : 'en-US', {
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return isoStr
    }
  }

  const formatDisplayTime = (timeStr: string) => {
    if (timeStr === '12:00') return isArabic ? 'الظهيرة' : isFrench ? 'Midi' : 'Noon'
    return timeStr
  }

  const TIME_OPTIONS = [
    { value: '09:00', label: '09:00' },
    { value: '12:00', label: isArabic ? '12:00 (الظهيرة)' : isFrench ? '12:00 (Midi)' : '12:00 (Noon)' },
    { value: '15:00', label: '15:00' },
    { value: '18:00', label: '18:00' },
    { value: '21:00', label: '21:00' },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (selectedBranchId) params.set('branch', selectedBranchId)
    if (pickupDate) params.set('start_date', pickupDate)
    if (returnDate) params.set('end_date', returnDate)
    if (pickupTime) params.set('start_time', pickupTime)
    if (returnTime) params.set('end_time', returnTime)

    router.push(`/${locale}/vehicles?${params.toString()}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 max-w-2xl w-full animate-apple-fade-in"
    >
      {/* Pill 1: Branch Dropdown using Webapp's Custom Select Component */}
      <div className="flex-1 min-w-[170px] sm:min-w-[220px]">
        <Select
          id="quick_nav_branch"
          name="branch"
          size="sm"
          icon={<Car className="w-4 h-4 text-neutral-500 shrink-0" />}
          placeholder={isArabic ? 'مطار أو مدينة...' : isFrench ? 'Aéroport ou ville...' : 'Airport or city'}
          value={selectedBranchId}
          onChange={(e) => setSelectedBranchId(e.target.value)}
          options={branches.map((b) => {
            const name = isArabic ? b.name_ar : isFrench ? b.name_fr : b.name_en
            return {
              value: b.id,
              label: `${b.city} — ${name}`,
            }
          })}
        />
      </div>

      {/* Pill 2: Pickup Date & Time Popover */}
      <div ref={pickupRef} className="relative hidden sm:block shrink-0">
        <button
          type="button"
          onClick={() => {
            setIsPickupOpen((prev) => !prev)
            setIsReturnOpen(false)
          }}
          className={`flex items-center gap-2 h-10 px-3 rounded-xl bg-white border text-xs font-medium text-neutral-800 transition-all cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${
            isPickupOpen
              ? 'border-brand-500 ring-4 ring-brand-500/15'
              : 'border-neutral-300/80 hover:border-neutral-400'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-brand-600 shrink-0" />
          <span className="font-semibold text-neutral-900">{formatDisplayDate(pickupDate)}</span>
          <span className="text-neutral-300">|</span>
          <span className="text-neutral-500 text-[11px]">{formatDisplayTime(pickupTime)}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
              isPickupOpen ? 'rotate-180 text-brand-600' : ''
            }`}
          />
        </button>

        {/* Popover Menu */}
        {isPickupOpen && (
          <div className="absolute z-[110] top-full mt-2 start-0 w-72 rounded-2xl bg-white/95 backdrop-blur-xl border border-black/[0.08] p-4 shadow-[0_20px_40px_-6px_rgba(0,0,0,0.18)] animate-apple-fade-in space-y-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5 text-start">
                {isArabic ? 'تاريخ الاستلام' : isFrench ? 'Date de départ' : 'Pickup Date'}
              </label>
              <input
                type="date"
                min={todayStr}
                value={pickupDate}
                onChange={(e) => {
                  setPickupDate(e.target.value)
                  if (returnDate < e.target.value) {
                    setReturnDate(e.target.value)
                  }
                }}
                className="w-full h-10 px-3 rounded-xl bg-neutral-50 border border-neutral-300 text-xs font-semibold text-neutral-900 focus:bg-white focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5 text-start">
                {isArabic ? 'وقت الاستلام' : isFrench ? 'Heure de départ' : 'Pickup Time'}
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {TIME_OPTIONS.map((t) => {
                  const isSelected = pickupTime === t.value
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setPickupTime(t.value)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-start flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-brand-500 text-white font-semibold'
                          : 'bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800'
                      }`}
                    >
                      <span>{t.label}</span>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-black/[0.06] flex justify-end">
              <button
                type="button"
                onClick={() => setIsPickupOpen(false)}
                className="px-3.5 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-sm transition-all"
              >
                {isArabic ? 'تأكيد' : 'Done'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pill 3: Return Date & Time Popover */}
      <div ref={returnRef} className="relative hidden md:block shrink-0">
        <button
          type="button"
          onClick={() => {
            setIsReturnOpen((prev) => !prev)
            setIsPickupOpen(false)
          }}
          className={`flex items-center gap-2 h-10 px-3 rounded-xl bg-white border text-xs font-medium text-neutral-800 transition-all cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${
            isReturnOpen
              ? 'border-brand-500 ring-4 ring-brand-500/15'
              : 'border-neutral-300/80 hover:border-neutral-400'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-brand-600 shrink-0" />
          <span className="font-semibold text-neutral-900">{formatDisplayDate(returnDate)}</span>
          <span className="text-neutral-300">|</span>
          <span className="text-neutral-500 text-[11px]">{formatDisplayTime(returnTime)}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
              isReturnOpen ? 'rotate-180 text-brand-600' : ''
            }`}
          />
        </button>

        {/* Popover Menu */}
        {isReturnOpen && (
          <div className="absolute z-[110] top-full mt-2 start-0 w-72 rounded-2xl bg-white/95 backdrop-blur-xl border border-black/[0.08] p-4 shadow-[0_20px_40px_-6px_rgba(0,0,0,0.18)] animate-apple-fade-in space-y-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5 text-start">
                {isArabic ? 'تاريخ الإرجاع' : isFrench ? 'Date de retour' : 'Return Date'}
              </label>
              <input
                type="date"
                min={pickupDate}
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-neutral-50 border border-neutral-300 text-xs font-semibold text-neutral-900 focus:bg-white focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5 text-start">
                {isArabic ? 'وقت الإرجاع' : isFrench ? 'Heure de retour' : 'Return Time'}
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {TIME_OPTIONS.map((t) => {
                  const isSelected = returnTime === t.value
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setReturnTime(t.value)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-start flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-brand-500 text-white font-semibold'
                          : 'bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800'
                      }`}
                    >
                      <span>{t.label}</span>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-black/[0.06] flex justify-end">
              <button
                type="button"
                onClick={() => setIsReturnOpen(false)}
                className="px-3.5 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-sm transition-all"
              >
                {isArabic ? 'تأكيد' : 'Done'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Button: Search in Application Apple Theme Blue */}
      <button
        type="submit"
        className="apple-press h-10 w-10 sm:w-11 rounded-xl bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center shadow-[0_2px_12px_rgba(0,113,227,0.35)] transition-all shrink-0 cursor-pointer"
        title={isArabic ? 'البحث عن السيارات المتاحة' : 'Search available cars'}
        aria-label={isArabic ? 'بحث' : 'Search'}
      >
        <Search className="w-4 h-4 stroke-[2.5]" />
      </button>
    </form>
  )
}
