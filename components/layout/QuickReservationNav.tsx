'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Car, Calendar, Search } from 'lucide-react'
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

  const [selectedBranchId, setSelectedBranchId] = useState<string>('')
  const [pickupDate, setPickupDate] = useState<string>(formatIsoDate(defaultPickup))
  const [pickupTime, setPickupTime] = useState<string>('12:00')
  const [returnDate, setReturnDate] = useState<string>(formatIsoDate(defaultReturn))
  const [returnTime, setReturnTime] = useState<string>('12:00')

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
    if (timeStr === '12:00') return isArabic ? 'منتصف النهار' : isFrench ? 'Midi' : 'Noon'
    if (timeStr === '09:00') return '09:00'
    if (timeStr === '18:00') return '18:00'
    return timeStr
  }

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
      className="flex items-center gap-1.5 sm:gap-2 max-w-2xl w-full animate-apple-fade-in"
    >
      {/* Pill 1: Branch / City Location */}
      <div className="relative flex-1 min-w-[140px] sm:min-w-[190px]">
        <div className="flex items-center gap-2 h-10 px-3 rounded-xl bg-neutral-100/90 hover:bg-neutral-100 border border-black/[0.06] text-xs transition-colors">
          <Car className="w-4 h-4 text-neutral-500 shrink-0" />
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="w-full bg-transparent text-neutral-800 font-medium text-xs focus:outline-none cursor-pointer truncate appearance-none"
            aria-label={isArabic ? 'اختر نقطة الاستلام' : 'Choose pickup location'}
          >
            <option value="">
              {isArabic ? 'مطار أو وكالة...' : isFrench ? 'Aéroport ou ville...' : 'Airport or city'}
            </option>
            {branches.map((b) => {
              const name = isArabic ? b.name_ar : isFrench ? b.name_fr : b.name_en
              return (
                <option key={b.id} value={b.id} className="text-neutral-900 bg-white">
                  {b.city} — {name}
                </option>
              )
            })}
          </select>
        </div>
      </div>

      {/* Pill 2: Pickup Date & Time */}
      <div className="relative hidden sm:flex items-center gap-2 h-10 px-3 rounded-xl bg-neutral-100/90 hover:bg-neutral-100 border border-black/[0.06] text-xs transition-colors shrink-0">
        <Calendar className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
        <div className="flex items-center gap-1.5 font-medium text-neutral-800 text-[11px] lg:text-xs">
          <label className="cursor-pointer relative flex items-center">
            <span>{formatDisplayDate(pickupDate)}</span>
            <input
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full"
            />
          </label>
          <span className="text-neutral-300">|</span>
          <select
            value={pickupTime}
            onChange={(e) => setPickupTime(e.target.value)}
            className="bg-transparent text-neutral-600 hover:text-neutral-900 font-medium focus:outline-none cursor-pointer"
          >
            <option value="09:00">09:00</option>
            <option value="12:00">{formatDisplayTime('12:00')}</option>
            <option value="15:00">15:00</option>
            <option value="18:00">18:00</option>
            <option value="21:00">21:00</option>
          </select>
        </div>
      </div>

      {/* Pill 3: Return Date & Time */}
      <div className="relative hidden md:flex items-center gap-2 h-10 px-3 rounded-xl bg-neutral-100/90 hover:bg-neutral-100 border border-black/[0.06] text-xs transition-colors shrink-0">
        <Calendar className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
        <div className="flex items-center gap-1.5 font-medium text-neutral-800 text-[11px] lg:text-xs">
          <label className="cursor-pointer relative flex items-center">
            <span>{formatDisplayDate(returnDate)}</span>
            <input
              type="date"
              value={returnDate}
              min={pickupDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full"
            />
          </label>
          <span className="text-neutral-300">|</span>
          <select
            value={returnTime}
            onChange={(e) => setReturnTime(e.target.value)}
            className="bg-transparent text-neutral-600 hover:text-neutral-900 font-medium focus:outline-none cursor-pointer"
          >
            <option value="09:00">09:00</option>
            <option value="12:00">{formatDisplayTime('12:00')}</option>
            <option value="15:00">15:00</option>
            <option value="18:00">18:00</option>
            <option value="21:00">21:00</option>
          </select>
        </div>
      </div>

      {/* Action Button: Search */}
      <button
        type="submit"
        className="apple-press h-10 w-10 sm:w-11 rounded-xl bg-gradient-to-r from-[#FF5500] to-[#FF7700] hover:from-[#E04B00] hover:to-[#FF6600] text-white flex items-center justify-center shadow-[0_2px_10px_rgba(255,85,0,0.35)] transition-all shrink-0 cursor-pointer"
        title={isArabic ? 'البحث عن السيارات المتاحة' : 'Search available cars'}
        aria-label={isArabic ? 'بحث' : 'Search'}
      >
        <Search className="w-4 h-4 stroke-[2.5]" />
      </button>
    </form>
  )
}
