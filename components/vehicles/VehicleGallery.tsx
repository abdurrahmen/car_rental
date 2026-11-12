'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import type { VehiclePhoto } from '@/types'
import { getPhotoUrl } from '@/lib/utils/constants'

export interface VehicleGalleryProps {
  photos: VehiclePhoto[]
  vehicleName: string
}

/**
 * Apple-style Vehicle Photo Gallery with rounded-3xl viewport,
 * translucent floating controls, and sleek thumbnail strip.
 */
export function VehicleGallery({ photos, vehicleName }: VehicleGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!photos || photos.length === 0) {
    return (
      <div className="w-full aspect-[16/10] bg-neutral-100 rounded-3xl flex items-center justify-center text-neutral-400 border border-black/[0.06]">
        No photos available
      </div>
    )
  }

  const currentUrl = getPhotoUrl(photos[currentIndex])

  return (
    <div className="flex flex-col gap-3">
      {/* Main Image Viewport */}
      <div className="w-full aspect-[16/10] bg-neutral-900 rounded-3xl overflow-hidden relative shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-black/[0.06]">
        {currentUrl ? (
          <Image
            src={currentUrl}
            alt={`${vehicleName} - View ${currentIndex + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            className="object-cover transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            priority={currentIndex === 0}
            quality={90}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400">
            No image preview
          </div>
        )}

        {/* Carousel arrows */}
        {photos.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between p-4 pointer-events-none">
            <button
              type="button"
              onClick={() =>
                setCurrentIndex((prev) =>
                  prev > 0 ? prev - 1 : photos.length - 1
                )
              }
              className="pointer-events-auto bg-black/40 hover:bg-black/60 text-white rounded-full p-2.5 backdrop-blur-md transition-all min-h-[44px] min-w-[44px] flex items-center justify-center apple-press cursor-pointer border border-white/20 shadow-sm"
              aria-label="Previous image"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() =>
                setCurrentIndex((prev) =>
                  prev < photos.length - 1 ? prev + 1 : 0
                )
              }
              className="pointer-events-auto bg-black/40 hover:bg-black/60 text-white rounded-full p-2.5 backdrop-blur-md transition-all min-h-[44px] min-w-[44px] flex items-center justify-center apple-press cursor-pointer border border-white/20 shadow-sm"
              aria-label="Next image"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Photo counter chip */}
        <div className="absolute bottom-3 end-3 bg-black/50 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-full font-medium tracking-tight">
          {currentIndex + 1} / {photos.length}
        </div>
      </div>

      {/* Thumbnails */}
      {photos.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-0.5">
          {photos.map((photo, index) => {
            const thumbUrl = getPhotoUrl(photo)
            const isSelected = index === currentIndex
            return (
              <button
                key={photo.id || index}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={`
                  relative w-20 h-14 rounded-xl overflow-hidden shrink-0 transition-all duration-200 cursor-pointer
                  ${
                    isSelected
                      ? 'ring-2 ring-brand-500 scale-105 shadow-sm'
                      : 'opacity-60 hover:opacity-100 hover:scale-102'
                  }
                `}
              >
                {thumbUrl && (
                  <Image
                    src={thumbUrl}
                    alt={`Thumbnail ${index + 1}`}
                    width={80}
                    height={56}
                    className="w-full h-full object-cover"
                    quality={70}
                  />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
