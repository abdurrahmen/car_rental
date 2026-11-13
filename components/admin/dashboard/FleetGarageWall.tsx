'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Car,
  ArrowUpRight,
  Wrench,
  Clock,
} from 'lucide-react'

import { SegmentedBar } from './SegmentedBar'
import { Plate } from '@/components/ui/Plate'
import { formatDZD } from '@/lib/utils/constants'
import type { Language, Dictionary } from '@/types'
import type { GarageVehicle } from '@/lib/data/dashboard'

export interface FleetGarageWallProps {
  locale: Language
  dictionary?: Dictionary
  vehicles: GarageVehicle[]
}

/**
 * T5 — Fleet Right Now (Garage Wall):
 * Visual centerpiece: Real car cards with photos, plates in <bdi>,
 * status rings, next event tag, live dot for rented cars on the road,
 * and status filter chips.
 */
export function FleetGarageWall({
  locale,
  dictionary,
  vehicles,
}: FleetGarageWallProps) {
  const isArabic = locale === 'ar'
  const d = dictionary?.admin_dashboard

  const [activeFilter, setActiveFilter] = useState<'all' | 'available' | 'rented' | 'maintenance'>('all')

  const filteredVehicles = activeFilter === 'all'
    ? vehicles
    : vehicles.filter((v) => v.status === activeFilter)

  // Segment counts for top status bar
  const availableCount = vehicles.filter((v) => v.status === 'available').length
  const rentedCount = vehicles.filter((v) => v.status === 'rented').length
  const maintenanceCount = vehicles.filter((v) => v.status === 'maintenance').length

  const statusSegments = [
    {
      key: 'available',
      label: d?.filter_available || (isArabic ? 'متاحة' : 'Dispo'),
      count: availableCount,
      color: '#1FA971',
    },
    {
      key: 'rented',
      label: d?.filter_rented || (isArabic ? 'على الطريق' : 'En route'),
      count: rentedCount,
      color: '#0071E3',
    },
    {
      key: 'maintenance',
      label: d?.filter_maintenance || (isArabic ? 'صيانة' : 'Maint'),
      count: maintenanceCount,
      color: '#F5A524',
    },
  ]

  return (
    <div className="admin-card p-5 sm:p-6 flex flex-col justify-between space-y-5">
      {/* Top Header: Title & Overview Status Segmented Bar */}
      <div className="space-y-3 pb-3 border-b border-neutral-100 dark:border-white/5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-brand-600 flex items-center justify-center">
              <Car className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white tracking-tight">
                {d?.fleet_now || (isArabic ? 'المركبات الجاهزة وعلى الطريق' : 'Flotte en direct')}
              </h2>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                {isArabic ? 'متابعة بصرية فورية لكل مركبات الوكالة' : 'Vue d’ensemble des véhicules en circulation'}
              </p>
            </div>
          </div>

          <Link
            href={`/${locale}/admin/vehicles`}
            className="apple-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors"
          >
            <span>{d?.view_fleet || (isArabic ? 'كل الأسطول' : 'Toute la flotte')}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Top Segmented Distribution Bar (replaces the old Donezo gauge) */}
        <SegmentedBar
          segments={statusSegments}
          total={vehicles.length}
          height={7}
          showLegend={true}
        />
      </div>

      {/* Filter Chips Row */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          className={`apple-press px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-2xs'
              : 'bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/70'
          }`}
        >
          {d?.filter_all || (isArabic ? 'الكل' : 'Tous')} ({vehicles.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('available')}
          className={`apple-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeFilter === 'available'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100/80'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>{d?.filter_available || (isArabic ? 'متاحة' : 'Disponibles')} ({availableCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('rented')}
          className={`apple-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeFilter === 'rented'
              ? 'bg-brand-600 text-white shadow-2xs'
              : 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100/80'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 live-dot-pulse" />
          <span>{d?.filter_rented || (isArabic ? 'مؤجرة' : 'Louées')} ({rentedCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('maintenance')}
          className={`apple-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeFilter === 'maintenance'
              ? 'bg-amber-600 text-white shadow-2xs'
              : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100/80'
          }`}
        >
          <Wrench className="w-3 h-3" />
          <span>{d?.filter_maintenance || (isArabic ? 'صيانة' : 'Maintenance')} ({maintenanceCount})</span>
        </button>
      </div>

      {/* Grid of Car Cards (Visual centerpiece) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredVehicles.map((car) => {
          const isRented = car.status === 'rented'
          const isAvailable = car.status === 'available'
          const isMaint = car.status === 'maintenance'

          return (
            <div
              key={car.id}
              className="group/card rounded-2xl bg-neutral-50/60 dark:bg-white/5 border border-black/[0.05] dark:border-white/10 p-3.5 hover:bg-white dark:hover:bg-[#182538] hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              {/* Image & Status Tag */}
              <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-neutral-200/50 dark:bg-white/5 mb-3">
                <Image
                  src={car.photoUrl}
                  alt={`${car.make} ${car.model}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover/card:scale-105 transition-transform duration-500"
                />

                {/* Status Pill on Top */}
                <div className="absolute top-2 start-2">
                  {isAvailable && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-emerald-700 shadow-sm backdrop-blur-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{d?.filter_available || (isArabic ? 'متاحة' : 'Disponible')}</span>
                    </span>
                  )}
                  {isRented && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-brand-700 shadow-sm backdrop-blur-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500 live-dot-pulse" />
                      <span>{d?.filter_rented || (isArabic ? 'على الطريق' : 'En route')}</span>
                    </span>
                  )}
                  {isMaint && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-amber-700 shadow-sm backdrop-blur-xs">
                      <Wrench className="w-2.5 h-2.5 text-amber-600" />
                      <span>{d?.filter_maintenance || (isArabic ? 'صيانة' : 'Maintenance')}</span>
                    </span>
                  )}
                </div>

                {/* Daily rate badge */}
                <div className="absolute bottom-2 end-2">
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-black/60 text-white backdrop-blur-xs tabular-nums">
                    <bdi>{formatDZD(car.dailyRate, locale)}</bdi> / {isArabic ? 'يوم' : 'j'}
                  </span>
                </div>
              </div>

              {/* Title & Plate Number */}
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                  {car.make} {car.model}
                </h3>

                <div className="flex items-center justify-between gap-1 text-[11px]">
                  {/* Plate number always LTR safe */}
                  <span className="font-bold text-neutral-800 dark:text-neutral-200 px-1.5 py-0.5 rounded bg-neutral-200/70 dark:bg-white/10 text-[10px]">
                    <Plate number={car.plateNumber} />
                  </span>

                  <span 
                    dir="auto"
                    className="text-neutral-400 dark:text-neutral-500 text-[10px] truncate max-w-[120px]" 
                    title={car.branchName}
                  >
                    {car.branchName}
                  </span>
                </div>
              </div>

              {/* Next Event Tag */}
              <div className="mt-3 pt-2 border-t border-black/[0.04] dark:border-white/5 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
                <div className="flex items-center gap-1.5 truncate">
                  <Clock className="w-3 h-3 opacity-70 shrink-0" />
                  <span className="truncate">
                    {car.nextEventText[locale] || car.nextEventText.fr}
                  </span>
                </div>

                <Link
                  href={`/${locale}/admin/vehicles`}
                  className="apple-press text-neutral-400 hover:text-brand-500 transition-colors shrink-0"
                  title="Details"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
