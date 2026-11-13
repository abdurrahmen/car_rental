'use client'

import React from 'react'
import Link from 'next/link'
import {
  CalendarDays,
  Plus,
} from 'lucide-react'

import { Plate } from '@/components/ui/Plate'
import type { Language, Dictionary } from '@/types'
import type { GarageVehicle } from '@/lib/data/dashboard'

export interface AvailabilityLanesProps {
  locale: Language
  dictionary?: Dictionary
  vehicles: GarageVehicle[]
}

interface LaneBooking {
  id: string
  startDay: number // 0 to 13
  durationDays: number
  clientName: string
  status: 'active' | 'confirmed' | 'maintenance'
}

/**
 * T8 — Availability Lanes (14-Day Timeline Matrix):
 * - Cars as rows
 * - 14 consecutive days as columns, starting with Saturday (Algeria standard)
 * - Bookings as colored horizontal bars
 * - "Today" indicator line
 * - Idle gaps with "+ Book" hover interaction
 */
export function AvailabilityLanes({
  locale,
  dictionary,
  vehicles,
}: AvailabilityLanesProps) {
  const isArabic = locale === 'ar'
  const d = dictionary?.admin_dashboard

  // Generate 14 days starting from Saturday of the current week
  const days: { date: Date; dayNum: number; weekday: string; isToday: boolean }[] = []
  const today = new Date()

  // Find nearest preceding Saturday (in JS: 0=Sun, 1=Mon, ..., 6=Sat)
  const currentDayOfWeek = today.getDay()
  const daysToSaturday = (currentDayOfWeek + 1) % 7
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - daysToSaturday)

  for (let i = 0; i < 14; i++) {
    const dDate = new Date(startDate)
    dDate.setDate(startDate.getDate() + i)

    const isToday = dDate.toDateString() === today.toDateString()

    const weekday = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-DZ' : 'fr-DZ', {
      weekday: 'narrow',
    }).format(dDate)

    days.push({
      date: dDate,
      dayNum: dDate.getDate(),
      weekday,
      isToday,
    })
  }

  // Pre-mapped mock bookings across the 14 days
  const bookingsMap: Record<string, LaneBooking[]> = {
    [vehicles[0]?.id || 'v1']: [
      { id: 'b1', startDay: 1, durationDays: 4, clientName: 'Sonatrach HQ', status: 'active' },
      { id: 'b2', startDay: 7, durationDays: 3, clientName: 'Karim B.', status: 'confirmed' },
    ],
    [vehicles[1]?.id || 'v2']: [
      { id: 'b3', startDay: 0, durationDays: 5, clientName: 'Yacine M.', status: 'active' },
      { id: 'b4', startDay: 8, durationDays: 5, clientName: 'Djezzy Telecom', status: 'confirmed' },
    ],
    [vehicles[2]?.id || 'v3']: [
      { id: 'b5', startDay: 3, durationDays: 6, clientName: 'Samir H.', status: 'active' },
    ],
    [vehicles[3]?.id || 'v4']: [
      { id: 'b6', startDay: 2, durationDays: 3, clientName: 'Contrôle 15k', status: 'maintenance' },
      { id: 'b7', startDay: 6, durationDays: 7, clientName: 'Air Algérie Crew', status: 'confirmed' },
    ],
    [vehicles[4]?.id || 'v5']: [
      { id: 'b8', startDay: 4, durationDays: 5, clientName: 'Ooredoo Mission', status: 'confirmed' },
    ],
  }

  return (
    <div className="admin-card p-5 sm:p-6 space-y-4 overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center">
            <CalendarDays className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white tracking-tight">
              {d?.availability || (isArabic ? 'جدول توفر الأسطول والحجوزات (14 يوماً)' : 'Planning de disponibilité (14 jours)')}
            </h2>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              {isArabic ? 'أسبوع يبدأ بالسبت • اكتشاف الفترات الشاغرة بلمحة سريعة' : 'Semaine commençant le samedi • Détection des créneaux libres'}
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2.5 h-2.5 rounded-sm bg-brand-500" />
            <span className="text-neutral-600 dark:text-neutral-400 font-medium">
              {isArabic ? 'مؤجرة / مؤكدة' : 'Réservée'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
            <span className="text-neutral-600 dark:text-neutral-400 font-medium">
              {isArabic ? 'صيانة' : 'Maintenance'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-300" />
            <span className="text-neutral-600 dark:text-neutral-400 font-medium">
              {isArabic ? 'شاغرة' : 'Disponible'}
            </span>
          </div>
        </div>
      </div>

      {/* 14-Days Matrix Grid */}
      <div className="overflow-x-auto pb-2 -mx-2 px-2">
        <div className="min-w-[720px] space-y-2">
          {/* Day Headers */}
          <div className="grid grid-cols-[180px_repeat(14,1fr)] gap-1 text-center items-center text-xs pb-1 border-b border-black/[0.04] dark:border-white/5">
            <div className="text-start font-bold text-[11px] text-neutral-400 ps-2">
              {isArabic ? 'المركبة' : 'Véhicule'}
            </div>
            {days.map((dItem, idx) => (
              <div
                key={idx}
                className={`py-1 rounded-lg text-center ${
                  dItem.isToday
                    ? 'bg-brand-500 text-white font-bold ring-2 ring-brand-300 shadow-2xs'
                    : 'text-neutral-500 dark:text-neutral-400'
                }`}
              >
                <div className="text-[10px] font-semibold">{dItem.weekday}</div>
                <div className="text-xs font-bold tabular-nums">{dItem.dayNum}</div>
              </div>
            ))}
          </div>

          {/* Vehicle Rows */}
          {vehicles.slice(0, 5).map((veh) => {
            const bookings = bookingsMap[veh.id] || []

            return (
              <div
                key={veh.id}
                className="grid grid-cols-[180px_repeat(14,1fr)] gap-1 items-center py-1.5 rounded-xl hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors group"
              >
                {/* Vehicle Column */}
                <div className="pe-2 ps-1 min-w-0">
                  <div className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                    {veh.make} {veh.model}
                  </div>
                  <div className="text-[10px] text-neutral-400 truncate">
                    <Plate number={veh.plateNumber} />
                  </div>
                </div>

                {/* 14 Day Slot Cells */}
                <div className="col-span-14 grid grid-cols-14 gap-1 relative h-9 bg-neutral-100/60 dark:bg-white/5 rounded-lg p-0.5">
                  {/* Today Guide Bar */}
                  {days.some((dItem, idx) => {
                    if (dItem.isToday) {
                      return (
                        <div
                          key={`today-line-${idx}`}
                          className="absolute inset-y-0 w-0.5 bg-brand-500/50 pointer-events-none z-10"
                          style={{ left: `${(idx / 14) * 100}%` }}
                        />
                      )
                    }
                    return null
                  })}

                  {/* Empty Slot Hover Buttons */}
                  {Array.from({ length: 14 }).map((_, idx) => (
                    <Link
                      key={idx}
                      href={`/${locale}/admin/reservations`}
                      className="h-full rounded hover:bg-emerald-100/80 dark:hover:bg-emerald-950/40 flex items-center justify-center group/cell opacity-0 hover:opacity-100 transition-opacity"
                      title={isArabic ? 'حجز في هذا اليوم' : 'Réserver ce créneau'}
                    >
                      <Plus className="w-3 h-3 text-emerald-600" />
                    </Link>
                  ))}

                  {/* Booking Horizontal Bars */}
                  {bookings.map((booking) => {
                    const leftPct = (booking.startDay / 14) * 100
                    const widthPct = (booking.durationDays / 14) * 100

                    return (
                      <div
                        key={booking.id}
                        style={{
                          left: `${leftPct}%`,
                          width: `${widthPct}%`,
                        }}
                        className={`absolute inset-y-1 rounded-md px-2 flex items-center justify-between text-[10px] font-bold text-white shadow-xs z-10 truncate cursor-pointer transition-transform hover:scale-[1.01] ${
                          booking.status === 'maintenance'
                            ? 'bg-amber-500'
                            : 'bg-brand-600'
                        }`}
                        title={`${booking.clientName} (${booking.durationDays} ${isArabic ? 'أيام' : 'jours'})`}
                      >
                        <span className="truncate">{booking.clientName}</span>
                        <span className="text-[9px] opacity-80 tabular-nums">
                          {booking.durationDays}{isArabic ? 'ي' : 'j'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
