import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Vehicle, Language, VehiclePhoto, Dictionary } from '@/types'
import { formatDZD, getPhotoUrl } from '@/lib/utils/constants'

export interface VehicleCardProps {
  vehicle: Vehicle & { photos?: VehiclePhoto[]; category?: { name_ar: string; name_fr: string; name_en: string } }
  locale: Language
  dictionary?: Dictionary
}

/**
 * Apple-style Vehicle Showcase Card with image zoom micro-interaction,
 * tactile pill buttons, and crisp typography.
 */
export function VehicleCard({ vehicle, locale, dictionary }: VehicleCardProps) {
  const primaryPhoto =
    vehicle.photos?.find((p) => p.is_primary) || vehicle.photos?.[0]
  const photoUrl = getPhotoUrl(primaryPhoto)

  const categoryName = vehicle.category
    ? locale === 'ar'
      ? vehicle.category.name_ar
      : locale === 'fr'
      ? vehicle.category.name_fr
      : vehicle.category.name_en
    : null

  return (
    <div className="group relative bg-white rounded-3xl border border-black/[0.06] shadow-[0_4px_24px_-6px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 flex flex-col h-full">
      {/* Photo container with zoom */}
      <div className="relative aspect-[16/10] bg-neutral-100 overflow-hidden">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={`${vehicle.make} ${vehicle.model}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transform-gpu transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
            priority={false}
            quality={85}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400">
            <svg
              className="w-12 h-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
              />
            </svg>
          </div>
        )}

        {/* Floating Category & Year Chips */}
        <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between pointer-events-none">
          {categoryName && (
            <span className="bg-white/90 backdrop-blur-md text-neutral-900 px-2.5 py-1 rounded-full text-xs font-semibold tracking-tight shadow-sm border border-black/[0.04]">
              {categoryName}
            </span>
          )}
          <span className="ms-auto bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-xs font-medium tracking-tight">
            {vehicle.year}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 sm:p-6 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="font-semibold text-lg text-neutral-900 tracking-tight mb-3 group-hover:text-brand-500 transition-colors duration-200">
            {vehicle.make} {vehicle.model}
          </h3>

          {/* Quick Specs Pills */}
          <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-medium text-neutral-600">
            <span className="inline-flex items-center gap-1 bg-neutral-100/80 px-2.5 py-1 rounded-full border border-black/[0.03]">
              <svg className="w-3.5 h-3.5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              {vehicle.transmission === 'automatic'
                ? locale === 'ar' ? 'أوتوماتيك' : 'Auto'
                : locale === 'ar' ? 'يدوي' : 'Manual'}
            </span>

            <span className="inline-flex items-center gap-1 bg-neutral-100/80 px-2.5 py-1 rounded-full border border-black/[0.03]">
              <svg className="w-3.5 h-3.5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {vehicle.seats} {locale === 'ar' ? 'مقاعد' : 'Seats'}
            </span>

            <span className="inline-flex items-center gap-1 bg-neutral-100/80 px-2.5 py-1 rounded-full border border-black/[0.03] capitalize">
              <svg className="w-3.5 h-3.5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {vehicle.fuel_type}
            </span>
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="flex items-center justify-between pt-4 border-t border-black/[0.05] mt-2">
          <div>
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              {dictionary?.vehicles?.daily_rate || 'Per Day'}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-neutral-900 tracking-tight">
                {formatDZD(vehicle.daily_rate, locale)}
              </span>
            </div>
          </div>

          <Link
            href={`/${locale}/vehicles/${vehicle.id}`}
            className="apple-press inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-semibold tracking-tight bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 shadow-sm transition-all min-h-[40px]"
          >
            {dictionary?.vehicles?.vehicle_details || 'Reserve'}
          </Link>
        </div>
      </div>
    </div>
  )
}
